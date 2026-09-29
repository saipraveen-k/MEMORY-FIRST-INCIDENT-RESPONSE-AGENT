"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  fetchIncident,
  analyzeIncident,
  submitFeedback,
  resolveIncident
} from "@/lib/api";
import {
  AlertTriangle,
  Brain,
  GitFork,
  Activity,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Play,
  RotateCcw,
  Send,
  Sparkles,
  HelpCircle,
  Lock
} from "lucide-react";

export default function IncidentDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const [incident, setIncident] = useState<any>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Feedback state
  const [rating, setRating] = useState("YES");
  const [lessonText, setLessonText] = useState("");
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [simulatedAction, setSimulatedAction] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    loadData();
  }, [id]);

  const loadData = async () => {
    setLoading(true);
    try {
      const inc = await fetchIncident(id);
      setIncident(inc);
      if (inc.agent_output) {
        setAnalysis(inc.agent_output);
      } else {
        const anal = await analyzeIncident(id);
        setAnalysis(anal);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lessonText.trim()) return;
    try {
      await submitFeedback(id, {
        useful: rating,
        lesson: lessonText
      });
      setFeedbackSubmitted(true);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading || !incident) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-gray-400 font-mono text-sm space-x-3">
        <Sparkles className="w-5 h-5 text-blue-400 animate-spin" />
        <span>Executing IncidentOS Reasoning Pipeline...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="glass-panel rounded-2xl p-6 border border-[#1e2d4a]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <span className={`px-3 py-1 rounded text-xs font-bold font-mono ${
                incident.severity === "CRITICAL" ? "bg-red-950 text-red-400 border border-red-800/50" :
                incident.severity === "HIGH" ? "bg-amber-950 text-amber-400 border border-amber-800/50" :
                "bg-blue-950 text-blue-400 border border-blue-800/50"
              }`}>
                {incident.severity}
              </span>
              <span className="font-mono text-xs text-gray-400">#{incident.id}</span>
              <span className="text-xs font-mono bg-blue-950/60 text-blue-300 px-3 py-1 rounded border border-blue-900/40">
                Service: {incident.service}
              </span>
              <span className="text-xs font-mono bg-emerald-950/60 text-emerald-300 px-3 py-1 rounded border border-emerald-900/40">
                Status: {incident.status}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white">{incident.title}</h1>
            <p className="text-sm text-gray-300">{incident.description}</p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => resolveIncident(id).then(loadData)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-4 py-2.5 rounded-xl text-sm transition-all shadow-md glow-emerald flex items-center space-x-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Mark Resolved</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: HydraDB Context + Hindsight Memories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* HydraDB Graph Context */}
        <div className="glass-panel rounded-2xl p-6 border border-emerald-900/30 bg-emerald-950/10 space-y-4">
          <div className="flex items-center space-x-2 text-emerald-400 font-bold text-sm uppercase tracking-wider">
            <GitFork className="w-5 h-5" />
            <span>HydraDB Graph Knowledge</span>
          </div>

          {analysis?.graph_context?.[0] && (
            <div className="space-y-3 text-xs font-mono">
              <div className="p-3 rounded-xl bg-[#0d1624] border border-[#1b2a47]">
                <div className="text-gray-400 text-[11px]">Topology Dependency Path:</div>
                <div className="text-emerald-300 font-bold mt-1">
                  {analysis.graph_context[0].topology_path}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#0d1624] border border-[#1b2a47] space-y-1">
                <div className="text-gray-400 text-[11px]">Active Deployment:</div>
                <div className="text-white font-semibold">
                  {incident.deployment_version || 'v3.2'}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Hindsight Memory Recall */}
        <div className="glass-panel rounded-2xl p-6 border border-purple-900/30 bg-purple-950/10 space-y-4">
          <div className="flex items-center space-x-2 text-purple-400 font-bold text-sm uppercase tracking-wider">
            <Brain className="w-5 h-5" />
            <span>Hindsight Recalled Memories</span>
          </div>

          <div className="space-y-2">
            {analysis?.memory_context?.map((mem: any, idx: number) => (
              <div key={idx} className="p-3 rounded-xl bg-[#130d24] border border-[#271b47] text-xs space-y-1">
                <div className="flex items-center justify-between text-[10px] text-purple-400 font-mono">
                  <span>Relevance: {Math.round((mem.relevance_score || 0.9) * 100)}%</span>
                  <span>{mem.type || 'EXPERIENCE'}</span>
                </div>
                <p className="text-purple-100 font-medium">"{mem.content || mem.text}"</p>
              </div>
            ))}

            {(!analysis?.memory_context || analysis.memory_context.length === 0) && (
              <div className="text-xs text-gray-500 py-4 text-center">
                No previous memories matching this incident pattern.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Agent Recommendation Output */}
      {analysis && (
        <div className="glass-panel rounded-2xl p-6 border border-blue-900/40 bg-blue-950/10 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Activity className="w-6 h-6 text-blue-400" />
              <div>
                <h2 className="text-lg font-bold text-white">Agent Recommendation & Risk Analysis</h2>
                <p className="text-xs text-blue-300 font-mono">Synthesized via RocketRide Reasoning Engine</p>
              </div>
            </div>

            <div className="flex items-center space-x-2 bg-blue-900/40 border border-blue-700/50 px-3 py-1 rounded-lg text-xs font-mono text-blue-300">
              <Lock className="w-3.5 h-3.5" />
              <span>Safety Gate: HUMAN APPROVAL REQUIRED</span>
            </div>
          </div>

          {/* Agent Summary Box */}
          <div className="p-4 rounded-xl bg-[#0c1629] border border-[#1b2b4d] text-sm text-gray-200">
            <span className="font-bold text-blue-400">Agent Summary: </span>
            {analysis.summary}
          </div>

          {/* Applied Historical Lessons (If Any) */}
          {analysis.historical_lessons?.length > 0 && (
            <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-800/40 text-xs space-y-2">
              <div className="font-bold text-purple-300 flex items-center space-x-2">
                <Brain className="w-4 h-4" />
                <span>Incorporated Historical Operational Lessons:</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-purple-200">
                {analysis.historical_lessons.map((les: string, idx: number) => (
                  <li key={idx}>{les}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Recommended Actions */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider text-gray-400">
              Recommended Remediation Actions
            </h3>

            <div className="grid grid-cols-1 gap-4">
              {analysis.recommended_actions?.map((act: any) => (
                <div
                  key={act.id}
                  className="p-4 rounded-xl bg-[#0e172a] border border-[#1e2e4a] space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold font-mono ${
                        act.risk_level === "HIGH" ? "bg-red-950 text-red-400 border border-red-800/50" :
                        act.risk_level === "MEDIUM" ? "bg-amber-950 text-amber-400 border border-amber-800/50" :
                        "bg-emerald-950 text-emerald-400 border border-emerald-800/50"
                      }`}>
                        {act.risk_level} RISK
                      </span>
                      <span className="font-bold text-white text-sm">{act.description}</span>
                    </div>

                    <button
                      onClick={() => setSimulatedAction(act.simulated_outcome || "Action simulated successfully.")}
                      className="flex items-center space-x-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 px-3 py-1 rounded-lg text-xs font-medium transition-all"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>Simulate Action</span>
                    </button>
                  </div>

                  <p className="text-xs text-gray-300">{act.rationale}</p>

                  <div className="p-2.5 rounded bg-[#070b14] font-mono text-xs text-green-400 border border-gray-800">
                    $ {act.command_preview}
                  </div>
                </div>
              ))}
            </div>

            {/* Simulation Result Alert */}
            {simulatedAction && (
              <div className="p-4 rounded-xl bg-blue-950/40 border border-blue-700/50 text-xs text-blue-200 space-y-1">
                <div className="font-bold flex items-center space-x-2 text-blue-400">
                  <Sparkles className="w-4 h-4" />
                  <span>Action Simulation Result [SIMULATION ONLY]:</span>
                </div>
                <p>{simulatedAction}</p>
              </div>
            )}
          </div>

          {/* Explanation WHY */}
          {analysis.explanation_why && (
            <div className="p-4 rounded-xl bg-[#09101f] border border-[#172540] text-xs space-y-2">
              <div className="font-bold text-gray-300">WHY THIS RECOMMENDATION</div>
              <div className="text-gray-400">{analysis.explanation_why.conclusion}</div>
            </div>
          )}
        </div>
      )}

      {/* Feedback Loop Section */}
      <div className="glass-panel rounded-2xl p-6 border border-[#1e2d4a] space-y-4">
        <div className="flex items-center space-x-3">
          <Brain className="w-6 h-6 text-purple-400" />
          <div>
            <h2 className="text-lg font-bold text-white">Engineer Feedback & Memory Retention Loop</h2>
            <p className="text-xs text-gray-400">Store durable operational lessons into Hindsight long-term agent memory</p>
          </div>
        </div>

        {feedbackSubmitted ? (
          <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-800/50 text-xs text-emerald-300 flex items-center space-x-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <div>
              <div className="font-bold">Feedback Recorded & Retained in Hindsight!</div>
              <div>The agent has stored this lesson into its long-term memory bank and will incorporate it into future incident responses.</div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleFeedback} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-2">
                Was this recommendation useful?
              </label>
              <div className="flex space-x-3">
                {["YES", "PARTIALLY", "NO"].map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setRating(opt)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                      rating === opt
                        ? "bg-purple-600 text-white border-purple-500 shadow-md"
                        : "bg-[#0e1626] text-gray-400 border-[#1f2e4d] hover:bg-gray-800"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-2">
                What operational lesson should the agent remember for next time?
              </label>
              <textarea
                rows={3}
                value={lessonText}
                onChange={(e) => setLessonText(e.target.value)}
                placeholder="e.g. Do not restart the payment service before checking active transactions."
                className="w-full bg-[#0e1626] border border-[#1f2e4d] rounded-xl p-3 text-xs text-white focus:outline-none focus:border-purple-500"
                required
              />
            </div>

            <button
              type="submit"
              className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium px-5 py-2.5 rounded-xl text-xs transition-all shadow-lg glow-purple"
            >
              <Send className="w-4 h-4" />
              <span>Retain Lesson in Hindsight Memory</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
