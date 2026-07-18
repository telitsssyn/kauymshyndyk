import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  // Столбец меняет тип с обычного текста на форматированный (jsonb).
  // На момент этой миграции колонка ещё пустая (Проповеди появились двумя
  // миграциями раньше), поэтому старые текстовые значения не переносим.
  await db.execute(sql`
   ALTER TABLE "sermons_locales" ALTER COLUMN "description" SET DATA TYPE jsonb USING NULL;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "sermons_locales" ALTER COLUMN "description" SET DATA TYPE varchar USING NULL;`)
}
