import { useSyncExternalStore } from 'react'

export type Locale = 'en' | 'tr'

const STORAGE_KEY = 'wp:locale'

function isLocale(value: string | null): value is Locale {
  return value === 'en' || value === 'tr'
}

const en = {
  'tabs.dashboard': 'Dashboard',
  'tabs.documents': 'Documents',
  'tabs.wordlists': 'Word Lists',
  'tabs.dashboardHint': 'Charts and stats for loaded chats',
  'tabs.documentsHint': 'Upload and manage chats',
  'tabs.wordlistsHint': 'Customize stop/ban words',

  'app.eyebrow': 'WhatsApp chat analytics',
  'app.tagline': 'Chat analytics & text analysis platform',
  'app.overall': 'Overall: {range} • {participants}',
  'app.noParsedYears': 'No parsed years',
  'app.sources': 'Sources:',
  'app.footerParsed':
    'Parsed {messages} messages • {systemEvents} system events • {continuationLines} continuation lines • {placeholders} placeholders',

  'status.loadErrorTitle': 'Dashboard data could not be loaded',
  'status.loadErrorHint': 'You can still upload and analyze text documents from the Documents tab.',
  'status.loadErrorAction': 'Go to Documents',
  'status.loadingTitle': 'Loading chat analytics…',
  'status.loadingBody': 'Reading dashboard data.',
  'onboarding.title': 'Welcome to WhatsApp chat analytics',
  'onboarding.intro':
    'Turn any WhatsApp export into charts about words, activity, and reply habits — everything runs locally in your browser, nothing is uploaded.',
  'onboarding.tabDashboard': 'Dashboard — charts and stats for the loaded chats',
  'onboarding.tabDocuments': 'Documents — paste or upload chat exports, stored only in this browser',
  'onboarding.tabWordlists': 'Word lists — tune the stop-words and banned words used by the analysis',
  'onboarding.loadSample': 'Load sample data',
  'onboarding.uploadOwn': 'Upload your own chat',
  'onboarding.sampleTitle': 'Sample chat',

  'selection.focusedOn': 'Focused on document:',
  'selection.showAll': 'Show all data',

  'charts.wordCloud.title': 'Word Cloud',
  'charts.wordCloud.subtitle': 'Independent filters for frequent cleaned words',
  'charts.topWords.title': 'Top 10 Words',
  'charts.topWords.subtitle': 'Independent person/year/month filters',
  'charts.network.title': 'Word Co-occurrence Network',
  'charts.network.subtitle': 'Top words linked when they appear close together',
  'charts.wordCounts.title': 'Word Counts',
  'charts.wordCounts.subtitle': 'Independent filters plus year/month/person comparison',
  'charts.activity.title': 'Message Activity',
  'charts.activity.subtitle': 'Monthly activity per participant; select a month to see daily activity',
  'charts.responseTime.title': 'Response-Time Analysis',
  'charts.responseTime.subtitle': 'Median reply gap by person, weekday, hour, or year',
  'charts.heatmap.title': 'Weekday × Hour Heatmap',
  'charts.heatmap.subtitle': 'When the conversation is active',
  'charts.sessions.title': 'Conversation Sessions',
  'charts.sessions.subtitle': 'Sessions split after 3 hours of silence',
  'charts.participantStyle.title': 'Participant Style',
  'charts.participantStyle.subtitle': 'Length, vocabulary, questions, emoji, links, and placeholders',

  'filters.aria': 'Chart filters',
  'filters.year': 'Year',
  'filters.month': 'Month',
  'filters.person': 'Person',
  'filters.allYears': 'All years',
  'filters.allMonths': 'All months',
  'filters.allParticipants': 'All participants',
  'filters.noData': 'no data',

  'summary.aria': 'Summary',
  'summary.totalMessages': 'Total messages',
  'summary.totalWords': 'Total words',
  'summary.participants': 'Participants',
  'summary.mostActive': 'Most active participant',
  'summary.messages': '{count} messages',

  'docs.uploadTitle': 'Upload Text',
  'docs.uploadSubtitle': 'Paste text or choose a .txt file, pick its language, then save',
  'docs.titleField': 'Title',
  'docs.titlePlaceholder': 'Document title',
  'docs.languageField': 'Language (stop-word list)',
  'docs.langTr': 'Turkish (TR)',
  'docs.langEn': 'English (EN)',
  'docs.fileField': 'From file',
  'docs.contentField': 'Content',
  'docs.contentPlaceholder': 'Paste text here…',
  'docs.save': 'Save document',
  'docs.savedTitle': 'Saved Documents',
  'docs.savedSubtitle': 'Stored in this browser • click one to focus the Dashboard on it',
  'docs.empty': 'No documents saved yet.',
  'docs.deleteTitle': 'Delete document',
  'docs.sourceFile': 'file',
  'docs.sourcePaste': 'paste',
  'docs.errorTooLarge': 'The selected file is too large (25 MB maximum).',
  'docs.errorUnreadable': 'The selected file could not be read.',
  'docs.errorEmpty': 'Paste text or choose a .txt file before saving.',
  'docs.errorSaveFailed': 'Document could not be saved.',
  'docs.untitled': 'Untitled document',

  'wordlists.stopwordsTitle': 'Stop-Words',
  'wordlists.stopwordsSubtitle': '{count} active words for {language} • excluded from all analysis',
  'wordlists.turkish': 'Turkish',
  'wordlists.english': 'English',
  'wordlists.resetDefaults': 'Reset defaults',
  'wordlists.addStopword': 'Add stop-word ({language})',
  'wordlists.stopwordPlaceholder': 'e.g. şey',
  'wordlists.filterList': 'Filter list',
  'wordlists.searchPlaceholder': 'Search words…',
  'wordlists.addStopwordButton': 'Add stop-word',
  'wordlists.banwordsTitle': 'Ban-Words',
  'wordlists.banwordsSubtitle': '{count} banned words • excluded from every analysis in all languages',
  'wordlists.addBanword': 'Add ban-word',
  'wordlists.banwordPlaceholder': 'Word to ban from analysis…',
  'wordlists.addBanwordButton': 'Add ban-word',
  'wordlists.empty': 'No words to show.',
  'wordlists.removeWord': 'Remove word',

  'bar.compareBy': 'Compare by',
  'bar.auto': 'Auto',
  'bar.year': 'Year',
  'bar.month': 'Month',
  'bar.person': 'Person',
  'bar.wordsAxis': 'Words',

  'activity.messages': 'Messages',
  'activity.words': 'Words',
  'activity.metricAria': 'Activity metric',

  'response.caption': 'Replies after sender change, capped at 12h',
  'response.groupBy': 'Group by',
  'response.person': 'Person',
  'response.weekday': 'Weekday',
  'response.hour': 'Hour',
  'response.year': 'Year',
  'response.empty': 'No response gaps for the current filters.',
  'response.medianResponse': 'Median response',
  'response.responses': 'Responses',
  'response.yAxis': 'Median response',
  'response.series': 'Median response time',

  'heatmap.messages': '{count} messages',
  'heatmap.series': 'Messages',

  'sessions.sessions': 'Sessions',
  'sessions.avgMessages': 'Avg messages',
  'sessions.medianGap': 'Median gap',
  'sessions.yAxis': 'Sessions',
  'sessions.starters': 'Conversation starters',
  'sessions.sessionsCount': '{count} sessions',

  'style.messages': 'Messages',
  'style.wordsPerMessage': 'Words/message',
  'style.uniquePerK': 'Unique/1k words',
  'style.questions': 'Questions',
  'style.emojiPerMessage': 'Emoji/message',
  'style.links': 'Links',
  'style.mediaDeleted': 'Media/deleted',
  'style.wordsAxis': 'Words/msg',
  'style.uniqueAxis': 'Unique/1k',
  'style.seriesWords': 'Words / message',
  'style.seriesUnique': 'Unique words / 1k',

  'network.empty': 'No word co-occurrence network for the current filters.',
  'network.stats': '{nodes} nodes • {edges} edges • window ≤ 2 tokens • min edge count 2',
  'network.cooccurrences': 'Co-occurrences',
  'network.frequency': 'Frequency',

  'empty.default': 'No data for the current filters.',

  'errorBoundary.title': 'Something went wrong',
  'errorBoundary.body':
    'A saved document may be causing this error. You can reload the page, or delete all saved documents and reload (this cannot be undone).',
  'errorBoundary.reload': 'Reload',
  'errorBoundary.clearAndReload': 'Delete saved documents & reload',

  'lang.switchLabel': 'Language'
}

