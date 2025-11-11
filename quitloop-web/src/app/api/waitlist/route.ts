// src/app/api/waitlist/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'bad_email' }, { status: 400 });
    }
    const { error } = await supabase.from('waitlist').insert({ email });
    if (error && !String(error.message).includes('duplicate key')) throw error;
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: 'server_error' }, { status: 500 });
  }
}
