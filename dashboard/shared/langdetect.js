import { parseChatText } from './parser.js'
import { DEFAULT_STOPWORDS, normalizeUnicode } from './text.js'

// Candidate set = the platform languages (mirrors src/lib/languages.ts).
const LANGUAGES = ['en', 'tr', 'es', 'fr', 'pt', 'de', 'it', 'pl', 'ro']

// Hand-picked high-frequency chat words per language; kept alongside the
// stopword data so both share one source of truth per language.
const COMMON_WORDS = {
  en: ['the', 'and', 'to', 'of', 'a', 'in', 'is', 'it', 'you', 'that', 'for', 'on', 'with', 'as', 'are', 'was', 'be', 'have', 'not', 'this', 'but', 'they', 'at', 'what', 'so', 'we', 'he', 'can', 'will', 'if', 'do', 'me', 'when', 'all', 'just', 'i', 'my', 'your', 'know', 'get', 'go', 'good', 'ok', 'now'],
  tr: ['ve', 'bir', 'bu', 'ne', 'ben', 'sen', 'o', 'için', 'çok', 'ama', 'ki', 'de', 'da', 'mi', 'mı', 'var', 'yok', 'daha', 'gibi', 'en', 'ile', 'ya', 'şey', 'sonra', 'işte', 'bana', 'sana', 'evet', 'tamam', 'olsun', 'diye', 'her', 'şimdi', 'bugün', 'yarın', 'nasıl', 'güzel', 'bence', 'gel', 'git', 'bak', 'mısın', 'misin'],
  es: ['el', 'la', 'de', 'que', 'y', 'en', 'un', 'ser', 'se', 'no', 'por', 'con', 'su', 'para', 'como', 'estar', 'tener', 'le', 'lo', 'todo', 'pero', 'más', 'hacer', 'o', 'poder', 'decir', 'este', 'ir', 'otro', 'si', 'me', 'ya', 'muy', 'mi', 'qué', 'cuando', 'casa', 'bien', 'hoy', 'mañana', 'así', 'hola'],
  fr: ['le', 'de', 'un', 'être', 'et', 'à', 'il', 'avoir', 'ne', 'je', 'son', 'que', 'se', 'qui', 'ce', 'dans', 'en', 'du', 'elle', 'au', 'pour', 'pas', 'vous', 'par', 'sur', 'faire', 'plus', 'dire', 'me', 'on', 'mon', 'nous', 'comme', 'mais', 'avec', 'tout', 'bien', 'très', 'quand', 'ça', 'oui', 'merci'],
  pt: ['de', 'a', 'o', 'que', 'e', 'do', 'em', 'um', 'para', 'com', 'não', 'uma', 'os', 'no', 'se', 'na', 'por', 'mais', 'as', 'dos', 'como', 'mas', 'ao', 'ele', 'das', 'seu', 'sua', 'ou', 'quando', 'muito', 'nos', 'já', 'eu', 'também', 'você', 'isso', 'bem', 'hoje', 'amanhã', 'sim'],
  de: ['der', 'die', 'und', 'in', 'den', 'von', 'zu', 'das', 'mit', 'sich', 'des', 'auf', 'für', 'ist', 'im', 'dem', 'nicht', 'ein', 'eine', 'als', 'auch', 'es', 'an', 'werden', 'aus', 'er', 'hat', 'dass', 'sie', 'nach', 'wird', 'bei', 'am', 'noch', 'wie', 'so', 'zum', 'ich', 'du', 'aber', 'wenn', 'wir', 'was', 'schon', 'mal', 'ja', 'gut'],
  it: ['di', 'a', 'da', 'in', 'con', 'su', 'per', 'tra', 'fra', 'il', 'lo', 'la', 'i', 'gli', 'le', 'un', 'una', 'che', 'e', 'non', 'più', 'come', 'anche', 'ma', 'se', 'si', 'questo', 'ci', 'sono', 'del', 'mi', 'ti', 'hai', 'ho', 'molto', 'bene', 'quando', 'cosa', 'fare', 'dire', 'sì', 'grazie', 'allora'],
  pl: ['i', 'w', 'nie', 'na', 'z', 'do', 'że', 'to', 'jest', 'tak', 'jak', 'o', 'ale', 'się', 'po', 'co', 'za', 'od', 'dla', 'przez', 'ten', 'ci', 'już', 'tu', 'też', 'tylko', 'mam', 'masz', 'mnie', 'bardzo', 'kiedy', 'domu', 'pracy', 'cześć', 'no', 'więc', 'jeszcze', 'czy', 'mi', 'go'],
  ro: ['de', 'a', 'în', 'și', 'la', 'cu', 'că', 'pe', 'un', 'o', 'este', 'sunt', 'pentru', 'din', 'care', 'mai', 'sa', 'am', 'ai', 'fost', 'dar', 'sau', 'nu', 'da', 'ce', 'îmi', 'îți', 'foarte', 'bine', 'acasă', 'mult', 'când', 'despre', 'mersi', 'salut', 'azi', 'mâine', 'acum', 'mi', 'te', 'ne', 'le']
}

