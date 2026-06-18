import React, { useState, useRef } from "react";
import { ScreenshotAnalysisResult } from "../types";

interface ScreenshotAnalyzerProps {
  onBack: () => void;
  onSaveToHistory: (type: string, title: string, score: number, category: string, detail: string) => void;
  onAddActivity: (activity: any) => void;
}

export default function ScreenshotAnalyzer({ onBack, onSaveToHistory, onAddActivity }: ScreenshotAnalyzerProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [pipelineState, setPipelineState] = useState<"idle" | "ocr" | "gemini" | "compiling">("idle");
  const [result, setResult] = useState<ScreenshotAnalysisResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const processImageFile = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const startAnalysis = async () => {
    if (!imagePreview) return;

    setIsAnalyzing(true);
    setResult(null);

    // Multi-stage visual interface pipeline representation state machine
    try {
      setPipelineState("ocr");
      await delay(1200);

      setPipelineState("gemini");
      await delay(1500);

      setPipelineState("compiling");
      
      const response = await fetch("/api/analyze-screenshot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ base64Image: imagePreview }),
      });
      const data = await response.json();

      const newResult: ScreenshotAnalysisResult = {
        extractedText: data.extractedText ?? "",
        riskScore: data.riskScore ?? 0,
        confidence: data.confidence ?? "Medium",
        category: data.category ?? "Deceptive Notification Check",
        reasons: data.reasons ?? [],
        recommendations: data.recommendations ?? [],
        visualTriggers: data.visualTriggers ?? [],
      };

      setResult(newResult);

      // Save to general firebase / local state logs
      onSaveToHistory(
        "screenshot",
        `Screenshot checked (${newResult.category})`,
        newResult.riskScore,
        newResult.category,
        newResult.extractedText.slice(0, 80)
      );

      onAddActivity({
        type: "screenshot",
        title: "Screenshot Checked",
        description: `Risk identified: ${newResult.category}`,
        riskScore: newResult.riskScore
      });

    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzing(false);
      setPipelineState("idle");
    }
  };

  return (
    <div className="space-y-lg pb-12">
      {/* Back button header */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-slate-100 text-slate-600 transition-transform active:scale-90 cursor-pointer"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h2 className="text-display text-2xl font-extrabold text-slate-900">Screenshot Analyzer</h2>
      </div>

      {result ? (
        // Results representation
        <div className="space-y-lg transition-all animate-fadeIn">
          {/* Main Screenshot card featuring high-threat area visualization overlay */}
          <section className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
            <h3 className="font-display font-bold text-slate-800 text-lg">Visual Audit Overlays</h3>
            
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 aspect-video max-h-80 bg-slate-950 flex items-center justify-center">
              <img
                src={imagePreview || ""}
                alt="Uploaded audit target"
                className="w-full h-full object-contain"
              />
              
              {/* Overlay highlight boxes */}
              {result.visualTriggers.map((trig, index) => (
                <div
                  key={index}
                  className="absolute pointer-events-none border-2 border-dashed border-red-500 bg-red-500/20 flex flex-col justify-between p-1 select-none animate-pulse"
                  style={{
                    top: `${trig.top}%`,
                    left: `${trig.left}%`,
                    width: `${trig.width}%`,
                    height: `${trig.height}%`,
                  }}
                >
                  <span className="bg-red-600 text-white text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded shadow-sm self-start">
                    {trig.label}
                  </span>
                </div>
              ))}
            </div>

            <p className="text-[10px] text-slate-400 font-semibold tracking-wider text-center uppercase">
              ⚠️ Simulated bounding regions identified on suspicious interface widgets.
            </p>
          </section>

          {/* Extracted text list */}
          <section className="space-y-3">
            <h3 className="font-display font-medium text-slate-400 text-xs tracking-wider uppercase ml-1">Extracted Layout Text</h3>
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 text-slate-600 font-mono text-xs leading-relaxed max-h-40 overflow-y-auto">
              {result.extractedText || "No text extracts recognized in target image."}
            </div>
          </section>

          {/* Risk assessment and why */}
          <section className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">AI Solder Risk Rating</p>
                <h4 className="text-display text-xl font-bold text-slate-800">{result.category}</h4>
              </div>
              <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider text-white ${
                result.riskScore > 50 ? "bg-danger" : "bg-success"
              }`}>
                {result.riskScore}% Risk
              </span>
            </div>

            <div className="h-[1px] bg-slate-100"></div>

            <div className="space-y-3">
              {result.reasons.map((reas, id) => (
                <div key={id} className="flex gap-3 text-xs leading-relaxed font-semibold text-slate-600">
                  <span className="material-symbols-outlined text-danger text-base shrink-0">crisis_alert</span>
                  <span>{reas}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Action recom block */}
          <section className="bg-blue-50/50 p-6 rounded-2xl border-l-4 border-primary">
            <h4 className="font-display font-extrabold text-[#1E3A8A] text-sm tracking-wider uppercase mb-3">Threat Containment Playbook</h4>
            <ul className="space-y-2.5">
              {result.recommendations.map((rec, id) => (
                <li key={id} className="flex items-center gap-3 text-xs font-bold text-[#1E3A8A] opacity-90">
                  <span className="material-symbols-outlined text-primary text-base">emergency_home</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Bottom Actions */}
          <section className="pt-2">
            <button
              onClick={() => {
                setResult(null);
                setImagePreview(null);
              }}
              className="w-full text-slate-400 font-black hover:text-slate-600 text-center text-sm py-2 transition-colors cursor-pointer"
            >
              Examine another screenshot
            </button>
          </section>
        </div>
      ) : isAnalyzing ? (
        // Live trace pipeline loader with scanning bar animation
        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm space-y-8 flex flex-col items-center justify-center text-center">
          <div className="relative w-full aspect-video max-h-56 rounded-2xl overflow-hidden border border-slate-200">
            <img
              src={imagePreview || ""}
              alt="Uploaded file checking"
              className="w-full h-full object-contain grayscale brightness-50"
            />
            {/* Elegant visual CSS scanning bar */}
            <div className="absolute inset-x-0 top-0 scanning-line shadow-lg shadow-primary"></div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-primary animate-spin">sync</span>
              <span className="text-xs font-black uppercase text-primary tracking-widest">
                {pipelineState === "ocr"
                  ? "Stage 1: Extracting Interface OCR..."
                  : pipelineState === "gemini"
                  ? "Stage 2: Running Gemini Threat Audit..."
                  : "Stage 3: Locating Suspicious Coordinates..."}
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-xs mx-auto leading-normal uppercase">
              AI-driven multi-stage inspection node active. Sandbox limits secure local operations.
            </p>
          </div>
        </div>
      ) : (
        // Input File Picker Landing View
        <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center space-y-6">
          {imagePreview ? (
            <div className="space-y-4">
              <div className="relative aspect-video max-h-56 rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 flex items-center justify-center">
                <img
                  src={imagePreview}
                  alt="Review target file preview"
                  className="w-full h-full object-contain"
                />
                <button
                  onClick={() => setImagePreview(null)}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-slate-900/60 hover:bg-slate-900 text-white flex items-center justify-center cursor-pointer transition-transform active:scale-90"
                >
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              </div>

              <div className="flex flex-col gap-2">
                <button
                  onClick={startAnalysis}
                  className="w-full h-14 bg-primary text-white rounded-2xl font-bold cursor-pointer hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined">network_intelligence_history</span>
                  EXECUTE FULL SECURITY THREAT AUDIT
                </button>
                <button
                  onClick={() => imagePreview && startAnalysis()}
                  className="w-full text-xs font-bold text-slate-400 hover:text-slate-600 block py-1 select-none"
                >
                  Confirm and check image
                </button>
              </div>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-200 rounded-3xl p-8 hover:border-primary cursor-pointer transition-colors space-y-4 group select-none"
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
              
              <div className="w-16 h-16 bg-blue-50 text-primary rounded-full flex items-center justify-center mx-auto transition-transform group-hover:scale-110">
                <span className="material-symbols-outlined text-[36px]">image_search</span>
              </div>

              <div className="space-y-1">
                <p className="font-display font-bold text-slate-800 text-base leading-snug">Drag & Drop Screenshot</p>
                <p className="text-xs text-slate-400 leading-normal">Or click to inspect device gallery files manually</p>
              </div>
            </div>
          )}

          <div className="space-y-3 pt-4 border-t border-slate-100">
            <h3 className="font-bold text-xs text-slate-400 uppercase tracking-wider select-none text-left ml-1">DEMO THREAT SCREEN PRESETS</h3>
            
            <button
              onClick={() => {
                setImagePreview(
                  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
                );
                // Set directly to mock
              }}
              className="w-full text-left bg-slate-50 p-4 hover:border-blue-200 border border-slate-100 transition-all rounded-2xl flex items-center justify-between text-xs cursor-pointer"
            >
              <div>
                <p className="font-bold text-slate-700">Fake Suspicious SBI Security Suspend Overlay</p>
                <p className="text-slate-400 mt-1 uppercase tracking-wide text-[9px] font-semibold">Ready to scan presets • Multimodal</p>
              </div>
              <span className="material-symbols-outlined text-danger text-sm">broken_image_is_dangerous</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
