export interface AnalysisResult {
  riskScore: number;
  confidence: "High" | "Medium" | "Low";
  category: string;
  reasons: string[];
  recommendations: string[];
}

export interface MessageAnalysisResult extends AnalysisResult {
  originalMessage: string;
}

export interface LinkAnalysisResult extends AnalysisResult {
  url: string;
  domainAge: string;
  httpsStatus: string;
  reputationScore: number;
}

export interface QRAnalysisResult extends AnalysisResult {
  merchantName: string;
  destinationUrl: string;
}

export interface ScreenshotAnalysisResult extends AnalysisResult {
  extractedText: string;
  visualTriggers: {
    type: string;
    label: string;
    top: number; // percentage from top
    left: number; // percentage from left
    width: number; // percentage width
    height: number; // percentage height
  }[];
}

export interface VoiceAnalysisResult {
  id: string;
  title: string;
  timestamp: string;
  scamProbability: number;
  transcript: {
    speaker: "Caller" | "User" | "System";
    text: string;
    isThreat: boolean;
    label?: string;
  }[];
  detections: {
    type: "Threat" | "Bank Claim" | "OTP Request";
    title: string;
    description: string;
  }[];
  explanation: string;
  duration: string;
  savedToCloud?: boolean;
}

export interface RecentActivity {
  id: string;
  type: "web" | "shield" | "privacy" | "voice" | "message" | "qr" | "screenshot";
  title: string;
  description: string;
  timestamp: string;
  riskScore?: number;
}

export interface ScamTrendItem {
  hour: string;
  reports: number;
}

export interface UserHistoryItem {
  type: "message" | "link" | "qr" | "screenshot" | "voice" | "mail";
  timestamp: string;
  title: string;
  riskScore: number;
  category: string;
  detail: string;
  id?: string;
}

export interface MailAnalysisResult extends AnalysisResult {
  originalMail: string;
  sender: string;
  domainVerification: {
    spf: "PASS" | "FAIL" | "NONE";
    dkim: "PASS" | "FAIL" | "NONE";
    dmarc: "PASS" | "FAIL" | "NONE";
  };
}

export interface ScamReport {
  id: string;
  title: string;
  description: string;
  category: string;
  reporterLocation: string;
  timestamp: string;
}
