'use client'
import type { FC } from 'react'
import React, { useEffect, useRef } from 'react'
import cn from 'classnames'
import { useTranslation } from 'react-i18next'
import { PaperClipIcon } from '@heroicons/react/24/outline'
import { PaperAirplaneIcon } from '@heroicons/react/24/solid'
import Textarea from 'rc-textarea'
import s from './style.module.css'
import Answer from './answer'
import Question from './question'
import type { FeedbackFunc } from './type'
import type { ChatItem, VisionFile, VisionSettings } from '@/types/app'
import { TransferMethod } from '@/types/app'
import Tooltip from '@/app/components/base/tooltip'
import Toast from '@/app/components/base/toast'
import ChatImageUploader from '@/app/components/base/image-uploader/chat-image-uploader'
import ImageList from '@/app/components/base/image-uploader/image-list'
import { useImageFiles } from '@/app/components/base/image-uploader/hooks'
import FileUploaderInAttachmentWrapper from '@/app/components/base/file-uploader-in-attachment'
import type { FileEntity, FileUpload } from '@/app/components/base/file-uploader-in-attachment/types'
import { getProcessedFiles } from '@/app/components/base/file-uploader-in-attachment/utils'

export interface IChatProps {
  chatList: ChatItem[]
  /**
   * Whether to display the editing area and rating status
   */
  feedbackDisabled?: boolean
  /**
   * Whether to display the input area
   */
  isHideSendInput?: boolean
  onFeedback?: FeedbackFunc
  checkCanSend?: () => boolean
  onSend?: (message: string, files: VisionFile[]) => void
  onStop?: () => void
  useCurrentUserAvatar?: boolean
  userAvatarUrl?: string | null
  username?: string
  isResponding?: boolean
  controlClearQuery?: number
  visionConfig?: VisionSettings
  fileConfig?: FileUpload
  sidebarCollapsed?: boolean
}

