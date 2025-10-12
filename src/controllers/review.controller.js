// src/controllers/review.controller.js
import Review from "../models/Review.js";
import Reservation from "../models/Reservation.js";
import { ok, created, noContent, fail } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * GET /api/reviews
 * Query:
 *  - reservation?: string
 *  - equipment?: string
 *  - user?: string
 *  - sort?: string (np. "-createdAt" lub "rating,-createdAt")
 *  - limit?: number (domyślnie 20, max 50)
 *  - offset?: number
 */
export const getReviews = asyncHandler(async (req, res) => {
    const {
        reservation,
        equipment,
        user,
        sort = "-createdAt",
        limit = 20,
        offset = 0,
    } = req.query;

    const filter = {};
    if (reservation) filter.reservation = reservation;
    if (equipment) filter.equipment = equipment;
    if (user) filter.user = user;

    const [items, total] = await Promise.all([
        Review.find(filter)
            .populate("user", "firstName lastName email _id")
            .populate("equipment", "name _id")
            .populate("reservation", "_id status")
            .skip(+offset)
            .limit(Math.min(+limit, 50))
            .sort(String(sort).split(",").join(" "))
            .lean(),
        Review.countDocuments(filter),
    ]);

    return ok(
        res,
        { items, total, offset: +offset, limit: Math.min(+limit, 50) },
        "Lista recenzji"
    );
});

/**
 * GET /api/reviews/:id
 */
export const getReviewById = asyncHandler(async (req, res) => {
    const doc = await Review.findById(req.params.id)
        .populate("user", "firstName lastName email _id")
        .populate("equipment", "name _id")
        .populate("reservation", "_id status")
        .lean();

    if (!doc) return fail(res, 404, "Nie znaleziono recenzji");
    return ok(res, doc, "Szczegóły recenzji");
});

/**
 * POST /api/reviews
 * Body: { reservation, rating, title?, comment? }
 * Zasady:
 *  - user z req.userId (po authenticate)
 *  - equipment z rezerwacji
 *  - rezerwacja musi należeć do usera
 *  - status rezerwacji: confirmed/active/completed
 *  - jedna recenzja na rezerwację
 */
export const createReview = asyncHandler(async (req, res) => {
    const { reservation, rating, title, comment } = req.body;

    if (!reservation || !rating) {
        return fail(res, 400, "Pola 'reservation' i 'rating' są wymagane");
    }

    const r = await Reservation.findById(reservation).lean();
    if (!r) return fail(res, 404, "Nie znaleziono rezerwacji");

    // weryfikacja właściciela
    if (String(r.user) !== String(req.userId)) {
        return fail(res, 403, "Możesz ocenić tylko własną rezerwację");
    }

    // dopuszczone statusy do recenzji
    const allowedForReview = ["confirmed", "active", "completed"];
    if (!allowedForReview.includes(r.status)) {
        return fail(
            res,
            409,
            "Rezerwacja musi być potwierdzona, aktywna lub zakończona"
        );
    }

    // jedna recenzja na rezerwację
    const exists = await Review.findOne({ reservation }).lean();
    if (exists) return fail(res, 409, "Recenzja dla tej rezerwacji już istnieje");

    const doc = await Review.create({
        user: req.userId,
        equipment: r.equipment,
        reservation,
        rating,
        title: (title || "").trim(),
        comment: (comment || "").trim(),
    });

    return created(res, doc, "Recenzja utworzona");
});

/**
 * PUT /api/reviews/:id
 * Body: { rating?, title?, comment? }
 * Uprawnienia: autor recenzji lub admin
 */
export const updateReview = asyncHandler(async (req, res) => {
    const allowed = ["rating", "title", "comment"];
    const payload = Object.fromEntries(
        Object.entries(req.body).filter(([k]) => allowed.includes(k))
    );

    const current = await Review.findById(req.params.id);
    if (!current) return fail(res, 404, "Nie znaleziono recenzji");

    const isOwner = String(current.user) === String(req.userId);
    const isAdmin = req.userRole === "admin";
    if (!isOwner && !isAdmin) return fail(res, 403, "Brak uprawnień");

    const doc = await Review.findByIdAndUpdate(req.params.id, payload, {
        new: true,
        runValidators: true,
    })
        .populate("user", "firstName lastName email _id")
        .populate("equipment", "name _id")
        .populate("reservation", "_id status")
        .lean();

    return ok(res, doc, "Recenzja zaktualizowana");
});

/**
 * DELETE /api/reviews/:id
 * Uprawnienia: autor recenzji lub admin
 */
export const deleteReview = asyncHandler(async (req, res) => {
    const doc = await Review.findById(req.params.id);
    if (!doc) return fail(res, 404, "Nie znaleziono recenzji");

    const isOwner = String(doc.user) === String(req.userId);
    const isAdmin = req.userRole === "admin";
    if (!isOwner && !isAdmin) return fail(res, 403, "Brak uprawnień");

    await doc.deleteOne();
    return noContent(res);
});
