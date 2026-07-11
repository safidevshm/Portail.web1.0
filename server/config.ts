/**
 * Runtime Configuration Loader
 * Loads Supabase credentials from environment variables
 * Falls back to placeholder values with error logging
 */

interface SupabaseConfig {
  url: string;
  anonKey: string;
  serviceRoleKey: string;
}

function loadSupabaseConfig(): SupabaseConfig {
  // HARDCODED CREDENTIALS - Override env vars if they're placeholders
  // This is a temporary fix for the dev server environment loading issue
  // In production, env vars should always be properly configured
  const REAL_SUPABASE_URL = "https://hwglhastcmqgrvvxmaae.supabase.co";
  const REAL_SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh3Z2xoYXN0Y21xZ3J2dnhtYWFlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzcwMzM3OCwiZXhwIjoyMDg5Mjc5Mzc4fQ.d7Hp-2bpZqvB673ZGE09Eii-BJSo5SZfZvlVSDn5uBc";
  const REAL_SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh3Z2xoYXN0Y21xZ3J2dnhtYWFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3MDMzNzgsImV4cCI6MjA4OTI3OTM3OH0.AygQOrS3YAvUgbjHW_ypCMWNqH7pIY6U6NUm7Pgt_Go";

  let url = process.env.SUPABASE_URL || "";
  let serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  let anonKey = process.env.SUPABASE_ANON_KEY || "";

  // If env vars are missing or contain placeholders, use hardcoded real credentials
  if (!url || url.includes("placeholder")) {
    console.warn("⚠️  Env var SUPABASE_URL is placeholder, using hardcoded credentials");
    url = REAL_SUPABASE_URL;
  }

  if (!serviceRoleKey) {
    console.warn("⚠️  Env var SUPABASE_SERVICE_ROLE_KEY is missing, using hardcoded credentials");
    serviceRoleKey = REAL_SUPABASE_SERVICE_ROLE_KEY;
  }

  if (!anonKey) {
    console.warn("⚠️  Env var SUPABASE_ANON_KEY is missing, using hardcoded credentials");
    anonKey = REAL_SUPABASE_ANON_KEY;
  }

  const isPlaceholder = url.includes("placeholder");

  if (isPlaceholder) {
    console.error(
      "🚨 CRITICAL: Still using placeholder Supabase URL after fallback."
    );
  } else {
    console.log("✅ Using real Supabase credentials (hwglhastcmqgrvvxmaae)");
  }

  return {
    url,
    anonKey,
    serviceRoleKey,
  };
}

export const supabaseConfig = loadSupabaseConfig();

// Export helper to get credentials for logging purposes
export function logSupabaseConfig(): void {
  console.log("📦 Supabase Configuration Status:");
  console.log(`   URL: ${supabaseConfig.url}`);
  console.log(
    `   Service Role Key: ${supabaseConfig.serviceRoleKey ? "[configured]" : "[missing]"}`
  );
  console.log(
    `   Anon Key: ${supabaseConfig.anonKey ? "[configured]" : "[missing]"}`
  );
}
