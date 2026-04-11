#!/usr/bin/env node

require("module-alias/register");
require("dotenv").config();

const sequelize = require("@src/shared/database/index");
require("@models");
const { User } = require("@models");
const bcrypt = require("bcrypt");

async function testLogin() {
  try {
    console.log("🔄 Testing admin login...\n");
    
    const adminUser = await User.findOne({
      where: { email: "admin@peerup.com" },
      attributes: ["id", "email", "passwordHash", "role", "isVerified"],
    });

    if (!adminUser) {
      console.log("❌ Admin user not found in database");
      process.exit(1);
    }

    console.log("👤 Admin User Found:");
    console.log("  Email:", adminUser.email);
    console.log("  Role:", adminUser.role);
    console.log("  Verified:", adminUser.isVerified);
    console.log("  Password Hash:", adminUser.passwordHash.substring(0, 20) + "...");
    console.log();

    const testPassword = "admin123";
    console.log("🔐 Testing password verification...");
    console.log("  Testing password: " + testPassword);
    
    const isMatch = await bcrypt.compare(testPassword, adminUser.passwordHash);
    console.log("  Password match result:", isMatch);
    
    if (isMatch) {
      console.log("\n✅ Password verification succeeded!");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log("The admin account should work. If still getting");
      console.log("'invalid username and password', check:");
      console.log("1. Frontend is sending: email, password (not username)");
      console.log("2. Server was restarted after DB was recreated");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    } else {
      console.log("\n❌ Password verification FAILED!");
      console.log("The password hash doesn't match the test password.");
    }

    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

testLogin();
