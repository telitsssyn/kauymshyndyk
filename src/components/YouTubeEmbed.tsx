import { extractVideoId } from '@/lib/youtube'

export function YouTubeEmbed({ url, caption }: { url: string; caption?: string | null }) {
  const id = extractVideoId(url)
  if (!id) return null

  return (
    <figure className="my-6">
      <div className="aspect-video overflow-hidden rounded-2xl bg-ink">
        <iframe
          src={`https://www.youtube.com/embed/${id}?rel=0`}
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
