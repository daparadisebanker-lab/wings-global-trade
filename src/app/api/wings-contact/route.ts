import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { nombre, empresa, contacto } = body as { nombre?: string; empresa?: string; contacto?: string };

    if (!nombre || !contacto) {
      return NextResponse.json({ error: "Nombre y contacto son obligatorios." }, { status: 400 });
    }

    const { SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS, CONTACT_EMAIL, CONTACT_EMAIL_FROM } =
      process.env;

    if (SMTP_HOST && SMTP_USER && SMTP_PASS && CONTACT_EMAIL) {
      const nodemailer = (await import("nodemailer")).default;
      const transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: Number(SMTP_PORT ?? 465),
        secure: SMTP_SECURE !== "false",
        auth: { user: SMTP_USER, pass: SMTP_PASS },
      });

      const html = `
        <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;color:#1C1A16">
          <div style="background:#001E50;padding:24px 32px">
            <p style="margin:0;font-size:11px;letter-spacing:0.2em;color:#C4933F;text-transform:uppercase">Wings Global Trade</p>
            <h1 style="margin:6px 0 0;font-size:22px;color:#ffffff">Nueva solicitud de importación</h1>
          </div>
          <div style="background:#F8F6F0;padding:32px">
            <table style="width:100%;border-collapse:collapse;font-size:14px">
              <tr><td style="padding:10px 0;border-bottom:1px solid #E8E4DB;color:#6B6560;width:140px">Nombre</td>
                  <td style="padding:10px 0;border-bottom:1px solid #E8E4DB;font-weight:600">${nombre}</td></tr>
              <tr><td style="padding:10px 0;border-bottom:1px solid #E8E4DB;color:#6B6560">Empresa</td>
                  <td style="padding:10px 0;border-bottom:1px solid #E8E4DB">${empresa || "—"}</td></tr>
              <tr><td style="padding:10px 0;color:#6B6560">Contacto</td>
                  <td style="padding:10px 0">${contacto}</td></tr>
            </table>
          </div>
          <div style="background:#E8E4DB;padding:16px 32px;font-size:11px;color:#6B6560;text-align:center">
            Wings Global Trade — responde directamente a este correo para contactar al solicitante.
          </div>
        </div>
      `;

      await transporter.sendMail({
        from: CONTACT_EMAIL_FROM || `"Wings Global Trade" <${SMTP_USER}>`,
        to: CONTACT_EMAIL,
        subject: `Nueva solicitud Wings — ${nombre}${empresa ? ` · ${empresa}` : ""}`,
        html,
      });
    } else {
      console.warn("[wings-contact] SMTP env vars not set — logging submission only.");
      console.log("[wings-contact]", { nombre, empresa, contacto });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[wings-contact] Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
