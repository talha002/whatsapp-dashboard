import { useT } from '../lib/i18n'

export type AppTab = 'dashboard' | 'documents' | 'wordlists'

interface TabNavProps {
  active: AppTab
  onChange: (tab: AppTab) => void
}

export function TabNav({ active, onChange }: TabNavProps) {
  const t = useT()
  const tabs: { id: AppTab; label: string }[] = [
    { id: 'dashboard', label: t('tabs.dashboard') },
    { id: 'documents', label: t('tabs.documents') },
    { id: 'wordlists', label: t('tabs.wordlists') }
  ]
  return (
    <nav className="tab-nav">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className={tab.id === active ? 'active' : ''}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  )
}
