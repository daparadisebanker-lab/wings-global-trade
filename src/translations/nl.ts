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
  tractorsCount: (n) => `${n} advertenties beschikbaar`,
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

    const intro = `De {b} {m} is een professionele landbouwtractor ontworpen voor moderne landbouwactiviteiten.`.replace("{b}", b).replace("{m}", m);
    const engine = engine_model ? `Aangedreven door een uiterst efficiënte {e}-motor,`.replace("{e}", engine_model) : `Uitgerust met een betrouwbare krachtbron,`;
    const hp = hp_val ? `die een robuuste {hp} pk levert,`.replace("{hp}", hp_val) : `ontworpen voor betrouwbare prestaties,`;
    const mid = `biedt hij een uitzonderlijke balans tussen koppel en brandstofefficiëntie.`;
    
    let drivetrain = "";
    if (drive && trans) drivetrain = `De {d}-aandrijflijn, gecombineerd met een veelzijdige {t}-transmissie, zorgt voor optimale tractie en naadloze vermogensafgifte op uitdagend terrein.`.replace("{d}", drive).replace("{t}", trans);
    else if (drive) drivetrain = `De {d}-configuratie biedt superieure tractie en stabiliteit in veeleisende landbouwomgevingen.`.replace("{d}", drive);
    else if (trans) drivetrain = `De veelzijdige {t}-transmissie stelt bestuurders in staat zich moeiteloos aan te passen aan verschillende veldomstandigheden en werktuigvereisten.`.replace("{t}", trans);

    let capability = "";
    if (weight && pto) capability = `Met een gewicht van {w} kg biedt hij een stabiel platform voor zware werktuigen, terwijl de {p} tpm aftakas zorgt voor een betrouwbare krachtoverbrenging voor een breed scala aan aanbouwdelen.`.replace("{w}", weight).replace("{p}", pto);
    else if (weight) capability = `Met een gewicht van {w} kg biedt hij een uiterst stabiel en indrukwekkend platform voor zware landbouwwerktuigen.`.replace("{w}", weight);
    else if (pto) capability = `Het geavanceerde {p} tpm aftakassysteem biedt een betrouwbare, continue krachtoverbrenging voor veeleisende landbouwaanbouwdelen.`.replace("{p}", pto);

    const outro = `Gebouwd voor uithoudingsvermogen en operationele uitmuntendheid, staat de {m} als een onmisbare aanwinst voor het maximaliseren van de productiviteit op het veld.`.replace("{m}", m);

    return `${intro} ${engine} ${hp} ${mid} ${drivetrain} ${capability} ${outro}`.replace(/\s+/g, ' ').trim();
  },

};

export default nl;
