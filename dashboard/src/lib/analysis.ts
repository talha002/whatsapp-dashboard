import type { CategorySeries, TokenizedMessage } from '../types'
import { getMonthFormatter, getWeekdayLabels, type Locale } from './i18n'

export interface HeatmapData {
  weekdays: string[]
  hours: string[]
  values: Array<[number, number, number]>
  max: number
}

export interface StarterCount {
  name: string
  value: number
}

export interface SessionAnalysis {
  sessionCount: number
  averageMessages: number
  medianGapMinutes: number
  starters: StarterCount[]
  byMonth: CategorySeries
}

export interface ParticipantStyle {
  name: string
  messages: number
  words: number
  avgWords: number
  unique: number
  uniquePerK: number
  questionRatio: number
  emojiPerMessage: number
  linkRatio: number
  placeholderRatio: number
}

const QUESTION_RE = /\?/
const LINK_RE = /(https?:\/\/|www\.)/i
const EMOJI_RE = /\p{Extended_Pictographic}/gu

function monthKey(timestamp: number) {
  const date = new Date(timestamp)
  return `${String(date.getUTCFullYear()).padStart(4, '0')}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`
}

function monthLabel(key: string, locale: Locale) {
  const [year, month] = key.split('-').map(Number)
  const date = new Date(0)
  date.setUTCFullYear(year, month - 1, 1)
  date.setUTCHours(0, 0, 0, 0)
  return getMonthFormatter(locale).format(date)
}

function median(values: number[]) {
  if (values.length === 0) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const middle = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 0 ? (sorted[middle - 1] + sorted[middle]) / 2 : sorted[middle]
}

export function activityHeatmap(messages: TokenizedMessage[], locale: Locale = 'en'): HeatmapData {
  const counts = Array.from({ length: 7 }, () => Array.from({ length: 24 }, () => 0))

  for (const message of messages) {
    const date = new Date(message.timestamp)
    const weekday = (date.getUTCDay() + 6) % 7
    counts[weekday][message.hour] += 1
  }

  const values: Array<[number, number, number]> = []
  let max = 0
  for (let day = 0; day < 7; day += 1) {
    for (let hour = 0; hour < 24; hour += 1) {
      const value = counts[day][hour]
      if (value > max) max = value
      if (value > 0) values.push([hour, day, value])
    }
  }

  return {
    weekdays: getWeekdayLabels(locale),
    hours: Array.from({ length: 24 }, (_, hour) => `${hour}:00`),
    values,
    max
  }
}

export function conversationSessions(messages: TokenizedMessage[], gapMinutes = 180, locale: Locale = 'en'): SessionAnalysis {
  const sorted = [...messages].sort((a, b) => a.timestamp - b.timestamp)
  const gapMs = gapMinutes * 60_000
  const starters = new Map<string, number>()
  const monthly = new Map<string, number>()
  const gaps: number[] = []
  let sessionCount = 0
  let currentEnd = 0
  let previousTimestamp: number | null = null

  for (const message of sorted) {
    if (previousTimestamp !== null && message.timestamp - previousTimestamp <= gapMs) {
      gaps.push((message.timestamp - previousTimestamp) / 60_000)
    }

    if (previousTimestamp === null || message.timestamp - currentEnd > gapMs) {
      sessionCount += 1
      starters.set(message.sender, (starters.get(message.sender) || 0) + 1)
      const key = monthKey(message.timestamp)
      monthly.set(key, (monthly.get(key) || 0) + 1)
    }

    currentEnd = message.timestamp
    previousTimestamp = message.timestamp
  }

  const monthlyEntries = [...monthly.entries()].sort((a, b) => a[0].localeCompare(b[0]))

  return {
    sessionCount,
    averageMessages: sessionCount > 0 ? sorted.length / sessionCount : 0,
    medianGapMinutes: median(gaps),
    starters: [...starters.entries()]
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value || a.name.localeCompare(b.name, 'tr')),
    byMonth: {
      categories: monthlyEntries.map(([key]) => monthLabel(key, locale)),
      series: [{ name: 'Sessions', data: monthlyEntries.map(([, value]) => value) }]
    }
  }
}

export type ResponseDimension = 'person' | 'weekday' | 'hour' | 'year'

export interface ResponseTimeResult {
  dimension: ResponseDimension
  categories: string[]
  values: number[]
  counts: number[]
  totalResponses: number
}

