import { useRef, useState } from 'react'
import type { Language, StoredDocument } from '../types'
import { deleteDocument, listDocuments, saveDocument } from '../lib/documents'
import { getDateTimeFormatter, useLocale, useT } from '../lib/i18n'
import { EmptyState } from './EmptyState'

const MAX_FILE_BYTES = 25 * 1024 * 1024

interface DocumentsSectionProps {
  selectedId: string | null
  onSelect: (id: string | null) => void
}

export function DocumentsSection({ selectedId, onSelect }: DocumentsSectionProps) {
  const locale = useLocale()
  const t = useT()
  const dateFormatter = getDateTimeFormatter(locale)
  const [documents, setDocuments] = useState<StoredDocument[]>(() => listDocuments())
  const [title, setTitle] = useState('')
  const [language, setLanguage] = useState<Language>('tr')
  const [content, setContent] = useState('')
  const [error, setError] = useState<string | null>(null)
  const sourceRef = useRef<'paste' | 'file'>('paste')

  const handleFile = async (file: File | undefined) => {
    if (!file) return
    if (file.size > MAX_FILE_BYTES) {
      setError(t('docs.errorTooLarge'))
      return
    }
    try {
      const text = await file.text()
      sourceRef.current = 'file'
      setContent(text)
      setError(null)
      setTitle((current) => current || file.name.replace(/\.[^.]+$/, ''))
    } catch {
      setError(t('docs.errorUnreadable'))
    }
  }

  const handleSave = () => {
    if (!content.trim()) {
      setError(t('docs.errorEmpty'))
      return
    }
    try {
      saveDocument({
        title: title.trim() || t('docs.untitled'),
        language,
        content,
        source: sourceRef.current
      })
      setDocuments(listDocuments())
      setTitle('')
      setContent('')
      setError(null)
      sourceRef.current = 'paste'
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : t('docs.errorSaveFailed'))
    }
  }

  const handleDelete = (id: string) => {
    deleteDocument(id)
    setDocuments(listDocuments())
    if (selectedId === id) onSelect(null)
  }

  return (
    <main className="dashboard-grid">
      <section className="card chart-card span-6">
        <div className="card-head">
          <div>
            <h2>{t('docs.uploadTitle')}</h2>
            <p>{t('docs.uploadSubtitle')}</p>
          </div>
        </div>
        <div className="form-grid">
          <label className="filter-field">
            <span>{t('docs.titleField')}</span>
            <input
              type="text"
              value={title}
              placeholder={t('docs.titlePlaceholder')}
              onChange={(event) => setTitle(event.target.value)}
            />
          </label>
          <label className="filter-field">
            <span>{t('docs.languageField')}</span>
            <select value={language} onChange={(event) => setLanguage(event.target.value as Language)}>
              <option value="tr">{t('docs.langTr')}</option>
              <option value="en">{t('docs.langEn')}</option>
            </select>
          </label>
          <label className="filter-field">
            <span>{t('docs.fileField')}</span>
            <input type="file" accept=".txt,text/plain" onChange={(event) => void handleFile(event.target.files?.[0])} />
          </label>
          <label className="filter-field">
            <span>{t('docs.contentField')}</span>
            <textarea
              rows={8}
              value={content}
              placeholder={t('docs.contentPlaceholder')}
              onChange={(event) => {
                sourceRef.current = 'paste'
                setContent(event.target.value)
              }}
            />
          </label>
          {error && <p className="error-text">{error}</p>}
          <div className="form-actions">
            <button type="button" className="btn-primary" onClick={handleSave}>
              {t('docs.save')}
            </button>
          </div>
        </div>
      </section>

      <section className="card chart-card span-6">
        <div className="card-head">
          <div>
            <h2>{t('docs.savedTitle')}</h2>
            <p>{t('docs.savedSubtitle')}</p>
          </div>
        </div>
        {documents.length === 0 ? (
          <EmptyState message={t('docs.empty')} />
        ) : (
          <ul className="doc-list">
            {documents.map((doc) => (
              <li key={doc.id} className={doc.id === selectedId ? 'doc-item active' : 'doc-item'}>
                <button
                  type="button"
                  className="doc-select"
                  onClick={() => onSelect(doc.id === selectedId ? null : doc.id)}
                >
                  <span className="doc-title">{doc.title}</span>
                  <span className="doc-meta">
                    <span className={`lang-badge lang-${doc.language}`}>{doc.language.toUpperCase()}</span>
                    {dateFormatter.format(doc.createdAt)} •{' '}
                    {doc.source === 'file' ? t('docs.sourceFile') : t('docs.sourcePaste')}
                  </span>
                </button>
                <button type="button" className="icon-button" title={t('docs.deleteTitle')} onClick={() => handleDelete(doc.id)}>
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  )
}
