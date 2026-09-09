import mongoose, { Schema, Document, Model } from "mongoose";

export interface IFormSubmission extends Document {
  submissionId: string;
  referenceNumber: string; // e.g. CT-000123
  formId: string;
  formVersionId: string;
  versionNumber: number;
  data: Record<string, any>;
  farmerId?: string;
  cultivationId?: string;
  submittedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const FormSubmissionSchema = new Schema<IFormSubmission>(
  {
    submissionId: {
      type: String,
      required: [true, "Submission ID is required"],
      unique: true,
      trim: true,
      index: true,
    },
    referenceNumber: {
      type: String,
      required: [true, "Reference number is required"],
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
    formVersionId: {
      type: String,
      required: [true, "Form Version ID reference is required"],
      trim: true,
      index: true,
    },
    versionNumber: {
      type: Number,
      required: true,
      default: 1,
    },
    data: {
      type: Schema.Types.Mixed,
      required: true,
      default: {},
    },
    farmerId: {
      type: String,
      trim: true,
      index: true,
    },
    cultivationId: {
      type: String,
      trim: true,
      index: true,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

FormSubmissionSchema.index({ formId: 1, submittedAt: -1 });

export const FormSubmission: Model<IFormSubmission> =
  mongoose.models.FormSubmission ||
  mongoose.model<IFormSubmission>("FormSubmission", FormSubmissionSchema);
