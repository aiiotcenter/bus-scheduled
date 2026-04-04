"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
//===========================================================================================================================
// setup Express route
//===========================================================================================================================
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
//===========================================================================================================================
//importing authentication functions
//===========================================================================================================================
//import enums ----------------------------------------------------------------
const tokenNameEnum_1 = require("../enums/tokenNameEnum");
const userEnum_1 = require("../enums/userEnum");
//import controllers ----------------------------------------------------------
const driverController_1 = require("../controllers/driverController");
const driverController = new driverController_1.DriverController();
const busController_1 = require("../controllers/busController");
const busController = new busController_1.BusController();
const routeController_1 = require("../controllers/routeController");
const routeController = new routeController_1.RouteController();
const stationController_1 = require("../controllers/stationController");
const stationController = new stationController_1.StationController();
const scheduleController_1 = require("../controllers/scheduleController");
const scheduleController = new scheduleController_1.ScheduleController();
const servicePatternController_1 = require("../controllers/servicePatternController");
const servicePatternController = new servicePatternController_1.ServicePatternController();
//import  Middlewares -------------------------------------
const tokenRequired_1 = require("../middlewares/tokenRequired"); // for authentication
const authorizeRole_1 = require("../middlewares/authorizeRole"); // for authorization
//===========================================================================================================================
// Router
//===========================================================================================================================
// Bus   -------------------------------------------------------------------------------------------------------------------------
router.get('/buses/all', (0, tokenRequired_1.accessRequireToken)(tokenNameEnum_1.loginToken), (0, authorizeRole_1.authorizeRole)(userEnum_1.role.admin), busController.fetchAllBuses);
router.get('/buses/operating', (0, tokenRequired_1.accessRequireToken)(tokenNameEnum_1.loginToken), (0, authorizeRole_1.authorizeRole)(userEnum_1.role.admin), busController.fetchOperatingBuses);
router.post('/bus/add', (0, tokenRequired_1.accessRequireToken)(tokenNameEnum_1.loginToken), (0, authorizeRole_1.authorizeRole)(userEnum_1.role.admin), busController.addBus);
router.delete('/bus/remove', (0, tokenRequired_1.accessRequireToken)(tokenNameEnum_1.loginToken), (0, authorizeRole_1.authorizeRole)(userEnum_1.role.admin), busController.removeBus);
router.patch('/bus/update', (0, tokenRequired_1.accessRequireToken)(tokenNameEnum_1.loginToken), (0, authorizeRole_1.authorizeRole)(userEnum_1.role.admin), busController.updateBus);
// Driver  -------------------------------------------------------------------------------------------------------------------------
router.get('/drivers/all', (0, tokenRequired_1.accessRequireToken)(tokenNameEnum_1.loginToken), (0, authorizeRole_1.authorizeRole)(userEnum_1.role.admin), driverController.fetchAllDrivers);
router.get('/drivers/active', (0, tokenRequired_1.accessRequireToken)(tokenNameEnum_1.loginToken), (0, authorizeRole_1.authorizeRole)(userEnum_1.role.admin), driverController.fetchActiveDrivers);
router.post('/driver/add', (0, tokenRequired_1.accessRequireToken)(tokenNameEnum_1.loginToken), (0, authorizeRole_1.authorizeRole)(userEnum_1.role.admin), driverController.addDriver);
router.delete('/driver/remove', (0, tokenRequired_1.accessRequireToken)(tokenNameEnum_1.loginToken), (0, authorizeRole_1.authorizeRole)(userEnum_1.role.admin), driverController.removeDriver);
router.patch('/driver/update', (0, tokenRequired_1.accessRequireToken)(tokenNameEnum_1.loginToken), (0, authorizeRole_1.authorizeRole)(userEnum_1.role.admin), driverController.updateDriver);
// Station  -------------------------------------------------------------------------------------------------------------------------
router.get('/stations/fetch', (0, tokenRequired_1.accessRequireToken)(tokenNameEnum_1.loginToken), (0, authorizeRole_1.authorizeRole)(userEnum_1.role.admin), stationController.fetchAllStations);
router.get('/stations/picker', (0, tokenRequired_1.accessRequireToken)(tokenNameEnum_1.loginToken), (0, authorizeRole_1.authorizeRole)(userEnum_1.role.admin), stationController.fetchStationsForPicker);
router.post('/station/add', (0, tokenRequired_1.accessRequireToken)(tokenNameEnum_1.loginToken), (0, authorizeRole_1.authorizeRole)(userEnum_1.role.admin), stationController.addStation);
router.delete('/station/remove', (0, tokenRequired_1.accessRequireToken)(tokenNameEnum_1.loginToken), (0, authorizeRole_1.authorizeRole)(userEnum_1.role.admin), stationController.removeStation);
router.patch('/station/update', (0, tokenRequired_1.accessRequireToken)(tokenNameEnum_1.loginToken), (0, authorizeRole_1.authorizeRole)(userEnum_1.role.admin), stationController.updateStation);
// Route  -------------------------------------------------------------------------------------------------------------------------
router.post('/route/add', (0, tokenRequired_1.accessRequireToken)(tokenNameEnum_1.loginToken), (0, authorizeRole_1.authorizeRole)(userEnum_1.role.admin), routeController.addRoute);
router.delete('/route/remove', (0, tokenRequired_1.accessRequireToken)(tokenNameEnum_1.loginToken), (0, authorizeRole_1.authorizeRole)(userEnum_1.role.admin), routeController.removeRoute);
router.patch('/route/update', (0, tokenRequired_1.accessRequireToken)(tokenNameEnum_1.loginToken), (0, authorizeRole_1.authorizeRole)(userEnum_1.role.admin), routeController.updateRoute);
// Service Pattern -------------------------------------------------------------------------------------------------------------------------
router.get('/service-pattern/fetch', (0, tokenRequired_1.accessRequireToken)(tokenNameEnum_1.loginToken), (0, authorizeRole_1.authorizeRole)(userEnum_1.role.admin), servicePatternController.getServicePatterns);
router.post('/service-pattern/add', (0, tokenRequired_1.accessRequireToken)(tokenNameEnum_1.loginToken), (0, authorizeRole_1.authorizeRole)(userEnum_1.role.admin), servicePatternController.addServicePattern);
router.delete('/service-pattern/remove', (0, tokenRequired_1.accessRequireToken)(tokenNameEnum_1.loginToken), (0, authorizeRole_1.authorizeRole)(userEnum_1.role.admin), servicePatternController.deleteServicePattern);
router.patch('/service-pattern/update', (0, tokenRequired_1.accessRequireToken)(tokenNameEnum_1.loginToken), (0, authorizeRole_1.authorizeRole)(userEnum_1.role.admin), servicePatternController.updateServicePattern);
// Schedule  -------------------------------------------------------------------------------------------------------------------------
router.get('/schedule/fetch', (0, tokenRequired_1.accessRequireToken)(tokenNameEnum_1.loginToken), (0, authorizeRole_1.authorizeRole)(userEnum_1.role.admin), scheduleController.getSchedule);
router.get('/schedule/today', (0, tokenRequired_1.accessRequireToken)(tokenNameEnum_1.loginToken), (0, authorizeRole_1.authorizeRole)(userEnum_1.role.admin), scheduleController.getTodayUserSchedule);
router.post('/schedule/add', (0, tokenRequired_1.accessRequireToken)(tokenNameEnum_1.loginToken), (0, authorizeRole_1.authorizeRole)(userEnum_1.role.admin), scheduleController.addSchedule);
router.delete('/schedule/remove', (0, tokenRequired_1.accessRequireToken)(tokenNameEnum_1.loginToken), (0, authorizeRole_1.authorizeRole)(userEnum_1.role.admin), scheduleController.removeSchedule);
router.patch('/schedule/update', (0, tokenRequired_1.accessRequireToken)(tokenNameEnum_1.loginToken), (0, authorizeRole_1.authorizeRole)(userEnum_1.role.admin), scheduleController.updateSchedule);
// Scheduled Trip  -------------------------------------------------------------------------------------------------------------------------
router.post('/schedule/trip/upsert', (0, tokenRequired_1.accessRequireToken)(tokenNameEnum_1.loginToken), (0, authorizeRole_1.authorizeRole)(userEnum_1.role.admin), scheduleController.upsertScheduledTrip);
router.delete('/schedule/trip/remove', (0, tokenRequired_1.accessRequireToken)(tokenNameEnum_1.loginToken), (0, authorizeRole_1.authorizeRole)(userEnum_1.role.admin), scheduleController.removeScheduledTrip);
// GET: we don't need (GET) becuase the scheduled trips is viewed in the schedule
// PATCH: we don't need (PATCH) becuase the schedule trips is updated from the schedule using "trips/add" endpoint
//===========================================================================================================================
exports.default = router;
//# sourceMappingURL=adminRoute.js.map