const tr: Record<keyof typeof en, string> = {
  'tabs.dashboard': 'Pano',
  'tabs.documents': 'Belgeler',
  'tabs.wordlists': 'Kelime Listeleri',
  'tabs.dashboardHint': 'Yüklü sohbetler için grafikler',
  'tabs.documentsHint': 'Sohbet yükle ve yönet',
  'tabs.wordlistsHint': 'Stop/yasak kelimeleri özelleştir',

  'app.eyebrow': 'WhatsApp sohbet analitiği',
  'app.tagline': 'Sohbet analitiği ve metin analizi platformu',
  'app.overall': 'Genel: {range} • {participants}',
  'app.noParsedYears': 'Ayrıştırılmış yıl yok',
  'app.sources': 'Kaynaklar:',
  'app.footerParsed':
    '{messages} mesaj ayrıştırıldı • {systemEvents} sistem olayı • {continuationLines} devam satırı • {placeholders} yer tutucu',

  'status.loadErrorTitle': 'Pano verileri yüklenemedi',
  'status.loadErrorHint': 'Belgeler sekmesinden metin belgeleri yükleyip analiz etmeye devam edebilirsiniz.',
  'status.loadErrorAction': 'Belgeler’e git',
  'status.loadingTitle': 'Sohbet analitiği yükleniyor…',
  'status.loadingBody': 'Pano verileri okunuyor.',
  'onboarding.title': 'WhatsApp sohbet analitiğine hoş geldiniz',
  'onboarding.intro':
    'Herhangi bir WhatsApp dışa aktarımını kelime, etkinlik ve yanıt alışkanlıkları grafiklerine dönüştürün — her şey tarayıcınızda yerel olarak çalışır, hiçbir şey yüklenmez.',
  'onboarding.tabDashboard': 'Pano — yüklenen sohbetler için grafikler ve istatistikler',
  'onboarding.tabDocuments': 'Belgeler — sohbet dışa aktarımlarını yapıştırın veya yükleyin, yalnızca bu tarayıcıda saklanır',
  'onboarding.tabWordlists': 'Kelime listeleri — analizde kullanılan stop-kelimeleri ve yasaklı kelimeleri ayarlayın',
  'onboarding.loadSample': 'Örnek veriyi yükle',
  'onboarding.uploadOwn': 'Kendi sohbetini yükle',
  'onboarding.sampleTitle': 'Örnek sohbet',

  'selection.focusedOn': 'Odak belgesi:',
  'selection.showAll': 'Tüm verileri göster',

  'charts.wordCloud.title': 'Kelime Bulutu',
  'charts.wordCloud.subtitle': 'Sık kullanılan temizlenmiş kelimeler için bağımsız filtreler',
  'charts.topWords.title': 'İlk 10 Kelime',
  'charts.topWords.subtitle': 'Bağımsız kişi/yıl/ay filtreleri',
  'charts.network.title': 'Kelime Birlikte Geçme Ağı',
  'charts.network.subtitle': 'Yakın görünen sık kelimeler birbirine bağlanır',
  'charts.wordCounts.title': 'Kelime Sayıları',
  'charts.wordCounts.subtitle': 'Bağımsız filtreler ve yıl/ay/kişi karşılaştırması',
  'charts.activity.title': 'Mesaj Etkinliği',
  'charts.activity.subtitle': 'Katılımcı başına aylık etkinlik; günlük etkinliği görmek için bir ay seçin',
  'charts.responseTime.title': 'Yanıt Süresi Analizi',
  'charts.responseTime.subtitle': 'Kişi, hafta günü, saat veya yıla göre medyan yanıt aralığı',
  'charts.heatmap.title': 'Gün × Saat Isı Haritası',
  'charts.heatmap.subtitle': 'Sohbetin aktif olduğu zamanlar',
  'charts.sessions.title': 'Sohbet Oturumları',
  'charts.sessions.subtitle': '3 saatlik sessizlikten sonra oturumlar bölünür',
  'charts.participantStyle.title': 'Katılımcı Tarzı',
  'charts.participantStyle.subtitle': 'Uzunluk, kelime dağarcığı, sorular, emoji, bağlantılar ve yer tutucular',

  'filters.aria': 'Grafik filtreleri',
  'filters.year': 'Yıl',
  'filters.month': 'Ay',
  'filters.person': 'Kişi',
  'filters.allYears': 'Tüm yıllar',
  'filters.allMonths': 'Tüm aylar',
  'filters.allParticipants': 'Tüm katılımcılar',
  'filters.noData': 'veri yok',

  'summary.aria': 'Özet',
  'summary.totalMessages': 'Toplam mesaj',
  'summary.totalWords': 'Toplam kelime',
  'summary.participants': 'Katılımcılar',
  'summary.mostActive': 'En aktif katılımcı',
  'summary.messages': '{count} mesaj',

  'docs.uploadTitle': 'Metin Yükle',
  'docs.uploadSubtitle': 'Metin yapıştırın veya bir .txt dosyası seçin, dilini belirleyin ve kaydedin',
  'docs.titleField': 'Başlık',
  'docs.titlePlaceholder': 'Belge başlığı',
  'docs.languageField': 'Dil (stop-word listesi)',
  'docs.langTr': 'Türkçe (TR)',
  'docs.langEn': 'İngilizce (EN)',
  'docs.fileField': 'Dosyadan',
  'docs.contentField': 'İçerik',
  'docs.contentPlaceholder': 'Metni buraya yapıştırın…',
  'docs.save': 'Belgeyi kaydet',
  'docs.savedTitle': 'Kayıtlı Belgeler',
  'docs.savedSubtitle': 'Bu tarayıcıda saklanır • Panoyu bir belgeye odaklamak için üzerine tıklayın',
  'docs.empty': 'Henüz kayıtlı belge yok.',
  'docs.deleteTitle': 'Belgeyi sil',
  'docs.sourceFile': 'dosya',
  'docs.sourcePaste': 'yapıştırma',
  'docs.errorTooLarge': 'Seçilen dosya çok büyük (en fazla 25 MB).',
  'docs.errorUnreadable': 'Seçilen dosya okunamadı.',
  'docs.errorEmpty': 'Kaydetmeden önce metin yapıştırın veya bir .txt dosyası seçin.',
  'docs.errorSaveFailed': 'Belge kaydedilemedi.',
  'docs.untitled': 'Adsız belge',

  'wordlists.stopwordsTitle': 'Stop-Kelimeler',
  'wordlists.stopwordsSubtitle': '{language} için {count} aktif kelime • tüm analizlerden hariç tutulur',
  'wordlists.turkish': 'Türkçe',
  'wordlists.english': 'İngilizce',
  'wordlists.resetDefaults': 'Varsayılanlara dön',
  'wordlists.addStopword': 'Stop-kelime ekle ({language})',
  'wordlists.stopwordPlaceholder': 'örn. şey',
  'wordlists.filterList': 'Listeyi filtrele',
  'wordlists.searchPlaceholder': 'Kelime ara…',
  'wordlists.addStopwordButton': 'Stop-kelime ekle',
  'wordlists.banwordsTitle': 'Yasaklı Kelimeler',
  'wordlists.banwordsSubtitle': '{count} yasaklı kelime • tüm dillerdeki her analizden hariç tutulur',
  'wordlists.addBanword': 'Yasaklı kelime ekle',
  'wordlists.banwordPlaceholder': 'Analizden yasaklanacak kelime…',
  'wordlists.addBanwordButton': 'Yasaklı kelime ekle',
  'wordlists.empty': 'Gösterilecek kelime yok.',
  'wordlists.removeWord': 'Kelimeyi kaldır',

  'bar.compareBy': 'Karşılaştır',
  'bar.auto': 'Otomatik',
  'bar.year': 'Yıl',
  'bar.month': 'Ay',
  'bar.person': 'Kişi',
  'bar.wordsAxis': 'Kelimeler',

  'activity.messages': 'Mesajlar',
  'activity.words': 'Kelimeler',
  'activity.metricAria': 'Etkinlik ölçütü',

  'response.caption': 'Gönderen değişiminden sonraki yanıtlar, 12 saatle sınırlı',
  'response.groupBy': 'Grupla',
  'response.person': 'Kişi',
  'response.weekday': 'Hafta günü',
  'response.hour': 'Saat',
  'response.year': 'Yıl',
  'response.empty': 'Mevcut filtreler için yanıt aralığı yok.',
  'response.medianResponse': 'Medyan yanıt',
  'response.responses': 'Yanıtlar',
  'response.yAxis': 'Medyan yanıt',
  'response.series': 'Medyan yanıt süresi',

  'heatmap.messages': '{count} mesaj',
  'heatmap.series': 'Mesajlar',

  'sessions.sessions': 'Oturumlar',
  'sessions.avgMessages': 'Ort. mesaj',
  'sessions.medianGap': 'Medyan aralık',
  'sessions.yAxis': 'Oturumlar',
  'sessions.starters': 'Sohbet başlatanlar',
  'sessions.sessionsCount': '{count} oturum',

  'style.messages': 'Mesajlar',
  'style.wordsPerMessage': 'Kelime/mesaj',
  'style.uniquePerK': 'Benzersiz/1b kelime',
  'style.questions': 'Sorular',
  'style.emojiPerMessage': 'Emoji/mesaj',
  'style.links': 'Bağlantılar',
  'style.mediaDeleted': 'Medya/silinen',
  'style.wordsAxis': 'Kelime/msg',
  'style.uniqueAxis': 'Benzersiz/1b',
  'style.seriesWords': 'Kelime / mesaj',
  'style.seriesUnique': 'Benzersiz kelime / 1b',

  'network.empty': 'Mevcut filtreler için kelime birlikte geçme ağı yok.',
  'network.stats': '{nodes} düğüm • {edges} kenar • pencere ≤ 2 belirteç • min kenar sayısı 2',
  'network.cooccurrences': 'Birlikte geçme',
  'network.frequency': 'Sıklık',

  'empty.default': 'Mevcut filtreler için veri yok.',

  'errorBoundary.title': 'Bir şeyler ters gitti',
  'errorBoundary.body':
    'Kayıtlı bir belge bu hataya neden oluyor olabilir. Sayfayı yeniden yükleyebilir veya tüm kayıtlı belgeleri silip yeniden yükleyebilirsiniz (bu geri alınamaz).',
  'errorBoundary.reload': 'Yeniden yükle',
  'errorBoundary.clearAndReload': 'Kayıtlı belgeleri sil ve yeniden yükle',

  'lang.switchLabel': 'Dil'
}

