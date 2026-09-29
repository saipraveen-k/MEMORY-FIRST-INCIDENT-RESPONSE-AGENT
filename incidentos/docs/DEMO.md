# Demo Guide — 4-Day Memory Learning Narrative

## Overview
The IncidentOS demo demonstrates how an incident response agent becomes smarter over time by retaining engineer feedback.

## Demo Sequence

### DAY 1: Initial Payment API Outage
- **Scenario**: Payment API returning HTTP 503 errors on checkout.
- **Agent Behavior**: Analyzes incident, proposes rollback.
- **Engineer Action**: Approves rollback, feedback: *"Rollback v3.2 fixed it."*
- **Hindsight Action**: Retains operational experience in memory.

### DAY 2: Latency Spike Incident
- **Scenario**: Checkout latency spike on payment service.
- **Agent Behavior**: Recalls Day 1 experience regarding deployment v3.2 connection pool issues.

### DAY 3: Operational Rule Capture
- **Engineer Action**: Provides explicit operational feedback: *"Do not restart the payment service before checking active transactions."*
- **Hindsight Action**: Stores durable lesson rule in memory.

### DAY 4: Learned System Proof (BEFORE vs AFTER)
- **Scenario**: Recurring 503 checkout outage.
- **Agent Behavior**: **THE AGENT BEHAVES DIFFERENTLY BECAUSE IT LEARNED!**
  It explicitly incorporates the Day 3 lesson, instructing engineers to check active transactions before attempting pod restart.
