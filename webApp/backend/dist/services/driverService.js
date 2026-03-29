"use strict";
//===================================================================================================
//? Importing
//===================================================================================================
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DriverService = void 0;
//import models
const userModel_1 = __importDefault(require("../models/userModel"));
const scheduledTripsModel_1 = __importDefault(require("../models/scheduledTripsModel"));
const scheduleModel_1 = __importDefault(require("../models/scheduleModel"));
const routeModel_1 = __importDefault(require("../models/routeModel"));
const busModel_1 = __importDefault(require("../models/busModel"));
//import Enums
const userEnum_1 = require("../enums/userEnum");
// import exceptions 
const errors_1 = require("../errors");
// services 
const authService_1 = __importDefault(require("./authService"));
const authService = new authService_1.default();
// helpers 
const userHelper_1 = require("../helpers/userHelper");
const helper = new userHelper_1.UserHelper();
const scheduleHelper_1 = require("../helpers/scheduleHelper");
const scheduleHelper = new scheduleHelper_1.ScheduleHelper();
const colorHelper_1 = require("../helpers/colorHelper");
const sequelize_1 = require("sequelize");
//===================================================================================================
class DriverService {
    //===================================================================================================
    //? function to Add Driver
    //===================================================================================================
    async addDriver(payload) {
        try {
            await helper.add(userModel_1.default, payload, {
                nonDuplicateFields: ['email'],
                enumFields: [
                    { field: "status", enumObj: userEnum_1.status },
                    { field: "role", enumObj: userEnum_1.role },
                    { field: "gender", enumObj: userEnum_1.gender }
                ],
                transform: async (data) => {
                    const out = { ...data };
                    if (out.email)
                        out.email = out.email.toLowerCase().trim();
                    if (!out.status)
                        out.status = userEnum_1.status.active;
                    return out;
                },
            });
            // Send validation email
            if (payload?.email) {
                await authService.sendValidateEmail(String(payload.email));
            }
            return { messageKey: 'drivers.success.added' };
            // --------------------------------------------------------
        }
        catch (error) {
            if (error instanceof errors_1.ValidationError) {
                throw error;
            }
            if (error instanceof errors_1.ConflictError) {
                throw new errors_1.ConflictError('common.errors.validation.duplicateEmail');
            }
            if (error instanceof errors_1.NotFoundError) {
                throw error;
            }
            throw error;
        }
    }
    //===================================================================================================
    //? function to Remove Driver
    //===================================================================================================
    async removeDriver(driverId) {
        await helper.remove(userModel_1.default, 'id', String(driverId));
        return { messageKey: 'common.crud.removed' };
    }
    //===================================================================================================
    //? function to Update Driver
    //===================================================================================================
    async updateDriver(payload) {
        const result = await helper.update(userModel_1.default, payload, {
            nonDuplicateFields: ["email"],
            enumFields: [
                { field: "status", enumObj: userEnum_1.status },
                { field: "role", enumObj: userEnum_1.role },
                { field: "gender", enumObj: userEnum_1.gender },
            ]
        });
        return {
            updated: result.updated,
            messageKey: result.updated ? 'common.crud.updated' : 'common.crud.noChanges'
        };
    }
    //===================================================================================================
    //? function fetch All/ Active drivers 
    //===================================================================================================
    async fetchDrivers(displayAll, driverId) {
        const id = typeof driverId === 'string' ? driverId.trim() : '';
        let drivers;
        if (displayAll) {
            drivers = await userModel_1.default.findAll({
                where: id
                    ? { role: userEnum_1.role.driver, id }
                    : { role: userEnum_1.role.driver },
                attributes: ['id', 'name', 'gender', 'birthDate', 'phone', 'email', 'licenseNumber', 'licenseExpiryDate', 'status']
            });
            // view only active drivers ------------------------------------------------------
        }
        else {
            drivers = await userModel_1.default.findAll({
                attributes: ['id', 'name', 'gender', 'birthDate', 'phone', 'email', 'licenseNumber', 'licenseExpiryDate', 'status'],
                where: {
                    role: userEnum_1.role.driver,
                    status: userEnum_1.status.active
                }
            });
        }
        return { messageKey: 'drivers.success.fetched', data: drivers };
    }
    //===================================================================================================
    //? function to Fetch Driver Profile
    //===================================================================================================
    async fetchDriverProfile(driverId) {
        const id = String(driverId ?? '').trim();
        if (!id) {
            throw new errors_1.ValidationError('common.errors.validation.required');
        }
        const driver = await userModel_1.default.findOne({
            where: { id, role: userEnum_1.role.driver },
            attributes: ['id', 'name', 'phone', 'language', 'appearance'],
        });
        if (!driver) {
            throw new errors_1.NotFoundError('common.errors.notFound');
        }
        return { messageKey: 'drivers.success.fetched', data: driver };
    }
    //===================================================================================================
    //? function to Fetch Specific Driver's Schedule (from today onwards)
    //===================================================================================================
    async fetchDriverSchedule(driverId) {
        const id = String(driverId ?? '').trim();
        if (!id) {
            throw new errors_1.ValidationError('common.errors.validation.required');
        }
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0] ?? '';
        const trips = await scheduledTripsModel_1.default.findAll({
            where: { driverId: id },
            attributes: ["detailedScheduleId", "scheduleId", "time", "routeId", "driverId", "busId"],
            include: [
                {
                    model: scheduleModel_1.default,
                    as: "schedule",
                    attributes: ["scheduleId", "date", "day"],
                    where: {
                        date: { [sequelize_1.Op.gte]: todayStr },
                    },
                    required: true,
                },
                {
                    model: routeModel_1.default,
                    as: "route",
                    attributes: ["id", "title", "color"],
                },
                {
                    model: busModel_1.default,
                    as: "bus",
                    attributes: ["id", "plate"],
                },
            ],
            // 
            order: [
                [{ model: scheduleModel_1.default, as: "schedule" }, "date", "ASC"],
                ["time", "ASC"],
            ],
        });
        const byDay = new Map();
        for (const row of trips) {
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
            const routeColorInt = (0, colorHelper_1.normalizeColorToArgbInt)(row?.route?.color);
            byDay.get(key).scheduleDetails.push({
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
exports.DriverService = DriverService;
//# sourceMappingURL=driverService.js.map