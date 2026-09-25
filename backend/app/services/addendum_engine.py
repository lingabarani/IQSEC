"""
Addendum Delta Engine Service (Junta de Aclaraciones)
Reconciles original RFP requirements with amendments, clarifications, and Q&A minutes.
Generates the Unified Effective Requirement Matrix with full legal traceability.
"""
import re
import uuid
import logging
from typing import List, Dict, Tuple, Optional
from backend.app.schemas.parser import ParsedDocumentResult, ExtractedRequirementSchema
from backend.app.schemas.addendum import (
    AddendumClarificationItem,
    AddendumDeltaResult,
    DeltaActionType,
)
from backend.app.services.hybrid_parser import parser_service

logger = logging.getLogger("iqsec.addendum_engine")
logger.setLevel(logging.INFO)


class AddendumDeltaEngine:
    """
    Intelligent Reconciliation Engine for Latin America / Mexican Public Tenders
    Parses 'Actas de Junta de Aclaraciones' and applies deltas to RFP clauses.
    """

    # Patterns to extract Q&A blocks from Mexican tenders
    QA_SPLIT_PATTERN = re.compile(
        r"(?:(?:PREGUNTA|Pregunta|ACLARACIÓN|Aclaración)\s*(?:No\.?|NÚMERO|NUM\.?|#)?\s*(\d+[\w.-]*))[:.\s-]",
        re.IGNORECASE
    )

    RESPONSE_PATTERN = re.compile(
        r"(?:RESPUESTA|Respuesta|CONTESTACIÓN|Contestación)[:.\s-]\s*(.*)",
        re.IGNORECASE | re.DOTALL
    )

    # Patterns for extracting referenced RFP numerals/sections in question or answer
    CLAUSE_REF_PATTERNS = [
        re.compile(r"(?:numeral|numerales|punto|puntos|cl[áa]usula|secci[óo]n|partida)\s*(\d+(?:\.\d+)*(?:\.[a-zA-Z])?)", re.IGNORECASE),
        re.compile(r"(?:anexo\s+t[ée]cnico\s+(?:numeral|punto)?\s*)(\d+(?:\.\d+)*)", re.IGNORECASE),
        re.compile(r"(?:REQ-[A-Z0-9_-]+)", re.IGNORECASE),
    ]

    # Action intent keywords in official answers
    MODIFICATION_KEYWORDS = [
        "se modifica", "se acepta", "se autoriza", "se cambia", "se ajusta",
        "se sustituye", "queda de la siguiente manera", "el nuevo texto",
        "se amplía", "se concede", "se precisa que"
    ]

    DELETION_KEYWORDS = [
        "se elimina", "se cancela", "se deroga", "no es necesario", "se suprime",
        "se deja sin efecto", "queda sin efecto", "no aplica"
    ]

    ADDITION_KEYWORDS = [
        "se adiciona", "se agrega", "deberá adicionarse", "se incluye un nuevo"
    ]

    def process_addendum_document(
        self,
        addendum_pdf_path: str,
        parent_rfp_id: str,
        addendum_doc_id: Optional[str] = None
    ) -> Tuple[List[AddendumClarificationItem], AddendumDeltaResult]:
        """
        Parses an addendum PDF, extracts Q&A items, classifies intent,
        and identifies referenced RFP clauses.
        """
        doc_id = addendum_doc_id or f"add_{uuid.uuid4().hex[:12]}"
        parsed_doc: ParsedDocumentResult = parser_service.parse_pdf_file(addendum_pdf_path, doc_id=doc_id)

        clarifications: List[AddendumClarificationItem] = []
        full_text = "\n".join(p.full_text for p in parsed_doc.pages)

        # Split text into Q&A blocks
        blocks = self._extract_qa_blocks(parsed_doc)
        logger.info(f"Extracted {len(blocks)} clarification items from {parsed_doc.filename}")

        for item in blocks:
            clarifications.append(item)

        delta_result = AddendumDeltaResult(
            addendum_doc_id=doc_id,
            addendum_filename=parsed_doc.filename,
            parent_rfp_id=parent_rfp_id,
            total_clarifications_found=len(clarifications),
            total_modifications_applied=0,
            modified_requirement_codes=[],
            clarification_items=clarifications
        )

        return clarifications, delta_result

    def apply_deltas_to_requirements(
        self,
        original_requirements: List[ExtractedRequirementSchema],
        clarifications: List[AddendumClarificationItem],
        addendum_filename: str
    ) -> Tuple[List[ExtractedRequirementSchema], AddendumDeltaResult]:
        """
        Reconciles clarifications with the original requirements,
        updating effective_text and recording full audit trails.
        """
        modified_codes = []
        updated_requirements = []

        # Build lookup maps for fast clause matching
        req_by_numeral: Dict[str, ExtractedRequirementSchema] = {}
        req_by_code: Dict[str, ExtractedRequirementSchema] = {}

        for req in original_requirements:
            req_by_code[req.requirement_code] = req
            if req.section_code:
                req_by_numeral[req.section_code.lower()] = req
            # Also index by NUMERAL- prefix
            clean_numeral = req.requirement_code.replace("NUMERAL-", "").replace("REQ-", "").lower()
            req_by_numeral[clean_numeral] = req

        # Track applied overrides per requirement
        applied_overrides: Dict[str, Dict] = {}

        for item in clarifications:
            if item.action_type in [DeltaActionType.MODIFICATION, DeltaActionType.DELETION, DeltaActionType.ADDITION]:
                # Find matching requirement(s)
                matched_req = None
                for clause in item.referenced_clauses:
                    clause_clean = clause.lower().strip()
                    if clause_clean in req_by_numeral:
                        matched_req = req_by_numeral[clause_clean]
                        break
                    elif clause in req_by_code:
                        matched_req = req_by_code[clause]
                        break

                if matched_req:
                    req_id = matched_req.requirement_code
                    if req_id not in applied_overrides:
                        applied_overrides[req_id] = {
                            "item": item,
                            "action": item.action_type,
                            "override": item.proposed_override or item.response_text,
                            "notes": f"Modificado en {addendum_filename} ({item.question_number or 'Pregunta'} Pág. {item.page_number}): {item.response_text[:180]}..."
                        }
                        if req_id not in modified_codes:
                            modified_codes.append(req_id)

        # Construct updated requirement list
        for req in original_requirements:
            req_copy = req.model_copy()
            req_id = req_copy.requirement_code

            if req_id in applied_overrides:
                override_data = applied_overrides[req_id]
                action = override_data["action"]
                item = override_data["item"]

                if action == DeltaActionType.DELETION:
                    req_copy.effective_text = f"[CANCELADO / ELIMINADO POR JUNTA DE ACLARACIONES]: {req_copy.original_text}"
                    req_copy.is_mandatory = False
                else:
                    req_copy.effective_text = override_data["override"]

                # Extra audit fields will be saved in DB
                logger.info(f"Applied addendum override to {req_id} (Action: {action.value})")

            updated_requirements.append(req_copy)

        delta_summary = AddendumDeltaResult(
            addendum_doc_id=f"delta_{uuid.uuid4().hex[:8]}",
            addendum_filename=addendum_filename,
            parent_rfp_id="parent_rfp",
            total_clarifications_found=len(clarifications),
            total_modifications_applied=len(modified_codes),
            modified_requirement_codes=modified_codes,
            clarification_items=clarifications
        )

        return updated_requirements, delta_summary

    def _extract_qa_blocks(self, parsed_doc: ParsedDocumentResult) -> List[AddendumClarificationItem]:
        """Extracts individual questions, answers, and referenced numerals from pages"""
        items: List[AddendumClarificationItem] = []

        for page in parsed_doc.pages:
            text = page.full_text
            # Find all question splits
            splits = list(self.QA_SPLIT_PATTERN.finditer(text))
            if not splits:
                continue

            for i, match in enumerate(splits):
                q_num = f"Pregunta {match.group(1)}"
                start_pos = match.start()
                end_pos = splits[i + 1].start() if (i + 1) < len(splits) else len(text)
                qa_text = text[start_pos:end_pos].strip()

                # Separate Question from Response
                resp_match = self.RESPONSE_PATTERN.search(qa_text)
                if resp_match:
                    q_text = qa_text[:resp_match.start()].strip()
                    r_text = resp_match.group(1).strip()
                else:
                    q_text = qa_text
                    r_text = "Se toma nota y se atiende conforme a bases."

                # Extract referenced numerals
                referenced_clauses = self._extract_clause_references(q_text + " " + r_text)
                action_type, override = self._classify_action_intent(r_text)

                items.append(
                    AddendumClarificationItem(
                        item_id=f"p{page.page_number}_q{len(items)+1}",
                        page_number=page.page_number,
                        question_number=q_num,
                        question_text=q_text,
                        response_text=r_text,
                        referenced_clauses=referenced_clauses,
                        action_type=action_type,
                        proposed_override=override
                    )
                )
        return items

    def _extract_clause_references(self, text: str) -> List[str]:
        """Finds specific clause numerals like '3.2.1', 'Partida 4', 'REQ-012' in text"""
        refs = set()
        for pat in self.CLAUSE_REF_PATTERNS:
            for match in pat.finditer(text):
                ref = match.group(1) if match.groups() else match.group(0)
                if ref:
                    refs.add(ref.strip())
        return list(refs)

    def _classify_action_intent(self, response_text: str) -> Tuple[DeltaActionType, Optional[str]]:
        """Determines if the response modifies, cancels, or simply confirms a requirement"""
        lower = response_text.lower()

        if any(term in lower for term in self.DELETION_KEYWORDS):
            return DeltaActionType.DELETION, None

        if any(term in lower for term in self.MODIFICATION_KEYWORDS):
            # Extract the actual new specification if present
            return DeltaActionType.MODIFICATION, response_text

        if any(term in lower for term in self.ADDITION_KEYWORDS):
            return DeltaActionType.ADDITION, response_text

        return DeltaActionType.CLARIFICATION_ONLY, None


addendum_engine = AddendumDeltaEngine()

