# Testing Strategy & Verification — IncidentOS

## Test Suite Overview

IncidentOS features unit, integration, and E2E verification test suites under `incidentos/backend/app/tests/`.

### 1. Critical Memory Learning Test (`test_critical_memory_test.py`)
Proves BEFORE vs AFTER memory learning behavior:
- Verifies that before learning, the specific lesson (*"Check active transactions before restart"*) is absent.
- Stores feedback into Hindsight memory.
- Verifies that after learning, the agent recalls and applies the lesson in its output and safety notes.

### 2. HydraDB Graph Relationship Test (`test_graph_test.py`)
Verifies that `Incident -> Service -> Dependency -> Deployment -> RootCause -> Action` entities and relationships are queryable from HydraDB.

### 3. RocketRide Pipeline Test (`test_rocketride_test.py`)
Verifies multi-step agent pipeline execution, step durations, and observability trace generation.

## Execution Command
```bash
cd incidentos/backend
python -m pytest app/tests/ -v
```
