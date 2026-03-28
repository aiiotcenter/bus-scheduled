"use strict";
//==========================================================================================================
//? Import
//==========================================================================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIPaddressAndUserLocation = void 0;
const apiClient_1 = require("../../services/apiClient");
//==========================================================================================================
const getIPaddressAndUserLocation = async (req) => {
    const unknownResult = { ip: null, location: null };
    try {
        const ip = req.ip;
        if (!ip) {
            console.warn("IP address not available, skipping location lookup");
            return unknownResult;
        }
        const response = await apiClient_1.apiClient.getJson(`http://ip-api.com/json/${ip}`);
        if (!response.ok) {
            console.warn("Failed to fetch location data, skipping location lookup");
            return { ip, location: null };
        }
        const locationJSONdata = response.data;
        if (!locationJSONdata || Object.keys(locationJSONdata).length === 0) {
            console.warn("No location data found for the given IP address, skipping location lookup");
            return { ip, location: null };
        }
        const city = locationJSONdata.city || "Unknown City";
        const country = locationJSONdata.country || "Unknown Country";
        const region = locationJSONdata.region || "Unknown Region";
        const location = `${city}, ${region}, ${country}`;
        return { ip, location };
    }
    catch (error) {
        console.warn("Error occured while getting location data from the IP address");
        return unknownResult;
    }
};
exports.getIPaddressAndUserLocation = getIPaddressAndUserLocation;
//# sourceMappingURL=ipLocation.js.map