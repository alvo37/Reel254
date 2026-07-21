import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseclient';

// GET: retrieve all moods
export async function GET() {
  const { data, error } = await supabase.from('moods').select('*');
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ moods: data });
}

// POST: set user's mood
export async function POST(request: Request) {
  const { userId, moodId } = await request.json();
  const { error } = await supabase.from('user_moods').upsert({
    user_id: userId,
    mood_id: moodId,
    selected_at: new Date().toISOString(),
  }, { onConflict: 'user_id' });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ success: true });
}
