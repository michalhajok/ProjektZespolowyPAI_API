import Reservation from "../models/Reservation.js";
import Equipment from "../models/Equipment.js";
import { ok, created, noContent, fail } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose";

// sprawdzenie konfliktu terminów
const hasOverlap = async (equipmentId, startDate, endDate) => {
  const conflict = await Reservation.findOne({
    equipment: equipmentId,
    status: { $in: ["pending", "confirmed", "active"] },
    $or: [
      {
        "dates.startDate": { $lte: endDate },
        "dates.endDate": { $gte: startDate },
      },
    ],
  }).lean();
  return !!conflict;
};

export const createReservation = asyncHandler(async (req, res) => {
  const { user, equipment, dates, pricing, notes } = req.body;
  if (!dates?.startDate || !dates?.endDate)
    return fail(res, 400, "startDate and endDate required");

  const start = new Date(dates.startDate);
  const end = new Date(dates.endDate);
  if (end <= start)
    return fail(res, 400, "endDate must be greater than startDate");

  const eq = await Equipment.findById(equipment).lean();
  if (!eq || !eq.isActive) return fail(res, 404, "Equipment unavailable");

  const overlap = await hasOverlap(equipment, start, end);
  if (overlap) return fail(res, 409, "Reservation overlaps with existing one");

  const doc = await Reservation.create({
    user,
    equipment,
    dates: { startDate: start, endDate: end },
    pricing,
    status: "pending",
    notes: notes || {},
    history: [{ status: "pending", changedBy: user, reason: "created" }],
  });

  return created(res, doc, "Reservation created");
});

export const getReservations = asyncHandler(async (req, res) => {
  const {
    user,
    equipment,
    status,
    from,
    to,
    limit = 20,
    offset = 0,
  } = req.query;
  const filter = {};
  if (user) filter.user = user;
  if (equipment) filter.equipment = equipment;
  if (status) filter.status = status;
  if (from || to) {
    filter["dates.startDate"] = {};
    filter["dates.endDate"] = {};
    if (from) filter["dates.endDate"].$gte = new Date(from);
    if (to) filter["dates.startDate"].$lte = new Date(to);
  }

  const [items, total] = await Promise.all([
    Reservation.find(filter)
      .populate("user", "email firstName lastName _id")
      .populate("equipment", "name _id")
      .skip(+offset)
      .limit(Math.min(+limit, 50))
      .sort({ "dates.startDate": -1 })
      .lean(),
    Reservation.countDocuments(filter),
  ]);

  return ok(
    res,
    { items, total, offset: +offset, limit: +limit },
    "Reservations list"
  );
});

export const getReservationById = asyncHandler(async (req, res) => {
  const doc = await Reservation.findById(req.params.id)
    .populate("user", "email firstName lastName _id")
    .populate("equipment", "name _id")
    .lean();
  if (!doc) return fail(res, 404, "Reservation not found");
  return ok(res, doc);
});

export const updateReservationStatus = asyncHandler(async (req, res) => {
  const { status, reason } = req.body;
  const allowed = [
    "pending",
    "confirmed",
    "active",
    "completed",
    "cancelled",
    "overdue",
  ];
  if (!allowed.includes(status)) return fail(res, 400, "Invalid status");

  const doc = await Reservation.findById(req.params.id);
  if (!doc) return fail(res, 404, "Reservation not found");

  doc.status = status;
  doc.history.push({
    status,
    changedBy: req.userId || doc.user,
    reason: reason || "",
  });
  if (status === "active" && !doc.dates.actualStartDate)
    doc.dates.actualStartDate = new Date();
  if (status === "completed" && !doc.dates.actualEndDate)
    doc.dates.actualEndDate = new Date();

  await doc.save();
  return ok(res, doc.toObject(), "Reservation status updated");
});

export const updateReservation = asyncHandler(async (req, res) => {
  // ograniczamy edycję krytycznych pól
  const allowed = ["dates", "pricing", "notes"];
  const payload = Object.fromEntries(
    Object.entries(req.body).filter(([k]) => allowed.includes(k))
  );

  // walidacja zakresu dat podczas edycji
  if (payload.dates?.startDate && payload.dates?.endDate) {
    const s = new Date(payload.dates.startDate);
    const e = new Date(payload.dates.endDate);
    if (e <= s) return fail(res, 400, "endDate must be greater than startDate");
  }

  const doc = await Reservation.findByIdAndUpdate(req.params.id, payload, {
    new: true,
    runValidators: true,
  })
    .populate("user", "email firstName lastName _id")
    .populate("equipment", "name _id");

  if (!doc) return fail(res, 404, "Reservation not found");
  return ok(res, doc.toObject(), "Reservation updated");
});

export const deleteReservation = asyncHandler(async (req, res) => {
  const deleted = await Reservation.findByIdAndDelete(req.params.id);
  if (!deleted) return fail(res, 404, "Reservation not found");
  return noContent(res);
});
