import { NextRequest, NextResponse } from 'next/server';
import { AnnouncementService } from '../../../backend/src/services';

const announcementService = new AnnouncementService();

export async function GET() {
  return NextResponse.json({ success: true, data: announcementService.getAll() });
}

export async function POST(req: NextRequest) {
  const body = await req.json() as { text: string; type: string; author: string };
  const { text, type, author } = body;
  if (!text || !type || !author) {
    return NextResponse.json({ success: false, data: null, error: 'Missing fields' }, { status: 400 });
  }
  const ann = announcementService.create(text, type as 'info' | 'urgent' | 'event', author);
  return NextResponse.json({ success: true, data: ann }, { status: 201 });
}
