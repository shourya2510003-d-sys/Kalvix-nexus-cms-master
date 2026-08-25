import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { ref, remove } from 'firebase/database';

export async function GET() {
  try {
    await remove(ref(db, 'case_studies'));
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message });
  }
}
