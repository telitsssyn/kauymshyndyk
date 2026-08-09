import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "ministries_page_items" CASCADE;
  DROP TABLE "ministries_page_items_locales" CASCADE;
  DROP TABLE "ministries_page" CASCADE;
  DROP TABLE "ministries_page_locales" CASCADE;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "ministries_page_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "ministries_page_items_locales" (
  	"title" varchar NOT NULL,
  	"description" jsonb NOT NULL,
  	"how_to_arrange" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "ministries_page" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "ministries_page_locales" (
  	"intro" jsonb,
  	"contact_note" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "ministries_page_items" ADD CONSTRAINT "ministries_page_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."ministries_page"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "ministries_page_items_locales" ADD CONSTRAINT "ministries_page_items_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."ministries_page_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "ministries_page_locales" ADD CONSTRAINT "ministries_page_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."ministries_page"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "ministries_page_items_order_idx" ON "ministries_page_items" USING btree ("_order");
  CREATE INDEX "ministries_page_items_parent_id_idx" ON "ministries_page_items" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "ministries_page_items_locales_locale_parent_id_unique" ON "ministries_page_items_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "ministries_page_locales_locale_parent_id_unique" ON "ministries_page_locales" USING btree ("_locale","_parent_id");`)
}
