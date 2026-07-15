const extractVideoId = (url: string): string | null => {
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

export function YouTubeEmbed({ url, caption }: { url: string; caption?: string | null }) {
  const id = extractVideoId(url)
  if (!id) return null

  return (
    <figure className="my-6">
      <div className="aspect-video overflow-hidden rounded-2xl bg-ink">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${id}`}
          title={caption || 'YouTube'}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="h-full w-full border-0"
        />
      </div>
      {caption ? (
        <figcaption className="mt-2 text-base text-ink-soft">{caption}</figcaption>
      ) : null}
    </figure>
  )
}
