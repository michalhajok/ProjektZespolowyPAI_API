import { Router } from "express";
import * as reviewController from "../controllers/review.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import {
  validateReview,
  validateObjectId,
  validatePagination,
} from "../middlewares/validation.middleware.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Reviews
 *   description: System ocen i recenzji sprzętu
 */

/**
 * @swagger
 * /api/reviews:
 *   get:
 *     tags: [Reviews]
 *     summary: Pobierz recenzje
 *     parameters:
 *       - in: query
 *         name: equipment
 *         schema:
 *           type: string
 *       - in: query
 *         name: reservation
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         $ref: '#/components/schemas/PaginatedResponse'
 */
router.get("/", validatePagination, reviewController.getReviews);

/**
 * @swagger
 * /api/reviews/{id}:
 *   get:
 *     tags: [Reviews]
 *     summary: Pobierz recenzję po ID
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
router.get("/:id", validateObjectId(), reviewController.getReviewById);

/**
 * @swagger
 * /api/reviews:
 *   post:
 *     tags: [Reviews]
 *     summary: Dodaj recenzję
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       $ref: '#/components/schemas/Review'
 *     responses:
 *       201:
 *         $ref: '#/components/schemas/ApiResponse'
 */
router.post("/", authenticate, validateReview, reviewController.createReview);

/**
 * @swagger
 * /api/reviews/{id}:
 *   put:
 *     tags: [Reviews]
 *     summary: Edytuj recenzję (autor)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       $ref: '#/components/schemas/Review'
 *     responses:
 *       200:
 *         $ref: '#/components/schemas/ApiResponse'
 */
router.put(
  "/:id",
  authenticate,
  validateObjectId(),
  validateReview,
  reviewController.updateReview
);

/**
 * @swagger
 * /api/reviews/{id}:
 *   delete:
 *     tags: [Reviews]
 *     summary: Usuń recenzję (autor/admin)
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
 *         description: Recenzja usunięta
 */
router.delete(
  "/:id",
  authenticate,
  validateObjectId(),
  reviewController.deleteReview
);

export default router;
