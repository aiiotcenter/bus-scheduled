"use strict";
//===================================================================================================
//? Importing
//===================================================================================================
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StationService = void 0;
//import models
const stationModel_1 = __importDefault(require("../models/stationModel"));
const routeStationModel_1 = __importDefault(require("../models/routeStationModel"));
const routeModel_1 = __importDefault(require("../models/routeModel"));
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
//import Enums
const stationEnum_1 = require("../enums/stationEnum");
// import helpers
const routeHelper_1 = require("../helpers/routeHelper");
// import helpers
const userHelper_1 = require("../helpers/userHelper");
const helper = new userHelper_1.UserHelper();
//===================================================================================================
class StationService {
    // ==========================================================================================================
    //? function to synchronize default stations to all routes
    // ==========================================================================================================
    async syncDefaultStationsToAllRoutes(options) {
        // fetch default start and end stations
        const startDefaultsResult = await this.fetchDefaultStartStations();
        const endDefaultsResult = await this.fetchDefaultEndStations();
        const startDefaultIds = Array.isArray(startDefaultsResult.data) ? startDefaultsResult.data : [];
        const endDefaultIds = Array.isArray(endDefaultsResult.data) ? endDefaultsResult.data : [];
        // ------------------------------------------------------------------
        // if removedDefaultStationIds is provided, means that a station was reseted as notDefault --- so we have to remove it from all routes that had it as default station
        const removedDefaultStationIds = Array.isArray(options?.removedDefaultStationIds)
            ? options.removedDefaultStationIds
                .map((id) => String(id))
                .map((id) => id.trim())
                .filter((id) => id.length > 0)
            : [];
        // ------------------------------------------------------------------
        const routes = await routeModel_1.default.findAll({ attributes: ['id'] });
        // update all routes
        await database_1.sequelize.transaction(async (t) => {
            for (const route of routes) {
                const routeId = String(route.id);
                if (!routeId)
                    continue;
                const routeStations = await routeStationModel_1.default.findAll({
                    where: { routeId },
                    attributes: ['stationId', 'orderIndex'],
                    order: [['orderIndex', 'ASC']],
                    transaction: t
                });
                const currentStationIds = routeStations
                    .map((rs) => String(rs.stationId))
                    .filter((id) => id.trim().length > 0);
                // get the routes' stations after excluding removedDefaultStations (which gives us effectiveStationIds)
                const effectiveStationIds = removedDefaultStationIds.length > 0
                    ? currentStationIds.filter((id) => !removedDefaultStationIds.includes(id))
                    : currentStationIds;
                const nextStationIds = (0, routeHelper_1.buildFinalStations)(effectiveStationIds, startDefaultIds, endDefaultIds);
                const sameLength = currentStationIds.length === nextStationIds.length; // check if the length of the current stations(in db) is the same as the next stations(the one we modified)
                const sameOrder = sameLength && currentStationIds.every((id, idx) => id === nextStationIds[idx]); // check if the order of the current stations is the same as the next stations
                if (sameOrder) { // if both are the same, then we don't need to make the update
                    continue;
                }
                //else, if the the station we modified(nextStation) is not the same as the on in the db(currentStation) 
                /// we delete all existing staiong for this route
                await routeStationModel_1.default.destroy({ where: { routeId }, transaction: t });
                // then we insert the new stations from route we modified to the db
                if (nextStationIds.length > 0) {
                    const rows = nextStationIds.map((stationId, idx) => ({
                        routeId,
                        stationId,
                        orderIndex: idx
                    }));
                    await routeStationModel_1.default.bulkCreate(rows, { transaction: t });
                }
                // then in route table we update the number of total stops(staion) for this route
                await routeModel_1.default.update({ totalStops: nextStationIds.length }, { where: { id: routeId }, transaction: t });
            }
        });
    }
    // ==========================================================================================================
    //? function to fetch default station ids by type
    // ==========================================================================================================
    async fetchDefaultStationIdsByType(type) {
        const rows = await stationModel_1.default.findAll({
            attributes: ['id'],
            where: { defaultType: type },
            order: [['id', 'ASC']]
        });
        return Array.from(rows)
            .map((station) => String(station?.id))
            .filter((id) => id.trim().length > 0);
    }
    //===================================================================================================
    //? function to Add Station
    //===================================================================================================
    async addStation(payload) {
        await helper.add(stationModel_1.default, payload, {
            nonDuplicateFields: ['stationName'],
            //----------------------------------------------------------------
            transform: async (data) => {
                const out = { ...data };
                if (out.stationName) {
                    out.stationName = String(data.stationName).toLowerCase().trim();
                }
                if (out.defaultType === undefined) {
                    out.defaultType = null;
                }
                out.isDefault = out.defaultType !== null;
                if (out.isDefault === true) {
                    out.status = stationEnum_1.status.covered;
                }
                return out;
            },
        });
        const providedDefaultType = payload?.defaultType;
        if (providedDefaultType != null) {
            await this.syncDefaultStationsToAllRoutes();
        }
        return { messageKey: "stations.success.added" };
    }
    //===================================================================================================
    //? function to Remove Station
    //===================================================================================================
    async removeStation(stationId) {
        await helper.remove(stationModel_1.default, 'id', String(stationId));
        return { messageKey: 'common.crud.removed' };
    }
    //===================================================================================================
    //? function to Update station
    //===================================================================================================
    async updateStation(payload) {
        const stationId = payload?.id;
        const prev = stationId
            ? await stationModel_1.default.findOne({ where: { id: String(stationId) }, attributes: ['defaultType'] })
            : null;
        // perfrom needed updated procedures in case of adjustment in Defautl status or type ======================================
        // get the previous default type
        const prevDefaultTypeRaw = prev?.defaultType;
        const prevDefaultType = prevDefaultTypeRaw == null ? null : String(prevDefaultTypeRaw);
        const nextPayload = { ...(payload || {}) };
        if (nextPayload.defaultType === undefined) {
            nextPayload.defaultType = null;
        }
        // check if the station is default
        nextPayload.isDefault = nextPayload.defaultType !== null;
        if (nextPayload.isDefault === true) {
            nextPayload.status = stationEnum_1.status.covered;
        }
        const result = await helper.update(stationModel_1.default, nextPayload, {
            enumFields: [{ field: "status", enumObj: stationEnum_1.status }]
        });
        // check if the default type has changed
        const nextDefaultTypeRaw = nextPayload?.defaultType;
        const nextDefaultType = nextDefaultTypeRaw == null ? null : String(nextDefaultTypeRaw);
        const defaultTypeChanged = prev != null && prevDefaultType !== nextDefaultType;
        // check if the station was removed from default
        const removedFromDefault = prev != null
            && prevDefaultType !== null
            && nextDefaultType === null
            && stationId != null
            && String(stationId).trim().length > 0;
        // if the default type has changed, then update the stations for all routes
        if (result.updated && (defaultTypeChanged || Object.prototype.hasOwnProperty.call(nextPayload, 'defaultType'))) {
            await this.syncDefaultStationsToAllRoutes(removedFromDefault
                ? { removedDefaultStationIds: [String(stationId)] }
                : undefined);
        }
        // =========================================================================================================================
        // ensure default stations are always covered
        await stationModel_1.default.update({ status: stationEnum_1.status.covered }, { where: { defaultType: { [sequelize_1.Op.not]: null } } });
        return {
            updated: result.updated,
            messageKey: result.updated ? 'common.crud.updated' : 'common.crud.noChanges'
        };
    }
    //===================================================================================================
    //? function to Fetch All Stations
    //===================================================================================================
    async fetchAllStations() {
        // get all covered stations
        const coveredStationRows = await routeStationModel_1.default.findAll({
            attributes: ['stationId'],
            group: ['stationId']
        });
        const coveredStationIds = coveredStationRows
            .map((row) => String(row.stationId))
            .filter((id) => id.trim().length > 0);
        if (coveredStationIds.length > 0) {
            // update covered stations' status to "covered"
            await stationModel_1.default.update({ status: stationEnum_1.status.covered }, { where: { id: { [sequelize_1.Op.in]: coveredStationIds } } });
            // update stations' status to "notCovered"
            await stationModel_1.default.update({ status: stationEnum_1.status.notCovered }, { where: { id: { [sequelize_1.Op.notIn]: coveredStationIds } } });
        }
        else {
            await stationModel_1.default.update({ status: stationEnum_1.status.notCovered }, { where: {} });
        }
        // default stations are always covered
        await stationModel_1.default.update({ status: stationEnum_1.status.covered }, { where: { defaultType: { [sequelize_1.Op.not]: null } } });
        const stations = await stationModel_1.default.findAll({
            attributes: ['id', 'stationName', 'status', 'latitude', 'longitude', 'isDefault', 'defaultType']
        });
        return { messageKey: 'stations.success.fetched', data: stations };
    }
    // =====================================================================================================
    //? Function to fetch default stations (fixed stations - stations that must exists in all routes)
    // ===================================================================================================== 
    async fetchDefaultStations() {
        const stations = await stationModel_1.default.findAll({
            attributes: ['id'],
            where: { defaultType: { [sequelize_1.Op.not]: null } }
        });
        const defaultStations = Array.from(stations);
        // return string array of default stations' ids
        const fixedStationIds = defaultStations
            .map((station) => String(station?.id))
            .filter((id) => id.trim().length > 0);
        return { messageKey: 'stations.success.fetched', data: fixedStationIds };
    }
    //===================================================================================================
    //? function to Fetch Stations for Route Picker (exclude fixed/default stations)
    //===================================================================================================
    async fetchStationsForPicker() {
        const defaultStationsResult = await this.fetchDefaultStations();
        const defaultStations = defaultStationsResult.data;
        // -----------------------------------------------------------------
        const stations = await stationModel_1.default.findAll({
            attributes: ['id', 'stationName', 'status', 'latitude', 'longitude', 'isDefault', 'defaultType']
        });
        const filteredStations = stations.filter((station) => {
            const id = String(station?.id);
            const dt = station?.defaultType;
            const isDefaultByType = dt != null;
            return !isDefaultByType && !defaultStations.includes(id);
        });
        return { messageKey: 'stations.success.fetched', data: filteredStations };
    }
    // ==================================================================================
    //? function to Fetch Default START Stations
    // ==================================================================================
    async fetchDefaultStartStations() {
        const ids = await this.fetchDefaultStationIdsByType(stationEnum_1.defaultType.start);
        return { messageKey: 'stations.success.fetched', data: ids };
    }
    // ==================================================================================
    //? function to Fetch Default END Stations
    // ==================================================================================
    async fetchDefaultEndStations() {
        const ids = await this.fetchDefaultStationIdsByType(stationEnum_1.defaultType.end);
        return { messageKey: 'stations.success.fetched', data: ids };
    }
}
exports.StationService = StationService;
//# sourceMappingURL=stationService.js.map