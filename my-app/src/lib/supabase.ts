import { createClient } from '@supabase/supabase-js';

export function supabaseServer() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string | undefined;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string | undefined;
  if (!url || !serviceKey) {
    throw new Error('Supabase env vars missing (NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY)');
  }
  return createClient(url, serviceKey, { auth: { persistSession: false } });
}


