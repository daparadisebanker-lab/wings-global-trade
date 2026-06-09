import type { Metadata } from "next";
import WingsHero          from "@/components/wings/WingsHero";
import WingsHowItWorks    from "@/components/wings/WingsHowItWorks";
import WingsWhyWings      from "@/components/wings/WingsWhyWings";
import WingsCorridors     from "@/components/wings/WingsCorridors";
import WingsFreeZone      from "@/components/wings/WingsFreeZone";
import WingsCostBreakdown from "@/components/wings/WingsCostBreakdown";
import WingsLeadForm      from "@/components/wings/WingsLeadForm";
import JsonLd             from "@/components/seo/JsonLd";

const BASE = "https://wingsglobaltrade.com";

export const metadata: Metadata = {
  title: "Cómo Importar Maquinaria desde Asia — Precio Landed Total | Wings Global Trade",
  description:
    "Importa cualquier maquinaria desde Asia con precio landed total: equipo + flete + aranceles + entrega. Sin intermediarios. Asesoría en español. 45–90 días hasta tu campo en Perú, Bolivia, Chile y LATAM.",
  alternates: { canonical: `${BASE}/importacion` },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "¿Qué es el precio landed total en importación de maquinaria?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "El precio landed total es el costo final que incluye el equipo, flete marítimo desde la fábrica en Asia, paso por zona franca (ZOFRI o ZOFRATACNA), aranceles de importación de tu país y entrega hasta tu ubicación. Wings Global Trade confirma este número por escrito antes de que tomes ninguna decisión de compra — no hay costos adicionales ni sorpresas.",
      },
    },
    {
      "@type": "Question",
      "name": "¿Cuánto tiempo demora importar maquinaria desde China a Perú?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "El plazo típico desde la confirmación de pedido hasta la entrega en Perú es de 45 a 90 días. Esto incluye producción o preparación en fábrica (2–4 semanas), tránsito marítimo Asia–Chile/Perú (25–35 días) y trámites en zona franca y aduana (7–14 días). Wings Global Trade confirma el plazo estimado por escrito antes de la confirmación.",
      },
    },
    {
      "@type": "Question",
      "name": "¿Cuánto cuesta importar un tractor nuevo desde China?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "El costo de importar un tractor nuevo desde China a Perú o Bolivia incluye: precio del equipo en fábrica + flete marítimo (aproximadamente 1,500–3,500 USD según destino) + arancel de importación (varía por país: 0% en Chile bajo TLC, 12% en Perú, 10% en Bolivia para tractores) + gestión en zona franca + transporte interno. El ahorro frente al canal de distribuidor tradicional es tipicamente del 15–25%. Wings Global Trade entrega un precio único firmado que cubre todos estos componentes.",
      },
    },
    {
      "@type": "Question",
      "name": "¿Qué es ZOFRI y cómo ayuda a reducir el costo de importación?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "ZOFRI (Zona Franca de Iquique, Chile) es una zona de libre comercio donde la maquinaria puede almacenarse, inspeccionarse y redistribuirse hacia países vecinos como Perú y Bolivia sin pagar aranceles chilenos. Wings Global Trade opera desde ZOFRI y desde ZOFRATACNA (Tacna, Perú), lo que permite optimizar la ruta logística y reducir el costo total de importación para compradores en el sur de Perú, Bolivia y norte de Chile.",
      },
    },
    {
      "@type": "Question",
      "name": "¿Cuáles son los aranceles para importar tractores en Perú, Bolivia y Chile?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Los aranceles para importar tractores agrícolas varían por país: Chile aplica 0% para tractores de origen chino bajo el TLC Chile–China. Perú aplica una tasa del 0% para tractores de uso agrícola (partida 8701) bajo beneficios ATPDEA y acuerdos con China. Bolivia aplica una tasa del 10% para tractores agrícolas. Paraguay aplica 6%. Argentina y Uruguay pueden aplicar tasas del 0–16% según el tipo de maquinaria. Wings Global Trade calcula el arancel exacto como parte del precio landed total antes de confirmar.",
      },
    },
    {
      "@type": "Question",
      "name": "¿Es confiable la maquinaria agrícola fabricada en China?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Las marcas globales como New Holland, John Deere, Massey Ferguson y Kubota fabrican modelos específicos para mercados en desarrollo en plantas certificadas en China. Estas unidades son idénticas en especificaciones a las vendidas por distribuidores locales. Adicionalmente, KAMA (Shandong KAMA Automobile Manufacturing) es un fabricante chino con 30+ años de historia que cumple normas Euro-IV a Euro-VI y estándares ECE. Wings Global Trade verifica la fábrica de origen y proporciona la ficha técnica completa antes de confirmar cualquier pedido.",
      },
    },
    {
      "@type": "Question",
      "name": "¿Qué diferencia hay entre comprar a un distribuidor local y la importación directa?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Un distribuidor local compra en fábrica, importa el equipo, lo almacena y agrega su margen de distribución (típicamente 15–30%) antes de venderte. La importación directa elimina ese intermediario: el comprador paga el precio de fábrica más los costos reales de importación. La diferencia neta en favor del comprador es típicamente del 15–25%. Wings Global Trade ofrece acceso directo a fábrica con gestión completa del proceso de importación a precio transparente.",
      },
    },
    {
      "@type": "Question",
      "name": "¿Los tractores y camiones importados tienen garantía?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Sí. Los modelos New Holland, John Deere, Massey Ferguson y Kubota importados directamente cuentan con la garantía del fabricante para la región. Los modelos KAMA incluyen garantía de fábrica Shandong KAMA. Wings Global Trade entrega todos los documentos de garantía junto con el equipo y proporciona soporte postventa en español para gestionar cualquier reclamación.",
      },
    },
    {
      "@type": "Question",
      "name": "¿En qué países entrega Wings Global Trade?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Wings Global Trade entrega en 6 países de Latinoamérica: Perú, Bolivia, Chile, Paraguay, Argentina y Uruguay. Los dos hubs logísticos son ZOFRI (Iquique, Chile) para el corredor sur-andino y ZOFRATACNA (Tacna, Perú) para entregas directas al sur del Perú y Bolivia.",
      },
    },
    {
      "@type": "Question",
      "name": "¿Qué documentos necesito para importar un tractor a Perú?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Para importar un tractor a Perú necesitas: factura comercial del fabricante, lista de empaque (packing list), conocimiento de embarque (bill of lading), certificado de origen, póliza de seguro de carga y declaración de importación ante SUNAT. Wings Global Trade gestiona toda la documentación como parte del servicio de precio landed total — el comprador no necesita contratar un agente aduanero por separado.",
      },
    },
  ],
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Inicio", "item": BASE },
    { "@type": "ListItem", "position": 2, "name": "Importación desde Asia", "item": `${BASE}/importacion` },
  ],
};

export default function ImportacionPage() {
  return (
    <main>
      <JsonLd schema={faqSchema} />
      <JsonLd schema={breadcrumbSchema} />
      <WingsHero />
      <WingsHowItWorks />
      <WingsWhyWings />
      <WingsCorridors />
      <WingsFreeZone />
      <WingsCostBreakdown />
      <WingsLeadForm />
    </main>
  );
}
