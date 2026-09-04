// Картинка превью ссылки (Open Graph) из логотипа.
// Пересобрать после замены логотипа: npm run make:og
//
// Исходник лежит в assets/, а не в public/: он весит 1.3 МБ и нужен только
// здесь — в public/ его раздавали бы всем посетителям впустую.
//
// Почему не берём логотип целиком. WhatsApp показывает превью маленькой
// квадратной миниатюрой (~92 пикселя), и в ней мелкая строка «ҚАУЫМ»
// превращается в грязь, а «ШЫНДЫҚ» — в смазанное пятно. Поэтому кадрируем
// по знаку и крупному слову, отбрасывая нижнюю строку: так знак занимает
// почти весь квадрат и читается даже в миниатюре.
//
// Дальше вписываем квадрат в пропорции 1.91:1 (их ждут Telegram и соцсети),
// добирая поля продлением края самого файла — бумажная фактура продолжается
// без видимого шва, плоской заливкой не выходит из-за диагональной подсветки
// мокапа. Клиенты, режущие превью в квадрат, получают ровно знак.
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const source = path.resolve(dirname, '../assets/logo-full.png')
const target = path.resolve(dirname, '../public/og.jpg')

const WIDTH = 1200
const HEIGHT = 630

// Замерено по исходнику 1024x1024: знак занимает x 137..864, y 170..723,
// «ШЫНДЫҚ» — y 724..816, «ҚАУЫМ» — y 827..861. Режем по 821, в просвете
// между строками, и оставляем поля по 20 пикселей вокруг знака.
const CROP = { left: 117, top: 150, width: 767, height: 671 }

const cropped = await sharp(source).extract(CROP).resize({ width: HEIGHT }).toBuffer()
const { height: croppedHeight } = await sharp(cropped).metadata()

const padTop = Math.floor((HEIGHT - croppedHeight) / 2)
const square = await sharp(cropped)
  .extend({ top: padTop, bottom: HEIGHT - croppedHeight - padTop, extendWith: 'copy' })
  .toBuffer()

const sides = (WIDTH - HEIGHT) / 2
const background = await sharp(square)
  .extend({ left: sides, right: sides, extendWith: 'copy' })
  .blur(10)
  .toBuffer()

await sharp(background)
  .composite([{ input: square, gravity: 'centre' }])
  .jpeg({ quality: 92, mozjpeg: true })
  .toFile(target)

console.log(`Готово: ${path.relative(process.cwd(), target)} — ${WIDTH}x${HEIGHT}`)
