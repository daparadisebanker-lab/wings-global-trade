import type { Translations } from "@/lib/i18n";

const fr: Translations = {
  topBar: "La Marketplace Européenne de Véhicules et Machines",
  navHome: "Accueil", navTractors: "Tracteurs", navAutomobiles: "Automobiles",
  navAbout: "À propos", navContact: "Contact",
  signIn: "Se connecter", postListing: "Publier une annonce",

  heroLabel: "La Première Marketplace d'Europe",
  heroLine1: "Trouvez votre prochain",
  heroLine2: "Véhicule",
  heroSubtitle: "Des milliers de tracteurs, véhicules et engins agricoles neufs et d'occasion auprès de concessionnaires vérifiés dans toute l'Europe.",
  allCategories: "Toutes les catégories",
  searchPlaceholder: "Marque, modèle ou mot-clé",
  searchBtn: "Rechercher",
  popular: "Populaire :",

  browseLabel: "Parcourir par type",
  browseTitle: "Catégories d'équipements",
  catTractors: "Tracteurs", catCars: "Voitures", catTrucks: "Camions",
  catAutomobiles: "Automobiles", catOtherMachinery: "Autres machines", catSpareParts: "Pièces détachées",
  listings: "annonces",

  statListings: "Annonces actives", statDealers: "Concessionnaires vérifiés",
  statCountries: "Pays", statSold: "Machines vendues",

  featuredLabel: "Sélection", featuredTitle: "Annonces en vedette",
  viewAll: "Voir tout", viewAllListings: "Voir toutes les annonces",

  whyLabel: "Pourquoi nous choisir", whyTitle: "La confiance des professionnels",
  whyReason1Title: "Vendeurs vérifiés",
  whyReason1Body: "Chaque concessionnaire sur la plateforme est vérifié individuellement. Commercez en toute confiance au-delà des frontières.",
  whyReason2Title: "Portée paneuropéenne",
  whyReason2Body: "28 pays couverts. Des partenaires logistiques dédiés disponibles pour le transport transfrontalier.",
  whyReason3Title: "Rapports d'inspection",
  whyReason3Body: "Demandez des rapports d'inspection certifiés par des tiers avant de vous engager dans tout achat.",

  ctaLabel: "Pour les vendeurs", ctaTitle: "Vous avez des machines à vendre ?",
  ctaBody: "Publiez votre annonce en quelques minutes et atteignez des milliers d'acheteurs qualifiés dans toute l'Europe.",
  ctaBtn: "Publier une annonce", ctaBtnSecondary: "Voir les plans concessionnaires",

  tractorsTitle: "Tracteurs à vendre",
  tractorsCount: (n) => `${n} annonces disponibles`,
  sortBy: "Trier",
  sortNewest: "Plus récents", sortPriceAsc: "Prix : croissant",
  sortPriceDesc: "Prix : décroissant", sortHoursAsc: "Moins d'heures",
  filters: "Filtres", clearAll: "Tout effacer",
  conditionLabel: "État", makeLabel: "Marque", yearLabel: "Année",
  priceLabel: "Prix (EUR)", countryLabel: "Pays",
  anyLabel: "Tous", applyFilters: "Appliquer les filtres",
  condAny: "Tous", condNew: "Neuf", condUsed: "Occasion", condRefurbished: "Reconditionné",
  pagination_prev: "Précédent", pagination_next: "Suivant",

  cardHours: "Heures", cardPower: "Puissance", cardLocation: "Localisation",
  cardCountry: "Pays", cardViewDetails: "Voir les détails",
  hrsUnit: "h", hpUnit: "ch",

  breadHome: "Accueil", specsMake: "Marque", specsModel: "Modèle",
  specsYear: "Année", specsCondition: "État", specsHorsepower: "Puissance",
  specsHours: "Heures", specsTransmission: "Transmission", specsDrive: "Transmission",
  specsLocation: "Localisation", specificationsTitle: "Spécifications",
  contactSeller: "Contacter le vendeur", repliesVia: "Réponses via WhatsApp",
  buyerGuidanceTitle: "Conseils pour les acheteurs",
  buyerGuidanceBody: "Inspectez toujours les machines en personne avant l'achat. Pour les transactions de grande valeur, nous recommandons d'utiliser notre service de séquestre.",
  backToListings: "Retour aux annonces",

  formName: "Nom complet", formEmail: "Adresse e-mail",
  formPhone: "Numéro de téléphone (optionnel)",
  formDefaultMessage: (title) => `Bonjour, je suis intéressé(e) par ${title}. Pourriez-vous me dire s'il est encore disponible ?`,
  formSending: "Envoi en cours...", formSubmit: "Envoyer la demande",
  formSuccessTitle: "Message envoyé",
  formSuccessBody: "Le vendeur vous contactera très prochainement.",
  formSuccessBtn: "Envoyer un autre message",
  formError: "Une erreur s'est produite. Veuillez réessayer.",

  condLabelNew: "Neuf", condLabelUsed: "Occasion", condLabelRefurbished: "Reconditionné",

  notFoundCode: "404", notFoundTitle: "Page introuvable",
  notFoundBody: "La page que vous recherchez n'existe pas ou a été déplacée.",
  goHome: "Accueil", browseListings: "Parcourir les annonces",

  footerTagline: "La première marketplace d'Europe pour tous les types de véhicules. Connectant acheteurs et vendeurs dans le monde entier depuis 2005.",
  footerRegistered: "Enregistré dans l'Union européenne",
  footerBrowse: "Parcourir", footerSellers: "Vendeurs", footerCompany: "Entreprise", footerSupport: "Support",
  footerAboutUs: "À propos", footerCareers: "Carrières", footerPress: "Presse",
  footerHelpCenter: "Centre d'aide", footerSafetyTips: "Conseils de sécurité",
  footerPrivacy: "Politique de confidentialité", footerTerms: "Conditions d'utilisation",
  footerPostListing: "Publier une annonce", footerDealerAccounts: "Comptes concessionnaires",
  footerPricing: "Tarifs", footerSellerResources: "Ressources vendeurs",

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

    const intro = `Le {b} {m} est un tracteur agricole de qualité professionnelle conçu pour les opérations agricoles modernes.`.replace("{b}", b).replace("{m}", m);
    const engine = engine_model ? `Propulsé par un moteur {e} très efficace,`.replace("{e}", engine_model) : `Équipé d'un groupe motopropulseur fiable,`;
    const hp = hp_val ? `délivrant une puissance robuste de {hp} chevaux,`.replace("{hp}", hp_val) : `conçu pour des performances fiables,`;
    const mid = `il offre un équilibre exceptionnel entre couple et rendement énergétique.`;
    
    let drivetrain = "";
    if (drive && trans) drivetrain = `La transmission {d}, associée à une boîte de vitesses {t} polyvalente, assure une traction optimale et une transmission de puissance fluide sur des terrains difficiles.`.replace("{d}", drive).replace("{t}", trans);
    else if (drive) drivetrain = `La configuration {d} offre une traction et une stabilité supérieures dans les environnements agricoles exigeants.`.replace("{d}", drive);
    else if (trans) drivetrain = `Sa boîte de vitesses {t} polyvalente permet aux opérateurs de s'adapter sans effort à diverses conditions de terrain et aux exigences des outils.`.replace("{t}", trans);

    let capability = "";
    if (weight && pto) capability = `Pesant {w} kg, il offre une plateforme stable pour les outils lourds, tandis que la prise de force de {p} tr/min assure un transfert de puissance fiable pour une large gamme d'accessoires.`.replace("{w}", weight).replace("{p}", pto);
    else if (weight) capability = `Pesant {w} kg, il offre une plateforme très stable et imposante pour les outils agricoles lourds.`.replace("{w}", weight);
    else if (pto) capability = `Le système de prise de force avancé de {p} tr/min fournit un transfert de puissance fiable et continu pour les accessoires agricoles exigeants.`.replace("{p}", pto);

    const outro = `Conçu pour l'endurance et l'excellence opérationnelle, le {m} s'impose comme un atout indispensable pour maximizar la productivité aux champs.`.replace("{m}", m);

    return `${intro} ${engine} ${hp} ${mid} ${drivetrain} ${capability} ${outro}`.replace(/\s+/g, ' ').trim();
  },

};

export default fr;
