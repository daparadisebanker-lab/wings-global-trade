import type { Translations } from "@/lib/i18n";

const it: Translations = {
  topBar: "Il Marketplace Europeo di Veicoli e Macchinari",
  navHome: "Home", navTractors: "Trattori", navAutomobiles: "Automobili",
  navAbout: "Chi siamo", navContact: "Contatti",
  signIn: "Accedi", postListing: "Pubblica annuncio",

  heroLabel: "Il Marketplace Leader d'Europa",
  heroLine1: "Trova il tuo prossimo",
  heroLine2: "Veicolo",
  heroSubtitle: "Migliaia di trattori, veicoli e macchine agricole nuovi e usati da concessionari verificati in tutta Europa.",
  allCategories: "Tutte le categorie",
  searchPlaceholder: "Marca, modello o parola chiave",
  searchBtn: "Cerca",
  popular: "Popolare:",

  browseLabel: "Sfoglia per tipo",
  browseTitle: "Categorie di attrezzatura",
  catTractors: "Trattori", catCars: "Auto", catTrucks: "Camion",
  catAutomobiles: "Automobili", catOtherMachinery: "Altri macchinari", catSpareParts: "Ricambi",
  listings: "annunci",

  statListings: "Annunci attivi", statDealers: "Concessionari verificati",
  statCountries: "Paesi", statSold: "Macchine vendute",

  featuredLabel: "Selezione curata", featuredTitle: "Annunci in evidenza",
  viewAll: "Vedi tutti", viewAllListings: "Vedi tutti gli annunci",

  whyLabel: "Perché sceglierci", whyTitle: "La fiducia dei professionisti",
  whyReason1Title: "Venditori verificati",
  whyReason1Body: "Ogni concessionario sulla piattaforma è verificato individualmente. Commercia oltre i confini in tutta fiducia.",
  whyReason2Title: "Copertura paneuropea",
  whyReason2Body: "28 paesi coperti. Partner logistici dedicati disponibili per il trasporto transfrontaliero.",
  whyReason3Title: "Rapporti di ispezione",
  whyReason3Body: "Richiedi rapporti di ispezione certificati da terzi prima di impegnarti in qualsiasi acquisto.",

  ctaLabel: "Per i venditori", ctaTitle: "Hai macchinari da vendere?",
  ctaBody: "Pubblica il tuo annuncio in pochi minuti e raggiungi migliaia di acquirenti qualificati in tutta Europa.",
  ctaBtn: "Pubblica un annuncio", ctaBtnSecondary: "Vedi piani per concessionari",

  tractorsTitle: "Trattori in vendita",
  tractorsCount: (n) => `${n} annunci disponibili`,
  sortBy: "Ordina",
  sortNewest: "Più recenti", sortPriceAsc: "Prezzo: crescente",
  sortPriceDesc: "Prezzo: decrescente", sortHoursAsc: "Meno ore",
  filters: "Filtri", clearAll: "Cancella tutto",
  conditionLabel: "Condizione", makeLabel: "Marca", yearLabel: "Anno",
  priceLabel: "Prezzo (EUR)", countryLabel: "Paese",
  anyLabel: "Qualsiasi", applyFilters: "Applica filtri",
  condAny: "Qualsiasi", condNew: "Nuovo", condUsed: "Usato", condRefurbished: "Ricondizionato",
  pagination_prev: "Precedente", pagination_next: "Successivo",

  cardHours: "Ore", cardPower: "Potenza", cardLocation: "Posizione",
  cardCountry: "Paese", cardViewDetails: "Vedi dettagli",
  hrsUnit: "ore", hpUnit: "cv",

  breadHome: "Home", specsMake: "Marca", specsModel: "Modello",
  specsYear: "Anno", specsCondition: "Condizione", specsHorsepower: "Potenza",
  specsHours: "Ore", specsTransmission: "Trasmissione", specsDrive: "Trazione",
  specsLocation: "Posizione", specificationsTitle: "Specifiche tecniche",
  contactSeller: "Contatta il venditore", repliesVia: "Risposte via WhatsApp",
  buyerGuidanceTitle: "Guida all'acquisto",
  buyerGuidanceBody: "Ispeziona sempre i macchinari di persona prima dell'acquisto. Per transazioni di alto valore, consigliamo di utilizzare il nostro servizio di escrow.",
  backToListings: "Torna agli annunci",

  formName: "Nome completo", formEmail: "Indirizzo e-mail",
  formPhone: "Numero di telefono (opzionale)",
  formDefaultMessage: (title) => `Salve, sono interessato/a a ${title}. Potrebbe dirmi se è ancora disponibile?`,
  formSending: "Invio in corso...", formSubmit: "Invia richiesta",
  formSuccessTitle: "Messaggio inviato",
  formSuccessBody: "Il venditore ti contatterà a breve.",
  formSuccessBtn: "Invia un altro messaggio",
  formError: "Qualcosa è andato storto. Riprova.",

  condLabelNew: "Nuovo", condLabelUsed: "Usato", condLabelRefurbished: "Ricondizionato",

  notFoundCode: "404", notFoundTitle: "Pagina non trovata",
  notFoundBody: "La pagina che stai cercando non esiste o è stata spostata.",
  goHome: "Vai alla home", browseListings: "Sfoglia annunci",

  footerTagline: "Il marketplace leader d'Europa per tutti i tipi di veicoli. Collegando acquirenti e venditori in tutto il mondo dal 2005.",
  footerRegistered: "Registrato nell'Unione Europea",
  footerBrowse: "Sfoglia", footerSellers: "Venditori", footerCompany: "Azienda", footerSupport: "Supporto",
  footerAboutUs: "Chi siamo", footerCareers: "Carriere", footerPress: "Stampa",
  footerHelpCenter: "Centro assistenza", footerSafetyTips: "Consigli di sicurezza",
  footerPrivacy: "Informativa sulla privacy", footerTerms: "Termini di utilizzo",
  footerPostListing: "Pubblica annuncio", footerDealerAccounts: "Account concessionari",
  footerPricing: "Prezzi", footerSellerResources: "Risorse per i venditori",

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

    const intro = `Il {b} {m} è un trattore agricolo di livello professionale progettato per le moderne operazioni agricole.`.replace("{b}", b).replace("{m}", m);
    const engine = engine_model ? `Alimentato da un motore {e} ad alta efficienza,`.replace("{e}", engine_model) : `Dotato di un affidabile propulsore,`;
    const hp = hp_val ? `che eroga una robusta potenza di {hp} cavalli,`.replace("{hp}", hp_val) : `progettato per prestazioni affidabili,`;
    const mid = `fornisce un eccezionale equilibrio tra coppia ed efficienza del carburante.`;
    
    let drivetrain = "";
    if (drive && trans) drivetrain = `La trasmissione {d}, abbinata a un versatile cambio {t}, garantisce una trazione ottimale e un'erogazione di potenza fluida su terreni difficili.`.replace("{d}", drive).replace("{t}", trans);
    else if (drive) drivetrain = `La configurazione {d} offre trazione e stabilità superiori in ambienti agricoli difficili.`.replace("{d}", drive);
    else if (trans) drivetrain = `Il suo versatile cambio {t} consente agli operatori di adattarsi senza sforzo a varie condizioni del campo e requisiti degli attrezzi.`.replace("{t}", trans);

    let capability = "";
    if (weight && pto) capability = `Con un peso di {w} kg, offre una piattaforma stabile per attrezzi pesanti, mentre la presa di forza da {p} giri/min fornisce un trasferimento di potenza affidabile per un'ampia gamma di accessori.`.replace("{w}", weight).replace("{p}", pto);
    else if (weight) capability = `Con un peso di {w} kg, offre una piattaforma altamente stabile e imponente per attrezzi agricoli pesanti.`.replace("{w}", weight);
    else if (pto) capability = `L'avanzato sistema di presa di forza da {p} giri/min fornisce un trasferimento di potenza affidabile e continuo per attrezzi agricoli impegnativi.`.replace("{p}", pto);

    const outro = `Costruito per la resistenza e l'eccellenza operativa, il {m} rappresenta una risorsa indispensabile per massimizzare la produttività sul campo.`.replace("{m}", m);

    return `${intro} ${engine} ${hp} ${mid} ${drivetrain} ${capability} ${outro}`.replace(/\s+/g, ' ').trim();
  },

};

export default it;
