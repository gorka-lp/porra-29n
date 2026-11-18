document.addEventListener("DOMContentLoaded", () => {
  const { totalSeats, parties, jokeScenarios } = PORRA_CONFIG;
  const state = {};
  parties.forEach(p => { state[p.id] = 0; });

  const partiesGrid = document.getElementById("partiesGrid");
  const partiesSection = document.getElementById("partiesSection");
  const lockNoticeBanner = document.getElementById("lockNoticeBanner");
  const idStatusPill = document.getElementById("idStatusPill");
  const totalAssignedEl = document.getElementById("totalAssigned");
  const remainingSeatsEl = document.getElementById("remainingSeats");
  const remainingInlinePill = document.getElementById("remainingInlinePill");
  const seatStatusBadge = document.getElementById("seatStatusBadge");
  const stackedBar = document.getElementById("stackedBar");
  const stackedLegend = document.getElementById("stackedLegend");
  const btnSubmit = document.getElementById("btnSubmit");
  const btnLoadPolls = document.getElementById("btnLoadPolls");
  const btnReset = document.getElementById("btnReset");
  const nameInput = document.getElementById("participantName");
  const emailInput = document.getElementById("participantEmail");
  const form = document.getElementById("porraForm");

  // Modal de confirmación
  const confirmModal = document.getElementById("confirmModal");
  const btnCloseConfirmModal = document.getElementById("btnCloseConfirmModal");
  const btnModalAccept = document.getElementById("btnModalAccept");

  // Activar enlaces de resultados si en config.js se pone resultsEnabled: true
  if (PORRA_CONFIG.resultsEnabled) {
    const tickerEl = document.getElementById("tickerResultsLink");
    if (tickerEl) {
      const a = document.createElement("a");
      a.href = "resultados.html";
      a.className = "ticker-link";
      a.textContent = "VER ESCRUTINIO Y CLASIFICACIÓN →";
      tickerEl.replaceWith(a);
    }
    const navBtn = document.getElementById("navResultsBtn");
    if (navBtn) {
      const a = document.createElement("a");
      a.href = "resultados.html";
      a.className = "nav-btn";
      a.textContent = "2. Resultados en Directo";
      navBtn.replaceWith(a);
    }
  }

  // Renderizar todos los partidos seguidos, ordenados por resultados de 2023
  parties.forEach(party => {
    const card = document.createElement("div");
    card.className = "party-card";
    card.id = `card-${party.id}`;
    card.style.borderLeftColor = party.color;

    card.innerHTML = `
      <div class="party-info-top">
        <div>
          <div class="party-name">${party.name}</div>
          <div class="party-note">${party.note}</div>
        </div>
        <span class="party-poll-tag" title="Encuesta GAD3 · Las Provincias (09/11/2026)">GAD3: ${party.pollDefault}</span>
      </div>
      <div class="stepper-control">
        <button type="button" class="step-btn" data-action="dec" data-id="${party.id}" disabled aria-label="Restar 1 a ${party.short}">−</button>
        <input type="number" class="seat-input" id="input-${party.id}" data-id="${party.id}" min="0" max="${totalSeats}" value="0" disabled />
        <button type="button" class="step-btn" data-action="inc" data-id="${party.id}" disabled aria-label="Sumar 1 a ${party.short}">+</button>
        <span class="seat-pct" id="pct-${party.id}">0.0%</span>
      </div>
    `;
    partiesGrid.appendChild(card);
  });

  function isValidIdentification() {
    const nameVal = nameInput.value.trim();
    const emailVal = emailInput.value.trim();
    const hasFullName = nameVal.length >= 4 && nameVal.includes(" ");
    const hasValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal);
    return { hasFullName, hasValidEmail, unlocked: hasFullName && hasValidEmail };
  }

  function updateUI() {
    const { unlocked } = isValidIdentification();

    partiesSection.classList.toggle("locked-section", !unlocked);
    lockNoticeBanner.classList.toggle("hidden", unlocked);
    btnLoadPolls.disabled = !unlocked;
    btnReset.disabled = !unlocked;

    idStatusPill.className = "id-status-pill " + (unlocked ? "unlocked" : "locked");
    idStatusPill.textContent = unlocked
      ? "✓ Identificación completa · Papeleta desbloqueada"
      : "🔒 Rellena nombre, apellido y correo para desbloquear";

    partiesGrid.querySelectorAll(".step-btn, .seat-input").forEach(el => {
      el.disabled = !unlocked;
    });

    const sum = Object.values(state).reduce((acc, v) => acc + v, 0);
    const remaining = totalSeats - sum;

    totalAssignedEl.textContent = sum;
    remainingSeatsEl.textContent = remaining >= 0 ? remaining : 0;
    remainingSeatsEl.classList.toggle("done", remaining === 0);

    if (remaining > 0) {
      remainingInlinePill.innerHTML = `Quedan <strong>${remaining}</strong> escaños por asignar`;
    } else if (remaining < 0) {
      remainingInlinePill.innerHTML = `Te has pasado por <strong>${Math.abs(remaining)}</strong> escaños`;
    } else {
      remainingInlinePill.innerHTML = `<strong>0</strong> escaños pendientes (350 completos)`;
    }

    parties.forEach(p => {
      const val = state[p.id];
      const inputEl = document.getElementById(`input-${p.id}`);
      const pctEl = document.getElementById(`pct-${p.id}`);
      const cardEl = document.getElementById(`card-${p.id}`);

      if (Number(inputEl.value) !== val) inputEl.value = val;
      pctEl.textContent = `${((val / totalSeats) * 100).toFixed(1)}%`;
      cardEl.classList.toggle("has-seats", val > 0);
    });

    stackedBar.innerHTML = "";
    stackedLegend.innerHTML = "";

    parties.forEach(p => {
      const val = state[p.id];
      if (val > 0) {
        const seg = document.createElement("div");
        seg.className = "bar-segment";
        seg.style.width = `${(val / totalSeats) * 100}%`;
        seg.style.backgroundColor = p.color;
        seg.title = `${p.short}: ${val} escaños`;
        stackedBar.appendChild(seg);

        const leg = document.createElement("span");
        leg.className = "legend-item";
        leg.innerHTML = `<span class="legend-swatch" style="background:${p.color}"></span>${p.short} (${val})`;
        stackedLegend.appendChild(leg);
      }
    });

    seatStatusBadge.className = "status-badge";
    if (remaining > 0) {
      seatStatusBadge.classList.add("pending");
      seatStatusBadge.textContent = `Faltan ${remaining} escaños por asignar`;
    } else if (remaining < 0) {
      seatStatusBadge.classList.add("over");
      seatStatusBadge.textContent = `Sobran ${Math.abs(remaining)} escaños`;
    } else {
      seatStatusBadge.classList.add("exact");
      seatStatusBadge.textContent = "✓ 350 escaños asignados";
    }

    btnSubmit.disabled = !(unlocked && remaining === 0);
  }

  // Evalúa el pronóstico del usuario y elige el escenario correspondiente (prioridad de arriba abajo)
  function pickJokeForPrediction(pred) {
    // 1. Subidón fuerte de Vox (>= 75 escaños)
    if ((pred.VOX || 0) >= 75) return jokeScenarios.vox_boom;

    // 2. Mayoría absoluta del PP en solitario (>= 176)
    if ((pred.PP || 0) >= 176) return jokeScenarios.pp_solo;

    // 3. Pacto de derechas PP + Vox (>= 176)
    if (((pred.PP || 0) + (pred.VOX || 0)) >= 176) return jokeScenarios.pp_vox;

    // 4. Mayoría absoluta del PSOE en solitario (>= 176)
    if ((pred.PSOE || 0) >= 176) return jokeScenarios.psoe_solo;

    // 5 y 6. Suma bloque progresista / investidura (>= 176)
    const leftPartnersBlock = (pred.PSOE || 0) + (pred.FA || 0) + (pred.PODEMOS || 0) +
      (pred.COMPROMIS || 0) + (pred.ERC || 0) + (pred.BILDU || 0) + (pred.PNV || 0) +
      (pred.BNG || 0) + (pred.UPC || 0) + (pred.ARAMES || 0);

    if (leftPartnersBlock >= 176) {
      if ((pred.PSOE || 0) >= 115) return jokeScenarios.psoe_amor;
      return jokeScenarios.bloque_izquierda;
    }

    // 7. Calco de la encuesta de GAD3 · Las Provincias (desviación total <= 6 escaños)
    const diffWithGad3 = parties.reduce((acc, p) => acc + Math.abs((pred[p.id] || 0) - p.pollDefault), 0);
    if (diffWithGad3 <= 6) return jokeScenarios.clon_gad3;

    // 8. Bloqueo total
    return jokeScenarios.bloqueo_total;
  }

  function getFallbackSvg(artType, pred) {
    const pp = pred.PP || 0;
    const psoe = pred.PSOE || 0;
    const vox = pred.VOX || 0;

    const svgs = {
      vox_franco: `
        <svg viewBox="0 0 240 180" class="joke-svg" aria-hidden="true">
          <rect width="240" height="180" rx="8" fill="#18181B"/>
          <rect x="10" y="10" width="220" height="160" rx="4" fill="none" stroke="#63BE21" stroke-width="2" stroke-dasharray="5 3"/>
          <text x="120" y="54" text-anchor="middle" font-family="Newsreader, Georgia, serif" font-weight="700" font-size="17" fill="#A3E635">NO-DO · EDICIÓN 29-N</text>
          <text x="120" y="98" text-anchor="middle" font-family="Inter, sans-serif" font-weight="800" font-size="34" fill="#FFFFFF">VOX: ${vox}</text>
          <text x="120" y="134" text-anchor="middle" font-family="Inter, sans-serif" font-weight="600" font-size="10.5" fill="#D4D4D8">Pon tu meme en img/vox-franco.jpg</text>
        </svg>`,
      feijoo_yate: `
        <svg viewBox="0 0 240 180" class="joke-svg" aria-hidden="true">
          <rect width="240" height="180" rx="8" fill="#EFF6FF"/>
          <path d="M15 132 Q60 120, 120 132 T225 132 L225 170 L15 170 Z" fill="#0284C7"/>
          <polygon points="48,124 192,124 172,94 64,94" fill="#0F172A"/>
          <rect x="84" y="72" width="66" height="22" rx="3" fill="#0056A3"/>
          <text x="120" y="46" text-anchor="middle" font-family="Newsreader, Georgia, serif" font-weight="700" font-size="23" fill="#0056A3">PP: ${pp} ESCAÑOS</text>
          <text x="120" y="154" text-anchor="middle" font-family="Inter, sans-serif" font-weight="700" font-size="10" fill="#FFFFFF">Pon tu foto en img/feijoo-yate.jpg</text>
        </svg>`,
      pp_vox_pacto: `
        <svg viewBox="0 0 240 180" class="joke-svg" aria-hidden="true">
          <rect width="240" height="180" rx="8" fill="#F8FAFC"/>
          <rect x="24" y="34" width="90" height="74" rx="6" fill="#0056A3"/>
          <rect x="126" y="34" width="90" height="74" rx="6" fill="#63BE21"/>
          <text x="69" y="72" text-anchor="middle" font-family="Inter, sans-serif" font-weight="800" font-size="24" fill="#FFFFFF">${pp}</text>
          <text x="69" y="92" text-anchor="middle" font-family="Inter, sans-serif" font-weight="700" font-size="10" fill="#DBEAFE">PP</text>
          <text x="171" y="72" text-anchor="middle" font-family="Inter, sans-serif" font-weight="800" font-size="24" fill="#FFFFFF">${vox}</text>
          <text x="171" y="92" text-anchor="middle" font-family="Inter, sans-serif" font-weight="700" font-size="10" fill="#ECFCCB">VOX</text>
          <rect x="36" y="122" width="168" height="28" rx="14" fill="#0F172A"/>
          <text x="120" y="140" text-anchor="middle" font-family="Inter, sans-serif" font-weight="800" font-size="11.5" fill="#FDE047">SUMA: ${pp + vox} / 176</text>
        </svg>`,
      sanchez_gafas: `
        <svg viewBox="0 0 240 180" class="joke-svg" aria-hidden="true">
          <rect width="240" height="180" rx="8" fill="#FEF2F2"/>
          <rect x="34" y="54" width="76" height="44" rx="10" fill="#0F172A"/>
          <rect x="130" y="54" width="76" height="44" rx="10" fill="#0F172A"/>
          <line x1="110" y1="68" x2="130" y2="68" stroke="#0F172A" stroke-width="5"/>
          <line x1="46" y1="66" x2="72" y2="86" stroke="#EF4444" stroke-width="4"/>
          <line x1="142" y1="66" x2="168" y2="86" stroke="#EF4444" stroke-width="4"/>
          <text x="120" y="132" text-anchor="middle" font-family="Newsreader, Georgia, serif" font-weight="700" font-size="22" fill="#E30613">PSOE: ${psoe}</text>
          <text x="120" y="154" text-anchor="middle" font-family="Inter, sans-serif" font-weight="700" font-size="10" fill="#7F1D1D">Pon tu foto en img/sanchez-gafas.jpg</text>
        </svg>`,
      sanchez_beso: `
        <svg viewBox="0 0 240 180" class="joke-svg" aria-hidden="true">
          <rect width="240" height="180" rx="8" fill="#FFF1F2"/>
          <path d="M120 128 C72 96, 56 54, 88 40 C106 32, 120 48, 120 56 C120 48, 134 32, 152 40 C184 54, 168 96, 120 128 Z" fill="#E11D48"/>
          <text x="120" y="84" text-anchor="middle" font-family="Inter, sans-serif" font-weight="800" font-size="18" fill="#FFFFFF">PSOE ${psoe}</text>
          <text x="120" y="154" text-anchor="middle" font-family="Inter, sans-serif" font-weight="700" font-size="10" fill="#9F1239">Pon tu foto en img/sanchez-beso.jpg</text>
        </svg>`,
      tetris_investidura: `
        <svg viewBox="0 0 240 180" class="joke-svg" aria-hidden="true">
          <rect width="240" height="180" rx="8" fill="#FDF2F8"/>
          <rect x="38" y="32" width="48" height="48" rx="4" fill="#E30613"/>
          <rect x="96" y="32" width="48" height="48" rx="4" fill="#E51C55"/>
          <rect x="154" y="32" width="48" height="48" rx="4" fill="#6B2D8F"/>
          <rect x="38" y="88" width="48" height="48" rx="4" fill="#FFB232"/>
          <rect x="96" y="88" width="48" height="48" rx="4" fill="#B5CF18"/>
          <rect x="154" y="88" width="48" height="48" rx="4" fill="#008037"/>
          <text x="120" y="160" text-anchor="middle" font-family="Inter, sans-serif" font-weight="800" font-size="11" fill="#831843">TETRIS DE 176 ESCAÑOS</text>
        </svg>`,
      gad3_calco: `
        <svg viewBox="0 0 240 180" class="joke-svg" aria-hidden="true">
          <rect width="240" height="180" rx="8" fill="#FFFBEB"/>
          <circle cx="120" cy="78" r="44" fill="#0F172A" stroke="#F59E0B" stroke-width="4"/>
          <text x="120" y="83" text-anchor="middle" font-family="Newsreader, Georgia, serif" font-weight="700" font-size="17" fill="#FDE047">GAD3 · LP</text>
          <text x="120" y="152" text-anchor="middle" font-family="Inter, sans-serif" font-weight="800" font-size="10.5" fill="#92400E">FUSILADO DEL SONDEO</text>
        </svg>`,
      otra_vez_votar: `
        <svg viewBox="0 0 240 180" class="joke-svg" aria-hidden="true">
          <rect width="240" height="180" rx="8" fill="#F1F5F9"/>
          <rect x="70" y="44" width="100" height="74" rx="6" fill="#FFFFFF" stroke="#0F172A" stroke-width="3"/>
          <rect x="94" y="54" width="52" height="7" rx="3.5" fill="#0F172A"/>
          <text x="120" y="96" text-anchor="middle" font-family="Newsreader, Georgia, serif" font-weight="700" font-size="20" fill="#DC2626">¿OTRA VEZ?</text>
          <text x="120" y="148" text-anchor="middle" font-family="Inter, sans-serif" font-weight="800" font-size="10.5" fill="#475569">BLOQUEO TOTAL (SIN 176)</text>
        </svg>`
    };

    return svgs[artType] || svgs.otra_vez_votar;
  }

  function showConfirmationPopup(payload) {
    const scenario = pickJokeForPrediction(payload);

    document.getElementById("confirmModalTitle").textContent = `¡Porra registrada, ${payload.nombre}!`;
    document.getElementById("confirmModalMeta").innerHTML = `
      Tu apuesta ha quedado guardada bajo el correo <strong>${escapeHtml(payload.email)}</strong>.
    `;

    const showcase = document.getElementById("jokeShowcase");
    showcase.style.borderLeftColor = scenario.accent;

    const visualContainer = document.getElementById("jokeVisual");
    const fallbackHtml = getFallbackSvg(scenario.artType, payload);

    if (scenario.imageUrl) {
      visualContainer.innerHTML = "";
      const img = document.createElement("img");
      img.src = scenario.imageUrl;
      img.alt = scenario.headline;
      img.className = "joke-photo-img";
      img.onerror = () => {
        visualContainer.innerHTML = fallbackHtml;
      };
      visualContainer.appendChild(img);
    } else {
      visualContainer.innerHTML = fallbackHtml;
    }

    const tagEl = document.getElementById("jokeTag");
    tagEl.textContent = scenario.tag;
    tagEl.style.color = scenario.accent;
    document.getElementById("jokeHeadline").textContent = scenario.headline;

    const pillsContainer = document.getElementById("confirmSummaryPills");
    pillsContainer.innerHTML = parties
      .filter(p => (payload[p.id] || 0) > 0)
      .map(p => `<span class="real-pill"><span class="legend-swatch" style="background:${p.color}"></span>${p.short}: <strong>${payload[p.id]}</strong></span>`)
      .join("");

    confirmModal.classList.remove("hidden");
  }

  function closeConfirmationPopup() {
    confirmModal.classList.add("hidden");
  }

  btnCloseConfirmModal.addEventListener("click", closeConfirmationPopup);
  btnModalAccept.addEventListener("click", closeConfirmationPopup);
  confirmModal.addEventListener("click", (e) => {
    if (e.target === confirmModal) closeConfirmationPopup();
  });

  partiesGrid.addEventListener("click", (e) => {
    const btn = e.target.closest(".step-btn");
    if (!btn || btn.disabled) return;
    const id = btn.dataset.id;
    const action = btn.dataset.action;
    if (action === "inc" && state[id] < totalSeats) state[id]++;
    if (action === "dec" && state[id] > 0) state[id]--;
    updateUI();
  });

  partiesGrid.addEventListener("input", (e) => {
    if (!e.target.classList.contains("seat-input") || e.target.disabled) return;
    const id = e.target.dataset.id;
    let val = parseInt(e.target.value, 10);
    if (isNaN(val) || val < 0) val = 0;
    if (val > totalSeats) val = totalSeats;
    state[id] = val;
    updateUI();
  });

  nameInput.addEventListener("input", updateUI);
  emailInput.addEventListener("input", updateUI);

  btnLoadPolls.addEventListener("click", () => {
    if (btnLoadPolls.disabled) return;
    parties.forEach(p => { state[p.id] = p.pollDefault; });
    updateUI();
  });

  btnReset.addEventListener("click", () => {
    if (btnReset.disabled) return;
    parties.forEach(p => { state[p.id] = 0; });
    updateUI();
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const { unlocked } = isValidIdentification();
    const sum = Object.values(state).reduce((acc, v) => acc + v, 0);
    if (!unlocked || sum !== totalSeats) return;

    const normalizedEmail = emailInput.value.trim().toLowerCase();
    const payload = {
      timestamp: new Date().toISOString(),
      nombre: nameInput.value.trim(),
      email: normalizedEmail,
      ...state
    };

    btnSubmit.disabled = true;
    btnSubmit.textContent = "Registrando pronóstico...";

    try {
      if (PORRA_CONFIG.appsScriptUrl) {
        await fetch(PORRA_CONFIG.appsScriptUrl, {
          method: "POST",
          mode: "no-cors",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      } else {
        const saved = JSON.parse(localStorage.getItem("porra29n_entries") || "[]");
        const filtered = saved.filter(item => (item.email || "").toLowerCase() !== normalizedEmail);
        filtered.push(payload);
        localStorage.setItem("porra29n_entries", JSON.stringify(filtered));
      }

      showConfirmationPopup(payload);
    } catch (err) {
      alert("Hubo un problema al conectar con Google Sheets. Revisa la URL en config.js.");
    } finally {
      btnSubmit.textContent = "Registrar mi porra del 29-N";
      updateUI();
    }
  });

  function escapeHtml(str) {
    return str.replace(/[&<>"']/g, m => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[m]));
  }

  updateUI();
});
