import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getUserFromHeaders } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const user = getUserFromHeaders(request)
  if (!user)
  { return NextResponse.json({ message: 'Unauthorized' }, { status: 401 }) }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.userId },
    select: { avatarUrl: true },
  })

  return NextResponse.json({
    userId: user.userId,
    username: user.username,
    role: user.role,
    avatarUrl: dbUser?.avatarUrl ?? null,
  })
}
