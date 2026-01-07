import mongoose from "mongoose";

const shipmentStatusSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Status name is required"],
      unique: true,
      trim: true,
    },
    color: {
      type: String,
      default: "gray",
      enum: ["gray", "yellow", "blue", "green", "purple", "indigo", "emerald", "red", "orange"],
    },
    emoji: {
      type: String,
      default: "📍",
    },
    description: {
      type: String,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.ShipmentStatus || mongoose.model("ShipmentStatus", shipmentStatusSchema);
