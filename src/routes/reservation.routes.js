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
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               equipment:
 *                 type: string
 *               dates:
 *                 $ref: '#/components/schemas/Reservation/properties/dates'
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
 *     summary: Zaktualizuj rezerwację (daty/ceny/notatki)
 *     description: Zwykła edycja rezerwacji bez zmiany statusu.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               dates:
 *                 $ref: '#/components/schemas/Reservation/properties/dates'
 *               pricing:
 *                 type: object
 *               notes:
 *                 type: object
 *     responses:
 *       200:
 *         $ref: '#/components/schemas/ApiResponse'
 */
router.patch(
    "/:id",
    authenticate,
    validateObjectId(),
    reservationController.updateReservation
);

/**
 * @swagger
 * /api/reservations/{id}/status:
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
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, confirmed, active, completed, cancelled, overdue]
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         $ref: '#/components/schemas/ApiResponse'
 */
router.patch(
    "/:id/status",
    authenticate,
    validateObjectId(),
    // jeżeli chcesz ograniczyć do admina, odkomentuj:
    // authorize("admin"),
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
