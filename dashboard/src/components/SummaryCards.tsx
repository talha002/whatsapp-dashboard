import type { Summary } from '../types'
import { getNumberFormatter, useLocale, useT } from '../lib/i18n'

interface SummaryCardsProps {
  summary: Summary
}

export function SummaryCards({ summary }: SummaryCardsProps) {
  const locale = useLocale()
  const t = useT()
  const numberFormatter = getNumberFormatter(locale)
  const cards = [
    { label: t('summary.totalMessages'), value: numberFormatter.format(summary.totalMessages) },
    { label: t('summary.totalWords'), value: numberFormatter.format(summary.totalWords) },
    { label: t('summary.participants'), value: numberFormatter.format(summary.participantCount) },
    {
      label: t('summary.mostActive'),
      value: summary.mostActiveParticipant,
      detail:
        summary.mostActiveMessages > 0
          ? t('summary.messages', { count: numberFormatter.format(summary.mostActiveMessages) })
          : undefined
    }
  ]

  return (
    <section className="summary-grid" aria-label={t('summary.aria')}>
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
