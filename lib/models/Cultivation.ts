import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICultivation extends Document {
  cultivationId: string;
  farmerId: string;
  plantingDate: Date;
  season: "Adsali" | "Pre-seasonal" | "Suru";
  sugarcaneVariety: string;
  spacing: string;
  status: "active" | "harvested";
  createdAt: Date;
  updatedAt: Date;
}

const CultivationSchema = new Schema<ICultivation>(
  {
    cultivationId: {
      type: String,
      required: [true, "Cultivation ID is required"],
      unique: true,
      trim: true,
      index: true,
    },
    farmerId: {
      type: String,
      required: [true, "Farmer ID reference is required"],
      trim: true,
      index: true,
    },
    plantingDate: {
      type: Date,
      required: [true, "Planting date is required"],
      index: true,
    },
    season: {
      type: String,
      enum: ["Adsali", "Pre-seasonal", "Suru"],
      required: [true, "Season is required"],
      index: true,
    },
    sugarcaneVariety: {
      type: String,
      required: [true, "Sugarcane variety is required"],
      trim: true,
      index: true,
    },
    spacing: {
      type: String,
      required: [true, "Spacing is required"],
      trim: true,
    },
    status: {
      type: String,
      enum: ["active", "harvested"],
      default: "active",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

CultivationSchema.index({ farmerId: 1, plantingDate: -1 });
CultivationSchema.index({ season: 1, sugarcaneVariety: 1 });

export const Cultivation: Model<ICultivation> =
  mongoose.models.Cultivation ||
  mongoose.model<ICultivation>("Cultivation", CultivationSchema);
