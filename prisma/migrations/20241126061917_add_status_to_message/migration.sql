-- CreateEnum
CREATE TYPE "MessageStatus" AS ENUM ('sent', 'delivered', 'read', 'failed');

-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "status" "MessageStatus" NOT NULL DEFAULT 'sent';
