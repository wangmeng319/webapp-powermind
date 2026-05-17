'use client'
import type { FC } from 'react'
import React, { useState } from 'react'
import {
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  PencilSquareIcon,
} from '@heroicons/react/24/solid'
import { useRouter } from 'next/navigation'
import AppIcon from '@/app/components/base/app-icon'

export interface IHeaderProps {
  title: string
  username?: string
  isMobile?: boolean
  onShowSideBar?: () => void
  onCreateNewChat?: () => void
}

const Header: FC<IHeaderProps> = ({
  title,
  username,
  isMobile,
  onShowSideBar,
  onCreateNewChat,
}) => {
  const router = useRouter()
  const [loggingOut, setLoggingOut] = useState(false)

  const handleLogout = async () => {
    setLoggingOut(true)
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="shrink-0 flex items-center justify-between h-12 px-3 bg-gray-200 border-b border-gray-300">
      {/* Left: mobile hamburger */}
      {isMobile
        ? (
          <div
            className="flex items-center justify-center h-8 w-8 cursor-pointer"
            onClick={() => onShowSideBar?.()}
          >
            <Bars3Icon className="h-4 w-4 text-gray-500" />
          </div>
        )
        : <div />}

      {/* Center: app icon + title */}
      <div className="flex items-center space-x-2">
        <AppIcon size="small" />
        <div className="text-sm text-gray-800 font-bold">{title}</div>
      </div>

      {/* Right: new chat (mobile) or user info (desktop) */}
      {isMobile
        ? (
          <div
            className="flex items-center justify-center h-8 w-8 cursor-pointer"
            onClick={() => onCreateNewChat?.()}
          >
            <PencilSquareIcon className="h-4 w-4 text-gray-500" />
          </div>
        )
        : (
          <div className="flex items-center gap-3">
            {username && (
              <span className="text-xs text-gray-500 font-medium">{username}</span>
            )}
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 disabled:opacity-50 transition-colors px-2 py-1 rounded-md hover:bg-gray-200"
              title="退出登录"
            >
              <ArrowRightOnRectangleIcon className="h-4 w-4" />
              <span>退出</span>
            </button>
          </div>
        )}
    </div>
  )
}

export default React.memo(Header)
