import type { WordCount } from '../types'
import { EmptyState } from './EmptyState'

const numberFormatter = new Intl.NumberFormat('en')

interface TopWordsProps {
  words: WordCount[]
}

export function TopWords({ words }: TopWordsProps) {
  if (words.length === 0) return <EmptyState />

  const max = words[0]?.value || 1

  return (
    <ol className="top-words">
      {words.map((word, index) => (
        <li key={word.name}>
          <span className="rank">{index + 1}</span>
          <span className="word">{word.name}</span>
          <span className="count">{numberFormatter.format(word.value)}</span>
          <span className="bar" aria-hidden="true">
            <span style={{ width: `${Math.max(4, (word.value / max) * 100)}%` }} />
          </span>
        </li>
      ))}
    </ol>
  )
}
