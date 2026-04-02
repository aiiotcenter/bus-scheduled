 
//==========================================================================================================
//? Unit Tests
//==========================================================================================================

import { RouteStationService } from "@src/services/routeStationService";


import RouteStationModel from '@src/models/routeStationModel';
 


// mock models -------------------------------------

jest.mock('@src/models/routeStationModel', () => ({
    __esModule: true,
    default: {
        // findOne: jest.fn(),
        // findAll: jest.fn(),
        create: jest.fn(),
        // destroy: jest.fn(),
        // bulkCreate: jest.fn(),
    }
}));


// mock helpers -------------------------------------





// =================================================================================================
// ======================================================================================================

// Unit Tests for Route Station service



// =================================================================================================
// ======================================================================================================


describe("RouteStationService", () => {
    const routeStationService = new RouteStationService();

    let generateSpy: jest.SpyInstance;  // instance for mocking private function

    beforeEach(() => {
        jest.clearAllMocks();

        
        jest.spyOn(console, "error").mockImplementation(() => undefined);
        
        // mock private functio
        generateSpy = jest.spyOn(routeStationService as any, "generateNextRouteStationId").mockResolvedValue("RS001"); 
    });
    
    // ---------------------------------------------------------

    afterEach(() => {
        (console.error as jest.Mock | undefined)?.mockRestore?.();
        
        generateSpy.mockRestore(); // 
    });

    // =================================================================================================
    // ======================================================================================================



    //===================================================================================================
    //? Create one Route Station
    //===================================================================================================

    describe("createOne", () => {
        // test("should create route station successfully", async () => {
            
            
        //     //mock one route station relation
        //     const input = {
        //         routeId: "R001",
        //         stationId: "S001",
        //         orderIndex: 1,
        //     };

        //     const result = await routeStationService.createOne(input);

        //     expect(generateSpy).toHaveBeenCalledTimes(1); // the mocked private function is called once at least

        //     expect(RouteStationModel.create).toHaveBeenCalledTimes(1);
        //     expect(RouteStationModel.create).toHaveBeenCalledWith({
        //         routeStationId: "RS001",
        //         ...input,
        //     });
        // });

        // // -------------------------------------------------------------

        // test("should throw error if routeId is missing", async () => {
        //     const input = {
        //         routeId: "",
        //         stationId: "S001",
        //         orderIndex: 1,
        //     };

        //     const result = await routeStationService.createOne(input);

        //     expect(generateSpy).toHaveBeenCalledTimes(1); // the mocked private function is called once at least

        //     expect(RouteStationModel.create).toHaveBeenCalledTimes(1);
        //     expect(RouteStationModel.create).toHaveBeenCalledWith({
        //         routeStationId: "RS001",
        //         ...input,
        //     });

        // });

        // // -------------------------------------------------------------

        // test("should throw error if stationId is missing", async () => {
        //     const input = {
        //         routeId: "R001",
        //         stationId: "",
        //         orderIndex: 1,
        //     };

        //     await expect(routeStationService.createOne(input)).rejects.toThrow("stationId is required");
        // });

        // -------------------------------------------------------------

        // test("should throw error if orderIndex is missing", async () => {
        //     const input = {
        //         routeId: "R001",
        //         stationId: "S001",
        //         orderIndex: null,
        //     };

        //     await expect(routeStationService.createOne(input)).rejects.toThrow("orderIndex is required");
        // });
    });

    //===================================================================================================
    //? Create Many Route Stations
    //===================================================================================================

    // describe("createMany", () => {
    //     test("should create many route stations successfully", async () => {
    //         const inputs = [
    //             {
    //                 routeId: "R001",
    //                 stationId: "S001",
    //                 orderIndex: 1,
    //             },
    //             {
    //                 routeId: "R001",
    //                 stationId: "S002",
    //                 orderIndex: 2,
    //             },
    //         ];

    //         await routeStationService.createMany(inputs);

    //         expect(RouteStationModel.create).toHaveBeenCalledTimes(2);
    //         expect(RouteStationModel.create).toHaveBeenCalledWith(inputs[0]);
    //         expect(RouteStationModel.create).toHaveBeenCalledWith(inputs[1]);
    //     });
    // });
});

// disable this file for a quite bit

test.skip("logout tests temporarily disabled", () => {
    expect(true).toBe(true);
});