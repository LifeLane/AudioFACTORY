import React, { useState } from 'react';
import { Search, Filter, Play, FileText, BarChart2, CheckCircle, AlertTriangle } from 'lucide-react';
import { cn } from '../lib/utils';

export default function IntelligenceDashboard() {
  const [activeTab, setActiveTab] = useState('all');

  return (
    <div className="flex flex-col h-full md:flex-row max-w-[1600px] mx-auto">
      {/* Left Pane: Feed */}
      <div className="w-full md:w-[400px] lg:w-[480px] border-r border-zinc-200 bg-zinc-50 flex flex-col h-full">
        <div className="p-4 border-b border-zinc-200 bg-white sticky top-0 z-10 space-y-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Intelligence</h1>
            <p className="text-sm text-zinc-500">Call processing & scoring.</p>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input 
              type="text" 
              placeholder="Search transcripts, agents..." 
              className="w-full pl-9 pr-4 py-2 bg-zinc-100 border-transparent rounded-xl text-sm focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all outline-none"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {['all', 'high-risk', 'needs-review', 'scored'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors",
                  activeTab === tab 
                    ? "bg-zinc-900 text-white" 
                    : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                )}
              >
                {tab.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm hover:border-sky-300 hover:shadow-md transition-all cursor-pointer group">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    i % 3 === 0 ? "bg-rose-500" : i % 2 === 0 ? "bg-amber-500" : "bg-emerald-500"
                  )} />
                  <span className="text-xs font-semibold text-zinc-500">CALL-{1024 + i}</span>
                </div>
                <span className="text-xs text-zinc-400">10m ago</span>
              </div>
              
              <h3 className="font-medium text-sm mb-1 group-hover:text-sky-700 transition-colors">Customer Retention Inquiry</h3>
              <p className="text-xs text-zinc-500 line-clamp-2 mb-3">
                Agent handled the cancellation request well, but missed the mandatory compliance disclosure regarding the refund policy timeline.
              </p>

              <div className="flex items-center gap-4 text-xs font-medium">
                <div className="flex items-center gap-1 text-emerald-600">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Score: {85 - i * 5}</span>
                </div>
                {i % 3 === 0 && (
                  <div className="flex items-center gap-1 text-rose-600">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Risk Flag</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Pane: Detail View (Desktop only, Mobile uses bottom sheet conceptually) */}
      <div className="hidden md:flex flex-1 flex-col bg-white h-full overflow-hidden">
        <div className="p-6 border-b border-zinc-200 flex items-center justify-between bg-zinc-50/50">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-xl font-bold">CALL-1025</h2>
              <span className="px-2 py-0.5 bg-rose-100 text-rose-700 rounded-md text-xs font-bold uppercase tracking-wider">High Risk</span>
            </div>
            <p className="text-sm text-zinc-500">Agent: Sarah Jenkins • Duration: 14:22 • Engine: v1.5</p>
          </div>
          <div className="flex gap-2">
            <button className="p-2 bg-white border border-zinc-200 rounded-xl hover:bg-zinc-50 text-zinc-600 transition-colors">
              <BarChart2 className="w-5 h-5" />
            </button>
            <button className="p-2 bg-white border border-zinc-200 rounded-xl hover:bg-zinc-50 text-zinc-600 transition-colors">
              <FileText className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Audio Player Placeholder */}
          <div className="bg-zinc-900 rounded-2xl p-4 flex items-center gap-4 text-white shadow-lg">
            <button className="w-12 h-12 bg-white text-zinc-900 rounded-full flex items-center justify-center hover:scale-105 transition-transform">
              <Play className="w-5 h-5 ml-1" />
            </button>
            <div className="flex-1">
              <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full bg-sky-500 w-1/3 rounded-full relative">
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow" />
                </div>
              </div>
              <div className="flex justify-between text-xs text-zinc-400 mt-2 font-mono">
                <span>04:12</span>
                <span>14:22</span>
              </div>
            </div>
          </div>

          {/* Transcript & Evaluation Split */}
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <FileText className="w-4 h-4 text-sky-500" />
                Diarized Transcript
              </h3>
              <div className="space-y-4 text-sm">
                <div className="bg-zinc-50 p-3 rounded-xl rounded-tl-none border border-zinc-100">
                  <span className="text-xs font-bold text-sky-600 block mb-1">Agent (04:10)</span>
                  I understand your frustration, Mr. Smith. I can process that cancellation for you right now.
                </div>
                <div className="bg-sky-50 p-3 rounded-xl rounded-tr-none border border-sky-100 ml-8">
                  <span className="text-xs font-bold text-zinc-600 block mb-1 text-right">Customer (04:15)</span>
                  Finally. Yes, please do it immediately. I don't want to be charged again next week.
                </div>
                <div className="bg-zinc-50 p-3 rounded-xl rounded-tl-none border border-zinc-100">
                  <span className="text-xs font-bold text-sky-600 block mb-1">Agent (04:20)</span>
                  It's done. You won't be charged. Have a good day.
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-rose-500" />
                AI Evaluation (Engine v1.5)
              </h3>
              <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-rose-900">Compliance Violation</span>
                  <span className="text-xs font-bold bg-rose-200 text-rose-800 px-2 py-1 rounded-md">Critical</span>
                </div>
                <p className="text-sm text-rose-800">
                  Agent failed to read the mandatory refund timeline script ("Refunds may take 5-7 business days to process").
                </p>
              </div>

              <div className="bg-white border border-zinc-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Sentiment Shift</span>
                  <span className="text-xs font-bold bg-amber-100 text-amber-800 px-2 py-1 rounded-md">Negative → Neutral</span>
                </div>
                <p className="text-sm text-zinc-600">
                  Customer started highly agitated but de-escalated after immediate cancellation confirmation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
