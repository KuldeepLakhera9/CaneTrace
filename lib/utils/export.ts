import { format } from "date-fns";
import * as XLSX from "xlsx";

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

export function generateExcelBuffer(rows: ExportRow[]): Buffer {
  const formattedData = rows.map((r) => ({
    "Farmer ID": r.farmerId,
    "Farmer Name": r.farmerName,
    "Mobile Number": r.mobile,
    "Pincode": r.pincode,
    "Village": r.village,
    "Taluka": r.taluka,
    "District": r.district,
    "State": r.state,
    "Planting Date": r.plantingDate ? format(new Date(r.plantingDate), "dd-MMM-yyyy") : "",
    "Planting Season": r.season,
    "Sugarcane Variety": r.sugarcaneVariety,
    "Row Spacing": r.spacing,
    "Created Date": r.createdAt ? format(new Date(r.createdAt), "dd-MMM-yyyy HH:mm") : "",
  }));

  const worksheet = XLSX.utils.json_to_sheet(formattedData);

  // Set column widths for clean readability in Microsoft Excel
  worksheet["!cols"] = [
    { wch: 14 }, // Farmer ID
    { wch: 28 }, // Farmer Name
    { wch: 16 }, // Mobile Number
    { wch: 10 }, // Pincode
    { wch: 20 }, // Village
    { wch: 18 }, // Taluka
    { wch: 18 }, // District
    { wch: 16 }, // State
    { wch: 16 }, // Planting Date
    { wch: 16 }, // Season
    { wch: 20 }, // Variety
    { wch: 14 }, // Spacing
    { wch: 20 }, // Created Date
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Farmers & Cultivations");

  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
  return buffer;
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

  // Prepend UTF-8 BOM so Excel opens Indian characters properly
  return "\uFEFF" + csvRows.join("\r\n");
}
