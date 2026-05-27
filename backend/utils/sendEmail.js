import nodemailer from "nodemailer";

const isEmailEnabled = () =>
  String(process.env.EMAIL_ENABLED || "true").trim().toLowerCase() !== "false";

const getSmtpPort = () => Number(process.env.SMTP_PORT || 587);

export const sendEmail = async (to, subject, html) => {
  if (!isEmailEnabled()) {
    return {
      skipped: true,
      reason: "Email delivery is disabled",
    };
  }

  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  if (!emailUser || !emailPass) {
    const error = new Error("EMAIL_USER and EMAIL_PASS must be configured");
    error.code = "EMAIL_CONFIG_MISSING";
    throw error;
  }

  const port = getSmtpPort();
  const secure =
    process.env.SMTP_SECURE === undefined
      ? port === 465
      : String(process.env.SMTP_SECURE).trim().toLowerCase() === "true";

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port,
    secure,
    auth: {
      user: emailUser,
      pass: emailPass,
    },
    connectionTimeout: Number(process.env.SMTP_CONNECTION_TIMEOUT_MS || 10000),
    greetingTimeout: Number(process.env.SMTP_GREETING_TIMEOUT_MS || 10000),
  });

  return transporter.sendMail({
    from: `"Internship Management System" <${emailUser}>`,
    to,
    subject,
    html,
  });
};
