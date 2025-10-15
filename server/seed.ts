import { db } from "./db";
import { users, vehicles } from "@shared/schema";

async function seed() {
  console.log("🌱 Seeding database...");

  try {
    // Create sample users (owners)
    const [owner1, owner2] = await db.insert(users).values([
      {
        email: "owner1@driveease.com",
        name: "Rajesh Kumar",
        phone: "+91 98765 43210",
        role: "owner",
      },
      {
        email: "owner2@driveease.com",
        name: "Priya Sharma",
        phone: "+91 98765 43211",
        role: "owner",
      },
    ]).returning();

    console.log("✅ Created users");

    // Create sample vehicles
    await db.insert(vehicles).values([
      // Cars
      {
        ownerId: owner1.id,
        name: "Honda City VX",
        type: "car",
        brand: "Honda",
        model: "City",
        year: 2023,
        seats: 5,
        fuelType: "petrol",
        transmission: "automatic",
        registrationNumber: "MH 01 AB 1234",
        pricePerHour: "250",
        pricePerDay: "2500",
        location: "Mumbai",
        imageUrl: "https://images.unsplash.com/photo-1590362891991-f776e747a588?q=80&w=800",
        features: ["GPS", "Bluetooth", "Air Conditioning", "Power Steering"],
        available: true,
      },
      {
        ownerId: owner1.id,
        name: "Maruti Swift Dzire",
        type: "car",
        brand: "Maruti",
        model: "Swift Dzire",
        year: 2022,
        seats: 5,
        fuelType: "petrol",
        transmission: "manual",
        registrationNumber: "MH 01 CD 5678",
        pricePerHour: "200",
        pricePerDay: "2000",
        location: "Mumbai",
        imageUrl: "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?q=80&w=800",
        features: ["Bluetooth", "Air Conditioning", "Power Windows"],
        available: true,
      },
      {
        ownerId: owner2.id,
        name: "Hyundai Creta SX",
        type: "car",
        brand: "Hyundai",
        model: "Creta",
        year: 2024,
        seats: 5,
        fuelType: "diesel",
        transmission: "automatic",
        registrationNumber: "DL 01 EF 9012",
        pricePerHour: "350",
        pricePerDay: "3500",
        location: "Delhi",
        imageUrl: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=800",
        features: ["GPS", "Sunroof", "Bluetooth", "Cruise Control", "Air Conditioning"],
        available: true,
      },
      {
        ownerId: owner2.id,
        name: "Toyota Innova Crysta",
        type: "car",
        brand: "Toyota",
        model: "Innova Crysta",
        year: 2023,
        seats: 7,
        fuelType: "diesel",
        transmission: "automatic",
        registrationNumber: "KA 01 GH 3456",
        pricePerHour: "400",
        pricePerDay: "4000",
        location: "Bangalore",
        imageUrl: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=800",
        features: ["GPS", "Bluetooth", "Air Conditioning", "Touchscreen", "7 Seater"],
        available: true,
      },
      // Bikes
      {
        ownerId: owner1.id,
        name: "Royal Enfield Classic 350",
        type: "bike",
        brand: "Royal Enfield",
        model: "Classic 350",
        year: 2023,
        fuelType: "petrol",
        transmission: "manual",
        registrationNumber: "MH 02 IJ 7890",
        pricePerHour: "150",
        pricePerDay: "1200",
        location: "Mumbai",
        imageUrl: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?q=80&w=800",
        features: ["Disc Brakes", "Electric Start"],
        available: true,
      },
      {
        ownerId: owner2.id,
        name: "Honda Activa 6G",
        type: "bike",
        brand: "Honda",
        model: "Activa 6G",
        year: 2024,
        fuelType: "petrol",
        transmission: "automatic",
        registrationNumber: "DL 02 KL 1234",
        pricePerHour: "100",
        pricePerDay: "800",
        location: "Delhi",
        imageUrl: "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?q=80&w=800",
        features: ["Digital Display", "USB Charging", "LED Lights"],
        available: true,
      },
      {
        ownerId: owner1.id,
        name: "Bajaj Pulsar NS200",
        type: "bike",
        brand: "Bajaj",
        model: "Pulsar NS200",
        year: 2023,
        fuelType: "petrol",
        transmission: "manual",
        registrationNumber: "KA 02 MN 5678",
        pricePerHour: "120",
        pricePerDay: "1000",
        location: "Bangalore",
        imageUrl: "https://images.unsplash.com/photo-1609630875171-b1321377ee65?q=80&w=800",
        features: ["ABS", "Disc Brakes", "Digital Console"],
        available: true,
      },
      {
        ownerId: owner2.id,
        name: "TVS Apache RTR 160",
        type: "bike",
        brand: "TVS",
        model: "Apache RTR 160",
        year: 2022,
        fuelType: "petrol",
        transmission: "manual",
        registrationNumber: "TN 01 OP 9012",
        pricePerHour: "110",
        pricePerDay: "900",
        location: "Chennai",
        imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=800",
        features: ["ABS", "LED Tail Lights", "Digital Speedometer"],
        available: true,
      },
    ]);

    console.log("✅ Created vehicles");
    console.log("🎉 Database seeded successfully!");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
}

seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
