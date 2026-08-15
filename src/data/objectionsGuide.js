export const OBJECTION_CATEGORIES = [
  'Todas',
  'Sistema y Sorteo',
  'Concesionarias vs AutoCrédito',
  'Económicas e Inflación',
  'Cierre y Familia',
  'Contrato y Legalidad',
  'Seguimiento por WhatsApp'
];

export const OBJECTIONS_GUIDE = [
  {
    id: 1,
    title: '¿Esto es como un plan de ahorro de concesionaria (Plan Rombo / Fiat Plan)?',
    category: 'Concesionarias vs AutoCrédito',
    problem: 'El cliente cree que si sale sorteado le dan el auto pero sigue pagando cuotas con deuda indexada.',
    keyPoints: [
      'Concesionaria: Ahorro previo cerrado a 84 meses donde al licitar/sortear seguís pagando.',
      'AutoCrédito: Capitalización donde al salir sorteado NO PAGÁS NUNCA MÁS NINGUNA CUOTA.',
      'En concesionaria te endeudás; en AutoCrédito capitalizás y cancelás deuda.'
    ],
    recommendedResponse: '“No Don Carlos, es exactamente lo opuesto. En una concesionaria tradicional es un plan cerrado de 84 cuotas donde licitás o salís sorteado y te dan el auto, PERO seguís pagando todas las cuotas que falten más el seguro caro. AutoCrédito es un Sistema de Capitalización: todos los meses participás con tu número de 3 cifras por Lotería de la Ciudad. El mes que salís sorteado, te entregamos el auto 0km o el dinero en efectivo y NO PAGÁS NUNCA MÁS NINGUNA CUOTA. Queda 100% saldado a tu nombre.”',
    proTip: 'Hacer énfasis con tono firme: "En la concesionaria te endeudas; en AutoCrédito cancelás deuda."'
  },
  {
    id: 2,
    title: '¿Y qué pasa con el valor de la suscripción y las primeras 7 cuotas?',
    category: 'Contrato y Legalidad',
    problem: 'El cliente vio que las cuotas 1 a 7 son más altas que la cuota 8 y desconfía.',
    keyPoints: [
      'El 9.90% de derecho de suscripción autorizado por IGJ se diluye en 7 meses.',
      'Evita que el cliente deba desembolsar millones en el primer mes.',
      'A partir de la cuota 8 la cuota baja a su valor puro reducido hasta el final.'
    ],
    recommendedResponse: '“Excelente pregunta. En cualquier sistema oficial inspeccionado por la IGJ hay un Derecho de Ingreso o Suscripción del 9.90%. AutoCrédito, para que no tengas que poner una fortuna de entrada el primer día, te lo divide en las primeras 7 cuotas. Por eso de la cuota 1 a la 7 abonás la cuota con la suscripción incluida, y a partir de la cuota 8 la cuota baja significativamente y se mantiene en cuota pura reducida hasta el final.”',
    proTip: 'Mostrale en la calculadora la diferencia entre la Cuota 1 a 7 y la Cuota 8+ para que vea la transparencia.'
  },
  {
    id: 3,
    title: '“En concesionaria me prometieron entrega asegurada en cuota 2 o cuota 4”',
    category: 'Concesionarias vs AutoCrédito',
    problem: 'Fue engañado por vendedores telefónicos de concesionarias con la falsa "entrega pactada".',
    keyPoints: [
      'En concesionaria la entrega asegurada exige integrar 30% a 50% en mano + gastos millonarios.',
      'Luego del retiro la cuota mensual sigue aumentando con el valor del 0km.',
      'AutoCrédito no hace falsas promesas: cuota accesible y liberación total si salís sorteado.'
    ],
    recommendedResponse: '“Tené mucho cuidado con eso. Si lees la letra chica del contrato de concesionaria, la supuesta entrega pactada en cuota 2 te exige poner el 30%, 40% o 50% del valor del auto en efectivo en mano, más gastos de retiro de varios millones, y además seguís pagando las 80 cuotas restantes ajustadas por inflación. En AutoCrédito somos transparentes: no te mentimos con entregas mágicas sin plata. Acá entrás con una cuota accesible y participás desde el primer mes por sorteo oficial para llevártelo sin deberle un peso a nadie.”',
    proTip: 'Preguntale: "¿Te dijeron cuánto tenés que poner de contado en esa cuota 2?". Casi nunca lo saben.'
  },
  {
    id: 4,
    title: '“Tengo que hablarlo con mi esposa / marido antes de decidir”',
    category: 'Cierre y Familia',
    problem: 'Miedo a tomar una decisión financiera individual o excusa para postergar.',
    keyPoints: [
      'Involucrar a la pareja como beneficiaria directa del auto o del dinero.',
      'Proteger el arancel y cupo de la campaña del mes.',
      'Ofrecer llamada o visita conjunta sin presionar.'
    ],
    recommendedResponse: '“Me parece perfecto, las decisiones importantes de la casa se toman en familia. Justamente por eso te pregunto: ¿qué creés que le gustaría más a tu señora, que te endeudes en un banco a pagar 3 veces un auto, o tener un plan de capitalización donde si salís sorteado el auto o los $30 millones quedan para la familia sin deuda? Hagamos una cosa: dejemos reservado el cupo de la campaña de este mes para congelar las condiciones, y si querés hoy a la noche hacemos una videollamada de 5 minutos y se lo explicamos juntos a ella.”',
    proTip: 'Nunca presiones contra la pareja. Sumate como aliado para explicárselo a los dos.'
  },
  {
    id: 5,
    title: '“No llego a fin de mes / La situación económica está muy difícil”',
    category: 'Económicas e Inflación',
    problem: 'Sensación de asfixia económica o miedo al compromiso mensual.',
    keyPoints: [
      'Ajustar al plan mínimo accesible de cuota liviana.',
      'Sin ahorro disciplinado nunca se llega a juntar el capital para un 0km.',
      'Redirigir gastos hormiga a un fondo de capitalización.'
    ],
    recommendedResponse: '“Te entiendo perfectamente, la calle está difícil para todos. Pero justamente por eso te pregunto: si hoy no podés separar una cuota accesible por mes, ¿cómo pensás llegar a comprarte el auto o juntar 30 millones de acá a 2 años? El secreto no es privarte de comer, sino destinar el equivalente a un par de salidas o gastos hormiga a un fondo que todos los meses te da la posibilidad real de cambiar la vida de tu familia. Si el plan de $40M te queda justo, arranquemos con el plan de $20M que tiene una cuota mucho más liviana.”',
    proTip: 'Bajar al escalón de cuota más cómodo pero nunca dejar que se vaya sin suscribir.'
  },
  {
    id: 6,
    title: '“Yo nunca gano nada en los sorteos / Tengo mala suerte”',
    category: 'Sistema y Sorteo',
    problem: 'Falta de fe en la probabilidad estadística o experiencias pasadas en rifas.',
    keyPoints: [
      'No es una rifa de 1 sola vez: son 300 oportunidades mensuales consecutivas.',
      'Sorteo mensual por Lotería de la Ciudad ante Escribano Público.',
      'Mientras tanto todo el aporte se capitaliza.'
    ],
    recommendedResponse: '“¡Muchos de los clientes que hoy tienen el 0km en la puerta de su casa me decían exactamente lo mismo el primer día! Mirá cómo funciona: en una rifa común participás una sola vez y perdiste la plata. En AutoCrédito vos tenés 300 oportunidades consecutivas (una cada mes durante 25 años) con tu número de 3 cifras por Lotería de la Ciudad. Y mientras tanto, cada peso que aportás está respaldado en tu plan de capitalización. La suerte no se busca en un día, se construye con constancia.”',
    proTip: 'Mostrale fotos o testimonios reales de adjudicados de la sucursal de los últimos meses.'
  },
  {
    id: 7,
    title: '“Prefiero comprar dólares todos los meses o poner plazo fijo”',
    category: 'Económicas e Inflación',
    problem: 'Cree que el ahorro tradicional bajo el colchón o plazo fijo es más eficiente.',
    keyPoints: [
      'Ahorrando 100 USD por mes tardás más de 30 años en juntar el valor de un 0km.',
      'AutoCrédito da apalancamiento desde el mes 1 por el total del capital.',
      'El plazo fijo no te entrega un auto en el mes 3.'
    ],
    recommendedResponse: '“Comprar dólares está genial para no perder tanto valor, pero hacé esta cuenta: si ahorrás 100 dólares por mes, ¿cuántos años tardás en juntar los 35.000 dólares que vale un Cronos o una Hilux 0km? ¡Tardás 30 años! Con AutoCrédito, vos con la misma cuota accesible estás jugando todos los meses por el auto entero o por $50 millones desde el mes 1. Si salís en el mes 4, pusiste 4 cuotas y te llevaste un auto de $45 millones. Ningún plazo fijo ni colchón te da ese apalancamiento.”',
    proTip: 'Comparar el tiempo real de ahorro: 30 años ahorrando vs posibilidad de adjudicación inmediata.'
  },
  {
    id: 8,
    title: '¿Qué respaldo legal tiene AutoCrédito? ¿Quién me garantiza que cumplen?',
    category: 'Contrato y Legalidad',
    problem: 'Miedo a estafas o empresas no reguladas.',
    keyPoints: [
      'Más de 37 años de trayectoria ininterrumpida en todo el país.',
      'Inspeccionado por la Inspección General de Justicia de la Nación (IGJ Res. 000176/04).',
      'Sorteos públicos de Lotería de la Ciudad ante Escribano Público.'
    ],
    recommendedResponse: '“Es la pregunta más inteligente que me podés hacer. AutoCrédito es la empresa administradora de planes de capitalización número 1 de Argentina, con más de 37 años de trayectoria ininterrumpida. Todos nuestros planes están aprobados e inspeccionados por la Inspección General de Justicia de la Nación (IGJ Resolución N° 000176/04). Los sorteos no los hace la empresa: se juegan por el último sorteo mensual de la Lotería de la Ciudad de Buenos Aires ante Escribano Público Nacional. Más transparente y legal que eso no existe.”',
    proTip: 'Mencionar el número de personería jurídica y resolución IGJ visible en el encabezado del contrato.'
  },
  {
    id: 9,
    title: '¿Qué pasa si en algún mes me atraso o no puedo pagar la cuota?',
    category: 'Contrato y Legalidad',
    problem: 'Temor a perder todo o tener sanciones bancarias si tiene un imprevisto.',
    keyPoints: [
      'Plazo hasta el último día hábil antes del sorteo para pagar.',
      'Rehabilitación de plan al regularizar cuotas.',
      'No hay informes negativos en Veraz ni financieras persiguiendo.'
    ],
    recommendedResponse: '“La vida tiene altibajos y el sistema lo contempla. Tenés plazo hasta el último día hábil antes del sorteo para abonar tu cuota mensual y participar del sorteo de ese mes. Si algún mes se te complica, podés ponerte al día en los meses siguientes y tu plan se reactiva automáticamente para seguir participando. Acá no tenés una financiera persiguiéndote ni mandándote al Veraz como en un banco.”',
    proTip: 'Aclarar siempre que para salir sorteado la cuota de ese mes debe estar paga en término.'
  },
  {
    id: 10,
    title: 'Si salgo sorteado, ¿puedo cambiar el auto por dinero o por otro modelo?',
    category: 'Sistema y Sorteo',
    problem: 'Le gusta el plan pero le preocupa que en el futuro prefiera la plata u otro vehículo.',
    keyPoints: [
      'Total libertad: retirar la unidad adjudicada, cambiar de modelo o solicitar dinero en efectivo.',
      'El dinero se deposita directamente por transferencia bancaria.',
      'Podés subir de gama abonando la diferencia arancelaria.'
    ],
    recommendedResponse: '“¡Totalmente! Al momento de salir adjudicado tenés total libertad: podés retirar el vehículo 0km exacto de tu plan, cambiar por otro modelo de mayor o menor gama abonando la diferencia, o solicitar el importe total del Valor Nominal en dinero en efectivo depositado en tu cuenta bancaria. Vos tenés el control total.”',
    proTip: 'Esta flexibilidad es el mejor argumento para clientes indecisos entre auto o dinero.'
  },
  {
    id: 11,
    title: '“Dejame un folleto que lo leo tranquilo y después te aviso”',
    category: 'Cierre y Familia',
    problem: 'Intento de enfriar la venta para no comprometerse ahora.',
    keyPoints: [
      'El folleto no responde dudas ni congela el cupo de la campaña.',
      'Aislar la duda real: cuota vs sorteo.',
      'Pre-cargar solicitud para reservar arancel sin costo.'
    ],
    recommendedResponse: '“Te lo dejo con todo gusto, pero seamos sinceros: el folleto te muestra números fríos pero no te responde las preguntas importantes sobre tu caso particular. ¿Qué es lo que te genera más duda en este momento: el valor de la cuota o el funcionamiento del sorteo? Te propongo algo mejor: dejemos pre-cargada la solicitud para asegurarte el arancel de este mes que cierra ahora. Si mañana revisás los papeles y decidís no avanzar, no perdiste nada, pero si querés arrancar ya tenés el lugar asegurado.”',
    proTip: 'Aislar la objeción real detrás del "dejame el folleto".'
  },
  {
    id: 12,
    title: '“Pedí un préstamo al banco y ya está, tengo la plata ya”',
    category: 'Concesionarias vs AutoCrédito',
    problem: 'Ansiedad por inmediatez sin calcular el costo financiero total de las tasas bancarias.',
    keyPoints: [
      'Bancos cobran tasas exorbitantes (devolves 2 o 3 veces el capital).',
      'AutoCrédito es cuota pura sin intereses usurarios.',
      'Posibilidad de adjudicación en primeros meses liberando toda deuda.'
    ],
    recommendedResponse: '“Si vas al banco y pedís $30 millones, ¿sabés cuánto terminás devolviendo con las tasas de interés actuales? Vas a devolver más de $75 o $90 millones en 48 cuotas asfixiantes que te comen el sueldo. Y si te atrasás un mes, te ejecutan. En AutoCrédito no hay intereses usurarios: cada cuota es aporte directo de capital. Y tenés la posibilidad real de que en la cuota 3 salgas sorteado y te lleves los $30 millones habiendo puesto solo una fracción mínima.”',
    proTip: 'Usá la pestaña de "Comparador Libre" para mostrarle el número en rojo del banco vs AutoCrédito.'
  },
  {
    id: 13,
    title: 'El cliente en WhatsApp clava el visto o responde cortante "mandame info"',
    category: 'Seguimiento por WhatsApp',
    problem: 'Sobrecarga de mensajes, no quiere leer textos largos genéricos.',
    keyPoints: [
      'Mensaje corto, personalizado, con audio breve o pregunta de opción binaria.',
      'Doble alternativa (Opción A vs Opción B).',
      'Evitar folletos genéricos sin contexto.'
    ],
    recommendedResponse: '“¡Hola Juan! Te grabé un audio de 20 segundos para no hacerte leer un choclo de texto. Básicamente tenés dos opciones para el 0km: 1) Plan cuota liviana de $160.000, 2) Plan SUV / Camioneta de $270.000. ¿Cuál de las dos opciones se adapta mejor a lo que estás buscando para la familia?”',
    proTip: 'Las preguntas de doble alternativa tienen un 70% más de respuesta que un "quedo a disposición".'
  },
  {
    id: 14,
    title: '¿Qué gastos tengo al momento de retirar el vehículo si salgo sorteado?',
    category: 'Contrato y Legalidad',
    problem: 'Miedo a sorpresas de costos ocultos al momento de ganar.',
    keyPoints: [
      'El auto y todas las cuotas futuras quedan 100% bonificadas.',
      'Solo se abonan gastos legales habituales: patentamiento DNRPA y flete de fábrica.',
      'Sin costos financieros ni prendas bancarias.'
    ],
    recommendedResponse: '“Somos 100% transparentes: el valor del vehículo y todas las cuotas futuras quedan 100% BONIFICADAS Y SALDADAS por haber salido adjudicado. Los únicos gastos que abona cualquier persona al retirar un 0km son los trámites legales de inscripción a tu nombre: el patentamiento oficial de DNRPA y el flete de fábrica a la concesionaria oficial de tu ciudad. Nada más.”',
    proTip: 'La transparencia genera 10 veces más confianza que ocultar los gastos de patentamiento.'
  },
  {
    id: 15,
    title: '“Tuve una mala experiencia hace años con otra empresa de planes”',
    category: 'Sistema y Sorteo',
    problem: 'Trauma financiero previo con financieras o promesas incumplidas.',
    keyPoints: [
      'Validar el dolor del cliente y empatizar.',
      'Diferenciar las intermediarias dudosas de AutoCrédito SA (empresa administradora propia).',
      'Más de 300.000 títulos adjudicados entregados en Argentina.'
    ],
    recommendedResponse: '“Lamentablemente hay muchas empresas dudosas que ensucian el rubro prometiendo cosas que no están escritas en ningún contrato. Por eso te entiendo tanto. AutoCrédito SA no es una intermediaria ni una cueva financiera: es una sociedad anónima auditada con sede central propia, cientos de agencias oficiales en todo el país y más de 300.000 títulos adjudicados entregados ante escribano. Te invito a que busques en nuestras redes oficiales los videos de las entregas de este último mes en tu provincia.”',
    proTip: 'Nunca hables mal de la competencia; mostrá la solidez y los adjudicados de AutoCrédito.'
  },
  {
    id: 16,
    title: '“25 años (300 meses) es muchísimo tiempo, en Argentina todo cambia”',
    category: 'Económicas e Inflación',
    problem: 'Pánico al largo plazo por la inestabilidad histórica del país.',
    keyPoints: [
      'El plazo largo existe para que la cuota sea mínima y accesible.',
      'No se esperan 25 años para ganar: tenés 300 chances desde el mes 1.',
      'Al salir adjudicado en cualquier mes el plan finaliza de inmediato.'
    ],
    recommendedResponse: '“¡Claro que 25 años es mucho tiempo! Pero miralo desde este lado: el plazo largo existe pura y exclusivamente para que la cuota mensual sea ultra accesible y no te apriete el bolsillo. No estás esperando 25 años para tener el auto: tenés 300 chances de ganar desde el primer mes. Si salís sorteado en el mes 2, en el mes 8 o en el año 3, el beneficio es el mismo: te llevás el auto y el plan se termina ahí mismo. Y si completás el plan, tenés tu capital ahorrado y protegido.”',
    proTip: 'La cuota es chica porque el plazo es largo; el sorteo puede ocurrir en el mes 1.'
  }
];

export const OBJECTIONS_DATABASE = OBJECTIONS_GUIDE;
