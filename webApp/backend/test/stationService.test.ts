//==========================================================================================================
//? Unit Tests
//==========================================================================================================

import stationModel from '@src/models/stationModel';
import RouteStationModel from '@src/models/routeStationModel';

import { StationService } from "@src/services/stationService";

import { ConflictError, InternalError, NotFoundError, ValidationError } from "@src/errors";
import { defaultType, status } from "@src/enums/stationEnum";
import { Op } from 'sequelize';

// mock models ------------------------------------------------------------------------
jest.mock('@src/models/stationModel', () => ({
    __esModule: true,
    default: {
        findAll: jest.fn(),
        findOne: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        destroy: jest.fn(),
    },
}));

jest.mock('@src/models/routeStationModel', () => ({
    __esModule: true,
    default: {
        findAll: jest.fn(),
        destroy: jest.fn(),
        bulkCreate: jest.fn(),
        generateNextRouteStationId: jest.fn(),
    },
}));

jest.mock('@src/models/routeModel', () => ({
    __esModule: true,
    default: {
        findAll: jest.fn(),
        update: jest.fn(),
    },
}));

jest.mock('@src/config/database', () => ({
    sequelize: {
        transaction: jest.fn(async (cb) => {
            return cb({});
        }),
    },
}));


// import helpers -------------------------------------------------------

jest.mock("@src/helpers/userHelper", () => {
    const mockUserHelperInstance = {
        add: jest.fn(),
        remove: jest.fn(),
        update: jest.fn(),
    };

    return {
        __esModule: true,
        mockUserHelperInstance,
        UserHelper: jest.fn(() => mockUserHelperInstance),
    };
});

jest.mock("@src/helpers/routeHelper", () => ({
    buildFinalStations: jest.fn(),
}));


// ============================================================================================================
// ============================================================================================================

//UNI tests:
// - Add station
//   should add station successfully without defaultType
//   should sync default stations if defaultType is provided
//   should throw Validation Error when validation fails
//   should return Internal Server Error for unknown errors

// - Remove station
//   should remove station successfully
//   should throw NotFound Error when station is not found
//   should throw Internal Error when an unexpected error  occurs

// - Update station
//   should return updated message when updated successfully
//   should return noChanges message when no data changed
//   should throw error when an unexpected error occurs


// - fetch all stations
//   should fetch all stations successfully - covered stations included
//   should fetch all stations successfully - no covered stations
//   should throw error when an unexpected error occurs

// - fetch Default stations
//   should fetch fixed station ids successfully
//   should return empty array when no default stations found
//   should throw error when an unexpected error occurs


// - fetch stations for pickers( basically all stations but defaluts(fixeds) )
//   should omit default stations from picker
//   should return empty array when no stations found
//   should throw error when an unexpected error occurs


// - fetch default start stations
//   should return start default station ids
//   should throw error when an unexpected error occurs


// - fetch default end stations
//   should return end default station ids
//   should throw error when an unexpected error occurs



// =================================================================================

