//===================================================================================================
//? Import
//===================================================================================================

import { Op } from "sequelize";

import ScheduleModel from "../../models/scheduleModel";
import ScheduledTripsModel from "../../models/scheduledTripsModel";

//helper
import { UserHelper } from "../../helpers/userHelper";
const userHelper = new UserHelper();

import { ConflictError, NotFoundError, ValidationError } from "../../errors";

import { UpsertScheduledTripInput, UpsertScheduledTripResult } from "./types";
import scheduledTrips from "@src/seeders/sampleScheduledTrips";

//===================================================================================================


// ===========================================================================
//? function to remove data
// ===========================================================================
export const removeScheduledTrip = async (detailedScheduleId: string): Promise<{messageKey: string}> => {

    if (!detailedScheduleId) {
        throw new ValidationError("common.errors.validation.fillAllFields");
    }
    await userHelper.remove(
        ScheduledTripsModel,
        'detailedScheduleId',
        String(detailedScheduleId)
    );

    return { messageKey: 'tripForm.success.removed'}
};


// ===========================================================================
//? function to upsert data (Add or Update)
// ===========================================================================
export const upsertScheduledTrip = async (input: UpsertScheduledTripInput): Promise<{ messageKey: string, updated?: boolean}> => {
    if (!input || !input.scheduleId || !input.time || !input.routeId || !input.driverId || !input.busId) {
        throw new ValidationError("common.errors.validation.fillAllFields");
    }

    const scheduleExists = await ScheduleModel.findOne({
        where: { scheduleId: input.scheduleId },
        attributes: ["scheduleId"],
    });

    if (!scheduleExists) {
        throw new NotFoundError("schedule.errors.notFound");
    }




    const existingTrip = await ScheduledTripsModel.findOne({
        where: { scheduleId: input.scheduleId, time: input.time, routeId: input.routeId },
        attributes: ["detailedScheduleId", "driverId", "busId"],
    });



    const occupied = await ScheduledTripsModel.findOne({
        where: {
            scheduleId: input.scheduleId,
            time: input.time,
            ...(existingTrip ? { detailedScheduleId: { [Op.ne]: (existingTrip as any).detailedScheduleId } } : {}),
            [Op.or]: [{ driverId: input.driverId }, { busId: input.busId }],
        },
        attributes: ["detailedScheduleId", "driverId", "busId"],
    });

    if (occupied) {
        if ((occupied as any).driverId === input.driverId) {
            throw new ConflictError("tripForm.errors.driverNotAvailable");
        }

        if ((occupied as any).busId === input.busId) {
            throw new ConflictError("tripForm.errors.busNotAvailable");
        }

        throw new ConflictError("tripForm.errors.unexpectedConflictState");
    }

    if (existingTrip) {
        const result = await userHelper.update(
            ScheduledTripsModel, 
            {
                detailedScheduleId: (existingTrip as any).detailedScheduleId,
                driverId: input.driverId, 
                busId: input.busId 
            },
        );

        return {
            messageKey: result.updated ? 'tripForm.success.updated' : 'tripForm.errors.notUpdated',
            updated: result.updated
        };


    }

    await userHelper.add(ScheduledTripsModel, {
        scheduleId: input.scheduleId,
        time: input.time,
        routeId: input.routeId,
        driverId: input.driverId,
        busId: input.busId,
    });

    return {messageKey:"tripForm.success.saved"};
};

