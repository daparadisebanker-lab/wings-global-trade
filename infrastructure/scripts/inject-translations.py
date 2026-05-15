import os

languages = {
    "en": {
        "intro": "The {b} {m} is a professional-grade agricultural tractor designed for modern farming operations.",
        "eng1": "Powered by a highly-efficient {e} engine,",
        "eng2": "Equipped with a dependable power plant,",
        "hp1": "delivering a robust {hp} horsepower,",
        "hp2": "engineered for reliable performance,",
        "mid": "it provides an exceptional balance of torque and fuel efficiency.",
        "dt1": "The {d} drivetrain, paired with a versatile {t} transmission, ensures optimal traction and seamless power delivery across challenging terrains.",
        "dt2": "The {d} configuration provides superior traction and stability in demanding agricultural environments.",
        "dt3": "Its versatile {t} transmission allows operators to adapt effortlessly to various field conditions and implement requirements.",
        "cap1": "Weighing in at {w} kg, it offers a stable platform for heavy-duty implements, while the {p} RPM PTO provides dependable power transfer for a wide range of attachments.",
        "cap2": "Weighing in at {w} kg, it offers a highly stable and commanding platform for heavy-duty agricultural implements.",
        "cap3": "The advanced {p} RPM PTO system provides dependable, continuous power transfer for demanding agricultural attachments.",
        "outro": "Built for endurance and operational excellence, the {m} stands as an indispensable asset for maximizing productivity in the field."
    },
    "es": {
        "intro": "El {b} {m} es un tractor agrícola de calidad profesional diseñado para las operaciones agrícolas modernas.",
        "eng1": "Impulsado por un motor {e} de alta eficiencia,",
        "eng2": "Equipado con un motor confiable,",
        "hp1": "que ofrece una robusta potencia de {hp} caballos de fuerza,",
        "hp2": "diseñado para un rendimiento confiable,",
        "mid": "proporciona un equilibrio excepcional entre torque y eficiencia de combustible.",
        "dt1": "La transmisión {d}, combinada con una versátil caja de cambios {t}, garantiza una tracción óptima y una entrega de potencia perfecta en terrenos difíciles.",
        "dt2": "La configuración {d} proporciona una tracción y estabilidad superiores en entornos agrícolas exigentes.",
        "dt3": "Su versátil caja de cambios {t} permite a los operadores adaptarse sin esfuerzo a diversas condiciones del campo y requerimientos de implementos.",
        "cap1": "Con un peso de {w} kg, ofrece una plataforma estable para implementos pesados, mientras que la TDF de {p} RPM proporciona una transferencia de potencia confiable para una amplia gama de accesorios.",
        "cap2": "Con un peso de {w} kg, ofrece una plataforma altamente estable e imponente para implementos agrícolas de trabajo pesado.",
        "cap3": "El avanzado sistema de TDF de {p} RPM proporciona una transferencia de potencia confiable y continua para implementos agrícolas exigentes.",
        "outro": "Construido para la resistencia y la excelencia operativa, el {m} se erige como un activo indispensable para maximizar la productividad en el campo."
    },
    "de": {
        "intro": "Der {b} {m} ist ein professioneller landwirtschaftlicher Traktor, der für moderne landwirtschaftliche Betriebe entwickelt wurde.",
        "eng1": "Angetrieben von einem hocheffizienten {e}-Motor,",
        "eng2": "Ausgestattet mit einem zuverlässigen Antriebsaggregat,",
        "hp1": "das eine robuste Leistung von {hp} PS liefert,",
        "hp2": "auf zuverlässige Leistung ausgelegt,",
        "mid": "bietet er eine außergewöhnliche Balance zwischen Drehmoment und Kraftstoffeffizienz.",
        "dt1": "Der {d}-Antriebsstrang, gepaart mit einem vielseitigen {t}-Getriebe, sorgt für optimale Traktion und nahtlose Kraftübertragung in schwierigem Gelände.",
        "dt2": "Die {d}-Konfiguration bietet überlegene Traktion und Stabilität in anspruchsvollen landwirtschaftlichen Umgebungen.",
        "dt3": "Das vielseitige {t}-Getriebe ermöglicht es den Bedienern, sich mühelos an verschiedene Feldbedingungen und Anforderungen an Anbaugeräte anzupassen.",
        "cap1": "Mit einem Gewicht von {w} kg bietet er eine stabile Plattform für schwere Anbaugeräte, während die Zapfwelle mit {p} U/min eine zuverlässige Kraftübertragung für eine Vielzahl von Anbaugeräten bietet.",
        "cap2": "Mit einem Gewicht von {w} kg bietet er eine äußerst stabile und souveräne Plattform für schwere landwirtschaftliche Anbaugeräte.",
        "cap3": "Das fortschrittliche Zapfwellensystem mit {p} U/min bietet eine zuverlässige, kontinuierliche Kraftübertragung für anspruchsvolle landwirtschaftliche Anbaugeräte.",
        "outro": "Gebaut für Ausdauer und operative Exzellenz, ist der {m} ein unverzichtbares Gut zur Maximierung der Produktivität auf dem Feld."
    },
    "fr": {
        "intro": "Le {b} {m} est un tracteur agricole de qualité professionnelle conçu pour les opérations agricoles modernes.",
        "eng1": "Propulsé par un moteur {e} très efficace,",
        "eng2": "Équipé d'un groupe motopropulseur fiable,",
        "hp1": "délivrant une puissance robuste de {hp} chevaux,",
        "hp2": "conçu pour des performances fiables,",
        "mid": "il offre un équilibre exceptionnel entre couple et rendement énergétique.",
        "dt1": "La transmission {d}, associée à une boîte de vitesses {t} polyvalente, assure une traction optimale et une transmission de puissance fluide sur des terrains difficiles.",
        "dt2": "La configuration {d} offre une traction et une stabilité supérieures dans les environnements agricoles exigeants.",
        "dt3": "Sa boîte de vitesses {t} polyvalente permet aux opérateurs de s'adapter sans effort à diverses conditions de terrain et aux exigences des outils.",
        "cap1": "Pesant {w} kg, il offre une plateforme stable pour les outils lourds, tandis que la prise de force de {p} tr/min assure un transfert de puissance fiable pour une large gamme d'accessoires.",
        "cap2": "Pesant {w} kg, il offre une plateforme très stable et imposante pour les outils agricoles lourds.",
        "cap3": "Le système de prise de force avancé de {p} tr/min fournit un transfert de puissance fiable et continu pour les accessoires agricoles exigeants.",
        "outro": "Conçu pour l'endurance et l'excellence opérationnelle, le {m} s'impose comme un atout indispensable pour maximizar la productivité aux champs."
    },
    "it": {
        "intro": "Il {b} {m} è un trattore agricolo di livello professionale progettato per le moderne operazioni agricole.",
        "eng1": "Alimentato da un motore {e} ad alta efficienza,",
        "eng2": "Dotato di un affidabile propulsore,",
        "hp1": "che eroga una robusta potenza di {hp} cavalli,",
        "hp2": "progettato per prestazioni affidabili,",
        "mid": "fornisce un eccezionale equilibrio tra coppia ed efficienza del carburante.",
        "dt1": "La trasmissione {d}, abbinata a un versatile cambio {t}, garantisce una trazione ottimale e un'erogazione di potenza fluida su terreni difficili.",
        "dt2": "La configurazione {d} offre trazione e stabilità superiori in ambienti agricoli difficili.",
        "dt3": "Il suo versatile cambio {t} consente agli operatori di adattarsi senza sforzo a varie condizioni del campo e requisiti degli attrezzi.",
        "cap1": "Con un peso di {w} kg, offre una piattaforma stabile per attrezzi pesanti, mentre la presa di forza da {p} giri/min fornisce un trasferimento di potenza affidabile per un'ampia gamma di accessori.",
        "cap2": "Con un peso di {w} kg, offre una piattaforma altamente stabile e imponente per attrezzi agricoli pesanti.",
        "cap3": "L'avanzato sistema di presa di forza da {p} giri/min fornisce un trasferimento di potenza affidabile e continuo per attrezzi agricoli impegnativi.",
        "outro": "Costruito per la resistenza e l'eccellenza operativa, il {m} rappresenta una risorsa indispensabile per massimizzare la produttività sul campo."
    },
    "nl": {
        "intro": "De {b} {m} is een professionele landbouwtractor ontworpen voor moderne landbouwactiviteiten.",
        "eng1": "Aangedreven door een uiterst efficiënte {e}-motor,",
        "eng2": "Uitgerust met een betrouwbare krachtbron,",
        "hp1": "die een robuuste {hp} pk levert,",
        "hp2": "ontworpen voor betrouwbare prestaties,",
        "mid": "biedt hij een uitzonderlijke balans tussen koppel en brandstofefficiëntie.",
        "dt1": "De {d}-aandrijflijn, gecombineerd met een veelzijdige {t}-transmissie, zorgt voor optimale tractie en naadloze vermogensafgifte op uitdagend terrein.",
        "dt2": "De {d}-configuratie biedt superieure tractie en stabiliteit in veeleisende landbouwomgevingen.",
        "dt3": "De veelzijdige {t}-transmissie stelt bestuurders in staat zich moeiteloos aan te passen aan verschillende veldomstandigheden en werktuigvereisten.",
        "cap1": "Met een gewicht van {w} kg biedt hij een stabiel platform voor zware werktuigen, terwijl de {p} tpm aftakas zorgt voor een betrouwbare krachtoverbrenging voor een breed scala aan aanbouwdelen.",
        "cap2": "Met een gewicht van {w} kg biedt hij een uiterst stabiel en indrukwekkend platform voor zware landbouwwerktuigen.",
        "cap3": "Het geavanceerde {p} tpm aftakassysteem biedt een betrouwbare, continue krachtoverbrenging voor veeleisende landbouwaanbouwdelen.",
        "outro": "Gebouwd voor uithoudingsvermogen en operationele uitmuntendheid, staat de {m} als een onmisbare aanwinst voor het maximaliseren van de productiviteit op het veld."
    },
    "pl": {
        "intro": "Ciągnik {b} {m} to profesjonalna maszyna rolnicza przeznaczona do nowoczesnych prac polowych.",
        "eng1": "Napędzany wysoce wydajnym silnikiem {e},",
        "eng2": "Wyposażony w niezawodną jednostkę napędową,",
        "hp1": "zapewniającą solidną moc {hp} KM,",
        "hp2": "zaprojektowany z myślą o niezawodnej wydajności,",
        "mid": "zapewnia wyjątkową równowagę między momentem obrotowym a oszczędnością paliwa.",
        "dt1": "Układ napędowy {d} w połączeniu z wszechstronną przekładnią {t} zapewnia optymalną trakcję i płynne przenoszenie mocy na trudnym terenie.",
        "dt2": "Konfiguracja {d} zapewnia doskonałą trakcję i stabilność w wymagających środowiskach rolniczych.",
        "dt3": "Wszechstronna przekładnia {t} pozwala operatorom bez wysiłku dostosować się do różnych warunków polowych i wymagań narzędzi.",
        "cap1": "Ważąc {w} kg, oferuje stabilną platformę do ciężkich narzędzi, podczas gdy wał odbioru mocy {p} obr./min zapewnia niezawodne przenoszenie mocy dla szerokiej gamy akcesoriów.",
        "cap2": "Ważąc {w} kg, oferuje wysoce stabilną i imponującą platformę do ciężkich narzędzi rolniczych.",
        "cap3": "Zaawansowany system WOM {p} obr./min zapewnia niezawodne, ciągłe przenoszenie mocy dla wymagających narzędzi rolniczych.",
        "outro": "Zbudowany z myślą o wytrzymałości i doskonałości operacyjnej, {m} jest niezastąpionym atutem w maksymalizacji produktywności na polu."
    },
    "pt": {
        "intro": "O {b} {m} é um trator agrícola de nível profissional projetado para as modernas operações agrícolas.",
        "eng1": "Impulsionado por um motor {e} altamente eficiente,",
        "eng2": "Equipado com um propulsor confiável,",
        "hp1": "oferecendo robustos {hp} cavalos de potência,",
        "hp2": "projetado para um desempenho confiável,",
        "mid": "ele proporciona um equilíbrio excepcional entre torque e eficiência de combustível.",
        "dt1": "O sistema de transmissão {d}, combinado com uma transmissão {t} versátil, garante tração ideal e fornecimento contínuo de energia em terrenos difíceis.",
        "dt2": "A configuração {d} fornece tração e estabilidade superiores em ambientes agrícolas exigentes.",
        "dt3": "Sua transmissão {t} versátil permite que os operadores se adaptem sem esforço a várias condições de campo e requisitos de implementos.",
        "cap1": "Pesando {w} kg, oferece uma plataforma estável para implementos pesados, enquanto a TDF de {p} RPM fornece transferência de energia confiável para uma ampla gama de acessórios.",
        "cap2": "Pesando {w} kg, oferece uma plataforma altamente estável e imponente para implementos agrícolas pesados.",
        "cap3": "O avançado sistema TDF de {p} RPM fornece transferência de energia confiável e contínua para implementos agrícolas exigentes.",
        "outro": "Construído para resistência e excelência operacional, o {m} é um ativo indispensável para maximizar a produtividade no campo."
    }
}

