import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

// Carrega as variáveis de ambiente (.env)
dotenv.config();

// Inicializa o cliente Gemini
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

// Função principal
export async function conversarJarvis(pergunta) {
  try {
    // Cria o modelo
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Gera a resposta
    const prompt = `Você é Jarvis, um assistente virtual masculino, inteligente e prestativo. Responda em português: ${pergunta}`;

    const result = await model.generateContent(prompt);
    const resposta = result.response.text();

    return resposta;
  } catch (error) {
    console.error("Erro ao conectar com o modelo:", error);
    return "Desculpe, houve um problema ao processar sua solicitação.";
  }
}