// Language-specific characters. Weak evidence only: never required, since
// chat text is often typed without diacritics.
const SPECIAL_CHARS = {
  en: '',
  tr: 'çğıöşü',
  es: 'áéíóúñü¿¡',
  fr: 'àâçéèêëîïôùûÿœ',
  pt: 'ãõâêôáàçéíóú',
  de: 'äöüß',
  it: 'àèéìíîòóùú',
  pl: 'ąćęłńóśźż',
  ro: 'ăâîșțşţ'
}

const TOKEN_RE = /[\p{L}]+/gu
const LETTER_RE = /[\p{L}]/gu
const NON_LETTER_RE = /[^\p{L}]+/gu

const MIN_TOKENS = 25
const MIN_BATCH_TOKENS = 8
const BATCH_MESSAGES = 100
const BATCH_CHARS = 5000
const MAX_BATCHES = 60
const MIN_SCORE = 0.1
const MIN_REL_MARGIN = 0.2
const BATCH_REL_MARGIN = 0.25
const MIXED_SHARE = 0.35
const W_WORDS = 0.5
const W_NGRAM = 0.4
const W_CHARS = 0.1

const COMMON_SETS = {}
const SPECIAL_RE = {}
const REF_PROFILES = {}

function fold(value) {
  return normalizeUnicode(value).toLowerCase()
}

function ngramProfile(text) {
  const clean = ` ${text.replace(NON_LETTER_RE, ' ')} `
  const counts = new Map()
  let total = 0
  for (let n = 2; n <= 4; n += 1) {
    for (let i = 0; i + n <= clean.length; i += 1) {
      const gram = clean.slice(i, i + n)
      counts.set(gram, (counts.get(gram) || 0) + 1)
      total += 1
    }
  }
  if (total > 0) for (const [gram, count] of counts) counts.set(gram, count / total)
  return counts
}

function similarity(a, b) {
  let sum = 0
  for (const [gram, pa] of a) {
    const pb = b.get(gram)
    if (pb) sum += Math.min(pa, pb)
  }
  return sum
}

for (const lang of LANGUAGES) {
  COMMON_SETS[lang] = new Set(COMMON_WORDS[lang].map(fold))
  SPECIAL_RE[lang] = SPECIAL_CHARS[lang] ? new RegExp(`[${SPECIAL_CHARS[lang]}]`, 'g') : null
  const corpus = [...DEFAULT_STOPWORDS[lang], ...COMMON_WORDS[lang], ...COMMON_WORDS[lang]].join(' ')
  REF_PROFILES[lang] = ngramProfile(fold(corpus))
}

