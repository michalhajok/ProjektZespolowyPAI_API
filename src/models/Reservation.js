import mongoose from "mongoose";

const HistoryEntrySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "active",
        "completed",
        "cancelled",
        "overdue",
      ],
      required: true,
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    changedAt: { type: Date, default: Date.now },
    reason: { type: String, trim: true, maxlength: 500 },
  },
  { _id: false }
);

const NotesSchema = new mongoose.Schema(
  {
    customerNotes: { type: String, trim: true, maxlength: 1000 },
    adminNotes: { type: String, trim: true, maxlength: 1000 },
    damageReport: { type: String, trim: true, maxlength: 2000 },
  },
  { _id: false }
);

const DatesSchema = new mongoose.Schema(
  {
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    actualStartDate: { type: Date },
    actualEndDate: { type: Date },
  },
  { _id: false }
);

const ReservationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    equipment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Equipment",
      required: true,
    },

    dates: { type: DatesSchema, required: true },

    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "active",
        "completed",
        "cancelled",
        "overdue",
      ],
      default: "pending",
      index: true,
    },

    notes: { type: NotesSchema },

    history: { type: [HistoryEntrySchema], default: [] },
  },
  { timestamps: true }
);

// Walidacja dat
ReservationSchema.path("dates").validate(function (v) {
  if (!v?.startDate || !v?.endDate) return false;
  return v.endDate > v.startDate;
}, "endDate must be greater than startDate");

// Indeksy pod dostępność i operacje panelowe
ReservationSchema.index({ user: 1, status: 1 });
ReservationSchema.index({
  equipment: 1,
  "dates.startDate": 1,
  "dates.endDate": 1,
});
ReservationSchema.index({ status: 1, "dates.endDate": 1 });

export default mongoose.models.Reservation ||
  mongoose.model("Reservation", ReservationSchema);
