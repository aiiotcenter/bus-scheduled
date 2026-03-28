"use strict";
// =========================================================================================
// No internet connection error
Object.defineProperty(exports, "__esModule", { value: true });
exports.NetworkError = void 0;
class NetworkError extends Error {
    constructor() {
        super("No internet connection");
        this.name = "NetworkError";
    }
}
exports.NetworkError = NetworkError;
//# sourceMappingURL=NetworkError.js.map