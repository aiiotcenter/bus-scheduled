
//==========================================================================================================
//? Unit Tests
//==========================================================================================================

import UserModel from '@src/models/userModel'
import ScheduledTripsModel from '@src/models/scheduledTripsModel'
import { DriverService } from "@src/services/driverService";

import { ConflictError, InternalError, NotFoundError, ValidationError } from "@src/errors";
import { gender, role, status } from "@src/enums/userEnum";
import { Op } from 'sequelize';

// mock models/helpers ------------------------------------------------------------------------
jest.mock("@src/models/userModel", () => ({
    __esModule: true,
    default: {
        findOne: jest.fn(),
        findAll: jest.fn(),
        findByPk: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        increment: jest.fn(),
        destroy: jest.fn(),
        getAttributes: jest.fn(),
    },
}));

jest.mock("@src/models/scheduledTripsModel", () => ({
    __esModule: true,
    default: {
        findAll: jest.fn(),
    },
}));

jest.mock("@src/models/scheduleModel", () => ({
    __esModule: true,
    default: {},
}));

jest.mock("@src/models/routeModel", () => ({
    __esModule: true,
    default: {},
}));

jest.mock("@src/models/busModel", () => ({
    __esModule: true,
    default: {},
}));

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

jest.mock("@src/helpers/scheduleHelper", () => {
    const mockScheduleHelperInstance = {
        formatDateForMobileUi: jest.fn(),
        normalizeTimeToHourMinute: jest.fn(),
    };

    return {
        __esModule: true,
        mockScheduleHelperInstance,
        ScheduleHelper: jest.fn(() => mockScheduleHelperInstance),
    };
});

jest.mock("@src/helpers/colorHelper", () => ({
    __esModule: true,
    normalizeColorToArgbInt: jest.fn(),
}));

jest.mock("@src/services/authService", () => {
    const mockAuthServiceInstance = {
        sendValidateEmail: jest.fn(),
    };

    return {
        __esModule: true,
        mockAuthServiceInstance,
        default: jest.fn(() => mockAuthServiceInstance),
    };
});

type MockedFindOne = jest.MockedFunction<typeof UserModel.findOne>;
type MockedFindAllScheduledTrips = jest.MockedFunction<typeof ScheduledTripsModel.findAll>;


// ============================================================================================================
// ============================================================================================================
// unit test for driver services:

// Add
// - should add driver and send validation email
// - should throw ValidationError when required fields are missing
// - should throw error when email already exists in database
// - should return InternalServerError for unknown errors

// Remove
// - should remove driver successfully
// - should throw NotFoundError when driver is not found

// Update
// - should return updated message when updated successfully
// - should return noChanges message when no data changaed

// get all/ active drivers
// - should return all drivers successfully when displayAll is true
// - should return only active drivers when displayAll is false
// - should throw InternalError when fetching drivers fails


// get driver's profile
// - should return driver profile successfully when driver exists
// - should throw ValidationError when driverId is missing
// - should throw NotFoundError when driver is not found
// - should throw InternalError when an unexpected error occurs


// get driver's schedule
// - should throw ValidationError when driverId is missing
// - should throw InternalError when an unexpected error occurs
// - should return grouped driver schedule successfully



