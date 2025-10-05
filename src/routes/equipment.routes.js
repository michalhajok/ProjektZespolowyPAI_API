import { Router } from "express";
import * as equipmentController from "../controllers/equipment.controller.js";
import {
  authenticate,
  authorize,
  optionalAuth,
} from "../middlewares/auth.middleware.js";
import {
  validateEquipment,
  validateObjectId,
  validatePagination,
} from "../middlewares/validation.middleware.js";

const router = Router();

/**
 * @route   GET /api/equipment
 * @desc    Get all equipment with filters
 * @access  Public
 */
router.get(
  "/",
  optionalAuth,
  validatePagination,
  equipmentController.getEquipments
);

/**
 * @route   GET /api/equipment/:id
 * @desc    Get equipment by ID
 * @access  Public
 */
router.get("/:id", validateObjectId(), equipmentController.getEquipmentById);

/**
 * @route   POST /api/equipment
 * @desc    Create equipment (admin only)
 * @access  Private (Admin)
 */
router.post(
  "/",
  authenticate,
  authorize(["admin"]),
  validateEquipment,
  equipmentController.createEquipment
);

/**
 * @route   PUT /api/equipment/:id
 * @desc    Update equipment (admin only)
 * @access  Private (Admin)
 */
router.put(
  "/:id",
  authenticate,
  authorize(["admin"]),
  validateObjectId(),
  equipmentController.updateEquipment
);

/**
 * @route   DELETE /api/equipment/:id
 * @desc    Delete equipment (admin only)
 * @access  Private (Admin)
 */
router.delete(
  "/:id",
  authenticate,
  authorize(["admin"]),
  validateObjectId(),
  equipmentController.deleteEquipment
);

export default router;
