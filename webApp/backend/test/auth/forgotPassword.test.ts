//==========================================================================================================
//? Unit Tests for Forgot Password (Send Reset Email)
//==========================================================================================================

import { sendEmailToResetPassword } from "../../src/services/authService/passwordReset";

import UserModel from "../../src/models/userModel";
import { role } from "../../src/enums/userEnum";

// mock models/helpers ------------------------------------------------------------------------
jest.mock("../../src/models/userModel", () => ({
    __esModule: true,
    default: {
        findOne: jest.fn(),
    },
}));

jest.mock("../../src/helpers/authHelper/urlTokens", () => ({
    __esModule: true,
    createResetPasswordUrlTokenWithVersion: jest.fn(),
}));

jest.mock("../../src/helpers/sendEmail", () => ({
    __esModule: true,
    sendEmail: jest.fn(),
}));

type MockedFindOne = jest.MockedFunction<typeof UserModel.findOne>;

// ==================================================================================

describe("AuthService -> forgotPassword", () => {
    const mockFindOne = UserModel.findOne as unknown as MockedFindOne;

    const TokenModule = require("../../src/helpers/authHelper/urlTokens");
    const EmailModule = require("../../src/helpers/sendEmail");

    const createReq = (body: any = {}) => ({
        body,
        params: {},
        query: {},
        cookies: {},
        ip: "127.0.0.1",
    } as any);

    const createRes = () => ({
        setCookie: jest.fn(),
        clearCookie: jest.fn(),
    } as any);

    beforeEach(() => {
        jest.clearAllMocks();

        TokenModule.createResetPasswordUrlTokenWithVersion.mockClear();
        EmailModule.sendEmail.mockClear();

        jest.spyOn(console, "log").mockImplementation(() => undefined);
        jest.spyOn(console, "error").mockImplementation(() => undefined);
    });

    afterEach(() => {
        (console.log as jest.Mock | undefined)?.mockRestore?.();
        (console.error as jest.Mock | undefined)?.mockRestore?.();
    });

    // =================================================================================


    // unit test covered:
    // -Successful:
    //     should return 200 when email is sent

    // -Auth error:
    //     should return 403 when user role is not targeted

    // -Error handling:
    //     should return 500 when email is missing
    //     should return 500 when email is not registered
    //     should return 500 when token creation throws error
    //     should return 500 when sendEmail throws error

    test("should return 500 when email is missing", async () => {
        const req = createReq({});
        const res = createRes();

        const result = await sendEmailToResetPassword(req, res, role.admin);

        expect(result).toEqual({
            status: 500,
            messageKey: "auth.passwordReset.validation.emailRequired",
        });

        expect(mockFindOne).not.toHaveBeenCalled();
    });

    // =================================================================================

    test("should return 500 when email is not registered", async () => {
        mockFindOne.mockResolvedValueOnce(null as any);

        const req = createReq({ email: "test@example.com" });
        const res = createRes();

        const result = await sendEmailToResetPassword(req, res, role.admin);

        expect(result).toEqual({
            status: 500,
            messageKey: "auth.passwordReset.errors.emailNotRegistered",
        });
    });

    // =================================================================================

    test("should return 403 when user role is not targeted", async () => {
        mockFindOne.mockResolvedValueOnce({
            email: "test@example.com",
            role: role.driver,
            passwordResetVersion: 0,
        } as any);

        const req = createReq({ email: "test@example.com" });
        const res = createRes();

        const result = await sendEmailToResetPassword(req, res, role.admin);

        expect(result).toEqual({
            status: 403,
            messageKey: "auth.passwordReset.errors.notTargetedRole",
        });

        expect(TokenModule.createResetPasswordUrlTokenWithVersion).not.toHaveBeenCalled();
        expect(EmailModule.sendEmail).not.toHaveBeenCalled();
    });

    // =================================================================================

    test("should return 500 when token creation throws error", async () => {
        mockFindOne.mockResolvedValueOnce({
            email: "test@example.com",
            role: role.admin,
            passwordResetVersion: 0,
        } as any);

        TokenModule.createResetPasswordUrlTokenWithVersion.mockImplementationOnce(() => {
            throw new Error("token fail");
        
        });

        const req = createReq({ email: "test@example.com" });
        const res = createRes();

        const result = await sendEmailToResetPassword(req, res, role.admin);

        expect(result).toEqual({
            status: 500,
            messageKey: "auth.common.errors.internal",
        });

        expect(EmailModule.sendEmail).not.toHaveBeenCalled();
    });

    // =================================================================================

    test("should return 500 when sendEmail throws error", async () => {
        mockFindOne.mockResolvedValueOnce({
            email: "test@example.com",
            role: role.admin,
            passwordResetVersion: 0,
        } as any);

        // create accepted token
        TokenModule.createResetPasswordUrlTokenWithVersion.mockReturnValueOnce("token123");

        EmailModule.sendEmail.mockRejectedValueOnce(new Error("email fail"));

        const req = createReq({ email: "test@example.com" });
        const res = createRes();

        const result = await sendEmailToResetPassword(req, res, role.admin);

        expect(result).toEqual({
            status: 500,
            messageKey: "common.errors.internal",
        });
    });


    // =================================================================================

    test("should return 200 when email is sent", async () => {
        mockFindOne.mockResolvedValueOnce({
            email: "test@example.com",
            role: role.admin,
            passwordResetVersion: 2,
        } as any);

        TokenModule.createResetPasswordUrlTokenWithVersion.mockReturnValueOnce("token123");
        EmailModule.sendEmail.mockResolvedValueOnce(undefined);

        const req = createReq({ email: "test@example.com" });
        const res = createRes();

        const result = await sendEmailToResetPassword(req, res, role.admin);

        expect(TokenModule.createResetPasswordUrlTokenWithVersion).toHaveBeenCalledTimes(1);
        expect(TokenModule.createResetPasswordUrlTokenWithVersion).toHaveBeenCalledWith("test@example.com", 2);

        expect(EmailModule.sendEmail).toHaveBeenCalledTimes(1);
        expect(result).toEqual({
            status: 200,
            messageKey: "auth.passwordReset.success.emailSent",
        });
    });


});
