//===========================================================================================================================
// setup Express route
//===========================================================================================================================
import express, { Router } from "express";

const router: Router = express.Router();

//===========================================================================================================================
//importing authentication functions
//===========================================================================================================================

//import enums ----------------------------------------------------------------
import { loginToken } from '../enums/tokenNameEnum';

import {role} from '../enums/userEnum';

//import controllers ----------------------------------------------------------

import { DriverController } from "../controllers/driverController";
const driverController = new DriverController();


import {BusController} from "../controllers/busController";
const busController = new BusController();


import { RouteController } from "../controllers/routeController";
const routeController = new RouteController();

import { StationController } from "../controllers/stationController";
const stationController = new StationController();



import { ScheduleController } from '../controllers/scheduleController';
const scheduleController = new ScheduleController() ; 

import { ServicePatternController } from "../controllers/servicePatternController";
const servicePatternController = new ServicePatternController();



//import  Middlewares -------------------------------------
import { accessRequireToken } from '../middlewares/tokenRequired'; // for authentication

import  {authorizeRole} from '../middlewares/authorizeRole'; // for authorization


//===========================================================================================================================
// Router
//===========================================================================================================================

// Bus   -------------------------------------------------------------------------------------------------------------------------

router.get('/buses/all', accessRequireToken(loginToken), authorizeRole(role.admin), busController.fetchAllBuses);
router.get('/buses/operating', accessRequireToken(loginToken), authorizeRole(role.admin), busController.fetchOperatingBuses);

router.post('/bus/add', accessRequireToken(loginToken), authorizeRole(role.admin), busController.addBus);

router.delete('/bus/remove', accessRequireToken(loginToken), authorizeRole(role.admin), busController.removeBus);

router.patch('/bus/update', accessRequireToken(loginToken), authorizeRole(role.admin), busController.updateBus);



// Driver  -------------------------------------------------------------------------------------------------------------------------

router.get('/drivers/all', accessRequireToken(loginToken), authorizeRole(role.admin), driverController.fetchAllDrivers);
router.get('/drivers/active', accessRequireToken(loginToken), authorizeRole(role.admin), driverController.fetchActiveDrivers);

router.post('/driver/add', accessRequireToken(loginToken), authorizeRole(role.admin), driverController.addDriver);

router.delete('/driver/remove', accessRequireToken(loginToken), authorizeRole(role.admin), driverController.removeDriver);

router.patch('/driver/update',  accessRequireToken(loginToken), authorizeRole(role.admin), driverController.updateDriver);



// Station  -------------------------------------------------------------------------------------------------------------------------

router.get('/stations/fetch', accessRequireToken(loginToken), authorizeRole(role.admin), stationController.fetchAllStations);

router.get('/stations/picker', accessRequireToken(loginToken), authorizeRole(role.admin), stationController.fetchStationsForPicker);

router.post('/station/add', accessRequireToken(loginToken), authorizeRole(role.admin), stationController.addStation);

router.delete('/station/remove', accessRequireToken(loginToken), authorizeRole(role.admin), stationController.removeStation);

router.patch('/station/update',  accessRequireToken(loginToken), authorizeRole(role.admin), stationController.updateStation);


// Route  -------------------------------------------------------------------------------------------------------------------------

router.post('/route/add', accessRequireToken(loginToken), authorizeRole(role.admin), routeController.addRoute);

router.delete('/route/remove', accessRequireToken(loginToken), authorizeRole(role.admin), routeController.removeRoute);

router.patch('/route/update',  accessRequireToken(loginToken), authorizeRole(role.admin), routeController.updateRoute);



// Service Pattern -------------------------------------------------------------------------------------------------------------------------

router.get('/service-pattern/fetch', accessRequireToken(loginToken), authorizeRole(role.admin), servicePatternController.getServicePatterns);

router.post('/service-pattern/add', accessRequireToken(loginToken), authorizeRole(role.admin), servicePatternController.addServicePattern);

router.delete('/service-pattern/remove', accessRequireToken(loginToken), authorizeRole(role.admin), servicePatternController.deleteServicePattern);

router.patch('/service-pattern/update', accessRequireToken(loginToken), authorizeRole(role.admin), servicePatternController.updateServicePattern);



// Schedule  -------------------------------------------------------------------------------------------------------------------------

router.get('/schedule/fetch', accessRequireToken(loginToken), authorizeRole(role.admin), scheduleController.getSchedule);

router.get('/schedule/today', accessRequireToken(loginToken), authorizeRole(role.admin), scheduleController.getTodayUserSchedule);

router.post('/schedule/add', accessRequireToken(loginToken), authorizeRole(role.admin), scheduleController.addSchedule);

router.delete('/schedule/remove', accessRequireToken(loginToken), authorizeRole(role.admin), scheduleController.removeSchedule);

router.patch('/schedule/update', accessRequireToken(loginToken), authorizeRole(role.admin), scheduleController.updateSchedule);


// Scheduled Trip  -------------------------------------------------------------------------------------------------------------------------

router.post('/schedule/trip/upsert', accessRequireToken(loginToken), authorizeRole(role.admin), scheduleController.upsertScheduledTrip);
router.delete('/schedule/trip/remove', accessRequireToken(loginToken), authorizeRole(role.admin), scheduleController.removeScheduledTrip);

// GET: we don't need (GET) becuase the scheduled trips is viewed in the schedule
// PATCH: we don't need (PATCH) becuase the schedule trips is updated from the schedule using "trips/add" endpoint



//===========================================================================================================================
export default router;