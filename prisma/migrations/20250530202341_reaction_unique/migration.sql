/*
  Warnings:

  - A unique constraint covering the columns `[userId,postId,type]` on the table `Reaction` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Reaction_userId_postId_type_key" ON "Reaction"("userId", "postId", "type");
