"use strict";

module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert(
      "exams",
      [
        {
          name: "Semester Exam",
          description: "End of semester university examinations",
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          name: "Mid-Semester Test",
          description: "Mid-semester continuous assessment tests",
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          name: "Project Defence",
          description: "Final year project and thesis defence preparation",
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          name: "Professional Certification",
          description: "Professional exams like ICAN, ANAN, NSE, COREN, etc.",
          is_active: true,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      { ignoreDuplicates: true }
    );
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("exams", null, {});
  },
};
