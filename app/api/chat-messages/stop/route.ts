import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { getInfo } from '@/app/api/utils/common'

const API_KEY = process.env.APP_KEY
const API_URL = process.env.API_URL || 'http://localhost:8080/v1'

export async function POST(request: NextRequest) {
  const { user } = getInfo(request)
  const { taskId } = await request.json()

  if (!taskId) {
    return NextResponse.json({ result: 'error', message: 'taskId required' }, { status: 400 })
  }

  try {
    const res = await fetch(`${API_URL}/chat-messages/${taskId}/stop`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user }),
    })
    const data = await res.json()
    return NextResponse.json(data)
  }
  catch {
    return NextResponse.json({ result: 'error' }, { status: 500 })
  }
}
