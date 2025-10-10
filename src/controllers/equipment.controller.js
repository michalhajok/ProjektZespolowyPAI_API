import Equipment from "../models/Equipment.js";
import { ok, created, noContent, fail } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const createEquipment = asyncHandler(async (req, res) => {
  const eq = await Equipment.create(req.body);
  return created(res, eq, "Equipment created");
});

export const getEquipments = asyncHandler(async (req, res) => {
  const {
    q,
    category,
    status,
    minRate,
    maxRate,
    sort = "-createdAt",
    limit = 20,
    offset = 0,
  } = req.query;
  console.log(category);

  const filter = {};
  if (category) filter.category = category;
  if (status) filter["availability.status"] = status;
  if (q) filter.$text = { $search: q };
  if (minRate || maxRate) {
    filter["pricing.dailyRate"] = {};
    if (minRate) filter["pricing.dailyRate"].$gte = +minRate;
    if (maxRate) filter["pricing.dailyRate"].$lte = +maxRate;
  }

  const [items, total] = await Promise.all([
    Equipment.find(filter)
      .populate("category", "name _id")
      .skip(+offset)
      .limit(Math.min(+limit, 50))
      .sort(sort.split(",").join(" "))
      .lean(),
    Equipment.countDocuments(filter),
  ]);

  return ok(
    res,
    { items, total, offset: +offset, limit: +limit },
    "Equipment list"
  );
});

export const getEquipmentById = asyncHandler(async (req, res) => {
  const eq = await Equipment.findById(req.params.id)
    .populate("category", "name _id")
    .lean();
  if (!eq) return fail(res, 404, "Equipment not found");
  return ok(res, eq);
});

export const updateEquipment = asyncHandler(async (req, res) => {
  const eq = await Equipment.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  })
    .populate("category", "name _id")
    .lean();
  if (!eq) return fail(res, 404, "Equipment not found");
  return ok(res, eq, "Equipment updated");
});

export const deleteEquipment = asyncHandler(async (req, res) => {
  const deleted = await Equipment.findByIdAndDelete(req.params.id);
  if (!deleted) return fail(res, 404, "Equipment not found");
  return noContent(res);
});
