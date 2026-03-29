 
 //==========================================================================================================
 //? Unit Tests
 //==========================================================================================================
 
 import BusModel from '../src/models/busModel'
 import { BusService } from "../src/services/busService";
 
 import { InternalError, NotFoundError, ValidationError, ConflictError } from "../src/errors";
 import { status } from "../src/enums/busEnum";
 
 // mock models/helpers ------------------------------------------------------------------------
 jest.mock("../src/models/busModel", () => ({
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
 
 jest.mock("../src/models/userModel", () => ({
     __esModule: true,
     default: {},
 }));
 
 jest.mock("../src/models/routeModel", () => ({
     __esModule: true,
     default: {},
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
 

 // ============================================================================================================
 // ============================================================================================================
 // unit test for bus services:
 
 // Add
 // - should add bus successfully
 // - should throw ValidationError when required fields are missing
 // - should throw error when plate already exists in database
 // - should throw error when an unexpected error occurs
 

 // Remove
 // - should remove bus successfully
 // - should throw NotFoundError when bus is not found
 // - should throw error when an unexpected error occurs
 
 // Update
 // - should return updated message when updated successfully
 // - should return noChanges message when no data changaed
 // - should throw error when an unexpected error occurs
 
 // View buses
 // - should return all buses when displayAll is true
 // - should return only operating buses when displayAll is false
 // - should throw InternalError when viewing buses fails
 // - should throw InternalError when an unexpected error occurs
 
 
 
 // =================================================================================================
 // ======================================================================================================

 describe("BusService", () => {
     const busService = new BusService();

 
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
     //? Add bus
     // ============================================================================================================
 
     describe("addBus", () => {
         test("should add bus successfully", async () => {
             const UserHelperModule = require("../src/helpers/userHelper");
             UserHelperModule.mockUserHelperInstance.add.mockResolvedValueOnce(undefined);
 
             const payload = { plate: "1234", brand: "Test", status: status.operating };
             const result = await busService.addBus(payload);
 

             expect(result).toEqual({ messageKey: "buses.success.added" });
 
             expect(UserHelperModule.mockUserHelperInstance.add).toHaveBeenCalledTimes(1);
             expect(UserHelperModule.mockUserHelperInstance.add).toHaveBeenCalledWith(
                 BusModel,
                 payload,
                 expect.objectContaining({
                     nonDuplicateFields: ["plate"],
                     enumFields: [{ field: "status", enumObj: status }],
                 })
             );
         });
 
         // --------------------------------------------------------------------
 
         test("should throw ValidationError when required fields are missing", async () => {
             const UserHelperModule = require("../src/helpers/userHelper");
             UserHelperModule.mockUserHelperInstance.add.mockRejectedValueOnce(
                 new ValidationError("common.errors.validation.fillAllFields")
             );

             const promise = busService.addBus({});

             await expect(promise).rejects.toBeInstanceOf(ValidationError);
         });
 
         // --------------------------------------------------------------------
 
         test("should throw error when plate already exists in database", async () => {
             const UserHelperModule = require("../src/helpers/userHelper");
             UserHelperModule.mockUserHelperInstance.add.mockRejectedValueOnce(
                new ConflictError("common.errors.validation.duplicate")
            );

             const promise = busService.addBus({ plate: "1234" });

             await expect(promise).rejects.toThrow(ConflictError);
         });

        // --------------------------------------------------------------------

        test("should throw error when an unexpected error occurs", async () => {
            const UserHelperModule = require("../src/helpers/userHelper");
            UserHelperModule.mockUserHelperInstance.add.mockRejectedValueOnce(new Error("error"));

            const payload = { plate: "1234", brand: "Test", status: status.operating };
            const promise = busService.addBus(payload);

            await expect(promise).rejects.toThrow("error");
            expect(UserHelperModule.mockUserHelperInstance.add).toHaveBeenCalledTimes(1);
        });
     });


     
 
 
 
 
     // ============================================================================================================
     //? Remove Bus
     // ============================================================================================================
 
     describe("removeBus", () => {
         test("should remove bus successfully", async () => {
             const UserHelperModule = require("../src/helpers/userHelper");
             UserHelperModule.mockUserHelperInstance.remove.mockResolvedValueOnce(undefined);
 
             const result = await busService.removeBus("B123");
 
             expect(result).toEqual({ messageKey: "common.crud.removed" });
             expect(UserHelperModule.mockUserHelperInstance.remove).toHaveBeenCalledTimes(1);
             expect(UserHelperModule.mockUserHelperInstance.remove).toHaveBeenCalledWith(BusModel, "id", "B123");
         });
 
         // --------------------------------------------------------------------
 
         test("should throw NotFoundError when bus is not found", async () => {
             const UserHelperModule = require("../src/helpers/userHelper");
             UserHelperModule.mockUserHelperInstance.remove.mockRejectedValueOnce(
                 new NotFoundError("common.errors.notFound")
             );

             const promise = busService.removeBus("B123");

             await expect(promise).rejects.toBeInstanceOf(NotFoundError);
         });

         // --------------------------------------------------------------------

        test("should throw error when an unexpected error occurs", async () => {
            const UserHelperModule = require("../src/helpers/userHelper");
            UserHelperModule.mockUserHelperInstance.remove.mockRejectedValueOnce(new Error("error"));

            const promise = busService.removeBus("D123");

            await expect(promise).rejects.toThrow("error");
            expect(UserHelperModule.mockUserHelperInstance.remove).toHaveBeenCalledTimes(1);
        });
     });
 
 
 
 
     // ============================================================================================================
     //? Update bus
     // ============================================================================================================
 
     describe("updateBus", () => {
         test("should return updated message when updated successfully", async () => {
             const UserHelperModule = require("../src/helpers/userHelper");
             UserHelperModule.mockUserHelperInstance.update.mockResolvedValueOnce({ updated: true } as any);
 
             const result = await busService.updateBus({ id: "B123", plate: "1234" });
             expect(result).toEqual({ updated: true, messageKey: "common.crud.updated" });
         });
 
         // --------------------------------------------------------------------
 
         test("should return noChanges message when no data changaed", async () => {
             const UserHelperModule = require("../src/helpers/userHelper");
             UserHelperModule.mockUserHelperInstance.update.mockResolvedValueOnce({ updated: false } as any);
 
             const result = await busService.updateBus({ id: "B123", plate: "1234" });
             expect(result).toEqual({ updated: false, messageKey: "common.crud.noChanges" });
         });

        // --------------------------------------------------------------------

        test("should throw error when an unexpected error occurs", async () => {
            const UserHelperModule = require("../src/helpers/userHelper");
            UserHelperModule.mockUserHelperInstance.update.mockRejectedValueOnce(new Error("error"));

            const promise = busService.updateBus({ id: "B123", plate: "1234" });

            await expect(promise).rejects.toThrow("error");
            expect(UserHelperModule.mockUserHelperInstance.update).toHaveBeenCalledTimes(1);
        });

 
     });
 
 
 
 
     // ============================================================================================================
     // ? View buses
     // ============================================================================================================
 
     describe("viewBuses", () => {
         test("should return all buses when displayAll is true", async () => {
             const buses = [{ id: "B1" }] as any;
             (BusModel.findAll as jest.Mock).mockResolvedValueOnce(buses);
 
             const result = await busService.viewBuses(true);
 
             expect(result).toEqual({ messageKey: "common.crud.fetched", data: buses });
             expect(BusModel.findAll).toHaveBeenCalledTimes(1);
             expect(BusModel.findAll).toHaveBeenCalledWith({
                 attributes: ["id", "plate", "brand", "status"],
             });
         });
 
         // --------------------------------------------------------------------
 
         test("should return only operating buses when displayAll is false", async () => {
             const buses = [{ id: "B1", status: status.operating }] as any;
             (BusModel.findAll as jest.Mock).mockResolvedValueOnce(buses);
 
             const result = await busService.viewBuses(false);
 
             expect(result).toEqual({ messageKey: "common.crud.fetched", data: buses });
             expect(BusModel.findAll).toHaveBeenCalledTimes(1);
             expect(BusModel.findAll).toHaveBeenCalledWith({
                 attributes: ["id", "plate", "brand", "status"],
                 where: { status: status.operating },
             });
         });
 
         // --------------------------------------------------------------------
 
         test("should throw InternalError when viewing buses fails", async () => {
             (BusModel.findAll as jest.Mock).mockRejectedValueOnce(new Error("error"));
 
             const promise = busService.viewBuses(true);
 
             await expect(promise).rejects.toBeInstanceOf(InternalError);
             await expect(promise).rejects.toMatchObject({ messageKey: "common.errors.internal" });
         });

         // --------------------------------------------------------------------

        test("should throw InternalError when an unexpected error occurs", async () => {
            (BusModel.findAll as jest.Mock).mockRejectedValueOnce(new Error("error"));

            const promise = busService.viewBuses(false);

            await expect(promise).rejects.toBeInstanceOf(InternalError);
            await expect(promise).rejects.toMatchObject({ messageKey: "common.errors.internal" });
            expect(BusModel.findAll).toHaveBeenCalledTimes(1);
        });

         
     });
 });

