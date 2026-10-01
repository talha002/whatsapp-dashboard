import type { Summary } from '../types'

const numberFormatter = new Intl.NumberFormat('en')

interface SummaryCardsProps {
  summary: Summary
}

export function SummaryCards({ summary }: SummaryCardsProps) {
  const cards = [
    { label: 'Total messages', value: numberFormatter.format(summary.totalMessages) },
    { label: 'Total words', value: numberFormatter.format(summary.totalWords) },
    { label: 'Participants', value: numberFormatter.format(summary.participantCount) },
    {
      label: 'Most active participant',
      value: summary.mostActiveParticipant,
      detail: summary.mostActiveMessages > 0 ? `${numberFormatter.format(summary.mostActiveMessages)} messages` : undefined
    }
  ]

  return (
    <section className="summary-grid" aria-label="Summary">
      {cards.map((card) => (
        <article className="card summary-card" key={card.label}>
          <span>{card.label}</span>
          <strong>{card.value}</strong>
          {card.detail ? <small>{card.detail}</small> : null}
        </article>
      ))}
    </section>
  )
}
