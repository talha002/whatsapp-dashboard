import type { CategorySeries, WordBarMode } from '../types'
import { categoryAxisTheme, CHART_COLORS, chartText, dataZoomTheme, legendTheme, tooltipTheme, valueAxisTheme } from '../lib/chartTheme'
import { EChart } from './EChart'
import { EmptyState } from './EmptyState'

const numberFormatter = new Intl.NumberFormat('en')

type ModeOption = WordBarMode | 'auto'

interface WordCountBarChartProps {
  data: CategorySeries
  mode: ModeOption
  canCompareByMonth: boolean
  onModeChange: (mode: ModeOption) => void
}

export function WordCountBarChart({ data, mode, canCompareByMonth, onModeChange }: WordCountBarChartProps) {
  const hasValues = data.series.some((entry) => entry.data.some((value) => value > 0))
  if (data.categories.length === 0 || !hasValues) return <EmptyState />

  const stacked = data.series.length > 1

  return (
    <div className="chart-with-toolbar">
      <div className="chart-toolbar">
        <span>Compare by</span>
        <select value={mode} onChange={(event) => onModeChange(event.target.value as ModeOption)}>
          <option value="auto">Auto</option>
          <option value="year">Year</option>
          <option value="month" disabled={!canCompareByMonth}>
            Month
          </option>
          <option value="person">Person</option>
        </select>
      </div>
      <EChart
        height={360}
        option={{
          color: CHART_COLORS,
          textStyle: { color: chartText },
          tooltip: {
            trigger: 'axis',
            ...tooltipTheme,
            axisPointer: { type: 'shadow' },
            valueFormatter: (value: number) => numberFormatter.format(value)
          },
          legend: stacked ? { type: 'scroll', top: 0, ...legendTheme } : undefined,
          grid: { left: 48, right: 24, top: stacked ? 42 : 24, bottom: 56 },
          xAxis: {
            type: 'category',
            data: data.categories,
            ...categoryAxisTheme,
            axisLabel: {
              ...categoryAxisTheme.axisLabel,
              rotate: data.categories.length > 12 ? 45 : 0,
              hideOverlap: true
            }
          },
          yAxis: { type: 'value', name: 'Words', ...valueAxisTheme },
          dataZoom:
            data.categories.length > 12
              ? [
                  { type: 'inside', throttle: 30 },
                  { type: 'slider', height: 18, bottom: 18, ...dataZoomTheme }
                ]
              : undefined,
          series: data.series.map((entry) => ({
            name: entry.name,
            type: 'bar',
            stack: stacked ? 'words' : undefined,
            data: entry.data,
            barMaxWidth: 42,
            itemStyle: { borderRadius: [6, 6, 0, 0] },
            emphasis: { focus: 'series' }
          }))
        }}
      />
    </div>
  )
}
