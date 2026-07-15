import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import { ru } from '@payloadcms/translations/languages/ru'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { GalleryItems } from './collections/GalleryItems'
import { Media } from './collections/Media'
import { Ministers } from './collections/Ministers'
import { News } from './collections/News'
import { Users } from './collections/Users'
import { AboutPage } from './globals/AboutPage'
import { DonatePage } from './globals/DonatePage'
import { FirstVisit } from './globals/FirstVisit'
import { HomePage } from './globals/HomePage'
import { MinistriesPage } from './globals/MinistriesPage'
import { Schedule } from './globals/Schedule'
import { Settings } from './globals/Settings'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    meta: {
      titleSuffix: ' • Админка',
    },
  },
  collections: [News, Ministers, GalleryItems, Media, Users],
  globals: [HomePage, Schedule, FirstVisit, AboutPage, MinistriesPage, DonatePage, Settings],
  editor: lexicalEditor(),
  // Язык интерфейса админки
  i18n: {
    supportedLanguages: { ru },
    fallbackLanguage: 'ru',
  },
  // Локализация контента: сейчас только русский, kk/en добавляются одной строкой
  localization: {
    locales: [{ label: 'Русский', code: 'ru' }],
    defaultLocale: 'ru',
  },
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
  }),
  sharp,
  plugins: [
    // На Vercel файлы хранятся в Blob; локально — в папке media
    ...(process.env.BLOB_READ_WRITE_TOKEN
      ? [
          vercelBlobStorage({
            collections: { media: true },
            token: process.env.BLOB_READ_WRITE_TOKEN,
          }),
        ]
      : []),
  ],
})