export type MessageKey = keyof typeof en

export const messages: Record<Locale, Record<MessageKey, string>> = { en, tr }

export function detectLocale(language?: string): Locale {
  return typeof language === 'string' && language.toLowerCase().startsWith('tr') ? 'tr' : 'en'
}

export function resolveLocale(stored: string | null, language?: string): Locale {
  if (isLocale(stored)) return stored
  return detectLocale(language)
}

export function translate(locale: Locale, key: string, vars?: Record<string, string | number>): string {
  let template = messages[locale][key as MessageKey] ?? en[key as MessageKey] ?? key
  if (vars) {
    for (const [name, value] of Object.entries(vars)) {
      template = template.split(`{${name}}`).join(String(value))
    }
  }
  return template
}

function readStoredLocale(): string | null {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

function readBrowserLanguage(): string | undefined {
  return typeof navigator === 'undefined' ? undefined : navigator.language
}

let currentLocale: Locale = resolveLocale(readStoredLocale(), readBrowserLanguage())

const listeners = new Set<() => void>()

export function getLocale(): Locale {
  return currentLocale
}

export function setLocale(locale: Locale) {
  if (locale === currentLocale) return
  currentLocale = locale
  try {
    localStorage.setItem(STORAGE_KEY, locale)
  } catch {}
  for (const listener of listeners) listener()
}

export function subscribeLocale(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function useLocale(): Locale {
  return useSyncExternalStore(subscribeLocale, getLocale, getLocale)
}

export function useT() {
  const locale = useLocale()
  return (key: MessageKey, vars?: Record<string, string | number>) => translate(locale, key, vars)
}

const monthFormatters = new Map<Locale, Intl.DateTimeFormat>()

export function getMonthFormatter(locale: Locale): Intl.DateTimeFormat {
  let formatter = monthFormatters.get(locale)
  if (!formatter) {
    formatter = new Intl.DateTimeFormat(locale, { month: 'short', year: 'numeric', timeZone: 'UTC' })
    monthFormatters.set(locale, formatter)
  }
  return formatter
}

function labelDate(year: number, month: number, day: number) {
  const date = new Date(0)
  date.setUTCFullYear(year, month - 1, day)
  date.setUTCHours(0, 0, 0, 0)
  return date
}

const monthShortCache = new Map<Locale, string[]>()
const monthFullCache = new Map<Locale, string[]>()

export function getMonthShortLabels(locale: Locale): string[] {
  let labels = monthShortCache.get(locale)
  if (!labels) {
    const formatter = new Intl.DateTimeFormat(locale, { month: 'short', timeZone: 'UTC' })
    labels = Array.from({ length: 12 }, (_, index) => formatter.format(labelDate(2024, index + 1, 1)))
    monthShortCache.set(locale, labels)
  }
  return labels
}

export function getMonthFullLabels(locale: Locale): string[] {
  let labels = monthFullCache.get(locale)
  if (!labels) {
    const formatter = new Intl.DateTimeFormat(locale, { month: 'long', timeZone: 'UTC' })
    labels = Array.from({ length: 12 }, (_, index) => formatter.format(labelDate(2024, index + 1, 1)))
    monthFullCache.set(locale, labels)
  }
  return labels
}

const weekdayCache = new Map<Locale, string[]>()

export function getWeekdayLabels(locale: Locale): string[] {
  let labels = weekdayCache.get(locale)
  if (!labels) {
    const formatter = new Intl.DateTimeFormat(locale, { weekday: 'short', timeZone: 'UTC' })
    // 2024-01-01 is a Monday; keep Monday-first ordering.
    labels = Array.from({ length: 7 }, (_, index) => formatter.format(labelDate(2024, 1, index + 1)))
    weekdayCache.set(locale, labels)
  }
  return labels
}

const numberFormatters = new Map<Locale, Intl.NumberFormat>()

export function getNumberFormatter(locale: Locale): Intl.NumberFormat {
  let formatter = numberFormatters.get(locale)
  if (!formatter) {
    formatter = new Intl.NumberFormat(locale)
    numberFormatters.set(locale, formatter)
  }
  return formatter
}

const dateTimeFormatters = new Map<Locale, Intl.DateTimeFormat>()

export function getDateTimeFormatter(locale: Locale): Intl.DateTimeFormat {
  let formatter = dateTimeFormatters.get(locale)
  if (!formatter) {
    formatter = new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' })
    dateTimeFormatters.set(locale, formatter)
  }
  return formatter
}
