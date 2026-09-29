# Hindsight Long-Term Memory Architecture

## 1. Overview
Hindsight provides biomimetic long-term memory for IncidentOS. Rather than storing raw chat transcripts or naive embeddings, Hindsight categorizes and distills experience into structured memory types:

- **World Facts**: System architecture constants and service environments.
- **Experience Facts**: Historical incident summaries, observed error symptoms, and successful/failed remediation attempts.
- **Mental Models & Lessons**: Consolidated operational rules synthesized from engineer feedback (e.g., *"Do not restart the payment service before checking active transactions"*).

## 2. Retention Flow
Before retaining data into Hindsight, IncidentOS extracts durable information:
1. Filters out transient noise and raw stack trace duplicates.
2. Identifies specific service identifiers, error symptoms, and deployment versions.
3. Formulates structured memory entries via `hindsight_service.retain()`.

```python
await hindsight_service.retain(
    content="Operational Lesson for payments-api: Do not restart before checking active transactions.",
    metadata={
        "incident_id": "inc-024",
        "service": "payments-api",
        "category": "ENGINEER_LESSON"
    },
    memory_type="lesson"
)
```

## 3. Retrieval Flow
During incident intake, `hindsight_service.recall()` executes multi-strategy retrieval combining:
- **Semantic Vector Similarity**
- **BM25 Keyword Matching**
- **Temporal Weighting** (prioritizing recent operational lessons)
- **Cross-Encoder Reranking**

The recalled memories are formatted into prompt context strings for RocketRide agent reasoning.
