const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export async function fetchHealth() {
  try {
    const res = await fetch(`${API_BASE}/health`, { cache: 'no-store' });
    if (!res.ok) throw new Error("Health check failed");
    return await res.json();
  } catch (err) {
    return {
      status: "offline",
      dependencies: {
        hindsight: { status: "offline" },
        rocketride: { status: "offline" },
        hydradb: { status: "offline" }
      }
    };
  }
}

export async function fetchIncidents(params?: { service?: string; severity?: string; status?: string }) {
  const query = new URLSearchParams(params as any).toString();
  const url = `${API_BASE}/incidents${query ? `?${query}` : ''}`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error("Failed to fetch incidents");
  return await res.json();
}

export async function fetchIncident(id: string) {
  const res = await fetch(`${API_BASE}/incidents/${id}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Failed to fetch incident #${id}`);
  return await res.json();
}

export async function analyzeIncident(id: string) {
  const res = await fetch(`${API_BASE}/incidents/${id}/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" }
  });
  if (!res.ok) throw new Error(`Failed to analyze incident #${id}`);
  return await res.json();
}

export async function submitFeedback(id: string, feedback: { useful: string; lesson: string; comments?: string }) {
  const res = await fetch(`${API_BASE}/incidents/${id}/feedback`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(feedback)
  });
  if (!res.ok) throw new Error(`Failed to submit feedback for #${id}`);
  return await res.json();
}

export async function resolveIncident(id: string, notes?: string) {
  const res = await fetch(`${API_BASE}/incidents/${id}/resolve${notes ? `?resolution_notes=${encodeURIComponent(notes)}` : ''}`, {
    method: "POST"
  });
  if (!res.ok) throw new Error(`Failed to resolve incident #${id}`);
  return await res.json();
}

export async function fetchMemories() {
  const res = await fetch(`${API_BASE}/memory`, { cache: 'no-store' });
  if (!res.ok) throw new Error("Failed to fetch memories");
  return await res.json();
}

export async function fetchGraph() {
  const res = await fetch(`${API_BASE}/graph`, { cache: 'no-store' });
  if (!res.ok) throw new Error("Failed to fetch graph");
  return await res.json();
}

export async function fetchAgentTraces() {
  const res = await fetch(`${API_BASE}/agent/traces`, { cache: 'no-store' });
  if (!res.ok) throw new Error("Failed to fetch agent traces");
  return await res.json();
}

export async function runDemoStep(step: number) {
  const res = await fetch(`${API_BASE}/demo/run?step=${step}`, {
    method: "POST"
  });
  if (!res.ok) throw new Error(`Failed to run demo step ${step}`);
  return await res.json();
}

export async function resetDemo() {
  const res = await fetch(`${API_BASE}/demo/reset`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to reset demo");
  return await res.json();
}

export async function seedDemo() {
  const res = await fetch(`${API_BASE}/demo/seed`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to seed demo");
  return await res.json();
}
