// === CONFIGURAÇÃO ===
// ⚠️ Substitua pela sua chave de API do Gemini (use só localmente!)
// === CONFIGURAÇÃO ===
const API_KEY = "AIzaSyD70vjv7P3FjW6NdHrv2unxtAFmhvAWQz0";
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
  fala.pitch = 1.0;
  fala.rate = 1.05;
  fala.volume = 1;
  fala.voice = speechSynthesis.getVoices().find(v => v.lang.startsWith("pt"));
  speechSynthesis.speak(fala);
}

// === RECONHECIMENTO DE VOZ ===
async function ouvir() {
  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = "pt-BR";
  recognition.start();

  statusEl.textContent = "🎙️ Ouvindo...";

  return new Promise((resolve) => {
    recognition.onresult = (event) => {
      const texto = event.results[0][0].transcript;
      resolve(texto);
    };
    recognition.onerror = () => resolve(null);
  });
}

// === FALAR COM O GEMINI ===
async function perguntarJarvis(pergunta) {
  statusEl.textContent = "🤔 Pensando...";

  const resposta = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: pergunta }] }]
    })
  });

  const dados = await resposta.json();
  const texto = dados.candidates?.[0]?.content?.parts?.[0]?.text || "Desculpe, não entendi.";
  return texto;
}

// === BOTÃO DE FALAR ===
speakBtn.addEventListener("click", async () => {
  const pergunta = await ouvir();
  if (!pergunta) {
    statusEl.textContent = "❌ Não entendi, tente novamente.";
    return;
  }

  statusEl.textContent = "💬 Você: " + pergunta;
  const resposta = await perguntarJarvis(pergunta);

  statusEl.textContent = "🤖 Jarvis: " + resposta;
  falar(resposta);
});

// === MUTE ===
muteBtn.addEventListener("click", () => {
  muted = !muted;
  muteBtn.textContent = muted ? "🔊" : "🔇";
});
