'use client'
import type { FC } from 'react'
import React from 'react'
import type { IChatItem } from '../type'
import s from '../style.module.css'

import StreamdownMarkdown from '@/app/components/base/streamdown-markdown'
import ImageGallery from '@/app/components/base/image-gallery'

type IQuestionProps = Pick<IChatItem, 'id' | 'content' | 'useCurrentUserAvatar'> & {
  imgSrcs?: string[]
  userAvatarUrl?: string | null
  username?: string
}

const Question: FC<IQuestionProps> = ({ id, content, useCurrentUserAvatar, userAvatarUrl, username, imgSrcs }) => {
  const initials = username ? username.slice(0, 2).toUpperCase() : '我'
  return (
    <div className='flex items-start justify-end' key={id}>
      <div>
        <div className={`${s.question} relative text-sm text-gray-900`}>
          {useCurrentUserAvatar && username && (
            <div className='text-right text-xs text-gray-400 mb-1 mr-2'>{username}</div>
          )}
          <div className={'mr-2 py-3 px-4 bg-blue-500 rounded-tl-2xl rounded-b-2xl'}>
            {imgSrcs && imgSrcs.length > 0 && (
              <ImageGallery srcs={imgSrcs} />
            )}
            <StreamdownMarkdown content={content} />
          </div>
        </div>
      </div>
      {useCurrentUserAvatar
        ? (
          <div className='w-10 h-10 shrink-0 rounded-full overflow-hidden bg-primary-600 text-white flex items-center justify-center text-sm font-semibold'>
            {userAvatarUrl
              ? <img src={userAvatarUrl} alt="avatar" className="w-full h-full object-cover" />
              : <span>{initials}</span>}
          </div>
        )
        : (
          <div className={`${s.questionIcon} w-10 h-10 shrink-0`}></div>
        )}
    </div>
  )
}

export default React.memo(Question)