describe("StationService", () => {
    const stationService = new StationService();

    let syncSpy: jest.SpyInstance;

    beforeEach(() => {
        jest.clearAllMocks();

        const UserHelperModule = require("@src/helpers/userHelper");
        UserHelperModule.mockUserHelperInstance.add.mockClear();
        UserHelperModule.mockUserHelperInstance.remove.mockClear();
        UserHelperModule.mockUserHelperInstance.update.mockClear();

        jest.spyOn(console, "error").mockImplementation(() => undefined);
        
        // Mock private function 
        syncSpy = jest.spyOn(stationService as any, 'syncDefaultStationsToAllRoutes').mockResolvedValue(undefined);
    });

    afterEach(() => {
        (console.error as jest.Mock | undefined)?.mockRestore?.();
        syncSpy.mockRestore();
    });

    // ============================================================================================================
    //? Add station
    // ============================================================================================================

    describe("addStation", () => {
        
        test("should add station successfully without defaultType", async () => {
            // setup section (arrange) --------------
            const UserHelperModule = require("@src/helpers/userHelper");
            UserHelperModule.mockUserHelperInstance.add.mockResolvedValueOnce(undefined);
 
            const payload = { stationName: "Test Station" };

            // execution section (act)--------------
            const result = await stationService.addStation(payload);

            const addCallOptions = (UserHelperModule.mockUserHelperInstance.add as jest.Mock).mock.calls[0]?.[2]; // get the transform function from the add method(extract options (3rd argu from add method))
            const transformed = await addCallOptions.transform({ stationName: "Test Station" });

            // verification section (assert)--------------
            expect(result).toEqual({ messageKey: "stations.success.added" });

            expect(UserHelperModule.mockUserHelperInstance.add).toHaveBeenCalledTimes(1);

            expect(transformed.stationName).toBe("test station");
            expect(transformed.defaultType).toBe(null);
            expect(transformed.isDefault).toBe(false);
            
            expect(syncSpy).not.toHaveBeenCalled();
        });

        // --------------------------------------------------------------------

        test("should sync default stations if defaultType is provided", async () => {
            const UserHelperModule = require("@src/helpers/userHelper");
            UserHelperModule.mockUserHelperInstance.add.mockResolvedValueOnce(undefined);

            const payload = { stationName: "Test Station", defaultType: defaultType.start };
            const result = await stationService.addStation(payload);

            const addCallOptions = (UserHelperModule.mockUserHelperInstance.add as jest.Mock).mock.calls[0]?.[2];
            const transformed = await addCallOptions.transform(payload);

            expect(result).toEqual({ messageKey: "stations.success.added" });

            expect(UserHelperModule.mockUserHelperInstance.add).toHaveBeenCalledTimes(1);

            expect(transformed.isDefault).toBe(true);
            expect(transformed.status).toBe(status.covered);
            expect(syncSpy).toHaveBeenCalledTimes(1);
        });

        // --------------------------------------------------------------------

        test("should throw Validation Error when validation fails", async () => {
            const UserHelperModule = require("@src/helpers/userHelper");
            UserHelperModule.mockUserHelperInstance.add.mockRejectedValueOnce(new ValidationError("error"));

            await expect(stationService.addStation({})).rejects.toBeInstanceOf(ValidationError);
        });

        // --------------------------------------------------------------------

        test("should return Internal Server Error for unknown errors", async () => {
            const UserHelperModule = require("@src/helpers/userHelper");
            UserHelperModule.mockUserHelperInstance.add.mockRejectedValueOnce(new Error("error"));

            await expect(stationService.addStation({})).rejects.toThrow("error");
        });
    });

    // ============================================================================================================
    //? Remove Station
    // ============================================================================================================

    describe("removeStation", () => {
        test("should remove station successfully", async () => {
            const UserHelperModule = require("@src/helpers/userHelper");
            UserHelperModule.mockUserHelperInstance.remove.mockResolvedValueOnce(undefined);

            const result = await stationService.removeStation("S123");

            expect(result).toEqual({ messageKey: "common.crud.removed" });
            expect(UserHelperModule.mockUserHelperInstance.remove).toHaveBeenCalledTimes(1);
            expect(UserHelperModule.mockUserHelperInstance.remove).toHaveBeenCalledWith(stationModel, "id", "S123");
        });

        //---------------------------------------------------------------------------------

        test("should throw NotFound Error when station is not found", async () => {
            const UserHelperModule = require("@src/helpers/userHelper");
            UserHelperModule.mockUserHelperInstance.remove.mockRejectedValueOnce(new NotFoundError("common.errors.notFound"));

            await expect(stationService.removeStation("S123")).rejects.toBeInstanceOf(NotFoundError);

        });

        //---------------------------------------------------------------------------------

        test("should throw Internal Error when an unexpected error occurs", async () => {
            const UserHelperModule = require("@src/helpers/userHelper");
            UserHelperModule.mockUserHelperInstance.remove.mockRejectedValueOnce(new Error("error"));

            await expect(stationService.removeStation({id: "S123"})).rejects.toThrow("error");
        });
    });

    // ============================================================================================================
    //? Update station
    // ============================================================================================================

    describe("updateStation", () => {
        test("should return updated message when updated successfully", async () => {
            (stationModel.findOne as jest.Mock).mockResolvedValueOnce({ defaultType: null });
            
            const UserHelperModule = require("@src/helpers/userHelper");
            UserHelperModule.mockUserHelperInstance.update.mockResolvedValueOnce({ updated: true } as any);

            const result = await stationService.updateStation({ id: "S123", stationName: "New Name" });

            expect(result).toEqual({ updated: true, messageKey: "common.crud.updated" });
            expect(stationModel.update).toHaveBeenCalledTimes(1); 
            expect(syncSpy).toHaveBeenCalledTimes(1); 
        });

        // --------------------------------------------------------------------

        test("should sync default stations if defaultType has changed", async () => {
            (stationModel.findOne as jest.Mock).mockResolvedValueOnce({ defaultType: null });
            
            const UserHelperModule = require("@src/helpers/userHelper");
            UserHelperModule.mockUserHelperInstance.update.mockResolvedValueOnce({ updated: true } as any);

            const result = await stationService.updateStation({ id: "S123", defaultType: defaultType.start });

            expect(result).toEqual({ updated: true, messageKey: "common.crud.updated" });
            expect(syncSpy).toHaveBeenCalledTimes(1); 
        });

        // --------------------------------------------------------------------

        test("should return noChanges message when no data changed", async () => {
            (stationModel.findOne as jest.Mock).mockResolvedValueOnce({ defaultType: null });

            const UserHelperModule = require("@src/helpers/userHelper");
            UserHelperModule.mockUserHelperInstance.update.mockResolvedValueOnce({ updated: false } as any);

            const result = await stationService.updateStation({ id: "S123" });
            expect(result).toEqual({ updated: false, messageKey: "common.crud.noChanges" });
        });
    });

    // ============================================================================================================
    //? Fetch All Stations
    // ============================================================================================================

    describe("fetchAllStations", () => {
        test("should fetch all stations successfully - covered stations included", async () => {
            (RouteStationModel.findAll as jest.Mock).mockResolvedValueOnce([{ stationId: "S1" }, { stationId: "S2" }]);// here's the covered stations
            (stationModel.update as jest.Mock).mockResolvedValue([1]);
            (stationModel.findAll as jest.Mock).mockResolvedValueOnce([{ id: "S1" }, { id: "S2" }]);

            const result = await stationService.fetchAllStations();

            expect(result).toEqual({ messageKey: "stations.success.fetched", data: [{ id: "S1" }, { id: "S2" }] });
            expect(stationModel.update).toHaveBeenCalledTimes(3); 
        });

        // --------------------------------------------------------------------

        test("should fetch all stations successfully - no covered stations", async () => {
            (RouteStationModel.findAll as jest.Mock).mockResolvedValueOnce([]); // we don't have covered stations
            (stationModel.update as jest.Mock).mockResolvedValue([1]);
            (stationModel.findAll as jest.Mock).mockResolvedValueOnce([{ id: "S3" }]);

            const result = await stationService.fetchAllStations();

            expect(result).toEqual({ messageKey: "stations.success.fetched", data: [{ id: "S3" }] });
            expect(stationModel.update).toHaveBeenCalledTimes(2); 
        });

        // --------------------------------------------------------------------

        test("should throw error when an unexpected error occurs", async () => {
            (RouteStationModel.findAll as jest.Mock).mockRejectedValueOnce(new Error("error"));

            await expect(stationService.fetchAllStations()).rejects.toThrow("error");
        });
    });

    // ============================================================================================================
    //? Fetch Default Stations (fetch fixed stations that must exists in all routes)
    // ============================================================================================================

    describe("fetchDefaultStations", () => {
        test("should fetch fixed station ids successfully", async () => {
            (stationModel.findAll as jest.Mock).mockResolvedValueOnce([{ id: "S1" }, { id: "S2" }]);

            const result = await stationService.fetchDefaultStations();

            expect(result).toEqual({ messageKey: "stations.success.fetched", data: ["S1", "S2"] });
            expect(stationModel.findAll).toHaveBeenCalledWith({
                attributes: ['id'],
                where: { defaultType: { [Op.not]: null } }
            });
        });

        // --------------------------------------------------------------------

        test("should return empty array when no default stations found", async () => {
            (stationModel.findAll as jest.Mock).mockResolvedValueOnce([]);

            const result = await stationService.fetchDefaultStations();

            expect(result).toEqual({ messageKey: "stations.success.fetched", data: [] });
            expect(stationModel.findAll).toHaveBeenCalledWith({
                attributes: ['id'],
                where: { defaultType: { [Op.not]: null } }
            });
        });

        // --------------------------------------------------------------------

        test("should throw error when an unexpected error occurs", async () => {
            (stationModel.findAll as jest.Mock).mockRejectedValueOnce(new Error("error"));
            await expect(stationService.fetchDefaultStations()).rejects.toThrow("error");
        });
    });

    // ============================================================================================================
    //? Fetch Stations For Picker
    // ============================================================================================================

    describe("fetchStationsForPicker", () => {
        test("should omit default stations from picker", async () => {
            jest.spyOn(stationService, 'fetchDefaultStations').mockResolvedValueOnce({// mocks the internal fetchDefaultStations() call (which located in fetchStationsForPicker() ) to isolate and test only the picker's logic
                messageKey: 'stations.success.fetched',
                data: ["S1"]
            });

            (stationModel.findAll as jest.Mock).mockResolvedValueOnce([
                { id: "S1", defaultType: defaultType.start },
                { id: "S2", defaultType: null },
                { id: "S3", defaultType: null }
            ]);

            const result = await stationService.fetchStationsForPicker();

            expect(result.messageKey).toEqual("stations.success.fetched");
            expect(result.data).toEqual([{ id: "S2", defaultType: null }, { id: "S3", defaultType: null }]);
        });

        // --------------------------------------------------------------------

        test("should return empty array when no stations found", async () => {
            jest.spyOn(stationService, 'fetchDefaultStations').mockResolvedValueOnce({
                messageKey: 'stations.success.fetched',
                data: []
            });

            (stationModel.findAll as jest.Mock).mockResolvedValueOnce([
                { id: "S1", defaultType: defaultType.start },
                { id: "S2", defaultType: defaultType.start  },
                { id: "S3", defaultType: defaultType.end  }
            ]);

            const result = await stationService.fetchStationsForPicker();

            expect(result.data).toEqual([]);
        });

        // --------------------------------------------------------------------

        test("should throw error when an unexpected error occurs", async () => {

            jest.spyOn(stationService, 'fetchDefaultStations').mockRejectedValueOnce(new Error("error"));
            
            await expect(stationService.fetchStationsForPicker()).rejects.toThrow("error");
        });
    });

    // ============================================================================================================
    //? Fetch Default Start Stations
    // ============================================================================================================
    
    describe("fetchDefaultStartStations", () => {
        test("should return start default station ids", async () => {
            (stationModel.findAll as jest.Mock).mockResolvedValueOnce([{ id: "S1" }]); // mock the final resutl from db, and don't mock the function fetchDefaultStationIdsByType (because it's private function, so we test it indirectly)

            const result = await stationService.fetchDefaultStartStations();

            expect(result).toEqual({ messageKey: "stations.success.fetched", data: ["S1"] });
        });

        // --------------------------------------------------------------------

        test("should throw error when an unexpected error occurs", async () => {
            (stationModel.findAll as jest.Mock).mockRejectedValueOnce(new Error("error"));
            await expect(stationService.fetchDefaultStartStations()).rejects.toThrow("error");
        });
    });

    // --------------------------------------------------------------------
    // ============================================================================================================
    //? Fetch Default End Stations
    // ============================================================================================================
    
    describe("fetchDefaultEndStations", () => {
        test("should return end default station ids", async () => {
            (stationModel.findAll as jest.Mock).mockResolvedValueOnce([{ id: "S2" }]);

            const result = await stationService.fetchDefaultEndStations();
            
            expect(result).toEqual({ messageKey: "stations.success.fetched", data: ["S2"] });
        });

        // --------------------------------------------------------------------

        test("should throw error when an unexpected error occurs", async () => {
            (stationModel.findAll as jest.Mock).mockRejectedValueOnce(new Error("error"));
            await expect(stationService.fetchDefaultEndStations()).rejects.toThrow("error");
        });
    });
});
