"use strict";
//==========================================================================================================
//? Import
//==========================================================================================================
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeCookieToken = exports.createJWTtoken = exports.getCookieSetter = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const errors_1 = require("../../errors");
//==========================================================================================================
// ======================================================================================
// function to get cookie setter
// ======================================================================================
const getCookieSetter = (res) => {
    const setter = res.cookie ?? res.setCookie;
    if (!setter) {
        throw new errors_1.InternalError("common.errors.internal");
    }
    return setter;
};
exports.getCookieSetter = getCookieSetter;
// ======================================================================================
// function to create a cookie
// ======================================================================================
const createJWTtoken = (res, tokenName, secretKey, components, maximumAge, storeCookie) => {
    const token = jsonwebtoken_1.default.sign(components, secretKey, { expiresIn: maximumAge / 1000 });
    if (storeCookie) {
        const cookieSetter = (0, exports.getCookieSetter)(res);
        cookieSetter(tokenName, token, {
            httpOnly: true,
            secure: false,
            sameSite: "lax", // "lax" for development
            path: "/",
        });
    }
    return token;
};
exports.createJWTtoken = createJWTtoken;
// ====================================================================================
// function to remove a cookie
// ====================================================================================
const removeCookieToken = (res, tokenName) => {
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
exports.removeCookieToken = removeCookieToken;
//# sourceMappingURL=cookie.js.map