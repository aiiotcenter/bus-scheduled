//===================================================================================================
//? Types
//===================================================================================================

export type ScheduleQueryParams = {
    date?: string;
    servicePatternId?: string;
    fromDate?: string;
    toDate?: string;
};

export type AddScheduleInput = { date: string; day: string; servicePatternId: string };

export type UpdateScheduleInput = { scheduleId: string; date?: string; day?: string; servicePatternId?: string };

export type UpsertScheduledTripInput = {
    scheduleId: string;
    time: string;
    routeId: string;
    driverId: string;
    busId: string;
};

export type UpsertScheduledTripResult = "tripForm.success.saved" | "tripForm.success.updated";


