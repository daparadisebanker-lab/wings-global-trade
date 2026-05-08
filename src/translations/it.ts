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
  tractorsCount: (n) => `${n} annunci disponibili in Europa`,
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
};

export default it;
