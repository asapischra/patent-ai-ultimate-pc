import React, { useState } from 'react';
import { Scale, Upload, FileText, Loader2, Trash2, Search, CheckCircle, XCircle, AlertTriangle, ArrowRight, RefreshCw, BookOpen } from 'lucide-react';
import { PROMPTS } from '../constants';
import { generateContentJSON } from '../services/geminiService';
import { readFileContent } from '../services/fileService';
import { AnalysisResult, StrategyResult, ComparisonResult, PriorDoc } from '../types';

interface Props {
  step1Data: AnalysisResult;
  step2Data: StrategyResult;
  onComplete: (data: ComparisonResult) => void;
  onLog: (msg: string) => void;
}

export const Step3Compare: React.FC<Props> = ({ step1Data, step2Data, onComplete, onLog }) => {
  const [priorDocs, setPriorDocs] = useState<PriorDoc[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ComparisonResult | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    onLog(`Ajout antériorité: ${file.name}`);
    try {
      const text = await readFileContent(file);
      setPriorDocs(prev => [...prev, { name: file.name, text }]);
      onLog(`Document ajouté (${text.length} chars)`);
    } catch (err: any) {
      onLog(`Erreur lecture: ${err.message}`);
    }
  };

  const handleRemoveDoc = (index: number) => {
      setPriorDocs(prev => prev.filter((_, i) => i !== index));
  };

  const handleConfront = async () => {
    setLoading(true);
    onLog("Démarrage du Claim Chart (Step 3)...");

    try {
      const priorsText = priorDocs.length > 0 
        ? priorDocs.map(d => `--- DOCUMENT: ${d.name} ---\n${d.text}`).join('\n\n')
        : "Aucun document fourni (Analyse théorique).";

      const prompt = PROMPTS.step3_compare
        .replace('{{INVENTION_JSON}}', JSON.stringify(step1Data))
        .replace('{{PRIOR_TEXT}}', priorsText);

      const data = await generateContentJSON<ComparisonResult>(prompt);
      onLog("Claim Chart généré.");
      setResult(data);
    } catch (err: any) {
      onLog(`Erreur Confrontation: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getVerdictStyle = (verdict: string, presence: string) => {
    const text = (verdict + presence).toUpperCase();
    if (text.includes('DIFFÉRENCE') || text.includes('NOUVEAU') || text.includes('ABSENT')) {
      return { 
        bg: 'bg-green-900/30', 
        border: 'border-green-800', 
        text: 'text-green-400', 
        icon: <CheckCircle size={14} /> 
      };
    }
    if (text.includes('PARTIEL')) {
      return { 
        bg: 'bg-yellow-900/30', 
        border: 'border-yellow-800', 
        text: 'text-yellow-400', 
        icon: <AlertTriangle size={14} /> 
      };
    }
    // Default: Identique / Présent
    return { 
      bg: 'bg-red-900/30', 
      border: 'border-red-800', 
      text: 'text-red-400', 
      icon: <XCircle size={14} /> 
    };
  };

  // VUE RÉSULTAT (Claim Chart)
  if (result) {
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
           <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Scale className="text-blue-500" /> Confrontation Terminée
            </h2>
            <p className="text-slate-400 text-sm mt-1">Analyse comparative vs {priorDocs.length > 0 ? priorDocs.map(d => d.name).join(', ') : "l'État de l'art théorique"}.</p>
          </div>
          <button 
            onClick={() => setResult(null)} 
            className="text-slate-500 hover:text-white flex items-center gap-2 text-sm transition-colors px-3 py-2 rounded-lg hover:bg-slate-800"
          >
            <RefreshCw size={14} /> Modifier Données
          </button>
        </div>

        {/* CLAIM CHART TABLE */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center gap-2">
            <Scale size={18} className="text-blue-400"/>
            <span className="font-bold text-slate-200 uppercase tracking-wider text-sm">Claim Chart (Tableau de Confrontation)</span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-950/50 text-slate-500 text-xs uppercase font-semibold">
                <tr>
                  <th className="px-6 py-4 w-[35%]">Caractéristique Invention</th>
                  <th className="px-6 py-4 w-[45%] border-l border-slate-800">Présence dans D1 & Preuve</th>
                  <th className="px-6 py-4 w-[20%] border-l border-slate-800">Verdict</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {result.claim_chart?.map((row, idx) => {
                  const style = getVerdictStyle(row.verdict, row.d1_presence);
                  return (
                    <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4 text-slate-300 font-medium leading-relaxed align-top">
                        {row.feature}
                      </td>
                      <td className="px-6 py-4 border-l border-slate-800 align-top">
                        <div className="flex flex-col gap-2">
                           <span className={`text-xs font-bold px-2 py-0.5 rounded w-fit border ${style.bg} ${style.border} ${style.text}`}>
                             {row.d1_presence}
                           </span>
                           {row.d1_quote && (
                             <div className="flex gap-2 text-slate-400 italic bg-slate-950/50 p-2 rounded border border-slate-800/50">
                               <BookOpen size={14} className="shrink-0 mt-0.5 opacity-50"/>
                               <span className="text-xs">"{row.d1_quote}"</span>
                             </div>
                           )}
                        </div>
                      </td>
                      <td className="px-6 py-4 border-l border-slate-800 align-top">
                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${style.bg} ${style.border} ${style.text}`}>
                          {style.icon}
                          <span className="font-bold text-xs">{row.verdict}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* ANALYSE TEXTUELLE */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Nouveauté */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col">
            <h4 className="text-green-400 text-xs font-bold uppercase mb-4 flex items-center gap-2 pb-2 border-b border-green-900/30">
               <CheckCircle size={16} /> Analyse Nouveauté
            </h4>
            <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap flex-1">
              {result.novelty_analysis}
            </p>
          </div>

          {/* Activité Inventive */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col">
            <h4 className="text-purple-400 text-xs font-bold uppercase mb-4 flex items-center gap-2 pb-2 border-b border-purple-900/30">
               <AlertTriangle size={16} /> Activité Inventive
            </h4>
            <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap flex-1">
              {result.inventive_step_analysis}
            </p>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800">
          <button
            onClick={() => onComplete(result)}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-900/20 transition-all flex items-center justify-center gap-2 text-lg group"
          >
            Valider et Rédiger le Rapport
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    );
  }

  // VUE INITIALE (Upload & Config)
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-white">3. Claim Chart & Confrontation</h2>
        <p className="text-slate-400">Jeu des 7 différences entre l'invention et les antériorités.</p>
      </div>

      {/* Strategy Recap */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="grid md:grid-cols-2 gap-4">
            <div>
                 <h3 className="text-purple-400 font-bold uppercase text-xs mb-2 flex items-center gap-2">
                    <Search size={14} /> Mots-Clés Stratégiques
                </h3>
                <div className="flex flex-wrap gap-2">
                    {step2Data.keywords_en?.slice(0, 6).map((kw, i) => (
                        <span key={i} className="bg-slate-800 text-slate-300 text-xs px-2 py-1 rounded border border-slate-700">{kw}</span>
                    ))}
                </div>
            </div>
            <div>
                 <h3 className="text-blue-400 font-bold uppercase text-xs mb-2 flex items-center gap-2">
                    <Search size={14} /> Classifications (CPC)
                </h3>
                <div className="flex flex-wrap gap-2">
                    {step2Data.classifications?.map((cpc, i) => (
                        <span key={i} className="bg-blue-900/30 text-blue-300 text-xs px-2 py-1 rounded border border-blue-800">{cpc}</span>
                    ))}
                </div>
            </div>
        </div>
      </div>

      {/* Upload Zone */}
      <div className="grid md:grid-cols-2 gap-6">
          <div className="relative group cursor-pointer h-48">
            <input 
              type="file" 
              onChange={handleFileUpload}
              className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer"
              accept=".pdf,.docx,.txt"
            />
            <div className="h-full border-2 border-dashed border-slate-700 bg-slate-900/50 rounded-xl flex flex-col items-center justify-center text-center transition-all group-hover:border-purple-500 group-hover:bg-slate-900 group-hover:shadow-lg group-hover:shadow-purple-900/10">
              <div className="bg-slate-800 p-3 rounded-full mb-3 group-hover:bg-purple-900/30 transition-colors">
                <Upload className="text-purple-400" size={24} />
              </div>
              <p className="text-sm text-slate-300 font-bold">Ajouter Brevet Antérieur (D1, D2...)</p>
              <p className="text-xs text-slate-500 mt-1 px-4">Glissez-déposez ou cliquez pour uploader (PDF, DOCX)</p>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col h-48">
            <h4 className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center gap-2">
              <FileText size={14} /> Documents Chargés ({priorDocs.length})
            </h4>
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {priorDocs.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-slate-600 text-xs italic">
                  <p>Aucun document.</p>
                  <p>L'IA utilisera ses connaissances générales.</p>
                </div>
              )}
              <ul className="space-y-2">
                  {priorDocs.map((doc, i) => (
                      <li key={i} className="flex items-center justify-between bg-slate-800 p-3 rounded-lg border border-slate-700 group hover:border-slate-600 transition-colors">
                          <div className="flex items-center gap-3 overflow-hidden">
                              <div className="bg-slate-700 p-1.5 rounded">
                                <FileText size={14} className="text-slate-300 shrink-0" />
                              </div>
                              <span className="text-sm text-slate-200 truncate font-medium">{doc.name}</span>
                          </div>
                          <button 
                            onClick={() => handleRemoveDoc(i)} 
                            className="text-slate-500 hover:text-red-400 hover:bg-red-900/20 p-1.5 rounded transition-all"
                            title="Supprimer"
                          >
                              <Trash2 size={14} />
                          </button>
                      </li>
                  ))}
              </ul>
            </div>
          </div>
      </div>

      <button
        onClick={handleConfront}
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-900/20 transition-all flex items-center justify-center gap-3"
      >
        {loading ? <Loader2 className="animate-spin" /> : <Scale />}
        {loading ? "Génération du Claim Chart..." : "Lancer la Confrontation"}
      </button>
    </div>
  );
};