import mongoose from 'mongoose';

const pricingSchema = new mongoose.Schema(
  {
    usaToNigeria: {
      headers: [String],
      rows: [
        {
          type: { type: String },
          rates: [String],
          _id: false
        }
      ]
    },
    nigeriaToUSA: {
      headers: [String],
      rows: [
        {
          type: { type: String },
          rates: [String],
          _id: false
        }
      ]
    }
  },
  { timestamps: true }
);

export default mongoose.models.Pricing || mongoose.model('Pricing', pricingSchema);
