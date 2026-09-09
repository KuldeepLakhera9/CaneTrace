import { connectToDatabase, isMongoConfigured } from "./connect";
import { Farmer, IFarmer } from "../models/Farmer";
import { Cultivation, ICultivation } from "../models/Cultivation";
import { FarmerRecord, CultivationRecord, DashboardStats } from "@/types";
import { formatFarmerId, formatCultivationId } from "../utils/idGenerator";
import { calculatePlantingSeason, SeasonType } from "../utils/season";

// Global in-memory storage (empty by default - NO DUMMY DATA)
declare global {
  // eslint-disable-next-line no-var
  var __CANETRACE_FARMERS__: FarmerRecord[] | undefined;
  // eslint-disable-next-line no-var
  var __CANETRACE_CULTIVATIONS__: CultivationRecord[] | undefined;
}

if (!global.__CANETRACE_FARMERS__) {
  global.__CANETRACE_FARMERS__ = [];
}
if (!global.__CANETRACE_CULTIVATIONS__) {
  global.__CANETRACE_CULTIVATIONS__ = [];
}

const memoryFarmers = global.__CANETRACE_FARMERS__;
const memoryCultivations = global.__CANETRACE_CULTIVATIONS__;

export class DataStore {
  // Check duplicate farmer by mobile number
  static async findFarmerByMobile(mobile: string): Promise<FarmerRecord | null> {
    const cleanMobile = mobile.trim();
    if (isMongoConfigured()) {
      const conn = await connectToDatabase();
      if (conn) {
        const doc = await Farmer.findOne({ mobile: cleanMobile }).lean();
        if (doc) return doc as unknown as FarmerRecord;
        return null;
      }
    }
    const found = memoryFarmers.find((f) => f.mobile === cleanMobile);
    return found ? { ...found } : null;
  }

  static async findFarmerById(farmerId: string): Promise<FarmerRecord | null> {
    if (isMongoConfigured()) {
      const conn = await connectToDatabase();
      if (conn) {
        const doc = await Farmer.findOne({ farmerId }).lean();
        if (doc) return doc as unknown as FarmerRecord;
        return null;
      }
    }
    const found = memoryFarmers.find((f) => f.farmerId === farmerId);
    return found ? { ...found } : null;
  }

  static async getNextFarmerId(): Promise<string> {
    if (isMongoConfigured()) {
      const conn = await connectToDatabase();
      if (conn) {
        const count = await Farmer.countDocuments();
        return formatFarmerId(count + 1);
      }
    }
    return formatFarmerId(memoryFarmers.length + 1);
  }

  static async getNextCultivationId(): Promise<string> {
    if (isMongoConfigured()) {
      const conn = await connectToDatabase();
      if (conn) {
        const count = await Cultivation.countDocuments();
        return formatCultivationId(count + 1);
      }
    }
    return formatCultivationId(memoryCultivations.length + 1);
  }

  // Create Farmer + Initial Cultivation in live MongoDB
  static async createFarmerWithCultivation(data: {
    farmerName: string;
    mobile: string;
    location: {
      pincode: string;
      village: string;
      taluka: string;
      district: string;
      state: string;
    };
    plantingDate: string | Date;
    sugarcaneVariety: string;
    spacing: string;
  }): Promise<{ farmer: FarmerRecord; cultivation: CultivationRecord }> {
    const existing = await this.findFarmerByMobile(data.mobile);
    if (existing) {
      throw new Error(`Farmer with mobile ${data.mobile} is already registered (${existing.farmerId} - ${existing.farmerName})`);
    }

    const farmerId = await this.getNextFarmerId();
    const cultivationId = await this.getNextCultivationId();

    const seasonRes = calculatePlantingSeason(data.plantingDate);
    if (!seasonRes.isValid || !seasonRes.season) {
      throw new Error(seasonRes.message || "Invalid planting season for selected date");
    }

    const now = new Date();

    const newFarmer: FarmerRecord = {
      farmerId,
      farmerName: data.farmerName.trim(),
      mobile: data.mobile.trim(),
      location: {
        pincode: data.location.pincode.trim(),
        village: data.location.village.trim(),
        taluka: data.location.taluka.trim(),
        district: data.location.district.trim(),
        state: data.location.state.trim(),
      },
      status: "active",
      createdAt: now,
      updatedAt: now,
    };

    const newCultivation: CultivationRecord = {
      cultivationId,
      farmerId,
      plantingDate: new Date(data.plantingDate),
      season: seasonRes.season,
      sugarcaneVariety: data.sugarcaneVariety,
      spacing: data.spacing,
      status: "active",
      createdAt: now,
      updatedAt: now,
    };

    if (isMongoConfigured()) {
      const conn = await connectToDatabase();
      if (conn) {
        const createdFarmer = await Farmer.create(newFarmer);
        const createdCultivation = await Cultivation.create(newCultivation);
        return {
          farmer: createdFarmer.toObject() as unknown as FarmerRecord,
          cultivation: createdCultivation.toObject() as unknown as CultivationRecord,
        };
      }
    }

    memoryFarmers.unshift(newFarmer);
    memoryCultivations.unshift(newCultivation);

    return { farmer: newFarmer, cultivation: newCultivation };
  }

