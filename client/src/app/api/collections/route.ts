import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseclient';

// GET: list user's collections
export async function GET(request: Request) {
  const url = new URL(request.url);
  const userId = url.searchParams.get('userId');
  if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
  const { data, error } = await supabase
    .from('collections')
    .select('*')
    .eq('owner_id', userId);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ collections: data });
}

// POST: create a new collection
export async function POST(request: Request) {
  const { ownerId, name, description } = await request.json();
  const { data, error } = await supabase.from('collections').insert({
    owner_id: ownerId,
    name,
    description,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ collection: data });
}

// DELETE: delete a collection
export async function DELETE(request: Request) {
  const url = new URL(request.url);
  const collectionId = url.searchParams.get('id');
  if (!collectionId) return NextResponse.json({ error: 'Missing collection id' }, { status: 400 });
  const { error } = await supabase.from('collections').delete().eq('id', collectionId);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ success: true });
}
