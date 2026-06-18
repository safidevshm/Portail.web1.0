import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { handleSendRegistrationWhatsApp, handleIncomingIdea } from "./routes/whatsapp";
import { handleRegister, handleLogin, handleGetProfile, handleSavePdfQrCode } from "./routes/auth";
import { handleSendIdeaNotification, handleGetIdeas } from "./routes/ideas";
import { handleRegenerateDocuments, handleGetDocumentStatus } from "./routes/regenerate-documents";
import { handleVerifyIdentity, handleResetPassword } from "./routes/password-recovery";
import { handleSupabaseDiagnostics } from "./routes/diagnostics";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Diagnostic endpoint
  app.get("/api/diagnostics/supabase", handleSupabaseDiagnostics);

  // Authentication routes
  app.post("/api/auth/register", handleRegister);
  app.post("/api/auth/login", handleLogin);
  app.get("/api/auth/profile", handleGetProfile);
  app.post("/api/auth/save-documents", handleSavePdfQrCode);
  app.post("/api/auth/verify-identity", handleVerifyIdentity);
  app.post("/api/auth/reset-password", handleResetPassword);

  // Document regeneration routes
  app.post("/api/admin/regenerate-documents", handleRegenerateDocuments);
  app.get("/api/admin/document-status", handleGetDocumentStatus);

  // WhatsApp routes
  app.post("/api/whatsapp/send-registration", handleSendRegistrationWhatsApp);
  app.get("/api/whatsapp/incoming-idea", (_req, res) => {
    // Twilio webhook validation (GET request)
    res.status(200).send("✓ Webhook is accessible");
  });
  app.post("/api/whatsapp/incoming-idea", handleIncomingIdea);

  // Test endpoint to verify webhook
  app.post("/api/whatsapp/test", (_req, res) => {
    console.log("✓ Test webhook called - endpoint is working!");
    res.json({ success: true, message: "Webhook endpoint is working correctly" });
  });

  // Test message endpoint (for dashboard testing)
  app.post("/api/whatsapp/test-message", async (req, res) => {
    try {
      const { message, to, analyzeChars } = req.body;

      if (!message || !to) {
        return res.status(400).json({ error: "Message et destinataire requis" });
      }

      const messageStr = String(message);
      const toStr = String(to);
      const accountSid = process.env.TWILIO_ACCOUNT_SID;
      const authToken = process.env.TWILIO_AUTH_TOKEN;
      const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER;

      // Log character analysis
      if (analyzeChars) {
        console.log(`\n📊 ANALYSE CARACTÈRE PAR CARACTÈRE:`);
        console.log(`📝 Raisage total: ${messageStr.length} caractères`);
        for (let i = 0; i < messageStr.length; i++) {
          const char = messageStr[i];
          const code = char.charCodeAt(0);
          console.log(`[${String(i + 1).padStart(3, "0")}] "${char}" (Unicode: ${code})`);
        }
        console.log(`✓ Analyse complète\n`);
      }

      if (!accountSid || !authToken || !fromNumber) {
        console.error("❌ Twilio non configuré - utilisation du mode TEST");
        return res.json({
          success: true,
          messageSid: `TEST_${Date.now()}`,
          message: "Message en mode test (Twilio non configuré)",
          charAnalysis: Array.from(messageStr).map((char, i) => ({
            index: i + 1,
            char,
            unicode: char.charCodeAt(0),
          })),
        });
      }

      console.log(`🔄 Envoi du message via Twilio...`);
      console.log(`De: ${fromNumber}`);
      console.log(`À: ${toStr}`);
      console.log(`Message: ${messageStr}`);

      const response = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: `Basic ${Buffer.from(
              `${accountSid}:${authToken}`
            ).toString("base64")}`,
          },
          body: new URLSearchParams({
            From: fromNumber,
            To: toStr,
            Body: messageStr,
          }).toString(),
        }
      );

      if (!response.ok) {
        const error = await response.text();
        console.error("❌ Erreur Twilio:", error);
        return res.status(500).json({
          error: "Impossible d'envoyer le message",
          details: error,
        });
      }

      const data = await response.json();
      const messageSid = (data as any).sid;

      console.log(`✅ Message envoyé avec succès!`);
      console.log(`📨 SID: ${messageSid}`);

      res.json({
        success: true,
        messageSid,
        charAnalysis: Array.from(messageStr).map((char, i) => ({
          index: i + 1,
          char,
          unicode: char.charCodeAt(0),
        })),
      });
    } catch (error) {
      console.error("❌ Erreur:", error);
      res.status(500).json({
        error: "Erreur serveur",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  // Ideas routes
  app.get("/api/ideas", handleGetIdeas);
  app.post("/api/ideas/send-notification", handleSendIdeaNotification);

  return app;
}
