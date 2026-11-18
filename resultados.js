document.addEventListener("DOMContentLoaded", async () => {
  const { totalSeats, parties, googleSheetCsvUrl, pollBenchmark } = PORRA_CONFIG;

  // Construimos siempre el participante oficial de la Encuesta GAD3 · Las Provincias (09/11/2026)
  const gad3Participant = {
    nombre: pollBenchmark.nombre,
    email: pollBenchmark.email,
    isPoll: true,
    sourceLabel: pollBenchmark.sourceLabel,
    ...pollBenchmark.seats
  };

  // Participantes de demostración (se muestran solo cuando aún no hay Google Sheet conectada ni envíos locales)
  const DEMO_PLAYERS = [
    { nombre: "Participante Ejemplo 1", email: "ejemplo1@empresa.es", PP: 138, PSOE: 105, VOX: 61, FA: 12, ERC: 11, JUNTS: 5, BILDU: 8, PNV: 4, BNG: 2, CCA: 1, PODEMOS: 1, COMPROMIS: 0, UPC: 0, ARAMES: 0, OTROS: 2 },
    { nombre: "Participante Ejemplo 2", email: "ejemplo2@empresa.es", PP: 131, PSOE: 110, VOX: 64, FA: 13, ERC: 10, JUNTS: 6, BILDU: 7, PNV: 4, BNG: 2, CCA: 1, PODEMOS: 1, COMPROMIS: 0, UPC: 0, ARAMES: 0, OTROS: 1 }
  ];

  // Escrutinio real inicial (en producción se lee de la fila "REAL" de Google Sheets)
  let realSeats = { ...pollBenchmark.seats };

  let entries = [];

  async function loadData() {
    const label = document.getElementById("liveDataSourceLabel");
    if (googleSheetCsvUrl) {
      try {
        const res = await fetch(googleSheetCsvUrl);
        const csvText = await res.text();
        parseCsvData(csvText);
        label.textContent = "CONECTADO EN VIVO A GOOGLE SHEETS · 29-N";
        return;
      } catch (err) {
        console.error("Error leyendo Google Sheet CSV:", err);
      }
    }

    const localSaved = JSON.parse(localStorage.getItem("porra29n_entries") || "[]");
    // Siempre incluimos a GAD3 · Las Provincias como participante oficial
    entries = localSaved.length > 0
      ? [gad3Participant, ...localSaved]
      : [gad3Participant, ...DEMO_PLAYERS];

    label.textContent = "MODO DEMOSTRACIÓN · ENCUESTA GAD3 (LAS PROVINCIAS) INTEGRADA";
  }

  function parseCsvData(csvText) {
    const rows = csvText.trim().split(/\r?\n/).map(r => r.split(","));
    const headers = rows[0].map(h => h.trim());
    const byEmail = new Map();
    const withoutEmail = [];

    // Inyectamos siempre la encuesta GAD3 · Las Provincias como participante base
    byEmail.set(gad3Participant.email.toLowerCase(), gad3Participant);

    for (let i = 1; i < rows.length; i++) {
      const cols = rows[i];
      if (!cols[0] && !cols[1]) continue;
      const obj = {};
      headers.forEach((h, idx) => {
        const val = (cols[idx] || "").trim();
        obj[h] = isNaN(val) || h === "nombre" || h === "email" || h === "timestamp" ? val : Number(val);
      });

      if (String(obj.nombre).toUpperCase() === "REAL") {
        parties.forEach(p => { realSeats[p.id] = Number(obj[p.id]) || 0; });
      } else {
        if (String(obj.nombre).toLowerCase().includes("gad3") || String(obj.nombre).toLowerCase().includes("encuesta")) {
          obj.isPoll = true;
        }
        if (obj.email) {
          byEmail.set(String(obj.email).toLowerCase(), obj);
        } else {
          withoutEmail.push(obj);
        }
      }
    }
    entries = [...byEmail.values(), ...withoutEmail];
  }

  function computeStandings() {
    return entries.map(entry => {
      let totalDiff = 0;
      let exactMatches = 0;
      const diffs = {};

      parties.forEach(p => {
        const pred = Number(entry[p.id]) || 0;
        const actual = Number(realSeats[p.id]) || 0;
        const d = Math.abs(pred - actual);
        diffs[p.id] = d;
        totalDiff += d;
        if (d === 0) exactMatches++;
      });

      return { ...entry, totalDiff, exactMatches, diffs };
    }).sort((a, b) => {
      if (a.totalDiff !== b.totalDiff) return a.totalDiff - b.totalDiff;
      return b.exactMatches - a.exactMatches;
    });
  }

  function renderRealBar() {
    const bar = document.getElementById("realStackedBar");
    const pills = document.getElementById("realPillsGrid");
    bar.innerHTML = "";
    pills.innerHTML = "";

    parties.forEach(p => {
      const val = realSeats[p.id] || 0;
      if (val > 0) {
        const seg = document.createElement("div");
        seg.className = "bar-segment";
        seg.style.width = `${(val / totalSeats) * 100}%`;
        seg.style.backgroundColor = p.color;
        seg.title = `${p.short}: ${val}`;
        bar.appendChild(seg);
      }

      const pill = document.createElement("span");
      pill.className = "real-pill";
      pill.innerHTML = `<span class="legend-swatch" style="background:${p.color}"></span>${p.short}: <strong>${val}</strong>`;
      pills.appendChild(pill);
    });
  }

  function renderSimulator() {
    const grid = document.getElementById("simInputsGrid");
    grid.innerHTML = "";
    parties.forEach(p => {
      const div = document.createElement("div");
      div.className = "sim-item";
      div.innerHTML = `
        <label><span class="legend-swatch" style="background:${p.color}"></span>${p.short}</label>
        <input type="number" min="0" max="350" value="${realSeats[p.id]}" data-sim-id="${p.id}" />
      `;
      grid.appendChild(div);
    });
    updateSimIndicator();
  }

  function updateSimIndicator() {
    const sum = Object.values(realSeats).reduce((a, b) => a + b, 0);
    const ind = document.getElementById("simTotalIndicator");
    ind.textContent = `Suma: ${sum} / 350`;
    ind.className = sum === 350 ? "badge-ok" : "badge-warn";
  }

  function renderAll() {
    renderRealBar();
    const standings = computeStandings();
    const humanPlayers = standings.filter(s => !s.isPoll);
    const pollEntry = standings.find(s => s.isPoll);
    const pollRank = standings.findIndex(s => s.isPoll) + 1;

    // KPIs
    if (standings.length > 0) {
      const overallLeader = standings[0];
      document.getElementById("kpiLeaderName").textContent = overallLeader.nombre;
      document.getElementById("kpiLeaderScore").textContent = `${overallLeader.totalDiff} pts de error · ${overallLeader.exactMatches} plenos`;
    }

    if (pollEntry) {
      document.getElementById("kpiPollScore").textContent = `Posición #${pollRank} (${pollEntry.totalDiff} pts)`;
      const beating = humanPlayers.filter(h => h.totalDiff < pollEntry.totalDiff).length;
      document.getElementById("kpiBeatPolls").textContent = `${beating} de ${humanPlayers.length} participantes baten a GAD3`;
    }

    document.getElementById("kpiParticipants").textContent = `${humanPlayers.length} + GAD3`;
    const maxPlenos = Math.max(0, ...standings.map(h => h.exactMatches));
    const bestPlenosNames = standings.filter(h => h.exactMatches === maxPlenos).map(h => h.nombre).slice(0, 2).join(", ");
    document.getElementById("kpiExactHits").textContent = maxPlenos > 0 ? `Récord plenos: ${maxPlenos} (${bestPlenosNames})` : "Sin plenos todavía";

    // Podium Top 3 (compitiendo todos en igualdad de condiciones, incluida GAD3 · Las Provincias)
    const podium = document.getElementById("podiumGrid");
    podium.innerHTML = "";
    standings.slice(0, 3).forEach((player, idx) => {
      const medals = ["1º PUESTO · ORO", "2º PUESTO · PLATA", "3º PUESTO · BRONCE"];
      const card = document.createElement("div");
      card.className = `podium-card rank-${idx + 1}`;
      card.innerHTML = `
        <div class="podium-rank">${medals[idx]} ${player.isPoll ? "· SONDEO" : ""}</div>
        <div class="podium-name">${escapeHtml(player.nombre)}</div>
        <div class="podium-score">${player.totalDiff} puntos de desviación</div>
        <div class="podium-meta">${player.exactMatches} resultados exactos · Clic en tabla para detalle</div>
      `;
      podium.appendChild(card);
    });

    // Tabla General (todos ordenados por puntuación, con GAD3 integrado en su puesto real)
    const head = document.getElementById("leaderboardHead");
    head.innerHTML = `
      <tr>
        <th>Pos.</th>
        <th class="col-left">Participante</th>
        <th>Error Total</th>
        <th>Plenos</th>
        ${parties.map(p => `<th title="${p.name}">${p.short}<br><span style="color:${p.color}">(${realSeats[p.id]})</span></th>`).join("")}
      </tr>
    `;

    const query = document.getElementById("searchParticipant").value.trim().toLowerCase();
    const body = document.getElementById("leaderboardBody");
    body.innerHTML = "";

    standings.forEach((row, index) => {
      const rank = index + 1;
      if (query && !row.nombre.toLowerCase().includes(query)) return;

      const tr = document.createElement("tr");
      if (row.isPoll) tr.className = "is-poll-row";

      tr.innerHTML = `
        <td><strong>#${rank}</strong></td>
        <td class="col-left">
          <strong>${escapeHtml(row.nombre)}</strong>
          ${row.isPoll ? '<span class="poll-inline-badge">ENCUESTA</span>' : ''}
        </td>
        <td><span class="score-pill">${row.totalDiff}</span></td>
        <td>${row.exactMatches}</td>
        ${parties.map(p => {
          const pred = Number(row[p.id]) || 0;
          const d = row.diffs[p.id];
          return `<td class="${d === 0 ? "diff-zero" : ""}">${pred} <span class="diff-small">(${d === 0 ? "✓" : "±" + d})</span></td>`;
        }).join("")}
      `;
      tr.addEventListener("click", () => openDetailModal(row, rank));
      body.appendChild(tr);
    });

    // Ganadores por partido (incluye también a GAD3)
    const pwGrid = document.getElementById("partyWinnersGrid");
    pwGrid.innerHTML = "";
    parties.forEach(p => {
      const minDiff = Math.min(...standings.map(h => h.diffs[p.id]));
      const winners = standings.filter(h => h.diffs[p.id] === minDiff).map(h => h.nombre);

      const card = document.createElement("div");
      card.className = "party-win-card";
      card.style.borderTopColor = p.color;
      card.innerHTML = `
        <div class="pw-header">
          <span class="pw-title">${p.short}</span>
          <span class="pw-real">Real: ${realSeats[p.id]}</span>
        </div>
        <div class="pw-winners">${winners.length ? winners.join(", ") : "—"}</div>
        <div class="pw-diff">${minDiff === 0 ? "🎯 Pleno exacto (0 desv.)" : `Mejor aproximación: ±${minDiff} esc.`}</div>
      `;
      pwGrid.appendChild(card);
    });
  }

  function openDetailModal(player, rank) {
    document.getElementById("modalName").textContent = `#${rank} · ${player.nombre} (${player.totalDiff} pts)`;
    document.getElementById("modalSub").textContent = player.isPoll
      ? player.sourceLabel
      : (player.email ? `Participación registrada con: ${player.email}` : "");

    const rowsHtml = parties.map(p => {
      const pred = Number(player[p.id]) || 0;
      const real = Number(realSeats[p.id]) || 0;
      const d = Math.abs(pred - real);
      return `
        <tr>
          <td><span class="legend-swatch" style="background:${p.color};display:inline-block;margin-right:6px;"></span><strong>${p.name}</strong></td>
          <td>${pred}</td>
          <td>${real}</td>
          <td class="${d === 0 ? "diff-zero" : ""}"><strong>${d === 0 ? "0 (Pleno)" : d}</strong></td>
        </tr>
      `;
    }).join("");

    document.getElementById("modalBody").innerHTML = `
      <table class="detail-table">
        <thead>
          <tr>
            <th>Candidatura</th>
            <th>Pronóstico</th>
            <th>Escrutinio</th>
            <th>Desviación</th>
          </tr>
        </thead>
        <tbody>${rowsHtml}</tbody>
      </table>
    `;
    document.getElementById("detailModal").classList.remove("hidden");
  }

  document.getElementById("btnCloseModal").addEventListener("click", () => {
    document.getElementById("detailModal").classList.add("hidden");
  });

  document.getElementById("detailModal").addEventListener("click", (e) => {
    if (e.target.id === "detailModal") document.getElementById("detailModal").classList.add("hidden");
  });

  document.getElementById("searchParticipant").addEventListener("input", renderAll);

  document.getElementById("btnToggleSimulator").addEventListener("click", () => {
    document.getElementById("simulatorDrawer").classList.toggle("hidden");
  });

  document.getElementById("simInputsGrid").addEventListener("input", (e) => {
    const id = e.target.dataset.simId;
    if (!id) return;
    realSeats[id] = Math.max(0, Math.min(350, parseInt(e.target.value, 10) || 0));
    updateSimIndicator();
    renderAll();
  });

  document.getElementById("btnRefreshSheet").addEventListener("click", async () => {
    await loadData();
    renderSimulator();
    renderAll();
  });

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, m => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[m]));
  }

  await loadData();
  renderSimulator();
  renderAll();
});
