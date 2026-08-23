import { NextResponse } from 'next/server';

export async function GET() {
  const API_URL = typeof window !== 'undefined' ? '/api/backend' : 'https://kalvix-nexus-production.up.railway.app/api';
  try {
    const res = await fetch(`${API_URL}/admin/fix-sku-categories`, { cache: 'no-store' });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message, note: "Railway might be unreachable" }, { status: 500 });
  }
}
