//==========================================================================================================
//? Import
//==========================================================================================================

import jwt from "jsonwebtoken";

import { InternalError } from "../../errors";

import { ResponseLike } from "./types";

//==========================================================================================================


// ======================================================================================
// function to get cookie setter
// ======================================================================================
export const getCookieSetter = (res: ResponseLike): ((name: string, value: string, options?: Record<string, unknown>) => unknown) => {
    const setter = res.cookie ?? res.setCookie;
    if (!setter) {
        throw new InternalError("common.errors.internal");
    }
    return setter;
};


// ======================================================================================
// function to create a cookie
// ======================================================================================
export const createJWTtoken = (
    res: ResponseLike,
    tokenName: string,
    secretKey: string,
    components: { [key: string]: number | string | boolean },
    maximumAge: number,
    storeCookie: boolean
): string => {
    const token: string = jwt.sign(components, secretKey, { expiresIn: maximumAge / 1000 });

    if (storeCookie) {
        const cookieSetter = getCookieSetter(res);
        cookieSetter(tokenName, token, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",// "lax" for development
            path: "/",
        });
    }

    return token;
};


// ====================================================================================
// function to remove a cookie
// ====================================================================================
export const removeCookieToken = (res: ResponseLike, tokenName: string): null => {
    res.clearCookie(tokenName, {
        httpOnly: true,
        path: "/api",
        sameSite: "strict",
        secure: true,
    });
    res.clearCookie(tokenName, {
        httpOnly: true,
        path: "/",
        sameSite: "lax",
        secure: false,
    });
    res.clearCookie(tokenName, {
        httpOnly: true,
        path: "/",
        sameSite: "strict",
        secure: false,
    });
    return null;
};
