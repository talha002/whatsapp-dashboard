export interface ChatMessage {
  timestamp: number
  date: string
  year: number
  month: number
  day: number
  hour: number
  minute: number
  sender: string
  text: string
  placeholder: boolean
  line: number
}

export interface ChatSourceMeta {
  file: string
  totalMessages: number
  totalLines: number
  systemEvents: number
  continuationLines: number
  malformedLines: number
  placeholderMessages: number
}

export interface ChatMeta {
  sourceFile: string
  sourceFiles: string[]
  sources: ChatSourceMeta[]
  generatedAt: string
  participants: string[]
  years: number[]
  dateRange: {
    start: string | null
    end: string | null
  }
  totalMessages: number
  totalLines: number
  systemEvents: number
  continuationLines: number
  malformedLines: number
  placeholderMessages: number
}

export interface ChatData {
  meta: ChatMeta
  messages: ChatMessage[]
}

export interface TokenizedMessage extends ChatMessage {
  tokens: string[]
}

export interface Filters {
  year: number | 'all'
  month: number | 'all'
  sender: string
}

export interface WordCount {
  name: string
  value: number
}

export interface Summary {
  totalMessages: number
  totalWords: number
  participantCount: number
  mostActiveParticipant: string
  mostActiveMessages: number
}

export interface ChartSeries {
  name: string
  data: number[]
}

export interface CategorySeries {
  categories: string[]
  series: ChartSeries[]
}

export type Granularity = 'month' | 'day' | 'hour'
export type ActivityMetric = 'messages' | 'words'
export type WordBarMode = 'year' | 'month' | 'person'

export type Language = 'tr' | 'en'

export interface WordListDiff {
  added: string[]
  removed: string[]
}

export interface StoredDocument {
  id: string
  title: string
  language: Language
  content: string
  createdAt: number
  source: 'paste' | 'file'
}
