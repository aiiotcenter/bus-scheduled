"use strict";
//===================================================================================================
//? Importing
//===================================================================================================
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RouteService = void 0;
//import Enums
const routeEnum_1 = require("../enums/routeEnum");
//import models
const routeModel_1 = __importDefault(require("../models/routeModel"));
const routeStationModel_1 = __importDefault(require("../models/routeStationModel"));
const stationModel_1 = __importDefault(require("../models/stationModel"));
const errors_1 = require("../errors");
const userHelper_1 = require("../helpers/userHelper");
const helper = new userHelper_1.UserHelper();
const colorHelper_1 = require("../helpers/colorHelper");
const routeHelper_1 = require("../helpers/routeHelper");
//import service
const stationService_1 = require("./stationService");
const stationService = new stationService_1.StationService();
//===================================================================================================
class RouteService {
    //===================================================================================================
    //? function to Add Route
    //===================================================================================================
    async addRoute(payload) {
        const body = payload || {};
        const stations = Array.isArray(body.stations) ? body.stations : [];
        const startDefaultsResult = await stationService.fetchDefaultStartStations();
        const endDefaultsResult = await stationService.fetchDefaultEndStations();
        const startDefaultIds = startDefaultsResult.data;
        const endDefaultIds = endDefaultsResult.data;
        const finalStations = (0, routeHelper_1.buildFinalStations)(stations, startDefaultIds, endDefaultIds);
        const finalPayload = {
            ...body,
            totalStops: finalStations.length
        };
        await helper.add(routeModel_1.default, finalPayload, {
            //-----------------------------------------------------------
            transform: async (data) => {
                const out = { ...data };
                if (out.title) {
                    out.title = out.title.toLowerCase().trim();
                }
                // remove non-column field
                delete out.stations;
                return out;
            },
            //-----------------------------------------------------------
            nonDuplicateFields: ['title'],
            //-----------------------------------------------------------
            enumFields: [
                { field: "status", enumObj: routeEnum_1.status },
            ],
            //-----------------------------------------------------------
        });
        // attach stations to route_stations table if provided
        if (finalStations.length > 0 && finalPayload.title) {
            const createdRoute = await routeModel_1.default.findOne({
                where: { title: String(finalPayload.title).toLowerCase().trim() },
                attributes: ['id']
            });
            if (createdRoute) {
                const rows = finalStations.map((stationId, idx) => ({
                    routeId: createdRoute.id,
                    stationId,
                    orderIndex: idx
                }));
                await routeStationModel_1.default.bulkCreate(rows);
            }
        }
        return { messageKey: 'routes.success.added' };
    }
    //===================================================================================================
    //? function to Remove Route
    //===================================================================================================
    async removeRoute(routeId) {
        await helper.remove(routeModel_1.default, 'id', String(routeId));
        return { messageKey: 'common.crud.removed' };
    }
    //===================================================================================================
    //? function to Update Route
    //===================================================================================================
    async updateRoute(payload) {
        const body = payload || {};
        const stations = Array.isArray(body.stations) ? body.stations : [];
        const startDefaultsResult = await stationService.fetchDefaultStartStations();
        const endDefaultsResult = await stationService.fetchDefaultEndStations();
        const startDefaultIds = startDefaultsResult.data;
        const endDefaultIds = endDefaultsResult.data;
        const finalStations = (0, routeHelper_1.buildFinalStations)(stations, startDefaultIds, endDefaultIds);
        const finalPayload = {
            ...body,
            totalStops: finalStations.length
        };
        const { updated } = await helper.update(routeModel_1.default, finalPayload, {
            transform: async (data) => {
                const out = { ...data };
                if (out.title) {
                    out.title = String(out.title).toLowerCase().trim();
                }
                // remove non-column field
                delete out.stations;
                return out;
            },
            enumFields: [
                { field: "status", enumObj: routeEnum_1.status }
            ]
        });
        if (!updated) {
            throw new errors_1.ConflictError('common.crud.notUpdated');
        }
        // replace stations list
        if (body.id) {
            await routeStationModel_1.default.destroy({
                where: { routeId: body.id }
            });
            if (finalStations.length > 0) {
                const rows = finalStations.map((stationId, idx) => ({
                    routeId: body.id,
                    stationId,
                    orderIndex: idx
                }));
                await routeStationModel_1.default.bulkCreate(rows);
            }
        }
        return { messageKey: 'routes.success.updated' };
    }
    //===================================================================================================
    //? function to view All routes for operating buses or only Operating(working) routes 
    //===================================================================================================
    async viewRoutes(displayAll) {
        let routes = [];
        if (displayAll) {
            routes = await routeModel_1.default.findAll({
                attributes: ['id', 'title', 'color', 'totalStops', 'status']
            });
            for (const route of routes) {
                route.dataValues.colorInt = (0, colorHelper_1.normalizeColorToArgbInt)(route?.color);
            }
            // attach stations per route
            for (const route of routes) {
                const routeStations = await routeStationModel_1.default.findAll({
                    where: { routeId: route.id },
                    attributes: ['stationId', 'orderIndex'],
                    order: [['orderIndex', 'ASC']]
                });
                const stationIds = routeStations.map((rs) => rs.stationId);
                let stations = [];
                if (stationIds.length > 0) {
                    const stationRows = await stationModel_1.default.findAll({
                        where: { id: stationIds },
                        attributes: ['id', 'stationName', 'latitude', 'longitude']
                    });
                    const stationMap = new Map(stationRows.map((st) => [st.id, {
                            stationName: st.stationName,
                            latitude: st.latitude,
                            longitude: st.longitude
                        }]));
                    stations = routeStations.map((rs) => ({
                        id: rs.stationId,
                        stationName: stationMap.get(rs.stationId)?.stationName || '',
                        latitude: Number(stationMap.get(rs.stationId)?.latitude ?? 0),
                        longitude: Number(stationMap.get(rs.stationId)?.longitude ?? 0)
                    }));
                }
                route.dataValues.stations = stations;
            }
        }
        else {
            routes = await routeModel_1.default.findAll({
                where: {
                    status: routeEnum_1.status.covered,
                },
                attributes: ['id', 'title', 'color', 'totalStops', 'status']
            });
            for (const route of routes) {
                route.dataValues.colorInt = (0, colorHelper_1.normalizeColorToArgbInt)(route?.color);
            }
        }
        return { messageKey: 'common.crud.fetched', data: routes };
    }
    //===================================================================================================
    //? function to Fetch All Routes for Map View (station coordinates)
    //===================================================================================================
    async fetchRoutesMap() {
        const routes = await routeModel_1.default.findAll({
            attributes: ['id', 'title', 'color', 'totalStops', 'status']
        });
        for (const route of routes) {
            route.dataValues.colorInt = (0, colorHelper_1.normalizeColorToArgbInt)(route?.color);
        }
        // attach ordered points per route -------------------------------------------------
        for (const route of routes) {
            const routeStations = await routeStationModel_1.default.findAll({
                where: { routeId: route.id },
                attributes: ['stationId', 'orderIndex'],
                order: [['orderIndex', 'ASC']]
            });
            // get route stations with their order index ------------------------------------------
            const routeStationsTyped = routeStations.map((rs) => ({
                stationId: String(rs.stationId),
                orderIndex: Number(rs.orderIndex ?? 0),
            }));
            // get route stations ids ordered by orderIndex ------------------------------------------
            const stationIdsFromDb = routeStationsTyped
                .map((routeStation) => routeStation.stationId)
                .map((id) => String(id));
            // if default start/end stations are missing, enforce them-------------------------------
            const startDefaultsResult = await stationService.fetchDefaultStartStations();
            const endDefaultsResult = await stationService.fetchDefaultEndStations();
            const startDefaultIds = startDefaultsResult.data;
            const endDefaultIds = endDefaultsResult.data;
            const requiredDefaultIds = Array.from(new Set([
                ...(Array.isArray(startDefaultIds) ? startDefaultIds : []),
                ...(Array.isArray(endDefaultIds) ? endDefaultIds : []),
            ]));
            const hasAllRequiredDefaults = requiredDefaultIds.every((id) => stationIdsFromDb.includes(id));
            const stationIdsOrdered = hasAllRequiredDefaults
                ? stationIdsFromDb
                : (0, routeHelper_1.buildFinalStations)(stationIdsFromDb, startDefaultIds, endDefaultIds);
            // -------------------------------------------------------------------
            // use unique ids only for DB fetch, but keep ordered list for points
            const stationIdsFetch = Array.from(new Set(stationIdsOrdered));
            if (stationIdsFetch.length === 0) {
                route.dataValues.points = [];
                continue;
            }
            // get stations data from db ---------------------
            const stationRows = await stationModel_1.default.findAll({
                where: { id: stationIdsFetch },
                attributes: ['id', 'stationName', 'latitude', 'longitude']
            });
            const stationRowsTyped = stationRows.map((st) => ({
                id: String(st.id),
                stationName: String(st.stationName ?? ''),
                latitude: Number(st.latitude ?? 0),
                longitude: Number(st.longitude ?? 0),
            }));
            const stationMap = new Map(stationRowsTyped.map((st) => [st.id, st]));
            //--------------------------------------------------
            const orderIndexMap = new Map(routeStationsTyped.map((rs) => [rs.stationId, rs.orderIndex]));
            // create points array from ordered stations "stationIdsOrdered" -------------------------
            const points = [];
            const pointCoords = [];
            // loop through ordered stations and ensure they are found wiht valid coordinates
            for (const stationId of stationIdsOrdered) {
                const station = stationMap.get(stationId);
                // skip if station not found 
                if (!station) {
                    continue;
                }
                // skip if station has invalid coordinates
                if (station.latitude === 0 || station.longitude === 0) {
                    continue;
                }
                // else push to points
                points.push({
                    stationId,
                    stationName: station.stationName,
                    latitude: station.latitude,
                    longitude: station.longitude,
                    orderIndex: Number(orderIndexMap.get(stationId) ?? 0)
                });
                pointCoords.push({ latitude: station.latitude, longitude: station.longitude });
            }
            // get road-following polyline geometry ---------------------------------------------
            const routedGeometry = await (0, routeHelper_1.fetchOsrmGeometry)(pointCoords);
            route.dataValues.geometry = routedGeometry ?? pointCoords;
            route.dataValues.points = points;
        }
        return { messageKey: 'common.crud.fetched', data: routes };
    }
}
exports.RouteService = RouteService;
//# sourceMappingURL=routeService.js.map