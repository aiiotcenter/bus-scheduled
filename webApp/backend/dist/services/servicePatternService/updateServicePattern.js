"use strict";
//======================================================================================================================
//? Importing
//======================================================================================================================
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateServicePattern = void 0;
const servicePatternModel_1 = __importDefault(require("../../models/servicePatternModel"));
const operatingHoursModel_1 = __importDefault(require("../../models/operatingHoursModel"));
const database_1 = require("../../config/database");
const errors_1 = require("../../errors");
const constants_1 = require("./constants");
//======================================================================================================================
const updateServicePattern = async (payload) => {
    const servicePatternIdRaw = payload?.servicePatternId;
    const titleRaw = payload?.title;
    const selectedHoursRaw = payload?.hours;
    const servicePatternId = typeof servicePatternIdRaw === "string" ? servicePatternIdRaw.trim() : "";
    const title = typeof titleRaw === "string" ? titleRaw.trim() : "";
    const hoursArray = Array.isArray(selectedHoursRaw) ? selectedHoursRaw : [];
    if (!servicePatternId) {
        throw new errors_1.ValidationError("servicePatterns.validation.idRequired");
    }
    if (!title) {
        throw new errors_1.ValidationError("servicePatterns.validation.titleRequired");
    }
    if (hoursArray.length === 0) {
        throw new errors_1.ValidationError("servicePatterns.validation.selectAtLeastOneHour");
    }
    const hours = Array.from(new Set(hoursArray
        .map((h) => (typeof h === "number" ? h : Number(h)))
        .filter((h) => Number.isFinite(h) && h >= constants_1.startOperatingHour && h <= 23))).sort((a, b) => a - b);
    if (hours.length === 0) {
        throw new errors_1.ValidationError("servicePatterns.validation.invalidHours");
    }
    const updated = await database_1.sequelize.transaction(async (t) => {
        const pattern = await servicePatternModel_1.default.findOne({ where: { servicePatternId }, transaction: t });
        if (!pattern) {
            return null;
        }
        await servicePatternModel_1.default.update({ title }, {
            where: { servicePatternId },
            transaction: t,
        });
        await operatingHoursModel_1.default.destroy({
            where: { servicePatternId },
            transaction: t,
        });
        const createdOperatingHours = [];
        for (const h of hours) {
            let operatingHourId;
            do {
                const id = Math.floor(100 + Math.random() * 900);
                operatingHourId = `O${id}`;
            } while ((await operatingHoursModel_1.default.count({ where: { operatingHourId }, transaction: t })) !== 0);
            const minute = h === 6 ? constants_1.startOperatingMinuteLabel : constants_1.operatingMinuteLabel;
            const hour = `${String(h).padStart(2, "0")}:${minute}:00`;
            await operatingHoursModel_1.default.create({
                operatingHourId,
                servicePatternId,
                hour,
            }, { transaction: t });
            createdOperatingHours.push({ operatingHourId, hour });
        }
        const out = {
            servicePatternId,
            title,
            operatingHours: createdOperatingHours,
        };
        return out;
    });
    if (!updated) {
        throw new errors_1.NotFoundError("servicePatterns.errors.notFound");
    }
    return { messageKey: "servicePatterns.success.updated", data: updated };
};
exports.updateServicePattern = updateServicePattern;
//# sourceMappingURL=updateServicePattern.js.map