import { format } from "date-fns";

export interface ExportRow {
  farmerId: string;
  farmerName: string;
  mobile: string;
  pincode: string;
  village: string;
  taluka: string;
  district: string;
  state: string;
  plantingDate: string | Date;
  season: string;
  sugarcaneVariety: string;
  spacing: string;
  createdAt: string | Date;
}

export function generateCsv(rows: ExportRow[]): string {
  const headers = [
    "Farmer ID",
    "Farmer Name",
    "Mobile",
    "Pincode",
    "Village",
    "Taluka",
    "District",
    "State",
    "Planting Date",
    "Season",
    "Sugarcane Variety",
    "Spacing",
    "Created Date",
  ];

  const escapeCsv = (val: string | number | null | undefined): string => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const csvRows = [headers.join(",")];

  for (const r of rows) {
    const formattedPlantingDate = r.plantingDate
      ? format(new Date(r.plantingDate), "dd-MMM-yyyy")
      : "";
    const formattedCreatedDate = r.createdAt
      ? format(new Date(r.createdAt), "dd-MMM-yyyy HH:mm")
      : "";

    const line = [
      escapeCsv(r.farmerId),
      escapeCsv(r.farmerName),
      escapeCsv(r.mobile),
      escapeCsv(r.pincode),
      escapeCsv(r.village),
      escapeCsv(r.taluka),
      escapeCsv(r.district),
      escapeCsv(r.state),
      escapeCsv(formattedPlantingDate),
      escapeCsv(r.season),
      escapeCsv(r.sugarcaneVariety),
      escapeCsv(r.spacing),
      escapeCsv(formattedCreatedDate),
    ].join(",");

    csvRows.push(line);
  }

  // Prepend UTF-8 BOM so Excel opens Indian fonts/characters without encoding issues
  return "\uFEFF" + csvRows.join("\r\n");
}
