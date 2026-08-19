import { GoogleGenerativeAI } from '@google/generative-ai';

// API Key oficial embebida y protegida
const _k = 'QVEuQWI4Uk42SUFrTGRXdFFoYjBtLVhnTC1NdUM2NXZWeHJNQlZTTkNYZ25faWxTb0x4TWc=';
const EMBEDDED_API_KEY = typeof atob !== 'undefined' ? atob(_k) : '';

// Modelos rápidos y fluidos en orden de prioridad
const GEMINI_MODELS = ['gemini-3-flash-preview', 'gemini-3.5-flash', 'gemini-3.7-flash'];

/**
 * Obtiene la API Key preconfigurada
 */
export function getApiKey() {
  const storedKey = localStorage.getItem('autocredito_gemini_key');
  if (storedKey && storedKey.trim() !== '') {
    return storedKey.trim();
  }
  return import.meta.env.VITE_GEMINI_API_KEY || EMBEDDED_API_KEY;
}

/**
 * Guarda la API Key en localStorage
 */
export function saveApiKey(key) {
  if (key) {
    localStorage.setItem('autocredito_gemini_key', key.trim());
  } else {
    localStorage.removeItem('autocredito_gemini_key');
  }
}

/**
 * Llamada ultra-rápida y resiliente a Gemini API sin truncamiento
 */
async function callGeminiApi(payload) {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('API_KEY_MISSING');
  }

  let lastError = null;

  for (const modelName of GEMINI_MODELS) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const data = await response.json();
        const parts = data.candidates?.[0]?.content?.parts || [];
        // Extraer texto limpio ignorando pensamientos internos
        const fullText = parts
          .filter(p => p.text && !p.thought)
          .map(p => p.text)
          .join('') || parts[0]?.text;

        if (fullText && fullText.trim()) {
          return fullText.trim();
        }
      } else {
        const errData = await response.json().catch(() => ({}));
        lastError = new Error(errData.error?.message || `Error ${response.status} en ${modelName}`);
      }
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError || new Error('No se pudo conectar con los servidores de IA.');
}

/**
 * Envía la conversación al modelo Gemini para generar la respuesta del cliente simulado
 */
export async function generateCustomerResponse(profile, chatHistory) {
  const systemInstruction = `
Eres un cliente argentino llamado ${profile.name}, de ${profile.age} años (${profile.occupation}).
Estás hablando con un vendedor de AutoCrédito (empresa de capitalización y ahorro en Argentina).
Tu personalidad es: ${profile.personality}.
Tu objetivo/preocupación principal es: ${profile.goal}.
Nivel de dificultad del cliente: ${profile.difficulty}.

REGLAS DE ACTUACIÓN (SÚPER IMPORTANTE):
1. Habla SIEMPRE como un argentino real en un chat: respuestas directas, naturales y creíbles (máximo 2 a 3 oraciones por mensaje).
2. Usa modismos argentinos cotidianos (ej: "mirá", "che", "posta", "cuota", "pesos", "estafa", "0km", "concesionaria", "laburo", "chanta").
3. NO aceptes comprar el plan inmediatamente. Presenta las objeciones típicas de tu perfil: ${profile.objections.join(' | ')}.
4. Si el vendedor te explica bien las ventajas (sorteo mensual con adjudicación sin pagar más cuotas vs préstamos o concesionarias, regulación por IGJ), puedes ir mostrando apertura o hacer preguntas más avanzadas.
5. Si el vendedor confunde conceptos (ej: te dice que es un préstamo bancario o que te garantizan la entrega en cuota 2 sin sorteo), cuestiona su respuesta.
6. TERMINA SIEMPRE tus oraciones de forma completa, nunca dejes frases cortadas.
`;

  const contents = chatHistory.map(msg => ({
    role: msg.sender === 'user' ? 'user' : 'model',
    parts: [{ text: msg.text }]
  }));

  const payload = {
    contents: contents,
    systemInstruction: {
      parts: [{ text: systemInstruction }]
    },
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 1000,
      thinkingConfig: { thinkingBudget: 0 }
    }
  };

  return await callGeminiApi(payload);
}

/**
 * Llama a la API de Gemini para evaluar el desempeño del vendedor al finalizar la sesión
 */
export async function evaluateSalesSession(profile, chatHistory) {
  const prompt = `
Actúa como un Director de Capacitación y Ventas Senior de AutoCrédito en Argentina.
Analiza el siguiente diálogo entre un VENDEDOR en entrenamiento y un CLIENTE (${profile.name} - ${profile.difficulty}).

TRANSCRIPCIÓN DE LA CHARLA DE VENTAS:
${chatHistory.map(m => `${m.sender === 'user' ? 'VENDEDOR' : 'CLIENTE (' + profile.name + ')'}: ${m.text}`).join('\n')}

Evalúa objetivamente el desempeño del vendedor en base a las normativas de AutoCrédito (Capitalización vs Préstamos/Planes de Ahorro tradicional, regulación IGJ, manejo de objeciones, intento de cierre).

Responde ÚNICAMENTE en formato JSON válido con la siguiente estructura (sin sintaxis de markdown adicional):
{
  "score": 85,
  "summary": "Resumen general en 2 frases de la actuación del vendedor.",
  "strengths": ["Punto fuerte 1", "Punto fuerte 2"],
  "areasForImprovement": ["Área a mejorar 1 con consejo práctico", "Área a mejorar 2"],
  "objectionHandlingScore": 80,
  "conceptClarityScore": 90,
  "closingTechniqueScore": 70,
  "proTip": "Un consejo de oro específico para vender AutoCrédito a este tipo de cliente."
}
`;

  const payload = {
    contents: [
      {
        role: 'user',
        parts: [{ text: prompt }]
      }
    ],
    generationConfig: {
      temperature: 0.3,
      maxOutputTokens: 1500,
      responseMimeType: 'application/json',
      thinkingConfig: { thinkingBudget: 0 }
    }
  };

  const textResponse = await callGeminiApi(payload);
  const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]);
  }
  return JSON.parse(textResponse);
}

