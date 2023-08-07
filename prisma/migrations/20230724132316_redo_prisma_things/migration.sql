-- CreateTable
CREATE TABLE "Guild" (
    "guildSid" TEXT NOT NULL,
    "permissionsId" INTEGER NOT NULL,

    CONSTRAINT "Guild_pkey" PRIMARY KEY ("guildSid")
);

-- CreateTable
CREATE TABLE "Permissions" (
    "id" SERIAL NOT NULL,
    "adminSid" TEXT,

    CONSTRAINT "Permissions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Guild_permissionsId_key" ON "Guild"("permissionsId");

-- CreateIndex
CREATE UNIQUE INDEX "Permissions_adminSid_key" ON "Permissions"("adminSid");

-- AddForeignKey
ALTER TABLE "Guild" ADD CONSTRAINT "Guild_permissionsId_fkey" FOREIGN KEY ("permissionsId") REFERENCES "Permissions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
