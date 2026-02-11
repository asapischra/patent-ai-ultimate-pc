import React, { useState } from 'react';
import { FileOutput, Download, Loader2 } from 'lucide-react';
import { PROMPTS } from '../constants';
import { generateContentJSON } from '../services/geminiService';
import { exportToDocx } from '../services/fileService';
import { AnalysisResult, ComparisonResult, ReportResult } from '../types';

interface Props {
  step1Data: AnalysisResult;
  step3Data: ComparisonResult;
  existingReport: ReportResult | null;
  onComplete: (data: ReportResult) => void;
  onLog: (msg: string) => void;
}

export const Step4Report: React.FC<Props> = ({ step1Data, step3Data, existingReport, onComplete, onLog }) => {
  const [loading, setLoading] = useState(false);

  const handleGenerateReport = async () => {
    setLoading(true);
    onLog("Rédaction du rapport final (Step 4)...");
    try {
      // Aggregate data for the prompt
      const allData = {
          step1: step1Data,
          step3: step3Data
      };

      const prompt = PROMPTS.step4_report.replace('{{ALL_DATA}}', JSON.stringify(allData));
      const result = await generateContentJSON<ReportResult>(prompt);
      onLog("Rapport rédigé.");
      onComplete(result);
    } catch (err: any) {
      onLog(`Erreur Rapport: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
      if (existingReport) {
          exportToDocx(existingReport.report_markdown);
          onLog("Téléchargement du fichier DOCX lancé.");
      }
  };

  const getVerdictColor = (verdict: string) => {
      const v = verdict.toUpperCase();
      if (v.includes('ABSENT') || v.includes('NOUVEAU')) return 'text-green-400 bg-green-900/20 border-green-800';
      if (v.includes('PARTIEL')) return 'text-yellow-400 bg-yellow-900/20 border-yellow-800';
      return 'text-red-400 bg-red-900/20 border-red-800';
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-white">4. Rapport Final</h2>
        <p className="text-slate-400">Synthèse et recommandation.</p>
      </div>

      {/* Claim Chart Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="p-4 bg-slate-950 border-b border-slate-800 font-bold text-slate-300">
            CLAIM CHART (Synthèse)
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase bg-slate-900 text-slate-500">
                    <tr>
                        <th className="px-6 py-3 w-1/3">Caractéristique (Invention)</th>
                        <th className="px-6 py-3 w-1/4">Présence D1</th>
                        <th className="px-6 py-3">Preuve / Citation</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                    {step3Data.claim_chart?.map((row, idx) => (
                        <tr key={idx} className="bg-slate-900/50 hover:bg-slate-800/50">
                            <td className="px-6 py-4 font-medium text-slate-300">{row.feature}</td>
                            <td className="px-6 py-4">
                                <span className={`px-2 py-1 rounded text-[10px] font-bold border ${getVerdictColor(row.d1_presence)}`}>
                                    {row.d1_presence}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-slate-400 italic text-xs border-l border-slate-800">"{row.d1_quote}"</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>

      {/* Analysis Blocks */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
            <h4 className="text-green-400 text-xs uppercase font-bold mb-2">Analyse Nouveauté</h4>
            <p className="text-sm text-slate-300 leading-relaxed">{step3Data.novelty_analysis}</p>
        </div>
        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
            <h4 className="text-purple-400 text-xs uppercase font-bold mb-2">Analyse Activité Inventive</h4>
            <p className="text-sm text-slate-300 leading-relaxed">{step3Data.inventive_step_analysis}</p>
        </div>
      </div>

      {!existingReport ? (
        <button
            onClick={handleGenerateReport}
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-green-900/20 transition-all flex items-center justify-center gap-2"
        >
            {loading ? <Loader2 className="animate-spin" /> : <FileOutput />}
            {loading ? "Rédaction..." : "Rédiger le Rapport Markdown"}
        </button>
      ) : (
        <div className="space-y-6">
            <div className="bg-slate-50 text-slate-900 p-8 rounded-xl shadow-2xl h-[500px] overflow-y-auto font-serif whitespace-pre-wrap leading-relaxed border-4 border-slate-800">
                {existingReport.report_markdown}
            </div>
            
            <button
                onClick={handleExport}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-900/20 transition-all flex items-center justify-center gap-2"
            >
                <Download />
                Télécharger en Word (.docx)
            </button>
        </div>
      )}
    </div>
  );
};