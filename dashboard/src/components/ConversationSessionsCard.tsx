import type { SessionAnalysis } from '../lib/analysis'
import { categoryAxisTheme, CHART_COLORS, chartText, tooltipTheme, valueAxisTheme } from '../lib/chartTheme'
import { getNumberFormatter, useLocale, useT } from '../lib/i18n'
import { EChart } from './EChart'
import { EmptyState } from './EmptyState'

interface ConversationSessionsCardProps {
  analysis: SessionAnalysis
}

export function ConversationSessionsCard({ analysis }: ConversationSessionsCardProps) {
  const locale = useLocale()
  const t = useT()
  const numberFormatter = getNumberFormatter(locale)
  if (analysis.sessionCount === 0) return <EmptyState />

  return (
    <div className="sessions-card">
      <div className="mini-stats">
        <div>
          <span>{t('sessions.sessions')}</span>
          <strong>{numberFormatter.format(analysis.sessionCount)}</strong>
        </div>
        <div>
          <span>{t('sessions.avgMessages')}</span>
          <strong>{analysis.averageMessages.toFixed(1)}</strong>
        </div>
        <div>
          <span>{t('sessions.medianGap')}</span>
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
          yAxis: { type: 'value', name: t('sessions.yAxis'), ...valueAxisTheme },
          series: analysis.byMonth.series.map((entry) => ({
            name: t('sessions.sessions'),
            type: 'bar',
            data: entry.data,
            barMaxWidth: 34,
            itemStyle: { borderRadius: [6, 6, 0, 0] }
          }))
        }}
      />
      <div className="starter-list">
        <span>{t('sessions.starters')}</span>
        {analysis.starters.slice(0, 4).map((starter) => (
          <div key={starter.name}>
            <strong>{starter.name}</strong>
            <small>{t('sessions.sessionsCount', { count: numberFormatter.format(starter.value) })}</small>
          </div>
        ))}
      </div>
    </div>
  )
}
