export type LogisticsStep = {
  index: number;
  label: string;
  detail: string;
};

export const steps: LogisticsStep[] = [
  {
    index: 1,
    label: "Servicios de importación",
    detail:
      "Gestionamos la selección del proveedor, la inspección en fábrica y la coordinación de embarque desde el país de origen.",
  },
  {
    index: 2,
    label: "Zona franca — Tacna / Iquique",
    detail:
      "La mercancía ingresa a ZofraTacna o ZOFRI bajo régimen de zona franca, suspendiendo aranceles hasta su nacionalización.",
  },
  {
    index: 3,
    label: "Entrega en zona primaria",
    detail:
      "Coordinamos el retiro del contenedor en el terminal portuario o de almacenamiento designado dentro de la zona primaria.",
  },
  {
    index: 4,
    label: "Nacionalización",
    detail:
      "Tramitamos la destinación aduanera, liquidación de tributos y levante de la mercancía con agente de aduana autorizado.",
  },
  {
    index: 5,
    label: "Entrega en planta",
    detail:
      "Organizamos el transporte terrestre desde la aduana hasta la dirección de entrega acordada en Perú o el país de destino.",
  },
];
