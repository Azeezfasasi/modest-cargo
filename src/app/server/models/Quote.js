import mongoose from "mongoose";

// Function to generate unique tracking number
export function generateTrackingNumber() {
  // Format: MC-YYYYMMDD-XXXXX (MC = Modest Cargo, date, random 5 digits)
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const random = String(Math.floor(Math.random() * 100000)).padStart(5, "0");
  return `MC-${year}${month}${day}-${random}`;
}

const replySchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  senderName: String,
  message: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const quoteSchema = new mongoose.Schema({
  fullName: String,
  email: String,
  phone: String,
  company: String,
  pickupLocation: String,
  deliveryLocation: String,
  serviceType: String,
  cargoType: String,
  weight: Number,
  quantity: Number,
  description: String,
  preferredDeliveryDate: Date,
  // Legacy fields for backward compatibility
  name: String,
  service: String,
  message: String,
  status: {
    type: String,
    default: "pending",
  },
  trackingNumber: {
    type: String,
    unique: true,
    sparse: true,
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  replies: [replySchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Quote || mongoose.model("Quote", quoteSchema);
