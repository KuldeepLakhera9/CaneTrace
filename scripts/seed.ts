import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { Farmer } from "../lib/models/Farmer";
import { Cultivation } from "../lib/models/Cultivation";
import { User } from "../lib/models/User";

import { connectToDatabase } from "../lib/db/connect";

async function seed() {
  console.log("🌱 Starting CaneTrace Database Seed...");

  try {
    const conn = await connectToDatabase();
    if (!conn) {
      throw new Error("Could not establish connection to database.");
    }
    console.log("✓ Connected to MongoDB Atlas.");

    // Clean existing records if desired
    console.log("Cleaning existing demo collections...");
    await Farmer.deleteMany({});
    await Cultivation.deleteMany({});
    await User.deleteMany({});

    // 1. Create Default Users
    const passwordHash = await bcrypt.hash("Password@123", 10);
    const users = await User.create([
      {
        email: "admin@canetrace.org",
        name: "Dr. Vikram Deshpande",
        passwordHash,
        role: "admin",
        active: true,
      },
      {
        email: "officer@canetrace.org",
        name: "Sunil Kulkarni",
        passwordHash,
        role: "employee",
        active: true,
      },
    ]);
    console.log(`✓ Seeded ${users.length} authorized platform users.`);

    // 2. Create Farmers
    const farmersData = [
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
      },
    ];

    const farmers = await Farmer.create(farmersData);
    console.log(`✓ Seeded ${farmers.length} sugarcane farmers.`);

    // 3. Create Cultivations (including multi-cultivations for same farmer)
    const cultivationsData = [
      {
        cultivationId: "C000001",
        farmerId: "F000001",
        plantingDate: new Date("2026-07-10"),
        season: "Adsali",
        sugarcaneVariety: "86032",
        spacing: "4.5 × 1.5",
      },
      {
        cultivationId: "C000002",
        farmerId: "F000001", // Second cycle for F000001
        plantingDate: new Date("2026-01-20"),
        season: "Suru",
        sugarcaneVariety: "265",
        spacing: "4 × 1.5",
      },
      {
        cultivationId: "C000003",
        farmerId: "F000002",
        plantingDate: new Date("2026-08-05"),
        season: "Adsali",
        sugarcaneVariety: "265",
        spacing: "4.5 × 1.5",
      },
      {
        cultivationId: "C000004",
        farmerId: "F000003",
        plantingDate: new Date("2026-08-22"),
        season: "Adsali",
        sugarcaneVariety: "13007",
        spacing: "4 × 1.5",
      },
      {
        cultivationId: "C000005",
        farmerId: "F000004",
        plantingDate: new Date("2026-10-05"),
        season: "Pre-seasonal",
        sugarcaneVariety: "86032",
        spacing: "4.5 × 1.5",
      },
      {
        cultivationId: "C000006",
        farmerId: "F000005",
        plantingDate: new Date("2026-11-12"),
        season: "Pre-seasonal",
        sugarcaneVariety: "265",
        spacing: "4 × 1.5",
      },
      {
        cultivationId: "C000007",
        farmerId: "F000006",
        plantingDate: new Date("2026-12-01"),
        season: "Pre-seasonal",
        sugarcaneVariety: "86032",
        spacing: "4.5 × 1.5",
      },
      {
        cultivationId: "C000008",
        farmerId: "F000007",
        plantingDate: new Date("2026-01-25"),
        season: "Suru",
        sugarcaneVariety: "13007",
        spacing: "4.5 × 1.5",
      },
      {
        cultivationId: "C000009",
        farmerId: "F000008",
        plantingDate: new Date("2026-02-18"),
        season: "Suru",
        sugarcaneVariety: "86032",
        spacing: "4 × 1.5",
      },
    ];

    const cultivations = await Cultivation.create(cultivationsData);
    console.log(`✓ Seeded ${cultivations.length} cultivation cycles.`);

    console.log("🎉 Seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
}

seed();
