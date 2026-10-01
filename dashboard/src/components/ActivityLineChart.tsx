import type { ActivityMetric, CategorySeries } from '../types'
import { categoryAxisTheme, CHART_COLORS, chartText, dataZoomTheme, legendTheme, tooltipTheme, valueAxisTheme } from '../lib/chartTheme'
import { EChart } from './EChart'
import { EmptyState } from './EmptyState'

const numberFormatter = new Intl.NumberFormat('en')

interface ActivityLineChartProps {
  data: CategorySeries
  metric: ActivityMetric
  onMetricChange: (metric: ActivityMetric) => void
}

export function ActivityLineChart({ data, metric, onMetricChange }: ActivityLineChartProps) {
  const hasValues = data.series.some((entry) => entry.data.some((value) => value > 0))
  if (data.categories.length === 0 || !hasValues) return <EmptyState />

  return (
    <div className="chart-with-toolbar">
      <div className="chart-toolbar split">
        <div className="segmented" role="group" aria-label="Activity metric">
          <button className={metric === 'messages' ? 'active' : ''} onClick={() => onMetricChange('messages')}>
            Messages
          </button>
          <button className={metric === 'words' ? 'active' : ''} onClick={() => onMetricChange('words')}>
            Words
          </button>
        </div>
      </div>
      <EChart
        height={380}
        option={{
          color: CHART_COLORS,
          textStyle: { color: chartText },
          tooltip: {
            trigger: 'axis',
            ...tooltipTheme,
            valueFormatter: (value: number) => numberFormatter.format(value)
          },
          legend: { type: 'scroll', top: 0, ...legendTheme },
          grid: { left: 52, right: 24, top: 44, bottom: 58 },
          xAxis: {
            type: 'category',
            boundaryGap: false,
            data: data.categories,
            ...categoryAxisTheme,
            axisLabel: { ...categoryAxisTheme.axisLabel, hideOverlap: true }
          },
          yAxis: { type: 'value', name: metric === 'words' ? 'Words' : 'Messages', ...valueAxisTheme },
          dataZoom:
            data.categories.length > 40
              ? [
                  { type: 'inside', throttle: 30 },
                  { type: 'slider', height: 18, bottom: 18, ...dataZoomTheme }
                ]
              : undefined,
          series: data.series.map((entry) => ({
            name: entry.name,
            type: 'line',
            smooth: true,
            showSymbol: false,
            symbolSize: 6,
            connectNulls: true,
            data: entry.data,
            lineStyle: { width: 2 },
            areaStyle: data.series.length === 1 ? { opacity: 0.08 } : undefined,
            emphasis: { focus: 'series' }
          }))
        }}
      />
    </div>
  )
}
