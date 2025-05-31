/*
  Warnings:

  - The `label` column on the `Post` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `experienceLevel` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "ExperienceLevel" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'EXPERIENCED');

-- AlterTable
ALTER TABLE "Post" DROP COLUMN "label",
ADD COLUMN     "label" "ExperienceLevel" NOT NULL DEFAULT 'BEGINNER';

-- AlterTable
ALTER TABLE "User" DROP COLUMN "experienceLevel",
ADD COLUMN     "experienceLevel" "ExperienceLevel";

-- DropEnum
DROP TYPE "PostLabel";
