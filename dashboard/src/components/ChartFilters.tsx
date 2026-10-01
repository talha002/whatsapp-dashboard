import { useMemo } from 'react'
import type { Filters, TokenizedMessage } from '../types'
import { ALL_MONTHS, ALL_SENDERS, ALL_YEARS, MONTH_FULL_LABELS, getMonthCounts } from '../lib/stats'

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
  const senderScopedMessages = useMemo(
    () => (filters.sender === ALL_SENDERS ? messages : messages.filter((message) => message.sender === filters.sender)),
    [messages, filters.sender]
  )
  const monthCounts = useMemo(() => getMonthCounts(senderScopedMessages, filters.year), [senderScopedMessages, filters.year])

  return (
    <div className="chart-filters" aria-label="Chart filters">
      <label className="filter-field">
        <span>Year</span>
        <select
          value={String(filters.year)}
          onChange={(event) => {
            const year = event.target.value === ALL_YEARS ? ALL_YEARS : Number(event.target.value)
            onChange({ ...filters, year, month: ALL_MONTHS })
          }}
        >
          <option value={ALL_YEARS}>All years</option>
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </label>

      <label className="filter-field">
        <span>Month</span>
        <select
          value={String(filters.month)}
          disabled={filters.year === ALL_YEARS}
          onChange={(event) => {
            const month = event.target.value === ALL_MONTHS ? ALL_MONTHS : Number(event.target.value)
            onChange({ ...filters, month })
          }}
        >
          <option value={ALL_MONTHS}>All months</option>
          {MONTH_FULL_LABELS.map((label, index) => {
            const count = monthCounts[index] || 0
            return (
              <option key={label} value={index + 1}>
                {count > 0 ? `${label} (${count})` : `${label} (no data)`}
              </option>
            )
          })}
        </select>
      </label>

      <label className="filter-field">
        <span>Person</span>
        <select value={filters.sender} onChange={(event) => onChange({ ...filters, sender: event.target.value })}>
          <option value={ALL_SENDERS}>All participants</option>
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
