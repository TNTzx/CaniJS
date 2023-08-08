-- CreateTable
CREATE TABLE "BMCC_EmbedData" (
    "id" SERIAL NOT NULL,
    "bmChannelClaimingId" INTEGER NOT NULL,
    "isSet" BOOLEAN NOT NULL DEFAULT false,
    "channelSid" TEXT,
    "messageSid" TEXT,

    CONSTRAINT "BMCC_EmbedData_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BMCC_EmbedData_bmChannelClaimingId_key" ON "BMCC_EmbedData"("bmChannelClaimingId");

-- AddForeignKey
ALTER TABLE "BMCC_EmbedData" ADD CONSTRAINT "BMCC_EmbedData_bmChannelClaimingId_fkey" FOREIGN KEY ("bmChannelClaimingId") REFERENCES "BMChannelClaiming"("id") ON DELETE CASCADE ON UPDATE CASCADE;
