import type { Translations } from "@/lib/i18n";

const pl: Translations = {
  topBar: "Europejski Rynek Pojazdów i Maszyn",
  navHome: "Strona glówna", navTractors: "Traktory", navAutomobiles: "Samochody",
  navAbout: "O nas", navContact: "Kontakt",
  signIn: "Zaloguj sie", postListing: "Dodaj ogloszenie",

  heroLabel: "Wiodacy Rynek Europejski",
  heroLine1: "Znajdz swój nastepny",
  heroLine2: "Pojazd",
  heroSubtitle: "Tysiace nowych i uzywanych traktorów, pojazdów i maszyn rolniczych od zweryfikowanych dealerów z calej Europy.",
  allCategories: "Wszystkie kategorie",
  searchPlaceholder: "Marka, model lub slowo kluczowe",
  searchBtn: "Szukaj",
  popular: "Popularne:",

  browseLabel: "Przegladaj wedlug typu",
  browseTitle: "Kategorie sprzetu",
  catTractors: "Traktory", catCars: "Samochody osobowe", catTrucks: "Ciezarówki",
  catAutomobiles: "Samochody", catOtherMachinery: "Inne maszyny", catSpareParts: "Czesci zamienne",
  listings: "ogloszen",

  statListings: "Aktywne ogloszenia", statDealers: "Zweryfikowani dealerzy",
  statCountries: "Kraje", statSold: "Sprzedanych maszyn",

  featuredLabel: "Starannie wybrane", featuredTitle: "Wyróznione ogloszenia",
  viewAll: "Zobacz wszystko", viewAllListings: "Zobacz wszystkie ogloszenia",

  whyLabel: "Dlaczego my?", whyTitle: "Zaufanie profesjonalistów",
  whyReason1Title: "Zweryfikowani sprzedawcy",
  whyReason1Body: "Kazdy dealer na platformie jest indywidualnie weryfikowany. Handluj ponad granicami z pelnym zaufaniem.",
  whyReason2Title: "Zasieg ogólnoeuropejski",
  whyReason2Body: "28 objetych krajów. Dedykowani partnerzy logistyczni dostepni dla transportu transgranicznego.",
  whyReason3Title: "Raporty z inspekcji",
  whyReason3Body: "Zazadaj certyfikowanych raportów z inspekcji od stron trzecich przed podjeciem jakiegokolwiek zakupu.",

  ctaLabel: "Dla sprzedawców", ctaTitle: "Masz maszyny na sprzedaz?",
  ctaBody: "Dodaj ogloszenie w kilka minut i dotrzyj do tysiecy kwalifikowanych kupujacych w calej Europie.",
  ctaBtn: "Dodaj ogloszenie", ctaBtnSecondary: "Zobacz plany dla dealerów",

  tractorsTitle: "Traktory na sprzedaz",
  tractorsCount: (n) => `${n} ogloszen dostepnych`,
  sortBy: "Sortuj",
  sortNewest: "Najnowsze", sortPriceAsc: "Cena: rosnaco",
  sortPriceDesc: "Cena: malejaco", sortHoursAsc: "Najmniej godzin",
  filters: "Filtry", clearAll: "Wyczysc wszystko",
  conditionLabel: "Stan", makeLabel: "Marka", yearLabel: "Rok",
  priceLabel: "Cena (EUR)", countryLabel: "Kraj",
  anyLabel: "Dowolny", applyFilters: "Zastosuj filtry",
  condAny: "Dowolny", condNew: "Nowy", condUsed: "Uzywany", condRefurbished: "Odnowiony",
  pagination_prev: "Poprzedni", pagination_next: "Nastepny",

  cardHours: "Godziny", cardPower: "Moc", cardLocation: "Lokalizacja",
  cardCountry: "Kraj", cardViewDetails: "Zobacz szczególy",
  hrsUnit: "godz.", hpUnit: "KM",

  breadHome: "Strona glówna", specsMake: "Marka", specsModel: "Model",
  specsYear: "Rok", specsCondition: "Stan", specsHorsepower: "Moc",
  specsHours: "Godziny", specsTransmission: "Skrzynia biegów", specsDrive: "Naped",
  specsLocation: "Lokalizacja", specificationsTitle: "Specyfikacje",
  contactSeller: "Skontaktuj sie ze sprzedawca", repliesVia: "Odpowiedzi przez WhatsApp",
  buyerGuidanceTitle: "Wskazówki dla kupujacych",
  buyerGuidanceBody: "Zawsze sprawdzaj maszyny osobiscie przed zakupem. W przypadku transakcji o duzej wartosci zalecamy skorzystanie z naszej uslugi escrow.",
  backToListings: "Wróc do ogloszen",

  formName: "Imie i nazwisko", formEmail: "Adres e-mail",
  formPhone: "Numer telefonu (opcjonalnie)",
  formDefaultMessage: (title) => `Dzien dobry, jestem zainteresowany/a ${title}. Prosze o informacje, czy jest jeszcze dostepny/a.`,
  formSending: "Wysylanie...", formSubmit: "Wyslij zapytanie",
  formSuccessTitle: "Wiadomosc wyslana",
  formSuccessBody: "Sprzedawca skontaktuje sie z toba wkrótce.",
  formSuccessBtn: "Wyslij kolejna wiadomosc",
  formError: "Cos poszlo nie tak. Spróbuj ponownie.",

  condLabelNew: "Nowy", condLabelUsed: "Uzywany", condLabelRefurbished: "Odnowiony",

  notFoundCode: "404", notFoundTitle: "Strona nie znaleziona",
  notFoundBody: "Strona, której szukasz, nie istnieje lub zostala przeniesiona.",
  goHome: "Strona glówna", browseListings: "Przegladaj ogloszenia",

  footerTagline: "Wiodacy rynek europejski dla wszelkiego rodzaju pojazdów. Laczymy kupujacych i sprzedawców na calym swiecie od 2005 roku.",
  footerRegistered: "Zarejestrowany w Unii Europejskiej",
  footerBrowse: "Przegladaj", footerSellers: "Sprzedawcy", footerCompany: "Firma", footerSupport: "Wsparcie",
  footerAboutUs: "O nas", footerCareers: "Kariera", footerPress: "Prasa",
  footerHelpCenter: "Centrum pomocy", footerSafetyTips: "Porady bezpieczenstwa",
  footerPrivacy: "Polityka prywatnosci", footerTerms: "Warunki uzytkowania",
  footerPostListing: "Dodaj ogloszenie", footerDealerAccounts: "Konta dealerów",
  footerPricing: "Cennik", footerSellerResources: "Zasoby dla sprzedawców",

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

    const intro = `Ciagnik {b} {m} to profesjonalna maszyna rolnicza przeznaczona do nowoczesnych prac polowych.`.replace("{b}", b).replace("{m}", m);
    const engine = engine_model ? `Napedzany wysoce wydajnym silnikiem {e},`.replace("{e}", engine_model) : `Wyposazony w niezawodna jednostke napedowa,`;
    const hp = hp_val ? `zapewniajaca solidna moc {hp} KM,`.replace("{hp}", hp_val) : `zaprojektowany z mysla o niezawodnej wydajnosci,`;
    const mid = `zapewnia wyjatkowa równowage miedzy momentem obrotowym a oszczednoscia paliwa.`;
    
    let drivetrain = "";
    if (drive && trans) drivetrain = `Uklad napedowy {d} w polaczeniu z wszechstronna przekladnia {t} zapewnia optymalna trakcje i plynne przenoszenie mocy na trudnym terenie.`.replace("{d}", drive).replace("{t}", trans);
    else if (drive) drivetrain = `Konfiguracja {d} zapewnia doskonala trakcje i stabilnosc w wymagajacych srodowiskach rolniczych.`.replace("{d}", drive);
    else if (trans) drivetrain = `Wszechstronna przekladnia {t} pozwala operatorom bez wysilku dostosowac sie do róznych warunków polowych i wymagan narzedzi.`.replace("{t}", trans);

    let capability = "";
    if (weight && pto) capability = `Wazac {w} kg, oferuje stabilna platforme do ciezkich narzedzi, podczas gdy wal odbioru mocy {p} obr./min zapewnia niezawodne przenoszenie mocy dla szerokiej gamy akcesoriów.`.replace("{w}", weight).replace("{p}", pto);
    else if (weight) capability = `Wazac {w} kg, oferuje wysoce stabilna i imponujaca platforme do ciezkich narzedzi rolniczych.`.replace("{w}", weight);
    else if (pto) capability = `Zaawansowany system WOM {p} obr./min zapewnia niezawodne, ciagle przenoszenie mocy dla wymagajacych narzedzi rolniczych.`.replace("{p}", pto);

    const outro = `Zbudowany z mysla o wytrzymalosci i doskonalosci operacyjnej, {m} jest niezastapionym atutem w maksymalizacji produktywnosci na polu.`.replace("{m}", m);

    return `${intro} ${engine} ${hp} ${mid} ${drivetrain} ${capability} ${outro}`.replace(/\s+/g, ' ').trim();
  },

};

export default pl;
