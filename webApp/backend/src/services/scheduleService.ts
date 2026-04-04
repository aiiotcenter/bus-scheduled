//===================================================================================================
//? Importing
//===================================================================================================
import { ScheduleQueryParams, AddScheduleInput, UpdateScheduleInput, UpsertScheduledTripInput, UpsertScheduledTripResult } from "./scheduleService/types";

import { getSchedule } from "./scheduleService/getSchedule";
import { getUserSchedule } from "./scheduleService/getUserSchedule";

import { addSchedule, updateSchedule, removeSchedule } from "./scheduleService/crud";

import { upsertScheduledTrip, removeScheduledTrip } from "./scheduleService/scheduledTrips";

//===================================================================================================
//? schedule class
//===================================================================================================

export class ScheduleService {


    //===================================================================================================
    //? Fetch schedule (GET)
    // Fetch schedules with their operating hours timeline and scheduled trips
    //===================================================================================================

    async getSchedule(params: {
        date?: string;
        servicePatternId?: string;
        fromDate?: string;
        toDate?: string;
    }) {
        const query: ScheduleQueryParams = params;
        return getSchedule(query);
    }

    //===================================================================================================
    //? Fetch schedule for users (GET)
    // Fetch schedules with their operating hours timeline and scheduled trips
    // (Simplified output: no driver/bus objects)
    //===================================================================================================

    async getUserSchedule(params: {
        date?: string;
        servicePatternId?: string;
        fromDate?: string;
        toDate?: string;
    }) {
        const query: ScheduleQueryParams = params;
        return getUserSchedule(query);
    }




    
    //===================================================================================================
    //? add schedule (POST)
    // Create schedule row (date + servicePatternId). day is calculated from date.
    //===================================================================================================

    async addSchedule(input: { date: string; day: string; servicePatternId: string }) {
        const payload: AddScheduleInput = input;
        return addSchedule(payload);
    }

    //===================================================================================================
    //? update schedule (Patch)
    // Update schedule row. (scheduleId required)
    //===================================================================================================

    async updateSchedule(updates: { scheduleId: string; date?: string; day?: string; servicePatternId?: string }) {
        const payload: UpdateScheduleInput = updates;
        return updateSchedule(payload);
    }

    //===================================================================================================
    //? Delete schedule (Delete)
    // Delete schedule row (scheduleId). trips are deleted by DB cascade.
    //===================================================================================================

    async removeSchedule(scheduleId: string) {
        return removeSchedule(scheduleId);
    }










    //===================================================================================================
    //? upsert scheduled trip (POST)
    // Add or Update a trip row to a specific schedule.
    //===================================================================================================

    async upsertScheduledTrip(input: UpsertScheduledTripInput): Promise<{ messageKey: string, updated?: boolean}> {
        return upsertScheduledTrip(input);
    }

    //===================================================================================================
    //? Remove schedule (Delete)
    //===================================================================================================

    async removeScheduledTrip(detailedScheduleId: string) {
        return removeScheduledTrip(detailedScheduleId);
    }    




}
