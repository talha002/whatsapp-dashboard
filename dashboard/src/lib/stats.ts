import { tokenizeText } from '../../shared/text.js'
import { getMonthFormatter, getMonthShortLabels, type Locale } from './i18n'
import type {
  ActivityMetric,
  CategorySeries,
  ChatData,
  ChatMessage,
  Filters,
  Granularity,
  Summary,
  TokenizedMessage,
  WordBarMode,
  WordCount
} from '../types'

export const ALL_SENDERS = 'all'
export const ALL_YEARS = 'all'
export const ALL_MONTHS = 'all'

export const MAX_MONTH_BUCKETS = 600

function pad(value: number) {
  return String(value).padStart(2, '0')
}

function monthDate(year: number, month: number) {
  const date = new Date(0)
  date.setUTCFullYear(year, month - 1, 1)
  date.setUTCHours(0, 0, 0, 0)
  return date
}

function daysInMonth(year: number, month: number) {
  return new Date(Date.UTC(year, month, 0)).getUTCDate()
}

function monthKey(year: number, month: number) {
  return `${year}-${pad(month)}`
}

function dayKey(year: number, month: number, day: number) {
  return `${year}-${pad(month)}-${pad(day)}`
}

function hourKey(year: number, month: number, day: number, hour: number) {
  return `${year}-${pad(month)}-${pad(day)} ${pad(hour)}`
}

export function withTokens(messages: ChatMessage[], stopwords?: Set<string>): TokenizedMessage[] {
  return messages.map((message) => ({
    ...message,
    tokens: message.placeholder ? [] : tokenizeText(message.text, stopwords)
  }))
}

export function filterMessages(messages: TokenizedMessage[], filters: Filters) {
  return messages.filter((message) => {
    if (filters.sender !== ALL_SENDERS && message.sender !== filters.sender) return false
    if (filters.year !== ALL_YEARS && message.year !== filters.year) return false
    if (filters.month !== ALL_MONTHS && message.month !== filters.month) return false
    return true
  })
}

export function getMonthCounts(messages: TokenizedMessage[], year: number | 'all') {
  const counts = Array.from({ length: 12 }, () => 0)
  for (const message of messages) {
    if (year === ALL_YEARS || message.year === year) {
      counts[message.month - 1] += 1
    }
  }
  return counts
}

export function summarize(messages: TokenizedMessage[]): Summary {
  const messageCounts = new Map<string, number>()
  let totalWords = 0

  for (const message of messages) {
    totalWords += message.tokens.length
    messageCounts.set(message.sender, (messageCounts.get(message.sender) || 0) + 1)
  }

  let mostActiveParticipant = '—'
  let mostActiveMessages = 0
  for (const [sender, count] of messageCounts.entries()) {
    if (count > mostActiveMessages || (count === mostActiveMessages && sender.localeCompare(mostActiveParticipant, 'tr') < 0)) {
      mostActiveParticipant = sender
      mostActiveMessages = count
    }
  }

  return {
    totalMessages: messages.length,
    totalWords,
    participantCount: messageCounts.size,
    mostActiveParticipant,
    mostActiveMessages
  }
}

export function wordFrequency(messages: TokenizedMessage[]): WordCount[] {
  const counts = new Map<string, number>()
  for (const message of messages) {
    for (const token of message.tokens) {
      counts.set(token, (counts.get(token) || 0) + 1)
    }
  }
  return [...counts.entries()]
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value || a.name.localeCompare(b.name, 'tr'))
}

export function topWords(messages: TokenizedMessage[], limit = 10) {
  return wordFrequency(messages).slice(0, limit)
}

function selectedParticipants(data: ChatData, filters: Filters) {
  return filters.sender === ALL_SENDERS ? data.meta.participants : [filters.sender]
}

function matchesTime(message: TokenizedMessage, filters: Filters, ignoreMonth = false) {
  if (filters.year !== ALL_YEARS && message.year !== filters.year) return false
  if (!ignoreMonth && filters.month !== ALL_MONTHS && message.month !== filters.month) return false
  return true
}

export function buildWordCountBar(
  data: ChatData,
  messages: TokenizedMessage[],
  filters: Filters,
  mode: WordBarMode,
  locale: Locale = 'en'
): CategorySeries {
  const participants = selectedParticipants(data, filters)
  const participantSet = new Set(participants)

  if (mode === 'person') {
    const counts = new Map(participants.map((participant) => [participant, 0]))
    for (const message of messages) {
      if (!participantSet.has(message.sender) || !matchesTime(message, filters)) continue
      counts.set(message.sender, (counts.get(message.sender) || 0) + message.tokens.length)
    }
    const ordered = participants
      .map((name) => ({ name, value: counts.get(name) || 0 }))
      .sort((a, b) => b.value - a.value || a.name.localeCompare(b.name, 'tr'))
    return {
      categories: ordered.map((entry) => entry.name),
      series: [{ name: 'Words', data: ordered.map((entry) => entry.value) }]
    }
  }

  if (mode === 'year') {
    const years = data.meta.years.filter((year) => filters.year === ALL_YEARS || year === filters.year)
    const yearIndex = new Map(years.map((year, index) => [year, index]))
    const series = participants.map((name) => ({ name, data: years.map(() => 0) }))
    const bySender = new Map(series.map((entry) => [entry.name, entry]))

    for (const message of messages) {
      if (!participantSet.has(message.sender) || !matchesTime(message, filters)) continue
      const index = yearIndex.get(message.year)
      const target = bySender.get(message.sender)
      if (index === undefined || !target) continue
      target.data[index] += message.tokens.length
    }

    return { categories: years.map(String), series }
  }

  const series = participants.map((name) => ({ name, data: Array.from({ length: 12 }, () => 0) }))
  const bySender = new Map(series.map((entry) => [entry.name, entry]))

  for (const message of messages) {
    if (!participantSet.has(message.sender) || !matchesTime(message, filters)) continue
    const target = bySender.get(message.sender)
    if (!target) continue
    target.data[message.month - 1] += message.tokens.length
  }

  return { categories: getMonthShortLabels(locale), series }
}

