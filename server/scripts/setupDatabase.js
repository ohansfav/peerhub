#!/usr/bin/env node

/**
 * Script to setup database and create admin user
 * Run: node scripts/setupDatabase.js
 */

require("module-alias/register");
require("dotenv").config();

const sequelize = require("@src/shared/database/index");
require("@models"); // Load all models
const { User, Subject, Exam } = require("@models");

async function setupDatabase() {
  try {
    console.log("🔄 Setting up database...");
    
    // Sync database
    console.log("📊 Syncing database...");
    await sequelize.sync({ force: false, alter: false });
    console.log("✅ Database synced");

    // Check if admin already exists
    const existingAdmin = await User.findOne({
      where: { email: "admin@peerup.com" },
    });

    if (existingAdmin) {
      console.log("\n⚠️  Admin user already exists!");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log("📧 Email:    admin@peerup.com")
      console.log("🔐 Password: admin123");
      console.log("👤 Role:     admin");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
      await sequelize.close();
      process.exit(0);
    }

    // Create admin user (password will be auto-hashed by beforeCreate hook)
    console.log("👤 Creating admin user...");
    const adminUser = await User.create({
      email: "admin@peerup.com",
      firstName: "Admin",
      lastName: "User",
      passwordHash: "admin123", // Hook will hash this automatically
      role: "admin",
      isVerified: true,
      isOnboarded: true,
      accountStatus: "active",
      lastLogin: new Date(),
    });

    console.log("\n✅ Admin user created successfully!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📧 Email:    admin@peerhub.com")
    console.log("🔐 Password: admin123");
    console.log("👤 Role:     admin");
    console.log("🆔 User ID:  " + adminUser.id);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    // Create exams for onboarding
    console.log("📝 Creating exams...");
    const examsData = [
      {
        name: "Semester Exam",
        description: "End of semester university examinations",
        isActive: true,
      },
      {
        name: "Mid-Semester Test",
        description: "Mid-semester continuous assessment tests",
        isActive: true,
      },
      {
        name: "Project Defence",
        description: "Final year project and thesis defence preparation",
        isActive: true,
      },
      {
        name: "Professional Certification",
        description: "Professional exams like ICAN, ANAN, NSE, COREN, etc.",
        isActive: true,
      },
    ];

    // Check if exams already exist
    const existingExams = await Exam.findAll();
    if (existingExams.length > 0) {
      console.log("⚠️  Exams already exist! Skipping exam creation.");
    } else {
      await Exam.bulkCreate(examsData);
      console.log(`✅ Created ${examsData.length} exams\n`);
    }

    // Create subjects for onboarding
    console.log("📚 Creating subjects...");
    const subjectsData = [
      {
        name: "Computer Science",
        description: "Programming, algorithms, data structures, and software engineering",
        isActive: true,
      },
      {
        name: "Mathematics",
        description: "Calculus, linear algebra, statistics, and discrete mathematics",
        isActive: true,
      },
      {
        name: "English",
        description: "Academic writing, communication skills, and literature",
        isActive: true,
      },
      {
        name: "Physics",
        description: "Mechanics, thermodynamics, electromagnetism, and modern physics",
        isActive: true,
      },
      {
        name: "Chemistry",
        description: "Organic, inorganic, physical, and analytical chemistry",
        isActive: true,
      },
      {
        name: "Biology",
        description: "Cell biology, genetics, microbiology, and ecology",
        isActive: true,
      },
      {
        name: "Accounting",
        description: "Financial accounting, cost accounting, and auditing",
        isActive: true,
      },
      {
        name: "Economics",
        description: "Microeconomics, macroeconomics, and development economics",
        isActive: true,
      },
      {
        name: "Business Administration",
        description: "Management principles, marketing, and organizational behaviour",
        isActive: true,
      },
      {
        name: "Mass Communication",
        description: "Media studies, journalism, public relations, and broadcasting",
        isActive: true,
      },
      {
        name: "Political Science",
        description: "Government, international relations, and public administration",
        isActive: true,
      },
      {
        name: "Law",
        description: "Constitutional law, contract law, criminal law, and jurisprudence",
        isActive: true,
      },
      {
        name: "Education",
        description: "Curriculum studies, educational psychology, and teaching methods",
        isActive: true,
      },
      {
        name: "Engineering",
        description: "Mechanical, electrical, civil, and chemical engineering fundamentals",
        isActive: true,
      },
      {
        name: "Biochemistry",
        description: "Molecular biology, enzymology, and metabolic pathways",
        isActive: true,
      },
      {
        name: "Microbiology",
        description: "Bacteriology, virology, immunology, and parasitology",
        isActive: true,
      },
      {
        name: "Sociology",
        description: "Social theory, research methods, and social institutions",
        isActive: true,
      },
      {
        name: "Philosophy",
        description: "Logic, ethics, epistemology, and African philosophy",
        isActive: true,
      },
    ];

    // Check if subjects already exist
    const existingSubjects = await Subject.findAll();
    if (existingSubjects.length > 0) {
      console.log(
        "⚠️  Subjects already exist! Skipping subject creation."
      );
    } else {
      await Subject.bulkCreate(subjectsData);
      console.log(`✅ Created ${subjectsData.length} subjects\n`);
    }

    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error:", error.message);
    if (error.sql) {
      console.error("SQL:", error.sql);
    }
    process.exit(1);
  }
}

setupDatabase();
