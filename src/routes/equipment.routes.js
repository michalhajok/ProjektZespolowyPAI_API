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
 * @swagger
 * tags:
 *   name: Equipment
 *   description: Zarządzanie sprzętem
 */

/**
 * @swagger
 * /api/equipment:
 *   get:
 *     tags: [Equipment]
 *     summary: Pobierz listę sprzętu
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
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
  optionalAuth,
  validatePagination,
  equipmentController.getEquipments
);

/**
 * @swagger
 * /api/equipment/{id}:
 *   get:
 *     tags: [Equipment]
 *     summary: Pobierz sprzęt po ID
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
router.get("/:id", validateObjectId(), equipmentController.getEquipmentById);

/**
 * @swagger
 * /api/equipment:
 *   post:
 *     tags: [Equipment]
 *     summary: Utwórz sprzęt (admin)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       $ref: '#/components/schemas/Equipment'
 *     responses:
 *       201:
 *         $ref: '#/components/schemas/ApiResponse'
 */
router.post(
  "/",
  authenticate,
  authorize(["admin"]),
  validateEquipment,
  equipmentController.createEquipment
);

/**
 * @swagger
 * /api/equipment/{id}:
 *   put:
 *     tags: [Equipment]
 *     summary: Edytuj sprzęt (admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       $ref: '#/components/schemas/Equipment'
 *     responses:
 *       200:
 *         $ref: '#/components/schemas/ApiResponse'
 */
router.put(
  "/:id",
  authenticate,
  authorize(["admin"]),
  validateObjectId(),
  equipmentController.updateEquipment
);

/**
 * @swagger
 * /api/equipment/{id}:
 *   delete:
 *     tags: [Equipment]
 *     summary: Usuń sprzęt (admin)
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
 *         description: Sprzęt usunięty
 */
router.delete(
  "/:id",
  authenticate,
  authorize(["admin"]),
  validateObjectId(),
  equipmentController.deleteEquipment
);

export default router;
