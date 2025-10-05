import mongoose from "mongoose";

const CategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      maxlength: 100,
    },
    description: { type: String, trim: true, maxlength: 500 },
    icon: { type: String, trim: true },
    parentCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

CategorySchema.index({ name: 1 }, { unique: true });
CategorySchema.index({ parentCategory: 1, isActive: 1 });
CategorySchema.index({ isActive: 1, sortOrder: 1 });

export default mongoose.models.Category ||
  mongoose.model("Category", CategorySchema);
