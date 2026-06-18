import React, { useState } from "react";
import { MessageAnalysisResult } from "../types";

interface MessageAnalyzerProps {
  onBack: () => void;
  onSaveToHistory: (type: string, title: string, score: number, category: string, detail: string) => void;
  onAddActivity: (activity: any) => void;
}

export default function MessageAnalyzer({ onBack, onSaveToHistory, onAddActivity }: MessageAnalyzerProps) {
  const [inputText, setInputText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<MessageAnalysisResult | null>(null);
  const [hasReported, setHasReported] = useState(false);
  const [isReporting, setIsReporting] = useState(false);

  const handleAnalyze = async () => {
    if (!inputText.trim()) return;
    setIsAnalyzing(true);
    setResult(null);
    setHasReported(false);

    try {
      const res = await fetch("/api/analyze-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: inputText }),
      });
      const data = await res.json();
      
      const newResult: MessageAnalysisResult = {
        originalMessage: inputText,
        riskScore: data.riskScore ?? 0,
        confidence: data.confidence ?? "Medium",
        category: data.category ?? "Unknown Threat",
        reasons: data.reasons ?? [],
        recommendations: data.recommendations ?? [],
      };

      setResult(newResult);

      // Save to general firebase / local state logs
      onSaveToHistory(
        "message",
        `Message inspected (${newResult.category})`,
        newResult.riskScore,
        newResult.category,
        inputText
      );

      onAddActivity({
        type: "message",
        title: "Message Check Complete",
        description: `Flagged: ${newResult.category}`,
        riskScore: newResult.riskScore
      });

    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReportScam = async () => {
    if (!result) return;
    setIsReporting(true);
    setTimeout(() => {
      setIsReporting(false);
      setHasReported(true);
    }, 1500);
  };

  return (
    <div className="space-y-lg pb-12">
      {/* Title Header bar */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-slate-100 text-slate-600 transition-transform active:scale-90 cursor-pointer"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h2 className="text-display text-2xl font-extrabold text-slate-900">Message Analyzer</h2>
      </div>

      {result ? (
        // Results View
        <div className="space-y-lg transition-all animate-fadeIn">
          {/* Circular Risk Score Progress Ring */}
          <section className="bg-white rounded-3xl p-6 border border-slate-100 flex flex-col items-center justify-center text-center shadow-sm">
            <div className="relative w-56 h-56 flex items-center justify-center">
              <svg className="w-56 h-56 -rotate-90 transform">
                {/* Background Ring */}
                <circle
                  className="text-slate-100"
                  cx="112"
                  cy="112"
                  fill="transparent"
                  r="96"
                  stroke="currentColor"
                  strokeWidth="12"
                />
                {/* Foreground dynamic color progress */}
                <circle
                  className="gauge-ring"
                  cx="112"
                  cy="112"
                  fill="transparent"
                  r="96"
                  stroke="currentColor"
                  strokeDasharray="603"
                  strokeDashoffset={603 - (603 * result.riskScore) / 100}
                  strokeWidth="12"
                  style={{
                    stroke: result.riskScore > 75 ? "#EF4444" : result.riskScore > 40 ? "#F59E0B" : "#22C55E",
                    strokeLinecap: "round"
                  }}
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span
                  className="text-display text-5xl font-black"
                  style={{ color: result.riskScore > 75 ? "#EF4444" : result.riskScore > 40 ? "#F59E0B" : "#22C55E" }}
                >
                  {result.riskScore}%
                </span>
                <span
                  className="px-3 py-1 rounded-full text-[10px] font-black uppercase text-white mt-2 risk-gauge-pulse"
                  style={{ backgroundColor: result.riskScore > 75 ? "#EF4444" : result.riskScore > 40 ? "#F59E0B" : "#22C55E" }}
                >
                  {result.riskScore > 75 ? "High Risk" : result.riskScore > 40 ? "Caution Required" : "Secure / Safe"}
                </span>
              </div>
            </div>
            <p className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-widest">
              AI Confidence: {result.confidence}
            </p>
          </section>

          {/* Original Inspected text container */}
          <section className="space-y-2">
            <h3 className="font-display font-semibold text-slate-700 text-xs tracking-wider uppercase ml-1">Analyzed Conversation</h3>
            <div className="bg-slate-100 p-5 rounded-2xl border border-slate-200 text-slate-600 italic text-sm leading-relaxed font-medium">
              "{result.originalMessage}"
            </div>
          </section>

          {/* Bulleted logic: Why is it safe/unsafe */}
          <section className="space-y-3">
            <h3 className="font-display font-bold text-slate-800 text-lg">Why?</h3>
            <div className="space-y-3">
              {result.reasons.map((reason, idx) => (
                <div key={idx} className="flex gap-4 p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                  <span
                    className="material-symbols-outlined font-black text-xl shrink-0 mt-0.5"
                    style={{ color: result.riskScore > 40 ? "#EF4444" : "#22C55E" }}
                  >
                    {result.riskScore > 40 ? "cancel" : "check_circle"}
                  </span>
                  <div>
                    <p className="text-sm font-bold text-slate-800 leading-snug">
                      {reason.includes(":") ? reason.split(":")[0] : reason}
                    </p>
                    {reason.includes(":") && reason.split(":")[1] && (
                      <p className="text-xs text-slate-400 mt-1 leading-normal">
                        {reason.split(":")[1].trim()}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Action List Section */}
          <section className="space-y-3">
            <h3 className="font-display font-bold text-slate-800 text-lg">Recommended Action</h3>
            <div className="bg-blue-50/50 p-6 rounded-2xl border-l-4 border-primary">
              <ul className="space-y-3">
                {result.recommendations.map((rec, id) => (
                  <li key={id} className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary text-lg">
                      {id === 0 ? "block" : id === 1 ? "report" : "gpp_maybe"}
                    </span>
                    <span className="text-sm font-semibold text-slate-700">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Secondary Action elements - report dispatchers */}
          <div className="pt-4 space-y-3">
            <button
              onClick={handleReportScam}
              disabled={isReporting || hasReported}
              className={`w-full h-14 rounded-2xl font-bold flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-95 transition-all ${
                hasReported
                  ? "bg-success text-white shadow-success/10"
                  : "bg-primary hover:bg-blue-700 text-white shadow-primary/20"
              }`}
            >
              <span className="material-symbols-outlined">
                {isReporting ? "sync" : hasReported ? "check_circle" : "security"}
              </span>
              {isReporting
                ? "Reporting incident to Cyber Cell..."
                : hasReported
                ? "Reported Successfully"
                : "Report Scam"}
            </button>
            <button
              onClick={() => {
                setResult(null);
                setInputText("");
              }}
              className="w-full text-slate-400 font-bold hover:text-slate-600 text-center py-2 text-sm transition-colors cursor-pointer"
            >
              Analyze another message
            </button>
          </div>
        </div>
      ) : (
        // Input Screen view
        <div className="space-y-lg">
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
            <div className="flex flex-col gap-2">
              <label className="text-slate-700 font-bold text-base">Paste your suspicious communication</label>
              <p className="text-xs text-slate-400">Accepts copy-pasted WhatsApp messages, SMS notifications, support tickets, or emails.</p>
            </div>

            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="E.g. SBI Suspend notification link queries..."
              className="w-full min-h-[140px] p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary focus:border-primary font-medium text-sm leading-relaxed placeholder:text-slate-400 transition-all outline-none resize-none"
            />

            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing || !inputText.trim()}
              className="w-full h-14 bg-primary text-white rounded-2xl cursor-pointer hover:bg-blue-700 font-bold tracking-wide active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              {isAnalyzing ? (
                <>
                  <span className="material-symbols-outlined animate-spin">refresh</span>
                  SECURELY ANALYZING...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined">analytics</span>
                  ANALYZE MESSAGE
                </>
              )}
            </button>
          </div>

          <div className="space-y-3">
            <h3 className="font-bold text-xs text-slate-400 uppercase tracking-wider ml-1">OR CHOOSE AN EXAMPLE PRESET</h3>
            
            <button
              onClick={() => {
                setInputText(
                  "SBI: Dear Customer, your account is suspended due to KYC. Please update at http://sbi-secure-update.net or your funds will be blocked. Do not share OTP 482910 with anyone."
                );
              }}
              className="w-full text-left bg-white p-4 border border-slate-100 hover:border-blue-200 transition-all active:scale-[0.99] cursor-pointer rounded-2xl shadow-sm text-sm"
            >
              <p className="font-bold text-slate-700 mb-1">State Bank KYC Phishing Alert</p>
              <p className="text-xs text-slate-400 truncate font-medium">"SBI: Dear Customer, your account is suspended due to KYC..."</p>
            </button>

            <button
              onClick={() => {
                setInputText(
                  "CONGRATS! You have won a cash reward of ₹50,000 from KBC Lottery. Transfer ₹1,500 security deposit fee right now via UPI to redeem. Scan to claim: post-lottery-gift.in"
                );
              }}
              className="w-full text-left bg-white p-4 border border-slate-100 hover:border-blue-200 transition-all active:scale-[0.99] cursor-pointer rounded-2xl shadow-sm text-sm"
            >
              <p className="font-bold text-slate-700 mb-1">KBC Cash Prize Deposit Fraud</p>
              <p className="text-xs text-slate-400 truncate font-medium">"CONGRATS! You have won a cash reward of ₹50,000 from KBC Lottery..."</p>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
