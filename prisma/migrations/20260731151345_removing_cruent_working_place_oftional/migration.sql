/*
  Warnings:

  - Made the column `currentWorkingPlace` on table `doctor` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "doctor" ALTER COLUMN "currentWorkingPlace" SET NOT NULL;
