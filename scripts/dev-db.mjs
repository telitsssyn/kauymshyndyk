// Локальная база данных для разработки без Docker и установки PostgreSQL:
// бинарники PostgreSQL лежат в node_modules (пакет embedded-postgres).
// Запуск: npm run dev:db  (остановить — Ctrl+C)
import EmbeddedPostgres from 'embedded-postgres'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const databaseDir = path.resolve(dirname, '../.pgdata')
const alreadyInitialised = existsSync(path.join(databaseDir, 'PG_VERSION'))

const pg = new EmbeddedPostgres({
  databaseDir,
  user: 'postgres',
  password: 'postgres',
  port: 5433,
  persistent: true,
})

if (!alreadyInitialised) {
  console.log('Первый запуск: инициализирую кластер PostgreSQL в .pgdata ...')
  await pg.initialise()
}

await pg.start()

if (!alreadyInitialised) {
  await pg.createDatabase('kauymshyndyk')
}

console.log('PostgreSQL запущен: postgresql://postgres:postgres@127.0.0.1:5433/kauymshyndyk')
console.log('Остановить: Ctrl+C')

const stop = async () => {
  console.log('Останавливаю PostgreSQL...')
  await pg.stop()
  process.exit(0)
}

process.on('SIGINT', stop)
process.on('SIGTERM', stop)
