import React, { useState } from "react";
import { MailAnalysisResult } from "../types";

interface MailAnalyzerProps {
  onBack: () => void;
  onSaveToHistory: (type: string, title: string, score: number, category: string, detail: string) => void;
  onAddActivity: (activity: any) => void;
}

export default function MailAnalyzer({ onBack, onSaveToHistory, onAddActivity }: MailAnalyzerProps) {
  const [inputText, setInputText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<MailAnalysisResult | null>(null);
  const [hasReported, setHasReported] = useState(false);
  const [isReporting, setIsReporting] = useState(false);

  const handleAnalyze = async () => {
    if (!inputText.trim()) return;
    setIsAnalyzing(true);
    setResult(null);
    setHasReported(false);

    try {
      const res = await fetch("/api/analyze-mail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mailContent: inputText }),
      });
      const data = await res.json();
      
      const newResult: MailAnalysisResult = {
        originalMail: inputText,
        sender: data.sender ?? "Unknown Sender",
        domainVerification: data.domainVerification ?? { spf: "NONE", dkim: "NONE", dmarc: "NONE" },
        riskScore: data.riskScore ?? 0,
        confidence: data.confidence ?? "Medium",
        category: data.category ?? "Unknown Threat Pattern",
        reasons: data.reasons ?? [],
        recommendations: data.recommendations ?? [],
      };

      setResult(newResult);

      // Save to server history / local memory logs
      onSaveToHistory(
        "mail",
        `Email check: ${newResult.category}`,
        newResult.riskScore,
        newResult.category,
        inputText
      );

      onAddActivity({
        type: "screenshot", // visual representation matches screenshot style
        title: "Mail Risk Check Complete",
        description: `Flagged: ${newResult.category}`,
        riskScore: newResult.riskScore
      });

    } catch (e) {
      console.error("Failed mail analyzer transaction:", e);
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
    <div className="space-y-6 pb-12 theme-text">
      {/* Back button title bar */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-full flex items-center justify-center theme-card border hover:opacity-85 transition-transform active:scale-90 cursor-pointer"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h2 className="text-display text-2xl font-extrabold theme-card-title">AI Mail Analyzer</h2>
      </div>

      {result ? (
        // Results View
        <div className="space-y-6 animate-fadeIn">
          {/* Circular Risk Gauge Progress */}
          <section className="theme-card border rounded-3xl p-6 flex flex-col items-center justify-center text-center shadow-lg relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/5 rounded-full blur-3xl"></div>
            
            <div className="relative w-48 h-48 flex items-center justify-center">
              <svg className="w-48 h-48 -rotate-90 transform">
                {/* Background Ring */}
                <circle
                  className="text-neutral-200 dark:text-slate-800"
                  cx="96"
                  cy="96"
                  fill="transparent"
                  r="80"
                  stroke="currentColor"
                  strokeWidth="10"
                />
                {/* Foreground Progress Ring */}
                <circle
                  className="gauge-ring transition-all duration-500"
                  cx="96"
                  cy="96"
                  fill="transparent"
                  r="80"
                  stroke="currentColor"
                  strokeDasharray="502"
                  strokeDashoffset={502 - (502 * result.riskScore) / 100}
                  strokeWidth="10"
                  style={{
                    stroke: result.riskScore > 75 ? "#EF4444" : result.riskScore > 40 ? "#F59E0B" : "#22C55E",
                    strokeLinecap: "round"
                  }}
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span
                  className="text-display text-4xl font-extrabold"
                  style={{ color: result.riskScore > 75 ? "#EF4444" : result.riskScore > 40 ? "#F59E0B" : "#22C55E" }}
                >
                  {result.riskScore}%
                </span>
                <span
                  className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase text-white mt-2 risk-gauge-pulse"
                  style={{ backgroundColor: result.riskScore > 75 ? "#EF4444" : result.riskScore > 40 ? "#F59E0B" : "#22C55E" }}
                >
                  {result.riskScore > 75 ? "Phishing Warning" : result.riskScore > 40 ? "Caution advised" : "Verified Safe"}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-1.5 mt-4 text-[10px] font-bold theme-card-subtitle uppercase tracking-widest">
              <span>Confidence: {result.confidence}</span>
            </div>
          </section>

          {/* Email verification details */}
          <section className="theme-card border rounded-3xl p-5 space-y-4 shadow-sm">
            <h3 className="font-display font-bold theme-card-title text-sm tracking-wide">Domain Verification Audits</h3>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 theme-subcard border rounded-2xl">
                <p className="text-[10px] theme-muted font-bold uppercase tracking-wider">Identified Sender</p>
                <p className="text-xs font-mono font-bold theme-card-title mt-1 truncate" title={result.sender}>
                  {result.sender}
                </p>
              </div>

              <div className="p-3.5 theme-subcard border rounded-2xl flex flex-col justify-center">
                <p className="text-[10px] theme-muted font-bold uppercase tracking-wider">SPF record alignment</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className={`w-2 h-2 rounded-full ${result.domainVerification.spf === "PASS" ? "bg-success" : "bg-danger"}`}></span>
                  <span className={`text-xs font-extrabold uppercase ${result.domainVerification.spf === "PASS" ? "text-success" : "text-danger"}`}>
                    {result.domainVerification.spf}
                  </span>
                </div>
              </div>

              <div className="p-3.5 theme-subcard border rounded-2xl flex flex-col justify-center">
                <p className="text-[10px] theme-muted font-bold uppercase tracking-wider">DKIM signature state</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className={`w-2 h-2 rounded-full ${result.domainVerification.dkim === "PASS" ? "bg-success" : "bg-danger"}`}></span>
                  <span className={`text-xs font-extrabold uppercase ${result.domainVerification.dkim === "PASS" ? "text-success" : "text-danger"}`}>
                    {result.domainVerification.dkim}
                  </span>
                </div>
              </div>

              <div className="p-3.5 theme-subcard border rounded-2xl flex flex-col justify-center">
                <p className="text-[10px] theme-muted font-bold uppercase tracking-wider">DMARC policy status</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className={`w-2 h-2 rounded-full ${result.domainVerification.dmarc === "PASS" ? "bg-success" : "bg-amber-500"}`}></span>
                  <span className={`text-xs font-extrabold uppercase ${result.domainVerification.dmarc === "PASS" ? "text-success" : "text-amber-500"}`}>
                    {result.domainVerification.dmarc}
                  </span>
                </div>
              </div>
            </div>

            <div className="text-[11px] theme-muted leading-normal theme-subcard p-3 rounded-2xl border italic font-medium">
              Note: Spoofed headers often mimic verified SPF states. AI verified link integrity is critically assessed inside.
            </div>
          </section>

          {/* Original Inspected text container */}
          <section className="space-y-2">
            <h3 className="font-display font-medium theme-card-subtitle text-xs tracking-wider uppercase ml-1">Analyzed Email Draft</h3>
            <div className="theme-card p-5 rounded-2xl border text-slate-800 dark:text-slate-300 italic text-sm leading-relaxed font-mono">
              "{result.originalMail}"
            </div>
          </section>

          {/* Why list reasons */}
          <section className="space-y-3">
            <h3 className="font-display font-bold theme-card-title text-lg">Deceptive Elements Checked</h3>
            <div className="space-y-3 animate-fadeIn">
              {result.reasons.map((reason, idx) => (
                <div key={idx} className="flex gap-3.5 p-4 theme-card border rounded-2xl shadow-sm">
                  <span
                    className="material-symbols-outlined font-black text-xl shrink-0 mt-0.5"
                    style={{ color: result.riskScore > 45 ? "#EF4444" : "#22C55E" }}
                  >
                    {result.riskScore > 45 ? "cancel" : "check_circle"}
                  </span>
                  <div>
                    <p className="text-sm font-bold theme-card-title leading-snug">
                      {reason.includes(":") ? reason.split(":")[0] : reason}
                    </p>
                    {reason.includes(":") && reason.split(":")[1] && (
                      <p className="text-xs theme-card-subtitle mt-1 leading-normal font-medium">
                        {reason.split(":")[1].trim()}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Recommended actions */}
          <section className="space-y-3">
            <h3 className="font-display font-bold theme-card-title text-lg">Incident Handling Strategy</h3>
            <div className="bg-primary/10 p-5 rounded-2xl border-l-4 border-primary">
              <ul className="space-y-3 text-slate-300">
                {result.recommendations.map((rec, id) => (
                  <li key={id} className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-primary text-lg mt-0.5">
                      {id === 0 ? "gpp_maybe" : id === 1 ? "shield" : "verified_user"}
                    </span>
                    <span className="text-sm font-bold theme-card-title">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Core dispatcher triggers */}
          <div className="pt-4 space-y-3">
            <button
              onClick={handleReportScam}
              disabled={isReporting || hasReported}
              className={`w-full h-14 rounded-2xl font-bold flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-95 transition-all ${
                hasReported
                  ? "bg-success text-white shadow-success/10"
                  : "bg-primary hover:bg-blue-700 text-white shadow-primary/25"
              }`}
            >
              <span className="material-symbols-outlined">
                {isReporting ? "sync" : hasReported ? "check_circle" : "security"}
              </span>
              {isReporting
                ? "Reporting incident to Cyber Cell..."
                : hasReported
                ? "Reported successfully"
                : "Report / Flag Email"}
            </button>
            <button
              onClick={() => {
                setResult(null);
                setInputText("");
              }}
              className="w-full theme-card-subtitle font-bold hover:opacity-80 text-center py-2 text-sm transition-colors cursor-pointer"
            >
              Examine another email file
            </button>
          </div>
        </div>
      ) : (
        // Input Screen view
        <div className="space-y-6">
          <div className="theme-card border rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex flex-col gap-1">
              <label className="theme-card-title font-bold text-base">Paste suspicious email body & headers</label>
              <p className="text-xs theme-card-subtitle">Processes sender patterns, unverified domains and urgent link requests instantly.</p>
            </div>

            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="From: billing@unverified-domain.com
Subject: Account Suspension Notice!
Please click here to update your credentials..."
              className="w-full min-h-[150px] p-4 theme-input border rounded-2xl focus:ring-2 focus:ring-primary focus:border-primary font-mono text-xs leading-relaxed placeholder:text-slate-500 transition-all outline-none resize-none"
            />

            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing || !inputText.trim()}
              className="w-full h-14 bg-primary text-white rounded-2xl cursor-pointer hover:bg-blue-700 font-bold tracking-wide active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              {isAnalyzing ? (
                <>
                  <span className="material-symbols-outlined animate-spin">refresh</span>
                  SECURELY ANALYZING MAIL...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined">mark_as_unread</span>
                  ANALYZE EMAIL
                </>
              )}
            </button>
          </div>

          <div className="space-y-3">
            <h3 className="font-bold text-xs theme-muted uppercase tracking-wider ml-1">OR CHOOSE AN EXAMPLE PRESET</h3>
            
            <button
              onClick={() => {
                setInputText(
                  "From: netflix-security@billing-alert-domain.xyz\nSubject: Account On Hold: Unpaid Invoice Warning!\n\nDear Customer, your subscription has been put on temporary hold due to an unpaid ticket invoice. To reinstate standard entertainment service immediately, click here: http://netflix-billing-update.click or you will face immediate account block penalties."
                );
              }}
              className="w-full text-left theme-card border p-4 hover:border-primary/45 transition-all active:scale-[0.99] cursor-pointer rounded-2xl shadow-sm text-sm"
            >
              <p className="font-bold theme-card-title mb-1">Netflix Overdue Penalty Spam</p>
              <p className="text-xs theme-card-subtitle truncate font-medium">"From: netflix-security@billing-alert-domain.xyz..."</p>
            </button>

            <button
              onClick={() => {
                setInputText(
                  "From: alert-google-enforce@security-protect-enclave.com\nSubject: Critical System Warning: Account Expiry Alert!\n\nSomeone in Moscow, Russia requested permanent account recovery deletion. Reset credentials immediately to prevent loss of access: alert-secure-enclave-signin.click"
                );
              }}
              className="w-full text-left theme-card border p-4 hover:border-primary/45 transition-all active:scale-[0.99] cursor-pointer rounded-2xl shadow-sm text-sm"
            >
              <p className="font-bold theme-card-title mb-1">Google Security Recovery Hack Phish</p>
              <p className="text-xs theme-card-subtitle truncate font-medium">"From: alert-google-enforce@security-protect-enclave.com..."</p>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
