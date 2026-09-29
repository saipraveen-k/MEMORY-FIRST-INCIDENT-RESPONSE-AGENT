"use client";

import { useState, useEffect } from "react";
import { fetchHealth } from "@/lib/api";
import { Database, Cpu, Brain, CheckCircle2, AlertCircle } from "lucide-react";

export default function Header() {
  const [health, setHealth] = useState<any>(null);

  useEffect(() => {
    fetchHealth().then(setHealth);
  }, []);

  const hindsightOk = health?.dependencies?.hindsight?.status !== "offline";
  const rocketrideOk = health?.dependencies?.rocketride?.status !== "offline";
  const hydradbOk = health?.dependencies?.hydradb?.status !== "offline";

  return (
    <header className="h-16 bg-[#0a0f1c] border-b border-[#1e2d4a] px-8 flex items-center justify-between sticky top-0 z-30 ml-64">
      <div className="flex items-center space-x-3">
        <span className="text-xs font-mono bg-blue-950/80 text-blue-400 border border-blue-800/50 px-2.5 py-1 rounded-md">
          PROD-EAST-1
        </span>
        <span className="text-gray-400 text-sm">
          Memory-First AI Incident Response Engine
        </span>
      </div>

      <div className="flex items-center space-x-4 text-xs font-mono">
        {/* Hindsight Health */}
        <div className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md border ${
          hindsightOk ? "bg-purple-950/40 text-purple-300 border-purple-800/40" : "bg-red-950/40 text-red-400 border-red-800/40"
        }`}>
          <Brain className="w-3.5 h-3.5" />
          <span>Hindsight: {hindsightOk ? "ACTIVE" : "OFFLINE"}</span>
        </div>

        {/* RocketRide Health */}
        <div className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md border ${
          rocketrideOk ? "bg-blue-950/40 text-blue-300 border-blue-800/40" : "bg-red-950/40 text-red-400 border-red-800/40"
        }`}>
          <Cpu className="w-3.5 h-3.5" />
          <span>RocketRide: {rocketrideOk ? "READY" : "OFFLINE"}</span>
        </div>

        {/* HydraDB Health */}
        <div className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md border ${
          hydradbOk ? "bg-emerald-950/40 text-emerald-300 border-emerald-800/40" : "bg-red-950/40 text-red-400 border-red-800/40"
        }`}>
          <Database className="w-3.5 h-3.5" />
          <span>HydraDB: {hydradbOk ? "CONNECTED" : "OFFLINE"}</span>
        </div>
      </div>
    </header>
  );
}
