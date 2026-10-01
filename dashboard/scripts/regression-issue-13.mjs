// Run from dashboard/: node scripts/regression-issue-13.mjs
import assert from 'node:assert/strict'
import { mkdirSync, writeFileSync } from 'node:fs'
import { build } from 'esbuild'

const storage = new Map()
globalThis.localStorage = {
  getItem: key => storage.get(key) ?? null,
  setItem: (key, value) => storage.set(key, String(value)),
  removeItem: key => storage.delete(key)
}
const result = await build({
  stdin: {
    contents: `
      export * as i18n from './src/lib/i18n';
      export * as lists from './src/lib/wordlists';
      export * as docs from './src/lib/documents';
      export * as text from './shared/text.js';
      export * from './src/lib/languages';
      export { withTokens, activitySeries } from './src/lib/stats';
      export { getSampleChat } from './src/lib/sampleData';
      export { LanguageSwitcher } from './src/components/LanguageSwitcher';
      export { DocumentsSection } from './src/components/DocumentsSection';
      export { WordListsSection } from './src/components/WordListsSection';
      export { createElement as h } from 'react';
      export { renderToStaticMarkup as render } from 'react-dom/server';
    `,
    resolveDir: process.cwd(), loader: 'ts'
  },
  bundle: true, platform: 'node', format: 'esm', write: false,
  external: ['react', 'react-dom', 'react-dom/*', 'react/jsx-runtime']
})
mkdirSync('node_modules/.cache', { recursive: true })
const modulePath = new URL('../node_modules/.cache/regression-issue-13.mjs', import.meta.url)
writeFileSync(modulePath, result.outputFiles[0].text)
const app = await import(modulePath)
const { i18n, lists, docs, text, languages, languageCodes, h, render } = app
assert.equal(languageCodes.length, 9)
const placeholders = value => [...value.matchAll(/\{(\w+)\}/g)].map(match => match[1]).sort()
const keys = Object.keys(i18n.messages.en).sort()
for (const language of languageCodes) {
  assert.deepEqual(Object.keys(i18n.messages[language]).sort(), keys, `${language}: exact dictionary coverage`)
  for (const key of keys) {
    const copy = i18n.messages[language][key]
    assert.ok(copy.trim(), `${language}.${key}: nonempty`)
    assert.deepEqual(placeholders(copy), placeholders(i18n.messages.en[key]), `${language}.${key}: interpolation parity`)
    const vars = Object.fromEntries(placeholders(copy).map(name => [name, '123']))
    assert.ok(!/\{\w+\}/.test(i18n.translate(language, key, vars)))
  }
  assert.equal(i18n.detectLocale(`${language.toUpperCase()}-XX`), language)
  assert.equal(i18n.resolveLocale(language, 'ja-JP'), language)
  i18n.setLocale(language)
  assert.equal(storage.get('wp:locale'), language)
  assert.equal(i18n.getLocale(), language)
  for (const Component of [app.LanguageSwitcher, app.DocumentsSection, app.WordListsSection]) {
    const markup = render(h(Component, { selectedId: null, onSelect() {} }))
    for (const code of languageCodes) {
      assert.ok(markup.includes(`value="${code}"`), `${Component.name}: ${code} option`)
      assert.ok(markup.includes(languages[code]), `${Component.name}: ${code} native name`)
    }
    assert.ok(new RegExp(`<option[^>]*value="${language}"[^>]*selected=""`).test(markup), `${Component.name}: current locale`)
  }
  assert.equal(i18n.getNumberFormatter(language).format(12345.67), new Intl.NumberFormat(language).format(12345.67))
  assert.equal(i18n.getMonthFullLabels(language)[0], new Intl.DateTimeFormat(language, { month: 'long', timeZone: 'UTC' }).format(Date.UTC(2024, 0, 1)))
  assert.equal(i18n.getWeekdayLabels(language)[0], new Intl.DateTimeFormat(language, { weekday: 'short', timeZone: 'UTC' }).format(Date.UTC(2024, 0, 1)))
  assert.ok(app.getSampleChat(language).content.length > 0, 'sample works for every UI locale')
}
for (const unknown of [undefined, '', 'ja-JP', 'trash', 'constructor', '__proto__']) {
  assert.equal(i18n.detectLocale(unknown), 'en')
  assert.equal(i18n.resolveLocale(unknown ?? null, 'fr-CA'), 'fr')
}
assert.equal(i18n.detectLocale('pt-BR'), 'pt')
assert.equal(i18n.detectLocale('pt-PT'), 'pt')
assert.equal(i18n.translate('fr', 'unknown.key'), 'unknown.key')
const original = i18n.messages.fr['tabs.dashboard']
delete i18n.messages.fr['tabs.dashboard']
assert.equal(i18n.translate('fr', 'tabs.dashboard'), i18n.messages.en['tabs.dashboard'])
i18n.messages.fr['tabs.dashboard'] = original
storage.delete('wp:locale')
i18n.setLocale(i18n.getLocale())
assert.equal(storage.get('wp:locale'), i18n.getLocale(), 'explicit current choice persists too')
assert.equal((await import(`${modulePath.href}?reload`)).i18n.getLocale(), i18n.getLocale(), 'reload reads saved locale')
console.log('UI: nine complete dictionaries, placeholders, selectors, detection, persistence, formatters and samples pass')

