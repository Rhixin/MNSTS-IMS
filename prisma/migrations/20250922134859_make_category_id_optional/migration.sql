-- DropForeignKey
ALTER TABLE "public"."inventory_items" DROP CONSTRAINT "inventory_items_categoryId_fkey";

-- AlterTable
ALTER TABLE "public"."inventory_items" ALTER COLUMN "categoryId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."inventory_items" ADD CONSTRAINT "inventory_items_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "public"."categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
