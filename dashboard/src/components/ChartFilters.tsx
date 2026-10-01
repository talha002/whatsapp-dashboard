import { useMemo } from 'react'
import type { Filters, TokenizedMessage } from '../types'
import { ALL_MONTHS, ALL_SENDERS, ALL_YEARS, getMonthCounts } from '../lib/stats'
import { getMonthFullLabels, useLocale, useT } from '../lib/i18n'

export interface ParticipantOption {
  name: string
  messages: number
}

interface ChartFiltersProps {
  messages: TokenizedMessage[]
  years: number[]
  participants: ParticipantOption[]
  filters: Filters
  onChange: (filters: Filters) => void
}

export function ChartFilters({ messages, years, participants, filters, onChange }: ChartFiltersProps) {
  const locale = useLocale()
  const t = useT()
  const monthLabels = getMonthFullLabels(locale)
  const senderScopedMessages = useMemo(
    () => (filters.sender === ALL_SENDERS ? messages : messages.filter((message) => message.sender === filters.sender)),
    [messages, filters.sender]
  )
  const monthCounts = useMemo(() => getMonthCounts(senderScopedMessages, filters.year), [senderScopedMessages, filters.year])

  return (
    <div className="chart-filters" aria-label={t('filters.aria')}>
      <label className="filter-field">
        <span>{t('filters.year')}</span>
        <select
          value={String(filters.year)}
          onChange={(event) => {
            const year = event.target.value === ALL_YEARS ? ALL_YEARS : Number(event.target.value)
            onChange({ ...filters, year, month: ALL_MONTHS })
          }}
        >
          <option value={ALL_YEARS}>{t('filters.allYears')}</option>
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </label>

      <label className="filter-field">
        <span>{t('filters.month')}</span>
        <select
          value={String(filters.month)}
          disabled={filters.year === ALL_YEARS}
          onChange={(event) => {
            const month = event.target.value === ALL_MONTHS ? ALL_MONTHS : Number(event.target.value)
            onChange({ ...filters, month })
          }}
        >
          <option value={ALL_MONTHS}>{t('filters.allMonths')}</option>
          {monthLabels.map((label, index) => {
            const count = monthCounts[index] || 0
            return (
              <option key={label} value={index + 1}>
                {count > 0 ? `${label} (${count})` : `${label} (${t('filters.noData')})`}
              </option>
            )
          })}
        </select>
      </label>

      <label className="filter-field">
        <span>{t('filters.person')}</span>
        <select value={filters.sender} onChange={(event) => onChange({ ...filters, sender: event.target.value })}>
          <option value={ALL_SENDERS}>{t('filters.allParticipants')}</option>
          {participants.map((participant) => (
            <option key={participant.name} value={participant.name}>
              {participant.name} ({participant.messages})
            </option>
          ))}
        </select>
      </label>
    </div>
  )
}
