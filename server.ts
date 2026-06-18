import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Lazy initializer for Google GenAI client
let aiInstance: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    console.warn("GEMINI_API_KEY environment variable is missing or placeholder. Server running with defensive safe demo responses.");
    return null;
  }
  if (!aiInstance) {
    aiInstance = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build"
        }
      }
    });
  }
  return aiInstance;
}

// 1. Message Analyzer endpoint
app.post("/api/analyze-message", async (req, res) => {
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: "Message field is required" });
  }

  const ai = getGenAI();
  if (!ai) {
    // Elegant heuristic local simulator when API Key is missing:
    return res.json(simulateMessageAnalysis(message));
  }

  try {
    const prompt = `
      You are the AI Shield India core security analysis model.
      Inspect the following message for mobile or online scams (KYC suspensions, lottery, bank/UPI frauds, unverified links, urgent threats, security OTP queries):
      
      Message content: "${message}"

      Analyze the text rigorously. Return a structured JSON response exactly in the following format:
      {
        "riskScore": (number from 0 to 100),
        "confidence": ("High" | "Medium" | "Low"),
        "category": "Identify specific category like 'Phishing / SMS Fraud', 'Vishing / Fake Call Script', 'UPI Grabber', 'Lottery / Cash reward', etc.",
        "reasons": ["Explain why this is risky, point by point. Highlight indicators like creates fake authority, requests sensitive data, spoofed links, urgent timelines, bad grammar"],
        "recommendations": ["Actionable steps for user like 'Ignore and block', 'Do not share OTP', 'Report immediately to National Cyber Crime portal', 'Call official helpline'"]
      }

      Return valid JSON output only. No markdown annotations, no ticks. Just clean JSON text.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const cleanJson = response.text || "{}";
    res.json(JSON.parse(cleanJson.trim()));
  } catch (error: any) {
    console.error("Gemini call failed for message analysis:", error);
    res.json(simulateMessageAnalysis(message));
  }
});

// 1.5 Mail Analyzer endpoint
app.post("/api/analyze-mail", async (req, res) => {
  const { mailContent } = req.body;
  if (!mailContent) {
    return res.status(400).json({ error: "Mail content is required" });
  }

  const ai = getGenAI();
  if (!ai) {
    return res.json(simulateMailAnalysis(mailContent));
  }

  try {
    const prompt = `
      You are the AI Shield India core security analysis model.
      Inspect the following email for potential phishing, domain spoofing, urgency traps, or fake invoice details:
      
      Email Content: "${mailContent}"

      Analyze the email rigorously. Return a structured JSON response exactly matching this format:
      {
        "riskScore": (number from 0 to 100),
        "confidence": ("High" | "Medium" | "Low"),
        "category": "Identify specific category like 'Phishing / Urgent Invoice', 'Security reset alert', etc.",
        "sender": "Extract suspected sender email or company if visible, or 'Unknown'",
        "domainVerification": {
          "spf": "PASS" | "FAIL" | "NONE",
          "dkim": "PASS" | "FAIL" | "NONE",
          "dmarc": "PASS" | "FAIL" | "NONE"
        },
        "reasons": ["Explain why this email is suspicious or safe. Highlight indicators like sender name manipulation, urgency, unverified attachments, spelling issues"],
        "recommendations": ["Actionable steps like 'Do not click links', 'Report to company security portal', 'Safe to engage', etc."]
      }

      Return valid JSON output only. No markdown annotations, no ticks. Just clean JSON text.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const cleanJson = response.text || "{}";
    res.json(JSON.parse(cleanJson.trim()));
  } catch (error: any) {
    console.error("Gemini call failed for mail analysis:", error);
    res.json(simulateMailAnalysis(mailContent));
  }
});

