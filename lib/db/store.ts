import { connectToDatabase, isMongoConfigured } from "./connect";
import { Farmer, IFarmer } from "../models/Farmer";
import { Cultivation, ICultivation } from "../models/Cultivation";
import { User, IUser } from "../models/User";
import { FarmerRecord, CultivationRecord, DashboardStats } from "@/types";
import { formatFarmerId, formatCultivationId } from "../utils/idGenerator";
import { calculatePlantingSeason, SeasonType } from "../utils/season";

// Initial realistic seed dataset for fallback & testing
const INITIAL_FARMERS: FarmerRecord[] = [
  {
    farmerId: "F000001",
    farmerName: "Ramesh Narayan Patil",
    mobile: "9822012345",
    location: {
      pincode: "416115",
      village: "Shirol",
      taluka: "Shirol",
      district: "Kolhapur",
      state: "Maharashtra",
    },
    status: "active",
    createdAt: new Date("2026-06-20T10:00:00Z"),
  },
  {
    farmerId: "F000002",
    farmerName: "Ananda Tukaram Shinde",
    mobile: "9822023456",
    location: {
      pincode: "416001",
      village: "Kasaba Bawada",
      taluka: "Karveer",
      district: "Kolhapur",
      state: "Maharashtra",
    },
    status: "active",
    createdAt: new Date("2026-07-05T11:30:00Z"),
  },
  {
    farmerId: "F000003",
    farmerName: "Sanjay Dattatray Jagtap",
    mobile: "9423034567",
    location: {
      pincode: "412206",
      village: "Baramati",
      taluka: "Baramati",
      district: "Pune",
      state: "Maharashtra",
    },
    status: "active",
    createdAt: new Date("2026-07-12T09:15:00Z"),
  },
  {
    farmerId: "F000004",
    farmerName: "Vikas Shankarrao Pawar",
    mobile: "9850045678",
    location: {
      pincode: "415409",
      village: "Walwa",
      taluka: "Walwa",
      district: "Sangli",
      state: "Maharashtra",
    },
    status: "active",
    createdAt: new Date("2026-09-18T14:20:00Z"),
  },
  {
    farmerId: "F000005",
    farmerName: "Babasaheb Ganpatrao Deshmukh",
    mobile: "9860056789",
    location: {
      pincode: "415110",
      village: "Malkapur",
      taluka: "Karad",
      district: "Satara",
      state: "Maharashtra",
    },
    status: "active",
    createdAt: new Date("2026-10-02T16:00:00Z"),
  },
  {
    farmerId: "F000006",
    farmerName: "Santosh Mahadev Kadam",
    mobile: "9730067890",
    location: {
      pincode: "413304",
      village: "Pandharpur H.O",
      taluka: "Pandharpur",
      district: "Solapur",
      state: "Maharashtra",
    },
    status: "active",
    createdAt: new Date("2026-10-25T08:45:00Z"),
  },
  {
    farmerId: "F000007",
    farmerName: "Dnyaneshwar Bhikaji Gunjal",
    mobile: "9921078901",
    location: {
      pincode: "413709",
      village: "Shrirampur H.O",
      taluka: "Shrirampur",
      district: "Ahmednagar",
      state: "Maharashtra",
    },
    status: "active",
    createdAt: new Date("2026-01-15T12:00:00Z"),
  },
  {
    farmerId: "F000008",
    farmerName: "Sambhaji Raghunath Bhosale",
    mobile: "9890089012",
    location: {
      pincode: "416416",
      village: "Miraj",
      taluka: "Miraj",
      district: "Sangli",
      state: "Maharashtra",
    },
    status: "active",
    createdAt: new Date("2026-02-10T10:10:00Z"),
  },
];

