//==========================================================================================================
//? Unit Tests
//==========================================================================================================


import { language } from "@src/enums/userEnum";
import { UserService } from "../src/services/userServices";


//impor errors -------------------
import { ValidationError } from "@src/errors";

// mock models ------------------------------------------------------------------------

import UserModel from "@src/models/userModel";
jest.mock("@src/models/userModel", () => ({
    __esModule: true,
    default: {},
}));

// mock helpers ------------------------------------------------------------------------


jest.mock("@src/helpers/userHelper", () => {
    const mockUserHelperInstance = {
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

describe("UserService", () =>{
    const userService = new UserService();

    beforeEach(() =>{
        jest.clearAllMocks();
    })

    afterEach(() =>{
        jest.restoreAllMocks();
    })


    // =================================================================
    //? change language
    // =================================================================

    describe("chageLanguage", () =>{

        test("should change language successfully", async () =>{

            // arrange ----------
            const mockInput = {
                userId: "U001",
                language: "english"

            }

            const UserHelper = require("../src/helpers/userHelper");
            UserHelper.mockUserHelperInstance.update.mockResolvedValueOnce({updated: true, updatedCount: 1});

            // act ----------
            const result = await userService.changeLanguage(mockInput.userId, mockInput.language);


            // assets ------------------
            expect(result).toEqual({
                updated: true,
                messageKey: "common.crud.updated"
            })

            expect(UserHelper.mockUserHelperInstance.update).toHaveBeenCalledTimes(1);
            expect(UserHelper.mockUserHelperInstance.update).toHaveBeenCalledWith(
              UserModel,
              { 
                id: mockInput.userId, 
                language: mockInput.language 
              } 
            );

        });
        
        // -----------------------------------------------------------------------------

        test("should throw error when language is empty", async () =>{
            // arrange ----------
            const mockInput = {
                userId: "U001",
                language: ""
            }

            // i don't mock the .update method because an error is raised terminating the function; so we never reach .update part

            // act ----------
            const promise = userService.changeLanguage(mockInput.userId, mockInput.language);

            // assets ----------
            await expect(promise).rejects.toBeInstanceOf(ValidationError);
            await expect(promise).rejects.toThrow("common.errors.validation.fillAllFields");
        });

        // ----------------------------------------------------------------------------

        test("should throw error when langauge is not string", async () =>{
            // arrange ----------
            const mockInput = {
                userId: "U001",
                language: 123
            }
            // i don't mock the .update method because an error is raised terminating the function; so we never reach .update part

            // act ----------
            const promise = userService.changeLanguage(mockInput.userId, mockInput.language);

            // assets ----------
            await expect(promise).rejects.toBeInstanceOf(ValidationError);
            await expect(promise).rejects.toThrow("common.errors.validation.invalidField");
        });

        // ----------------------------------------------------------------------------------

        test("should return no changes when language is same as before", async () =>{
            // arrange ----------
            const mockInput = {
                userId: "U001",
                language: "english"
            }

            const UserHelper = require("../src/helpers/userHelper");
            UserHelper.mockUserHelperInstance.update.mockResolvedValueOnce({updated: false, updatedCount: 0});

            // act ----------
            const result = await userService.changeLanguage(mockInput.userId, mockInput.language);

            // assets ----------
            expect(result).toEqual({
                updated: false,
                messageKey: "common.crud.noChanges"
            })

            expect(UserHelper.mockUserHelperInstance.update).toHaveBeenCalledTimes(1);
            expect(UserHelper.mockUserHelperInstance.update).toHaveBeenCalledWith(
              UserModel,
              { 
                id: mockInput.userId, 
                language: mockInput.language 
              } 
            );
        })
    });

    
    // =================================================================
    //? change apperance
    // =================================================================

    describe("changeApperance", () =>{

        test("should change apperance successfully", async () =>{
            // arrange ----------
            const mockInput = {
                userId: "U001",
                appearance: "dark"
            }

            const UserHelper = require("../src/helpers/userHelper");
            UserHelper.mockUserHelperInstance.update.mockResolvedValueOnce({updated: true, updatedCount: 1});

            // act ----------
            const result = await userService.changeAppearance(mockInput.userId, mockInput.appearance);

            // assets ----------
            expect(result).toEqual({
                updated: true,
                messageKey: "common.crud.updated"
            })

            expect(UserHelper.mockUserHelperInstance.update).toHaveBeenCalledTimes(1);
            expect(UserHelper.mockUserHelperInstance.update).toHaveBeenCalledWith(
              UserModel,
              { 
                id: mockInput.userId, 
                appearance: mockInput.appearance 
              } 
            );
        });

        // ------------------------------------------------------------------
    
        test("should throw error when appearance is empty", async () =>{
            // arrange ----------
            const mockInput = {
                userId: "U001",
                appearance: ""
            }

            // act ----------
            const promise = userService.changeAppearance(mockInput.userId, mockInput.appearance);

            // assets ----------
            await expect(promise).rejects.toBeInstanceOf(ValidationError);
            await expect(promise).rejects.toThrow("common.errors.validation.fillAllFields");
        });

        // ------------------------------------------------------------------

        test("should throw error when appearance is not string", async () =>{
            // arrange ----------
            const mockInput = {
                userId: "U001",
                appearance: 123
            }

            // act ----------
            const promise = userService.changeAppearance(mockInput.userId, mockInput.appearance);

            // assets ----------
            await expect(promise).rejects.toBeInstanceOf(ValidationError);
            await expect(promise).rejects.toThrow("common.errors.validation.invalidField");
        });

        // ------------------------------------------------------------------

        test("should return no changes when appearance is same as before", async () =>{
            // arrange ----------
            const mockInput = {
                userId: "U001",
                appearance: "dark"
            }

            const UserHelper = require("../src/helpers/userHelper");
            UserHelper.mockUserHelperInstance.update.mockResolvedValueOnce({updated: false, updatedCount: 0});

            // act ----------
            const result = await userService.changeAppearance(mockInput.userId, mockInput.appearance);

            // assets ----------
            expect(result).toEqual({
                updated: false,
                messageKey: "common.crud.noChanges"
            })

            expect(UserHelper.mockUserHelperInstance.update).toHaveBeenCalledTimes(1);
            expect(UserHelper.mockUserHelperInstance.update).toHaveBeenCalledWith(
              UserModel,
              { 
                id: mockInput.userId, 
                appearance: mockInput.appearance 
              } 
            );
        });
    })

    
})

