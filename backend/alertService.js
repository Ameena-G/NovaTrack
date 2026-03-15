/**
 * alertService.js
 * Sends email alerts when a tracked product hits its target price.
 * Uses nodemailer — configure with your SMTP credentials in .env
 */

const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Sends a price drop alert email.
 * @param {string} to - Recipient email
 * @param {object} alert - Alert data { title, url, targetPrice, triggeredPrice, currency }
 */
async function sendAlertEmail(to, alert) {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log("[Alert] SMTP not configured — skipping email. Alert data:", alert);
    return;
  }

  const savings = (alert.targetPrice - alert.triggeredPrice).toFixed(2);
  const savingsPct = Math.round(((alert.targetPrice - alert.triggeredPrice) / alert.targetPrice) * 100);

  const html = `
    <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; background: #0f0f0f; color: #fff; border-radius: 16px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #00ff88, #00d4ff); padding: 32px; text-align: center;">
        <h1 style="margin: 0; font-size: 28px; color: #000;">🎯 Price Drop Alert!</h1>
        <p style="margin: 8px 0 0; color: #000; opacity: 0.8;">Your target price has been reached</p>
      </div>
      <div style="padding: 32px;">
        <h2 style="color: #00ff88; margin-top: 0;">${alert.title}</h2>
        <table style="width: 100%; border-collapse: collapse; margin: 24px 0;">
          <tr>
            <td style="padding: 12px; background: #1a1a1a; border-radius: 8px 8px 0 0; color: #888;">Current Price</td>
            <td style="padding: 12px; background: #1a1a1a; border-radius: 8px 8px 0 0; text-align: right; font-size: 24px; font-weight: bold; color: #00ff88;">
              ${alert.currency} ${alert.triggeredPrice.toFixed(2)}
            </td>
          </tr>
          <tr>
            <td style="padding: 12px; background: #111; color: #888;">Your Target</td>
            <td style="padding: 12px; background: #111; text-align: right; color: #fff;">
              ${alert.currency} ${alert.targetPrice.toFixed(2)}
            </td>
          </tr>
          <tr>
            <td style="padding: 12px; background: #1a1a1a; border-radius: 0 0 8px 8px; color: #888;">You Save</td>
            <td style="padding: 12px; background: #1a1a1a; border-radius: 0 0 8px 8px; text-align: right; color: #00d4ff; font-weight: bold;">
              ${alert.currency} ${Math.abs(savings)} (${savingsPct}%)
            </td>
          </tr>
        </table>
        <a href="${alert.url}" style="display: block; background: linear-gradient(135deg, #00ff88, #00d4ff); color: #000; text-align: center; padding: 16px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">
          Buy Now →
        </a>
        <p style="color: #555; font-size: 12px; margin-top: 24px; text-align: center;">
          Powered by Nova Act Price Tracker · Amazon Nova AI
        </p>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: `"Nova Price Tracker" <${process.env.SMTP_USER}>`,
    to,
    subject: `🎯 Price Drop: ${alert.title} is now ${alert.currency} ${alert.triggeredPrice.toFixed(2)}`,
    html,
  });

  console.log(`[Alert] Email sent to ${to} for ${alert.title}`);
}

module.exports = { sendAlertEmail };