//==========================================================================================================
//? Unit Tests for Logout Functionality
//==========================================================================================================

import { logout } from "../../src/services/authService/logout";
import { UnauthorizedError } from "../../src/errors";

// mock models/helpers ------------------------------------------------------------------------
jest.mock("../../src/helpers/authHelpher", () => {
    const mockAuthHelperInstance = {
        getUserData: jest.fn(),
        clearLoginSession: jest.fn(),
    };

    return {
        __esModule: true,
        mockAuthHelperInstance,
        default: jest.fn(() => mockAuthHelperInstance),
    };
});

// ============================================================================================================================
//? Current Unit test for logout functionality 
// -------------------------------------------------------------------
// covered unit tests in this file:
// - Successful logout:
//   should return 200 and clear session when user is authenticated
//   
// - Authentication errors:
//   should return 401 when user is not authenticated (UnauthorizedError)
//   
// - Error handling:
//   should return 500 when an unexpected error occurs


describe("AuthService -> logout", () => {
    const createReq = (cookies: any = {}) => {
        return {
            cookies,
            ip: "127.0.0.1",
            params: {},
            query: {},
        } as any;
    };

    const createRes = () => {
        return {
            setCookie: jest.fn(),
            clearCookie: jest.fn(),
        } as any;
    };

    beforeEach(() => {
        jest.clearAllMocks();

        // 
        const AuthHelperModule = require("../../src/helpers/authHelpher");
        AuthHelperModule.mockAuthHelperInstance.getUserData.mockClear();
        AuthHelperModule.mockAuthHelperInstance.clearLoginSession.mockClear();

        // avoid noise in tests from function logs or errors (test result is what matters)
        jest.spyOn(console, "log").mockImplementation(() => undefined);
        jest.spyOn(console, "error").mockImplementation(() => undefined);
    });

    afterEach(() => {
        // restore console methods to their original behavior after we finish a test
        (console.log as jest.Mock | undefined)?.mockRestore?.();
        (console.error as jest.Mock | undefined)?.mockRestore?.();
    });

    //==========================================================================================================
    //? Successful logout
    //==========================================================================================================

    test("should return 200 and clear session when user is authenticated", async () => {
        const req = createReq({ login_token: "valid_token" });
        const res = createRes();

        // Mock successful user data retrieval
        const AuthHelperModule = require("../../src/helpers/authHelpher");
        const helperInstance = AuthHelperModule.mockAuthHelperInstance;
        
        helperInstance.getUserData.mockReturnValue({
            userID: "U001",
            userRole: "driver",
            userName: "Test User",
        });

        const result = await logout(req, res);

        expect(result).toEqual({
            status: 200,
            messageKey: "auth.logout.success",
        });

        // verify helper calls
        expect(helperInstance.getUserData).toHaveBeenCalledTimes(1);
        expect(helperInstance.getUserData).toHaveBeenCalledWith(req);
        
        expect(helperInstance.clearLoginSession).toHaveBeenCalledTimes(1);
        expect(helperInstance.clearLoginSession).toHaveBeenCalledWith(res);
    });

    //==========================================================================================================
    //? Authentication errors
    //==========================================================================================================

    test("should return 401 when user is not authenticated - no token", async () => {
        const req = createReq({}); // no login token
        const res = createRes();

        // get mocked helper instance 
        const AuthHelperModule = require("../../src/helpers/authHelpher");
        const helperInstance = AuthHelperModule.mockAuthHelperInstance;
        
        // Mock getUserData to throw UnauthorizedError
        helperInstance.getUserData.mockImplementation(() => {
            throw new UnauthorizedError("auth.errors.unauthorized");
        });

        const result = await logout(req, res);

        expect(result).toEqual({
            status: 401,
            messageKey: "auth.errors.unauthorized",
        });

        expect(helperInstance.getUserData).toHaveBeenCalledTimes(1);
        expect(helperInstance.clearLoginSession).not.toHaveBeenCalled();
    });

    //==========================================================================================================
    //? Error handling
    //==========================================================================================================
    // when error occurs to logout function, with or without having jwt (user data)
 
    test("should return 500 when an unexpected error occurs", async () => {
        const req = createReq({ login_token: "valid_token" });
        const res = createRes();

        const AuthHelperModule = require("../../src/helpers/authHelpher");
        const helperInstance = AuthHelperModule.mockAuthHelperInstance;
        
        // Mock getUserData to throw unexpected error
        helperInstance.getUserData.mockImplementation(() => {
            throw new Error("Unexpected error");
        });

        const result = await logout(req, res);

        expect(result).toEqual({
            status: 500,
            messageKey: "common.errors.internal",
        });

        expect(helperInstance.getUserData).toHaveBeenCalledTimes(1);
        expect(helperInstance.clearLoginSession).not.toHaveBeenCalled();
    });


    // --------------------------------------------------------

    test("should return 500 when clearLoginSession throws error", async () => {
        const req = createReq({ login_token: "valid_token" });
        const res = createRes();

        const AuthHelperModule = require("../../src/helpers/authHelpher");
        const helperInstance = AuthHelperModule.mockAuthHelperInstance;
        
        // Mock successful user data retrieval
        helperInstance.getUserData.mockReturnValue({
            userID: "U001",
            userRole: "driver",
            userName: "Test User",
        });

        // Mock clearLoginSession to throw error
        helperInstance.clearLoginSession.mockImplementation(() => {
            throw new Error("Failed to clear session");
        });

        const result = await logout(req, res);

        expect(result).toEqual({
            status: 500,
            messageKey: "common.errors.internal",
        });

        expect(helperInstance.getUserData).toHaveBeenCalledTimes(1);
        expect(helperInstance.clearLoginSession).toHaveBeenCalledTimes(1);
    });
});



// disable this file for a quite bit

// test.skip("logout tests temporarily disabled", () => {
//     expect(true).toBe(true);
// });