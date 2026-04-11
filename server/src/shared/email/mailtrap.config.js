const { MailtrapClient } = require("mailtrap");

// Only instantiate the client when credentials are present.
// email.utils.js checks EMAIL_ENABLED before calling mailtrapClient.send(),
// so this will never be invoked without credentials in practice.
let mailtrapClient = null;

if (process.env.MAILTRAP_TOKEN) {
  mailtrapClient = new MailtrapClient({
    endpoint: process.env.MAILTRAP_ENDPOINT,
    token: process.env.MAILTRAP_TOKEN,
  });
} else {
  console.warn(
    "⚠️  Mailtrap credentials not configured. Email sending will be disabled until MAILTRAP_TOKEN (and optionally MAILTRAP_ENDPOINT) are set."
  );
}

exports.mailtrapClient = mailtrapClient;

exports.sender = {
  email: "hello@peerup.com",
  name: "Peerup",
};
