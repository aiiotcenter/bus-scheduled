//==========================================================================================================
//? Unit Tests
//==========================================================================================================

import { login } from "../../src/services/authService/login";

import UserModel from "../../src/models/userModel";
import bcrypt from "bcrypt";

// mock models/helpers ------------------------------------------------------------------------
jest.mock("../../src/models/userModel", () => ({
    __esModule: true,
    default: {
        findOne: jest.fn(),
    },
}));

jest.mock("bcrypt", () => ({
    __esModule: true,
    default: {
        compare: jest.fn(),
    },
}));

//  mock authHelper class and get fake module model (createLoginSession/loginAttempt), so we return a shared mock instance 

jest.mock("../../src/helpers/authHelpher", () => {
    const mockAuthHelperInstance = {
        createLoginSession: jest.fn(),
        loginAttempt: jest.fn(),
    };

    return {
        __esModule: true,
        mockAuthHelperInstance,
        default: jest.fn(() => mockAuthHelperInstance),// create mock object created by creatAuthHelperMock() when mod constructor is called
        
    };
});

type MockedFindOne = jest.MockedFunction<typeof UserModel.findOne>; // provide types for mocked function (userModel.findOne)


// ============================================================================================================================
// =============================================================================================================================
//? current Unit test for login functionality 
// -------------------------------------------------------------------
// covered unit tests in this file:
// - Credentials validation:
//   should return 500 when email/password are missing
//   should return 500 when email/password types are invalid

// - Password validation
//   should return 500 when stored hashedPassword is not a string

// - User not found
//   should return 404 when user not found
//   should return 401 when password is invalid

// - Session creation
//   should return 200 and create session when password is valid

// - Error handling
//   should return 500 when bcrypt.compare throws error





describe("AuthService -> login", () => {  
    //create variable "mockFindOne" that points to userMode.findOne , but it must be treated as jest mocked function 
    const mockFindOne = UserModel.findOne as unknown as MockedFindOne;

    let mockBcryptCompare: jest.Mock;

    const createReq = (body: any) => {
        return {
            body,
            cookies: {},
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
        
        mockBcryptCompare = bcrypt.compare as unknown as jest.Mock;

        // Clear call history on the shared AuthHelper mock instance (AuthHelper is instantiated at module import time)
        const AuthHelperModule = require("../../src/helpers/authHelpher");
        AuthHelperModule.mockAuthHelperInstance.createLoginSession.mockClear();
        AuthHelperModule.mockAuthHelperInstance.loginAttempt.mockClear();

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
    //? Credentials validation
    //==========================================================================================================

    test("should return 500 when email/password are missing", async () => {
        // build fake(mocks) req and res
        const req = createReq({ email: "", password: "" });
        const res = createRes();

        // call login function 
        const result = await login(req, res);


        //check that when input are missing we get fill all fileds error 
        expect(result).toEqual({
            status: 500,
            messageKey: "common.errors.validation.fillAllFields",
        });

        // ensure that's no db query occured   or   password hashing/compare happend (with bycrypt)
        expect(mockFindOne).not.toHaveBeenCalled();
        expect(mockBcryptCompare).not.toHaveBeenCalled();
    });

    // -----------------------------------------------------------------------------

    test("should return 500 when email/password types are invalid", async () => {
        const req = createReq({ email: 5, password: true });
        const res = createRes();

        const result = await login(req, res);

        expect(result).toEqual({
            status: 500,
            messageKey: "common.errors.validation.fillAllFields",
        });

        expect(mockFindOne).not.toHaveBeenCalled();
        expect(mockBcryptCompare).not.toHaveBeenCalled();
    });

    //==========================================================================================================
    //? check data (email found, password hashed )
    //==========================================================================================================

    test("should return 404 when user not found", async () => {
        mockFindOne.mockResolvedValueOnce(null as any);

        const req = createReq({ email: "test@example.com", password: "123" });
        const res = createRes();

        const result = await login(req, res);

        expect(mockFindOne).toHaveBeenCalledTimes(1);
        expect(result).toEqual({
            status: 404,
            messageKey: "auth.login.userNotFound",
        });

        expect(mockBcryptCompare).not.toHaveBeenCalled();
    });



    test("should return 500 when stored hashedPassword is not a string", async () => {
        mockFindOne.mockResolvedValueOnce({
            id: "U001",
            role: "driver",
            name: "Test User",
            hashedPassword: null,
        } as any);

        const req = createReq({ email: "test@example.com", password: "123" });
        const res = createRes();

        const result = await login(req, res);

        expect(result).toEqual({
            status: 500,
            messageKey: "common.errors.internal",
        });

        expect(mockBcryptCompare).not.toHaveBeenCalled();
    });

    //==========================================================================================================
    //? Password validation
    //==========================================================================================================
    // the password type is accepted, but value is wrong 
    
    test("should return 401 when password is invalid", async () => {
       
        // Mock DB lookup, pretend the user exists and return a record with a stored hashed password
        mockFindOne.mockResolvedValueOnce({
            id: "U001",
            role: "driver",
            name: "Test User",
            hashedPassword: "hashed",
        } as any);

        // mock bcrypt.compare so the provided password does NOT match the stored hash (invalid credentials)
        mockBcryptCompare.mockImplementationOnce((plain: any, hashed: any, cb: any) => { // cb is bycrypt callback function that returns results asynchronously 
            cb(null, false);
        });

        const req = createReq({ email: "test@example.com", password: "wrong" });
        const res = createRes();

        const result = await login(req, res);

        expect(mockBcryptCompare).toHaveBeenCalledTimes(1);
        expect(result).toEqual({
            status: 401,
            messageKey: "auth.login.invalidCredentials",
        });
    });

    // --------------------------------------------------------------------------------------------

    test("should return 200 and create session when password is valid", async () => {
        mockFindOne.mockResolvedValueOnce({
            id: "U001",
            role: "driver",
            name: "Test User",
            hashedPassword: "hashed",
        } as any);

        mockBcryptCompare.mockImplementationOnce((plain: any, hashed: any, cb: any) => {
            cb(null, true);
        });

        const req = createReq({ email: "test@example.com", password: "correct" });
        const res = createRes();

        const result = await login(req, res);

        expect(result).toEqual({
            status: 200,
            messageKey: "auth.login.success",
        });

        // verify helper calls (AuthHelper is mocked through module factory)
        const AuthHelperModule = require("../../src/helpers/authHelpher");
        const helperInstance = AuthHelperModule.mockAuthHelperInstance;

        expect(helperInstance.createLoginSession).toHaveBeenCalledTimes(1);
        expect(helperInstance.createLoginSession).toHaveBeenCalledWith(res, {
            userID: "U001",
            userRole: "driver",
            userName: "Test User",
        });

        expect(helperInstance.loginAttempt).toHaveBeenCalledTimes(1);
        expect(helperInstance.loginAttempt).toHaveBeenCalledWith(req, true, "test@example.com");
    });


    // --------------------------------------------------------------------------------------------

    test("should return 500 when bcrypt.compare throws error", async () => {
        mockFindOne.mockResolvedValueOnce({
            id: "U001",
            role: "driver",
            name: "Test User",
            hashedPassword: "hashed",
        } as any);

        mockBcryptCompare.mockImplementationOnce((plain: any, hashed: any, cb: any) => {
            cb(new Error("bcrypt failure"), false);
        });

        const req = createReq({ email: "test@example.com", password: "any" });
        const res = createRes();

        const result = await login(req, res);

        expect(result).toEqual({
            status: 500,
            messageKey: "common.errors.internal",
        });
    });
});
