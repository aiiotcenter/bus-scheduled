//===================================================================================================
//? Importing
//===================================================================================================

//import models
import stationModel from "../models/stationModel";
import RouteStationModel from "../models/routeStationModel";
import RouteModel from "../models/routeModel";

import { Op } from 'sequelize';
import { sequelize } from '../config/database';

//import Enums
import { defaultType, status } from '../enums/stationEnum';

import { ConflictError, NotFoundError, ValidationError, InternalError } from '../errors';

//import interfaces
import { stationAttributes, stationListObjects } from '../interfaces/stationInterface';

// import helpers
import { buildFinalStations } from '../helpers/routeHelper';

// import helpers
import { UserHelper } from "../helpers/userHelper";
const helper = new UserHelper();



//===================================================================================================



export class StationService{  

    // ==========================================================================================================
    //? function to synchronize default stations to all routes
    // ==========================================================================================================
    private async syncDefaultStationsToAllRoutes(options?: { removedDefaultStationIds?: string[] }): Promise<void> {
        
        // fetch default start and end stations
        const startDefaultsResult = await this.fetchDefaultStartStations();
        const endDefaultsResult = await this.fetchDefaultEndStations();

        const startDefaultIds: string[] = Array.isArray(startDefaultsResult.data) ? (startDefaultsResult.data as string[]) : [];
        const endDefaultIds: string[] = Array.isArray(endDefaultsResult.data) ? (endDefaultsResult.data as string[]) : [];
        // ------------------------------------------------------------------

        // if removedDefaultStationIds is provided, means that a station was reseted as notDefault --- so we have to remove it from all routes that had it as default station
        const removedDefaultStationIds: string[] = Array.isArray(options?.removedDefaultStationIds)
            ? options!.removedDefaultStationIds
                .map((id) => String(id))
                .map((id) => id.trim())
                .filter((id) => id.length > 0)
            : [];
        // ------------------------------------------------------------------


        const routes = await RouteModel.findAll({ attributes: ['id'] });

        // update all routes
        await sequelize.transaction(async (t) => {
            for (const route of routes) {
                const routeId = String((route as unknown as { id: unknown }).id);
                if (!routeId) continue;

                const routeStations = await RouteStationModel.findAll({
                    where: { routeId },
                    attributes: ['stationId', 'orderIndex'],
                    order: [['orderIndex', 'ASC']],
                    transaction: t
                });

                const currentStationIds: string[] = routeStations
                    .map((rs: any) => String(rs.stationId))
                    .filter((id) => id.trim().length > 0);


                // get the routes' stations after excluding removedDefaultStations (which gives us effectiveStationIds)
                const effectiveStationIds = removedDefaultStationIds.length > 0
                ? currentStationIds.filter((id) => !removedDefaultStationIds.includes(id))
                : currentStationIds;

                const nextStationIds = buildFinalStations(effectiveStationIds, startDefaultIds, endDefaultIds);

                const sameLength = currentStationIds.length === nextStationIds.length; // check if the length of the current stations(in db) is the same as the next stations(the one we modified)
                const sameOrder = sameLength && currentStationIds.every((id, idx) => id === nextStationIds[idx]); // check if the order of the current stations is the same as the next stations

                if (sameOrder) {// if both are the same, then we don't need to make the update
                    continue;
                }

                //else, if the the station we modified(nextStation) is not the same as the on in the db(currentStation) 
                /// we delete all existing staiong for this route
                await RouteStationModel.destroy({ where: { routeId }, transaction: t });

                // then we insert the new stations from route we modified to the db
                if (nextStationIds.length > 0) {
                    const rows = nextStationIds.map((stationId, idx) => ({
                        routeId,
                        stationId,
                        orderIndex: idx
                    }));
                    await RouteStationModel.bulkCreate(rows, { transaction: t });
                }

                // then in route table we update the number of total stops(staion) for this route
                await RouteModel.update(
                    { totalStops: nextStationIds.length },
                    { where: { id: routeId }, transaction: t }
                );
            }
        });
    }

    // ==========================================================================================================
    //? function to fetch default station ids by type
    // ==========================================================================================================
    private async fetchDefaultStationIdsByType(type: defaultType): Promise<string[]> {
        const rows = await stationModel.findAll({
            attributes: ['id'],
            where: { defaultType: type },
            order: [['id', 'ASC']]
        });

        return Array.from(rows)
            .map((station: stationListObjects) => String(station?.id))
            .filter((id: string) => id.trim().length > 0);
    }

    //===================================================================================================
    //? function to Add Station
    //===================================================================================================

    async addStation(payload: Record<string, any>): Promise<{ messageKey: string }> {
        await helper.add(stationModel, payload, {
            nonDuplicateFields: ['stationName'],
                //----------------------------------------------------------------
            transform: async(data) => {
                const out = {...data};

                if(out.stationName){
                    out.stationName = String(data.stationName).toLowerCase().trim();
                }

                if (out.defaultType === undefined) {
                    out.defaultType = null;
                }
                out.isDefault = out.defaultType !== null;
                if (out.isDefault === true) {
                    out.status = status.covered;
                }

                return out;
                
            },    
          }
        );

        const providedDefaultType = payload?.defaultType;
        if (providedDefaultType != null) {
            await this.syncDefaultStationsToAllRoutes();
        }

        return { messageKey: "stations.success.added" };
    }

