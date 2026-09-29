"use client";

import { useState, useEffect } from "react";
import { fetchHealth } from "@/lib/api";
import { Settings, Brain, Cpu, Database, Server, RefreshCw } from "lucide-react";

export default function SettingsPage() {
  const [health, setHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const checkHealth = () => {
    setLoading(true);
    fetchHealth().then((res) => {
      setHealth(res);
      setLoading(false);
    });
  };

  useEffect(() => {
    checkHealth();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center space-x-3">
            <Settings className="w-7 h-7 text-blue-400" />
            <span>System Health & Integration Status</span>
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Verification of Hindsight, RocketRide, and HydraDB underlying system components.
          </p>
        </div>

        <button
          onClick={checkHealth}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white font-medium px-4 py-2 rounded-xl text-xs transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh Status</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Hindsight Service Card */}
        <div className="glass-panel rounded-2xl p-6 border border-purple-900/30 bg-purple-950/10 space-y-4">
          <div className="flex items-center justify-between">
            <Brain className="w-6 h-6 text-purple-400" />
            <span className="text-xs font-mono bg-purple-950 text-purple-300 px-2.5 py-0.5 rounded border border-purple-800/40">
              {health?.dependencies?.hindsight?.status || 'UNKNOWN'}
            </span>
          </div>

          <div>
            <h3 className="text-base font-bold text-white">Hindsight Agent Memory</h3>
            <p className="text-xs text-gray-400 mt-1">Persistent long-term biomimetic memory engine</p>
          </div>

          <div className="text-xs font-mono text-gray-400 space-y-1 pt-2 border-t border-purple-900/30">
            <div>URL: {health?.dependencies?.hindsight?.url || 'http://localhost:8888'}</div>
            <div>Bank: incidentos_bank</div>
          </div>
        </div>

        {/* RocketRide Service Card */}
        <div className="glass-panel rounded-2xl p-6 border border-blue-900/30 bg-blue-950/10 space-y-4">
          <div className="flex items-center justify-between">
            <Cpu className="w-6 h-6 text-blue-400" />
            <span className="text-xs font-mono bg-blue-950 text-blue-300 px-2.5 py-0.5 rounded border border-blue-800/40">
              {health?.dependencies?.rocketride?.status || 'UNKNOWN'}
            </span>
          </div>

          <div>
            <h3 className="text-base font-bold text-white">RocketRide Pipeline Engine</h3>
            <p className="text-xs text-gray-400 mt-1">Multi-step agent workflow execution platform</p>
          </div>

          <div className="text-xs font-mono text-gray-400 space-y-1 pt-2 border-t border-blue-900/30">
            <div>URL: {health?.dependencies?.rocketride?.url || 'http://localhost:5565'}</div>
            <div>Protocol: WebSocket/HTTP</div>
          </div>
        </div>

        {/* HydraDB Service Card */}
        <div className="glass-panel rounded-2xl p-6 border border-emerald-900/30 bg-emerald-950/10 space-y-4">
          <div className="flex items-center justify-between">
            <Database className="w-6 h-6 text-emerald-400" />
            <span className="text-xs font-mono bg-emerald-950 text-emerald-300 px-2.5 py-0.5 rounded border border-emerald-800/40">
              {health?.dependencies?.hydradb?.status || 'UNKNOWN'}
            </span>
          </div>

          <div>
            <h3 className="text-base font-bold text-white">HydraDB Graph Database</h3>
            <p className="text-xs text-gray-400 mt-1">SlateDB & OpenCypher graph storage layer</p>
          </div>

          <div className="text-xs font-mono text-gray-400 space-y-1 pt-2 border-t border-emerald-900/30">
            <div>URL: {health?.dependencies?.hydradb?.url || 'http://localhost:9090'}</div>
            <div>Dialect: OpenCypher</div>
          </div>
        </div>
      </div>
    </div>
  );
}
