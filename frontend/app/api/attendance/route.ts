import { NextRequest, NextResponse } from 'next/server';
import { AttendanceService } from '../../../backend/src/services';

const attendanceService = new AttendanceService();

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const studentId = searchParams.get('studentId');
  const date = searchParams.get('date');
  if (studentId) return NextResponse.json({ success: true, data: attendanceService.getByStudentId(studentId) });
  if (date) return NextResponse.json({ success: true, data: attendanceService.getByDate(date) });
  return NextResponse.json({ success: true, data: attendanceService.getAll() });
}

export async function PUT(req: NextRequest) {
  const body = await req.json() as { studentId: string; status: string; date: string };
  const { studentId, status, date } = body;
  if (!studentId || !status || !date) {
    return NextResponse.json({ success: false, data: null, error: 'Missing fields' }, { status: 400 });
  }
  const record = attendanceService.updateStatus(studentId, status as 'present' | 'late' | 'absent', date);
  return NextResponse.json({ success: true, data: record });
}
