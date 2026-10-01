import { useRef, useState } from 'react'
import type { Language, StoredDocument } from '../types'
import { deleteDocument, listDocuments, saveDocument } from '../lib/documents'
import { EmptyState } from './EmptyState'

const dateFormatter = new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeStyle: 'short' })
const MAX_FILE_BYTES = 25 * 1024 * 1024

interface DocumentsSectionProps {
  selectedId: string | null
  onSelect: (id: string | null) => void
}

export function DocumentsSection({ selectedId, onSelect }: DocumentsSectionProps) {
  const [documents, setDocuments] = useState<StoredDocument[]>(() => listDocuments())
  const [title, setTitle] = useState('')
  const [language, setLanguage] = useState<Language>('tr')
  const [content, setContent] = useState('')
  const [error, setError] = useState<string | null>(null)
  const sourceRef = useRef<'paste' | 'file'>('paste')

  const handleFile = async (file: File | undefined) => {
    if (!file) return
    if (file.size > MAX_FILE_BYTES) {
      setError('The selected file is too large (25 MB maximum).')
      return
    }
    try {
      const text = await file.text()
      sourceRef.current = 'file'
      setContent(text)
      setError(null)
      setTitle((current) => current || file.name.replace(/\.[^.]+$/, ''))
    } catch {
      setError('The selected file could not be read.')
    }
  }

  const handleSave = () => {
    if (!content.trim()) {
      setError('Paste text or choose a .txt file before saving.')
      return
    }
    try {
      saveDocument({
        title: title.trim() || 'Untitled document',
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
      setError(cause instanceof Error ? cause.message : 'Document could not be saved.')
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
            <h2>Upload Text</h2>
            <p>Paste text or choose a .txt file, pick its language, then save</p>
          </div>
        </div>
        <div className="form-grid">
          <label className="filter-field">
            <span>Title</span>
            <input
              type="text"
              value={title}
              placeholder="Document title"
              onChange={(event) => setTitle(event.target.value)}
            />
          </label>
          <label className="filter-field">
            <span>Language (stop-word list)</span>
            <select value={language} onChange={(event) => setLanguage(event.target.value as Language)}>
              <option value="tr">Turkish (TR)</option>
              <option value="en">English (EN)</option>
            </select>
          </label>
          <label className="filter-field">
            <span>From file</span>
            <input type="file" accept=".txt,text/plain" onChange={(event) => void handleFile(event.target.files?.[0])} />
          </label>
          <label className="filter-field">
            <span>Content</span>
            <textarea
              rows={8}
              value={content}
              placeholder="Paste text here…"
              onChange={(event) => {
                sourceRef.current = 'paste'
                setContent(event.target.value)
              }}
            />
          </label>
          {error && <p className="error-text">{error}</p>}
          <div className="form-actions">
            <button type="button" className="btn-primary" onClick={handleSave}>
              Save document
            </button>
          </div>
        </div>
      </section>

      <section className="card chart-card span-6">
        <div className="card-head">
          <div>
            <h2>Saved Documents</h2>
            <p>Stored in this browser • click one to focus the Dashboard on it</p>
          </div>
        </div>
        {documents.length === 0 ? (
          <EmptyState message="No documents saved yet." />
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
                    {dateFormatter.format(doc.createdAt)} • {doc.source === 'file' ? 'file' : 'paste'}
                  </span>
                </button>
                <button type="button" className="icon-button" title="Delete document" onClick={() => handleDelete(doc.id)}>
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
