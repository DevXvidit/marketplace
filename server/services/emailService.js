const nodemailer = require("nodemailer");

const getTransporter = () => {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    throw new Error(
      "Email service is not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS.",
    );
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
};

const sendPasswordResetEmail = async (to, code) => {
  const transporter = getTransporter();
  const from =
    process.env.FROM_EMAIL || "Akshar Jewellers <no-reply@aksharjewellers.com>";

  await transporter.sendMail({
    from,
    to,
    subject: "Your Akshar Jewellers Reset Code",
    text: `Your password reset code is ${code}. It expires in 15 minutes.`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2 style="margin:0 0 12px 0;">Reset your Akshar jewellers password</h2>
        <p>Use the code below to reset your password. It expires in 15 minutes.</p>
        <div style="font-size:24px; letter-spacing:6px; font-weight:bold; margin:16px 0;">${code}</div>
        <p>If you didn't request this, you can ignore this email.</p>
      </div>
    `,
  });
};

module.exports = { sendPasswordResetEmail };