const fixtures = {
  en: ['THE AND', 'ORCHARD', 'orchard'],
  tr: ['VE KANKA', 'IŞIK İNCİR', 'ışık incir'],
  es: ['LOS JAJA', 'CANCIÓN', 'canción'],
  fr: ['LES MDR', 'ÉLÉPHANT', 'éléphant'],
  pt: ['UMA RSRS', 'CORAÇÃO', 'coração'],
  de: ['UND DIGGA', 'BÄUME', 'bäume'],
  it: ['GLI TVB', 'GIARDINO', 'giardino'],
  pl: ['ORAZ NO', 'ŻÓŁW', 'żółw'],
  ro: ['ȘI MS', 'PĂDURE', 'pădure']
}
const saved = []
for (const [language, [fillers, content, expected]] of Object.entries(fixtures)) {
  storage.delete('wp:documents')
  const document = docs.saveDocument({ title: language, language, content: `01.10.2026 09:00 - Alex: ${fillers} ${content}`, source: 'file' })
  saved.push(document)
  assert.equal(docs.listDocuments()[0].language, language)
  const parsed = docs.documentsToMessages(docs.listDocuments())
  assert.equal(parsed[0].language, language)
  assert.deepEqual(app.withTokens(parsed)[0].tokens, expected.split(' '), `${language}: uploaded chat filtering and casing`)
  const plain = docs.documentsToMessages([{ ...document, content: `${fillers} ${content}` }])
  assert.deepEqual(app.withTokens(plain)[0].tokens, expected.split(' '), `${language}: plain text filtering`)
  lists.addStopword(language, content.split(' ')[0])
  assert.ok(!app.withTokens(parsed)[0].tokens.includes(expected.split(' ')[0]), `${language}: custom stopword immediately applied`)
  lists.removeStopword(language, content.split(' ')[0])
  assert.deepEqual(app.withTokens(parsed)[0].tokens, expected.split(' '))
  const filler = text.normalizeToken(fillers.split(' ')[0], language)
  lists.removeStopword(language, filler)
  assert.ok(app.withTokens(parsed)[0].tokens.includes(filler), `${language}: remove default`)
  lists.addStopword(language, filler)
  assert.ok(!app.withTokens(parsed)[0].tokens.includes(filler), `${language}: restore default`)
  lists.addStopword(language, 'ZEBRATEST')
  lists.resetStopwords(language)
  assert.ok(!lists.getStopwordSet(language).has('zebratest'), `${language}: reset custom list`)
}
const merged = docs.mergeChatData(null, saved)
assert.deepEqual(app.withTokens(merged.messages).map(m => m.tokens), Object.values(fixtures).map(f => f[2].split(' ')), 'merged uploads retain independent language filtering')
lists.addStopword('de', 'CANCIÓN')
assert.ok(app.withTokens(docs.documentsToMessages([saved.find(doc => doc.language === 'es')]))[0].tokens.includes('canción'), 'custom stopwords do not leak between languages')
lists.resetStopwords('de')
assert.ok(text.tokenizeText('CHAT', lists.getStopwordSet('fr'), 'fr').includes('chat'), 'English stopwords must not remove French chat (cat)')
lists.addBanWord('ZEBRATEST')
for (const language of languageCodes) {
  assert.deepEqual(text.tokenizeText('ZEBRATEST', lists.getStopwordSet(language), language), [], 'global exclusions apply in each language')
}
lists.removeBanWord('zebratest')
lists.addBanWord('IŞIK')
assert.deepEqual(text.tokenizeText('ışık', lists.getStopwordSet('tr'), 'tr'), [], 'global exclusions use target language casing')
lists.removeBanWord('IŞIK')
assert.deepEqual(text.tokenizeText('E\u0301LE\u0301PHANT', new Set(), 'fr'), ['éléphant'], 'decomposed accents normalize')
assert.deepEqual(text.tokenizeText('ITALIANO', new Set(), 'it'), ['italiano'], 'Latin I remains i outside Turkish')
assert.deepEqual(text.tokenizeText('IŞIK İNCİR', new Set(), 'tr'), ['ışık', 'incir'])
assert.ok(lists.getDashboardStopwordSet().has('kanka'), 'legacy datasets retain TR defaults')
storage.set('wp:documents', JSON.stringify([{ ...saved[0], language: 'invalid' }]))
assert.equal(docs.listDocuments()[0].language, 'en', 'invalid stored language safely defaults')
console.log('Analysis: uploads, plain text, mixed-language merge, Unicode casing, custom/default/global word lists pass')

// Daily chart labels previously forced non-Turkish locales to English.
for (const language of languageCodes) {
  const messages = app.withTokens(merged.messages)
  const series = app.activitySeries(merged, messages, { year: 2026, month: 10, sender: 'all' }, 'messages', language)
  assert.ok(series.categories.length > 0)
  const expected = new Intl.DateTimeFormat(language, { day: 'numeric', month: 'short', timeZone: 'UTC' }).format(Date.UTC(2026, 9, 1))
  assert.equal(series.categories[0], expected, `${language}: daily chart label`)
}
console.log('All issue #13 regression checks passed.')
