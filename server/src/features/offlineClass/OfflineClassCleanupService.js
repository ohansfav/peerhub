const schedule = require("node-schedule");
const { Op } = require("sequelize");
const logger = require("@utils/logger");
const { OfflineClass } = require("@models");

class OfflineClassCleanupService {
  constructor() {
    this.job = null;
    this.maxIdleMinutes = Number(process.env.OFFLINE_CLASS_MAX_IDLE_MINUTES || 60);
    this.cron = process.env.OFFLINE_CLASS_CLEANUP_CRON || "*/5 * * * *";
  }

  async runCleanup() {
    const cutoff = new Date(Date.now() - this.maxIdleMinutes * 60 * 1000);

    const [endedCount] = await OfflineClass.update(
      {
        isActive: false,
        endedAt: new Date(),
      },
      {
        where: {
          isActive: true,
          [Op.or]: [
            {
              lastFrameAt: {
                [Op.lt]: cutoff,
              },
            },
            {
              lastFrameAt: {
                [Op.is]: null,
              },
              startedAt: {
                [Op.lt]: cutoff,
              },
            },
          ],
        },
      }
    );

    if (endedCount > 0) {
      logger.info("Offline class cleanup ended stale classes", {
        endedCount,
        cutoff: cutoff.toISOString(),
      });
    }
  }

  async start() {
    await this.runCleanup();

    if (this.job) {
      this.job.cancel();
      this.job = null;
    }

    this.job = schedule.scheduleJob(this.cron, async () => {
      try {
        await this.runCleanup();
      } catch (error) {
        logger.error("Offline class cleanup failed", {
          error: error.message,
        });
      }
    });

    logger.info("Offline class cleanup scheduler started", {
      cron: this.cron,
      maxIdleMinutes: this.maxIdleMinutes,
    });
  }

  stop() {
    if (!this.job) {
      return;
    }

    this.job.cancel();
    this.job = null;
    logger.info("Offline class cleanup scheduler stopped");
  }
}

module.exports = OfflineClassCleanupService;
