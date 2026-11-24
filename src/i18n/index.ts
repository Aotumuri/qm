import { createI18n, useI18n } from 'vue-i18n'
import en from './messages/en'
import ja from './messages/ja'

export type Locale = 'en' | 'ja'

const initialLocale: Locale = navigator.language.toLowerCase().startsWith('ja') ? 'ja' : 'en'

export const i18n = createI18n({
  legacy: false,
  locale: initialLocale,
  fallbackLocale: 'en',
  messages: { en, ja },
})

export function useLocale() {
  return useI18n({ useScope: 'global' })
}
