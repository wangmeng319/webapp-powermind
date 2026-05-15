import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { client, getInfo } from '@/app/api/utils/common'
import { getUserFromHeaders } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// DELETE /api/conversations/[conversationId] - delete a conversation
export async function DELETE(request: NextRequest, { params }: {
  params: Promise<{ conversationId: string }>
}) {
  const user = getUserFromHeaders(request)
  if (!user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const { conversationId } = await params

  // Verify ownership
  const conversation = await prisma.conversation.findFirst({
    where: { difyConversationId: conversationId, userId: user.userId },
  })
  if (!conversation) {
    return NextResponse.json({ message: '对话不存在' }, { status: 404 })
  }

  // Delete from MySQL
  await prisma.conversation.delete({ where: { id: conversation.id } })

  // Best-effort delete from Dify (non-blocking)
  try {
    const { user: difyUser } = getInfo(request)
    await client.deleteConversation(conversationId, difyUser)
  }
  catch {
    // Dify deletion is non-critical
  }

  return NextResponse.json({ success: true })
}

// PATCH /api/conversations/[conversationId] - rename a conversation
export async function PATCH(request: NextRequest, { params }: {
  params: Promise<{ conversationId: string }>
}) {
  const user = getUserFromHeaders(request)
  if (!user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const { conversationId } = await params
  const { name } = await request.json()

  if (!name?.trim()) {
    return NextResponse.json({ message: '名称不能为空' }, { status: 400 })
  }

  const updated = await prisma.conversation.updateMany({
    where: { difyConversationId: conversationId, userId: user.userId },
    data: { name: name.trim() },
  })

  if (updated.count === 0) {
    return NextResponse.json({ message: '对话不存在' }, { status: 404 })
  }

  return NextResponse.json({ success: true })
}
