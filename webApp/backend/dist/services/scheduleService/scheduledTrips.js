"use strict";
//===================================================================================================
//? Import
//===================================================================================================
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upsertScheduledTrip = exports.removeScheduledTrip = void 0;
const sequelize_1 = require("sequelize");
const scheduleModel_1 = __importDefault(require("../../models/scheduleModel"));
const scheduledTripsModel_1 = __importDefault(require("../../models/scheduledTripsModel"));
//helper
const userHelper_1 = require("../../helpers/userHelper");
const userHelper = new userHelper_1.UserHelper();
const errors_1 = require("../../errors");
//===================================================================================================
// ===========================================================================
//? function to remove data
// ===========================================================================
const removeScheduledTrip = async (detailedScheduleId) => {
    if (!detailedScheduleId) {
        throw new errors_1.ValidationError("common.errors.validation.fillAllFields");
    }
    await userHelper.remove(scheduledTripsModel_1.default, 'detailedScheduleId', String(detailedScheduleId));
    return { messageKey: 'tripForm.success.removed' };
};
exports.removeScheduledTrip = removeScheduledTrip;
// ===========================================================================
//? function to upsert data (Add or Update)
// ===========================================================================
const upsertScheduledTrip = async (input) => {
    if (!input || !input.scheduleId || !input.time || !input.routeId || !input.driverId || !input.busId) {
        throw new errors_1.ValidationError("common.errors.validation.fillAllFields");
    }
    const scheduleExists = await scheduleModel_1.default.findOne({
        where: { scheduleId: input.scheduleId },
        attributes: ["scheduleId"],
    });
    if (!scheduleExists) {
        throw new errors_1.NotFoundError("schedule.errors.notFound");
    }
    const existingTrip = await scheduledTripsModel_1.default.findOne({
        where: { scheduleId: input.scheduleId, time: input.time, routeId: input.routeId },
        attributes: ["detailedScheduleId", "driverId", "busId"],
    });
    const occupied = await scheduledTripsModel_1.default.findOne({
        where: {
            scheduleId: input.scheduleId,
            time: input.time,
            ...(existingTrip ? { detailedScheduleId: { [sequelize_1.Op.ne]: existingTrip.detailedScheduleId } } : {}),
            [sequelize_1.Op.or]: [{ driverId: input.driverId }, { busId: input.busId }],
        },
        attributes: ["detailedScheduleId", "driverId", "busId"],
    });
    if (occupied) {
        if (occupied.driverId === input.driverId) {
            throw new errors_1.ConflictError("tripForm.errors.driverNotAvailable");
        }
        if (occupied.busId === input.busId) {
            throw new errors_1.ConflictError("tripForm.errors.busNotAvailable");
        }
        throw new errors_1.ConflictError("tripForm.errors.unexpectedConflictState");
    }
    if (existingTrip) {
        const result = await userHelper.update(scheduledTripsModel_1.default, {
            detailedScheduleId: existingTrip.detailedScheduleId,
            driverId: input.driverId,
            busId: input.busId
        });
        return {
            messageKey: result.updated ? 'tripForm.success.updated' : 'tripForm.errors.notUpdated',
            updated: result.updated
        };
    }
    await userHelper.add(scheduledTripsModel_1.default, {
        scheduleId: input.scheduleId,
        time: input.time,
        routeId: input.routeId,
        driverId: input.driverId,
        busId: input.busId,
    });
    return { messageKey: "tripForm.success.saved" };
};
exports.upsertScheduledTrip = upsertScheduledTrip;
//# sourceMappingURL=scheduledTrips.js.map