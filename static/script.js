import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI("AIzaSyBwOTOgB9He1Xnbc-ONfQk5yhXAJr6ebQY");
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

async function teste() {
  try {
    const result = await model.generateContent("Olá, teste da API Gemini!");
    const resposta = await result.response.text();
    console.log("Resposta:", resposta);
  } catch (err) {
    console.error("Erro:", err);
  }
}

teste();
