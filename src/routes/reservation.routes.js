import { Router } from "express";
import * as reservationController from "../controllers/reservation.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import {
  validateReservation,
  validateObjectId,
  validatePagination,
} from "../middlewares/validation.middleware.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Reservations
 *   description: System rezerwacji sprzętu
 */

/**
 * @swagger
 * /api/reservations:
 *   get:
 *     tags: [Reservations]
 *     summary: Pobierz rezerwacje
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         $ref: '#/components/schemas/PaginatedResponse'
 */
router.get(
  "/",
  authenticate,
  validatePagination,
  reservationController.getReservations
);

/**
 * @swagger
 * /api/reservations/{id}:
 *   get:
 *     tags: [Reservations]
 *     summary: Pobierz rezerwację po ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         $ref: '#/components/schemas/ApiResponse'
 */
router.get(
  "/:id",
  authenticate,
  validateObjectId(),
  reservationController.getReservationById
);

/**
 * @swagger
 * /api/reservations:
 *   post:
 *     tags: [Reservations]
 *     summary: Utwórz rezerwację
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       type: object
 *       properties:
 *         equipment:
 *           type: string
 *         dates:
 *           $ref: '#/components/schemas/Reservation/properties/dates'
 *     responses:
 *       201:
 *         $ref: '#/components/schemas/ApiResponse'
 */
router.post(
  "/",
  authenticate,
  validateReservation,
  reservationController.createReservation
);

/**
 * @swagger
 * /api/reservations/{id}:
 *   patch:
 *     tags: [Reservations]
 *     summary: Zmień status rezerwacji
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       type: object
 *       required:
 *         - status
 *       properties:
 *         status:
 *           type: string
 *         reason:
 *           type: string
 *     responses:
 *       200:
 *         $ref: '#/components/schemas/ApiResponse'
 */
router.patch(
  "/:id",
  authenticate,
  validateObjectId(),
  reservationController.updateReservationStatus
);

/**
 * @swagger
 * /api/reservations/{id}:
 *   delete:
 *     tags: [Reservations]
 *     summary: Usuń rezerwację
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Rezerwacja usunięta
 */
router.delete(
  "/:id",
  authenticate,
  validateObjectId(),
  reservationController.deleteReservation
);

export default router;