base_func_template = """
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

    const intro = `INTRO`.replace("{b}", b).replace("{m}", m);
    const engine = engine_model ? `ENG1`.replace("{e}", engine_model) : `ENG2`;
    const hp = hp_val ? `HP1`.replace("{hp}", hp_val) : `HP2`;
    const mid = `MID`;
    
    let drivetrain = "";
    if (drive && trans) drivetrain = `DT1`.replace("{d}", drive).replace("{t}", trans);
    else if (drive) drivetrain = `DT2`.replace("{d}", drive);
    else if (trans) drivetrain = `DT3`.replace("{t}", trans);

    let capability = "";
    if (weight && pto) capability = `CAP1`.replace("{w}", weight).replace("{p}", pto);
    else if (weight) capability = `CAP2`.replace("{w}", weight);
    else if (pto) capability = `CAP3`.replace("{p}", pto);

    const outro = `OUTRO`.replace("{m}", m);

    return `${intro} ${engine} ${hp} ${mid} ${drivetrain} ${capability} ${outro}`.replace(/\\s+/g, ' ').trim();
  },
"""

def process():
    for lang, t in languages.items():
        filepath = f"src/translations/{lang}.ts"
        if not os.path.exists(filepath): continue
        
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()
            
        # Check if already injected
        if "generateDescription:" in content:
            print(f"Skipping {lang}, already has generateDescription")
            continue
            
        func = base_func_template.replace("INTRO", t["intro"]) \
            .replace("ENG1", t["eng1"]).replace("ENG2", t["eng2"]) \
            .replace("HP1", t["hp1"]).replace("HP2", t["hp2"]) \
            .replace("MID", t["mid"]) \
            .replace("DT1", t["dt1"]).replace("DT2", t["dt2"]).replace("DT3", t["dt3"]) \
            .replace("CAP1", t["cap1"]).replace("CAP2", t["cap2"]).replace("CAP3", t["cap3"]) \
            .replace("OUTRO", t["outro"])
            
        # Manually find the last `};` and replace it
        # rsplit takes the last occurrence
        parts = content.rsplit('};', 1)
        if len(parts) == 2:
            new_content = parts[0] + func + '\n};' + parts[1]
            with open(filepath, "w", encoding="utf-8") as f:
                f.write(new_content)
            print(f"Injected into {lang}.ts")

if __name__ == "__main__":
    process()