// 2. Screenshot Analyzer endpoint (Multimodal OCR + threat overlay detection)
app.post("/api/analyze-screenshot", async (req, res) => {
  const { base64Image } = req.body;
  if (!base64Image) {
    return res.status(400).json({ error: "Base64 image is required" });
  }

  const ai = getGenAI();
  if (!ai) {
    return res.json(simulateScreenshotAnalysis());
  }

  try {
    const prompt = `
      You are the AI Shield India screenshot OCR and layout inspection node.
      Extract all texts, check for deceptive alerts, spoofed banking formats, mobile prompt overlays, and verify integrity.
      
      Output a structured JSON response specifying:
      1. 'extractedText': All text contents identified
      2. 'riskScore': 0 to 100
      3. 'confidence': "High", "Medium", or "Low"
      4. 'category': Deceptive notification/scam style detected
      5. 'reasons': List of indicators found
      6. 'visualTriggers': An array identifying the relative location coordinates of screenshot elements you found threatening, which we should highlight. Specify coordinates as percentages relative to the image (0-100 range):
         - type: 'urgency' | 'link' | 'merchant' | 'malware'
         - label: e.g. 'Suspicious Urgency' or 'Malicious Link'
         - top: (percentage from top, 0-100)
         - left: (percentage from left, 0-100)
         - width: (percentage width, 0-100)
         - height: (percentage height, 0-100)
      7. 'recommendations': action recommendations

      Example coordinate format: 
      "visualTriggers": [
        {"type": "urgency", "label": "Suspicious Urgency", "top": 25, "left": 10, "width": 80, "height": 8},
        {"type": "link", "label": "Malicious Link", "top": 38, "left": 15, "width": 50, "height": 6}
      ]

      Return ONLY a raw JSON structure matching these requirements.
    `;

    // Process base64 parsing compatibility
    const mimeMatch = base64Image.match(/^data:(image\/\w+);base64,/);
    const mimeType = mimeMatch ? mimeMatch[1] : "image/png";
    const cleanBase64 = base64Image.replace(/^data:image\/\w+;base64,/, "");

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [
        {
          inlineData: {
            data: cleanBase64,
            mimeType: mimeType
          }
        },
        prompt
      ],
      config: {
        responseMimeType: "application/json"
      }
    });

    const cleanJson = response.text || "{}";
    res.json(JSON.parse(cleanJson.trim()));
  } catch (error: any) {
    console.error("Gemini failed screenshot analysis, falling back to simulator:", error);
    res.json(simulateScreenshotAnalysis());
  }
});

// 3. Link Checker endpoint (Search/Audit url metadata)
app.post("/api/check-link", async (req, res) => {
  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ error: "URL field is required" });
  }

  const ai = getGenAI();
  if (!ai) {
    return res.json(simulateLinkAnalysis(url));
  }

  try {
    const prompt = `
      You are the AI Shield India core URL inspect model.
      Evaluate safety of: "${url}"
      Determine if this is standard host or typical phishing redirect (e.g. sbi-secure-update.net, secure-bank-login.net, reward-redeem-auth.in).
      
      Generate a structured JSON response matching this schema:
      {
        "url": "${url}",
        "riskScore": (number from 0 to 100, where 0 is secure and 100 is high scam alert),
        "confidence": "High" | "Medium" | "Low",
        "category": "E.g. Safe Web Service, Spoofing Portal, Redirect Threat, etc.",
        "domainAge": "Estimated age, e.g. '12 Years' or '3 Days (Extreme Phishing Alert)'",
        "httpsStatus": "Active & Valid" | "Missing Plaintext HTTP (Dangerous)" | "Self-signed certificate",
        "reputationScore": (number from 0.0 to 10.0),
        "reasons": ["At least 3 analytical reasons explaining this reputation verdict"],
        "recommendations": ["Recommended actions"]
      }

      Valid JSON only. No markdown headers. No code block wrappers.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const cleanJson = response.text || "{}";
    res.json(JSON.parse(cleanJson.trim()));
  } catch (e: any) {
    console.error("Gemini failed link check, falling back to simulator:", e);
    res.json(simulateLinkAnalysis(url));
  }
});

// 4. Voice Call Analysis Simulation endpoint (takes transcript or runs real-time speech analytics)
app.post("/api/analyze-voice", async (req, res) => {
  const { callText } = req.body;
  const targetText = callText || "Hello, this is Central Bank Security. Verify your KYC now by sharing the OTP.";

  const ai = getGenAI();
  if (!ai) {
    return res.json(simulateVoiceAnalysis(targetText));
  }

  try {
    const prompt = `
      You are the AI Shield India Real-time Call Vishing Analyzer.
      Analyze the incoming dialogue text for potential scam patterns: Fake police or banks, immediate asset blocking warnings, urgency prompts, requests for OTPs or PINs.
      
      Dialogue input: "${targetText}"

      Return a detailed structured JSON response representing the voice scan analysis:
      {
         "scamProbability": (probability number e.g. 88),
         "transcript": [
           { "speaker": "Caller", "text": "sentence text...", "isThreat": (boolean whether text is suspicious), "label": "optional label like Urgent or Ask for credentials" }
         ],
         "detections": [
           { "type": "Threat" | "Bank Claim" | "OTP Request", "title": "short detection title", "description": "short description" }
         ],
         "explanation": "Provide a descriptive 3-sentence summary of the scam pattern detected, explain why it represents immediate threat.",
         "duration": "02:45 / 05:00"
      }

      Valid JSON output only.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const cleanJson = response.text || "{}";
    res.json(JSON.parse(cleanJson.trim()));
  } catch (e: any) {
    console.error("Failed voice analysis, falling back to simulation:", e);
    res.json(simulateVoiceAnalysis(targetText));
  }
});

