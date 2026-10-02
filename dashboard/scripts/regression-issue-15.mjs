// Regression checks for issue #15: auto-detect document language on chat import.
// Run from dashboard/ with: node scripts/regression-issue-15.mjs
import assert from 'node:assert/strict'
import { mkdirSync, writeFileSync } from 'node:fs'
import { build } from 'esbuild'

const result = await build({
  stdin: {
    contents: `export { detectChatLanguage } from './shared/langdetect.js';`,
    resolveDir: process.cwd(), loader: 'ts'
  },
  bundle: true, platform: 'node', format: 'esm', write: false
})
mkdirSync('node_modules/.cache', { recursive: true })
const modulePath = new URL('../node_modules/.cache/regression-issue-15.mjs', import.meta.url)
writeFileSync(modulePath, result.outputFiles[0].text)
const { detectChatLanguage } = await import(modulePath)

const chat = (bodies, senders = ['Alex']) =>
  bodies.map((body, i) => {
    const minute = String(i % 60).padStart(2, '0')
    const hour = String(Math.floor(i / 60) % 24).padStart(2, '0')
    const sender = senders[i % senders.length]
    return `02.10.2026 ${hour}:${minute} - ${sender}: ${body}`
  }).join('\n')

const cycle = (sentences, n) => Array.from({ length: n }, (_, i) => sentences[i % sentences.length])

const sentences = {
  en: [
    'what are you doing this weekend',
    'did you watch the game last night',
    'I will be there in about ten minutes',
    'can you send me the photos when you have a moment',
    'that sounds really good to me',
    'we should meet for lunch one of these days',
    'have you talked to your brother about the trip',
    'the weather is supposed to be nice on saturday',
    'I think she said they are coming with us',
    'do not forget to bring the keys',
    'let me know when you get home',
    'thanks for the help yesterday, I really appreciate it'
  ],
  tr: [
    'yarın akşam ne yapıyorsun',
    'dosyayı bana gönderdin mi',
    'tamam ben birazdan orada olurum',
    'bu hafta sonu için bir plan yaptın mı',
    'bence bu çok iyi bir fikir',
    'akşam yemeğe gelir misin',
    'annemler bize gelecekmiş ona göre',
    'bir şey lazım olursa bana yaz',
    'dün akşam maçı izledin mi',
    'parayı hesabına gönderdim kontrol eder misin',
    'bu aralar işler çok yoğun',
    'hava bugün çok güzel dışarı çıkalım mı'
  ],
  trAscii: [
    'yarin aksam ne yapiyorsun',
    'dosyayi bana gonderdin mi',
    'tamam ben birazdan orada olurum',
    'bu hafta sonu icin bir plan yaptin mi',
    'bence bu cok iyi bir fikir',
    'aksam yemege gelir misin',
    'bir sey lazim olursa bana yaz',
    'dun aksam maci izledin mi',
    'parayi hesabina gonderdim kontrol eder misin',
    'bu aralar isler cok yogun'
  ],
  es: [
    'qué haces mañana por la tarde',
    'me mandaste el archivo ayer',
    'estaré allí en diez minutos',
    'deberíamos quedar para comer uno de estos días',
    'eso me suena muy bien',
    'hablaste con tu hermano sobre el viaje',
    'dicen que el sábado hará buen tiempo',
    'creo que ella dijo que viene con nosotros',
    'no te olvides de traer las llaves',
    'avísame cuando llegues a casa',
    'gracias por tu ayuda de ayer',
    'últimamente tengo mucho trabajo'
  ],
  fr: [
    'tu fais quoi demain soir',
    'tu m’as envoyé le fichier hier',
    'je serai là dans dix minutes',
    'on devrait se retrouver pour déjeuner un de ces jours',
    'ça me semble vraiment bien',
    'tu as parlé à ton frère du voyage',
    'il paraît qu’il fera beau samedi',
    'je crois qu’elle a dit qu’elle vient avec nous',
    'n’oublie pas d’apporter les clés',
    'dis-moi quand tu arrives à la maison',
    'merci pour ton aide hier',
    'j’ai beaucoup de travail en ce moment'
  ],
  pt: [
    'o que você vai fazer amanhã à noite',
    'você me mandou o arquivo ontem',
    'eu chego aí em dez minutos',
    'a gente devia se encontrar para almoçar um dia desses',
    'isso parece muito bom para mim',
    'você falou com seu irmão sobre a viagem',
    'parece que o tempo vai estar bom no sábado',
    'acho que ela disse que vem com a gente',
    'não esquece de levar as chaves',
    'me avisa quando chegar em casa',
    'obrigado pela ajuda de ontem',
    'estou com muito trabalho ultimamente'
  ],
  de: [
    'was machst du morgen abend',
    'hast du mir die datei schon geschickt',
    'ich bin in zehn minuten da',
    'wir sollten uns mal wieder zum essen treffen',
    'das klingt wirklich gut für mich',
    'hast du mit deinem bruder über die reise gesprochen',
    'das wetter soll am samstag schön werden',
    'ich glaube sie hat gesagt dass sie mitkommen',
    'vergiss nicht die schlüssel mitzunehmen',
    'sag mir bescheid wenn du zu hause bist',
    'danke für deine hilfe gestern',
    'ich habe gerade viel zu tun'
  ],
  it: [
    'cosa fai domani sera',
    'mi hai mandato il file ieri',
    'arrivo tra dieci minuti',
    'dovremmo vederci per pranzo uno di questi giorni',
    'mi sembra davvero una buona idea',
    'hai parlato con tuo fratello del viaggio',
    'dicono che sabato farà bel tempo',
    'penso che lei abbia detto che viene con noi',
    'non dimenticare di portare le chiavi',
    'fammi sapere quando arrivi a casa',
    'grazie per l’aiuto di ieri',
    'ho molto da fare in questo periodo'
  ],
  pl: [
    'co robisz jutro wieczorem',
    'wysłałeś mi wczoraj ten plik',
    'będę tam za dziesięć minut',
    'powinniśmy się kiedyś spotkać na obiad',
    'to brzmi dla mnie naprawdę dobrze',
    'rozmawiałeś z bratem o podróży',
    'podobno w sobotę będzie ładna pogoda',
    'chyba powiedziała że jedzie z nami',
    'nie zapomnij zabrać kluczy',
    'daj znać jak wrócisz do domu',
    'dzięki za wczorajszą pomoc',
    'ostatnio mam bardzo dużo pracy'
  ],
  ro: [
    'ce faci mâine seară',
    'mi-ai trimis fișierul ieri',
    'ajung acolo în zece minute',
    'ar trebui să ne vedem la prânz într-una din zilele astea',
    'mi se pare foarte bine',
    'ai vorbit cu fratele tău despre călătorie',
    'se zice că sâmbătă va fi vreme bună',
    'cred că a zis că vine cu noi',
    'nu uita să iei cheile',
    'zi-mi când ajungi acasă',
    'mersi pentru ajutorul de ieri',
    'am foarte mult de lucru în perioada asta'
  ]
}

