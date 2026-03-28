type JsonRequestInit = RequestInit & {
    timeoutMs?: number;
};
export type ApiClientJsonResponse<T> = {
    ok: boolean;
    status: number;
    data: T | null;
};
export declare const apiClient: {
    getJson: <T>(url: string, init?: JsonRequestInit) => Promise<ApiClientJsonResponse<T>>;
};
export {};
//# sourceMappingURL=apiClient.d.ts.map