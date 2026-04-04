"use strict";
//===================================================================================================
//? Importing
//===================================================================================================
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
//import models
const userModel_1 = __importDefault(require("../models/userModel"));
// import helpers
const userHelper_1 = require("../helpers/userHelper");
const userhelper = new userHelper_1.UserHelper();
const busService_1 = require("./busService");
const busService = new busService_1.BusService();
const authHelpher_1 = __importDefault(require("../helpers/authHelpher"));
const authHelper = new authHelpher_1.default();
const errors_1 = require("../errors");
//===================================================================================================
class UserService {
    //===================================================================================================
    //? function to change app language
    //===================================================================================================
    async changeLanguage(userId, language) {
        if (typeof language !== 'string') {
            throw new errors_1.ValidationError('common.errors.validation.invalidField');
        }
        else if (language.trim() === '') {
            throw new errors_1.ValidationError('common.errors.validation.fillAllFields');
        }
        const result = await userhelper.update(userModel_1.default, { id: userId, language: language.trim() });
        return {
            updated: result.updated,
            messageKey: result.updated ? 'common.crud.updated' : 'common.crud.noChanges'
        };
    }
    //===================================================================================================
    //? function to change app apperacne 
    //===================================================================================================
    async changeAppearance(userId, appearance) {
        if (typeof appearance !== 'string') {
            throw new errors_1.ValidationError('common.errors.validation.invalidField');
        }
        else if (appearance.trim() === '') {
            throw new errors_1.ValidationError('common.errors.validation.fillAllFields');
        }
        const result = await userhelper.update(userModel_1.default, { id: userId, appearance: appearance.trim() });
        return {
            updated: result.updated,
            messageKey: result.updated ? 'common.crud.updated' : 'common.crud.noChanges'
        };
    }
}
exports.UserService = UserService;
//# sourceMappingURL=userServices.js.map