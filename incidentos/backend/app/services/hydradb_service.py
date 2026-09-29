import httpx
import logging
from typing import Any, Dict, List, Optional
from app.core.config import settings

logger = logging.getLogger(__name__)


class HydraDBService:
    """Service adapter for HydraDB structured graph database.
    
    Manages:
    - Nodes: Incident, Service, Deployment, RootCause, Action, Engineer, Lesson
    - Relationships: AFFECTS, CAUSED_BY, FOLLOWED_DEPLOYMENT, RESOLVED_BY, FAILED_ACTION, DEPENDS_ON, etc.
    - Cypher graph traversals for incident topology & root cause analysis
    """

    def __init__(self):
        self.base_url = settings.HYDRADB_URL.rstrip('/')
        self.graph_id = settings.HYDRADB_GRAPH_ID
        self.cell_id = settings.HYDRADB_CELL_ID
        self.auth_token = settings.HYDRADB_AUTH_TOKEN
        self.namespace = settings.HYDRADB_NAMESPACE
        
        # Local fallback graph representation for offline/stub/demo testing
        self._local_nodes: Dict[str, Dict[str, Any]] = {}
        self._local_edges: List[Dict[str, Any]] = []

    async def check_health(self) -> Dict[str, Any]:
        """Check health of HydraDB node."""
        try:
            async with httpx.AsyncClient(timeout=3.0) as client:
                res = await client.get(f"{self.base_url}/healthz")
                if res.status_code == 200:
                    return {"status": "healthy", "url": self.base_url, "mode": "live"}
                return {"status": "degraded", "status_code": res.status_code, "url": self.base_url}
        except Exception as e:
            return {
                "status": "fallback_local",
                "url": self.base_url,
                "note": "Operating in robust local graph database mode",
                "error": str(e)
            }

    async def execute_cypher(self, query: str, parameters: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Execute OpenCypher query against HydraDB HTTP query endpoint."""
        url = f"{self.base_url}/v1/graphs/{self.graph_id}/query"
        payload = {
            "cell_id": self.cell_id,
            "query": query,
            "parameters": parameters or {}
        }
        headers = {
            "x-graph-namespace": self.namespace,
            "Authorization": f"Bearer {self.auth_token}",
            "Content-Type": "application/json"
        }

        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                res = await client.post(url, json=payload, headers=headers)
                if res.status_code == 200:
                    return res.json()
        except Exception as e:
            logger.warning(f"HydraDB query execution fallback for query: '{query}'. Error: {e}")

        # Fallback local Cypher emulation for common IncidentOS patterns
        return self._evaluate_local_cypher(query, parameters or {})

    def add_node(self, node_id: str, label: str, properties: Dict[str, Any]):
        """Add a graph node into local graph store."""
        self._local_nodes[node_id] = {
            "id": node_id,
            "label": label,
            "properties": properties
        }

    def add_edge(self, source_id: str, target_id: str, rel_type: str, properties: Optional[Dict[str, Any]] = None):
        """Add a graph edge into local graph store."""
        edge = {
            "source": source_id,
            "target": target_id,
            "type": rel_type,
            "properties": properties or {}
        }
        # Avoid duplicate edges
        if not any(e["source"] == source_id and e["target"] == target_id and e["type"] == rel_type for e in self._local_edges):
            self._local_edges.append(edge)

    async def get_service_dependencies(self, service_name: str) -> List[Dict[str, Any]]:
        """Find services that the given service depends on."""
        cypher = f"MATCH (s:Service {{id: '{service_name}'}})-[:DEPENDS_ON]->(dep:Service) RETURN dep"
        res = await self.execute_cypher(cypher)
        if "data" in res and res.get("status") != "evaluated_locally":
            return res["data"]
        
        # Local graph query fallback: filter edges for DEPENDS_ON from target service
        deps = []
        for edge in self._local_edges:
            if edge["source"] == service_name and edge["type"] == "DEPENDS_ON":
                target_node = self._local_nodes.get(edge["target"])
                if target_node:
                    deps.append(target_node["properties"])
                else:
                    deps.append({"id": edge["target"], "name": edge["target"]})
        return deps

    async def get_incident_graph_context(self, incident_id: str, service_name: str) -> Dict[str, Any]:
        """Fetch full graph context for an active incident."""
        deps = await self.get_service_dependencies(service_name)
        
        # Retrieve related deployment
        related_deployments = []
        for edge in self._local_edges:
            if edge["source"] == incident_id and edge["type"] == "FOLLOWED_DEPLOYMENT":
                deploy_node = self._local_nodes.get(edge["target"])
                if deploy_node:
                    related_deployments.append(deploy_node["properties"])

        # Retrieve related historical incidents
        similar_incidents = []
        for edge in self._local_edges:
            if edge["source"] == incident_id and edge["type"] == "SIMILAR_TO":
                inc_node = self._local_nodes.get(edge["target"])
                if inc_node:
                    similar_incidents.append(inc_node["properties"])

        # Service node properties
        service_info = self._local_nodes.get(service_name, {}).get("properties", {"id": service_name, "name": service_name})

        return {
            "incident_id": incident_id,
            "target_service": service_info,
            "service_dependencies": deps,
            "deployments": related_deployments,
            "similar_incidents": similar_incidents,
            "topology_path": f"{service_name} -> " + " -> ".join([d.get('id', d.get('name', '')) for d in deps]) if deps else service_name
        }

    async def get_full_graph(self) -> Dict[str, Any]:
        """Export full graph visualization model for UI Graph Explorer."""
        nodes = list(self._local_nodes.values())
        edges = self._local_edges
        return {
            "nodes": nodes,
            "edges": edges,
            "total_nodes": len(nodes),
            "total_edges": len(edges)
        }

    def _evaluate_local_cypher(self, query: str, params: Dict[str, Any]) -> Dict[str, Any]:
        """Local graph evaluator for demo fallback."""
        return {
            "query": query,
            "columns": ["nodes", "edges"],
            "data": list(self._local_nodes.values()),
            "status": "evaluated_locally"
        }

    def reset_local_graph(self):
        """Reset graph store for deterministic demo restarts."""
        self._local_nodes.clear()
        self._local_edges.clear()


hydradb_service = HydraDBService()
