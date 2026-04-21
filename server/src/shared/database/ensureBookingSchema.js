async function ensureBookingSchema(sequelize, logger = console) {
  if (sequelize.getDialect() !== "sqlite") {
    return;
  }

  const [rows] = await sequelize.query(
    "SELECT sql FROM sqlite_master WHERE type='table' AND name='bookings'"
  );

  const createSql = rows?.[0]?.sql || "";
  if (!createSql) {
    return;
  }

  const hasLegacyUniqueConstraints =
    /tutor_id[^,]*\bUNIQUE\b/i.test(createSql) ||
    /scheduled_start[^,]*\bUNIQUE\b/i.test(createSql) ||
    /scheduled_end[^,]*\bUNIQUE\b/i.test(createSql) ||
    /student_id[^,]*\bUNIQUE\b/i.test(createSql);

  if (!hasLegacyUniqueConstraints) {
    return;
  }

  logger.info("Repairing legacy bookings schema constraints...");

  await sequelize.query("PRAGMA foreign_keys = OFF");

  try {
    await sequelize.query(`
      CREATE TABLE bookings_new (
        id UUID NOT NULL PRIMARY KEY,
        tutor_id UUID NOT NULL REFERENCES tutor_profiles (user_id) ON UPDATE CASCADE ON DELETE RESTRICT,
        student_id UUID REFERENCES student_profiles (user_id) ON UPDATE CASCADE ON DELETE RESTRICT,
        subject_id INTEGER REFERENCES subjects (id) ON UPDATE CASCADE ON DELETE RESTRICT,
        scheduled_start DATETIME NOT NULL,
        scheduled_end DATETIME NOT NULL,
        status TEXT NOT NULL DEFAULT 'open',
        meeting_link VARCHAR(500),
        tutor_notes TEXT,
        student_notes TEXT,
        cancelled_by UUID REFERENCES users (id) ON UPDATE CASCADE ON DELETE SET NULL,
        cancelled_at DATETIME,
        cancellation_reason TEXT,
        is_recurring TINYINT(1) NOT NULL DEFAULT 0,
        recurring_pattern JSON,
        parent_booking_id UUID REFERENCES bookings (id) ON UPDATE CASCADE ON DELETE CASCADE,
        reminders JSONB NOT NULL DEFAULT '{"reminderSlot1":false,"reminderSlot2":false,"reminderSlot3":false}',
        actual_start_time DATETIME,
        actual_end_time DATETIME,
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL
      )
    `);

    await sequelize.query(`
      INSERT INTO bookings_new (
        id,
        tutor_id,
        student_id,
        subject_id,
        scheduled_start,
        scheduled_end,
        status,
        meeting_link,
        tutor_notes,
        student_notes,
        cancelled_by,
        cancelled_at,
        cancellation_reason,
        is_recurring,
        recurring_pattern,
        parent_booking_id,
        reminders,
        actual_start_time,
        actual_end_time,
        created_at,
        updated_at
      )
      SELECT
        id,
        tutor_id,
        student_id,
        subject_id,
        scheduled_start,
        scheduled_end,
        status,
        meeting_link,
        tutor_notes,
        student_notes,
        cancelled_by,
        cancelled_at,
        cancellation_reason,
        is_recurring,
        recurring_pattern,
        parent_booking_id,
        reminders,
        actual_start_time,
        actual_end_time,
        created_at,
        updated_at
      FROM bookings
    `);

    await sequelize.query("DROP TABLE bookings");
    await sequelize.query("ALTER TABLE bookings_new RENAME TO bookings");

    await sequelize.query("CREATE INDEX IF NOT EXISTS bookings_tutor_id ON bookings (tutor_id)");
    await sequelize.query("CREATE INDEX IF NOT EXISTS bookings_student_id ON bookings (student_id)");
    await sequelize.query("CREATE INDEX IF NOT EXISTS bookings_subject_id ON bookings (subject_id)");
    await sequelize.query("CREATE INDEX IF NOT EXISTS bookings_status ON bookings (status)");
    await sequelize.query("CREATE INDEX IF NOT EXISTS bookings_scheduled_start ON bookings (scheduled_start)");
    await sequelize.query("CREATE INDEX IF NOT EXISTS bookings_scheduled_end ON bookings (scheduled_end)");
    await sequelize.query(
      "CREATE UNIQUE INDEX IF NOT EXISTS tutor_time_conflict_check ON bookings (tutor_id, scheduled_start, scheduled_end)"
    );
    await sequelize.query(
      "CREATE UNIQUE INDEX IF NOT EXISTS student_time_conflict_check ON bookings (student_id, scheduled_start, scheduled_end)"
    );

    logger.info("Bookings schema repaired successfully");
  } finally {
    await sequelize.query("PRAGMA foreign_keys = ON");
  }
}

module.exports = ensureBookingSchema;
