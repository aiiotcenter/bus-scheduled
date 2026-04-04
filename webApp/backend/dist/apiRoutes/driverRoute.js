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
//import controllers ----------------------------------------------------------
const driverController_1 = require("../controllers/driverController");
const driverController = new driverController_1.DriverController();
const userController_1 = require("../controllers/userController");
const userController = new userController_1.UserController();
//import enums ----------------------------------------------------------------
const tokenNameEnum_1 = require("../enums/tokenNameEnum");
const userEnum_1 = require("../enums/userEnum");
//import  Middlewares -------------------------------------
const tokenRequired_1 = require("../middlewares/tokenRequired"); // for authentication
const authorizeRole_1 = require("../middlewares/authorizeRole"); // for authorization
//===========================================================================================================================
// Router
//===========================================================================================================================
router.get('/profile', (0, tokenRequired_1.accessRequireToken)(tokenNameEnum_1.loginToken), (0, authorizeRole_1.authorizeRole)(userEnum_1.role.driver), driverController.fetchDriverProfile);
router.patch('/update', (0, tokenRequired_1.accessRequireToken)(tokenNameEnum_1.loginToken), (0, authorizeRole_1.authorizeRole)(userEnum_1.role.driver), driverController.updateDriverData);
// Fetch driver schedule 
router.get('/schedule/fetch', (0, tokenRequired_1.accessRequireToken)(tokenNameEnum_1.loginToken), driverController.fetchDriverSchedule);
//===========================================================================================================================
exports.default = router;
//# sourceMappingURL=driverRoute.js.map