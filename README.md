# IncidentOS — Memory-First Incident Response Agent

> **"An incident-response agent that remembers what happened last time."**

IncidentOS is an enterprise-grade AI Incident Response system designed to eliminate repeat production outages. Unlike conventional incident bots that analyze every incident in isolation with zero memory of past operational feedback, IncidentOS continuously learns from engineer feedback and historical experiences.

It fuses three core infrastructure components:

- **[Hindsight](https://github.com/saipraveen-k/hindsight)**: Biomimetic long-term memory engine (`Retain`, `Recall`, `Reflect`).
- **[RocketRide](https://github.com/saipraveen-k/rocketride-server)**: Multi-step agent pipeline orchestration and observable tool execution.
- **[HydraDB](https://github.com/saipraveen-k/hydradb)**: SlateDB-backed OpenCypher graph knowledge base mapping services, deployments, root causes, and actions.

---

## 🏛️ System Architecture

```
                         ┌────────────────────────┐
                         │      IncidentOS UI     │
                         │   Next.js / React      │
                         └────────────┬───────────┘
                                      │
                                      ▼
                         ┌────────────────────────┐
                         │   IncidentOS Backend   │
                         │        FastAPI         │
                         └────────────┬───────────┘
                                      │
                   ┌──────────────────┼──────────────────┐
                   │                  │                  │
                   ▼                  ▼                  ▼
          ┌────────────────┐ ┌────────────────┐ ┌─────────────────┐
          │    Hindsight   │ │   RocketRide   │ │    HydraDB      │
          │                │ │                │ │                 │
          │ Agent Memory   │ │ Agent Pipeline │ │ Graph Knowledge │
          │ Retain         │ │ Tools          │ │ Incidents       │
          │ Recall         │ │ Routing        │ │ Services        │
          │ Reflect        │ │ Orchestration  │ │ Dependencies    │
          │ Learning       │ │ Execution      │ │ Root Causes     │
          └────────────────┘ └────────────────┘ └─────────────────┘
```

### Core Architecture Responsibilities

| Subsystem | Primary Role | Core Operations |
|---|---|---|
| **Hindsight** | Long-Term Agent Memory | `retain`, `recall`, `reflect`, fact extraction, lessons learned |
| **HydraDB** | Structured Graph Knowledge | Node topology (`Incident`, `Service`, `Deployment`, `RootCause`, `Action`), OpenCypher graph traversal |
| **RocketRide** | Workflow Orchestration | Observable multi-step pipeline execution, safety gates, trace reporting |
| **IncidentOS** | Application & Product Layer | Incident Command Center UI, memory-graph context synthesis, feedback loop |

---

## 📥 Cloning the Repository

This repository uses Git submodules for **Hindsight**, **RocketRide**, and **HydraDB**.

### Primary Clone (with Submodules)
```bash
git clone --recurse-submodules https://github.com/saipraveen-k/MEMORY-FIRST-INCIDENT-RESPONSE-AGENT.git
cd MEMORY-FIRST-INCIDENT-RESPONSE-AGENT
```

### If Cloned Without Submodules
If you already cloned the repository without submodules, initialize them with:
```bash
git submodule update --init --recursive
```

---

## 🚀 Quick Start

### Prerequisites
- Python 3.10+
- Node.js v18+ & npm
- Docker & Docker Compose (optional for containerized deployment)

### Environment Configuration
Copy the sample environment file before launching:
```bash
cp .env.example .env
```

### Local Development Setup

1. **Backend Server**
   ```bash
   cd incidentos/backend
   pip install -r requirements.txt
   python -m uvicorn app.main:app --reload --port 8000
   ```
   *Swagger API Documentation is accessible at [http://localhost:8000/docs](http://localhost:8000/docs).*

2. **Frontend Command Center UI**
   ```bash
   cd incidentos/frontend
   npm install
   npm run dev
   ```
   *Open [http://localhost:3000](http://localhost:3000) in your browser.*

3. **Run Unit & Integration Tests**
   ```bash
   cd incidentos/backend
   python -m pytest app/tests/ -v
   ```

4. **Docker Compose Launch**
   ```bash
   docker-compose up --build
   ```

---

## 🧪 Critical Memory Learning Proof

IncidentOS implements a reproducible before/after memory learning test:

- **BEFORE LEARNING**: When presented with an incident, the agent generates standard diagnostic recommendations.
- **ENGINEER FEEDBACK**: Engineer submits feedback: *"Do not restart the payment service before checking active transactions."*
- **HINDSIGHT RETAIN**: Feedback is extracted into durable long-term memory in Hindsight.
- **AFTER LEARNING**: When a new incident occurs, the agent **recalls the lesson** and explicitly updates its recommendation and safety notes to instruct checking active transactions first.

---

## 📚 Documentation Index

- [Architecture Guide](incidentos/docs/ARCHITECTURE.md)
- [Hindsight Memory Model](incidentos/docs/HINDSIGHT_MEMORY.md)
- [RocketRide Orchestration](incidentos/docs/ROCKETRIDE_ORCHESTRATION.md)
- [HydraDB Graph Knowledge](incidentos/docs/HYDRADB_GRAPH.md)
- [API Reference](incidentos/docs/API.md)
- [Demo Narrative Guide](incidentos/docs/DEMO.md)
- [Security & Risk Analysis](incidentos/docs/SECURITY.md)
- [Testing & Verification](incidentos/docs/TESTING.md)
- [Final Implementation Report](incidentos/FINAL_IMPLEMENTATION_REPORT.md)
- [Third-Party Notices](THIRD_PARTY_NOTICES.md)

---

## 📝 Content Deliverables

- [Technical Article (1400 words)](incidentos/content/article.md)
- [LinkedIn Post](incidentos/content/linkedin_post.md)
- [Video Script (3 min)](incidentos/content/video_script.md)

---

## ⚖️ License & Attribution

- **IncidentOS Application**: Licensed under the [MIT License](LICENSE).
- **Third-Party Submodules**: Please see [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) for licenses and copyright attributions for Hindsight, RocketRide, and HydraDB.
