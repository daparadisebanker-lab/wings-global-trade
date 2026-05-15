import type { Translations } from "@/lib/i18n";

const pt: Translations = {
  topBar: "O Marketplace Europeu de Veículos e Máquinas",
  navHome: "Início", navTractors: "Tratores", navAutomobiles: "Automóveis",
  navAbout: "Sobre nós", navContact: "Contacto",
  signIn: "Entrar", postListing: "Publicar anúncio",

  heroLabel: "O Marketplace Líder da Europa",
  heroLine1: "Encontre o seu próximo",
  heroLine2: "Veículo",
  heroSubtitle: "Milhares de tratores, veículos e equipamentos agrícolas novos e usados de concessionários verificados em toda a Europa.",
  allCategories: "Todas as categorias",
  searchPlaceholder: "Marca, modelo ou palavra-chave",
  searchBtn: "Pesquisar",
  popular: "Popular:",

  browseLabel: "Pesquisar por tipo",
  browseTitle: "Categorias de equipamentos",
  catTractors: "Tratores", catCars: "Carros", catTrucks: "Camiões",
  catAutomobiles: "Automóveis", catOtherMachinery: "Outras máquinas", catSpareParts: "Peças sobressalentes",
  listings: "anúncios",

  statListings: "Anúncios ativos", statDealers: "Concessionários verificados",
  statCountries: "Países", statSold: "Máquinas vendidas",

  featuredLabel: "Seleção especial", featuredTitle: "Anúncios em destaque",
  viewAll: "Ver tudo", viewAllListings: "Ver todos os anúncios",

  whyLabel: "Porquê escolher-nos", whyTitle: "A confiança dos profissionais",
  whyReason1Title: "Vendedores verificados",
  whyReason1Body: "Cada concessionário na plataforma é verificado individualmente. Comercialize além-fronteiras com total confiança.",
  whyReason2Title: "Alcance pan-europeu",
  whyReason2Body: "28 países cobertos. Parceiros logísticos dedicados disponíveis para transporte transfronteiriço.",
  whyReason3Title: "Relatórios de inspeção",
  whyReason3Body: "Solicite relatórios de inspeção certificados por terceiros antes de se comprometer com qualquer compra.",

  ctaLabel: "Para vendedores", ctaTitle: "Tem máquinas para vender?",
  ctaBody: "Publique o seu anúncio em minutos e alcance milhares de compradores qualificados em toda a Europa.",
  ctaBtn: "Publicar anúncio", ctaBtnSecondary: "Ver planos para concessionários",

  tractorsTitle: "Tratores à venda",
  tractorsCount: (n) => `${n} anúncios disponíveis`,
  sortBy: "Ordenar",
  sortNewest: "Mais recentes", sortPriceAsc: "Preço: crescente",
  sortPriceDesc: "Preço: decrescente", sortHoursAsc: "Menos horas",
  filters: "Filtros", clearAll: "Limpar tudo",
  conditionLabel: "Estado", makeLabel: "Marca", yearLabel: "Ano",
  priceLabel: "Preço (EUR)", countryLabel: "País",
  anyLabel: "Qualquer", applyFilters: "Aplicar filtros",
  condAny: "Qualquer", condNew: "Novo", condUsed: "Usado", condRefurbished: "Recondicionado",
  pagination_prev: "Anterior", pagination_next: "Seguinte",

  cardHours: "Horas", cardPower: "Potência", cardLocation: "Localização",
  cardCountry: "País", cardViewDetails: "Ver detalhes",
  hrsUnit: "h", hpUnit: "cv",

  breadHome: "Início", specsMake: "Marca", specsModel: "Modelo",
  specsYear: "Ano", specsCondition: "Estado", specsHorsepower: "Potência",
  specsHours: "Horas", specsTransmission: "Transmissão", specsDrive: "Tração",
  specsLocation: "Localização", specificationsTitle: "Especificações",
  contactSeller: "Contactar vendedor", repliesVia: "Respostas via WhatsApp",
  buyerGuidanceTitle: "Orientações para compradores",
  buyerGuidanceBody: "Inspecione sempre as máquinas pessoalmente antes de comprar. Para transações de alto valor, recomendamos o nosso serviço de custódia.",
  backToListings: "Voltar aos anúncios",

  formName: "Nome completo", formEmail: "Endereço de e-mail",
  formPhone: "Número de telefone (opcional)",
  formDefaultMessage: (title) => `Olá, estou interessado(a) em ${title}. Por favor, informe-me se ainda está disponível.`,
  formSending: "A enviar...", formSubmit: "Enviar consulta",
  formSuccessTitle: "Mensagem enviada",
  formSuccessBody: "O vendedor entrará em contacto consigo em breve.",
  formSuccessBtn: "Enviar outra mensagem",
  formError: "Algo correu mal. Por favor, tente novamente.",

  condLabelNew: "Novo", condLabelUsed: "Usado", condLabelRefurbished: "Recondicionado",

  notFoundCode: "404", notFoundTitle: "Página não encontrada",
  notFoundBody: "A página que procura não existe ou foi movida.",
  goHome: "Ir para o início", browseListings: "Ver anúncios",

  footerTagline: "O marketplace líder da Europa para todo o tipo de veículos. A ligar compradores e vendedores em todo o mundo desde 2005.",
  footerRegistered: "Registado na União Europeia",
  footerBrowse: "Explorar", footerSellers: "Vendedores", footerCompany: "Empresa", footerSupport: "Suporte",
  footerAboutUs: "Sobre nós", footerCareers: "Carreiras", footerPress: "Imprensa",
  footerHelpCenter: "Centro de ajuda", footerSafetyTips: "Dicas de segurança",
  footerPrivacy: "Política de privacidade", footerTerms: "Termos de utilização",
  footerPostListing: "Publicar anúncio", footerDealerAccounts: "Contas de concessionários",
  footerPricing: "Preços", footerSellerResources: "Recursos para vendedores",

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

    const intro = `O {b} {m} é um trator agrícola de nível profissional projetado para as modernas operações agrícolas.`.replace("{b}", b).replace("{m}", m);
    const engine = engine_model ? `Impulsionado por um motor {e} altamente eficiente,`.replace("{e}", engine_model) : `Equipado com um propulsor confiável,`;
    const hp = hp_val ? `oferecendo robustos {hp} cavalos de potência,`.replace("{hp}", hp_val) : `projetado para um desempenho confiável,`;
    const mid = `ele proporciona um equilíbrio excepcional entre torque e eficiência de combustível.`;
    
    let drivetrain = "";
    if (drive && trans) drivetrain = `O sistema de transmissão {d}, combinado com uma transmissão {t} versátil, garante tração ideal e fornecimento contínuo de energia em terrenos difíceis.`.replace("{d}", drive).replace("{t}", trans);
    else if (drive) drivetrain = `A configuração {d} fornece tração e estabilidade superiores em ambientes agrícolas exigentes.`.replace("{d}", drive);
    else if (trans) drivetrain = `Sua transmissão {t} versátil permite que os operadores se adaptem sem esforço a várias condições de campo e requisitos de implementos.`.replace("{t}", trans);

    let capability = "";
    if (weight && pto) capability = `Pesando {w} kg, oferece uma plataforma estável para implementos pesados, enquanto a TDF de {p} RPM fornece transferência de energia confiável para uma ampla gama de acessórios.`.replace("{w}", weight).replace("{p}", pto);
    else if (weight) capability = `Pesando {w} kg, oferece uma plataforma altamente estável e imponente para implementos agrícolas pesados.`.replace("{w}", weight);
    else if (pto) capability = `O avançado sistema TDF de {p} RPM fornece transferência de energia confiável e contínua para implementos agrícolas exigentes.`.replace("{p}", pto);

    const outro = `Construído para resistência e excelência operacional, o {m} é um ativo indispensável para maximizar a produtividade no campo.`.replace("{m}", m);

    return `${intro} ${engine} ${hp} ${mid} ${drivetrain} ${capability} ${outro}`.replace(/\s+/g, ' ').trim();
  },

};

export default pt;
