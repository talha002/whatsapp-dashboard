import { Component, type ReactNode } from 'react'
import { getLocale, translate } from '../lib/i18n'

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
    const locale = getLocale()
    return (
      <main className="status-page">
        <section className="card status-card">
          <h1>{translate(locale, 'errorBoundary.title')}</h1>
          <p>{this.state.message}</p>
          <p>{translate(locale, 'errorBoundary.body')}</p>
          <div className="form-actions">
            <button type="button" onClick={() => window.location.reload()}>
              {translate(locale, 'errorBoundary.reload')}
            </button>
            <button type="button" className="btn-primary" onClick={this.handleClearDocuments}>
              {translate(locale, 'errorBoundary.clearAndReload')}
            </button>
          </div>
        </section>
      </main>
    )
  }
}
