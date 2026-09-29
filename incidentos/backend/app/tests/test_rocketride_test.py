import pytest
import asyncio
from app.services.rocketride_service import rocketride_service


@pytest.mark.asyncio
async def test_rocketride_pipeline_execution():
    """ROCKETRIDE TEST (Section 43):
    Verify that the incident response workflow actually executes through RocketRide pipeline engine
    and records step-by-step observability traces.
    """
    input_data = {
        "id": "inc-test-99",
        "title": "Auth Service Latency Spike",
        "service": "auth-service",
        "severity": "HIGH",
        "symptoms": ["Latency > 2000ms"],
        "logs": ["Redis timeout"],
        "deployment_version": "v2.8"
    }

    graph_ctx = {
        "topology_path": "auth-service -> auth-redis",
        "service_dependencies": [{"id": "auth-redis"}]
    }

    memories = [
        {"content": "Redis connection pool bottleneck previously resolved by scaling maxconnections"}
    ]

    trace = await rocketride_service.run_pipeline(
        pipeline_name="incident_response_workflow",
        input_data=input_data,
        graph_context=graph_ctx,
        memories=memories
    )

    assert trace["status"] == "SUCCESS"
    assert trace["pipeline_name"] == "incident_response_workflow"
    assert len(trace["steps"]) >= 7

    step_names = [s["name"] for s in trace["steps"]]
    assert "incident_ingestion" in step_names
    assert "graph_context_query" in step_names
    assert "hindsight_memory_recall" in step_names
    assert "safety_gate" in step_names

    safety_step = next(s for s in trace["steps"] if s["name"] == "safety_gate")
    assert safety_step["output"]["requires_human_approval"] is True

    traces_history = await rocketride_service.get_execution_traces()
    assert len(traces_history) > 0

    print("\n✓ ROCKETRIDE TEST PASSED: Agent workflow executed through RocketRide pipeline runner with full observability traces!")


if __name__ == "__main__":
    asyncio.run(test_rocketride_pipeline_execution())
