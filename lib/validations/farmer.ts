import { z } from "zod";
import { calculatePlantingSeason } from "@/lib/utils/season";

export const indianMobileRegex = /^[6-9]\d{9}$/;
export const indianPincodeRegex = /^\d{6}$/;

export const farmerRegistrationSchema = z.object({
  farmerName: z
    .string()
    .min(2, "Farmer name must be at least 2 characters")
    .max(100, "Farmer name must not exceed 100 characters")
    .trim(),
  mobile: z
    .string()
    .trim()
    .regex(indianMobileRegex, "Please enter a valid 10-digit Indian mobile number (e.g., 9876543210)"),
  pincode: z
    .string()
    .trim()
    .regex(indianPincodeRegex, "Pincode must be exactly 6 numeric digits"),
  village: z
    .string()
    .min(1, "Please select or specify the village/post office")
    .trim(),
  taluka: z
    .string()
    .min(1, "Taluka is required")
    .trim(),
  district: z
    .string()
    .min(1, "District is required")
    .trim(),
  state: z
    .string()
    .min(1, "State is required")
    .trim(),

  // Initial cultivation details
  plantingDate: z
    .string()
    .min(1, "Planting date is required")
    .refine((val) => {
      const result = calculatePlantingSeason(val);
      return result.isValid;
    }, {
      message: "Selected date is outside supported sugarcane seasons (1 Apr – 14 Jun is unsupported).",
    }),
  sugarcaneVariety: z.string().min(1, "Please select a sugarcane variety"),
  spacing: z.string().min(1, "Please select row spacing"),
  soilType: z.string().optional(),
  waterSource: z.string().optional(),
  plantingMaterial: z.string().optional(),
});

export type FarmerRegistrationInput = z.infer<typeof farmerRegistrationSchema>;

export const addCultivationSchema = z.object({
  farmerId: z.string().min(1, "Farmer ID is required"),
  plantingDate: z
    .string()
    .min(1, "Planting date is required")
    .refine((val) => {
      const result = calculatePlantingSeason(val);
      return result.isValid;
    }, {
      message: "Selected date is outside supported sugarcane seasons (1 Apr – 14 Jun is unsupported).",
    }),
  sugarcaneVariety: z.string().min(1, "Please select a sugarcane variety"),
  spacing: z.string().min(1, "Please select row spacing"),
  soilType: z.string().optional(),
  waterSource: z.string().optional(),
  plantingMaterial: z.string().optional(),
});

export type AddCultivationInput = z.infer<typeof addCultivationSchema>;

