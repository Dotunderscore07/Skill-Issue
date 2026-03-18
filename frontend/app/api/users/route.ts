import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch('http://localhost:4000/api/users', { cache: 'no-store' });
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error fetching users from backend:', error);
    return NextResponse.json(
      { success: false, data: null, error: 'Internal server error while fetching users' },
      { status: 500 }
    );
  }
}
