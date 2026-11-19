const photos = import.meta.glob<string>('./assets/candidate/*.png', {
  eager: true,
  query: '?url&no-inline',
  import: 'default',
})

export function resolveCandidatePhoto(source: string): string {
  return photos[`./assets/candidate/${source}`] ?? source
}
