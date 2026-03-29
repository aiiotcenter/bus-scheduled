//======================================================================================================================
//? Importing
//======================================================================================================================

import ServicePatternModel from "../../models/servicePatternModel";
import OperatingHoursModel from "../../models/operatingHoursModel";
import { sequelize } from "../../config/database";

import { ValidationError } from "../../errors";
import { InternalError } from "../../errors/InternalError";

import {
    endOperatingHour,
    operatingMinuteLabel,
    startOperatingMinuteLabel,
} from "./constants";

import {
    AddOrUpdateServicePatternPayload,
    OperatingHourDto,
    ServicePatternDto,
    ServicePatternServiceResult,
} from "./types";

//======================================================================================================================

export const addServicePattern = async (
    payload: AddOrUpdateServicePatternPayload
): Promise<ServicePatternServiceResult<ServicePatternDto>> => {
    const titleRaw = payload?.title;
    const selectedHoursRaw = payload?.hours;

    const title = typeof titleRaw === "string" ? titleRaw.trim() : "";
    const hoursArray: unknown[] = Array.isArray(selectedHoursRaw) ? selectedHoursRaw : [];

    if (!title) {
        throw new ValidationError("servicePatterns.validation.titleRequired");
    }

    if (hoursArray.length === 0) {
        throw new ValidationError("servicePatterns.validation.selectAtLeastOneHour");
    }

    // normalize to unique sorted ints within 0..23
    const hours = Array.from(
        new Set(
            hoursArray
                .map((h) => (typeof h === "number" ? h : Number(h)))
                .filter((h) => Number.isFinite(h) && h >= 0 && h <= endOperatingHour)
        )
    ).sort((a, b) => a - b);

    if (hours.length === 0) {
        throw new ValidationError("servicePatterns.validation.invalidHours");
    }

        const created = await sequelize.transaction(async (t) => {
            let servicePatternId: string;
            do {
                const id = Math.floor(100 + Math.random() * 900);
                servicePatternId = `S${id}`;
            } while ((await ServicePatternModel.count({ where: { servicePatternId }, transaction: t })) !== 0);

            await ServicePatternModel.create(
                {
                    servicePatternId,
                    title,
                },
                { transaction: t }
            );

            // Create operating hours rows
            const createdOperatingHours: OperatingHourDto[] = [];

            for (const h of hours) {
                let operatingHourId: string;
                do {
                    const id = Math.floor(100 + Math.random() * 900);
                    operatingHourId = `O${id}`;
                } while ((await OperatingHoursModel.count({ where: { operatingHourId }, transaction: t })) !== 0);

                // store as 06:45:00 for hour 6, otherwise HH:15:00
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

            const createdPattern: ServicePatternDto = {
                servicePatternId,
                title,
                operatingHours: createdOperatingHours,
            };

            return createdPattern;
        });

        return { messageKey: "servicePatterns.success.added", data: created };
};
