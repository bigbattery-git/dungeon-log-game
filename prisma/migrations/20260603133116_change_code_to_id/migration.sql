/*
  Warnings:

  - The primary key for the `default_items` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `code` on the `default_items` table. All the data in the column will be lost.
  - You are about to drop the column `defaultItemCode` on the `items` table. All the data in the column will be lost.
  - The primary key for the `monsters` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `code` on the `monsters` table. All the data in the column will be lost.
  - Added the required column `id` to the `default_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `defaultItemId` to the `items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id` to the `monsters` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `items` DROP FOREIGN KEY `items_defaultItemCode_fkey`;

-- DropIndex
DROP INDEX `items_defaultItemCode_fkey` ON `items`;

-- AlterTable
ALTER TABLE `default_items` DROP PRIMARY KEY,
    DROP COLUMN `code`,
    ADD COLUMN `id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `items` DROP COLUMN `defaultItemCode`,
    ADD COLUMN `defaultItemId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `monsters` DROP PRIMARY KEY,
    DROP COLUMN `code`,
    ADD COLUMN `id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`id`);

-- AddForeignKey
ALTER TABLE `items` ADD CONSTRAINT `items_defaultItemId_fkey` FOREIGN KEY (`defaultItemId`) REFERENCES `default_items`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
