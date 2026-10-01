import { languages, languageCodes } from '../lib/languages'
import { setLocale, useLocale, useT, type Locale } from '../lib/i18n'

export function LanguageSwitcher() {
  const locale = useLocale()
  const t = useT()
  return (
    <label className="filter-field lang-switcher">
      <span>{t('lang.switchLabel')}</span>
      <select value={locale} onChange={(event) => setLocale(event.target.value as Locale)}>
        {languageCodes.map(code => <option key={code} value={code} lang={code}>{languages[code]}</option>)}
      </select>
    </label>
  )
}
