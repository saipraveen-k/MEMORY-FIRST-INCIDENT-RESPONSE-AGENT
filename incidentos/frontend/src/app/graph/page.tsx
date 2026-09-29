"use client";

import { useState, useEffect } from "react";
import { fetchGraph } from "@/lib/api";
import { GitFork, Database, Server, AlertTriangle, Cpu, Sparkles } from "lucide-react";

export default function GraphExplorerPage() {
  const [graphData, setGraphData] = useState<any>({ nodes: [], edges: [], total_nodes: 0, total_edges: 0 });
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGraph().then((res) => {
      setGraphData(res || { nodes: [], edges: [], total_nodes: 0, total_edges: 0 });
      setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center space-x-3">
            <GitFork className="w-7 h-7 text-emerald-400" />
            <span>HydraDB Graph Knowledge Explorer</span>
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Structured relationship graph representing Incidents, Services, Dependencies, Deployments, and Root Causes.
          </p>
        </div>

        <div className="flex items-center space-x-4 text-xs font-mono">
          <div className="bg-emerald-950/40 text-emerald-300 border border-emerald-800/40 px-3 py-1.5 rounded-xl">
            Nodes: {graphData.total_nodes}
          </div>
          <div className="bg-blue-950/40 text-blue-300 border border-blue-800/40 px-3 py-1.5 rounded-xl">
            Edges: {graphData.total_edges}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive Node Graph Map Representation (2 cols) */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-6 border border-emerald-900/30 bg-emerald-950/10 min-h-[450px] relative flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-mono text-emerald-400 mb-4">
            <span>OPENCYPHER TOPOLOGY VISUALIZER</span>
            <span className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>LIVE HYDRADB GRAPH</span>
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 my-auto">
            {graphData.nodes?.map((node: any) => {
              const isSelected = selectedNode?.id === node.id;
              return (
                <div
                  key={node.id}
                  onClick={() => setSelectedNode(node)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? "bg-emerald-600/20 border-emerald-400 shadow-lg glow-emerald"
                      : "bg-[#0d1726] border-[#1b2b45] hover:border-emerald-500/50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
                      :{node.label || 'Node'}
                    </span>
                    <Server className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div className="font-bold text-white text-sm truncate">{node.id}</div>
                  <div className="text-[11px] text-gray-400 truncate mt-1">
                    {node.properties?.name || node.properties?.title || node.id}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-center text-xs text-gray-500 mt-6">
            Click on any node to inspect OpenCypher node attributes and relationship edges.
          </div>
        </div>

        {/* Node & Relationship Inspector Panel (1 col) */}
        <div className="glass-panel rounded-2xl p-6 border border-[#1e2d4a] space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <Database className="w-5 h-5 text-emerald-400" />
            <span>Node Inspector</span>
          </h2>

          {selectedNode ? (
            <div className="space-y-4 text-xs font-mono">
              <div className="p-3 rounded-xl bg-[#0e1728] border border-[#1e2f4f] space-y-1">
                <div className="text-gray-400 text-[10px]">Node ID:</div>
                <div className="text-emerald-300 font-bold text-sm">{selectedNode.id}</div>
              </div>

              <div className="p-3 rounded-xl bg-[#0e1728] border border-[#1e2f4f] space-y-1">
                <div className="text-gray-400 text-[10px]">Entity Label:</div>
                <div className="text-white font-semibold">:{selectedNode.label}</div>
              </div>

              <div className="p-3 rounded-xl bg-[#0e1728] border border-[#1e2f4f] space-y-2">
                <div className="text-gray-400 text-[10px]">Properties:</div>
                <pre className="text-gray-300 overflow-x-auto p-2 bg-[#070c14] rounded">
                  {JSON.stringify(selectedNode.properties, null, 2)}
                </pre>
              </div>
            </div>
          ) : (
            <div className="text-center py-16 text-gray-500 text-xs">
              Select a node from the topology visualizer to inspect graph properties.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
