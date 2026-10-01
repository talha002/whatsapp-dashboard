import { useT, type MessageKey } from '../lib/i18n'

export type AppTab = 'dashboard' | 'documents' | 'wordlists'

export const TAB_TARGETS: { id: AppTab; labelKey: MessageKey; hintKey: MessageKey }[] = [
  { id: 'dashboard', labelKey: 'tabs.dashboard', hintKey: 'tabs.dashboardHint' },
  { id: 'documents', labelKey: 'tabs.documents', hintKey: 'tabs.documentsHint' },
  { id: 'wordlists', labelKey: 'tabs.wordlists', hintKey: 'tabs.wordlistsHint' }
]

interface TabNavProps {
  active: AppTab
  onChange: (tab: AppTab) => void
}

export function TabNav({ active, onChange }: TabNavProps) {
  const t = useT()
  return (
    <nav className="tab-nav">
      {TAB_TARGETS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className={tab.id === active ? 'active' : ''}
          onClick={() => onChange(tab.id)}
        >
          <span className="tab-label">{t(tab.labelKey)}</span>
          <span className="tab-hint">{t(tab.hintKey)}</span>
        </button>
      ))}
    </nav>
  )
}
