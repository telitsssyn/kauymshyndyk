import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "sermons" ALTER COLUMN "youtube_url" DROP NOT NULL;
  ALTER TABLE "sermons" ADD COLUMN "cover_id" integer;
  ALTER TABLE "sermons" ADD CONSTRAINT "sermons_cover_id_media_id_fk" FOREIGN KEY ("cover_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "sermons_cover_idx" ON "sermons" USING btree ("cover_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "sermons" DROP CONSTRAINT "sermons_cover_id_media_id_fk";
  
  DROP INDEX "sermons_cover_idx";
  ALTER TABLE "sermons" ALTER COLUMN "youtube_url" SET NOT NULL;
  ALTER TABLE "sermons" DROP COLUMN "cover_id";`)
}
