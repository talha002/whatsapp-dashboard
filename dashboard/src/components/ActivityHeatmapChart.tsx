import type { HeatmapData } from '../lib/analysis'
import { categoryAxisTheme, chartMutedText, chartText, tooltipTheme } from '../lib/chartTheme'
import { useT } from '../lib/i18n'
import { EChart } from './EChart'
import { EmptyState } from './EmptyState'

interface ActivityHeatmapChartProps {
  data: HeatmapData
}

export function ActivityHeatmapChart({ data }: ActivityHeatmapChartProps) {
  const t = useT()
  if (data.values.length === 0) return <EmptyState />

  return (
    <EChart
      height={320}
      option={{
        textStyle: { color: chartText },
        tooltip: {
          ...tooltipTheme,
          position: 'top',
          formatter: (params: any) => {
            const value = params.value as [number, number, number]
            return `${data.weekdays[value[1]]} ${data.hours[value[0]]}<br/>${t('heatmap.messages', { count: value[2] })}`
          }
        },
        grid: { left: 56, right: 20, top: 24, bottom: 72 },
        xAxis: {
          type: 'category',
          data: data.hours,
          ...categoryAxisTheme,
          axisLabel: { ...categoryAxisTheme.axisLabel, interval: 2 }
        },
        yAxis: {
          type: 'category',
          data: data.weekdays,
          ...categoryAxisTheme
        },
        visualMap: {
          min: 0,
          max: Math.max(1, data.max),
          calculable: true,
          orient: 'horizontal',
          left: 'center',
          bottom: 0,
          textStyle: { color: chartMutedText },
          inRange: { color: ['#111827', '#1e3a8a', '#2563eb', '#60a5fa', '#fbbf24'] }
        },
        series: [
          {
            name: t('heatmap.series'),
            type: 'heatmap',
            data: data.values,
            label: { show: false },
            emphasis: { itemStyle: { shadowBlur: 10, shadowColor: 'rgba(96, 165, 250, 0.5)' } }
          }
        ]
      }}
    />
  )
}
