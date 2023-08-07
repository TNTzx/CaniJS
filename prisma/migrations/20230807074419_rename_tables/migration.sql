-- This is an empty migration.
ALTER TABLE "Permissions" RENAME TO "BMAdmin";
ALTER TABLE "ModuleChannelClaiming" RENAME TO "BMChannelClaiming";
ALTER TABLE "ClaimChannel" RENAME TO "BMCC_Claimable";

ALTER TABLE "BMCC_Claimable" RENAME COLUMN "channelClaimingId" TO "bmChannelClaimingId";