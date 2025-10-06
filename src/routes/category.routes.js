import { Router } from "express";
import * as categoryController from "../controllers/category.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import { validateObjectId } from "../middlewares/validation.middleware.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: Zarządzanie kategoriami sprzętu
 */

/**
 * @swagger
 * /api/categories:
 *   get:
 *     tags: [Categories]
 *     summary: Pobierz wszystkie kategorie
 *     responses:
 *       200:
 *         $ref: '#/components/schemas/PaginatedResponse'
 */
router.get("/", categoryController.getCategories);

/**
 * @swagger
 * /api/categories/{id}:
 *   get:
 *     tags: [Categories]
 *     summary: Pobierz kategorię po ID
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
router.get("/:id", validateObjectId(), categoryController.getCategoryById);

/**
 * @swagger
 * /api/categories:
 *   post:
 *     tags: [Categories]
 *     summary: Utwórz kategorię (admin)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       $ref: '#/components/schemas/Category'
 *     responses:
 *       201:
 *         $ref: '#/components/schemas/ApiResponse'
 */
router.post(
  "/",
  authenticate,
  authorize(["admin"]),
  categoryController.createCategory
);

/**
 * @swagger
 * /api/categories/{id}:
 *   put:
 *     tags: [Categories]
 *     summary: Edytuj kategorię (admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       $ref: '#/components/schemas/Category'
 *     responses:
 *       200:
 *         $ref: '#/components/schemas/ApiResponse'
 */
router.put(
  "/:id",
  authenticate,
  authorize(["admin"]),
  validateObjectId(),
  categoryController.updateCategory
);

/**
 * @swagger
 * /api/categories/{id}:
 *   delete:
 *     tags: [Categories]
 *     summary: Usuń kategorię (admin)
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
 *         description: Kategoria usunięta
 */
router.delete(
  "/:id",
  authenticate,
  authorize(["admin"]),
  validateObjectId(),
  categoryController.deleteCategory
);

export default router;
