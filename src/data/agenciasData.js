/**
 * Base de datos oficial de provincias y agencias de AutoCrédito Argentina.
 * Fuente: autocredito.com/agencias-oficiales (verificado agosto 2026)
 * 37 agencias oficiales en 16 provincias.
 */
export const AGENCIAS_AUTOCREDITO = [
  {
    provincia: 'Buenos Aires',
    agencias: [
      'Mar del Plata / Szmyr',
      'Mar del Plata / Papasidero',
      'Bahía Blanca Centro',
      'Berazategui',
      'Florencio Varela',
      'Haedo',
      'Lanús Oeste',
      'Moreno',
      'Pilar',
      'Quilmes',
      'San Nicolás de los Arroyos',
      'Tandil',
    ]
  },
  {
    provincia: 'Capital Federal',
    agencias: [
      'Belgrano',
    ]
  },
  {
    provincia: 'Catamarca',
    agencias: [
      'Catamarca',
    ]
  },
  {
    provincia: 'Chubut',
    agencias: [
      'Comodoro Rivadavia',
      'Trelew',
    ]
  },
  {
    provincia: 'Córdoba',
    agencias: [
      'Córdoba Capital (Fuerza Aérea)',
      'Córdoba Imperio (Belgrano)',
      'Cruz del Eje',
    ]
  },
  {
    provincia: 'Corrientes',
    agencias: [
      'Goya',
    ]
  },
  {
    provincia: 'Entre Ríos',
    agencias: [
      'Concordia',
    ]
  },
  {
    provincia: 'Jujuy',
    agencias: [
      'San Salvador de Jujuy',
    ]
  },
  {
    provincia: 'Mendoza',
    agencias: [
      'Mendoza Capital',
      'San Martín',
    ]
  },
  {
    provincia: 'Misiones',
    agencias: [
      'Posadas',
    ]
  },
  {
    provincia: 'Neuquén',
    agencias: [
      'Neuquén',
    ]
  },
  {
    provincia: 'Río Negro',
    agencias: [
      'El Bolsón',
    ]
  },
  {
    provincia: 'Salta',
    agencias: [
      'Salta',
    ]
  },
  {
    provincia: 'San Juan',
    agencias: [
      'San Juan',
    ]
  },
  {
    provincia: 'Santa Cruz',
    agencias: [
      'Caleta Olivia',
      'Río Gallegos',
    ]
  },
  {
    provincia: 'Santa Fe',
    agencias: [
      'Rosario',
      'Villa Constitución',
      'Villa Gobernador Gálvez',
    ]
  },
  {
    provincia: 'Tierra del Fuego',
    agencias: [
      'Río Grande',
      'Ushuaia',
    ]
  },
  {
    provincia: 'Tucumán',
    agencias: [
      'San Miguel de Tucumán',
    ]
  },
];

/**
 * Devuelve las agencias de una provincia dada
 */
export function getAgenciasByProvincia(provincia) {
  const found = AGENCIAS_AUTOCREDITO.find(p => p.provincia === provincia);
  return found ? found.agencias : [];
}

/**
 * Lista de provincias ordenadas alfabéticamente
 */
export const PROVINCIAS_LIST = AGENCIAS_AUTOCREDITO.map(p => p.provincia).sort();
