export type AppTab = 'dashboard' | 'documents' | 'wordlists'

const TABS: { id: AppTab; label: string }[] = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'documents', label: 'Documents' },
  { id: 'wordlists', label: 'Word Lists' }
]

interface TabNavProps {
  active: AppTab
  onChange: (tab: AppTab) => void
}

export function TabNav({ active, onChange }: TabNavProps) {
  return (
    <nav className="tab-nav">
      {TABS.map((tab) => (
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
