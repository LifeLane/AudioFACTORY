import React from 'react';
import { Database, Settings, Layers, Zap } from 'lucide-react';

export default function EngineStudio() {
  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Engine Studio</h1>
          <p className="text-sm text-zinc-500">Configure AI pipelines, RAG chunks, and vector namespaces.</p>
        </div>
        <button className="hidden md:flex items-center gap-2 bg-zinc-900 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-zinc-800 transition-colors">
          <Zap className="w-4 h-4" />
          Deploy Engine
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm space-y-4">
          <div className="w-10 h-10 bg-rose-100 text-rose-600 rounded-xl flex items-center justify-center">
            <Database className="w-5 h-5" />
          </div>
          <h3 className="font-semibold">Knowledge Sources</h3>
          <p className="text-sm text-zinc-500">Manage connected databases, S3 buckets, and document ingestion pipelines.</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm space-y-4">
          <div className="w-10 h-10 bg-sky-100 text-sky-600 rounded-xl flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
          <h3 className="font-semibold">Vector Namespaces</h3>
          <p className="text-sm text-zinc-500">Isolate tenant embeddings and manage Chroma/Weaviate collections.</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm space-y-4">
          <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center">
            <Settings className="w-5 h-5" />
          </div>
          <h3 className="font-semibold">Pipeline Config</h3>
          <p className="text-sm text-zinc-500">Adjust chunking strategies, overlap, and embedding models (e.g., sentence-transformers).</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-zinc-100 bg-zinc-50/50">
          <h3 className="font-semibold text-sm">Active Engines</h3>
        </div>
        <div className="divide-y divide-zinc-100">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 flex items-center justify-between hover:bg-zinc-50 transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <div>
                  <p className="text-sm font-medium">Engine v{1.4 + i * 0.1}</p>
                  <p className="text-xs text-zinc-500">Tenant: Acme Corp • 14k Chunks</p>
                </div>
              </div>
              <button className="text-xs font-medium text-sky-600 hover:text-sky-700">Configure</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
