"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScheduleController = void 0;
const scheduleService_1 = require("../services/scheduleService");
const scheduleService = new scheduleService_1.ScheduleService();
const messageTemplate_1 = require("../exceptions/messageTemplate");
const controllerErrorMapper_1 = require("./controllerErrorMapper");
const scheduleHelper_1 = require("../helpers/scheduleHelper");
const schedulehelper = new scheduleHelper_1.ScheduleHelper();
//============================================================================================================================================================
//? Class
//============================================================================================================================================================
class ScheduleController {
    // ==================================================================
    //? Get Schedule 
    // ================================================================== 
    async getSchedule(req, res) {
        try {
            const params = {};
            // decode query parameters
            if (typeof req.query.date === 'string')
                params.date = req.query.date.trim();
            if (typeof req.query.servicePatternId === 'string')
                params.servicePatternId = req.query.servicePatternId.trim();
            if (typeof req.query.fromDate === 'string')
                params.fromDate = req.query.fromDate.trim();
            if (typeof req.query.toDate === 'string')
                params.toDate = req.query.toDate.trim();
            const data = await scheduleService.getSchedule(params);
            (0, messageTemplate_1.sendResponse)(res, 200, null, data);
            return;
        }
        catch (error) {
            (0, controllerErrorMapper_1.handleControllerError)(res, error);
            return;
        }
    }
    // ==================================================================
    //? Get User Schedule 
    // ================================================================== 
    async getUserSchedule(req, res) {
        try {
            const params = {};
            if (typeof req.query.date === 'string')
                params.date = req.query.date.trim();
            if (typeof req.query.servicePatternId === 'string')
                params.servicePatternId = req.query.servicePatternId.trim();
            if (typeof req.query.fromDate === 'string')
                params.fromDate = req.query.fromDate.trim();
            if (typeof req.query.toDate === 'string')
                params.toDate = req.query.toDate.trim();
            const data = await scheduleService.getUserSchedule(params);
            (0, messageTemplate_1.sendResponse)(res, 200, null, data);
            return;
        }
        catch (error) {
            (0, controllerErrorMapper_1.handleControllerError)(res, error);
            return;
        }
    }
    // ==================================================================
    //? Get Today User Schedule (widget in admin dashboard)
    // ==================================================================
    async getTodayUserSchedule(req, res) {
        try {
            const now = new Date();
            const two = (v) => String(v).padStart(2, '0');
            const today = `${now.getFullYear()}-${two(now.getMonth() + 1)}-${two(now.getDate())}`;
            const data = await scheduleService.getUserSchedule({ date: today });
            (0, messageTemplate_1.sendResponse)(res, 200, null, data);
            return;
        }
        catch (error) {
            (0, controllerErrorMapper_1.handleControllerError)(res, error);
            return;
        }
    }
    // ==================================================================
    //? Add Schedule 
    // ================================================================== 
    async addSchedule(req, res) {
        try {
            const body = req.body || {};
            const date = typeof body.date === 'string' ? body.date.trim() : '';
            const servicePatternId = typeof body.servicePatternId === 'string' ? body.servicePatternId.trim() : '';
            if (!date || !servicePatternId) {
                (0, messageTemplate_1.sendResponse)(res, 500, 'common.errors.validation.fillAllFields');
                return;
            }
            const day = schedulehelper.calcDayFromDate(date);
            if (!day) {
                (0, messageTemplate_1.sendResponse)(res, 500, 'schedule.errors.invalidDate');
                return;
            }
            await scheduleService.addSchedule({ date, day, servicePatternId });
            (0, messageTemplate_1.sendResponse)(res, 200, 'common.crud.added');
            return;
            // ---------------------------------------------------------
        }
        catch (error) {
            (0, controllerErrorMapper_1.handleControllerError)(res, error);
            return;
        }
    }
    // ==================================================================
    //? Update Schedule 
    // ================================================================== 
    async updateSchedule(req, res) {
        try {
            const body = req.body || {};
            const scheduleId = typeof body.scheduleId === 'string' ? body.scheduleId.trim() : '';
            if (!scheduleId) {
                (0, messageTemplate_1.sendResponse)(res, 500, 'common.errors.validation.required');
                return;
            }
            const updates = { scheduleId };
            if (body.date) {
                const date = String(body.date).trim();
                const day = schedulehelper.calcDayFromDate(date);
                if (!day) {
                    (0, messageTemplate_1.sendResponse)(res, 500, 'schedule.errors.invalidDate');
                    return;
                }
                updates.date = date;
                updates.day = day;
            }
            if (body.servicePatternId) {
                updates.servicePatternId = String(body.servicePatternId).trim();
            }
            const updated = await scheduleService.updateSchedule(updates);
            (0, messageTemplate_1.sendResponse)(res, 200, updated ? 'common.crud.updated' : 'common.crud.noChanges');
            return;
            // ---------------------------------------------------------
        }
        catch (error) {
            (0, controllerErrorMapper_1.handleControllerError)(res, error);
            return;
        }
    }
    // ==================================================================
    //? Remove Schedule 
    // ================================================================== 
    async removeSchedule(req, res) {
        try {
            const scheduleId = typeof req.body?.scheduleId === 'string' ? req.body.scheduleId.trim() : '';
            if (!scheduleId) {
                (0, messageTemplate_1.sendResponse)(res, 500, 'common.errors.validation.required');
                return;
            }
            await scheduleService.removeSchedule(scheduleId);
            (0, messageTemplate_1.sendResponse)(res, 200, 'common.crud.removed');
            return;
            // ---------------------------------------------------------
        }
        catch (error) {
            (0, controllerErrorMapper_1.handleControllerError)(res, error);
            return;
        }
    }
    //===================================================================================================
    //? Scheduled Trips
    //===================================================================================================
    // Upsert Scheduled Trip --------------------------------------------------------------------------------------
    async upsertScheduledTrip(req, res) {
        try {
            const body = (req.body ?? {});
            const scheduleId = typeof body.scheduleId === 'string' ? body.scheduleId.trim() : '';
            const time = schedulehelper.normalizeTime(body.time);
            const routeId = typeof body.routeId === 'string' ? body.routeId.trim() : '';
            const driverId = typeof body.driverId === 'string' ? body.driverId.trim() : '';
            const busId = typeof body.busId === 'string' ? body.busId.trim() : '';
            if (!scheduleId || !time || !routeId || !driverId || !busId) {
                (0, messageTemplate_1.sendResponse)(res, 500, 'common.errors.validation.fillAllFields');
                return;
            }
            const messageKey = await scheduleService.upsertScheduledTrip({ scheduleId, time, routeId, driverId, busId });
            (0, messageTemplate_1.sendResponse)(res, 200, messageKey.messageKey);
            return;
            // ---------------------------------------------------------
        }
        catch (error) {
            (0, controllerErrorMapper_1.handleControllerError)(res, error);
            return;
        }
    }
    // Remove Scheduled Trip --------------------------------------------------------------------------------------
    async removeScheduledTrip(req, res) {
        try {
            const detailedScheduleId = typeof req.body?.detailedScheduleId === 'string' ? req.body.detailedScheduleId.trim() : '';
            if (!detailedScheduleId) {
                (0, messageTemplate_1.sendResponse)(res, 500, 'common.errors.validation.required');
                return;
            }
            await scheduleService.removeScheduledTrip(detailedScheduleId);
            (0, messageTemplate_1.sendResponse)(res, 200, 'tripForm.success.removed');
            return;
            // ---------------------------------------------------------
        }
        catch (error) {
            (0, controllerErrorMapper_1.handleControllerError)(res, error);
            return;
        }
    }
}
exports.ScheduleController = ScheduleController;
//# sourceMappingURL=scheduleController.js.map