export const BADGES_CATALOG = [
  {
    id: 'esceptico_master',
    title: 'Domador de Escépticos',
    icon: '🛡️',
    description: 'Aprobaste una venta simulada con Roberto Giménez con más de 80 puntos.',
    category: 'Ventas'
  },
  {
    id: 'apurado_master',
    title: 'Claridad Total',
    icon: '⚡',
    description: 'Le explicaste a Gonzalo la diferencia entre préstamo y capitalización.',
    category: 'Conceptos'
  },
  {
    id: 'comparador_master',
    title: 'Estratega de Concesionaria',
    icon: '🚗',
    description: 'Convenciste a Mariela de por qué AutoCrédito es superior a un plan de ahorro tradicional.',
    category: 'Ventas'
  },
  {
    id: 'flash_master',
    title: 'Reflejos de Oro',
    icon: '🎯',
    description: 'Completaste el Desafío de Objeciones Relámpago con puntuación perfecta.',
    category: 'Desafíos'
  },
  {
    id: 'car_pilot',
    title: 'Piloto de Visitas',
    icon: '📍',
    description: 'Agendaste y realizaste salidas de asesoramiento con el auto de la agencia.',
    category: 'Operaciones'
  },
  {
    id: 'closer_star',
    title: 'Cerrador Estrella',
    icon: '👑',
    description: 'Alcanzaste más de 500 puntos en el ranking del equipo.',
    category: 'Nivel'
  }
];

export const INITIAL_TEAM_MEMBERS = [
  {
    id: 'user_current',
    name: 'Mi Asesor (Tú)',
    avatar: '👨‍💼',
    branch: 'Sucursal Central',
    points: 320,
    simulationsCompleted: 4,
    unlockedBadges: ['esceptico_master', 'apurado_master']
  },
  {
    id: 'lucas_p',
    name: 'Lucas Pereyra',
    avatar: '🧑‍💻',
    branch: 'Zona Norte',
    points: 480,
    simulationsCompleted: 6,
    unlockedBadges: ['esceptico_master', 'comparador_master', 'flash_master', 'car_pilot']
  },
  {
    id: 'camila_m',
    name: 'Camila Morales',
    avatar: '👩‍💼',
    branch: 'Zona Oeste',
    points: 590,
    simulationsCompleted: 8,
    unlockedBadges: ['esceptico_master', 'apurado_master', 'comparador_master', 'closer_star', 'car_pilot']
  },
  {
    id: 'martin_s',
    name: 'Martín Sosa',
    avatar: '👨‍🔧',
    branch: 'Zona Sur',
    points: 210,
    simulationsCompleted: 3,
    unlockedBadges: ['esceptico_master']
  }
];

// Fechas dinámicas para reservas de ejemplo
const today = new Date();
const formatDate = (d) => d.toISOString().split('T')[0];

const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);

export const INITIAL_CAR_RESERVATIONS = [
  {
    id: 'res_1',
    advisorId: 'camila_m',
    advisorName: 'Camila Morales',
    advisorPhone: '11-4567-8901',
    clientName: 'Dr. Alejandro Fernández',
    destination: 'San Justo (Zona Oeste)',
    date: formatDate(today),
    startTime: '15:00',
    endTime: '17:30',
    purpose: 'Visita de cierre a domicilio - Plan 100% Pick-up',
    status: 'confirmada'
  },
  {
    id: 'res_2',
    advisorId: 'lucas_p',
    advisorName: 'Lucas Pereyra',
    advisorPhone: '11-9876-5432',
    clientName: 'Familia Gómez',
    destination: 'Martínez (Zona Norte)',
    date: formatDate(tomorrow),
    startTime: '10:00',
    endTime: '12:30',
    purpose: 'Asesoramiento presencial y firma de solicitud',
    status: 'confirmada'
  }
];
