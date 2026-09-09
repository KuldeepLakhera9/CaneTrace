import mongoose, { Schema, Document, Model } from "mongoose";

export type FormFieldType =
  | "text"
  | "number"
  | "mobile"
  | "email"
  | "date"
  | "dropdown"
  | "radio"
  | "checkbox"
  | "textarea";

export interface IFormField {
  id: string;
  label: string;
  type: FormFieldType;
  required: boolean;
  placeholder?: string;
  helpText?: string;
  options?: string[]; // for dropdown, radio, checkbox
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
  order: number;
  systemKey?: string; // e.g. farmerName, mobile, pincode, village, taluka, district, state, plantingDate, sugarcaneVariety, spacing
}

export interface IFormVersion extends Document {
  versionId: string;
  formId: string;
  version: number;
  fields: IFormField[];
  createdAt: Date;
  updatedAt: Date;
}

const FormFieldSchema = new Schema<IFormField>(
  {
    id: { type: String, required: true },
    label: { type: String, required: true },
    type: {
      type: String,
      enum: [
        "text",
        "number",
        "mobile",
        "email",
        "date",
        "dropdown",
        "radio",
        "checkbox",
        "textarea",
      ],
      required: true,
    },
    required: { type: Boolean, default: false },
    placeholder: { type: String, default: "" },
    helpText: { type: String, default: "" },
    options: { type: [String], default: [] },
    validation: {
      min: { type: Number },
      max: { type: Number },
      pattern: { type: String },
    },
    order: { type: Number, required: true, default: 0 },
    systemKey: { type: String, default: "" },
  },
  { _id: false }
);

const FormVersionSchema = new Schema<IFormVersion>(
  {
    versionId: {
      type: String,
      required: [true, "Version ID is required"],
      unique: true,
      trim: true,
      index: true,
    },
    formId: {
      type: String,
      required: [true, "Form ID reference is required"],
      trim: true,
      index: true,
    },
    version: {
      type: Number,
      required: [true, "Version number is required"],
      default: 1,
      index: true,
    },
    fields: {
      type: [FormFieldSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

FormVersionSchema.index({ formId: 1, version: 1 }, { unique: true });

export const FormVersion: Model<IFormVersion> =
  mongoose.models.FormVersion ||
  mongoose.model<IFormVersion>("FormVersion", FormVersionSchema);
