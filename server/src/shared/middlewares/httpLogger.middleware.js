const morgan = require("morgan");
const logger = require("@utils/logger");

const skipLogForRoute = (url = "") =>
  /\/api\/offline-class\/[^/]+\/(frame|participant-frame)$/.test(url) ||
  /^\/api\/local-chat\//.test(url);

const httpLogger = morgan((tokens, req, res) => {
  try {
    const logData = {
      method: tokens.method(req, res),
      url: tokens.url(req, res),
      status: Number(tokens.status(req, res)),
      contentLength: tokens.res(req, res, "content-length"),
      responseTime: Number(tokens["response-time"](req, res)),
    };

    const level =
      logData.status >= 500 ? "error" : logData.status >= 400 ? "warn" : "info";

    logger[level]("HTTP Access Log", logData);
  } catch (error) {
    logger.error("Failed to parse morgan log", { error: error.message });
  }
}, {
  skip: (req, res) => {
    if (skipLogForRoute(req.originalUrl || req.url)) {
      return true;
    }

    const isDev = process.env.NODE_ENV !== "production";
    const shouldLogAll = String(process.env.LOG_HTTP_ALL || "").toLowerCase() === "true";
    if (isDev && !shouldLogAll && res.statusCode < 400) {
      return true;
    }

    return false;
  },
});

module.exports = httpLogger;
