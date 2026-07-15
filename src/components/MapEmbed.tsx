export function MapEmbed({ src, title }: { src: string | null | undefined; title: string }) {
  if (!src) return null
  return (
    <div className="aspect-video w-full overflow-hidden rounded-2xl ring-1 ring-ink/10 sm:aspect-[21/9]">
      <iframe
        src={src}
        title={title}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="h-full w-full border-0"
        allowFullScreen
      />
    </div>
  )
}
