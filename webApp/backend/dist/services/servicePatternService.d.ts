import { AddOrUpdateServicePatternPayload, ServicePattern, ServicePatternServiceResult } from "./servicePatternService/types";
export declare class ServicePatternService {
    getServicePatterns(): Promise<{
        messageKey: string;
        data: ServicePattern[];
    }>;
    addServicePattern(payload: AddOrUpdateServicePatternPayload): Promise<ServicePatternServiceResult<ServicePattern>>;
    updateServicePattern(payload: AddOrUpdateServicePatternPayload): Promise<ServicePatternServiceResult<ServicePattern>>;
    deleteServicePattern(servicePatternIdRaw: unknown): Promise<{
        messageKey: string;
    }>;
}
//# sourceMappingURL=servicePatternService.d.ts.map