import { useSyncExternalStore } from 'react'

import { isLanguage, type Language } from './languages'
import es from './locales/es'
import fr from './locales/fr'
import pt from './locales/pt'
import de from './locales/de'
import it from './locales/it'
import pl from './locales/pl'
import ro from './locales/ro'

export type Locale = Language

const STORAGE_KEY = 'wp:locale'

function isLocale(value: string | null): value is Locale {
  return isLanguage(value)
}

const en = {
  'tabs.dashboard': 'Dashboard',
  'tabs.documents': 'Documents',
  'tabs.wordlists': 'Word Lists',
  'tabs.dashboardHint': "Explore words, activity, and reply habits",
  'tabs.documentsHint': "Add chats to explore",
  'tabs.wordlistsHint': "Choose which words to leave out",

  'app.eyebrow': 'WhatsApp chat analytics',
  'app.tagline': 'Chat analytics & text analysis platform',
  'app.overall': 'Overall: {range} • {participants}',
  'app.moreParticipants': '+{count} more',
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
  'onboarding.tabWordlists': "Word lists — choose which words to leave out of word counts and charts",
  'onboarding.loadSample': 'Load sample data',
  'onboarding.uploadOwn': 'Upload your own chat',
  'onboarding.sampleTitle': 'Sample chat',

  'selection.focusedOn': 'Focused on document:',
  'selection.showAll': 'Show all data',

  'charts.wordCloud.title': 'Word Cloud',
  'charts.wordCloud.subtitle': "Which words come up most? Bigger words appear more often.",
  'charts.topWords.title': "Top 10 Words",
  'charts.topWords.subtitle': "What are the ten most-used words, and how often does each appear?",
  'charts.network.title': "Words Used Together",
  'charts.network.subtitle': "Which words tend to appear together? Lines connect words used near each other in messages.",
  'charts.wordCounts.title': 'Word Counts',
  'charts.wordCounts.subtitle': "Who writes the most, and how does that change over time? Compare word totals by person, month, or year.",
  'charts.activity.title': 'Message Activity',
  'charts.activity.subtitle': "When does the chat get busier? Follow message or word totals over time; choose a month for a daily view.",
  'charts.responseTime.title': 'Response-Time Analysis',
  'charts.responseTime.subtitle': "How quickly do people reply? Compare typical reply times by person, day of the week, hour, or year.",
  'charts.heatmap.title': 'Weekday × Hour Heatmap',
  'charts.heatmap.subtitle': "Which days and hours are busiest? Brighter cells mean more messages.",
  'charts.sessions.title': 'Conversation Sessions',
  'charts.sessions.subtitle': "Who gets the conversation going? See who starts conversations and how many messages they contain on average. A pause of more than three hours starts a new session.",
  'charts.participantStyle.title': 'Participant Style',
  'charts.participantStyle.subtitle': "How does each person write? Compare message length, word variety, questions, emoji, and links.",

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
  'docs.uploadSubtitle': "Ready to explore a chat? Paste text or choose a .txt file, select the text language, and save it to see the results.",
  'docs.titleField': 'Title',
  'docs.titlePlaceholder': 'Document title',
  'docs.languageField': "Text language (for common words to exclude)",
  'docs.langTr': 'Turkish (TR)',
  'docs.langEn': 'English (EN)',
  'docs.fileField': 'From file',
  'docs.contentField': 'Content',
  'docs.contentPlaceholder': 'Paste text here…',
  'docs.save': 'Save document',
  'docs.savedTitle': 'Saved Documents',
  'docs.savedSubtitle': "Which chat would you like to explore? Select a document to see its charts. Saved documents stay in this browser.",
  'docs.empty': "Your saved chats will appear here. Paste text or add a .txt file above to get started.",
  'docs.deleteTitle': 'Delete document',
  'docs.sourceFile': 'file',
  'docs.sourcePaste': 'paste',
  'docs.errorTooLarge': 'The selected file is too large (25 MB maximum).',
  'docs.errorUnreadable': 'The selected file could not be read.',
  'docs.errorEmpty': 'Paste text or choose a .txt file before saving.',
  'docs.errorSaveFailed': 'Document could not be saved.',
  'docs.untitled': 'Untitled document',
  'docs.detecting': 'Detecting language…',
  'docs.detectInconclusive': 'Could not detect the language confidently. Please check the selection.',

  'wordlists.stopwordsTitle': "Common Words to Ignore",
  'wordlists.stopwordsSubtitle': "Which everyday words add little meaning? Leave them out of word counts and charts to highlight the conversation. {count} words excluded for {language}.",
  'wordlists.turkish': 'Turkish',
  'wordlists.english': 'English',
  'wordlists.resetDefaults': 'Reset defaults',
  'wordlists.addStopword': "Ignore a common word ({language})",
  'wordlists.stopwordPlaceholder': "e.g. well",
  'wordlists.filterList': 'Filter list',
  'wordlists.searchPlaceholder': 'Search words…',
  'wordlists.addStopwordButton': "Add word",
  'wordlists.banwordsTitle': "Words to Exclude",
  'wordlists.banwordsSubtitle': "Add words you want to leave out of word counts and charts. This list applies to every language.",
  'wordlists.addBanword': "Word to exclude",
  'wordlists.banwordPlaceholder': "Enter a word to leave out…",
  'wordlists.addBanwordButton': "Exclude word",
  'wordlists.empty': "No words to show. Try a different search or add a word to this list.",
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

  'response.caption': "Typical means the median: half of replies are faster and half slower. Only consecutive messages from different people, more than zero and up to 12 hours apart, are counted.",
  'response.groupBy': 'Group by',
  'response.person': 'Person',
  'response.weekday': 'Weekday',
  'response.hour': 'Hour',
  'response.year': 'Year',
  'response.empty': "No replies to compare for this selection. Try a wider date range or all participants.",
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

  'network.empty': "No repeated word pairs found. Try a wider date range or all participants.",
  'network.stats': "{nodes} words • {edges} connections • pairs appear at least twice, no more than two places apart among the words shown",
  'network.cooccurrences': 'Co-occurrences',
  'network.frequency': 'Frequency',

  'empty.default': "Nothing to show for this selection. Try a different date range or participant.",

  'errorBoundary.title': 'Something went wrong',
  'errorBoundary.body':
    'A saved document may be causing this error. You can reload the page, or delete all saved documents and reload (this cannot be undone).',
  'errorBoundary.reload': 'Reload',
  'errorBoundary.clearAndReload': 'Delete saved documents & reload',

  'time.minutes': '{count} min',
  'time.hours': '{count} h',
  'docs.errorStorageFull': 'Browser storage is full. Delete some documents or upload a smaller file.',
  'status.loadErrorDetail': 'The chat data could not be fetched. Check your connection and reload the page.',
  'lang.english': "English",
  'lang.turkish': "Türkçe",
  'charts.expand': "Expand chart",
  'charts.exitFullscreen': "Exit fullscreen",
  'summary.messagesHint': "How many messages are in the loaded chats?",
  'summary.wordsHint': "How many words remain after excluded words are removed?",
  'summary.participantsHint': "How many people have sent a message?",
  'summary.mostActiveHint': "Who has sent the most messages?",
  'lang.switchLabel': 'Language'
}

