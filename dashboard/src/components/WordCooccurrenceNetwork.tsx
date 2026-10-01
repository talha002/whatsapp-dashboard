import type { CooccurrenceNetwork } from '../lib/cooccurrence'
import { CHART_COLORS, chartMutedText, chartText, tooltipTheme } from '../lib/chartTheme'
import { escapeHtml } from '../../shared/text.js'
import { EChart } from './EChart'
import { EmptyState } from './EmptyState'

interface WordCooccurrenceNetworkProps {
  network: CooccurrenceNetwork
}

export function WordCooccurrenceNetwork({ network }: WordCooccurrenceNetworkProps) {
  if (network.nodes.length === 0 || network.links.length === 0) {
    return <EmptyState message="No word co-occurrence network for the current filters." />
  }

  const nodes = network.nodes.map((node, index) => ({
    ...node,
    itemStyle: { color: CHART_COLORS[index % CHART_COLORS.length] }
  }))
  const links = network.links.map((link) => ({
    source: link.source,
    target: link.target,
    value: link.value,
    lineStyle: { width: link.width }
  }))

  return (
    <div className="chart-with-toolbar">
      <div className="chart-toolbar split">
        <span style={{ color: chartMutedText }}>
          {network.nodes.length} nodes • {network.links.length} edges • window ≤ 2 tokens • min edge count 2
        </span>
      </div>
      <EChart
        height={560}
        option={{
          textStyle: { color: chartText },
          tooltip: {
            ...tooltipTheme,
            formatter: (params: any) => {
              if (params.dataType === 'edge') {
                const data = params.data as { source: string; target: string; value: number }
                return `${escapeHtml(data.source)} ↔ ${escapeHtml(data.target)}<br/>Co-occurrences: ${data.value.toLocaleString('en')}`
              }
              const data = params.data as { name: string; value: number }
              return `<strong>${escapeHtml(data.name)}</strong><br/>Frequency: ${data.value.toLocaleString('en')}`
            }
          },
          series: [
            {
              type: 'graph',
              layout: 'force',
              roam: true,
              draggable: true,
              focusNodeAdjacency: true,
              data: nodes,
              links,
              edgeSymbol: ['none', 'none'],
              label: {
                show: true,
                color: chartText,
                fontSize: 11,
                formatter: '{b}'
              },
              lineStyle: {
                color: 'rgba(148, 163, 184, 0.58)',
                curveness: 0.12
              },
              force: {
                repulsion: 240,
                edgeLength: [42, 130],
                gravity: 0.08,
                friction: 0.18
              },
              emphasis: {
                focus: 'adjacency',
                lineStyle: { opacity: 0.95 },
                label: { show: true, fontWeight: 800 }
              }
            }
          ]
        }}
      />
    </div>
  )
}
