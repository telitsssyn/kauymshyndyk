import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { Arrow } from '@/components/Arrow'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { BrushHeading } from '@/components/BrushHeading'
import { PayloadImage } from '@/components/PayloadImage'
import { Link } from '@/i18n/navigation'
import { buildMetadata } from '@/lib/metadata'
import { getCourseLessons, getCourses } from '@/lib/queries'

export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('courses')
  return buildMetadata({
    href: '/courses',
    title: t('title'),
    description: t('subtitle'),
  })
}

export default async function CoursesPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  const [allCourses, t, tNav] = await Promise.all([
    getCourses(),
    getTranslations('courses'),
    getTranslations('nav'),
  ])

  // Курс без опубликованных уроков не показываем: пока уроки лежат в черновиках,
  // посетитель попал бы на пустую страницу
  const courses = (
    await Promise.all(
      allCourses.map(async (course) => ({
        course,
        lessonsCount: (await getCourseLessons(course.id)).length,
      })),
    )
  ).filter((item) => item.lessonsCount > 0 && item.course.slug)

  return (
    <div className="container-site py-10 sm:py-14">
      <Breadcrumbs
        items={[
          { href: '/', label: tNav('home') },
          { label: t('title') },
        ]}
      />

      <div className="max-w-3xl">
        <BrushHeading as="h1" className="text-4xl sm:text-5xl">
          {t('title')}
        </BrushHeading>
        <p className="mt-4 text-xl text-ink-soft">{t('subtitle')}</p>
      </div>

      {courses.length > 0 ? (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map(({ course, lessonsCount }) => (
            <article
              key={course.id}
              className="card relative flex flex-col transition-shadow hover:shadow-md"
            >
              {course.cover ? (
                <PayloadImage
                  media={course.cover}
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="aspect-video w-full object-cover"
                />
              ) : (
                <div aria-hidden="true" className="h-2 bg-blue-dark" />
              )}
              <div className="flex flex-1 flex-col gap-3 p-5">
                <span className="chip self-start">{t('lessonsCount', { count: lessonsCount })}</span>
                <h2 className="text-2xl">
                  <Link
                    href={{ pathname: '/courses/[course]', params: { course: course.slug! } }}
                    className="hover:text-blue-dark after:absolute after:inset-0 after:content-['']"
                  >
                    {course.title}
                  </Link>
                </h2>
                {course.description ? (
                  <p className="text-base text-ink-soft">{course.description}</p>
                ) : null}
                <span
                  aria-hidden="true"
                  className="mt-auto inline-flex items-center gap-1.5 pt-1 font-heading text-sm font-semibold uppercase tracking-wider text-blue-dark"
                >
                  <span>{t('openCourse')}</span>
                  <Arrow className="h-3.5 w-3.5" />
                </span>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="mt-10 max-w-3xl card p-8 sm:p-10 border border-ink/10 bg-paper">
          <div className="flex flex-col items-start gap-4">
            <span className="chip bg-blue-light/30 text-blue-dark font-medium">
              {t('comingSoonTitle')}
            </span>
            <p className="text-lg text-ink-soft leading-relaxed">{t('comingSoonDesc')}</p>

            <div className="mt-6 flex flex-wrap items-center gap-4">
              <Link href="/news" className="btn-primary inline-flex items-center gap-2">
                <span>{t('allNews')}</span>
                <Arrow className="h-4 w-4" />
              </Link>
              <Link href="/sermons" className="btn-outline inline-flex items-center gap-2">
                <span>{t('listenSermons')}</span>
                <Arrow className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
