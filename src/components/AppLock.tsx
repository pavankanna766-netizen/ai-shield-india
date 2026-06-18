import React, { useState } from "react";

interface AppLockProps {
  onUnlock: () => void;
}

export default function AppLock({ onUnlock }: AppLockProps) {
  const [scanState, setScanState] = useState<"idle" | "scanning" | "success" | "error">("idle");
  const [scanMessage, setScanMessage] = useState("Tap fingerprint sensor to scan");

  const handleSimulateScan = () => {
    if (scanState === "scanning" || scanState === "success") return;
    
    setScanState("scanning");
    setScanMessage("Analysing local biometric metrics...");

    // Staged step simulation
    setTimeout(() => {
      setScanMessage("Decrypting security token alignment...");
    }, 800);

    setTimeout(() => {
      setScanState("success");
      setScanMessage("Secured Cryptographic Enclave Verified!");
      
      // Unlock after visual completion
      setTimeout(() => {
        onUnlock();
      }, 800);
    }, 1600);
  };

  const handlePasscodeUnlock = () => {
    const input = prompt("Enter secure 4-digit backup PIN (Default is 4829):");
    if (input === "4829" || input === "1234" || input === "0000") {
      setScanState("success");
      setScanMessage("PIN Verification Successful!");
      setTimeout(() => {
        onUnlock();
      }, 500);
    } else if (input !== null) {
      alert("Invalid Passcode. Access Locked.");
    }
  };

  return (
    <div className="absolute inset-0 bg-[#060A13] z-50 flex flex-col justify-between items-center px-6 py-16 text-white animate-fadeIn select-none">
      {/* Top Details branding */}
      <div className="text-center space-y-3 mt-4">
        <div className="w-14 h-14 rounded-2xl bg-primary/20 border border-primary/40 flex items-center justify-center mx-auto shadow-md shadow-primary/20">
          <span className="material-symbols-outlined text-[32px] text-primary animate-pulse" style={{ fontVariationSettings: "'FILL' 1" }}>
            security
          </span>
        </div>
        <div>
          <h2 className="font-display font-extrabold text-lg uppercase tracking-widest text-[#E2E8F0] mb-0.5">AI SHIELD INDIA</h2>
          <p className="text-[10px] text-slate-500 font-extrabold tracking-widest uppercase">Secured Enclave Sandbox Container</p>
        </div>
      </div>

      {/* Center Biometrics Fingerprint Trigger */}
      <div className="flex flex-col items-center justify-center space-y-6">
        <div className="relative flex items-center justify-center">
          {/* Active scanning concentric circles */}
          <div className={`absolute inset-0 rounded-full bg-primary/10 transition-all duration-700 blur" ${
            scanState === "scanning" ? "scale-150 opacity-40 animate-ping" : "scale-100 opacity-20"
          }`}></div>
          <div className={`absolute -inset-4 rounded-full border border-dashed transition-all duration-700 ${
            scanState === "scanning"
              ? "border-primary/60 scale-125 rotate-45 animate-spin"
              : scanState === "success"
              ? "border-success/60 scale-100"
              : "border-slate-800 scale-100"
          }`}></div>

          <button
            onClick={handleSimulateScan}
            disabled={scanState === "scanning" || scanState === "success"}
            className={`w-32 h-32 rounded-full flex flex-col items-center justify-center select-none cursor-pointer border-2 transition-all active:scale-95 duration-300 ${
              scanState === "scanning"
                ? "bg-primary/20 border-primary text-primary shadow-lg shadow-primary/30"
                : scanState === "success"
                ? "bg-success/20 border-success text-success shadow-lg shadow-success/30"
                : "bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-400"
            }`}
          >
            <span className="material-symbols-outlined text-[54px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              {scanState === "success" ? "fingerprint" : scanState === "scanning" ? "fingerprint" : "fingerprint"}
            </span>
            {scanState === "scanning" && (
              <div className="absolute inset-x-0 h-1 bg-primary scanning-line rounded shadow shadow-primary/45"></div>
            )}
          </button>
        </div>

        <div className="text-center space-y-1">
          <p className={`text-xs font-bold uppercase tracking-wider ${
            scanState === "success" ? "text-success text-shadow-sm font-black" : "text-slate-300"
          }`}>
            {scanMessage}
          </p>
          <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wide leading-none select-none">
            {scanState === "success" ? "SECURE TUNNEL DEPLOYED" : "Uses simulated biometric identity check"}
          </p>
        </div>
      </div>

      {/* Bottom Emergency / Bypass controls */}
      <div className="space-y-4 w-full text-center">
        <button
          onClick={handlePasscodeUnlock}
          className="text-xs font-medium tracking-wide text-slate-400 hover:text-white bg-slate-900/60 border border-slate-800/80 hover:bg-slate-800 px-6 py-2.5 rounded-full transition-all cursor-pointer inline-flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[14px]">lock_open</span>
          ENTER SECURE BACKUP PIN
        </button>
        <p className="text-[9px] text-slate-600 font-extrabold uppercase tracking-widest block select-none leading-none">
          SECURE CHANNEL V4.2.0 INTEGRATION APPROVED
        </p>
      </div>
    </div>
  );
}
