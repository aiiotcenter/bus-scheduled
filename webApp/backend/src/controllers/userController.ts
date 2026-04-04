//============================================================================================================================================================
//?importing 
//============================================================================================================================================================
import { Request, Response } from 'express';

import { UserService } from '../services/userServices';
const userService = new UserService();

import { BusService } from '../services/busService';
import users from '../seeders/sampleUser';
const busService = new BusService();

import { sendResponse } from '../exceptions/messageTemplate';
import { handleControllerError } from './controllerErrorMapper';
import { UnauthorizedError } from '../errors';
//============================================================================================================================================================


export class UserController{

    // =================================================================================================================================
    // update language
    //===================================================================================================================    

    async changeLanguage(req: Request, res: Response){
        try {
            const userId = req.user?.id;
            if (userId == null) {
                throw new UnauthorizedError('common.auth.sessionExpired');
            }

            const result = await userService.changeLanguage(userId, req.body?.language);
            sendResponse(res, 200, result.messageKey);
            return;
        } catch (error) {
            handleControllerError(res, error);
            return;
        }
    }




    
    // =================================================================================================================================
    // update apperacne 
    //===================================================================================================================    

    async changeAppearance(req: Request, res: Response){
        try {
            const userId = req.user?.id;
            if (userId == null) {
                throw new UnauthorizedError('common.auth.sessionExpired');
            }

            const result = await userService.changeAppearance(userId, req.body?.appearance);
            sendResponse(res, 200, result.messageKey);
            return;
        } catch (error) {
            handleControllerError(res, error);
            return;
        }
    }





}