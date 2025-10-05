import { Router } from "express";
import * as authController from "../controllers/auth.controller.js";
import {
  validateRegister,
  validateLogin,
} from "../middlewares/validation.middleware.js";

const router = Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register new user
 * @access  Public
 */
router.post("/register", validateRegister, authController.register);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post("/login", validateLogin, authController.login);

export default router;
