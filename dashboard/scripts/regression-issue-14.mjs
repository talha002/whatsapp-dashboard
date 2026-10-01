// Regression checks for issue #14: truncate long participant lists in the header "Overall" line.
// Run from dashboard/ with: node scripts/regression-issue-14.mjs
import assert from 'node:assert/strict'
import { build } from 'esbuild'

const storage = new Map()
Object.defineProperty(globalThis, 'navigator', { value: { language: 'en-US' }, configurable: true })
globalThis.localStorage = {
  getItem: (key) => (storage.has(key) ? storage.get(key) : null),
  setItem: (key, value) => storage.set(key, String(value)),
  removeItem: (key) => storage.delete(key),
  clear: () => storage.clear()
}

const bundled = await build({
  stdin: {
    contents: `export * as i18n from './src/lib/i18n.ts';`,
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

// 1. Up to 3 participants: every name is listed, unchanged from previous behavior.
{
  assert.equal(i18n.formatParticipantList(['Alice'], 'en'), 'Alice')
  assert.equal(i18n.formatParticipantList(['Alice', 'Bob'], 'en'), 'Alice, Bob')
  assert.equal(i18n.formatParticipantList(['Alice', 'Bob', 'Carol'], 'en'), 'Alice, Bob, Carol')
  assert.equal(i18n.formatParticipantList(['Deniz', 'Ece', 'Mert'], 'tr'), 'Deniz, Ece, Mert')
  console.log('short lists ok: 1-3 participants listed in full')
}

// 2. More than 3 participants: first 3 names, then "+N more" with the remaining count.
{
  assert.equal(i18n.formatParticipantList(['Alice', 'Bob', 'Carol', 'Dave'], 'en'), 'Alice, Bob, Carol +1 more')
  assert.equal(
    i18n.formatParticipantList(['Alice', 'Bob', 'Carol', 'Dave', 'Eve', 'Frank', 'Grace', 'Heidi'], 'en'),
    'Alice, Bob, Carol +5 more'
  )
  console.log('long lists ok: truncated after 3 names with +N more')
}

// 3. The "+N more" suffix is translated natively per supported locale.
{
  const names = ['A', 'B', 'C', 'D', 'E', 'F']
  const suffix = (locale) => i18n.formatParticipantList(names, locale).replace('A, B, C ', '')
  assert.equal(suffix('en'), '+3 more')
  assert.equal(suffix('tr'), '+3 kişi daha')
  assert.equal(suffix('es'), '+3 más')
  assert.equal(suffix('fr'), '+3 autres')
  assert.equal(suffix('pt'), '+3 mais')
  assert.equal(suffix('de'), '+3 weitere')
  assert.equal(suffix('it'), '+3 altri')
  assert.equal(suffix('pl'), '+3 więcej')
  assert.equal(suffix('ro'), '+3 în plus')
  console.log('locales ok: +N more phrased natively in all 9 locales')
}

// 4. Edge cases: empty list stays empty; participant order is preserved.
{
  assert.equal(i18n.formatParticipantList([], 'en'), '')
  assert.equal(i18n.formatParticipantList(['Zoe', 'Amy', 'Kim', 'Bob'], 'en'), 'Zoe, Amy, Kim +1 more')
  console.log('edge cases ok: empty list, original order preserved')
}

console.log('regression-issue-14: all checks passed')
