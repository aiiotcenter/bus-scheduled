//==========================================================================================================
//? Import
//==========================================================================================================

import { AuthRequest, AuthResponse } from "../../types/express/auth";

import AuthHelper from "../../helpers/authHelpher";
const authHelper = new AuthHelper();

import { UnauthorizedError } from "../../errors";

import { AuthServiceResult } from "./types";

//==========================================================================================================

export const getCurrentUser = async (
    req: AuthRequest,
    res: AuthResponse
): Promise<AuthServiceResult<{ userID: string; userRole: string; userName: string }>> => {
    try {
        const userData = authHelper.getUserData(req);
        return { status: 200, messageKey: "auth.currentUser.success", data: userData };

    // ----------------------------------------
    } catch (error) {
        console.error("Error retrieving user data.", error);

        if (error instanceof UnauthorizedError) {
            return { status: 401, messageKey: error.message };
        }

        return { status: 500, messageKey: "common.errors.internal" };
    }
};