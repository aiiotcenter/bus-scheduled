//===================================================================================================
//? Importing
//===================================================================================================


//import models
import userModel from "../models/userModel";

// import helpers
import { UserHelper } from "../helpers/userHelper";
const userhelper = new UserHelper();

import { BusService } from './busService';
const busService = new BusService();

import authHleper from '../helpers/authHelpher';
const authHelper = new authHleper();


import { ValidationError } from '../errors';

//===================================================================================================



export class UserService{
    //===================================================================================================
    //? function to change app language
    //===================================================================================================

    async changeLanguage(userId: string, language: unknown): Promise<{ updated: boolean; messageKey: string }> {
        if (typeof language !== 'string') {
            throw new ValidationError('common.errors.validation.invalidField');
        }else if (language.trim() === '') {
            throw new ValidationError('common.errors.validation.fillAllFields');
        }

        const result = await userhelper.update(userModel, { id: userId, language: language.trim() });

        return {
            updated: result.updated,
            messageKey: result.updated ? 'common.crud.updated' : 'common.crud.noChanges'
        };
    }


    //===================================================================================================
    //? function to change app apperacne 
    //===================================================================================================

    async changeAppearance(userId: string, appearance: unknown): Promise<{ updated: boolean; messageKey: string }> {
        if (typeof appearance !== 'string') {
            throw new ValidationError('common.errors.validation.invalidField');
        }else if (appearance.trim() === '') {
            throw new ValidationError('common.errors.validation.fillAllFields');
        }

        const result = await userhelper.update(userModel, { id: userId, appearance: appearance.trim() });

        return {
            updated: result.updated,
            messageKey: result.updated ? 'common.crud.updated' : 'common.crud.noChanges'
        };
    }


    // // =================================================================================================================================
    // //? change route (by driver)
    // //===================================================================================================================    

    // async changeRoute(userId: string, payload: Record<string, any>): Promise<{ updated: boolean; messageKey: string }> {
    //     const busId = String(payload?.id ?? '');
        
    //     await authHelper.validateUserById(userId, busId);

    //     return busService.updateBus(payload);
    // }


    // // =================================================================================================================================
    // //? start/ stop bus (by driver)
    // //===================================================================================================================    

    // async updateBusStatus(userId: string, payload: Record<string, any>): Promise<{ updated: boolean; messageKey: string }> {
    //     const busId = String(payload?.id ?? '');
        
    //     await authHelper.validateUserById(userId, busId);

    //     return busService.updateBus(payload);
    // }


}