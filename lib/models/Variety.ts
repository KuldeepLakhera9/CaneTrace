import mongoose, { Schema, Document, Model } from "mongoose";

export interface IVariety extends Document {
  varietyId: string;
  varietyName: string;
  displayName: string;
  durationMonths: string;
  description: string;
  active: boolean;
  order: number;
}

const VarietySchema = new Schema<IVariety>(
  {
    varietyId: { type: String, required: true, unique: true, trim: true },
    varietyName: { type: String, required: true, trim: true },
    displayName: { type: String, required: true, trim: true },
    durationMonths: { type: String, default: "" },
    description: { type: String, default: "" },
    active: { type: Boolean, default: true, index: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Variety: Model<IVariety> =
  mongoose.models.Variety || mongoose.model<IVariety>("Variety", VarietySchema);
