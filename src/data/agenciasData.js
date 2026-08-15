/**
 * Base de datos de provincias y sucursales de AutoCrédito Argentina.
 * Fuente: autocredito.com.ar (más de 50 agencias a nivel nacional).
 * Actualizar según expansión de la red comercial.
 */
export const AGENCIAS_AUTOCREDITO = [
  {
    provincia: 'Buenos Aires - GBA Norte',
    agencias: [
      'Pilar',
      'Tigre',
      'San Isidro',
      'Vicente López',
      'San Martín',
      'Tres de Febrero',
      'Hurlingham',
      'Ituzaingó',
      'Moreno',
      'Malvinas Argentinas',
    ]
  },
  {
    provincia: 'Buenos Aires - GBA Oeste',
    agencias: [
      'Morón',
      'Castelar',
      'Merlo',
      'La Matanza',
      'Ramos Mejía',
      'Ciudadela',
      'Haedo',
    ]
  },
  {
    provincia: 'Buenos Aires - GBA Sur',
    agencias: [
      'Lanús',
      'Lomas de Zamora',
      'Quilmes',
      'Berazategui',
      'Florencio Varela',
      'Almirante Brown',
      'Avellaneda',
    ]
  },
  {
    provincia: 'Buenos Aires - Interior',
    agencias: [
      'La Plata',
      'Mar del Plata',
      'Bahía Blanca',
      'Tandil',
      'Pergamino',
      'Junín',
      'San Nicolás',
      'Zárate',
      'Campana',
    ]
  },
  {
    provincia: 'Ciudad de Buenos Aires',
    agencias: [
      'Belgrano',
      'Flores',
      'Puerto Madero',
      'Palermo',
      'Caballito',
      'Barracas',
    ]
  },
  {
    provincia: 'Córdoba',
    agencias: [
      'Córdoba Capital - Belgrano',
      'Córdoba Capital - Fuerza Aérea',
      'Río Cuarto',
      'Villa María',
      'Cruz del Eje',
      'San Francisco',
      'Bell Ville',
    ]
  },
  {
    provincia: 'Santa Fe',
    agencias: [
      'Rosario',
      'Santa Fe Capital',
      'Villa Constitución',
      'Rafaela',
      'Venado Tuerto',
      'Reconquista',
    ]
  },
  {
    provincia: 'Mendoza',
    agencias: [
      'Mendoza Capital',
      'San Martín',
      'Godoy Cruz',
      'Guaymallén',
      'Luján de Cuyo',
      'San Rafael',
    ]
  },
  {
    provincia: 'Neuquén',
    agencias: [
      'Neuquén Capital',
      'Cipolletti',
      'Cutral Có',
      'Zapala',
    ]
  },
  {
    provincia: 'Río Negro',
    agencias: [
      'Bariloche',
      'Roca',
      'Viedma',
      'Cipolletti',
    ]
  },
  {
    provincia: 'Tucumán',
    agencias: [
      'San Miguel de Tucumán',
      'Tafí Viejo',
      'Concepción',
    ]
  },
  {
    provincia: 'Salta',
    agencias: [
      'Salta Capital',
      'Tartagal',
      'Orán',
    ]
  },
  {
    provincia: 'San Luis',
    agencias: [
      'San Luis Capital',
      'Villa Mercedes',
    ]
  },
  {
    provincia: 'San Juan',
    agencias: [
      'San Juan Capital',
      'Caucete',
    ]
  },
  {
    provincia: 'Corrientes',
    agencias: [
      'Corrientes Capital',
      'Goya',
      'Mercedes',
    ]
  },
  {
    provincia: 'Entre Ríos',
    agencias: [
      'Paraná',
      'Concordia',
      'Gualeguaychú',
    ]
  },
  {
    provincia: 'Chaco',
    agencias: [
      'Resistencia',
      'Sáenz Peña',
    ]
  },
  {
    provincia: 'Misiones',
    agencias: [
      'Posadas',
      'Eldorado',
      'Oberá',
    ]
  },
  {
    provincia: 'Formosa',
    agencias: [
      'Formosa Capital',
    ]
  },
  {
    provincia: 'Jujuy',
    agencias: [
      'San Salvador de Jujuy',
      'Palpalá',
    ]
  },
  {
    provincia: 'Santiago del Estero',
    agencias: [
      'Santiago del Estero Capital',
      'La Banda',
    ]
  },
  {
    provincia: 'La Rioja',
    agencias: [
      'La Rioja Capital',
    ]
  },
  {
    provincia: 'Catamarca',
    agencias: [
      'San Fernando del Valle de Catamarca',
    ]
  },
  {
    provincia: 'La Pampa',
    agencias: [
      'Santa Rosa',
      'General Pico',
    ]
  },
  {
    provincia: 'Chubut',
    agencias: [
      'Comodoro Rivadavia',
      'Trelew',
      'Puerto Madryn',
    ]
  },
  {
    provincia: 'Santa Cruz',
    agencias: [
      'Río Gallegos',
      'Caleta Olivia',
    ]
  },
  {
    provincia: 'Tierra del Fuego',
    agencias: [
      'Ushuaia',
      'Río Grande',
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
 * Lista de provincias
 */
export const PROVINCIAS_LIST = AGENCIAS_AUTOCREDITO.map(p => p.provincia);
