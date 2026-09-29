import pytest
import asyncio
from app.models.incident import IncidentCreate, SeverityEnum, IncidentFeedback
from app.services.incident_service import incident_service
from app.services.agent_service import agent_service
from app.services.feedback_service import feedback_service
from app.services.hindsight_service import hindsight_service
from app.services.demo_service import demo_service


@pytest.mark.asyncio
async def test_critical_memory_learning_loop():
    """CRITICAL MEMORY TEST (Section 41):
    Proves that the agent does NOT possess specific operational lesson BEFORE learning,
    then learns it via feedback stored in Hindsight,
    and AFTERWARDS incorporates the learned lesson into its recommendations.
    """
    # 1. Reset state
    await demo_service.reset_demo()

    # 2. BEFORE LEARNING: Incident 1
    inc_before = await incident_service.create_incident(IncidentCreate(
        title="Payment Gateway Timeout",
        description="Checkout timeout on payments-api database queries",
        service="payments-api",
        severity=SeverityEnum.HIGH,
        symptoms=["Database timeout"],
        deployment_version="v3.2"
    ))

    rec_before = await agent_service.analyze_incident(inc_before)
    
    # Verify that before learning, the specific lesson about active transactions is NOT present
    transaction_lessons_before = [
        les for les in rec_before.historical_lessons 
        if "active transactions" in les.lower()
    ]
    assert len(transaction_lessons_before) == 0, "Before learning, agent should not possess transaction check lesson"

    # 3. ENGINEER PROVIDES LESSON & RETAINS IN HINDSIGHT
    lesson_text = "Do not restart the payment service before checking active transactions."
    feedback_res = await feedback_service.record_feedback(
        inc_before.id,
        IncidentFeedback(
            useful="YES",
            lesson=lesson_text,
            comments="Restarting while transactions are open causes data corruption."
        )
    )

    assert feedback_res["status"] == "SUCCESS"
    assert feedback_res["hindsight_memory_id"] is not None

    # Verify memory is in Hindsight bank
    memories = await hindsight_service.recall("check active transactions", bank_id="incidentos_bank")
    assert len(memories) > 0
    assert any("active transactions" in m["content"].lower() for m in memories)

    # 4. AFTER LEARNING: Incident 2 (New incident with similar context)
    inc_after = await incident_service.create_incident(IncidentCreate(
        title="Payment API HTTP 503 Outage",
        description="Checkout API returning 503 errors during traffic surge",
        service="payments-api",
        severity=SeverityEnum.CRITICAL,
        symptoms=["HTTP 503", "Connection pool exhaustion"],
        deployment_version="v3.2"
    ))

    rec_after = await agent_service.analyze_incident(inc_after)

    # 5. EXPECTED: Agent recalls and incorporates the learned lesson!
    assert len(rec_after.historical_lessons) > 0, "After learning, historical lessons must be present"
    
    lesson_applied = any("active transactions" in les.lower() for les in rec_after.historical_lessons)
    assert lesson_applied, "Agent MUST incorporate the specific learned lesson into historical_lessons"

    safety_lesson_applied = any("active transactions" in note.lower() for note in rec_after.safety_notes)
    assert safety_lesson_applied, "Agent MUST incorporate the learned lesson into safety_notes"

    print("\n✓ CRITICAL MEMORY TEST PASSED: Agent successfully changed behavior after learning from Hindsight memory!")


if __name__ == "__main__":
    asyncio.run(test_critical_memory_learning_loop())
