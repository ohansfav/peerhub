#!/usr/bin/env node

/**
 * Script to create an admin user
 * Run: node scripts/createAdmin.js
 */

require("module-alias/register");
require("dotenv").config();

const sequelize = require("@src/shared/database/index");
const { User } = require("@models");
const bcrypt = require("bcrypt");

async function createAdminUser() {
  try {
    console.log("🔄 Connecting to database...");
    await sequelize.authenticate();
    console.log("✅ Database connected");

    // Check if admin already exists
    const existingAdmin = await User.findOne({
      where: { email: "admin@peerup.com" },
    });

    if (existingAdmin) {
      console.log("Admin user already exists with email: admin@peerup.com");
      console.log("👤 Email: admin@peerup.com");
      console.log("🔐 Password: admin123");
      process.exit(0);
    }

    // Hash the password
    const password = "admin123";
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create admin user
    console.log("👤 Creating admin user...");
    const adminUser = await User.create({
      email: "admin@peerup.com",
      firstName: "Admin",
      lastName: "User",
      passwordHash: passwordHash,
      role: "admin",
      isVerified: true,
      isOnboarded: true,
      accountStatus: "active",
      lastLogin: new Date(),
    });

    console.log("\n✅ Admin user created successfully!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📧 Email:    admin@peerup.com");
    console.log("🔐 Password: admin123");
    console.log("👤 Role:     admin");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating admin user:", error.message);
    process.exit(1);
  }
}

createAdminUser();
