import Review from "../models/Review.js";
import Reservation from "../models/Reservation.js";
import { ok, created, noContent, fail } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const createReview = asyncHandler(async (req, res) => {
  const { user, equipment, reservation, rating, title, comment, aspects } =
    req.body;

  // weryfikacja: recenzja tylko po rezerwacji zakończonej
  const r = await Reservation.findOne({
    _id: reservation,
    user,
    equipment,
    status: "completed",
  }).lean();
  if (!r)
    return fail(
      res,
      400,
      "Review allowed only for completed reservations by the same user"
    );

  const review = await Review.create({
    user,
    equipment,
    reservation,
    rating,
    title,
    comment,
  });
  return created(res, review, "Review created");
});

export const getReviews = asyncHandler(async (req, res) => {
  const {
    equipment,
    user,
    sort = "-createdAt",
    limit = 20,
    offset = 0,
  } = req.query;
  const filter = {};
  if (equipment) filter.equipment = equipment;
  if (user) filter.user = user;

  console.log(filter);

  const [items, total] = await Promise.all([
    Review.find(filter)
      .populate("user", "firstName lastName _id")
      .populate("equipment", "name _id")
      .skip(+offset)
      .limit(Math.min(+limit, 50))
      .sort(sort.split(",").join(" "))
      .lean(),
    Review.countDocuments(filter),
  ]);

  console.log(items);

  return ok(
    res,
    { items, total, offset: +offset, limit: +limit },
    "Reviews list"
  );
});

export const getReviewById = asyncHandler(async (req, res) => {
  const doc = await Review.findById(req.params.id)
    .populate("user", "firstName lastName _id")
    .populate("equipment", "name _id")
    .lean();
  if (!doc) return fail(res, 404, "Review not found");
  return ok(res, doc);
});

export const updateReview = asyncHandler(async (req, res) => {
  const allowed = ["rating", "title", "comment", "aspects"];
  const payload = Object.fromEntries(
    Object.entries(req.body).filter(([k]) => allowed.includes(k))
  );
  const doc = await Review.findByIdAndUpdate(req.params.id, payload, {
    new: true,
    runValidators: true,
  })
    .populate("user", "firstName lastName _id")
    .populate("equipment", "name _id")
    .lean();
  if (!doc) return fail(res, 404, "Review not found");
  return ok(res, doc, "Review updated");
});

export const deleteReview = asyncHandler(async (req, res) => {
  const deleted = await Review.findByIdAndDelete(req.params.id);
  if (!deleted) return fail(res, 404, "Review not found");
  return noContent(res);
});
