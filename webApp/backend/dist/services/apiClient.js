"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiClient = void 0;
const NetworkError_1 = require("../errors/NetworkError");
async function requestJson(input, init) {
    const timeoutMs = init?.timeoutMs ?? 8000;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
        const res = await fetch(input, {
            ...init,
            signal: controller.signal,
            headers: {
                Accept: 'application/json',
                ...(init?.headers ?? {}),
            },
        });
        let data = null;
        try {
            data = (await res.json());
        }
        catch {
            data = null;
        }
        return { ok: res.ok, status: res.status, data };
    }
    catch (err) {
        void err;
        throw new NetworkError_1.NetworkError();
    }
    finally {
        clearTimeout(timeout);
    }
}
exports.apiClient = {
    getJson: (url, init) => requestJson(url, { ...init, method: 'GET' }),
};
//# sourceMappingURL=apiClient.js.map