import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ ok: true, status: 'up', time: new Date().toISOString() })
}
