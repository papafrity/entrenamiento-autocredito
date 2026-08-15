export const CUSTOMER_PROFILES = [
  {
    id: 'apurado',
    name: 'Gonzalo Páez',
    avatar: '👨‍🔧',
    age: 32,
    occupation: 'Mecánico / Chofer',
    difficulty: 'Fácil',
    badgeClass: 'badge-easy',
    goal: 'Quiere un auto ya mismo porque su vehículo actual se rompe seguido.',
    personality: 'Impaciente, directo. Confunde el contrato de capitalización con un préstamo bancario o entrega inmediata.',
    initialMessage: 'Buenas tardes maestro. Mira, necesito cambiar el auto ya porque el mío no da más. Decime una cosa: ¿pongo la primera cuota hoy y cuándo me entregan las llaves del vehículo?',
    objections: [
      'Ah no, ¿tengo que esperar a salir sorteado? Yo pensé que era como pedir un crédito en el banco.',
      '¿Y si no salgo sorteado en los primeros meses sigo pagando sin tener el auto?',
      'Para eso saco un crédito prendario y me llevo el auto mañana.'
    ]
  },
  {
    id: 'primera_moto',
    name: 'Sofía Beltrán',
    avatar: '👩‍🎨',
    age: 24,
    occupation: 'Diseñadora Freelance',
    difficulty: 'Fácil',
    badgeClass: 'badge-easy',
    goal: 'Quiere su primera moto 0km o auto económico con una cuota mensual baja que no le asfixie el mes.',
    personality: 'Amable, entusiasta pero con ingresos variables. Le cuesta ahorrar por su cuenta y busca una disciplina de cuota fija accesible.',
    initialMessage: 'Hola, ¿cómo estás? Vi el plan para la Honda Wave y el Cronos. Nunca me metí en nada de esto y trabajo por mi cuenta. ¿La cuota realmente arranca tan accesible como dice la publicación o hay gastos ocultos al inicio?',
    objections: [
      '¿Me piden recibo de sueldo en blanco o puedo suscribirme siendo monotributista?',
      '¿Qué pasa si un mes tengo menos trabajo freelance y me atraso unos días?',
      '¿La cuota de suscripción inicial se paga aparte o ya cuenta como cuota 1?'
    ]
  },
  {
    id: 'dinero_efectivo',
    name: 'Martín Quiroga',
    avatar: '👨‍💼',
    age: 38,
    occupation: 'Empleado de Comercio',
    difficulty: 'Fácil',
    badgeClass: 'badge-easy',
    goal: 'Busca un plan de $30.000.000 a $50.000.000 para terminar de construir su casa.',
    personality: 'Prudente y trabajador. Averiguó en bancos pero las tasas de interés y los requisitos de ingresos le parecieron imposibles.',
    initialMessage: 'Hola buenas tardes. Estoy viendo los planes de dinero en efectivo de 30 a 50 millones. En los bancos me piden ingresos millonarios y te matan con los intereses. ¿En AutoCrédito cómo funciona la entrega del dinero si salgo adjudicado?',
    objections: [
      '¿El dinero me lo transfieren a mi cuenta bancaria o me dan cheques?',
      'Si salgo sorteado en la cuota 4, ¿tengo que seguir pagando las cuotas restantes de los 30 millones?',
      '¿Qué respaldo tiene el dinero ante una devaluación del peso?'
    ]
  },
  {
    id: 'esceptico',
    name: 'Roberto Giménez',
    avatar: '👨‍🏭',
    age: 48,
    occupation: 'Comerciante en Zona Oeste',
    difficulty: 'Medio',
    badgeClass: 'badge-medium',
    goal: 'Proteger su dinero pero tiene desconfianza extrema por malas experiencias y promesas falsas en redes sociales.',
    personality: 'Desconfiado, escéptico, frontal. Usa frases como "acá siempre hay una trampa" o "la letra chica nadie te la dice".',
    initialMessage: 'Hola. Vi la publicidad de AutoCrédito en Facebook, pero la verdad no me convence mucho. Todo el mundo promete cosas y después cuando querés el dinero o el auto te salen con mil excusas. ¿Cuál es el truco acá?',
    objections: [
      '¿Esto es una financiera o una cueva?',
      '¿Por qué me van a regalar un auto o capital si salgo sorteado sin pagar más cuotas? Nadie regala nada en este país.',
      'Seguro si salgo sorteado me siguen cobrando igual que los planes de concesionaria.'
    ]
  },
  {
    id: 'inflacion',
    name: 'Facundo Benítez',
    avatar: '🧑‍💻',
    age: 29,
    occupation: 'Programador / Independiente',
    difficulty: 'Medio',
    badgeClass: 'badge-medium',
    goal: 'Quiere ahorrar pero teme asumir compromisos que la inflación argentina le impida sostener a largo plazo.',
    personality: 'Temeroso por la macroeconomía argentina, muy cuidadoso con su flujo de fondos mensual.',
    initialMessage: 'Hola buenas. Me llama la atención la propuesta pero en este país las cuotas se van al demonio de un mes para el otro. Hoy puedo pagar una cuota razonable, pero si la cuota aumenta descontroladamente me arruina. ¿Cómo se actualizan los valores de sus cuotas?',
    objections: [
      'Si el valor del vehículo 0km sube un 10% mensual, mi cuota sube igual y no me va a alcanzar.',
      'Preferiría comprar dólares o meter la plata en un fondo que atarme a un contrato largo.',
      '¿Existe alguna bonificación o cuota fija durante los primeros meses?'
    ]
  },
  {
    id: 'plan_vivienda',
    name: 'Estela Domínguez',
    avatar: '👩‍🏫',
    age: 45,
    occupation: 'Docente de Escuela Pública',
    difficulty: 'Medio',
    badgeClass: 'badge-medium',
    goal: 'Sueña con el Plan Vivienda (Kit de 58 m²) o Pack Hogar para dejarle un techo propio a sus hijos.',
    personality: 'Maternal, responsable, meticulosa. Pregunta mucho sobre qué incluye el kit y dónde se puede construir.',
    initialMessage: 'Hola buenas tardes. Trabajo en docencia y estoy muy interesada en el Plan Vivienda de 58 m2 para el terreno que tenemos con mi marido. ¿El kit de la casa realmente te lo entregan completo o solo son los planos?',
    objections: [
      '¿Qué materiales exactamente incluye el kit de 58 metros cuadrados?',
      '¿Si no tengo terreno propio todavía puedo solicitar el valor equivalente en dinero en efectivo?',
      '¿Cómo es el sorteo mensual por Lotería Nacional para la casa?'
    ]
  },
  {
    id: 'mala_experiencia',
    name: 'Claudio Benítez',
    avatar: '👨‍🔧',
    age: 53,
    occupation: 'Dueño de Taller Mecánico',
    difficulty: 'Medio',
    badgeClass: 'badge-medium',
    goal: 'Quiere renovar su camioneta de trabajo pero fue estafado hace años por un plan de ahorro trucho.',
    personality: 'Herido por experiencias pasadas, busca garantías legales sólidas, personería jurídica y oficinas físicas.',
    initialMessage: 'Buenas. Mire, a mí en el 2018 una empresa de Buenos Aires me cobró 10 cuotas prometiendo una Hilux y después desaparecieron con la plata. ¿AutoCrédito cuántos años tiene en el mercado y qué organismo oficial los controla?',
    objections: [
      '¿Tienen agencia física acá en la zona donde pueda ir a ver los papeles membretados?',
      '¿Quién audita que los sorteos no estén arreglados para los amigos de la empresa?',
      '¿Qué número de resolución de la IGJ (Inspección General de Justicia) avala este plan?'
    ]
  },
  {
    id: 'comparadora',
    name: 'Mariela Rossi',
    avatar: '👩‍💼',
    age: 39,
    occupation: 'Administrativa de Empresa',
    difficulty: 'Difícil',
    badgeClass: 'badge-hard',
    goal: 'Compara fríamente con planes de concesionaria tradicional (Plan Rombo, Fiat Plan 70/30 y 80/20).',
    personality: 'Analítica, calculadora, muy informada. Hace preguntas duras sobre licitación vs sorteo puro.',
    initialMessage: 'Hola, estuve averiguando sobre el sistema de capitalización. Ya coticé un Plan Rombo y un Fiat Plan en concesionaria oficial donde me permiten licitar con mi auto usado en la cuota 2. ¿Qué ventaja concreta me da AutoCrédito sobre un plan de ahorro de fábrica?',
    objections: [
      'En la concesionaria licito con capital y tengo el auto asegurado; en AutoCrédito dependo únicamente de la suerte del sorteo.',
      'En un plan de ahorro si no salgo sorteado licito y me lo llevo, acá si no salgo sorteado no tengo forma de forzar la entrega.',
      '¿Por qué dicen que en AutoCrédito no se pagan más cuotas al adjudicar si en los planes de concesionaria sí se sigue pagando?'
    ]
  },
  {
    id: 'abogado_tecnico',
    name: 'Dr. Fernando Rossi',
    avatar: '🤵',
    age: 44,
    occupation: 'Abogado Corporativo',
    difficulty: 'Difícil',
    badgeClass: 'badge-hard',
    goal: 'Desarmar el contrato de capitalización buscando inconsistencias legales, letra chica o cláusulas de rescisión.',
    personality: 'Formal, inquisitivo, técnico. Evalúa la solvencia técnica del asesor y exige respuestas jurídicas precisas.',
    initialMessage: 'Estimado, buenas tardes. Antes de suscribir cualquier solicitud deseo conocer la naturaleza jurídica del contrato bajo el marco de la Resolución IGJ de Sociedades de Capitalización. ¿Cómo se compone técnicamente la cuota comercial respecto a la cuota pura y el fondo de rescate?',
    objections: [
      '¿Cuál es el valor de rescate actuarial según la tabla contractual si el suscriptor decide rescindir en la cuota 24 o 36?',
      '¿Bajo qué base matemática se exime al suscriptor adjudicado del pago de las cuotas futuras sin afectar la masa de capitalización?',
      '¿El título nominativo adjudicado es transferible por endoso o cesión de derechos?'
    ]
  },
  {
    id: 'jubilada_desconfiada',
    name: 'Graciela Vega',
    avatar: '👵',
    age: 62,
    occupation: 'Jubilada / Ama de Casa',
    difficulty: 'Difícil',
    badgeClass: 'badge-hard',
    goal: 'Ahorrar un dinero para sus nietos pero le aterroriza cualquier gestión por internet o que le vacíen la cuenta.',
    personality: 'Tradicional, desconfiada de los celulares y las transferencias. Pide que vaya un asesor uniformado a su casa con el auto de la agencia.',
    initialMessage: 'Hola mijo, buenas tardes. Mi sobrino me mostró la propaganda del teléfono, pero a mí las cosas por internet me dan mucho miedo con todo lo que se escucha en la tele. ¿Ustedes tienen alguien que pueda venir a mi casa a explicarme bien con papeles?',
    objections: [
      'Yo no quiero poner la tarjeta de débito en ninguna aplicación porque me da miedo que me saquen la jubilación.',
      '¿Me pueden dar el recibo oficial en mano cada vez que pago?',
      'Si me pasa algo a mí, ¿este ahorro le queda directamente a mis nietos sin tener que hacer sucesión?'
    ]
  }
];
