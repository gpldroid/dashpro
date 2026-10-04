import { createClient as createSupabaseClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ??
  "https://sqseywflmchnytighlqj.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  "sb_publishable_wwG2gkXDuPhuwQ6zot1kew_5HQtvt2E";

let browserClient: SupabaseClient<Database> | undefined;

function validatePublicConfig() {
  if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY."
    );
  }

  try {
    const url = new URL(SUPABASE_URL);
    if (url.protocol !== "https:" && url.hostname !== "localhost") {
      throw new Error("Supabase URL must use HTTPS.");
    }
  } catch {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL is not a valid URL.");
  }
}

function buildClient(isBrowser: boolean): SupabaseClient<Database> {
  return createSupabaseClient<Database>(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY,
    {
      auth: {
        flowType: "implicit",
        detectSessionInUrl: isBrowser,
        persistSession: isBrowser,
        autoRefreshToken: isBrowser
      },
      global: {
        headers: {
          "X-Client-Info": "dashpro-web"
        }
      }
    }
  );
}

/**
 * Browser calls reuse a singleton to prevent duplicate auth listeners and
 * competing token refreshes. Server rendering gets an isolated, non-persistent
 * client so Next.js can safely prerender client components.
 */
export function createClient(): SupabaseClient<Database> {
  validatePublicConfig();

  if (typeof window === "undefined") {
    return buildClient(false);
  }

  if (!browserClient) {
    browserClient = buildClient(true);
  }

  return browserClient;
}
