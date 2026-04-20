"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const dialect = queryInterface.sequelize.getDialect();

    if (dialect === "sqlite") {
      await queryInterface.sequelize.transaction(async (transaction) => {
        await queryInterface.sequelize.query(
          `CREATE TABLE IF NOT EXISTS tutor_subjects_new (
            tutor_user_id UUID NOT NULL REFERENCES tutor_profiles(user_id) ON DELETE CASCADE,
            subject_id INTEGER NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (tutor_user_id, subject_id)
          )`,
          { transaction }
        );

        await queryInterface.sequelize.query(
          `INSERT OR IGNORE INTO tutor_subjects_new (tutor_user_id, subject_id, created_at, updated_at)
           SELECT tutor_user_id,
                  subject_id,
                  COALESCE(created_at, CURRENT_TIMESTAMP),
                  COALESCE(updated_at, CURRENT_TIMESTAMP)
           FROM tutor_subjects
           WHERE tutor_user_id IS NOT NULL
             AND subject_id IS NOT NULL`,
          { transaction }
        );

        await queryInterface.dropTable("tutor_subjects", { transaction });
        await queryInterface.renameTable("tutor_subjects_new", "tutor_subjects", {
          transaction,
        });
      });
      return;
    }

    // For PostgreSQL and other SQL dialects, ensure duplicate rows are removed
    // before applying the composite uniqueness for tutor/subject pairs.
    await queryInterface.sequelize.query(
      `DELETE FROM tutor_subjects a
       USING tutor_subjects b
       WHERE a.ctid < b.ctid
         AND a.tutor_user_id = b.tutor_user_id
         AND a.subject_id = b.subject_id`
    );

    await queryInterface.addConstraint("tutor_subjects", {
      fields: ["tutor_user_id", "subject_id"],
      type: "unique",
      name: "tutor_subjects_tutor_user_id_subject_id_unique",
    });
  },

  async down(queryInterface) {
    const dialect = queryInterface.sequelize.getDialect();

    if (dialect === "sqlite") {
      // No destructive rollback for SQLite repair migration.
      return;
    }

    await queryInterface.removeConstraint(
      "tutor_subjects",
      "tutor_subjects_tutor_user_id_subject_id_unique"
    );
  },
};
