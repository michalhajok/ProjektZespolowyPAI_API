import User from "../models/User.js";
import { ok, created, noContent, fail } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getMe = asyncHandler(async (req, res) => {
  const me = await User.findById(req.userId).lean();
  if (!me) return fail(res, 404, "User not found");
  return ok(res, me);
});

export const getUsers = asyncHandler(async (req, res) => {
  const { q, role, isActive, limit = 20, offset = 0 } = req.query;
  const filter = {};
  if (role) filter.role = role;
  if (typeof isActive !== "undefined") filter.isActive = isActive === "true";
  if (q) filter.$text = { $search: q };

  const [items, total] = await Promise.all([
    User.find(filter)
      .skip(+offset)
      .limit(Math.min(+limit, 100))
      .sort({ createdAt: -1 })
      .lean(),
    User.countDocuments(filter),
  ]);

  return ok(
    res,
    { items, total, offset: +offset, limit: +limit },
    "Users list"
  );
});

export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).lean();
  if (!user) return fail(res, 404, "User not found");
  return ok(res, user);
});

export const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const allowed = [
    "firstName",
    "lastName",
    "phone",
    "address",
    "preferences",
    "isActive",
    "role",
  ];
  const payload = Object.fromEntries(
    Object.entries(req.body).filter(([k]) => allowed.includes(k))
  );

  const user = await User.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  }).lean();
  if (!user) return fail(res, 404, "User not found");
  return ok(res, user, "User updated");
});

export const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const deleted = await User.findByIdAndDelete(id);
  if (!deleted) return fail(res, 404, "User not found");
  return noContent(res);
});
