-- AlterTable
ALTER TABLE "BMAdmin" RENAME CONSTRAINT "Permissions_pkey" TO "BMAdmin_pkey";

-- AlterTable
ALTER TABLE "BMCC_Claimable" RENAME CONSTRAINT "ClaimChannel_pkey" TO "BMCC_Claimable_pkey";

-- AlterTable
ALTER TABLE "BMChannelClaiming" RENAME CONSTRAINT "ModuleChannelClaiming_pkey" TO "BMChannelClaiming_pkey";

-- RenameForeignKey
ALTER TABLE "BMAdmin" RENAME CONSTRAINT "Permissions_guildSid_fkey" TO "BMAdmin_guildSid_fkey";

-- RenameForeignKey
ALTER TABLE "BMCC_Claimable" RENAME CONSTRAINT "ClaimChannel_channelClaimingId_fkey" TO "BMCC_Claimable_bmChannelClaimingId_fkey";

-- RenameForeignKey
ALTER TABLE "BMChannelClaiming" RENAME CONSTRAINT "ModuleChannelClaiming_guildSid_fkey" TO "BMChannelClaiming_guildSid_fkey";

-- RenameIndex
ALTER INDEX "Permissions_adminSid_key" RENAME TO "BMAdmin_adminSid_key";

-- RenameIndex
ALTER INDEX "Permissions_guildSid_key" RENAME TO "BMAdmin_guildSid_key";

-- RenameIndex
ALTER INDEX "ClaimChannel_channelSid_key" RENAME TO "BMCC_Claimable_channelSid_key";

-- RenameIndex
ALTER INDEX "ModuleChannelClaiming_guildSid_key" RENAME TO "BMChannelClaiming_guildSid_key";
