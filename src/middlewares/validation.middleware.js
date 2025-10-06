import { body, param, query, validationResult } from "express-validator";
import { fail } from "../utils/apiResponse.js";

// Middleware obsługi błędów walidacji
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((error) => ({
      field: error.path || error.param,
      message: error.msg,
      value: error.value,
    }));
    return fail(res, 400, "Validation failed", { errors: formattedErrors });
  }
  next();
};

// Walidacje dla auth
export const validateRegister = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Valid email is required"),
  body("password")
    .isLength({ min: 8 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      "Password must be at least 8 characters with uppercase, lowercase, and number"
    ),
  body("firstName")
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage("First name is required (max 50 chars)"),
  body("lastName")
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage("Last name is required (max 50 chars)"),
  body("phone")
    .optional()
    .matches(/^\+?[1-9]\d{1,14}$/)
    .withMessage("Invalid phone number format"),
  handleValidationErrors,
];

export const validateLogin = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Valid email is required"),
  body("password").notEmpty().withMessage("Password is required"),
  handleValidationErrors,
];

// Walidacje dla equipment
export const validateEquipment = [
  body("name")
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage("Equipment name is required (max 200 chars)"),
  body("category").isMongoId().withMessage("Valid category ID is required"),
  body("availability.quantity")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Quantity must be a non-negative integer"),
  handleValidationErrors,
];

// Walidacje dla reservation
export const validateReservation = [
  body("equipment").isMongoId().withMessage("Valid equipment ID is required"),
  body("dates.startDate")
    .isISO8601()
    .toDate()
    .withMessage("Valid start date is required"),
  body("dates.endDate")
    .isISO8601()
    .toDate()
    .withMessage("Valid end date is required"),

  handleValidationErrors,
];

// Walidacje dla review
export const validateReview = [
  body("equipment").isMongoId().withMessage("Valid equipment ID is required"),
  body("reservation")
    .isMongoId()
    .withMessage("Valid reservation ID is required"),
  body("rating")
    .isInt({ min: 1, max: 5 })
    .withMessage("Rating must be between 1 and 5"),
  body("title")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Title max 100 characters"),
  body("comment")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Comment max 1000 characters"),
  handleValidationErrors,
];

// Walidacje parametrów
export const validateObjectId = (paramName = "id") => [
  param(paramName).isMongoId().withMessage(`Valid ${paramName} is required`),
  handleValidationErrors,
];

// Walidacje query parametrów
export const validatePagination = [
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .toInt()
    .withMessage("Limit must be between 1 and 100"),
  query("offset")
    .optional()
    .isInt({ min: 0 })
    .toInt()
    .withMessage("Offset must be non-negative"),
  handleValidationErrors,
];
