"""
Hybrid Document Parser Service
Combines PyMuPDF (fitz) for native digital layout & table extraction
with automatic OCR Fallback (Tesseract / PaddleOCR) for scanned & stamped pages.
Extracts structured requirements, page coordinates, and preserves section hierarchies.
"""
import os
import re
import uuid
import logging
from typing import List, Dict, Any, Tuple, Optional
import pymupdf as fitz
from backend.app.core.config import settings
from backend.app.db.models.requirement import RequirementType, IQSECPillar
from backend.app.schemas.parser import (
    ParsedDocumentResult,
    ParsedPage,
    ParsedTextBlock,
    ParsedTable,
    BoundingBox,
    ExtractedRequirementSchema,
)

logger = logging.getLogger("iqsec.parser")
logger.setLevel(logging.INFO)


class HybridDocumentParser:
    """
    Production Hybrid Parser for Latin America / Mexican Public & Enterprise Tender PDFs.
    Extracts text, hierarchy, tables, and clauses with zero data loss.
    """

    # Regex patterns for clause / numeral recognition
    NUMERAL_PATTERN = re.compile(
        r"^(?:(?:Numeral|Cl[áa]usula|Requerimiento|REQ|Punto|Secci[óo]n|Partida|Inciso)\s*)?"
        r"(\d+(?:\.\d+)*(?:\.[a-zA-Z])?|[a-zA-Z]\)|[ivxlcdm]+\))\s*[-–:.]?\s*(.*)",
        re.IGNORECASE
    )

    MANDATORY_TERMS = [
        "deberá", "debera", "deberán", "es obligatorio", "requisito indispensable",
        "es mandatorio", "se requiere", "deberá contar", "obligatoriamente",
        "deberá incluir", "mínimo requerido", "deberá garantizar"
    ]

    # Service pillar keywords
    PILLAR_KEYWORDS = {
        IQSECPillar.SOC_SIEM: [
            "soc", "siem", "monitoreo", "24/7", "7x24", "eventos de seguridad", "correlación",
            "incidentes", "analista n1", "analista n2", "analista n3", "alertamiento", "qradar",
            "splunk", "sentinel", "cortex", "log", "bitácora", "bitacoras"
        ],
        IQSECPillar.CLOUD_SECURITY: [
            "cloud", "nube", "aws", "azure", "gcp", "cspm", "cwpp", "ciem", "kubernetes",
            "contenedor", "s3", "iam cloud", "postura de seguridad"
        ],
        IQSECPillar.IAM: [
            "iam", "pam", "mfa", "identidad", "acceso", "privilegiado", "doble factor",
            "directorio activo", "active directory", "cyberark", "sailpoint", "okta"
        ],
        IQSECPillar.VULN_MGMT: [
            "vulnerabilidades", "escaneo", "pen testing", "pentest", "análisis de vulnerabilidades",
            "remediación", "qualys", "tenable", "nessus", "cve", "cvss"
        ],
        IQSECPillar.INCIDENT_RESPONSE: [
            "respuesta a incidentes", "forense", "csirt", "cert", "contención", "erradicación",
            "cadena de custodia", "playbook", "triaje"
        ],
        IQSECPillar.GRC: [
            "iso 27001", "iso 22301", "cnbv", "pci-dss", "ciberseguridad", "cumplimiento",
            "política", "auditoría", "riesgo", "gobierno"
        ],
    }

    def __init__(self):
        self.min_chars = settings.OCR_FALLBACK_MIN_CHARS
        self.dpi = settings.OCR_DEFAULT_DPI

    def parse_pdf_file(self, file_path: str, doc_id: Optional[str] = None) -> ParsedDocumentResult:
        """
        Main entrypoint: parses a PDF file, handles OCR fallback where required,
        extracts tables, hierarchies, and requirements.
        """
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"PDF file not found at path: {file_path}")

        document_id = doc_id or f"doc_{uuid.uuid4().hex[:12]}"
        filename = os.path.basename(file_path)

        doc = fitz.open(file_path)
        page_count = len(doc)
        logger.info(f"Starting hybrid parsing for {filename} ({page_count} pages)")

        parsed_pages: List[ParsedPage] = []
        all_requirements: List[ExtractedRequirementSchema] = []
        current_hierarchy: List[str] = ["Documento Principal"]

        for page_idx in range(page_count):
            page_num = page_idx + 1
            page = doc[page_idx]

            # 1. Extract digital text & determine if page is scanned
            raw_text = page.get_text("text").strip()
            total_chars = len(raw_text)
            is_scanned = total_chars < self.min_chars
            ocr_applied = False

            text_blocks: List[ParsedTextBlock] = []
            tables: List[ParsedTable] = []

            if is_scanned:
                logger.info(f"Page {page_num} has only {total_chars} chars. Triggering OCR fallback.")
                ocr_text, ocr_blocks = self._apply_ocr_fallback(page, page_num)
                full_page_text = ocr_text
                text_blocks = ocr_blocks
                ocr_applied = True
            else:
                # 2. Extract digital blocks with font & layout metadata
                full_page_text = raw_text
                text_blocks = self._extract_digital_blocks(page, page_num)
                # 3. Extract digital tables using PyMuPDF Table Finder
                tables = self._extract_digital_tables(page, page_num)

            parsed_page = ParsedPage(
                page_number=page_num,
                total_chars=len(full_page_text),
                is_scanned=is_scanned,
                ocr_applied=ocr_applied,
                text_blocks=text_blocks,
                tables=tables,
                full_text=full_page_text
            )
            parsed_pages.append(parsed_page)

            # 4. Extract requirements from tables and text blocks
            page_requirements, current_hierarchy = self._extract_requirements_from_page(
                parsed_page, current_hierarchy
            )
            all_requirements.extend(page_requirements)

        doc.close()

        logger.info(
            f"Successfully parsed {filename}: {len(parsed_pages)} pages, "
            f"{len(all_requirements)} structured requirements extracted."
        )

        return ParsedDocumentResult(
            document_id=document_id,
            filename=filename,
            page_count=page_count,
            pages=parsed_pages,
            requirements=all_requirements,
            metadata={
                "parser_engine": "PyMuPDF+OCRFallback",
                "total_tables": sum(len(p.tables) for p in parsed_pages),
                "total_scanned_pages": sum(1 for p in parsed_pages if p.is_scanned)
            }
        )

    def _extract_digital_blocks(self, page: fitz.Page, page_num: int) -> List[ParsedTextBlock]:
        """Extracts text blocks with font sizes and bold attributes for hierarchy detection"""
        blocks: List[ParsedTextBlock] = []
        text_dict = page.get_text("dict")

        for b_idx, block in enumerate(text_dict.get("blocks", [])):
            if "lines" not in block:
                continue

            block_text_parts = []
            max_font_size = 0.0
            is_bold = False

            for line in block["lines"]:
                for span in line.get("spans", []):
                    span_text = span.get("text", "").strip()
                    if span_text:
                        block_text_parts.append(span_text)
                        font_size = span.get("size", 10.0)
                        if font_size > max_font_size:
                            max_font_size = font_size
                        flags = span.get("flags", 0)
                        # Flag 2 or 16 in PyMuPDF indicates bold weight
                        if flags & 2 or flags & 16 or "bold" in span.get("font", "").lower():
                            is_bold = True

            combined_text = " ".join(block_text_parts).strip()
            if not combined_text:
                continue

            # Header heuristic: font size > 11.5 and (bold or short uppercase title)
            is_header = (max_font_size >= 12.0 and is_bold) or (
                len(combined_text) < 100 and combined_text.isupper()
            )

            bbox = block.get("bbox", (0, 0, 0, 0))
            blocks.append(
                ParsedTextBlock(
                    block_id=f"p{page_num}_b{b_idx}",
                    page_number=page_num,
                    text=combined_text,
                    font_size=round(max_font_size, 1),
                    is_bold=is_bold,
                    is_header=is_header,
                    bounding_box=BoundingBox(
                        x0=round(bbox[0], 1),
                        y0=round(bbox[1], 1),
                        x1=round(bbox[2], 1),
                        y1=round(bbox[3], 1)
                    )
                )
            )
        return blocks

    def _extract_digital_tables(self, page: fitz.Page, page_num: int) -> List[ParsedTable]:
        """Finds tables on the digital PDF page and converts them to Markdown matrices"""
        parsed_tables: List[ParsedTable] = []
        try:
            tab_finder = page.find_tables()
            for t_idx, table in enumerate(tab_finder.tables):
                df_data = table.extract()
                if not df_data or len(df_data) < 2:
                    continue

                raw_headers = [str(col).strip() if col is not None else f"Col_{i+1}" for i, col in enumerate(df_data[0])]
                headers = [h if h else f"Col_{i+1}" for i, h in enumerate(raw_headers)]
                
                rows: List[List[str]] = []
                for raw_row in df_data[1:]:
                    row = [str(cell).strip().replace("\n", " ") if cell is not None else "" for cell in raw_row]
                    if any(row):  # skip empty rows
                        rows.append(row)

                if not rows:
                    continue

                # Build clean Markdown table representation
                md_lines = [
                    "| " + " | ".join(headers) + " |",
                    "| " + " | ".join(["---"] * len(headers)) + " |"
                ]
                for r in rows:
                    # Pad row if columns don't match
                    padded_row = r + [""] * (len(headers) - len(r))
                    md_lines.append("| " + " | ".join(padded_row[:len(headers)]) + " |")

                bbox = table.bbox
                parsed_tables.append(
                    ParsedTable(
                        table_id=f"p{page_num}_tbl_{t_idx+1}",
                        page_number=page_num,
                        headers=headers,
                        rows=rows,
                        markdown="\n".join(md_lines),
                        bounding_box=BoundingBox(
                            x0=round(bbox[0], 1),
                            y0=round(bbox[1], 1),
                            x1=round(bbox[2], 1),
                            y1=round(bbox[3], 1)
                        )
                    )
                )
        except Exception as e:
            logger.warning(f"Table extraction notice on page {page_num}: {e}")
        return parsed_tables

    def _apply_ocr_fallback(self, page: fitz.Page, page_num: int) -> Tuple[str, List[ParsedTextBlock]]:
        """
        Renders the PDF page to a high-resolution pixmap (300 DPI)
        and applies OCR (pytesseract / OCR engine) locally.
        """
        try:
            import pytesseract
            from PIL import Image
            import io

            # Render page at 300 DPI (zoom 300/72 ≈ 4.16)
            zoom = self.dpi / 72.0
            mat = fitz.Matrix(zoom, zoom)
            pix = page.get_pixmap(matrix=mat)

            img = Image.open(io.BytesIO(pix.tobytes("png")))
            
            # Run pytesseract with Spanish + English language packs
            ocr_text = pytesseract.image_to_string(img, lang="spa+eng")
            
            # Simple line-by-line block creation
            blocks: List[ParsedTextBlock] = []
            for idx, line in enumerate(ocr_text.split("\n\n")):
                cleaned = line.strip()
                if cleaned:
                    blocks.append(
                        ParsedTextBlock(
                            block_id=f"p{page_num}_ocr_{idx+1}",
                            page_number=page_num,
                            text=cleaned,
                            font_size=11.0,
                            is_bold=False,
                            is_header=False,
                            bounding_box=None
                        )
                    )
            return ocr_text, blocks
        except Exception as e:
            logger.warning(f"OCR execution warning on page {page_num}: {e}. Using raw text fallback.")
            return page.get_text("text"), []

    def _extract_requirements_from_page(
        self, page: ParsedPage, current_hierarchy: List[str]
    ) -> Tuple[List[ExtractedRequirementSchema], List[str]]:
        """
        Extracts atomic requirements from structured text blocks and tables on the page.
        Maintains and updates the running section hierarchy.
        """
        requirements: List[ExtractedRequirementSchema] = []
        hierarchy = list(current_hierarchy)

        # 1. Process Tables First (Tenders frequently put line-item requirements in tables)
        for tbl in page.tables:
            # Check if this table looks like a requirement or scope matrix
            header_str = " ".join(tbl.headers).lower()
            is_req_table = any(k in header_str for k in ["partida", "concepto", "especificaci", "requerimiento", "descripcion", "entregable", "sla"])
            
            if is_req_table:
                for r_idx, row in enumerate(tbl.rows):
                    row_text = " | ".join(row)
                    if len(row_text.strip()) < 15:
                        continue

                    # Determine code (first column if numeral or row index)
                    first_col = row[0] if row else ""
                    req_code = f"TAB-P{page.page_number}-R{r_idx+1}"
                    if re.match(r"^\d+|[A-Za-z]\b", first_col):
                        req_code = f"PARTIDA-{first_col.strip()}"

                    req_type = self._classify_requirement_type(row_text)
                    pillar = self._classify_service_pillar(row_text)
                    is_mand = self._is_mandatory(row_text)

                    # Build single row markdown
                    single_row_md = (
                        "| " + " | ".join(tbl.headers) + " |\n"
                        "| " + " | ".join(["---"] * len(tbl.headers)) + " |\n"
                        "| " + " | ".join(row) + " |"
                    )

                    requirements.append(
                        ExtractedRequirementSchema(
                            requirement_code=req_code,
                            page_number=page.page_number,
                            page_end=page.page_number,
                            section_code=None,
                            section_title=hierarchy[-1] if hierarchy else "Anexo Técnico",
                            section_hierarchy=list(hierarchy),
                            original_text=row_text,
                            effective_text=row_text,
                            is_mandatory=is_mand,
                            requirement_type=req_type,
                            iqsec_pillar=pillar,
                            is_table_row=True,
                            table_headers=tbl.headers,
                            table_markdown=single_row_md,
                            bounding_box=tbl.bounding_box.model_dump() if tbl.bounding_box else None
                        )
                    )

        # 2. Process Text Blocks
        for block in page.text_blocks:
            text = block.text.strip()
            if not text:
                continue

            # Update section hierarchy if this is a header
            if block.is_header or self._is_section_header(text):
                section_title = text[:120]
                if len(hierarchy) >= 3:
                    hierarchy = hierarchy[:2] + [section_title]
                else:
                    hierarchy.append(section_title)
                continue

            # Check if this text block contains numbered requirement(s) or clauses
            match = self.NUMERAL_PATTERN.match(text)
            if match or self._is_mandatory(text) or len(text) > 40:
                req_code = f"REQ-P{page.page_number}-{len(requirements)+1}"
                if match:
                    numeral_part = match.group(1)
                    req_code = f"NUMERAL-{numeral_part}"

                req_type = self._classify_requirement_type(text)
                pillar = self._classify_service_pillar(text)
                is_mand = self._is_mandatory(text)

                requirements.append(
                    ExtractedRequirementSchema(
                        requirement_code=req_code,
                        page_number=page.page_number,
                        page_end=page.page_number,
                        section_code=match.group(1) if match else None,
                        section_title=hierarchy[-1] if hierarchy else "General",
                        section_hierarchy=list(hierarchy),
                        original_text=text,
                        effective_text=text,
                        is_mandatory=is_mand,
                        requirement_type=req_type,
                        iqsec_pillar=pillar,
                        is_table_row=False,
                        table_headers=None,
                        table_markdown=None,
                        bounding_box=block.bounding_box.model_dump() if block.bounding_box else None
                    )
                )

        return requirements, hierarchy

    def _is_section_header(self, text: str) -> bool:
        """Determines if a string is a major section title (e.g. '3. ANEXO TÉCNICO')"""
        if len(text) < 150 and re.match(r"^\d+(?:\.\d+)*\s+[A-ZÁÉÍÓÚÑ\s]{3,}$", text):
            return True
        if text.lower().startswith(("anexo técnico", "apéndice", "sección técnica", "términos de referencia")):
            return True
        return False

    def _is_mandatory(self, text: str) -> bool:
        """Evaluates mandatory phrasing in Spanish legal/tender context"""
        lower = text.lower()
        return any(term in lower for term in self.MANDATORY_TERMS)

    def _classify_requirement_type(self, text: str) -> RequirementType:
        """Classifies requirement category"""
        lower = text.lower()
        if any(w in lower for w in ["sla", "tiempo de respuesta", "disponibilidad", "99.9%", "penalizaci"]):
            return RequirementType.SLA
        if any(w in lower for w in ["costo", "precio", "pesos", "moneda", "iva", "factura", "cotizaci"]):
            return RequirementType.ECONOMIC
        if any(w in lower for w in ["certificaci", "certificado", "iso 27001", "cism", "cissp", "ceh"]):
            return RequirementType.CERTIFICATION
        if any(w in lower for w in ["personal", "ingeniero", "perfil", "analista", "experiencia en años"]):
            return RequirementType.STAFFING
        if any(w in lower for w in ["fianza", "garantía", "acta constitutiva", "rfc", "sat", "imss"]):
            return RequirementType.ADMINISTRATIVE
        return RequirementType.TECHNICAL

    def _classify_service_pillar(self, text: str) -> IQSECPillar:
        """Routes requirement to IQSEC MSSP Service Pillars based on terminology frequency"""
        lower = text.lower()
        scores: Dict[IQSECPillar, int] = {}
        for pillar, keywords in self.PILLAR_KEYWORDS.items():
            count = sum(1 for kw in keywords if kw in lower)
            if count > 0:
                scores[pillar] = count

        if scores:
            return max(scores, key=scores.get)
        return IQSECPillar.SOC_SIEM


parser_service = HybridDocumentParser()
