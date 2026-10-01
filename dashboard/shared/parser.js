import { isPlaceholderText, normalizeUnicode } from './text.js'

const MESSAGE_RE = /^(\d{1,2})\.(\d{1,2})\.(\d{4}) (\d{2}):(\d{2}) - (.*)$/

function isValidDateParts(year, month, day, hour, minute, timestamp) {
  if (month < 1 || month > 12 || day < 1 || day > 31 || hour > 23 || minute > 59) return false
  const date = new Date(timestamp)
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
}

export function parseChatText(rawText) {
  const normalized = normalizeUnicode(String(rawText || ''))
  const lines = normalized.split(/\r?\n/)
  const messages = []
  let current = null
  let systemEvents = 0
  let continuationLines = 0
  let malformedLines = 0
  let placeholderMessages = 0

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index]
    const match = line.match(MESSAGE_RE)

    if (match) {
      const [, dayRaw, monthRaw, yearRaw, hourRaw, minuteRaw, rest] = match
      const day = Number(dayRaw)
      const month = Number(monthRaw)
      const year = Number(yearRaw)
      const hour = Number(hourRaw)
      const minute = Number(minuteRaw)
      const timestamp = Date.UTC(year, month - 1, day, hour, minute)

      if (!isValidDateParts(year, month, day, hour, minute, timestamp)) {
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

      const sender = rest.slice(0, separator).trim()
      const text = rest.slice(separator + 2).trim()
      if (!sender) {
        malformedLines += 1
        current = null
        continue
      }

      const placeholder = isPlaceholderText(text)
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

    if (line.trim().length === 0) continue

    if (current) {
      current.text += `\n${line}`
      continuationLines += 1
    } else {
      malformedLines += 1
    }
  }

  return {
    messages,
    meta: {
      totalLines: lines.length,
      systemEvents,
      continuationLines,
      malformedLines,
      placeholderMessages
    }
  }
}
