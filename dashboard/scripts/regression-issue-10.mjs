// Regression checks for issue #10: navigation discoverability — tab purpose hints + empty-state navigation.
// Run from dashboard/ with: node scripts/regression-issue-10.mjs
import assert from 'node:assert/strict'
import { mkdirSync, writeFileSync } from 'node:fs'
import { build } from 'esbuild'

// In-memory localStorage stub, installed before the app modules load.
const storage = new Map()
globalThis.localStorage = {
  getItem: (key) => (storage.has(key) ? storage.get(key) : null),
  setItem: (key, value) => storage.set(key, String(value)),
  removeItem: (key) => storage.delete(key),
  clear: () => storage.clear()
}

// React stays external, so bundles are written to node_modules/.cache to resolve imports.
async function bundleModule(name, contents) {
  const built = await build({
    stdin: { contents, resolveDir: process.cwd(), loader: 'ts' },
    bundle: true,
    platform: 'node',
    format: 'esm',
    external: ['react', 'react-dom', 'react-dom/*', 'react/jsx-runtime'],
    write: false
  })
  const dir = 'node_modules/.cache'
  mkdirSync(dir, { recursive: true })
  const file = `${dir}/regression-issue-10-${name}.mjs`
  writeFileSync(file, built.outputFiles[0].text)
  return import(new URL(`../${file}`, import.meta.url))
}

const app = await bundleModule('app', `
export * as i18n from './src/lib/i18n.ts';
export * as tabnav from './src/components/TabNav.tsx';
export * as welcome from './src/components/WelcomePanel.tsx';
export { createElement as h } from 'react';
export { renderToStaticMarkup } from 'react-dom/server';
`)
const { i18n, tabnav, welcome, h, renderToStaticMarkup } = app

// 1. Tab hint copy exists in both locales (parity is enforced globally by issue #8 checks).
{
  const keys = ['tabs.dashboardHint', 'tabs.documentsHint', 'tabs.wordlistsHint']
  for (const key of keys) {
    assert.ok(i18n.messages.en[key]?.trim().length > 0, `en.${key} missing`)
    assert.ok(i18n.messages.tr[key]?.trim().length > 0, `tr.${key} missing`)
    assert.notEqual(i18n.messages.en[key], i18n.messages.tr[key], `${key} differs per locale`)
  }
  console.log('i18n ok: tabs.*Hint keys present and localized in en + tr')
}

// 2. TabNav renders a visible purpose hint for every tab, localized, without clicking.
{
  const enMarkup = renderToStaticMarkup(h(tabnav.TabNav, { active: 'dashboard', onChange: () => {} }))
  for (const key of ['tabs.dashboard', 'tabs.documents', 'tabs.wordlists']) {
    assert.ok(enMarkup.includes(i18n.messages.en[key]), `en tab label rendered: ${key}`)
  }
  for (const key of ['tabs.dashboardHint', 'tabs.documentsHint', 'tabs.wordlistsHint']) {
    assert.ok(enMarkup.includes(i18n.messages.en[key]), `en tab hint rendered: ${key}`)
  }
  assert.ok(enMarkup.includes('tab-hint'), 'hints rendered with tab-hint class')

  i18n.setLocale('tr')
  const trMarkup = renderToStaticMarkup(h(tabnav.TabNav, { active: 'wordlists', onChange: () => {} }))
  for (const key of ['tabs.dashboardHint', 'tabs.documentsHint', 'tabs.wordlistsHint']) {
    assert.ok(trMarkup.includes(i18n.messages.tr[key]), `tr tab hint rendered: ${key}`)
  }
  i18n.setLocale('en')
  console.log('tabnav ok: every tab communicates its purpose in en + tr')
}

// 3. WelcomePanel: the tab tour is clickable navigation, not dead text.
{
  assert.ok(Array.isArray(welcome.WELCOME_TAB_TARGETS), 'welcome tab targets exported')
  assert.deepEqual(
    welcome.WELCOME_TAB_TARGETS.map((target) => target.tab).sort(),
    ['dashboard', 'documents', 'wordlists'],
    'each tab description jumps to its own tab'
  )

  const markup = renderToStaticMarkup(h(welcome.WelcomePanel, { onNavigate: () => {} }))
  for (const key of ['onboarding.tabDashboard', 'onboarding.tabDocuments', 'onboarding.tabWordlists']) {
    assert.ok(markup.includes(i18n.messages.en[key]), `tab description rendered: ${key}`)
  }
  const buttonCount = (markup.match(/<button/g) || []).length
  assert.ok(buttonCount >= 5, `3 tab links + sample/upload actions expected, got ${buttonCount} buttons`)
  assert.ok(!/<li>[^<]/.test(markup), 'tab list items are wrapped in buttons, not dead text')
  assert.ok(markup.includes('welcome-tab-link'), 'tab links use the welcome-tab-link class')
  console.log('welcome ok: empty-state tab mentions are working navigation')
}

// 4. Load error card: the "Documents tab" hint gains a real jump button.
{
  let errorCard = null
  try {
    errorCard = await bundleModule('error-card', `export { LoadErrorCard } from './src/components/LoadErrorCard.tsx'`)
  } catch {}
  assert.ok(errorCard?.LoadErrorCard, 'LoadErrorCard component exists')

  assert.ok(i18n.messages.en['status.loadErrorAction']?.trim().length > 0, 'en.status.loadErrorAction missing')
  assert.ok(i18n.messages.tr['status.loadErrorAction']?.trim().length > 0, 'tr.status.loadErrorAction missing')

  const markup = renderToStaticMarkup(h(errorCard.LoadErrorCard, { error: 'boom', onGoToDocuments: () => {} }))
  assert.ok(markup.includes('boom'), 'error message shown')
  assert.ok(markup.includes(i18n.messages.en['status.loadErrorHint']), 'documents hint shown')
  assert.ok(markup.includes(i18n.messages.en['status.loadErrorAction']), 'jump button label shown')
  assert.ok(markup.includes('<button'), 'navigation path is a real button')
  console.log('error card ok: dead Documents-tab text gains a working jump button')
}

console.log('All issue #10 regression checks passed.')
