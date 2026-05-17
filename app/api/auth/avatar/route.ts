import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { writeFile, unlink } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import { getUserFromHeaders } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const MAX_SIZE = 2 * 1024 * 1024 // 2 MB

export async function POST(request: NextRequest) {
  const user = getUserFromHeaders(request)
  if (!user)
  { return NextResponse.json({ message: 'Unauthorized' }, { status: 401 }) }

  let formData: FormData
  try {
    formData = await request.formData()
  }
  catch {
    return NextResponse.json({ message: '请求格式错误' }, { status: 400 })
  }

  const file = formData.get('avatar') as File | null
  if (!file)
  { return NextResponse.json({ message: '未找到文件' }, { status: 400 }) }

  if (!ALLOWED_TYPES.includes(file.type))
  { return NextResponse.json({ message: '仅支持 JPG、PNG、WebP、GIF 格式' }, { status: 400 }) }

  if (file.size > MAX_SIZE)
  { return NextResponse.json({ message: '文件大小不能超过 2MB' }, { status: 400 }) }

  const ext = file.type.split('/')[1].replace('jpeg', 'jpg')
  const filename = `${user.userId}_${Date.now()}.${ext}`
  const uploadDir = join(process.cwd(), 'public', 'uploads', 'avatars')
  const filepath = join(uploadDir, filename)

  const buffer = Buffer.from(await file.arrayBuffer())
  await writeFile(filepath, buffer)

  const avatarUrl = `/api/avatars/${filename}`

  // Delete old avatar file if it exists
  const existing = await prisma.user.findUnique({
    where: { id: user.userId },
    select: { avatarUrl: true },
  })
  if (existing?.avatarUrl) {
    // Support both old (/uploads/avatars/) and new (/api/avatars/) URL formats
    const oldFilename = existing.avatarUrl.split('/').pop()
    if (oldFilename) {
      const oldPath = join(process.cwd(), 'public', 'uploads', 'avatars', oldFilename)
      if (existsSync(oldPath)) {
        await unlink(oldPath).catch(() => {})
      }
    }
  }

  await prisma.user.update({
    where: { id: user.userId },
    data: { avatarUrl },
  })

  return NextResponse.json({ avatarUrl })
}
