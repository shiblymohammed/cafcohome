import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  // Get the token and manually clear the isNewUser flag
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  
  if (token) {
    // The flag will be cleared on next session refresh via the update trigger
    console.log('[API] Clearing isNewUser flag for user:', token.userId);
  }

  return NextResponse.json({ success: true, message: 'Flag will be cleared on next session refresh' });
}
