import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { fail } from "../utils/apiResponse.js";

const JWT_SECRET = process.env.JWT_SECRET || "change_me_in_prod";

// Middleware weryfikacji JWT i dołączania użytkownika do req
export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return fail(res, 401, "Authentication required");
    }

    const token = authHeader.split(" ")[1]; // <- poprawka: wybieramy token, a nie tablicę
    const payload = jwt.verify(token, JWT_SECRET);

    const user = await User.findById(payload.sub).lean();
    if (!user || !user.isActive) {
      return fail(res, 401, "User not found or inactive");
    }

    req.user = user;
    req.userId = user._id.toString();
    req.userRole = user.role;

    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return fail(res, 401, "Invalid token");
    }
    if (error.name === "TokenExpiredError") {
      return fail(res, 401, "Token expired");
    }
    return fail(res, 500, "Authentication error");
  }
};

// Middleware RBAC - sprawdza czy użytkownik ma wymaganą rolę
export const authorize = (allowedRoles = []) => {
  return (req, res, next) => {
    console.log(req.user);

    if (!req.user) {
      return fail(res, 401, "Authentication required");
    }

    // Jeśli nie określono ról, każdy zalogowany użytkownik ma dostęp
    if (allowedRoles.length === 0) {
      return next();
    }

    // Sprawdzamy czy rola użytkownika jest na liście dozwolonych
    if (!allowedRoles.includes(req.userRole)) {
      return fail(res, 403, "Insufficient permissions");
    }

    next();
  };
};

// Middleware sprawdzający czy użytkownik może edytować własne zasoby
export const authorizeOwnerOrAdmin = (userIdField = "user") => {
  return async (req, res, next) => {
    console.log(req.user);

    if (!req.user) {
      return fail(res, 401, "Authentication required");
    }

    // Admin może edytować wszystko
    if (req.userRole === "admin") {
      return next();
    }

    // Sprawdzamy czy użytkownik jest właścicielem zasobu
    const resourceUserId = req.body[userIdField] || req.params[userIdField];
    if (resourceUserId && resourceUserId.toString() === req.userId) {
      return next();
    }

    return fail(res, 403, "You can only modify your own resources");
  };
};

// Middleware sprawdzający dostępność zasobu dla użytkownika
export const checkResourceOwnership = (Model, userIdField = "user") => {
  return async (req, res, next) => {
    try {
      const resourceId = req.params.id;
      const resource = await Model.findById(resourceId).lean();

      if (!resource) {
        return fail(res, 404, "Resource not found");
      }

      // Admin ma dostęp do wszystkiego
      if (req.userRole === "admin") {
        req.resource = resource;
        return next();
      }

      // Sprawdzamy czy użytkownik jest właścicielem
      if (resource[userIdField].toString() !== req.userId) {
        return fail(res, 403, "Access denied to this resource");
      }

      req.resource = resource;
      next();
    } catch (error) {
      return fail(res, 500, "Error checking resource ownership");
    }
  };
};

// Opcjonalne middleware - użytkownik zalogowany (nie wymaga)
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ");
      const payload = jwt.verify(token, JWT_SECRET);
      const user = await User.findById(payload.sub).lean();

      if (user && user.isActive) {
        req.user = user;
        req.userId = user._id.toString();
        req.userRole = user.role;
      }
    }
    next();
  } catch (error) {
    // Ignorujemy błędy - auth jest opcjonalne
    next();
  }
};
