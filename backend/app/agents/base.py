"""
AgentCore Base Agent Class
Provides foundational agent capabilities: structured execution, state management, tool execution, and error handling.
"""
import abc
import json
import logging
import re
from typing import Dict, Any, Optional, Type, TypeVar
from pydantic import BaseModel

logger = logging.getLogger("iqsec.agents")

T = TypeVar("T", bound=BaseModel)


class BaseAgent(abc.ABC):
    """
    Abstract Base Agent for AgentCore Multi-Agent Architecture.
    """

    def __init__(self, name: str, role: str):
        self.name = name
        self.role = role
        self.logger = logging.getLogger(f"iqsec.agent.{name.lower()}")

    @abc.abstractmethod
    async def run(self, state: Dict[str, Any]) -> Dict[str, Any]:
        """
        Executes the agent's core task on the shared workflow state.
        Returns the updated state dictionary.
        """
        pass

    def parse_structured_output(self, raw_response: str, schema_cls: Type[T]) -> Optional[T]:
        """
        Safely parses JSON responses from LLMs against a Pydantic schema.
        Handles markdown fences and common LLM formatting artifacts.
        """
        try:
            clean_str = re.sub(r"^```json\s*", "", raw_response.strip())
            clean_str = re.sub(r"^```\s*", "", clean_str)
            clean_str = re.sub(r"\s*```$", "", clean_str)
            data = json.loads(clean_str)
            return schema_cls.model_validate(data)
        except Exception as e:
            self.logger.warning(f"Failed to validate output against {schema_cls.__name__}: {e}")
            return None