  // Add a new cultivation cycle to an existing farmer
  static async addCultivation(data: {
    farmerId: string;
    plantingDate: string | Date;
    sugarcaneVariety: string;
    spacing: string;
  }): Promise<CultivationRecord> {
    const farmer = await this.findFarmerById(data.farmerId);
    if (!farmer) {
      throw new Error(`Farmer ${data.farmerId} not found.`);
    }

    const cultivationId = await this.getNextCultivationId();
    const seasonRes = calculatePlantingSeason(data.plantingDate);
    if (!seasonRes.isValid || !seasonRes.season) {
      throw new Error(seasonRes.message || "Invalid planting season for selected date");
    }

    const now = new Date();
    const newCultivation: CultivationRecord = {
      cultivationId,
      farmerId: data.farmerId,
      plantingDate: new Date(data.plantingDate),
      season: seasonRes.season,
      sugarcaneVariety: data.sugarcaneVariety,
      spacing: data.spacing,
      status: "active",
      createdAt: now,
      updatedAt: now,
    };

    if (isMongoConfigured()) {
      const conn = await connectToDatabase();
      if (conn) {
        const doc = await Cultivation.create(newCultivation);
        return doc.toObject() as unknown as CultivationRecord;
      }
    }

    memoryCultivations.unshift(newCultivation);
    return newCultivation;
  }

  // Get cultivations for a farmer
  static async getCultivationsForFarmer(farmerId: string): Promise<CultivationRecord[]> {
    if (isMongoConfigured()) {
      const conn = await connectToDatabase();
      if (conn) {
        const docs = await Cultivation.find({ farmerId }).sort({ plantingDate: -1 }).lean();
        return docs as unknown as CultivationRecord[];
      }
    }
    return memoryCultivations
      .filter((c) => c.farmerId === farmerId)
      .sort((a, b) => new Date(b.plantingDate).getTime() - new Date(a.plantingDate).getTime());
  }

