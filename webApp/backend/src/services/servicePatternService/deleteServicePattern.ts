//======================================================================================================================
//? Importing
//======================================================================================================================

import ServicePatternModel from "../../models/servicePatternModel";
import OperatingHoursModel from "../../models/operatingHoursModel";
import ScheduleModel from "../../models/scheduleModel";
import ScheduledTripsModel from "../../models/scheduledTripsModel";
import { sequelize } from "../../config/database";

import { NotFoundError, ValidationError } from "../../errors";
import { InternalError } from "../../errors/InternalError";

//======================================================================================================================

export const deleteServicePattern = async (servicePatternIdRaw: unknown): Promise<{ messageKey: string }> => {
    const servicePatternId = typeof servicePatternIdRaw === "string" ? servicePatternIdRaw.trim() : "";

    if (!servicePatternId) {
        throw new ValidationError("servicePatterns.validation.idRequired");
    }

        const deleted = await sequelize.transaction(async (t) => {
            const pattern = await ServicePatternModel.findOne({
                where: { servicePatternId },
                transaction: t,
            });

            if (!pattern) {
                return false;
            }

            // delete all scheduled trips with this schedule
            const schedules = await ScheduleModel.findAll({
                where: { servicePatternId },
                attributes: ["scheduleId"],
                transaction: t,
            });

            const scheduleIds = schedules.map((s: any) => s.scheduleId).filter(Boolean);
            if (scheduleIds.length > 0) {
                await ScheduledTripsModel.destroy({
                    where: { scheduleId: scheduleIds },
                    transaction: t,
                });
            }

            await ScheduleModel.destroy({
                where: { servicePatternId },
                transaction: t,
            });

            // delete all operating hours with this service pattern
            await OperatingHoursModel.destroy({
                where: { servicePatternId },
                transaction: t,
            });

            await ServicePatternModel.destroy({
                where: { servicePatternId },
                transaction: t,
            });

            return true;
        });

        if (!deleted) {
            throw new NotFoundError("servicePatterns.errors.notFound");
        }

        return { messageKey: "servicePatterns.success.deleted" };
};
