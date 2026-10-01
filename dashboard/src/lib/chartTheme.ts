export const CHART_COLORS = ['#60a5fa', '#a78bfa', '#34d399', '#fbbf24', '#f87171', '#22d3ee', '#f472b6', '#c084fc']

export const chartText = '#dbeafe'
export const chartMutedText = '#a8b7cb'
export const chartGridLine = 'rgba(148, 163, 184, 0.16)'
export const chartAxisLine = 'rgba(148, 163, 184, 0.38)'

export const tooltipTheme = {
  backgroundColor: 'rgba(15, 23, 42, 0.96)',
  borderColor: 'rgba(148, 163, 184, 0.28)',
  textStyle: { color: '#e5eefb' }
}

export const legendTheme = {
  textStyle: { color: chartText },
  pageTextStyle: { color: chartMutedText }
}

export const categoryAxisTheme = {
  axisLabel: { color: chartMutedText },
  axisLine: { lineStyle: { color: chartAxisLine } },
  axisTick: { show: false }
}

export const valueAxisTheme = {
  axisLabel: { color: chartMutedText },
  nameTextStyle: { color: chartMutedText },
  axisLine: { show: false },
  splitLine: { lineStyle: { color: chartGridLine } }
}

export const dataZoomTheme = {
  textStyle: { color: chartMutedText }
}
