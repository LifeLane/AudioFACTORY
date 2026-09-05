import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { cn } from '../lib/utils';
import { LayoutDashboard, Settings, Bot, Plus, X, Search, Bell, User } from 'lucide-react';

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const { activeModule, setActiveModule, isFabOpen, setFabOpen } = useAppStore();

  const navItems = [
    { id: 'dashboard', label: 'Intelligence', icon: LayoutDashboard },
    { id: 'orchestrator', label: 'Agents', icon: Bot },
    { id: 'engine', label: 'Engine', icon: Settings },
  ];

  return (
    <div className="flex flex-col md:flex-row h-screen w-full bg-zinc-50 overflow-hidden font-sans text-zinc-900">
      
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-zinc-900 text-zinc-400 border-r border-zinc-800 z-20">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-sky-500 rounded-xl flex items-center justify-center text-white font-black">B</div>
          <span className="font-bold text-white tracking-tight">BPO Console</span>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeModule === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveModule(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm",
                  isActive 
                    ? "bg-zinc-800 text-white shadow-sm" 
                    : "hover:bg-zinc-800/50 hover:text-zinc-200"
                )}
              >
                <Icon className={cn("w-5 h-5", isActive ? "text-sky-400" : "text-zinc-500")} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="p-4 mt-auto">
          <div className="bg-zinc-800 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-zinc-700 rounded-full flex items-center justify-center text-white">
              <User className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">Admin User</p>
              <p className="text-xs text-zinc-400 truncate">admin@bpo.ai</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 relative h-full">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 bg-white border-b border-zinc-200 z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-zinc-900 rounded-xl flex items-center justify-center text-white font-black">B</div>
            <span className="font-bold tracking-tight">BPO Console</span>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2 text-zinc-500 hover:bg-zinc-100 rounded-full">
              <Search className="w-5 h-5" />
            </button>
            <button className="p-2 text-zinc-500 hover:bg-zinc-100 rounded-full relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="w-8 h-8 bg-zinc-200 rounded-full overflow-hidden">
               <User className="w-full h-full p-1.5 text-zinc-500" />
            </div>
          </div>
        </header>

        {/* Desktop Header (Optional, minimal) */}
        <header className="hidden md:flex items-center justify-between p-4 px-8 bg-white/50 backdrop-blur-md border-b border-zinc-200 z-10 sticky top-0">
           <h2 className="text-xl font-bold capitalize">{activeModule.replace('-', ' ')}</h2>
           <div className="flex items-center gap-4">
             <div className="relative">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
               <input 
                 type="text" 
                 placeholder="Global search..." 
                 className="pl-9 pr-4 py-2 bg-white border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 w-64 transition-all"
               />
             </div>
             <button className="p-2 text-zinc-500 hover:bg-zinc-100 rounded-full relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
             </button>
           </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto pb-24 md:pb-0 relative z-0">
          {children}
        </div>

        {/* FAB (Floating Action Button) */}
        <div className="fixed bottom-20 right-4 md:bottom-8 md:right-8 z-50">
          <div className="relative">
            {/* FAB Menu (Expands upwards) */}
            <div className={cn(
              "absolute bottom-full right-0 mb-4 flex flex-col gap-3 items-end transition-all duration-300 origin-bottom",
              isFabOpen ? "scale-100 opacity-100" : "scale-0 opacity-0 pointer-events-none"
            )}>
              <button className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl shadow-lg border border-zinc-200 hover:bg-zinc-50 transition-colors whitespace-nowrap">
                <span className="font-medium text-sm">Upload Audio</span>
                <div className="w-8 h-8 bg-sky-100 text-sky-600 rounded-full flex items-center justify-center">
                  <LayoutDashboard className="w-4 h-4" />
                </div>
              </button>
              <button className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl shadow-lg border border-zinc-200 hover:bg-zinc-50 transition-colors whitespace-nowrap">
                <span className="font-medium text-sm">New Agent</span>
                <div className="w-8 h-8 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center">
                  <Bot className="w-4 h-4" />
                </div>
              </button>
              <button className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl shadow-lg border border-zinc-200 hover:bg-zinc-50 transition-colors whitespace-nowrap">
                <span className="font-medium text-sm">Configure Engine</span>
                <div className="w-8 h-8 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center">
                  <Settings className="w-4 h-4" />
                </div>
              </button>
            </div>

            {/* Main FAB */}
            <button 
              onClick={() => setFabOpen(!isFabOpen)}
              className={cn(
                "w-14 h-14 rounded-2xl shadow-xl flex items-center justify-center transition-all duration-300",
                isFabOpen ? "bg-zinc-900 text-white rotate-45" : "bg-sky-500 text-white hover:bg-sky-600 hover:scale-105"
              )}
            >
              <Plus className="w-6 h-6" />
            </button>
          </div>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-zinc-200 px-6 py-3 flex justify-between items-center z-40 pb-safe">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeModule === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveModule(item.id)}
              className="flex flex-col items-center gap-1 p-2"
            >
              <div className={cn(
                "p-1.5 rounded-xl transition-colors",
                isActive ? "bg-sky-100 text-sky-600" : "text-zinc-400"
              )}>
                <Icon className={cn("w-6 h-6", isActive ? "fill-sky-100" : "")} />
              </div>
              <span className={cn(
                "text-[10px] font-bold tracking-wide",
                isActive ? "text-sky-600" : "text-zinc-400"
              )}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
      
      {/* Overlay for FAB */}
      {isFabOpen && (
        <div 
          className="fixed inset-0 bg-zinc-900/20 backdrop-blur-sm z-40 transition-opacity"
          onClick={() => setFabOpen(false)}
        />
      )}
    </div>
  );
}
