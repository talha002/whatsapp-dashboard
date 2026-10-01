import { useEffect, useMemo, useState } from 'react'
import type { ActivityMetric, ChatData, Filters, TokenizedMessage, WordBarMode } from './types'
import {
  ALL_MONTHS,
  ALL_SENDERS,
  ALL_YEARS,
  activitySeries,
  buildWordCountBar,
  filterMessages,
  summarize,
  topWords,
  withTokens,
  wordFrequency
} from './lib/stats'
import { activityHeatmap, conversationSessions, participantStyles } from './lib/analysis'
import { buildCooccurrenceNetwork } from './lib/cooccurrence'
import { ChartCard } from './components/ChartCard'
import { ChartFilters } from './components/ChartFilters'
import { SummaryCards } from './components/SummaryCards'
import { WordCloudChart } from './components/WordCloudChart'
import { WordCountBarChart } from './components/WordCountBarChart'
import { ActivityLineChart } from './components/ActivityLineChart'
import { TopWords } from './components/TopWords'
import { ActivityHeatmapChart } from './components/ActivityHeatmapChart'
import { ConversationSessionsCard } from './components/ConversationSessionsCard'
import { ParticipantStyleChart } from './components/ParticipantStyleChart'
import { ResponseTimeChart } from './components/ResponseTimeChart'
import { WordCooccurrenceNetwork } from './components/WordCooccurrenceNetwork'
import { TabNav, type AppTab } from './components/TabNav'
import { DocumentsSection } from './components/DocumentsSection'
import { WordListsSection } from './components/WordListsSection'
import { getDashboardStopwordSet, useWordListVersion } from './lib/wordlists'
import { listDocuments, mergeChatData, useDocumentsVersion } from './lib/documents'

const dataUrl = import.meta.env.VITE_DATA_URL || '/chat-data.json'
const appTitle = import.meta.env.VITE_APP_TITLE || 'whatsapp-dashboard'

type BarModeOption = WordBarMode | 'auto'

const createDefaultFilters = (): Filters => ({ year: ALL_YEARS, month: ALL_MONTHS, sender: ALL_SENDERS })

function useFilteredMessages(messages: TokenizedMessage[], filters: Filters) {
  return useMemo(() => filterMessages(messages, filters), [messages, filters])
}

