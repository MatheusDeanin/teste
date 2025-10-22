document.getElementById("speakBtn").addEventListener("click", async () => {
    const pergunta = prompt("Pergunte ao Jarvis:");
    if (!pergunta) return;

    const respostaEl = document.getElementById("status");
    respostaEl.textContent = "Pensando...";

    try {
        const resposta = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=SUA_API_KEY_AQUI", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: pergunta }] }]
            })
        });

        const dados = await resposta.json();
        const texto = dados.candidates?.[0]?.content?.parts?.[0]?.text || "Sem resposta.";
        respostaEl.textContent = texto;
    } catch (err) {
        respostaEl.textContent = "Erro ao conectar com o Jarvis.";
    }
});
