import { Router } from "express";
import authRoutes from "./auth.routes.js";
import userRoutes from "./user.routes.js";
import categoryRoutes from "./category.routes.js";
import equipmentRoutes from "./equipment.routes.js";
import reservationRoutes from "./reservation.routes.js";
import reviewRoutes from "./review.routes.js";

const router = Router();

// Montowanie routerów
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/categories", categoryRoutes);
router.use("/equipment", equipmentRoutes);
router.use("/reservations", reservationRoutes);
router.use("/reviews", reviewRoutes);

// Health check endpoint
router.get("/health", (req, res) => {
  res.json({
    status: "success",
    message: "API is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

// 404 handler dla API routes
router.use("*", (req, res) => {
  res.status(404).json({
    status: "error",
    message: `Route ${req.originalUrl} not found`,
    availableRoutes: [
      "GET /api/health",
      "POST /api/auth/register",
      "POST /api/auth/login",
      "GET /api/users/me",
      "GET /api/categories",
      "GET /api/equipment",
      "GET /api/reservations",
      "GET /api/reviews",
    ],
  });
});

export default router;
