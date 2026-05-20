import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    const required = ["nombre", "empresa", "contacto"];
    for (const field of required) {
      if (!data[field]?.trim()) {
        return NextResponse.json(
          { error: `Campo requerido: ${field}` },
          { status: 400 }
        );
      }
    }

    // TODO: Connect to Resend (email), CRM, or Google Sheets
    console.log("New lead:", { ...data, timestamp: new Date().toISOString() });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
