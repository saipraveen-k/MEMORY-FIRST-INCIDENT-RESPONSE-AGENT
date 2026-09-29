import httpx
import logging
from typing import Any, Dict, List, Optional
from datetime import datetime, timezone
from app.core.config import settings

logger = logging.getLogger(__name__)


class HindsightService:
    """Service adapter for Hindsight long-term agent memory engine.
    
    Responsible for:
    - retaining historical incident facts & engineer lessons
    - recalling relevant past experience memories
    - reflecting on accumulated knowledge
    """

    def __init__(self):
        self.base_url = settings.HINDSIGHT_BASE_URL.rstrip('/')
        self.default_bank_id = settings.HINDSIGHT_BANK_ID
        self.api_key = settings.HINDSIGHT_API_KEY
        # In-memory fallback bank for offline/stub testing
        self._local_memory_bank: List[Dict[str, Any]] = []

    async def check_health(self) -> Dict[str, Any]:
        """Check status of Hindsight API service."""
        try:
            async with httpx.AsyncClient(timeout=3.0) as client:
                res = await client.get(f"{self.base_url}/health")
                if res.status_code == 200:
                    return {"status": "healthy", "url": self.base_url, "mode": "live"}
                return {"status": "degraded", "status_code": res.status_code, "url": self.base_url}
        except Exception as e:
            return {"status": "fallback_local", "url": self.base_url, "note": "Operating in robust local memory bank mode", "error": str(e)}

    async def retain(
        self,
        content: str,
        bank_id: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None,
        memory_type: str = "experience"
    ) -> Dict[str, Any]:
        """Retain facts, lessons, or preferences into Hindsight memory."""
        target_bank = bank_id or self.default_bank_id
        payload = {
            "content": content,
            "metadata": metadata or {},
            "type": memory_type,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }

        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                res = await client.post(
                    f"{self.base_url}/v1/banks/{target_bank}/memories",
                    json=payload,
                    headers={"Authorization": f"Bearer {self.api_key}"}
                )
                if res.status_code in (200, 201):
                    data = res.json()
                    logger.info(f"Hindsight retained memory into bank '{target_bank}': {data.get('id')}")
                    return data
        except Exception as e:
            logger.warning(f"Hindsight server unreachable at {self.base_url}. Storing in fallback local bank. Error: {e}")

        # Local fallback retention logic
        memory_entry = {
            "id": f"mem-{len(self._local_memory_bank) + 1:04d}",
            "bank_id": target_bank,
            "content": content,
            "metadata": metadata or {},
            "type": memory_type,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "extracted_facts": [content]
        }
        self._local_memory_bank.append(memory_entry)
        return {"id": memory_entry["id"], "status": "stored_locally", "memory": memory_entry}

    async def recall(
        self,
        query: str,
        bank_id: Optional[str] = None,
        top_k: int = 5,
        service_filter: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Recall relevant historical memories from Hindsight given a query."""
        target_bank = bank_id or self.default_bank_id
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                res = await client.post(
                    f"{self.base_url}/v1/banks/{target_bank}/recall",
                    json={"query": query, "top_k": top_k},
                    headers={"Authorization": f"Bearer {self.api_key}"}
                )
                if res.status_code == 200:
                    results = res.json().get("results", [])
                    if results:
                        return results
        except Exception as e:
            logger.warning(f"Hindsight server recall request fallback. Error: {e}")

        # Fallback local retrieval: keyword & semantic matching against retained entries
        query_words = set(query.lower().split())
        matched = []
        for mem in self._local_memory_bank:
            content_lower = mem["content"].lower()
            overlap = sum(1 for word in query_words if word in content_lower)
            if overlap > 0 or not query_words:
                score = round(min(0.95, 0.5 + 0.1 * overlap), 2)
                matched.append({
                    "id": mem["id"],
                    "content": mem["content"],
                    "text": mem["content"],
                    "relevance_score": score,
                    "metadata": mem["metadata"],
                    "type": mem["type"],
                    "created_at": mem["created_at"]
                })
        
        matched.sort(key=lambda x: x["relevance_score"], reverse=True)
        return matched[:top_k]

    async def reflect(
        self,
        query: str,
        bank_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """Reflect on stored facts to synthesize disposition-aware knowledge."""
        memories = await self.recall(query, bank_id=bank_id, top_k=10)
        synthesis = "\n".join([f"- {m['content']}" for m in memories]) if memories else "No prior experience recorded."
        return {
            "query": query,
            "synthesized_reflection": synthesis,
            "supporting_memories": memories
        }

    async def list_memories(self, bank_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """List all stored memories for Memory Explorer UI."""
        target_bank = bank_id or self.default_bank_id
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                res = await client.get(
                    f"{self.base_url}/v1/banks/{target_bank}/memories",
                    headers={"Authorization": f"Bearer {self.api_key}"}
                )
                if res.status_code == 200:
                    return res.json().get("memories", [])
        except Exception as e:
            logger.warning(f"Hindsight server list memories fallback. Error: {e}")

        return [
            {
                "id": m["id"],
                "bank_id": m["bank_id"],
                "content": m["content"],
                "type": m["type"],
                "metadata": m["metadata"],
                "created_at": m["created_at"]
            }
            for m in self._local_memory_bank
        ]

    def reset_local_bank(self):
        """Clear local fallback bank for deterministic demo resets."""
        self._local_memory_bank.clear()


hindsight_service = HindsightService()
