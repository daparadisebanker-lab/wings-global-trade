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
  tractorsCount: (n) => `${n} annonces disponibles en Europe`,
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
};

export default fr;
