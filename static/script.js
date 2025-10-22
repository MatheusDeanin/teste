import { GoogleGenerativeAI } from "https://esm.run/@google/generative-ai";

// === CONFIGURAÇÃO ===
const GEMINI_API_KEY = "SUA_CHAVE_AQUI"; // Substitua pela sua chave real
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// Elementos
const statusEl = document.getElementById("status");
const conversaEl = document.getElementById("conversa");
const speakBtn = document.getElementById("speakBtn");
const muteBtn = document.getElementById("muteBtn");

let muted = false;

// Histórico de mensagens
let mensagens = JSON.parse(localStorage.getItem("mensagensJarvis")) || [];

// Flag para primeira interação
let primeiraInteracao = true;

// Renderiza mensagens no container #conversa
function renderizarChat() {
  conversaEl.innerHTML = "";
  if (mensagens.length === 0) {
    const info = document.createElement("div");
    info.textContent = "Nenhuma mensagem ainda. Clique em 'Falar com Jarvis'.";
    info.style.opacity = ".7";
    conversaEl.appendChild(info);
    return;
  }

  for (const msg of mensagens) {
    const div = document.createElement("div");
    div.className = msg.role === "user" ? "msg user" : "msg jarvis";

    const html = marked.parse(msg.content || "");
    const safe = DOMPurify.sanitize(html, { USE_PROFILES: { html: true } });
    div.innerHTML = `<strong>${msg.role === "user" ? "Você" : "Jarvis"}:</strong><div>${safe}</div>`;
    conversaEl.appendChild(div);
  }
  conversaEl.scrollTop = conversaEl.scrollHeight;
}

renderizarChat();

// === VOZ DO JARVIS ===
function falar(texto) {
  if (muted) return;
  const fala = new SpeechSynthesisUtterance(texto);
  fala.lang = "pt-BR";
  fala.pitch = 1.0;
  fala.rate = 1.05;
  fala.voice = speechSynthesis.getVoices().find(v => v.lang.startsWith("pt")) || null;
  speechSynthesis.speak(fala);
}

// === RECONHECIMENTO DE VOZ ===
async function ouvir() {
  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = "pt-BR";
  recognition.start();
  statusEl.textContent = "🎙️ Ouvindo...";

  return new Promise(resolve => {
    recognition.onresult = (e) => resolve(e.results[0][0].transcript);
    recognition.onerror = () => resolve(null);
    setTimeout(() => {
      recognition.stop();
      resolve(null);
    }, 7000);
  });
}

// === CONVERSAR COM O GEMINI ===
async function conversar(pergunta) {
  mensagens.push({ role: "user", content: pergunta });
  localStorage.setItem("mensagensJarvis", JSON.stringify(mensagens));
  renderizarChat();

  statusEl.textContent = "🤔 Processando...";

  try {
    const contexto = mensagens.map(m => `${m.role}: ${m.content}`).join("\n\n");
    const result = await model.generateContent(contexto);
    const resposta = await result.response.text();

    mensagens.push({ role: "jarvis", content: resposta });
    localStorage.setItem("mensagensJarvis", JSON.stringify(mensagens));
    renderizarChat();

    statusEl.textContent = "🤖 Jarvis: " + resposta;
    falar(resposta);

  } catch (err) {
    console.error(err);
    statusEl.textContent = "❌ Erro de comunicação com o sistema.";
    mensagens.push({ role: "jarvis", content: "Erro de comunicação com o sistema." });
    localStorage.setItem("mensagensJarvis", JSON.stringify(mensagens));
    renderizarChat();
  }
}

// === BOTÃO FALAR ===
speakBtn.addEventListener("click", async () => {
  // Primeira interação: fala de boas-vindas
  if (primeiraInteracao) {
    falar("Olá, sistemas Jarvis prontos para operação.");
    primeiraInteracao = false;
  }

  const pergunta = await ouvir();
  if (!pergunta) {
    statusEl.textContent = "❌ Não entendi, tente novamente.";
    return;
  }
  statusEl.textContent = "💬 Você: " + pergunta;
  await conversar(pergunta);
});

// === MUTE ===
muteBtn.addEventListener("click", () => {
  muted = !muted;
  muteBtn.textContent = muted ? "🔊" : "🔇";
});
