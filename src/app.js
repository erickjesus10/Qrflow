import QRCode from "qrcode";

export function createApp() {
  setTimeout(() => {
    const typeSelect = document.getElementById("typeSelect");
    const linkInput = document.getElementById("linkInput");
    const sizeSelect = document.getElementById("sizeSelect");
    const colorInput = document.getElementById("colorInput");
    const generateBtn = document.getElementById("generateBtn");
    const downloadBtn = document.getElementById("downloadBtn");
    const copyBtn = document.getElementById("copyBtn");
    const clearBtn = document.getElementById("clearBtn");
    const feedback = document.getElementById("feedback");
    const qrWrapper = document.getElementById("qrWrapper");
    const canvas = document.getElementById("qrCanvas");
    const historyList = document.getElementById("historyList");
    const qrTag = document.getElementById("qrTag");

    function showMessage(text, type = "error") {
      feedback.textContent = text;
      feedback.className = `feedback ${type}`;
    }

    function clearMessage() {
      feedback.textContent = "";
      feedback.className = "feedback";
    }

    function isValidUrl(value) {
      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    }

    function detectPlatform(rawValue, type) {
      const value = rawValue.toLowerCase();

      if (type === "whatsapp" || value.includes("wa.me") || value.includes("whatsapp")) {
        return { name: "WhatsApp", icon: "📱", className: "platform-whatsapp" };
      }

      if (type === "text") {
        return { name: "Texto", icon: "📝", className: "platform-text" };
      }

      if (value.includes("linkedin.com")) {
        return { name: "LinkedIn", icon: "💼", className: "platform-linkedin" };
      }

      if (value.includes("instagram.com")) {
        return { name: "Instagram", icon: "📸", className: "platform-instagram" };
      }

      if (value.includes("youtube.com") || value.includes("youtu.be")) {
        return { name: "YouTube", icon: "▶️", className: "platform-youtube" };
      }

      if (value.includes("github.com")) {
        return { name: "GitHub", icon: "🐙", className: "platform-github" };
      }

      if (value.includes("facebook.com")) {
        return { name: "Facebook", icon: "📘", className: "platform-facebook" };
      }

      if (value.includes("tiktok.com")) {
        return { name: "TikTok", icon: "🎵", className: "platform-tiktok" };
      }

      if (value.includes("x.com") || value.includes("twitter.com")) {
        return { name: "X / Twitter", icon: "🐦", className: "platform-x" };
      }

      return { name: "Site", icon: "🔗", className: "platform-site" };
    }

    function buildValue() {
      const type = typeSelect.value;
      const value = linkInput.value.trim();

      if (!value) return "";

      if (type === "url") return value;

      if (type === "whatsapp") {
        const clean = value.replace(/\D/g, "");
        return `https://wa.me/${clean}`;
      }

      if (type === "text") return value;

      return value;
    }

    function validateValue(type, rawValue, finalValue) {
      if (!rawValue) {
        showMessage("Preencha o campo para gerar o QR Code.");
        return false;
      }

      if (type === "url" && !isValidUrl(rawValue)) {
        showMessage("Digite uma URL válida. Exemplo: https://meusite.com");
        return false;
      }

      if (type === "whatsapp" && rawValue.replace(/\D/g, "").length < 10) {
        showMessage("Digite um número de WhatsApp válido com DDD.");
        return false;
      }

      if (!finalValue) {
        showMessage("Não foi possível montar o conteúdo do QR Code.");
        return false;
      }

      return true;
    }

    function setQrTag(platform) {
      qrTag.innerHTML = `<span class="qr-tag-icon">${platform.icon}</span><span>${platform.name}</span>`;
      qrTag.className = `qr-tag ${platform.className}`;
      qrTag.classList.remove("hidden");
    }

    function saveHistory(item) {
      const current = JSON.parse(localStorage.getItem("scanflow_history") || "[]");
      const updated = [item, ...current].slice(0, 5);
      localStorage.setItem("scanflow_history", JSON.stringify(updated));
      renderHistory();
    }

    function renderHistory() {
      const current = JSON.parse(localStorage.getItem("scanflow_history") || "[]");

      if (!current.length) {
        historyList.innerHTML = `<li class="history-empty">Nenhum QR gerado ainda.</li>`;
        return;
      }

      historyList.innerHTML = current
        .map(
          (item) => `
            <li class="history-item">
              <button 
                class="history-button" 
                data-value="${encodeURIComponent(item.value)}"
                data-platform='${encodeURIComponent(JSON.stringify(item.platform))}'
              >
                <span class="history-type">${item.type}</span>
                <span class="history-text">${item.label}</span>
              </button>
            </li>
          `
        )
        .join("");

      document.querySelectorAll(".history-button").forEach((button) => {
        button.addEventListener("click", async () => {
          const value = decodeURIComponent(button.dataset.value);
          const platform = JSON.parse(decodeURIComponent(button.dataset.platform));

          try {
            await QRCode.toCanvas(canvas, value, {
              width: Number(sizeSelect.value),
              margin: 2,
              color: {
                dark: colorInput.value,
                light: "#ffffff",
              },
            });

            setQrTag(platform);
            qrWrapper.classList.remove("hidden");
            qrWrapper.classList.remove("qr-animate");
            void qrWrapper.offsetWidth;
            qrWrapper.classList.add("qr-animate");

            downloadBtn.classList.remove("hidden");
            copyBtn.classList.remove("hidden");
            clearBtn.classList.remove("hidden");
            showMessage("QR Code carregado do histórico.", "success");
          } catch (error) {
            console.error(error);
            showMessage("Erro ao carregar item do histórico.");
          }
        });
      });
    }

    async function generateQRCode() {
      const type = typeSelect.value;
      const rawValue = linkInput.value.trim();
      const finalValue = buildValue();
      const size = Number(sizeSelect.value);
      const platform = detectPlatform(rawValue, type);

      clearMessage();

      if (!validateValue(type, rawValue, finalValue)) {
        return;
      }

      try {
        generateBtn.disabled = true;
        generateBtn.textContent = "Gerando...";

        await QRCode.toCanvas(canvas, finalValue, {
          width: size,
          margin: 2,
          color: {
            dark: colorInput.value,
            light: "#ffffff",
          },
        });

        setQrTag(platform);

        qrWrapper.classList.remove("hidden");
        qrWrapper.classList.remove("qr-animate");
        void qrWrapper.offsetWidth;
        qrWrapper.classList.add("qr-animate");

        downloadBtn.classList.remove("hidden");
        copyBtn.classList.remove("hidden");
        clearBtn.classList.remove("hidden");

        saveHistory({
          type,
          label: rawValue,
          value: finalValue,
          platform,
        });

        showMessage("QR Code gerado com sucesso.", "success");
      } catch (error) {
        console.error(error);
        showMessage("Não foi possível gerar o QR Code.");
      } finally {
        generateBtn.disabled = false;
        generateBtn.textContent = "Gerar QR Code";
      }
    }

    function downloadQRCode() {
      const image = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = image;
      a.download = "scanflow-qrcode.png";
      a.click();
    }

    async function copyLink() {
      const value = buildValue();

      if (!value) {
        showMessage("Não há conteúdo para copiar.");
        return;
      }

      try {
        await navigator.clipboard.writeText(value);
        showMessage("Conteúdo copiado com sucesso.", "success");
      } catch (error) {
        console.error(error);
        showMessage("Não foi possível copiar.");
      }
    }

    function clearAll() {
      linkInput.value = "";
      clearMessage();
      qrTag.innerHTML = "";
      qrTag.className = "qr-tag hidden";
      qrWrapper.classList.add("hidden");
      qrWrapper.classList.remove("qr-animate");
      downloadBtn.classList.add("hidden");
      copyBtn.classList.add("hidden");
      clearBtn.classList.add("hidden");
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    function updatePlaceholder() {
      const type = typeSelect.value;

      if (type === "url") {
        linkInput.placeholder = "https://seu-link-aqui.com";
      } else if (type === "whatsapp") {
        linkInput.placeholder = "11999999999";
      } else {
        linkInput.placeholder = "Digite um texto livre";
      }
    }

    generateBtn.addEventListener("click", generateQRCode);
    downloadBtn.addEventListener("click", downloadQRCode);
    copyBtn.addEventListener("click", copyLink);
    clearBtn.addEventListener("click", clearAll);
    typeSelect.addEventListener("change", updatePlaceholder);

    linkInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        generateQRCode();
      }
    });

    updatePlaceholder();
    renderHistory();
  }, 0);

  return `
    <main class="container">
      <section class="card">
        <div class="badge">Projeto inicial</div>
        <h1>QRFlow</h1>
        <p class="subtitle">Transforme links em acesso rápido.</p>

        <label for="typeSelect" class="label">Tipo de QR Code</label>
        <select id="typeSelect" class="select">
          <option value="url" selected>Link</option>
          <option value="whatsapp">WhatsApp</option>
          <option value="text">Texto</option>
        </select>

        <label for="linkInput" class="label">Conteúdo</label>
        <input
          id="linkInput"
          class="input"
          type="text"
          placeholder="https://seu-link-aqui.com"
        />

        <label for="sizeSelect" class="label">Tamanho do QR Code</label>
        <select id="sizeSelect" class="select">
          <option value="220">Pequeno</option>
          <option value="280" selected>Médio</option>
          <option value="360">Grande</option>
        </select>

        <label for="colorInput" class="label">Cor do QR Code</label>
        <input id="colorInput" class="input color-input" type="color" value="#000000" />

        <div class="actions">
          <button id="generateBtn" class="btn primary">Gerar QR Code</button>
          <button id="downloadBtn" class="btn secondary hidden">Baixar PNG</button>
          <button id="copyBtn" class="btn secondary hidden">Copiar conteúdo</button>
          <button id="clearBtn" class="btn ghost hidden">Limpar</button>
        </div>

        <div id="feedback" class="feedback"></div>

        <div id="qrWrapper" class="qr-wrapper hidden">
          <canvas id="qrCanvas"></canvas>
          <div id="qrTag" class="qr-tag hidden"></div>
        </div>

        <section class="history">
          <h2>Últimos gerados</h2>
          <ul id="historyList" class="history-list"></ul>
        </section>

        <footer class="footer">
          Criado por Erick Jean · Qrflow v1.4
        </footer>
      </section>
    </main>
  `;
}