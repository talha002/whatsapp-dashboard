export const languages = {
  en: 'English',
  tr: 'Türkçe',
  es: 'Español',
  fr: 'Français',
  pt: 'Português',
  de: 'Deutsch',
  it: 'Italiano',
  pl: 'Polski',
  ro: 'Română'
} as const

export type Language = keyof typeof languages
export const languageCodes = Object.keys(languages) as Language[]

export function isLanguage(value: unknown): value is Language {
  return typeof value === 'string' && Object.prototype.hasOwnProperty.call(languages, value)
}
