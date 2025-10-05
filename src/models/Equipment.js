import mongoose from "mongoose";

const MediaImageSchema = new mongoose.Schema(
  {
    url: { type: String, trim: true, required: true },
    alt: { type: String, trim: true, maxlength: 120 },
    isPrimary: { type: Boolean, default: false },
  },
  { _id: false }
);

const MediaDocumentSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, maxlength: 120 },
    url: { type: String, trim: true },
    type: { type: String, enum: ["manual", "warranty", "certificate"] },
  },
  { _id: false }
);

const EquipmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, trim: true, maxlength: 2000 },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    specifications: {
      brand: { type: String, trim: true, maxlength: 100 },
      model: { type: String, trim: true, maxlength: 100 },
      serialNumber: { type: String, trim: true, unique: true, sparse: true },
      yearManufactured: {
        type: Number,
        min: 1950,
        max: new Date().getFullYear() + 1,
      },
      condition: {
        type: String,
        enum: ["new", "excellent", "good", "fair", "poor"],
        default: "good",
      },
      technicalSpecs: { type: Map, of: String },
    },

    availability: {
      status: {
        type: String,
        enum: ["available", "reserved", "rented", "maintenance", "retired"],
        default: "available",
      },
      location: {
        branch: { type: String, trim: true, maxlength: 80 },
        warehouse: { type: String, trim: true, maxlength: 80 },
        shelf: { type: String, trim: true, maxlength: 40 },
      },
      quantity: { type: Number, min: 0, default: 1 },
      availableQuantity: { type: Number, min: 0, default: 1 },
    },

    media: {
      images: [MediaImageSchema],
      documents: [MediaDocumentSchema],
    },

    metadata: {
      views: { type: Number, default: 0, min: 0 },
      totalReservations: { type: Number, default: 0, min: 0 },
      averageRating: { type: Number, default: 0, min: 0, max: 5 },
      reviewCount: { type: Number, default: 0, min: 0 },
    },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

EquipmentSchema.index({ category: 1, "availability.status": 1 });
EquipmentSchema.index({ name: "text", description: "text" });
EquipmentSchema.index({ "pricing.dailyRate": 1 });
EquipmentSchema.index({ "metadata.averageRating": -1 });
EquipmentSchema.index(
  { "specifications.serialNumber": 1 },
  { unique: true, sparse: true }
);

export default mongoose.models.Equipment ||
  mongoose.model("Equipment", EquipmentSchema);
