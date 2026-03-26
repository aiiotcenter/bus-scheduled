//==========================================================================================================
//? Unit Tests for Reset Password (PATCH)
//==========================================================================================================

import { resetPassword } from "../../src/services/authService/passwordReset";

import UserModel from "../../src/models/userModel";
import bcrypt from "bcrypt";

import { UnauthorizedError } from "../../src/errors";

// mock models/helpers ------------------------------------------------------------------------
jest.mock("../../src/models/userModel", () => ({
    __esModule: true,
    default: {
        findOne: jest.fn(),
        update: jest.fn(),
        increment: jest.fn(),
    },
}));

jest.mock("bcrypt", () => ({
    __esModule: true,
    default: {
        hash: jest.fn(),
    },
}));

jest.mock("../../src/helpers/authHelpher", () => {
    const mockAuthHelperInstance = {
        verifyResetPasswordUrlTokenFromRequest: jest.fn(),
    };

    return {
        __esModule: true,
        mockAuthHelperInstance,
        default: jest.fn(() => mockAuthHelperInstance),
    };
});

type MockedFindOne = jest.MockedFunction<typeof UserModel.findOne>;
type MockedUpdate = jest.MockedFunction<typeof UserModel.update>;
type MockedIncrement = jest.MockedFunction<typeof UserModel.increment>;


// ==================================================================================================
// unit tests covered in this file:
// - should return 401 when token is invalid
// - should return 500 when verifyResetPasswordUrlTokenFromRequest throws an error
// - should return 500 when passwords are missing
// - should return 500 when passwords do not match
// - should return 500 when bcrypt.hash throws
// - should return 500 when update does not update any rows
// - should return 200 when password is updated and version incremented

