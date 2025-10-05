import { Router } from "express";
import * as reviewController from "../controllers/review.controller.js";
import {
  authenticate,
  authorize,
  checkResourceOwnership,
  optionalAuth,
} from "../middlewares/auth.middleware.js";
import {
  validateReview,
  validateObjectId,
  validatePagination,
} from "../middlewares/validation.middleware.js";
import Review from "../models/Review.js";

const router = Router();

/**
 * @route   GET /api/reviews
 * @desc    Get reviews with filters
 * @access  Public
 */
router.get("/", optionalAuth, validatePagination, reviewController.getReviews);

/**
 * @route   GET /api/reviews/:id
 * @desc    Get review by ID
 * @access  Public
 */
router.get("/:id", validateObjectId(), reviewController.getReviewById);

/**
 * @route   POST /api/reviews
 * @desc    Create review (after completed reservation)
 * @access  Private
 */
router.post(
  "/",
  authenticate,
  validateReview,
  (req, res, next) => {
    // Automatycznie przypisz zalogowanego użytkownika
    req.body.user = req.userId;
    next();
  },
  reviewController.createReview
);

/**
 * @route   PUT /api/reviews/:id
 * @desc    Update review (owner or admin)
 * @access  Private
 */
router.put(
  "/:id",
  authenticate,
  validateObjectId(),
  checkResourceOwnership(Review),
  reviewController.updateReview
);

/**
 * @route   DELETE /api/reviews/:id
 * @desc    Delete review (owner or admin)
 * @access  Private
 */
router.delete(
  "/:id",
  authenticate,
  validateObjectId(),
  checkResourceOwnership(Review),
  reviewController.deleteReview
);

export default router;
