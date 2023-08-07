-- CreateTable
CREATE TABLE "ModuleChannelClaiming" (
    "id" SERIAL NOT NULL,
    "guildSid" TEXT NOT NULL,

    CONSTRAINT "ModuleChannelClaiming_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClaimChannel" (
    "id" SERIAL NOT NULL,
    "channelClaimingId" INTEGER NOT NULL,
    "channelSid" TEXT NOT NULL,
    "isClaimed" BOOLEAN NOT NULL DEFAULT false,
    "location" TEXT,
    "claimedAt" TIMESTAMP(3),

    CONSTRAINT "ClaimChannel_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ModuleChannelClaiming_guildSid_key" ON "ModuleChannelClaiming"("guildSid");

-- CreateIndex
CREATE UNIQUE INDEX "ClaimChannel_channelSid_key" ON "ClaimChannel"("channelSid");

-- AddForeignKey
ALTER TABLE "ModuleChannelClaiming" ADD CONSTRAINT "ModuleChannelClaiming_guildSid_fkey" FOREIGN KEY ("guildSid") REFERENCES "Guild"("guildSid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClaimChannel" ADD CONSTRAINT "ClaimChannel_channelClaimingId_fkey" FOREIGN KEY ("channelClaimingId") REFERENCES "ModuleChannelClaiming"("id") ON DELETE CASCADE ON UPDATE CASCADE;
