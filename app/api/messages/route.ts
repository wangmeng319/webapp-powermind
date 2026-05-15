import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { client, getInfo } from '@/app/api/utils/common'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const conversationId = searchParams.get('conversation_id')

  if (!conversationId) {
    return NextResponse.json({ data: [] })
  }

  const { user } = getInfo(request)
  const { data }: any = await client.getConversationMessages(user, conversationId)
  return NextResponse.json(data)
}
