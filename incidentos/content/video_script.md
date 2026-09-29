# IncidentOS — 3-Minute Live Demonstration Video Script

**Title**: Memory-First Incident Response Agent — IncidentOS  
**Target Duration**: 3:00  

---

### [0:00 – 0:30] SECTION 1: THE PROBLEM
**[Visual]**: On-screen title: "Stateless AI Agents vs Memory-First IR". Show a developer looking at a generic LLM chatbot giving repetitive, generic advice during a high-severity production outage.

**[Narrator Voiceover]**:
> "Most incident response agents suffer from a fatal flaw: they are completely stateless. When an outage hits your checkout API, standard LLM tools analyze logs in isolation. Three weeks later, when the exact same deployment regression recurs, the bot has zero memory of what happened last time or the rules your senior engineers established."

---

### [0:30 – 1:00] SECTION 2: INCIDENTOS OVERVIEW & ARCHITECTURE
**[Visual]**: Transition to IncidentOS Command Center Dashboard (`/dashboard`). Show system status badges lighting up: Hindsight ACTIVE, RocketRide READY, HydraDB CONNECTED. Display architecture block diagram.

**[Narrator Voiceover]**:
> "Meet IncidentOS — an incident response agent that remembers what happened last time. IncidentOS fuses three specialized infrastructure layers: Hindsight for biomimetic agent long-term memory, HydraDB for OpenCypher graph topology, and RocketRide for multi-step pipeline orchestration with safety gates."

---

### [1:00 – 2:30] SECTION 3: LIVE DEMONSTRATION & MEMORY LEARNING
**[Visual]**: 
1. Navigate to `/demo` and click **DAY 1**. Show Payment API returning HTTP 503 errors.
2. Click **Investigate Agent**. Show HydraDB graph dependency (`payments-api -> payments-db`) and Hindsight memory recall.
3. Show engineer submitting feedback: *"Rollback v3.2 fixed connection pool leak."* Hindsight retains the lesson.
4. Click **DAY 3**. Engineer inputs operational rule: *"Never restart payment service before checking active transactions."*
5. Click **DAY 4** (The Learning Proof!). Show recurring 503 incident.

**[Narrator Voiceover]**:
> "Here on Day 1, our Payment API experiences a 503 outage. The engineer approves a rollback and records an operational lesson. On Day 3, the engineer adds a critical rule: 'Never restart before checking active transactions.' 
> Now watch Day 4. When a new incident occurs, **the agent behaves differently because it learned!** Hindsight recalls the exact historical lesson, RocketRide executes the reasoning pipeline, and the agent explicitly warns the team to inspect active transactions before considering a restart."

---

### [2:30 – 3:00] SECTION 4: KEY TAKEAWAY & CONCLUSION
**[Visual]**: Show RocketRide Agent Trace Viewer (`/agent`) step logs and Hindsight Memory Explorer (`/memory`). End on final hero slide with repository links.

**[Narrator Voiceover]**:
> "IncidentOS proves that effective incident response isn't just about analyzing what's happening now — it's about remembering what happened before. Powered by Hindsight, RocketRide, and HydraDB. Thank you."
