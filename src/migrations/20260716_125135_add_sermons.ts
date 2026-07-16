import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "sermons" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar,
  	"date" timestamp(3) with time zone NOT NULL,
  	"youtube_url" varchar NOT NULL,
  	"preacher" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "sermons_locales" (
  	"title" varchar NOT NULL,
  	"scripture" varchar,
  	"description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "sermons_id" integer;
  ALTER TABLE "sermons_locales" ADD CONSTRAINT "sermons_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."sermons"("id") ON DELETE cascade ON UPDATE no action;
  CREATE UNIQUE INDEX "sermons_slug_idx" ON "sermons" USING btree ("slug");
  CREATE INDEX "sermons_updated_at_idx" ON "sermons" USING btree ("updated_at");
  CREATE INDEX "sermons_created_at_idx" ON "sermons" USING btree ("created_at");
  CREATE UNIQUE INDEX "sermons_locales_locale_parent_id_unique" ON "sermons_locales" USING btree ("_locale","_parent_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_sermons_fk" FOREIGN KEY ("sermons_id") REFERENCES "public"."sermons"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_sermons_id_idx" ON "payload_locked_documents_rels" USING btree ("sermons_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "sermons" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "sermons_locales" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "sermons" CASCADE;
  DROP TABLE "sermons_locales" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_sermons_fk";
  
  DROP INDEX "payload_locked_documents_rels_sermons_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "sermons_id";`)
}
