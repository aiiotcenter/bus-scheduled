import { UpsertScheduledTripInput } from "./types";
export declare const removeScheduledTrip: (detailedScheduleId: string) => Promise<{
    messageKey: string;
}>;
export declare const upsertScheduledTrip: (input: UpsertScheduledTripInput) => Promise<{
    messageKey: string;
    updated?: boolean;
}>;
//# sourceMappingURL=scheduledTrips.d.ts.map