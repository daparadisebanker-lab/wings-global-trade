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
  tractorsCount: (n) => `${n} anuncios disponibles en Europa`,
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
};

export default es;
