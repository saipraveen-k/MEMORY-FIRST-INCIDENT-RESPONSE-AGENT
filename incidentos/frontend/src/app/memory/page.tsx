"use client";

import { useState, useEffect } from "react";
import { fetchMemories } from "@/lib/api";
import { Brain, Search, Clock, Tag, Sparkles, Filter } from "lucide-react";

export default function MemoryExplorerPage() {
  const [memories, setMemories] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMemories().then((res) => {
      setMemories(res || []);
      setLoading(false);
    });
  }, []);

  const filtered = memories.filter((m) => {
    const matchesSearch =
      m.content.toLowerCase().includes(search.toLowerCase()) ||
      (m.metadata?.service || "").toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === "ALL" || (m.type || "LESSON").toUpperCase() === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center space-x-3">
            <Brain className="w-7 h-7 text-purple-400" />
            <span>Hindsight Agent Memory Explorer</span>
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Browse world facts, experience facts, mental models, and engineer lessons stored in long-term memory.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search memories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-[#0e1626] border border-[#1f2e4d] rounded-xl pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-purple-500 w-64"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-[#0e1626] border border-[#1f2e4d] rounded-xl px-4 py-2 text-sm text-gray-300 focus:outline-none focus:border-purple-500"
          >
            <option value="ALL">All Types</option>
            <option value="LESSON">Lessons</option>
            <option value="EXPERIENCE">Experience</option>
            <option value="FACT">Facts</option>
          </select>
        </div>
      </div>

      {/* Memory Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((mem) => (
          <div
            key={mem.id}
            className="glass-panel rounded-2xl p-5 border border-purple-900/30 bg-purple-950/10 space-y-3 hover:border-purple-500/40 transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-purple-400 bg-purple-950/60 px-2.5 py-0.5 rounded border border-purple-800/40">
                MEM-{mem.id}
              </span>
              <span className="text-[11px] font-mono text-gray-400 uppercase tracking-wider">
                {mem.type || 'LESSON'}
              </span>
            </div>

            <p className="text-sm font-medium text-purple-100 leading-relaxed">
              "{mem.content}"
            </p>

            {mem.metadata && (
              <div className="pt-2 border-t border-purple-900/30 flex flex-wrap gap-2 text-[11px] font-mono text-gray-400">
                {mem.metadata.service && (
                  <span className="bg-[#120e24] px-2 py-0.5 rounded border border-purple-900/40 text-purple-300">
                    Service: {mem.metadata.service}
                  </span>
                )}
                {mem.metadata.incident_id && (
                  <span className="bg-[#120e24] px-2 py-0.5 rounded border border-purple-900/40 text-purple-300">
                    Source: #{mem.metadata.incident_id}
                  </span>
                )}
                {mem.metadata.useful_rating && (
                  <span className="bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-900/40 text-emerald-300">
                    Rating: {mem.metadata.useful_rating}
                  </span>
                )}
              </div>
            )}
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-2 text-center py-16 text-gray-500">
            No memories match your query. Run the Learning Demo or record engineer feedback on an incident.
          </div>
        )}
      </div>
    </div>
  );
}
