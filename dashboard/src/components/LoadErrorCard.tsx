import { useT } from '../lib/i18n'

interface LoadErrorCardProps {
  error: string
  onGoToDocuments: () => void
}

export function LoadErrorCard({ error, onGoToDocuments }: LoadErrorCardProps) {
  const t = useT()
  return (
    <main className="status-page">
      <section className="card status-card">
        <h1>{t('status.loadErrorTitle')}</h1>
        <p>{error}</p>
        <p>{t('status.loadErrorHint')}</p>
        <div className="welcome-actions">
          <button type="button" className="btn-primary" onClick={onGoToDocuments}>
            {t('status.loadErrorAction')}
          </button>
        </div>
      </section>
    </main>
  )
}
