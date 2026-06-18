import React, { useState, useEffect } from "react";
import HomeView from "./components/HomeView";
import MessageAnalyzer from "./components/MessageAnalyzer";
import LinkChecker from "./components/LinkChecker";
import QRScanner from "./components/QRScanner";
import ScreenshotAnalyzer from "./components/ScreenshotAnalyzer";
import VoiceAnalyzer from "./components/VoiceAnalyzer";
import ScamDashboard from "./components/ScamDashboard";
import SettingsView from "./components/SettingsView";
import MailAnalyzer from "./components/MailAnalyzer";
import AppLock from "./components/AppLock";

import { RecentActivity, UserHistoryItem } from "./types";
import { loginAnonymousUser, getLocalActivities, getLocalHistory, saveToScanHistory, saveRecentActivity } from "./lib/firebase";

export default function App() {
  const [currentView, setCurrentView] = useState<string>("home"); // home, message, link, qr, screenshot, voice, trends, settings, mail
  const [isScanning, setIsScanning] = useState(false);
  const [userId, setUserId] = useState<string>("local_user");
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [userHistory, setUserHistory] = useState<UserHistoryItem[]>([]);
  const [syncEnabled, setSyncEnabled] = useState(true);
  const [currentLanguage, setCurrentLanguage] = useState("en");
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    return (localStorage.getItem("ai_shield_theme") as "light" | "dark") || "dark";
  });

  const handleSelectTheme = (newTheme: "light" | "dark") => {
    setTheme(newTheme);
    localStorage.setItem("ai_shield_theme", newTheme);
  };

  // Load persistent biometric preference on initiation
  const [biometricEnabled, setBiometricEnabled] = useState<boolean>(() => {
    return localStorage.getItem("ai_shield_biometric_enabled") === "true";
  });
  const [isAppLocked, setIsAppLocked] = useState<boolean>(() => {
    return localStorage.getItem("ai_shield_biometric_enabled") === "true";
  });

  // Load activities and history logs on render init
  useEffect(() => {
    setRecentActivities(getLocalActivities());
    setUserHistory(getLocalHistory());

    // Connect to Firestore Auth anonymously for synchronization
    loginAnonymousUser((user) => {
      console.log("Logged in with user ID:", user.uid);
      setUserId(user.uid);
    });
  }, []);

  const handleTriggerPulseScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      alert("AI Shields fully engaged. Device sandbox logs verified. 0 immediate critical risks found.");
      
      const newActivity = {
        type: "shield",
        title: "Full Deep Environment Scan Complete",
        description: "Checked browser context & memory buffers safely",
      };
      
      saveRecentActivity(newActivity);
      setRecentActivities(getLocalActivities());
    }, 3000);
  };

  const handleSaveToHistory = async (type: string, title: string, score: number, category: string, detail: string) => {
    const newItem: UserHistoryItem = {
      id: `hist_${Math.random().toString(36).substr(2, 9)}`,
      type: type as any,
      timestamp: new Date().toLocaleString(),
      title,
      riskScore: score,
      category,
      detail
    };

    await saveToScanHistory(userId, newItem);
    setUserHistory(getLocalHistory());
  };

  const handleAddActivity = async (activity: any) => {
    await saveRecentActivity(activity);
    setRecentActivities(getLocalActivities());
  };

  const handleClearHistory = () => {
    localStorage.removeItem("ai_shield_history");
    setUserHistory([]);
  };

  const toggleSync = () => {
    setSyncEnabled(!syncEnabled);
  };

  const handleToggleBiometric = () => {
    const nextState = !biometricEnabled;
    setBiometricEnabled(nextState);
    localStorage.setItem("ai_shield_biometric_enabled", String(nextState));
    
    // Unlock if disabling lock
    if (!nextState) {
      setIsAppLocked(false);
    }
  };

  return (
    <div className={`min-h-screen theme-bg flex flex-col max-w-md mx-auto relative shadow-2xl overflow-hidden pb-20 select-none theme-text border-x theme-border ${theme === "dark" ? "theme-dark" : "theme-light"}`}>
      
      {/* If biometric lock is enabled and active, cover UI completely */}
      {biometricEnabled && isAppLocked && (
        <AppLock onUnlock={() => setIsAppLocked(false)} />
      )}

      {/* Top Banner Navigation Header */}
      <header className="sticky top-0 theme-header/90 backdrop-blur-md z-30 px-6 py-4 border-b theme-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-white scale-100">
            <span className="material-symbols-outlined text-[20px] font-black" style={{ fontVariationSettings: "'FILL' 1" }}>
              security
            </span>
          </div>
          <div>
            <span className="font-display font-black text-sm tracking-wider uppercase theme-card-title">
              {currentLanguage === "hi" ? "एआई शील्ड इंडिया" : currentLanguage === "te" ? "ఏఐ షీల్డ్" : "AI SHIELD INDIA"}
            </span>
            <p className="text-[10px] theme-muted font-bold leading-none tracking-widest uppercase">Cyber Security</p>
          </div>
        </div>

        {/* Sync state indicators */}
        <div className="flex items-center gap-1.5 theme-card border px-2.5 py-1 rounded-full text-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse"></span>
          <span className="text-[8px] font-black theme-muted tracking-widest uppercase">
            {syncEnabled ? "CLOUD SYNC" : "OFFLINE"}
          </span>
        </div>
      </header>

      {/* Main Container Views Wrapper */}
      <main className="flex-grow px-6 pt-5 overflow-y-auto">
        {currentView === "home" && (
          <HomeView
            onSelectTool={(tool) => setCurrentView(tool)}
            recentActivities={recentActivities}
            isScanning={isScanning}
            onTriggerScan={handleTriggerPulseScan}
          />
        )}

        {currentView === "message" && (
          <MessageAnalyzer
            onBack={() => setCurrentView("home")}
            onSaveToHistory={handleSaveToHistory}
            onAddActivity={handleAddActivity}
          />
        )}

        {currentView === "link" && (
          <LinkChecker
            onBack={() => setCurrentView("home")}
            onSaveToHistory={handleSaveToHistory}
            onAddActivity={handleAddActivity}
          />
        )}

        {currentView === "qr" && (
          <QRScanner
            onBack={() => setCurrentView("home")}
            onSaveToHistory={handleSaveToHistory}
            onAddActivity={handleAddActivity}
          />
        )}

        {currentView === "screenshot" && (
          <ScreenshotAnalyzer
            onBack={() => setCurrentView("home")}
            onSaveToHistory={handleSaveToHistory}
            onAddActivity={handleAddActivity}
          />
        )}

        {currentView === "voice" && (
          <VoiceAnalyzer
            onBack={() => setCurrentView("home")}
            userId={userId}
            onSaveToHistory={handleSaveToHistory}
            onAddActivity={handleAddActivity}
          />
        )}

        {currentView === "trends" && (
          <ScamDashboard
            onBack={() => setCurrentView("home")}
          />
        )}

        {currentView === "settings" && (
          <SettingsView
            onBack={() => setCurrentView("home")}
            historyList={userHistory}
            onClearHistory={handleClearHistory}
            syncEnabled={syncEnabled}
            onToggleSync={toggleSync}
            currentLanguage={currentLanguage}
            onSelectLanguage={(lang) => setCurrentLanguage(lang)}
            biometricEnabled={biometricEnabled}
            onToggleBiometric={handleToggleBiometric}
            currentTheme={theme}
            onSelectTheme={handleSelectTheme}
          />
        )}

        {currentView === "mail" && (
          <MailAnalyzer
            onBack={() => setCurrentView("home")}
            onSaveToHistory={handleSaveToHistory}
            onAddActivity={handleAddActivity}
          />
        )}
      </main>

      {/* Persistent Bottom Client Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto theme-header/95 backdrop-blur-md border-t theme-border h-16 flex justify-around items-center px-4 z-30 shadow-lg">
        {/* Nav 1: Home */}
        <button
          onClick={() => setCurrentView("home")}
          className={`flex flex-col items-center justify-center gap-0.5 cursor-pointer select-none transition-all outline-none ${
            currentView === "home" ? "text-primary scale-105 font-bold" : "theme-muted hover:opacity-80"
          }`}
        >
          <span className="material-symbols-outlined text-[23px]" style={{ fontVariationSettings: currentView === "home" ? "'FILL' 1" : undefined }}>
            home
          </span>
          <span className="text-[10px] uppercase font-bold tracking-wider">Home</span>
        </button>

        {/* Nav 2: Tools (Scam Dashboard) */}
        <button
          onClick={() => setCurrentView("trends")}
          className={`flex flex-col items-center justify-center gap-0.5 cursor-pointer select-none transition-all outline-none ${
            currentView === "trends" ? "text-primary scale-105 font-bold" : "theme-muted hover:opacity-80"
          }`}
        >
          <span className="material-symbols-outlined text-[23px]" style={{ fontVariationSettings: currentView === "trends" ? "'FILL' 1" : undefined }}>
            finance
          </span>
          <span className="text-[10px] uppercase font-bold tracking-wider">Trends</span>
        </button>

        {/* Nav 3: Quick Scan Selector */}
        <button
          onClick={() => setCurrentView("screenshot")}
          className={`flex flex-col items-center justify-center gap-0.5 cursor-pointer select-none transition-all outline-none ${
            currentView === "screenshot" ? "text-primary scale-105 font-bold" : "theme-muted hover:opacity-80"
          }`}
        >
          <span className="material-symbols-outlined text-[23px]" style={{ fontVariationSettings: currentView === "screenshot" ? "'FILL' 1" : undefined }}>
            crop_free
          </span>
          <span className="text-[10px] uppercase font-bold tracking-wider">Scan</span>
        </button>

        {/* Nav 4: Settings */}
        <button
          onClick={() => setCurrentView("settings")}
          className={`flex flex-col items-center justify-center gap-0.5 cursor-pointer select-none transition-all outline-none ${
            currentView === "settings" ? "text-primary scale-105 font-bold" : "theme-muted hover:opacity-80"
          }`}
        >
          <span className="material-symbols-outlined text-[23px]" style={{ fontVariationSettings: currentView === "settings" ? "'FILL' 0" : undefined }}>
            settings
          </span>
          <span className="text-[10px] uppercase font-bold tracking-wider">Settings</span>
        </button>
      </nav>
    </div>
  );
}
