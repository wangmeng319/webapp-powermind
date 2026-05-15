import type { AppInfo } from '@/types/app'

// APP_ID is non-secret, used as a localStorage key prefix on the client
export const APP_ID = `${process.env.NEXT_PUBLIC_APP_ID}`

// API_KEY and API_URL are server-side only — access them via process.env directly in API routes
// DO NOT export them here as they must not be bundled into the client

export const APP_INFO: AppInfo = {
  title: 'PowerMind',
  description: '',
  copyright: '',
  privacy_policy: '',
  default_language: 'zh-Hans',
  disable_session_same_site: false,
}

export const isShowPrompt = false
export const promptTemplate = 'I want you to act as a javascript console.'

export const API_PREFIX = '/api'

export const LOCALE_COOKIE_NAME = 'locale'

export const DEFAULT_VALUE_MAX_LEN = 48
