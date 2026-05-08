import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import type { InquiryPayload } from "@/types";

function buildEmailHtml(data: InquiryPayload): string {
  return `
    <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;color:#2c1a0e">
      <div style="background:#2c1a0e;padding:24px 32px">
        <p style="margin:0;font-size:11px;letter-spacing:0.2em;color:#c4a882;text-transform:uppercase">Euro Global Machinery</p>
        <h1 style="margin:6px 0 0;font-size:22px;color:#fdf6ee">New Inquiry</h1>
      </div>
      <div style="background:#fdf6ee;padding:32px">
        <table style="width:100%;border-collapse:collapse;font-size:14px">
          <tr><td style="padding:10px 0;border-bottom:1px solid #e5d5c0;color:#7a5c40;width:140px">Listing</td>
              <td style="padding:10px 0;border-bottom:1px solid #e5d5c0;font-weight:600">${data.listing_title}</td></tr>
          <tr><td style="padding:10px 0;border-bottom:1px solid #e5d5c0;color:#7a5c40">From</td>
              <td style="padding:10px 0;border-bottom:1px solid #e5d5c0">${data.name}</td></tr>
          <tr><td style="padding:10px 0;border-bottom:1px solid #e5d5c0;color:#7a5c40">Email</td>
              <td style="padding:10px 0;border-bottom:1px solid #e5d5c0"><a href="mailto:${data.email}" style="color:#2c1a0e">${data.email}</a></td></tr>
          <tr><td style="padding:10px 0;border-bottom:1px solid #e5d5c0;color:#7a5c40">Phone</td>
              <td style="padding:10px 0;border-bottom:1px solid #e5d5c0">${data.phone || "—"}</td></tr>
        </table>
        <h3 style="margin:28px 0 8px;font-size:11px;letter-spacing:0.15em;text-transform:uppercase;color:#7a5c40">Message</h3>
        <p style="margin:0;background:#fff;border:1px solid #e5d5c0;padding:16px;font-size:14px;line-height:1.7;white-space:pre-wrap">${data.message}</p>
      </div>
      <div style="background:#e5d5c0;padding:16px 32px;font-size:11px;color:#7a5c40;text-align:center">
        Euro Global Machinery — reply directly to this email to respond to the buyer.
      </div>
    </div>
  `;
}

function buildWhatsAppMessage(data: InquiryPayload): string {
  return [
    `📋 *New Inquiry — Euro Global Machinery*`,
    ``,
    `*Listing:* ${data.listing_title}`,
    ``,
    `*From:* ${data.name}`,
    `*Email:* ${data.email}`,
    `*Phone:* ${data.phone || "Not provided"}`,
    ``,
    `*Message:*`,
    data.message,
  ].join("\n");
}

async function sendEmail(data: InquiryPayload) {
  const { SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS, CONTACT_EMAIL, CONTACT_EMAIL_FROM } =
    process.env;

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS || !CONTACT_EMAIL) {
    console.warn("[inquiries] SMTP env vars not set — skipping email.");
    return;
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT ?? 465),
    secure: SMTP_SECURE !== "false",
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  await transporter.sendMail({
    from: CONTACT_EMAIL_FROM || `"Euro Global Machinery" <${SMTP_USER}>`,
    to: CONTACT_EMAIL,
    replyTo: `"${data.name}" <${data.email}>`,
    subject: `New Inquiry: ${data.listing_title}`,
    html: buildEmailHtml(data),
    text: buildWhatsAppMessage(data),
  });
}

async function sendWhatsApp(data: InquiryPayload) {
  const { WHATSAPP_PHONE_NUMBER_ID, WHATSAPP_ACCESS_TOKEN, WHATSAPP_RECIPIENT } = process.env;
  if (!WHATSAPP_PHONE_NUMBER_ID || !WHATSAPP_ACCESS_TOKEN || !WHATSAPP_RECIPIENT) return;

  const url = `https://graph.facebook.com/v19.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`;
  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: WHATSAPP_RECIPIENT,
      type: "text",
      text: { body: buildWhatsAppMessage(data) },
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    console.error("[inquiries] WhatsApp API error:", err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body: InquiryPayload = await req.json();

    if (!body.name || !body.email || !body.message || !body.listing_id) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await Promise.allSettled([sendEmail(body), sendWhatsApp(body)]);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[inquiries] Unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
