import type { Translations } from "@/lib/i18n";

const nl: Translations = {
  topBar: "De Europese Marktplaats voor Voertuigen en Machines",
  navHome: "Home", navTractors: "Tractoren", navAutomobiles: "Auto's",
  navAbout: "Over ons", navContact: "Contact",
  signIn: "Inloggen", postListing: "Advertentie plaatsen",

  heroLabel: "Europa's Toonaangevende Marktplaats",
  heroLine1: "Vind uw volgende",
  heroLine2: "Voertuig",
  heroSubtitle: "Duizenden nieuwe en gebruikte tractoren, voertuigen en landbouwmachines van geverifieerde dealers door heel Europa.",
  allCategories: "Alle categorieën",
  searchPlaceholder: "Merk, model of trefwoord",
  searchBtn: "Zoeken",
  popular: "Populair:",

  browseLabel: "Bladeren op type",
  browseTitle: "Uitrustingscategorieën",
  catTractors: "Tractoren", catCars: "Auto's", catTrucks: "Vrachtwagens",
  catAutomobiles: "Automobiles", catOtherMachinery: "Overige machines", catSpareParts: "Reserveonderdelen",
  listings: "advertenties",

  statListings: "Actieve advertenties", statDealers: "Geverifieerde dealers",
  statCountries: "Landen", statSold: "Verkochte machines",

  featuredLabel: "Zorgvuldig geselecteerd", featuredTitle: "Uitgelichte advertenties",
  viewAll: "Alles bekijken", viewAllListings: "Alle advertenties bekijken",

  whyLabel: "Waarom wij?", whyTitle: "Vertrouwd door professionals",
  whyReason1Title: "Geverifieerde verkopers",
  whyReason1Body: "Elke dealer op het platform wordt individueel geverifieerd. Handel grensoverschrijdend met volledig vertrouwen.",
  whyReason2Title: "Pan-Europees bereik",
  whyReason2Body: "28 landen gedekt. Toegewijde logistieke partners beschikbaar voor grensoverschreidend transport.",
  whyReason3Title: "Inspectierapporten",
  whyReason3Body: "Vraag gecertificeerde inspectierapporten van derden aan voordat u zich aan een aankoop verbindt.",

  ctaLabel: "Voor verkopers", ctaTitle: "Heeft u machines te verkopen?",
  ctaBody: "Plaats uw advertentie in minuten en bereik duizenden gekwalificeerde kopers door heel Europa.",
  ctaBtn: "Advertentie plaatsen", ctaBtnSecondary: "Dealerplannen bekijken",

  tractorsTitle: "Tractoren te koop",
  tractorsCount: (n) => `${n} advertenties beschikbaar in Europa`,
  sortBy: "Sorteren",
  sortNewest: "Nieuwste eerst", sortPriceAsc: "Prijs: laag naar hoog",
  sortPriceDesc: "Prijs: hoog naar laag", sortHoursAsc: "Minste uren",
  filters: "Filters", clearAll: "Alles wissen",
  conditionLabel: "Staat", makeLabel: "Merk", yearLabel: "Jaar",
  priceLabel: "Prijs (EUR)", countryLabel: "Land",
  anyLabel: "Alle", applyFilters: "Filters toepassen",
  condAny: "Alle", condNew: "Nieuw", condUsed: "Gebruikt", condRefurbished: "Gereviseerd",
  pagination_prev: "Vorige", pagination_next: "Volgende",

  cardHours: "Uren", cardPower: "Vermogen", cardLocation: "Locatie",
  cardCountry: "Land", cardViewDetails: "Details bekijken",
  hrsUnit: "uur", hpUnit: "pk",

  breadHome: "Home", specsMake: "Merk", specsModel: "Model",
  specsYear: "Jaar", specsCondition: "Staat", specsHorsepower: "Vermogen",
  specsHours: "Uren", specsTransmission: "Transmissie", specsDrive: "Aandrijving",
  specsLocation: "Locatie", specificationsTitle: "Specificaties",
  contactSeller: "Verkoper contacteren", repliesVia: "Antwoorden via WhatsApp",
  buyerGuidanceTitle: "Kopersadvies",
  buyerGuidanceBody: "Inspecteer machines altijd persoonlijk voor aankoop. Voor transacties van hoge waarde raden we onze escrowservice aan.",
  backToListings: "Terug naar advertenties",

  formName: "Volledige naam", formEmail: "E-mailadres",
  formPhone: "Telefoonnummer (optioneel)",
  formDefaultMessage: (title) => `Hallo, ik ben geïnteresseerd in ${title}. Kunt u mij laten weten of het nog beschikbaar is?`,
  formSending: "Verzenden...", formSubmit: "Vraag versturen",
  formSuccessTitle: "Bericht verzonden",
  formSuccessBody: "De verkoper neemt binnenkort contact met u op.",
  formSuccessBtn: "Nog een bericht sturen",
  formError: "Er ging iets mis. Probeer het opnieuw.",

  condLabelNew: "Nieuw", condLabelUsed: "Gebruikt", condLabelRefurbished: "Gereviseerd",

  notFoundCode: "404", notFoundTitle: "Pagina niet gevonden",
  notFoundBody: "De pagina die u zoekt bestaat niet of is verplaatst.",
  goHome: "Naar home", browseListings: "Advertenties bekijken",

  footerTagline: "Europa's toonaangevende marktplaats voor alle soorten voertuigen. Kopers en verkopers wereldwijd verbinden sinds 2005.",
  footerRegistered: "Geregistreerd in de Europese Unie",
  footerBrowse: "Bladeren", footerSellers: "Verkopers", footerCompany: "Bedrijf", footerSupport: "Ondersteuning",
  footerAboutUs: "Over ons", footerCareers: "Carrières", footerPress: "Pers",
  footerHelpCenter: "Helpcentrum", footerSafetyTips: "Veiligheidstips",
  footerPrivacy: "Privacybeleid", footerTerms: "Gebruiksvoorwaarden",
  footerPostListing: "Advertentie plaatsen", footerDealerAccounts: "Dealeraccounts",
  footerPricing: "Prijzen", footerSellerResources: "Verkoopbronnen",
};

export default nl;
