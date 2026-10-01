// Regression checks for issue #8: EN/TR i18n layer with browser-language auto-detection.
// Run from dashboard/ with: node scripts/regression-issue-8.mjs
import assert from 'node:assert/strict'
import { build } from 'esbuild'

// In-memory localStorage stub, installed before the app modules load.
const storage = new Map()
globalThis.localStorage = {
  getItem: (key) => (storage.has(key) ? storage.get(key) : null),
  setItem: (key, value) => storage.set(key, String(value)),
  removeItem: (key) => storage.delete(key),
  clear: () => storage.clear()
}

const bundled = await build({
  stdin: {
    contents: `export * as i18n from './src/lib/i18n.ts'; export { activitySeries, buildWordCountBar, withTokens } from './src/lib/stats.ts'; export { activityHeatmap, conversationSessions, responseTimeAnalysis } from './src/lib/analysis.ts';`,
    resolveDir: process.cwd(),
    loader: 'ts'
  },
  bundle: true,
  platform: 'node',
  format: 'esm',
  write: false
})
const app = await import('data:text/javascript;base64,' + Buffer.from(bundled.outputFiles[0].text).toString('base64'))
const { i18n } = app

// 1. Auto-detection: tr* -> Turkish, everything else -> English.
{
  assert.equal(i18n.detectLocale('tr-TR'), 'tr')
  assert.equal(i18n.detectLocale('tr'), 'tr')
  assert.equal(i18n.detectLocale('TR-tr'), 'tr', 'detection is case-insensitive')
  assert.equal(i18n.detectLocale('en-US'), 'en')
  assert.equal(i18n.detectLocale('de-DE'), 'en')
  assert.equal(i18n.detectLocale(undefined), 'en')
  assert.equal(i18n.detectLocale(''), 'en')
  console.log('detection ok: tr* -> tr, other/missing -> en')
}

// 2. Resolution: stored preference beats auto-detection; no stored -> detect.
{
  assert.equal(i18n.resolveLocale('tr', 'en-US'), 'tr', 'stored tr beats en browser')
  assert.equal(i18n.resolveLocale('en', 'tr-TR'), 'en', 'stored en beats tr browser')
  assert.equal(i18n.resolveLocale(null, 'tr-TR'), 'tr', 'no stored -> detect tr')
  assert.equal(i18n.resolveLocale(null, 'fr-FR'), 'en', 'no stored -> default en')
  assert.equal(i18n.resolveLocale('garbage', 'tr-TR'), 'tr', 'invalid stored value falls back to detection')
  console.log('resolution ok: stored wins, detection fallback, garbage rejected')
}

// 3. Translation: tr and en return different strings; unknown key falls back to en then the key.
{
  assert.equal(i18n.translate('en', 'tabs.dashboard'), 'Dashboard')
  assert.equal(i18n.translate('tr', 'tabs.dashboard'), 'Pano')
  assert.notEqual(i18n.translate('tr', 'summary.totalMessages'), i18n.translate('en', 'summary.totalMessages'))
  assert.equal(i18n.translate('tr', 'no.such.key'), 'no.such.key', 'unknown key returns the key itself')
  console.log('translation ok: en/tr differ, unknown key falls back')
}

// 4. Interpolation replaces {var} placeholders.
{
  const rendered = i18n.translate('en', 'app.footerParsed', {
    messages: '12', systemEvents: '3', continuationLines: '4', placeholders: '1'
  })
  assert.ok(rendered.includes('12') && rendered.includes('3') && rendered.includes('4') && rendered.includes('1'))
  assert.ok(!rendered.includes('{'), 'no placeholders left over')
  const renderedTr = i18n.translate('tr', 'app.footerParsed', { messages: '12', systemEvents: '3', continuationLines: '4', placeholders: '1' })
  assert.ok(renderedTr.includes('12') && !renderedTr.includes('{'))
  console.log('interpolation ok in both locales')
}

// 5. Dictionary parity: every en key exists in tr and vice versa, no empty values.
{
  const enKeys = Object.keys(i18n.messages.en).sort()
  const trKeys = Object.keys(i18n.messages.tr).sort()
  assert.deepEqual(trKeys, enKeys, 'tr dictionary must cover exactly the en keys')
  for (const key of enKeys) {
    assert.ok(i18n.messages.en[key].trim().length > 0, `en.${key} is empty`)
    assert.ok(i18n.messages.tr[key].trim().length > 0, `tr.${key} is empty`)
  }
  console.log(`dictionary parity ok: ${enKeys.length} keys in both locales`)
}

// 6. Store: no stored pref + en browser -> en; setLocale persists and notifies.
{
  storage.clear()
  assert.equal(i18n.getLocale(), 'en', 'node navigator defaults to en')
  let notified = 0
  const unsubscribe = i18n.subscribeLocale(() => { notified += 1 })
  i18n.setLocale('tr')
  assert.equal(i18n.getLocale(), 'tr')
  assert.equal(storage.get('wp:locale'), 'tr', 'choice persisted to localStorage')
  assert.equal(notified, 1, 'subscriber notified once')
  unsubscribe()
  i18n.setLocale('en')
  assert.equal(notified, 1, 'unsubscribed listener not called again')
  console.log('store ok: persist + notify + unsubscribe')
}

