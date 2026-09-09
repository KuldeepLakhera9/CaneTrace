import { PincodeLookupResponse } from "@/types";

// Sugarcane belt offline cache & fallback for high resilience
const PINCODE_FALLBACK_DATABASE: Record<string, { villages: string[]; taluka: string; district: string; state: string }> = {
  // Kolhapur district
  "416001": {
    villages: ["Kolhapur H.O", "Bhavani Mandap", "Shahupuri", "Rajarampuri", "Kasaba Bawada"],
    taluka: "Karveer",
    district: "Kolhapur",
    state: "Maharashtra",
  },
  "416115": {
    villages: ["Shirol", "Jambli", "Danoli", "Alas", "Ghalwad"],
    taluka: "Shirol",
    district: "Kolhapur",
    state: "Maharashtra",
  },
  "416109": {
    villages: ["Ichalkaranji", "Shahapur", "Kabnoor", "Korochi"],
    taluka: "Hatkanangle",
    district: "Kolhapur",
    state: "Maharashtra",
  },
  // Pune district
  "412206": {
    villages: ["Baramati", "Malegaon Khurd", "Songaon", "Dorlewadi", "Late"],
    taluka: "Baramati",
    district: "Pune",
    state: "Maharashtra",
  },
  "411001": {
    villages: ["Pune H.O", "Shivajinagar", "Camp", "Mangalwar Peth"],
    taluka: "Haveli",
    district: "Pune",
    state: "Maharashtra",
  },
  // Sangli district
  "416416": {
    villages: ["Sangli H.O", "Miraj", "Kupwad", "Madhavnagar", "Wanlesswadi"],
    taluka: "Miraj",
    district: "Sangli",
    state: "Maharashtra",
  },
  "415409": {
    villages: ["Walwa", "Islampur", "Borgaon", "Kasegaon", "Peth"],
    taluka: "Walwa",
    district: "Sangli",
    state: "Maharashtra",
  },
  // Satara district
  "415001": {
    villages: ["Satara H.O", "Karanje", "Godoli", "Shahupuri Satara"],
    taluka: "Satara",
    district: "Satara",
    state: "Maharashtra",
  },
  "415110": {
    villages: ["Karad H.O", "Ogalewadi", "Malkapur", "Vidyanagar Karad"],
    taluka: "Karad",
    district: "Satara",
    state: "Maharashtra",
  },
  // Solapur district
  "413001": {
    villages: ["Solapur H.O", "Bhavani Peth", "Ashok Chowk", "Railway Lines"],
    taluka: "Solapur North",
    district: "Solapur",
    state: "Maharashtra",
  },
  "413304": {
    villages: ["Pandharpur H.O", "Bhatambre", "Karkamb", "Tungat"],
    taluka: "Pandharpur",
    district: "Solapur",
    state: "Maharashtra",
  },
  // Ahmednagar district
  "414001": {
    villages: ["Ahmednagar H.O", "Savedi", "Bhingar", "Kedgaon"],
    taluka: "Nagar",
    district: "Ahmednagar",
    state: "Maharashtra",
  },
  "413709": {
    villages: ["Shrirampur H.O", "Belapur", "Padhegaon", "Taklibhan"],
    taluka: "Shrirampur",
    district: "Ahmednagar",
    state: "Maharashtra",
  },
  "423107": {
    villages: ["Kopargaon H.O", "Sanjivani Factory", "Dharangaon", "Pohegaon"],
    taluka: "Kopargaon",
    district: "Ahmednagar",
    state: "Maharashtra",
  },
  // Belagavi / Karnataka
  "590001": {
    villages: ["Belgaum H.O", "Camp Belgaum", "Tilakwadi", "Shahapur Belgaum"],
    taluka: "Belagavi",
    district: "Belagavi",
    state: "Karnataka",
  },
};

/**
 * Validates and looks up an Indian 6-digit pincode.
 * Connects to the public Postal Pincode API with timeout, and falls back to
 * built-in sugarcane belt geo database if unavailable.
 */
export async function lookupPincode(pincode: string): Promise<PincodeLookupResponse> {
  const cleanPincode = pincode.trim();

  // Validate 6 digits
  if (!/^\d{6}$/.test(cleanPincode)) {
    return {
      success: false,
      pincode: cleanPincode,
      villages: [],
      taluka: "",
      district: "",
      state: "",
      error: "Pincode must be exactly 6 numeric digits.",
    };
  }

  // 1. Try public postal API
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000); // 4 sec timeout

    const response = await fetch(`https://api.postalpincode.in/pincode/${cleanPincode}`, {
      signal: controller.signal,
      headers: {
        Accept: "application/json",
      },
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();

      if (Array.isArray(data) && data.length > 0 && data[0].Status === "Success" && Array.isArray(data[0].PostOffice)) {
        const postOffices = data[0].PostOffice;
        const villages = Array.from(
          new Set(
            postOffices
              .map((po: { Name?: string }) => po.Name)
              .filter((name: string | undefined): name is string => Boolean(name && name.trim()))
          )
        );

        const first = postOffices[0];
        const taluka = first.Block && first.Block !== "NA" ? first.Block : (first.Taluk && first.Taluk !== "NA" ? first.Taluk : first.District);
        const district = first.District || "";
        const state = first.State || "";

        return {
          success: true,
          pincode: cleanPincode,
          villages: villages.length > 0 ? villages : [first.Name || "Main Village"],
          taluka: taluka || district,
          district: district,
          state: state,
        };
      }
    }
  } catch (error) {
    console.warn(`[PincodeService] Remote lookup for ${cleanPincode} failed or timed out. Checking local fallback.`);
  }

  // 2. Check local fallback database
  if (PINCODE_FALLBACK_DATABASE[cleanPincode]) {
    const cached = PINCODE_FALLBACK_DATABASE[cleanPincode];
    return {
      success: true,
      pincode: cleanPincode,
      villages: cached.villages,
      taluka: cached.taluka,
      district: cached.district,
      state: cached.state,
    };
  }

  // 3. Fallback for any unknown 6-digit pincode: provide intelligent default so user is not blocked
  return {
    success: false,
    pincode: cleanPincode,
    villages: [],
    taluka: "",
    district: "",
    state: "",
    error: `No location details found for pincode ${cleanPincode}. Please verify the pincode.`,
  };
}
