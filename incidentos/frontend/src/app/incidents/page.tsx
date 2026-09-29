"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { fetchIncidents } from "@/lib/api";
import { AlertTriangle, Filter, Search, ArrowRight, ShieldCheck, CheckCircle, Clock } from "lucide-react";

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIncidents().then((res) => {
      setIncidents(res || []);
      setLoading(false);
    });
  }, []);

  const filtered = incidents.filter((i) => {
    const matchesSearch =
      i.title.toLowerCase().includes(search.toLowerCase()) ||
      i.service.toLowerCase().includes(search.toLowerCase()) ||
      i.id.toLowerCase().includes(search.toLowerCase());
    const matchesSeverity = severityFilter === "ALL" || i.severity === severityFilter;
    return matchesSearch && matchesSeverity;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center space-x-3">
            <AlertTriangle className="w-7 h-7 text-amber-400" />
            <span>Incident Command Center Feed</span>
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Real-time incident stream enriched with Hindsight memory & HydraDB topology.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search incidents or services..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-[#0e1626] border border-[#1f2e4d] rounded-xl pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500 w-64"
            />
          </div>

          {/* Severity Filter */}
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="bg-[#0e1626] border border-[#1f2e4d] rounded-xl px-4 py-2 text-sm text-gray-300 focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>
      </div>

      {/* Incidents List */}
      <div className="space-y-3">
        {filtered.map((inc) => (
          <div
            key={inc.id}
            className="glass-panel rounded-2xl p-5 border border-[#1e2d4a] hover:border-blue-500/50 transition-all"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-2 flex-1">
                <div className="flex items-center space-x-3">
                  <span className={`px-2.5 py-0.5 rounded text-xs font-bold font-mono ${
                    inc.severity === "CRITICAL" ? "bg-red-950 text-red-400 border border-red-800/50" :
                    inc.severity === "HIGH" ? "bg-amber-950 text-amber-400 border border-amber-800/50" :
                    "bg-blue-950 text-blue-400 border border-blue-800/50"
                  }`}>
                    {inc.severity}
                  </span>
                  <span className="font-mono text-xs text-gray-400">#{inc.id}</span>
                  <span className="text-xs font-mono bg-blue-950/60 text-blue-300 px-2.5 py-0.5 rounded border border-blue-900/40">
                    Service: {inc.service}
                  </span>
                  <span className="text-xs font-mono bg-gray-900 text-gray-400 px-2 py-0.5 rounded">
                    Status: {inc.status}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white">{inc.title}</h3>
                <p className="text-xs text-gray-300">{inc.description}</p>

                {inc.symptoms && inc.symptoms.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {inc.symptoms.map((sym: string, idx: number) => (
                      <span key={idx} className="text-[11px] font-mono bg-[#16233b] text-gray-300 px-2 py-0.5 rounded border border-[#233559]">
                        {sym}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-3">
                <Link
                  href={`/incidents/${inc.id}`}
                  className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white font-medium px-4 py-2.5 rounded-xl text-sm transition-all glow-blue"
                >
                  <span>Investigate Agent</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-16 text-gray-500">
            No incidents matched your search criteria.
          </div>
        )}
      </div>
    </div>
  );
}
