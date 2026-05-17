import { NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

const MIME: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  gif: 'image/gif',
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ filename: string }> },
) {
  const { filename } = await params

  // Prevent directory traversal
  if (!/^[\w.-]+$/.test(filename))
  { return new NextResponse(null, { status: 400 }) }

  const filepath = join(process.cwd(), 'public', 'uploads', 'avatars', filename)
  if (!existsSync(filepath))
  { return new NextResponse(null, { status: 404 }) }

  const buffer = await readFile(filepath)
  const ext = filename.split('.').pop()?.toLowerCase() ?? ''
  const contentType = MIME[ext] ?? 'application/octet-stream'

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  })
}