const RESPONSE_THRESHOLD_MINUTES = 12 * 60

function padHour(hour: number) {
  return `${String(hour).padStart(2, '0')}:00`
}

function responseCategory(message: TokenizedMessage, dimension: ResponseDimension, locale: Locale) {
  if (dimension === 'person') return message.sender
  if (dimension === 'weekday') return getWeekdayLabels(locale)[(new Date(message.timestamp).getUTCDay() + 6) % 7]
  if (dimension === 'hour') return padHour(message.hour)
  return String(message.year)
}

export function responseTimeAnalysis(
  messages: TokenizedMessage[],
  dimension: ResponseDimension,
  locale: Locale = 'en'
): ResponseTimeResult {
  const sorted = [...messages].sort((a, b) => a.timestamp - b.timestamp)
  const buckets = new Map<string, number[]>()
  let totalResponses = 0

  for (let index = 1; index < sorted.length; index += 1) {
    const current = sorted[index]
    const previous = sorted[index - 1]
    if (current.sender === previous.sender) continue

    const gapMinutes = (current.timestamp - previous.timestamp) / 60_000
    if (gapMinutes <= 0 || gapMinutes > RESPONSE_THRESHOLD_MINUTES) continue

    const category = responseCategory(current, dimension, locale)
    let bucket = buckets.get(category)
    if (!bucket) {
      bucket = []
      buckets.set(category, bucket)
    }
    bucket.push(gapMinutes)
    totalResponses += 1
  }

  let categories: string[]
  if (dimension === 'weekday') {
    categories = getWeekdayLabels(locale)
  } else if (dimension === 'hour') {
    categories = Array.from({ length: 24 }, (_, hour) => padHour(hour))
  } else if (dimension === 'person') {
    categories = [...buckets.keys()].sort((a, b) => {
      const left = buckets.get(a) || [0]
      const right = buckets.get(b) || [0]
      return median(left) - median(right) || a.localeCompare(b, 'tr')
    })
  } else {
    categories = [...buckets.keys()].sort((a, b) => Number(a) - Number(b))
  }

  return {
    dimension,
    categories,
    values: categories.map((category) => {
      const bucket = buckets.get(category)
      return bucket && bucket.length > 0 ? Number(median(bucket).toFixed(2)) : 0
    }),
    counts: categories.map((category) => buckets.get(category)?.length || 0),
    totalResponses
  }
}

export function participantStyles(messages: TokenizedMessage[]): ParticipantStyle[] {
  const byParticipant = new Map<
    string,
    {
      messages: number
      words: number
      unique: Set<string>
      questions: number
      emojis: number
      links: number
      placeholders: number
    }
  >()

  for (const message of messages) {
    let entry = byParticipant.get(message.sender)
    if (!entry) {
      entry = { messages: 0, words: 0, unique: new Set<string>(), questions: 0, emojis: 0, links: 0, placeholders: 0 }
      byParticipant.set(message.sender, entry)
    }

    entry.messages += 1
    entry.words += message.tokens.length
    for (const token of message.tokens) entry.unique.add(token)
    if (QUESTION_RE.test(message.text)) entry.questions += 1
    const emojis = message.text.match(EMOJI_RE)
    entry.emojis += emojis ? emojis.length : 0
    if (LINK_RE.test(message.text)) entry.links += 1
    if (message.placeholder) entry.placeholders += 1
  }

  return [...byParticipant.entries()]
    .map(([name, entry]) => ({
      name,
      messages: entry.messages,
      words: entry.words,
      avgWords: entry.messages > 0 ? entry.words / entry.messages : 0,
      unique: entry.unique.size,
      uniquePerK: entry.words > 0 ? entry.unique.size / (entry.words / 1000) : 0,
      questionRatio: entry.messages > 0 ? (entry.questions / entry.messages) * 100 : 0,
      emojiPerMessage: entry.messages > 0 ? entry.emojis / entry.messages : 0,
      linkRatio: entry.messages > 0 ? (entry.links / entry.messages) * 100 : 0,
      placeholderRatio: entry.messages > 0 ? (entry.placeholders / entry.messages) * 100 : 0
    }))
    .sort((a, b) => b.messages - a.messages || a.name.localeCompare(b.name, 'tr'))
}
