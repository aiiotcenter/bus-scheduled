//===================================================================================================
//? Importing
//===================================================================================================
import { ScheduleQueryParams, AddScheduleInput, UpdateScheduleInput, AddScheduledTripInput, AddScheduledTripResult, UpdateScheduledTripInput, UpdateScheduledTripResult } from "./scheduleService/types";

import { getSchedule } from "./scheduleService/getSchedule";
import { getUserSchedule } from "./scheduleService/getUserSchedule";

import { addSchedule, updateSchedule, removeSchedule } from "./scheduleService/crud";

import { addScheduledTrip, removeScheduledTrip, updateScheduledTrip } from "./scheduleService/scheduledTrips";

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
    //? add scheduled trip (POST)
    // Add a trip row to a specific schedule.
    //===================================================================================================

    async addScheduledTrip(input: {
        scheduleId: string;
        time: string;
        routeId: string;
        driverId: string;
        busId: string;
    }): Promise<AddScheduledTripResult> {
        const payload: AddScheduledTripInput = input;
        return addScheduledTrip(payload);
    }

    //===================================================================================================
    //? Remove schedule (Delete)
    //===================================================================================================

    async removeScheduledTrip(detailedScheduleId: string) {
        return removeScheduledTrip(detailedScheduleId);
    }    

    //===================================================================================================
    //? update scheduled trip (PATCH)
    // Update driver/bus for an existing scheduled trip (detailedScheduleId required).
    //===================================================================================================

    async updateScheduledTrip(input: UpdateScheduledTripInput): Promise<UpdateScheduledTripResult> {
        const payload: UpdateScheduledTripInput = input;
        return updateScheduledTrip(payload);
    }



}
