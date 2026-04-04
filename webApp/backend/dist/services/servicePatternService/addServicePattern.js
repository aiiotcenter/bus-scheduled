"use strict";
//======================================================================================================================
//? Importing
//======================================================================================================================
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addServicePattern = void 0;
const servicePatternModel_1 = __importDefault(require("../../models/servicePatternModel"));
const operatingHoursModel_1 = __importDefault(require("../../models/operatingHoursModel"));
const database_1 = require("../../config/database");
const errors_1 = require("../../errors");
const constants_1 = require("./constants");
//======================================================================================================================
const addServicePattern = async (payload) => {
    const titleRaw = payload?.title;
    const selectedHoursRaw = payload?.hours;
    const title = typeof titleRaw === "string" ? titleRaw.trim() : "";
    const hoursArray = Array.isArray(selectedHoursRaw) ? selectedHoursRaw : [];
    if (!title) {
        throw new errors_1.ValidationError("servicePatterns.validation.titleRequired");
    }
    if (hoursArray.length === 0) {
        throw new errors_1.ValidationError("servicePatterns.validation.selectAtLeastOneHour");
    }
    // normalize to unique sorted ints within 0..23
    const hours = Array.from(new Set(hoursArray
        .map((h) => (typeof h === "number" ? h : Number(h)))
        .filter((h) => Number.isFinite(h) && h >= 0 && h <= constants_1.endOperatingHour))).sort((a, b) => a - b);
    if (hours.length === 0) {
        throw new errors_1.ValidationError("servicePatterns.validation.invalidHours");
    }
    //     
    const created = await database_1.sequelize.transaction(async (t) => {
        let servicePatternId;
        do {
            const id = Math.floor(100 + Math.random() * 900);
            servicePatternId = `S${id}`;
        } while ((await servicePatternModel_1.default.count({ where: { servicePatternId }, transaction: t })) !== 0);
        await servicePatternModel_1.default.create({
            servicePatternId,
            title,
        }, { transaction: t });
        // Create operating hours rows
        const createdOperatingHours = [];
        for (const h of hours) {
            let operatingHourId;
            do {
                const id = Math.floor(100 + Math.random() * 900);
                operatingHourId = `O${id}`;
            } while ((await operatingHoursModel_1.default.count({ where: { operatingHourId }, transaction: t })) !== 0);
            // store as 06:45:00 for hour 6, otherwise HH:15:00
            const minute = h === 6 ? constants_1.startOperatingMinuteLabel : constants_1.operatingMinuteLabel;
            const hour = `${String(h).padStart(2, "0")}:${minute}:00`;
            await operatingHoursModel_1.default.create({
                operatingHourId,
                servicePatternId,
                hour,
            }, { transaction: t });
            createdOperatingHours.push({ operatingHourId, hour });
        }
        const createdPattern = {
            servicePatternId,
            title,
            operatingHours: createdOperatingHours,
        };
        return createdPattern;
    });
    return { messageKey: "servicePatterns.success.added", data: created };
};
exports.addServicePattern = addServicePattern;
//# sourceMappingURL=addServicePattern.js.map