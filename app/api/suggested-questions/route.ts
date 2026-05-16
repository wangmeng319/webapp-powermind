import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { getInfo } from '@/app/api/utils/common'

const API_KEY = process.env.APP_KEY
const API_URL = process.env.API_URL || 'http://localhost:8080/v1'

export async function GET(request: NextRequest) {
  const { user } = getInfo(request)
  const messageId = request.nextUrl.searchParams.get('messageId')

  if (!messageId) {
    return NextResponse.json({ data: [] }, { status: 400 })
  }

  try {
    const url = `${API_URL}/messages/${messageId}/suggested?user=${encodeURIComponent(user)}`
    const res = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
    })
    if (!res.ok) {
      return NextResponse.json({ data: [] })
    }
    const data = await res.json()
    return NextResponse.json(data)
  }
  catch {
    return NextResponse.json({ data: [] })
  }
}
