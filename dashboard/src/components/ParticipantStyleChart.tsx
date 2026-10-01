import type { ParticipantStyle } from '../lib/analysis'
import { categoryAxisTheme, CHART_COLORS, chartText, legendTheme, tooltipTheme, valueAxisTheme } from '../lib/chartTheme'
import { getNumberFormatter, useLocale, useT } from '../lib/i18n'
import { escapeHtml } from '../../shared/text.js'
import { EChart } from './EChart'
import { EmptyState } from './EmptyState'

interface ParticipantStyleChartProps {
  styles: ParticipantStyle[]
}

export function ParticipantStyleChart({ styles }: ParticipantStyleChartProps) {
  const locale = useLocale()
  const t = useT()
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
              `${t('style.messages')}: ${getNumberFormatter(locale).format(style.messages)}`,
              `${t('style.wordsPerMessage')}: ${style.avgWords.toFixed(1)}`,
              `${t('style.uniquePerK')}: ${style.uniquePerK.toFixed(1)}`,
              `${t('style.questions')}: ${style.questionRatio.toFixed(1)}%`,
              `${t('style.emojiPerMessage')}: ${style.emojiPerMessage.toFixed(2)}`,
              `${t('style.links')}: ${style.linkRatio.toFixed(1)}%`,
              `${t('style.mediaDeleted')}: ${style.placeholderRatio.toFixed(1)}%`
            ].join('<br/>')
          }
        },
        legend: { top: 0, ...legendTheme },
        grid: { left: 48, right: 56, top: 44, bottom: 42 },
        xAxis: { type: 'category', data: styles.map((style) => style.name), ...categoryAxisTheme },
        yAxis: [
          { type: 'value', name: t('style.wordsAxis'), ...valueAxisTheme },
          { type: 'value', name: t('style.uniqueAxis'), position: 'right', ...valueAxisTheme, splitLine: { show: false } }
        ],
        series: [
          {
            name: t('style.seriesWords'),
            type: 'bar',
            data: styles.map((style) => Number(style.avgWords.toFixed(2))),
            barMaxWidth: 42,
            itemStyle: { borderRadius: [6, 6, 0, 0] }
          },
          {
            name: t('style.seriesUnique'),
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
