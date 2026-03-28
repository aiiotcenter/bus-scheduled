// =========================================================================================
// No internet connection error

export class NetworkError extends Error {
  constructor() {
    super("No internet connection");
    this.name = "NetworkError";
  }
}