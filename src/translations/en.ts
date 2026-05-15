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
  tractorsCount: (n) => `${n} listings available`,
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

    const intro = `The {b} {m} is a professional-grade agricultural tractor designed for modern farming operations.`.replace("{b}", b).replace("{m}", m);
    const engine = engine_model ? `Powered by a highly-efficient {e} engine,`.replace("{e}", engine_model) : `Equipped with a dependable power plant,`;
    const hp = hp_val ? `delivering a robust {hp} horsepower,`.replace("{hp}", hp_val) : `engineered for reliable performance,`;
    const mid = `it provides an exceptional balance of torque and fuel efficiency.`;
    
    let drivetrain = "";
    if (drive && trans) drivetrain = `The {d} drivetrain, paired with a versatile {t} transmission, ensures optimal traction and seamless power delivery across challenging terrains.`.replace("{d}", drive).replace("{t}", trans);
    else if (drive) drivetrain = `The {d} configuration provides superior traction and stability in demanding agricultural environments.`.replace("{d}", drive);
    else if (trans) drivetrain = `Its versatile {t} transmission allows operators to adapt effortlessly to various field conditions and implement requirements.`.replace("{t}", trans);

    let capability = "";
    if (weight && pto) capability = `Weighing in at {w} kg, it offers a stable platform for heavy-duty implements, while the {p} RPM PTO provides dependable power transfer for a wide range of attachments.`.replace("{w}", weight).replace("{p}", pto);
    else if (weight) capability = `Weighing in at {w} kg, it offers a highly stable and commanding platform for heavy-duty agricultural implements.`.replace("{w}", weight);
    else if (pto) capability = `The advanced {p} RPM PTO system provides dependable, continuous power transfer for demanding agricultural attachments.`.replace("{p}", pto);

    const outro = `Built for endurance and operational excellence, the {m} stands as an indispensable asset for maximizing productivity in the field.`.replace("{m}", m);

    return `${intro} ${engine} ${hp} ${mid} ${drivetrain} ${capability} ${outro}`.replace(/\s+/g, ' ').trim();
  },

};

export default en;
