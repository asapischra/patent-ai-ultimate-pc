import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { Step1Analyze } from './components/Step1Analyze';
import { Step2Strategy } from './components/Step2Strategy';
import { Step3Compare } from './components/Step3Compare';
import { Step4Report } from './components/Step4Report';
import { AppStep, LogEntry, AnalysisResult, StrategyResult, ComparisonResult, ReportResult } from './types';

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>(AppStep.ANALYZE);
  const [logs, setLogs] = useState<LogEntry[]>([
    { timestamp: new Date().toLocaleTimeString(), message: "Système PatentAI initialisé." }
  ]);

  // Data State
  const [step1Data, setStep1Data] = useState<AnalysisResult | null>(null);
  const [step2Data, setStep2Data] = useState<StrategyResult | null>(null);
  const [step3Data, setStep3Data] = useState<ComparisonResult | null>(null);
  const [step4Data, setStep4Data] = useState<ReportResult | null>(null);

  const addLog = (msg: string) => {
    setLogs(prev => [...prev, { timestamp: new Date().toLocaleTimeString(), message: msg }]);
  };

  const handleStep1Complete = (data: AnalysisResult) => {
    setStep1Data(data);
    setStep(AppStep.STRATEGY);
  };

  const handleStep2Complete = (data: StrategyResult) => {
    setStep2Data(data);
    setStep(AppStep.CONFRONTATION);
  };

  const handleStep3Complete = (data: ComparisonResult) => {
    setStep3Data(data);
    setStep(AppStep.REPORT);
  };

  const handleStep4Complete = (data: ReportResult) => {
    setStep4Data(data);
    // Already at last step
  };

  const getEnabledSteps = (): AppStep[] => {
    const steps = [AppStep.ANALYZE];
    if (step1Data) steps.push(AppStep.STRATEGY);
    if (step2Data) steps.push(AppStep.CONFRONTATION);
    if (step3Data) steps.push(AppStep.REPORT);
    return steps;
  };

  const handleStepChange = (targetStep: AppStep) => {
    setStep(targetStep);
  };

  return (
    <Layout currentStep={step} logs={logs} onStepChange={handleStepChange} enabledSteps={getEnabledSteps()}>
      {step === AppStep.ANALYZE && (
        <Step1Analyze onComplete={handleStep1Complete} onLog={addLog} />
      )}
      
      {step === AppStep.STRATEGY && step1Data && (
        <Step2Strategy 
          step1Data={step1Data} 
          onComplete={handleStep2Complete} 
          onLog={addLog} 
        />
      )}

      {step === AppStep.CONFRONTATION && step1Data && step2Data && (
        <Step3Compare 
          step1Data={step1Data} 
          step2Data={step2Data} 
          onComplete={handleStep3Complete} 
          onLog={addLog} 
        />
      )}

      {step === AppStep.REPORT && step1Data && step3Data && (
        <Step4Report 
          step1Data={step1Data} 
          step3Data={step3Data}
          existingReport={step4Data}
          onComplete={handleStep4Complete}
          onLog={addLog} 
        />
      )}
    </Layout>
  );
};

export default App;