import React, { useState } from 'react';
import { Cpu, Loader2, Target, Sparkles, Copy, Check, Search, Database, Globe, ArrowRight, RefreshCw } from 'lucide-react';
import { PROMPTS } from '../constants';
import { generateContentJSON } from '../services/geminiService';
import { AnalysisResult, StrategyResult } from '../types';

interface Props {
  step1Data: AnalysisResult;
  onComplete: (data: StrategyResult) => void;
  onLog: (msg: string) => void;
}

export const Step2Strategy: React.FC<Props> = ({ step1Data, onComplete, onLog }) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<StrategyResult | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const handleGenerateStrategy = async () => {
    setLoading(true);
    onLog("Génération de la stratégie de recherche (CPC/Mots-clés/Orbit)...");
    try {
      const prompt = PROMPTS.step2_strategy.replace('{{PREVIOUS_JSON}}', JSON.stringify(step1Data));
      const data = await generateContentJSON<StrategyResult>(prompt);
      onLog("Stratégie générée avec succès.");
      setResult(data);
    } catch (err: any) {
      onLog(`Erreur: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  // VUE RÉSULTATS (Stratégie Générée)
  if (result) {
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Cpu className="text-purple-500" /> Stratégie Définie
            </h2>
            <p className="text-slate-400 text-sm mt-1">Examinez les axes de recherche et le prompt sémantique.</p>
          </div>
          <button 
            onClick={() => setResult(null)} 
            className="text-slate-500 hover:text-white flex items-center gap-2 text-sm transition-colors px-3 py-2 rounded-lg hover:bg-slate-800"
          >
            <RefreshCw size={14} /> Régénérer
          </button>
        </div>

        {/* --- NOUVEAU : PROMPT ORBIT / QUESTEL --- */}
        <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/10 border border-purple-500/30 rounded-xl p-6 relative overflow-hidden group shadow-lg shadow-purple-900/20">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                <Sparkles size={120} />
            </div>
            
            <div className="flex flex-col md:flex-row gap-6 relative z-10">
                <div className="flex-1 space-y-4">
                    <h3 className="text-purple-300 font-bold text-sm uppercase tracking-wider flex items-center gap-2">
                        <Sparkles size={16} className="text-purple-400" /> 
                        PROMPT IA (Orbit / Questel)
                    </h3>
                    <div className="bg-slate-950/60 p-5 rounded-lg border border-purple-500/20 font-serif italic text-lg leading-relaxed text-purple-100 shadow-inner">
                        "{result.orbit_prompt}"
                    </div>
                </div>
                
                <div className="flex md:flex-col justify-center">
                    <button
                        onClick={() => copyToClipboard(result.orbit_prompt, 'orbit')}
                        className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold text-xs uppercase tracking-wider transition-all shadow-lg ${
                            copied === 'orbit' 
                            ? 'bg-green-600 text-white transform scale-105' 
                            : 'bg-purple-600 hover:bg-purple-500 text-white hover:shadow-purple-500/25'
                        }`}
                    >
                        {copied === 'orbit' ? <Check size={16} /> : <Copy size={16} />}
                        {copied === 'orbit' ? "COPIÉ !" : "COPIER"}
                    </button>
                </div>
            </div>
        </div>

        {/* MOTS-CLÉS & CPC */}
        <div className="grid md:grid-cols-2 gap-6">
            {/* Mots-clés */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col">
                <h4 className="text-slate-400 font-bold text-xs uppercase mb-4 flex items-center gap-2">
                    <Globe size={14} /> Mots-Clés / Keywords
                </h4>
                <div className="grid grid-cols-2 gap-4 flex-1">
                    <div>
                        <span className="text-[10px] text-slate-500 uppercase font-bold mb-2 block">Français</span>
                        <div className="flex flex-wrap gap-2">
                            {result.keywords_fr?.map((kw, i) => (
                                <span key={i} className="bg-slate-800 text-slate-300 text-xs px-2 py-1 rounded border border-slate-700">{kw}</span>
                            ))}
                        </div>
                    </div>
                    <div>
                        <span className="text-[10px] text-slate-500 uppercase font-bold mb-2 block">English</span>
                        <div className="flex flex-wrap gap-2">
                            {result.keywords_en?.map((kw, i) => (
                                <span key={i} className="bg-slate-800 text-blue-200 text-xs px-2 py-1 rounded border border-slate-700">{kw}</span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Classifications */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                <h4 className="text-slate-400 font-bold text-xs uppercase mb-4 flex items-center gap-2">
                    <Search size={14} /> Classifications (CPC/IPC)
                </h4>
                <div className="flex flex-wrap gap-2">
                    {result.classifications?.map((cpc, i) => (
                        <span key={i} className="bg-blue-900/30 text-blue-300 font-mono text-sm px-3 py-1.5 rounded border border-blue-800/50 hover:bg-blue-900/50 cursor-default transition-colors">
                            {cpc}
                        </span>
                    ))}
                </div>
            </div>
        </div>

        {/* BOOLEAN QUERIES */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
             <h4 className="text-slate-400 font-bold text-xs uppercase mb-4 flex items-center gap-2">
                <Database size={14} /> Requêtes Booléennes
            </h4>
            <div className="space-y-3">
                {result.queries?.map((query, i) => (
                    <div key={i} className="flex gap-2 items-start group">
                        <code className="flex-1 bg-slate-950 p-3 rounded border border-slate-800 text-xs font-mono text-slate-300 break-all leading-relaxed hover:border-slate-600 transition-colors">
                            {query}
                        </code>
                        <button 
                            onClick={() => copyToClipboard(query, `q-${i}`)}
                            className="p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded transition-all"
                            title="Copier la requête"
                        >
                            {copied === `q-${i}` ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                        </button>
                    </div>
                ))}
            </div>
        </div>

        {/* ACTIONS */}
        <div className="pt-4 border-t border-slate-800">
          <button
            onClick={() => onComplete(result)}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-900/20 transition-all flex items-center justify-center gap-2 text-lg group"
          >
            Valider et Lancer la Confrontation
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    );
  }

  // VUE INITIALE (Rappel Step 1 & Action)
  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-baseline justify-between">
        <h2 className="text-2xl md:text-3xl font-bold text-white">2. Analyse & Stratégie</h2>
        <span className="text-slate-500 text-sm font-mono">{step1Data.title}</span>
      </div>

      {/* Triplet Display */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="bg-red-950/20 border border-red-900/50 p-4 rounded-xl">
            <h4 className="text-red-400 text-xs font-bold uppercase mb-2">Problème</h4>
            <p className="text-sm text-slate-300">{step1Data.triplet?.problem || "Non spécifié"}</p>
        </div>
        <div className="bg-blue-950/20 border border-blue-900/50 p-4 rounded-xl">
            <h4 className="text-blue-400 text-xs font-bold uppercase mb-2">Solution</h4>
            <p className="text-sm text-slate-300">{step1Data.triplet?.solution || "Non spécifié"}</p>
        </div>
        <div className="bg-green-950/20 border border-green-900/50 p-4 rounded-xl">
            <h4 className="text-green-400 text-xs font-bold uppercase mb-2">Résultat</h4>
            <p className="text-sm text-slate-300">{step1Data.triplet?.result || "Non spécifié"}</p>
        </div>
      </div>

      {/* FAST Analysis Table */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
        <div className="px-4 py-2 bg-slate-950 border-b border-slate-800 flex items-center gap-2">
            <Target size={14} className="text-purple-400"/>
            <span className="text-xs font-bold text-slate-400 uppercase">Analyse FAST (Function Analysis System Technique)</span>
        </div>
        <table className="w-full text-left text-sm">
            <thead className="bg-slate-900/50 text-slate-500 text-xs uppercase">
                <tr>
                    <th className="px-4 py-2">Fonction</th>
                    <th className="px-4 py-2">Moyen Physique</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
                {step1Data.fast_analysis?.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/30">
                        <td className="px-4 py-2 text-slate-300 font-medium">{item.function}</td>
                        <td className="px-4 py-2 text-slate-400 font-mono text-xs">{item.means}</td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>

      {/* Causal Chain */}
      <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
          <h4 className="text-slate-500 text-xs font-bold uppercase mb-2">Chaîne Causale</h4>
          <div className="flex flex-wrap items-center gap-2 text-sm text-slate-300">
              {step1Data.causal_chain?.map((link, i) => (
                  <React.Fragment key={i}>
                      <span className="bg-slate-800 px-2 py-1 rounded border border-slate-700">{link}</span>
                      {i < step1Data.causal_chain.length - 1 && <span className="text-slate-600">→</span>}
                  </React.Fragment>
              ))}
          </div>
      </div>

      <button
        onClick={handleGenerateStrategy}
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 md:py-4 rounded-xl shadow-lg shadow-blue-900/20 transition-all flex items-center justify-center gap-2 text-sm md:text-base"
      >
        {loading ? <Loader2 className="animate-spin" /> : <Cpu />}
        {loading ? "Génération de la stratégie..." : "Générer Stratégie & Prompt IA"}
      </button>
    </div>
  );
};