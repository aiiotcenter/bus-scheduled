export type OperatingHour = {
    operatingHourId: string;
    hour: string;
};
export type ServicePattern = {
    servicePatternId: string;
    title: string;
    operatingHours: OperatingHour[];
};
export type ServicePatternServiceResult<T> = {
    messageKey: string;
    data: T;
};
export type AddOrUpdateServicePatternPayload = Record<string, unknown>;
//# sourceMappingURL=types.d.ts.map