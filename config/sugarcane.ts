export interface VarietyConfig {
  varietyId: string;
  varietyName: string;
  displayName: string;
  durationMonths: string;
  description: string;
  active: boolean;
}

export interface SpacingConfig {
  spacingId: string;
  spacingValue: string;
  displayName: string;
  unit: string;
  description: string;
  active: boolean;
}

export interface SeasonRule {
  seasonKey: "Adsali" | "Pre-seasonal" | "Suru";
  name: string;
  startMonth: number; // 1-12
  startDay: number;
  endMonth: number;
  endDay: number;
  description: string;
  badgeClass: string;
}

export const SUGARCANE_VARIETIES: VarietyConfig[] = [
  {
    varietyId: "86032",
    varietyName: "86032",
    displayName: "Co 86032 (Nira)",
    durationMonths: "12-14",
    description: "High yielding, rich sucrose content, drought tolerant",
    active: true,
  },
  {
    varietyId: "265",
    varietyName: "265",
    displayName: "CoM 0265 (Phule 265)",
    durationMonths: "12-14",
    description: "Heavy tillering, high tonnage, saline-alkaline tolerant",
    active: true,
  },
  {
    varietyId: "13007",
    varietyName: "13007",
    displayName: "Co 13007",
    durationMonths: "10-12",
    description: "Early maturing, high sugar recovery, good ratoonability",
    active: true,
  },
];

export const SUGARCANE_SPACINGS: SpacingConfig[] = [
  {
    spacingId: "4.5x1.5",
    spacingValue: "4.5 × 1.5",
    displayName: "4.5 ft × 1.5 ft (Wide Row)",
    unit: "feet",
    description: "Optimal for mechanized intercultural operations and drip lateral lines",
    active: true,
  },
  {
    spacingId: "4x1.5",
    spacingValue: "4 × 1.5",
    displayName: "4 ft × 1.5 ft (Standard Row)",
    unit: "feet",
    description: "Conventional paired row planting with high plant population",
    active: true,
  },
];

export const PLANTING_SEASONS: SeasonRule[] = [
  {
    seasonKey: "Adsali",
    name: "Adsali",
    startMonth: 6, // June
    startDay: 15,
    endMonth: 9, // September
    endDay: 14,
    description: "15 June – 14 September (15–18 months cycle, highest yield)",
    badgeClass: "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800",
  },
  {
    seasonKey: "Pre-seasonal",
    name: "Pre-seasonal",
    startMonth: 9, // September
    startDay: 15,
    endMonth: 12, // December
    endDay: 30,
    description: "15 September – 30 December (13–15 months cycle)",
    badgeClass: "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800",
  },
  {
    seasonKey: "Suru",
    name: "Suru",
    startMonth: 1, // January
    startDay: 1,
    endMonth: 3, // March
    endDay: 31,
    description: "1 January – 31 March (12 months cycle)",
    badgeClass: "bg-sky-100 text-sky-800 border-sky-300 dark:bg-sky-950 dark:text-sky-300 dark:border-sky-800",
  },
];