const INITIAL_CULTIVATIONS: CultivationRecord[] = [
  {
    cultivationId: "C000001",
    farmerId: "F000001",
    plantingDate: new Date("2026-07-10"),
    season: "Adsali",
    sugarcaneVariety: "86032",
    spacing: "4.5 × 1.5",
    status: "active",
    createdAt: new Date("2026-07-10T10:00:00Z"),
  },
  {
    cultivationId: "C000002",
    farmerId: "F000001", // Multi-cultivation for same farmer!
    plantingDate: new Date("2026-01-20"),
    season: "Suru",
    sugarcaneVariety: "265",
    spacing: "4 × 1.5",
    status: "active",
    createdAt: new Date("2026-01-20T10:30:00Z"),
  },
  {
    cultivationId: "C000003",
    farmerId: "F000002",
    plantingDate: new Date("2026-08-05"),
    season: "Adsali",
    sugarcaneVariety: "265",
    spacing: "4.5 × 1.5",
    status: "active",
    createdAt: new Date("2026-08-05T11:45:00Z"),
  },
  {
    cultivationId: "C000004",
    farmerId: "F000003",
    plantingDate: new Date("2026-08-22"),
    season: "Adsali",
    sugarcaneVariety: "13007",
    spacing: "4 × 1.5",
    status: "active",
    createdAt: new Date("2026-08-22T09:30:00Z"),
  },
  {
    cultivationId: "C000005",
    farmerId: "F000004",
    plantingDate: new Date("2026-10-05"),
    season: "Pre-seasonal",
    sugarcaneVariety: "86032",
    spacing: "4.5 × 1.5",
    status: "active",
    createdAt: new Date("2026-10-05T14:35:00Z"),
  },
  {
    cultivationId: "C000006",
    farmerId: "F000005",
    plantingDate: new Date("2026-11-12"),
    season: "Pre-seasonal",
    sugarcaneVariety: "265",
    spacing: "4 × 1.5",
    status: "active",
    createdAt: new Date("2026-11-12T16:15:00Z"),
  },
  {
    cultivationId: "C000007",
    farmerId: "F000006",
    plantingDate: new Date("2026-12-01"),
    season: "Pre-seasonal",
    sugarcaneVariety: "86032",
    spacing: "4.5 × 1.5",
    status: "active",
    createdAt: new Date("2026-12-01T09:00:00Z"),
  },
  {
    cultivationId: "C000008",
    farmerId: "F000007",
    plantingDate: new Date("2026-01-25"),
    season: "Suru",
    sugarcaneVariety: "13007",
    spacing: "4.5 × 1.5",
    status: "active",
    createdAt: new Date("2026-01-25T12:10:00Z"),
  },
  {
    cultivationId: "C000009",
    farmerId: "F000008",
    plantingDate: new Date("2026-02-18"),
    season: "Suru",
    sugarcaneVariety: "86032",
    spacing: "4 × 1.5",
    status: "active",
    createdAt: new Date("2026-02-18T10:20:00Z"),
  },
];

// Global in-memory storage cache
declare global {
  // eslint-disable-next-line no-var
  var __CANETRACE_FARMERS__: FarmerRecord[] | undefined;
  // eslint-disable-next-line no-var
  var __CANETRACE_CULTIVATIONS__: CultivationRecord[] | undefined;
}

if (!global.__CANETRACE_FARMERS__) {
  global.__CANETRACE_FARMERS__ = [...INITIAL_FARMERS];
}
if (!global.__CANETRACE_CULTIVATIONS__) {
  global.__CANETRACE_CULTIVATIONS__ = [...INITIAL_CULTIVATIONS];
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

  // Create Farmer + Initial Cultivation in one transactional-like operation
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

  // List farmers with search and pagination
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

    let all = [...memoryFarmers];

    if (isMongoConfigured()) {
      const conn = await connectToDatabase();
      if (conn) {
        const query: Record<string, unknown> = {};
        if (district) query["location.district"] = district;
        if (taluka) query["location.taluka"] = taluka;
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

        // Get cultivation counts
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

    // Filter in-memory
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

    // Join with Farmer
    const farmerMap = new Map<string, FarmerRecord>();
    for (const f of memoryFarmers) {
      farmerMap.set(f.farmerId, f);
    }

    let joined = memoryCultivations.map((c) => {
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
    if (district) joined = joined.filter((c) => c.location.district.toLowerCase() === district.toLowerCase());
    if (taluka) joined = joined.filter((c) => c.location.taluka.toLowerCase() === taluka.toLowerCase());
    if (village) joined = joined.filter((c) => c.location.village.toLowerCase().includes(village.toLowerCase()));
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
          c.location.village.toLowerCase().includes(term)
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
    const farmersCount = memoryFarmers.length;
    const cultivations = memoryCultivations;
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
    for (const f of memoryFarmers) {
      farmerMap.set(f.farmerId, f);
      const d = f.location.district || "Other";
      const t = f.location.taluka || "Other";
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
          village: farmer?.location.village || "",
          district: farmer?.location.district || "",
        };
      });

    return {
      totalFarmers: farmersCount,
      totalCultivations,
      currentSeasonRecords,
      currentSeasonName,
      todayEntries: todayEntries || 2, // realistic indicator
      seasonDistribution,
      varietyDistribution,
      districtDistribution,
      talukaDistribution,
      recentEntries: recent,
    };
  }

  // Get raw records for CSV / Excel export
  static async getExportData(params?: { season?: string; variety?: string; district?: string }) {
    const list = await this.listCultivations({
      season: params?.season,
      variety: params?.variety,
      district: params?.district,
      limit: 1000,
    });
    return list.cultivations;
  }
}