export function resolveGranularity(filters: Filters, requested: Granularity | 'auto'): Granularity {
  if (requested !== 'auto') return requested
  return filters.year === ALL_YEARS ? 'month' : 'day'
}

function buildBuckets(data: ChatData, filters: Filters, granularity: Granularity, messages: TokenizedMessage[], locale: Locale = 'en') {
  if (granularity === 'day' && filters.year !== ALL_YEARS && filters.month !== ALL_MONTHS) {
    const year = filters.year
    const month = filters.month
    const formatter = new Intl.DateTimeFormat(locale === 'tr' ? 'tr-TR' : 'en-US', {
      day: 'numeric',
      month: 'short',
      timeZone: 'UTC'
    })
    return Array.from({ length: daysInMonth(year, month) }, (_, index) => {
      const day = index + 1
      const date = monthDate(year, month)
      date.setUTCDate(day)
      return { key: dayKey(year, month, day), label: formatter.format(date) }
    })
  }
  if (granularity !== 'month') return buildBuckets(data, filters, 'month', messages, locale)

  const buckets: Array<{ key: string; label: string }> = []
  const addMonthBucket = (year: number, month: number) => {
    buckets.push({
      key: monthKey(year, month),
      label: getMonthFormatter(locale).format(monthDate(year, month))
    })
  }

  if (filters.year === ALL_YEARS) {
    const fallbackStart = data.meta.years.length ? Date.UTC(data.meta.years[0], 0, 1) : Date.UTC(1970, 0, 1)
    const fallbackEndYear = data.meta.years.length ? data.meta.years[data.meta.years.length - 1] : 1970
    const start = data.meta.dateRange.start ? new Date(data.meta.dateRange.start) : new Date(fallbackStart)
    const end = data.meta.dateRange.end ? new Date(data.meta.dateRange.end) : new Date(Date.UTC(fallbackEndYear, 11, 31))
    let year = start.getUTCFullYear()
    let month = start.getUTCMonth() + 1
    const endYear = end.getUTCFullYear()
    const endMonth = end.getUTCMonth() + 1
    const totalMonths = (endYear - year) * 12 + (endMonth - month) + 1

    if (totalMonths > MAX_MONTH_BUCKETS) {
      const seen = new Map<number, { year: number; month: number }>()
      for (const message of messages) {
        const key = message.year * 100 + message.month
        if (!seen.has(key)) seen.set(key, { year: message.year, month: message.month })
      }
      const sparse = [...seen.values()].sort((a, b) => a.year - b.year || a.month - b.month)
      for (const entry of sparse) addMonthBucket(entry.year, entry.month)
      return buckets
    }

    while (year < endYear || (year === endYear && month <= endMonth)) {
      addMonthBucket(year, month)
      month += 1
      if (month > 12) {
        month = 1
        year += 1
      }
    }
    return buckets
  }

  const year = filters.year
  if (filters.month === ALL_MONTHS) {
    for (let month = 1; month <= 12; month += 1) {
      addMonthBucket(year, month)
    }
    return buckets
  }

  addMonthBucket(year, filters.month)
  return buckets
}

function bucketKey(message: TokenizedMessage, granularity: Granularity) {
  if (granularity === 'month') return monthKey(message.year, message.month)
  if (granularity === 'day') return dayKey(message.year, message.month, message.day)
  return hourKey(message.year, message.month, message.day, message.hour)
}

export function activitySeries(
  data: ChatData,
  messages: TokenizedMessage[],
  filters: Filters,
  metric: ActivityMetric,
  locale: Locale = 'en'
): CategorySeries {
  const granularity: Granularity = filters.year !== ALL_YEARS && filters.month !== ALL_MONTHS ? 'day' : 'month'
  const buckets = buildBuckets(data, filters, granularity, messages, locale)
  const bucketIndex = new Map(buckets.map((bucket, index) => [bucket.key, index]))
  const participants = selectedParticipants(data, filters)
  const series = participants.map((name) => ({ name, data: buckets.map(() => 0) }))
  const bySender = new Map(series.map((entry) => [entry.name, entry]))

  for (const message of messages) {
    const index = bucketIndex.get(bucketKey(message, granularity))
    const target = bySender.get(message.sender)
    if (index === undefined || !target) continue
    target.data[index] += metric === 'words' ? message.tokens.length : 1
  }

  return {
    categories: buckets.map((bucket) => bucket.label),
    series
  }
}
