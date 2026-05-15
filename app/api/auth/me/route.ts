import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getUserFromHeaders } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const user = getUserFromHeaders(request)
  if (!user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }
  return NextResponse.json({ userId: user.userId, username: user.username, role: user.role })
}
