import { NextRequest, NextResponse } from 'next/server';
import { matchAndInsertConfession } from '@/utils/matchConfession';

export async function POST(req: NextRequest) {
  const { text } = await req.json();
  if (!text || text.length < 5) return NextResponse.json({ error: 'Invalid confession' }, { status: 400 });

  try {
    const result = await matchAndInsertConfession(text);
    return NextResponse.json({ success: true, id: result.id });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}