function makeBatches(texts) {
  const batches = []
  let current = []
  let chars = 0
  for (const text of texts) {
    current.push(text)
    chars += text.length + 1
    if (current.length >= BATCH_MESSAGES || chars >= BATCH_CHARS) {
      batches.push(current.join(' '))
      current = []
      chars = 0
    }
  }
  if (current.length) batches.push(current.join(' '))
  if (batches.length <= MAX_BATCHES) return batches
  const sampled = []
  for (let i = 0; i < MAX_BATCHES; i += 1) {
    sampled.push(batches[Math.floor((i * (batches.length - 1)) / (MAX_BATCHES - 1))])
  }
  return sampled
}

function scoreBatch(text) {
  const lower = fold(text)
  const tokens = lower.match(TOKEN_RE) || []
  const total = tokens.length
  if (total === 0) return { language: 'unknown', tokens: 0, scores: {} }
  const letters = (lower.match(LETTER_RE) || []).length || 1
  const grams = ngramProfile(lower)
  const scores = {}
  for (const lang of LANGUAGES) {
    let hits = 0
    for (const token of tokens) if (COMMON_SETS[lang].has(token)) hits += 1
    let charScore = 0
    if (SPECIAL_RE[lang]) {
      const matches = lower.match(SPECIAL_RE[lang])
      charScore = matches ? Math.min(1, (matches.length / letters) * 25) : 0
    }
    scores[lang] = W_WORDS * (hits / total) + W_NGRAM * similarity(grams, REF_PROFILES[lang]) + W_CHARS * charScore
  }
  const ranked = LANGUAGES.slice().sort((a, b) => scores[b] - scores[a])
  const top = ranked[0]
  const second = ranked[1]
  const confident = total >= MIN_BATCH_TOKENS &&
    scores[top] >= MIN_SCORE &&
    (scores[top] - scores[second]) / scores[top] >= BATCH_REL_MARGIN
  return { language: confident ? top : 'unknown', tokens: total, scores }
}

function clamp01(value) {
  return Math.min(1, Math.max(0, value))
}

export function detectChatLanguage(rawText) {
  const input = String(rawText || '')
  const parsed = parseChatText(input)
  const texts = parsed.messages.filter(message => !message.placeholder).map(message => message.text)
  const batches = makeBatches(texts.length ? texts : [input])
  const perBatch = batches.map(scoreBatch)

  const totalTokens = perBatch.reduce((sum, batch) => sum + batch.tokens, 0)
  if (totalTokens < MIN_TOKENS) return { language: 'unknown', confidence: 0, perBatch }

  const weighted = {}
  for (const lang of LANGUAGES) weighted[lang] = 0
  for (const batch of perBatch) {
    for (const lang of LANGUAGES) weighted[lang] += (batch.scores[lang] || 0) * batch.tokens
  }
  for (const lang of LANGUAGES) weighted[lang] /= totalTokens

  const ranked = LANGUAGES.slice().sort((a, b) => weighted[b] - weighted[a])
  const top = ranked[0]
  const second = ranked[1]
  if (weighted[top] < MIN_SCORE) return { language: 'unknown', confidence: 0, perBatch }

  const votes = {}
  let voteTokens = 0
  for (const batch of perBatch) {
    if (batch.language === 'unknown') continue
    votes[batch.language] = (votes[batch.language] || 0) + batch.tokens
    voteTokens += batch.tokens
  }
  const voteRanked = Object.entries(votes).sort((a, b) => b[1] - a[1])
  const isMixed = voteRanked.length >= 2 &&
    voteRanked[1][1] / voteTokens >= MIXED_SHARE &&
    voteRanked[0][1] / voteTokens >= MIXED_SHARE
  if (isMixed) return { language: 'mixed', confidence: clamp01(voteRanked[0][1] / voteTokens), perBatch }

  const relMargin = (weighted[top] - weighted[second]) / weighted[top]
  if (relMargin < MIN_REL_MARGIN) return { language: 'unknown', confidence: 0, perBatch }

  const confidence = clamp01(weighted[top] / 0.35) * clamp01(relMargin / 0.3)
  return { language: top, confidence: Math.round(confidence * 100) / 100, perBatch }
}
