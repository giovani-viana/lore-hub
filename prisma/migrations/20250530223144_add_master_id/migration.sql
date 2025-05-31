/*
  Warnings:

  - You are about to drop the column `isPublic` on the `Inventory` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[masterId]` on the table `Campaign` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `masterId` to the `Campaign` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Visibility" AS ENUM ('MASTER_AND_OWNER', 'CAMPAIGN_PLAYERS', 'PASSWORD_PROTECTED');

-- AlterTable
ALTER TABLE "Attribute" ADD COLUMN     "password" TEXT,
ADD COLUMN     "visibility" "Visibility" NOT NULL DEFAULT 'CAMPAIGN_PLAYERS';

-- AlterTable
ALTER TABLE "Campaign" ADD COLUMN     "masterId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Inventory" DROP COLUMN "isPublic",
ADD COLUMN     "password" TEXT,
ADD COLUMN     "visibility" "Visibility" NOT NULL DEFAULT 'CAMPAIGN_PLAYERS';

-- CreateIndex
CREATE UNIQUE INDEX "Campaign_masterId_key" ON "Campaign"("masterId");

-- AddForeignKey
ALTER TABLE "Campaign" ADD CONSTRAINT "Campaign_masterId_fkey" FOREIGN KEY ("masterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
