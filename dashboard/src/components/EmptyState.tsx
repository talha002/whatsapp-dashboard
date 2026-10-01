interface EmptyStateProps {
  message?: string
}

export function EmptyState({ message = 'No data for the current filters.' }: EmptyStateProps) {
  return <div className="empty-state">{message}</div>
}
