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

export function normalizeToken(value = '') {
  return normalizeUnicode(value).trim().toLocaleLowerCase('tr')
}

const STOPWORDS = new Set([...TURKISH_STOPWORDS, ...TURKISH_CHAT_STOPWORDS, ...ENGLISH_STOPWORDS].map(normalizeToken))

export function isPlaceholderText(value = '') {
  const normalized = normalizeToken(value)
  return normalized === '<medya dahil edilmedi>' ||
    normalized === '<media omitted>' ||
    normalized === 'bu mesajı sildiniz' ||
    normalized === 'this message was deleted' ||
    normalized === 'you deleted this message'
}

export function cleanTextForWords(value = '') {
  return normalizeUnicode(value)
    .replace(URL_RE, ' ')
    .replace(TAG_RE, ' ')
    .replace(/@/g, ' ')
    .toLocaleLowerCase('tr')
}

export function tokenizeText(value = '', stopwords) {
  const active = stopwords || STOPWORDS
  const cleaned = cleanTextForWords(value)
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
