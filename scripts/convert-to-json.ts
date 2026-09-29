// Конвертирует все существующие .ts файлы глав (genesis-1.ts и т.д.)
// в JSON-файлы в public/bible/<book>/<chapter>.json
//
// Запуск: npx tsx scripts/convert-to-json.ts

import fs from 'node:fs'
import path from 'node:path'

const bibleDir = path.resolve('src/data/bible')
const publicDir = path.resolve('public/bible')

async function main() {
  const files = fs
    .readdirSync(bibleDir)
    .filter(
      (f) =>
        f.endsWith('.ts') &&
        f !== 'types.ts' &&
        f !== 'books.ts' &&
        f !== 'index.ts',
    )
    .sort()

  console.log(`Found ${files.length} chapter files to convert\n`)

  let converted = 0
  let failed = 0

  for (const file of files) {
    const baseName = file.replace('.ts', '')
    const lastHyphen = baseName.lastIndexOf('-')
    const bookSlug = baseName.substring(0, lastHyphen)
    const chapter = baseName.substring(lastHyphen + 1)
    const varName = baseName.toUpperCase().replace(/-/g, '_')

    try {
      const mod = await import(`../src/data/bible/${baseName}.ts`)
      const data = mod[varName]
      if (!data) {
        console.warn(`⚠ ${file}: export ${varName} not found, keys: ${Object.keys(mod)}`)
        failed++
        continue
      }

      const outDir = path.join(publicDir, bookSlug)
      fs.mkdirSync(outDir, { recursive: true })
      fs.writeFileSync(
        path.join(outDir, `${chapter}.json`),
        JSON.stringify(data, null, 2),
      )
      console.log(`✓ ${bookSlug}/${chapter}.json`)
      converted++
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      console.error(`✗ ${file}: ${msg}`)
      failed++
    }
  }

  console.log(`\nDone: ${converted} converted, ${failed} failed`)
}

main()
