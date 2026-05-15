import { SignJWT, jwtVerify } from 'jose'
import type { NextRequest } from 'next/server'

export interface JWTPayload {
  userId: string
  username: string
  role: string
}

function getSecret() {
  const secret = process.env.JWT_SECRET
  if (!secret) { throw new Error('JWT_SECRET is not set') }
  return new TextEncoder().encode(secret)
}

export async function signJWT(payload: JWTPayload): Promise<string> {
  return new SignJWT(payload as Record<string, unknown>)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getSecret())
}

export async function verifyJWT(token: string): Promise<JWTPayload> {
  const { payload } = await jwtVerify(token, getSecret())
  return payload as unknown as JWTPayload
}

export async function getAuthUser(request: NextRequest): Promise<JWTPayload | null> {
  const token = request.cookies.get('auth_token')?.value
  if (!token) { return null }
  try {
    return await verifyJWT(token)
  }
  catch {
    return null
  }
}

// API routes read user from headers injected by middleware
export function getUserFromHeaders(request: NextRequest): JWTPayload | null {
  const userId = request.headers.get('x-user-id')
  const username = request.headers.get('x-username')
  const role = request.headers.get('x-user-role')
  if (!userId || !username || !role) { return null }
  return { userId, username, role }
}
