# 🚗 AutoCrédito Trainer IA — Entrenador Inteligente de Ventas

Aplicación web interactiva desarrollada para capacitar y entrenar a vendedores de **AutoCrédito** (Planes de Capitalización y Ahorro en Argentina). 

Cuenta con un **simulador de clientes en tiempo real con Inteligencia Artificial** (Google Gemini), evaluación automática de coaching y una **guía interactiva de objeciones**.

---

## 🌟 Características Principales

1. **Simulador de Roleplay de Ventas:**
   * Distintos perfiles de clientes argentinos (Roberto el escéptico, Gonzalo el apurado, Mariela la comparadora de concesionarias, Facundo cauteloso con la inflación).
   * Reacciones realistas y objeciones cotidianas sobre el contrato de AutoCrédito, adjudicación por sorteo sin pagar más cuotas, fiscalización por IGJ, etc.

2. **Evaluación de Coaching con IA:**
   * Al finalizar cada venta simulada, la IA genera un análisis detallado con puntuación (Manejo de objeciones, Claridad conceptual, Técnica de cierre), aciertos, aspectos a mejorar y un **Tip de Oro comercial**.

3. **Guía de Objeciones y Argumentario:**
   * Biblioteca de preguntas difíciles con respuestas recomendadas y conceptos clave del contrato de capitalización.

4. **100% Gratuito:**
   * Utiliza la API gratuita de Google Gemini (Google AI Studio) sin generar costos de servidor.

---

## 🚀 Instalación y Desarrollo Local

```bash
# 1. Clonar el repositorio
git clone https://github.com/TU_USUARIO/entrenador-autocredito.git
cd entrenador-autocredito

# 2. Instalar dependencias
npm install

# 3. Iniciar el servidor de desarrollo
npm run dev
```

Abre [http://localhost:5173](http://localhost:5173) en tu navegador.

---

## 🔑 Configurar la API Key de Gemini (Gratis)

1. Ve a [Google AI Studio](https://aistudio.google.com/).
2. Inicia sesión con tu cuenta de Google.
3. Haz clic en **"Get API key"** -> **"Create API Key"**.
4. Copia la clave y pégala en la opción **"Configurar API Key"** en el menú superior de la aplicación web (se guarda localmente en tu navegador).

---

## 📤 Subir a GitHub

```bash
git init
git add .
git commit -m "Initial commit - AutoCrédito Trainer IA"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/entrenador-autocredito.git
git push -u origin main
```

---

## ⚡ Desplegar en Vercel (Gratis)

1. Entra a [Vercel](https://vercel.com/) e inicia sesión con tu cuenta de GitHub.
2. Haz clic en **"Add New"** -> **"Project"**.
3. Importa el repositorio `entrenador-autocredito`.
4. *(Opcional)* En **Environment Variables**, puedes agregar `VITE_GEMINI_API_KEY` con tu clave de Gemini.
5. Haz clic en **Deploy**. ¡Tu aplicación estará en vivo en segundos!
