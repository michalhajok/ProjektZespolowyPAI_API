import mongoose from "mongoose";

const AddressSchema = new mongoose.Schema(
  {
    street: { type: String, trim: true, maxlength: 100 },
    city: { type: String, trim: true, maxlength: 60 },
    postalCode: { type: String, trim: true, maxlength: 20 },
    country: { type: String, trim: true, default: "Poland", maxlength: 60 },
  },
  { _id: false }
);

const PreferencesSchema = new mongoose.Schema(
  {
    notifications: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
    },
    language: { type: String, enum: ["pl", "en"], default: "pl" },
  },
  { _id: false }
);

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email format"],
    },
    password: { type: String, required: true, minlength: 8 },
    firstName: { type: String, required: true, trim: true, maxlength: 50 },
    lastName: { type: String, required: true, trim: true, maxlength: 50 },
    phone: {
      type: String,
      trim: true,
      match: [/^\+?[1-9]\d{1,14}$/, "Invalid E.164 phone"],
    },
    role: { type: String, enum: ["customer", "admin"], default: "customer" },
    address: AddressSchema,
    preferences: PreferencesSchema,
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date },
  },
  { timestamps: true }
);

UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ role: 1, isActive: 1 });
UserSchema.index({ createdAt: 1 });

export default mongoose.models.User || mongoose.model("User", UserSchema);
