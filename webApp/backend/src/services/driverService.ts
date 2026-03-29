//===================================================================================================
//? Importing
//===================================================================================================

//import models
import UserModel from "../models/userModel";
import ScheduledTripsModel from "../models/scheduledTripsModel";
import ScheduleModel from "../models/scheduleModel";
import RouteModel from "../models/routeModel";
import BusModel from "../models/busModel";

//import Enums
import {role, gender, status} from '../enums/userEnum';

// import exceptions 
import { ConflictError, InternalError, NotFoundError, ValidationError } from '../errors';

// services 
import AuthService from './authService';
const authService = new AuthService();

// helpers 
import { UserHelper } from "../helpers/userHelper";
const helper = new UserHelper();

import { ScheduleHelper } from "../helpers/scheduleHelper";
const scheduleHelper = new ScheduleHelper();

import { normalizeColorToArgbInt } from "../helpers/colorHelper";

import { Op } from "sequelize";

//===================================================================================================

export class DriverService{  

    //===================================================================================================
    //? function to Add Driver
    //===================================================================================================

    async addDriver(payload: Record<string, any>): Promise<{ messageKey: string }> {
        try {
            await helper.add(UserModel, payload, {
                nonDuplicateFields: ['email'],

                enumFields: [
                    { field: "status", enumObj: status },
                    { field: "role", enumObj: role },
                    { field: "gender", enumObj: gender }
                ],
                transform: async (data) => {
                    const out = { ...data };
                    if (out.email) out.email = out.email.toLowerCase().trim();
                    if (!out.status) out.status = status.active;
                    return out;
                },
            });

            // Send validation email
            if (payload?.email) {
                await authService.sendValidateEmail(String(payload.email));
            }

            return { messageKey: 'drivers.success.added' };
        
        // --------------------------------------------------------
        } catch (error) {
            if (error instanceof ValidationError) {
                throw error;
            }
            if (error instanceof ConflictError) {
                throw new ConflictError('common.errors.validation.duplicateEmail');
            }
            if (error instanceof NotFoundError) {
                throw error;
            }
            throw error;
        }
    }



    //===================================================================================================
    //? function to Remove Driver
    //===================================================================================================

    async removeDriver(driverId: unknown): Promise<{ messageKey: string }> {

            await helper.remove(UserModel, 'id', String(driverId));

            return { messageKey: 'common.crud.removed' }
    }

    //===================================================================================================
    //? function to Update Driver
    //===================================================================================================
    async updateDriver(payload: Record<string, any>): Promise<{ updated: boolean; messageKey: string }> {
 
        const result = await helper.update(UserModel, payload, {
            nonDuplicateFields: ["email"],
            enumFields: [
                { field: "status", enumObj: status },
                { field: "role", enumObj: role },
                { field: "gender", enumObj: gender },
            ]
          }
        );

        return {
            updated: result.updated,
            messageKey: result.updated ? 'common.crud.updated' : 'common.crud.noChanges'
        };
   
    }

    //===================================================================================================
    //? function fetch All/ Active drivers 
    //===================================================================================================

    async fetchDrivers(displayAll: boolean, driverId?: unknown): Promise<{ messageKey: string; data: unknown}> {
            const id = typeof driverId === 'string' ? driverId.trim() : '';

            let drivers; 

            if( displayAll){

             drivers = await UserModel.findAll({
                where: id
                    ? { role: role.driver, id }
                    : { role: role.driver },
                attributes: ['id', 'name', 'gender', 'birthDate', 'phone', 'email', 'licenseNumber', 'licenseExpiryDate', 'status']
             });   

            // view only active drivers ------------------------------------------------------
            } else{
                drivers = await UserModel.findAll({
                    attributes: ['id', 'name', 'gender', 'birthDate', 'phone', 'email', 'licenseNumber', 'licenseExpiryDate', 'status'],
                    where: {
                        role: role.driver,
                        status: status.active
                    }            
                });   

            }
            
            

            return { messageKey: 'drivers.success.fetched', data: drivers };
    }

    //===================================================================================================
    //? function to Fetch Driver Profile
    //===================================================================================================

    async fetchDriverProfile(driverId: unknown): Promise<{ messageKey: string; data: unknown }> {
            const id = String(driverId ?? '').trim();
            if (!id) {
                throw new ValidationError('common.errors.validation.required');
            }

            const driver = await UserModel.findOne({
                where: { id, role: role.driver },
                attributes: ['id', 'name', 'phone', 'language', 'appearance'],
            });

            if (!driver) {
                throw new NotFoundError('common.errors.notFound');
            }

            return { messageKey: 'drivers.success.fetched', data: driver };
    }

    //===================================================================================================
    //? function to Fetch Specific Driver's Schedule (from today onwards)
    //===================================================================================================

    async fetchDriverSchedule(driverId: unknown): Promise<{ messageKey: string; data: unknown }> {
        const id = String(driverId ?? '').trim();
        if (!id) {
            throw new ValidationError('common.errors.validation.required');
        }

        const today = new Date();
        const todayStr = today.toISOString().split('T')[0] ?? '';

        const trips = await ScheduledTripsModel.findAll({
            where: { driverId: id },
            attributes: ["detailedScheduleId", "scheduleId", "time", "routeId", "driverId", "busId"],
            include: [
                {
                    model: ScheduleModel,
                    as: "schedule",
                    attributes: ["scheduleId", "date", "day"],
                    where: {
                        date: { [Op.gte]: todayStr },
                    },
                    required: true,
                },
                {
                    model: RouteModel,
                    as: "route",
                    attributes: ["id", "title", "color"],
                },
                {
                    model: BusModel,
                    as: "bus",
                    attributes: ["id", "plate"],
                },
            ],
            // 
            order: [
                [{ model: ScheduleModel, as: "schedule" }, "date", "ASC"],
                ["time", "ASC"],
            ],
        });

        const byDay = new Map<
            string,
            {
                date: string;
                day: string;
                driverId: string;
                scheduleDetails: Array<{ time: string; routeName: string; routeColor: string; routeColorInt: number; busId: string; busPlate: string }>;
            }
        >();

        for (const row of trips as any[]) {
            const scheduleDate = row?.schedule?.date;

            const dateStr = scheduleHelper.formatDateForMobileUi(scheduleDate);
            const dayStr = typeof row?.schedule?.day === 'string' ? row.schedule.day.trim() : '';
            
            const key = `${dateStr}|${dayStr}`;

            if (!byDay.has(key)) {
                byDay.set(key, {
                    date: dateStr,
                    day: dayStr,
                    driverId: id,
                    scheduleDetails: [],
                });
            }

            const time = scheduleHelper.normalizeTimeToHourMinute(row?.time);
            
            const routeName = typeof row?.route?.title === 'string' ? row.route.title.trim() : '';
            const busIdStr = typeof row?.bus?.id === 'string' ? row.bus.id.trim() : '';
            const busPlate = typeof row?.bus?.plate === 'string' ? row.bus.plate.trim() : '';
            const routeColor = typeof row?.route?.color === 'string' ? row.route.color.trim() : '';
            const routeColorInt = normalizeColorToArgbInt(row?.route?.color);

            byDay.get(key)!.scheduleDetails.push({
                time,
                routeName,
                routeColor,
                routeColorInt,
                busId: busIdStr,
                busPlate,
            });
        }

        return {
            messageKey: 'drivers.success.fetched',
            data: Array.from(byDay.values()),
        };
    }
}
