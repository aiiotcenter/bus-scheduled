//==========================================================================================================
//? Unit Tests for Set Password (New User)
//==========================================================================================================

import { verifySetPasswordToken, sendValidateEmail, setPassword } from "../../src/services/authService/setPassword";

import UserModel from "../../src/models/userModel";
import bcrypt from "bcrypt";

// mock models/helpers ------------------------------------------------------------------------
jest.mock("../../src/models/userModel", () => ({
    __esModule: true,
    default: {
        findOne: jest.fn(),
        update: jest.fn(),
    },
}));

jest.mock("bcrypt", () => ({
    __esModule: true,
    default: {
        hash: jest.fn(),
    },
}));

jest.mock("../../src/helpers/sendEmail", () => ({
    __esModule: true,
    sendEmail: jest.fn(),
}));

jest.mock("../../src/helpers/authHelpher", () => {
    const mockAuthHelperInstance = {
        verifySetPasswordUrlTokenFromRequest: jest.fn(),
        createSetPasswordUrlToken: jest.fn(),
        clearLoginSession: jest.fn(),
    };

    return {
        __esModule: true,
        mockAuthHelperInstance,
        default: jest.fn(() => mockAuthHelperInstance),
    };
});

type MockedFindOne = jest.MockedFunction<typeof UserModel.findOne>;
type MockedUpdate = jest.MockedFunction<typeof UserModel.update>;


// ==============================================================================================

