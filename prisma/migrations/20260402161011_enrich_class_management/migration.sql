-- AlterTable
ALTER TABLE `Class`
    ADD COLUMN `capacity` INTEGER NOT NULL DEFAULT 20,
    ADD COLUMN `endTime` VARCHAR(191) NULL,
    ADD COLUMN `fee` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    ADD COLUMN `level` VARCHAR(191) NULL,
    ADD COLUMN `notes` TEXT NULL,
    ADD COLUMN `scheduleDay` ENUM('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY') NULL,
    ADD COLUMN `status` ENUM('DRAFT', 'ACTIVE', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'ACTIVE',
    ADD COLUMN `subject` VARCHAR(191) NULL,
    ADD COLUMN `teacherId` VARCHAR(191) NULL;

UPDATE `Class`
SET
    `subject` = COALESCE(NULLIF(`subject`, ''), 'General Course'),
    `level` = COALESCE(NULLIF(`level`, ''), 'General'),
    `teacherId` = COALESCE(`teacherId`, `createdById`),
    `endTime` = COALESCE(NULLIF(`endTime`, ''), TIME_FORMAT(ADDTIME(CONCAT(`time`, ':00'), '01:00:00'), '%H:%i')),
    `scheduleDay` = COALESCE(
        `scheduleDay`,
        CASE DAYOFWEEK(`date`)
            WHEN 1 THEN 'SUNDAY'
            WHEN 2 THEN 'MONDAY'
            WHEN 3 THEN 'TUESDAY'
            WHEN 4 THEN 'WEDNESDAY'
            WHEN 5 THEN 'THURSDAY'
            WHEN 6 THEN 'FRIDAY'
            WHEN 7 THEN 'SATURDAY'
        END
    );

ALTER TABLE `Class`
    MODIFY `endTime` VARCHAR(191) NOT NULL,
    MODIFY `level` VARCHAR(191) NOT NULL,
    MODIFY `scheduleDay` ENUM('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY') NOT NULL,
    MODIFY `subject` VARCHAR(191) NOT NULL,
    MODIFY `teacherId` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE INDEX `Class_scheduleDay_time_idx` ON `Class`(`scheduleDay`, `time`);

-- CreateIndex
CREATE INDEX `Class_status_idx` ON `Class`(`status`);

-- CreateIndex
CREATE INDEX `Class_teacherId_idx` ON `Class`(`teacherId`);

-- AddForeignKey
ALTER TABLE `Class` ADD CONSTRAINT `Class_teacherId_fkey` FOREIGN KEY (`teacherId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

