import { GoogleGenAI, Type } from "@google/genai";
import { AnimationScript, ElementType, AnimationType } from "../types";

const SYSTEM_INSTRUCTION = `
You are the DevForge Educational Animation Video Generator. 
Your goal is to convert a natural language description into a fully animated educational video script.

CORE RESPONSIBILITIES:
1.  **Educational Storytelling**: Break down complex topics (Math, Physics, History, Biology, CS) into clear, step-by-step visual scenes.
2.  **Visual Clarity**: Use specific visual elements (shapes, characters, maps, formulas) to explain concepts.
3.  **Animation Logic**: Define how objects move (x/y coordinates), enter (fade/slide), and interact.
4.  **Camera Control**: Use 'camera' properties to zoom in on details or pan across maps/diagrams.

RULES:
-   **Scenes**: Break the video into 4-8 scenes.
-   **Narrative**: Provide a concise, high-level voiceover script for each scene.
-   **Coordinates**: Use a 0-100% coordinate system (x:0, y:0 is top-left).
-   **SPACING (CRITICAL)**: Distribute elements spatially with at least 15% (approx 40px) gap between them to prevent overlapping, unless they are grouped intentionally. Do not clutter the center.
-   **Map/Geography**: If the topic is historical or geographical (e.g., WW2), set 'backgroundStyle' to 'map'. Use 'map-marker' elements.
-   **Math/Science**: Use 'grid' or 'paper' backgrounds. Use 'shape' or 'text' for formulas.
-   **Camera**: Default zoom is 1.0. Increase to 1.5-2.0 to focus. Pan x/y to follow action.
-   **Icons**: Use relevant emojis for characters (e.g., 👮‍♂️, ⚛️, 🧬, 🏰).

OUTPUT FORMAT:
Return strictly valid JSON adhering to the schema.
`;

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    visualStyle: { type: Type.STRING, description: "A description of the overall visual style and tone." },
    scenes: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          duration: { type: Type.NUMBER },
          narrative: { type: Type.STRING },
          backgroundStyle: { type: Type.STRING, enum: ['default', 'map', 'grid', 'space', 'paper'] },
          camera: {
            type: Type.OBJECT,
            properties: {
              zoom: { type: Type.NUMBER },
              x: { type: Type.NUMBER },
              y: { type: Type.NUMBER }
            },
            nullable: true
          },
          elements: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                type: { type: Type.STRING, enum: ['character', 'shape', 'text', 'map-marker', 'arrow', 'image'] },
                label: { type: Type.STRING },
                color: { type: Type.STRING, nullable: true },
                x: { type: Type.NUMBER },
                y: { type: Type.NUMBER },
                size: { type: Type.NUMBER, nullable: true },
                targetX: { type: Type.NUMBER, nullable: true },
                targetY: { type: Type.NUMBER, nullable: true },
                icon: { type: Type.STRING, nullable: true },
                enterAnimation: { type: Type.STRING, enum: ['fade-in', 'slide-in', 'scale-up', 'none'], nullable: true },
              },
              required: ['id', 'type', 'label', 'x', 'y']
            }
          }
        },
        required: ['id', 'duration', 'narrative', 'backgroundStyle', 'elements']
      }
    }
  },
  required: ['title', 'scenes', 'visualStyle']
};

export const generateAnimationScript = async (topic: string): Promise<AnimationScript> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Generate an animated educational video for: "${topic}". 
      Ensure it has a clear educational progression. 
      If abstract (Math/Physics), visualize it. 
      If historical (WW2), use maps and markers.`,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text) as AnimationScript;
  } catch (error) {
    console.error("Gemini Generation Error:", error);
    throw error;
  }
};