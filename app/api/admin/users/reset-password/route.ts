import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { hash } from 'bcryptjs'
import { getUserFromHeaders } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  const currentUser = getUserFromHeaders(request)
  if (!currentUser || currentUser.role !== 'ADMIN')
  { return NextResponse.json({ message: '无权限' }, { status: 403 }) }

  const { id, newPassword } = await request.json()

  if (!id || !newPassword)
  { return NextResponse.json({ message: '参数缺失' }, { status: 400 }) }

  if (newPassword.length < 6)
  { return NextResponse.json({ message: '密码至少 6 位' }, { status: 400 }) }

  const passwordHash = await hash(newPassword, 12)
  await prisma.user.update({ where: { id }, data: { passwordHash } })

  return NextResponse.json({ success: true })
}
