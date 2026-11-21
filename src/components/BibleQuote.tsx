import { Link } from '@/i18n/navigation'
import { parseBibleRef } from '@/lib/bibleRef'

// Цитата из Писания в тексте урока: сам стих и ссылка, которая открывает
// главу в разделе «Библия» и прокручивает к нужному стиху.
export function BibleQuote({ text, reference }: { text: string; reference: string }) {
  const ref = parseBibleRef(reference)

  return (
    <figure className="my-6 rounded-2xl border-l-4 border-blue bg-ice-soft px-5 py-4 sm:px-6 sm:py-5">
      {/* border-0/pl-0/not-italic — перебиваем общий стиль blockquote из .prose-church */}
      <blockquote className="whitespace-pre-line border-0 pl-0 text-lg not-italic leading-relaxed text-ink">
        {text}
      </blockquote>
      <figcaption className="mt-2 text-right font-heading text-base font-semibold tracking-wide text-blue-dark">
        {ref ? (
          <Link
            href={{
              pathname: '/bible/[book]/[chapter]',
              params: { book: ref.book, chapter: String(ref.chapter) },
              hash: ref.verse ? `v${ref.verse}` : undefined,
            }}
            className="no-underline hover:underline"
          >
            {reference}
          </Link>
        ) : (
          reference
        )}
      </figcaption>
    </figure>
  )
}
