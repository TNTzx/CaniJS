/*
  Warnings:

  - You are about to drop the column `claimedAt` on the `BMCC_Claimable` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "BMCC_Claimable" RENAME COLUMN "claimedAt" TO "timeUpdated";
