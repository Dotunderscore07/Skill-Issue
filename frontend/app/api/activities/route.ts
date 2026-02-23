import { NextRequest, NextResponse } from 'next/server';
import { ActivityService } from '../../../backend/src/services';

const activityService = new ActivityService();

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const studentId = searchParams.get('studentId');
  const data = studentId
    ? activityService.getByStudentId(studentId)
    : activityService.getAll();
  return NextResponse.json({ success: true, data });
}

export async function POST(req: NextRequest) {
  const body = await req.json() as { studentId: string; text: string; mood: string };
  const { studentId, text, mood } = body;
  if (!studentId || !text || !mood) {
    return NextResponse.json({ success: false, data: null, error: 'Missing fields' }, { status: 400 });
  }
  const act = activityService.create(studentId, text, mood as 'happy' | 'neutral' | 'sad' | 'energetic');
  return NextResponse.json({ success: true, data: act }, { status: 201 });
}
