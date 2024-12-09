/*
  Warnings:

  - You are about to drop the column `content` on the `Message` table. All the data in the column will be lost.
  - Added the required column `encryptedContentForReceiver` to the `Message` table without a default value. This is not possible if the table is not empty.
  - Added the required column `encryptedContentForSender` to the `Message` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Message" DROP COLUMN "content",
ADD COLUMN     "encryptedContentForReceiver" TEXT NOT NULL,
ADD COLUMN     "encryptedContentForSender" TEXT NOT NULL;
