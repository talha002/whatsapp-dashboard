import { useEffect, useRef } from 'react'
import * as echarts from 'echarts'

interface EChartProps {
  option: Record<string, unknown>
  height?: number
}

export function EChart({ option, height = 360 }: EChartProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const element = containerRef.current
    if (!element) return

    const chart = echarts.init(element)
    chart.setOption(option, true)

    const resize = () => chart.resize()
    const observer = new ResizeObserver(resize)
    observer.observe(element)
    window.addEventListener('resize', resize)

    return () => {
      observer.disconnect()
      window.removeEventListener('resize', resize)
      chart.dispose()
    }
  }, [option])

  return <div ref={containerRef} data-chart-root="" style={{ width: '100%', height }} />
}
