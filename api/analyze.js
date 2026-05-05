module.exports = async (req, res) => {
    // Solo permitir solicitudes POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { text, category } = req.body;
        
        if (!text) {
            return res.status(400).json({ error: 'El texto del caso es requerido' });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: 'GEMINI_API_KEY no está configurada en Vercel' });
        }

        // Construir el prompt estructurado
        const prompt = `Actúa como un abogado chileno experto en ${category || 'derecho laboral y administrativo'}. Analiza el siguiente caso narrado por un usuario:
        
"${text}"

Proporciona una respuesta profesional, estructurada y empática (en HTML básico para incrustar, usando <h3> para títulos, <p> para párrafos y <ul>/<li> para listas, sin estilos). Divídela en:
<h3>Análisis Legal Preliminar</h3>
(qué leyes aplican, ej. Ley 21.643 Ley Karin, Código del Trabajo, Estatuto Administrativo, etc.).
<h3>Gravedad y Recomendaciones</h3>
(qué debería hacer el usuario como próximos pasos).
Mantenlo conciso, directo y fácil de entender para alguien que no es abogado.`;

        // Llamada a la API de Gemini usando fetch nativo
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

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
            return res.status(500).json({ error: 'Error al comunicarse con la API de IA' });
        }

        const data = await response.json();
        
        // Extraer texto
        const aiResponseText = data.candidates[0].content.parts[0].text;

        res.status(200).json({ result: aiResponseText });

    } catch (error) {
        console.error("Server error:", error);
        res.status(500).json({ error: 'Error Interno del Servidor' });
    }
};
