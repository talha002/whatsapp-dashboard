import { setLocale, useLocale, useT, type Locale } from '../lib/i18n'

export function LanguageSwitcher() {
  const locale = useLocale()
  const t = useT()
  return (
    <label className="filter-field lang-switcher">
      <span>{t('lang.switchLabel')}</span>
      <select value={locale} onChange={(event) => setLocale(event.target.value as Locale)}>
        <option value="en" lang="en">{t('lang.english')}</option>
        <option value="tr" lang="tr">{t('lang.turkish')}</option>
      </select>
    </label>
  )
}
