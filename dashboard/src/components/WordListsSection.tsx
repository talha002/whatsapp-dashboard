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
import { useT } from '../lib/i18n'
import { EmptyState } from './EmptyState'

interface ChipListProps {
  words: string[]
  customWords?: Set<string>
  onRemove: (word: string) => void
}

function ChipList({ words, customWords, onRemove }: ChipListProps) {
  const t = useT()
  if (words.length === 0) return <EmptyState message={t('wordlists.empty')} />
  return (
    <div className="chip-cloud">
      {words.map((word) => (
        <span key={word} className={customWords?.has(word.toLocaleLowerCase('tr')) ? 'chip custom' : 'chip'}>
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
  const [language, setLanguage] = useState<Language>('tr')
  const [stopwordInput, setStopwordInput] = useState('')
  const [stopwordFilter, setStopwordFilter] = useState('')
  const [banwordInput, setBanwordInput] = useState('')
  const version = useWordListVersion()

  const stopwords = useMemo(() => getEffectiveStopwords(language), [language, version])
  const customStopwords = useMemo(() => getCustomStopwords(language), [language, version])
  const banWords = useMemo(() => getBanWords(), [version])

  const filteredStopwords = useMemo(() => {
    const query = stopwordFilter.trim().toLocaleLowerCase('tr')
    if (!query) return stopwords
    return stopwords.filter((word) => word.toLocaleLowerCase('tr').includes(query))
  }, [stopwords, stopwordFilter])

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
                language: language === 'tr' ? t('wordlists.turkish') : t('wordlists.english')
              })}
            </p>
          </div>
        </div>
        <div className="chart-toolbar split">
          <div className="segmented">
            <button type="button" className={language === 'tr' ? 'active' : ''} onClick={() => setLanguage('tr')}>
              TR
            </button>
            <button type="button" className={language === 'en' ? 'active' : ''} onClick={() => setLanguage('en')}>
              EN
            </button>
          </div>
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
        <ChipList words={filteredStopwords} customWords={customStopwords} onRemove={(word) => removeStopword(language, word)} />
      </section>

      <section className="card chart-card span-6">
        <div className="card-head">
          <div>
            <h2>{t('wordlists.banwordsTitle')}</h2>
            <p>{t('wordlists.banwordsSubtitle', { count: banWords.length })}</p>
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
