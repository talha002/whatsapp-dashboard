import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { useT } from '../lib/i18n'

interface ChartCardProps {
  title: string
  subtitle: string
  className?: string
  children: ReactNode
}

export function ChartCard({ title, subtitle, className = '', children }: ChartCardProps) {
  const t = useT()
  const cardRef = useRef<HTMLElement | null>(null)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    const onFullscreenChange = () => setExpanded(document.fullscreenElement === cardRef.current)
    document.addEventListener('fullscreenchange', onFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange)
  }, [])

  const toggleFullscreen = async () => {
    const card = cardRef.current
    if (!card) return
    if (document.fullscreenElement === card) {
      await document.exitFullscreen()
    } else {
      await card.requestFullscreen()
    }
  }

  return (
    <section ref={cardRef} className={`card chart-card ${className}`}>
      <div className="card-head">
        <div>
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>
        <button
          type="button"
          className="icon-button"
          aria-label={t(expanded ? 'charts.exitFullscreen' : 'charts.expand')}
          title={t(expanded ? 'charts.exitFullscreen' : 'charts.expand')}
          onClick={() => {
            void toggleFullscreen()
          }}
        >
          {expanded ? '⤡' : '⤢'}
        </button>
      </div>
      {children}
    </section>
  )
}
