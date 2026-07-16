import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { BrushHeading } from '@/components/BrushHeading'
import { PayloadImage } from '@/components/PayloadImage'
import { RichText } from '@/components/RichText'
import { getAboutPage, getGallery, getMinisters } from '@/lib/queries'

export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('about')
  return { title: t('title') }
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  const [about, ministers, gallery, t] = await Promise.all([
    getAboutPage(),
    getMinisters(),
    getGallery(),
    getTranslations('about'),
  ])

  return (
    <div className="container-site py-10 sm:py-14">
      <BrushHeading as="h1" className="text-4xl sm:text-5xl">
        {t('title')}
      </BrushHeading>

      {about?.coverImage && typeof about.coverImage === 'object' ? (
        <div className="mt-8">
          <PayloadImage
            media={about.coverImage}
            sizes="(min-width: 1152px) 1152px, 100vw"
            priority
            className="aspect-[21/9] w-full rounded-3xl object-cover"
          />
        </div>
      ) : null}

      {about?.history ? (
        <section className="mt-12 max-w-3xl">
          <h2 className="text-3xl">{t('historyTitle')}</h2>
          <div className="mt-6">
            <RichText data={about.history} />
          </div>
        </section>
      ) : null}

      {ministers.length > 0 ? (
        <section className="mt-14">
          <BrushHeading as="h2" className="text-3xl sm:text-4xl">
            {t('ministersTitle')}
          </BrushHeading>
          <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {ministers.map((minister) => (
              <li key={minister.id} className="card p-6 text-center">
                {minister.photo && typeof minister.photo === 'object' ? (
                  <PayloadImage
                    media={minister.photo}
                    sizes="(min-width: 640px) 200px, 40vw"
                    className="mx-auto h-40 w-40 rounded-full object-cover"
                  />
                ) : null}
                <h3 className="mt-5 text-xl normal-case tracking-normal">{minister.name}</h3>
                <p className="mt-1 font-heading text-sm font-semibold uppercase tracking-wider text-blue-dark">
                  {minister.role}
                </p>
                {minister.bio ? (
                  <div className="mt-3 text-left text-base">
                    <RichText data={minister.bio} className="text-ink-soft" />
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {gallery.length > 0 ? (
        <section className="mt-14">
          <BrushHeading as="h2" className="text-3xl sm:text-4xl">
            {t('galleryTitle')}
          </BrushHeading>
          <ul className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
            {gallery.map((item) => (
              <li key={item.id}>
                <figure>
                  {item.image && typeof item.image === 'object' ? (
                    <PayloadImage
                      media={item.image}
                      sizes="(min-width: 640px) 33vw, 50vw"
                      className="aspect-[4/3] w-full rounded-2xl object-cover"
                    />
                  ) : null}
                  {item.caption ? (
                    <figcaption className="mt-2 text-base text-ink-soft">{item.caption}</figcaption>
                  ) : null}
                </figure>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  )
}
