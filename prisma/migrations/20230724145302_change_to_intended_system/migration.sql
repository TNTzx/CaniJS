/*
  Warnings:

  - You are about to drop the column `permissionsId` on the `Guild` table. All the data in the column will be lost.
  - Made the column `guildSid` on table `Permissions` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Guild" DROP CONSTRAINT "Guild_permissionsId_fkey";

-- DropIndex
DROP INDEX "Guild_permissionsId_key";

-- AlterTable
ALTER TABLE "Guild" DROP COLUMN "permissionsId";

-- AlterTable
ALTER TABLE "Permissions" ALTER COLUMN "guildSid" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Permissions" ADD CONSTRAINT "Permissions_guildSid_fkey" FOREIGN KEY ("guildSid") REFERENCES "Guild"("guildSid") ON DELETE CASCADE ON UPDATE CASCADE;
