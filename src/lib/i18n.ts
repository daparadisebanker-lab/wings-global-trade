export interface Translations {
  // Header / nav
  topBar: string;
  navHome: string;
  navTractors: string;
  navAutomobiles: string;
  navAbout: string;
  navContact: string;
  signIn: string;
  postListing: string;

  // Hero
  heroLabel: string;
  heroLine1: string;
  heroLine2: string;
  heroSubtitle: string;
  allCategories: string;
  searchPlaceholder: string;
  searchBtn: string;
  popular: string;

  // Categories section
  browseLabel: string;
  browseTitle: string;
  catTractors: string;
  catCars: string;
  catTrucks: string;
  catAutomobiles: string;
  catOtherMachinery: string;
  catSpareParts: string;
  listings: string;

  // Stats
  statListings: string;
  statDealers: string;
  statCountries: string;
  statSold: string;

  // Featured
  featuredLabel: string;
  featuredTitle: string;
  viewAll: string;
  viewAllListings: string;

  // Why us
  whyLabel: string;
  whyTitle: string;
  whyReason1Title: string;
  whyReason1Body: string;
  whyReason2Title: string;
  whyReason2Body: string;
  whyReason3Title: string;
  whyReason3Body: string;

  // CTA
  ctaLabel: string;
  ctaTitle: string;
  ctaBody: string;
  ctaBtn: string;
  ctaBtnSecondary: string;

  // Listings page
  tractorsTitle: string;
  tractorsCount: (n: number) => string;
  sortBy: string;
  sortNewest: string;
  sortPriceAsc: string;
  sortPriceDesc: string;
  sortHoursAsc: string;
  filters: string;
  clearAll: string;
  conditionLabel: string;
  makeLabel: string;
  yearLabel: string;
  priceLabel: string;
  countryLabel: string;
  anyLabel: string;
  applyFilters: string;
  condAny: string;
  condNew: string;
  condUsed: string;
  condRefurbished: string;
  pagination_prev: string;
  pagination_next: string;

  // Card
  cardHours: string;
  cardPower: string;
  cardLocation: string;
  cardCountry: string;
  cardViewDetails: string;
  hrsUnit: string;
  hpUnit: string;

  // Detail page
  breadHome: string;
  specsMake: string;
  specsModel: string;
  specsYear: string;
  specsCondition: string;
  specsHorsepower: string;
  specsHours: string;
  specsTransmission: string;
  specsDrive: string;
  specsLocation: string;
  specificationsTitle: string;
  contactSeller: string;
  repliesVia: string;
  buyerGuidanceTitle: string;
  buyerGuidanceBody: string;
  backToListings: string;

  // Inquiry form
  formName: string;
  formEmail: string;
  formPhone: string;
  formDefaultMessage: (title: string) => string;
  formSending: string;
  formSubmit: string;
  formSuccessTitle: string;
  formSuccessBody: string;
  formSuccessBtn: string;
  formError: string;

  // Condition labels
  condLabelNew: string;
  condLabelUsed: string;
  condLabelRefurbished: string;

  // 404
  notFoundCode: string;
  notFoundTitle: string;
  notFoundBody: string;
  goHome: string;
  browseListings: string;

  // Footer
  footerTagline: string;
  footerRegistered: string;
  footerBrowse: string;
  footerSellers: string;
  footerCompany: string;
  footerSupport: string;
  footerAboutUs: string;
  footerCareers: string;
  footerPress: string;
  footerHelpCenter: string;
  footerSafetyTips: string;
  footerPrivacy: string;
  footerTerms: string;
  footerPostListing: string;
  footerDealerAccounts: string;
  footerPricing: string;
  footerSellerResources: string;
}

// Country → language code
const COUNTRY_LANG: Record<string, string> = {
  // English
  US: "en", CA: "en", GB: "en", AU: "en", NZ: "en",
  IE: "en", ZA: "en", NG: "en", GH: "en", KE: "en",
  // Spanish — Spain + all Latin America
  ES: "es", MX: "es", CO: "es", AR: "es", CL: "es",
  PE: "es", VE: "es", EC: "es", GT: "es", HN: "es",
  SV: "es", NI: "es", CR: "es", PA: "es", DO: "es",
  CU: "es", BO: "es", PY: "es", UY: "es",
  // German
  DE: "de", AT: "de", CH: "de",
  // French
  FR: "fr", BE: "fr", LU: "fr", SN: "fr",
  // Portuguese
  PT: "pt", BR: "pt", AO: "pt", MZ: "pt",
  // Polish
  PL: "pl",
  // Italian
  IT: "it",
  // Dutch
  NL: "nl",
};

export const SUPPORTED_LANGUAGES = [
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
  { code: "de", label: "Deutsch" },
  { code: "fr", label: "Français" },
  { code: "pt", label: "Português" },
  { code: "pl", label: "Polski" },
  { code: "it", label: "Italiano" },
  { code: "nl", label: "Nederlands" },
];

export function getLanguageForCountry(countryCode: string): string {
  return COUNTRY_LANG[countryCode?.toUpperCase()] ?? "en";
}

export async function getTranslations(lang: string): Promise<Translations> {
  const supported = ["en", "es", "de", "fr", "pt", "pl", "it", "nl"];
  const code = supported.includes(lang) ? lang : "en";
  const mod = await import(`@/translations/${code}`);
  return mod.default as Translations;
}

export const LANG_COOKIE = "eg-lang";
export const DEFAULT_LANG = "en";
