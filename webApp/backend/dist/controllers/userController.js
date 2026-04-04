"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const userServices_1 = require("../services/userServices");
const userService = new userServices_1.UserService();
const busService_1 = require("../services/busService");
const busService = new busService_1.BusService();
const messageTemplate_1 = require("../exceptions/messageTemplate");
const controllerErrorMapper_1 = require("./controllerErrorMapper");
const errors_1 = require("../errors");
//============================================================================================================================================================
class UserController {
    // =================================================================================================================================
    // update language
    //===================================================================================================================    
    async changeLanguage(req, res) {
        try {
            const userId = req.user?.id;
            if (userId == null) {
                throw new errors_1.UnauthorizedError('common.auth.sessionExpired');
            }
            const result = await userService.changeLanguage(userId, req.body?.language);
            (0, messageTemplate_1.sendResponse)(res, 200, result.messageKey);
            return;
        }
        catch (error) {
            (0, controllerErrorMapper_1.handleControllerError)(res, error);
            return;
        }
    }
    // =================================================================================================================================
    // update apperacne 
    //===================================================================================================================    
    async changeAppearance(req, res) {
        try {
            const userId = req.user?.id;
            if (userId == null) {
                throw new errors_1.UnauthorizedError('common.auth.sessionExpired');
            }
            const result = await userService.changeAppearance(userId, req.body?.appearance);
            (0, messageTemplate_1.sendResponse)(res, 200, result.messageKey);
            return;
        }
        catch (error) {
            (0, controllerErrorMapper_1.handleControllerError)(res, error);
            return;
        }
    }
}
exports.UserController = UserController;
//# sourceMappingURL=userController.js.map