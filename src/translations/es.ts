import type { Translations } from "@/lib/i18n";

const es: Translations = {
  topBar: "El Mercado Líder de Vehículos y Maquinaria",
  navHome: "Inicio", navTractors: "Tractores", navAutomobiles: "Automóviles",
  navAbout: "Sobre Nosotros", navContact: "Contacto",
  signIn: "Iniciar Sesión", postListing: "Publicar Anuncio",

  heroLabel: "El Mercado Líder de Europa",
  heroLine1: "Encuentra Tu Próximo",
  heroLine2: "Vehículo",
  heroSubtitle: "Miles de tractores, vehículos y maquinaria agrícola nueva y usada de concesionarios verificados en toda Europa.",
  allCategories: "Todas las Categorías",
  searchPlaceholder: "Marca, modelo o palabra clave",
  searchBtn: "Buscar",
  popular: "Popular:",

  browseLabel: "Explorar por Tipo",
  browseTitle: "Categorías de Equipos",
  catTractors: "Tractores", catCars: "Coches", catTrucks: "Camiones",
  catAutomobiles: "Automóviles", catOtherMachinery: "Otra Maquinaria", catSpareParts: "Repuestos",
  listings: "anuncios",

  statListings: "Anuncios Activos", statDealers: "Concesionarios Verificados",
  statCountries: "Países", statSold: "Máquinas Vendidas",

  featuredLabel: "Selección Especial", featuredTitle: "Anuncios Destacados",
  viewAll: "Ver Todo", viewAllListings: "Ver Todos los Anuncios",

  whyLabel: "Por Qué Elegirnos", whyTitle: "La Confianza de los Profesionales",
  whyReason1Title: "Vendedores Verificados",
  whyReason1Body: "Cada concesionario en la plataforma está verificado individualmente. Comercia a través de fronteras con total confianza.",
  whyReason2Title: "Alcance Paneuropeo",
  whyReason2Body: "28 países cubiertos. Socios logísticos dedicados disponibles para el transporte transfronterizo.",
  whyReason3Title: "Informes de Inspección",
  whyReason3Body: "Solicita informes de inspección certificados por terceros antes de comprometerte con cualquier compra.",

  ctaLabel: "Para Vendedores", ctaTitle: "¿Tienes Maquinaria para Vender?",
  ctaBody: "Publica tu anuncio en minutos y llega a miles de compradores cualificados en toda Europa.",
  ctaBtn: "Publicar Anuncio", ctaBtnSecondary: "Ver Planes para Concesionarios",

  tractorsTitle: "Tractores en Venta",
  tractorsCount: (n) => `${n} anuncios disponibles`,
  sortBy: "Ordenar",
  sortNewest: "Más Recientes", sortPriceAsc: "Precio: Menor a Mayor",
  sortPriceDesc: "Precio: Mayor a Menor", sortHoursAsc: "Menos Horas",
  filters: "Filtros", clearAll: "Borrar todo",
  conditionLabel: "Estado", makeLabel: "Marca", yearLabel: "Año",
  priceLabel: "Precio (EUR)", countryLabel: "País",
  anyLabel: "Cualquiera", applyFilters: "Aplicar Filtros",
  condAny: "Cualquiera", condNew: "Nuevo", condUsed: "Usado", condRefurbished: "Reacondicionado",
  pagination_prev: "Anterior", pagination_next: "Siguiente",

  cardHours: "Horas", cardPower: "Potencia", cardLocation: "Ubicación",
  cardCountry: "País", cardViewDetails: "Ver Detalles",
  hrsUnit: "hrs", hpUnit: "cv",

  breadHome: "Inicio", specsMake: "Marca", specsModel: "Modelo",
  specsYear: "Año", specsCondition: "Estado", specsHorsepower: "Potencia",
  specsHours: "Horas", specsTransmission: "Transmisión", specsDrive: "Tracción",
  specsLocation: "Ubicación", specificationsTitle: "Especificaciones",
  contactSeller: "Contactar Vendedor", repliesVia: "Respuestas enviadas por WhatsApp",
  buyerGuidanceTitle: "Guía para Compradores",
  buyerGuidanceBody: "Inspecciona siempre la maquinaria en persona antes de comprar. Para transacciones de alto valor, recomendamos usar nuestro servicio de depósito en garantía.",
  backToListings: "Volver a los Anuncios",

  formName: "Nombre completo", formEmail: "Correo electrónico",
  formPhone: "Teléfono (opcional)",
  formDefaultMessage: (title) => `Hola, estoy interesado en ${title}. ¿Podría decirme si todavía está disponible?`,
  formSending: "Enviando...", formSubmit: "Enviar Consulta",
  formSuccessTitle: "Mensaje Enviado",
  formSuccessBody: "El vendedor se pondrá en contacto contigo en breve.",
  formSuccessBtn: "Enviar Otro Mensaje",
  formError: "Algo salió mal. Por favor, inténtalo de nuevo.",

  condLabelNew: "Nuevo", condLabelUsed: "Usado", condLabelRefurbished: "Reacondicionado",

  notFoundCode: "404", notFoundTitle: "Página No Encontrada",
  notFoundBody: "La página que buscas no existe o ha sido movida.",
  goHome: "Ir al Inicio", browseListings: "Ver Anuncios",

  footerTagline: "El mercado líder de Europa para todo tipo de vehículos. Conectando compradores y vendedores en todo el mundo desde 2005.",
  footerRegistered: "Registrado en la Unión Europea",
  footerBrowse: "Explorar", footerSellers: "Vendedores", footerCompany: "Empresa", footerSupport: "Soporte",
  footerAboutUs: "Sobre Nosotros", footerCareers: "Empleo", footerPress: "Prensa",
  footerHelpCenter: "Centro de Ayuda", footerSafetyTips: "Consejos de Seguridad",
  footerPrivacy: "Política de Privacidad", footerTerms: "Términos de Uso",
  footerPostListing: "Publicar Anuncio", footerDealerAccounts: "Cuentas de Concesionario",
  footerPricing: "Precios", footerSellerResources: "Recursos para Vendedores",

  generateDescription: (listing: any) => {
    const b = listing.brand || "This";
    const m = listing.model || "tractor";
    const hp_val = listing.horsepower;
    const engine_model = listing.details?.engine?.model;
    const trans_details = listing.details?.transmission_details || {};
    const drive = listing.drive_type || trans_details.drive_type;
    let trans = listing.transmission;
    if (!trans && trans_details.forward_gears) trans = `${trans_details.forward_gears}F/${trans_details.reverse_gears}R`;
    const dims = listing.details?.dimensions || {};
    const weight = dims.operating_weight_kg ? dims.operating_weight_kg.toLocaleString() : null;
    const pto = listing.details?.pto?.rear_pto_rpm;

    const intro = `El {b} {m} es un tractor agrícola de calidad profesional diseñado para las operaciones agrícolas modernas.`.replace("{b}", b).replace("{m}", m);
    const engine = engine_model ? `Impulsado por un motor {e} de alta eficiencia,`.replace("{e}", engine_model) : `Equipado con un motor confiable,`;
    const hp = hp_val ? `que ofrece una robusta potencia de {hp} caballos de fuerza,`.replace("{hp}", hp_val) : `diseñado para un rendimiento confiable,`;
    const mid = `proporciona un equilibrio excepcional entre torque y eficiencia de combustible.`;
    
    let drivetrain = "";
    if (drive && trans) drivetrain = `La transmisión {d}, combinada con una versátil caja de cambios {t}, garantiza una tracción óptima y una entrega de potencia perfecta en terrenos difíciles.`.replace("{d}", drive).replace("{t}", trans);
    else if (drive) drivetrain = `La configuración {d} proporciona una tracción y estabilidad superiores en entornos agrícolas exigentes.`.replace("{d}", drive);
    else if (trans) drivetrain = `Su versátil caja de cambios {t} permite a los operadores adaptarse sin esfuerzo a diversas condiciones del campo y requerimientos de implementos.`.replace("{t}", trans);

    let capability = "";
    if (weight && pto) capability = `Con un peso de {w} kg, ofrece una plataforma estable para implementos pesados, mientras que la TDF de {p} RPM proporciona una transferencia de potencia confiable para una amplia gama de accesorios.`.replace("{w}", weight).replace("{p}", pto);
    else if (weight) capability = `Con un peso de {w} kg, ofrece una plataforma altamente estable e imponente para implementos agrícolas de trabajo pesado.`.replace("{w}", weight);
    else if (pto) capability = `El avanzado sistema de TDF de {p} RPM proporciona una transferencia de potencia confiable y continua para implementos agrícolas exigentes.`.replace("{p}", pto);

    const outro = `Construido para la resistencia y la excelencia operativa, el {m} se erige como un activo indispensable para maximizar la productividad en el campo.`.replace("{m}", m);

    return `${intro} ${engine} ${hp} ${mid} ${drivetrain} ${capability} ${outro}`.replace(/\s+/g, ' ').trim();
  },

};

export default es;
