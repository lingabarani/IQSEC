"""
AgentCore Package
Autonomous Multi-Agent Architecture for Tender Proposals
"""
from backend.app.agents.base import BaseAgent
from backend.app.agents.triage_agent import triage_agent, TriageAgent
from backend.app.agents.delta_agent import delta_agent, DeltaAgent
from backend.app.agents.evidence_hunter_agent import evidence_hunter_agent, EvidenceHunterAgent
from backend.app.agents.compliance_auditor_agent import compliance_auditor_agent, ComplianceAuditorAgent
from backend.app.agents.proposal_writer_agent import proposal_writer_agent, ProposalWriterAgent
from backend.app.agents.orchestrator import agent_orchestrator, AgentCoreOrchestrator

__all__ = [
    "BaseAgent",
    "TriageAgent",
    "triage_agent",
    "DeltaAgent",
    "delta_agent",
    "EvidenceHunterAgent",
    "evidence_hunter_agent",
    "ComplianceAuditorAgent",
    "compliance_auditor_agent",
    "ProposalWriterAgent",
    "proposal_writer_agent",
    "AgentCoreOrchestrator",
    "agent_orchestrator",
]