  // List farmers with search, filter, and pagination
  static async listFarmers(params: {
    search?: string;
    district?: string;
    taluka?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    farmers: (FarmerRecord & { cultivationsCount: number })[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const { search = "", district = "", taluka = "", page = 1, limit = 10 } = params;

    if (isMongoConfigured()) {
      const conn = await connectToDatabase();
      if (conn) {
        const query: Record<string, unknown> = {};
        if (district) query["location.district"] = new RegExp(`^${district}$`, "i");
        if (taluka) query["location.taluka"] = new RegExp(`^${taluka}$`, "i");
        if (search) {
          const regex = new RegExp(search, "i");
          query.$or = [
            { farmerName: regex },
            { mobile: regex },
            { farmerId: regex },
            { "location.village": regex },
            { "location.district": regex },
          ];
        }

        const total = await Farmer.countDocuments(query);
        const docs = await Farmer.find(query)
          .sort({ createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(limit)
          .lean();

        const farmersWithCount = await Promise.all(
          docs.map(async (f) => {
            const count = await Cultivation.countDocuments({ farmerId: f.farmerId });
            return {
              ...(f as unknown as FarmerRecord),
              cultivationsCount: count,
            };
          })
        );

        return {
          farmers: farmersWithCount,
          total,
          page,
          totalPages: Math.ceil(total / limit) || 1,
        };
      }
    }

    // In-memory fallback
    let all = [...memoryFarmers];
    if (district) {
      all = all.filter((f) => f.location.district.toLowerCase() === district.toLowerCase());
    }
    if (taluka) {
      all = all.filter((f) => f.location.taluka.toLowerCase() === taluka.toLowerCase());
    }
    if (search) {
      const term = search.toLowerCase();
      all = all.filter(
        (f) =>
          f.farmerName.toLowerCase().includes(term) ||
          f.mobile.includes(term) ||
          f.farmerId.toLowerCase().includes(term) ||
          f.location.village.toLowerCase().includes(term) ||
          f.location.district.toLowerCase().includes(term)
      );
    }

    const total = all.length;
    const startIndex = (page - 1) * limit;
    const paged = all.slice(startIndex, startIndex + limit);

    const farmersWithCount = paged.map((f) => {
      const count = memoryCultivations.filter((c) => c.farmerId === f.farmerId).length;
      return {
        ...f,
        cultivationsCount: count,
      };
    });

    return {
      farmers: farmersWithCount,
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  // List cultivations with multi-filters
  static async listCultivations(params: {
    search?: string;
    season?: string;
    variety?: string;
    spacing?: string;
    district?: string;
    taluka?: string;
    village?: string;
    year?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    cultivations: (CultivationRecord & { farmerName: string; mobile: string; location: FarmerRecord["location"] })[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const {
      search = "",
      season = "",
      variety = "",
      spacing = "",
      district = "",
      taluka = "",
      village = "",
      year = "",
      page = 1,
      limit = 10,
    } = params;

    let allCultivations: CultivationRecord[] = [];
    let allFarmers: FarmerRecord[] = [];

    if (isMongoConfigured()) {
      const conn = await connectToDatabase();
      if (conn) {
        allCultivations = (await Cultivation.find().sort({ plantingDate: -1 }).lean()) as unknown as CultivationRecord[];
        allFarmers = (await Farmer.find().lean()) as unknown as FarmerRecord[];
      }
    } else {
      allCultivations = [...memoryCultivations];
      allFarmers = [...memoryFarmers];
    }

    const farmerMap = new Map<string, FarmerRecord>();
    for (const f of allFarmers) {
      farmerMap.set(f.farmerId, f);
    }

    let joined = allCultivations.map((c) => {
      const farmer = farmerMap.get(c.farmerId) || {
        farmerId: c.farmerId,
        farmerName: "Unknown Farmer",
        mobile: "N/A",
        location: { pincode: "", village: "", taluka: "", district: "", state: "" },
      };
      return {
        ...c,
        farmerName: farmer.farmerName,
        mobile: farmer.mobile,
        location: farmer.location,
      };
    });

    if (season) joined = joined.filter((c) => c.season === season);
    if (variety) joined = joined.filter((c) => c.sugarcaneVariety === variety);
    if (spacing) joined = joined.filter((c) => c.spacing === spacing);
    if (district) joined = joined.filter((c) => c.location?.district.toLowerCase() === district.toLowerCase());
    if (taluka) joined = joined.filter((c) => c.location?.taluka.toLowerCase() === taluka.toLowerCase());
    if (village) joined = joined.filter((c) => c.location?.village.toLowerCase().includes(village.toLowerCase()));
    if (year) {
      joined = joined.filter((c) => new Date(c.plantingDate).getFullYear().toString() === year);
    }
    if (search) {
      const term = search.toLowerCase();
      joined = joined.filter(
        (c) =>
          c.farmerName.toLowerCase().includes(term) ||
          c.farmerId.toLowerCase().includes(term) ||
          c.cultivationId.toLowerCase().includes(term) ||
          c.mobile.includes(term) ||
          c.location?.village.toLowerCase().includes(term)
      );
    }

    joined.sort((a, b) => new Date(b.plantingDate).getTime() - new Date(a.plantingDate).getTime());

    const total = joined.length;
    const startIndex = (page - 1) * limit;
    const paged = joined.slice(startIndex, startIndex + limit);

    return {
      cultivations: paged,
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  // Dashboard stats aggregator
  static async getDashboardStats(): Promise<DashboardStats> {
    let farmers: FarmerRecord[] = [];
    let cultivations: CultivationRecord[] = [];

    if (isMongoConfigured()) {
      const conn = await connectToDatabase();
      if (conn) {
        farmers = (await Farmer.find().lean()) as unknown as FarmerRecord[];
        cultivations = (await Cultivation.find().lean()) as unknown as CultivationRecord[];
      }
    } else {
      farmers = [...memoryFarmers];
      cultivations = [...memoryCultivations];
    }

    const totalFarmers = farmers.length;
    const totalCultivations = cultivations.length;

    // Detect current season for today's date
    const today = new Date();
    const seasonRes = calculatePlantingSeason(today);
    const currentSeasonName: SeasonType = seasonRes.season || "Adsali";

    const currentSeasonRecords = cultivations.filter((c) => c.season === currentSeasonName).length;

    // Today's entries
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const todayEntries = cultivations.filter(
      (c) => new Date(c.createdAt || "").getTime() >= startOfToday.getTime()
    ).length;

    // Season Distribution
    const seasons: SeasonType[] = ["Adsali", "Pre-seasonal", "Suru"];
    const seasonDistribution = seasons.map((season) => {
      const count = cultivations.filter((c) => c.season === season).length;
      return {
        season,
        count,
        percentage: totalCultivations > 0 ? Math.round((count / totalCultivations) * 100) : 0,
      };
    });

    // Variety Distribution
    const varieties = ["86032", "265", "13007"];
    const varietyDistribution = varieties.map((variety) => {
      const count = cultivations.filter((c) => c.sugarcaneVariety === variety).length;
      return {
        variety,
        count,
        percentage: totalCultivations > 0 ? Math.round((count / totalCultivations) * 100) : 0,
      };
    });

    // Location Distribution
    const districtCounts: Record<string, number> = {};
    const talukaCounts: Record<string, number> = {};

    const farmerMap = new Map<string, FarmerRecord>();
    for (const f of farmers) {
      farmerMap.set(f.farmerId, f);
      const d = f.location?.district || "Other";
      const t = f.location?.taluka || "Other";
      districtCounts[d] = (districtCounts[d] || 0) + 1;
      talukaCounts[t] = (talukaCounts[t] || 0) + 1;
    }

    const districtDistribution = Object.entries(districtCounts).map(([district, count]) => ({
      district,
      count,
    }));

    const talukaDistribution = Object.entries(talukaCounts).map(([taluka, count]) => ({
      taluka,
      count,
    }));

    // Recent entries
    const recent = [...cultivations]
      .sort((a, b) => new Date(b.createdAt || "").getTime() - new Date(a.createdAt || "").getTime())
      .slice(0, 5)
      .map((c) => {
        const farmer = farmerMap.get(c.farmerId);
        return {
          ...c,
          farmerName: farmer?.farmerName || "Unknown",
          village: farmer?.location?.village || "",
          district: farmer?.location?.district || "",
        };
      });

    return {
      totalFarmers,
      totalCultivations,
      currentSeasonRecords,
      currentSeasonName,
      todayEntries,
      seasonDistribution,
      varietyDistribution,
      districtDistribution,
      talukaDistribution,
      recentEntries: recent,
    };
  }

  // Get raw records for Excel / CSV export
  static async getExportData(params?: { season?: string; variety?: string; district?: string }) {
    const list = await this.listCultivations({
      season: params?.season,
      variety: params?.variety,
      district: params?.district,
      limit: 10000,
    });
    return list.cultivations;
  }

  // Delete a farmer and all their associated cultivation records
  static async deleteFarmer(farmerId: string): Promise<boolean> {
    if (isMongoConfigured()) {
      const conn = await connectToDatabase();
      if (conn) {
        await Cultivation.deleteMany({ farmerId });
        const res = await Farmer.deleteOne({ farmerId });
        return res.deletedCount > 0;
      }
    }

    const farmerIdx = memoryFarmers.findIndex((f) => f.farmerId === farmerId);
    if (farmerIdx !== -1) {
      memoryFarmers.splice(farmerIdx, 1);
      // Remove cultivations
      for (let i = memoryCultivations.length - 1; i >= 0; i--) {
        if (memoryCultivations[i].farmerId === farmerId) {
          memoryCultivations.splice(i, 1);
        }
      }
      return true;
    }
    return false;
  }

  // Delete a single cultivation record
  static async deleteCultivation(cultivationId: string): Promise<boolean> {
    if (isMongoConfigured()) {
      const conn = await connectToDatabase();
      if (conn) {
        const res = await Cultivation.deleteOne({ cultivationId });
        return res.deletedCount > 0;
      }
    }

    const cultIdx = memoryCultivations.findIndex((c) => c.cultivationId === cultivationId);
    if (cultIdx !== -1) {
      memoryCultivations.splice(cultIdx, 1);
      return true;
    }
    return false;
  }
}
