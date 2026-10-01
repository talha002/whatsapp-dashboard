import { useSyncExternalStore } from 'react'
import { DEFAULT_STOPWORDS, normalizeToken } from '../../shared/text.js'
import type { Language, WordListDiff } from '../types'

const STOPWORDS_KEY = (lang: Language) => `wp:stopwords:${lang}`
const BANWORDS_KEY = 'wp:banwords'

const DEFAULTS: Record<Language, string[]> = DEFAULT_STOPWORDS
const DEFAULT_SETS = Object.fromEntries(
  Object.entries(DEFAULTS).map(([lang, words]) => [lang, new Set(words.map(word => normalizeToken(word, lang)))])
) as Record<Language, Set<string>>

const listeners = new Set<() => void>()
let version = 0

function emit() {
  version += 1
  for (const listener of listeners) listener()
}

export function subscribeWordLists(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function getWordListVersion() {
  return version
}

export function useWordListVersion() {
  return useSyncExternalStore(subscribeWordLists, getWordListVersion, getWordListVersion)
}

function readDiff(lang: Language): WordListDiff {
  try {
    const raw = localStorage.getItem(STOPWORDS_KEY(lang))
    if (!raw) return { added: [], removed: [] }
    const parsed = JSON.parse(raw) as Partial<WordListDiff>
    return {
      added: Array.isArray(parsed.added) ? parsed.added.filter((w) => typeof w === 'string') : [],
      removed: Array.isArray(parsed.removed) ? parsed.removed.filter((w) => typeof w === 'string') : []
    }
  } catch {
    return { added: [], removed: [] }
  }
}

function writeDiff(lang: Language, diff: WordListDiff) {
  localStorage.setItem(STOPWORDS_KEY(lang), JSON.stringify(diff))
  emit()
}

export function getEffectiveStopwords(lang: Language): string[] {
  const diff = readDiff(lang)
  const removed = new Set(diff.removed.map(word => normalizeToken(word, lang)))
  const words = new Map<string, string>()
  for (const word of DEFAULTS[lang]) {
    const normalized = normalizeToken(word, lang)
    if (!removed.has(normalized)) words.set(normalized, word)
  }
  for (const word of diff.added) {
    const normalized = normalizeToken(word, lang)
    if (normalized && !DEFAULT_SETS[lang].has(normalized)) words.set(normalized, word)
  }
  return [...words.values()].sort((a, b) => a.localeCompare(b, lang))
}

export function getCustomStopwords(lang: Language): Set<string> {
  return new Set(readDiff(lang).added.map(word => normalizeToken(word, lang)))
}

export function addStopword(lang: Language, word: string) {
  const normalized = normalizeToken(word, lang)
  if (!normalized) return
  const diff = readDiff(lang)
  const isDefault = DEFAULT_SETS[lang].has(normalized)
  if (isDefault) {
    if (!diff.removed.some((w) => normalizeToken(w, lang) === normalized)) return
    writeDiff(lang, { ...diff, removed: diff.removed.filter((w) => normalizeToken(w, lang) !== normalized) })
    return
  }
  if (diff.added.some((w) => normalizeToken(w, lang) === normalized)) return
  writeDiff(lang, { ...diff, added: [...diff.added, word.trim()] })
}

export function removeStopword(lang: Language, word: string) {
  const normalized = normalizeToken(word, lang)
  if (!normalized) return
  const diff = readDiff(lang)
  if (diff.added.some((w) => normalizeToken(w, lang) === normalized)) {
    writeDiff(lang, { ...diff, added: diff.added.filter((w) => normalizeToken(w, lang) !== normalized) })
    return
  }
  if (!DEFAULT_SETS[lang].has(normalized)) return
  if (diff.removed.some((w) => normalizeToken(w, lang) === normalized)) return
  writeDiff(lang, { ...diff, removed: [...diff.removed, word.trim()] })
}

export function resetStopwords(lang: Language) {
  localStorage.removeItem(STOPWORDS_KEY(lang))
  emit()
}

export function getBanWords(): string[] {
  try {
    const raw = localStorage.getItem(BANWORDS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter((w) => typeof w === 'string')
  } catch {
    return []
  }
}

function writeBanWords(words: string[]) {
  localStorage.setItem(BANWORDS_KEY, JSON.stringify(words))
  emit()
}

export function addBanWord(word: string) {
  const normalized = normalizeToken(word)
  if (!normalized) return
  const words = getBanWords()
  if (words.some((w) => normalizeToken(w) === normalized)) return
  writeBanWords([...words, word.trim()])
}

export function removeBanWord(word: string) {
  const normalized = normalizeToken(word)
  writeBanWords(getBanWords().filter((w) => normalizeToken(w) !== normalized))
}

export function getStopwordSet(lang: Language): Set<string> {
  const set = new Set(getEffectiveStopwords(lang).map(word => normalizeToken(word, lang)))
  for (const word of getBanWords()) set.add(normalizeToken(word, lang))
  return set
}

export function getDashboardStopwordSet(): Set<string> {
  const set = new Set<string>()
  for (const lang of ['tr', 'en'] as Language[]) {
    for (const word of getEffectiveStopwords(lang)) set.add(normalizeToken(word, 'tr'))
  }
  for (const word of getBanWords()) set.add(normalizeToken(word, 'tr'))
  return set
}