describe("DriverService", () => {
    const driverService = new DriverService();
    const mockFindOne = UserModel.findOne as unknown as MockedFindOne;
    const mockFindAllScheduledTrips = ScheduledTripsModel.findAll as unknown as MockedFindAllScheduledTrips;

    beforeEach(() => {
        jest.clearAllMocks();

        const UserHelperModule = require("@src/helpers/userHelper");
        UserHelperModule.mockUserHelperInstance.add.mockClear();
        UserHelperModule.mockUserHelperInstance.remove.mockClear();
        UserHelperModule.mockUserHelperInstance.update.mockClear();

        const AuthServiceModule = require("@src/services/authService");
        AuthServiceModule.mockAuthServiceInstance.sendValidateEmail.mockClear();


        const ScheduleHelperModule = require("@src/helpers/scheduleHelper");
        ScheduleHelperModule.mockScheduleHelperInstance.formatDateForMobileUi.mockClear();
        ScheduleHelperModule.mockScheduleHelperInstance.normalizeTimeToHourMinute.mockClear();

        const ColorHelperModule = require("@src/helpers/colorHelper");
        (ColorHelperModule.normalizeColorToArgbInt as jest.Mock).mockClear();

        jest.spyOn(console, "error").mockImplementation(() => undefined);
    });

    afterEach(() => {
        (console.error as jest.Mock | undefined)?.mockRestore?.();
    });

    // ============================================================================================================
    //? Add driver
    // ============================================================================================================

    describe("addDriver", () => {
        test("should add driver and send validation email", async () => {

            // mock add function 
            const UserHelperModule = require("@src/helpers/userHelper");
            UserHelperModule.mockUserHelperInstance.add.mockResolvedValueOnce(undefined);

            // mock success of email sending 
            const AuthServiceModule = require("@src/services/authService");
            AuthServiceModule.mockAuthServiceInstance.sendValidateEmail.mockResolvedValueOnce({ status: 200 } as any);

            const payload = { email: "test@example.com", role: role.driver, gender: gender.male };

            // add driver
            const result = await driverService.addDriver(payload);



            // ensure that transformation applied when adding the driver (triming email, lowercaseing letters)
            const addCallOptions = (UserHelperModule.mockUserHelperInstance.add as jest.Mock).mock.calls[0]?.[2];
            const transformed = await addCallOptions.transform({ email: "test@example.com" });


            expect(result).toEqual({ messageKey: "drivers.success.added" });

            expect(UserHelperModule.mockUserHelperInstance.add).toHaveBeenCalledTimes(1);

            expect(UserHelperModule.mockUserHelperInstance.add).toHaveBeenCalledWith(
                UserModel,
                payload,
                expect.objectContaining({
                    nonDuplicateFields: ["email"],
                    enumFields: [
                        { field: "status", enumObj: status },
                        { field: "role", enumObj: role },
                        { field: "gender", enumObj: gender },
                    ],
                    transform: expect.any(Function),
                })
            );


            expect(transformed).toEqual({ email: "test@example.com", status: status.active });

            expect(AuthServiceModule.mockAuthServiceInstance.sendValidateEmail).toHaveBeenCalledTimes(1);
            expect(AuthServiceModule.mockAuthServiceInstance.sendValidateEmail).toHaveBeenCalledWith("test@example.com");
        });

        // --------------------------------------------------------------------

        test("should throw ValidationError when required fields are missing", async () => {

            const UserHelperModule = require("@src/helpers/userHelper");
            UserHelperModule.mockUserHelperInstance.add.mockRejectedValueOnce(
                new ValidationError("common.errors.validation.fillAllFields")
            );

            await expect(driverService.addDriver({ role: role.driver, gender: gender.female })).rejects.toBeInstanceOf(
                ValidationError
            );
        });

        // --------------------------------------------------------------------

        test("should throw error when email already exists in database", async () => {
            const UserHelperModule = require("@src/helpers/userHelper");
            UserHelperModule.mockUserHelperInstance.add.mockRejectedValueOnce(new ConflictError("common.errors.validation.duplicate"));

            const promise = driverService.addDriver({ email: "test@example.com" });


            await expect(promise).rejects.toBeInstanceOf(ConflictError);
            await expect(promise).rejects.toThrow("common.errors.validation.duplicateEmail");
        });

        // --------------------------------------------------------------------

        test("should return InternalServerError for unknown errors", async () => {
            const UserHelperModule = require("@src/helpers/userHelper");
            UserHelperModule.mockUserHelperInstance.add.mockResolvedValueOnce(undefined);

            const AuthServiceModule = require("@src/services/authService");
            AuthServiceModule.mockAuthServiceInstance.sendValidateEmail.mockRejectedValueOnce(new Error("error"));

            await expect(driverService.addDriver({ email: "test@example.com" })).rejects.toThrow("error");
        });
    });




    // ============================================================================================================
    //? Remove Driver
    // ============================================================================================================

    describe("removeDriver", () => {
        test("should remove driver successfully", async () => {
            const UserHelperModule = require("@src/helpers/userHelper");
            UserHelperModule.mockUserHelperInstance.remove.mockResolvedValueOnce(1);

            const result = await driverService.removeDriver("D123");

            expect(result).toEqual({ messageKey: "common.crud.removed" });
            expect(UserHelperModule.mockUserHelperInstance.remove).toHaveBeenCalledTimes(1);
            expect(UserHelperModule.mockUserHelperInstance.remove).toHaveBeenCalledWith(UserModel, "id", "D123");
        });

        // --------------------------------------------------------------------

        test("should throw NotFoundError when driver is not found", async () => {
            const UserHelperModule = require("@src/helpers/userHelper");
            UserHelperModule.mockUserHelperInstance.remove.mockRejectedValueOnce(new NotFoundError("common.errors.notFound"));

            await expect(driverService.removeDriver("D123")).rejects.toBeInstanceOf(NotFoundError);

            expect(UserHelperModule.mockUserHelperInstance.remove).toHaveBeenCalledTimes(1);
            expect(UserHelperModule.mockUserHelperInstance.remove).toHaveBeenCalledWith(UserModel, "id", "D123");
        });

        // --------------------------------------------------------------------
        
        test("should throw error when an unexpected error occurs", async () => {
            const UserHelperModule = require("@src/helpers/userHelper");
            UserHelperModule.mockUserHelperInstance.remove.mockRejectedValueOnce(new Error("error"));

            const promise = driverService.removeDriver("D123");

            await expect(promise).rejects.toThrow("error");

            expect(UserHelperModule.mockUserHelperInstance.remove).toHaveBeenCalledTimes(1);
            expect(UserHelperModule.mockUserHelperInstance.remove).toHaveBeenCalledWith(UserModel, "id", "D123");
        });

    
    });

    // ============================================================================================================
    //? Update driver
    // ============================================================================================================

    describe("updateDriver", () => {
        test("should return updated message when updated successfully", async () => {
            const UserHelperModule = require("@src/helpers/userHelper");
            UserHelperModule.mockUserHelperInstance.update.mockResolvedValueOnce({ updated: true } as any);

            const result = await driverService.updateDriver({ id: "D123", email: "test@example.com" });
            expect(result).toEqual({ updated: true, messageKey: "common.crud.updated" });
        });
        
        // --------------------------------------------------------------------

        test("should return noChanges message when no data changaed", async () => {
            const UserHelperModule = require("@src/helpers/userHelper");
            UserHelperModule.mockUserHelperInstance.update.mockResolvedValueOnce({ updated: false } as any);

            const result = await driverService.updateDriver({ id: "D123", email: "test@example.com" });
            expect(result).toEqual({ updated: false, messageKey: "common.crud.noChanges" });
        });
    });


    // ============================================================================================================
    // ? Get driver data
    // ============================================================================================================

    describe("fetchDrivers", () => {

        test("should return all drivers successfully when displayAll is true", async () => {
            const drivers = [{ id: "D123" }] as any;
            (UserModel.findAll as jest.Mock).mockResolvedValueOnce(drivers);

            const result = await driverService.fetchDrivers(true);

            expect(result).toEqual({ messageKey: "drivers.success.fetched", data: drivers });
            expect(UserModel.findAll).toHaveBeenCalledTimes(1);
            expect(UserModel.findAll).toHaveBeenCalledWith({
                where: { role: role.driver },
                attributes: [
                    "id",
                    "name",
                    "gender",
                    "birthDate",
                    "phone",
                    "email",
                    "licenseNumber",
                    "licenseExpiryDate",
                    "status",
                ],
            });
        });

        // --------------------------------------------------------------------

        test("should return only active drivers when displayAll is false", async () => {
            const drivers = [{ id: "D123", status: status.active }] as any;
            (UserModel.findAll as jest.Mock).mockResolvedValueOnce(drivers);

            const result = await driverService.fetchDrivers(false);

            expect(result).toEqual({ messageKey: "drivers.success.fetched", data: drivers });
            expect(UserModel.findAll).toHaveBeenCalledTimes(1);
            expect(UserModel.findAll).toHaveBeenCalledWith({
                attributes: [
                    "id",
                    "name",
                    "gender",
                    "birthDate",
                    "phone",
                    "email",
                    "licenseNumber",
                    "licenseExpiryDate",
                    "status",
                ],
                where: {
                    role: role.driver,
                    status: status.active,
                },
            });
        });

        // --------------------------------------------------------------------

        test("should throw InternalError when fetching drivers fails", async () => {
            (UserModel.findAll as jest.Mock).mockRejectedValueOnce(new Error("DB error"));

            await expect(driverService.fetchDrivers(true)).rejects.toThrow("error");
        });
    });




    // ============================================================================================================
    // ? Get driver's profile
    // ============================================================================================================

    describe("fetchDriverProfile", () => {
        test("should return driver profile successfully when driver exists", async () => {
            const driver = {
                id: "D123",
                name: "Test Driver",
                phone: "0123456789",
                language: "en",
                appearance: "any",
            } as any;

            mockFindOne.mockResolvedValueOnce(driver);

            const result = await driverService.fetchDriverProfile("D123");

            expect(result).toEqual({ messageKey: "drivers.success.fetched", data: driver });

            expect(UserModel.findOne).toHaveBeenCalledTimes(1);
            expect(UserModel.findOne).toHaveBeenCalledWith({
                where: { id: "D123", role: role.driver },
                attributes: ["id", "name", "phone", "language", "appearance"],
            });
        });

        // --------------------------------------------------------------------

        test("should throw ValidationError when driverId is missing", async () => {
            const promise = driverService.fetchDriverProfile(undefined);

            await expect(promise).rejects.toBeInstanceOf(ValidationError);
            await expect(promise).rejects.toThrow("common.errors.validation.required");
        });

        // --------------------------------------------------------------------

        test("should throw NotFoundError when driver is not found", async () => {
            mockFindOne.mockResolvedValueOnce(null as any);

            const promise = driverService.fetchDriverProfile("D123");

            await expect(promise).rejects.toBeInstanceOf(NotFoundError);
            await expect(promise).rejects.toThrow("common.errors.notFound");

            expect(UserModel.findOne).toHaveBeenCalledTimes(1);
        });

        // --------------------------------------------------------------------

        test("should throw InternalError when an unexpected error occurs", async () => {
            mockFindOne.mockRejectedValueOnce(new Error("error"));

            const promise = driverService.fetchDriverProfile("D123");

            await expect(promise).rejects.toThrow("error");


            expect(UserModel.findOne).toHaveBeenCalledTimes(1);
        });
    });
    



    // ============================================================================================================
    // ? Get driver's schedule 
    // ============================================================================================================

    describe("fetchDriverSchedule", () => {

        test("should throw ValidationError when driverId is missing", async () => {
            const promise = driverService.fetchDriverSchedule(undefined);

            await expect(promise).rejects.toBeInstanceOf(ValidationError);
            await expect(promise).rejects.toThrow("common.errors.validation.required");
        });

        // --------------------------------------------------------------------

        test("should throw InternalError when an unexpected error occurs", async () => {
            mockFindAllScheduledTrips.mockRejectedValueOnce(new Error("error"));

            const promise = driverService.fetchDriverSchedule("D123");

            await expect(promise).rejects.toThrow("error");

            expect(ScheduledTripsModel.findAll).toHaveBeenCalledTimes(1);
        });
        // --------------------------------------------------------------------

        test("should return grouped driver schedule successfully", async () => {
            const ScheduleHelperModule = require("@src/helpers/scheduleHelper");
            ScheduleHelperModule.mockScheduleHelperInstance.formatDateForMobileUi.mockReturnValueOnce("25/03/2026");
            ScheduleHelperModule.mockScheduleHelperInstance.normalizeTimeToHourMinute.mockReturnValueOnce("08:00");

            const ColorHelperModule = require("@src/helpers/colorHelper");
            (ColorHelperModule.normalizeColorToArgbInt as jest.Mock).mockReturnValueOnce(0xff112233);

            const trips = [
                {
                    time: "08:00:00",
                    schedule: { date: "2026-03-25", day: "Wednesday" },
                    route: { title: "Route 1", color: "#112233" },
                    bus: { id: "B1", plate: "1234" },
                },
            ] as any;

            mockFindAllScheduledTrips.mockResolvedValueOnce(trips);

            const result = await driverService.fetchDriverSchedule("D123");




            
            expect(result).toEqual({
                messageKey: "drivers.success.fetched",
                data: [
                    {
                        date: "25/03/2026",
                        day: "Wednesday",
                        driverId: "D123",
                        scheduleDetails: [
                            {
                                time: "08:00",
                                routeName: "Route 1",
                                routeColor: "#112233",
                                routeColorInt: 0xff112233,
                                busId: "B1",
                                busPlate: "1234",
                            },
                        ],
                    },
                ],
            });

            expect(ScheduledTripsModel.findAll).toHaveBeenCalledTimes(1);
            expect(ScheduledTripsModel.findAll).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { driverId: "D123" },
                    attributes: ["detailedScheduleId", "scheduleId", "time", "routeId", "driverId", "busId"],
                    order: [
                        [expect.objectContaining({ as: "schedule" }), "date", "ASC"],
                        ["time", "ASC"],
                    ],
                    include: expect.arrayContaining([
                        expect.objectContaining({
                            as: "schedule",
                            required: true,
                            where: {
                                date: { [Op.gte]: expect.any(String) },
                            },
                        }),
                    ]),
                })
            );
        });

        
    });

});

    

