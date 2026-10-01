// Regression checks for issue #9: first-run onboarding — guided empty state + sample data.
// Run from dashboard/ with: node scripts/regression-issue-9.mjs
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
    contents: `export * as i18n from './src/lib/i18n.ts'; export { getSampleChat } from './src/lib/sampleData.ts'; export { saveDocument, listDocuments, deleteDocument, mergeChatData } from './src/lib/documents.ts'; export { parseChatText } from './shared/parser.js';`,
    resolveDir: process.cwd(),
    loader: 'ts'
  },
  bundle: true,
  platform: 'node',
  format: 'esm',
  write: false
})
const app = await import('data:text/javascript;base64,' + Buffer.from(bundled.outputFiles[0].text).toString('base64'))
const { i18n, getSampleChat, saveDocument, listDocuments, deleteDocument, mergeChatData, parseChatText } = app

// 1. Sample chats exist for both locales, tagged with the matching language.
{
  const en = getSampleChat('en')
  const tr = getSampleChat('tr')
  for (const sample of [en, tr]) {
    assert.equal(typeof sample.title, 'string')
    assert.ok(sample.title.trim().length > 0, 'sample has a title')
    assert.equal(typeof sample.content, 'string')
    assert.ok(sample.content.trim().length > 0, 'sample has content')
  }
  assert.equal(en.language, 'en')
  assert.equal(tr.language, 'tr')
  assert.notEqual(en.content, tr.content, 'each locale gets its own sample')
  console.log('sample ok: en/tr samples exist with matching language tags')
}

// 2. Both samples parse cleanly as WhatsApp exports and populate every chart:
//    3 participants, >= 150 messages, >= 21 days, all 7 weekdays, varied hours.
{
  for (const locale of ['en', 'tr']) {
    const sample = getSampleChat(locale)
    const parsed = parseChatText(sample.content)
    assert.equal(parsed.meta.malformedLines, 0, `${locale} sample has no malformed lines`)
    assert.ok(parsed.messages.length >= 150, `${locale} sample has >= 150 messages, got ${parsed.messages.length}`)
    const senders = new Set(parsed.messages.map((message) => message.sender))
    assert.equal(senders.size, 3, `${locale} sample has 3 participants`)
    const spanDays = (parsed.messages[parsed.messages.length - 1].timestamp - parsed.messages[0].timestamp) / 86400000
    assert.ok(spanDays >= 21, `${locale} sample spans >= 21 days, got ${spanDays.toFixed(1)}`)
    const weekdays = new Set(parsed.messages.map((message) => new Date(message.timestamp).getUTCDay()))
    assert.equal(weekdays.size, 7, `${locale} sample covers all 7 weekdays`)
    const hours = new Set(parsed.messages.map((message) => message.hour))
    assert.ok(hours.size >= 8, `${locale} sample covers >= 8 distinct hours, got ${hours.size}`)
  }
  console.log('sample ok: both samples parse cleanly and fill heatmap/activity charts')
}

// 3. Onboarding copy exists in both locales (parity is enforced globally by issue #8 checks).
{
  const keys = [
    'onboarding.title',
    'onboarding.intro',
    'onboarding.tabDashboard',
    'onboarding.tabDocuments',
    'onboarding.tabWordlists',
    'onboarding.loadSample',
    'onboarding.uploadOwn',
    'onboarding.sampleTitle'
  ]
  for (const key of keys) {
    assert.ok(i18n.messages.en[key]?.trim().length > 0, `en.${key} missing`)
    assert.ok(i18n.messages.tr[key]?.trim().length > 0, `tr.${key} missing`)
    assert.notEqual(i18n.messages.en[key], i18n.messages.tr[key], `${key} differs per locale`)
  }
  console.log('i18n ok: onboarding.* keys present and localized in en + tr')
}

// 4. Round trip: loading the sample populates the dashboard; deleting it returns to the guided empty state.
{
  storage.clear()
  assert.equal(listDocuments().length, 0, 'starts empty (guided empty state visible)')
  assert.equal(mergeChatData(null, listDocuments()), null, 'no data before loading the sample')

  const sample = getSampleChat('tr')
  const saved = saveDocument({ title: sample.title, language: sample.language, content: sample.content, source: 'paste' })
  assert.equal(listDocuments().length, 1, 'sample stored as a normal document')
  const merged = mergeChatData(null, listDocuments())
  assert.ok(merged.messages.length >= 150, 'charts populate from the sample document')
  assert.ok(merged.meta.sourceFiles.includes(sample.title), 'sample appears as a data source')

  deleteDocument(saved.id)
  assert.equal(listDocuments().length, 0, 'deleting the sample returns to the empty state')
  assert.equal(mergeChatData(null, listDocuments()), null, 'no data after deletion')
  console.log('round trip ok: load sample -> charts populate -> delete -> guided empty state')
}

console.log('All issue #9 regression checks passed.')