const Chat: FC<IChatProps> = ({
  chatList,
  feedbackDisabled = false,
  isHideSendInput = false,
  onFeedback,
  checkCanSend,
  onSend = () => { },
  onStop,
  useCurrentUserAvatar,
  userAvatarUrl,
  username,
  isResponding,
  controlClearQuery,
  visionConfig,
  fileConfig,
  sidebarCollapsed,
}) => {
  const { t } = useTranslation()
  const { notify } = Toast
  const isUseInputMethod = useRef(false)

  const [query, setQuery] = React.useState('')
  const queryRef = useRef('')

  const handleContentChange = (e: any) => {
    const value = e.target.value
    setQuery(value)
    queryRef.current = value
  }

  const logError = (message: string) => {
    notify({ type: 'error', message, duration: 3000 })
  }

  const valid = () => {
    const query = queryRef.current
    if (!query || query.trim() === '') {
      logError(t('app.errorMessage.valueOfVarRequired'))
      return false
    }
    return true
  }

  useEffect(() => {
    if (controlClearQuery) {
      setQuery('')
      queryRef.current = ''
    }
  }, [controlClearQuery])
  const {
    files,
    onUpload,
    onRemove,
    onReUpload,
    onImageLinkLoadError,
    onImageLinkLoadSuccess,
    onClear,
  } = useImageFiles()

  const [attachmentFiles, setAttachmentFiles] = React.useState<FileEntity[]>([])
  const [showAttachment, setShowAttachment] = React.useState(false)

  const handleSend = () => {
    if (!valid() || (checkCanSend && !checkCanSend())) { return }
    const hasPendingImageUploads = files.some(file => file.progress !== -1 && file.progress < 100)
    const hasPendingAttachmentUploads = attachmentFiles.some(file => file.progress !== -1 && file.progress < 100)
    if (hasPendingImageUploads || hasPendingAttachmentUploads) {
      logError(t('app.errorMessage.waitForFileUpload'))
      return
    }
    const imageFiles: VisionFile[] = files.filter(file => file.progress !== -1).map(fileItem => ({
      type: 'image',
      transfer_method: fileItem.type,
      url: fileItem.url,
      upload_file_id: fileItem.fileId,
    }))
    const docAndOtherFiles: VisionFile[] = getProcessedFiles(attachmentFiles)
    const combinedFiles: VisionFile[] = [...imageFiles, ...docAndOtherFiles]
    onSend(queryRef.current, combinedFiles)
    if (!files.find(item => item.type === TransferMethod.local_file && !item.fileId)) {
      if (files.length) { onClear() }
      if (!isResponding) {
        setQuery('')
        queryRef.current = ''
      }
    }
    if (!attachmentFiles.find(item => item.transferMethod === TransferMethod.local_file && !item.uploadedId)) { setAttachmentFiles([]) }
  }

  const handleKeyUp = (e: any) => {
    if (e.code === 'Enter') {
      e.preventDefault()
      // prevent send message when using input method enter
      if (!e.shiftKey && !isUseInputMethod.current) { handleSend() }
    }
  }

  const handleKeyDown = (e: any) => {
    isUseInputMethod.current = e.nativeEvent.isComposing
    if (e.code === 'Enter' && !e.shiftKey) {
      const result = query.replace(/\n$/, '')
      setQuery(result)
      queryRef.current = result
      e.preventDefault()
    }
  }

  const suggestionClick = (suggestion: string) => {
    setQuery(suggestion)
    queryRef.current = suggestion
    handleSend()
  }

  return (
    <div className={cn(!feedbackDisabled && 'px-3.5', 'h-full')}>
      {/* Chat List */}
      <div className="h-full space-y-[30px]">
        {chatList.map((item) => {
          if (item.isAnswer) {
            const isLast = item.id === chatList[chatList.length - 1].id
            return <Answer
              key={item.id}
              item={item}
              feedbackDisabled={feedbackDisabled}
              onFeedback={onFeedback}
              isResponding={isResponding && isLast}
              suggestionClick={suggestionClick}
            />
          }
          return (
            <Question
              key={item.id}
              id={item.id}
              content={item.content}
              useCurrentUserAvatar={useCurrentUserAvatar}
              userAvatarUrl={userAvatarUrl}
              username={username}
              imgSrcs={(item.message_files && item.message_files?.length > 0) ? item.message_files.map(item => item.url) : []}
            />
          )
        })}
      </div>
      {
        !isHideSendInput && (
          <div className={`fixed z-10 bottom-0 right-0 mobile:left-0 tablet:left-[192px] ${sidebarCollapsed ? 'pc:left-10' : 'pc:left-[244px]'} px-3.5 pb-2`}>
            <div className="mx-auto max-w-[794px]">
              <div className='flex items-end gap-1.5 p-[5.5px] bg-white border-[1.5px] border-gray-200 rounded-xl shadow-sm'>
                {/* Left: image uploader icon (when vision enabled) */}
                {visionConfig?.enabled && (
                  <div className="shrink-0 pb-1">
                    <ChatImageUploader
                      settings={visionConfig}
                      onUpload={onUpload}
                      disabled={files.length >= visionConfig.number_limits}
                    />
                  </div>
                )}

                {/* Center: image list + attachment panel + textarea */}
                <div className="flex-1 min-w-0 max-h-[150px] overflow-y-auto">
                  {visionConfig?.enabled && (
                    <ImageList
                      list={files}
                      onRemove={onRemove}
                      onReUpload={onReUpload}
                      onImageLinkLoadSuccess={onImageLinkLoadSuccess}
                      onImageLinkLoadError={onImageLinkLoadError}
                    />
                  )}
                  {fileConfig?.enabled && (showAttachment || attachmentFiles.length > 0) && (
                    <div className="mb-1">
                      <FileUploaderInAttachmentWrapper
                        fileConfig={fileConfig}
                        value={attachmentFiles}
                        onChange={setAttachmentFiles}
                        showButtons={showAttachment}
                      />
                    </div>
                  )}
                  <Textarea
                    className={`block w-full px-2 py-[7px] leading-5 max-h-none text-base text-gray-700 outline-none appearance-none resize-none ${isResponding && 'opacity-50 cursor-not-allowed'}`}
                    value={query}
                    onChange={handleContentChange}
                    onKeyUp={handleKeyUp}
                    onKeyDown={handleKeyDown}
                    disabled={isResponding}
                    autoSize
                  />
                </div>

                {/* Right: char count + buttons — always visible at bottom */}
                <div className="flex items-center gap-1 shrink-0 pb-1">
                  {!isResponding && (
                    <div className={`${s.count} h-5 leading-5 text-sm bg-gray-50 text-gray-500 px-2 rounded`}>{query.trim().length}</div>
                  )}
                  {isResponding
                    ? (
                      <div
                        className="w-8 h-8 cursor-pointer rounded-md flex items-center justify-center hover:bg-red-50"
                        onClick={onStop}
                        title="停止生成"
                      >
                        <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                          <rect x="5" y="5" width="14" height="14" rx="2" />
                        </svg>
                      </div>
                    )
                    : (
                      <>
                        {fileConfig?.enabled && (
                          <button
                            onClick={() => setShowAttachment(v => !v)}
                            className={`flex items-center justify-center h-8 w-8 rounded-lg transition-colors ${showAttachment ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100 text-gray-400 hover:text-gray-500'}`}
                            title="附件"
                          >
                            <PaperClipIcon className="h-4 w-4" />
                          </button>
                        )}
                        <Tooltip
                          selector='send-tip'
                          htmlContent={
                            <div>
                              <div>{t('common.operation.send')} Enter</div>
                              <div>{t('common.operation.lineBreak')} Shift Enter</div>
                            </div>
                          }
                        >
                          <button
                            className="flex items-center justify-center h-8 w-8 rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-colors"
                            onClick={handleSend}
                            title="发送"
                          >
                            <PaperAirplaneIcon className="h-4 w-4" />
                          </button>
                        </Tooltip>
                      </>
                    )}
                </div>
              </div>
            </div>
          </div>
        )
      }
    </div>
  )
}

export default React.memo(Chat)
