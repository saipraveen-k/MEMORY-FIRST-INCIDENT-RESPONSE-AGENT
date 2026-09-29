import pytest
import asyncio
from app.services.hydradb_service import hydradb_service
from app.services.demo_service import demo_service


@pytest.mark.asyncio
async def test_hydradb_graph_relationships():
    """GRAPH TEST (Section 42):
    Verify Incident -> Service -> Dependency -> Deployment -> RootCause -> Action
    relationships are queryable from HydraDB structure.
    """
    await demo_service.reset_demo()
    hydradb_service.reset_local_graph()

    # Add graph nodes
    hydradb_service.add_node("inc-101", "Incident", {"id": "inc-101", "title": "Payment API Failure"})
    hydradb_service.add_node("payments-api", "Service", {"id": "payments-api", "name": "Payment API"})
    hydradb_service.add_node("payments-db", "Service", {"id": "payments-db", "name": "Payment DB"})
    hydradb_service.add_node("deploy-v3.2", "Deployment", {"id": "deploy-v3.2", "version": "v3.2"})
    hydradb_service.add_node("rc-01", "RootCause", {"id": "rc-01", "name": "Connection Pool Exhaustion"})
    hydradb_service.add_node("act-01", "Action", {"id": "act-01", "name": "Rollback Deployment"})

    # Add relationships
    hydradb_service.add_edge("inc-101", "payments-api", "AFFECTS")
    hydradb_service.add_edge("payments-api", "payments-db", "DEPENDS_ON")
    hydradb_service.add_edge("inc-101", "deploy-v3.2", "FOLLOWED_DEPLOYMENT")
    hydradb_service.add_edge("inc-101", "rc-01", "CAUSED_BY")
    hydradb_service.add_edge("inc-101", "act-01", "RESOLVED_BY")

    # Verify queryability
    ctx = await hydradb_service.get_incident_graph_context("inc-101", "payments-api")
    assert ctx["target_service"]["id"] == "payments-api"
    assert len(ctx["service_dependencies"]) == 1
    assert ctx["service_dependencies"][0]["id"] == "payments-db"

    full_graph = await hydradb_service.get_full_graph()
    assert full_graph["total_nodes"] == 6
    assert full_graph["total_edges"] == 5

    print("\n✓ GRAPH TEST PASSED: HydraDB graph nodes and relationships successfully queried!")


if __name__ == "__main__":
    asyncio.run(test_hydradb_graph_relationships())