/**
 * Genera opciones de respuesta para WhatsApp con detección de contexto
 */
export async function generateWhatsappResponses({ message, clientName, carOrGoal, clientTypeLabel }) {
  const prompt = `
Actúa como un Asesor Comercial Estrella de AutoCrédito en Argentina.
Analiza el siguiente mensaje o conversación que el cliente envió por WhatsApp y redacta 3 opciones de respuesta persuasivas, cálidas y efectivas para continuar la venta o cerrar el plan.

MENSAJE COPIADO DEL CLIENTE:
"""
${message.trim() || 'El cliente está indeciso.'}
"""

CONTEXTO ADICIONAL:
- Nombre del cliente: ${clientName?.trim() || 'Estimado/a'}
- Interés/Auto/Objetivo: ${carOrGoal?.trim() || 'Plan de Capitalización / Auto 0km'}
- Modo de detección: ${clientTypeLabel || 'Detección automática'}

REGLAS DE FORMATO Y ESTILO:
1. Español de Argentina, tono conversacional de WhatsApp: cálido, cercano, profesional y persuasivo (usa modismos argentinos como "mirá", "te comento", "buenas tardes", "¡un abrazo!").
2. Incluye emojis apropiados para WhatsApp pero sin sobrecargar.
3. Resalta la ventaja única de AutoCrédito según corresponda: adjudicación por sorteo sin pagar más cuotas + respaldo IGJ.
4. Genera exactamente 3 enfoques distintos:
   Opción 1: Enfoque Empático y Cercano (Resolver la duda amablemente y hacer una pregunta de avance)
   Opción 2: Enfoque de Urgencia / Sorteo de fin de mes (Aprovechar el cupo del sorteo más cercano)
   Opción 3: Enfoque Comparativo Directo (AutoCrédito vs Bancos/Concesionarias o llamado a la acción claro)

Responde ÚNICAMENTE en formato JSON con la siguiente estructura (sin markdown adicional):
{
  "options": [
    {
      "title": "Enfoque Empático y Cercano",
      "text": "Texto completo del mensaje de WhatsApp listo para enviar..."
    },
    {
      "title": "Enfoque Urgencia Fin de Mes",
      "text": "Texto completo del mensaje de WhatsApp listo para enviar..."
    },
    {
      "title": "Enfoque Comparativa de Valor",
      "text": "Texto completo del mensaje de WhatsApp listo para enviar..."
    }
  ]
}
`;

  const payload = {
    contents: [
      {
        role: 'user',
        parts: [{ text: prompt }]
      }
    ],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 1500,
      responseMimeType: 'application/json',
      thinkingConfig: { thinkingBudget: 0 }
    }
  };

  const textResponse = await callGeminiApi(payload);
  const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]);
  }
  return JSON.parse(textResponse);
}

/**
 * Evalúa el pitch de 60 segundos del vendedor
 */
export async function evaluatePitchSession({ challengeTitle, pitchText, durationSeconds }) {
  const prompt = `
Actúa como un Director de Capacitación y Ventas Senior de AutoCrédito en Argentina.
Evalúa el siguiente PITCH DE VENTAS DE 60 SEGUNDOS grabado/presentado por un asesor comercial.

DESAFÍO / TEMA DEL PITCH:
"${challengeTitle}"

TEXTO DEL PITCH PRESENTADO POR EL ASESOR:
"""
${pitchText.trim()}
"""

TIEMPO EMPLEADO: ${durationSeconds} segundos (Límite: 60 segundos).

CRITERIOS DE EVALUACIÓN:
1. Claridad y Estructura: ¿Fue directo, sin titubeos, y enganchó desde los primeros 10 segundos?
2. Argumentos de AutoCrédito: ¿Mencionó la ventaja clave (adjudicación por sorteo sin pagar más cuotas, cuota accesible, capitalización vs banco)?
3. Llamado a la Acción / Cierre: ¿Terminó con una pregunta de avance clara hacia el cliente?
4. Manejo del Tiempo: Si tardó menos de 20s fue muy corto; si pasó los 60s fue largo.

Responde ÚNICAMENTE en formato JSON con la siguiente estructura (sin markdown adicional):
{
  "score": 88,
  "verdict": "¡Excelente Pitch! / Buen intento / Requiere práctica",
  "summary": "Resumen en 2 oraciones del impacto del pitch.",
  "clarityScore": 90,
  "persuasionScore": 85,
  "closingScore": 80,
  "strengths": ["Punto fuerte 1", "Punto fuerte 2"],
  "improvements": ["Qué le faltó mencionar o cómo mejorar el cierre"],
  "improvedPitchExample": "Un ejemplo pulido y perfecto de cómo decir este mismo pitch en 50 segundos con modismos argentinos profesionales."
}
`;

  const payload = {
    contents: [
      {
        role: 'user',
        parts: [{ text: prompt }]
      }
    ],
    generationConfig: {
      temperature: 0.3,
      maxOutputTokens: 1500,
      responseMimeType: 'application/json',
      thinkingConfig: { thinkingBudget: 0 }
    }
  };

  const textResponse = await callGeminiApi(payload);
  const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]);
  }
  return JSON.parse(textResponse);
}

