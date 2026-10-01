import { isPlaceholderText, normalizeUnicode } from './text.js'

const MESSAGE_RE = /^(\d{1,2})\.(\d{1,2})\.(\d{4}) (\d{2}):(\d{2}) - (.*)$/
const BRACKETED_MESSAGE_RE = /^\[(\d{1,2})\.(\d{1,2})\.(\d{4}),? (\d{2}):(\d{2}):(\d{2})\] (.*)$/
const LEADING_INVISIBLE_RE = /^[\u200e\u200f\u202a-\u202e\u2066-\u2069\ufeff]+/
const BIDI_BODY_START_RE = /^[\u200e\u200f\u202a-\u202e\u2066-\u2069]/
const SENDER_SPACE_RE = /[\u00a0\u202f]/g

function isValidDateParts(year, month, day, hour, minute, second, timestamp) {
  if (month < 1 || month > 12 || day < 1 || day > 31 || hour > 23 || minute > 59 || second > 59) return false
  const date = new Date(timestamp)
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
}

export function parseChatText(rawText) {
  const rawLines = String(rawText || '').split(/\r?\n/)
  const messages = []
  let current = null
  let systemEvents = 0
  let continuationLines = 0
  let malformedLines = 0
  let placeholderMessages = 0

  for (let index = 0; index < rawLines.length; index += 1) {
    const line = rawLines[index].replace(LEADING_INVISIBLE_RE, '')
    const bracketedMatch = line.match(BRACKETED_MESSAGE_RE)
    const match = bracketedMatch || line.match(MESSAGE_RE)

    if (match) {
      const day = Number(match[1])
      const month = Number(match[2])
      const year = Number(match[3])
      const hour = Number(match[4])
      const minute = Number(match[5])
      const second = bracketedMatch ? Number(match[6]) : 0
      const rest = bracketedMatch ? match[7] : match[6]
      const timestamp = Date.UTC(year, month - 1, day, hour, minute, second)

      if (!isValidDateParts(year, month, day, hour, minute, second, timestamp)) {
        malformedLines += 1
        current = null
        continue
      }

      const separator = rest.indexOf(': ')
      if (separator === -1) {
        systemEvents += 1
        current = null
        continue
      }

      const rawSender = rest.slice(0, separator)
      const rawBody = rest.slice(separator + 2)
      const sender = normalizeUnicode(rawSender).replace(SENDER_SPACE_RE, ' ').trim()
      const text = normalizeUnicode(rawBody).trim()
      if (!sender) {
        malformedLines += 1
        current = null
        continue
      }

      const placeholder = isPlaceholderText(text)
      if (!placeholder && BIDI_BODY_START_RE.test(rawBody)) {
        systemEvents += 1
        current = null
        continue
      }
      if (placeholder) placeholderMessages += 1

      current = {
        timestamp,
        date: new Date(timestamp).toISOString(),
        year,
        month,
        day,
        hour,
        minute,
        sender,
        text,
        placeholder,
        line: index + 1
      }
      messages.push(current)
      continue
    }

    const continuation = normalizeUnicode(line)
    if (continuation.trim().length === 0) continue

    if (current) {
      current.text += `\n${continuation}`
      continuationLines += 1
    } else {
      malformedLines += 1
    }
  }

  return {
    messages,
    meta: {
      totalLines: rawLines.length,
      systemEvents,
      continuationLines,
      malformedLines,
      placeholderMessages
    }
  }
}
