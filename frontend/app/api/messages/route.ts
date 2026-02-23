import { NextRequest, NextResponse } from 'next/server';
import { MessageService } from '../../../backend/src/services';

const messageService = new MessageService();

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  const partnerId = searchParams.get('partnerId');
  if (!userId || !partnerId) {
    return NextResponse.json({ success: false, data: null, error: 'Missing userId or partnerId' }, { status: 400 });
  }
  return NextResponse.json({ success: true, data: messageService.getThread(userId, partnerId) });
}

export async function POST(req: NextRequest) {
  const body = await req.json() as { fromId: string; toId: string; text: string };
  const { fromId, toId, text } = body;
  if (!fromId || !toId || !text) {
    return NextResponse.json({ success: false, data: null, error: 'Missing fields' }, { status: 400 });
  }
  const msg = messageService.send(fromId, toId, text);
  return NextResponse.json({ success: true, data: msg }, { status: 201 });
}
