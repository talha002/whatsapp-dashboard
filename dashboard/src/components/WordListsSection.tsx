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
import { EmptyState } from './EmptyState'

interface ChipListProps {
  words: string[]
  customWords?: Set<string>
  onRemove: (word: string) => void
}

function ChipList({ words, customWords, onRemove }: ChipListProps) {
  if (words.length === 0) return <EmptyState message="No words to show." />
  return (
    <div className="chip-cloud">
      {words.map((word) => (
        <span key={word} className={customWords?.has(word.toLocaleLowerCase('tr')) ? 'chip custom' : 'chip'}>
          {word}
          <button type="button" title="Remove word" onClick={() => onRemove(word)}>
            ×
          </button>
        </span>
      ))}
    </div>
  )
}

export function WordListsSection() {
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
            <h2>Stop-Words</h2>
            <p>
              {stopwords.length} active words for {language === 'tr' ? 'Turkish' : 'English'} • excluded from all analysis
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
            Reset defaults
          </button>
        </div>
        <div className="form-grid two-col">
          <label className="filter-field">
            <span>Add stop-word ({language.toUpperCase()})</span>
            <input
              type="text"
              value={stopwordInput}
              placeholder="e.g. şey"
              onChange={(event) => setStopwordInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') handleAddStopword()
              }}
            />
          </label>
          <label className="filter-field">
            <span>Filter list</span>
            <input
              type="text"
              value={stopwordFilter}
              placeholder="Search words…"
              onChange={(event) => setStopwordFilter(event.target.value)}
            />
          </label>
        </div>
        <div className="form-actions">
          <button type="button" className="btn-primary" onClick={handleAddStopword}>
            Add stop-word
          </button>
        </div>
        <ChipList words={filteredStopwords} customWords={customStopwords} onRemove={(word) => removeStopword(language, word)} />
      </section>

      <section className="card chart-card span-6">
        <div className="card-head">
          <div>
            <h2>Ban-Words</h2>
            <p>{banWords.length} banned words • excluded from every analysis in all languages</p>
          </div>
        </div>
        <div className="form-grid">
          <label className="filter-field">
            <span>Add ban-word</span>
            <input
              type="text"
              value={banwordInput}
              placeholder="Word to ban from analysis…"
              onChange={(event) => setBanwordInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') handleAddBanword()
              }}
            />
          </label>
        </div>
        <div className="form-actions">
          <button type="button" className="btn-primary" onClick={handleAddBanword}>
            Add ban-word
          </button>
        </div>
        <ChipList words={banWords} onRemove={removeBanWord} />
      </section>
    </main>
  )
}
