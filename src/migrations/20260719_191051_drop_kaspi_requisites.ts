import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "donate_page_requisites" CASCADE;
  ALTER TABLE "donate_page" DROP COLUMN "kaspi_number";
  ALTER TABLE "donate_page" DROP COLUMN "kaspi_link";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "donate_page_requisites" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"value" varchar NOT NULL
  );
  
  ALTER TABLE "donate_page" ADD COLUMN "kaspi_number" varchar;
  ALTER TABLE "donate_page" ADD COLUMN "kaspi_link" varchar;
  ALTER TABLE "donate_page_requisites" ADD CONSTRAINT "donate_page_requisites_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."donate_page"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "donate_page_requisites_order_idx" ON "donate_page_requisites" USING btree ("_order");
  CREATE INDEX "donate_page_requisites_parent_id_idx" ON "donate_page_requisites" USING btree ("_parent_id");`)
}
