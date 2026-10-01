import { escapeHtml } from '../shared/text.js'
import assert from 'node:assert/strict'

const maliciousName = '<img src=x onerror=alert(document.domain)>'

assert.equal(typeof escapeHtml, 'function', 'escapeHtml must be exported from shared/text.js')

assert.equal(escapeHtml('<img src=x onerror=alert(1)>'), '&lt;img src=x onerror=alert(1)&gt;')
assert.equal(escapeHtml('"><script>alert(1)</script>'), '&quot;&gt;&lt;script&gt;alert(1)&lt;/script&gt;')
assert.equal(escapeHtml("a'b&c"), 'a&#39;b&amp;c')
assert.equal(escapeHtml('plain text'), 'plain text')

const participantStyleTooltip = (name) =>
  [`<strong>${escapeHtml(name)}</strong>`, 'Messages: 1'].join('<br/>')
const responseTimeTooltip = (name) =>
  `<strong>${escapeHtml(name)}</strong><br/>Median response: 5m<br/>Responses: 1`
const networkTooltip = (name) =>
  `<strong>${escapeHtml(name)}</strong><br/>Frequency: 1`

for (const build of [participantStyleTooltip, responseTimeTooltip, networkTooltip]) {
  const html = build(maliciousName)
  assert.ok(!html.includes('<img'), `raw <img> tag survived in tooltip: ${html}`)
  assert.ok(!/<[a-z]+ [^>]*onerror/i.test(html), `executable tag survived in tooltip: ${html}`)
  assert.ok(html.includes('&lt;img'), `payload was not entity-escaped: ${html}`)
}

console.log('All tooltip escaping checks passed.')
