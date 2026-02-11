import React, { useRef, useEffect, useState } from 'react';
import { AppStep, LogEntry } from '../types';
import { FileText, Cpu, Scale, FileOutput, Terminal, X, Menu } from 'lucide-react';

interface LayoutProps {
  currentStep: AppStep;
  logs: LogEntry[];
  children: React.ReactNode;
  onStepChange: (step: AppStep) => void;
  enabledSteps: AppStep[];
}

const steps = [
  { id: AppStep.ANALYZE, label: '1. Analyse', icon: FileText },
  { id: AppStep.STRATEGY, label: '2. Stratégie', icon: Cpu },
  { id: AppStep.CONFRONTATION, label: '3. Comparer', icon: Scale },
  { id: AppStep.REPORT, label: '4. Rapport', icon: FileOutput },
];

export const Layout: React.FC<LayoutProps> = ({ currentStep, logs, onStepChange, enabledSteps, children }) => {
  const logEndRef = useRef<HTMLDivElement>(null);
  const [showMobileLogs, setShowMobileLogs] = useState(false);

  useEffect(() => {
    if (showMobileLogs) {
        logEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs, showMobileLogs]);

  return (
    <div className="flex h-screen w-full bg-slate-950 text-slate-200 overflow-hidden">
      {/* DESKTOP SIDEBAR */}
      <div className="hidden md:flex w-80 bg-slate-900 border-r border-slate-800 flex-col p-6 gap-6 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-blue-400 tracking-tight flex items-center gap-2">
            PatentAI <span className="text-xs bg-slate-800 text-blue-200 px-2 py-0.5 rounded-full border border-slate-700">V4.0</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">Powered by Gemini 3 Flash</p>
        </div>

        <nav className="flex-1 space-y-2">
          {steps.map((s) => {
            const Icon = s.icon;
            const isActive = currentStep >= s.id;
            const isCurrent = currentStep === s.id;
            const isEnabled = enabledSteps.includes(s.id);
            
            return (
              <button
                key={s.id}
                onClick={() => isEnabled && onStepChange(s.id)}
                disabled={!isEnabled}
                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200 border text-left ${
                  isCurrent 
                    ? 'bg-blue-950/40 border-blue-500/50 text-blue-200' 
                    : isActive 
                      ? 'bg-green-950/20 border-green-800/50 text-green-400'
                      : isEnabled
                        ? 'border-transparent text-slate-500 hover:bg-slate-800/50 hover:text-slate-300 cursor-pointer'
                        : 'border-transparent text-slate-700 opacity-50 cursor-not-allowed'
                }`}
              >
                <Icon size={18} className={isCurrent ? "text-blue-400" : isActive ? "text-green-500" : ""} />
                <span className="font-medium">{s.label}</span>
                {isActive && !isCurrent && <div className="ml-auto w-2 h-2 rounded-full bg-green-500" />}
              </button>
            );
          })}
        </nav>

        {/* Desktop Logs Console */}
        <div className="h-48 flex flex-col">
           <div className="flex items-center gap-2 text-xs text-slate-500 mb-2 uppercase font-bold tracking-wider">
             <Terminal size={12} />
             System Logs
           </div>
           <div className="flex-1 bg-slate-950 rounded-lg border border-slate-800 p-3 overflow-y-auto font-mono text-xs">
              {logs.length === 0 && <span className="text-slate-600 italic">System ready...</span>}
              {logs.map((log, i) => (
                <div key={i} className="mb-1.5 break-words">
                  <span className="text-slate-500">[{log.timestamp}]</span>{' '}
                  <span className="text-green-400">{log.message}</span>
                </div>
              ))}
              <div ref={logEndRef} />
           </div>
        </div>
      </div>

      {/* MOBILE & MAIN CONTAINER */}
      <div className="flex-1 flex flex-col h-full relative w-full">
        
        {/* MOBILE HEADER */}
        <header className="md:hidden h-14 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 shrink-0 z-20 shadow-sm">
           <div className="flex items-center gap-2">
             <span className="font-bold text-blue-400 text-lg">PatentAI</span>
             <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 rounded border border-slate-700">V4.0</span>
           </div>
           <button 
             onClick={() => setShowMobileLogs(true)}
             className="p-2 text-slate-400 hover:text-white relative"
           >
             <Terminal size={20} />
             {/* Small indicator dot if there are new logs (simplified logic: just show if logs exist) */}
             {logs.length > 0 && <span className="absolute top-2 right-1.5 w-2 h-2 bg-green-500 rounded-full border border-slate-900"></span>}
           </button>
        </header>

        {/* MAIN CONTENT */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8 scroll-smooth">
          <div className="max-w-4xl mx-auto h-full">
             {children}
          </div>
        </main>

        {/* MOBILE BOTTOM NAV */}
        <nav className="md:hidden h-16 bg-slate-900 border-t border-slate-800 flex items-center justify-around px-2 shrink-0 z-20 pb-1">
           {steps.map((s) => {
              const Icon = s.icon;
              const isActive = currentStep >= s.id;
              const isCurrent = currentStep === s.id;
              const isEnabled = enabledSteps.includes(s.id);
              // Clean label for mobile (remove number)
              const mobileLabel = s.label.split('. ')[1] || s.label;

              return (
                <button 
                  key={s.id} 
                  onClick={() => isEnabled && onStepChange(s.id)}
                  disabled={!isEnabled}
                  className={`flex flex-col items-center justify-center gap-1 p-1 w-16 transition-colors relative ${
                    isCurrent ? 'text-blue-400' : isActive ? 'text-green-500' : isEnabled ? 'text-slate-400' : 'text-slate-800 cursor-not-allowed'
                  }`}
                >
                   <Icon size={20} strokeWidth={isCurrent ? 2.5 : 2} />
                   <span className="text-[10px] font-medium leading-none">{mobileLabel}</span>
                   {isCurrent && <div className="w-1 h-1 bg-blue-400 rounded-full absolute -bottom-0.5"></div>}
                </button>
              )
           })}
        </nav>

        {/* MOBILE LOGS DRAWER */}
        {showMobileLogs && (
           <div className="absolute inset-0 z-50 flex flex-col md:hidden">
              <div className="flex-1 bg-black/60 backdrop-blur-sm" onClick={() => setShowMobileLogs(false)}></div>
              <div className="bg-slate-900 border-t border-slate-700 h-2/3 flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-300">
                  <div className="flex items-center justify-between p-4 border-b border-slate-800">
                      <span className="font-bold flex items-center gap-2 text-slate-200"><Terminal size={16} className="text-green-400"/> System Logs</span>
                      <button onClick={() => setShowMobileLogs(false)} className="p-2 bg-slate-800 hover:bg-slate-700 rounded-full text-slate-300 transition-colors"><X size={18}/></button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 font-mono text-xs space-y-3 bg-slate-950">
                      {logs.length === 0 && <span className="text-slate-600 italic">No logs yet...</span>}
                      {logs.map((log, i) => (
                        <div key={i} className="break-words border-b border-slate-900/50 pb-2 last:border-0">
                          <span className="text-slate-500 block text-[10px] mb-1 font-sans">{log.timestamp}</span>
                          <span className="text-green-400 leading-relaxed">{log.message}</span>
                        </div>
                      ))}
                      <div ref={logEndRef} />
                  </div>
              </div>
           </div>
        )}
      </div>
    </div>
  );
};