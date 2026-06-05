// supabase.ts — lazy Supabase client, returns null when env vars are absent.
import { createClient, SupabaseClient } from '@supabase/supabase-js'

let _client: SupabaseClient | null | undefined = undefined

/**
 * Returns a configured Supabase client when VITE_SUPABASE_URL and
 * VITE_SUPABASE_ANON_KEY are both present in the environment, otherwise null.
 * The client is created once and cached.
 */
export function getSupabase(): SupabaseClient | null {
  if (_client !== undefined) return _client

  const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

  if (!url || !key) {
    _client = null
    return null
  }

  _client = createClient(url, key)
  return _client
}
