# Near East University Bus Tracker

A comprehensive web application for managing and tracking university buses in real-time. This system provides administrators with complete control over bus operations, drivers, routes, and schedules, while offering users an intuitive interface to discover routes and track buses in real-time.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Database](#database)
- [API Documentation](#API-documentation)
- [Authentication & Security](#authentication--security)
- [Execution Instructions](#execution-instructions)


## Overview

Near East University Bus Tracker system is designed to streamline university transportation management. It enables administrators to manage drivers, buses, routes, stations and schedules efficiently, while providing real-time tracking capabilities for students and staff. The application is built with a modern tech stack ensuring scalability, security, and excellent user experience.

## Features

### Administrator Capabilities
- **Driver Management** - Complete CRUD operations for driver profiles and assignments
- **Bus Management** - Manage buses inventory, capacity, and operational status
- **Route Configuration** - Define and maintain bus routes with stations and distances
- **Station Management** - Manage pickup and drop-off locations 
- **Schedule Management** - Create and manage bus schedules 
- **Administrative Dashboard** - Provide view on currenlty operating buses and the routes they are following
- **change language** - choose language between turkish and english


### User Capabilities
- **Route Discovery** - Browse all available bus routes
- **Real-time Bus Tracking** - View live-tracking of active buses and their current locations


### Driver Capabilities
- **Route Discovery** - Browse assigned routes and buses for every week
- **change Route** - Update and switch currently followed routes

### Security & Compliance
- **JWT Authentication** - applied JWT authentication to secure API endpoints
- **Role-Based Access Control** - implemented role-based access control for Admin protected endpoints
- **Token Verification Middleware** - validates JWT for authenticated routes
- **Email-Based Password Recovery** - secured password reset operation and password set operation with token verification 


## Development Stack

### Frontend technologies 
- **React** 
- **TypeScript**
- **Vite** 
- **Tailwind CSS**


### Backend technologies 
- **Node.js** 
- **Express.js** 
- **TypeScript** 

- **MySQL**
- **Sequelize** 


### Development Tools
- **Git**
- **npm** 
- **Prettier**


## Database

### Schema Overview

- **users table** 
- **buses table** 
- **routes table** 
- **stations table** 
- **route_stations table** 
- **bus_schedules table** 
- **login_attempts table** 

check models folder in /backend/src to have cloer look on the tables details



## API Documentation

### Authentication Endpoints (`/api/auth`)

Auth required: for this endpoins, authentication applied on some of the endpoints, and the required token varies for each endpoint

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| **POST** | `/login` | - | User login |
| **POST** | `/logout` | - | User logout |
| **GET** | `/user-info` | required | Get current user info |
| **POST** | `/forgot-password` | - | Request password reset |
| **HEAD** | `/reset-password/:token` | required | Verify reset password token |
| **PATCH** | `/reset-password/:token` | required | Submit new password |
| **HEAD** | `/reset-password/:token` | required | Verify set passwordtoken |
| **PATCH** | `/set-password/:token` | required | Set password (drivers) |

### Admin Endpoints (`/api/admin`)

Access is explicit for Admins only, authorization layer is applied on these routes

#### Driver Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| **POST** | `/driver/add` | Add new driver |
| **DELETE** | `/driver/remove` | Remove driver |
| **PATCH** | `/driver/update` | Update driver |
| **GET** | `/drivers/fetch` | Fetch all drivers |

#### Bus Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| **POST** | `/bus/add` | Add new bus |
| **DELETE** | `/bus/remove` | Remove bus |
| **PATCH** | `/bus/update` | Update bus |
| **GET** | `/buses/fetch` | Fetch all buses |

#### Route Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| **POST** | `/route/add` | Add new route |
| **DELETE** | `/route/remove` | Remove route |
| **PATCH** | `/route/update` | Update route |

#### Station Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| **POST** | `/station/add` | Add new station |
| **DELETE** | `/station/remove` | Remove station |
| **PATCH** | `/station/update` | Update station |
| **GET** | `/stations/fetch` | Fetch all stations |

#### Bus Schedule Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| **POST** | `/schedule/add` | Add new schedule |
| **DELETE** | `/schedule/remove` | Remove schedule |
| **PATCH** | `/schedule/update` | Update schedule |
| **GET** | `/schedule/fetch` | Fetch all schedules |

### User Endpoints (`/api/user`)

Auth required: implies that a valied login token is mandatory for endpoint with "required" Auth 

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| **GET** | `/routes/all` | - | View all routes |
| **GET** | `/routes/operating` | - | View operating routes |
| **PATCH** | `/language` | required | Change language |
| **PATCH** | `/appearance` | required | Change appearance |
| **PATCH** | `/change-route` | required | Change route (drivers) |
| **PATCH** | `/tracking` | required | Start/Stop tracking |


## Authentication & Security

### JWT Authentication Flow

The application uses JWT (JSON Web Tokens) for authentication:

**Token Generation**: Backend validates credentials and generates a JWT token
**Cookie Storage**: Token is stored in an HTTP-only, secure cookie
**Automatic Transmission**: Token is automatically included in all subsequent requests
**Token Validation**: Middleware validates the token on protected endpoints
**Session Expiry**: Token expires after the configured duration 

### Token Types and Purposes

| Token Type | Purpose | Expiry | Usage |
|-----------|---------|--------|-------|
| **loginToken** | General authentication | 1 hour | All authenticated operations |
| **resetPasswordToken** | Password reset | 20 minutes | Password reset flow only |
| **setPasswordToken** | Initial password setup | 20 minutes | Driver account setup |


### Security Measures

- **Token Validation**: Every protected endpoint validates token before processing
- **Role-Based Access**: Endpoints enforce role-based permissions for protected routes
- **Password Hashing**: User passwords hashed with bcrypt 
- **Email Verification**: Password reset requires email verification



## Execution Instructions

To run the Near East University Bus Tracker system, follow these steps:

1. **Prerequisites**
   - Node.js (version 22.19.0)
   - npm (version 10.9.3)
   - MySQL (version 8.0.43 for Win64 on x86_64)

2. **Installation**
   - Clone the repository
   - Navigate to the project directory

3. **Configuration**
   - Set up environment variables in a `.env` file
   - Configure database connection string
   - Set up JWT secret 
   - **3.1. Web application (`codebase/webApp`) dependencies**
     - From `codebase/webApp` run `npm install` to install backend and tooling dependencies (like : Express, Sequelize, JWT (`jsonwebtoken`), bcrypt, Nodemailer, Socket.IO, cookie-parser, cors, dotenv, mysql2, ejs, uuidv4, nodemon, etc.)

     - From `codebase/webApp/frontend` run `npm install` to install frontend/tooling dependencies (like: React, React DOM, React Router, React Redux, Axios, Leaflet, React-Leaflet, Tailwind CSS, i18next, react-i18next, i18next-browser-languagedetector, i18next-http-backend, Heroicons, Vite, TypeScript, ESLint, etc.)

   - **3.2. Mobile application (`codebase/mobile_app`) dependencies**
     - Ensure Flutter SDK (with Dart SDK compatible with `sdk: ^3.9.2` in `pubspec.yaml`) is installed and configured
     - From `codebase/mobile_app` run `flutter pub get` to install Flutter packages

4. **Database Setup**
   - use the modeules to initialize the database schema
   - run "/codebase/webApp/backend/src/database/constructDatbase.ts" file to build database and seed the mock up data

5. **Run the Application**

  **5.1. Web Application:  

      - start the development server with `npm run start` 
      - the web application will be available at `http://localhost:3000`

    5.1.1 Hosted mode:

      - ensure both devices(phone and laptop) are connected to the same WiFi
      - From `codebase/webApp` run `npm run host:full`
      - Open the **Network** URL printed by Vite on the phone (example: `http://192.168.x.x:3000`)

   5.2. Mobile Application:

      5.2.1. User version:

        - Navigate to `codebase/mobile_app` 
        - Run `flutter run` to start the mobile application 
      
      5.2.2. Driver version:

        - Navigate to `codebase/mobile_app` 
        - Run `flutter run lib/driver_main.dart` to start the driver mobile application
        
      5.2.3. Hosted version:

        - ensure both devices(phone and laptop) are connected to the same WiFi
        - on the phone enable USB debugging and wireless debugging from Developer optoins
        - for the first connection, connect the phone to the laptop using a usb cable
        - verify the phone is detected by running "flutter devices", the phone must appear in teh list
        

        - run "adb tcpip <dbPort>" to enable adb over wifi
        - run "adb connect <mobileIp>:<dbPort>" to connect to the phone wirelessly
        - run "adb devices" to verify the wireless connection , the phone must be in the list
        - unplug the usb cable


        - Navigate to `codebase/mobile_app` 
        - Run `flutter run --dart-define=API_BASE_URL=http://<laptopIp>:<dbPort>` to start the mobile application 

