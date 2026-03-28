// ======================================================================================
//? Importing
// ======================================================================================
import axios, {
  type AxiosError,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
  type RawAxiosResponseHeaders,
} from 'axios';

import { backendBaseUrl } from '../constants/env';

// ------------------------------------------------------
// API client
export const apiClient = axios.create({
  baseURL: backendBaseUrl,
  withCredentials: true
});

//  Handle missing responses by selecting offline/network errors and attaching a default error response
// when the user device is offline or out of network, it does't return response, that's why we are handling this case here
apiClient.interceptors.response.use(
  (response) => response,
  
    // axios stores the original request details (method, url, headers) inside error.config  
    (error) => {
    // determine whether it's internet or network error
    if (axios.isAxiosError(error) && !error.response) {
      const isOffline = typeof navigator !== 'undefined' && navigator.onLine === false;
      const messageKey = isOffline ? 'common.errors.offline' : 'common.errors.network';

      type ApiErrorResponse = { message: string };

      // create fake error to match all responses around codebase -------------------

      const axError = error as AxiosError<ApiErrorResponse, unknown>;

      // ------------------

      const response: AxiosResponse<ApiErrorResponse, unknown> = {
        data: { message: messageKey },
        status: 0,
        statusText: '',
        headers: {} as RawAxiosResponseHeaders,
        config: axError.config ?? ({} as InternalAxiosRequestConfig<unknown>),
      };
      // ------------------

      axError.response = response;
    }

    return Promise.reject(error);
  }
);
