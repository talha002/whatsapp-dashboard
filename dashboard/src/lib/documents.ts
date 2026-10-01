import { useSyncExternalStore } from 'react'
import { parseChatText } from '../../shared/parser.js'
import type { ChatData, ChatMessage, ChatMeta, Language, StoredDocument } from '../types'

const DOCUMENTS_KEY = 'wp:documents'
const MAX_CONTENT_CHARS = 25 * 1024 * 1024

const listeners = new Set<() => void>()
let version = 0

function emit() {
  version += 1
  for (const listener of listeners) listener()
}

function subscribeDocuments(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

function getDocumentsVersion() {
  return version
}

export function useDocumentsVersion() {
  return useSyncExternalStore(subscribeDocuments, getDocumentsVersion)
}

export function listDocuments(): StoredDocument[] {
  try {
    const raw = localStorage.getItem(DOCUMENTS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed
      .filter((doc) => doc && typeof doc.id === 'string' && typeof doc.content === 'string')
      .sort((a, b) => b.createdAt - a.createdAt)
  } catch {
    return []
  }
}

function writeDocuments(documents: StoredDocument[]) {
  try {
    localStorage.setItem(DOCUMENTS_KEY, JSON.stringify(documents))
  } catch (error) {
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      throw new Error('Browser storage is full. Delete some documents or upload a smaller file.')
    }
    throw error
  }
  emit()
}

interface SaveDocumentInput {
  title: string
  language: Language
  content: string
  source: 'paste' | 'file'
}

export function saveDocument(input: SaveDocumentInput): StoredDocument {
  if (input.content.length > MAX_CONTENT_CHARS) {
    throw new Error('Document is too large (25 MB maximum).')
  }
  const document: StoredDocument = {
    id: crypto.randomUUID(),
    title: input.title,
    language: input.language,
    content: input.content,
    createdAt: Date.now(),
    source: input.source
  }
  writeDocuments([...listDocuments(), document])
  return document
}

export function deleteDocument(id: string) {
  writeDocuments(listDocuments().filter((doc) => doc.id !== id))
}

export function documentsToMessages(documents: StoredDocument[]): ChatMessage[] {
  const messages: ChatMessage[] = []
  for (const doc of documents) {
    const parsed = parseChatText(doc.content)
    if (parsed.messages.length > 0) {
      messages.push(...parsed.messages)
      continue
    }
    const created = new Date(doc.createdAt)
    const base: Omit<ChatMessage, 'text' | 'line'> = {
      timestamp: doc.createdAt,
      date: created.toISOString(),
      year: created.getFullYear(),
      month: created.getMonth() + 1,
      day: created.getDate(),
      hour: created.getHours(),
      minute: created.getMinutes(),
      sender: doc.title,
      placeholder: false
    }
    const lines = doc.content.split(/\r?\n/).filter((line) => line.trim().length > 0)
    lines.forEach((line, index) => {
      messages.push({ ...base, text: line.trim(), line: index + 1 })
    })
  }
  return messages
}

export function mergeChatData(data: ChatData | null, documents: StoredDocument[]): ChatData | null {
  const docMessages = documentsToMessages(documents)
  if (docMessages.length === 0) return data

  const messages = [...(data?.messages || []), ...docMessages].sort((a, b) => a.timestamp - b.timestamp)
  const participants = [...new Set(messages.map((message) => message.sender))]
  const years = [...new Set(messages.map((message) => message.year))].sort((a, b) => a - b)
  const docTitles = documents.map((doc) => doc.title)

  const meta: ChatMeta = data
    ? {
        ...data.meta,
        participants,
        years,
        totalMessages: messages.length,
        sourceFiles: [...data.meta.sourceFiles, ...docTitles]
      }
    : {
        sourceFile: docTitles.join(', '),
        sourceFiles: docTitles,
        sources: [],
        generatedAt: new Date().toISOString(),
        participants,
        years,
        dateRange: {
          start: messages.length ? new Date(messages[0].timestamp).toISOString() : null,
          end: messages.length ? new Date(messages[messages.length - 1].timestamp).toISOString() : null
        },
        totalMessages: messages.length,
        totalLines: 0,
        systemEvents: 0,
        continuationLines: 0,
        malformedLines: 0,
        placeholderMessages: 0
      }

  return { meta, messages }
}
