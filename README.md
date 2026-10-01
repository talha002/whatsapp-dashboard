# whatsapp-dashboard

An open-source dashboard for visualizing WhatsApp chat history (or any plain text) entirely in your browser. Upload a chat export as `.txt`, and explore word clouds, top words, co-occurrence networks, activity timelines, response-time analysis, and more.

No backend database, no accounts, no tracking — uploaded documents and all settings live in your browser's `localStorage`.

## Features

- **Document upload** — paste text or choose a `.txt` file. WhatsApp exports (`DD.MM.YYYY HH:MM - Sender: message`) are parsed into real messages with senders and timestamps; any other text is analyzed as line-based messages.
- **Nine platform languages** — English, Türkçe, Español, Français, Português, Deutsch, Italiano, Polski, and Română. The interface detects your browser language, and saves your dropdown choice.
- **Language-aware analysis** — select the text language per upload; its own general and chat stop-word lists apply, even when viewing several languages together. Changing the interface language does not change document analysis.
- **Editable word lists** — add/remove stop-words per language, restore defaults, and maintain a ban-word list excluded from every analysis.
- **Interactive dashboard** — word cloud, top 10 words, word co-occurrence network, word counts by year/month/person, message activity, response-time analysis, weekday × hour heatmap, conversation sessions, and participant style — each with independent year/month/person filters and fullscreen mode.
- **Focus mode** — click a saved document to focus the whole dashboard on just that document.
- **Privacy first** — everything runs client-side; your chat data never leaves the browser.

## Tech stack

- React 19 + TypeScript + Vite
- Apache ECharts (+ echarts-wordcloud)
- Plain CSS, no UI frameworks
- Tiny dependency-free Node static server for production (`scripts/serve.mjs`)

## Getting started

### Development

```sh
cd dashboard
npm install
npm run dev
```

Open http://localhost:5173

### Production (local)

```sh
cd dashboard
npm run build
npm start
```

Open http://localhost:8080

### Docker

```sh
docker compose up --build
```

Open http://localhost:8080 (override with `DASHBOARD_PORT=3000 docker compose up`).

## Usage

1. Export a WhatsApp chat (`Chat → More → Export chat → Without media`) or prepare any `.txt` file.
2. Open the **Documents** tab, paste the text or choose the file, select the text language, and save.
3. Switch to the **Dashboard** tab — all charts update instantly.
4. Click a document in the list to focus the dashboard on it; click again (or "Show all data") to return to the merged view.
5. Use the **Word Lists** tab to tune each language's stop-words and global ban-words; changes apply live to every chart.

The new stop-word lists include established language-specific collections and chat expressions. See [sources and normalization rules](dashboard/shared/stopwords/README.md). Untagged legacy datasets retain EN/TR filtering. Sample chats are available in English and Turkish.

Language regression checks: `cd dashboard && node scripts/regression-issue-13.mjs`.

## Configuration

Environment variables (see `dashboard/.env.example`):

| Variable | Default | Description |
|---|---|---|
| `VITE_APP_TITLE` | `whatsapp-dashboard` | Title shown in the header |
| `VITE_DATA_URL` | `/chat-data.json` | Optional static dataset URL (404/non-JSON is tolerated) |
| `VITE_PORT` | `5173` | Dev server port |
| `PORT` | `8080` | Production server port |
| `DASHBOARD_PORT` | `8080` | Host port in docker-compose |

## Project structure

```
├── Dockerfile, docker-compose.yml   # containerized production setup
└── dashboard/
    ├── scripts/serve.mjs            # production static server (no framework)
    ├── shared/                      # isomorphic text parsing/tokenizing (Node + browser)
    │   ├── parser.js                # WhatsApp export line parser
    │   ├── text.js                  # language-aware tokenization + chat stop-words
    │   └── stopwords/               # sourced ES/FR/PT/DE/IT/PL/RO lists + license
    └── src/
        ├── App.tsx                  # tabs, data flow, all chart state
        ├── lib/                     # stats, analysis, cooccurrence, documents, wordlists
        └── components/              # charts + Documents/WordLists sections
```

## Data & privacy

- Uploaded documents, custom stop-words, and ban-words are stored in `localStorage` (`wp:documents`, `wp:stopwords:*`, `wp:banwords`). Clearing browser storage deletes them.
- Optionally, a pre-generated `chat-data.json` placed next to `index.html` is loaded as a base dataset; uploaded documents are merged on top of it.

## License

MIT
