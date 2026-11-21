import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'

import { Arrow } from '@/components/Arrow'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { PayloadImage } from '@/components/PayloadImage'
import { RichText } from '@/components/RichText'
import { YouTubeEmbed } from '@/components/YouTubeEmbed'
import { Link } from '@/i18n/navigation'
import { buildMetadata } from '@/lib/metadata'
import { getCourseBySlug, getCourseLessons, getLesson, getSettings } from '@/lib/queries'
import { richTextToPlain } from '@/lib/richtext'
import { extractVideoId, youtubeThumbnail } from '@/lib/youtube'

// См. комментарий на странице курса: при пустой таблице на первой сборке
// статический рендер падает на проде, поэтому рендерим на каждый запрос.
export const dynamic = 'force-dynamic'

type Params = Promise<{ locale: string; course: string; lesson: string }>

// Адрес урока — его номер: /kursy/vozrozhdennaya-zhizn/3
const parseNumber = (value: string): number | null =>
  /^\d{1,4}$/.test(value) ? Number(value) : null

const loadLesson = async (courseSlug: string, lessonParam: string) => {
  const number = parseNumber(lessonParam)
  if (number === null) return null
  const course = await getCourseBySlug(courseSlug)
  if (!course) return null
  const lesson = await getLesson(course.id, number)
  return lesson ? { course, lesson } : null
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { course: courseSlug, lesson: lessonParam } = await params
  const found = await loadLesson(courseSlug, lessonParam)
  if (!found) return {}
  const { course, lesson } = found

  const videoId = lesson.youtubeUrl ? extractVideoId(lesson.youtubeUrl) : null
  const heading = lesson.subtitle ? `${lesson.title}. ${lesson.subtitle}` : lesson.title

  return buildMetadata({
    href: {
      pathname: '/courses/[course]/[lesson]',
      params: { course: courseSlug, lesson: lessonParam },
    },
    title: `${heading} — ${course.title}`,
    description: richTextToPlain(lesson.content),
    image: videoId ? youtubeThumbnail(videoId) : (lesson.cover ?? course.cover),
    type: 'article',
  })
}

export default async function LessonPage({ params }: { params: Params }) {
  const { locale, course: courseSlug, lesson: lessonParam } = await params
  setRequestLocale(locale)

  const [found, settings, t, tNav] = await Promise.all([
    loadLesson(courseSlug, lessonParam),
    getSettings(),
    getTranslations('courses'),
    getTranslations('nav'),
  ])
  if (!found) notFound()
  const { course, lesson } = found

  const lessons = await getCourseLessons(course.id)
  const index = lessons.findIndex((item) => item.id === lesson.id)
  const prev = index > 0 ? lessons[index - 1] : null
  const next = index >= 0 && index < lessons.length - 1 ? lessons[index + 1] : null

  const lessonHref = (number: number) => ({
    pathname: '/courses/[course]/[lesson]' as const,
    params: { course: courseSlug, lesson: String(number) },
  })
  const courseHref = { pathname: '/courses/[course]' as const, params: { course: courseSlug } }

  return (
    <article className="container-site max-w-3xl py-10 sm:py-14">
      <Breadcrumbs
        items={[
          { href: '/', label: tNav('home') },
          { href: '/courses', label: t('title') },
          { href: courseHref, label: course.title },
          { label: lesson.title },
        ]}
      />

      <div className="flex flex-wrap items-center gap-2">
        <Link href={courseHref} className="chip bg-navy text-white hover:bg-ink">
          {course.title}
        </Link>
        {lesson.number > 0 ? (
          <span className="chip">{t('lessonLabel', { number: lesson.number })}</span>
        ) : null}
      </div>

      <h1 className="mt-5 text-4xl sm:text-5xl">{lesson.title}</h1>
      {lesson.subtitle ? (
        <p className="mt-2 font-heading text-2xl font-semibold uppercase tracking-wide text-blue-dark sm:text-3xl">
          {lesson.subtitle}
        </p>
      ) : null}

      {lesson.youtubeUrl && extractVideoId(lesson.youtubeUrl) ? (
        <div className="mt-8">
          <YouTubeEmbed url={lesson.youtubeUrl} />
        </div>
      ) : lesson.cover && typeof lesson.cover === 'object' ? (
        // Видео ещё нет — показываем превью, как у анонсов проповедей
        <div className="mt-8">
          <PayloadImage
            media={lesson.cover}
            uncropped
            sizes="(min-width: 768px) 720px, 100vw"
            priority
            className="h-auto w-full rounded-2xl"
          />
          <div className="mt-4 flex flex-col items-start gap-4 rounded-2xl bg-ice-soft p-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-lg">{t('videoSoon')}</p>
            {settings?.youtube ? (
              <a
                href={settings.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary shrink-0"
              >
                {t('youtubeChannel')}
              </a>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className="mt-8">
        <RichText data={lesson.content} />
      </div>

      {lesson.homework ? (
        <section className="mt-12 rounded-2xl border-2 border-blue-dark/20 bg-white p-6 sm:p-8">
          <h2 className="text-2xl sm:text-3xl">{t('homework')}</h2>
          <div className="mt-4">
            <RichText data={lesson.homework} />
          </div>
        </section>
      ) : null}

      <nav
        aria-label={t('lessonsTitle')}
        className="mt-12 grid gap-3 border-t border-ink/10 pt-8 sm:grid-cols-2"
      >
        {prev ? (
          <Link
            href={lessonHref(prev.number)}
            className="card group flex items-center gap-3 p-4 transition-shadow hover:shadow-md"
          >
            <Arrow direction="left" className="h-4 w-4 shrink-0 text-blue-dark" />
            <span className="min-w-0">
              <span className="block text-sm text-ink-soft">{t('prevLesson')}</span>
              <span className="block font-heading text-lg font-semibold uppercase tracking-wide">
                {prev.title}
              </span>
            </span>
          </Link>
        ) : (
          <span className="hidden sm:block" />
        )}
        {next ? (
          <Link
            href={lessonHref(next.number)}
            className="card group flex items-center justify-end gap-3 p-4 text-right transition-shadow hover:shadow-md"
          >
            <span className="min-w-0">
              <span className="block text-sm text-ink-soft">{t('nextLesson')}</span>
              <span className="block font-heading text-lg font-semibold uppercase tracking-wide">
                {next.title}
              </span>
            </span>
            <Arrow className="h-4 w-4 shrink-0 text-blue-dark" />
          </Link>
        ) : (
          <p className="self-center text-base text-ink-soft sm:text-right">{t('lastLessonNote')}</p>
        )}
      </nav>

      <div className="mt-6">
        <Link href={courseHref} className="group btn-outline inline-flex items-center gap-2">
          <Arrow direction="left" />
          <span>{t('backToCourse')}</span>
        </Link>
      </div>
    </article>
  )
}
