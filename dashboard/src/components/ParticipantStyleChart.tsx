import type { ParticipantStyle } from '../lib/analysis'
import { categoryAxisTheme, CHART_COLORS, chartText, legendTheme, tooltipTheme, valueAxisTheme } from '../lib/chartTheme'
import { escapeHtml } from '../../shared/text.js'
import { EChart } from './EChart'
import { EmptyState } from './EmptyState'

interface ParticipantStyleChartProps {
  styles: ParticipantStyle[]
}

export function ParticipantStyleChart({ styles }: ParticipantStyleChartProps) {
  if (styles.length === 0) return <EmptyState />

  const byName = new Map(styles.map((style) => [style.name, style]))

  return (
    <EChart
      height={330}
      option={{
        color: CHART_COLORS,
        textStyle: { color: chartText },
        tooltip: {
          trigger: 'axis',
          ...tooltipTheme,
          axisPointer: { type: 'shadow' },
          formatter: (params: any) => {
            const name = params[0]?.name as string
            const style = byName.get(name)
            if (!style) return escapeHtml(name)
            return [
              `<strong>${escapeHtml(name)}</strong>`,
              `Messages: ${style.messages.toLocaleString('en')}`,
              `Words/message: ${style.avgWords.toFixed(1)}`,
              `Unique/1k words: ${style.uniquePerK.toFixed(1)}`,
              `Questions: ${style.questionRatio.toFixed(1)}%`,
              `Emoji/message: ${style.emojiPerMessage.toFixed(2)}`,
              `Links: ${style.linkRatio.toFixed(1)}%`,
              `Media/deleted: ${style.placeholderRatio.toFixed(1)}%`
            ].join('<br/>')
          }
        },
        legend: { top: 0, ...legendTheme },
        grid: { left: 48, right: 56, top: 44, bottom: 42 },
        xAxis: { type: 'category', data: styles.map((style) => style.name), ...categoryAxisTheme },
        yAxis: [
          { type: 'value', name: 'Words/msg', ...valueAxisTheme },
          { type: 'value', name: 'Unique/1k', position: 'right', ...valueAxisTheme, splitLine: { show: false } }
        ],
        series: [
          {
            name: 'Words / message',
            type: 'bar',
            data: styles.map((style) => Number(style.avgWords.toFixed(2))),
            barMaxWidth: 42,
            itemStyle: { borderRadius: [6, 6, 0, 0] }
          },
          {
            name: 'Unique words / 1k',
            type: 'line',
            yAxisIndex: 1,
            smooth: true,
            data: styles.map((style) => Number(style.uniquePerK.toFixed(2)))
          }
        ]
      }}
    />
  )
}
