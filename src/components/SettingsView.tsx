import React, { useState } from "react";
import { UserHistoryItem } from "../types";
import { isFirebaseAvailable } from "../lib/firebase";

interface SettingsViewProps {
  onBack: () => void;
  historyList: UserHistoryItem[];
  onClearHistory: () => void;
  syncEnabled: boolean;
  onToggleSync: () => void;
  currentLanguage: string;
  onSelectLanguage: (lang: string) => void;
  biometricEnabled: boolean;
  onToggleBiometric: () => void;
  currentTheme: "light" | "dark";
  onSelectTheme: (theme: "light" | "dark") => void;
}

export default function SettingsView({
  onBack,
  historyList,
  onClearHistory,
  syncEnabled,
  onToggleSync,
  currentLanguage,
  onSelectLanguage,
  biometricEnabled,
  onToggleBiometric,
  currentTheme,
  onSelectTheme
}: SettingsViewProps) {
  const [activeTab, setActiveTab] = useState<"account" | "history">("account");

  const LANGUAGES = [
    { code: "en", label: "English" },
    { code: "hi", label: "हिन्दी (Hindi)" },
    { code: "te", label: "తెలుగు (Telugu)" }
  ];

  return (
    <div className="space-y-6 pb-12 theme-text">
      {/* Title nav bar */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-full flex items-center justify-center theme-card border hover:opacity-80 transition-transform active:scale-90 cursor-pointer"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h2 className="text-display text-2xl font-extrabold theme-card-title">Settings & Logs</h2>
      </div>

      {/* Tabs */}
      <div className="theme-card p-1.5 rounded-2xl border flex gap-2">
        <button
          onClick={() => setActiveTab("account")}
          className={`flex-1 h-11 rounded-xl text-xs font-bold leading-none cursor-pointer transition-all ${
            activeTab === "account" ? "bg-primary text-white shadow-md shadow-primary/20" : "theme-muted hover:opacity-80"
          }`}
        >
          Preferences
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`flex-1 h-11 rounded-xl text-xs font-bold leading-none cursor-pointer transition-all ${
            activeTab === "history" ? "bg-primary text-white shadow-md shadow-primary/20" : "theme-muted hover:opacity-80"
          }`}
        >
          Threat Audit ({historyList.length})
        </button>
      </div>

      {activeTab === "account" ? (
        // Preferences Views
        <div className="space-y-6 transition-all animate-fadeIn">
          {/* Theme Selector panel */}
          <div className="theme-card rounded-3xl p-6 border shadow-sm space-y-4">
            <div className="space-y-0.5">
              <h4 className="font-display font-bold text-base theme-card-title leading-snug">Visual Theme</h4>
              <p className="text-xs theme-card-subtitle">Choose between a premium high-contrast Light mode or the immersive Guard Dark theme.</p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                onClick={() => onSelectTheme("light")}
                className={`h-12 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  currentTheme === "light"
                    ? "bg-primary/10 border-primary text-primary shadow-sm"
                    : "theme-input border hover:opacity-85"
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">light_mode</span>
                Light Mode
              </button>
              <button
                onClick={() => onSelectTheme("dark")}
                className={`h-12 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  currentTheme === "dark"
                    ? "bg-primary/10 border-primary text-primary shadow-sm"
                    : "theme-input border hover:opacity-85"
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">dark_mode</span>
                Dark Mode
              </button>
            </div>
          </div>

          {/* Biometric App Lock panel */}
          <div className="theme-card rounded-3xl p-6 border shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5 max-w-[80%]">
                <h4 className="font-display font-bold text-base theme-card-title leading-snug">Biometric Secure Lock</h4>
                <p className="text-xs theme-card-subtitle">Protect reports and sensitive tools behind simulated fingerprint scan authorization.</p>
              </div>
              <button
                onClick={onToggleBiometric}
                className={`w-14 h-8 rounded-full p-1 transition-colors duration-300 relative cursor-pointer outline-none ${
                  biometricEnabled ? "bg-primary" : "bg-neutral-300 dark:bg-slate-800"
                }`}
              >
                <div className={`w-6 h-6 rounded-full bg-white shadow transition-all duration-300 absolute top-1 ${
                  biometricEnabled ? "left-7" : "left-1"
                }`}></div>
              </button>
            </div>
          </div>

          {/* Cloud Synchronization panel */}
          <div className="theme-card rounded-3xl p-6 border shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5 max-w-[80%]">
                <h4 className="font-display font-bold text-base theme-card-title leading-snug">Continuous Cloud Sync</h4>
                <p className="text-xs theme-card-subtitle">Sync all voice, query, and checklist parameters across all devices seamlessly.</p>
              </div>
              <button
                onClick={onToggleSync}
                className={`w-14 h-8 rounded-full p-1 transition-colors duration-300 relative cursor-pointer outline-none ${
                  syncEnabled ? "bg-primary" : "bg-neutral-300 dark:bg-slate-800"
                }`}
              >
                <div className={`w-6 h-6 rounded-full bg-white shadow transition-all duration-300 absolute top-1 ${
                  syncEnabled ? "left-7" : "left-1"
                }`}></div>
              </button>
            </div>

            <div className="h-[1px] theme-border border-t"></div>

            <div className="flex items-center gap-2 text-xs font-semibold theme-muted">
              <span className={`material-symbols-outlined text-[16px] ${isFirebaseAvailable ? "text-success animate-pulse" : "text-amber-500"}`}>
                {isFirebaseAvailable ? "cloud_done" : "info"}
              </span>
              <span>
                {isFirebaseAvailable 
                  ? "Firestore Durable Database fully operational." 
                  : "Database disconnected. Operating in secure offline mode."}
              </span>
            </div>
          </div>

          {/* Regional Languages select lists */}
          <div className="theme-card rounded-3xl p-6 border shadow-sm space-y-4">
            <h4 className="font-display font-bold text-base theme-card-title leading-snug">Multi-Language Protection</h4>
            <p className="text-xs theme-card-subtitle">Read and analyze threats in your preferred local language.</p>

            <div className="grid grid-cols-3 gap-2 pt-1">
              {LANGUAGES.map((lang, idx) => (
                <button
                  key={idx}
                  onClick={() => onSelectLanguage(lang.code)}
                  className={`h-12 rounded-xl text-xs font-bold border transition-colors cursor-pointer capitalize ${
                    currentLanguage === lang.code
                      ? "bg-blue-50/10 border-primary text-primary"
                      : "theme-input border hover:opacity-85"
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>

          {/* Security details checklist */}
          <div className="theme-card rounded-3xl p-6 border shadow-sm space-y-4">
            <h4 className="font-display font-bold text-base theme-card-title">Advanced Cyber Guard</h4>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-success">task_alt</span>
                <span className="text-xs font-semibold theme-card-subtitle">Simulated Dialer Intercept Enabled</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-success">task_alt</span>
                <span className="text-xs font-semibold theme-card-subtitle">UPI Sandbox Guard Active</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-success">task_alt</span>
                <span className="text-xs font-semibold theme-card-subtitle">SMS Verification v2.4 Integration OK</span>
              </div>
            </div>
          </div>

          {/* Clear memory trigger */}
          <div className="pt-2">
            <button
              onClick={() => {
                if (confirm("Are you sure you want to clear your local memory logs? This is irreversible.")) {
                  onClearHistory();
                  alert("Local reports wiped clean.");
                }
              }}
              className="w-full text-center text-xs font-black text-rose-500 hover:text-rose-600 transition-colors select-none cursor-pointer py-1"
            >
              WIPE LOCAL DATABASE MEMORY
            </button>
          </div>
        </div>
      ) : (
        // Reports Audit Histories log
        <div className="space-y-6 transition-all animate-fadeIn">
          {historyList.length === 0 ? (
            <div className="theme-card rounded-3xl p-8 border text-center space-y-4 shadow-sm">
              <span className="material-symbols-outlined theme-muted text-5xl animate-pulse">folder_zip</span>
              <p className="text-xs theme-card-subtitle font-bold leading-normal uppercase">Your threat audits logs is currently empty.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {historyList.map((item, idx) => (
                <div key={item.id || idx} className="theme-card p-5 rounded-3xl border shadow-sm flex items-start gap-4">
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                    item.riskScore > 60 ? "bg-red-500/10 text-danger animate-pulse" : "bg-green-500/10 text-success"
                  }`}>
                    <span className="material-symbols-outlined text-xl">
                      {item.type === "message" ? "chat_bubble" : item.type === "voice" ? "mic" : item.type === "mail" ? "mark_as_unread" : "security_update_good"}
                    </span>
                  </div>
                  
                  <div className="flex-grow min-w-0">
                    <p className="text-[10px] theme-muted font-bold uppercase tracking-wider">{item.timestamp}</p>
                    <h5 className="font-display font-extrabold text-sm theme-card-title leading-snug mt-0.5 truncate">{item.title}</h5>
                    <p className="text-xs theme-card-subtitle mt-1 truncate leading-normal italic font-medium">"{item.detail}"</p>
                  </div>

                  <span className={`px-2 py-0.5 rounded text-[9px] font-black shrink-0 ${
                    item.riskScore > 60 ? "bg-red-500/10 text-danger border border-red-900/30" : "bg-green-500/10 text-success border border-green-900/30"
                  }`}>
                    {item.riskScore}% RISK
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
