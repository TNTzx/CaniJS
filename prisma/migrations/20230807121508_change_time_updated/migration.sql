/*
  Warnings:

  - Made the column `timeUpdated` on table `BMCC_Claimable` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
UPDATE "BMCC_Claimable" SET "timeUpdated" = CURRENT_TIMESTAMP WHERE "timeUpdated" IS NULL;

ALTER TABLE "BMCC_Claimable" ALTER COLUMN "timeUpdated" SET NOT NULL,
ALTER COLUMN "timeUpdated" SET DEFAULT CURRENT_TIMESTAMP;
