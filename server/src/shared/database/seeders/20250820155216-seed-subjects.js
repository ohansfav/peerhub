"use strict";

module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert(
      "subjects",
      [
        {
          name: "Computer Science",
          description: "Programming, algorithms, data structures, and software engineering",
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          name: "Mathematics",
          description: "Calculus, linear algebra, statistics, and discrete mathematics",
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          name: "English",
          description: "Academic writing, communication skills, and literature",
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          name: "Physics",
          description: "Mechanics, thermodynamics, electromagnetism, and modern physics",
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          name: "Chemistry",
          description: "Organic, inorganic, physical, and analytical chemistry",
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          name: "Biology",
          description: "Cell biology, genetics, microbiology, and ecology",
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          name: "Accounting",
          description: "Financial accounting, cost accounting, and auditing",
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          name: "Economics",
          description: "Microeconomics, macroeconomics, and development economics",
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          name: "Business Administration",
          description: "Management principles, marketing, and organizational behaviour",
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          name: "Mass Communication",
          description: "Media studies, journalism, public relations, and broadcasting",
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          name: "Political Science",
          description: "Government, international relations, and public administration",
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          name: "Law",
          description: "Constitutional law, contract law, criminal law, and jurisprudence",
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          name: "Education",
          description: "Curriculum studies, educational psychology, and teaching methods",
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          name: "Engineering",
          description: "Mechanical, electrical, civil, and chemical engineering fundamentals",
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          name: "Biochemistry",
          description: "Molecular biology, enzymology, and metabolic pathways",
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          name: "Microbiology",
          description: "Bacteriology, virology, immunology, and parasitology",
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          name: "Sociology",
          description: "Social theory, research methods, and social institutions",
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          name: "Philosophy",
          description: "Logic, ethics, epistemology, and African philosophy",
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      { ignoreDuplicates: true }
    );
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("subjects", {
      name: [
        "Computer Science", "Mathematics", "English", "Physics", "Chemistry",
        "Biology", "Accounting", "Economics", "Business Administration",
        "Mass Communication", "Political Science", "Law", "Education",
        "Engineering", "Biochemistry", "Microbiology", "Sociology", "Philosophy",
      ],
    });
  },
};
