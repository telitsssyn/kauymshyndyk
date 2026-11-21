import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'

import { Arrow } from '@/components/Arrow'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { BrushHeading } from '@/components/BrushHeading'
import { PayloadImage } from '@/components/PayloadImage'
import { Link } from '@/i18n/navigation'
import { buildMetadata } from '@/lib/metadata'
import { getCourseBySlug, getCourseLessons } from '@/lib/queries'

// Рендер на каждый запрос: на момент первой сборки таблица курсов пуста,
// и Next с revalidate + generateStaticParams счёл бы маршрут статическим —
// на проде такие страницы падали с DYNAMIC_SERVER_USAGE (см. коммит 10b478f).
export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; course: string }>
}): Promise<Metadata> {
  const { course: slug } = await params
  const course = await getCourseBySlug(slug)
  if (!course) return {}

  return buildMetadata({
    href: { pathname: '/courses/[course]', params: { course: slug } },
    title: course.title,
    description: course.description ?? undefined,
    image: course.cover,
  })
}

export default async function CoursePage({
  params,
}: {
  params: Promise<{ locale: string; course: string }>
}) {
  const { locale, course: slug } = await params
  setRequestLocale(locale)

  const [course, t, tNav] = await Promise.all([
    getCourseBySlug(slug),
    getTranslations('courses'),
    getTranslations('nav'),
  ])
  if (!course) notFound()

  const lessons = await getCourseLessons(course.id)
  const lessonHref = (number: number) => ({
    pathname: '/courses/[course]/[lesson]' as const,
    params: { course: slug, lesson: String(number) },
  })

  return (
    <div className="container-site max-w-4xl py-10 sm:py-14">
      <Breadcrumbs
        items={[
          { href: '/', label: tNav('home') },
          { href: '/courses', label: t('title') },
          { label: course.title },
        ]}
      />

      {course.cover ? (
        <PayloadImage
          media={course.cover}
          sizes="(min-width: 896px) 896px, 100vw"
          priority
          className="mb-8 aspect-video w-full rounded-2xl object-cover"
        />
      ) : null}

      <BrushHeading as="h1" className="text-4xl sm:text-5xl">
        {course.title}
      </BrushHeading>
      {course.description ? (
        <p className="mt-4 max-w-3xl text-xl text-ink-soft">{course.description}</p>
      ) : null}

      {lessons.length > 0 ? (
        <>
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <Link href={lessonHref(lessons[0].number)} className="btn-primary">
              <span>{t('startCourse')}</span>
              <Arrow />
            </Link>
            <span className="chip">{t('lessonsCount', { count: lessons.length })}</span>
          </div>

          <h2 className="mt-12 text-2xl sm:text-3xl">{t('lessonsTitle')}</h2>
          <ol className="mt-5 space-y-3">
            {lessons.map((lesson) => (
              <li key={lesson.id}>
                <Link
                  href={lessonHref(lesson.number)}
                  className="card group flex items-center gap-4 p-4 transition-shadow hover:shadow-md sm:p-5"
                >
                  <span
                    aria-hidden="true"
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-ice font-heading text-xl font-semibold text-blue-dark group-hover:bg-blue-dark group-hover:text-white"
                  >
                    {lesson.number}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-heading text-xl font-semibold uppercase tracking-wide">
                      <span className="sr-only">{t('lessonLabel', { number: lesson.number })}. </span>
                      {lesson.title}
                    </span>
                    {lesson.subtitle ? (
                      <span className="block text-base text-ink-soft">{lesson.subtitle}</span>
                    ) : null}
                  </span>
                  {lesson.youtubeUrl ? (
                    <span className="chip hidden shrink-0 sm:inline-flex">{t('withVideo')}</span>
                  ) : null}
                  <Arrow className="h-4 w-4 shrink-0 text-blue-dark" />
                </Link>
              </li>
            ))}
          </ol>
          <p className="mt-6 text-base text-ink-soft">{t('moreSoon')}</p>
        </>
      ) : (
        <p className="mt-8 text-lg text-ink-soft">{t('noLessons')}</p>
      )}
    </div>
  )
}
