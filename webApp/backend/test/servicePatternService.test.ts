//==========================================================================================================
//? import
//==========================================================================================================

import { ServicePatternService } from "@src/services/servicePatternService";

//import errors -------------------

import { ValidationError, NotFoundError } from "@src/errors";
// mock models -------------------------------------

jest.mock('@src/config/database', () => ({
    sequelize: {
        transaction: jest.fn(async (cb) => {
            return cb({
                // mock transaction object t
            });
        }),
    },
}));

import ServicePatternModel from "@src/models/servicePatternModel";
jest.mock("@src/models/servicePatternModel", () => ({
    __esModule: true,
    default: {
        findAll: jest.fn(),
        findOne: jest.fn(),
        count: jest.fn(),
        update: jest.fn(),
        create: jest.fn(),
        destroy: jest.fn(),
    },
}));


//* ============================================================================================================
// Mocks for models imported transitively by other service functions like: deleteServicePattern ( usual Node.js behavior, it evaluates all imports when file servicePatternService.ts is loaded)
// we mock the models to prevents Sequelize init crashes when the module is first loaded into memory

import OperatingHoursModel from "@src/models/operatingHoursModel";
jest.mock("@src/models/operatingHoursModel", () => ({
    __esModule: true,
    default: {
        findAll: jest.fn(),
        count: jest.fn(),
        create: jest.fn(),
        destroy: jest.fn(),
    },
}));


import ScheduleModel from "@src/models/scheduleModel";
jest.mock("@src/models/scheduleModel", () => ({
    __esModule: true,
    default: {
        findAll: jest.fn(),
        destroy: jest.fn(),
    },
}));

import ScheduledTripsModel from "@src/models/scheduledTripsModel";
import scheduledTrips from "@src/seeders/sampleScheduledTrips";
jest.mock("@src/models/scheduledTripsModel", () => ({
    __esModule: true,
    default: {
        destroy: jest.fn(),
    },
}));



//* ============================================================================================================


// ============================================================================================================
// ============================================================================================================

// unit Test for service patterns

// - GET servicePatterns 
//   should return service patterns successfully
//   should return empty array when no service patterns exist
//   should propagate errors thrown by the model

// - ADD servicePattern
//   should add a new service pattern successfully
//   should throw error when title is empty
//   should thorw Validation error if hours is empty
//   should throw error if count service pattern method throws unexpected error
//   should throw error if create service pattern method throws unexpected error


// - Delete servicePattern
//   should delete service pattern successfully
//   should throw error if the pattern id is missing
//   should throw error if the pattern id is not found
//   should throw error when an unexpected error occurs


// - Update servicePattern 
//   should update service pattern successfully
//   should return Validation error if  service pattern id is missing
//   should return Validation error if title is missing
//   should return Validation error if hours is empty
//   should throw error if unexpected error occurd


// ============================================================================================================
// ============================================================================================================


