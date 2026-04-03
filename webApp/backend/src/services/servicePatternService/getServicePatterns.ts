//======================================================================================================================
//? Importing
//======================================================================================================================

import ServicePatternModel from "../../models/servicePatternModel";
import OperatingHoursModel from "../../models/operatingHoursModel";

import { ServicePattern, ServicePatternServiceResult } from "./types";

//======================================================================================================================

export const getServicePatterns = async (): Promise<ServicePatternServiceResult<ServicePattern[]>> => {
    const rows = await ServicePatternModel.findAll({
        attributes: ["servicePatternId", "title"],
        include: [
            {
                model: OperatingHoursModel,
                as: "operatingHours",
                attributes: ["operatingHourId", "hour"],
            },
        ],
        order: [
            ["servicePatternId", "ASC"],
            [{ model: OperatingHoursModel, as: "operatingHours" }, "hour", "ASC"],
        ],
    });

    const data: ServicePattern[] = rows.map((row) => {
        const operatingHoursRaw = (row as unknown as { operatingHours?: Array<{ operatingHourId: string; hour: string }> }).operatingHours ?? [];

        return {
            servicePatternId: (row as any).servicePatternId,
            title: (row as any).title,
            operatingHours: operatingHoursRaw.map((oh) => ({
                operatingHourId: oh.operatingHourId,
                hour: String(oh.hour),
            })),
        };
    });

    return { messageKey: "common.crud.fetched", data };
};
