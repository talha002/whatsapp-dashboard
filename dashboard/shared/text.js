import es from './stopwords/es.js'
import fr from './stopwords/fr.js'
import pt from './stopwords/pt.js'
import de from './stopwords/de.js'
import it from './stopwords/it.js'
import pl from './stopwords/pl.js'
import ro from './stopwords/ro.js'

const BIDI_RE = /[\u200e\u200f\u202a-\u202e\u2066-\u2069\ufeff]/g
const URL_RE = /(https?:\/\/[^\s]+|www\.[^\s]+)/gi
const TAG_RE = /<[^<>]*>/g
const TOKEN_RE = /[\p{L}]+/gu

export const TURKISH_STOPWORDS = [
  'acaba', 'altı', 'ama', 'ancak', 'artık', 'aslında', 'ayrıca', 'aynı', 'az', 'bakalım', 'bazı', 'bazıları', 'belki',
  'ben', 'bende', 'benden', 'beni', 'benim', 'beri', 'beş', 'bile', 'bir', 'bi', 'bide', 'bira', 'biraz', 'birçok', 'biri', 'birisi',
  'birkaç', 'bişi', 'bişey', 'bişeyler', 'birşey', 'birşeyler', 'biz', 'bizde', 'bizden', 'bizi', 'bizim', 'böyle', 'böylece',
  'bu', 'buna', 'bunda', 'bundan', 'bunlar', 'bunlara', 'bunları', 'bunların', 'bunu', 'bunun', 'burada', 'bütün', 'çok',
  'çünkü', 'da', 'daha', 'de', 'defa', 'değil', 'diğer', 'diye', 'dokuz', 'dolayı', 'dört', 'edecek', 'eden', 'ederek',
  'edilecek', 'ediliyor', 'edilmesi', 'ediyor', 'eğer', 'elbette', 'en', 'etmesi', 'etti', 'ettiği', 'ettiğini', 'evet',
  'eyvallah', 'falan', 'fazla', 'filan', 'gibi', 'göre', 'hala', 'halde', 'hani', 'hatta', 'hem', 'henüz', 'hep', 'hepsi',
  'her', 'herkes', 'hiç', 'hiçbir', 'iki', 'ile', 'ilgili', 'ise', 'işte', 'itibaren', 'itibariyle', 'için', 'içinde',
  'kadar', 'karşın', 'kendi', 'kendilerine', 'kendini', 'kendisi', 'kendisine', 'kez', 'ki', 'kim', 'kimden', 'kime',
  'kimi', 'kimse', 'mı', 'mi', 'mu', 'mü', 'nasıl', 'ne', 'neden', 'nerde', 'nerede', 'nereye', 'neyse', 'niye', 'niçin',
  'o', 'olan', 'olarak', 'oldu', 'olduğu', 'olduğunu', 'olduklarını', 'olmadı', 'olmadığı', 'olmak', 'olması', 'olmayan',
  'olmaz', 'olsa', 'olsun', 'olup', 'olur', 'olursa', 'oluyor', 'on', 'ona', 'ondan', 'onlar', 'onlara', 'onlardan',
  'onları', 'onların', 'onu', 'onun', 'otuz', 'oysca', 'öyle', 'pek', 'rağmen', 'sadece', 'sanki', 'sekiz', 'sonra', 'sen', 'sende',
  'senden', 'seni', 'senin', 'siz', 'sizde', 'sizden', 'sizi', 'sizin', 'şey', 'şeyden', 'şeyi', 'şeyler', 'şimdi', 'şöyle',
  'şu', 'şuna', 'şunda', 'şundan', 'şunlar', 'şunları', 'şunu', 'şunun', 'tabi', 'tam', 'tamamen', 'tüm', 'var', 'vardı',
  've', 'veya', 'ya', 'yani', 'yapacak', 'yapılan', 'yapılması', 'yapıyor', 'yapmak', 'yaptı', 'yaptığı', 'yaptıkları',
  'yaptığını', 'yedi', 'yerine', 'yetmiş', 'yine', 'yirmi', 'yok', 'yoksa', 'yüz', 'zaten'
]

export const TURKISH_CHAT_STOPWORDS = [
  'abi', 'abisi', 'aga', 'agam', 'bana', 'beyler', 'gençler', 'hacı', 'hacılar',
  'he', 'hee', 'hı', 'hmm', 'kanka', 'kanki', 'kardeş', 'kardeşim', 'karsim', 'karşim', 'knk', 'la', 'lan', 'le', 'len', 'lo',
  'moruk', 'ok', 'okay', 'okk', 'olm', 'sana', 'şuan', 'tamam', 'tamamdır', 'tmm', 'yav', 'yüzden', 'zaman',
  'adet', 'bize', 'dedi', 'dedik', 'dediler', 'dedim', 'dedin', 'diyeyim', 'diyor', 'diyorlar', 'diyorum', 'diyorsun', 'diyoruz',
  'kere', 'misin', 'misiniz', 'mısın', 'mısınız', 'musun', 'musunuz', 'müsün', 'müsünüz', 'olabilir', 'olabilirim',
  'olabilirsin', 'önce', 'önceden', 'size', 'sizlere', 'tane'
]

