// Regression checks for the 2026-10-01 audit findings. Run from dashboard/ with: node scripts/regression-2026-10-01.mjs
import assert from 'node:assert/strict'
import { performance } from 'node:perf_hooks'
import { build } from 'esbuild'
import { parseChatText } from '../shared/parser.js'
import { cleanTextForWords } from '../shared/text.js'

const bundled = await build({
  stdin: {
    contents: `export { conversationSessions } from './src/lib/analysis.ts'; export { activitySeries, withTokens, MAX_MONTH_BUCKETS } from './src/lib/stats.ts';`,
    resolveDir: process.cwd(),
    loader: 'ts'
  },
  bundle: true,
  platform: 'node',
  format: 'esm',
  write: false
})
const app = await import('data:text/javascript;base64,' + Buffer.from(bundled.outputFiles[0].text).toString('base64'))

const parseMessages = (text) => parseChatText(text).messages

// Finding 1: year 0100 must not crash session analysis.
{
  const messages = app.withTokens(parseMessages('01.01.0100 00:00 - A: hello'))
  assert.equal(messages.length, 1)
  const sessions = app.conversationSessions(messages)
  assert.equal(sessions.sessionCount, 1)
  assert.ok(sessions.byMonth.categories[0].length > 0, 'month label should be produced')
  console.log('finding 1 ok: ancient year renders, label =', sessions.byMonth.categories[0])
}

// Finding 2: tag stripping must be linear on repeated '<'.
{
  assert.equal(cleanTextForWords('<b>hello</b> world'), ' hello  world')
  assert.equal(cleanTextForWords('no tags here'), 'no tags here')
  const hostile = '<'.repeat(32000)
  const start = performance.now()
  cleanTextForWords(hostile)
  const elapsed = performance.now() - start
  assert.ok(elapsed < 200, `tag cleaning took ${elapsed.toFixed(1)}ms for 32k chars (quadratic at ~376ms before fix)`)
  console.log(`finding 2 ok: 32k '<' chars cleaned in ${elapsed.toFixed(1)}ms`)
}

// Finding 3: month bucket enumeration must be bounded.
{
  const messages = app.withTokens(parseMessages('01.01.1000 00:00 - A: hello\n01.01.9999 00:00 - A: goodbye'))
  const data = {
    meta: {
      sourceFile: 'regression',
      sourceFiles: ['regression'],
      sources: [],
      generatedAt: new Date().toISOString(),
      participants: ['A'],
      years: [1000, 9999],
      dateRange: { start: new Date(messages[0].timestamp).toISOString(), end: new Date(messages[1].timestamp).toISOString() },
      totalMessages: 2,
      totalLines: 2,
      systemEvents: 0,
      continuationLines: 0,
      malformedLines: 0,
      placeholderMessages: 0
    },
    messages
  }
  const filters = { year: 'all', month: 'all', sender: 'all' }
  const start = performance.now()
  const result = app.activitySeries(data, messages, filters, 'messages')
  const elapsed = performance.now() - start
  assert.ok(result.categories.length <= Math.max(app.MAX_MONTH_BUCKETS, messages.length),
    `expected bounded buckets, got ${result.categories.length}`)
  assert.ok(elapsed < 100, `bucket build took ${elapsed.toFixed(1)}ms (was ~103ms for 108k buckets)`)
  console.log(`finding 3 ok: 9000-year span -> ${result.categories.length} buckets in ${elapsed.toFixed(1)}ms`)

  const dense = app.withTokens(parseMessages('15.03.2024 10:00 - A: one\n20.07.2024 11:00 - A: two'))
  const denseData = { ...data, meta: { ...data.meta, years: [2024], dateRange: { start: new Date(dense[0].timestamp).toISOString(), end: new Date(dense[1].timestamp).toISOString() } }, messages: dense }
  const denseResult = app.activitySeries(denseData, dense, filters, 'messages')
  assert.equal(denseResult.categories.length, 5, 'normal spans keep dense monthly buckets (Mar-Jul)')
  assert.equal(denseResult.series[0].data.reduce((a, b) => a + b, 0), 2)
  console.log('finding 3 ok: same-year span still dense with', denseResult.categories.length, 'buckets')
}

console.log('All regression checks passed.')
