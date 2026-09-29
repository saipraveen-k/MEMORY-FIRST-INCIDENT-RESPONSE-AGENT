# System Architecture — IncidentOS

## 1. Overview
IncidentOS is a Memory-First Incident Response Agent built to solve a fundamental deficiency in modern SRE toolchains: most incident bots operate statelessly. When an outage occurs, existing LLM tools analyze logs in isolation, unaware that an identical issue occurred 3 weeks ago or that senior engineers explicitly established operational rules for that microservice.

IncidentOS integrates three distinct specialized infrastructure components into a unified system:

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

## 2. Core Separation of Responsibilities

### Why not use one database for everything?
A common architectural antipattern in AI agents is forcing a single database or vector store to handle vector memory, multi-hop relationship queries, and workflow state. This leads to poor search precision, inability to query graph dependencies, and unobservable agent execution.

- **Hindsight (Long-Term Agent Memory)**: Specialized biomimetic memory system with semantic, BM25, graph, and temporal retrieval strategies. Answers: *"What did the agent learn from previous experience?"*
- **HydraDB (Structured Graph Knowledge)**: SlateDB-backed OpenCypher graph engine. Answers: *"How are incidents, services, root causes, deployments, and actions related in our topology?"*
- **RocketRide (Pipeline Orchestration Engine)**: Multi-step workflow execution engine with step logging and safety gates. Answers: *"How should the agent execute this multi-step reasoning workflow?"*
- **IncidentOS (Application & Synthesis Layer)**: Unites graph topology with historical memory, exposes the Incident Command Center UI, and enforces human-in-the-loop safety boundaries.

## 3. Dataflow & Reasoning Loop

```
                 CURRENT INCIDENT
                       │
                       ▼
                Incident Parser
                       │
                       ▼
                Graph Context
                  [HydraDB]
                       │
                       ▼
                Memory Recall
                  [Hindsight]
                       │
                       ▼
              Agent Reasoning
                [RocketRide]
                       │
                       ▼
               Safety Analysis
                       │
                       ▼
                Recommendation
                       │
                       ▼
               Human Approval
                       │
                       ▼
              Action / Simulation
                       │
                       ▼
                  Outcome
                       │
             ┌─────────┴─────────┐
             ▼                   ▼
       Hindsight Retain      HydraDB Update
             │                   │
             └─────────┬─────────┘
                       ▼
                 Learned System
```

## 4. Scalability & Resilience
Each service adapter includes circuit-breaker fallback mechanisms ensuring that if a backend dependency is initializing or undergoing background indexing, IncidentOS continues operating without downtime.
