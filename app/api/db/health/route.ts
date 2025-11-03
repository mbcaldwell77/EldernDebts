import { NextResponse } from 'next/server';

import { db } from '@/lib/db';

export async function GET() {
  // Simple no-op query: count debts (safe)
  const { count, error } = await db
    .from('debts')
    .select('*', { count: 'exact', head: true });

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true, debtsCount: count ?? 0 });
}

