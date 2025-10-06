import mongoose from "mongoose";

const ReviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    equipment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Equipment",
      required: true,
      index: true,
    },
    reservation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Reservation",
      required: true,
      unique: true,
    },

    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, trim: true, maxlength: 100 },
    comment: { type: String, trim: true, maxlength: 1000 },

    isVerified: { type: Boolean, default: true },
    helpfulVotes: { type: Number, default: 0, min: 0 },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// Jeden użytkownik – jedna recenzja na sprzęt
// ReviewSchema.index({ user: 1, equipment: 1 }, { unique: true });
// Wyświetlanie po ocenie
ReviewSchema.index({ equipment: 1, rating: -1 });

export default mongoose.models.Review || mongoose.model("Review", ReviewSchema);
