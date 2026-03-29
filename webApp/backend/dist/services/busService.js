"use strict";
//==========================================================================================================
//? Import Sections
//==========================================================================================================
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BusService = void 0;
//import models
const busModel_1 = __importDefault(require("../models/busModel"));
//import Enums
const busEnum_1 = require("../enums/busEnum");
const userHelper_1 = require("../helpers/userHelper");
const helper = new userHelper_1.UserHelper();
//===================================================================================================================================================
class BusService {
    //===================================================================================================
    //? function to Add Bus
    //===================================================================================================
    async addBus(payload) {
        await helper.add(busModel_1.default, payload, {
            nonDuplicateFields: ['plate'],
            enumFields: [{ field: "status", enumObj: busEnum_1.status }],
        });
        return { messageKey: 'buses.success.added' };
    }
    //===================================================================================================
    //? function to Remove Bus
    //===================================================================================================
    async removeBus(busId) {
        await helper.remove(busModel_1.default, 'id', String(busId));
        return { messageKey: 'common.crud.removed' };
    }
    // ===================================================================================
    ///? function to update bus data (this is can be used globally, only the new data need to be provided)
    // ========================================================================
    async updateBus(values) {
        const result = await helper.update(busModel_1.default, values, {
            enumFields: [{ field: "status", enumObj: busEnum_1.status }]
        });
        return {
            updated: result.updated,
            messageKey: result.updated ? 'common.crud.updated' : 'common.crud.noChanges'
        };
    }
    //===================================================================================================
    //? function to view All/Operating Buses 
    //===================================================================================================
    async viewBuses(displayAll) {
        let routes = [];
        if (displayAll) {
            routes = await busModel_1.default.findAll({
                attributes: ['id', 'plate', 'brand', 'status']
            });
        }
        else {
            routes = await busModel_1.default.findAll({
                attributes: ['id', 'plate', 'brand', 'status'],
                where: {
                    status: busEnum_1.status.operating,
                }
            });
        }
        return { messageKey: 'common.crud.fetched', data: routes };
    }
}
exports.BusService = BusService;
//# sourceMappingURL=busService.js.map