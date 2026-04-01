//===================================================================================================
//? Importing
//===================================================================================================

//import Enums
import {status } from '../enums/routeEnum';

//import models
import RouteModel from "../models/routeModel";
import RouteStationModel from "../models/routeStationModel";
import stationModel from "../models/stationModel";

import { ConflictError, NotFoundError, ValidationError, InternalError  } from '../errors';

import { UserHelper } from "../helpers/userHelper";
const helper = new UserHelper();

import { normalizeColorToArgbInt } from '../helpers/colorHelper';

import { buildFinalStations, fetchOsrmGeometry } from '../helpers/routeHelper';


//import service
import { StationService } from './stationService';
const stationService = new StationService();
//===================================================================================================



export class RouteService{  


    //===================================================================================================
    //? function to Add Route
    //===================================================================================================

    async addRoute(payload: Record<string, any>): Promise<{ messageKey: string }> {

        const body = payload || {};
        const stations: string[] = Array.isArray(body.stations) ? body.stations : [];

        const startDefaultsResult = await stationService.fetchDefaultStartStations();
        const endDefaultsResult = await stationService.fetchDefaultEndStations();

        const startDefaultIds: string[] = startDefaultsResult.data as string[];
        const endDefaultIds: string[] = endDefaultsResult.data as string[];

        const finalStations = buildFinalStations(stations, startDefaultIds, endDefaultIds);

        const finalPayload: Record<string, any> = {
            ...body,
            totalStops: finalStations.length
        };

        await helper.add(RouteModel, finalPayload,
            {
                //-----------------------------------------------------------
                transform: async (data) => {
                    const out = {...data};
                    if(out.title){
                        out.title  = out.title.toLowerCase().trim();
                    }
                    // remove non-column field
                    delete out.stations;
                    return out;
                },
                //-----------------------------------------------------------
                nonDuplicateFields: ['title'],
                //-----------------------------------------------------------
                enumFields: [
                    { field: "status", enumObj: status },
                ],
                //-----------------------------------------------------------
            }
        );

        // attach stations to route_stations table if provided
        if(finalStations.length > 0 && finalPayload.title){
            const createdRoute = await RouteModel.findOne({
                where: { title: String(finalPayload.title).toLowerCase().trim() },
                attributes: ['id']
            });

            if(createdRoute){
                const rows = finalStations.map((stationId, idx) => ({
                    routeId: createdRoute.id,
                    stationId,
                    orderIndex: idx
                }));
                await RouteStationModel.bulkCreate(rows);
            }
        }

        return { messageKey: 'routes.success.added' };
    }

    //===================================================================================================
    //? function to Remove Route
    //===================================================================================================
    async removeRoute(routeId: unknown): Promise<{ messageKey: string }> {
        await helper.remove(RouteModel, 'id', String(routeId));
        return { messageKey: 'common.crud.removed' };
    }

    //===================================================================================================
    //? function to Update Route
    //===================================================================================================
    async updateRoute(payload: Record<string, any>): Promise<{ messageKey: string }> {
        const body = payload || {};
        const stations: string[] = Array.isArray(body.stations) ? body.stations : [];

        const startDefaultsResult = await stationService.fetchDefaultStartStations();
        const endDefaultsResult = await stationService.fetchDefaultEndStations();

        const startDefaultIds: string[] = startDefaultsResult.data as string[];
        const endDefaultIds: string[] = endDefaultsResult.data as string[];

        const finalStations = buildFinalStations(stations, startDefaultIds, endDefaultIds);

        const finalPayload: Record<string, any> = {
            ...body,
            totalStops: finalStations.length
        };

        const { updated } = await helper.update(RouteModel, finalPayload, {
            transform: async (data: Record<string, any>) => {
                const out = { ...data };
                if (out.title) {
                    out.title = String(out.title).toLowerCase().trim();
                }
                // remove non-column field
                delete out.stations;
                return out;
            },
            enumFields: [
                { field: "status", enumObj: status }
            ]
        });

        if (!updated) {
            throw new ConflictError('common.crud.notUpdated');
        }

        // replace stations list
        if (body.id) {
            await RouteStationModel.destroy({
                where: { routeId: body.id }
            });

            if (finalStations.length > 0) {
                const rows = finalStations.map((stationId, idx) => ({
                    routeId: body.id,
                    stationId,
                    orderIndex: idx
                }));
                await RouteStationModel.bulkCreate(rows);
            }
        }

        return { messageKey: 'routes.success.updated' };
    }


    
    //===================================================================================================
    //? function to view All routes for operating buses or only Operating(working) routes 
    //===================================================================================================
    async viewRoutes(displayAll: boolean): Promise<{ messageKey: string; data: unknown }> {
        let routes: any[] = [];

        if(displayAll){
            routes = await RouteModel.findAll({
                attributes: ['id', 'title', 'color', 'totalStops', 'status']
            });

            for (const route of routes) {
                (route as any).dataValues.colorInt = normalizeColorToArgbInt((route as any)?.color);
            }
            // attach stations per route
            for (const route of routes) {
                const routeStations = await RouteStationModel.findAll({
                    where: { routeId: route.id },
                    attributes: ['stationId', 'orderIndex'],
                    order: [['orderIndex', 'ASC']]
                });

                const stationIds: string[] = routeStations.map((rs: any) => rs.stationId);
                let stations: { id: string; stationName: string; latitude: number; longitude: number }[] = [];
                if (stationIds.length > 0) {
                    const stationRows = await stationModel.findAll({
                        where: { id: stationIds },
                        attributes: ['id', 'stationName', 'latitude', 'longitude']
                    });
                    const stationMap = new Map(
                        stationRows.map((st: any) => [st.id, {
                            stationName: st.stationName,
                            latitude: st.latitude,
                            longitude: st.longitude
                        }])
                    );
                    stations = routeStations.map((rs: any) => ({
                        id: rs.stationId,
                        stationName: stationMap.get(rs.stationId)?.stationName || '',
                        latitude: Number(stationMap.get(rs.stationId)?.latitude ?? 0),
                        longitude: Number(stationMap.get(rs.stationId)?.longitude ?? 0)
                    }));
                }

                (route as any).dataValues.stations = stations;
            }
            
        }else{
            routes = await RouteModel.findAll({
                where: {
                    status: status.covered,
                },
                attributes: ['id', 'title', 'color', 'totalStops', 'status']
            });

            for (const route of routes) {
                (route as any).dataValues.colorInt = normalizeColorToArgbInt((route as any)?.color);
            }
        }

        return { messageKey: 'common.crud.fetched', data: routes };
    }


