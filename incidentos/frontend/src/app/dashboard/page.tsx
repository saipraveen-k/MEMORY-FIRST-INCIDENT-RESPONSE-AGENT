"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  fetchIncidents,
  fetchMemories,
  fetchGraph,
  seedDemo,
  resetDemo
} from "@/lib/api";
import {
  AlertTriangle,
  Brain,
  GitFork,
  Activity,
  ArrowRight,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  Clock,
  ExternalLink
} from "lucide-react";

export default function DashboardPage() {
  const [incidents, setIncidents] = useState<any[]>([]);
  const [memories, setMemories] = useState<any[]>([]);
  const [graphData, setGraphData] = useState<any>({ total_nodes: 0, total_edges: 0 });
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [incRes, memRes, graphRes] = await Promise.all([
        fetchIncidents(),
        fetchMemories(),
        fetchGraph()
      ]);
      setIncidents(incRes || []);
      setMemories(memRes || []);
      setGraphData(graphRes || { total_nodes: 0, total_edges: 0 });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const criticalCount = incidents.filter(i => i.severity === "CRITICAL" || i.severity === "HIGH").length;

  return (
    <div className="space-y-8">
      {/* Top Banner & Quick Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[#111927] via-[#162238] to-[#111927] p-6 rounded-2xl border border-blue-900/30 shadow-xl">
        <div>
          <div className="flex items-center space-x-2 text-blue-400 text-xs font-mono mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>INCIDENTOS COMMAND CENTER</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            An Incident-Response Agent That Remembers What Happened Last Time
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Fusing Hindsight long-term memory + RocketRide pipeline orchestration + HydraDB graph topology.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href="/demo"
            className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium px-4 py-2.5 rounded-xl shadow-lg glow-blue transition-all text-sm"
          >
            <Sparkles className="w-4 h-4" />
            <span>Launch Learning Demo</span>
          </Link>
          <button
            onClick={async () => {
              await seedDemo();
              loadData();
            }}
            className="flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 text-gray-200 font-medium px-4 py-2.5 rounded-xl border border-gray-700 text-sm transition-all"
          >
            <span>Seed 20+ Incidents</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        {/* Metric 1 */}
        <div className="glass-panel p-5 rounded-xl border border-red-900/30 bg-red-950/10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Active Incidents</span>
            <AlertTriangle className="w-5 h-5 text-red-400" />
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-bold text-white">{incidents.length}</span>
            <span className="text-xs text-red-400 font-medium">{criticalCount} High Severity</span>
          </div>
          <div className="mt-2 text-xs text-gray-500">Real-time telemetry monitoring</div>
        </div>

        {/* Metric 2 */}
        <div className="glass-panel p-5 rounded-xl border border-purple-900/30 bg-purple-950/10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Hindsight Memory</span>
            <Brain className="w-5 h-5 text-purple-400" />
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-bold text-white">{memories.length}</span>
            <span className="text-xs text-purple-400 font-medium">Retained Lessons</span>
          </div>
          <div className="mt-2 text-xs text-gray-500">Biomimetic long-term memory engine</div>
        </div>

        {/* Metric 3 */}
        <div className="glass-panel p-5 rounded-xl border border-emerald-900/30 bg-emerald-950/10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">HydraDB Topology</span>
            <GitFork className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-bold text-white">{graphData.total_nodes}</span>
            <span className="text-xs text-emerald-400 font-medium">{graphData.total_edges} Graph Edges</span>
          </div>
          <div className="mt-2 text-xs text-gray-500">OpenCypher graph relationships</div>
        </div>

        {/* Metric 4 */}
        <div className="glass-panel p-5 rounded-xl border border-blue-900/30 bg-blue-950/10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">RocketRide Pipeline</span>
            <Activity className="w-5 h-5 text-blue-400" />
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-bold text-white">142ms</span>
            <span className="text-xs text-blue-400 font-medium">100% Safety Gate</span>
          </div>
          <div className="mt-2 text-xs text-gray-500">Observable multi-step execution</div>
        </div>
      </div>

      {/* Main Content Layout: Active Incidents + Recalled Memory Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Incidents Table (2 cols) */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-6 border border-[#1e2d4a]">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-white">Active Incident Feed</h2>
              <p className="text-xs text-gray-400">Select an incident to investigate with memory & graph context</p>
            </div>
            <Link
              href="/incidents"
              className="text-xs font-medium text-blue-400 hover:text-blue-300 flex items-center space-x-1"
            >
              <span>View All ({incidents.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {incidents.slice(0, 5).map((inc) => (
              <Link
                key={inc.id}
                href={`/incidents/${inc.id}`}
                className="block p-4 rounded-xl bg-[#0e1626] hover:bg-[#152036] border border-[#1f2e4d] transition-all hover:border-blue-500/50 group"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                        inc.severity === "CRITICAL" ? "bg-red-950 text-red-400 border border-red-800/50" :
                        inc.severity === "HIGH" ? "bg-amber-950 text-amber-400 border border-amber-800/50" :
                        "bg-blue-950 text-blue-400 border border-blue-800/50"
                      }`}>
                        {inc.severity}
                      </span>
                      <span className="font-mono text-xs text-gray-400">#{inc.id}</span>
                      <span className="text-xs font-medium text-blue-300 bg-blue-950/40 px-2 py-0.5 rounded border border-blue-900/30">
                        {inc.service}
                      </span>
                    </div>
                    <h3 className="text-sm font-semibold text-white group-hover:text-blue-400 transition-colors">
                      {inc.title}
                    </h3>
                    <p className="text-xs text-gray-400 line-clamp-1">{inc.description}</p>
                  </div>

                  <div className="flex items-center space-x-2 text-xs">
                    <span className="text-gray-500 font-mono text-[11px]">
                      {inc.deployment_version || 'v3.2'}
                    </span>
                    <ExternalLink className="w-4 h-4 text-gray-500 group-hover:text-blue-400 transition-colors" />
                  </div>
                </div>
              </Link>
            ))}

            {incidents.length === 0 && (
              <div className="text-center py-12 text-gray-500 text-sm">
                No active incidents found. Click "Seed 20+ Incidents" to populate demo data.
              </div>
            )}
          </div>
        </div>

        {/* Hindsight Recalled Memory Sidebar (1 col) */}
        <div className="glass-panel rounded-2xl p-6 border border-[#1e2d4a]">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <Brain className="w-5 h-5 text-purple-400" />
              <h2 className="text-lg font-bold text-white">Learned Lessons</h2>
            </div>
            <Link href="/memory" className="text-xs text-purple-400 hover:underline">
              Explorer
            </Link>
          </div>

          <div className="space-y-3">
            {memories.slice(0, 4).map((mem) => (
              <div
                key={mem.id}
                className="p-3.5 rounded-xl bg-purple-950/20 border border-purple-900/30 text-xs space-y-2"
              >
                <div className="flex items-center justify-between text-[10px] text-purple-400 font-mono">
                  <span>MEM-{mem.id}</span>
                  <span>{mem.type || 'LESSON'}</span>
                </div>
                <p className="text-gray-200 font-medium leading-relaxed">
                  "{mem.content}"
                </p>
                {mem.metadata?.service && (
                  <div className="text-[10px] text-gray-400 font-mono pt-1">
                    Service: <span className="text-purple-300">{mem.metadata.service}</span>
                  </div>
                )}
              </div>
            ))}

            {memories.length === 0 && (
              <div className="text-center py-8 text-gray-500 text-xs">
                No memories stored yet. Run the Learning Demo to observe Hindsight retaining engineer feedback.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
