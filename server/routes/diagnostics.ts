import { RequestHandler } from "express";
import { supabase } from "../lib/supabase";
import { supabaseConfig, logSupabaseConfig } from "../config";

/**
 * Diagnostic endpoint to check Supabase connection
 * GET /api/diagnostics/supabase
 */
export const handleSupabaseDiagnostics: RequestHandler = async (req, res) => {
  try {
    console.log("🔍 Running Supabase diagnostics...");

    // Log configuration
    logSupabaseConfig();

    // Try to connect to Supabase
    const { data, error } = await supabase.from("users").select("COUNT(*)").limit(1);

    if (error) {
      console.error("❌ Supabase connection error:", error.message);
      return res.status(500).json({
        status: "error",
        message: "Failed to connect to Supabase",
        error: error.message,
        config: {
          url: supabaseConfig.url,
          hasServiceRoleKey: !!supabaseConfig.serviceRoleKey,
          hasAnonKey: !!supabaseConfig.anonKey,
        },
      });
    }

    console.log("✅ Supabase connection successful");

    res.json({
      status: "success",
      message: "Supabase connection is working",
      config: {
        url: supabaseConfig.url,
        hasServiceRoleKey: !!supabaseConfig.serviceRoleKey,
        hasAnonKey: !!supabaseConfig.anonKey,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Diagnostic error:", error);
    res.status(500).json({
      status: "error",
      message: "Diagnostic check failed",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
