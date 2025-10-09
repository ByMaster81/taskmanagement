/*
  Warnings:

  - The `status` column on the `Task` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[userId,taskId]` on the table `Assignment` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `password` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('ADMINUSER', 'USER');

-- CreateEnum
CREATE TYPE "public"."TaskStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'DONE');

-- DropForeignKey
ALTER TABLE "public"."Assignment" DROP CONSTRAINT "Assignment_userId_fkey";

-- AlterTable
ALTER TABLE "public"."Task" DROP COLUMN "status",
ADD COLUMN     "status" "public"."TaskStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "password" TEXT NOT NULL,
ADD COLUMN     "role" "public"."Role" NOT NULL DEFAULT 'USER';

-- CreateIndex
CREATE UNIQUE INDEX "Assignment_userId_taskId_key" ON "public"."Assignment"("userId", "taskId");

-- AddForeignKey
ALTER TABLE "public"."Assignment" ADD CONSTRAINT "Assignment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
