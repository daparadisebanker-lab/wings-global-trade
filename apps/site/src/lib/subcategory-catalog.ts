// src/lib/subcategory-catalog.ts
// Static definition of all known subcategories per category.
// Entries NOT present in the live DB subcategories table are surfaced in
// SubcategoryGateway as "consulta directa" options routed to Mister.

export interface SubcategoryEntry {
  slug: string
  name_es: string
  iconKey: string
  misterContext: string
}

export const SUBCATEGORY_CATALOG: Record<string, SubcategoryEntry[]> = {
  'maquinaria-agricola': [
    {
      slug: 'tractores',
      name_es: 'Tractores',
      iconKey: 'tractor',
      misterContext:
        'Necesito cotización para importar un tractor agrícola desde China. ¿Qué modelos tienen disponibles y cuál es el precio CIF aproximado?',
    },
    {
      slug: 'cosechadoras',
      name_es: 'Cosechadoras',
      iconKey: 'harvester',
      misterContext:
        'Quiero importar una cosechadora de arroz o trigo desde China. ¿Qué modelos trabajan y cuál es el precio CIF?',
    },
    {
      slug: 'sembradoras',
      name_es: 'Sembradoras',
      iconKey: 'tractor',
      misterContext:
        'Necesito importar sembradoras desde China. ¿Qué modelos tienen disponibles y cuál es el precio CIF?',
    },
    {
      slug: 'pulverizadoras',
      name_es: 'Pulverizadoras',
      iconKey: 'sprayer',
      misterContext:
        'Me interesa importar una pulverizadora agrícola de campo abierto desde China. ¿Tienen opciones y cuál es el precio CIF?',
    },
    {
      slug: 'empacadoras',
      name_es: 'Empacadoras',
      iconKey: 'tractor',
      misterContext:
        'Necesito importar empacadoras de pasto o forraje desde China. ¿Qué modelos trabajan y cuál es el precio CIF?',
    },
    {
      slug: 'motocultores',
      name_es: 'Motocultores',
      iconKey: 'tractor',
      misterContext:
        'Quiero importar motocultores desde China. ¿Qué potencias y modelos tienen disponibles? Precio CIF.',
    },
  ],

  camiones: [
    {
      slug: 'volteo',
      name_es: 'Camión Volteo',
      iconKey: 'dump-truck',
      misterContext:
        'Me interesa importar camiones volteo 6×4 de fabricación china. ¿Qué marcas trabajan y cuál es el precio CIF?',
    },
    {
      slug: 'carga',
      name_es: 'Camión de Carga',
      iconKey: 'truck',
      misterContext:
        'Necesito importar camiones de carga desde China. ¿Qué capacidades y modelos tienen? Precio CIF.',
    },
    {
      slug: 'cisterna',
      name_es: 'Cisterna',
      iconKey: 'truck',
      misterContext:
        'Quiero importar un camión cisterna desde China. ¿Qué capacidades trabajan y cuál es el precio CIF?',
    },
    {
      slug: 'tractocamion',
      name_es: 'Tractocamión',
      iconKey: 'semi',
      misterContext:
        'Me interesa importar tractocamiones de fabricación china. ¿Qué marcas y modelos trabajan? Precio CIF.',
    },
    {
      slug: 'especial',
      name_es: 'Camión Especial',
      iconKey: 'truck',
      misterContext:
        'Necesito un camión especial — grúa, mixer, plataforma u otro tipo. ¿Pueden importarlo desde China? Precio CIF.',
    },
  ],

  buses: [
    {
      slug: 'urbano',
      name_es: 'Bus Urbano',
      iconKey: 'bus',
      misterContext:
        'Quiero importar buses urbanos desde China. ¿Qué capacidades y especificaciones trabajan? Precio CIF.',
    },
    {
      slug: 'minibus',
      name_es: 'Minibús',
      iconKey: 'bus',
      misterContext:
        'Me interesa importar minibuses desde China. ¿Qué modelos tienen y cuál es el precio CIF?',
    },
    {
      slug: 'interurbano',
      name_es: 'Interurbano',
      iconKey: 'bus',
      misterContext:
        'Necesito importar buses interurbanos de larga distancia desde China. ¿Qué opciones tienen? Precio CIF.',
    },
    {
      slug: 'escolar',
      name_es: 'Bus Escolar',
      iconKey: 'bus',
      misterContext:
        'Quiero importar buses escolares desde China. ¿Tienen modelos disponibles y cuál es el precio CIF?',
    },
    {
      slug: 'furgon',
      name_es: 'Furgón',
      iconKey: 'bus',
      misterContext:
        'Me interesa importar furgones de carga o de pasajeros desde China. ¿Qué opciones tienen y precio CIF?',
    },
  ],

  'equipo-industrial': [
    {
      slug: 'montacargas',
      name_es: 'Montacargas',
      iconKey: 'forklift',
      misterContext:
        'Necesito importar montacargas desde China. ¿Qué capacidades y tipos trabajan? Precio CIF.',
    },
    {
      slug: 'generadores',
      name_es: 'Generadores',
      iconKey: 'generator',
      misterContext:
        'Me interesa importar generadores eléctricos industriales desde China. ¿Qué potencias trabajan y precio CIF?',
    },
    {
      slug: 'compresores',
      name_es: 'Compresores',
      iconKey: 'gear',
      misterContext:
        'Quiero importar compresores industriales desde China. ¿Qué tipos y capacidades tienen? Precio CIF.',
    },
    {
      slug: 'compactadores',
      name_es: 'Compactadoras',
      iconKey: 'gear',
      misterContext:
        'Necesito importar compactadoras de suelo o asfalto desde China. ¿Qué modelos trabajan y cuál es el precio CIF?',
    },
    {
      slug: 'gruas',
      name_es: 'Grúas',
      iconKey: 'crane',
      misterContext:
        'Me interesa importar una grúa móvil o pluma desde China. ¿Tienen opciones disponibles y precio CIF?',
    },
  ],

  repuestos: [
    {
      slug: 'repuestos-tractor',
      name_es: 'Para Tractor',
      iconKey: 'parts',
      misterContext:
        'Necesito importar repuestos para tractor agrícola desde China. ¿Qué piezas trabajan y cuál es el costo?',
    },
    {
      slug: 'repuestos-camion',
      name_es: 'Para Camión',
      iconKey: 'parts',
      misterContext:
        'Quiero importar repuestos para camión desde China. ¿Qué piezas tienen disponibles y costo?',
    },
    {
      slug: 'filtros',
      name_es: 'Filtros',
      iconKey: 'parts',
      misterContext:
        'Me interesa importar filtros para maquinaria agrícola o industrial desde China. ¿Qué tipos trabajan y precio?',
    },
    {
      slug: 'motores',
      name_es: 'Motores',
      iconKey: 'gear',
      misterContext:
        'Necesito importar motores de reemplazo para maquinaria pesada o vehículos. ¿Qué opciones tienen desde China?',
    },
    {
      slug: 'transmision',
      name_es: 'Transmisión',
      iconKey: 'gear',
      misterContext:
        'Quiero importar repuestos de transmisión para maquinaria pesada desde China. ¿Qué piezas trabajan y precio?',
    },
  ],
}
