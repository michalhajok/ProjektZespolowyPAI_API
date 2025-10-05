import { Router } from "express";
import * as reservationController from "../controllers/reservation.controller.js";
import {
  authenticate,
  authorize,
  checkResourceOwnership,
} from "../middlewares/auth.middleware.js";
import {
  validateReservation,
  validateObjectId,
  validatePagination,
} from "../middlewares/validation.middleware.js";
import { body } from "express-validator";
import { handleValidationErrors } from "../middlewares/validation.middleware.js";
import Reservation from "../models/Reservation.js";

const router = Router();

const validateStatusUpdate = [
  body("status")
    .isIn([
      "pending",
      "confirmed",
      "active",
      "completed",
      "cancelled",
      "overdue",
    ])
    .withMessage("Invalid status"),
  body("reason")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Reason max 500 characters"),
  handleValidationErrors,
];

/**
 * @route   GET /api/reservations
 * @desc    Get reservations (filtered by user role)
 * @access  Private
 */
router.get(
  "/",
  authenticate,
  validatePagination,
  (req, res, next) => {
    // Zwykli użytkownicy widzą tylko swoje rezerwacje
    if (req.userRole !== "admin") {
      req.query.user = req.userId;
    }
    next();
  },
  reservationController.getReservations
);

/**
 * @route   GET /api/reservations/:id
 * @desc    Get reservation by ID (owner or admin)
 * @access  Private
 */
router.get(
  "/:id",
  authenticate,
  validateObjectId(),
  checkResourceOwnership(Reservation),
  reservationController.getReservationById
);

/**
 * @route   POST /api/reservations
 * @desc    Create reservation
 * @access  Private
 */
router.post(
  "/",
  authenticate,
  validateReservation,
  (req, res, next) => {
    // Automatycznie przypisz zalogowanego użytkownika
    req.body.user = req.userId;
    next();
  },
  reservationController.createReservation
);

/**
 * @route   PUT /api/reservations/:id
 * @desc    Update reservation (owner or admin)
 * @access  Private
 */
router.put(
  "/:id",
  authenticate,
  validateObjectId(),
  checkResourceOwnership(Reservation),
  reservationController.updateReservation
);

/**
 * @route   PATCH /api/reservations/:id/status
 * @desc    Update reservation status (admin only)
 * @access  Private (Admin)
 */
router.patch(
  "/:id/status",
  authenticate,
  authorize(["admin"]),
  validateObjectId(),
  validateStatusUpdate,
  reservationController.updateReservationStatus
);

/**
 * @route   DELETE /api/reservations/:id
 * @desc    Delete reservation (owner or admin)
 * @access  Private
 */
router.delete(
  "/:id",
  authenticate,
  validateObjectId(),
  checkResourceOwnership(Reservation),
  reservationController.deleteReservation
);

export default router;
