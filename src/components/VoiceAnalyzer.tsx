import React, { useState, useEffect } from "react";
import { VoiceAnalysisResult } from "../types";
import { saveVoiceRecording } from "../lib/firebase";

interface VoiceAnalyzerProps {
  onBack: () => void;
  userId: string;
  onSaveToHistory: (type: string, title: string, score: number, category: string, detail: string) => void;
  onAddActivity: (activity: any) => void;
}

export default function VoiceAnalyzer({ onBack, userId, onSaveToHistory, onAddActivity }: VoiceAnalyzerProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [waveformHeights, setWaveformHeights] = useState<number[]>(new Array(16).fill(6));
  const [result, setResult] = useState<VoiceAnalysisResult | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasSaved, setHasSaved] = useState(false);

  // Animated visual audio wave effect if checking is running
  useEffect(() => {
    let timer: any;
    if (isRecording) {
      timer = setInterval(() => {
        setWaveformHeights(waveformHeights.map(() => Math.floor(Math.random() * 26) + 4));
      }, 150);
    } else {
      setWaveformHeights(new Array(16).fill(6));
    }
    return () => clearInterval(timer);
  }, [isRecording]);

  const startAnalysis = (inputText?: string) => {
    setIsRecording(true);
    setResult(null);
    setHasSaved(false);

    // Dynamic processing
    setTimeout(() => {
      setIsRecording(false);
      triggerVerdict(inputText);
    }, 3000);
  };

  const triggerVerdict = (textVal?: string) => {
    const textToCheck = textVal || "Hello, this is SBI Card department. Your credit card is showing a block. Read out the OTP code immediately to restore authorization.";
    
    // Call endpoint or simulate
    const isPhishingValue = textToCheck.toLowerCase().includes("otp") || textToCheck.toLowerCase().includes("kyc") || textToCheck.toLowerCase().includes("police") || textToCheck.toLowerCase().includes("freeze") || textToCheck.toLowerCase().includes("suspici");
    
    const mockResult: VoiceAnalysisResult = {
      id: `voice_${Math.random().toString(36).substr(2, 9)}`,
      title: "Incoming Vishing Threat Checked",
      timestamp: new Date().toLocaleTimeString(),
      scamProbability: isPhishingValue ? 89 : 12,
      transcript: [
        { speaker: "Caller", text: "Hello, this is Central Bank Security. We found a suspicious transaction transaction targeting your physical cards.", isThreat: false },
        { speaker: "Caller", text: "Sir, to restore normal services you must confirm your credit security code or the OTP we are dispatching now.", isThreat: isPhishingValue, label: isPhishingValue ? "Direct OTP solicitation" : undefined },
        { speaker: "Caller", text: "Failing this, we will dispatch immediate blocks to freeze your entire savings balance with us.", isThreat: isPhishingValue }
      ],
      detections: isPhishingValue ? [
        { type: "Threat", title: "Asset blocking threats", description: "Warnings of immediate balance blockages detected." },
        { type: "Bank Claim", title: "Fake security claim", description: "Impersonates card fraud support units." },
        { type: "OTP Request", title: "OTP credential harvesting", description: "Requested live One-Time Password sequence." }
      ] : [
        { type: "Bank Claim", title: "Standard assistance call", description: "Helpful, non-coercive conversation sequence." }
      ],
      explanation: isPhishingValue 
        ? "The caller utilized high-pressure security impersonation and demanded immediate OTP disclosures. Legitimate card security offices never solicit transaction validation codes over voice lines."
        : "No threat signals were registered. The caller is speaking cordially without soliciting credentials, keys, or imposing timeline blocks.",
      duration: "01:22 / 03:00"
    };

    setResult(mockResult);

    onSaveToHistory(
      "voice",
      `Voice query executed: Prob: ${mockResult.scamProbability}%`,
      mockResult.scamProbability,
      isPhishingValue ? "High-Risk Vishing Call" : "Safe Voice Call",
      mockResult.explanation
    );

    onAddActivity({
      type: "voice",
      title: "Voice Scan Complete",
      description: `Analysis verdict: ${mockResult.scamProbability}% Threat`,
      riskScore: mockResult.scamProbability
    });
  };

  const saveToCloudDatabaseSelected = async () => {
    if (!result) return;
    setIsSaving(true);
    
    try {
      await saveVoiceRecording(userId, result);
      setHasSaved(true);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-lg pb-12">
      {/* Title bar Nav */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-slate-100 text-slate-600 transition-transform active:scale-90 cursor-pointer"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h2 className="text-display text-2xl font-extrabold text-slate-900">Voice Analyzer</h2>
      </div>

      {result ? (
        // Results representation panel
        <div className="space-y-lg transition-all animate-fadeIn">
          {/* Probability Indicator Gauge */}
          <section className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center">
            <div className="relative w-44 h-44 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90">
                <circle
                  className="text-slate-100"
                  cx="88"
                  cy="88"
                  fill="transparent"
                  r="72"
                  stroke="currentColor"
                  strokeWidth="10"
                />
                <circle
                  className="gauge-ring"
                  cx="88"
                  cy="88"
                  fill="transparent"
                  r="72"
                  stroke="currentColor"
                  strokeDasharray="452"
                  strokeDashoffset={452 - (452 * result.scamProbability) / 100}
                  strokeWidth="10"
                  style={{
                    stroke: result.scamProbability > 60 ? "#EF4444" : "#22C55E",
                    strokeLinecap: "round"
                  }}
                />
              </svg>
              <div className="absolute flex flex-col items-center text-center">
                <span className="font-display font-black text-4xl" style={{ color: result.scamProbability > 60 ? "#EF4444" : "#22C55E" }}>
                  {result.scamProbability}%
                </span>
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-1">
                  SCAM PROBABILITY
                </span>
              </div>
            </div>

            <div className="inline-flex items-center gap-2 mt-4 px-4 py-1.5 rounded-full" style={{ backgroundColor: result.scamProbability > 60 ? "#FEE2E2" : "#DCFCE7", color: result.scamProbability > 60 ? "#EF4444" : "#22C55E" }}>
              <span className="material-symbols-outlined text-sm font-black">
                {result.scamProbability > 60 ? "gpp_maybe" : "verified_user"}
              </span>
              <span className="font-bold text-[10px] uppercase tracking-wider">
                {result.scamProbability > 60 ? "HIGH PROBABILITY VISHING THREAT" : "SAFE / TRUSTED CALL VALUE"}
              </span>
            </div>
          </section>

          {/* Transcript display block */}
          <section className="space-y-3">
            <h3 className="font-display font-medium text-slate-400 text-xs tracking-wider uppercase ml-1">Real-time Transcript Flags</h3>
            
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
              {result.transcript.map((line, idx) => (
                <div key={idx} className={`flex gap-3 p-3.5 rounded-2xl border transition-all ${
                  line.isThreat
                    ? "bg-red-50/50 border-red-100 text-slate-800"
                    : "bg-slate-50/50 border-slate-100 text-slate-600"
                }`}>
                  <div className="shrink-0 flex flex-col items-center">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                      line.speaker === "Caller" ? "bg-slate-100 text-slate-700" : "bg-blue-100 text-primary"
                    }`}>
                      {line.speaker === "Caller" ? "C" : "U"}
                    </span>
                  </div>
                  <div className="flex-grow space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-400">{line.speaker}</span>
                      {line.isThreat && (
                        <span className="bg-red-600 text-white text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded shadow-sm">
                          {line.label || "THREAT SIGNAL"}
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-semibold leading-relaxed">"{line.text}"</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Key Detections lists */}
          <section className="space-y-3">
            <h3 className="font-display font-medium text-slate-400 text-xs tracking-wider uppercase ml-1 font-bold">Threat Indicators</h3>
            
            <div className="space-y-2">
              {result.detections.map((det, id) => (
                <div key={id} className="flex gap-4 p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                  <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-danger text-lg font-semibold">shield_alert</span>
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-sm text-slate-800 leading-snug">{det.title}</h4>
                    <p className="text-xs text-slate-400 mt-1 leading-normal">{det.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Detailed narrative details */}
          <section className="bg-slate-50 border border-slate-200 p-5 rounded-2xl text-xs text-slate-500 leading-relaxed font-semibold">
            <div className="flex items-center gap-1.5 mb-2 text-slate-700">
              <span className="material-symbols-outlined text-sm font-black">gavel</span>
              <span className="font-bold text-[10px] tracking-wider uppercase">Analytical Report</span>
            </div>
            {result.explanation}
          </section>

          {/* Containment action list - TERMINATE CALL */}
          <div className="flex flex-col gap-3 pt-3">
            {result.scamProbability > 60 && (
              <button
                onClick={() => {
                  alert("Executing simulated network signaling termination protocol. Line severed.");
                  onBack();
                }}
                className="w-full h-14 bg-danger text-white rounded-2xl cursor-pointer hover:bg-red-600 font-bold active:scale-95 transition-all shadow-lg shadow-danger/25 flex items-center justify-center gap-2 uppercase tracking-wide"
              >
                <span className="material-symbols-outlined">phone_disabled</span>
                TERMINATE CALL NOW
              </button>
            )}

            <button
              onClick={saveToCloudDatabaseSelected}
              disabled={isSaving || hasSaved}
              className={`w-full h-14 rounded-2xl font-bold cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-2 border shadow-sm ${
                hasSaved
                  ? "bg-success text-white border-success"
                  : "bg-white hover:bg-slate-50 text-slate-700 border-slate-200"
              }`}
            >
              <span className="material-symbols-outlined">
                {isSaving ? "sync" : hasSaved ? "cloud_done" : "cloud_sync"}
              </span>
              {isSaving
                ? "Securing Voice File logs..."
                : hasSaved
                ? "SAVED SECURELY TO CLOUD"
                : "SAVE TO SECURE CLOUD DATABASE"}
            </button>
            
            <button
              onClick={() => {
                setResult(null);
                setHasSaved(false);
              }}
              className="text-primary hover:text-blue-700 font-bold text-sm text-center py-2"
            >
              Start another voice monitor line
            </button>
          </div>
        </div>
      ) : isRecording ? (
        // Live wave visualization listening box
        <div className="bg-slate-900 rounded-3xl p-8 text-center space-y-6 text-white border border-slate-800 shadow-xl overflow-hidden relative">
          {/* Ambient matrix particle dots fallback */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 to-transparent pointer-events-none"></div>

          <div className="w-20 h-20 bg-danger rounded-full flex items-center justify-center mx-auto security-pulse scale-105">
            <span className="material-symbols-outlined text-4xl animate-pulse">mic</span>
          </div>

          <div className="space-y-1 relative z-10">
            <h3 className="font-display font-extrabold text-lg text-white">Live Voice Call Analyzer</h3>
            <p className="text-xs text-slate-400 font-bold tracking-widest uppercase">LINE STATUS: STREAMING AUDITS ACTIVE</p>
          </div>

          {/* Animated Waveform Blocks */}
          <div className="flex justify-center items-center gap-1.5 h-14 relative z-10">
            {waveformHeights.map((height, idx) => (
              <div
                key={idx}
                className="w-1.5 rounded-full bg-danger waveform-bar"
                style={{ height: `${height}px` }}
              ></div>
            ))}
          </div>

          <p className="text-[10px] text-slate-500 font-bold leading-relaxed max-w-xs mx-auto uppercase tracking-wide">
            🎙️ Checking speaker identifiers for artificial speech cloning, fake bank headers, and urgent timeline demands.
          </p>
        </div>
      ) : (
        // Input choice selection view
        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm space-y-6 text-center">
          <div className="w-16 h-16 bg-blue-50 text-primary rounded-full flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-4xl">record_voice_over</span>
          </div>

          <div className="space-y-2">
            <h3 className="font-display font-bold text-lg text-slate-800">Identify Fraudulent Phone Calls</h3>
            <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
              Detect fake bank operators, state security impersonations, high-stress kidnap traps, and synthesized AI voice clones.
            </p>
          </div>

          <div className="space-y-3 pt-3">
            <button
              onClick={() => startAnalysis()}
              className="w-full h-14 bg-primary text-white rounded-2xl font-bold cursor-pointer hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined">call</span>
              SIMULATE INCOMING VOIP CHECK
            </button>
            
            <div className="h-[1px] bg-slate-100 my-2"></div>
            
            <h4 className="text-left font-bold text-xs text-slate-400 uppercase tracking-wider ml-1">POPULAR CALL PRESETS</h4>
            
            <button
              onClick={() => startAnalysis("Police: This is New Delhi Crime Branch Office. Your family member is arrested. Send ₹60,000 bail deposits right now to prevent direct locking charges.")}
              className="w-full text-left bg-slate-50 hover:bg-slate-100/50 p-4 border border-slate-100 rounded-2xl flex items-center justify-between text-xs transition-colors cursor-pointer"
            >
              <div>
                <p className="font-bold text-slate-700">Fake Police Arrest Kidnap Threat</p>
                <p className="text-slate-400 mt-0.5 truncate max-w-xs">"Police: This is New Delhi Crime Branch..."</p>
              </div>
              <span className="material-symbols-outlined text-danger text-sm">emergency</span>
            </button>

            <button
              onClick={() => startAnalysis("Support: Dear client, we call from Netflix India billing support. Your current subscription plan is renewing next Monday morning normally. Let us know if you need helper details.")}
              className="w-full text-left bg-slate-50 hover:bg-slate-100/50 p-4 border border-slate-100 rounded-2xl flex items-center justify-between text-xs transition-colors cursor-pointer"
            >
              <div>
                <p className="font-bold text-slate-700">Genuine Institutional Subscription Helper</p>
                <p className="text-slate-400 mt-0.5 truncate max-w-xs">"Support: Dear client, we call from Netflix..."</p>
              </div>
              <span className="material-symbols-outlined text-success text-sm font-black">check_circle</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
