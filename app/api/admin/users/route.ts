import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { hash } from 'bcryptjs'
import { getUserFromHeaders } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/admin/users - list all users (admin only)
export async function GET(request: NextRequest) {
  const user = getUserFromHeaders(request)
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ message: '无权限' }, { status: 403 })
  }

  const users = await prisma.user.findMany({
    select: { id: true, username: true, role: true, createdAt: true },
    orderBy: { createdAt: 'asc' },
  })
  return NextResponse.json({ data: users })
}

// POST /api/admin/users - create user (admin only)
export async function POST(request: NextRequest) {
  const currentUser = getUserFromHeaders(request)
  if (!currentUser || currentUser.role !== 'ADMIN') {
    return NextResponse.json({ message: '无权限' }, { status: 403 })
  }

  try {
    const { username, password, role = 'USER' } = await request.json()

    if (!username || !password) {
      return NextResponse.json({ message: '用户名和密码不能为空' }, { status: 400 })
    }
    if (password.length < 6) {
      return NextResponse.json({ message: '密码至少 6 位' }, { status: 400 })
    }
    if (!['ADMIN', 'USER'].includes(role)) {
      return NextResponse.json({ message: '无效的角色' }, { status: 400 })
    }

    const exists = await prisma.user.findUnique({ where: { username } })
    if (exists) {
      return NextResponse.json({ message: '用户名已存在' }, { status: 409 })
    }

    const passwordHash = await hash(password, 12)
    const newUser = await prisma.user.create({
      data: { username, passwordHash, role },
      select: { id: true, username: true, role: true, createdAt: true },
    })

    return NextResponse.json({ data: newUser }, { status: 201 })
  }
  catch (error) {
    console.error('Create user error:', error)
    return NextResponse.json({ message: '服务器错误' }, { status: 500 })
  }
}

// DELETE /api/admin/users - delete user (admin only)
export async function DELETE(request: NextRequest) {
  const currentUser = getUserFromHeaders(request)
  if (!currentUser || currentUser.role !== 'ADMIN') {
    return NextResponse.json({ message: '无权限' }, { status: 403 })
  }

  try {
    const { id } = await request.json()
    if (id === currentUser.userId) {
      return NextResponse.json({ message: '不能删除自己' }, { status: 400 })
    }

    await prisma.user.delete({ where: { id } })
    return NextResponse.json({ success: true })
  }
  catch (error) {
    console.error('Delete user error:', error)
    return NextResponse.json({ message: '服务器错误' }, { status: 500 })
  }
}