// 7. Locale-aware month formatter: Turkish month names differ from English.
{
  const feb = Date.UTC(2025, 1, 1)
  const en = i18n.getMonthFormatter('en').format(new Date(feb))
  const tr = i18n.getMonthFormatter('tr').format(new Date(feb))
  assert.ok(en.startsWith('Feb'), `en label: ${en}`)
  assert.ok(tr.toLocaleLowerCase('tr').startsWith('şub'), `tr label: ${tr}`)
  assert.notEqual(en, tr)
  console.log('month formatter ok:', en, '/', tr)
}

// 8. stats.ts: month bucket labels follow the requested locale.
{
  const messages = app.withTokens([
    { timestamp: Date.UTC(2024, 0, 15, 10), date: '', year: 2024, month: 1, day: 15, hour: 10, minute: 0, sender: 'A', text: 'elma', placeholder: false, line: 1 },
    { timestamp: Date.UTC(2024, 2, 10, 10), date: '', year: 2024, month: 3, day: 10, hour: 10, minute: 0, sender: 'A', text: 'armut', placeholder: false, line: 2 }
  ])
  const data = {
    meta: { sourceFile: 't', sourceFiles: ['t'], sources: [], generatedAt: '', participants: ['A'], years: [2024], dateRange: { start: null, end: null }, totalMessages: 2, totalLines: 2, systemEvents: 0, continuationLines: 0, malformedLines: 0, placeholderMessages: 0 },
    messages: []
  }
  const filters = { year: 2024, month: 'all', sender: 'all' }
  const enSeries = app.activitySeries(data, messages, filters, 'messages', 'en')
  const trSeries = app.activitySeries(data, messages, filters, 'messages', 'tr')
  assert.equal(enSeries.categories[0], 'Jan 2024')
  assert.ok(trSeries.categories[0].toLocaleLowerCase('tr').startsWith('oca'), `tr category: ${trSeries.categories[0]}`)
  assert.equal(enSeries.categories[2], 'Mar 2024')
  assert.ok(trSeries.categories[2].toLocaleLowerCase('tr').startsWith('mar'), `tr category: ${trSeries.categories[2]}`)

  const enBar = app.buildWordCountBar(data, messages, filters, 'month', 'en')
  const trBar = app.buildWordCountBar(data, messages, filters, 'month', 'tr')
  assert.equal(enBar.categories[0], 'Jan')
  assert.ok(trBar.categories[0].toLocaleLowerCase('tr').startsWith('oca'), `tr bar category: ${trBar.categories[0]}`)
  assert.equal(enBar.categories.length, 12)
  console.log('stats locale ok: month buckets + bar categories localized')
}

// 9. analysis.ts: session month labels, heatmap weekdays, response weekday categories localized.
{
  const messages = app.withTokens([
    { timestamp: Date.UTC(2024, 0, 15, 10), date: '', year: 2024, month: 1, day: 15, hour: 10, minute: 0, sender: 'A', text: 'selam', placeholder: false, line: 1 },
    { timestamp: Date.UTC(2024, 0, 15, 10, 5), date: '', year: 2024, month: 1, day: 15, hour: 10, minute: 5, sender: 'B', text: 'naber', placeholder: false, line: 2 }
  ])
  const enSessions = app.conversationSessions(messages, 180, 'en')
  const trSessions = app.conversationSessions(messages, 180, 'tr')
  assert.ok(enSessions.byMonth.categories[0].startsWith('Jan'))
  assert.ok(trSessions.byMonth.categories[0].toLocaleLowerCase('tr').startsWith('oca'), `tr session month: ${trSessions.byMonth.categories[0]}`)

  const enHeat = app.activityHeatmap(messages, 'en')
  const trHeat = app.activityHeatmap(messages, 'tr')
  assert.equal(enHeat.weekdays[0], 'Mon')
  assert.ok(trHeat.weekdays[0].toLocaleLowerCase('tr').startsWith('pzt'), `tr weekday: ${trHeat.weekdays[0]}`)
  assert.equal(enHeat.weekdays.length, 7)

  const enResp = app.responseTimeAnalysis(messages, 'weekday', 'en')
  const trResp = app.responseTimeAnalysis(messages, 'weekday', 'tr')
  assert.equal(enResp.categories[0], 'Mon')
  assert.ok(trResp.categories[0].toLocaleLowerCase('tr').startsWith('pzt'), `tr response weekday: ${trResp.categories[0]}`)
  console.log('analysis locale ok: sessions, heatmap, response-time labels localized')
}

console.log('All issue #8 regression checks passed.')
