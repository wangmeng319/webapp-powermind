'use client'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeftIcon, PlusIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline'
import Toast from '@/app/components/base/toast'

interface UserRow {
  id: string
  username: string
  role: 'ADMIN' | 'USER'
  createdAt: string
}

interface CreateForm {
  username: string
  password: string
  role: 'ADMIN' | 'USER'
}

export default function AdminPage() {
  const router = useRouter()
  const { notify } = Toast
  const [users, setUsers] = useState<UserRow[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [creating, setCreating] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [form, setForm] = useState<CreateForm>({ username: '', password: '', role: 'USER' })
  const [resetUserId, setResetUserId] = useState<string | null>(null)
  const [resetPwd, setResetPwd] = useState('')
  const [resetting, setResetting] = useState(false)

  const fetchUsers = async () => {
    setLoading(true)
    const res = await fetch('/api/admin/users')
    if (!res.ok) {
      notify({ type: 'error', message: '无权访问或加载失败' })
      router.push('/')
      return
    }
    const data = await res.json()
    setUsers(data.data)
    setLoading(false)
  }

  useEffect(() => { fetchUsers() }, [])

  const handleCreate = async () => {
    if (!form.username.trim() || !form.password.trim()) {
      notify({ type: 'error', message: '用户名和密码不能为空' })
      return
    }
    setCreating(true)
    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    setCreating(false)
    if (!res.ok) {
      notify({ type: 'error', message: data.message || '创建失败' })
      return
    }
    notify({ type: 'success', message: '用户创建成功' })
    setShowCreate(false)
    setForm({ username: '', password: '', role: 'USER' })
    fetchUsers()
  }

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    const res = await fetch('/api/admin/users', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    const data = await res.json()
    setDeletingId(null)
    setConfirmDeleteId(null)
    if (!res.ok) {
      notify({ type: 'error', message: data.message || '删除失败' })
      return
    }
    notify({ type: 'success', message: '已删除' })
    fetchUsers()
  }

  const handleResetPassword = async () => {
    if (!resetPwd.trim() || resetPwd.length < 6) {
      notify({ type: 'error', message: '密码至少 6 位' })
      return
    }
    setResetting(true)
    const res = await fetch('/api/admin/users/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: resetUserId, newPassword: resetPwd }),
    })
    const data = await res.json()
    setResetting(false)
    if (!res.ok) {
      notify({ type: 'error', message: data.message || '重置失败' })
      return
    }
    notify({ type: 'success', message: '密码已重置' })
    setResetUserId(null)
    setResetPwd('')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4">
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          返回
        </button>
        <h1 className="text-base font-semibold text-gray-800">用户管理</h1>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* Toolbar */}
        <div className="flex justify-end mb-4">
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlusIcon className="h-4 w-4" />
            新建用户
          </button>
        </div>

        {/* User table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {loading
            ? (
              <div className="py-16 text-center text-sm text-gray-400">加载中…</div>
            )
            : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 text-xs">
                    <th className="px-4 py-3 text-left font-medium">用户名</th>
                    <th className="px-4 py-3 text-left font-medium">角色</th>
                    <th className="px-4 py-3 text-left font-medium">创建时间</th>
                    <th className="px-4 py-3 text-right font-medium">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map(u => (
                    <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-800">{u.username}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${u.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
                          {u.role === 'ADMIN' ? '管理员' : '普通用户'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {new Date(u.createdAt).toLocaleDateString('zh-CN')}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => { setResetUserId(u.id); setResetPwd('') }}
                            className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 rounded hover:bg-blue-50 transition-colors"
                          >
                            重置密码
                          </button>
                          {confirmDeleteId === u.id
                            ? (
                              <span className="flex items-center gap-1">
                                <button
                                  onClick={() => handleDelete(u.id)}
                                  disabled={!!deletingId}
                                  className="text-xs px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
                                >
                                  确认删除
                                </button>
                                <button
                                  onClick={() => setConfirmDeleteId(null)}
                                  className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
                                >
                                  取消
                                </button>
                              </span>
                            )
                            : (
                              <button
                                onClick={() => setConfirmDeleteId(u.id)}
                                disabled={!!deletingId}
                                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                                title="删除用户"
                              >
                                <TrashIcon className="h-4 w-4" />
                              </button>
                            )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
        </div>
      </div>

      {/* Create user modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold text-gray-800">新建用户</h2>
              <button onClick={() => setShowCreate(false)} className="text-gray-400 hover:text-gray-600">
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">用户名</label>
                <input
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="请输入用户名"
                  value={form.username}
                  onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">密码（至少 6 位）</label>
                <input
                  type="password"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="请输入密码"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">角色</label>
                <select
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  value={form.role}
                  onChange={e => setForm(f => ({ ...f, role: e.target.value as 'ADMIN' | 'USER' }))}
                >
                  <option value="USER">普通用户</option>
                  <option value="ADMIN">管理员</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreate(false)}
                className="flex-1 px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                取消
              </button>
              <button
                onClick={handleCreate}
                disabled={creating}
                className="flex-1 px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {creating ? '创建中…' : '创建'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset password modal */}
      {resetUserId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold text-gray-800">重置密码</h2>
              <button onClick={() => setResetUserId(null)} className="text-gray-400 hover:text-gray-600">
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">新密码（至少 6 位）</label>
              <input
                type="password"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="请输入新密码"
                value={resetPwd}
                onChange={e => setResetPwd(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleResetPassword()}
              />
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setResetUserId(null)}
                className="flex-1 px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                取消
              </button>
              <button
                onClick={handleResetPassword}
                disabled={resetting}
                className="flex-1 px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {resetting ? '重置中…' : '确认重置'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
