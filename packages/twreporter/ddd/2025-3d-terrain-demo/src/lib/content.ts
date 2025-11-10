import { createQuery } from '@tanstack/svelte-query'
import archieml from 'archieml'

export async function getDoc() {
  const docsId = '161tO0T2cmU4jb6VI8RCaIM1MPxCNH4mXMv2_Mz6DmF0'

  const response = await fetch(
    `https://docs.google.com/document/d/${docsId}/export?format=txt`,
    {
      method: 'GET',
    }
  )

  if (!response.ok) {
    throw new Error('Failed to fetch doc')
  }

  const doc = await response.text()
  return doc
}

export type Card = {
  name: string
  title?: string
  camera: string
  contents?: string[]
  style?: 'fullscreen' | 'right'
  video?: string
  audio?: string
  embed?: string
}

export type Content = {
  tiles: string[]
  cards: Card[]
  start?: string
  vectors: string[]
}

export async function getContent() {
  const doc = await getDoc()

  const content = archieml.load<Content>(doc)

  return content
}

export const queryContent = () =>
  createQuery(() => ({
    queryKey: ['content'],
    queryFn: getContent,
  }))

export function getCard({
  content,
  name,
}: {
  content: Content
  name: string | null
}) {
  if (!name) {
    return null
  }

  return content.cards.find((card) => card.name === name)
}

export function parseCamera(camera: string) {
  const [position, orientation] = camera.split('|')
  const positionValues = position
    .replace('(', '')
    .replace(')', '')
    .split(',')
    .map((v) => parseFloat(v.trim()))
  const orientationValues = orientation
    .split(';')
    .map((v) => parseFloat(v.trim()))
  return {
    position: {
      x: positionValues[0],
      y: positionValues[1],
      z: positionValues[2],
    },
    orientation: {
      heading: orientationValues[0],
      pitch: orientationValues[1],
      roll: orientationValues[2],
    },
  }
}
