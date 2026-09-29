# API Reference — IncidentOS

Base URL: `http://localhost:8000/api`

## Endpoints

### 1. Health & Systems Status
`GET /api/health`
Checks status of IncidentOS backend, Hindsight, RocketRide, and HydraDB.

### 2. Incident Management
- `POST /api/incidents` — Create a new incident.
- `GET /api/incidents` — List all incidents (filterable by service, severity, status).
- `GET /api/incidents/{id}` — Get detailed incident record.
- `POST /api/incidents/{id}/analyze` — Run agent reasoning loop (Graph + Memory + Pipeline).
- `POST /api/incidents/{id}/feedback` — Record engineer feedback & retain in Hindsight memory.
- `POST /api/incidents/{id}/resolve` — Mark incident resolved.

### 3. Memory & Graph Explorers
- `GET /api/memory` — List stored Hindsight memories.
- `GET /api/graph` — Export HydraDB graph topology.
- `GET /api/agent/traces` — List RocketRide execution traces.

### 4. Deterministic Demo Runner
- `POST /api/demo/reset` — Reset system to initial state.
- `POST /api/demo/seed` — Seed 20+ realistic synthetic incidents.
- `POST /api/demo/run?step={1..4}` — Run step 1, 2, 3, or 4 of 4-Day Memory Learning Demo.
