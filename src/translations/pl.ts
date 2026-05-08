import type { Translations } from "@/lib/i18n";

const pl: Translations = {
  topBar: "Europejski Rynek Pojazdów i Maszyn",
  navHome: "Strona główna", navTractors: "Traktory", navAutomobiles: "Samochody",
  navAbout: "O nas", navContact: "Kontakt",
  signIn: "Zaloguj się", postListing: "Dodaj ogłoszenie",

  heroLabel: "Wiodący Rynek Europejski",
  heroLine1: "Znajdź swój następny",
  heroLine2: "Pojazd",
  heroSubtitle: "Tysiące nowych i używanych traktorów, pojazdów i maszyn rolniczych od zweryfikowanych dealerów z całej Europy.",
  allCategories: "Wszystkie kategorie",
  searchPlaceholder: "Marka, model lub słowo kluczowe",
  searchBtn: "Szukaj",
  popular: "Popularne:",

  browseLabel: "Przeglądaj według typu",
  browseTitle: "Kategorie sprzętu",
  catTractors: "Traktory", catCars: "Samochody osobowe", catTrucks: "Ciężarówki",
  catAutomobiles: "Samochody", catOtherMachinery: "Inne maszyny", catSpareParts: "Części zamienne",
  listings: "ogłoszeń",

  statListings: "Aktywne ogłoszenia", statDealers: "Zweryfikowani dealerzy",
  statCountries: "Kraje", statSold: "Sprzedanych maszyn",

  featuredLabel: "Starannie wybrane", featuredTitle: "Wyróżnione ogłoszenia",
  viewAll: "Zobacz wszystko", viewAllListings: "Zobacz wszystkie ogłoszenia",

  whyLabel: "Dlaczego my?", whyTitle: "Zaufanie profesjonalistów",
  whyReason1Title: "Zweryfikowani sprzedawcy",
  whyReason1Body: "Każdy dealer na platformie jest indywidualnie weryfikowany. Handluj ponad granicami z pełnym zaufaniem.",
  whyReason2Title: "Zasięg ogólnoeuropejski",
  whyReason2Body: "28 objętych krajów. Dedykowani partnerzy logistyczni dostępni dla transportu transgranicznego.",
  whyReason3Title: "Raporty z inspekcji",
  whyReason3Body: "Zażądaj certyfikowanych raportów z inspekcji od stron trzecich przed podjęciem jakiegokolwiek zakupu.",

  ctaLabel: "Dla sprzedawców", ctaTitle: "Masz maszyny na sprzedaż?",
  ctaBody: "Dodaj ogłoszenie w kilka minut i dotrzyj do tysięcy kwalifikowanych kupujących w całej Europie.",
  ctaBtn: "Dodaj ogłoszenie", ctaBtnSecondary: "Zobacz plany dla dealerów",

  tractorsTitle: "Traktory na sprzedaż",
  tractorsCount: (n) => `${n} ogłoszeń dostępnych w Europie`,
  sortBy: "Sortuj",
  sortNewest: "Najnowsze", sortPriceAsc: "Cena: rosnąco",
  sortPriceDesc: "Cena: malejąco", sortHoursAsc: "Najmniej godzin",
  filters: "Filtry", clearAll: "Wyczyść wszystko",
  conditionLabel: "Stan", makeLabel: "Marka", yearLabel: "Rok",
  priceLabel: "Cena (EUR)", countryLabel: "Kraj",
  anyLabel: "Dowolny", applyFilters: "Zastosuj filtry",
  condAny: "Dowolny", condNew: "Nowy", condUsed: "Używany", condRefurbished: "Odnowiony",
  pagination_prev: "Poprzedni", pagination_next: "Następny",

  cardHours: "Godziny", cardPower: "Moc", cardLocation: "Lokalizacja",
  cardCountry: "Kraj", cardViewDetails: "Zobacz szczegóły",
  hrsUnit: "godz.", hpUnit: "KM",

  breadHome: "Strona główna", specsMake: "Marka", specsModel: "Model",
  specsYear: "Rok", specsCondition: "Stan", specsHorsepower: "Moc",
  specsHours: "Godziny", specsTransmission: "Skrzynia biegów", specsDrive: "Napęd",
  specsLocation: "Lokalizacja", specificationsTitle: "Specyfikacje",
  contactSeller: "Skontaktuj się ze sprzedawcą", repliesVia: "Odpowiedzi przez WhatsApp",
  buyerGuidanceTitle: "Wskazówki dla kupujących",
  buyerGuidanceBody: "Zawsze sprawdzaj maszyny osobiście przed zakupem. W przypadku transakcji o dużej wartości zalecamy skorzystanie z naszej usługi escrow.",
  backToListings: "Wróć do ogłoszeń",

  formName: "Imię i nazwisko", formEmail: "Adres e-mail",
  formPhone: "Numer telefonu (opcjonalnie)",
  formDefaultMessage: (title) => `Dzień dobry, jestem zainteresowany/a ${title}. Proszę o informację, czy jest jeszcze dostępny/a.`,
  formSending: "Wysyłanie...", formSubmit: "Wyślij zapytanie",
  formSuccessTitle: "Wiadomość wysłana",
  formSuccessBody: "Sprzedawca skontaktuje się z tobą wkrótce.",
  formSuccessBtn: "Wyślij kolejną wiadomość",
  formError: "Coś poszło nie tak. Spróbuj ponownie.",

  condLabelNew: "Nowy", condLabelUsed: "Używany", condLabelRefurbished: "Odnowiony",

  notFoundCode: "404", notFoundTitle: "Strona nie znaleziona",
  notFoundBody: "Strona, której szukasz, nie istnieje lub została przeniesiona.",
  goHome: "Strona główna", browseListings: "Przeglądaj ogłoszenia",

  footerTagline: "Wiodący rynek europejski dla wszelkiego rodzaju pojazdów. Łączymy kupujących i sprzedawców na całym świecie od 2005 roku.",
  footerRegistered: "Zarejestrowany w Unii Europejskiej",
  footerBrowse: "Przeglądaj", footerSellers: "Sprzedawcy", footerCompany: "Firma", footerSupport: "Wsparcie",
  footerAboutUs: "O nas", footerCareers: "Kariera", footerPress: "Prasa",
  footerHelpCenter: "Centrum pomocy", footerSafetyTips: "Porady bezpieczeństwa",
  footerPrivacy: "Polityka prywatności", footerTerms: "Warunki użytkowania",
  footerPostListing: "Dodaj ogłoszenie", footerDealerAccounts: "Konta dealerów",
  footerPricing: "Cennik", footerSellerResources: "Zasoby dla sprzedawców",
};

export default pl;
