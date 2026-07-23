import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { BrushHeading } from '@/components/BrushHeading'
import { Link } from '@/i18n/navigation'
import { getSettings } from '@/lib/queries'

export const revalidate = 3600

const LAST_UPDATED = '18 июля 2026 года'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('legal')
  return { title: t('termsTitle') }
}

export default async function TermsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  const [settings, t] = await Promise.all([getSettings(), getTranslations('legal')])
  const churchName = settings?.churchName ?? 'Кауым-Церковь Шындык'

  return (
    <div className="container-site py-10 sm:py-14">
      <BrushHeading as="h1" className="text-3xl sm:text-5xl">
        {t('termsTitle')}
      </BrushHeading>
      <p className="mt-4 text-base text-ink-soft">{t('updated', { date: LAST_UPDATED })}</p>

      <div className="prose-church mt-8 max-w-3xl">
        <h2>1. О чём эта страница</h2>
        <p>
          Здесь описаны условия использования сайта церкви «{churchName}» (г. Павлодар).
          Пользуясь сайтом, вы соглашаетесь с этими условиями. Если что-то из написанного вам не
          подходит, пожалуйста, не используйте сайт.
        </p>

        <h2>2. Информация на сайте</h2>
        <p>
          Сайт носит информационный характер: мы рассказываем о жизни церкви, публикуем расписание
          богослужений, новости и записи проповедей. Расписание и анонсы могут меняться — перед
          визитом время можно уточнить по контактам на странице{' '}
          <Link href="/contacts">«Контакты»</Link>. Сведения на сайте не являются публичной
          офертой.
        </p>

        <h2>3. Пожертвования</h2>
        <p>
          Пожертвования — добровольные и безвозмездные, они направляются на служение церкви.
          Способы перевода указаны на странице <Link href="/donate">«Пожертвования»</Link>.
          Переводы обрабатываются платёжными организациями (Kaspi, банки) по их правилам — сайт
          платежи не принимает и платёжные данные не хранит.
        </p>

        <h2>4. Материалы сайта</h2>
        <p>
          Тексты, фотографии и логотип принадлежат церкви или используются с разрешения их
          авторов. Вы можете свободно делиться ссылками на страницы сайта. Если хотите перепечатать
          материалы (например, статью или фотографии) — напишите нам, мы почти всегда не против.
          Записи проповедей размещены на YouTube и используются по правилам этого сервиса.
        </p>

        <h2>5. Ссылки на другие сайты</h2>
        <p>
          На сайте есть ссылки на сторонние сервисы: Instagram, YouTube, 2ГИС, Kaspi и другие. Мы
          не управляем этими сервисами и не отвечаем за их содержимое и работу.
        </p>

        <h2>6. Работа сайта</h2>
        <p>
          Мы стараемся, чтобы сайт работал без сбоев и содержал точную информацию, но не можем
          гарантировать его непрерывную доступность и отсутствие ошибок. Сайт предоставляется «как
          есть».
        </p>

        <h2>7. Персональные данные</h2>
        <p>
          Как мы обращаемся со сведениями о посетителях, описано в{' '}
          <Link href="/privacy">Политике конфиденциальности</Link>.
        </p>

        <h2>8. Вопросы</h2>
        <p>
          Если у вас есть вопросы по этим условиям, свяжитесь с нами через страницу{' '}
          <Link href="/contacts">«Контакты»</Link>
          {settings?.email ? (
            <>
              {' '}
              или по почте <a href={`mailto:${settings.email}`}>{settings.email}</a>
            </>
          ) : null}
          .
        </p>
      </div>
    </div>
  )
}
