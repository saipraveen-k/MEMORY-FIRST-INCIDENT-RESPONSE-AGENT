"use client";

import { useState } from "react";
import { runDemoStep, resetDemo } from "@/lib/api";
import { PlayCircle, RotateCcw, Brain, GitFork, ShieldCheck, Sparkles, CheckCircle2, ArrowRight } from "lucide-react";

export default function DemoPage() {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [stepData, setStepData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const executeStep = async (stepNum: number) => {
    setLoading(true);
    try {
      const data = await runDemoStep(stepNum);
      setCurrentStep(stepNum);
      setStepData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    await resetDemo();
    setCurrentStep(1);
    setStepData(null);
  };

  return (
    <div className="space-y-8">
      {/* Demo Header */}
      <div className="glass-panel rounded-2xl p-6 border border-purple-900/40 bg-purple-950/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-purple-400 font-mono text-xs mb-1">
            <Sparkles className="w-4 h-4" />
            <span>4-DAY DETERMINISTIC MEMORY LEARNING NARRATIVE</span>
          </div>
          <h1 className="text-2xl font-bold text-white">
            "Most incident agents analyze what is happening now. IncidentOS also remembers what happened before."
          </h1>
          <p className="text-sm text-gray-300 mt-1">
            Observe the system retain engineer feedback on Day 1/3 and automatically change its recommendation on Day 4.
          </p>
        </div>

        <button
          onClick={handleReset}
          className="flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 text-gray-200 font-medium px-4 py-2.5 rounded-xl border border-gray-700 text-sm transition-all flex-shrink-0"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reset Demo</span>
        </button>
      </div>

      {/* Step Selector Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {[
          { step: 1, day: "DAY 1", title: "Initial Incident & Retention", desc: "Rollback feedback stored" },
          { step: 2, day: "DAY 2", title: "Memory Recall Active", desc: "Recalls Day 1 experience" },
          { step: 3, day: "DAY 3", title: "Operational Rule Captured", desc: "'Check active transactions'" },
          { step: 4, day: "DAY 4", title: "BEFORE vs AFTER PROOF", desc: "Agent recommendation changes!" }
        ].map((item) => {
          const isActive = currentStep === item.step;
          return (
            <button
              key={item.step}
              onClick={() => executeStep(item.step)}
              className={`p-4 rounded-xl border text-left transition-all ${
                isActive
                  ? "bg-gradient-to-br from-purple-900/40 to-indigo-900/40 border-purple-500 shadow-lg glow-purple"
                  : "bg-[#0d1624] border-[#1b2b45] hover:border-gray-600"
              }`}
            >
              <div className="flex items-center justify-between text-xs font-mono mb-1">
                <span className={`font-bold ${isActive ? "text-purple-300" : "text-gray-400"}`}>
                  {item.day}
                </span>
                {isActive && <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-spin" />}
              </div>
              <div className="font-bold text-white text-sm">{item.title}</div>
              <div className="text-[11px] text-gray-400 mt-1">{item.desc}</div>
            </button>
          );
        })}
      </div>

      {/* Step Execution Result Card */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh] text-gray-400 font-mono text-sm space-x-3">
          <Sparkles className="w-5 h-5 text-purple-400 animate-spin" />
          <span>Executing Day {currentStep} Scenario...</span>
        </div>
      ) : stepData ? (
        <div className="space-y-6">
          {/* Key Takeaway Banner */}
          <div className="p-4 rounded-xl bg-purple-950/40 border border-purple-800/50 text-purple-200 text-sm flex items-center space-x-3">
            <CheckCircle2 className="w-6 h-6 text-purple-400 flex-shrink-0" />
            <div>
              <span className="font-bold text-white">DAY {stepData.day} TAKEAWAY: </span>
              <span>{stepData.takeaway}</span>
            </div>
          </div>

          {/* Incident + Agent Output Details */}
          {stepData.agent_recommendation && (
            <div className="glass-panel rounded-2xl p-6 border border-blue-900/40 bg-blue-950/10 space-y-6">
              <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                <Brain className="w-5 h-5 text-purple-400" />
                <span>Day {stepData.day} Agent Analysis & Recommendation</span>
              </h2>

              <div className="p-4 rounded-xl bg-[#0c1629] border border-[#1b2b4d] text-sm text-gray-200">
                <span className="font-bold text-blue-400">Agent Summary: </span>
                {stepData.agent_recommendation.summary}
              </div>

              {stepData.agent_recommendation.historical_lessons?.length > 0 && (
                <div className="p-4 rounded-xl bg-purple-950/40 border border-purple-700/50 text-xs space-y-2">
                  <div className="font-bold text-purple-300">
                    Recalled & Applied Historical Operational Lessons (Hindsight):
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-purple-200 font-medium">
                    {stepData.agent_recommendation.historical_lessons.map((les: string, idx: number) => (
                      <li key={idx}>{les}</li>
                    ))}
                  </ul>
                </div>
              )}

              {stepData.agent_recommendation.safety_notes?.length > 0 && (
                <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-800/40 text-xs space-y-2">
                  <div className="font-bold text-amber-300">Safety & Risk Analysis Notes:</div>
                  <ul className="list-disc list-inside space-y-1 text-amber-200">
                    {stepData.agent_recommendation.safety_notes.map((note: string, idx: number) => (
                      <li key={idx}>{note}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-20 text-gray-500 text-sm">
          Click "DAY 1" or "Launch Learning Demo" to begin the step-by-step memory demonstration.
        </div>
      )}
    </div>
  );
}
