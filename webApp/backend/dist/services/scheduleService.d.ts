import { UpsertScheduledTripInput } from "./scheduleService/types";
export declare class ScheduleService {
    getSchedule(params: {
        date?: string;
        servicePatternId?: string;
        fromDate?: string;
        toDate?: string;
    }): Promise<{
        scheduleId: any;
        date: any;
        day: any;
        servicePatternId: any;
        servicePattern: any;
        timeline: {
            time: string;
            trips: unknown[];
        }[];
    }[]>;
    getUserSchedule(params: {
        date?: string;
        servicePatternId?: string;
        fromDate?: string;
        toDate?: string;
    }): Promise<{
        dayKey: string;
        date: string;
        servicePatterns: {
            servicePatternId: string;
            title: string;
            operatingTimes: string[];
            routes: {
                routeName: string;
                tabColorValue: number;
                departureTimes: string[];
            }[];
        }[];
    }[]>;
    addSchedule(input: {
        date: string;
        day: string;
        servicePatternId: string;
    }): Promise<void>;
    updateSchedule(updates: {
        scheduleId: string;
        date?: string;
        day?: string;
        servicePatternId?: string;
    }): Promise<boolean>;
    removeSchedule(scheduleId: string): Promise<void>;
    upsertScheduledTrip(input: UpsertScheduledTripInput): Promise<{
        messageKey: string;
        updated?: boolean;
    }>;
    removeScheduledTrip(detailedScheduleId: string): Promise<void>;
}
//# sourceMappingURL=scheduleService.d.ts.map