const { Resend } = require("resend");

function getResend() {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is not set");
  }
  return new Resend(process.env.RESEND_API_KEY);
}

const FROM = process.env.EMAIL_FROM || "onboarding@resend.dev";
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:4000";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

async function sendVerificationEmail(email, token) {
  const resend = getResend();
  const link = `${BACKEND_URL}/auth/verify-email?token=${token}`;

  await resend.emails.send({
    from: FROM,
    to: email,
    subject: "Verify your email — Rizwan Web Studio",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
        <h2 style="margin-bottom:8px">Verify your email</h2>
        <p style="color:#6b7280">Click the button below to verify your email address. This link expires in 24 hours.</p>
        <a href="${link}" style="display:inline-block;margin:16px 0;padding:10px 20px;background:#4f46e5;color:#fff;border-radius:6px;text-decoration:none;font-weight:600">
          Verify email
        </a>
        <p style="color:#9ca3af;font-size:13px">Or copy this link: ${link}</p>
        <p style="color:#9ca3af;font-size:13px">If you didn't create an account, you can ignore this email.</p>
      </div>
    `,
  });
}

async function sendPasswordResetEmail(email, token) {
  const resend = getResend();
  const link = `${FRONTEND_URL}/reset-password?token=${token}`;

  await resend.emails.send({
    from: FROM,
    to: email,
    subject: "Reset your password — Rizwan Web Studio",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
        <h2 style="margin-bottom:8px">Reset your password</h2>
        <p style="color:#6b7280">Click the button below to reset your password. This link expires in 1 hour.</p>
        <a href="${link}" style="display:inline-block;margin:16px 0;padding:10px 20px;background:#4f46e5;color:#fff;border-radius:6px;text-decoration:none;font-weight:600">
          Reset password
        </a>
        <p style="color:#9ca3af;font-size:13px">Or copy this link: ${link}</p>
        <p style="color:#9ca3af;font-size:13px">If you didn't request this, you can ignore this email.</p>
      </div>
    `,
  });
}

module.exports = { sendVerificationEmail, sendPasswordResetEmail };
