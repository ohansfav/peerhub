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
      where: { email: "admin@peerhub.com" },
    });

    if (existingAdmin) {
      console.log("\n⚠️  Admin user already exists!");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log("📧 Email:    admin@peerhub.com")
      console.log("🔐 Password: admin123");
      console.log("👤 Role:     admin");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
      await sequelize.close();
      process.exit(0);
    }

    // Create admin user (password will be auto-hashed by beforeCreate hook)
    console.log("👤 Creating admin user...");
    const adminUser = await User.create({
      email: "admin@peerhub.com",
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
        name: "WAEC",
        description: "West African Examinations Council - Secondary school certificate",
        isActive: true,
      },
      {
        name: "JAMB",
        description: "Joint Admissions and Matriculation Board - University entrance exam",
        isActive: true,
      },
      {
        name: "NECO",
        description: "National Examination Council - Secondary school certificate alternative",
        isActive: true,
      },
      {
        name: "UTME",
        description: "Unified Tertiary Matriculation Examination - Replaced JAMB part 1",
        isActive: true,
      },
      {
        name: "POST-UTME",
        description: "Post-UTME screening examination for university admission",
        isActive: true,
      },
      {
        name: "Mock Exams",
        description: "Practice and mock examination papers",
        isActive: true,
      },
      {
        name: "GCE A-Levels",
        description: "General Certificate of Education Advanced Level",
        isActive: true,
      },
      {
        name: "Professional Exams",
        description: "Professional certification and licensing exams",
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
        name: "Mathematics",
        description: "Algebra, Geometry, Trigonometry, Calculus, and more",
        isActive: true,
      },
      {
        name: "English",
        description: "English Language, Literature, Grammar, and Writing",
        isActive: true,
      },
      {
        name: "Physics",
        description: "Mechanics, Electricity, Magnetism, Thermodynamics, and Waves",
        isActive: true,
      },
      {
        name: "Chemistry",
        description:
          "Inorganic Chemistry, Organic Chemistry, Physical Chemistry, and Biochemistry",
        isActive: true,
      },
      {
        name: "Biology",
        description: "Cell Biology, Genetics, Ecology, and Physiology",
        isActive: true,
      },
      {
        name: "History",
        description: "World History, African History, and Modern History",
        isActive: true,
      },
      {
        name: "Geography",
        description: "Physical Geography, Human Geography, and Cartography",
        isActive: true,
      },
      {
        name: "Economics",
        description: "Microeconomics, Macroeconomics, and Business Studies",
        isActive: true,
      },
      {
        name: "Government",
        description: "Political Science, Civic Education, and Public Administration",
        isActive: true,
      },
      {
        name: "Literature in English",
        description: "Poetry, Drama, Prose, and Literary Analysis",
        isActive: true,
      },
      {
        name: "Computer Science",
        description:
          "Programming, Algorithms, Data Structures, and Web Development",
        isActive: true,
      },
      {
        name: "French",
        description: "French Language, Grammar, Conversation, and Culture",
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
