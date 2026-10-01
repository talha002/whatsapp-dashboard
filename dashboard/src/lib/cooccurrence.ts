import type { TokenizedMessage } from '../types'

export interface CooccurrenceNode {
  name: string
  value: number
  symbolSize: number
}

export interface CooccurrenceLink {
  source: string
  target: string
  value: number
  width: number
}

export interface CooccurrenceNetwork {
  nodes: CooccurrenceNode[]
  links: CooccurrenceLink[]
  totalTokens: number
  consideredMessages: number
}

const MAX_NODES = 60
const MAX_LINKS = 140
const MIN_EDGE_COUNT = 2
const WINDOW_DISTANCE = 2

export function buildCooccurrenceNetwork(messages: TokenizedMessage[]): CooccurrenceNetwork {
  const frequency = new Map<string, number>()
  let totalTokens = 0
  let consideredMessages = 0

  for (const message of messages) {
    if (message.tokens.length === 0) continue
    consideredMessages += 1
    totalTokens += message.tokens.length
    for (const token of message.tokens) {
      frequency.set(token, (frequency.get(token) || 0) + 1)
    }
  }

  const topNodes = [...frequency.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'tr'))
    .slice(0, MAX_NODES)

  const allowed = new Set(topNodes.map(([name]) => name))
  const edges = new Map<string, number>()

  for (const message of messages) {
    const tokens = message.tokens.filter((token) => allowed.has(token))
    if (tokens.length < 2) continue

    for (let left = 0; left < tokens.length; left += 1) {
      const maxRight = Math.min(tokens.length - 1, left + WINDOW_DISTANCE)
      for (let right = left + 1; right <= maxRight; right += 1) {
        const source = tokens[left]
        const target = tokens[right]
        if (source === target) continue
        const key = source < target ? `${source}|||${target}` : `${target}|||${source}`
        edges.set(key, (edges.get(key) || 0) + 1)
      }
    }
  }

  const links = [...edges.entries()]
    .map(([key, value]) => {
      const [source, target] = key.split('|||')
      return { source, target, value }
    })
    .filter((link) => link.value >= MIN_EDGE_COUNT)
    .sort((a, b) => b.value - a.value || a.source.localeCompare(b.source, 'tr') || a.target.localeCompare(b.target, 'tr'))
    .slice(0, MAX_LINKS)
    .map((link) => ({
      ...link,
      width: Math.min(9, 1 + Math.sqrt(link.value) * 1.35)
    }))

  if (links.length === 0) {
    return { nodes: [], links: [], totalTokens, consideredMessages }
  }

  const used = new Set<string>()
  for (const link of links) {
    used.add(link.source)
    used.add(link.target)
  }

  const maxFrequency = topNodes[0]?.[1] || 1
  const nodes = topNodes
    .filter(([name]) => used.has(name))
    .map(([name, value]) => ({
      name,
      value,
      symbolSize: Math.min(46, 10 + Math.sqrt(value / maxFrequency) * 34)
    }))

  return { nodes, links, totalTokens, consideredMessages }
}
