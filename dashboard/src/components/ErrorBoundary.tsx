import { Component, type ReactNode } from 'react'

interface ErrorBoundaryState {
  message: string | null
}

export class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { message: null }

  static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    return { message: error instanceof Error ? error.message : String(error) }
  }

  componentDidCatch(error: unknown) {
    console.error('Dashboard render failed:', error)
  }

  handleClearDocuments = () => {
    try {
      localStorage.removeItem('wp:documents')
    } catch {}
    window.location.reload()
  }

  render() {
    if (!this.state.message) return this.props.children
    return (
      <main className="status-page">
        <section className="card status-card">
          <h1>Something went wrong</h1>
          <p>{this.state.message}</p>
          <p>
            A saved document may be causing this error. You can reload the page, or delete all saved documents and reload
            (this cannot be undone).
          </p>
          <div className="form-actions">
            <button type="button" onClick={() => window.location.reload()}>
              Reload
            </button>
            <button type="button" className="btn-primary" onClick={this.handleClearDocuments}>
              Delete saved documents & reload
            </button>
          </div>
        </section>
      </main>
    )
  }
}
