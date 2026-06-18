import React from "react";
import { RecentActivity } from "../types";

interface HomeViewProps {
  onSelectTool: (tool: string) => void;
  recentActivities: RecentActivity[];
  isScanning: boolean;
  onTriggerScan: () => void;
}

export default function HomeView({ onSelectTool, recentActivities, isScanning, onTriggerScan }: HomeViewProps) {
  return (
    <div className="space-y-6 pb-12 theme-text">
      {/* Welcome Hero Grid */}
      <section className="text-center md:py-4">
        <h1 className="text-display text-4xl font-extrabold tracking-tight theme-card-title mb-1">Good Evening 👋</h1>
        <p className="theme-card-subtitle font-medium text-sm">Stay Safe • Threat Protection Active</p>
      </section>

      {/* Central Interactive Protection Pulse Button */}
      <section className="flex flex-col items-center justify-center py-6 mb-2">
        <div className="relative group">
          {/* Outer Ambient Glow Systems */}
          <div className="absolute inset-0 bg-primary/20 rounded-full pulse-effect blur-xl"></div>
          <div className="absolute inset-0 bg-primary/10 rounded-full pulse-effect blur-2xl scale-125"></div>
          
          <button
            onClick={onTriggerScan}
            disabled={isScanning}
            className={`relative z-10 w-48 h-48 rounded-full text-white flex flex-col items-center justify-center glow-button transition-all duration-300 active:scale-95 shadow-xl border-4 select-none cursor-pointer ${
              isScanning 
                ? "bg-amber-500 border-amber-400/40 scale-105 shadow-amber-500/20" 
                : "bg-primary border-primary/40 hover:bg-blue-600 shadow-primary/25"
            }`}
          >
            <span className="material-symbols-outlined text-[68px] mb-1 animate-pulse" style={{ fontVariationSettings: "'FILL' 1" }}>
              {isScanning ? "change_circle" : "verified_user"}
            </span>
            <span className="font-display font-black text-sm uppercase tracking-widest text-shadow-sm">
              {isScanning ? "Scanning..." : "Protect Me"}
            </span>
            <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none"></div>
          </button>
        </div>

        <p className="mt-6 font-semibold text-xs tracking-wider text-primary flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full border border-primary/20">
          <span className={`w-2.5 h-2.5 rounded-full ${isScanning ? "bg-amber-500 animate-spin" : "bg-success animate-pulse"}`}></span>
          {isScanning ? "DEEP CRITICAL SCANNING ACTIVE" : "SHIELD ACTIVE • SCANNING ENVIRONMENTS"}
        </p>
      </section>

      {/* Security Suite Bento Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-display text-lg font-extrabold theme-card-title">Detection Shield Suite</h2>
          <span className="text-[10px] font-black text-primary tracking-widest uppercase bg-primary/10 px-3 py-1 rounded-full border border-primary/10">
            SECURE PORTS
          </span>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {/* Check Email / Mail Analyzer */}
          <button
            id="tool-mail"
            onClick={() => onSelectTool("mail")}
            className="bento-card text-left theme-card p-5 rounded-3xl cursor-pointer hover:shadow-md border hover:border-primary/45 transition-all active:scale-[0.98] group relative overflow-hidden"
          >
            <div className="absolute -right-6 -bottom-6 w-16 h-16 bg-primary/5 rounded-full blur-xl group-hover:scale-150 transition-transform"></div>
            <div className="w-11 h-11 rounded-2xl bg-primary/10 border border-primary/25 text-primary flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
              <span className="material-symbols-outlined font-semibold">mark_as_unread</span>
            </div>
            <div className="inline-flex items-center gap-1 mb-1.5">
              <h3 className="font-display font-extrabold text-[15px] theme-card-title leading-none">Analyze Email</h3>
              <span className="bg-success text-slate-950 font-black text-[7px] px-1 rounded uppercase tracking-wider scale-90 leading-none py-0.5">AI</span>
            </div>
            <p className="theme-card-subtitle text-xs leading-normal">Check SPF, DKIM & Links</p>
          </button>

          {/* Bento Tool 1 */}
          <button
            id="tool-msg"
            onClick={() => onSelectTool("message")}
            className="bento-card text-left theme-card p-5 rounded-3xl cursor-pointer hover:shadow-md border hover:border-primary/45 transition-all active:scale-[0.98] group relative overflow-hidden"
          >
            <div className="absolute -right-6 -bottom-6 w-16 h-16 bg-blue-500/5 rounded-full blur-xl group-hover:scale-150 transition-transform"></div>
            <div className="w-11 h-11 rounded-2xl bg-primary/10 border border-primary/25 text-primary flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
              <span className="material-symbols-outlined font-semibold">chat_bubble</span>
            </div>
            <h3 className="font-display font-bold text-[15px] theme-card-title mb-1 leading-snug">Analyze Chat</h3>
            <p className="theme-card-subtitle text-xs leading-normal">Check SMS & WhatsApp</p>
          </button>

          {/* Bento Tool 2 */}
          <button
            id="tool-web"
            onClick={() => onSelectTool("link")}
            className="bento-card text-left theme-card p-5 rounded-3xl cursor-pointer hover:shadow-md border hover:border-primary/45 transition-all active:scale-[0.98] group relative overflow-hidden"
          >
            <div className="absolute -right-6 -bottom-6 w-16 h-16 bg-blue-500/5 rounded-full blur-xl group-hover:scale-150 transition-transform"></div>
            <div className="w-11 h-11 rounded-2xl bg-primary/10 border border-primary/25 text-primary flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
              <span className="material-symbols-outlined font-semibold">link</span>
            </div>
            <h3 className="font-display font-bold text-[15px] theme-card-title mb-1 leading-snug">Verify Website</h3>
            <p className="theme-card-subtitle text-xs leading-normal">Identify Domain Phish</p>
          </button>

          {/* Bento Tool 3 */}
          <button
            id="tool-qr"
            onClick={() => onSelectTool("qr")}
            className="bento-card text-left theme-card p-5 rounded-3xl cursor-pointer hover:shadow-md border hover:border-primary/45 transition-all active:scale-[0.98] group relative overflow-hidden"
          >
            <div className="absolute -right-6 -bottom-6 w-16 h-16 bg-blue-500/5 rounded-full blur-xl group-hover:scale-150 transition-transform"></div>
            <div className="w-11 h-11 rounded-2xl bg-primary/10 border border-primary/25 text-primary flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
              <span className="material-symbols-outlined font-semibold">qr_code_scanner</span>
            </div>
            <h3 className="font-display font-bold text-[15px] theme-card-title mb-1 leading-snug">Check UPI QR</h3>
            <p className="theme-card-subtitle text-xs leading-normal">Audit scan targets</p>
          </button>

          {/* Bento Tool 4 */}
          <button
            id="tool-screenshot"
            onClick={() => onSelectTool("screenshot")}
            className="bento-card text-left theme-card p-5 rounded-3xl cursor-pointer hover:shadow-md border hover:border-primary/45 transition-all active:scale-[0.98] group relative overflow-hidden"
          >
            <div className="absolute -right-6 -bottom-6 w-16 h-16 bg-blue-500/5 rounded-full blur-xl group-hover:scale-150 transition-transform"></div>
            <div className="w-11 h-11 rounded-2xl bg-primary/10 border border-primary/25 text-primary flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
              <span className="material-symbols-outlined font-semibold">screenshot</span>
            </div>
            <h3 className="font-display font-bold text-[15px] theme-card-title mb-1 leading-snug">Screen Security</h3>
            <p className="theme-card-subtitle text-xs leading-normal">Safeguard dialer overlays</p>
          </button>

          {/* Bento Tool 5 */}
          <button
            id="tool-voice"
            onClick={() => onSelectTool("voice")}
            className="bento-card text-left theme-card p-5 rounded-3xl cursor-pointer hover:shadow-md border hover:border-primary/45 transition-all active:scale-[0.98] group relative overflow-hidden"
          >
            <div className="absolute -right-6 -bottom-6 w-16 h-16 bg-blue-500/5 rounded-full blur-xl group-hover:scale-150 transition-transform"></div>
            <div className="w-11 h-11 rounded-2xl bg-primary/10 border border-primary/25 text-primary flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
              <span className="material-symbols-outlined font-semibold">mic</span>
            </div>
            <h3 className="font-display font-bold text-[15px] theme-card-title mb-1 leading-snug">Voice Cloning</h3>
            <p className="theme-card-subtitle text-xs leading-normal">Review sound footprints</p>
          </button>
        </div>
      </section>

      {/* Recent Activity List */}
      <section className="space-y-4">
        <h2 className="text-display text-lg font-extrabold theme-card-title px-1">Cryptographic Operations Log</h2>
        <div className="theme-card rounded-3xl border overflow-hidden divide-y divide-slate-100 dark:divide-slate-800/60 shadow-lg">
          {recentActivities.map((act) => {
            let iconCode = "verified_user";
            let colorClass = "bg-primary/10 text-primary border border-primary/20";

            if (act.type === "web") {
              iconCode = "public";
              colorClass = "bg-success/15 text-success border border-success/25";
            } else if (act.type === "shield" || act.type === "privacy") {
              iconCode = "security_update_good";
              colorClass = "bg-sky-500/10 text-sky-400 border border-sky-500/20";
            } else if (act.type === "voice" || act.type === "message" || act.type === "screenshot") {
              iconCode = "gpp_maybe";
              colorClass = act.riskScore && act.riskScore > 50 
                ? "bg-danger/15 text-danger border border-danger/25" 
                : "bg-warning/15 text-warning border border-warning/25";
            }

            return (
              <div key={act.id} className="p-4 flex items-center gap-4 hover:bg-black/5 dark:hover:bg-slate-800/40 transition-colors">
                <div className={`w-11 h-11 flex-shrink-0 rounded-full ${colorClass} flex items-center justify-center`}>
                  <span className="material-symbols-outlined text-[20px]">{iconCode}</span>
                </div>
                <div className="flex-grow min-w-0">
                  <p className="text-sm theme-card-title font-bold truncate leading-snug">{act.title}</p>
                  <p className="theme-card-subtitle text-xs truncate leading-normal font-medium">{act.description}</p>
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <span className="theme-muted text-[10px] font-semibold uppercase">{act.timestamp}</span>
                  {act.riskScore !== undefined && (
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                      act.riskScore > 75 
                        ? "bg-red-500/10 text-danger border border-red-900/30 animate-pulse" 
                        : act.riskScore > 40 
                        ? "bg-amber-500/10 text-warning border border-amber-900/30" 
                        : "bg-green-500/10 text-success border border-green-900/30"
                    }`}>
                      Score: {act.riskScore}%
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
