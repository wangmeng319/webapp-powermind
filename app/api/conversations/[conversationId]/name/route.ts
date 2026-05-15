import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { client, getInfo } from '@/app/api/utils/common'
import { getUserFromHeaders } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest, { params }: {
  params: Promise<{ conversationId: string }>
}) {
  const body = await request.json()
  const { auto_generate, name } = body
  const { conversationId } = await params
  const { user } = getInfo(request)

  const { data } = await client.renameConversation(conversationId, name, user, auto_generate)

  // Sync the generated name to MySQL
  const currentUser = getUserFromHeaders(request)
  if (currentUser && data?.name) {
    await prisma.conversation.updateMany({
      where: { difyConversationId: conversationId, userId: currentUser.userId },
      data: { name: data.name },
    })
  }

  return NextResponse.json(data)
}
