//===========================================================================================
//? Initializes  Express framework & creates an instance of the Express application "app" & Import CORS
//(it will be used to define routes, middleware, and handle HTTP requests)
//===========================================================================================

import express, {Express} from 'express'; // importing express function and Express type
import path from 'path';

const app:Express = express();

import cors from 'cors';
//===========================================================================================
//? Import Middlewares & Libraries(modules) we will use
//===========================================================================================

import cookieParser from 'cookie-parser';//middleware for parsing cookies in Express requests
// import AuthService from './services/authService';

//===========================================================================================
//? Enable CORS middleware
//===========================================================================================

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // allow non-browser tools (no Origin header)
    if (!origin) return callback(null, true);

    const allowed = [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
    ];

    // allow LAN dev server origins (when opening the Vite host URL from phone)
    const isLanDev = /^http:\/\/(\d{1,3}\.){3}\d{1,3}:3000$/.test(origin); // allow http://<LAN-IP>:3000 for phone testing when using vite --host "npm run host:full"

    if (allowed.includes(origin) || isLanDev) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'HEAD', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));

//===========================================================================================
//? set up for the middleware( handle json reqestes & url & cookies)
//===========================================================================================

app.use(express.json()); // parse(analyse) incoming requestes with json type
app.use(express.urlencoded({ extended: true }));// parse(analyse) incoming body requests
app.use(cookieParser());// allow reading cookies


app.set("view engine", "ejs"); // set the view engine to ejs

//===========================================================================================
//? Import the Routes
//===========================================================================================

import authRoute from './apiRoutes/authRoute';

import adminRoute from './apiRoutes/adminRoute';

import userRoute from './apiRoutes/userRoute';

import driverRoute from './apiRoutes/driverRoute';

// import trackingRoute from './viewRoutes/trackingRoute';
//===========================================================================================
//? set up routes handler for the API endpoints
//===========================================================================================


app.use('/api/auth', authRoute);


app.use('/api/admin', adminRoute);


app.use('/api/user', userRoute);

app.use('/api/driver', driverRoute);

// app.use('/api/live-location', trackingRoute);

export default app;