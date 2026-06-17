import { createClient } from "@supabase/supabase-js";
import { supabaseConfig } from "../config";

// Create Supabase client with service role key for server-side operations
export const supabase = createClient(
  supabaseConfig.url,
  supabaseConfig.serviceRoleKey
);
