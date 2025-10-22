// === CONFIGURAÇÃO ===
// ⚠️ SUBSTITUA PELA SUA CHAVE REAL DA API DO GEMINI! (use só localmente!)
// ⚠️ NÃO USE ESSA CHAVE EM CÓDIGO PÚBLICO!
// === CONFIGURAÇÃO ===
const API_KEY = "AIzaSyA99NwLSLzOxR3MIgLaurnXJIhTH9_VW44"; // <-- TROQUE AQUI
const API_URL = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash-latest:generateContent?key=${API_KEY}`;

const speakBtn = document.getElementById("speakBtn");
const statusEl = document.getElementById("status");
const muteBtn = document.getElementById("muteBtn");
let muted = false;

// === VOZ DO JARVIS ===
function falar(texto) {
  if (muted) return;
  const fala = new SpeechSynthesisUtterance(texto);
  fala.lang = "pt-BR";
  fala.pitch = 1.0; // Tom da voz
  fala.rate = 1.05; // Velocidade da voz
  fala.volume = 1;
  
  // Tenta encontrar uma voz em português para melhor qualidade (opcional)
  fala.voice = speechSynthesis.getVoices().find(v => v.lang.startsWith("pt"));
  
  speechSynthesis.speak(fala);
}

// === RECONHECIMENTO DE VOZ ===
async function ouvir() {
  // Cria o objeto de reconhecimento de voz
  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = "pt-BR";
  recognition.start();

  statusEl.textContent = "🎙️ Ouvindo...";

  return new Promise((resolve) => {
    // Quando o resultado for recebido (o usuário parou de falar)
    recognition.onresult = (event) => {
      const texto = event.results[0][0].transcript;
      resolve(texto);
    };
    // Em caso de erro (microfone não encontrado ou não falou)
    recognition.onerror = () => resolve(null);
    
    // Timeout de 5 segundos, caso o reconhecimento falhe sem erro
    setTimeout(() => {
      recognition.stop(); // Parar para evitar consumo de recursos
      resolve(null);
    }, 5000);
  });
}

// === FALAR COM O GEMINI ===
async function perguntarJarvis(pergunta) {
  statusEl.textContent = "🤔 Pensando...";

  try {
    const resposta = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: pergunta }] }]
      })
    });

    if (!resposta.ok) {
      throw new Error(`Erro de HTTP: ${resposta.status}`);
    }

    const dados = await resposta.json();
    // Extrai o texto da resposta do Gemini
    const texto = dados.candidates?.[0]?.content?.parts?.[0]?.text || "Desculpe, não consegui processar a resposta.";
    return texto;

  } catch (error) {
    console.error("Erro ao chamar o Gemini:", error);
    return "Erro de comunicação com o sistema. Verifique a chave da API.";
  }
}

// === BOTÃO DE FALAR ===
speakBtn.addEventListener("click", async () => {
  // 1. Ouve o usuário
  const pergunta = await ouvir();
  
  if (!pergunta) {
    statusEl.textContent = "❌ Não entendi, tente novamente.";
    return;
  }

  statusEl.textContent = "💬 Você: " + pergunta;
  
  // 2. Pergunta ao Gemini
  const resposta = await perguntarJarvis(pergunta);

  // 3. Exibe e fala a resposta
  statusEl.textContent = "🤖 Jarvis: " + resposta;
  falar(resposta);
});

// === MUTE ===
muteBtn.addEventListener("click", () => {
  muted = !muted;
  // Altera o texto do botão para o ícone de som ou mudo
  muteBtn.textContent = muted ? "🔊" : "🔇"; 
});

// Mensagem de boas-vindas ao carregar
window.onload = () => falar("Olá, estou pronto para te ajudar.");