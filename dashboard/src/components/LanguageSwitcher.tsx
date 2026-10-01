import { setLocale, useLocale, useT, type Locale } from '../lib/i18n'

const OPTIONS: { id: Locale; label: string }[] = [
  { id: 'en', label: 'EN' },
  { id: 'tr', label: 'TR' }
]

export function LanguageSwitcher() {
  const locale = useLocale()
  const t = useT()
  return (
    <div className="segmented lang-switcher" role="group" aria-label={t('lang.switchLabel')}>
      {OPTIONS.map((option) => (
        <button
          key={option.id}
          type="button"
          className={option.id === locale ? 'active' : ''}
          onClick={() => setLocale(option.id)}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
