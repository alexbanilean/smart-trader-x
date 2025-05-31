/*
  Warnings:

  - The `label` column on the `Post` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "PostLabel" AS ENUM ('BEGINNER_TRADER', 'INTERMEDIATE_TRADER', 'EXPERIENCED_TRADER');

-- AlterTable
ALTER TABLE "Post" DROP COLUMN "label",
ADD COLUMN     "label" "PostLabel" NOT NULL DEFAULT 'BEGINNER_TRADER';
