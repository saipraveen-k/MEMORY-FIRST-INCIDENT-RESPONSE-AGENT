"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  AlertTriangle,
  BrainCircuit,
  GitFork,
  Activity,
  PlayCircle,
  Settings,
  ShieldCheck
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/incidents", label: "Incidents", icon: AlertTriangle },
  { href: "/memory", label: "Hindsight Memory", icon: BrainCircuit },
  { href: "/graph", label: "HydraDB Graph", icon: GitFork },
  { href: "/agent", label: "RocketRide Agent", icon: Activity },
  { href: "/demo", label: "Demo Learning", icon: PlayCircle },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-[#0c121e] border-r border-[#1e2d4a] flex flex-col h-screen fixed left-0 top-0 z-40">
      {/* Brand Header */}
      <div className="p-5 border-b border-[#1e2d4a] flex items-center space-x-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg glow-blue">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-bold text-lg text-white tracking-wide leading-none">IncidentOS</h1>
          <p className="text-xs text-blue-400 font-mono mt-1">Memory-First IR</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 px-3 py-2">
          Command Center
        </div>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? "bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-sm"
                  : "text-gray-400 hover:text-white hover:bg-gray-800/50"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-blue-400" : "text-gray-500"}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* System Status Footer */}
      <div className="p-4 border-t border-[#1e2d4a] bg-[#090e18]">
        <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
          <span>Agent Status</span>
          <span className="flex items-center space-x-1 text-emerald-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>ONLINE</span>
          </span>
        </div>
        <div className="text-[11px] text-gray-500 font-mono">
          Hindsight • RocketRide • HydraDB
        </div>
      </div>
    </aside>
  );
}
