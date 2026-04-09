const logger = require("../utils/logger");
const { mailtrapClient, sender } = require("./mailtrap.config");

const sendEmail = async (options) => {
  const enabled = process.env.EMAIL_ENABLED === "true";
  const emailService = process.env.EMAIL_SERVICE || "mailtrap";

  if (!enabled) {
    logger.info("📧 Email sending disabled. Would have sent:", options);
    return;
  }

  // For console testing (development mode)
  if (emailService === "console") {
    logger.info("📧 Email would be sent:");
    logger.info("  To:", options.to);
    logger.info("  Subject:", options.subject);
    
    // If verification email, extract and log the code
    if (options.subject?.includes("Verify") && options.html) {
      const codeMatch = options.html.match(/>(\d{6})</);
      if (codeMatch) {
        logger.warn(`🔐 VERIFICATION CODE: ${codeMatch[1]}`);
        console.log(`\n✋ TEST VERIFICATION CODE: ${codeMatch[1]}\n`);
      }
    }
    
    return;
  }

  // Production: Use Mailtrap
  if (!mailtrapClient) {
    logger.warn(
      "📧 Email sending skipped: Mailtrap client not configured (MAILTRAP_TOKEN missing)."
    );
    return;
  }

  return mailtrapClient.send({
    from: sender,
    ...options,
  });
};

// Safe wrapper for non-critical emails
const safeSendEmail = async (options) => {
  try {
    await sendEmail(options);
    return true;
  } catch (error) {
    logger.error("❌ Failed to send email", {
      error: error.message,
      category: options.category,
      to: options.to,
      subject: options.subject,
    });
    return false;
  }
};

module.exports = { sendEmail, safeSendEmail };