    //===================================================================================================
    //? function to Fetch All Routes for Map View (station coordinates)
    //===================================================================================================
    async fetchRoutesMap(): Promise<{ messageKey: string; data: unknown }> {
        type StationRow = {
            id: string;
            stationName: string;
            latitude: number;
            longitude: number;
        };

        type RouteStationRow = {
            stationId: string;
            orderIndex: number;
        };

        type RoutePoint = {
            stationId: string;
            stationName: string;
            latitude: number;
            longitude: number;
            orderIndex: number;
        };

        const routes = await RouteModel.findAll({
            attributes: ['id', 'title', 'color', 'totalStops', 'status']
        });

        for (const route of routes) {
            (route as any).dataValues.colorInt = normalizeColorToArgbInt((route as any)?.color);
        }

        // attach ordered points per route -------------------------------------------------
        for (const route of routes) {
            const routeStations = await RouteStationModel.findAll({
                where: { routeId: route.id },
                attributes: ['stationId', 'orderIndex'],
                order: [['orderIndex', 'ASC']]
            });

            // get route stations with their order index ------------------------------------------
            const routeStationsTyped: RouteStationRow[] = routeStations.map((rs) => ({
                stationId: String((rs as unknown as { stationId: unknown }).stationId),
                orderIndex: Number((rs as unknown as { orderIndex: unknown }).orderIndex ?? 0),
            }));

            // get route stations ids ordered by orderIndex ------------------------------------------
            const stationIdsFromDb: string[] = routeStationsTyped
                .map((routeStation) => routeStation.stationId)
                .map((id) => String(id));

            // if default start/end stations are missing, enforce them-------------------------------
            const startDefaultsResult = await stationService.fetchDefaultStartStations();
            const endDefaultsResult = await stationService.fetchDefaultEndStations();

            const startDefaultIds: string[] = startDefaultsResult.data as string[];
            const endDefaultIds: string[] = endDefaultsResult.data as string[];

            const requiredDefaultIds = Array.from(new Set([
                ...(Array.isArray(startDefaultIds) ? startDefaultIds : []),
                ...(Array.isArray(endDefaultIds) ? endDefaultIds : []),
            ]));

            const hasAllRequiredDefaults = requiredDefaultIds.every((id) => stationIdsFromDb.includes(id));

            const stationIdsOrdered: string[] = hasAllRequiredDefaults
                ? stationIdsFromDb
                : buildFinalStations(stationIdsFromDb, startDefaultIds, endDefaultIds);

            // -------------------------------------------------------------------

            // use unique ids only for DB fetch, but keep ordered list for points
            const stationIdsFetch: string[] = Array.from(new Set(stationIdsOrdered));

            if (stationIdsFetch.length === 0) {
                (route as any).dataValues.points = [];
                continue;
            }

            // get stations data from db ---------------------
            const stationRows = await stationModel.findAll({
                where: { id: stationIdsFetch },
                attributes: ['id', 'stationName', 'latitude', 'longitude']
            });

            const stationRowsTyped: StationRow[] = stationRows.map((st) => ({
                id: String((st as unknown as { id: unknown }).id),
                stationName: String((st as unknown as { stationName: unknown }).stationName ?? ''),
                latitude: Number((st as unknown as { latitude: unknown }).latitude ?? 0),
                longitude: Number((st as unknown as { longitude: unknown }).longitude ?? 0),
            }));

            const stationMap = new Map<string, StationRow>(
                stationRowsTyped.map((st) => [st.id, st])
            );
            //--------------------------------------------------

            const orderIndexMap = new Map<string, number>(
                routeStationsTyped.map((rs) => [rs.stationId, rs.orderIndex])
            );

            // create points array from ordered stations "stationIdsOrdered" -------------------------
            const points: RoutePoint[] = [];

            const pointCoords: Array<{ latitude: number; longitude: number }> = [];

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
            const routedGeometry = await fetchOsrmGeometry(pointCoords);
            (route as any).dataValues.geometry = routedGeometry ?? pointCoords;

            (route as any).dataValues.points = points;
        }

        return { messageKey: 'common.crud.fetched', data: routes };
    }

}