export const ENGLISH_STOPWORDS = [
  'a', 'about', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'as', 'at', 'be', 'because', 'been',
  'before', 'being', 'below', 'between', 'both', 'but', 'by', 'can', 'cannot', 'cant', 'could', 'did', 'do', 'does',
  'doing', 'dont', 'down', 'during', 'each', 'few', 'for', 'from', 'further', 'had', 'has', 'have', 'having', 'he', 'her',
  'here', 'hers', 'herself', 'him', 'himself', 'his', 'how', 'i', 'if', 'im', 'in', 'into', 'is', 'it', 'its', 'itself',
  'ive', 'just', 'like', 'me', 'more', 'most', 'my', 'myself', 'no', 'nor', 'not', 'now', 'of', 'off', 'on', 'once',
  'only', 'or', 'other', 'ought', 'our', 'ours', 'ourselves', 'out', 'over', 'own', 'same', 'she', 'should', 'so', 'some',
  'such', 'than', 'that', 'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there', 'these', 'they', 'this', 'those',
  'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was', 'we', 'were', 'what', 'when', 'where', 'which', 'while',
  'who', 'whom', 'why', 'with', 'would', 'you', 'your', 'yours', 'yourself', 'yourselves'
]

export function normalizeUnicode(value = '') {
  return String(value).normalize('NFC').replace(BIDI_RE, '')
}

const HTML_ESCAPE_RE = /[&<>"']/g
const HTML_ESCAPE_MAP = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }

export function escapeHtml(value = '') {
  return String(value).replace(HTML_ESCAPE_RE, (char) => HTML_ESCAPE_MAP[char])
}

function lowercase(value, language) {
  const lowered = value.toLocaleLowerCase(language).normalize('NFC')
  // Older Romanian lists/exports use cedillas; modern spelling uses commas below.
  return language === 'ro' ? lowered.replace(/ş/g, 'ș').replace(/ţ/g, 'ț') : lowered
}

export function normalizeToken(value = '', language = 'en') {
  return lowercase(normalizeUnicode(value).trim(), language)
}

// Language-specific chat fillers, not translations of the EN/TR lists.
// Sources and editorial choices are documented in stopwords/README.md.
export const SPANISH_STOPWORDS = es
export const FRENCH_STOPWORDS = fr
export const PORTUGUESE_STOPWORDS = pt
export const GERMAN_STOPWORDS = de
export const ITALIAN_STOPWORDS = it
export const POLISH_STOPWORDS = pl
export const ROMANIAN_STOPWORDS = ro
export const SPANISH_CHAT_STOPWORDS = ['jaja', 'jajaja', 'jeje', 'xd', 'tqm']
export const FRENCH_CHAT_STOPWORDS = ['mdr', 'ptdr', 'slt', 'bjr', 'stp', 'svp', 'tkt']
export const PORTUGUESE_CHAT_STOPWORDS = ['rs', 'rsrs', 'rsrsrs', 'kkk', 'kkkk', 'vc', 'vcs', 'blz', 'vlw']
export const GERMAN_CHAT_STOPWORDS = ['digga', 'digger', 'lol', 'lg', 'mfg', 'hdl']
export const ITALIAN_CHAT_STOPWORDS = ['ahah', 'ahahah', 'tvb', 'tvtb', 'cmq', 'nn', 'xké', 'xke']
export const POLISH_CHAT_STOPWORDS = ['no', 'xd', 'xddd', 'hej', 'elo', 'spoko', 'nwm', 'pzdr']
export const ROMANIAN_CHAT_STOPWORDS = ['ms', 'mersi', 'sal', 'cf', 'bn', 'nb', 'pwp']

export const DEFAULT_STOPWORDS = {
  en: ENGLISH_STOPWORDS,
  tr: [...TURKISH_STOPWORDS, ...TURKISH_CHAT_STOPWORDS],
  es: [...es, ...SPANISH_CHAT_STOPWORDS],
  fr: [...fr, ...FRENCH_CHAT_STOPWORDS],
  pt: [...pt, ...PORTUGUESE_CHAT_STOPWORDS],
  de: [...de, ...GERMAN_CHAT_STOPWORDS],
  it: [...it, ...ITALIAN_CHAT_STOPWORDS],
  pl: [...pl, ...POLISH_CHAT_STOPWORDS],
  ro: [...ro, ...ROMANIAN_CHAT_STOPWORDS]
}
// Untagged legacy datasets retain the original EN/TR combined defaults.
const STOPWORDS = new Set([...DEFAULT_STOPWORDS.tr, ...DEFAULT_STOPWORDS.en].map(word => normalizeToken(word, 'tr')))

export function isPlaceholderText(value = '') {
  const normalized = normalizeToken(value, 'tr')
  return normalized === '<medya dahil edilmedi>' ||
    normalized === '<media omitted>' ||
    normalized === 'bu mesajı sildiniz' ||
    normalized === 'this message was deleted' ||
    normalized === 'you deleted this message'
}

export function cleanTextForWords(value = '', language = 'tr') {
  return lowercase(normalizeUnicode(value)
    .replace(URL_RE, ' ')
    .replace(TAG_RE, ' ')
    .replace(/@/g, ' '), language)
}

export function tokenizeText(value = '', stopwords, language) {
  const active = stopwords || (language && DEFAULT_STOPWORDS[language]
    ? new Set(DEFAULT_STOPWORDS[language].map(word => normalizeToken(word, language)))
    : STOPWORDS)
  const cleaned = cleanTextForWords(value, language)
  const matches = cleaned.match(TOKEN_RE) || []
  return matches.filter((token) => token.length > 1 && !active.has(token))
}

export function tokenFrequency(tokens) {
  const counts = new Map()
  for (const token of tokens || []) {
    counts.set(token, (counts.get(token) || 0) + 1)
  }
  return counts
}
