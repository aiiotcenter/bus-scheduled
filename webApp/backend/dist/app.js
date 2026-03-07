"use strict";
//===========================================================================================
//? Initializes  Express framework & creates an instance of the Express application "app" & Import CORS
//(it will be used to define routes, middleware, and handle HTTP requests)
//===========================================================================================
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express")); // importing express function and Express type
const app = (0, express_1.default)();
const cors_1 = __importDefault(require("cors"));
//===========================================================================================
//? Import Middlewares & Libraries(modules) we will use
//===========================================================================================
const cookie_parser_1 = __importDefault(require("cookie-parser")); //middleware for parsing cookies in Express requests
// import AuthService from './services/authService';
//===========================================================================================
//? Enable CORS middleware
//===========================================================================================
const corsOptions = {
    origin: (origin, callback) => {
        // allow non-browser tools (no Origin header)
        if (!origin)
            return callback(null, true);
        const allowed = [
            'http://localhost:3000',
            'http://127.0.0.1:3000',
        ];
        // allow LAN dev server origins (when opening the Vite host URL from phone)
        const isLanDev = /^http:\/\/(\d{1,3}\.){3}\d{1,3}:3000$/.test(origin); // allow http://<LAN-IP>:3000 for phone testing when using vite --host "npm run host:full"
        if (allowed.includes(origin) || isLanDev)
            return callback(null, true);
        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'HEAD', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 204
};
app.use((0, cors_1.default)(corsOptions));
app.options(/.*/, (0, cors_1.default)(corsOptions));
//===========================================================================================
//? set up for the middleware( handle json reqestes & url & cookies)
//===========================================================================================
app.use(express_1.default.json()); // parse(analyse) incoming requestes with json type
app.use(express_1.default.urlencoded({ extended: true })); // parse(analyse) incoming body requests
app.use((0, cookie_parser_1.default)()); // allow reading cookies
app.set("view engine", "ejs"); // set the view engine to ejs
//===========================================================================================
//? Import the Routes
//===========================================================================================
const authRoute_1 = __importDefault(require("./apiRoutes/authRoute"));
const adminRoute_1 = __importDefault(require("./apiRoutes/adminRoute"));
const userRoute_1 = __importDefault(require("./apiRoutes/userRoute"));
const driverRoute_1 = __importDefault(require("./apiRoutes/driverRoute"));
// import trackingRoute from './viewRoutes/trackingRoute';
//===========================================================================================
//? set up routes handler for the API endpoints
//===========================================================================================
app.use('/api/auth', authRoute_1.default);
app.use('/api/admin', adminRoute_1.default);
app.use('/api/user', userRoute_1.default);
app.use('/api/driver', driverRoute_1.default);
// app.use('/api/live-location', trackingRoute);
exports.default = app;
//# sourceMappingURL=app.js.map