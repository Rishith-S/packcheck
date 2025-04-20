/*
  Warnings:

  - Added the required column `foodId` to the `FoodItemsStatus` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "FoodItemsStatus" ADD COLUMN     "foodId" TEXT NOT NULL;