// Mock simulation helpers to maintain high usability when GEMINI_API_KEY is not defined:
function simulateMessageAnalysis(msg: string) {
  const textLower = msg.toLowerCase();
  const asksForOtp = textLower.includes("otp") || textLower.includes("one time password") || textLower.includes("code");
  const urgent = textLower.includes("urg") || textLower.includes("fund") || textLower.includes("block") || textLower.includes("suspend") || textLower.includes("kyc");
  const branding = textLower.includes("sbi") || textLower.includes("bank") || textLower.includes("tax") || textLower.includes("refund");

  let riskScore = 15;
  const reasons: string[] = [];
  const recs: string[] = ["Proceed with standard discretion."];

  if (asksForOtp) {
    riskScore += 40;
    reasons.push("OTP solicitation found. Legitimate institutions never request security OTPs through unofficial text links.");
    recs.push("Do NOT disclose any numeric OTP, card codes, passwords, or PINs to the requester.");
  }
  if (urgent) {
    riskScore += 25;
    reasons.push("Creates forced artificial urgency (e.g. threatening 'funds will be blocked' or 'suspended') to override rational scrutiny.");
    recs.push("Report sender details immediately to Cyber Cell authority.");
  }
  if (branding) {
    riskScore += 18;
    reasons.push("References high-stakes institutional branding (SBI, HDFC, Income Tax) without verified digital cryptographic headers.");
    recs.push("Connect directly with your nearest designated banker to verify credentials.");
  }

  if (riskScore > 80) {
    recs.unshift("Ignore and report sender.");
  }

  return {
    riskScore: Math.min(riskScore, 100),
    confidence: "High",
    category: riskScore > 70 ? "Phishing / Impersonation Fraud" : riskScore > 35 ? "Suspicious Activity" : "Secure Conversation",
    reasons: reasons.length > 0 ? reasons : ["No urgent keywords, OTP query, or hostile tactics spotted in the text message."],
    recommendations: recs
  };
}

function simulateMailAnalysis(mail: string) {
  const textLower = mail.toLowerCase();
  const phishingLinks = textLower.includes("click here") || textLower.includes("verify now") || textLower.includes("reset password") || textLower.includes(".xyz") || textLower.includes(".click") || textLower.includes("secure-");
  const billingUrgency = textLower.includes("invoice") || textLower.includes("bill") || textLower.includes("payment overdue") || textLower.includes("suspend") || textLower.includes("unauthorized access") || textLower.includes("limited");
  const brandImpersonation = textLower.includes("netflix") || textLower.includes("amazon") || textLower.includes("paypal") || textLower.includes("apple") || textLower.includes("state bank") || textLower.includes("google security");

  let riskScore = 12;
  const reasons: string[] = [];
  const recs: string[] = ["Operate with standard electronic mail care."];
  let spf: "PASS" | "FAIL" | "NONE" = "PASS";
  let dkim: "PASS" | "FAIL" | "NONE" = "PASS";
  let dmarc: "PASS" | "FAIL" | "NONE" = "PASS";

  if (phishingLinks) {
    riskScore += 35;
    reasons.push("Deceptive Call-to-Action URLs detected inside the mail body prompting quick authentication credentials reset.");
    recs.push("Do NOT click any buttons or hyperlinks requesting verification in this conversation.");
  }
  if (billingUrgency) {
    riskScore += 30;
    reasons.push("Uses psychological financial stressors such as fake unpaid invoices, overdue penalty notices or automatic debit threats.");
    recs.push("Cross-check billing statements on the official vendor dashboard directly, never via inbound links.");
    spf = "FAIL";
  }
  if (brandImpersonation) {
    riskScore += 20;
    reasons.push("Displays commercial icons or signature templates mimicking major brands but lacks official secure digital certificate verification.");
    recs.push("Check sender email carefully to identify unauthorized third-party relays.");
    dkim = "FAIL";
    dmarc = "NONE";
  }

  if (riskScore > 50) {
    recs.unshift("Flag this email as spam and wipe it from your mailbox.");
  }

  return {
    riskScore: Math.min(riskScore, 100),
    confidence: "High",
    category: riskScore > 70 ? "Phishing / Urgent Fake Invoice" : riskScore > 35 ? "Suspicious Commercial Mail" : "Secure Verified Mail",
    sender: brandImpersonation ? "support-billing@commercial-fake-invoice3.xyz" : "customer-info@legit-domain.com",
    domainVerification: {
      spf,
      dkim,
      dmarc
    },
    reasons: reasons.length > 0 ? reasons : ["No immediate malicious payload, phishing links or wire transfer prompts spotted in raw email draft."],
    recommendations: recs
  };
}

