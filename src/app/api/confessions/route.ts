import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  const client = await pool.connect();
  try {
    const { rows } = await client.query(
      `SELECT id, text, count FROM confessions
       WHERE is_published = TRUE AND cluster_id IS NULL AND expires_at > NOW()
       ORDER BY unlocked_at DESC LIMIT 50`
    );
    return NextResponse.json(rows);
  } finally {
    client.release();
  }
}