import { GoogleGenerativeAI } from "https://esm.run/@google/generative-ai";

    // === CONFIGURE AQUI (somente para testes locais!) ===
    const GEMINI_API_KEY = "AIzaSyBwOTOgB9He1Xnbc-ONfQk5yhXAJr6ebQY";
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    // =====================================================

    const chatEl = document.getElementById("chat");
    const input = document.getElementById("pergunta");
    const btnEnviar = document.getElementById("enviar");
    const btnLimpar = document.getElementById("limpar");

    // system prompt: comando que define o estilo/voz do modelo
    const systemPrompt = { role: "system", content: "Fala como se você fosse um soldado indo para a segunda guerra mundial. Responda em estilo direto — sem explicações extras." };

    // mensagens: histórico persistido em localStorage
    let mensagens = JSON.parse(localStorage.getItem("mensagens")) || [];

    // renderiza a lista de mensagens no chat
    function renderChat() {
      chatEl.innerHTML = ""; // limpa
      if (mensagens.length === 0) {
        const info = document.createElement("div");
        info.textContent = "Nenhuma mensagem ainda. Faça uma pergunta.";
        info.style.opacity = ".7";
        chatEl.appendChild(info);
        return;
      }

      for (const m of mensagens) {
        const wrapper = document.createElement("div");
        wrapper.className = "msg " + (m.role === "user" ? "user" : "gemini");

        // meta linha (quem e hora opcional)
        const meta = document.createElement("div");
        meta.className = "meta";
        meta.textContent = m.role === "user" ? "Você" : "Gemini";
        wrapper.appendChild(meta);

        // content: aqui vamos converter Markdown -> HTML e SANITIZAR antes de inserir
        const content = document.createElement("div");
        content.className = "content";

        // se já estivermos guardando conteúdo em markdown, convertemos:
        // marked.parse transforma Markdown em HTML
        const html = marked.parse(m.content || "");
        // DOMPurify.sanitize remove scripts e atributos perigosos
        const safe = DOMPurify.sanitize(html, { USE_PROFILES: { html: true } });

        content.innerHTML = safe;
        wrapper.appendChild(content);

        chatEl.appendChild(wrapper);
      }

      // rolar para baixo
      chatEl.scrollTop = chatEl.scrollHeight;
    }

    renderChat();

    // função que envia o contexto + system prompt ao Gemini
    async function conversar(pergunta) {
      mensagens.push({ role: "user", content: pergunta });
      localStorage.setItem("mensagens", JSON.stringify(mensagens));
      renderChat();

      // montar contexto: systemPrompt + histórico (apenas role:content text)
      const contexto = [systemPrompt, ...mensagens].map(m => `${m.role}: ${m.content}`).join("\n\n");

      // pega o modelo (troque caso precise)
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      // chamada
      const result = await model.generateContent(contexto);
      const resposta = await result.response.text();

      // empilha a resposta (assumimos que o modelo já retornou em Markdown)
      mensagens.push({ role: "model", content: resposta });
      localStorage.setItem("mensagens", JSON.stringify(mensagens));
      renderChat();
    }

    btnEnviar.addEventListener("click", async () => {
      const pergunta = input.value.trim();
      if (!pergunta) return;
      input.value = "";
      btnEnviar.disabled = true;
      btnEnviar.textContent = "Enviando...";
      try {
        await conversar(pergunta);
      } catch (err) {
        mensagens.push({ role: "model", content: `❌ Erro: ${err.message}` });
        localStorage.setItem("mensagens", JSON.stringify(mensagens));
        renderChat();
        console.error(err);
      } finally {
        btnEnviar.disabled = false;
        btnEnviar.textContent = "Enviar";
      }
    });

    btnLimpar.addEventListener("click", () => {
      mensagens = [];
      localStorage.removeItem("mensagens");
      renderChat();
    });

    // Enter para enviar
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        btnEnviar.click();
      }
    });