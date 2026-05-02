import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { texto, contexto } = await request.json();

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY!,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        messages: [{
          role: "user",
          content: `Sos un mecánico automotriz experto redactando un informe técnico profesional.

El mecánico dictó esto informalmente como ${contexto}:
"${texto}"

Tu tarea:
1. Reescribilo en lenguaje técnico automotriz profesional
2. Usá terminología específica del rubro (ej: "sistema de frenado", "desgaste de pastillas", "juego en suspensión", etc.)
3. Estructuralo en una oración clara y completa
4. Eliminá palabras coloquiales como "feo", "raro", "cosa", "eso"
5. Si mencionan síntomas, describí el posible origen técnico
6. Comenzá siempre con "El vehículo..." o "Se detecta..." o "El cliente reporta..."

Respondé SOLO con el texto técnico mejorado, sin explicaciones, sin comillas, sin puntos al final.`
        }]
      }),
    });

    const data = await response.json();
    const textoMejorado = data.content?.[0]?.text || texto;
    return NextResponse.json({ texto: textoMejorado });

  } catch (error) {
    return NextResponse.json({ error: "Error al procesar" }, { status: 500 });
  }
}