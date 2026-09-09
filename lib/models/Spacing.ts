import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISpacing extends Document {
  spacingId: string;
  spacingValue: string;
  displayName: string;
  unit: string;
  description: string;
  active: boolean;
  order: number;
}

const SpacingSchema = new Schema<ISpacing>(
  {
    spacingId: { type: String, required: true, unique: true, trim: true },
    spacingValue: { type: String, required: true, trim: true },
    displayName: { type: String, required: true, trim: true },
    unit: { type: String, default: "feet" },
    description: { type: String, default: "" },
    active: { type: Boolean, default: true, index: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Spacing: Model<ISpacing> =
  mongoose.models.Spacing || mongoose.model<ISpacing>("Spacing", SpacingSchema);
