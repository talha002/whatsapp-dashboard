// Regression checks for issue #7: bracketed WhatsApp export format [DD.MM.YYYY HH:MM:SS].
// Run from dashboard/ with: node scripts/regression-issue-7.mjs
import assert from 'node:assert/strict'
import { parseChatText } from '../shared/parser.js'
import { tokenizeText } from '../shared/text.js'

const LRM = '\u200e'
const NNBSP = '\u202f'
const BOM = '\ufeff'

// Synthetic fixture from the issue: system notification with leading LRM, multiword sender,
// "~" + NNBSP display name, multiline message, emoji-only message.
const fixture = [
  `[05.02.2025 09:00:00] DEMO GROUP: ${LRM}Alex Example sizi ekledi`,
  '[05.02.2025 09:01:00] Alex Example: apple apple',
  `[05.02.2025 09:02:00] ~${NNBSP}Robin Sample: banana`,
  '[05.02.2025 09:03:00] Alex Example: apple',
  '',
  'banana',
  '[05.02.2025 09:04:00] Alex Example: 👏'
].join('\n')

// 1. Bracketed fixture parses into 4 real messages; system notification is excluded.
{
  const { messages, meta } = parseChatText(fixture)
  assert.equal(messages.length, 4, `expected 4 messages, got ${messages.length}`)
  assert.equal(meta.systemEvents, 1)

  assert.equal(messages[0].sender, 'Alex Example')
  assert.equal(messages[0].text, 'apple apple')
  assert.equal(messages[0].timestamp, Date.UTC(2025, 1, 5, 9, 1, 0))

  assert.equal(messages[1].sender, '~ Robin Sample', 'NNBSP in sender normalizes to a plain space')
  assert.equal(messages[1].text, 'banana')

  assert.equal(messages[2].text, 'apple\nbanana', 'multiline message is preserved')

  assert.equal(messages[3].text, '👏')
  console.log('fixture ok: 4 messages, 1 system event, senders + multiline preserved')
}

// 2. Word frequency on the fixture is exactly { apple: 3, banana: 2 } with default stopwords.
{
  const { messages } = parseChatText(fixture)
  const counts = new Map()
  for (const message of messages) {
    for (const token of tokenizeText(message.text)) {
      counts.set(token, (counts.get(token) || 0) + 1)
    }
  }
  assert.deepEqual([...counts.entries()].sort(), [['apple', 3], ['banana', 2]])
  console.log('word frequency ok: exactly apple:3 banana:2, no sender/system leakage')
}

// 3. Participant names written inside real messages still count (no global blacklist).
{
  const { messages } = parseChatText('[05.02.2025 09:05:00] Robin Sample: alex came over')
  const tokens = tokenizeText(messages[0].text)
  assert.ok(tokens.includes('alex'), 'participant name inside a message body is counted')
  console.log('no-blacklist ok: participant names in message bodies count normally')
}

// 4. Seconds land in the timestamp.
{
  const { messages } = parseChatText('[05.02.2025 09:01:37] Alex Example: hi')
  assert.equal(messages[0].timestamp, Date.UTC(2025, 1, 5, 9, 1, 37))
  assert.equal(messages[0].minute, 1)
  console.log('seconds ok: timestamp keeps second precision')
}

// 5. Optional comma after the bracketed date (common iOS locale variant).
{
  const { messages } = parseChatText('[05.02.2025, 09:01:00] Alex Example: hi')
  assert.equal(messages.length, 1)
  console.log('comma variant ok')
}

// 6. BOM-prefixed export still parses its first line.
{
  const { messages } = parseChatText(`${BOM}[05.02.2025 09:01:00] Alex Example: hi`)
  assert.equal(messages.length, 1)
  console.log('BOM ok: leading invisible marks do not break line matching')
}

// 7. Bracketed media-omitted placeholder stays a placeholder message, not a system event.
{
  const { messages, meta } = parseChatText(`[05.02.2025 09:05:00] Alex Example: ${LRM}<Media omitted>`)
  assert.equal(messages.length, 1)
  assert.equal(messages[0].placeholder, true)
  assert.equal(meta.systemEvents, 0)
  assert.equal(meta.placeholderMessages, 1)
  console.log('placeholder ok: LRM-prefixed media-omitted kept as placeholder message')
}

// 8. Existing unbracketed format keeps working, including its no-colon system events.
{
  const { messages, meta } = parseChatText(
    '05.02.2025 09:00 - Group created\n05.02.2025 09:01 - Alex Example: hello\n05.02.2025 09:02 - Alex Example: again'
  )
  assert.equal(messages.length, 2)
  assert.equal(meta.systemEvents, 1)
  assert.equal(messages[0].sender, 'Alex Example')
  assert.equal(messages[0].timestamp, Date.UTC(2025, 1, 5, 9, 1, 0))
  console.log('unbracketed format ok')
}

// 9. Plain-text documents still return zero messages (line-based fallback preserved).
{
  const { messages, meta } = parseChatText('just some prose\nanother line of text')
  assert.equal(messages.length, 0)
  assert.equal(meta.malformedLines, 2)
  console.log('plain text ok: zero parsed messages, documents.ts fallback untouched')
}

console.log('All issue #7 regression checks passed.')
