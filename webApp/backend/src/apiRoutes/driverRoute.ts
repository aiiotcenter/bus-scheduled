//===========================================================================================================================
// setup Express route
//===========================================================================================================================
import express, { Router } from "express";

const router: Router = express.Router();

//===========================================================================================================================
//importing authentication functions
//===========================================================================================================================

//import controllers ----------------------------------------------------------

import { DriverController } from "../controllers/driverController";
const driverController = new DriverController();

import { UserController } from "../controllers/userController";
const userController = new UserController();


//import enums ----------------------------------------------------------------
import { loginToken } from '../enums/tokenNameEnum';

import { role } from '../enums/userEnum';

//import  Middlewares -------------------------------------
import { accessRequireToken } from '../middlewares/tokenRequired'; // for authentication

import { authorizeRole } from '../middlewares/authorizeRole'; // for authorization
//===========================================================================================================================
// Router
//===========================================================================================================================



router.get('/profile', accessRequireToken(loginToken), authorizeRole(role.driver), driverController.fetchDriverProfile);

router.patch('/update',  accessRequireToken(loginToken), authorizeRole(role.driver), driverController.updateDriverData);

// Fetch driver schedule 
router.get('/schedule/fetch', accessRequireToken(loginToken), driverController.fetchDriverSchedule);

//===========================================================================================================================
export default router;