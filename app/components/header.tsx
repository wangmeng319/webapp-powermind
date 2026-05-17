'use client'
import type { FC } from 'react'
import React, { useEffect, useRef, useState } from 'react'
import {
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  KeyIcon,
  PencilSquareIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline'
import { useRouter } from 'next/navigation'
import AppIcon from '@/app/components/base/app-icon'
import Toast from '@/app/components/base/toast'

export interface IHeaderProps {
  title: string
  username?: string
  role?: string
  avatarUrl?: string | null
  isMobile?: boolean
  onShowSideBar?: () => void
  onCreateNewChat?: () => void
  onAvatarChange?: (newUrl: string) => void
}

const Header: FC<IHeaderProps> = ({
  title,
  username,
  role,
  avatarUrl,
  isMobile,
  onShowSideBar,
  onCreateNewChat,
  onAvatarChange,
}) => {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const [showChangePwd, setShowChangePwd] = useState(false)
  const [pwdForm, setPwdForm] = useState({ old: '', newPwd: '', confirm: '' })
  const [pwdSubmitting, setPwdSubmitting] = useState(false)
  const { notify } = Toast

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) { return }
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node))
      { setMenuOpen(false) }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [menuOpen])

  const handleLogout = async () => {
    setLoggingOut(true)
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) { return }
    e.target.value = ''
    setMenuOpen(false)
    setUploading(true)
    try {
      const form = new FormData()
      form.append('avatar', file)
      const res = await fetch('/api/auth/avatar', { method: 'POST', body: form })
      const data = await res.json()
      if (!res.ok) {
        notify({ type: 'error', message: data.message || '上传失败', duration: 3000 })
        return
      }
      onAvatarChange?.(data.avatarUrl)
      notify({ type: 'success', message: '头像已更新', duration: 2000 })
    }
    catch {
      notify({ type: 'error', message: '上传失败，请重试', duration: 3000 })
    }
    finally {
      setUploading(false)
    }
  }

  const handleChangePwd = async () => {
    if (!pwdForm.old || !pwdForm.newPwd || !pwdForm.confirm) {
      notify({ type: 'error', message: '请填写所有字段', duration: 3000 })
      return
    }
    if (pwdForm.newPwd !== pwdForm.confirm) {
      notify({ type: 'error', message: '两次输入的新密码不一致', duration: 3000 })
      return
    }
    if (pwdForm.newPwd.length < 6) {
      notify({ type: 'error', message: '新密码至少 6 位', duration: 3000 })
      return
    }
    setPwdSubmitting(true)
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldPassword: pwdForm.old, newPassword: pwdForm.newPwd }),
      })
      const data = await res.json()
      if (!res.ok) {
        notify({ type: 'error', message: data.message || '修改失败', duration: 3000 })
        return
      }
      notify({ type: 'success', message: '密码已修改，请重新登录', duration: 3000 })
      setShowChangePwd(false)
      setPwdForm({ old: '', newPwd: '', confirm: '' })
      setTimeout(() => handleLogout(), 1500)
    }
    catch {
      notify({ type: 'error', message: '操作失败，请重试', duration: 3000 })
    }
    finally {
      setPwdSubmitting(false)
    }
  }

  const initials = username ? username.slice(0, 2).toUpperCase() : '?'

  const AvatarButton = (
    <button
      onClick={() => setMenuOpen(v => !v)}
      disabled={uploading}
      className="relative h-7 w-7 rounded-full overflow-hidden flex items-center justify-center bg-blue-500 text-white text-xs font-semibold shrink-0 hover:ring-2 hover:ring-blue-400 transition-all focus:outline-none disabled:opacity-60"
    >
      {avatarUrl
        ? <img src={avatarUrl} alt="avatar" className="h-full w-full object-cover" />
        : <span>{initials}</span>}
      {uploading && (
        <span className="absolute inset-0 flex items-center justify-center bg-black/40">
          <svg className="animate-spin h-3.5 w-3.5 text-white" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
        </span>
      )}
    </button>
  )

  return (
    <>
      <div className="shrink-0 flex items-center justify-between h-12 px-3 bg-gray-200 border-b border-gray-300">
        {isMobile
          ? (
            <div className="flex items-center justify-center h-8 w-8 cursor-pointer" onClick={() => onShowSideBar?.()}>
              <Bars3Icon className="h-4 w-4 text-gray-500" />
            </div>
          )
          : <div />}

        <div className="flex items-center space-x-2">
          <AppIcon size="small" />
          <div className="text-sm text-gray-800 font-bold">{title}</div>
        </div>

        {isMobile
          ? (
            <div className="flex items-center justify-center h-8 w-8 cursor-pointer" onClick={() => onCreateNewChat?.()}>
              <PencilSquareIcon className="h-4 w-4 text-gray-500" />
            </div>
          )
          : (
            <div className="relative flex items-center gap-2" ref={menuRef}>
              {AvatarButton}
              {username && <span className="text-xs text-gray-500 font-medium">{username}</span>}

              {/* Dropdown menu */}
              {menuOpen && (
                <div className="absolute right-0 top-full mt-2 w-44 bg-white rounded-xl border border-gray-100 shadow-lg py-1 z-50 overflow-hidden">
                  <button
                    onClick={() => { fileInputRef.current?.click() }}
                    className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <span className="h-4 w-4 rounded-full border border-gray-300 flex items-center justify-center text-[10px] font-bold shrink-0 overflow-hidden">
                      {avatarUrl
                        ? <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
                        : initials[0]}
                    </span>
                    更换头像
                  </button>
                  <button
                    onClick={() => { setMenuOpen(false); setShowChangePwd(true) }}
                    className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <KeyIcon className="h-4 w-4 text-gray-400 shrink-0" />
                    修改密码
                  </button>
                  {role === 'ADMIN' && (
                    <button
                      onClick={() => { setMenuOpen(false); router.push('/admin') }}
                      className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <UserGroupIcon className="h-4 w-4 text-gray-400 shrink-0" />
                      用户管理
                    </button>
                  )}
                  <div className="my-1 border-t border-gray-100" />
                  <button
                    onClick={() => { setMenuOpen(false); handleLogout() }}
                    disabled={loggingOut}
                    className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                  >
                    <ArrowRightOnRectangleIcon className="h-4 w-4 shrink-0" />
                    退出登录
                  </button>
                </div>
              )}
            </div>
          )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Change password modal */}
      {showChangePwd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold text-gray-800">修改密码</h2>
              <button
                onClick={() => { setShowChangePwd(false); setPwdForm({ old: '', newPwd: '', confirm: '' }) }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">当前密码</label>
                <input
                  type="password"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="请输入当前密码"
                  value={pwdForm.old}
                  onChange={e => setPwdForm(f => ({ ...f, old: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">新密码（至少 6 位）</label>
                <input
                  type="password"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="请输入新密码"
                  value={pwdForm.newPwd}
                  onChange={e => setPwdForm(f => ({ ...f, newPwd: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">确认新密码</label>
                <input
                  type="password"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="再次输入新密码"
                  value={pwdForm.confirm}
                  onChange={e => setPwdForm(f => ({ ...f, confirm: e.target.value }))}
                  onKeyDown={e => e.key === 'Enter' && handleChangePwd()}
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => { setShowChangePwd(false); setPwdForm({ old: '', newPwd: '', confirm: '' }) }}
                className="flex-1 px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                取消
              </button>
              <button
                onClick={handleChangePwd}
                disabled={pwdSubmitting}
                className="flex-1 px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {pwdSubmitting ? '提交中…' : '确认修改'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default React.memo(Header)
