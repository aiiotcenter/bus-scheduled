"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScheduleService = void 0;
const getSchedule_1 = require("./scheduleService/getSchedule");
const getUserSchedule_1 = require("./scheduleService/getUserSchedule");
const crud_1 = require("./scheduleService/crud");
const scheduledTrips_1 = require("./scheduleService/scheduledTrips");
//===================================================================================================
//? schedule class
//===================================================================================================
class ScheduleService {
    //===================================================================================================
    //? Fetch schedule (GET)
    // Fetch schedules with their operating hours timeline and scheduled trips
    //===================================================================================================
    async getSchedule(params) {
        const query = params;
        return (0, getSchedule_1.getSchedule)(query);
    }
    //===================================================================================================
    //? Fetch schedule for users (GET)
    // Fetch schedules with their operating hours timeline and scheduled trips
    // (Simplified output: no driver/bus objects)
    //===================================================================================================
    async getUserSchedule(params) {
        const query = params;
        return (0, getUserSchedule_1.getUserSchedule)(query);
    }
    //===================================================================================================
    //? add schedule (POST)
    // Create schedule row (date + servicePatternId). day is calculated from date.
    //===================================================================================================
    async addSchedule(input) {
        const payload = input;
        return (0, crud_1.addSchedule)(payload);
    }
    //===================================================================================================
    //? update schedule (Patch)
    // Update schedule row. (scheduleId required)
    //===================================================================================================
    async updateSchedule(updates) {
        const payload = updates;
        return (0, crud_1.updateSchedule)(payload);
    }
    //===================================================================================================
    //? Delete schedule (Delete)
    // Delete schedule row (scheduleId). trips are deleted by DB cascade.
    //===================================================================================================
    async removeSchedule(scheduleId) {
        return (0, crud_1.removeSchedule)(scheduleId);
    }
    //===================================================================================================
    //? upsert scheduled trip (POST)
    // Add or Update a trip row to a specific schedule.
    //===================================================================================================
    async upsertScheduledTrip(input) {
        return (0, scheduledTrips_1.upsertScheduledTrip)(input);
    }
    //===================================================================================================
    //? Remove schedule (Delete)
    //===================================================================================================
    async removeScheduledTrip(detailedScheduleId) {
        return (0, scheduledTrips_1.removeScheduledTrip)(detailedScheduleId);
    }
}
exports.ScheduleService = ScheduleService;
//# sourceMappingURL=scheduleService.js.map