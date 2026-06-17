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
  const url = process.env.SUPABASE_URL || "https://placeholder.supabase.co";
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  const anonKey = process.env.SUPABASE_ANON_KEY || "";

  // Check if using placeholder values
  const isPlaceholder = url.includes("placeholder");

  if (isPlaceholder) {
    console.error(
      "⚠️  WARNING: Using placeholder Supabase URL. Please configure SUPABASE_URL environment variable."
    );
    console.error("   Make sure your .env file is properly loaded in the dev server.");
  }

  if (!serviceRoleKey && !isPlaceholder) {
    console.warn("⚠️  WARNING: SUPABASE_SERVICE_ROLE_KEY is not set");
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