export default function App() {
  const [data, setData] = useState<ChatData | null>(null)
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cloudFilters, setCloudFilters] = useState<Filters>(createDefaultFilters)
  const [topFilters, setTopFilters] = useState<Filters>(createDefaultFilters)
  const [networkFilters, setNetworkFilters] = useState<Filters>(createDefaultFilters)
  const [barFilters, setBarFilters] = useState<Filters>(createDefaultFilters)
  const [activityFilters, setActivityFilters] = useState<Filters>(createDefaultFilters)
  const [responseFilters, setResponseFilters] = useState<Filters>(createDefaultFilters)
  const [heatmapFilters, setHeatmapFilters] = useState<Filters>(createDefaultFilters)
  const [sessionFilters, setSessionFilters] = useState<Filters>(createDefaultFilters)
  const [styleFilters, setStyleFilters] = useState<Filters>(createDefaultFilters)
  const [barMode, setBarMode] = useState<BarModeOption>('auto')
  const [activityMetric, setActivityMetric] = useState<ActivityMetric>('messages')
  const [activeTab, setActiveTab] = useState<AppTab>('dashboard')
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null)
  const wordListVersion = useWordListVersion()
  const documentsVersion = useDocumentsVersion()

  useEffect(() => {
    document.title = appTitle
  }, [])

  useEffect(() => {
    let alive = true
    fetch(dataUrl)
      .then((response) => {
        if (response.status === 404) return null
        if (!response.ok) throw new Error(`Failed to load ${dataUrl}: ${response.status}`)
        const contentType = response.headers.get('content-type') || ''
        if (!contentType.includes('application/json')) return null
        return response.json() as Promise<ChatData>
      })
      .then((payload) => {
        if (!alive) return
        setData(payload)
        setLoaded(true)
      })
      .catch((cause: Error) => {
        if (alive) setError(cause.message)
      })
    return () => {
      alive = false
    }
  }, [])

  const documents = useMemo(() => listDocuments(), [documentsVersion])
  const selectedDoc = useMemo(
    () => documents.find((doc) => doc.id === selectedDocId) || null,
    [documents, selectedDocId]
  )
  const chatData = useMemo(
    () => (selectedDoc ? mergeChatData(null, [selectedDoc]) : mergeChatData(data, documents)),
    [data, documents, selectedDoc]
  )

  const dashboardStopwords = useMemo(() => getDashboardStopwordSet(), [wordListVersion])
  const tokenizedMessages = useMemo(
    () => (chatData ? withTokens(chatData.messages, dashboardStopwords) : []),
    [chatData, dashboardStopwords]
  )
  const overallSummary = useMemo(() => summarize(tokenizedMessages), [tokenizedMessages])

  const participantOptions = useMemo(() => {
    if (!chatData) return []
    const counts = new Map<string, number>()
    for (const message of tokenizedMessages) {
      counts.set(message.sender, (counts.get(message.sender) || 0) + 1)
    }
    return chatData.meta.participants.map((name) => ({ name, messages: counts.get(name) || 0 }))
  }, [chatData, tokenizedMessages])

  const cloudMessages = useFilteredMessages(tokenizedMessages, cloudFilters)
  const topMessages = useFilteredMessages(tokenizedMessages, topFilters)
  const networkMessages = useFilteredMessages(tokenizedMessages, networkFilters)
  const activityMessages = useFilteredMessages(tokenizedMessages, activityFilters)
  const responseMessages = useFilteredMessages(tokenizedMessages, responseFilters)
  const heatmapMessages = useFilteredMessages(tokenizedMessages, heatmapFilters)
  const sessionMessages = useFilteredMessages(tokenizedMessages, sessionFilters)
  const styleMessages = useFilteredMessages(tokenizedMessages, styleFilters)

  const cloudWords = useMemo(() => wordFrequency(cloudMessages), [cloudMessages])
  const top = useMemo(() => topWords(topMessages, 10), [topMessages])
  const networkData = useMemo(() => buildCooccurrenceNetwork(networkMessages), [networkMessages])

  const resolvedBarMode: WordBarMode =
    barMode === 'auto'
      ? barFilters.year === ALL_YEARS
        ? 'year'
        : barFilters.month === ALL_MONTHS
          ? 'month'
          : 'person'
      : barMode === 'month' && barFilters.year === ALL_YEARS
        ? 'year'
        : barMode

  const barData = useMemo(
    () =>
      chatData ? buildWordCountBar(chatData, tokenizedMessages, barFilters, resolvedBarMode) : { categories: [], series: [] },
    [chatData, tokenizedMessages, barFilters, resolvedBarMode]
  )

  const activityData = useMemo(
    () =>
      chatData ? activitySeries(chatData, activityMessages, activityFilters, activityMetric) : { categories: [], series: [] },
    [chatData, activityMessages, activityFilters, activityMetric]
  )
  const heatmapData = useMemo(() => activityHeatmap(heatmapMessages), [heatmapMessages])
  const sessionAnalysis = useMemo(() => conversationSessions(sessionMessages), [sessionMessages])
  const styleData = useMemo(() => participantStyles(styleMessages), [styleMessages])

  const yearRange =
    chatData && chatData.meta.years.length
      ? `${chatData.meta.years[0]}–${chatData.meta.years[chatData.meta.years.length - 1]}`
      : 'No parsed years'

  return (
    <div className="app">
      <header className="hero">
        <div>
          <p className="eyebrow">WhatsApp chat analytics</p>
          <h1>{appTitle}</h1>
          <p className="context">
            {chatData
              ? `Overall: ${yearRange} • ${chatData.meta.participants.join(', ')}`
              : 'Chat analytics & text analysis platform'}
          </p>
        </div>
        <TabNav active={activeTab} onChange={setActiveTab} />
      </header>

      {activeTab === 'documents' && <DocumentsSection selectedId={selectedDocId} onSelect={setSelectedDocId} />}
      {activeTab === 'wordlists' && <WordListsSection />}

      {error && !chatData && (
        <main className="status-page">
          <section className="card status-card">
            <h1>Dashboard data could not be loaded</h1>
            <p>{error}</p>
            <p>You can still upload and analyze text documents from the Documents tab.</p>
          </section>
        </main>
      )}

      {activeTab === 'dashboard' && !error && !loaded && !chatData && (
        <main className="status-page">
          <section className="card status-card">
            <h1>Loading chat analytics…</h1>
            <p>Reading dashboard data.</p>
          </section>
        </main>
      )}

      {activeTab === 'dashboard' && !error && loaded && !chatData && (
        <main className="status-page">
          <section className="card status-card">
            <h1>No data yet</h1>
            <p>Waiting for a chat history upload — add a document from the Documents tab to load the dashboard.</p>
          </section>
        </main>
      )}

      {activeTab === 'dashboard' && chatData && (
        <>
          {selectedDoc && (
            <div className="selection-banner">
              <span>
                Focused on document: <strong>{selectedDoc.title}</strong>
              </span>
              <button type="button" onClick={() => setSelectedDocId(null)}>
                Show all data
              </button>
            </div>
          )}
          <SummaryCards summary={overallSummary} />

      <main className="dashboard-grid">
        <ChartCard title="Word Cloud" subtitle="Independent filters for frequent cleaned words" className="span-6">
          <ChartFilters
            messages={tokenizedMessages}
            years={chatData.meta.years}
            participants={participantOptions}
            filters={cloudFilters}
            onChange={setCloudFilters}
          />
          <WordCloudChart words={cloudWords} />
        </ChartCard>

        <ChartCard title="Top 10 Words" subtitle="Independent person/year/month filters" className="span-6">
          <ChartFilters
            messages={tokenizedMessages}
            years={chatData.meta.years}
            participants={participantOptions}
            filters={topFilters}
            onChange={setTopFilters}
          />
          <TopWords words={top} />
        </ChartCard>

        <ChartCard title="Word Co-occurrence Network" subtitle="Top words linked when they appear close together" className="span-12">
          <ChartFilters
            messages={tokenizedMessages}
            years={chatData.meta.years}
            participants={participantOptions}
            filters={networkFilters}
            onChange={setNetworkFilters}
          />
          <WordCooccurrenceNetwork network={networkData} />
        </ChartCard>

        <ChartCard title="Word Counts" subtitle="Independent filters plus year/month/person comparison" className="span-6">
          <ChartFilters
            messages={tokenizedMessages}
            years={chatData.meta.years}
            participants={participantOptions}
            filters={barFilters}
            onChange={setBarFilters}
          />
          <WordCountBarChart
            data={barData}
            mode={barMode}
            canCompareByMonth={barFilters.year !== ALL_YEARS}
            onModeChange={setBarMode}
          />
        </ChartCard>

        <ChartCard title="Message Activity" subtitle="Independent filters with monthly per-participant lines" className="span-6">
          <ChartFilters
            messages={tokenizedMessages}
            years={chatData.meta.years}
            participants={participantOptions}
            filters={activityFilters}
            onChange={setActivityFilters}
          />
          <ActivityLineChart data={activityData} metric={activityMetric} onMetricChange={setActivityMetric} />
        </ChartCard>

        <ChartCard title="Response-Time Analysis" subtitle="Median reply gap by person, weekday, hour, or year" className="span-6">
          <ChartFilters
            messages={tokenizedMessages}
            years={chatData.meta.years}
            participants={participantOptions}
            filters={responseFilters}
            onChange={setResponseFilters}
          />
          <ResponseTimeChart messages={responseMessages} />
        </ChartCard>

        <ChartCard title="Weekday × Hour Heatmap" subtitle="When the conversation is active" className="span-6">
          <ChartFilters
            messages={tokenizedMessages}
            years={chatData.meta.years}
            participants={participantOptions}
            filters={heatmapFilters}
            onChange={setHeatmapFilters}
          />
          <ActivityHeatmapChart data={heatmapData} />
        </ChartCard>

        <ChartCard title="Conversation Sessions" subtitle="Sessions split after 3 hours of silence" className="span-6">
          <ChartFilters
            messages={tokenizedMessages}
            years={chatData.meta.years}
            participants={participantOptions}
            filters={sessionFilters}
            onChange={setSessionFilters}
          />
          <ConversationSessionsCard analysis={sessionAnalysis} />
        </ChartCard>

        <ChartCard title="Participant Style" subtitle="Length, vocabulary, questions, emoji, links, and placeholders" className="span-6">
          <ChartFilters
            messages={tokenizedMessages}
            years={chatData.meta.years}
            participants={participantOptions}
            filters={styleFilters}
            onChange={setStyleFilters}
          />
          <ParticipantStyleChart styles={styleData} />
        </ChartCard>
      </main>

      <footer className="footer">
        <span>Sources: {chatData.meta.sourceFiles.join(' • ')}</span>
        <span>
          Parsed {chatData.meta.totalMessages.toLocaleString('en')} messages • {chatData.meta.systemEvents} system events •{' '}
          {chatData.meta.continuationLines} continuation lines • {chatData.meta.placeholderMessages} placeholders
        </span>
      </footer>
        </>
      )}
    </div>
  )
}
