"use strict";
//======================================================================================================================
//? Importing
//======================================================================================================================
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteServicePattern = void 0;
const servicePatternModel_1 = __importDefault(require("../../models/servicePatternModel"));
const operatingHoursModel_1 = __importDefault(require("../../models/operatingHoursModel"));
const scheduleModel_1 = __importDefault(require("../../models/scheduleModel"));
const scheduledTripsModel_1 = __importDefault(require("../../models/scheduledTripsModel"));
const database_1 = require("../../config/database");
const errors_1 = require("../../errors");
//======================================================================================================================
const deleteServicePattern = async (servicePatternIdRaw) => {
    const servicePatternId = typeof servicePatternIdRaw === "string" ? servicePatternIdRaw.trim() : "";
    if (!servicePatternId) {
        throw new errors_1.ValidationError("servicePatterns.validation.idRequired");
    }
    const deleted = await database_1.sequelize.transaction(async (t) => {
        const pattern = await servicePatternModel_1.default.findOne({
            where: { servicePatternId },
            transaction: t,
        });
        if (!pattern) {
            return false;
        }
        // delete all scheduled trips with this schedule
        const schedules = await scheduleModel_1.default.findAll({
            where: { servicePatternId },
            attributes: ["scheduleId"],
            transaction: t,
        });
        const scheduleIds = schedules.map((s) => s.scheduleId).filter(Boolean);
        if (scheduleIds.length > 0) {
            await scheduledTripsModel_1.default.destroy({
                where: { scheduleId: scheduleIds },
                transaction: t,
            });
        }
        await scheduleModel_1.default.destroy({
            where: { servicePatternId },
            transaction: t,
        });
        // delete all operating hours with this service pattern
        await operatingHoursModel_1.default.destroy({
            where: { servicePatternId },
            transaction: t,
        });
        await servicePatternModel_1.default.destroy({
            where: { servicePatternId },
            transaction: t,
        });
        return true;
    });
    if (!deleted) {
        throw new errors_1.NotFoundError("servicePatterns.errors.notFound");
    }
    return { messageKey: "servicePatterns.success.deleted" };
};
exports.deleteServicePattern = deleteServicePattern;
//# sourceMappingURL=deleteServicePattern.js.map