import React from 'react';
import { Network, Bot, Activity, Plus, MoreVertical } from 'lucide-react';

export default function AgentOrchestrator() {
  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Agent Orchestrator</h1>
          <p className="text-sm text-zinc-500">Manage multi-agent execution graphs and prompts.</p>
        </div>
        <button className="hidden md:flex items-center gap-2 bg-sky-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-sky-700 transition-colors">
          <Plus className="w-4 h-4" />
          Create Agent
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-zinc-900 text-white p-6 rounded-2xl shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <Network className="w-6 h-6 text-sky-400" />
            <span className="text-xs font-bold bg-zinc-800 px-2 py-1 rounded-md text-zinc-300">Active</span>
          </div>
          <div>
            <h3 className="text-3xl font-black mb-1">12</h3>
            <p className="text-sm text-zinc-400">Running Agents</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <Activity className="w-6 h-6 text-emerald-500" />
            <span className="text-xs font-bold bg-emerald-100 px-2 py-1 rounded-md text-emerald-700">+24%</span>
          </div>
          <div>
            <h3 className="text-3xl font-black mb-1">8.4k</h3>
            <p className="text-sm text-zinc-500">Tasks Processed (24h)</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm flex flex-col justify-between md:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <Bot className="w-6 h-6 text-amber-500" />
            <button className="text-zinc-400 hover:text-zinc-600">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-1">Compliance Checker Bot</h3>
            <p className="text-sm text-zinc-500 mb-3">Evaluates transcripts against PCI and HIPAA guidelines.</p>
            <div className="w-full bg-zinc-100 rounded-full h-2">
              <div className="bg-amber-500 h-2 rounded-full w-3/4"></div>
            </div>
            <p className="text-xs text-zinc-400 mt-2 text-right">75% Load</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-zinc-100 bg-zinc-50/50 flex justify-between items-center">
          <h3 className="font-semibold text-sm">Execution Graph</h3>
          <button className="text-xs font-medium text-sky-600 hover:text-sky-700">View Full Graph</button>
        </div>
        <div className="p-8 flex flex-col items-center justify-center min-h-[300px] bg-zinc-50/30 border-dashed border-2 border-zinc-200 m-4 rounded-xl">
          <Network className="w-12 h-12 text-zinc-300 mb-4" />
          <p className="text-zinc-500 font-medium">Graph visualization placeholder</p>
          <p className="text-sm text-zinc-400 mt-1">Connects to LangGraph execution state</p>
        </div>
      </div>
    </div>
  );
}
