//==========================================================================================================
//? Import
//==========================================================================================================

import { LocationData, userIPaddressAndLocation } from "../../interfaces/helper&middlewareInterface";

import { RequestLike } from "./types";
import { apiClient } from "../../services/apiClient";

//==========================================================================================================

export const getIPaddressAndUserLocation = async (req: RequestLike): Promise<userIPaddressAndLocation> => {
    const unknownResult: userIPaddressAndLocation = { ip: null, location: null };

    try {
        const ip = req.ip as string | undefined;
        if (!ip) {
            console.warn("IP address not available, skipping location lookup");
            return unknownResult;
        }

        const response = await apiClient.getJson<LocationData>(`http://ip-api.com/json/${ip}`);

        if (!response.ok) {
            console.warn("Failed to fetch location data, skipping location lookup");
            return { ip, location: null };
        }
        const locationJSONdata = response.data as LocationData | null;
        if (!locationJSONdata || Object.keys(locationJSONdata).length === 0) {
            console.warn("No location data found for the given IP address, skipping location lookup");
            return { ip, location: null };
        }

        const city = locationJSONdata.city || "Unknown City";
        const country = locationJSONdata.country || "Unknown Country";
        const region = locationJSONdata.region || "Unknown Region";

        const location: string = `${city}, ${region}, ${country}`;
        return { ip, location };
    } catch (error) {
        console.warn("Error occured while getting location data from the IP address");
        return unknownResult;
    }
};
