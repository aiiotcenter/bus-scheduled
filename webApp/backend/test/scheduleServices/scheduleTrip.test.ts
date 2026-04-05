//==========================================================================================================
//? import
//==========================================================================================================

import { ScheduleService } from "@/services/scheduleService"
//import errors -------------------


// mock models -------------------------------------


import ScheduleModel from "@/models/scheduleModel";
jest.mock("@/models/scheduleModel", () => ({
    findOne: jest.fn(),
}));


import ScheduleTripModel from "@/models/scheduledTripsModel";
import { ConflictError, ValidationError } from "@/errors";

jest.mock("@/models/scheduledTripsModel", () => ({
    findOne: jest.fn(),
    // update: jest.fn(),
}));


// mock helpers -------------------------------------


jest.mock("@/helpers/userHelper", () => {
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


// ============================================================================================================
// ============================================================================================================


// unit tests for Schedule Trip service

// - Upsert(Update & Insert) schedule Trip

//   should throw error when schedule is not found
//   should throw error if the driver is on duty
//   should throw error if the bus is already assigned at this time
//   should throw error if a unexpected conflict state occurs
//   should throw error when unexpeted error occurs

//   should update trip successfully
//   should return noChange message when no data changed
//   should throw error when update trip fails

//   should add schedule trip successfully
//   should throw Validation error if some of add trip data is missing
//   should throw Validation error if add trip data is not provided
//   should throw error when add trip fails



// - Remove schedule Trip

//   should remove trip successfully
//   should throw error when trip id is not provided
//   should throw error when trip id is empty
//   should throw error when remove trip fails
//   
// ============================================================================================================
// ============================================================================================================


describe("scheduleTrip", () => {
    const  scheduleService = new ScheduleService();

    beforeEach(() => {
        jest.clearAllMocks();
    })

    afterEach(() => {
        jest.restoreAllMocks();
    })

    // =====================================================================
    //? Upsert(Update & Insert) schedule Trip
    // =====================================================================

    describe("Upsert (Update & Insert) Trip", () => {

        test("should throw error when schedule is not found", async () => {

            const mockInput = { scheduleId: "S001", time: "08:00", routeId: "R001", driverId: "D001", busId: "B001" };              

            // schedule does NOT exists 
            (ScheduleModel.findOne as jest.Mock).mockResolvedValueOnce(null); 
            
            // ----------------------------------
            const result = scheduleService.upsertScheduledTrip(mockInput);

            // --------------------------------
            await expect(result).rejects.toThrow("schedule.errors.notFound");

            expect(ScheduleModel.findOne).toHaveBeenCalledTimes(1);
        });

        // ----------------------------------------------------------------------------
        test("should throw error if the driver is on duty", async () => {

            const mockInput = { scheduleId: "S001", time: "08:00", routeId: "R001", driverId: "D001", busId: "B001" };               

            // schedule exists 
            (ScheduleModel.findOne as jest.Mock).mockResolvedValueOnce("S001"); 
            
            // trip already exists
            (ScheduleTripModel.findOne as jest.Mock).mockResolvedValueOnce({scheduleId:"S001",time:"08:00",routeId:"R001"});

            // conflit exists - driver is on duty (not available)
            (ScheduleTripModel.findOne as jest.Mock).mockResolvedValueOnce("S001");

            // --------------------------------------------------
            const result = scheduleService.upsertScheduledTrip(mockInput);

            //--------------------------------------------------
            await expect(result).rejects.toBeInstanceOf(ConflictError);

            expect(ScheduleTripModel.findOne).toHaveBeenCalledTimes(2);

        });

        // ----------------------------------------------------------------------------
        test("should throw error if the bus is already assigned at this time", async () => {

            const mockInput = { scheduleId: "S001", time: "08:00", routeId: "R001", driverId: "D001", busId: "B001" };               

            //  schedule exists 
            (ScheduleModel.findOne as jest.Mock).mockResolvedValueOnce("S001"); 
            
            // trip already exists
            (ScheduleTripModel.findOne as jest.Mock).mockResolvedValueOnce({scheduleId:"S001",time:"08:00",routeId:"R001"});

            // conflict occurs - bus is not available at this time
            (ScheduleTripModel.findOne as jest.Mock).mockResolvedValueOnce("B001");

            // ------------------------------
            const result = scheduleService.upsertScheduledTrip(mockInput);

            // -------------------------------------
            await expect(result).rejects.toBeInstanceOf(ConflictError);

            expect(ScheduleTripModel.findOne).toHaveBeenCalledTimes(2);

        })
        // ----------------------------------------------------------------------------
        test("should throw error if a unexpected conflict state occurs", async () => {

            const mockInput = { scheduleId: "S001", time: "08:00", routeId: "R001", driverId: "D001", busId: "B001" };               

            // schedule exists 
            (ScheduleModel.findOne as jest.Mock).mockResolvedValueOnce("S001"); 
            
            // trip already exists
            (ScheduleTripModel.findOne as jest.Mock).mockResolvedValueOnce({scheduleId:"S001",time:"08:00",routeId:"R001"});

            // unexpected conflit occures
            (ScheduleTripModel.findOne as jest.Mock).mockRejectedValueOnce(new ConflictError("tripForm.errors.unexpectedConflict"));

            // ------------------------------------------------------
            const result = scheduleService.upsertScheduledTrip(mockInput);

            // ------------------------------------------------------
            await expect(result).rejects.toBeInstanceOf(ConflictError);
            await expect(result).rejects.toThrow("tripForm.errors.unexpectedConflict");

            expect(ScheduleTripModel.findOne).toHaveBeenCalledTimes(2);

        })


        // -----------------------------------------------------------------------------

        test("should throw error when unexpeted error occurs", async () => {
            const mockInput = { scheduleId: "S001", time: "08:00", routeId: "R001", driverId: "D001", busId: "B001" };               
            const error = new Error("error");
            (ScheduleModel.findOne as jest.Mock).mockRejectedValueOnce(error);

            const result = scheduleService.upsertScheduledTrip(mockInput);

            await expect(result).rejects.toThrow("error");
            expect(ScheduleModel.findOne).toHaveBeenCalledTimes(1);
        });

        // ------------------------------------------------------------------------

        test("should update trip successfully", async () => {

            const mockInput = { scheduleId: "S001", time: "08:00", routeId: "R001", driverId: "D001", busId: "B001" };               
           
            // schedule exists 
            (ScheduleModel.findOne as jest.Mock).mockResolvedValueOnce("S001"); 
            
            // trip already exists
            (ScheduleTripModel.findOne as jest.Mock).mockResolvedValueOnce({scheduleId:"S001",time:"08:00",routeId:"R001"});

            // no conflict (new update data dones't conflit with any data at the same time)
            (ScheduleTripModel.findOne as jest.Mock).mockResolvedValueOnce(null);

            // update success
            const UserHelperModule = require("@/helpers/userHelper");
            UserHelperModule.mockUserHelperInstance.update.mockResolvedValueOnce({ updated: true } as any);
            
            
            // act ----------
            const result = await scheduleService.upsertScheduledTrip(mockInput);

            // assert ----------
            expect(result.messageKey).toBe("tripForm.success.updated");

            expect(ScheduleTripModel.findOne).toHaveBeenCalled();
        });


        // ------------------------------------------------------------------------
        test("should return noChange message when no data changed", async () => {
            const mockInput = { scheduleId: "S001", time: "08:00", routeId: "R001", driverId: "D001", busId: "B001" };               
           
            // schedule exists 
            (ScheduleModel.findOne as jest.Mock).mockResolvedValueOnce("S001"); 
            
            // trip already exists
            (ScheduleTripModel.findOne as jest.Mock).mockResolvedValueOnce({scheduleId:"S001",time:"08:00",routeId:"R001"});

            // no conflict (new update data dones't conflit with any data at the same time)
            (ScheduleTripModel.findOne as jest.Mock).mockResolvedValueOnce(null);

            // update success
            const UserHelperModule = require("@/helpers/userHelper");
            UserHelperModule.mockUserHelperInstance.update.mockResolvedValueOnce({ updated: false } as any);
            
            
            // act ----------
            const result = await scheduleService.upsertScheduledTrip(mockInput);

            // assert ----------
            expect(result).toEqual({ updated: false, messageKey: "tripForm.errors.notUpdated" });
            
       });

       // ------------------------------------------------------------------------
       
       test("should throw error when update trip fails", async () =>{
            const mockInput = { scheduleId: "S001", time: "08:00", routeId: "R001", driverId: "D001", busId: "B001" };               
           
            // schedule exists 
            (ScheduleModel.findOne as jest.Mock).mockResolvedValueOnce("S001"); 
            
            // trip already exists
            (ScheduleTripModel.findOne as jest.Mock).mockResolvedValueOnce({scheduleId:"S001",time:"08:00",routeId:"R001"});

            // no conflict (new update data dones't conflit with any data at the same time)
            (ScheduleTripModel.findOne as jest.Mock).mockResolvedValueOnce(null);

            // update fails
            const UserHelperModule = require("@/helpers/userHelper");
            UserHelperModule.mockUserHelperInstance.update.mockRejectedValueOnce(new Error("error"));
            
            
            // act ----------
            const result = scheduleService.upsertScheduledTrip(mockInput);

            // assert ----------
            await expect(result).rejects.toThrow("error");
       });

       // --------------------------------------------------------------------------------------------------
       // ----------------------------------------------------------------------------------------------------

       test("should add schedule trip successfully", async () => {
            const mockInput = { scheduleId: "S001", time: "08:00", routeId: "R001", driverId: "D001", busId: "B001" };               
           
            // schedule exists 
            (ScheduleModel.findOne as jest.Mock).mockResolvedValueOnce("S001"); 
            
            // trip doesn't exist
            (ScheduleTripModel.findOne as jest.Mock).mockResolvedValueOnce(null);

            // no conflict (new update data dones't conflit with any data at the same time)
            (ScheduleTripModel.findOne as jest.Mock).mockResolvedValueOnce(null);

            // add success
            const UserHelperModule = require("@/helpers/userHelper");
            UserHelperModule.mockUserHelperInstance.add.mockResolvedValueOnce(mockInput);
            
            
            // act ----------
            const result = await scheduleService.upsertScheduledTrip(mockInput);

            // assert ----------
            expect(result.messageKey).toBe("tripForm.success.saved");

       });
       // ----------------------------------------------------------------------------------------------------

       test("should throw Validation error if some of add trip data is missing", async () =>{
            // bus id is missing
            const mockInput = { scheduleId: "S001", time: "08:00", routeId: "R001", driverId: "D001"};               

            const result = scheduleService.upsertScheduledTrip(mockInput as any);

            await expect(result).rejects.toThrow("common.errors.validation.fillAllFields");
            await expect(result).rejects.toBeInstanceOf(ValidationError);

       })

        // ----------------------------------------------------------------------------------------------------

       test("should throw Validation error if add trip data is not provided", async () =>{
            const result = scheduleService.upsertScheduledTrip(null as any);

            await expect(result).rejects.toThrow("common.errors.validation.fillAllFields");
            await expect(result).rejects.toBeInstanceOf(ValidationError);

       })

       // --------------------------------------------------------------------------------------

       test("should throw error when add trip fails", async () => {
            const mockInput = { scheduleId: "S001", time: "08:00", routeId: "R001", driverId: "D001", busId: "B001" };               
           
            // schedule exists 
            (ScheduleModel.findOne as jest.Mock).mockResolvedValueOnce("S001"); 
            
            // trip doesn't exist
            (ScheduleTripModel.findOne as jest.Mock).mockResolvedValueOnce(null);

            // no conflict (new update data dones't conflit with any data at the same time)
            (ScheduleTripModel.findOne as jest.Mock).mockResolvedValueOnce(null);

            // update success
            const UserHelperModule = require("@/helpers/userHelper");
            UserHelperModule.mockUserHelperInstance.add.mockRejectedValueOnce(new Error("error"));
            
            
            // act ----------
            const result = scheduleService.upsertScheduledTrip(mockInput);

            // assert ----------
            await expect(result).rejects.toThrow("error");

       });
    });


    
    // =====================================================================
    //? Remove schedule Trip
    // =====================================================================

    describe("Remove ScheduledTrip", () => {

        test("should remove trip successfully", async () => {
            const mockedId = "ST001";

            // mock the removal of trip 
            const userHelperModule = require("@/helpers/userHelper");
            userHelperModule.mockUserHelperInstance.remove.mockResolvedValueOnce(1);

            const result = await scheduleService.removeScheduledTrip(mockedId);

            expect(result.messageKey).toBe("tripForm.success.removed");

        })
        //-----------------------------------------------------------------------------
        test("should throw error when trip id is not provided", async () => {

            const result = scheduleService.removeScheduledTrip(null as any);

            await expect(result).rejects.toThrow("common.errors.validation.fillAllFields");
            await expect(result).rejects.toBeInstanceOf(ValidationError);
        })

        //-----------------------------------------------------------------------------
        test("should throw error when trip id is empty", async () => {
            const mockedId = "";

            const result = scheduleService.removeScheduledTrip(mockedId);

            await expect(result).rejects.toThrow("common.errors.validation.fillAllFields");
            await expect(result).rejects.toBeInstanceOf(ValidationError);
        })

        // ----------------------------------------------------------------------

        test("should throw error when remove trip fails", async () => {
            const mockedId = "ST001";

            // mock the removal of trip 
            const userHelperModule = require("@/helpers/userHelper");
            userHelperModule.mockUserHelperInstance.remove.mockRejectedValueOnce(new Error("error"));

            const result = scheduleService.removeScheduledTrip(mockedId);

            await expect(result).rejects.toThrow("error");
        })




        
    })
})

