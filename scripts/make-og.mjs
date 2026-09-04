// Картинка превью ссылки (Open Graph) из логотипа.
// Пересобрать после замены логотипа: npm run make:og
//
// Исходник лежит в assets/, а не в public/: он весит 1.3 МБ и нужен только
// здесь — в public/ его раздавали бы всем посетителям впустую.
//
// Логотип квадратный, а превью в мессенджерах имеет пропорции 1.91:1, поэтому
// вписываем его целиком по высоте, а поля по бокам продлеваем краем самого
// файла — бумажная фактура продолжается без видимого шва. Центр остаётся
// резким, чтобы логотип не размылся; клиенты, режущие превью в квадрат,
// получают ровно логотип.
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const source = path.resolve(dirname, '../assets/logo-full.png')
const target = path.resolve(dirname, '../public/og.jpg')

const WIDTH = 1200
const HEIGHT = 630
const PAD = (WIDTH - HEIGHT) / 2

const logo = await sharp(source).resize(HEIGHT, HEIGHT).toBuffer()
const background = await sharp(logo)
  .extend({ left: PAD, right: PAD, extendWith: 'copy' })
  .blur(10)
  .toBuffer()

await sharp(background)
  .composite([{ input: logo, gravity: 'centre' }])
  .jpeg({ quality: 92, mozjpeg: true })
  .toFile(target)

console.log(`Готово: ${path.relative(process.cwd(), target)} — ${WIDTH}x${HEIGHT}`)
