import { useLocale, useT, type MessageKey } from '../lib/i18n'
import { saveDocument } from '../lib/documents'
import { getSampleChat } from '../lib/sampleData'
import type { AppTab } from './TabNav'

export const WELCOME_TAB_TARGETS: { tab: AppTab; key: MessageKey }[] = [
  { tab: 'dashboard', key: 'onboarding.tabDashboard' },
  { tab: 'documents', key: 'onboarding.tabDocuments' },
  { tab: 'wordlists', key: 'onboarding.tabWordlists' }
]

interface WelcomePanelProps {
  onNavigate: (tab: AppTab) => void
}

export function WelcomePanel({ onNavigate }: WelcomePanelProps) {
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
          {WELCOME_TAB_TARGETS.map((target) => (
            <li key={target.tab}>
              <button type="button" className="welcome-tab-link" onClick={() => onNavigate(target.tab)}>
                {t(target.key)}
              </button>
            </li>
          ))}
        </ul>
        <div className="welcome-actions">
          <button type="button" className="btn-primary" onClick={handleLoadSample}>
            {t('onboarding.loadSample')}
          </button>
          <button type="button" className="btn-secondary" onClick={() => onNavigate('documents')}>
            {t('onboarding.uploadOwn')}
          </button>
        </div>
      </section>
    </main>
  )
}