describe("AuthService -> setPassword", () => {
    const mockFindOne = UserModel.findOne as unknown as MockedFindOne;
    const mockUpdate = UserModel.update as unknown as MockedUpdate;

    const mockBcryptHash = (bcrypt as any).hash as jest.Mock;

    const EmailModule = require("../../src/helpers/sendEmail");

    const createReq = ({ body = {}, params = {}, query = {} }: { body?: any; params?: any; query?: any }) => ({
        body,
        params,
        query,
        cookies: {},
        ip: "127.0.0.1",
    } as any);

    const createRes = () => ({
        setCookie: jest.fn(),
        clearCookie: jest.fn(),
    } as any);

    beforeEach(() => {
        jest.clearAllMocks();

        const AuthHelperModule = require("../../src/helpers/authHelpher");
        AuthHelperModule.mockAuthHelperInstance.verifySetPasswordUrlTokenFromRequest.mockClear();
        AuthHelperModule.mockAuthHelperInstance.createSetPasswordUrlToken.mockClear();
        AuthHelperModule.mockAuthHelperInstance.clearLoginSession.mockClear();

        EmailModule.sendEmail.mockClear();

        jest.spyOn(console, "error").mockImplementation(() => undefined);
    });

    afterEach(() => {
        (console.error as jest.Mock | undefined)?.mockRestore?.();
    });

    // ===================================================================================================================
    // ===================================================================================================================
    //? Verify Set Password Token 
    // ===================================================================================================================

    describe("verifySetPasswordToken", () => {


        test("should return null when token is invalid", async () => {
            const req = createReq({ params: { token: "bad" } });

            const AuthHelperModule = require("../../src/helpers/authHelpher");
            AuthHelperModule.mockAuthHelperInstance.verifySetPasswordUrlTokenFromRequest.mockReturnValueOnce(null);

            const result = await verifySetPasswordToken(req);
            expect(result).toBeNull();
        });

        // -----------------------------------------------------------------------------------------------------------

        test("should return null when user not found", async () => {
            const req = createReq({ params: { token: "exists" } });

            const AuthHelperModule = require("../../src/helpers/authHelpher");
            AuthHelperModule.mockAuthHelperInstance.verifySetPasswordUrlTokenFromRequest.mockReturnValueOnce({ email: "test@example.com" });

            mockFindOne.mockResolvedValueOnce(null as any);

            const result = await verifySetPasswordToken(req);
            expect(result).toBeNull();
        });

        // -----------------------------------------------------------------------------------------------------------

        test("should return null when user already has password", async () => {
            const req = createReq({ params: { token: "exists" } });

            const AuthHelperModule = require("../../src/helpers/authHelpher");
            AuthHelperModule.mockAuthHelperInstance.verifySetPasswordUrlTokenFromRequest.mockReturnValueOnce({ email: "test@example.com" });

            mockFindOne.mockResolvedValueOnce({
                email: "test@example.com",
                hashedPassword: "alreadyExists",
            } as any);

            const result = await verifySetPasswordToken(req);
            expect(result).toBeNull();
        });

        // -----------------------------------------------------------------------------------------------------------
        // successful case
        test("should return userData when user exists and has no password", async () => {
            const req = createReq({ params: { token: "exists" } });

            const AuthHelperModule = require("../../src/helpers/authHelpher");
            AuthHelperModule.mockAuthHelperInstance.verifySetPasswordUrlTokenFromRequest.mockReturnValueOnce({ email: "test@example.com" });

            mockFindOne.mockResolvedValueOnce({
                email: "test@example.com",
                hashedPassword: null,
            } as any);

            const result = await verifySetPasswordToken(req);
            expect(result).toEqual({ email: "test@example.com" });

            expect(mockFindOne).toHaveBeenCalledTimes(1)
            expect(mockFindOne).toHaveBeenCalledWith({ where: { email: "test@example.com" }, attributes: ["email", "hashedPassword"] })
        });
    });


    // ===================================================================================================================
    //? Send Validation Email 
    // ===================================================================================================================

    describe("sendValidateEmail", () => {
        test("should return 200 when validation email sent", async () => {
            const AuthHelperModule = require("../../src/helpers/authHelpher");
            AuthHelperModule.mockAuthHelperInstance.createSetPasswordUrlToken.mockReturnValueOnce("token123");

            EmailModule.sendEmail.mockResolvedValueOnce(undefined);

            const result = await sendValidateEmail("test@example.com");

            expect(AuthHelperModule.mockAuthHelperInstance.createSetPasswordUrlToken).toHaveBeenCalledTimes(1);
            expect(EmailModule.sendEmail).toHaveBeenCalledTimes(1);
            expect(result).toEqual({ status: 200, messageKey: "common.crud.sent" });
        });

        // -------------------------------------------------------------------------------------------------------------

        test("should return 500 when email isn't sent", async()=>{
            const AuthHelperModule = require("../../src/helpers/authHelpher");
            AuthHelperModule.mockAuthHelperInstance.createSetPasswordUrlToken.mockReturnValueOnce("token123");

            EmailModule.sendEmail.mockRejectedValueOnce(new Error("email not sent"));

            await expect(sendValidateEmail("test@example.com")).rejects.toThrow("email not sent");

            expect(AuthHelperModule.mockAuthHelperInstance.createSetPasswordUrlToken).toHaveBeenCalledTimes(1);
            expect(EmailModule.sendEmail).toHaveBeenCalledTimes(1);

        })
    });

    // ===================================================================================================================
    //? Set Password 
    // ===================================================================================================================

    describe("-", () => {
        test("should return 401 when token is invalid", async () => {
            const req = createReq({ params: { token: "invalid" }, body: { newPassword: "password", confirmPassword: "password" } });
            const res = createRes();

            const AuthHelperModule = require("../../src/helpers/authHelpher");
            AuthHelperModule.mockAuthHelperInstance.verifySetPasswordUrlTokenFromRequest.mockReturnValueOnce(null);

            const result = await setPassword(req, res);
            expect(result).toEqual({ status: 401, messageKey: "common.auth.invalidToken" });
        });

        // -----------------------------------------------------------------------------------------------------------

        test("should return 500 when passwords are missing", async () => {
            const req = createReq({ params: { token: "exists" }, body: {} });
            const res = createRes();

            const AuthHelperModule = require("../../src/helpers/authHelpher");
            AuthHelperModule.mockAuthHelperInstance.verifySetPasswordUrlTokenFromRequest.mockReturnValueOnce({ email: "test@example.com" });

            mockFindOne.mockResolvedValueOnce({ email: "test@example.com", hashedPassword: null } as any);

            const result = await setPassword(req, res);
            expect(result).toEqual({ status: 500, messageKey: "auth.setPassword.validation.passwordRequired" });
        });

        // -----------------------------------------------------------------------------------------------------------

        test("should return 500 when passwords do not match", async () => {
            const req = createReq({ params: { token: "exists" }, body: { newPassword: "passwordA", confirmPassword: "passwordB" } });
            const res = createRes();

            const AuthHelperModule = require("../../src/helpers/authHelpher");
            AuthHelperModule.mockAuthHelperInstance.verifySetPasswordUrlTokenFromRequest.mockReturnValueOnce({ email: "test@example.com" });

            mockFindOne.mockResolvedValueOnce({ email: "test@example.com", hashedPassword: null } as any);

            const result = await setPassword(req, res);
            expect(result).toEqual({ status: 500, messageKey: "auth.setPassword.validation.passwordsMustMatch" });
        });

        // -----------------------------------------------------------------------------------------------------------------

        test("should return 500 when bcrypt.hash throws", async () => {
            const req = createReq({ params: { token: "exists" }, body: { newPassword: "password", confirmPassword: "password" } });
            const res = createRes();

            const AuthHelperModule = require("../../src/helpers/authHelpher");
            AuthHelperModule.mockAuthHelperInstance.verifySetPasswordUrlTokenFromRequest.mockReturnValueOnce({ email: "test@example.com" });

            mockFindOne.mockResolvedValueOnce({ email: "test@example.com", hashedPassword: null } as any);

            mockBcryptHash.mockRejectedValueOnce(new Error("hash fail"));

            const result = await setPassword(req, res);
            expect(result).toEqual({ status: 500, messageKey: "common.errors.internal" });
        });

        // -----------------------------------------------------------------------------------------------------------

        test("should return 401 when update does not update any rows", async () => {

            // arrange input and mocks--------

            const req = createReq({ params: { token: "exists" }, body: { newPassword: "password", confirmPassword: "password" } });
            const res = createRes();

            const AuthHelperModule = require("../../src/helpers/authHelpher");
            AuthHelperModule.mockAuthHelperInstance.verifySetPasswordUrlTokenFromRequest.mockReturnValueOnce({ email: "test@example.com" });

            mockFindOne.mockResolvedValueOnce({ email: "test@example.com", hashedPassword: null } as any);

            mockBcryptHash.mockResolvedValueOnce("hashed");
            mockUpdate.mockResolvedValueOnce([0] as any);// configure what the next call of "mockUpdate" will return 

            //  execute ---------
            const result = await setPassword(req, res);

            //assert----------

            expect(result).toEqual({ status: 401, messageKey: "common.auth.invalidToken" });
        });


        // -----------------------------------------------------------------------------------------------------------

        test("should return 200 when password is set and login session cleared", async () => {
            const req = createReq({ params: { token: "exists" }, body: { newPassword: "password", confirmPassword: "password" } });
            const res = createRes();

            const AuthHelperModule = require("../../src/helpers/authHelpher");
            AuthHelperModule.mockAuthHelperInstance.verifySetPasswordUrlTokenFromRequest.mockReturnValueOnce({ email: "test@example.com" });

            mockFindOne.mockResolvedValueOnce({ email: "test@example.com", hashedPassword: null } as any);

            mockBcryptHash.mockResolvedValueOnce("hashed");
            mockUpdate.mockResolvedValueOnce([1] as any);

            const result = await setPassword(req, res);
            expect(result).toEqual({ status: 200, messageKey: "auth.setPassword.success.updated" });

            expect(AuthHelperModule.mockAuthHelperInstance.clearLoginSession).toHaveBeenCalledTimes(1);
            expect(AuthHelperModule.mockAuthHelperInstance.clearLoginSession).toHaveBeenCalledWith(res);
        });

        // -----------------------------------------------------------------------------------------------------------


    });
});
