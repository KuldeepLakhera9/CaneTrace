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
  sugarcaneVariety: "86032" | "265" | "13007" | string;
  spacing: "4.5 × 1.5" | "4 × 1.5" | string;
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
