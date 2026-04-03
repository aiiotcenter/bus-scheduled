//======================================================================================================================
//? Importing
//======================================================================================================================

import ServicePatternModel from "../../models/servicePatternModel";
import OperatingHoursModel from "../../models/operatingHoursModel";
import { sequelize } from "../../config/database";

import { NotFoundError, ValidationError } from "../../errors";

import {
    operatingMinuteLabel,
    startOperatingHour,
    startOperatingMinuteLabel,
} from "./constants";

import {
    AddOrUpdateServicePatternPayload,
    OperatingHour,
    ServicePattern,
    ServicePatternServiceResult,
} from "./types";

//======================================================================================================================

export const updateServicePattern = async (
    payload: AddOrUpdateServicePatternPayload
): Promise<ServicePatternServiceResult<ServicePattern>> => {
    const servicePatternIdRaw = payload?.servicePatternId;
    const titleRaw = payload?.title;
    const selectedHoursRaw = payload?.hours;

    const servicePatternId = typeof servicePatternIdRaw === "string" ? servicePatternIdRaw.trim() : "";
    const title = typeof titleRaw === "string" ? titleRaw.trim() : "";
    const hoursArray: unknown[] = Array.isArray(selectedHoursRaw) ? selectedHoursRaw : [];

    if (!servicePatternId) {
        throw new ValidationError("servicePatterns.validation.idRequired");
    }

    if (!title) {
        throw new ValidationError("servicePatterns.validation.titleRequired");
    }

    if (hoursArray.length === 0) {
        throw new ValidationError("servicePatterns.validation.selectAtLeastOneHour");
    }

    const hours = Array.from(
        new Set(
            hoursArray
                .map((h) => (typeof h === "number" ? h : Number(h)))
                .filter((h) => Number.isFinite(h) && h >= startOperatingHour && h <= 23)
        )
    ).sort((a, b) => a - b);

    if (hours.length === 0) {
        throw new ValidationError("servicePatterns.validation.invalidHours");
    }

        const updated = await sequelize.transaction(async (t) => {
            const pattern = await ServicePatternModel.findOne({ where: { servicePatternId }, transaction: t });
            if (!pattern) {
                return null;
            }

            await ServicePatternModel.update(
                { title },
                {
                    where: { servicePatternId },
                    transaction: t,
                }
            );

            await OperatingHoursModel.destroy({
                where: { servicePatternId },
                transaction: t,
            });

            const createdOperatingHours: OperatingHour[] = [];
            for (const h of hours) {
                let operatingHourId: string;
                do {
                    const id = Math.floor(100 + Math.random() * 900);
                    operatingHourId = `O${id}`;
                } while ((await OperatingHoursModel.count({ where: { operatingHourId }, transaction: t })) !== 0);

                const minute = h === 6 ? startOperatingMinuteLabel : operatingMinuteLabel;
                const hour = `${String(h).padStart(2, "0")}:${minute}:00`;

                await OperatingHoursModel.create(
                    {
                        operatingHourId,
                        servicePatternId,
                        hour,
                    },
                    { transaction: t }
                );

                createdOperatingHours.push({ operatingHourId, hour });
            }

            const out: ServicePattern = {
                servicePatternId,
                title,
                operatingHours: createdOperatingHours,
            };

            return out;
        });

        if (!updated) {
            throw new NotFoundError("servicePatterns.errors.notFound");
        }

        return { messageKey: "servicePatterns.success.updated", data: updated };
};
