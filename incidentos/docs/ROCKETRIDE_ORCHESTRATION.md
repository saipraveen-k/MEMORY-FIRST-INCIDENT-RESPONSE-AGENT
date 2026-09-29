# RocketRide Agent Orchestration Architecture

## 1. Overview
RocketRide coordinates the multi-step reasoning pipeline for IncidentOS. Instead of executing LLM calls in an unmonitored loop, RocketRide enforces deterministic pipeline execution with full step-by-step observability and safety gates.

## 2. Pipeline Stages

```
1. incident_ingestion
        │
2. incident_normalization
        │
3. graph_context_query (HydraDB)
        │
4. hindsight_memory_recall (Hindsight)
        │
5. evidence_synthesis
        │
6. root_cause_analysis
        │
7. recommendation_formulation
        │
8. safety_gate (Risk Classification & Approval Gate)
        │
9. human_approval
        │
10. action_execution / simulation
        │
11. outcome_evaluation
        │
12. memory_retention & graph_update
```

## 3. Observability & Tracing
Every pipeline run produces a `RocketRidePipelineTrace` object containing:
- `run_id`: Unique execution identifier
- `total_duration_ms`: End-to-end execution latency
- `steps`: Step-by-step log of input parameters, output schemas, and step latency

Traces are exposed in the RocketRide Agent Trace Viewer UI (`/agent`).
