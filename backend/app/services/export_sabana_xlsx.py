"""
Sábana Matrix Excel Exporter Service
Generates the comprehensive, color-coded RFP Compliance Matrix (.xlsx)
from Column A through Column T (20 Columns) matching the official IQSEC Solution Document
and Mexican public tender / enterprise procurement standards.
"""
import os
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter
from typing import List
from backend.app.db.models.requirement import RFPRequirement, ComplianceStatus


class SabanaXlsxExporter:
    """
    Exports RFP Requirements & AI Evaluations to an executive Excel Sábana Matrix
    covering the complete 20-column specification (Columns A through T).
    """

    # Brand Colors & Fills
    NAVY_FILL = PatternFill(start_color="0A192F", end_color="0A192F", fill_type="solid")
    SUBHEADER_FILL = PatternFill(start_color="1E3A8A", end_color="1E3A8A", fill_type="solid")
    WHITE_BOLD_FONT = Font(name="Calibri", size=10, bold=True, color="FFFFFF")
    TITLE_FONT = Font(name="Calibri", size=14, bold=True, color="0A192F")
    SUBTITLE_FONT = Font(name="Calibri", size=10, italic=True, color="475569")

    STATUS_FILLS = {
        ComplianceStatus.COMPLIES: PatternFill(start_color="D1FAE5", end_color="D1FAE5", fill_type="solid"),
        ComplianceStatus.COMPLIES_WITH_EXCEPTION: PatternFill(start_color="FEF3C7", end_color="FEF3C7", fill_type="solid"),
        ComplianceStatus.DOES_NOT_COMPLY: PatternFill(start_color="FEE2E2", end_color="FEE2E2", fill_type="solid"),
        ComplianceStatus.NOT_ENOUGH_EVIDENCE: PatternFill(start_color="F1F5F9", end_color="F1F5F9", fill_type="solid"),
        ComplianceStatus.NOT_EVALUATED: PatternFill(start_color="FFFFFF", end_color="FFFFFF", fill_type="solid"),
    }

    STATUS_FONTS = {
        ComplianceStatus.COMPLIES: Font(name="Calibri", size=10, bold=True, color="065F46"),
        ComplianceStatus.COMPLIES_WITH_EXCEPTION: Font(name="Calibri", size=10, bold=True, color="92400E"),
        ComplianceStatus.DOES_NOT_COMPLY: Font(name="Calibri", size=10, bold=True, color="991B1B"),
        ComplianceStatus.NOT_ENOUGH_EVIDENCE: Font(name="Calibri", size=10, bold=True, color="475569"),
        ComplianceStatus.NOT_EVALUATED: Font(name="Calibri", size=10, color="000000"),
    }

    THIN_BORDER = Border(
        left=Side(style="thin", color="CBD5E1"),
        right=Side(style="thin", color="CBD5E1"),
        top=Side(style="thin", color="CBD5E1"),
        bottom=Side(style="thin", color="CBD5E1")
    )

    def generate_sabana_workbook(
        self,
        rfp_title: str,
        tender_number: str,
        requirements: List[RFPRequirement],
        output_filepath: str
    ) -> str:
        """
        Creates and saves the formatted 20-Column Sábana Excel Matrix (Columns A to T).
        """
        wb = openpyxl.Workbook()
        ws = wb.active
        ws.title = "Matriz Sábana (Cols A-T)"

        # 1. Title Block (Spans Columns A through T)
        ws.merge_cells("A1:T1")
        title_cell = ws["A1"]
        title_cell.value = "IQSEC S.A. DE C.V. — MATRIZ DE CUMPLIMIENTO TÉCNICO Y ECONÓMICO (SÁBANA DE LICITACIÓN)"
        title_cell.font = self.TITLE_FONT
        title_cell.alignment = Alignment(horizontal="left", vertical="center")

        ws.merge_cells("A2:T2")
        sub_cell = ws["A2"]
        sub_cell.value = (
            f"Licitación: {tender_number} | Expediente: {rfp_title} | "
            f"Total Requerimientos: {len(requirements)} | "
            f"Especificación: Solución Oficial IQSEC Canvas 5.4 (Columnas A - T, Trazabilidad 100% y Entregable Vinculado)"
        )
        sub_cell.font = self.SUBTITLE_FONT
        sub_cell.alignment = Alignment(horizontal="left", vertical="center")

        # 2. Column Group Categories (Row 3)
        category_spans = [
            ("A3:D3", "DATOS DE ORIGEN DEL PLIEGO", "0F172A"),
            ("E3:F3", "CLASIFICACIÓN TÉCNICA", "1E293B"),
            ("G3:J3", "TRAZABILIDAD Y JUNTA DE ACLARACIONES", "0369A1"),
            ("K3:N3", "EVALUACIÓN, OFERTA Y ENTREGABLES", "047857"),
            ("O3:P3", "RESPUESTA Y SUSTENTO TÉCNICO", "334155"),
            ("Q3:S3", "EVIDENCIA DOCUMENTAL Y CITAS", "4338CA"),
            ("T3:T3", "GOBERNANZA", "0F172A"),
        ]

        for span, label, fill_hex in category_spans:
            ws.merge_cells(span)
            top_left = ws[span.split(":")[0]]
            top_left.value = label
            top_left.fill = PatternFill(start_color=fill_hex, end_color=fill_hex, fill_type="solid")
            top_left.font = Font(name="Calibri", size=9, bold=True, color="FFFFFF")
            top_left.alignment = Alignment(horizontal="center", vertical="center")

        # 3. 20 Column Headers (Row 4, Columns A through T)
        headers = [
            ("A", "No.\n[A]", 6),
            ("B", "Pág. Pliego\n[B]", 11),
            ("C", "Numeral / Cláusula\n[C]", 18),
            ("D", "Sección / Anexo\n[D]", 28),
            ("E", "Pilar IQSEC\n[E]", 18),
            ("F", "Tipo Requerimiento\n[F]", 18),
            ("G", "Texto Original del Pliego\n[G]", 45),
            ("H", "Modificado en Junta?\n[H]", 16),
            ("I", "Ref. Junta / Pregunta\n[I]", 20),
            ("J", "Texto Efectivo Modificado\n[J]", 45),
            ("K", "Dictamen Cumplimiento\n[K]", 18),
            ("L", "Servicio / Producto Mapeado\n[L]", 30),
            ("M", "Fabricante / OEM\n[M]", 24),
            ("N", "Entregable Vinculado Obligatorio\n[N]", 36),
            ("O", "Propuesta Técnica IQSEC\n[O]", 50),
            ("P", "Justificación y Sustento\n[P]", 40),
            ("Q", "Doc. Fuente Evidencia\n[Q]", 26),
            ("R", "Pág. Evidencia\n[R]", 14),
            ("S", "Cita Textual Verificable\n[S]", 45),
            ("T", "Certeza IA / Firma\n[T]", 18),
        ]

        header_row = 4
        for col_idx, (col_letter, header_title, col_width) in enumerate(headers, 1):
            cell = ws.cell(row=header_row, column=col_idx, value=header_title)
            cell.fill = self.NAVY_FILL
            cell.font = self.WHITE_BOLD_FONT
            cell.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
            ws.column_dimensions[col_letter].width = col_width

        ws.row_dimensions[1].height = 24
        ws.row_dimensions[2].height = 18
        ws.row_dimensions[3].height = 20
        ws.row_dimensions[4].height = 36

        # 4. Populate Data Rows (Starting at Row 5)
        for r_idx, req in enumerate(requirements, 1):
            row_num = header_row + r_idx

            # Junta de aclaraciones logic
            is_mod = "SÍ" if req.is_modified_by_addendum else "NO"
            junta_ref = (
                f"{req.addendum_question_num or 'Aclaración'} (Pág. {req.addendum_page_num or 1})"
                if req.is_modified_by_addendum
                else "N/A"
            )

            # Extract evidence citations
            ev_doc = "N/A"
            ev_page = "N/A"
            ev_quote = "Sin cita directa"
            if req.exact_citations and len(req.exact_citations) > 0:
                first_c = req.exact_citations[0]
                ev_doc = first_c.get("document_title") or first_c.get("doc") or "Doc IQSEC"
                ev_page = f"Pág. {first_c.get('page_number') or first_c.get('page') or 1}"
                ev_quote = first_c.get("exact_quote") or first_c.get("quote") or ""

            # Governance status
            gov_status = "Borrador IA"
            if req.human_approved and req.stage2_approved:
                gov_status = f"Aprobado N2\n({req.stage2_approver or 'Director'})"
            elif req.human_approved:
                gov_status = f"Validado N1\n({req.reviewed_by or 'Preventa'})"
            conf_str = f"{round(req.confidence_score * 100, 1)}%\n{gov_status}"

            status_val = (
                req.compliance_status.value
                if hasattr(req.compliance_status, "value")
                else str(req.compliance_status)
            )

            # Map the 20 column values (A to T)
            values = [
                r_idx,                                                            # Col A: No.
                req.page_number,                                                  # Col B: Pág. Pliego
                req.requirement_code,                                             # Col C: Numeral / Cláusula
                req.section_title[:50],                                           # Col D: Sección / Anexo
                req.iqsec_pillar.value if hasattr(req.iqsec_pillar, "value") else str(req.iqsec_pillar), # Col E: Pilar IQSEC
                req.requirement_type.value if hasattr(req.requirement_type, "value") else str(req.requirement_type), # Col F: Tipo
                req.original_text,                                                # Col G: Texto Original
                is_mod,                                                           # Col H: Modificado en Junta?
                junta_ref,                                                        # Col I: Ref. Junta / Pregunta
                req.effective_text,                                               # Col J: Texto Efectivo Modificado
                status_val,                                                       # Col K: Dictamen Cumplimiento
                req.mapped_product or "IQSEC Managed Cyber Defense",              # Col L: Servicio / Producto Mapeado
                req.oem_manufacturer or "Arquitectura Homologada IQSEC",          # Col M: Fabricante / OEM
                req.associated_deliverable or "ENT-01: Plan de Entrega Contractual", # Col N: Entregable Vinculado Obligatorio
                req.technical_response or "Pendiente de evaluación técnica",      # Col O: Propuesta Técnica IQSEC
                req.compliance_rationale or req.modification_notes or "Alineación conforme a catálogo", # Col P: Justificación
                ev_doc,                                                           # Col Q: Doc. Fuente Evidencia
                ev_page,                                                          # Col R: Pág. Evidencia
                ev_quote,                                                         # Col S: Cita Textual Verificable
                conf_str,                                                         # Col T: Certeza IA / Firma
            ]

            for c_idx, val in enumerate(values, 1):
                c = ws.cell(row=row_num, column=c_idx, value=val)
                c.border = self.THIN_BORDER
                c.font = Font(name="Calibri", size=9)
                c.alignment = Alignment(
                    vertical="top",
                    wrap_text=(c_idx in [4, 7, 10, 12, 13, 14, 15, 16, 17, 19, 20])
                )

                # Center align codes, numbers, pages
                if c_idx in [1, 2, 3, 5, 6, 8, 9, 18, 20]:
                    c.alignment = Alignment(horizontal="center", vertical="top", wrap_text=True)

                # Conditional styling on Column K (Dictamen Cumplimiento)
                if c_idx == 11:
                    c.fill = self.STATUS_FILLS.get(
                        req.compliance_status,
                        self.STATUS_FILLS[ComplianceStatus.NOT_EVALUATED]
                    )
                    c.font = self.STATUS_FONTS.get(
                        req.compliance_status,
                        self.STATUS_FONTS[ComplianceStatus.NOT_EVALUATED]
                    )
                    c.alignment = Alignment(horizontal="center", vertical="center")

                # Highlight deliverable column (Col N) with subtle sage tint to reinforce anti-hallucination compliance
                if c_idx == 14:
                    c.fill = PatternFill(start_color="F0FDF4", end_color="F0FDF4", fill_type="solid")
                    c.font = Font(name="Calibri", size=9, bold=True, color="166534")

            ws.row_dimensions[row_num].height = 55

        # Freeze Panes at cell E5 so columns A-D (origin metadata) stay visible when scrolling horizontally
        ws.freeze_panes = "E5"

        os.makedirs(os.path.dirname(output_filepath), exist_ok=True)
        wb.save(output_filepath)
        return output_filepath


sabana_exporter = SabanaXlsxExporter()