const tr: Record<keyof typeof en, string> = {
  'tabs.dashboard': 'Pano',
  'tabs.documents': 'Belgeler',
  'tabs.wordlists': 'Kelime Listeleri',
  'tabs.dashboardHint': "Sohbetlerde neler konuşuluyor, kim ne zaman yazıyor?",
  'tabs.documentsHint': "İncelemek istediğiniz sohbetleri ekleyin",
  'tabs.wordlistsHint': "Hesaba katılmayacak kelimeleri seçin",

  'app.eyebrow': 'WhatsApp sohbet analitiği',
  'app.tagline': 'Sohbet analitiği ve metin analizi platformu',
  'app.overall': 'Genel: {range} • {participants}',
  'app.moreParticipants': '+{count} kişi daha',
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
  'onboarding.tabWordlists': "Kelime listeleri — kelime hesaplarına katılmayacak kelimeleri seçin",
  'onboarding.loadSample': 'Örnek veriyi yükle',
  'onboarding.uploadOwn': 'Kendi sohbetini yükle',
  'onboarding.sampleTitle': 'Örnek sohbet',

  'selection.focusedOn': 'Odak belgesi:',
  'selection.showAll': 'Tüm verileri göster',

  'charts.wordCloud.title': 'Kelime Bulutu',
  'charts.wordCloud.subtitle': "Sohbette en çok hangi kelimeler geçiyor? Sık kullanılanlar daha büyük görünür.",
  'charts.topWords.title': "En Çok Kullanılan 10 Kelime",
  'charts.topWords.subtitle': "En çok kullandığınız on kelime hangileri? Her birinin kaç kez geçtiğini görün.",
  'charts.network.title': "Birlikte Kullanılan Kelimeler",
  'charts.network.subtitle': "Hangi kelimeler bir arada kullanılıyor? Mesajlarda birbirine yakın geçen kelimeleri çizgilerle takip edin.",
  'charts.wordCounts.title': 'Kelime Sayıları',
  'charts.wordCounts.subtitle': "Kim ne kadar yazıyor? Kelime sayılarını kişilere, aylara veya yıllara göre karşılaştırın.",
  'charts.activity.title': 'Mesaj Etkinliği',
  'charts.activity.subtitle': "Sohbet ne zaman hareketleniyor? Mesaj ya da kelime sayılarının zamanla değişimini izleyin; gün gün görmek için bir ay seçin.",
  'charts.responseTime.title': 'Yanıt Süresi Analizi',
  'charts.responseTime.subtitle': "Kim daha çabuk yanıt veriyor? Yanıt sürelerinin kişiye, haftanın gününe, saate veya yıla göre nasıl değiştiğini görün.",
  'charts.heatmap.title': 'Gün × Saat Isı Haritası',
  'charts.heatmap.subtitle': "En çok hangi gün, hangi saatte yazışıyorsunuz? Parlak kutular daha fazla mesaj olduğunu gösterir.",
  'charts.sessions.title': 'Sohbet Oturumları',
  'charts.sessions.subtitle': "Sohbeti kim başlatıyor? Sohbet başına ortalama kaç mesaj yazıldığını görün. Üç saatten uzun bir aradan sonra gelen mesaj yeni bir sohbetin başlangıcı sayılır.",
  'charts.participantStyle.title': 'Katılımcı Tarzı',
  'charts.participantStyle.subtitle': "Kimin mesajları uzun, kim daha çok emoji kullanıyor? Yazışma alışkanlıklarını kelime çeşitliliği, sorular ve bağlantılarla birlikte karşılaştırın.",

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
  'docs.uploadSubtitle': "Sohbetinizde neler öne çıkıyor? Metni yapıştırın veya .txt dosyasını seçin; metnin dilini belirleyip kaydederek sonuçları görün.",
  'docs.titleField': 'Başlık',
  'docs.titlePlaceholder': 'Belge başlığı',
  'docs.languageField': "Metnin dili (yaygın kelimeleri elemek için)",
  'docs.langTr': 'Türkçe (TR)',
  'docs.langEn': 'İngilizce (EN)',
  'docs.fileField': 'Dosyadan',
  'docs.contentField': 'İçerik',
  'docs.contentPlaceholder': 'Metni buraya yapıştırın…',
  'docs.save': 'Belgeyi kaydet',
  'docs.savedTitle': 'Kayıtlı Belgeler',
  'docs.savedSubtitle': "Hangi sohbeti incelemek istersiniz? Grafiklerini görmek için bir belge seçin. Belgeler yalnızca bu tarayıcıda saklanır.",
  'docs.empty': "Kaydettiğiniz sohbetler burada görünecek. Başlamak için yukarıdan metin veya .txt dosyası ekleyin.",
  'docs.deleteTitle': 'Belgeyi sil',
  'docs.sourceFile': 'dosya',
  'docs.sourcePaste': 'yapıştırma',
  'docs.errorTooLarge': 'Seçilen dosya çok büyük (en fazla 25 MB).',
  'docs.errorUnreadable': 'Seçilen dosya okunamadı.',
  'docs.errorEmpty': 'Kaydetmeden önce metin yapıştırın veya bir .txt dosyası seçin.',
  'docs.errorSaveFailed': 'Belge kaydedilemedi.',
  'docs.untitled': 'Adsız belge',
  'docs.detecting': 'Dil algılanıyor…',
  'docs.detectInconclusive': 'Dil güvenilir şekilde algılanamadı. Lütfen seçimi kontrol edin.',

  'wordlists.stopwordsTitle': "Yaygın Kelimeleri Ele",
  'wordlists.stopwordsSubtitle': "Asıl konuşulanlar daha belirgin olsun: sık geçen ama tek başına pek anlam taşımayan kelimeleri kelime hesaplarından çıkarın. {language} için {count} kelime eleniyor.",
  'wordlists.turkish': 'Türkçe',
  'wordlists.english': 'İngilizce',
  'wordlists.resetDefaults': 'Varsayılanlara dön',
  'wordlists.addStopword': "Elenecek kelime ({language})",
  'wordlists.stopwordPlaceholder': "örn. şey",
  'wordlists.filterList': 'Listeyi filtrele',
  'wordlists.searchPlaceholder': 'Kelime ara…',
  'wordlists.addStopwordButton': "Kelime ekle",
  'wordlists.banwordsTitle': "Hariç Tutulan Kelimeler",
  'wordlists.banwordsSubtitle': "Kelime sayımlarında ve grafiklerde görmek istemediğiniz kelimeleri buraya ekleyin. Bu liste tüm diller için geçerlidir.",
  'wordlists.addBanword': "Hariç tutulacak kelime",
  'wordlists.banwordPlaceholder': "Sonuçlarda görmek istemediğiniz kelime…",
  'wordlists.addBanwordButton': "Kelimeyi hariç tut",
  'wordlists.empty': "Listede gösterilecek kelime yok. Aramanızı değiştirin veya yeni bir kelime ekleyin.",
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

  'response.caption': "Ortadaki yanıt süresi (medyan) gösterilir: yanıtların yarısı daha kısa, yarısı daha uzun sürer. Yalnızca farklı kişilerin art arda gönderdiği, aralarında sıfırdan fazla ve en çok 12 saat bulunan mesajlar sayılır.",
  'response.groupBy': 'Grupla',
  'response.person': 'Kişi',
  'response.weekday': 'Hafta günü',
  'response.hour': 'Saat',
  'response.year': 'Yıl',
  'response.empty': "Bu seçimde karşılaştırılabilecek yanıt yok. Daha geniş bir tarih aralığı veya tüm katılımcıları seçin.",
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

  'network.empty': "Bu seçimde tekrar eden kelime çiftleri bulunamadı. Tarih aralığını genişletin veya tüm katılımcıları seçin.",
  'network.stats': "{nodes} kelime • {edges} bağlantı • gösterilen kelimeler arasında en fazla iki sıra uzaklıkta, en az iki kez birlikte geçen çiftler",
  'network.cooccurrences': 'Birlikte geçme',
  'network.frequency': 'Sıklık',

  'empty.default': "Bu seçim için gösterilecek sonuç yok. Başka bir tarih aralığı veya katılımcı seçin.",

  'errorBoundary.title': 'Bir şeyler ters gitti',
  'errorBoundary.body':
    'Kayıtlı bir belge bu hataya neden oluyor olabilir. Sayfayı yeniden yükleyebilir veya tüm kayıtlı belgeleri silip yeniden yükleyebilirsiniz (bu geri alınamaz).',
  'errorBoundary.reload': 'Yeniden yükle',
  'errorBoundary.clearAndReload': 'Kayıtlı belgeleri sil ve yeniden yükle',

  'time.minutes': '{count} dk',
  'time.hours': '{count} sa',
  'docs.errorStorageFull': 'Tarayıcı depolama alanı dolu. Bazı belgeleri silin veya daha küçük bir dosya yükleyin.',
  'status.loadErrorDetail': 'Sohbet verileri alınamadı. Bağlantınızı kontrol edip sayfayı yeniden yükleyin.',
  'lang.english': "English",
  'lang.turkish': "Türkçe",
  'charts.expand': "Grafiği büyüt",
  'charts.exitFullscreen': "Tam ekrandan çık",
  'summary.messagesHint': "Yüklenen sohbetlerde kaç mesaj var?",
  'summary.wordsHint': "Elenen kelimeler çıkarılınca kaç kelime kalıyor?",
  'summary.participantsHint': "Kaç kişi mesaj yazmış?",
  'summary.mostActiveHint': "En çok mesajı kim yazmış?",
  'lang.switchLabel': 'Dil'
}

export type MessageKey = keyof typeof en

export const messages: Record<Locale, Record<MessageKey, string>> = { en, tr, es, fr, pt, de, it, pl, ro }

export function detectLocale(language?: string): Locale {
  const base = language?.toLowerCase().split('-')[0]
  return isLanguage(base) ? base : 'en'
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

export function formatParticipantList(participants: string[], locale: Locale): string {
  if (participants.length <= 3) return participants.join(', ')
  const shown = participants.slice(0, 3).join(', ')
  return `${shown} ${translate(locale, 'app.moreParticipants', { count: participants.length - 3 })}`
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
  try {
    localStorage.setItem(STORAGE_KEY, locale)
  } catch {}
  if (locale === currentLocale) return
  currentLocale = locale
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
