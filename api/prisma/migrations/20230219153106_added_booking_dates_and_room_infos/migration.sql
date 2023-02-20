/*
  Warnings:

  - Added the required column `date_end` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `date_start` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `days` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `capacity` to the `Room` table without a default value. This is not possible if the table is not empty.
  - Added the required column `price` to the `Room` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "date_end" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "date_start" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "days" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Room" ADD COLUMN     "capacity" INTEGER NOT NULL,
ADD COLUMN     "price" DOUBLE PRECISION NOT NULL;
