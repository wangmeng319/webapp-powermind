import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { compare, hash } from 'bcryptjs'
import { getUserFromHeaders } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  const user = getUserFromHeaders(request)
  if (!user)
  { return NextResponse.json({ message: 'Unauthorized' }, { status: 401 }) }

  const { oldPassword, newPassword } = await request.json()

  if (!oldPassword || !newPassword)
  { return NextResponse.json({ message: '请填写完整信息' }, { status: 400 }) }

  if (newPassword.length < 6)
  { return NextResponse.json({ message: '新密码至少 6 位' }, { status: 400 }) }

  const dbUser = await prisma.user.findUnique({ where: { id: user.userId } })
  if (!dbUser)
  { return NextResponse.json({ message: '用户不存在' }, { status: 404 }) }

  const valid = await compare(oldPassword, dbUser.passwordHash)
  if (!valid)
  { return NextResponse.json({ message: '当前密码错误' }, { status: 400 }) }

  const passwordHash = await hash(newPassword, 12)
  await prisma.user.update({ where: { id: user.userId }, data: { passwordHash } })

  return NextResponse.json({ success: true })
}
