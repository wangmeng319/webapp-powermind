import type { NextRequest } from 'next/server'
import { ChatClient } from 'dify-client'

const API_KEY = process.env.APP_KEY
const API_URL = process.env.API_URL

export const getInfo = (request: NextRequest) => {
  const userId = request.headers.get('x-user-id')
  if (!userId) { throw new Error('Unauthorized') }
  return { user: userId }
}

export const client = new ChatClient(API_KEY!, API_URL || undefined)
