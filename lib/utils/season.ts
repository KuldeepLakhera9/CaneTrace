export type SeasonType = "Adsali" | "Pre-seasonal" | "Suru";

export interface SeasonCalculationResult {
  season: SeasonType | null;
  isValid: boolean;
  message?: string;
  seasonDetails?: {
    name: SeasonType;
    period: string;
    description: string;
    badgeClass: string;
  };
}

/**
 * Calculates sugarcane planting season based on planting date according to agronomic standards:
 * - Adsali: 15 June – 14 September
 * - Pre-seasonal: 15 September – 30 December
 * - Suru: 1 January – 31 March
 * - Unsupported: 1 April – 14 June (and 31 December)
 *
 * @param date Planting date as Date object or YYYY-MM-DD string
 */
export function calculatePlantingSeason(date: Date | string | null | undefined): SeasonCalculationResult {
  if (!date) {
    return {
      season: null,
      isValid: false,
      message: "Please select a planting date.",
    };
  }

  const d = typeof date === "string" ? new Date(date) : date;

  if (isNaN(d.getTime())) {
    return {
      season: null,
      isValid: false,
      message: "Invalid date format.",
    };
  }

  // Use UTC or local date parts consistently
  // Month is 0-indexed in JavaScript Date (0 = Jan, 11 = Dec)
  const month = d.getMonth() + 1; // 1 = Jan, 12 = Dec
  const day = d.getDate();

  // 1. Suru: 1 January through 31 March
  if (month >= 1 && month <= 3) {
    return {
      season: "Suru",
      isValid: true,
      seasonDetails: {
        name: "Suru",
        period: "1 Jan – 31 Mar",
        description: "12-month standard harvest cycle (January to March planting).",
        badgeClass: "bg-sky-100 text-sky-800 border-sky-300 dark:bg-sky-950 dark:text-sky-300 dark:border-sky-800",
      },
    };
  }

  // 2. Unsupported gap: 1 April through 14 June
  if (month === 4 || month === 5 || (month === 6 && day < 15)) {
    return {
      season: null,
      isValid: false,
      message: "Planting dates between 1 April and 14 June are out-of-season for commercial sugarcane cultivation in this region.",
    };
  }

  // 3. Adsali: 15 June through 14 September
  if ((month === 6 && day >= 15) || month === 7 || month === 8 || (month === 9 && day <= 14)) {
    return {
      season: "Adsali",
      isValid: true,
      seasonDetails: {
        name: "Adsali",
        period: "15 Jun – 14 Sep",
        description: "15 to 18-month high-tonnage cycle (Monsoon planting).",
        badgeClass: "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800",
      },
    };
  }

  // 4. Pre-seasonal: 15 September through 30 December
  if ((month === 9 && day >= 15) || month === 10 || month === 11 || (month === 12 && day <= 30)) {
    return {
      season: "Pre-seasonal",
      isValid: true,
      seasonDetails: {
        name: "Pre-seasonal",
        period: "15 Sep – 30 Dec",
        description: "13 to 15-month cycle (Post-monsoon planting).",
        badgeClass: "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800",
      },
    };
  }

  // 5. 31 December edge-case
  if (month === 12 && day === 31) {
    return {
      season: null,
      isValid: false,
      message: "Planting date (31 December) is outside standard season cutoffs. Sugarcane planting resumes for Suru season on 1 January.",
    };
  }

  return {
    season: null,
    isValid: false,
    message: "Date does not fall within a supported sugarcane planting season.",
  };
}
