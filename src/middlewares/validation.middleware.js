// src/middlewares/validation.middleware.js
import { body, param, query, validationResult } from "express-validator";
import { fail } from "../utils/apiResponse.js";

// ---------- Uniwersalny finisher ----------
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

// ---------- Auth ----------
export const validateRegister = [
    body("email").isEmail().normalizeEmail().withMessage("Valid email is required"),
    body("password")
        .isLength({ min: 8 })
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage("Password must be at least 8 characters with uppercase, lowercase, and number"),
    body("firstName").trim().isLength({ min: 1, max: 50 }).withMessage("First name is required (max 50 chars)"),
    body("lastName").trim().isLength({ min: 1, max: 50 }).withMessage("Last name is required (max 50 chars)"),
    body("phone").optional().matches(/^\+?[1-9]\d{1,14}$/).withMessage("Invalid phone number format"),
    handleValidationErrors,
];

export const validateLogin = [
    body("email").isEmail().normalizeEmail().withMessage("Valid email is required"),
    body("password").notEmpty().withMessage("Password is required"),
    handleValidationErrors,
];

// ---------- Equipment ----------
export const validateEquipment = [
    body("name").trim().isLength({ min: 1, max: 200 }).withMessage("Equipment name is required (max 200 chars)"),
    body("category").isMongoId().withMessage("Valid category ID is required"),
    body("availability.quantity").optional().isInt({ min: 0 }).withMessage("Quantity must be a non-negative integer"),
    handleValidationErrors,
];

// ---------- Reservation ----------
export const validateReservation = [
    body("equipment").isMongoId().withMessage("Valid equipment ID is required"),
    body("dates.startDate").isISO8601().toDate().withMessage("Valid start date is required"),
    body("dates.endDate").isISO8601().toDate().withMessage("Valid end date is required"),
    handleValidationErrors,
];

// ---------- Review ----------
// POST /reviews  -> tylko reservation + rating (title/comment opcjonalnie)
//  (user pobieramy z req.userId, equipment z rezerwacji)
export const validateReviewCreate = [
    body("reservation").exists().withMessage("reservation is required").bail().isMongoId().withMessage("Valid reservation ID is required"),
    body("rating").exists().withMessage("rating is required").bail().isInt({ min: 1, max: 5 }).withMessage("Rating must be between 1 and 5"),
    body("title").optional().trim().isLength({ max: 100 }).withMessage("Title max 100 characters"),
    body("comment").optional().trim().isLength({ max: 1000 }).withMessage("Comment max 1000 characters"),
    handleValidationErrors,
];

// PUT /reviews/:id -> edycja pól użytkownika
export const validateReviewUpdate = [
    body("rating").optional().isInt({ min: 1, max: 5 }).withMessage("Rating must be between 1 and 5"),
    body("title").optional().trim().isLength({ max: 100 }).withMessage("Title max 100 characters"),
    body("comment").optional().trim().isLength({ max: 1000 }).withMessage("Comment max 1000 characters"),
    handleValidationErrors,
];

// (Jeśli gdzieś używałeś starego validateReview w POST, możesz tymczasowo zostawić alias)
// export const validateReview = validateReviewCreate;

// ---------- Param ObjectId ----------
export const validateObjectId = (paramName = "id") => [
    param(paramName).isMongoId().withMessage(`Valid ${paramName} is required`),
    handleValidationErrors,
];

// ---------- Query: pagination ----------
export const validatePagination = [
    query("limit").optional().isInt({ min: 1, max: 100 }).toInt().withMessage("Limit must be between 1 and 100"),
    query("offset").optional().isInt({ min: 0 }).toInt().withMessage("Offset must be non-negative"),
    handleValidationErrors,
];
