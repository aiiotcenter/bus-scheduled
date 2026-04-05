"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
//===========================================================================================================
//? Import Required Modules and Set Port:
//===========================================================================================================
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config(); // Load environment variables from .env file
require('dotenv').config({ path: __dirname + '/./../../.env' });
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const app_1 = __importDefault(require("./app"));
const port = Number(process.env.BACKEND_SERVER_PORT) || 3001;
// host chooses which netweork interface the server binds to (0.0.0.0 is default values means listen on all network interface on this PC)
// so the backend can be accessed from other devices on the same network using my PC's LAN IP
const host = (process.env.BACKEND_SERVER_HOST || '0.0.0.0').toString();
const constructDatabase_1 = require("./database/constructDatabase");
//===========================================================================================================
//? Create HTTP Server and Initialize Express App:
//===========================================================================================================
const server = http_1.default.createServer(app_1.default); //method to creates an HTTP server and passes Express app to handle incoming requests.
// Initialize Socket.IO
const io = new socket_io_1.Server(server, {
    cors: {
        origin: "*",
        // methods: ["GET", "POST"]
    }
});
//===========================================================================================================
const startServer = async () => {
    try {
        await (0, constructDatabase_1.initDB)(); // construct the database ///?
        //--------------------------------
        io.on("connection", function (socket) {
            socket.on("send-location", function (data) {
                io.emit("receive-location", { id: socket.id, ...data });
            });
            socket.on("disconnect", function () {
                io.emit("user-disconnected", socket.id);
            });
        });
        //--------------------------------
        server.listen(port, host, () => {
            console.log(`Server is successfully running on http://${host}:${port}`);
        });
        //===========================================
    }
    catch (error) {
        console.log("Error occured while initelizing the database");
        process.exit(1); // we will stop the app if the database building failed
    }
};
// server.listen(port)
startServer();
//# sourceMappingURL=server.js.map