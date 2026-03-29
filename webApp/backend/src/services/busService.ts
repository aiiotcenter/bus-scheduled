//==========================================================================================================
//? Import Sections
//==========================================================================================================

//import models
import BusModel from "../models/busModel";
import UserModel from "../models/userModel";
import RouteModel from "../models/routeModel";

//import Enums
import { status } from '../enums/busEnum';

import { ConflictError, InternalError, NotFoundError, ValidationError } from '../errors';

import { UserHelper } from "../helpers/userHelper";
const helper = new UserHelper();


//===================================================================================================================================================


export class BusService{  

    //===================================================================================================
    //? function to Add Bus
    //===================================================================================================

    async addBus(payload: Record<string, any>): Promise<{ messageKey: string }> {
        
        await helper.add(BusModel, payload, {
            nonDuplicateFields: ['plate'],
            enumFields: [{ field: "status", enumObj: status }],
        });

        return { messageKey: 'buses.success.added' };
    }


    //===================================================================================================
    //? function to Remove Bus
    //===================================================================================================

    async removeBus(busId: unknown): Promise<{ messageKey: string }> {

        await helper.remove(BusModel, 'id', String(busId));

        return { messageKey: 'common.crud.removed' };
    }


    // ===================================================================================
    ///? function to update bus data (this is can be used globally, only the new data need to be provided)
    // ========================================================================
    async updateBus(values: Record<string, any>): Promise<{ updated: boolean; messageKey: string }> {
        
        const result = await helper.update(BusModel, values, {
            enumFields: [{ field: "status", enumObj: status }]
        });

        return {
            updated: result.updated,
            messageKey: result.updated ? 'common.crud.updated' : 'common.crud.noChanges'
        };
    }


    //===================================================================================================
    //? function to view All/Operating Buses 
    //===================================================================================================
    async viewBuses(displayAll: boolean): Promise<{ messageKey: string; data: unknown }> {
        let routes: any[] = [];

        if(displayAll){
            routes = await BusModel.findAll({
                attributes: ['id', 'plate', 'brand',  'status']
            });

        }else{
            routes = await BusModel.findAll({
                attributes: ['id', 'plate', 'brand',  'status'],
                where: {
                    status: status.operating,
                }
            });
            
        }

        return { messageKey: 'common.crud.fetched', data: routes };
    }
 
}
