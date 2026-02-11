import React, { useState } from 'react';
import { Upload, FileText, Loader2, GitGraph, Target, AlertTriangle, Lightbulb, TrendingUp, ArrowRight, CheckCircle, RefreshCw, Trash2 } from 'lucide-react';
import { readFileContent } from '../services/fileService';
import { PROMPTS } from '../constants';
import { generateContentJSON } from '../services/geminiService';
import { AnalysisResult } from '../types';

interface Props {
  onComplete: (data: AnalysisResult) => void;
  onLog: (msg: string) => void;
}

interface UploadedFile {
  name: string;
  content: string;
}

export const Step1Analyze: React.FC<Props> = ({ onComplete, onLog }) => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [memoText, setMemoText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  // Fonction utilitaire pour régénérer le texte complet
  const updateConcatenatedText = (currentFiles: UploadedFile[]) => {
    if (currentFiles.length === 0) return "";
    return currentFiles.map(f => `--- FICHIER : ${f.name} ---\n${f.content}`).join('\n\n');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = e.target.files;
    if (!uploadedFiles || uploadedFiles.length === 0) return;
    
    // Convert FileList to Array explicitly to handle iteration and typing
    const newFilesArray = Array.from(uploadedFiles) as File[];
    
    onLog(`Lecture de ${newFilesArray.length} fichier(s)...`);

    try {
      const newProcessedFiles: UploadedFile[] = [];

      for (const file of newFilesArray) {
        const text = await readFileContent(file);
        newProcessedFiles.push({ name: file.name, content: text });
        onLog(`Fichier traité: ${file.name} (${text.length} chars)`);
      }

      setFiles(prev => {
        const updated = [...prev, ...newProcessedFiles];
        // Met à jour la zone de texte automatiquement avec le contenu concaténé
        setMemoText(updateConcatenatedText(updated));
        return updated;
      });
      
      setResult(null); // Réinitialise le résultat si on ajoute de nouveaux fichiers
      e.target.value = ''; // Réinitialise l'input pour permettre de ré-uploader le même fichier si besoin
    } catch (err: any) {
      onLog(`Erreur lecture: ${err.message}`);
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles(prev => {
      const updated = prev.filter((_, i) => i !== index);
      setMemoText(updateConcatenatedText(updated));
      return updated;
    });
  };

  const handleAnalyze = async () => {
    if (!memoText.trim()) return;
    setLoading(true);
    onLog("Démarrage de l'analyse FAST (Step 1)...");

    try {
      const prompt = PROMPTS.step1_analyze.replace('{{TEXT}}', memoText);
      const data = await generateContentJSON<AnalysisResult>(prompt);
      onLog("Dissection fonctionnelle terminée.");
      setResult(data);
    } catch (err: any) {
      onLog(`Erreur API: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // VUE RÉSULTATS (Après Analyse)
  if (result) {
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <CheckCircle className="text-green-500" /> Analyse FAST Terminée
            </h2>
            <p className="text-slate-400 text-sm mt-1">Vérifiez la dissection de l'invention avant de générer la stratégie.</p>
          </div>
          <button 
            onClick={() => setResult(null)} 
            className="text-slate-500 hover:text-white flex items-center gap-2 text-sm transition-colors px-3 py-2 rounded-lg hover:bg-slate-800"
          >
            <RefreshCw size={14} /> Recommencer
          </button>
        </div>

        {/* 1. FONCTION PRINCIPALE */}
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-xl relative overflow-hidden shadow-xl">
          <div className="absolute -top-6 -right-6 p-4 opacity-5 rotate-12">
            <Target size={150} />
          </div>
          <h3 className="text-blue-400 text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
            <Target size={16} /> Fonction Principale
          </h3>
          <p className="text-xl md:text-3xl font-bold text-slate-100 leading-tight">
            {result.main_function}
          </p>
          <div className="mt-4 inline-block bg-slate-800 px-3 py-1 rounded text-xs text-slate-400 border border-slate-700 font-mono">
            {result.title}
          </div>
        </div>

        {/* 2. LE TRIPLET D'OR */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Problème - Rouge */}
          <div className="bg-red-950/10 border border-red-900/40 p-6 rounded-xl flex flex-col hover:border-red-500/40 transition-colors">
            <h4 className="text-red-400 text-xs font-bold uppercase mb-4 flex items-center gap-2 border-b border-red-900/30 pb-2">
              <AlertTriangle size={16} /> Problème Technique
            </h4>
            <p className="text-slate-300 text-sm leading-relaxed flex-1">{result.triplet?.problem || "Non identifié"}</p>
          </div>

          {/* Solution - Bleu */}
          <div className="bg-blue-950/10 border border-blue-900/40 p-6 rounded-xl flex flex-col hover:border-blue-500/40 transition-colors">
            <h4 className="text-blue-400 text-xs font-bold uppercase mb-4 flex items-center gap-2 border-b border-blue-900/30 pb-2">
              <Lightbulb size={16} /> Solution Technique
            </h4>
            <p className="text-slate-300 text-sm leading-relaxed flex-1">{result.triplet?.solution || "Non identifié"}</p>
          </div>

          {/* Résultat - Vert */}
          <div className="bg-emerald-950/10 border border-emerald-900/40 p-6 rounded-xl flex flex-col hover:border-emerald-500/40 transition-colors">
            <h4 className="text-emerald-400 text-xs font-bold uppercase mb-4 flex items-center gap-2 border-b border-emerald-900/30 pb-2">
              <TrendingUp size={16} /> Résultat / Effet
            </h4>
            <p className="text-slate-300 text-sm leading-relaxed flex-1">{result.triplet?.result || "Non identifié"}</p>
          </div>
        </div>

        {/* 3. TABLEAU FAST & CHAINE CAUSALE */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Tableau - Prend 2/3 */}
          <div className="lg:col-span-2 bg-slate-900 rounded-xl border border-slate-800 overflow-hidden flex flex-col">
            <div className="px-5 py-4 bg-slate-950 border-b border-slate-800 flex items-center gap-2">
              <GitGraph size={16} className="text-purple-400"/>
              <span className="text-sm font-bold text-slate-300 uppercase">Matrice FAST (Fonctions vs Moyens)</span>
            </div>
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left text-sm h-full">
                <thead className="bg-slate-950/50 text-slate-500 text-xs uppercase font-semibold">
                  <tr>
                    <th className="px-5 py-3 w-1/2">Fonction Technique</th>
                    <th className="px-5 py-3 w-1/2 border-l border-slate-800">Moyen Physique</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 bg-slate-900/50">
                  {result.fast_analysis?.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/50 transition-colors">
                      <td className="px-5 py-3 text-slate-300 font-medium">{item.function}</td>
                      <td className="px-5 py-3 text-slate-400 font-mono text-xs border-l border-slate-800">{item.means}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Chaîne Causale - Prend 1/3 */}
          <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 flex flex-col">
            <h4 className="text-slate-500 text-xs font-bold uppercase mb-4 flex items-center gap-2">
              <ArrowRight size={14} /> Chaîne Causale
            </h4>
            <div className="flex flex-col gap-3 relative flex-1">
              {/* Ligne verticale de connexion */}
              <div className="absolute left-[15px] top-4 bottom-4 w-0.5 bg-slate-800 z-0"></div>
              
              {result.causal_chain?.map((link, i) => (
                <div key={i} className="relative z-10 flex items-start gap-3">
                   <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-500 shrink-0">
                     {i + 1}
                   </div>
                   <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-sm text-slate-300 w-full shadow-sm">
                     {link}
                   </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="pt-4 border-t border-slate-800">
          <button
            onClick={() => onComplete(result)}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-900/20 transition-all flex items-center justify-center gap-2 text-lg group"
          >
            Valider et Passer à la Stratégie 
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    );
  }

  // VUE INITIALE (Upload)
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-2">
        <h2 className="text-2xl md:text-3xl font-bold text-white">1. Analyse FAST & Triplet</h2>
        <p className="text-sm md:text-base text-slate-400">Importez le(s) mémoire(s) technique(s) pour extraire le Triplet d'Or et l'Analyse Fonctionnelle.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Zone d'Upload et Liste des fichiers */}
        <div className="space-y-4">
          <div className="relative group cursor-pointer">
            <input 
              type="file" 
              onChange={handleFileUpload}
              className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer"
              accept=".pdf,.docx,.txt"
              multiple
            />
            <div className="border-2 border-dashed border-slate-700 bg-slate-900/50 rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-all group-hover:border-blue-500 group-hover:bg-slate-900 group-hover:shadow-lg group-hover:shadow-blue-900/10">
              <div className="bg-slate-800 p-4 rounded-full mb-4 group-hover:bg-blue-900/30 transition-colors">
                <Upload className="text-blue-400 group-hover:scale-110 transition-transform" size={32} />
              </div>
              <h3 className="text-lg font-medium text-slate-200 mb-1">Ajouter des fichiers</h3>
              <p className="text-slate-500 text-sm">PDF, DOCX, TXT (Sélection multiple)</p>
            </div>
          </div>

          {/* Liste des fichiers */}
          {files.length > 0 && (
             <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <h4 className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center gap-2">
                  <FileText size={14} /> Fichiers sources ({files.length})
                </h4>
                <ul className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                  {files.map((file, i) => (
                      <li key={i} className="flex items-center justify-between bg-slate-800/50 p-2 rounded-lg border border-slate-700/50 group hover:border-slate-600 transition-colors">
                          <div className="flex items-center gap-3 overflow-hidden">
                              <span className="text-xs text-slate-300 truncate font-mono">{file.name}</span>
                          </div>
                          <button 
                            onClick={() => handleRemoveFile(i)} 
                            className="text-slate-600 hover:text-red-400 hover:bg-red-900/20 p-1.5 rounded transition-all"
                            title="Supprimer"
                          >
                              <Trash2 size={12} />
                          </button>
                      </li>
                  ))}
                </ul>
             </div>
          )}
        </div>

        {/* Zone de Texte Concaténé */}
        <div className="space-y-3 flex flex-col">
          <label className="text-sm font-medium text-slate-400 flex items-center gap-2">
            <FileText size={16} className="text-blue-400" /> Contenu brut combiné
          </label>
          <div className="flex-1 relative">
            <textarea 
              value={memoText}
              onChange={(e) => setMemoText(e.target.value)}
              className="w-full h-full min-h-[250px] bg-slate-900 border border-slate-700 rounded-xl p-4 font-mono text-xs text-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none transition-all placeholder:text-slate-700 leading-relaxed"
              placeholder="Le texte des fichiers apparaîtra ici. Vous pouvez aussi écrire ou coller directement."
            />
            <div className="absolute bottom-4 right-4 text-[10px] text-slate-600 bg-slate-950/80 px-2 py-1 rounded border border-slate-800">
               {memoText.length} caractères
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={handleAnalyze}
        disabled={!memoText.trim() || loading}
        className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-900/20 transition-all flex items-center justify-center gap-3"
      >
        {loading ? <Loader2 className="animate-spin" /> : <GitGraph />}
        {loading ? "Analyse FAST en cours..." : "Lancer la Dissection Fonctionnelle"}
      </button>
    </div>
  );
};