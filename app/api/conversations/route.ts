import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { getUserFromHeaders } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/conversations - list user's conversations from MySQL
export async function GET(request: NextRequest) {
  const user = getUserFromHeaders(request)
  if (!user) {
    return NextResponse.json({ data: [], error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const conversations = await prisma.conversation.findMany({
      where: { userId: user.userId },
      orderBy: { updatedAt: 'desc' },
    })

    return NextResponse.json({
      data: conversations.map(c => ({
        id: c.difyConversationId,
        name: c.name,
        inputs: {},
        introduction: '',
        created_at: Math.floor(c.createdAt.getTime() / 1000),
      })),
    })
  }
  catch (error) {
    console.error('Fetch conversations error:', error)
    return NextResponse.json({ data: [], error: '获取对话列表失败' })
  }
}

// POST /api/conversations - save a new conversation after first Dify message
export async function POST(request: NextRequest) {
  const user = getUserFromHeaders(request)
  if (!user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { difyConversationId, name } = await request.json()
    if (!difyConversationId) {
      return NextResponse.json({ message: '缺少 difyConversationId' }, { status: 400 })
    }

    const conversation = await prisma.conversation.upsert({
      where: { difyConversationId },
      update: { name: name || '新对话', updatedAt: new Date() },
      create: {
        userId: user.userId,
        difyConversationId,
        name: name || '新对话',
      },
    })

    return NextResponse.json({ id: conversation.id, difyConversationId: conversation.difyConversationId })
  }
  catch (error) {
    console.error('Save conversation error:', error)
    return NextResponse.json({ message: '保存对话失败' }, { status: 500 })
  }
}
