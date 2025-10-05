import Category from "../models/Category.js";
import { ok, created, noContent, fail } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const createCategory = asyncHandler(async (req, res) => {
  const { name, description, icon, parentCategory, isActive, sortOrder } =
    req.body;
  const cat = await Category.create({
    name,
    description,
    icon,
    parentCategory,
    isActive,
    sortOrder,
  });
  return created(res, cat, "Category created");
});

export const getCategories = asyncHandler(async (req, res) => {
  const { onlyActive } = req.query;
  const filter = {};
  if (onlyActive === "true") filter.isActive = true;

  const items = await Category.find(filter)
    .sort({ sortOrder: 1, name: 1 })
    .lean();
  return ok(res, items, "Categories list");
});

export const getCategoryById = asyncHandler(async (req, res) => {
  const cat = await Category.findById(req.params.id).lean();
  if (!cat) return fail(res, 404, "Category not found");
  return ok(res, cat);
});

export const updateCategory = asyncHandler(async (req, res) => {
  const allowed = [
    "name",
    "description",
    "icon",
    "parentCategory",
    "isActive",
    "sortOrder",
  ];
  const payload = Object.fromEntries(
    Object.entries(req.body).filter(([k]) => allowed.includes(k))
  );
  const cat = await Category.findByIdAndUpdate(req.params.id, payload, {
    new: true,
    runValidators: true,
  }).lean();
  if (!cat) return fail(res, 404, "Category not found");
  return ok(res, cat, "Category updated");
});

export const deleteCategory = asyncHandler(async (req, res) => {
  const deleted = await Category.findByIdAndDelete(req.params.id);
  if (!deleted) return fail(res, 404, "Category not found");
  return noContent(res);
});