describe("AuthService -> resetPassword", () => {
    const mockFindOne = UserModel.findOne as unknown as MockedFindOne;
    const mockUpdate = UserModel.update as unknown as MockedUpdate;
    const mockIncrement = UserModel.increment as unknown as MockedIncrement;

    const mockBcryptHash = (bcrypt as any).hash as jest.Mock;

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
        AuthHelperModule.mockAuthHelperInstance.verifyResetPasswordUrlTokenFromRequest.mockClear();

        jest.spyOn(console, "error").mockImplementation(() => undefined);
    });

    afterEach(() => {
        (console.error as jest.Mock | undefined)?.mockRestore?.();
    });

    // ==============================================================================================================

    test("should return 401 when token is invalid", async () => {
        const req = createReq({ params: { token: "expired" }, body: { newPassword: "password", confirmPassword: "password" } });
        const res = createRes();

        const AuthHelperModule = require("../../src/helpers/authHelpher");
        AuthHelperModule.mockAuthHelperInstance.verifyResetPasswordUrlTokenFromRequest.mockReturnValueOnce(null);

        const result = await resetPassword(req, res);
        expect(result).toEqual({
            status: 401,
            messageKey: "common.auth.invalidToken",
        });
    });

    // -------------------------------------------------------------------------------------------------------

    test("should return 500 when verifyResetPasswordUrlTokenFromRequest throws an error ", async () => {
        const req = createReq({ params: { token: "" }, body: { newPassword: "password", confirmPassword: "password" } });
        const res = createRes();

        const AuthHelperModule = require("../../src/helpers/authHelpher");
        AuthHelperModule.mockAuthHelperInstance.verifyResetPasswordUrlTokenFromRequest.mockImplementationOnce(() => {
            throw new UnauthorizedError("bad");
        });

        const result = await resetPassword(req, res);
        expect(result).toEqual({
            status: 401,
            messageKey: "common.auth.invalidToken",
        });

    });

    // -------------------------------------------------------------------------------------------------------

    test("should return 500 when passwords are missing", async () => {
        const req = createReq({ params: { token: "exists" }, body: {} });
        const res = createRes();

        const AuthHelperModule = require("../../src/helpers/authHelpher");
        AuthHelperModule.mockAuthHelperInstance.verifyResetPasswordUrlTokenFromRequest.mockReturnValueOnce({ email: "test@example.com", v: 0 });

        mockFindOne.mockResolvedValueOnce({
            email: "test@example.com",
            passwordResetVersion: 0,
        } as any);

        const result = await resetPassword(req, res);
        expect(result).toEqual({
            status: 500,
            messageKey: "auth.passwordReset.validation.passwordRequired",
        });
    });

    // -------------------------------------------------------------------------------------------------------

    test("should return 500 when passwords do not match", async () => {
        const req = createReq({ params: { token: "exists" }, body: { newPassword: "passwordA", confirmPassword: "passwordB" } });
        const res = createRes();

        const AuthHelperModule = require("../../src/helpers/authHelpher");
        AuthHelperModule.mockAuthHelperInstance.verifyResetPasswordUrlTokenFromRequest.mockReturnValueOnce({ email: "test@example.com", v: 0 });

        mockFindOne.mockResolvedValueOnce({
            email: "test@example.com",
            passwordResetVersion: 0,
        } as any);

        const result = await resetPassword(req, res);
        expect(result).toEqual({
            status: 500,
            messageKey: "auth.passwordReset.validation.passwordsMustMatch",
        });
    });


    // -------------------------------------------------------------------------------------------------------

    test("should return 500 when bcrypt.hash throws", async () => {
        const req = createReq({ params: { token: "exists" }, body: { newPassword: "password", confirmPassword: "password" } });
        const res = createRes();

        const AuthHelperModule = require("../../src/helpers/authHelpher");
        AuthHelperModule.mockAuthHelperInstance.verifyResetPasswordUrlTokenFromRequest.mockReturnValueOnce({ email: "test@example.com", v: 0 });

        mockFindOne.mockResolvedValueOnce({
            email: "test@example.com",
            passwordResetVersion: 0,
        } as any);

        mockBcryptHash.mockRejectedValueOnce(new Error("hash fail"));

        const result = await resetPassword(req, res);
        expect(result).toEqual({
            status: 500,
            messageKey: "common.errors.internal",
        });
    });

    // -------------------------------------------------------------------------------------------------------

    test("should return 500 when update does not update any rows", async () => {
        const req = createReq({ params: { token: "exists" }, body: { newPassword: "password", confirmPassword: "password" } });
        const res = createRes();

        const AuthHelperModule = require("../../src/helpers/authHelpher");
        AuthHelperModule.mockAuthHelperInstance.verifyResetPasswordUrlTokenFromRequest.mockReturnValueOnce({ email: "test@example.com", v: 0 });

        mockFindOne.mockResolvedValueOnce({
            email: "test@example.com",
            passwordResetVersion: 0,
        } as any);

        mockBcryptHash.mockResolvedValueOnce("hashed");

        // Mock update to return 0 rows updated (simulating no rows affected)
        mockUpdate.mockResolvedValueOnce([0] as any);

        const result = await resetPassword(req, res);
        expect(result).toEqual({
            status: 500,
            messageKey: "auth.passwordReset.errors.notUpdated",
        });
    });


    // -------------------------------------------------------------------------------------------------------

    test("should return 200 when password is updated and version incremented", async () => {
        const req = createReq({ params: { token: "exists" }, body: { newPassword: "password", confirmPassword: "password" } });
        const res = createRes();

        const AuthHelperModule = require("../../src/helpers/authHelpher");
        AuthHelperModule.mockAuthHelperInstance.verifyResetPasswordUrlTokenFromRequest.mockReturnValueOnce({ email: "test@example.com", v: 0 });

        mockFindOne.mockResolvedValueOnce({
            email: "test@example.com",
            passwordResetVersion: 0,
        } as any);

        mockBcryptHash.mockResolvedValueOnce("hashed");
        mockUpdate.mockResolvedValueOnce([1] as any);
        mockIncrement.mockResolvedValueOnce(undefined as any);

        const result = await resetPassword(req, res);

        
        expect(result).toEqual({
            status: 200,
            messageKey: "auth.passwordReset.success.updated",
        });

        expect(mockIncrement).toHaveBeenCalledTimes(1);
    });


});
