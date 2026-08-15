import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Obtiene la API Key configurada desde localStorage o variables de entorno
 */
export function getApiKey() {
  const storedKey = localStorage.getItem('autocredito_gemini_key');
  if (storedKey && storedKey.trim() !== '') {
    return storedKey.trim();
  }
  return import.meta.env.VITE_GEMINI_API_KEY || '';
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
 * Envía la conversación al modelo Gemini para generar la respuesta del cliente simulado
 */
export async function generateCustomerResponse(profile, chatHistory) {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('API_KEY_MISSING');
  }

  const systemInstruction = `
Eres un cliente argentino llamado ${profile.name}, de ${profile.age} años (${profile.occupation}).
Estás hablando con un vendedor de AutoCrédito (empresa de capitalización y ahorro en Argentina).
Tu personalidad es: ${profile.personality}.
Tu objetivo/preocupación principal es: ${profile.goal}.
Nivel de dificultad del cliente: ${profile.difficulty}.

REGLAS DE ACTUACIÓN (SÚPER IMPORTANTE):
1. Mantén SIEMPRE tu personaje argentino de manera natural. Usa modismos argentinos cotidianos pero creíbles (ej: "mirá", "che", "posta", "cuota", "pesos", "estafa", "0km", "concesionaria").
2. NO aceptes comprar el plan inmediatamente. Presenta las objeciones típicas de tu perfil: ${profile.objections.join(' | ')}.
3. Si el vendedor te explica bien las ventajas (sorteo mensual con adjudicación sin pagar más cuotas vs préstamos o concesionarias, regulación por IGJ), puedes ir mostrando apertura o hacer preguntas más avanzadas.
4. Si el vendedor confunde conceptos (ej: te dice que es un préstamo bancario o que te garantizan la entrega del auto en cuota 2 sin sorteo), cuestiona su respuesta como un cliente realista.
5. Mantén tus respuestas en un tono de chat (de 2 a 4 oraciones como máximo), directas y realistas.
`;

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      systemInstruction: systemInstruction
    });

    const contents = chatHistory.map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    }));

    const result = await model.generateContent({
      contents: contents,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 300,
      }
    });

    return result.response.text();
  } catch (error) {
    console.error('Error con SDK de Gemini, intentando fallback REST:', error);
    return await fallbackRestCall(apiKey, chatHistory, systemInstruction);
  }
}

/**
 * Llama a la API de Gemini para evaluar el desempeño del vendedor al finalizar la sesión
 */
export async function evaluateSalesSession(profile, chatHistory) {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('API_KEY_MISSING');
  }

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

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: {
        temperature: 0.3,
        responseMimeType: 'application/json'
      }
    });

    const result = await model.generateContent(prompt);
    return JSON.parse(result.response.text());
  } catch (error) {
    console.error('Error en evaluación:', error);
    const textResult = await fallbackRestCall(apiKey, [{ sender: 'user', text: prompt }], '');
    const jsonMatch = textResult.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw error;
  }
}

/**
 * Fallback directo vía HTTP REST en caso de inconvenientes con el paquete SDK
 */
async function fallbackRestCall(apiKey, chatHistory, systemInstruction = '') {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  
  const contents = chatHistory.map(msg => ({
    role: msg.sender === 'user' ? 'user' : 'model',
    parts: [{ text: msg.text }]
  }));

  const bodyData = {
    contents: contents,
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 500
    }
  };

  if (systemInstruction) {
    bodyData.systemInstruction = {
      parts: [{ text: systemInstruction }]
    };
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(bodyData)
  });

  if (!response.ok) {
    const errData = await response.json();
    throw new Error(errData.error?.message || 'Error en la comunicación con Gemini API');
  }

  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
}
