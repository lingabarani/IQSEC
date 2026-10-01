"""
AgentCore: Addendum Delta & Reconciliation Agent
Reconciles requirement clauses against official 'Juntas de Aclaraciones' minutes and amendments.
"""
from typing import Dict, Any, List, Optional
from backend.app.agents.base import BaseAgent
from backend.app.schemas.addendum import AddendumClarificationItem, DeltaActionType


class DeltaAgent(BaseAgent):
    """
    Autonomous Agent that resolves clarification minutes and updates effective specifications.
    """

    def __init__(self):
        super().__init__(
            name="DeltaAgent",
            role="Reconciles original clauses with Junta de Aclaraciones Q&As and updates effective requirement text."
        )

    async def run(self, state: Dict[str, Any]) -> Dict[str, Any]:
        """
        Input state keys: 'requirement_code', 'section_code', 'original_text', 'clarifications' (optional list)
        Output state keys updated: 'effective_text', 'is_modified_by_addendum', 'addendum_citation', 'delta_applied'
        """
        req_code = state.get("requirement_code", "").lower()
        sec_code = state.get("section_code", "")
        sec_code_clean = sec_code.lower() if sec_code else ""
        original_text = state.get("original_text", "")
        clarifications: List[AddendumClarificationItem] = state.get("clarifications", [])

        effective_text = original_text
        is_modified = False
        addendum_ref = None
        question_num = None
        page_num = None
        mod_notes = None

        for item in clarifications:
            for clause in item.referenced_clauses:
                c_clean = clause.lower().strip()
                if (c_clean in req_code) or (sec_code_clean and c_clean in sec_code_clean):
                    is_modified = True
                    question_num = item.question_number or "Aclaración"
                    page_num = item.page_number
                    addendum_ref = f"Junta de Aclaraciones (Pág. {page_num}, {question_num})"
                    mod_notes = f"Modificado por {question_num}: {item.response_text}"

                    if item.action_type == DeltaActionType.DELETION:
                        effective_text = f"[REQUERIMIENTO CANCELADO EN JUNTA DE ACLARACIONES]: {original_text}"
                        state["is_mandatory"] = False
                    elif item.proposed_override:
                        effective_text = item.proposed_override
                    else:
                        effective_text = f"{original_text} (Modificado: {item.response_text})"

                    self.logger.info(f"Delta matched on {req_code} via clause {clause} -> {question_num}")
                    break
            if is_modified:
                break

        state["effective_text"] = effective_text
        state["is_modified_by_addendum"] = is_modified
        state["addendum_reference"] = addendum_ref
        state["addendum_question_num"] = question_num
        state["addendum_page_num"] = page_num
        state["modification_notes"] = mod_notes
        state["delta_applied"] = True

        return state


delta_agent = DeltaAgent()
