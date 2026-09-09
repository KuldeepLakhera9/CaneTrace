import { connectToDatabase, isMongoConfigured } from "./connect";
import { Farmer, IFarmer } from "../models/Farmer";
import { Cultivation, ICultivation } from "../models/Cultivation";
import { Form, IForm } from "../models/Form";
import { FormVersion, IFormVersion } from "../models/FormVersion";
import { FormSubmission, IFormSubmission } from "../models/FormSubmission";
import { Variety } from "../models/Variety";
import { Spacing } from "../models/Spacing";
import {
  FarmerRecord,
  CultivationRecord,
  DashboardStats,
  FormRecord,
  FormVersionRecord,
  FormSubmissionRecord,
  FormFieldItem,
} from "@/types";
import {
  formatFarmerId,
  formatCultivationId,
  formatReferenceNumber,
  formatSubmissionId,
  formatFormId,
} from "../utils/idGenerator";
import { calculatePlantingSeason, SeasonType } from "../utils/season";
import { SUGARCANE_VARIETIES, SUGARCANE_SPACINGS } from "@/config/sugarcane";

// Global in-memory storage (empty by default - NO DUMMY DATA)
declare global {
  // eslint-disable-next-line no-var
  var __CANETRACE_FARMERS__: FarmerRecord[] | undefined;
  // eslint-disable-next-line no-var
  var __CANETRACE_CULTIVATIONS__: CultivationRecord[] | undefined;
  // eslint-disable-next-line no-var
  var __CANETRACE_FORMS__: FormRecord[] | undefined;
  // eslint-disable-next-line no-var
  var __CANETRACE_FORM_VERSIONS__: FormVersionRecord[] | undefined;
  // eslint-disable-next-line no-var
  var __CANETRACE_FORM_SUBMISSIONS__: FormSubmissionRecord[] | undefined;
}

if (!global.__CANETRACE_FARMERS__) {
  global.__CANETRACE_FARMERS__ = [];
}
if (!global.__CANETRACE_CULTIVATIONS__) {
  global.__CANETRACE_CULTIVATIONS__ = [];
}
if (!global.__CANETRACE_FORMS__) {
  global.__CANETRACE_FORMS__ = [];
}
if (!global.__CANETRACE_FORM_VERSIONS__) {
  global.__CANETRACE_FORM_VERSIONS__ = [];
}
if (!global.__CANETRACE_FORM_SUBMISSIONS__) {
  global.__CANETRACE_FORM_SUBMISSIONS__ = [];
}

