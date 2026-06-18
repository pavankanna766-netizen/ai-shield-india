import React, { useState } from "react";
import { QRAnalysisResult } from "../types";

interface QRScannerProps {
  onBack: () => void;
  onSaveToHistory: (type: string, title: string, score: number, category: string, detail: string) => void;
  onAddActivity: (activity: any) => void;
}

export default function QRScanner({ onBack, onSaveToHistory, onAddActivity }: QRScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<QRAnalysisResult | null>(null);
  const [scanType, setScanType] = useState<"camera" | "upload" | null>(null);
  const [cameraBlocked, setCameraBlocked] = useState(false);

  const startScan = (type: "camera" | "upload") => {
    setScanType(type);
    setIsScanning(true);
    setResult(null);

    if (type === "camera") {
      // Simulate real webcam initialization and block fallback
      setTimeout(() => {
        setCameraBlocked(true);
        setIsScanning(false);
      }, 1500);
    } else {
      // Image upload simulation flow
      setTimeout(() => {
        triggerSimulatedResult();
      }, 2000);
    }
  };

  const triggerSimulatedResult = () => {
    const mockResult: QRAnalysisResult = {
      merchantName: "Global Rewards Hub Inc.",
      destinationUrl: "https://secure-rewards-claim-772.verify-auth.xyz/portal/login",
      riskScore: 87,
      confidence: "High",
      category: "Deceptive UPI Payment Phishing",
      reasons: [
        "Domain Reputation: The target server host is registered under anonymous proxies with zero previous security history.",
        "Deceptive Redirection: The UPI QR code redirects to an unverified external portal posing as Google Pay reward distribution lists.",
        "Phishing Signatures: Form layout extracts confidential security codes upon loading."
      ],
      recommendations: [
        "Do not scan or complete UPI PIN authentications linked with this payload.",
        "Report fraud details to your default payment wallet instantly.",
        "Blacklist the reported merchant."
      ]
    };

    setResult(mockResult);
    setIsScanning(false);

    onSaveToHistory(
      "qr",
      `QR code scanned: ${mockResult.merchantName}`,
      mockResult.riskScore,
      mockResult.category,
      mockResult.destinationUrl
    );

    onAddActivity({
      type: "qr",
      title: "Suspicious QR Code Triggered",
      description: `Flagged: ${mockResult.merchantName}`,
      riskScore: mockResult.riskScore
    });
  };

  const handleBlockMerchant = () => {
    alert("Merchant blocked successfully across local system nodes.");
    onBack();
  };

  return (
    <div className="space-y-lg pb-12">
      {/* Title bar */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-slate-100 text-slate-600 transition-transform active:scale-90 cursor-pointer"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h2 className="text-display text-2xl font-extrabold text-slate-900">QR Scanner</h2>
      </div>

      {result ? (
        // Results View
        <div className="space-y-lg transition-all animate-fadeIn">
          {/* Main Hero status bento */}
          <section className="bg-white rounded-3xl p-6 border border-red-200 overflow-hidden relative shadow-sm">
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-danger opacity-5 rounded-full blur-3xl"></div>
            
            <div className="flex flex-col items-center text-center space-y-4 relative z-10">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-danger/10 flex items-center justify-center security-pulse">
                  <span className="material-symbols-outlined text-[48px] text-danger" style={{ fontVariationSettings: "'FILL' 1" }}>
                    gpp_maybe
                  </span>
                </div>
              </div>
              
              <div className="space-y-1">
                <h2 className="text-display text-2xl font-bold text-danger">Potential Threat Detected</h2>
                <p className="text-sm text-slate-500 font-medium">This QR code redirects to an unverified or high-risk destination.</p>
              </div>

              <div className="inline-flex items-center px-4 py-1.5 bg-danger/10 text-danger rounded-full gap-2">
                <span className="material-symbols-outlined text-sm font-black">report</span>
                <span className="font-bold text-xs uppercase tracking-wider">Risk Level: High ({result.riskScore}/100)</span>
              </div>
            </div>
          </section>

          {/* Merchant & URL specs card */}
          <section className="space-y-3">
            <h3 className="font-display font-medium text-slate-400 text-xs tracking-wider uppercase ml-1">Scan Details</h3>
            
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-primary">storefront</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-400 mb-0.5 uppercase tracking-wide">Reported Merchant</p>
                  <p className="font-display font-bold text-base text-slate-800 leading-snug">{result.merchantName}</p>
                </div>
              </div>

              <div className="h-[1px] bg-slate-100"></div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-primary">link</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-400 mb-0.5 uppercase tracking-wide">Destination URL</p>
                  <p className="text-sm font-semibold text-primary break-all leading-normal">{result.destinationUrl}</p>
                </div>
              </div>
            </div>
          </section>

          {/* Audit parameters */}
          <section className="space-y-3">
            <h3 className="font-display font-medium text-slate-400 text-xs tracking-wider uppercase ml-1">AI Security Audit</h3>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-danger">domain_verification</span>
                  <span className="text-sm font-semibold text-slate-700">Domain Reputation</span>
                </div>
                <span className="text-xs font-bold text-danger uppercase tracking-wider bg-red-50 px-3 py-1 rounded-full">Suspicious</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-success">encrypted</span>
                  <span className="text-sm font-semibold text-slate-700">SSL Certificate</span>
                </div>
                <span className="text-xs font-bold text-success uppercase tracking-wider bg-green-50 px-3 py-1 rounded-full">Valid</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-danger font-semibold">phishing</span>
                  <span className="text-sm font-semibold text-slate-700">Phishing Patterns</span>
                </div>
                <span className="text-xs font-bold text-danger uppercase tracking-wider bg-red-50 px-3 py-1 rounded-full">Detected</span>
              </div>
            </div>
          </section>

          {/* Actions */}
          <section className="flex flex-col gap-3 pt-3">
            <button
              onClick={handleBlockMerchant}
              className="w-full h-14 bg-danger text-white rounded-2xl cursor-pointer hover:bg-red-600 font-bold active:scale-95 transition-all shadow-lg shadow-danger/20 flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined">block</span>
              Block Access
            </button>
            <button
              onClick={() => {
                setResult(null);
                setScanType(null);
                setCameraBlocked(false);
              }}
              className="w-full h-14 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-2xl font-bold cursor-pointer active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              Scan another code
            </button>
          </section>
        </div>
      ) : isScanning ? (
        // Scanning in progress window
        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center space-y-6">
          <div className="relative w-44 h-44 border-4 border-primary rounded-3xl flex items-center justify-center overflow-hidden">
            {/* Visual scanning line indicator */}
            <div className="absolute inset-x-0 top-0 h-1 bg-primary pulse-effect shadow-md shadow-primary/45"></div>
            <span className="material-symbols-outlined text-[64px] text-primary/40 animate-pulse">qr_code_2</span>
          </div>

          <div className="space-y-2">
            <h3 className="font-display font-extrabold text-lg text-slate-800">Initializing Scanner Tool</h3>
            <p className="text-sm text-slate-500 font-medium">Checking certificates and hardware acceleration safeguards...</p>
          </div>
        </div>
      ) : cameraBlocked ? (
        // Camera permissions fail/unsupported fallback bento
        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm space-y-6 text-center">
          <div className="w-16 h-16 bg-warning/15 text-warning rounded-full flex items-center justify-center mx-auto animate-bounce">
            <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>videocam_off</span>
          </div>

          <div className="space-y-2">
            <h3 className="font-display font-bold text-lg text-slate-800">Camera Feed Blocked</h3>
            <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
              We cannot start raw video capture inside standard sandboxed page iFrame blocks. For security, please upload a camera photo or test standard demo payloads.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <button
              onClick={() => startScan("upload")}
              className="w-full h-12 bg-primary text-white rounded-2xl font-bold cursor-pointer hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-2 text-sm"
            >
              <span className="material-symbols-outlined text-base">upload_file</span>
              Upload QR Image File
            </button>
            <button
              onClick={triggerSimulatedResult}
              className="w-full h-12 border border-slate-200 text-slate-600 rounded-2xl font-bold cursor-pointer hover:bg-slate-50 active:scale-[0.98] transition-all flex items-center justify-center text-sm"
            >
              Trigger Demo Scan Result (UPI Spoof)
            </button>
          </div>
        </div>
      ) : (
        // Default Landing
        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm space-y-6 text-center">
          <div className="w-20 h-20 bg-blue-50 text-primary rounded-full flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-5xl">qr_code_2</span>
          </div>

          <div className="space-y-2">
            <h3 className="font-display font-bold text-lg text-slate-800">Verify UPI Payment QR Codes</h3>
            <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
              Always verify merchant registrations and UPI bank handles before completing payments through QR codes. Protect against cash reward and fake lottery hooks.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4">
            <button
              onClick={() => startScan("camera")}
              className="w-full h-14 bg-primary text-white rounded-2xl font-bold cursor-pointer hover:bg-blue-700 active:scale-95 transition-all flex flex-col items-center justify-center text-xs gap-1 shadow-md shadow-primary/10"
            >
              <span className="material-symbols-outlined text-lg">videocam</span>
              USE CAMERA
            </button>
            <button
              onClick={() => startScan("upload")}
              className="w-full h-14 bg-slate-100 text-slate-700 rounded-2xl font-bold cursor-pointer hover:bg-slate-200 active:scale-95 transition-all flex flex-col items-center justify-center text-xs gap-1"
            >
              <span className="material-symbols-outlined text-lg">add_photo_alternate</span>
              UPLOAD PHOTO
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
