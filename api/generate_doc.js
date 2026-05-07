module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { text, category, institution } = req.body;
        
        if (!text || !institution) {
            return res.status(400).json({ error: 'Texto del caso e institución son requeridos' });
        }

        const apiKey = process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.trim() : null;
        if (!apiKey) {
            return res.status(500).json({ error: 'GEMINI_API_KEY no está configurada en Vercel' });
        }

        // Prompt para generar un documento formal
        const prompt = `Actúa como un abogado chileno experto. Redacta una denuncia o presentación formal dirigida a la entidad "${institution}".
El documento se basa en el siguiente caso del usuario (bajo la categoría ${category || 'General'}):

"${text}"

Instrucción Crítica: Para fundamentar jurídicamente esta presentación, es OBLIGATORIO que extraigas y cites explícitamente los artículos que correspondan de:
- Ley 21.643 (Ley Karin) sobre acoso y violencia.
- Código del Trabajo chileno.
- Estatuto Administrativo (Ley 18.834) si es pertinente.
- Código Civil chileno.

Instrucciones de formato:
- Usa un tono estrictamente formal y jurídico chileno.
- Devuelve la respuesta en formato HTML básico usando <h1>, <h2>, <p>, <br>.
- NO uses markdown (ni triple backticks \`\`\`), devuelve HTML puro que se pueda inyectar directamente.
- Incluye marcadores de posición genéricos como [NOMBRE_DENUNCIANTE], [RUT_DENUNCIANTE], [EMPRESA_O_SERVICIO] para que el usuario pueda llenarlos a mano después.
- La estructura típica debe tener: Suma (MAT: Interpone denuncia por...), Destinatario (Señor Director/Superintendente de ${institution}), Cuerpo (Hechos, Derecho), y Petitorio (POR TANTO).
`;

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: prompt }]
                }]
            })
        });

        if (!response.ok) {
            const errorData = await response.text();
            console.error("Gemini API Error:", errorData);
            return res.status(500).json({ error: `Google rechazó la llave: ${errorData}` });
        }

        const data = await response.json();
        let aiResponseText = data.candidates[0].content.parts[0].text;
        
        // Limpiar backticks de markdown si la IA insiste en ponerlos
        aiResponseText = aiResponseText.replace(/^```html/i, '').replace(/^```/i, '').replace(/```$/i, '');

        res.status(200).json({ result: aiResponseText });

    } catch (error) {
        console.error("Server error:", error);
        res.status(500).json({ error: 'Error Interno del Servidor al generar el documento' });
    }
};
