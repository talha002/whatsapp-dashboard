import type { SessionAnalysis } from '../lib/analysis'
import { categoryAxisTheme, CHART_COLORS, chartText, tooltipTheme, valueAxisTheme } from '../lib/chartTheme'
import { EChart } from './EChart'
import { EmptyState } from './EmptyState'

const numberFormatter = new Intl.NumberFormat('en')

interface ConversationSessionsCardProps {
  analysis: SessionAnalysis
}

export function ConversationSessionsCard({ analysis }: ConversationSessionsCardProps) {
  if (analysis.sessionCount === 0) return <EmptyState />

  return (
    <div className="sessions-card">
      <div className="mini-stats">
        <div>
          <span>Sessions</span>
          <strong>{numberFormatter.format(analysis.sessionCount)}</strong>
        </div>
        <div>
          <span>Avg messages</span>
          <strong>{analysis.averageMessages.toFixed(1)}</strong>
        </div>
        <div>
          <span>Median gap</span>
          <strong>{analysis.medianGapMinutes.toFixed(1)}m</strong>
        </div>
      </div>
      <EChart
        height={240}
        option={{
          color: CHART_COLORS,
          textStyle: { color: chartText },
          tooltip: { trigger: 'axis', ...tooltipTheme },
          grid: { left: 44, right: 16, top: 20, bottom: 44 },
          xAxis: {
            type: 'category',
            data: analysis.byMonth.categories,
            ...categoryAxisTheme,
            axisLabel: { ...categoryAxisTheme.axisLabel, hideOverlap: true }
          },
          yAxis: { type: 'value', name: 'Sessions', ...valueAxisTheme },
          series: analysis.byMonth.series.map((entry) => ({
            name: entry.name,
            type: 'bar',
            data: entry.data,
            barMaxWidth: 34,
            itemStyle: { borderRadius: [6, 6, 0, 0] }
          }))
        }}
      />
      <div className="starter-list">
        <span>Conversation starters</span>
        {analysis.starters.slice(0, 4).map((starter) => (
          <div key={starter.name}>
            <strong>{starter.name}</strong>
            <small>{numberFormatter.format(starter.value)} sessions</small>
          </div>
        ))}
      </div>
    </div>
  )
}
