import { languages, languageCodes } from '../lib/languages'
import { normalizeToken } from '../../shared/text.js'
import { useMemo, useState } from 'react'
import type { Language } from '../types'
import {
  addBanWord,
  addStopword,
  getBanWords,
  getCustomStopwords,
  getEffectiveStopwords,
  removeBanWord,
  removeStopword,
  resetStopwords,
  useWordListVersion
} from '../lib/wordlists'
import { useT, useLocale } from '../lib/i18n'
import { EmptyState } from './EmptyState'

interface ChipListProps {
  language?: Language
  words: string[]
  customWords?: Set<string>
  onRemove: (word: string) => void
}

function ChipList({ words, customWords, onRemove, language }: ChipListProps) {
  const t = useT()
  if (words.length === 0) return <EmptyState message={t('wordlists.empty')} />
  return (
    <div className="chip-cloud">
      {words.map((word) => (
        <span key={word} className={customWords?.has(normalizeToken(word, language)) ? 'chip custom' : 'chip'}>
          {word}
          <button type="button" title={t('wordlists.removeWord')} onClick={() => onRemove(word)}>
            ×
          </button>
        </span>
      ))}
    </div>
  )
}

export function WordListsSection() {
  const t = useT()
  const locale = useLocale()
  const [language, setLanguage] = useState<Language>(locale)
  const [stopwordInput, setStopwordInput] = useState('')
  const [stopwordFilter, setStopwordFilter] = useState('')
  const [banwordInput, setBanwordInput] = useState('')
  const version = useWordListVersion()

  const stopwords = useMemo(() => getEffectiveStopwords(language), [language, version])
  const customStopwords = useMemo(() => getCustomStopwords(language), [language, version])
  const banWords = useMemo(() => getBanWords(), [version])

  const filteredStopwords = useMemo(() => {
    const query = normalizeToken(stopwordFilter, language)
    if (!query) return stopwords
    return stopwords.filter((word) => normalizeToken(word, language).includes(query))
  }, [stopwords, stopwordFilter, language])

  const handleAddStopword = () => {
    const word = stopwordInput.trim()
    if (!word) return
    addStopword(language, word)
    setStopwordInput('')
  }

  const handleAddBanword = () => {
    const word = banwordInput.trim()
    if (!word) return
    addBanWord(word)
    setBanwordInput('')
  }

  return (
    <main className="dashboard-grid">
      <section className="card chart-card span-6">
        <div className="card-head">
          <div>
            <h2>{t('wordlists.stopwordsTitle')}</h2>
            <p>
              {t('wordlists.stopwordsSubtitle', {
                count: stopwords.length,
                language: languages[language]
              })}
            </p>
          </div>
        </div>
        <div className="chart-toolbar split">
          <label className="filter-field">
            <span>{t('lang.switchLabel')}</span>
            <select value={language} onChange={event => setLanguage(event.target.value as Language)}>
              {languageCodes.map(code => <option key={code} value={code} lang={code}>{languages[code]}</option>)}
            </select>
          </label>
          <button type="button" className="icon-button wide" onClick={() => resetStopwords(language)}>
            {t('wordlists.resetDefaults')}
          </button>
        </div>
        <div className="form-grid two-col">
          <label className="filter-field">
            <span>{t('wordlists.addStopword', { language: language.toUpperCase() })}</span>
            <input
              type="text"
              value={stopwordInput}
              placeholder={t('wordlists.stopwordPlaceholder')}
              onChange={(event) => setStopwordInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') handleAddStopword()
              }}
            />
          </label>
          <label className="filter-field">
            <span>{t('wordlists.filterList')}</span>
            <input
              type="text"
              value={stopwordFilter}
              placeholder={t('wordlists.searchPlaceholder')}
              onChange={(event) => setStopwordFilter(event.target.value)}
            />
          </label>
        </div>
        <div className="form-actions">
          <button type="button" className="btn-primary" onClick={handleAddStopword}>
            {t('wordlists.addStopwordButton')}
          </button>
        </div>
        <ChipList language={language} words={filteredStopwords} customWords={customStopwords} onRemove={(word) => removeStopword(language, word)} />
      </section>

      <section className="card chart-card span-6">
        <div className="card-head">
          <div>
            <h2>{t('wordlists.banwordsTitle')}</h2>
            <p>{t('wordlists.banwordsSubtitle')}</p>
          </div>
        </div>
        <div className="form-grid">
          <label className="filter-field">
            <span>{t('wordlists.addBanword')}</span>
            <input
              type="text"
              value={banwordInput}
              placeholder={t('wordlists.banwordPlaceholder')}
              onChange={(event) => setBanwordInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') handleAddBanword()
              }}
            />
          </label>
        </div>
        <div className="form-actions">
          <button type="button" className="btn-primary" onClick={handleAddBanword}>
            {t('wordlists.addBanwordButton')}
          </button>
        </div>
        <ChipList words={banWords} onRemove={removeBanWord} />
      </section>
    </main>
  )
}
