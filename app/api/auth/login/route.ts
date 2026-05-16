import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { compare } from 'bcryptjs'
import { signJWT } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json({ message: '用户名和密码不能为空' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { username } })
    if (!user) {
      return NextResponse.json({ message: '用户名或密码错误' }, { status: 401 })
    }

    const valid = await compare(password, user.passwordHash)
    if (!valid) {
      return NextResponse.json({ message: '用户名或密码错误' }, { status: 401 })
    }

    const token = await signJWT({ userId: user.id, username: user.username, role: user.role })

    const response = NextResponse.json({ username: user.username, role: user.role })
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.SECURE_COOKIE === 'true',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })
    return response
  }
  catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ message: '服务器错误' }, { status: 500 })
  }
}
