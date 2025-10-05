import { Router } from "express";
import * as userController from "../controllers/user.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import {
  validateObjectId,
  validatePagination,
} from "../middlewares/validation.middleware.js";

const router = Router();

/**
 * @route   GET /api/users/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get("/me", authenticate, userController.getMe);

/**
 * @route   GET /api/users
 * @desc    Get all users (admin only)
 * @access  Private (Admin)
 */
router.get(
  "/",
  authenticate,
  authorize(["admin"]),
  validatePagination,
  userController.getUsers
);

/**
 * @route   GET /api/users/:id
 * @desc    Get user by ID (admin only)
 * @access  Private (Admin)
 */
router.get(
  "/:id",
  authenticate,
  authorize(["admin"]),
  validateObjectId(),
  userController.getUserById
);

/**
 * @route   PUT /api/users/:id
 * @desc    Update user (admin only)
 * @access  Private (Admin)
 */
router.put(
  "/:id",
  authenticate,
  authorize(["admin"]),
  validateObjectId(),
  userController.updateUser
);

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete user (admin only)
 * @access  Private (Admin)
 */
router.delete(
  "/:id",
  authenticate,
  authorize(["admin"]),
  validateObjectId(),
  userController.deleteUser
);

export default router;
