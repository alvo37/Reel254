import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseclient';

export async function POST(request: Request) {
  const { followerId, followedId } = await request.json();
  const { data, error } = await supabase.from('followers').insert({
    follower_id: followerId,
    followed_id: followedId,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ success: true, data });
}

export async function DELETE(request: Request) {
  const url = new URL(request.url);
  const followerId = url.searchParams.get('followerId');
  const followedId = url.searchParams.get('followedId');
  const { error } = await supabase
    .from('followers')
    .delete()
    .eq('follower_id', followerId as string)
    .eq('followed_id', followedId as string);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ success: true });
}
