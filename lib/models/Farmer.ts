import mongoose, { Schema, Document, Model } from "mongoose";

export interface IFarmer extends Document {
  farmerId: string;
  farmerName: string;
  mobile: string;
  location: {
    pincode: string;
    village: string;
    taluka: string;
    district: string;
    state: string;
  };
  status: "active" | "inactive";
  createdAt: Date;
  updatedAt: Date;
}

const FarmerSchema = new Schema<IFarmer>(
  {
    farmerId: {
      type: String,
      required: [true, "Farmer ID is required"],
      unique: true,
      trim: true,
      index: true,
    },
    farmerName: {
      type: String,
      required: [true, "Farmer name is required"],
      trim: true,
      index: true,
    },
    mobile: {
      type: String,
      required: [true, "Mobile number is required"],
      unique: true,
      trim: true,
      index: true,
    },
    location: {
      pincode: { type: String, required: true, trim: true, index: true },
      village: { type: String, required: true, trim: true, index: true },
      taluka: { type: String, required: true, trim: true, index: true },
      district: { type: String, required: true, trim: true, index: true },
      state: { type: String, required: true, trim: true },
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for fast geographical and multi-faceted searches
FarmerSchema.index({ "location.district": 1, "location.taluka": 1 });
FarmerSchema.index({ farmerName: "text", mobile: "text", farmerId: "text" });

export const Farmer: Model<IFarmer> =
  mongoose.models.Farmer || mongoose.model<IFarmer>("Farmer", FarmerSchema);
