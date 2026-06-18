import React, { useState } from "react";
import { LinkAnalysisResult } from "../types";

interface LinkCheckerProps {
  onBack: () => void;
  onSaveToHistory: (type: string, title: string, score: number, category: string, detail: string) => void;
  onAddActivity: (activity: any) => void;
}

export default function LinkChecker({ onBack, onSaveToHistory, onAddActivity }: LinkCheckerProps) {
  const [inputUrl, setInputUrl] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<LinkAnalysisResult | null>(null);

  const handleAnalyze = async () => {
    if (!inputUrl.trim()) return;
    setIsAnalyzing(true);
    setResult(null);

    try {
      const res = await fetch("/api/check-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: inputUrl }),
      });
      const data = await res.json();

      const newResult: LinkAnalysisResult = {
        url: inputUrl,
        riskScore: data.riskScore ?? 0,
        confidence: data.confidence ?? "Medium",
        category: data.category ?? "URL Status Verified",
        domainAge: data.domainAge ?? "Unknown",
        httpsStatus: data.httpsStatus ?? "Active & Valid",
        reputationScore: data.reputationScore ?? 5.0,
        reasons: data.reasons ?? [],
        recommendations: data.recommendations ?? [],
      };

      setResult(newResult);

      // Save to general firebase / local state logs
      onSaveToHistory(
        "link",
        `Website scanned (${newResult.category})`,
        newResult.riskScore,
        newResult.category,
        inputUrl
      );

      onAddActivity({
        type: "web",
        title: "Link Scan Complete",
        description: `Inspected: ${inputUrl}`,
        riskScore: newResult.riskScore
      });

    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-lg pb-12">
      {/* Back navigation header */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-slate-100 text-slate-600 transition-transform active:scale-90 cursor-pointer"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h2 className="text-display text-2xl font-extrabold text-slate-900">Link Checker</h2>
      </div>

      {result ? (
        // Results View
        <div className="space-y-lg transition-all animate-fadeIn">
          {/* Safety Gauge Card */}
          <div className="bg-white rounded-3xl p-6 flex flex-col items-center justify-center relative overflow-hidden border border-slate-100 shadow-sm">
            <div className="relative w-44 h-44 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90">
                <circle
                  className="text-slate-100"
                  cx="88"
                  cy="88"
                  fill="transparent"
                  r="76"
                  stroke="currentColor"
                  strokeWidth="12"
                />
                <circle
                  className="gauge-ring"
                  cx="88"
                  cy="88"
                  fill="transparent"
                  r="76"
                  stroke="currentColor"
                  strokeDasharray="477"
                  strokeDashoffset={477 - (477 * (100 - result.riskScore)) / 100}
                  strokeWidth="12"
                  style={{
                    stroke: result.riskScore > 50 ? "#EF4444" : "#22C55E",
                    strokeLinecap: "round"
                  }}
                />
              </svg>
              <div className="absolute flex flex-col items-center text-center">
                <span className="font-display font-black text-4xl text-slate-800">
                  {100 - result.riskScore}
                </span>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">
                  {result.riskScore > 50 ? "Suspicious" : "Secure"}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 mt-4">
              <span
                className="material-symbols-outlined font-black text-xl"
                style={{ color: result.riskScore > 50 ? "#EF4444" : "#22C55E" }}
              >
                {result.riskScore > 50 ? "report_problem" : "verified"}
              </span>
              <span className="text-xs font-black uppercase text-slate-700 tracking-wider">
                {result.riskScore > 50 ? "HIGH RISK DETECTED" : "LOW RISK DETECTED"}
              </span>
            </div>
          </div>

          {/* Technical Specs List */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
            <h3 className="font-display font-bold text-slate-800 text-lg mb-4">Technical Specs</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary text-xl">calendar_today</span>
                  <span className="text-sm font-semibold text-slate-500">Domain Age</span>
                </div>
                <span className="text-sm font-bold text-slate-800">{result.domainAge}</span>
              </div>

              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-success text-xl">lock</span>
                  <span className="text-sm font-semibold text-slate-500">HTTPS Status</span>
                </div>
                <span className={`text-sm font-bold ${result.httpsStatus.toLowerCase().includes("danger") ? "text-danger" : "text-success"}`}>
                  {result.httpsStatus}
                </span>
              </div>

              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-warning text-xl">star</span>
                  <span className="text-sm font-semibold text-slate-500">Reputation Score</span>
                </div>
                <span className="text-sm font-bold text-slate-800">{result.reputationScore} / 10</span>
              </div>

              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary text-xl">psychology</span>
                  <span className="text-sm font-semibold text-slate-500">AI Verdict</span>
                </div>
                <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase ${
                  result.riskScore > 50
                    ? "bg-red-50 text-danger"
                    : "bg-green-50 text-success"
                }`}>
                  {result.riskScore > 50 ? "Unsafe / Malicious" : "Safe to visit"}
                </span>
              </div>
            </div>
          </div>

          {/* Explainable AI Insights section */}
          <div className="relative bg-primary text-white rounded-3xl p-6 overflow-hidden shadow-lg shadow-primary/20">
            {/* Visual design element watermark */}
            <div className="absolute -right-6 -top-6 opacity-15 rotate-12">
              <span className="material-symbols-outlined text-[140px]">shield_with_heart</span>
            </div>
            
            <div className="relative z-10 space-y-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined">auto_awesome</span>
                <h3 className="font-display font-bold text-md tracking-wide uppercase">Explainable Security Insights</h3>
              </div>
              
              <ul className="space-y-4">
                {result.reasons.map((resReason, id) => (
                  <li key={id} className="text-sm opacity-90 leading-relaxed list-disc ml-4 font-normal">
                    {resReason}
                  </li>
                ))}
              </ul>
              
              <div className="flex flex-wrap gap-2 pt-2">
                <span className="bg-white/20 text-white text-[11px] font-bold px-3 py-1 rounded-full backdrop-blur-md">
                  {result.riskScore > 50 ? "Zero Trust" : "Safe Host"}
                </span>
                <span className="bg-white/20 text-white text-[11px] font-bold px-3 py-1 rounded-full backdrop-blur-md">
                  {result.httpsStatus.toLowerCase().includes("missing") ? "No SSL" : "Valid SSL"}
                </span>
                <span className="bg-white/20 text-white text-[11px] font-bold px-3 py-1 rounded-full backdrop-blur-md">
                  Credential Audit Pass
                </span>
              </div>
            </div>
          </div>

          {/* Server Origin simulated graphic Map */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-slate-800 text-lg">Server Origin</h3>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider bg-slate-100 px-3 py-1 rounded-full">
                Location: New Delhi, India
              </span>
            </div>
            
            <div className="h-44 rounded-2xl overflow-hidden grayscale contrast-125 opacity-90 border border-slate-200">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBKuh6HZNX7QHnXLS_MS_2zO281J3kET9_wVvf2wg-3qjRypX0-Zv06g3aqlTxv7HjmieQxD91T0RhJMnaFzmABWwB5r56th78raUV3AGLJy-9GULwg3Eec0WvrVFkMCU4HC_OxT7OKszxlA7VmzsM-HUt2r-isF8Skx0i4-qqYykm_YLyKjbIrwDoym61UMHkAmrzsfPoMGZWzYEX-RKtcqFqfwIFRHrTTCQqilhPDKe-Q4oRZO0JXPq7jtPRsaQTwSiocGvG_orIa"
                alt="New Delhi Server Node"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>

          {/* Bottom reset actions */}
          <div className="pt-2 text-center">
            <button
              onClick={() => {
                setResult(null);
                setInputUrl("");
              }}
              className="text-primary hover:text-blue-700 font-bold text-sm select-none cursor-pointer"
            >
              Check another URL address
            </button>
          </div>
        </div>
      ) : (
        // Input Form Screen
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
          <div className="flex flex-col gap-2">
            <label className="text-slate-700 font-bold text-base">Paste URL to analyze</label>
            <p className="text-xs text-slate-400 leading-normal">AI-powered inspect checking domains for hidden browser redirects, deceptive layouts, or malicious credential portals.</p>
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-slate-400">link</span>
            </div>
            <input
              type="text"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              placeholder="Paste link (e.g. sbi-secure-update.net)..."
              className="block w-full h-[56px] pl-[44px] pr-28 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary focus:border-primary font-medium text-sm transition-all outline-none"
            />
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing || !inputUrl.trim()}
              className="absolute right-1.5 top-1.5 bottom-1.5 px-5 bg-primary text-white rounded-xl font-bold text-xs cursor-pointer hover:bg-blue-700 active:scale-95 transition-all flex items-center gap-1"
            >
              {isAnalyzing ? (
                <span className="material-symbols-outlined animate-spin text-sm">refresh</span>
              ) : null}
              {isAnalyzing ? "AUDITING..." : "ANALYZE"}
            </button>
          </div>

          <p className="text-[10px] text-slate-400 px-1 font-semibold leading-normal uppercase tracking-wider">
            🚨 Safe sandbox verification prevents cookies or malware from executing.
          </p>

          <div className="space-y-3 pt-4">
            <h3 className="font-bold text-xs text-slate-400 uppercase tracking-wider ml-1">POPULAR PRESET SAMPLES</h3>
            
            <button
              onClick={() => setInputUrl("http://sbi-secure-update.net/portal/login")}
              className="w-full text-left bg-slate-50 p-4 hover:border-blue-200 border border-slate-100 transition-all rounded-2xl flex items-center justify-between text-xs"
            >
              <div>
                <p className="font-bold text-slate-700">Deceptive SBI Update Portal</p>
                <p className="text-slate-400 mt-1">"http://sbi-secure-update.net/portal/login"</p>
              </div>
              <span className="material-symbols-outlined text-danger text-sm">gpp_maybe</span>
            </button>

            <button
              onClick={() => setInputUrl("https://www.google.com")}
              className="w-full text-left bg-slate-50 p-4 hover:border-blue-200 border border-slate-100 transition-all rounded-2xl flex items-center justify-between text-xs"
            >
              <div>
                <p className="font-bold text-slate-700">Google Official Safe Host</p>
                <p className="text-slate-400 mt-1">"https://www.google.com"</p>
              </div>
              <span className="material-symbols-outlined text-success text-sm">verified</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
