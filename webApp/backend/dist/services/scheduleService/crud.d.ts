import { AddScheduleInput, UpdateScheduleInput } from "../../services/scheduleService/types";
export declare const addSchedule: (input: AddScheduleInput) => Promise<{
    messageKey: string;
}>;
export declare const updateSchedule: (updates: UpdateScheduleInput) => Promise<boolean>;
export declare const removeSchedule: (scheduleId: string) => Promise<void>;
//# sourceMappingURL=crud.d.ts.map