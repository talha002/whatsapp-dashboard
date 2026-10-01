import type { Language } from '../types'
import { translate, type Locale } from './i18n'

export interface SampleChat {
  title: string
  language: Language
  content: string
}

interface SampleSpec {
  participants: [string, string, string]
  phrases: string[]
}

const SAMPLE_START = Date.UTC(2026, 7, 31)
const SAMPLE_DAYS = 28
const SEED = 0x9e3779b9

const samples: Record<Locale, SampleSpec> = {
  en: {
    participants: ['Alex', 'Maya', 'Leo'],
    phrases: [
      'morning everyone',
      'did you see the forecast for Saturday?',
      'looks sunny, perfect for the hike',
      'I can bring the sandwiches again',
      'and I will handle the coffee thermos',
      'trailhead at 9 then?',
      'works for me',
      'same here',
      'do not forget the tickets for the museum',
      'already booked them online',
      'you think of everything',
      'haha, someone has to',
      'the book club picked the next novel',
      'which one this time?',
      'the lighthouse mystery one',
      'oh I heard that is great',
      'finished it in two days, no spoilers',
      'I read too slowly for that',
      'pace does not matter, enjoy it',
      'pizza night on Friday?',
      'always yes to pizza',
      'can we try the new place on Main Street?',
      'their crust is supposed to be amazing',
      'I will make a reservation for seven',
      'perfect, see you both there',
      'running a bit late, ten minutes',
      'no rush, we just sat down',
      'the garden tomatoes finally ripened',
      'bring some on Sunday please',
      'deal, you bring the basil',
      'game night was so fun yesterday',
      'we need a rematch soon',
      'you only say that because you lost',
      'rematch accepted',
      'who has the charger I lent?',
      'guilty, returning it tomorrow',
      'the playlist for the road trip is ready',
      'share the link please',
      'https://example.com/road-trip-playlist',
      'this playlist is perfect',
      'eight hours of bangers',
      'can someone water my plants next week?',
      'I got you, enjoy the trip',
      'thank you so much',
      'happy birthday!! 🎉',
      '🎂🎂🎂',
      'best birthday ever, thanks you two',
      'the cake was delicious 😋',
      'new episode drops tonight',
      'no spoilers until I watch it',
      'muting this chat until then, sorry',
      'understandable, hurry up though',
      'watched it. we need to talk. wow.',
      'right?? that ending',
      'Sunday brunch at the usual spot?',
      'see you at eleven',
      'bringing the crossword this time',
      'you still do those on paper?',
      'it is the only correct way 😄'
    ]
  },
  tr: {
    participants: ['Deniz', 'Ece', 'Mert'],
    phrases: [
      'günaydın millet',
      'cumartesi hava durumuna baktınız mı?',
      'güneşli görünüyor, yürüyüş için harika',
      'sandviçleri yine ben getirebilirim',
      'termos kahve de benden',
      'o zaman 9da patika başında?',
      'bana uyar',
      'bana da',
      'müze biletlerini unutmayın',
      'çoktan internetten aldım',
      'her şeyi düşünüyorsun',
      'haha, birisi düşünmek zorunda',
      'kitap kulübü sıradaki romanı seçti',
      'bu sefer hangisi?',
      'deniz feneri gizemi olan',
      'onun çok iyi olduğunu duydum',
      'iki günde bitirdim, spoiler yok',
      'ben o kadar hızlı okuyamıyorum',
      'hız önemli değil, tadını çıkar',
      'cuma akşamı pizza?',
      'pizzaya her zaman evet',
      'yeni açılan yeri denesek mi?',
      'hamuru efsaneymiş',
      'yediye rezervasyon yaptırırım',
      'süper, orada görüşürüz',
      'biraz gecikeceğim, on dakika',
      'acele etme, biz daha oturduk',
      'bahçedeki domatesler nihayet olgunlaştı',
      'pazar günü biraz getir lütfen',
      'anlaştık, fesleğeni sen getir',
      'dünkü oyun gecesi çok eğlenceliydi',
      'yakında rövanş lazım',
      'kaybettiğin için öyle diyorsun',
      'rövanş kabul',
      'ödünç verdiğim şarj aleti kimde?',
      'bende, yarın geri veriyorum',
      'yolculuk çalma listesi hazır',
      'bağlantıyı paylaşır mısın',
      'https://example.com/yol-calma-listesi',
      'liste mükemmel olmuş',
      'sekiz saatlik hit şarkı',
      'gelecek hafta çiçeklerimi sular mısınız?',
      'bana bırak, iyi tatiller',
      'çok teşekkür ederim',
      'doğum günün kutlu olsun!! 🎉',
      '🎂🎂🎂',
      'en güzel doğum günü, sağ olun',
      'pasta çok lezzetliydi 😋',
      'yeni bölüm bu akşam çıkıyor',
      'izleyene kadar spoiler yok',
      'o zamana kadar sohbeti sessize alıyorum',
      'anlaşılır, ama acele et',
      'izledim. konuşmamız lazım. vay be.',
      'değil mi?? o final',
      'pazar kahvaltısı her zamanki yerde?',
      'on birde görüşürüz',
      'bu sefer bulmacayı ben getiriyorum',
      'hâlâ kağıtta mı çözüyorsun?',
      'tek doğru yol bu 😄'
    ]
  }
}

function mulberry32(seed: number) {
  let state = seed
  return () => {
    state = (state + 0x6d2b79f5) | 0
    let value = Math.imul(state ^ (state >>> 15), 1 | state)
    value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296
  }
}

function pad(value: number) {
  return String(value).padStart(2, '0')
}

function buildSampleContent(spec: SampleSpec): string {
  const rand = mulberry32(SEED)
  const lines: string[] = []
  for (let day = 0; day < SAMPLE_DAYS; day += 1) {
    const count = 6 + Math.floor(rand() * 4)
    let minuteOfDay = (8 + Math.floor(rand() * 14)) * 60 + Math.floor(rand() * 60)
    for (let index = 0; index < count; index += 1) {
      minuteOfDay += 1 + Math.floor(rand() * 20)
      const date = new Date(SAMPLE_START + day * 86400000 + minuteOfDay * 60000)
      const sender = spec.participants[Math.floor(rand() * spec.participants.length)]
      const text = spec.phrases[Math.floor(rand() * spec.phrases.length)]
      const stamp = `${pad(date.getUTCDate())}.${pad(date.getUTCMonth() + 1)}.${date.getUTCFullYear()} ${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}`
      lines.push(`${stamp} - ${sender}: ${text}`)
    }
  }
  return lines.join('\n')
}

export function getSampleChat(locale: Locale): SampleChat {
  return {
    title: translate(locale, 'onboarding.sampleTitle'),
    language: locale,
    content: buildSampleContent(samples[locale])
  }
}
