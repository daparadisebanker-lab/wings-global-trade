import type { Translations } from "@/lib/i18n";

const en: Translations = {
  topBar: "Europe's Vehicle & Machinery Marketplace",
  navHome: "Home", navTractors: "Tractors", navAutomobiles: "Automobiles",
  navAbout: "About Us", navContact: "Contact",
  signIn: "Sign In", postListing: "Post Listing",

  heroLabel: "Europe's Leading Marketplace",
  heroLine1: "Find Your Next",
  heroLine2: "Vehicle",
  heroSubtitle: "Thousands of new and used tractors, vehicles, and agricultural equipment from verified dealers across Europe.",
  allCategories: "All Categories",
  searchPlaceholder: "Brand, model, or keyword",
  searchBtn: "Search",
  popular: "Popular:",

  browseLabel: "Browse by Type",
  browseTitle: "Equipment Categories",
  catTractors: "Tractors", catCars: "Cars", catTrucks: "Trucks",
  catAutomobiles: "Automobiles", catOtherMachinery: "Other Machinery", catSpareParts: "Spare Parts",
  listings: "listings",

  statListings: "Active Listings", statDealers: "Verified Dealers",
  statCountries: "Countries", statSold: "Machines Sold",

  featuredLabel: "Hand-picked", featuredTitle: "Featured Listings",
  viewAll: "View All", viewAllListings: "View All Listings",

  whyLabel: "Why Choose Us", whyTitle: "Trusted by Professionals",
  whyReason1Title: "Verified Sellers",
  whyReason1Body: "Every dealer on the platform is individually verified. Trade across borders with full confidence.",
  whyReason2Title: "Pan-European Reach",
  whyReason2Body: "28 countries covered. Dedicated logistics partners available for cross-border transport.",
  whyReason3Title: "Inspection Reports",
  whyReason3Body: "Request certified third-party inspection reports before committing to any purchase.",

  ctaLabel: "For Sellers", ctaTitle: "Have Machinery to Sell?",
  ctaBody: "Post your listing in minutes and reach thousands of qualified buyers across Europe.",
  ctaBtn: "Post a Listing", ctaBtnSecondary: "View Dealer Plans",

  tractorsTitle: "Tractors for Sale",
  tractorsCount: (n) => `${n} listings available across Europe`,
  sortBy: "Sort",
  sortNewest: "Newest First", sortPriceAsc: "Price: Low to High",
  sortPriceDesc: "Price: High to Low", sortHoursAsc: "Lowest Hours",
  filters: "Filters", clearAll: "Clear all",
  conditionLabel: "Condition", makeLabel: "Make", yearLabel: "Year",
  priceLabel: "Price (EUR)", countryLabel: "Country",
  anyLabel: "Any", applyFilters: "Apply Filters",
  condAny: "Any", condNew: "New", condUsed: "Used", condRefurbished: "Refurbished",
  pagination_prev: "Previous", pagination_next: "Next",

  cardHours: "Hours", cardPower: "Power", cardLocation: "Location",
  cardCountry: "Country", cardViewDetails: "View Details",
  hrsUnit: "hrs", hpUnit: "hp",

  breadHome: "Home", specsMake: "Make", specsModel: "Model",
  specsYear: "Year", specsCondition: "Condition", specsHorsepower: "Horsepower",
  specsHours: "Hours", specsTransmission: "Transmission", specsDrive: "Drive",
  specsLocation: "Location", specificationsTitle: "Specifications",
  contactSeller: "Contact Seller", repliesVia: "Replies delivered via WhatsApp",
  buyerGuidanceTitle: "Buyer Guidance",
  buyerGuidanceBody: "Always inspect machinery in person before purchase. For high-value transactions, we recommend using our escrow service.",
  backToListings: "Back to Listings",

  formName: "Full name", formEmail: "Email address",
  formPhone: "Phone number (optional)",
  formDefaultMessage: (title) => `Hello, I am interested in the ${title}. Please let me know if it is still available.`,
  formSending: "Sending...", formSubmit: "Send Inquiry",
  formSuccessTitle: "Message Sent",
  formSuccessBody: "The seller will be in touch with you shortly.",
  formSuccessBtn: "Send Another Message",
  formError: "Something went wrong. Please try again.",

  condLabelNew: "New", condLabelUsed: "Used", condLabelRefurbished: "Refurbished",

  notFoundCode: "404", notFoundTitle: "Page Not Found",
  notFoundBody: "The page you are looking for does not exist or has been moved.",
  goHome: "Go Home", browseListings: "Browse Listings",

  footerTagline: "Europe's leading marketplace for all kinds of vehicles. Connecting buyers and sellers worldwide since 2005.",
  footerRegistered: "Registered in the European Union",
  footerBrowse: "Browse", footerSellers: "Sellers", footerCompany: "Company", footerSupport: "Support",
  footerAboutUs: "About Us", footerCareers: "Careers", footerPress: "Press",
  footerHelpCenter: "Help Center", footerSafetyTips: "Safety Tips",
  footerPrivacy: "Privacy Policy", footerTerms: "Terms of Use",
  footerPostListing: "Post a Listing", footerDealerAccounts: "Dealer Accounts",
  footerPricing: "Pricing", footerSellerResources: "Seller Resources",
};

export default en;
