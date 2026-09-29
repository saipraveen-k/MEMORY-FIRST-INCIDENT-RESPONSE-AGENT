# Security & Safety Architecture — IncidentOS

## 1. Safety Classification
Actions are classified into three risk tiers:

- **LOW RISK**: Diagnostics, telemetry inspection, log reading. (Safe for automated simulation).
- **MEDIUM RISK**: Staging modifications, traffic shift to secondary pool.
- **HIGH RISK**: Production pod restart, production rollback, destructive infrastructure actions.

## 2. Human-in-the-Loop Approval Gate
IncidentOS enforces a strict policy: **NO HIGH-RISK PRODUCTION ACTIONS ARE EVER AUTONOMOUSLY EXECUTED.**

All recommendations requiring production mutation generate structured action proposals with command previews and simulation options, requiring explicit engineer verification and approval.

## 3. Secret Management & Input Validation
- Environment variables are isolated via `.env`.
- Pydantic models validate all incoming incident payloads and feedback schemas.
- Shell command previews are strictly formatted string representations; no arbitrary dynamic shell execution is permitted.
