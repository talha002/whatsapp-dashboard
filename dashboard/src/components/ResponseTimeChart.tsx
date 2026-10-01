import { useMemo, useState } from 'react'
import type { TokenizedMessage } from '../types'
import type { ResponseDimension } from '../lib/analysis'
import { responseTimeAnalysis } from '../lib/analysis'
import { categoryAxisTheme, CHART_COLORS, chartText, dataZoomTheme, legendTheme, tooltipTheme, valueAxisTheme } from '../lib/chartTheme'
import { getNumberFormatter, useLocale, useT } from '../lib/i18n'
import { escapeHtml } from '../../shared/text.js'
import { EChart } from './EChart'
import { EmptyState } from './EmptyState'

interface ResponseTimeChartProps {
  messages: TokenizedMessage[]
}

function formatMinutes(minutes: number) {
  if (minutes >= 90) {
    const hours = Math.floor(minutes / 60)
    const remaining = Math.round(minutes % 60)
    return remaining > 0 ? `${hours}h ${remaining}m` : `${hours}h`
  }
  return `${Math.round(minutes)}m`
}

export function ResponseTimeChart({ messages }: ResponseTimeChartProps) {
  const locale = useLocale()
  const t = useT()
  const [dimension, setDimension] = useState<ResponseDimension>('person')
  const result = useMemo(() => responseTimeAnalysis(messages, dimension, locale), [messages, dimension, locale])

  return (
    <div className="chart-with-toolbar">
      <div className="chart-toolbar split">
        <span>{t('response.caption')}</span>
        <label>
          <span>{t('response.groupBy')}</span>
          <select value={dimension} onChange={(event) => setDimension(event.target.value as ResponseDimension)}>
            <option value="person">{t('response.person')}</option>
            <option value="weekday">{t('response.weekday')}</option>
            <option value="hour">{t('response.hour')}</option>
            <option value="year">{t('response.year')}</option>
          </select>
        </label>
      </div>
      {result.totalResponses === 0 ? (
        <EmptyState message={t('response.empty')} />
      ) : (
        <EChart
          height={340}
          option={{
            color: CHART_COLORS,
            textStyle: { color: chartText },
            tooltip: {
              trigger: 'axis',
              ...tooltipTheme,
              axisPointer: { type: 'shadow' },
              formatter: (params: any) => {
                const first = params[0]
                const index = first?.dataIndex ?? 0
                const name = first?.name ?? result.categories[index]
                const median = result.values[index] || 0
                const count = result.counts[index] || 0
                return `<strong>${escapeHtml(name)}</strong><br/>${t('response.medianResponse')}: ${formatMinutes(median)}<br/>${t('response.responses')}: ${getNumberFormatter(locale).format(count)}`
              }
            },
            legend: { show: false },
            grid: { left: 56, right: 24, top: 24, bottom: result.categories.length > 10 ? 76 : 52 },
            xAxis: {
              type: 'category',
              data: result.categories,
              ...categoryAxisTheme,
              axisLabel: {
                ...categoryAxisTheme.axisLabel,
                rotate: result.categories.length > 10 ? 45 : 0,
                hideOverlap: true
              }
            },
            yAxis: {
              type: 'value',
              name: t('response.yAxis'),
              ...valueAxisTheme,
              axisLabel: { ...valueAxisTheme.axisLabel, formatter: (value: number) => formatMinutes(value) }
            },
            dataZoom:
              result.categories.length > 16
                ? [
                    { type: 'inside', throttle: 30 },
                    { type: 'slider', height: 18, bottom: 18, ...dataZoomTheme }
                  ]
                : undefined,
            series: [
              {
                name: t('response.series'),
                type: 'bar',
                data: result.values,
                barMaxWidth: 44,
                itemStyle: { borderRadius: [6, 6, 0, 0] },
                emphasis: { focus: 'series' }
              }
            ]
          }}
        />
      )}
    </div>
  )
}
