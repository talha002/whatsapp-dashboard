import { useLocale, useT } from '../lib/i18n'
import { saveDocument } from '../lib/documents'
import { getSampleChat } from '../lib/sampleData'

interface WelcomePanelProps {
  onUploadClick: () => void
}

export function WelcomePanel({ onUploadClick }: WelcomePanelProps) {
  const locale = useLocale()
  const t = useT()

  const handleLoadSample = () => {
    const sample = getSampleChat(locale)
    saveDocument({ title: sample.title, language: sample.language, content: sample.content, source: 'paste' })
  }

  return (
    <main className="status-page">
      <section className="card status-card welcome-panel">
        <h1>{t('onboarding.title')}</h1>
        <p>{t('onboarding.intro')}</p>
        <ul className="welcome-tabs">
          <li>{t('onboarding.tabDashboard')}</li>
          <li>{t('onboarding.tabDocuments')}</li>
          <li>{t('onboarding.tabWordlists')}</li>
        </ul>
        <div className="welcome-actions">
          <button type="button" className="btn-primary" onClick={handleLoadSample}>
            {t('onboarding.loadSample')}
          </button>
          <button type="button" className="btn-secondary" onClick={onUploadClick}>
            {t('onboarding.uploadOwn')}
          </button>
        </div>
      </section>
    </main>
  )
}
