//============================================================================================================================================================
//?importing 
//============================================================================================================================================================
import { Request, Response } from 'express';

import { ScheduleService } from '../services/scheduleService';
const scheduleService = new ScheduleService();

import { sendResponse } from '../exceptions/messageTemplate';
import { handleControllerError } from './controllerErrorMapper';
import { ScheduleHelper } from '../helpers/scheduleHelper';
const schedulehelper = new ScheduleHelper();

//============================================================================================================================================================
//? Class
//============================================================================================================================================================

export class ScheduleController {

    // ==================================================================
    //? Get Schedule 
    // ================================================================== 
    async getSchedule(req: Request, res: Response) {
        try {
            const params: { date?: string; servicePatternId?: string; fromDate?: string; toDate?: string } = {};

            // decode query parameters
            if (typeof req.query.date === 'string') params.date = req.query.date.trim();
            if (typeof req.query.servicePatternId === 'string') params.servicePatternId = req.query.servicePatternId.trim();
            if (typeof req.query.fromDate === 'string') params.fromDate = req.query.fromDate.trim();
            if (typeof req.query.toDate === 'string') params.toDate = req.query.toDate.trim();

            const data = await scheduleService.getSchedule(params);
            sendResponse(res, 200, null, data as any);
            return;

        } catch (error) {
            handleControllerError(res, error);
            return;
        }
    }

    // ==================================================================
    //? Get User Schedule 
    // ================================================================== 
    async getUserSchedule(req: Request, res: Response) {
        try {
            const params: { date?: string; servicePatternId?: string; fromDate?: string; toDate?: string } = {};

            if (typeof req.query.date === 'string') params.date = req.query.date.trim();
            if (typeof req.query.servicePatternId === 'string') params.servicePatternId = req.query.servicePatternId.trim();
            if (typeof req.query.fromDate === 'string') params.fromDate = req.query.fromDate.trim();
            if (typeof req.query.toDate === 'string') params.toDate = req.query.toDate.trim();

            const data = await scheduleService.getUserSchedule(params);
            sendResponse(res, 200, null, data as any);
            return;

        } catch (error) {
            handleControllerError(res, error);
            return;
        }
    }

    // ==================================================================
    //? Get Today User Schedule (widget in admin dashboard)
    // ==================================================================
    async getTodayUserSchedule(req: Request, res: Response) {
        try {
            const now = new Date();

            const two = (v: number) => String(v).padStart(2, '0');
            const today = `${now.getFullYear()}-${two(now.getMonth() + 1)}-${two(now.getDate())}`;

            const data = await scheduleService.getUserSchedule({ date: today });
            sendResponse(res, 200, null, data as any);
            return;

        } catch (error) {
            handleControllerError(res, error);
            return;
        }
    }

    // ==================================================================
    //? Add Schedule 
    // ================================================================== 
    async addSchedule(req: Request, res: Response) {
        try {
            const body = req.body || {};
            const date = typeof body.date === 'string' ? body.date.trim() : '';
            const servicePatternId = typeof body.servicePatternId === 'string' ? body.servicePatternId.trim() : '';

            if (!date || !servicePatternId) {
                sendResponse(res, 500, 'common.errors.validation.fillAllFields');
                return;
            }

            const day = schedulehelper.calcDayFromDate(date);
            if (!day) {
                sendResponse(res, 500, 'schedule.errors.invalidDate');
                return;
            }

            await scheduleService.addSchedule({ date, day, servicePatternId });
            sendResponse(res, 200, 'common.crud.added');
            return;
        
        // ---------------------------------------------------------
        } catch (error) {
            handleControllerError(res, error);
            return;
        }
    }

    // ==================================================================
    //? Update Schedule 
    // ================================================================== 
    async updateSchedule(req: Request, res: Response) {
        try {
            const body = req.body || {};
            const scheduleId = typeof body.scheduleId === 'string' ? body.scheduleId.trim() : '';
            if (!scheduleId) {
                sendResponse(res, 500, 'common.errors.validation.required');
                return;
            }

            const updates: any = { scheduleId };

            if (body.date) {
                const date = String(body.date).trim();
                const day = schedulehelper.calcDayFromDate(date);
                if (!day) {
                    sendResponse(res, 500, 'schedule.errors.invalidDate');
                    return;
                }
                updates.date = date;
                updates.day = day;
            }

            if (body.servicePatternId) {
                updates.servicePatternId = String(body.servicePatternId).trim();
            }

            const updated = await scheduleService.updateSchedule(updates);
            sendResponse(res, 200, updated ? 'common.crud.updated' : 'common.crud.noChanges');
            return;

        // ---------------------------------------------------------
        } catch (error) {
            handleControllerError(res, error);
            return;
        }
    }


    // ==================================================================
    //? Remove Schedule 
    // ================================================================== 
    async removeSchedule(req: Request, res: Response) {
        try {
            const scheduleId = typeof req.body?.scheduleId === 'string' ? req.body.scheduleId.trim() : '';
            if (!scheduleId) {
                sendResponse(res, 500, 'common.errors.validation.required');
                return;
            }

            await scheduleService.removeSchedule(scheduleId);
            sendResponse(res, 200, 'common.crud.removed');
            return;

        // ---------------------------------------------------------
        } catch (error) {
            handleControllerError(res, error);
            return;
        }
    }

//===================================================================================================
//? Scheduled Trips
//===================================================================================================

    // Upsert Scheduled Trip --------------------------------------------------------------------------------------
    async upsertScheduledTrip(req: Request, res: Response) {
        try {
            const body = (req.body ?? {}) as {
                scheduleId?: unknown;
                time?: unknown;
                routeId?: unknown;
                driverId?: unknown;
                busId?: unknown;
            };

            const scheduleId = typeof body.scheduleId === 'string' ? body.scheduleId.trim() : '';
            const time = schedulehelper.normalizeTime(body.time);
            const routeId = typeof body.routeId === 'string' ? body.routeId.trim() : '';
            const driverId = typeof body.driverId === 'string' ? body.driverId.trim() : '';
            const busId = typeof body.busId === 'string' ? body.busId.trim() : '';

            if (!scheduleId || !time || !routeId || !driverId || !busId) {
                sendResponse(res, 500, 'common.errors.validation.fillAllFields');
                return;
            }

            const messageKey = await scheduleService.upsertScheduledTrip({ scheduleId, time, routeId, driverId, busId });
            sendResponse(res, 200, messageKey.messageKey);
            return;

        // ---------------------------------------------------------
        } catch (error) {
            handleControllerError(res, error);
            return;
        }
    }

    // Remove Scheduled Trip --------------------------------------------------------------------------------------
    async removeScheduledTrip(req: Request, res: Response) {
        try {
            const detailedScheduleId = typeof req.body?.detailedScheduleId === 'string' ? req.body.detailedScheduleId.trim() : '';
            if (!detailedScheduleId) {
                sendResponse(res, 500, 'common.errors.validation.required');
                return;
            }

            await scheduleService.removeScheduledTrip(detailedScheduleId);
            sendResponse(res, 200, 'tripForm.success.removed');
            return;

        // ---------------------------------------------------------
        } catch (error) {
            handleControllerError(res, error);
            return;
        }
    }

}
