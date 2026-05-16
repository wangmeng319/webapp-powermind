import React, { useState } from 'react'
import type { FC } from 'react'
import { useTranslation } from 'react-i18next'
import {
  ChatBubbleOvalLeftEllipsisIcon,
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
  list: ConversationItem[]
}

const Sidebar: FC<ISidebarProps> = ({
  copyRight,
  currentId,
  onCurrentIdChange,
  onDeleteConversation,
  list,
}) => {
  const { t } = useTranslation()
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmId, setConfirmId] = useState<string | null>(null)

  const handleDeleteClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    setConfirmId(id)
  }

  const handleConfirmDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    setConfirmId(null)
    setDeletingId(id)
    await onDeleteConversation?.(id)
    setDeletingId(null)
  }

  const handleCancelDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    setConfirmId(null)
  }

  return (
    <div
      className="shrink-0 flex flex-col overflow-y-auto bg-white pc:w-[244px] tablet:w-[192px] mobile:w-[240px]  border-r border-gray-200 tablet:h-[calc(100vh_-_3rem)] mobile:h-screen"
    >
      {list.length < MAX_CONVERSATION_LENTH && (
        <div className="flex flex-shrink-0 p-4 !pb-0">
          <Button
            onClick={() => { onCurrentIdChange('-1') }}
            className="group block w-full flex-shrink-0 !justify-start !h-9 text-primary-600 items-center text-sm"
          >
            <PencilSquareIcon className="mr-2 h-4 w-4" /> {t('app.chat.newChat')}
          </Button>
        </div>
      )}

      <nav className="mt-4 flex-1 space-y-1 bg-white p-4 !pt-0">
        {list.map((item) => {
          const isCurrent = item.id === currentId
          const isDeleting = deletingId === item.id
          const isConfirming = confirmId === item.id
          const ItemIcon
            = isCurrent ? ChatBubbleOvalLeftEllipsisSolidIcon : ChatBubbleOvalLeftEllipsisIcon
          return (
            <div key={item.id}>
              <div
                onClick={() => { if (!isConfirming) { onCurrentIdChange(item.id) } }}
                className={classNames(
                  isCurrent
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-700',
                  'group flex items-center rounded-md px-2 py-2 text-sm font-medium cursor-pointer',
                )}
              >
                <ItemIcon
                  className={classNames(
                    isCurrent
                      ? 'text-primary-600'
                      : 'text-gray-400 group-hover:text-gray-500',
                    'mr-3 h-5 w-5 flex-shrink-0',
                  )}
                  aria-hidden="true"
                />
                <span className="flex-1 truncate">{item.name}</span>
                {item.id !== '-1' && !isConfirming && (
                  <button
                    onClick={e => handleDeleteClick(e, item.id)}
                    disabled={isDeleting}
                    className={classNames(
                      'ml-1 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity shrink-0',
                      isCurrent ? 'hover:bg-primary-100 text-primary-400 hover:text-primary-700' : 'hover:bg-gray-200 text-gray-400 hover:text-gray-700',
                      isDeleting && 'opacity-50 cursor-not-allowed',
                    )}
                    title="删除对话"
                  >
                    <TrashIcon className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
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
    </div>
  )
}

export default React.memo(Sidebar)
