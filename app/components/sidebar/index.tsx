'use client'
import React, { useEffect, useRef, useState } from 'react'
import type { FC } from 'react'
import { useTranslation } from 'react-i18next'
import {
  ChatBubbleOvalLeftEllipsisIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EllipsisHorizontalIcon,
  PencilIcon,
  PencilSquareIcon,
  TrashIcon,
} from '@heroicons/react/24/outline'
import { ChatBubbleOvalLeftEllipsisIcon as ChatBubbleOvalLeftEllipsisSolidIcon } from '@heroicons/react/24/solid'
import Button from '@/app/components/base/button'
import type { ConversationItem } from '@/types/app'

function classNames(...classes: any[]) {
  return classes.filter(Boolean).join(' ')
}

const MAX_CONVERSATION_LENTH = 20

export interface ISidebarProps {
  copyRight: string
  currentId: string
  onCurrentIdChange: (id: string) => void
  onDeleteConversation?: (id: string) => void
  onRenameConversation?: (id: string, name: string) => void
  list: ConversationItem[]
  collapsed?: boolean
  onToggleCollapse?: () => void
}

const Sidebar: FC<ISidebarProps> = ({
  copyRight,
  currentId,
  onCurrentIdChange,
  onDeleteConversation,
  onRenameConversation,
  list,
  collapsed,
  onToggleCollapse,
}) => {
  const { t } = useTranslation()
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null)
  const [menuPos, setMenuPos] = useState<{ top: number, left: number } | null>(null)
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const menuRef = useRef<HTMLDivElement>(null)

  // Close dropdown on outside click or Escape
  useEffect(() => {
    if (!activeMenuId) { return }
    const onMouseDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node))
      { setActiveMenuId(null) }
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setActiveMenuId(null) }
    }
    document.addEventListener('mousedown', onMouseDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onMouseDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [activeMenuId])

  const handleMenuToggle = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    if (activeMenuId === id) {
      setActiveMenuId(null)
      return
    }
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    // Align dropdown's right edge to button's right edge
    setMenuPos({ top: rect.bottom + 4, left: rect.right - 128 })
    setActiveMenuId(id)
    setConfirmId(null)
  }

  const handleStartRename = (item: ConversationItem) => {
    setActiveMenuId(null)
    setRenameValue(item.name)
    setRenamingId(item.id)
  }

  const handleConfirmRename = (id: string) => {
    const trimmed = renameValue.trim()
    setRenamingId(null)
    const original = list.find(i => i.id === id)?.name
    if (!trimmed || trimmed === original) { return }
    onRenameConversation?.(id, trimmed)
  }

  const handleStartDelete = (id: string) => {
    setActiveMenuId(null)
    setConfirmId(id)
  }

  const handleConfirmDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    setConfirmId(null)
    setDeletingId(id)
    await (onDeleteConversation?.(id) ?? Promise.resolve())
    setDeletingId(null)
  }

  const handleCancelDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    setConfirmId(null)
  }

  if (collapsed) {
    return (
      <div className="shrink-0 flex flex-col items-center pt-3 w-10 bg-white border-r border-gray-200 tablet:h-[calc(100vh_-_3rem)] mobile:h-screen">
        <button
          onClick={onToggleCollapse}
          className="p-1.5 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
          title="展开侧边栏"
        >
          <ChevronRightIcon className="h-4 w-4" />
        </button>
      </div>
    )
  }

  const activeItem = activeMenuId ? list.find(i => i.id === activeMenuId) : null

  return (
    <div className="shrink-0 flex flex-col overflow-y-auto bg-white pc:w-[244px] tablet:w-[192px] mobile:w-[240px] border-r border-gray-200 tablet:h-[calc(100vh_-_3rem)] mobile:h-screen">
      <div className="flex items-center justify-between px-4 pt-3 pb-0">
        {list.length < MAX_CONVERSATION_LENTH
          ? (
            <Button
              onClick={() => { onCurrentIdChange('-1') }}
              className="group flex-1 flex-shrink-0 !justify-start !h-9 text-primary-600 items-center text-sm"
            >
              <PencilSquareIcon className="mr-2 h-4 w-4" /> {t('app.chat.newChat')}
            </Button>
          )
          : <div />}
        <button
          onClick={onToggleCollapse}
          className="ml-1 p-1.5 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors shrink-0"
          title="收起侧边栏"
        >
          <ChevronLeftIcon className="h-4 w-4" />
        </button>
      </div>

      <nav className="mt-4 flex-1 space-y-1 bg-white p-4 !pt-0">
        {list.map((item) => {
          const isCurrent = item.id === currentId
          const isDeleting = deletingId === item.id
          const isConfirming = confirmId === item.id
          const isMenuOpen = activeMenuId === item.id
          const isRenaming = renamingId === item.id
          const ItemIcon = isCurrent
            ? ChatBubbleOvalLeftEllipsisSolidIcon
            : ChatBubbleOvalLeftEllipsisIcon

          return (
            <div key={item.id}>
              <div
                onClick={() => {
                  if (isMenuOpen || isRenaming || isConfirming) { return }
                  onCurrentIdChange(item.id)
                }}
                className={classNames(
                  isCurrent
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-700',
                  'group flex items-center rounded-md px-2 py-2 text-sm font-medium cursor-pointer',
                )}
              >
                <ItemIcon
                  className={classNames(
                    isCurrent ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-500',
                    'mr-3 h-5 w-5 flex-shrink-0',
                  )}
                  aria-hidden="true"
                />

                {isRenaming
                  ? (
                    <input
                      autoFocus
                      className="flex-1 min-w-0 bg-transparent border-b border-gray-300 focus:outline-none focus:border-blue-500 text-sm text-gray-900 mr-1"
                      value={renameValue}
                      onChange={e => setRenameValue(e.target.value)}
                      onClick={e => e.stopPropagation()}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') { handleConfirmRename(item.id) }
                        if (e.key === 'Escape') { setRenamingId(null) }
                      }}
                      onBlur={() => handleConfirmRename(item.id)}
                    />
                  )
                  : (
                    <span className="flex-1 truncate">{item.name}</span>
                  )}

                {item.id !== '-1' && !isRenaming && (
                  <button
                    onClick={e => handleMenuToggle(e, item.id)}
                    disabled={isDeleting}
                    className={classNames(
                      'ml-1 p-1 rounded transition-opacity shrink-0',
                      isMenuOpen ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
                      isCurrent
                        ? 'hover:bg-primary-100 text-primary-400 hover:text-primary-600'
                        : 'hover:bg-gray-200 text-gray-400 hover:text-gray-600',
                      isDeleting && 'opacity-50 cursor-not-allowed',
                    )}
                    title="更多操作"
                  >
                    <EllipsisHorizontalIcon className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Delete confirmation */}
              {isConfirming && (
                <div className="flex items-center gap-1 px-2 pb-2 text-xs" onClick={e => e.stopPropagation()}>
                  <span className="text-gray-500 flex-1">确认删除？</span>
                  <button
                    onClick={e => handleConfirmDelete(e, item.id)}
                    className="px-2 py-0.5 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    删除
                  </button>
                  <button
                    onClick={handleCancelDelete}
                    className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
                  >
                    取消
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </nav>

      <div className="flex flex-shrink-0 pr-4 pb-4 pl-4">
        <div className="text-gray-400 font-normal text-xs">© {copyRight} {(new Date()).getFullYear()}</div>
      </div>

      {/* Fixed dropdown menu — rendered outside overflow container via fixed positioning */}
      {activeItem && menuPos && (
        <div
          ref={menuRef}
          className="fixed z-50 min-w-[128px] bg-white rounded-lg border border-gray-100 shadow-lg py-1 overflow-hidden"
          style={{ top: menuPos.top, left: menuPos.left }}
        >
          <button
            onClick={() => handleStartRename(activeItem)}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <PencilIcon className="h-3.5 w-3.5 shrink-0 text-gray-400" />
            重命名
          </button>
          <div className="my-1 border-t border-gray-100" />
          <button
            onClick={() => handleStartDelete(activeItem.id)}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
          >
            <TrashIcon className="h-3.5 w-3.5 shrink-0" />
            删除
          </button>
        </div>
      )}
    </div>
  )
}

export default React.memo(Sidebar)
