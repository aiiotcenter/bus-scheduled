"use strict";
//===================================================================================================
//? Import
//===================================================================================================
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeSchedule = exports.updateSchedule = exports.addSchedule = void 0;
const scheduleModel_1 = __importDefault(require("../../models/scheduleModel"));
//helper
const userHelper_1 = require("../../helpers/userHelper");
const userHelper = new userHelper_1.UserHelper();
//===================================================================================================
const addSchedule = async (input) => {
    await userHelper.add(scheduleModel_1.default, { date: input.date, day: input.day, servicePatternId: input.servicePatternId });
    return { messageKey: "schedule.success.added" };
};
exports.addSchedule = addSchedule;
const updateSchedule = async (updates) => {
    const result = await userHelper.update(scheduleModel_1.default, updates);
    return result.updated;
};
exports.updateSchedule = updateSchedule;
const removeSchedule = async (scheduleId) => {
    await userHelper.remove(scheduleModel_1.default, "scheduleId", scheduleId);
};
exports.removeSchedule = removeSchedule;
//# sourceMappingURL=crud.js.map