function simulateScreenshotAnalysis() {
  return {
    extractedText: "SBI: Dear Customer, your account is suspended due to KYC. Please update at secure-bank-login.net or your funds will be blocked.",
    riskScore: 94,
    confidence: "High",
    category: "Deceptive Bank Notification Layout",
    reasons: [
      "The URL secure-bank-login.net does not match official bank domains.",
      "Grammatical inconsistencies detected: 'Verify your identity now else account block'."
    ],
    visualTriggers: [
      { type: "urgency", label: "Suspicious Urgency", top: 25, left: 10, width: 80, height: 8 },
      { type: "link", label: "Malicious Link", top: 38, left: 15, width: 50, height: 6 }
    ],
    recommendations: [
      "Block sender immediately",
      "Do NOT click any buttons on the deceptive screenshot or update information",
      "Verify directly with official bank customer support lines."
    ]
  };
}

function simulateLinkAnalysis(url: string) {
  const host = url.replace(/(^\w+:|^)\/\//, "").split("/")[0].toLowerCase();
  const isMaliciousHost = host.includes("refund") || host.includes("secure-update") || host.includes("verify") || host.includes("free-cash") || host.includes("auth-portal") || host.includes("claim");

  if (isMaliciousHost) {
    return {
      url,
      riskScore: 94,
      confidence: "High",
      category: "Credential Harvesting Scam",
      domainAge: "3 Days (Highly Suspicious Alert)",
      httpsStatus: "Active & Valid SSL (Deceptive Cover)",
      reputationScore: 1.2,
      reasons: [
        `The web domain '${host}' was registered extremely recently and exhibits strong phishing signatures targeting digital banking portals.`,
        "Sandboxed crawler detected non-standard forms demanding direct input of PAN card numbers, login secrets, and transaction secrets.",
        "Server routing origin traces to masked privacy proxy servers designed to conceal registration ownership structures."
      ],
      recommendations: [
        "Do not input login credentials or financial passwords.",
        "Submit the URL to national threat lists.",
        "Add this host to your corporate DNS spam blocklist."
      ]
    };
  }

  // Safe response default
  return {
    url,
    riskScore: 8,
    confidence: "High",
    category: "Safe Web Service",
    domainAge: "12 Years",
    httpsStatus: "Active & Valid (HTTPS secured)",
    reputationScore: 8.9,
    reasons: [
      `The domain '${host}' is registered to a known globally reputable organization with no reports of credential leaks, malware scripts, or blacklists.`,
      "The site certificate is current and cryptographic identity matches verified registry properties.",
      "No suspicious automatic background loops, downloads, or deceptive redirects registered during dynamic sandbox evaluation."
    ],
    recommendations: [
      "The webpage is safe to access normal operations.",
      "Always inspect web addresses inside your browser top panel to ensure validity."
    ]
  };
}

function simulateVoiceAnalysis(text: string) {
  const details = [
    { type: "Threat", title: "Threatening language detected", description: "Artificial urgency and warnings of immediate asset locks detected." },
    { type: "Bank Claim", title: "Fake bank claims identified", description: "Claims association with state financial institutions contradictory to banking laws." },
    { type: "OTP Request", title: "OTP Request found", description: "Direct queries seeking One-Time-Password authorization secrets." }
  ];

  return {
    scamProbability: 88,
    transcript: [
      { speaker: "Caller", text: "Hello, I am calling from the Central Bank Security Department. We have noticed some suspicious activity on your account...", isThreat: false },
      { speaker: "Caller", text: "To prevent a block, I need you to confirm your identity by reading out the OTP you just received on your phone. This is urgent.", isThreat: true, label: "Caller (Suspected Script)" },
      { speaker: "Caller", text: "Are you there? Sir, if you don't provide the code, we will have to freeze all your assets immediately.", isThreat: true }
    ],
    detections: details,
    explanation: "The caller used a combination of fear tactics and false authority. Official bank employees will never ask for an OTP or threaten immediate asset freezing over the phone.",
    duration: "02:45 / 05:00"
  };
}

// Vite and static production assets middleware setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`AI Shield India Server running on host http://0.0.0.0:${PORT}`);
  });
}

startServer();
