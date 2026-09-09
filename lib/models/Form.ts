import mongoose, { Schema, Document, Model } from "mongoose";

export interface IForm extends Document {
  formId: string;
  name: string;
  slug: string;
  description?: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  currentVersion: number;
  currentVersionId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const FormSchema = new Schema<IForm>(
  {
    formId: {
      type: String,
      required: [true, "Form ID is required"],
      unique: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, "Form name is required"],
      trim: true,
      index: true,
    },
    slug: {
      type: String,
      required: [true, "Form slug is required"],
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    status: {
      type: String,
      enum: ["DRAFT", "PUBLISHED", "ARCHIVED"],
      default: "DRAFT",
      index: true,
    },
    currentVersion: {
      type: Number,
      default: 1,
    },
    currentVersionId: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Form: Model<IForm> =
  mongoose.models.Form || mongoose.model<IForm>("Form", FormSchema);
