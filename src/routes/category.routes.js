import { Router } from "express";
import * as categoryController from "../controllers/category.controller.js";
import {
  authenticate,
  authorize,
  optionalAuth,
} from "../middlewares/auth.middleware.js";
import { validateObjectId } from "../middlewares/validation.middleware.js";
import { body } from "express-validator";
import { handleValidationErrors } from "../middlewares/validation.middleware.js";

const router = Router();

const validateCategory = [
  body("name")
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Category name is required (max 100 chars)"),
  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Description max 500 characters"),
  body("parentCategory")
    .optional()
    .isMongoId()
    .withMessage("Valid parent category ID required"),
  handleValidationErrors,
];

/**
 * @route   GET /api/categories
 * @desc    Get all categories
 * @access  Public
 */
router.get("/", optionalAuth, categoryController.getCategories);

/**
 * @route   GET /api/categories/:id
 * @desc    Get category by ID
 * @access  Public
 */
router.get("/:id", validateObjectId(), categoryController.getCategoryById);

/**
 * @route   POST /api/categories
 * @desc    Create category (admin only)
 * @access  Private (Admin)
 */
router.post(
  "/",
  authenticate,
  authorize(["admin"]),
  validateCategory,
  categoryController.createCategory
);

/**
 * @route   PUT /api/categories/:id
 * @desc    Update category (admin only)
 * @access  Private (Admin)
 */
router.put(
  "/:id",
  authenticate,
  authorize(["admin"]),
  validateObjectId(),
  validateCategory,
  categoryController.updateCategory
);

/**
 * @route   DELETE /api/categories/:id
 * @desc    Delete category (admin only)
 * @access  Private (Admin)
 */
router.delete(
  "/:id",
  authenticate,
  authorize(["admin"]),
  validateObjectId(),
  categoryController.deleteCategory
);

export default router;
