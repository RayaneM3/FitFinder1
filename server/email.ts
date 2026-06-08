import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM_EMAIL = process.env.FROM_EMAIL || "Fit Finder <noreply@fitfinder.co>";
const APP_URL = process.env.APP_URL || "https://fitfinder.co";

// Loud startup diagnostic: without this, a missing RESEND_API_KEY means every
// email (including password resets) is silently dropped with no obvious cause.
if (!resend) {
  const msg = "[email] RESEND_API_KEY is not set — NO emails will be sent (password resets, notifications, receipts are all disabled).";
  if (process.env.NODE_ENV === "production") console.error(`⚠️  ${msg}`);
  else console.warn(msg);
} else {
  console.log(`[email] Resend configured. Sending as: ${FROM_EMAIL}`);
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function emailWrapper(content: string, preheader?: string): string {
  const preheaderHtml = preheader
    ? `<div style="display: none; max-height: 0; overflow: hidden; mso-hide: all;">${escapeHtml(preheader)}</div>`
    : "";
  return `
<div style="max-width: 560px; width: 100%; margin: 0 auto; padding: 16px; box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1a1a1a; line-height: 1.6;">
  ${preheaderHtml}
  <div style="padding: 24px 0; border-bottom: 1px solid #e5e5e5;">
    <div style="display: inline-flex; align-items: center; gap: 8px;">
      <div style="width: 28px; height: 28px; border-radius: 6px; background: #3b82f6; color: white; font-weight: bold; font-size: 16px; text-align: center; line-height: 28px;">F</div>
      <span style="font-weight: 600; font-size: 16px; color: #1a1a1a;">Fit Finder</span>
    </div>
  </div>
  <div style="padding: 32px 0;">
    ${content}
  </div>
  <div style="padding: 20px 0; border-top: 1px solid #e5e5e5; font-size: 12px; color: #6b7280;">
    <p style="margin: 0;">You're receiving this because you have an account on Fit Finder.</p>
    <p style="margin: 4px 0 0;">Questions? Reply to this email or contact support@fitfinder.co</p>
    <p style="font-size: 12px; color: #9ca3af; margin-top: 24px;">This is a transactional email from Fit Finder. To stop receiving these, you can adjust your notification preferences in Settings.</p>
  </div>
</div>`;
}

function ctaButton(url: string, text: string): string {
  return `
  <div style="padding: 8px 0 24px;">
    <a href="${escapeHtml(url)}" style="display: block; width: 100%; box-sizing: border-box; text-align: center; background: #3b82f6; color: white; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 16px;">
      ${escapeHtml(text)}
    </a>
  </div>`;
}

export async function sendEmail(to: string, subject: string, html: string) {
  if (!resend) {
    console.log(`[email] Resend not configured. Would send to ${to}: ${subject}`);
    return;
  }
  try {
    await resend.emails.send({ from: FROM_EMAIL, to, subject, html });
    console.log(`[email] Sent to ${to}: ${subject}`);
  } catch (e) {
    console.error(`[email] Failed to send to ${to}:`, e);
  }
}

export function newMessageEmail(trainerName: string, clientName: string, messagePreview: string, conversationUrl: string) {
  const safeName = escapeHtml(trainerName);
  const safeClient = escapeHtml(clientName);
  const safePreview = escapeHtml(messagePreview.slice(0, 200)) + (messagePreview.length > 200 ? "..." : "");

  const subject = `${escapeHtml(clientName)} sent you a message on Fit Finder`;
  const html = emailWrapper(`
    <h2 style="margin: 0 0 12px; font-size: 20px; font-weight: 600;">Hi ${safeName},</h2>
    <p style="margin: 0 0 16px; color: #4b5563;">${safeClient} has reached out to you on Fit Finder. Here's a preview of their message:</p>
    <div style="background: #f5f5f5; border-radius: 8px; padding: 16px; margin: 16px 0; font-size: 14px; color: #333;">
      "${safePreview}"
    </div>
    ${ctaButton(conversationUrl, `Reply to ${safeClient}`)}
    <p style="margin: 0; font-size: 14px; color: #6b7280;">Replying quickly increases your chances of converting leads.</p>
  `, `You have a new message from ${clientName} on Fit Finder`);
  return { subject, html };
}

export function orderPaidBuyerEmail(buyerName: string, trainerName: string, planTitle: string, amountFormatted: string) {
  const subject = `Your order with ${trainerName} is confirmed`;
  const html = emailWrapper(`
    <h2 style="margin: 0 0 12px; font-size: 20px; font-weight: 600;">Hi ${escapeHtml(buyerName)},</h2>
    <p style="margin: 0 0 16px; color: #4b5563;">Your purchase of <strong>${escapeHtml(planTitle)}</strong> from ${escapeHtml(trainerName)} is confirmed.</p>
    <div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 16px; border-radius: 8px; margin: 16px 0;">
      <p style="color: #166534; margin: 0; font-weight: 600;">&#10003; ${escapeHtml(amountFormatted)} paid successfully</p>
    </div>
    <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
      <tr><td style="color: #6b7280; padding: 8px 0; font-size: 14px;">Plan</td><td style="color: #1a1a1a; padding: 8px 0; text-align: right; font-weight: 500; font-size: 14px;">${escapeHtml(planTitle)}</td></tr>
      <tr><td style="color: #6b7280; padding: 8px 0; font-size: 14px;">Trainer</td><td style="color: #1a1a1a; padding: 8px 0; text-align: right; font-size: 14px;">${escapeHtml(trainerName)}</td></tr>
    </table>
    ${ctaButton(`${APP_URL}/dashboard`, "Go to Dashboard")}
  `, `Your order with ${trainerName} is confirmed`);
  return { subject, html };
}

export function orderPaidTrainerEmail(trainerName: string, buyerName: string, planTitle: string, amountFormatted: string, trainerAmountFormatted: string) {
  const subject = `New order: ${buyerName} purchased ${planTitle}`;
  const html = emailWrapper(`
    <h2 style="margin: 0 0 12px; font-size: 20px; font-weight: 600;">Hi ${escapeHtml(trainerName)},</h2>
    <p style="margin: 0 0 16px; color: #4b5563;">${escapeHtml(buyerName)} has purchased your plan <strong>${escapeHtml(planTitle)}</strong>.</p>
    <div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 16px; border-radius: 8px; margin: 16px 0;">
      <p style="color: #166534; margin: 0; font-weight: 600;">&#10003; ${escapeHtml(amountFormatted)} received</p>
    </div>
    <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
      <tr><td style="color: #6b7280; padding: 8px 0; font-size: 14px;">Plan</td><td style="color: #1a1a1a; padding: 8px 0; text-align: right; font-weight: 500; font-size: 14px;">${escapeHtml(planTitle)}</td></tr>
      <tr><td style="color: #6b7280; padding: 8px 0; font-size: 14px;">Client</td><td style="color: #1a1a1a; padding: 8px 0; text-align: right; font-size: 14px;">${escapeHtml(buyerName)}</td></tr>
      <tr><td style="color: #6b7280; padding: 8px 0; font-size: 14px;">You receive</td><td style="color: #1a1a1a; padding: 8px 0; text-align: right; font-weight: 600; font-size: 14px;">${escapeHtml(trainerAmountFormatted)}</td></tr>
    </table>
    <p style="margin: 0 0 16px; font-size: 14px; color: #6b7280;">Amount shown is after the 12.8% platform fee. Funds are deposited on Stripe's standard payout schedule.</p>
    ${ctaButton(`${APP_URL}/dashboard`, "View Orders")}
  `, `New order from ${buyerName} — check your dashboard`);
  return { subject, html };
}

export function emailVerificationEmail(verifyUrl: string) {
  const subject = "Verify your Fit Finder email";
  const html = emailWrapper(`
    <h2 style="margin: 0 0 12px; font-size: 20px; font-weight: 600;">Verify your email address</h2>
    <p style="margin: 0 0 16px; color: #4b5563;">Click the button below to confirm your email and activate your Fit Finder account. This link expires in 24 hours.</p>
    ${ctaButton(verifyUrl, "Verify Email")}
    <p style="margin: 0; font-size: 14px; color: #6b7280;">If you didn't create an account, you can safely ignore this email.</p>
  `, "Confirm your Fit Finder account");
  return { subject, html };
}

export function passwordResetEmail(resetUrl: string) {
  const subject = "Reset your Fit Finder password";
  const html = emailWrapper(`
    <h2 style="margin: 0 0 12px; font-size: 20px; font-weight: 600;">Reset your password</h2>
    <p style="margin: 0 0 16px; color: #4b5563;">We received a request to reset your password. Click the button below to set a new one. This link expires in 1 hour.</p>
    ${ctaButton(resetUrl, "Reset Password")}
    <p style="margin: 0; font-size: 14px; color: #6b7280;">If you didn't request this, you can safely ignore this email. Your password won't change.</p>
  `, "Reset your Fit Finder password (link expires in 1 hour)");
  return { subject, html };
}