    //===================================================================================================
    //? function to Remove Station
    //===================================================================================================
    async removeStation(stationId: unknown): Promise<{ messageKey: string }> {
        await helper.remove(stationModel, 'id', String(stationId));
        return { messageKey: 'common.crud.removed' };
    }

    //===================================================================================================
    //? function to Update station
    //===================================================================================================
    async updateStation(payload: Record<string, any>): Promise<{ updated: boolean; messageKey: string }> {
		const stationId = payload?.id;
		const prev = stationId
			? await stationModel.findOne({ where: { id: String(stationId) }, attributes: ['defaultType'] })
			: null;
		
        // perfrom needed updated procedures in case of adjustment in Defautl status or type ======================================
        // get the previous default type
        const prevDefaultTypeRaw = (prev as any)?.defaultType;
		const prevDefaultType = prevDefaultTypeRaw == null ? null : String(prevDefaultTypeRaw);

		
        const nextPayload = { ...(payload || {}) };
		if (nextPayload.defaultType === undefined) {
			nextPayload.defaultType = null;
		}
        // check if the station is default
		nextPayload.isDefault = nextPayload.defaultType !== null;
		if (nextPayload.isDefault === true) {
			nextPayload.status = status.covered;
		}

        const result = await helper.update(stationModel, nextPayload, {
            enumFields: [{ field: "status", enumObj: status }]
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
			await this.syncDefaultStationsToAllRoutes(
				removedFromDefault
					? { removedDefaultStationIds: [String(stationId)] }
					: undefined
			);
		}
        // =========================================================================================================================

		// ensure default stations are always covered
		await stationModel.update(
			{ status: status.covered },
			{ where: { defaultType: { [Op.not]: null } } }
		);

        return {
            updated: result.updated,
            messageKey: result.updated ? 'common.crud.updated' : 'common.crud.noChanges'
        };
    }

    //===================================================================================================
    //? function to Fetch All Stations
    //===================================================================================================

    async fetchAllStations(): Promise<{ messageKey: string; data: unknown }> {
        // get all covered stations
        const coveredStationRows = await RouteStationModel.findAll({
            attributes: ['stationId'],
            group: ['stationId']
        });

        const coveredStationIds = coveredStationRows
            .map((row: any) => String(row.stationId))
            .filter((id) => id.trim().length > 0);

        if (coveredStationIds.length > 0) {
        
            // update covered stations' status to "covered"
            await stationModel.update(
                { status: status.covered },
                { where: { id: { [Op.in]: coveredStationIds } } }
            );

            // update stations' status to "notCovered"
            await stationModel.update(
                { status: status.notCovered },
                { where: { id: { [Op.notIn]: coveredStationIds } } }
            );
        } else {
            await stationModel.update(
                { status: status.notCovered },
                { where: {} }
            );
        }

        // default stations are always covered
        await stationModel.update(
            { status: status.covered },
            { where: { defaultType: { [Op.not]: null } } }
        );

        const stations = await stationModel.findAll({
            attributes: ['id', 'stationName', 'status', 'latitude', 'longitude', 'isDefault', 'defaultType']
        });

        return { messageKey: 'stations.success.fetched', data: stations };
    }

    // =====================================================================================================
    //? Function to fetch default stations (fixed stations - stations that must exists in all routes)
    // ===================================================================================================== 
    async fetchDefaultStations(): Promise<{messageKey: string; data: unknown}> {
        const stations = await stationModel.findAll({
            attributes: ['id'],
            where: { defaultType: { [Op.not]: null } }
        });
        
        const defaultStations = Array.from(stations);

        // return string array of default stations' ids
        const fixedStationIds = defaultStations
            .map((station: stationListObjects) => String(station?.id))
            .filter((id: string) => id.trim().length > 0);

        return { messageKey: 'stations.success.fetched', data: fixedStationIds };
    }



    //===================================================================================================
    //? function to Fetch Stations for Route Picker (exclude fixed/default stations)
    //===================================================================================================
    async fetchStationsForPicker(): Promise<{ messageKey: string; data: unknown }> {
        const defaultStationsResult = await this.fetchDefaultStations();
        const defaultStations: string[]= defaultStationsResult.data as string[];

        // -----------------------------------------------------------------
        const stations = await stationModel.findAll({
            attributes: ['id', 'stationName', 'status', 'latitude', 'longitude', 'isDefault', 'defaultType']
        });

        const filteredStations = (stations as stationAttributes[]).filter(
            (station) => {
                const id:string = String((station as stationAttributes)?.id);
                const dt = (station as stationAttributes)?.defaultType;
                const isDefaultByType:boolean = dt != null;
                
                return !isDefaultByType && !defaultStations.includes(id);
            }
        );

        return { messageKey: 'stations.success.fetched', data: filteredStations };
    }

	// ==================================================================================
    //? function to Fetch Default START Stations
    // ==================================================================================
    async fetchDefaultStartStations(): Promise<{ messageKey: string; data: unknown }> {
        const ids = await this.fetchDefaultStationIdsByType(defaultType.start);
        return { messageKey: 'stations.success.fetched', data: ids };
	}

	// ==================================================================================
    //? function to Fetch Default END Stations
    // ==================================================================================
	async fetchDefaultEndStations(): Promise<{ messageKey: string; data: unknown }> {
        const ids = await this.fetchDefaultStationIdsByType(defaultType.end);
        return { messageKey: 'stations.success.fetched', data: ids };
	}

}
