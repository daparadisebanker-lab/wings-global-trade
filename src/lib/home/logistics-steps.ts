// Sequence model + data (WINGS_HOME_SPEC.md §6.5)
// Detail copy: one factual sentence per step, procurement register, es-PE.

export interface LogisticsStep {
  index: number; // 01–05, rendered in --font-data
  label: string;
  detail: string;
}

export const steps: LogisticsStep[] = [
  {
    index: 1,
    label: "Servicios de importación",
    detail:
      "Gestionamos la compra, el embarque y la documentación comercial de la maquinaria desde el origen.",
  },
  {
    index: 2,
    label: "Zona franca — Tacna / Iquique",
    detail:
      "La carga ingresa a ZofraTacna o ZOFRI, donde se almacena y consolida bajo régimen de zona franca.",
  },
  {
    index: 3,
    label: "Entrega en zona primaria",
    detail:
      "Trasladamos la carga a zona primaria aduanera y la ponemos a disposición para su despacho.",
  },
  {
    index: 4,
    label: "Nacionalización",
    detail:
      "Tramitamos el despacho de importación y la liquidación de derechos ante la autoridad aduanera.",
  },
  {
    index: 5,
    label: "Entrega en planta",
    detail:
      "Transporte terrestre hasta la planta u operación del cliente, con la documentación completa del proceso.",
  },
];
