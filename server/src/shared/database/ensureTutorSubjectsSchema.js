async function repairJoinTableIfMalformed({
  sequelize,
  tableName,
  leftColumn,
  leftRefTable,
  leftRefColumn,
  rightColumn,
  rightRefTable,
  rightRefColumn,
}) {
  const [rows] = await sequelize.query(
    `SELECT sql FROM sqlite_master WHERE type='table' AND name='${tableName}'`
  );

  if (!Array.isArray(rows) || rows.length === 0) return false;

  const tableSql = String(rows[0].sql || "");
  const hasBadUniqueConstraints =
    new RegExp(`${leftColumn}\\s+[^,]*\\bunique\\b`, "i").test(tableSql) ||
    new RegExp(`${rightColumn}\\s+[^,]*\\bunique\\b`, "i").test(tableSql);

  if (!hasBadUniqueConstraints) return false;

  const tempTable = `${tableName}_new`;

  await sequelize.transaction(async (transaction) => {
    await sequelize.query(
      `CREATE TABLE IF NOT EXISTS ${tempTable} (
        ${leftColumn} UUID NOT NULL REFERENCES ${leftRefTable}(${leftRefColumn}) ON DELETE CASCADE,
        ${rightColumn} INTEGER NOT NULL REFERENCES ${rightRefTable}(${rightRefColumn}) ON DELETE CASCADE,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (${leftColumn}, ${rightColumn})
      )`,
      { transaction }
    );

    await sequelize.query(
      `INSERT OR IGNORE INTO ${tempTable} (${leftColumn}, ${rightColumn}, created_at, updated_at)
       SELECT ${leftColumn},
              ${rightColumn},
              COALESCE(created_at, CURRENT_TIMESTAMP),
              COALESCE(updated_at, CURRENT_TIMESTAMP)
       FROM ${tableName}
       WHERE ${leftColumn} IS NOT NULL
         AND ${rightColumn} IS NOT NULL`,
      { transaction }
    );

    await sequelize.query(`DROP TABLE ${tableName}`, { transaction });
    await sequelize.query(
      `ALTER TABLE ${tempTable} RENAME TO ${tableName}`,
      { transaction }
    );
  });

  return true;
}

async function ensureTutorSubjectsSchema(sequelize, logger) {
  if (sequelize.getDialect() !== "sqlite") return;

  const repairedTutorSubjects = await repairJoinTableIfMalformed({
    sequelize,
    tableName: "tutor_subjects",
    leftColumn: "tutor_user_id",
    leftRefTable: "tutor_profiles",
    leftRefColumn: "user_id",
    rightColumn: "subject_id",
    rightRefTable: "subjects",
    rightRefColumn: "id",
  });

  const repairedStudentSubjects = await repairJoinTableIfMalformed({
    sequelize,
    tableName: "student_subjects",
    leftColumn: "student_user_id",
    leftRefTable: "student_profiles",
    leftRefColumn: "user_id",
    rightColumn: "subject_id",
    rightRefTable: "subjects",
    rightRefColumn: "id",
  });

  if (repairedTutorSubjects) {
    logger.info("Repaired tutor_subjects SQLite schema to composite key format");
  }

  if (repairedStudentSubjects) {
    logger.info("Repaired student_subjects SQLite schema to composite key format");
  }
}

module.exports = ensureTutorSubjectsSchema;
