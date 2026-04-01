 
 //==========================================================================================================
 //? Unit Tests
 //==========================================================================================================
 
 import RouteModel from '../src/models/routeModel'
 import { RouteService } from "../src/services/routeService";
 
 import { NotFoundError, ValidationError, ConflictError } from "../src/errors";
 import { status } from "../src/enums/routeEnum";
import { update } from '@src/helpers/userHelper/update';
import { Transform } from 'stream';
import RouteStationModel from '@src/models/routeStationModel';
import stationModel from '@src/models/stationModel';
 
 // mock models/helpers ------------------------------------------------------------------------
 jest.mock("../src/models/routeModel", () => ({
     __esModule: true,
     default: {
         findAll: jest.fn(),
         findOne: jest.fn(),
         findByPk: jest.fn(),
         create: jest.fn(),
         update: jest.fn(),
         destroy: jest.fn(),
         getAttributes: jest.fn(),
     },
 }));

 jest.mock("../src/models/routeStationModel", () => ({
    __esModule: true,
    default: {
        findAll: jest.fn(),
        bulkCreate: jest.fn(),
        destroy: jest.fn(),
    },
 }));

 jest.mock("../src/models/stationModel", () => ({
    __esModule: true,
    default: {
        findAll: jest.fn(),
    },
 }));

 jest.mock("../src/helpers/colorHelper", () => ({
    normalizeColorToArgbInt: jest.fn(() => 12345),
 }));

 jest.mock("../src/helpers/routeHelper", () => ({
    buildFinalStations: jest.fn((stations) => stations),
    fetchOsrmGeometry: jest.fn(() => Promise.resolve([])),
 }));


 
 jest.mock("../src/helpers/userHelper", () => {
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

// mocking station service
 jest.mock("../src/services/stationService", () => {
    return {
        StationService: jest.fn().mockImplementation(() => ({
            fetchDefaultStartStations: jest.fn().mockResolvedValue({ data: [] }),
            fetchDefaultEndStations: jest.fn().mockResolvedValue({ data: [] }),
        }))
    };
});

 // ============================================================================================================
 // ============================================================================================================
 // unit test for route services:
 
 // - Add
 //   should add route successfully 
 //   should throw ValidationError when required fields are missing
 //   should throw error when an unexpected error occurs


 // - Remove
 //   should remove route successfully
 //   should throw NotFoundError when route is not found
 //   should throw error when an unexpected error occurs


 // - Update
 //   should update route successfully
 //   should throw NotFound Error when route is not found
 //   should throw error when an unexpected error occurs

// - View Routes
//    should return all routes and their stations when displayAll is true
//    should return only covered routes without stations when displayAll is false
//    should throw error when an unexpected error occurs

// - fetch Routes for map visulatlization
//    should fetch all routes defining their stations and the corresponding locations
//    should throw error when an unexpected error occurs
//    should return empty array when no routes are found


 // =================================================================================================
 // ======================================================================================================

 describe("RouteService", () => {
     const routeService = new RouteService();

 
     beforeEach(() => {
         jest.clearAllMocks();
 
         const UserHelperModule = require("../src/helpers/userHelper");
         UserHelperModule.mockUserHelperInstance.add.mockClear();
         UserHelperModule.mockUserHelperInstance.remove.mockClear();
         UserHelperModule.mockUserHelperInstance.update.mockClear();
 
         jest.spyOn(console, "error").mockImplementation(() => undefined);
     });
 
     afterEach(() => {
         (console.error as jest.Mock | undefined)?.mockRestore?.();
     });
 
     // ============================================================================================================
     //? Add Route
     // ============================================================================================================
     
     describe('addRoute', () => {
        test("should add route successfully", async() =>{
            const UserHelperModule = require("../src/helpers/userHelper");
            UserHelperModule.mockUserHelperInstance.add.mockResolvedValueOnce(undefined);

            const payload = { title: "Route 1", color: "#000000", status: status.covered, totalStops: 0 };
            const result = await routeService.addRoute(payload);

            expect(result).toEqual({ messageKey: "routes.success.added" });

            expect(UserHelperModule.mockUserHelperInstance.add).toHaveBeenCalledTimes(1);
            expect(UserHelperModule.mockUserHelperInstance.add).toHaveBeenCalledWith(
                RouteModel,
                payload,
                expect.objectContaining({
                    enumFields: [{ field: "status", enumObj: status }],
                })
            );
        });

        // -------------------------------------------------------------------------------

        test("should throw Validation Error when required fields are missing", async() =>{
            const UserHelperModule = require("../src/helpers/userHelper");
            UserHelperModule.mockUserHelperInstance.add.mockRejectedValueOnce(
                new ValidationError("common.errors.validation.fillAllFields")
            );

            const promise = routeService.addRoute({});

            await expect(promise).rejects.toBeInstanceOf(ValidationError);
        });

        // -------------------------------------------------------------------------------

        test("should throw error when an unexpected error occurs", async() =>{
            const UserHelperModule = require("../src/helpers/userHelper");
            UserHelperModule.mockUserHelperInstance.add.mockRejectedValueOnce(new Error("error"));

            const payload = { title: "Route 1", color: "#000000", status: status.covered };
            const promise = routeService.addRoute(payload);

            await expect(promise).rejects.toThrow("error");
            expect(UserHelperModule.mockUserHelperInstance.add).toHaveBeenCalledTimes(1);
        });
      })
 
     // ============================================================================================================
     //? Remove Route
     // ============================================================================================================
      
     describe('removeRoute', () => {
        test("should remove route successfully", async() =>{
            const UserHelperModule = require("../src/helpers/userHelper");
            UserHelperModule.mockUserHelperInstance.remove.mockResolvedValueOnce(undefined);

            const result = await routeService.removeRoute("R001");

            expect(result).toEqual({ messageKey: "common.crud.removed" });

            expect(UserHelperModule.mockUserHelperInstance.remove).toHaveBeenCalledTimes(1);
            expect(UserHelperModule.mockUserHelperInstance.remove).toHaveBeenCalledWith(
                RouteModel,
                "id",
                "R001"
            );
        });

        // ------------------------------------------------------------------------------

        test("should throw NotFoundError when route is not found", async() =>{
            const UserHelperModule = require("../src/helpers/userHelper");
            UserHelperModule.mockUserHelperInstance.remove.mockRejectedValueOnce(
                new NotFoundError("common.errors.notFound")
            );

            const promise = routeService.removeRoute("R001");

            await expect(promise).rejects.toBeInstanceOf(NotFoundError);
        });

        // ------------------------------------------------------------------------------

        test("should throw error when an unexpected error occurs", async() =>{
            const UserHelperModule = require("../src/helpers/userHelper");
            UserHelperModule.mockUserHelperInstance.remove.mockRejectedValueOnce(new Error("error"));

            const promise = routeService.removeRoute("R001");

            await expect(promise).rejects.toThrow("error");
            expect(UserHelperModule.mockUserHelperInstance.remove).toHaveBeenCalledTimes(1);
        });
     })
 
    // ============================================================================================================
    //? Update Route
    // ============================================================================================================
      describe('updateRoute', () => {
        test("should update route successfully", async() =>{
            const UserHelperModule = require("../src/helpers/userHelper");
            UserHelperModule.mockUserHelperInstance.update.mockResolvedValueOnce({updated: true} as any);

            const payload = {id: "R001", title: "Route 1", color: "#000000", status: status.covered, totalStops: 0 };
            const result = await routeService.updateRoute(payload);

            expect(result).toEqual({ messageKey: "routes.success.updated" });

            expect(UserHelperModule.mockUserHelperInstance.update).toHaveBeenCalledTimes(1);
            expect(UserHelperModule.mockUserHelperInstance.update).toHaveBeenCalledWith(
                RouteModel,
                payload,
                expect.objectContaining({
                    transform: expect.any(Function),
                    enumFields: [{ field: "status", enumObj: status }],
                    
                }), 
            );
        });

        // ------------------------------------------------------------------------------

        test("should throw NotFound Error when route is not found", async() =>{
            const UserHelperModule = require("../src/helpers/userHelper");
            UserHelperModule.mockUserHelperInstance.update.mockRejectedValueOnce(
                new NotFoundError("common.errors.notFound")
            );

            const payload = {id: "R001", title: "Route 1", color: "#000000", status: status.covered, totalStops: 0 };
            const promise = routeService.updateRoute(payload);

            await expect(promise).rejects.toBeInstanceOf(NotFoundError);
        });

        // ------------------------------------------------------------------------------

        test("should throw error when an unexpected error occurs", async() =>{
            const UserHelperModule = require("../src/helpers/userHelper");
            UserHelperModule.mockUserHelperInstance.update.mockRejectedValueOnce(new Error("error"));

            const payload = { title: "Route 1", color: "#000000", status: status.covered };
            const promise = routeService.updateRoute(payload);

            await expect(promise).rejects.toThrow("error");
            expect(UserHelperModule.mockUserHelperInstance.update).toHaveBeenCalledTimes(1);
        });
      

    });

    // =================================================================================
    //? View Routes
    // =================================================================================
    describe('viewRoutes', () => {

        test("should return all routes and their stations when displayAll is true", async() =>{
            const mockRoutes = [
                { id: "R001", title: "Route 1", color: "#000000", totalStops: 2, status: status.covered, dataValues: {} },
                { id: "R002", title: "Route 2", color: "#FFFFFF", totalStops: 0, status: status.covered, dataValues: {} }
            ];
            
            const mockRouteStations = [
                { stationId: "S001", orderIndex: 0 },
                { stationId: "S002", orderIndex: 1 }
            ];

            const mockStationRows = [
                { id: "S001", stationName: "Station A", latitude: 10, longitude: 20 },
                { id: "S002", stationName: "Station B", latitude: 15, longitude: 25 }
            ];

            (RouteModel.findAll as jest.Mock).mockResolvedValueOnce(mockRoutes);

            // Mock route stations  
            (RouteStationModel.findAll as jest.Mock).mockResolvedValueOnce(mockRouteStations).mockResolvedValueOnce([]);// mocked data for the FIRST route, and empty for SECOND 

            // Mock station details for the FIRST route
            // its functionality is same logic as the one above, the different only lays in the implementation method, above i wrote it all in 1 line , I mocked and called the resoure earlier
            const stationModel = require("../src/models/stationModel").default;
            stationModel.findAll.mockResolvedValueOnce(mockStationRows);



            const result = await routeService.viewRoutes(true);



            expect(RouteModel.findAll).toHaveBeenCalledWith({
                attributes: ['id', 'title', 'color', 'totalStops', 'status']
            });

            expect(RouteStationModel.findAll).toHaveBeenCalledWith(expect.objectContaining({ where: { routeId: "R001" } }));
            expect(RouteStationModel.findAll).toHaveBeenCalledWith(expect.objectContaining({ where: { routeId: "R002" } }));

            expect(result.messageKey).toBe("common.crud.fetched");

            const data = result.data as any[];
            expect(data).toHaveLength(2);
            expect(data[0].dataValues.stations).toHaveLength(2);
            expect(data[0].dataValues.stations[0].stationName).toBe("Station A");
            expect(data[1].dataValues.stations).toEqual([]);
        });

        // ------------------------------------------------------------------------------

        test("should return only covered routes without stations when displayAll is false", async() =>{
            const mockRoutes = [
                { id: "R001", title: "Route 1", color: "#000000", totalStops: 2, status: status.covered, dataValues: {} }
            ];

            (RouteModel.findAll as jest.Mock).mockResolvedValueOnce(mockRoutes);
            


            const result = await routeService.viewRoutes(false);



            expect(RouteModel.findAll).toHaveBeenCalledWith({
                where: { status: status.covered },
                attributes: ['id', 'title', 'color', 'totalStops', 'status']
            });

            expect(result).toEqual({ 
                messageKey: "common.crud.fetched", 
                data: mockRoutes
            });
            expect((result.data as any[])[0].dataValues.colorInt).toBe(12345);
        });

        // ------------------------------------------------------------------------------

        test("should throw error when an unexpected error occurs", async() =>{
            (RouteModel.findAll as jest.Mock).mockRejectedValueOnce(new Error("error"));
            await expect(routeService.viewRoutes(true)).rejects.toThrow("error");
        });

    });


    // ========================================================================================
    //? Fetch rotue for Map visulization   
    // =========================================================================================

    describe("fetchRoutesMap", () =>{

        test("should fetch all routes defining their stations and the corresponding locations", async() =>{
            
            
            // mock routes findAll method -----------------------------------------------------
            const mockRoute = [
                { id: "R001", title: "Route 1", color: "#000000", totalStops: 2, status: status.covered, dataValues: {} }
            ];
            (RouteModel.findAll as jest.Mock ).mockResolvedValue(mockRoute);


            // mock route stations findAll method ----------------------------------------------
            const mockRouteStations = [
                { stationId: "S001", orderIndex: 0 },
                { stationId: "S002", orderIndex: 1 }
            ];

            (RouteStationModel.findAll as jest.Mock).mockResolvedValueOnce(mockRouteStations);

            // mock station findAll method----------------------------------------------------
            const mockStationRows = [
                { id: "S001", stationName: "Station A", latitude: 10, longitude: 20 },
                { id: "S002", stationName: "Station B", latitude: 15, longitude: 25 }
            ];

            ( stationModel.findAll as jest.Mock).mockResolvedValueOnce(mockStationRows);



            const result = await routeService.fetchRoutesMap();


            expect(result.messageKey).toBe("common.crud.fetched");
            expect(result.data as any[]).toHaveLength(1);// i defined only one route
            expect((result.data as any[])[0].dataValues.points).toHaveLength(2);// defined two stations for the route
            
            expect((result.data as any[])[0].dataValues.points[0].stationName).toBe("Station A");
            expect((result.data as any[])[0].dataValues.points[1].stationName).toBe("Station B");
            expect((result.data as any[])[0].dataValues.points[0].latitude).toBe(10);
            expect((result.data as any[])[0].dataValues.points[0].longitude).toBe(20);
            expect((result.data as any[])[0].dataValues.points[1].latitude).toBe(15);
            expect((result.data as any[])[0].dataValues.points[1].longitude).toBe(25);
            
        })

        // ------------------------------------------------------------------------------

        test("should throw error when an unexpected error occurs", async() =>{
            (RouteModel.findAll as jest.Mock).mockRejectedValueOnce(new Error("error"));

            await expect(routeService.fetchRoutesMap()).rejects.toThrow("error");
        });

        // ------------------------------------------------------------------------------

        test("should return empty array when no routes are found", async() =>{
            (RouteModel.findAll as jest.Mock).mockResolvedValueOnce([]);

            const result = await routeService.fetchRoutesMap();

            expect(result.data).toEqual([]);
            expect(result.messageKey).toBe("common.crud.fetched");
        });


    })
 });
