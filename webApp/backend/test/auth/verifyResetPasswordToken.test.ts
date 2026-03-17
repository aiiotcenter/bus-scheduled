//==========================================================================================================
//? Unit Tests for Verify Reset Password Token (HEAD)
//==========================================================================================================

import { verifyResetPasswordToken } from "../../src/services/authService/passwordReset";

import UserModel from "../../src/models/userModel";

// mock models/helpers ------------------------------------------------------------------------
jest.mock("../../src/models/userModel", () => ({
    __esModule: true,
    default: {
        findOne: jest.fn(),
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


// ======================================================================================================================

describe("AuthService -> verifyResetPasswordToken", () => {
    const mockFindOne = UserModel.findOne as unknown as MockedFindOne;

    const createReq = (params: any = {}) => ({
        body: {},
        params,
        query: {},
        cookies: {},
        ip: "127.0.0.1",
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

    // ====================================================================================================================


    test("should return null when token is invalid", async () => {
        const req = createReq({ token: "expired" });

        const AuthHelperModule = require("../../src/helpers/authHelpher");
        AuthHelperModule.mockAuthHelperInstance.verifyResetPasswordUrlTokenFromRequest.mockReturnValueOnce(null);


        const result = await verifyResetPasswordToken(req);


        expect(result).toBeNull();
    });

    // ------------------------------------------------------------------------------------------------

    test("should return null when user not found", async () => {
        const req = createReq({ token: "exists" });

        const AuthHelperModule = require("../../src/helpers/authHelpher");
        AuthHelperModule.mockAuthHelperInstance.verifyResetPasswordUrlTokenFromRequest.mockReturnValueOnce({ email: "test@example.com", v: 0 });

        mockFindOne.mockResolvedValueOnce(null as any);

        const result = await verifyResetPasswordToken(req);
        expect(result).toBeNull();
    });

    // -------------------------------------------------------------------------------------------------------------

    test("should return null when token version mismatches", async () => {

        // NOTE: v stand for version of resetPassword operations, how many times we have changed the password
        // when versions doen'st match that means the reset link is not valid anymore(it was used before )
        const req = createReq({ token: "exists" });

        const AuthHelperModule = require("../../src/helpers/authHelpher");
        AuthHelperModule.mockAuthHelperInstance.verifyResetPasswordUrlTokenFromRequest.mockReturnValueOnce({ email: "test@example.com", v: 1 });

        mockFindOne.mockResolvedValueOnce({
            email: "test@example.com",
            passwordResetVersion: 2, 
        } as any);

        const result = await verifyResetPasswordToken(req);
        expect(result).toBeNull();
    });

    // -------------------------------------------------------------------------------------------------------------

    test("should return user data when token is valid, and version matches", async () => {
        const req = createReq({ token: "exists" });

        const AuthHelperModule = require("../../src/helpers/authHelpher");
        AuthHelperModule.mockAuthHelperInstance.verifyResetPasswordUrlTokenFromRequest.mockReturnValueOnce({ email: "test@example.com", v: 1 });

        mockFindOne.mockResolvedValueOnce({
            email: "test@example.com",
            passwordResetVersion: 1,
        } as any);

        const result = await verifyResetPasswordToken(req);
        expect(result).toEqual({ email: "test@example.com", v: 1 });
    });
});
