//======================================================================================================================
//? Importing
//======================================================================================================================
import {
    AddOrUpdateServicePatternPayload,
    ServicePattern,
    ServicePatternServiceResult,
} from "./servicePatternService/types";

import { getServicePatterns } from "./servicePatternService/getServicePatterns";
import { addServicePattern } from "./servicePatternService/addServicePattern";
import { updateServicePattern } from "./servicePatternService/updateServicePattern";
import { deleteServicePattern } from "./servicePatternService/deleteServicePattern";

//======================================================================================================================
//? Types
//======================================================================================================================

//======================================================================================================================
//? Service
//======================================================================================================================

export class ServicePatternService {

    //==================================================================================================================
    //? Fetch all service patterns with their operating hours
    //==================================================================================================================
    async getServicePatterns(): Promise<{ messageKey: string; data: ServicePattern[] }> {
        return getServicePatterns();
    }

    //==================================================================================================================
    //? Add service pattern with operating hours
    //==================================================================================================================
    async addServicePattern(payload: AddOrUpdateServicePatternPayload): Promise<ServicePatternServiceResult<ServicePattern>> {
        return addServicePattern(payload);
    }

    //==================================================================================================================
    //? Update service pattern (title + operating hours)
    //==================================================================================================================
    async updateServicePattern(payload: AddOrUpdateServicePatternPayload): Promise<ServicePatternServiceResult<ServicePattern>> {
        return updateServicePattern(payload);
    }

    //==================================================================================================================
    //? Delete service pattern with operating hours
    //==================================================================================================================


    async deleteServicePattern(servicePatternIdRaw: unknown): Promise<{ messageKey: string }> {
        return deleteServicePattern(servicePatternIdRaw);
    }
    //============================================================================================================================
    //============================================================================================================================
}

