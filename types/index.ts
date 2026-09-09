import { SeasonType } from "@/lib/utils/season";

export interface LocationData {
  pincode: string;
  village: string;
  taluka: string;
  district: string;
  state: string;
}

export interface FarmerRecord {
  _id?: string;
  farmerId: string;
  farmerName: string;
  mobile: string;
  location: LocationData;
  cultivationsCount?: number;
  status?: "active" | "inactive";
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface CultivationRecord {
  _id?: string;
  cultivationId: string;
  farmerId: string;
  farmerName?: string;
  mobile?: string;
  location?: LocationData;
  plantingDate: string | Date;
  season: SeasonType;
  sugarcaneVariety: string;
  spacing: string;
  soilType?: string;
  waterSource?: string;
  plantingMaterial?: string;
  status?: "active" | "harvested";
  createdAt?: string | Date;
  updatedAt?: string | Date;
}


export interface UserSession {
  userId: string;
  email: string;
  name: string;
  role: "admin" | "employee";
}

export interface DashboardStats {
  totalFarmers: number;
  totalCultivations: number;
  currentSeasonRecords: number;
  currentSeasonName: SeasonType;
  todayEntries: number;
  seasonDistribution: {
    season: SeasonType;
    count: number;
    percentage: number;
  }[];
  varietyDistribution: {
    variety: string;
    count: number;
    percentage: number;
  }[];
  districtDistribution: {
    district: string;
    count: number;
  }[];
  talukaDistribution: {
    taluka: string;
    count: number;
  }[];
  recentEntries: (CultivationRecord & {
    farmerName: string;
    village: string;
    district: string;
  })[];
}

export interface PincodeLookupResponse {
  success: boolean;
  pincode: string;
  villages: string[];
  taluka: string;
  district: string;
  state: string;
  error?: string;
}

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

export interface FormFieldItem {
  id: string;
  label: string;
  type: FormFieldType;
  required: boolean;
  placeholder?: string;
  helpText?: string;
  options?: string[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
  order: number;
  systemKey?: string;
}

export interface FormRecord {
  _id?: string;
  formId: string;
  name: string;
  slug: string;
  description?: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  currentVersion: number;
  currentVersionId?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface FormVersionRecord {
  _id?: string;
  versionId: string;
  formId: string;
  version: number;
  fields: FormFieldItem[];
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface FormSubmissionRecord {
  _id?: string;
  submissionId: string;
  referenceNumber: string;
  formId: string;
  formVersionId: string;
  versionNumber: number;
  data: Record<string, any>;
  farmerId?: string;
  cultivationId?: string;
  submittedAt?: string | Date;
  createdAt?: string | Date;
}

