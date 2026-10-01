import 'echarts-wordcloud'
import type { WordCount } from '../types'
import { CHART_COLORS, chartText, tooltipTheme } from '../lib/chartTheme'
import { EChart } from './EChart'
import { EmptyState } from './EmptyState'

interface WordCloudChartProps {
  words: WordCount[]
}

export function WordCloudChart({ words }: WordCloudChartProps) {
  if (words.length === 0) return <EmptyState />

  const data = words.slice(0, 120).map((word, index) => ({
    name: word.name,
    value: word.value,
    textStyle: { color: CHART_COLORS[index % CHART_COLORS.length] }
  }))

  return (
    <EChart
      height={380}
      option={{
        textStyle: { color: chartText },
        tooltip: { show: true, ...tooltipTheme },
        series: [
          {
            type: 'wordCloud',
            shape: 'circle',
            gridSize: 8,
            sizeRange: [14, 56],
            rotationRange: [-30, 30],
            textStyle: {
              fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif'
            },
            emphasis: {
              focus: 'self',
              textStyle: {
                textShadowBlur: 10,
                textShadowColor: '#2563eb'
              }
            },
            data
          }
        ]
      }}
    />
  )
}
