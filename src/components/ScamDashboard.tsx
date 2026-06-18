import React from "react";

interface ScamDashboardProps {
  onBack: () => void;
}

export default function ScamDashboard({ onBack }: ScamDashboardProps) {
  // Constant trends details so that visual reports populate flawlessly
  const CATEGORIES = [
    { name: "UPI Payment Fraud", value: 42, color: "bg-red-500", text: "text-red-500" },
    { name: "KYC Suspension Hooks", value: 28, color: "bg-amber-500", text: "text-amber-500" },
    { name: "Lottery Cash Prize Claims", value: 18, color: "bg-blue-500", text: "text-blue-500" },
    { name: "Fake Police Traps", value: 12, color: "bg-slate-500", text: "text-slate-500" }
  ];

  const HOT_KEYWORDS = [
    { tag: "SBI KYC update", weight: "text-lg font-black text-danger-600 bg-red-50" },
    { tag: "One-Time-Password request", weight: "text-base font-black text-amber-600 bg-amber-50" },
    { tag: "Credit Block alert", weight: "text-sm font-bold text-slate-700 bg-slate-50" },
    { tag: "Baill money deposit", weight: "text-xs font-bold text-slate-600 bg-slate-50" },
    { tag: "KBC reward cash", weight: "text-base font-bold text-blue-600 bg-blue-50" },
    { tag: "PAN card identity", weight: "text-xs font-semibold text-slate-500 bg-slate-50" },
    { tag: "Arrest warrant threat", weight: "text-sm font-black text-red-600 bg-red-50" }
  ];

  const TARGETED_GROUPS = [
    { group: "Senior Citizens", rate: 58, icon: "elderly", trend: "Increasing", desc: "Targeted primarily via fake bank kyc block calls and high-stress police threats." },
    { group: "Housewives & Earners", rate: 26, icon: "groups", trend: "Stable", desc: "Targeted with work-from-home tasks, online reviews part-time hooks." },
    { group: "Students & Youth", rate: 16, icon: "school", trend: "Emerging", desc: "Targeted with fake gaming reward items, mobile wallets cashback coupons." }
  ];

  return (
    <div className="space-y-lg pb-12">
      {/* Back button title nav */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-slate-100 text-slate-600 transition-transform active:scale-90 cursor-pointer"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h2 className="text-display text-2xl font-extrabold text-slate-900">Scam Trends</h2>
      </div>

      {/* Indian cyber threat banner alerts */}
      <section className="bg-danger text-white rounded-3xl p-5 overflow-hidden relative shadow-md shadow-danger/10 flex gap-4 items-start select-none">
        <div className="w-11 h-11 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-white animate-pulse">campaign</span>
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h4 className="text-display text-sm font-bold uppercase tracking-widest leading-none">NATIONWIDE CRITICAL ALERT</h4>
            <span className="bg-white text-danger text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded">NEW</span>
          </div>
          <p className="text-xs opacity-90 leading-relaxed font-semibold">
            Spike spotted in simulated 'SFC Police kidnapping' calls targeting cities like Mumbai and Bengaluru. Sever line immediately if callers seek cash to prevent lockdowns.
          </p>
        </div>
      </section>

      {/* Donut segment category breakdown bar */}
      <section className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
        <h3 className="font-display font-bold text-slate-800 text-lg">Scam Category Distribution</h3>
        
        {/* Simplified multi-segment visual stack indicator */}
        <div className="h-6 rounded-full w-full bg-slate-100 overflow-hidden flex">
          {CATEGORIES.map((cat, idx) => (
            <div
              key={idx}
              className={`${cat.color} h-full transition-all`}
              style={{ width: `${cat.value}%` }}
              title={`${cat.name}: ${cat.value}%`}
            ></div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2">
          {CATEGORIES.map((cat, idx) => (
            <div key={idx} className="flex gap-2.5 items-start">
              <div className={`w-3.5 h-3.5 rounded-full mt-0.5 ${cat.color} shrink-0`}></div>
              <div>
                <p className="text-xs font-bold text-slate-800 leading-none">{cat.name}</p>
                <p className="text-[10px] text-slate-400 font-semibold mt-1">{cat.value}% of reported feeds</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Keywords bubble text tag cloud */}
      <section className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-display font-bold text-slate-800 text-lg">Trending Threat Terms</h3>
          <span className="text-[9px] text-slate-400 font-black tracking-wider uppercase bg-slate-100 px-2.5 py-1 rounded-full animate-pulse">
            LIVE ANALYTICS
          </span>
        </div>

        <div className="flex flex-wrap gap-2.5 justify-center py-2">
          {HOT_KEYWORDS.map((item, idx) => (
            <div
              key={idx}
              className={`px-3 py-1.5 rounded-2xl flex items-center gap-1.5 ${item.weight} transition-transform hover:scale-105 border border-slate-100 shadow-sm select-none`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
              <span className="font-semibold text-xs">{item.tag}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Demographics Targeted groups */}
      <section className="space-y-3">
        <h3 className="font-display font-medium text-slate-400 text-xs tracking-wider uppercase ml-1">Target Vulnerability Map</h3>
        
        <div className="space-y-3">
          {TARGETED_GROUPS.map((target, idx) => (
            <div key={idx} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm gap-4 flex hover:border-slate-200 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-primary flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[28px]">{target.icon}</span>
              </div>
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-display font-bold text-base text-slate-800 leading-none">{target.group}</h4>
                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                    target.trend === "Increasing" ? "bg-red-50 text-danger" : target.trend === "Stable" ? "bg-blue-50 text-primary" : "bg-green-50 text-success"
                  }`}>
                    {target.trend}
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">{target.rate}% of overall attacks</p>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">{target.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
