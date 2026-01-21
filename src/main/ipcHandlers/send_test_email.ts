/*
 Simple test script to send an email using environment variables:
 - SMTP_HOST
 - SMTP_PORT
 - SMTP_USER
 - SMTP_PASS
 - SMTP_SECURE (true/1 = TLS)
 - SMTP_FROM (optional)
 - TEST_TO (recipient)
 - TEST_SUBJECT (optional)
 - TEST_BODY (optional)

 Run:
 TEST_TO=you@example.com SMTP_HOST=smtp.example.com SMTP_PORT=587 SMTP_USER=user SMTP_PASS=pass node scripts/send_test_email.js
*/

/** To open the app with debugging:
 * /Users/suleyman/development/barcode-app/dist_electron/mac-arm64/BarcodeApp.app/Contents/MacOS/BarcodeApp
 */

import nodemailer from "nodemailer";

export default async function sendTestEmail() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_SECURE } =
    process.env;

  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    console.error(
      "Missing SMTP_* environment variables; skipping test email send.",
    );
    return;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: parseInt(SMTP_PORT as string, 10),
      secure:
        (SMTP_SECURE || "").toLowerCase() === "true" || SMTP_SECURE === "1",
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: SMTP_USER,
      to: "suleymangunduzz@gmail.com",
      subject: "BarcodeApp test email",
      text: "This is a test email from BarcodeApp.",
      html: "<p>This is a test email from <b>BarcodeApp</b>.</p>",
    });

    console.log("Message sent:", info.messageId);
  } catch (err) {
    console.error("Send failed:", err);
  }
}
