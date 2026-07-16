import 'dotenv/config'

import { getPayload } from 'payload'
import sharp from 'sharp'

import config from '../payload.config'

// Заполняет пустую базу нейтральными заглушками, чтобы сайт можно было
// посмотреть и проверить вёрстку до того, как контент-менеджер внесёт
// настоящие тексты. Повторный запуск ничего не дублирует.

const textToLexical = (...paragraphs: string[]) =>
  ({
    root: {
      type: 'root',
      format: '',
      indent: 0,
      version: 1,
      direction: 'ltr',
      children: paragraphs.map((text) => ({
        type: 'paragraph',
        format: '',
        indent: 0,
        version: 1,
        direction: 'ltr',
        children: [
          {
            type: 'text',
            text,
            format: 0,
            detail: 0,
            mode: 'normal',
            style: '',
            version: 1,
          },
        ],
      })),
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  }) as any

const placeholderPng = async (width: number, height: number, from: string, to: string) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="${from}"/>
        <stop offset="1" stop-color="${to}"/>
      </linearGradient>
    </defs>
    <rect width="${width}" height="${height}" fill="url(#g)"/>
    <circle cx="${width * 0.8}" cy="${height * 0.25}" r="${Math.min(width, height) * 0.35}" fill="#ffffff" opacity="0.08"/>
    <circle cx="${width * 0.15}" cy="${height * 0.85}" r="${Math.min(width, height) * 0.25}" fill="#ffffff" opacity="0.08"/>
  </svg>`
  return sharp(Buffer.from(svg)).png().toBuffer()
}

const run = async () => {
  const payload = await getPayload({ config })

  const uploadPlaceholder = async (
    name: string,
    alt: string,
    width: number,
    height: number,
    colors: [string, string] = ['#2FA8D5', '#2B3384'],
  ) => {
    const data = await placeholderPng(width, height, colors[0], colors[1])
    return payload.create({
      collection: 'media',
      data: { alt },
      file: {
        data,
        mimetype: 'image/png',
        name,
        size: data.length,
      },
    })
  }

  // Администратор
  const users = await payload.find({ collection: 'users', limit: 1 })
  if (users.totalDocs === 0) {
    const email = process.env.ADMIN_EMAIL || 'admin@example.com'
    const password = process.env.ADMIN_PASSWORD || 'admin12345'
    await payload.create({
      collection: 'users',
      data: { email, password, name: 'Администратор' },
    })
    payload.logger.info(`Создан администратор: ${email} / ${password} — смените пароль после входа!`)
  }

  const settings = await payload.findGlobal({ slug: 'settings' })
  if (settings?.churchName) {
    payload.logger.info('База уже заполнена — пропускаю заглушки.')
    process.exit(0)
  }

  payload.logger.info('Заполняю базу заглушками...')

  const cover1 = await uploadPlaceholder('primer-novosti.png', 'Заглушка обложки новости', 1200, 675)
  const cover2 = await uploadPlaceholder(
    'primer-sobytiya.png',
    'Заглушка обложки события',
    1200,
    675,
    ['#8FD0EC', '#176E96'],
  )
  const heroImg = await uploadPlaceholder('glavnaya-foto.png', 'Заглушка фото на главной', 1600, 900)
  const aboutImg = await uploadPlaceholder('o-nas-foto.png', 'Заглушка фото «О нас»', 1200, 800, [
    '#176E96',
    '#2B3384',
  ])
  const ministerImg = await uploadPlaceholder('sluzhitel-foto.png', 'Заглушка фото служителя', 800, 800)
  const gallery1 = await uploadPlaceholder('galereya-1.png', 'Заглушка фото галереи 1', 1200, 800)
  const gallery2 = await uploadPlaceholder('galereya-2.png', 'Заглушка фото галереи 2', 1200, 800, [
    '#8FD0EC',
    '#2FA8D5',
  ])
  const gallery3 = await uploadPlaceholder('galereya-3.png', 'Заглушка фото галереи 3', 1200, 800, [
    '#2B3384',
    '#2FA8D5',
  ])

  await payload.updateGlobal({
    slug: 'settings',
    data: {
      churchName: 'Кауым-Церковь Шындык',
      tagline: 'Короткое описание церкви — замените этот текст в админке (Настройки сайта).',
      phone: '+7 (000) 000-00-00',
      email: 'info@example.com',
      address: 'г. Павлодар — укажите точный адрес в админке',
      instagram: 'https://www.instagram.com/kauymshyndyk',
      youtube: 'https://www.youtube.com/channel/UC73qg4buvUlxM1PSOF0trJA',
      mapEmbedUrl: '',
    },
  })

  await payload.updateGlobal({
    slug: 'schedule',
    data: {
      announcement: '',
      regularServices: [
        {
          day: 'sunday',
          time: '11:00',
          title: 'Воскресное богослужение',
          note: 'Пример — проверьте день и время в админке',
        },
        {
          day: 'wednesday',
          time: '19:00',
          title: 'Молитвенное служение',
          note: 'Пример — проверьте день и время в админке',
        },
      ],
      specialServices: [],
    },
  })

  await payload.updateGlobal({
    slug: 'home-page',
    data: {
      heroSubtitle: 'Приветственная фраза для гостей — замените её в админке (Главная страница).',
      heroImage: heroImg.id,
      aboutText: textToLexical(
        'Здесь будет короткий рассказ о церкви: кто мы, во что верим и что происходит на служениях.',
        'Замените этот текст в админке: раздел «Страницы» → «Главная страница».',
      ),
      aboutImage: aboutImg.id,
      firstVisitTeaser:
        'Собираетесь к нам в первый раз? Мы собрали ответы на вопросы, которые чаще всего волнуют гостей.',
    },
  })

  await payload.updateGlobal({
    slug: 'first-visit',
    data: {
      intro: textToLexical(
        'Вступительное слово для гостей — напишите его в админке: «Страницы» → «Я здесь впервые».',
      ),
      sections: [
        {
          title: 'Как одеться',
          content: textToLexical(
            'Напишите здесь, как обычно одеваются прихожане и есть ли пожелания к одежде.',
          ),
        },
        {
          title: 'Что происходит на служении',
          content: textToLexical(
            'Опишите ход служения: прославление, проповедь, молитва — и сколько оно длится.',
          ),
        },
        {
          title: 'Как себя вести',
          content: textToLexical(
            'Расскажите, что можно приходить с детьми, можно ли опоздать, нужно ли что-то делать.',
          ),
        },
        {
          title: 'Где вход и как добраться',
          content: textToLexical(
            'Объясните, как найти здание, где вход и есть ли парковка.',
          ),
        },
      ],
      faq: [
        {
          question: 'Пример вопроса — нужно ли платить за что-то?',
          answer: 'Пример ответа — напишите свой в админке.',
        },
      ],
    },
  })

  await payload.updateGlobal({
    slug: 'about-page',
    data: {
      history: textToLexical(
        'История церкви появится здесь. Напишите её в админке: «Страницы» → «О церкви».',
      ),
      coverImage: heroImg.id,
    },
  })

  await payload.updateGlobal({
    slug: 'ministries-page',
    data: {
      intro: textToLexical(
        'Вступление к странице служений — напишите его в админке: «Страницы» → «Служения».',
      ),
      items: [
        {
          title: 'Водное крещение',
          description: textToLexical('Опишите, что нужно для крещения и как к нему подготовиться.'),
          howToArrange: 'Напишите, к кому обратиться и по какому телефону.',
        },
        {
          title: 'Бракосочетание',
          description: textToLexical('Опишите, как проходит бракосочетание и что нужно заранее.'),
          howToArrange: 'Напишите, к кому обратиться и по какому телефону.',
        },
        {
          title: 'Молитва о нуждах',
          description: textToLexical('Расскажите, как попросить о молитвенной поддержке.'),
          howToArrange: 'Напишите, к кому обратиться и по какому телефону.',
        },
      ],
      contactNote: 'Общий контакт для вопросов — укажите его в админке.',
    },
  })

  await payload.updateGlobal({
    slug: 'donate-page',
    data: {
      purpose: textToLexical(
        'Расскажите, на что идут пожертвования: аренда, служения, помощь нуждающимся.',
        'Замените этот текст в админке: «Страницы» → «Пожертвования».',
      ),
      kaspiNumber: '+7 (000) 000-00-00',
      kaspiLink: '',
      requisites: [
        { label: 'Получатель', value: 'Укажите в админке' },
        { label: 'БИН', value: '000000000000' },
      ],
      note: 'Пример примечания — замените в админке.',
    },
  })

  const inTwoWeeks = new Date()
  inTwoWeeks.setDate(inTwoWeeks.getDate() + 14)
  inTwoWeeks.setHours(11, 0, 0, 0)

  await payload.create({
    collection: 'news',
    data: {
      title: 'Пример новости',
      slug: 'primer-novosti',
      publishedDate: new Date().toISOString(),
      cover: cover1.id,
      excerpt: 'Это пример новости. Откройте админку, чтобы отредактировать или удалить её.',
      content: textToLexical(
        'Это пример новости, чтобы было видно, как выглядит страница.',
        'Откройте админку → «Контент» → «Новости и события», чтобы отредактировать или удалить её и добавить настоящие новости.',
      ),
    },
  })

  await payload.create({
    collection: 'news',
    data: {
      title: 'Пример анонса события',
      slug: 'primer-anonsa',
      publishedDate: new Date().toISOString(),
      eventDate: inTwoWeeks.toISOString(),
      cover: cover2.id,
      excerpt: 'У этой записи заполнена дата события — так выглядит анонс.',
      content: textToLexical(
        'Если у новости заполнено поле «Дата и время события», она показывается как анонс события.',
      ),
    },
  })

  await payload.create({
    collection: 'ministers',
    data: {
      name: 'Имя Фамилия',
      role: 'Пастор',
      photo: ministerImg.id,
      bio: textToLexical('Пара слов о служителе — заполните в админке.'),
    },
  })

  await payload.create({
    collection: 'gallery',
    data: { image: gallery1.id, caption: 'Подпись к фото — пример' },
  })
  await payload.create({
    collection: 'gallery',
    data: { image: gallery2.id, caption: 'Подпись к фото — пример' },
  })
  await payload.create({
    collection: 'gallery',
    data: { image: gallery3.id, caption: '' },
  })

  payload.logger.info('Готово: база заполнена заглушками.')
  process.exit(0)
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
