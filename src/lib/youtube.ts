export const extractVideoId = (url: string): string | null => {
  const patterns = [
    /youtube\.com\/watch\?(?:.*&)?v=([\w-]{6,})/,
    /youtu\.be\/([\w-]{6,})/,
    /youtube\.com\/(?:shorts|live|embed)\/([\w-]{6,})/,
  ]
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }
  return null
}

// Обложка видео с серверов YouTube: hqdefault (480×360) есть у любого ролика
export const youtubeThumbnail = (videoId: string) =>
  `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
