// ======================================================================================================
// import
// ======================================================================================================
import axios from 'axios';

// ======================================================================================================
// function to return error message key if exists, else return fallBackKey (from upper calling func)
 
export function tryGetApiErrorMessageKey(error: unknown): string | undefined {
  // if the error is not axios error return undefined
  if (!axios.isAxiosError(error)) return undefined;

  const messageKey = error.response?.data?.message as string | undefined;
  if (typeof messageKey !== 'string') return undefined;

  const trimmed = messageKey.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export const getApiErrorMessageKeyOrUndefined = tryGetApiErrorMessageKey;

// ------------------------------------------

export function getApiErrorMessageKey(error: unknown, fallbackKey = 'common.errors.internal'): string {
  return tryGetApiErrorMessageKey(error) ?? fallbackKey;
}