describe("servicePatterns", () =>{
    const servicePatternService = new ServicePatternService();

    beforeEach(() =>{
        jest.clearAllMocks();
    })

    afterEach(() =>{
        jest.restoreAllMocks();
    })

    // =====================================================================
    //? GET ServicePatterns
    // =====================================================================

    describe("GET servicePatterns", () => {

        test("should return service patterns successfully", async () => {

            // arrange ----------
            const mockRows = [
                { servicePatternId: "SP01", title: "Weekdays",          operatingHours: [{ operatingHourId: "OH01", hour: "08:00" }] },
                { servicePatternId: "SP02", title: "Weekend(saturday)",  operatingHours: [] },
                { servicePatternId: "SP03", title: "Weekend(sunday)",    operatingHours: [] },
                { servicePatternId: "SP04", title: "Public Holiday",     operatingHours: [] },
            ];

            (ServicePatternModel.findAll as jest.Mock).mockResolvedValueOnce(mockRows);

            // act ----------
            const result = await servicePatternService.getServicePatterns();

            // assert ----------
            expect(result).toEqual({
                messageKey: "common.crud.fetched",
                data: [
                    { servicePatternId: "SP01", title: "Weekdays",          operatingHours: [{ operatingHourId: "OH01", hour: "08:00" }] },
                    { servicePatternId: "SP02", title: "Weekend(saturday)",  operatingHours: [] },
                    { servicePatternId: "SP03", title: "Weekend(sunday)",    operatingHours: [] },
                    { servicePatternId: "SP04", title: "Public Holiday",     operatingHours: [] },
                ],
            });

            expect(ServicePatternModel.findAll).toHaveBeenCalledTimes(1);
        });

        // -----------------------------------------------------------------------------

        test("should return empty array when no service patterns exist", async () => {

            // arrange ----------
            (ServicePatternModel.findAll as jest.Mock).mockResolvedValueOnce([]);

            // act ----------
            const result = await servicePatternService.getServicePatterns();

            // assert ----------
            expect(result).toEqual({
                messageKey: "common.crud.fetched",
                data: [],
            });

            expect(ServicePatternModel.findAll).toHaveBeenCalledTimes(1);
        });

        // -----------------------------------------------------------------------------

        test("should propagate errors thrown by the model", async () => {

            // arrange ----------
            const mockError = new Error("error");
            (ServicePatternModel.findAll as jest.Mock).mockRejectedValueOnce(mockError);

            // act ----------
            const promise = servicePatternService.getServicePatterns();

            // assert ----------
            await expect(promise).rejects.toThrow("error");
        });


        // ----------------------------------------------------------------------------------------

        test("should throw error when an unexpected error occurs", async() =>{
            const mockedInput = {
                title: "Weekend(Sunday)",
                hours: [ 9, 11, 13, 15, 17, 19],
            };
            (ServicePatternModel.count as jest.Mock).mockRejectedValueOnce(new Error("error"));

            //  ----------
            const promise = servicePatternService.addServicePattern(mockedInput);

            //  ----------
            await expect(promise).rejects.toThrow("error");
        });

    });
    
    // =====================================================================
    //? ADD ServicePatterns
    // =====================================================================

    describe("ADD servicePattern", () =>{
        
        test("should add service pattern successfully", async () =>{
            // mock servicePattern data
            const mockedInput = {
                title: "Weekend(Sunday)",
                hours: [ 9, 11, 13, 15, 17, 19],
            };

            // mock .count for operatingHours and servicePattern to return 0 so loops terminate
            (ServicePatternModel.count as jest.Mock).mockResolvedValue(0); 
            (OperatingHoursModel.count as jest.Mock).mockResolvedValue(0);

            // mock .create for operatingHours and servicePattern
            (OperatingHoursModel.create as jest.Mock).mockResolvedValue({});
            (ServicePatternModel.create as jest.Mock).mockResolvedValue({});

            // act ----------
            const result = await servicePatternService.addServicePattern(mockedInput);

            // assert ----------
            expect(result).toEqual({
                messageKey: "servicePatterns.success.added",
                data: {
                    servicePatternId: expect.stringMatching(/^S\d{3}$/), // the id is random, so we use regular expression to match it
                    title: "Weekend(Sunday)",
                    operatingHours: [
                        { operatingHourId: expect.stringMatching(/^O\d{3}$/), hour: "09:15:00" },
                        { operatingHourId: expect.stringMatching(/^O\d{3}$/), hour: "11:15:00" },
                        { operatingHourId: expect.stringMatching(/^O\d{3}$/), hour: "13:15:00" },
                        { operatingHourId: expect.stringMatching(/^O\d{3}$/), hour: "15:15:00" },
                        { operatingHourId: expect.stringMatching(/^O\d{3}$/), hour: "17:15:00" },
                        { operatingHourId: expect.stringMatching(/^O\d{3}$/), hour: "19:15:00" },
                    ],
                },
            });

            // we have only one service pattern here
            expect(ServicePatternModel.count).toHaveBeenCalledTimes(1);
            expect(ServicePatternModel.create).toHaveBeenCalledTimes(1);

            // we have 6 operating hours here
            expect(OperatingHoursModel.count).toHaveBeenCalledTimes(6);
            expect(OperatingHoursModel.create).toHaveBeenCalledTimes(6);
            

        });

        // ----------------------------------------------------------------------------------------------------

        test("should throw Validation error if title is empty", async () =>{
            // arrange ----------
            const mockedInput = {
                title: "",
                hours: [ 9, 11, 13, 15, 17, 19],
            };

            // --------
            const result = servicePatternService.addServicePattern(mockedInput);

            // ------------
            await expect(result)
                .rejects.toThrow(ValidationError);
            
            await expect(result)
                .rejects.toThrow("servicePatterns.validation.titleRequired");
        });

        // ----------------------------------------------------------------------------------------------------

        test("should thorw Validation error if hours is empty", async () =>{
            // arrange ----------
            const mockedInput = {
                title: "Weekend(Sunday)",
                hours: [],
            };

            // --------
            const result = servicePatternService.addServicePattern(mockedInput);

            // ------------
            await expect(result)
                .rejects.toThrow(ValidationError);
            
            await expect(result)
                .rejects.toThrow("servicePatterns.validation.selectAtLeastOneHour");
        });

        // -------------------------------------------------------------------------

        test("should throw error if count service pattern method throws unexpected error", async() =>{
            const mockedInput = {
                title: "Weekend(Sunday)",
                hours: [ 9, 11, 13, 15, 17, 19],
            };
            (ServicePatternModel.count as jest.Mock).mockRejectedValueOnce(new Error("error"));

            //  ----------
            const promise = servicePatternService.addServicePattern(mockedInput);

            //  ----------
            await expect(promise).rejects.toThrow("error");
        });

        // -------------------------------------------------------------------------------------

        test("should throw error if create service pattern method throws unexpected error", async() =>{
            const mockedInput = {
                title: "Weekend(Sunday)",
                hours: [ 9, 11, 13, 15, 17, 19],
            };
            (ServicePatternModel.create as jest.Mock).mockRejectedValueOnce(new Error("error"));

            //  ----------
            const promise = servicePatternService.addServicePattern(mockedInput);

            //  ----------
            await expect(promise).rejects.toThrow("error");
        });


    });


    // ============================================================================================
    //? Delete Service pattern 
    // ============================================================================================

    describe("Delete servicePattern", () =>{
        
        test("should delete service pattern successfully", async () =>{
            const mockedInputId = "S123";

            (ServicePatternModel.findOne as jest.Mock).mockResolvedValue({
                servicePatternId: "S123",
                title: "Weekend(Sunday)",
                operatingHours: [
                    { operatingHourId: "O123", hour: "09:15:00" },
                    { operatingHourId: "O124", hour: "11:15:00" },
                    { operatingHourId: "O125", hour: "13:15:00" },
                    { operatingHourId: "O126", hour: "15:15:00" },
                    { operatingHourId: "O127", hour: "17:15:00" },
                    { operatingHourId: "O128", hour: "19:15:00" },
                ],
            });

            (ScheduleModel.findAll as jest.Mock).mockResolvedValue([
                { scheduleId: "SCH1" },
            ]);

            (ScheduledTripsModel.destroy as jest.Mock).mockResolvedValueOnce(1);
            (ScheduleModel.destroy as jest.Mock).mockResolvedValueOnce(1);

            (OperatingHoursModel.destroy as jest.Mock).mockResolvedValue(1);
            (ServicePatternModel.destroy as jest.Mock).mockResolvedValue(1);

            //  ----------
            const result = await servicePatternService.deleteServicePattern(mockedInputId);

            //  ----------
            expect(result).toEqual({
                messageKey: "servicePatterns.success.deleted",
            });

            // we have only one service pattern here
            expect(OperatingHoursModel.destroy).toHaveBeenCalledTimes(1);
            expect(ServicePatternModel.destroy).toHaveBeenCalledTimes(1);
            expect(ScheduledTripsModel.destroy).toHaveBeenCalledTimes(1);
            expect(ScheduleModel.destroy).toHaveBeenCalledTimes(1);
        });

        // ----------------------------------------------------------------------------------------------

        test("should throw error if the pattern id is missing", async() => {
            const mockedInputId = "";

            // --------
            const result = servicePatternService.deleteServicePattern(mockedInputId);

            // ------------
            await expect(result)
                .rejects.toThrow(ValidationError);
            
            await expect(result)
                .rejects.toThrow("servicePatterns.validation.idRequired");
        });

        // ----------------------------------------------------------------------------------------------

        test("should throw error if the pattern id is not found", async() => {
            // arrange ----------
            const mockedInputId = "S123";

            // Make findOne return null
            (ServicePatternModel.findOne as jest.Mock).mockResolvedValue(null);

            // --------
            const promise = servicePatternService.deleteServicePattern(mockedInputId);

            // ------------
            await expect(promise)
                .rejects.toThrow(NotFoundError);
            
            await expect(promise)
                .rejects.toThrow("servicePatterns.errors.notFound");
        });

        // ---------------------------------------------------------------------------------

        test("should throw error when an unezpected error occurs", async () =>{
            const mockedInputId = "S123";

            (ServicePatternModel.findOne as jest.Mock).mockRejectedValueOnce(new Error("error"));

            // --------
            const promise = servicePatternService.deleteServicePattern(mockedInputId);

            // ------------
            await expect(promise)
                .rejects.toThrow("error");
        })
    });

    // ===========================================================================================
    //? UPDATE service pattern 
    // ===========================================================================================

    describe("Update servicePattern", () =>{


        test("should update service pattern successfully", async () => {
            const mockedInput = {
                servicePatternId: "S123",
                title: "Weekday",
                hours: [ 9, 11, 13, 15, 17, 19],
            };

            (ServicePatternModel.findOne as jest.Mock).mockResolvedValueOnce(1);

            (ServicePatternModel.update as jest.Mock).mockResolvedValueOnce(1);

            (OperatingHoursModel.destroy as jest.Mock).mockResolvedValueOnce(1);
            
            (OperatingHoursModel.count as jest.Mock).mockResolvedValueOnce(1);

            (OperatingHoursModel.create as jest.Mock).mockResolvedValueOnce(1);


            const result = await servicePatternService.updateServicePattern(mockedInput);


            expect(result).toEqual({
                messageKey: "servicePatterns.success.updated",
                data: {
                    servicePatternId: "S123",
                    title: "Weekday",
                    operatingHours: [

                        { operatingHourId: expect.stringMatching(/^O\d{3}$/), hour: "09:15:00" },
                        { operatingHourId: expect.stringMatching(/^O\d{3}$/), hour: "11:15:00" },
                        { operatingHourId: expect.stringMatching(/^O\d{3}$/), hour: "13:15:00" },
                        { operatingHourId: expect.stringMatching(/^O\d{3}$/), hour: "15:15:00" },
                        { operatingHourId: expect.stringMatching(/^O\d{3}$/), hour: "17:15:00" },
                        { operatingHourId: expect.stringMatching(/^O\d{3}$/), hour: "19:15:00" },
                    ],
                },
            });
        })

        //--------------------------------------------------------------------------------
        
        test("should return Validation error if  service pattern id is missing", async () =>{
        
        const mockedInput = {
            servicePatternId: "",
            title: "Weekday",
            hours: [ 9, 11, 13, 15, 17, 19],
        };

        // --------
        const result = servicePatternService.updateServicePattern(mockedInput);

        // ------------
        await expect(result)
            .rejects.toThrow(ValidationError);
        
        await expect(result)
            .rejects.toThrow("servicePatterns.validation.idRequired");
        
        })

        // ----------------------------------------------------------------------------------------------

        test("should return Validation error if title is missing", async () =>{
            
            const mockedInput = {
                servicePatternId: "S123",
                title: "",
                hours: [ 9, 11, 13, 15, 17, 19],
            };

            // --------
            const result = servicePatternService.updateServicePattern(mockedInput);

            // ------------
            await expect(result)
                .rejects.toThrow(ValidationError);
            
            await expect(result)
                .rejects.toThrow("servicePatterns.validation.titleRequired");
        
        });

        // ----------------------------------------------------------------------------------------------

        test("should return Validation error if hours is empty", async () =>{
            
            const mockedInput = {
                servicePatternId: "S123",
                title: "Weekday",
                hours: [],
            };

            // --------
            const result = servicePatternService.updateServicePattern(mockedInput);

            // ------------
            await expect(result)
                .rejects.toThrow(ValidationError);
            
            await expect(result)
                .rejects.toThrow("servicePatterns.validation.selectAtLeastOneHour");
        
        });

        // ---------------------------------------------------------------------------------

        test("should throw error if unexpected error occurd", async () =>{
            const mockedInput = {
                servicePatternId: "S123",
                title: "Weekday",
                hours: [ 9, 11, 13, 15, 17, 19],
            };

            (ServicePatternModel.findOne as jest.Mock).mockRejectedValueOnce(new Error("error"));


            const result =  servicePatternService.updateServicePattern(mockedInput);

            await expect(result).rejects.toThrow("error");
        
        });
    });
    
});