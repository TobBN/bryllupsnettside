import { supabaseServer } from '@/lib/supabase';
import HomeClient from './HomeClient';

export default async function Home() {
  let initialContent: Record<string, unknown> | null = null;

  try {
    const supabase = supabaseServer();
    const { data } = await supabase
      .from('website_content')
      .select('content')
      .eq('id', 'main')
      .single();
    initialContent = data?.content ?? null;
  } catch {
    // Fall back to client-side fetch if server fetch fails
  }

  return <HomeClient initialContent={initialContent} />;
}