const memoryFarmers = global.__CANETRACE_FARMERS__;
const memoryCultivations = global.__CANETRACE_CULTIVATIONS__;
const memoryForms = global.__CANETRACE_FORMS__;
const memoryFormVersions = global.__CANETRACE_FORM_VERSIONS__;
const memoryFormSubmissions = global.__CANETRACE_FORM_SUBMISSIONS__;


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
    soilType?: string;
    waterSource?: string;
    plantingMaterial?: string;
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
      soilType: data.soilType || "",
      waterSource: data.waterSource || "",
      plantingMaterial: data.plantingMaterial || "",
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
    soilType?: string;
    waterSource?: string;
    plantingMaterial?: string;
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
      soilType: data.soilType || "",
      waterSource: data.waterSource || "",
      plantingMaterial: data.plantingMaterial || "",
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

  // ==========================================
  // FORM & FORM VERSION MANAGEMENT
  // ==========================================

  static getDefaultSugarcaneFields(): FormFieldItem[] {
    return [
      {
        id: "field-name",
        label: "Farmer Full Name",
        type: "text",
        required: true,
        placeholder: "e.g. Ramesh Narayan Patil",
        helpText: "Primary identity of the farmer",
        order: 1,
        systemKey: "farmerName",
      },
      {
        id: "field-mobile",
        label: "Mobile Number",
        type: "mobile",
        required: true,
        placeholder: "98XXXXXXXX",
        helpText: "10-digit Indian mobile number",
        order: 2,
        systemKey: "mobile",
      },
      {
        id: "field-pincode",
        label: "Pincode",
        type: "number",
        required: true,
        placeholder: "e.g. 416001",
        helpText: "6-digit postal pincode for location auto-detection",
        order: 3,
        systemKey: "pincode",
      },
      {
        id: "field-village",
        label: "Village",
        type: "text",
        required: true,
        placeholder: "Village / Town",
        helpText: "Auto-detected or selected from pincode",
        order: 4,
        systemKey: "village",
      },
      {
        id: "field-taluka",
        label: "Taluka / Tehsil",
        type: "text",
        required: true,
        placeholder: "Taluka",
        helpText: "Auto-filled sub-district",
        order: 5,
        systemKey: "taluka",
      },
      {
        id: "field-district",
        label: "District",
        type: "text",
        required: true,
        placeholder: "District",
        helpText: "Auto-filled district",
        order: 6,
        systemKey: "district",
      },
      {
        id: "field-state",
        label: "State",
        type: "text",
        required: true,
        placeholder: "State",
        helpText: "State name",
        order: 7,
        systemKey: "state",
      },
      {
        id: "field-planting-date",
        label: "Planting Date",
        type: "date",
        required: true,
        placeholder: "YYYY-MM-DD",
        helpText: "Planting season will be automatically calculated",
        order: 8,
        systemKey: "plantingDate",
      },
      {
        id: "field-variety",
        label: "Sugarcane Variety",
        type: "dropdown",
        required: true,
        options: [
          "86032",
          "265",
          "13007",
          "PDN 15006 (Phule sugarcane)",
          "PDN 15012 (Phule sugarcane)",
        ],
        helpText: "Approved high-yield cane variety",
        order: 9,
        systemKey: "sugarcaneVariety",
      },
      {
        id: "field-spacing",
        label: "Row Spacing (ft)",
        type: "dropdown",
        required: true,
        options: [
          "4.5 × 2",
          "4.5 × 1.5",
          "5 × 1.5",
          "5 × 2",
          "6 × 1.5",
          "4 × 1.5",
        ],
        helpText: "Field furrow planting spacing",
        order: 10,
        systemKey: "spacing",
      },
      {
        id: "field-soil-type",
        label: "Soil Type (मातीचा प्रकार)",
        type: "dropdown",
        required: true,
        options: [
          "Black Soil (खोल माती)",
          "Medium Soil (मध्यम माती)",
          "Light Soil (हलकी माती)",
        ],
        helpText: "Field soil categorization",
        order: 11,
        systemKey: "soilType",
      },
      {
        id: "field-water-source",
        label: "Water Source (पाण्याचे स्त्रोत)",
        type: "dropdown",
        required: true,
        options: [
          "1. Borewell / Tube well (१. बोअरवेल / ट्यूबवेल)",
          "2. River (२. नदी)",
          "3. Canal (३. कालवा)",
          "4. Pond / Farm pond (४. तलाव / शेततळे)",
        ],
        helpText: "Primary irrigation water source",
        order: 12,
        systemKey: "waterSource",
      },
      {
        id: "field-planting-material",
        label: "Planting Material (लागवड साहित्य)",
        type: "radio",
        required: true,
        options: [
          "Cane / बेणे (Bene)",
          "Seedling / रोप (Rop)",
        ],
        helpText: "Seed cane setts or nursery seedlings",
        order: 13,
        systemKey: "plantingMaterial",
      },
    ];
  }


  // Ensure default published sugarcane-2026 form exists
  static async ensureDefaultForms(): Promise<FormRecord> {
    const slug = "sugarcane-2026";
    const defaultFields = this.getDefaultSugarcaneFields();

    if (isMongoConfigured()) {
      const conn = await connectToDatabase();
      if (conn) {
        const existing = await Form.findOne({ slug }).lean();
        if (existing) {
          // Always ensure the active version has the updated fields
          if (existing.currentVersionId) {
            await FormVersion.updateOne(
              { versionId: existing.currentVersionId },
              { fields: defaultFields }
            );
          }
          return existing as unknown as FormRecord;
        }
      }
    } else {
      const found = memoryForms.find((f) => f.slug === slug);
      if (found) {
        const ver = memoryFormVersions.find((v) => v.versionId === found.currentVersionId);
        if (ver) ver.fields = defaultFields;
        return found;
      }
    }


    const formId = "FORM-001";
    const versionId = "FV-001-1";
    const now = new Date();

    const newForm: FormRecord = {
      formId,
      name: "Sugarcane Farmer Registration 2026",
      slug,
      description: "Official public data collection portal for sugarcane cultivators and crop cycles.",
      status: "PUBLISHED",
      currentVersion: 1,
      currentVersionId: versionId,
      createdAt: now,
      updatedAt: now,
    };

    const newVersion: FormVersionRecord = {
      versionId,
      formId,
      version: 1,
      fields: this.getDefaultSugarcaneFields(),
      createdAt: now,
      updatedAt: now,
    };

    if (isMongoConfigured()) {
      const conn = await connectToDatabase();
      if (conn) {
        await FormVersion.findOneAndUpdate(
          { versionId },
          newVersion,
          { upsert: true, new: true }
        );
        const createdForm = await Form.findOneAndUpdate(
          { formId },
          newForm,
          { upsert: true, new: true }
        );
        return createdForm.toObject() as unknown as FormRecord;
      }
    }

    memoryForms.push(newForm);
    memoryFormVersions.push(newVersion);
    return newForm;
  }


  static async listForms(): Promise<FormRecord[]> {
    await this.ensureDefaultForms();

    if (isMongoConfigured()) {
      const conn = await connectToDatabase();
      if (conn) {
        const docs = await Form.find().sort({ createdAt: -1 }).lean();
        return docs as unknown as FormRecord[];
      }
    }
    return [...memoryForms].sort((a, b) => new Date(b.createdAt || "").getTime() - new Date(a.createdAt || "").getTime());
  }

  static async findFormById(formId: string): Promise<FormRecord | null> {
    await this.ensureDefaultForms();

    if (isMongoConfigured()) {
      const conn = await connectToDatabase();
      if (conn) {
        const doc = await Form.findOne({ formId }).lean();
        return doc ? (doc as unknown as FormRecord) : null;
      }
    }
    const found = memoryForms.find((f) => f.formId === formId);
    return found ? { ...found } : null;
  }

  static async findFormBySlug(slug: string): Promise<FormRecord | null> {
    await this.ensureDefaultForms();
    const cleanSlug = slug.toLowerCase().trim();
    if (isMongoConfigured()) {
      const conn = await connectToDatabase();
      if (conn) {
        const doc = await Form.findOne({ slug: cleanSlug }).lean();
        return doc ? (doc as unknown as FormRecord) : null;
      }
    }
    const found = memoryForms.find((f) => f.slug.toLowerCase() === cleanSlug);
    return found ? { ...found } : null;
  }


  static async getFormVersion(versionId: string): Promise<FormVersionRecord | null> {
    if (isMongoConfigured()) {
      const conn = await connectToDatabase();
      if (conn) {
        const doc = await FormVersion.findOne({ versionId }).lean();
        return doc ? (doc as unknown as FormVersionRecord) : null;
      }
    }
    const found = memoryFormVersions.find((v) => v.versionId === versionId);
    return found ? { ...found } : null;
  }

  static async getLatestVersionForForm(formId: string): Promise<FormVersionRecord | null> {
    if (isMongoConfigured()) {
      const conn = await connectToDatabase();
      if (conn) {
        const doc = await FormVersion.findOne({ formId }).sort({ version: -1 }).lean();
        return doc ? (doc as unknown as FormVersionRecord) : null;
      }
    }
    const versions = memoryFormVersions
      .filter((v) => v.formId === formId)
      .sort((a, b) => b.version - a.version);
    return versions.length > 0 ? { ...versions[0] } : null;
  }

  static async createForm(data: {
    name: string;
    slug: string;
    description?: string;
    initialFields?: FormFieldItem[];
  }): Promise<{ form: FormRecord; version: FormVersionRecord }> {
    const cleanSlug = data.slug.toLowerCase().trim().replace(/[^a-z0-9-]/g, "-");
    const existingSlug = await this.findFormBySlug(cleanSlug);
    if (existingSlug) {
      throw new Error(`A form with slug '${cleanSlug}' already exists.`);
    }

    let formCount = 1;
    if (isMongoConfigured()) {
      const conn = await connectToDatabase();
      if (conn) {
        formCount = (await Form.countDocuments()) + 1;
      }
    } else {
      formCount = memoryForms.length + 1;
    }

    const formId = formatFormId(formCount);
    const versionId = `FV-${formCount.toString().padStart(3, "0")}-1`;
    const now = new Date();

    const newForm: FormRecord = {
      formId,
      name: data.name.trim(),
      slug: cleanSlug,
      description: data.description?.trim() || "",
      status: "DRAFT",
      currentVersion: 1,
      currentVersionId: versionId,
      createdAt: now,
      updatedAt: now,
    };

    const newVersion: FormVersionRecord = {
      versionId,
      formId,
      version: 1,
      fields: data.initialFields || this.getDefaultSugarcaneFields(),
      createdAt: now,
      updatedAt: now,
    };

    if (isMongoConfigured()) {
      const conn = await connectToDatabase();
      if (conn) {
        const createdVersion = await FormVersion.create(newVersion);
        const createdForm = await Form.create(newForm);
        return {
          form: createdForm.toObject() as unknown as FormRecord,
          version: createdVersion.toObject() as unknown as FormVersionRecord,
        };
      }
    }

    memoryForms.push(newForm);
    memoryFormVersions.push(newVersion);
    return { form: newForm, version: newVersion };
  }

  static async updateFormDraft(
    formId: string,
    data: {
      name?: string;
      description?: string;
      fields: FormFieldItem[];
    }
  ): Promise<{ form: FormRecord; version: FormVersionRecord }> {
    const form = await this.findFormById(formId);
    if (!form) throw new Error("Form not found");

    const latestVersion = await this.getLatestVersionForForm(formId);
    if (!latestVersion) throw new Error("Form version not found");

    const now = new Date();

    if (isMongoConfigured()) {
      const conn = await connectToDatabase();
      if (conn) {
        if (data.name) form.name = data.name;
        if (data.description !== undefined) form.description = data.description;
        form.updatedAt = now;

        await Form.updateOne({ formId }, { name: form.name, description: form.description, updatedAt: now });
        await FormVersion.updateOne(
          { versionId: latestVersion.versionId },
          { fields: data.fields, updatedAt: now }
        );

        return {
          form,
          version: { ...latestVersion, fields: data.fields, updatedAt: now },
        };
      }
    }

    if (data.name) form.name = data.name;
    if (data.description !== undefined) form.description = data.description;
    form.updatedAt = now;
    latestVersion.fields = data.fields;
    latestVersion.updatedAt = now;

    return { form, version: latestVersion };
  }

  static async publishForm(formId: string): Promise<FormRecord> {
    const form = await this.findFormById(formId);
    if (!form) throw new Error("Form not found");

    const now = new Date();

    if (isMongoConfigured()) {
      const conn = await connectToDatabase();
      if (conn) {
        await Form.updateOne({ formId }, { status: "PUBLISHED", updatedAt: now });
        form.status = "PUBLISHED";
        form.updatedAt = now;
        return form;
      }
    }

    form.status = "PUBLISHED";
    form.updatedAt = now;
    return form;
  }

  static async archiveForm(formId: string): Promise<FormRecord> {
    const form = await this.findFormById(formId);
    if (!form) throw new Error("Form not found");

    const now = new Date();

    if (isMongoConfigured()) {
      const conn = await connectToDatabase();
      if (conn) {
        await Form.updateOne({ formId }, { status: "ARCHIVED", updatedAt: now });
        form.status = "ARCHIVED";
        form.updatedAt = now;
        return form;
      }
    }

    form.status = "ARCHIVED";
    form.updatedAt = now;
    return form;
  }

  // Publish a new version snapshot so historical data is never modified
  static async publishNewVersion(
    formId: string,
    newFields: FormFieldItem[]
  ): Promise<{ form: FormRecord; version: FormVersionRecord }> {
    const form = await this.findFormById(formId);
    if (!form) throw new Error("Form not found");

    const nextVerNumber = form.currentVersion + 1;
    const newVersionId = `FV-${form.formId.replace("FORM-", "")}-${nextVerNumber}`;
    const now = new Date();

    const newVersion: FormVersionRecord = {
      versionId: newVersionId,
      formId,
      version: nextVerNumber,
      fields: newFields,
      createdAt: now,
      updatedAt: now,
    };

    if (isMongoConfigured()) {
      const conn = await connectToDatabase();
      if (conn) {
        const createdVer = await FormVersion.create(newVersion);
        await Form.updateOne(
          { formId },
          {
            currentVersion: nextVerNumber,
            currentVersionId: newVersionId,
            status: "PUBLISHED",
            updatedAt: now,
          }
        );
        form.currentVersion = nextVerNumber;
        form.currentVersionId = newVersionId;
        form.status = "PUBLISHED";
        form.updatedAt = now;
        return {
          form,
          version: createdVer.toObject() as unknown as FormVersionRecord,
        };
      }
    }

    form.currentVersion = nextVerNumber;
    form.currentVersionId = newVersionId;
    form.status = "PUBLISHED";
    form.updatedAt = now;
    memoryFormVersions.push(newVersion);
    return { form, version: newVersion };
  }

  // ==========================================
  // PUBLIC SUBMISSIONS WITH DUPLICATE HANDLING
  // ==========================================

  static async submitPublicForm(params: {
    slug: string;
    data: Record<string, any>;
  }): Promise<{
    referenceNumber: string;
    formName: string;
    submissionId: string;
  }> {
    const { slug, data } = params;
    const form = await this.findFormBySlug(slug);

    if (!form) {
      throw new Error("Form not found");
    }
    if (form.status !== "PUBLISHED") {
      throw new Error("This form is currently not accepting responses.");
    }

    const version = form.currentVersionId
      ? await this.getFormVersion(form.currentVersionId)
      : await this.getLatestVersionForForm(form.formId);

    if (!version) {
      throw new Error("Form configuration error: active version not found.");
    }

    // Check duplicate mobile if mobile field exists
    const mobile = (data.mobile || "").toString().trim();
    if (mobile) {
      const existingFarmer = await this.findFarmerByMobile(mobile);
      if (existingFarmer) {
        // Privacy-safe duplicate rejection without leaking farmer name or location
        throw new Error(
          "This mobile number is already registered. Please contact the organization if you need to update your information."
        );
      }
    }

    // Generate reference code
    let subCount = 1;
    if (isMongoConfigured()) {
      const conn = await connectToDatabase();
      if (conn) {
        subCount = (await FormSubmission.countDocuments()) + 1;
      }
    } else {
      subCount = memoryFormSubmissions.length + 1;
    }

    const submissionId = formatSubmissionId(subCount);
    const referenceNumber = formatReferenceNumber(subCount);
    const now = new Date();

    let farmerId: string | undefined;
    let cultivationId: string | undefined;

    // If this form contains farmer & cultivation mapping, sync into Farmer & Cultivation records
    if (data.farmerName && data.mobile && data.pincode && data.plantingDate) {
      const created = await this.createFarmerWithCultivation({
        farmerName: data.farmerName,
        mobile: data.mobile,
        location: {
          pincode: data.pincode,
          village: data.village || "Unknown",
          taluka: data.taluka || "Unknown",
          district: data.district || "Unknown",
          state: data.state || "Maharashtra",
        },
        plantingDate: data.plantingDate,
        sugarcaneVariety: data.sugarcaneVariety || "86032",
        spacing: data.spacing || "4.5 × 1.5",
        soilType: data.soilType || data["field-soil-type"] || "",
        waterSource: data.waterSource || data["field-water-source"] || "",
        plantingMaterial: data.plantingMaterial || data["field-planting-material"] || "",
      });
      farmerId = created.farmer.farmerId;
      cultivationId = created.cultivation.cultivationId;
    }


    const newSubmission: FormSubmissionRecord = {
      submissionId,
      referenceNumber,
      formId: form.formId,
      formVersionId: version.versionId,
      versionNumber: version.version,
      data,
      farmerId,
      cultivationId,
      submittedAt: now,
      createdAt: now,
    };

    if (isMongoConfigured()) {
      const conn = await connectToDatabase();
      if (conn) {
        await FormSubmission.create(newSubmission);
        return {
          referenceNumber,
          formName: form.name,
          submissionId,
        };
      }
    }

    memoryFormSubmissions.push(newSubmission);
    return {
      referenceNumber,
      formName: form.name,
      submissionId,
    };
  }

  static async listSubmissions(params?: {
    formId?: string;
    page?: number;
    limit?: number;
  }): Promise<{ submissions: FormSubmissionRecord[]; total: number }> {
    const { formId, page = 1, limit = 20 } = params || {};

    if (isMongoConfigured()) {
      const conn = await connectToDatabase();
      if (conn) {
        const query: Record<string, unknown> = {};
        if (formId) query.formId = formId;

        const total = await FormSubmission.countDocuments(query);
        const docs = await FormSubmission.find(query)
          .sort({ submittedAt: -1 })
          .skip((page - 1) * limit)
          .limit(limit)
          .lean();

        return {
          submissions: docs as unknown as FormSubmissionRecord[],
          total,
        };
      }
    }

    let all = [...memoryFormSubmissions];
    if (formId) all = all.filter((s) => s.formId === formId);
    all.sort((a, b) => new Date(b.submittedAt || "").getTime() - new Date(a.submittedAt || "").getTime());

    const total = all.length;
    const paged = all.slice((page - 1) * limit, page * limit);
    return { submissions: paged, total };
  }
}