// 1. Clearly monolingual chats in every platform language detect correctly.
for (const code of ['en', 'tr', 'es', 'fr', 'pt', 'de', 'it', 'pl', 'ro']) {
  const result = detectChatLanguage(chat(cycle(sentences[code], 40)))
  assert.equal(result.language, code, `${code}: monolingual chat detects as ${code} (got ${result.language}, confidence ${result.confidence})`)
  assert.ok(result.confidence >= 0.5, `${code}: confident result (${result.confidence})`)
  assert.ok(Array.isArray(result.perBatch) && result.perBatch.length >= 1, `${code}: per-batch results present`)
  assert.ok(result.perBatch.every(batch => typeof batch.language === 'string'), `${code}: each batch reports a language`)
}
console.log('monolingual ok: all 9 platform languages detected with confidence')

// 2. Turkish typed without special characters still detects as Turkish.
{
  const result = detectChatLanguage(chat(cycle(sentences.trAscii, 40)))
  assert.equal(result.language, 'tr', `ascii Turkish detects as tr (got ${result.language})`)
  console.log('ascii Turkish ok: special characters are a bonus, not a requirement')
}

// 3. Short and noisy inputs degrade to unknown instead of a confident wrong guess.
{
  assert.equal(detectChatLanguage(chat(['ok', 'ok', 'ok', 'ok', 'ok'])).language, 'unknown')
  assert.equal(detectChatLanguage('').language, 'unknown')
  assert.equal(detectChatLanguage('02.10.2026 09:00 - Alex: <Media omitted>').language, 'unknown')
  assert.equal(detectChatLanguage(chat(['0555 123 45 67', '0532 987 65 43', '0212 444 55 66'])).language, 'unknown')
  assert.equal(detectChatLanguage('not a chat export at all').language, 'unknown')
  console.log('graceful degradation ok: short/noisy/empty inputs return unknown')
}

// 4. Timestamps, sender names and system events must not distort detection.
{
  const result = detectChatLanguage(chat(cycle(sentences.tr, 40), ['Alice', 'Bob', 'Charlie']))
  assert.equal(result.language, 'tr', 'English sender names do not pull a Turkish chat to English')
  const withSystem = [
    '02.10.2026 08:59 - Messages and calls are end-to-end encrypted. No one outside of this chat can read them.',
    chat(cycle(sentences.tr, 40))
  ].join('\n')
  assert.equal(detectChatLanguage(withSystem).language, 'tr', 'English system line ignored')
  console.log('parser reuse ok: timestamps, senders, system lines excluded from scoring')
}

// 5. Multilingual conversations report mixed with per-batch detail.
{
  const mixed = [chat(cycle(sentences.en, 120)), chat(cycle(sentences.tr, 120))].join('\n')
  const result = detectChatLanguage(mixed)
  assert.equal(result.language, 'mixed', `half-EN half-TR chat reports mixed (got ${result.language})`)
  const batchLanguages = new Set(result.perBatch.map(batch => batch.language))
  assert.ok(batchLanguages.has('en') && batchLanguages.has('tr'), 'per-batch results show both languages')
  console.log('mixed ok: overall mixed with per-batch breakdown')
}

// 6. Plain pasted text without chat headers is still analyzed.
{
  const result = detectChatLanguage(sentences.fr.join('. '))
  assert.equal(result.language, 'fr', `plain French paragraph detects as fr (got ${result.language})`)
  console.log('plain text ok: non-export input still detected')
}

// 7. Result shape contract.
{
  const result = detectChatLanguage(chat(cycle(sentences.en, 40)))
  assert.ok(typeof result.confidence === 'number' && result.confidence >= 0 && result.confidence <= 1)
  assert.ok(['en', 'tr', 'es', 'fr', 'pt', 'de', 'it', 'pl', 'ro', 'unknown', 'mixed'].includes(result.language))
  console.log('shape ok: { language, confidence, perBatch }')
}

console.log('regression-issue-15: all checks passed')
