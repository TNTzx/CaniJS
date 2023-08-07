/*
  Warnings:

  - You are about to drop the column `permissionsId` on the `Guild` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[guildSid]` on the table `Permissions` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `guildSid` to the `Permissions` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Guild" DROP CONSTRAINT "Guild_permissionsId_fkey";

-- DropIndex
DROP INDEX "Guild_permissionsId_key";

-- AlterTable
ALTER TABLE "Guild" DROP COLUMN "permissionsId";

-- AlterTable
ALTER TABLE "Permissions" ADD COLUMN     "guildSid" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Permissions_guildSid_key" ON "Permissions"("guildSid");

-- AddForeignKey
ALTER TABLE "Permissions" ADD CONSTRAINT "Permissions_guildSid_fkey" FOREIGN KEY ("guildSid") REFERENCES "Guild"("guildSid") ON DELETE RESTRICT ON UPDATE CASCADE;
