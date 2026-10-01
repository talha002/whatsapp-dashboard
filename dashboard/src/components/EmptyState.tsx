import { useT } from '../lib/i18n'

interface EmptyStateProps {
  message?: string
}

export function EmptyState({ message }: EmptyStateProps) {
  const t = useT()
  return <div className="empty-state">{message ?? t('empty.default')}</div>
}
