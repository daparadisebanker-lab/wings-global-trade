import type { Translations } from "@/lib/i18n";

const de: Translations = {
  topBar: "Europas Marktplatz für Fahrzeuge & Maschinen",
  navHome: "Startseite", navTractors: "Traktoren", navAutomobiles: "Automobile",
  navAbout: "Über uns", navContact: "Kontakt",
  signIn: "Anmelden", postListing: "Inserat aufgeben",

  heroLabel: "Europas führender Marktplatz",
  heroLine1: "Finden Sie Ihr nächstes",
  heroLine2: "Fahrzeug",
  heroSubtitle: "Tausende neue und gebrauchte Traktoren, Fahrzeuge und Landmaschinen von verifizierten Händlern in ganz Europa.",
  allCategories: "Alle Kategorien",
  searchPlaceholder: "Marke, Modell oder Stichwort",
  searchBtn: "Suchen",
  popular: "Beliebt:",

  browseLabel: "Nach Typ stöbern",
  browseTitle: "Gerätekategorien",
  catTractors: "Traktoren", catCars: "Pkw", catTrucks: "Lkw",
  catAutomobiles: "Automobile", catOtherMachinery: "Sonstige Maschinen", catSpareParts: "Ersatzteile",
  listings: "Inserate",

  statListings: "Aktive Inserate", statDealers: "Verifizierte Händler",
  statCountries: "Länder", statSold: "Verkaufte Maschinen",

  featuredLabel: "Handverlesen", featuredTitle: "Empfohlene Inserate",
  viewAll: "Alle anzeigen", viewAllListings: "Alle Inserate anzeigen",

  whyLabel: "Warum wir?", whyTitle: "Von Profis vertraut",
  whyReason1Title: "Verifizierte Verkäufer",
  whyReason1Body: "Jeder Händler auf der Plattform wird einzeln verifiziert. Handeln Sie grenzüberschreitend mit vollem Vertrauen.",
  whyReason2Title: "Paneuropäische Reichweite",
  whyReason2Body: "28 Länder abgedeckt. Dedizierte Logistikpartner für den grenzüberschreitenden Transport verfügbar.",
  whyReason3Title: "Inspektionsberichte",
  whyReason3Body: "Fordern Sie zertifizierte Inspektionsberichte von Drittanbietern an, bevor Sie einen Kauf abschließen.",

  ctaLabel: "Für Verkäufer", ctaTitle: "Haben Sie Maschinen zu verkaufen?",
  ctaBody: "Geben Sie Ihr Inserat in Minuten auf und erreichen Sie Tausende qualifizierter Käufer in ganz Europa.",
  ctaBtn: "Inserat aufgeben", ctaBtnSecondary: "Händlerpläne ansehen",

  tractorsTitle: "Traktoren zum Verkauf",
  tractorsCount: (n) => `${n} Inserate verfügbar`,
  sortBy: "Sortieren",
  sortNewest: "Neueste zuerst", sortPriceAsc: "Preis: aufsteigend",
  sortPriceDesc: "Preis: absteigend", sortHoursAsc: "Wenigste Stunden",
  filters: "Filter", clearAll: "Alle löschen",
  conditionLabel: "Zustand", makeLabel: "Marke", yearLabel: "Jahr",
  priceLabel: "Preis (EUR)", countryLabel: "Land",
  anyLabel: "Alle", applyFilters: "Filter anwenden",
  condAny: "Alle", condNew: "Neu", condUsed: "Gebraucht", condRefurbished: "Generalüberholt",
  pagination_prev: "Zurück", pagination_next: "Weiter",

  cardHours: "Stunden", cardPower: "Leistung", cardLocation: "Standort",
  cardCountry: "Land", cardViewDetails: "Details anzeigen",
  hrsUnit: "Std.", hpUnit: "PS",

  breadHome: "Startseite", specsMake: "Marke", specsModel: "Modell",
  specsYear: "Jahr", specsCondition: "Zustand", specsHorsepower: "Leistung",
  specsHours: "Stunden", specsTransmission: "Getriebe", specsDrive: "Antrieb",
  specsLocation: "Standort", specificationsTitle: "Technische Daten",
  contactSeller: "Verkäufer kontaktieren", repliesVia: "Antworten per WhatsApp",
  buyerGuidanceTitle: "Käuferhinweise",
  buyerGuidanceBody: "Besichtigen Sie Maschinen immer persönlich vor dem Kauf. Bei hochwertigen Transaktionen empfehlen wir unseren Treuhandservice.",
  backToListings: "Zurück zu den Inseraten",

  formName: "Vollständiger Name", formEmail: "E-Mail-Adresse",
  formPhone: "Telefonnummer (optional)",
  formDefaultMessage: (title) => `Hallo, ich interessiere mich für ${title}. Bitte teilen Sie mir mit, ob es noch verfügbar ist.`,
  formSending: "Wird gesendet...", formSubmit: "Anfrage senden",
  formSuccessTitle: "Nachricht gesendet",
  formSuccessBody: "Der Verkäufer wird sich in Kürze bei Ihnen melden.",
  formSuccessBtn: "Weitere Nachricht senden",
  formError: "Etwas ist schiefgelaufen. Bitte versuchen Sie es erneut.",

  condLabelNew: "Neu", condLabelUsed: "Gebraucht", condLabelRefurbished: "Generalüberholt",

  notFoundCode: "404", notFoundTitle: "Seite nicht gefunden",
  notFoundBody: "Die gesuchte Seite existiert nicht oder wurde verschoben.",
  goHome: "Zur Startseite", browseListings: "Inserate durchsuchen",

  footerTagline: "Europas führender Marktplatz für alle Arten von Fahrzeugen. Käufer und Verkäufer weltweit verbinden seit 2005.",
  footerRegistered: "Registriert in der Europäischen Union",
  footerBrowse: "Stöbern", footerSellers: "Verkäufer", footerCompany: "Unternehmen", footerSupport: "Support",
  footerAboutUs: "Über uns", footerCareers: "Karriere", footerPress: "Presse",
  footerHelpCenter: "Hilfecenter", footerSafetyTips: "Sicherheitshinweise",
  footerPrivacy: "Datenschutzrichtlinie", footerTerms: "Nutzungsbedingungen",
  footerPostListing: "Inserat aufgeben", footerDealerAccounts: "Händlerkonten",
  footerPricing: "Preise", footerSellerResources: "Verkäuferressourcen",

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

    const intro = `Der {b} {m} ist ein professioneller landwirtschaftlicher Traktor, der für moderne landwirtschaftliche Betriebe entwickelt wurde.`.replace("{b}", b).replace("{m}", m);
    const engine = engine_model ? `Angetrieben von einem hocheffizienten {e}-Motor,`.replace("{e}", engine_model) : `Ausgestattet mit einem zuverlässigen Antriebsaggregat,`;
    const hp = hp_val ? `das eine robuste Leistung von {hp} PS liefert,`.replace("{hp}", hp_val) : `auf zuverlässige Leistung ausgelegt,`;
    const mid = `bietet er eine außergewöhnliche Balance zwischen Drehmoment und Kraftstoffeffizienz.`;
    
    let drivetrain = "";
    if (drive && trans) drivetrain = `Der {d}-Antriebsstrang, gepaart mit einem vielseitigen {t}-Getriebe, sorgt für optimale Traktion und nahtlose Kraftübertragung in schwierigem Gelände.`.replace("{d}", drive).replace("{t}", trans);
    else if (drive) drivetrain = `Die {d}-Konfiguration bietet überlegene Traktion und Stabilität in anspruchsvollen landwirtschaftlichen Umgebungen.`.replace("{d}", drive);
    else if (trans) drivetrain = `Das vielseitige {t}-Getriebe ermöglicht es den Bedienern, sich mühelos an verschiedene Feldbedingungen und Anforderungen an Anbaugeräte anzupassen.`.replace("{t}", trans);

    let capability = "";
    if (weight && pto) capability = `Mit einem Gewicht von {w} kg bietet er eine stabile Plattform für schwere Anbaugeräte, während die Zapfwelle mit {p} U/min eine zuverlässige Kraftübertragung für eine Vielzahl von Anbaugeräten bietet.`.replace("{w}", weight).replace("{p}", pto);
    else if (weight) capability = `Mit einem Gewicht von {w} kg bietet er eine äußerst stabile und souveräne Plattform für schwere landwirtschaftliche Anbaugeräte.`.replace("{w}", weight);
    else if (pto) capability = `Das fortschrittliche Zapfwellensystem mit {p} U/min bietet eine zuverlässige, kontinuierliche Kraftübertragung für anspruchsvolle landwirtschaftliche Anbaugeräte.`.replace("{p}", pto);

    const outro = `Gebaut für Ausdauer und operative Exzellenz, ist der {m} ein unverzichtbares Gut zur Maximierung der Produktivität auf dem Feld.`.replace("{m}", m);

    return `${intro} ${engine} ${hp} ${mid} ${drivetrain} ${capability} ${outro}`.replace(/\s+/g, ' ').trim();
  },

};

export default de;
