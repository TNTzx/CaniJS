/*
  Warnings:

  - A unique constraint covering the columns `[permissionsId]` on the table `Guild` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `permissionsId` to the `Guild` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Permissions" DROP CONSTRAINT "Permissions_guildSid_fkey";

-- AlterTable
ALTER TABLE "Guild" ADD COLUMN     "permissionsId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Guild_permissionsId_key" ON "Guild"("permissionsId");

-- AddForeignKey
ALTER TABLE "Guild" ADD CONSTRAINT "Guild_permissionsId_fkey" FOREIGN KEY ("permissionsId") REFERENCES "Permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
