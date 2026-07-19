import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "donate_page_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "donate_page_steps_locales" (
  	"text" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  ALTER TABLE "donate_page_locales" ADD COLUMN "qr_caption" varchar;
  ALTER TABLE "donate_page_locales" ADD COLUMN "instruction_title" varchar;
  ALTER TABLE "donate_page_steps" ADD CONSTRAINT "donate_page_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."donate_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "donate_page_steps_locales" ADD CONSTRAINT "donate_page_steps_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."donate_page_steps"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "donate_page_steps_order_idx" ON "donate_page_steps" USING btree ("_order");
  CREATE INDEX "donate_page_steps_parent_id_idx" ON "donate_page_steps" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "donate_page_steps_locales_locale_parent_id_unique" ON "donate_page_steps_locales" USING btree ("_locale","_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "donate_page_steps" CASCADE;
  DROP TABLE "donate_page_steps_locales" CASCADE;
  ALTER TABLE "donate_page_locales" DROP COLUMN "qr_caption";
  ALTER TABLE "donate_page_locales" DROP COLUMN "instruction_title";`)
}
