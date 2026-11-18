// Assets alojados en GitHub Pages: https://gorka-lp.github.io/porra-29n/
/**
 * CONFIGURACIÓN DE LA PORRA ELECTORAL 29-N (2026)
 * -------------------------------------------------------------------------
 * Candidaturas ordenadas estrictamente por los resultados oficiales del
 * Congreso de los Diputados en las Elecciones Generales del 23J de 2023.
 *
 * Referencia oficial incorporada como participante ("Encuesta GAD3 · Las Provincias"):
 * Datos del barómetro de GAD3 para Vocento / Las Provincias (9 de noviembre de 2026,
 * 1.502 entrevistas entre el 3 y el 5 de noviembre):
 * PP: 136 | PSOE: 103 | Vox: 63 | Frente Amplio: 12 | ERC: 12 | Junts: 5 |
 * EH Bildu: 8 | PNV: 4 | BNG: 2 | CCa: 1 | Podemos: 1 | Otros (Adelante Andalucía): 3
 * Suma total: 350 escaños exactos.
 */

const PORRA_CONFIG = {
  totalSeats: 350,
  // Ponlo a true la noche electoral para habilitar los enlaces a resultados.html
  resultsEnabled: false,
  majoritySeats: 176,

  // Pega aquí tu endpoint de Google Apps Script (termina en /exec)
  appsScriptUrl: "https://script.google.com/macros/s/AKfycbxK0Ao5akb9hckzM1daTfFu-dH7Y4l0FAmVlKgBKCRgl0UVe5PmtMCk2AXJVYQu0fVM/exec",

  // Pega aquí la URL CSV publicada de tu Google Sheet (termina en output=csv)
  googleSheetCsvUrl: "https://docs.google.com/spreadsheets/d/e/2PACX-1vQBwLLBiw5lrG1GcP6F6pKaOM3ylfSl-UnENdY5hbnlTocGDdKny6XtYoY5WcYDZf2s6S0T3Lny2Dqi/pub?gid=0&single=true&output=csv",

  // Participante oficial de referencia (Encuesta GAD3 - Las Provincias, 09/11/2026)
  pollBenchmark: {
    nombre: "Encuesta GAD3 · Las Provincias",
    email: "gad3@lasprovincias.es",
    isPoll: true,
    sourceLabel: "Barómetro GAD3 para Vocento / Las Provincias (09/11/2026)",
    seats: {
      PP: 136,
      PSOE: 103,
      VOX: 63,
      FA: 12,
      ERC: 12,
      JUNTS: 5,
      BILDU: 8,
      PNV: 4,
      BNG: 2,
      CCA: 1,
      PODEMOS: 1,
      COMPROMIS: 0,
      UPC: 0,
      ARAMES: 0,
      OTROS: 3
    }
  },


  // Escenarios humorísticos para el pop-up tras registrar la porra (solo titular + imagen/meme).
  // Guarda tus memes/fotos reales en la carpeta `img/` con estos nombres (o cambia `imageUrl`).
  // Si el archivo aún no existe en `img/`, se muestra automáticamente una portada gráfica editorial de respaldo.
  jokeScenarios: {
    vox_boom: {
      tag: "ESCENARIO · SUBIDÓN DE VOX (75+)",
      headline: "Alguien se ha tomado demasiado en serio lo de volver a 1955",
      imageUrl: "https://gorka-lp.github.io/porra-29n/img/vox-franco.jpg",
      accent: "#63BE21",
      artType: "vox_franco"
    },
    pp_solo: {
      tag: "ESCENARIO · MAYORÍA ABSOLUTA PP (176+)",
      headline: "¡Todos a bordo! Zarpa el yate con mayoría absoluta",
      imageUrl: "https://gorka-lp.github.io/porra-29n/img/feijoo-yate.jpg",
      accent: "#0056A3",
      artType: "feijoo_yate"
    },
    pp_vox: {
      tag: "ESCENARIO · SUMA PP + VOX (176+)",
      headline: "Se vienen cuatro años muy largos de foto de Colón",
      imageUrl: "https://gorka-lp.github.io/porra-29n/img/pp-vox-pacto.jpg",
      accent: "#1D4ED8",
      artType: "pp_vox_pacto"
    },
    psoe_solo: {
      tag: "ESCENARIO · MAYORÍA ABSOLUTA PSOE (176+)",
      headline: "¿Pero tú qué desayunas? Ni Tezanos en sus mejores sueños",
      imageUrl: "https://gorka-lp.github.io/porra-29n/img/sanchez-gafas.jpg",
      accent: "#E30613",
      artType: "sanchez_gafas"
    },
    psoe_amor: {
      tag: "ESCENARIO · REMONTADA Y GOBIERNO PROGRESISTA",
      headline: "Crees en la fuerza del amor (y en los milagros de última hora)",
      imageUrl: "https://gorka-lp.github.io/porra-29n/img/sanchez-beso.jpg",
      accent: "#DC2626",
      artType: "sanchez_beso"
    },
    bloque_izquierda: {
      tag: "ESCENARIO · MAYORÍA PLURINACIONAL JUSTA",
      headline: "Otra legislatura haciendo encaje de bolillos hasta las cuatro de la mañana",
      imageUrl: "https://gorka-lp.github.io/porra-29n/img/tetris-investidura.jpg",
      accent: "#BE185D",
      artType: "tetris_investidura"
    },
    clon_gad3: {
      tag: "ESCENARIO · CALCO DE LAS PROVINCIAS",
      headline: "Mucho periodista de investigación pero has fusilado la encuesta de GAD3",
      imageUrl: "https://gorka-lp.github.io/porra-29n/img/gad3-bola-cristal.jpg",
      accent: "#D97706",
      artType: "gad3_calco"
    },
    bloqueo_total: {
      tag: "ESCENARIO · BLOQUEO PARLAMENTARIO",
      headline: "Vete pidiendo cita en el colegio electoral para la primavera",
      imageUrl: "https://gorka-lp.github.io/porra-29n/img/otra-vez-votar.jpg",
      accent: "#475569",
      artType: "otra_vez_votar"
    }
  },

  // Ordenadas por escaños obtenidos en el 23J de 2023 (de mayor a menor)
  parties: [
    { id: "PP", name: "Partido Popular", short: "PP", color: "#0056A3", seats2023: 137, pollDefault: 136, note: "2023: 137 esc. · Incluye coalición con UPN" },
    { id: "PSOE", name: "PSOE", short: "PSOE", color: "#E30613", seats2023: 121, pollDefault: 103, note: "2023: 121 esc. · Incluye PSC en Cataluña" },
    { id: "VOX", name: "Vox", short: "VOX", color: "#63BE21", seats2023: 33, pollDefault: 63, note: "2023: 33 esc. · Candidatura nacional" },
    { id: "FA", name: "Frente Amplio", short: "F. Amplio", color: "#E51C55", seats2023: 31, pollDefault: 12, note: "2023: 31 esc. (Sumar) · IU, Comuns, Más Madrid..." },
    { id: "ERC", name: "Esquerra Republicana", short: "ERC", color: "#FFB232", seats2023: 7, pollDefault: 12, note: "2023: 7 esc. · Coalición con Podemos en Cataluña" },
    { id: "JUNTS", name: "Junts per Catalunya", short: "Junts", color: "#00C3B2", seats2023: 7, pollDefault: 5, note: "2023: 7 esc. · Cataluña" },
    { id: "BILDU", name: "EH Bildu", short: "EH Bildu", color: "#B5CF18", seats2023: 6, pollDefault: 8, note: "2023: 6 esc. · País Vasco y Navarra" },
    { id: "PNV", name: "EAJ-PNV", short: "PNV", color: "#008037", seats2023: 5, pollDefault: 4, note: "2023: 5 esc. · País Vasco y Navarra" },
    { id: "BNG", name: "Bloque Nacionalista Galego", short: "BNG", color: "#76B3DD", seats2023: 1, pollDefault: 2, note: "2023: 1 esc. · Galicia" },
    { id: "CCA", name: "Coalición Canaria", short: "CCa", color: "#FFD700", seats2023: 1, pollDefault: 1, note: "2023: 1 esc. · CCa - Municipalistas Primero Canarias" },
    { id: "PODEMOS", name: "Podemos", short: "Podemos", color: "#6B2D8F", seats2023: 0, pollDefault: 1, note: "2023: en Sumar · En solitario salvo coaliciones" },
    { id: "COMPROMIS", name: "Compromís: Front Valencià", short: "Compromís", color: "#EA5B0C", seats2023: 0, pollDefault: 0, note: "2023: en Sumar · Comunitat Valenciana" },
    { id: "UPC", name: "Unidad del Pueblo Canario", short: "U.P. Canario", color: "#9333EA", seats2023: 0, pollDefault: 0, note: "2023: sin rep. · NC-BC, Podemos, IUC, SMR" },
    { id: "ARAMES", name: "Ara Més - Front Ampli", short: "Ara Més", color: "#10B981", seats2023: 0, pollDefault: 0, note: "2023: en Sumar · Illes Balears" },
    { id: "OTROS", name: "Otros partidos", short: "Otros", color: "#64748B", seats2023: 0, pollDefault: 3, note: "2023: 0 esc. · Adelante Andalucía (3 en GAD3), SALF..." }
  ]
};
