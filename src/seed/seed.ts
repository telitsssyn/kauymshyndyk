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
      data: { email, password, name: 'Администратор', role: 'admin' },
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
      tagline: 'Церковь евангельских христиан-баптистов в Павлодаре. «Шындық» по-казахски — «истина».',
      phone: '',
      email: '',
      address: 'г. Павлодар, пер. Гоголя, 116',
      instagram: 'https://www.instagram.com/kauymshyndyk',
      youtube: 'https://www.youtube.com/channel/UC73qg4buvUlxM1PSOF0trJA',
      mapEmbedUrl: '',
      mapLink:
        'https://2gis.kz/pavlodar/search/%D0%BF%D0%B5%D1%80%D0%B5%D1%83%D0%BB%D0%BE%D0%BA%20%D0%93%D0%BE%D0%B3%D0%BE%D0%BB%D1%8F%2C%20116',
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
          note: 'Прославление, проповедь и общение. Приходите всей семьёй — будем рады гостям.',
        },
        {
          day: 'wednesday',
          time: '19:00',
          title: 'Молитвенное служение',
          note: 'Время совместной молитвы: благодарность, ходатайство о нуждах, духовное обновление.',
        },
      ],
      specialServices: [],
    },
  })

  await payload.updateGlobal({
    slug: 'home-page',
    data: {
      heroSubtitle:
        'Мы — церковь евангельских христиан-баптистов в Павлодаре. Приходите в воскресенье к 11:00 — будем рады познакомиться.',
      heroImage: heroImg.id,
      aboutText: textToLexical(
        'Кауым-Церковь «Шындык» — община евангельских христиан-баптистов в Павлодаре. «Шындық» по-казахски значит «истина»: мы верим, что истина открыта людям в Библии и в Иисусе Христе, и стараемся жить по ней каждый день.',
        'Каждую неделю мы собираемся, чтобы вместе прославлять Бога, слушать проповедь Божьего Слова, молиться и общаться. Двери церкви открыты для всех — независимо от возраста, национальности и религиозного опыта.',
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
        'Прийти в церковь в первый раз бывает волнительно: незнакомое место, незнакомые люди. Мы это понимаем, поэтому собрали здесь всё, что полезно знать перед первым визитом. А если останутся вопросы — просто напишите нам в Instagram.',
      ),
      sections: [
        {
          title: 'Как одеться',
          content: textToLexical(
            'Специального дресс-кода у нас нет — приходите в одежде, в которой вам удобно. Кто-то приходит в костюме, кто-то в джинсах. Главное — не внешний вид, а желание встретиться с Богом.',
          ),
        },
        {
          title: 'Что происходит на служении',
          content: textToLexical(
            'Служение состоит из прославления — христианских песен под живую музыку, — общей молитвы и проповеди: разбора библейского текста и его применения в современной жизни (около 30–40 минут).',
            'После служения — время общения: можно познакомиться ближе, задать вопросы и попросить о молитвенной поддержке.',
          ),
        },
        {
          title: 'Как себя вести',
          content: textToLexical(
            'Особых правил нет. Можно приходить с детьми, можно тихо зайти, если опоздали, — никто вас не осудит. Участвовать в пении и молитве не обязательно: если вам пока комфортнее просто наблюдать, это нормально. Никто не вызовет вас к микрофону и не попросит что-то говорить.',
          ),
        },
        {
          title: 'Где вход и как добраться',
          content: textToLexical(
            'Мы собираемся по адресу: г. Павлодар, пер. Гоголя, 116. Если сомневаетесь, как найти здание или где вход, — напишите нам в Instagram, подскажем и встретим.',
          ),
        },
      ],
      faq: [
        {
          question: 'Нужно ли платить за что-то?',
          answer:
            'Нет. Вход свободный, обязательных взносов не существует. На служении бывает сбор добровольных пожертвований, но участвовать в нём не обязательно — тем более если вы у нас впервые.',
        },
        {
          question: 'Я не баптист и мало знаю о Библии. Мне можно прийти?',
          answer:
            'Конечно. Наши служения открыты для всех, кто хочет узнать о Боге, — независимо от конфессии и знаний. Готовиться заранее не нужно: приходите как есть.',
        },
        {
          question: 'Можно ли прийти с детьми?',
          answer: 'Да, будем рады всей вашей семье — дети всегда желанные гости на служении.',
        },
      ],
    },
  })

  await payload.updateGlobal({
    slug: 'about-page',
    data: {
      history: textToLexical(
        'Наша община принадлежит к братству евангельских христиан-баптистов — христианскому движению, которое существует в Казахстане уже более ста лет. Церковь «Шындык» официально зарегистрирована в Павлодаре в 2001 году.',
        'Сегодня мы продолжаем служить городу: проводим богослужения, изучаем Писание, молимся о нуждах людей и стараемся поддерживать тех, кому трудно. Мы верим, что церковь — это не здание, а люди, которых объединяет вера в Иисуса Христа.',
      ),
      coverImage: heroImg.id,
    },
  })

  await payload.updateGlobal({
    slug: 'ministries-page',
    data: {
      intro: textToLexical(
        'Церковь — это не только воскресные собрания. Здесь мы собрали служения, за которыми к нам можно обратиться. Всё совершается бесплатно — подойдите к служителям после служения или напишите нам в Instagram, договоримся о времени и ответим на вопросы.',
      ),
      items: [
        {
          title: 'Водное крещение',
          description: textToLexical(
            'Крещение — осознанный шаг веры: публичное свидетельство о том, что человек уверовал в Иисуса Христа и решил следовать за Ним. Мы совершаем крещение по вере — для тех, кто сам принял это решение. Перед крещением проводим беседы: разбираем основы веры и отвечаем на вопросы.',
          ),
          howToArrange: 'Поговорите с пастором после воскресного служения или напишите нам в Instagram.',
        },
        {
          title: 'Бракосочетание',
          description: textToLexical(
            'Бракосочетание в церкви — это обещания, которые муж и жена дают друг другу перед Богом, и молитва благословения над новой семьёй. Перед бракосочетанием мы встречаемся с парой и беседуем о христианском браке.',
          ),
          howToArrange: 'Поговорите с пастором после воскресного служения или напишите нам в Instagram.',
        },
        {
          title: 'Молитва о нуждах',
          description: textToLexical(
            'Если вам тяжело, вы болеете или переживаете трудные обстоятельства — мы готовы молиться о вас. О молитве можно попросить лично на любом служении или написать нам в Instagram.',
          ),
          howToArrange: 'Подойдите к служителям на любом собрании или напишите нам в Instagram — молитвенные просьбы принимаем всегда.',
        },
      ],
      contactNote: 'Не нашли, что искали? Напишите нам в Instagram — подскажем и поможем.',
    },
  })

  await payload.updateGlobal({
    slug: 'donate-page',
    data: {
      purpose: textToLexical(
        'Церковь существует на добровольные пожертвования. Эти средства идут на содержание дома молитвы, проведение служений, помощь нуждающимся и развитие церкви.',
        'Пожертвование — дело сердца, а не обязанность: «Каждый уделяй по расположению сердца, не с огорчением и не с принуждением; ибо доброхотно дающего любит Бог» (2 Кор. 9:7).',
      ),
      kaspiNumber: '+7 (000) 000-00-00',
      kaspiLink: '',
      requisites: [
        { label: 'Получатель', value: 'Укажите в админке' },
        { label: 'БИН', value: '000000000000' },
      ],
      note: 'Хотите пожертвовать на конкретную нужду — укажите её в комментарии к переводу или скажите служителям.',
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
      name: 'Алексей Васильев',
      role: 'Пастор',
      photo: ministerImg.id,
      bio: textToLexical(
        'Пастор церкви «Шындык». Несёт служение проповеди Божьего Слова и пастырской заботы об общине.',
      ),
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
