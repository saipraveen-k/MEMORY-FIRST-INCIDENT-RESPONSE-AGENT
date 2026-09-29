"use client";

import { useState, useEffect } from "react";
import { fetchAgentTraces } from "@/lib/api";
import { Activity, Cpu, CheckCircle2, Clock, ShieldCheck, Play, ArrowRight } from "lucide-react";

export default function AgentTracePage() {
  const [traces, setTraces] = useState<any[]>([]);
  const [selectedTrace, setSelectedTrace] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAgentTraces().then((res) => {
      setTraces(res || []);
      if (res && res.length > 0) setSelectedTrace(res[0]);
      setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center space-x-3">
            <Activity className="w-7 h-7 text-blue-400" />
            <span>RocketRide Agent Execution Traces</span>
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Observable step-by-step pipeline traces executed by RocketRide agent orchestrator.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Execution History Panel (1 col) */}
        <div className="glass-panel rounded-2xl p-6 border border-[#1e2d4a] space-y-4">
          <h2 className="text-base font-bold text-white flex items-center space-x-2">
            <Cpu className="w-5 h-5 text-blue-400" />
            <span>Execution Runs</span>
          </h2>

          <div className="space-y-2">
            {traces.map((tr) => (
              <div
                key={tr.run_id}
                onClick={() => setSelectedTrace(tr)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  selectedTrace?.run_id === tr.run_id
                    ? "bg-blue-600/20 border-blue-500 text-white"
                    : "bg-[#0d1624] border-[#1b2b45] text-gray-300 hover:border-gray-600"
                }`}
              >
                <div className="flex items-center justify-between text-xs font-mono mb-1">
                  <span className="font-bold text-blue-300">{tr.run_id}</span>
                  <span className="text-emerald-400">{tr.status}</span>
                </div>
                <div className="text-[11px] text-gray-400 font-mono">
                  Duration: {tr.total_duration_ms}ms • Steps: {tr.steps?.length}
                </div>
              </div>
            ))}

            {traces.length === 0 && (
              <div className="text-center py-12 text-gray-500 text-xs">
                No pipeline execution traces recorded yet. Run an incident analysis to generate traces.
              </div>
            )}
          </div>
        </div>

        {/* Selected Trace Step Visualizer (2 cols) */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-6 border border-blue-900/30 bg-blue-950/10 space-y-6">
          {selectedTrace ? (
            <>
              <div className="flex items-center justify-between border-b border-blue-900/30 pb-4">
                <div>
                  <div className="text-xs font-mono text-blue-400">PIPELINE RUN: {selectedTrace.run_id}</div>
                  <h3 className="text-lg font-bold text-white">{selectedTrace.pipeline_name}</h3>
                </div>
                <div className="text-xs font-mono bg-emerald-950/60 text-emerald-400 border border-emerald-800/40 px-3 py-1 rounded-xl">
                  {selectedTrace.total_duration_ms}ms TOTAL LATENCY
                </div>
              </div>

              {/* Step Timeline */}
              <div className="space-y-4">
                {selectedTrace.steps?.map((st: any) => (
                  <div
                    key={st.step}
                    className="p-4 rounded-xl bg-[#0b1322] border border-[#1a2945] flex items-start space-x-4"
                  >
                    <div className="w-7 h-7 rounded-full bg-blue-600/30 text-blue-400 border border-blue-500/50 flex items-center justify-center font-mono font-bold text-xs flex-shrink-0">
                      {st.step}
                    </div>

                    <div className="flex-1 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white font-mono text-sm">{st.name}</span>
                        <span className="font-mono text-gray-400">{st.duration_ms}ms</span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 font-mono text-[11px]">
                        <div className="bg-[#060b14] p-2.5 rounded border border-gray-800">
                          <div className="text-gray-500 text-[10px] mb-1">INPUT:</div>
                          <pre className="text-gray-300 overflow-x-auto">{JSON.stringify(st.input, null, 2)}</pre>
                        </div>

                        <div className="bg-[#060b14] p-2.5 rounded border border-gray-800">
                          <div className="text-gray-500 text-[10px] mb-1">OUTPUT:</div>
                          <pre className="text-emerald-400 overflow-x-auto">{JSON.stringify(st.output, null, 2)}</pre>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-20 text-gray-500 text-xs">
              Select a trace execution from the left panel to inspect pipeline steps.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
