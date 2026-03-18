/* -----------------------------------------------
   STATIC DATA — Łomża (GUS / BIP / 4lomza.pl)
   ----------------------------------------------- */
const CITY = {
  name: "Łomża",
  teryt: "2062011",
  year: 2025,
  population: 59263,
  budget: {
    income:    639.6,   // mln zł (Rb-27S 2025)
    expenses:  651.1,   // mln zł (Rb-28S 2025)
    deficit:   -11.5,
    invest:    50.9,
    debt:      213.6,   // mln zł (WPF / Rb-Z IV kw. 2025)
    debtRatio: 33.4     // % dochodów
  },
  demo: {
    births:       394,
    deaths:       498,
    naturalGrowth:-104,
    migBalance:   -108,
    avgAge:       43.1
  },
  labor: {
    unemployment: 6.7,
    avgSalary:    8520,   // szacunek 2025 (ok. 90-95% średniej krajowej)
    employed:     16300,
    regon:        6853,
    newFirms:     438,
    deregFirms:   343
  },
  housing: {
    newFlats:     510,
    medianPrice:  8100,   // szacunek NBP Q3 2025
    totalFlats:   26087
  },
  safety: {
    crimes:       835,
    per1000:      14.04,
    detection:    66
  },
  taxes: {
    pit_scale_1: 12,
    pit_scale_2: 32,
    cit_standard: 19,
    cit_small: 9,
    zus_full: 1600.32,
  },
  costs: {
    waste_per_person_2023: 28,
    waste_per_person_2024: 34,
    water_m3_2023: 4.20,
    water_m3_2024: 4.80,
    food_basket_2023: 150,
    food_basket_2024: 165,
    electricity_kwh_2023: 0.89,
    electricity_kwh_2024: 1.15,
  },
  // History for chart (mln zł)
  history: {
    population: [63800, 63300, 62800, 62200, 61500, 60800, 60100, 59476], // Estimated historical population
    years:    [2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024],
    income:   [310,  370,  378,  420,  380,  420,  481.7, 542.3],
    expenses: [354,  407.7,412.8,486.9,447.1,486.3,490.2, 567.5],
    result:   [-44, -37.7, -34.8, -66.9, -67.1, -66.3, -8.5, -25.2]
  },
  debtHistory: {
    // Orientacyjna ścieżka WPF do 2045 (mln zł): szczyt zadłużenia po 2025 i stopniowa spłata.
    years:  [2025, 2026, 2027, 2028, 2029, 2030, 2031, 2032, 2033, 2034, 2035, 2036, 2037, 2038, 2039, 2040, 2041, 2042, 2043, 2044, 2045],
    values: [213.6, 221.0, 228.0, 224.0, 216.0, 206.0, 196.0, 186.0, 176.0, 166.0, 156.0, 146.0, 136.0, 126.0, 116.0, 106.0, 96.0, 86.0, 76.0, 66.0, 56.0]
  }
};

/* -----------------------------------------------
   TABS
   ----------------------------------------------- */
const TAB_TITLES = {
  overview:      '01 Przegląd',
  budget:        '02 Budżet & Dług',
  demo:          '03 Demografia',
  economy:       '04 Gospodarka',
  housing:       '05 Budownictwo',
  safety:        '06 Bezpieczeństwo',
  education:     '07 Edukacja',
  taxes:         '08 Podatki i Koszty',
  invest:        '09 Inwestycje',
  api:           '10 Live API',
};
const TITLE_BASE = 'Łomża — Miasto jako Firma';

document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    const panel = document.getElementById('tab-' + btn.dataset.tab);
    panel.classList.add('active');
    history.replaceState(null, '', `#${btn.dataset.tab}`);
    const label = TAB_TITLES[btn.dataset.tab];
    document.title = label ? `${TITLE_BASE} | ${label}` : TITLE_BASE;
    // Animuj liczniki w nowo otwartej zakładce
    setTimeout(() => animateCountersInPanel(panel), 50);
  });
});

function activateTabFromHash() {
  const hash = window.location.hash.replace('#', '').trim();
  if (!hash) return;
  const targetBtn = document.querySelector(`.tab-btn[data-tab="${hash}"]`);
  const targetPanel = document.getElementById(`tab-${hash}`);
  if (!targetBtn || !targetPanel) return;
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  targetBtn.classList.add('active');
  targetPanel.classList.add('active');
  setTimeout(() => animateCountersInPanel(targetPanel), 80);
}
window.addEventListener('hashchange', activateTabFromHash);
window.addEventListener('popstate', activateTabFromHash);

let historyChartMode = 'absolute'; // 'absolute' or 'perCapita'
let historyChartType = 'combo'; // 'combo' | 'line' | 'bar'
let historyRange = { from: null, to: null };

/* -----------------------------------------------
   BUDGET HISTORY CHART
   ----------------------------------------------- */
function renderHistoryChart() {
  const el = document.getElementById('history-chart');
  if (!el) return;
  el.innerHTML = '';

  const { years, income, expenses, result, population } = CITY.history;
  if (!Array.isArray(years) || !years.length || years.length !== income.length || years.length !== expenses.length) {
    el.innerHTML = '<div class="alert-box amber">Brak danych do wykresu historii budżetu.</div>';
    return;
  }

  const minYear = Math.min(...years);
  const maxYear = Math.max(...years);
  const fromYear = historyRange.from ?? minYear;
  const toYear = historyRange.to ?? maxYear;
  const idx = years
    .map((yr, i) => ({ yr, i }))
    .filter(({ yr }) => yr >= fromYear && yr <= toYear)
    .map(({ i }) => i);
  if (!idx.length) {
    el.innerHTML = '<div class="alert-box amber">Brak danych dla wybranego zakresu lat.</div>';
    return;
  }

  const viewYears = idx.map((i) => years[i]);
  const viewIncome = idx.map((i) => income[i]);
  const viewExpenses = idx.map((i) => expenses[i]);
  const viewResult = idx.map((i) => result[i]);
  const viewPopulation = idx.map((i) => population[i]);

  let displayIncome;
  let displayExpenses;
  let displayResult;
  let unit;
  let valueFormatter;

  if (historyChartMode === 'perCapita') {
    displayIncome = viewIncome.map((val, i) => (val * 1000000) / viewPopulation[i]);
    displayExpenses = viewExpenses.map((val, i) => (val * 1000000) / viewPopulation[i]);
    displayResult = viewResult.map((val, i) => (val * 1000000) / viewPopulation[i]);
    unit = 'zł/os.';
    valueFormatter = (val) => `${Math.round(val).toLocaleString('pl-PL')} ${unit}`;
  } else {
    displayIncome = viewIncome;
    displayExpenses = viewExpenses;
    displayResult = viewResult;
    unit = 'mln zł';
    valueFormatter = (val) => `${val.toLocaleString('pl-PL', {minimumFractionDigits: 1, maximumFractionDigits: 1})} ${unit}`;
  }

  const n = viewYears.length;
  const h = 180;
  const w = Math.max(640, n * 84);
  const p = { top: 10, right: 12, bottom: 28, left: 34 };
  const seriesMin = historyChartType === 'bar' ? 0 : Math.min(0, ...displayResult);
  const seriesMax = Math.max(...displayIncome, ...displayExpenses, ...displayResult);

  const x = (i) => p.left + (i * (w - p.left - p.right)) / Math.max(1, (n - 1));
  const y = (v) => p.top + ((seriesMax - v) * (h - p.top - p.bottom)) / Math.max(1, (seriesMax - seriesMin));

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
  svg.setAttribute('preserveAspectRatio', 'none');
  svg.style.cssText = 'width:100%;height:100%;display:block;';

  [0, 0.25, 0.5, 0.75, 1].forEach((t) => {
    const gy = p.top + (h - p.top - p.bottom) * t;
    const gl = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    gl.setAttribute('x1', p.left);
    gl.setAttribute('y1', gy);
    gl.setAttribute('x2', w - p.right);
    gl.setAttribute('y2', gy);
    gl.setAttribute('stroke', 'var(--border2)');
    gl.setAttribute('stroke-width', '1');
    gl.setAttribute('stroke-dasharray', '2 3');
    svg.appendChild(gl);
  });

  const drawLine = (vals, color, label) => {
    const points = vals.map((v, i) => `${x(i)},${y(v)}`).join(' ');
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
    line.setAttribute('points', points);
    line.setAttribute('fill', 'none');
    line.setAttribute('stroke', color);
    line.setAttribute('stroke-width', '2');
    line.style.animation = 'grow 1s ease-out both';
    svg.appendChild(line);

    vals.forEach((v, i) => {
      const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      dot.setAttribute('cx', x(i));
      dot.setAttribute('cy', y(v));
      dot.setAttribute('r', '2.2');
      dot.setAttribute('fill', color);
      const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
      title.textContent = `${label} ${viewYears[i]}: ${valueFormatter(v)}`;
      dot.appendChild(title);
      svg.appendChild(dot);
    });
  };

  if (historyChartType === 'combo' || historyChartType === 'bar') {
    const slot = (w - p.left - p.right) / Math.max(1, n);
    displayIncome.forEach((v, i) => {
      const baseX = p.left + i * slot;
      const barW = Math.max(6, slot * 0.32);
      const xIncome = baseX + slot * 0.14;
      const xExpense = baseX + slot * 0.54;

      const r1 = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      r1.setAttribute('x', xIncome);
      r1.setAttribute('y', y(v));
      r1.setAttribute('width', barW);
      r1.setAttribute('height', Math.max(1, (h - p.bottom) - y(v)));
      r1.setAttribute('fill', 'var(--green)');
      const t1 = document.createElementNS('http://www.w3.org/2000/svg', 'title');
      t1.textContent = `Dochody ${viewYears[i]}: ${valueFormatter(v)}`;
      r1.appendChild(t1);
      svg.appendChild(r1);

      const ev = displayExpenses[i];
      const r2 = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      r2.setAttribute('x', xExpense);
      r2.setAttribute('y', y(ev));
      r2.setAttribute('width', barW);
      r2.setAttribute('height', Math.max(1, (h - p.bottom) - y(ev)));
      r2.setAttribute('fill', 'var(--red)');
      const t2 = document.createElementNS('http://www.w3.org/2000/svg', 'title');
      t2.textContent = `Wydatki ${viewYears[i]}: ${valueFormatter(ev)}`;
      r2.appendChild(t2);
      svg.appendChild(r2);
    });
  }

  if (historyChartType === 'combo') {
    drawLine(displayResult, 'var(--amber)', 'Wynik');
  } else if (historyChartType === 'line') {
    drawLine(displayIncome, 'var(--green)', 'Dochody');
    drawLine(displayExpenses, 'var(--red)', 'Wydatki');
    drawLine(displayResult, 'var(--amber)', 'Wynik');
  }

  viewYears.forEach((yr, i) => {
    const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    label.setAttribute('x', x(i));
    label.setAttribute('y', h - 8);
    label.setAttribute('text-anchor', 'middle');
    label.setAttribute('fill', 'var(--text2)');
    label.setAttribute('font-size', '8.5');
    label.setAttribute('font-family', 'JetBrains Mono, monospace');
    label.textContent = String(yr);
    svg.appendChild(label);
  });

  el.appendChild(svg);
}

/* -----------------------------------------------
   DEBT FORECAST CHART
   ----------------------------------------------- */
function renderDebtChart() {
  const el = document.getElementById('debt-forecast-chart');
  if (!el) return;
  el.innerHTML = '';
  const { years, values } = CITY.debtHistory;
  if (!Array.isArray(years) || !Array.isArray(values) || !years.length || years.length !== values.length) {
    el.innerHTML = '<div class="alert-box amber">Brak danych do wykresu zadłużenia.</div>';
    return;
  }
  const h = 150;
  const w = Math.max(760, years.length * 34);
  const p = { top: 12, right: 16, bottom: 24, left: 32 };
  const min = 0;
  const max = Math.max(...values) * 1.1;

  const x = (i) => p.left + (i * (w - p.left - p.right)) / (years.length - 1);
  const y = (v) => p.top + ((max - v) * (h - p.top - p.bottom)) / (max - min);

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
  svg.setAttribute('preserveAspectRatio', 'none');
  svg.style.cssText = 'width:100%;height:100%;display:block;overflow:visible;';

  // Linie pomocnicze
  [0.25, 0.5, 0.75].forEach((t) => {
    const gy = p.top + (h - p.top - p.bottom) * t;
    const gl = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    gl.setAttribute('x1', p.left);
    gl.setAttribute('y1', gy);
    gl.setAttribute('x2', w - p.right);
    gl.setAttribute('y2', gy);
    gl.setAttribute('stroke', 'var(--border2)');
    gl.setAttribute('stroke-dasharray', '2 3');
    gl.setAttribute('stroke-width', '1');
    svg.appendChild(gl);
  });

  const points = years.map((yr, i) => `${x(i)},${y(values[i])}`).join(' ');
  const line = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
  line.setAttribute('points', points);
  line.setAttribute('fill', 'none');
  line.setAttribute('stroke', 'var(--red)');
  line.setAttribute('stroke-width', '2');
  line.style.animation = 'grow 1.2s ease-out both';
  svg.appendChild(line);

  years.forEach((yr, i) => {
    const cx = x(i);
    const cy = y(values[i]);

    const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    dot.setAttribute('cx', cx);
    dot.setAttribute('cy', cy);
    dot.setAttribute('r', i === 0 || i === years.length - 1 ? '3' : '2');
    dot.setAttribute('fill', 'var(--amber)');
    svg.appendChild(dot);

    // Etykiety lat tylko co 5 lat + końce (żeby nie zaśmiecać osi)
    const showYear = i === 0 || i === years.length - 1 || yr % 5 === 0;
    if (showYear) {
      const yearLbl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      yearLbl.setAttribute('x', cx);
      yearLbl.setAttribute('y', h - 6);
      yearLbl.setAttribute('text-anchor', 'middle');
      yearLbl.setAttribute('fill', 'var(--text3)');
      yearLbl.setAttribute('font-size', '8');
      yearLbl.setAttribute('font-family', 'JetBrains Mono, monospace');
      yearLbl.textContent = String(yr);
      svg.appendChild(yearLbl);
    }
  });

  // Opis wartości skrajnych
  const firstLbl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  firstLbl.setAttribute('x', x(0));
  firstLbl.setAttribute('y', y(values[0]) - 6);
  firstLbl.setAttribute('text-anchor', 'start');
  firstLbl.setAttribute('fill', 'var(--red)');
  firstLbl.setAttribute('font-size', '8');
  firstLbl.setAttribute('font-family', 'JetBrains Mono, monospace');
  firstLbl.textContent = `${values[0].toFixed(1)}M`;
  svg.appendChild(firstLbl);

  const lastLbl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  lastLbl.setAttribute('x', x(values.length - 1));
  lastLbl.setAttribute('y', y(values[values.length - 1]) - 6);
  lastLbl.setAttribute('text-anchor', 'end');
  lastLbl.setAttribute('fill', 'var(--green)');
  lastLbl.setAttribute('font-size', '8');
  lastLbl.setAttribute('font-family', 'JetBrains Mono, monospace');
  lastLbl.textContent = `${values[values.length - 1].toFixed(1)}M`;
  svg.appendChild(lastLbl);

  el.appendChild(svg);
}

function formatPln(value) {
  return `${Math.round(value).toLocaleString('pl-PL')} zł`;
}

function renderCitizenImpact() {
  const debtPerPerson = (CITY.budget.debt * 1000000) / CITY.population;
  const deficitPerPerson = (Math.abs(CITY.budget.deficit) * 1000000) / CITY.population;
  const educationPerStudent = (283.1 * 1000000) / 11000;
  const incomePerPerson = (CITY.budget.income * 1000000) / CITY.population;

  const setText = (id, text) => {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  };

  setText('citizen-debt-per-person', formatPln(debtPerPerson));
  setText('citizen-deficit-per-person', formatPln(deficitPerPerson));
  setText('citizen-edu-per-student', formatPln(educationPerStudent));
  setText('citizen-income-per-person', formatPln(incomePerPerson));
}

function updateHistoryYearSelects() {
  const fromSel = document.getElementById('history-year-from');
  const toSel = document.getElementById('history-year-to');
  if (!fromSel || !toSel) return;
  const years = CITY.history.years;
  fromSel.innerHTML = '';
  toSel.innerHTML = '';
  years.forEach((yr) => {
    const o1 = document.createElement('option');
    const o2 = document.createElement('option');
    o1.value = String(yr);
    o2.value = String(yr);
    o1.textContent = String(yr);
    o2.textContent = String(yr);
    fromSel.appendChild(o1);
    toSel.appendChild(o2);
  });

  const minYear = Math.min(...years);
  const maxYear = Math.max(...years);
  historyRange.from = historyRange.from ?? minYear;
  historyRange.to = historyRange.to ?? maxYear;
  fromSel.value = String(historyRange.from);
  toSel.value = String(historyRange.to);
}

function updateHistoryTitle() {
  const panel = document.getElementById('history-chart-panel');
  if (!panel) return;
  const h3 = panel.querySelector('h3');
  if (!h3) return;
  const unit = historyChartMode === 'perCapita' ? 'na mieszkańca' : 'mln zł';
  const typeLabel = historyChartType === 'line' ? 'liniowy' : historyChartType === 'bar' ? 'słupkowy' : 'combo';
  h3.textContent = `Dochody vs Wydatki (${unit}, ${typeLabel})`;
}

function downloadBlob(filename, blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function exportHistoryCSV() {
  const years = CITY.history.years;
  const rows = years.map((yr, i) => {
    const income = CITY.history.income[i];
    const expenses = CITY.history.expenses[i];
    const result = CITY.history.result[i];
    const pop = CITY.history.population[i];
    return [yr, income, expenses, result, pop].join(';');
  });
  const csv = ['rok;dochody_mln;wydatki_mln;wynik_mln;populacja', ...rows].join('\n');
  downloadBlob('lomza_historia_budzetu.csv', new Blob([csv], { type: 'text/csv;charset=utf-8' }));
}

function exportChartSVG(containerId, filename) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const svg = container.querySelector('svg');
  if (!svg) return;
  const serializer = new XMLSerializer();
  const raw = serializer.serializeToString(svg);
  const blob = new Blob([raw], { type: 'image/svg+xml;charset=utf-8' });
  downloadBlob(filename, blob);
}

function exportChartPNG(containerId, filename) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const svg = container.querySelector('svg');
  if (!svg) return;

  // Pobierz wymiary z viewBox (img.width/height może zwracać 0 dla SVG bez atrybutów width/height)
  const vb = svg.viewBox.baseVal;
  const exportW = (vb && vb.width > 0) ? vb.width : (svg.getAttribute('width') ? parseInt(svg.getAttribute('width')) : 1200);
  const exportH = (vb && vb.height > 0) ? vb.height : (svg.getAttribute('height') ? parseInt(svg.getAttribute('height')) : 400);

  const serializer = new XMLSerializer();
  // Dodaj jawne atrybuty width/height do kopii SVG, żeby canvas wiedział rozmiar
  const svgClone = svg.cloneNode(true);
  svgClone.setAttribute('width', exportW);
  svgClone.setAttribute('height', exportH);
  const raw = serializer.serializeToString(svgClone);
  const blob = new Blob([raw], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const img = new Image();
  img.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = exportW;
    canvas.height = exportH;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#18202d';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, exportW, exportH);
    canvas.toBlob((pngBlob) => {
      if (pngBlob) downloadBlob(filename, pngBlob);
      URL.revokeObjectURL(url);
    }, 'image/png');
  };
  img.onerror = () => URL.revokeObjectURL(url);
  img.src = url;
}

/* -----------------------------------------------
   API & UI LOGIC
   ----------------------------------------------- */

const DEFAULT_SOURCES_CONFIG = {
  api: {
    bdlBase: 'https://bdl.stat.gov.pl/api/v1',
    unitIdLong: '206201100000',
    unitIdShort: '2062011',
    variables: [
      { id: 72305, name: 'Ludność ogółem', unit: 'os.' },
      { id: 74, name: 'Urodzenia żywe', unit: 'os.' },
      { id: 75, name: 'Zgony ogółem', unit: 'os.' },
      { id: 451, name: 'Stopa bezrobocia rej.', unit: '%' },
      { id: 60323, name: 'Dzieci w wych. przedszk.', unit: 'os.' },
      { id: 64619, name: 'Uczniowie szk. podst.', unit: 'os.' }
    ]
  },
  sources: {
    gusBdl: 'https://bdl.stat.gov.pl',
    bipLomza: 'https://www.lomza.pl/bip/',
    mf: 'https://www.gov.pl/web/finanse',
    regonApi: 'https://api.stat.gov.pl/Home/RegonApi',
    nbp: 'https://www.nbp.pl/'
  }
};

let SOURCES_CONFIG = JSON.parse(JSON.stringify(DEFAULT_SOURCES_CONFIG));

async function loadSourcesConfig() {
  try {
    const response = await fetch('./sources.config.json', { cache: 'no-store' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const externalConfig = await response.json();
    SOURCES_CONFIG = {
      ...SOURCES_CONFIG,
      ...externalConfig,
      api: { ...SOURCES_CONFIG.api, ...(externalConfig.api || {}) },
      sources: { ...SOURCES_CONFIG.sources, ...(externalConfig.sources || {}) }
    };
  } catch (err) {
    console.warn('Nie udało się wczytać sources.config.json, używam konfiguracji domyślnej.', err.message);
  }
}

// --- API Service Module ---
const apiService = {
  async getUnitInfo(unitId) {
    const bdlBase = SOURCES_CONFIG.api.bdlBase;
    const response = await fetch(
      `${bdlBase}/units/${unitId}?lang=pl&format=json`,
      { headers: { 'Accept': 'application/json' } }
    );
    if (!response.ok) throw new Error(`Błąd pobierania informacji o jednostce: HTTP ${response.status}`);
    return response.json();
  },

  async getVariableData(variableId, unitId, year = null) {
    const bdlBase = SOURCES_CONFIG.api.bdlBase;
    const yearParam = year ? `&year=${year}` : '';
    const response = await fetch(
      `${bdlBase}/data/by-variable/${variableId}?unit-id=${unitId}${yearParam}&format=json&page-size=1`,
      { headers: { 'Accept': 'application/json' } }
    );
    if (!response.ok) throw new Error(`Błąd pobierania danych dla zmiennej ${variableId}: HTTP ${response.status}`);
    return response.json();
  }
};

// --- UI Module for Live Data ---
const liveDataUI = {
  container: null,
  statusMsg: null,
  dot: null,
  label: null,

  init() {
    this.container = document.getElementById('live-data-container');
    this.statusMsg = document.getElementById('api-status-msg');
    this.dot = document.getElementById('api-dot');
    this.label = document.getElementById('api-label');
  },

  showLoading() {
    if (!this.container || !this.statusMsg) return;
    this.container.innerHTML = '<div style="color:var(--text3);display:flex;align-items:center;gap:.5rem"><div class="spinner"></div> Łączenie z BDL GUS API...</div>';
    this.statusMsg.className = 'alert-box blue';
    this.statusMsg.textContent = '⏳ Pobieranie danych z bdl.stat.gov.pl...';
    this.dot.className = 'api-dot';
    this.label.textContent = 'BDL API...';
    this.label.style.color = 'var(--text3)';
  },

  showSuccess(message) {
    if (!this.statusMsg || !this.dot || !this.label) return;
    this.dot.className = 'api-dot live';
    this.label.textContent = 'BDL LIVE';
    this.label.style.color = 'var(--green)';
    this.statusMsg.className = 'alert-box green';
    this.statusMsg.textContent = message;
  },

  showError(errorMessage) {
    if (!this.statusMsg || !this.dot || !this.label) return;
    this.dot.className = 'api-dot err';
    this.label.textContent = 'API ERROR';
    this.label.style.color = 'var(--red)';
    this.statusMsg.className = 'alert-box red';
    this.statusMsg.innerHTML = `⚠ Nie można połączyć z BDL GUS API (${errorMessage}). API może być niedostępne lub blokować zapytania (CORS).<br>Poniżej statyczne dane z GUS 2024:`;
    this.renderStaticFallback();
  },

  clearContainer() {
    if (this.container) this.container.innerHTML = '';
  },

  reset() {
    if (!this.container || !this.statusMsg) return;
    this.container.innerHTML = '<div style="color:var(--text3)">Dane zostaną załadowane po kliknięciu...</div>';
    this.statusMsg.className = 'alert-box blue';
    this.statusMsg.textContent = 'ℹ Kliknij przycisk poniżej aby pobrać dane na żywo z BDL GUS API.';
    this.dot.className = 'api-dot';
    this.label.textContent = 'BDL API...';
    this.label.style.color = 'var(--text3)';
  },

  renderUnitInfo(unitData) {
    if (!this.container) return;
    let html = '';
    html += `<div class="live-item"><span class="li-name">Nazwa jednostki</span><span class="li-val">${unitData.name || 'Łomża'}</span></div>`;
    html += `<div class="live-item"><span class="li-name">Identyfikator TERYT</span><span class="li-val">${unitData.id || '2062011'}</span></div>`;
    if (unitData.kind) html += `<div class="live-item"><span class="li-name">Typ jednostki</span><span class="li-val">${unitData.kind}</span></div>`;
    this.container.innerHTML += html;
  },

  renderVariable(variable, data, index) {
    const results = data.results?.[0]?.values;
    if (!results?.length) return;
    const last = results[results.length - 1];
    this.renderVariableValue(variable, last.val, last.year, index);
  },

  renderVariableValue(variable, value, year, index) {
    if (!this.container) return;
    this.container.innerHTML += `<div class="live-item" style="animation-delay:${index * 0.1}s">
      <span class="li-name">${variable.name}</span>
      <span style="display:flex;align-items:center;gap:.5rem">
        <span class="li-val">${value?.toLocaleString('pl-PL') ?? '—'} ${variable.unit}</span>
        <span class="li-yr">(${year ?? '—'})</span>
      </span>
    </div>`;
  },

  renderStaticFallback() {
    if (!this.container) return;
    this.container.innerHTML = `
      <div class="live-item"><span class="li-name">Ludność ogółem</span><span class="li-val" style="color:var(--amber)">59 263 os. (2025, szacunek GUS) — GUS offline</span></div>
      <div class="live-item"><span class="li-name">Urodzenia żywe</span><span class="li-val" style="color:var(--amber)">394 os. (2024)</span></div>
      <div class="live-item"><span class="li-name">Zgony ogółem</span><span class="li-val" style="color:var(--amber)">498 os. (2024)</span></div>
      <div class="live-item"><span class="li-name">Stopa bezrobocia</span><span class="li-val" style="color:var(--amber)">6,7% (szac. 2025)</span></div>
      <div class="live-item"><span class="li-name">Wynagrodzenie brutto</span><span class="li-val" style="color:var(--amber)">8 520 PLN (szac. 2025)</span></div>
    `;
  },

  updateStatus(message) {
    if (this.statusMsg) this.statusMsg.textContent = message;
  }
};

const LIVE_CACHE_KEY = 'lomza_bdl_live_cache_v1';
const LIVE_CACHE_TTL_MS = 24 * 60 * 60 * 1000;

function getFreshLiveCache() {
  try {
    const raw = localStorage.getItem(LIVE_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.savedAt || !Array.isArray(parsed?.variables)) return null;
    if (Date.now() - parsed.savedAt > LIVE_CACHE_TTL_MS) return null;
    return parsed;
  } catch {
    return null;
  }
}

function saveLiveCache(payload) {
  try {
    localStorage.setItem(LIVE_CACHE_KEY, JSON.stringify({
      savedAt: Date.now(),
      ...payload
    }));
  } catch {
    // ignore storage errors
  }
}

function validateApiResponse(data) {
  const values = data?.results?.[0]?.values;
  return Array.isArray(values) && values.length > 0;
}

async function fetchVariableWithYearFallback(variable, unitId, years = [2025, 2024]) {
  for (const year of years) {
    try {
      const data = await apiService.getVariableData(variable.id, unitId, year);
      if (!validateApiResponse(data)) {
        console.warn(`Nieprawidłowa odpowiedź API dla zmiennej ${variable.name} (${year})`);
        continue;
      }
      const values = data.results?.[0]?.values;
      if (!values?.length) continue;
      const last = values[values.length - 1];
      if (last?.val !== null && last?.val !== undefined) {
        return { value: last.val, year: last.year ?? year };
      }
    } catch {
      // try next year
    }
  }
  return null;
}

// --- Main Functions ---
async function fetchBDLData(options = {}) {
  const { silent = false, useCache = true } = options;
  const UNIT_ID = SOURCES_CONFIG.api.unitIdLong;
  const UNIT_ID_SHORT = SOURCES_CONFIG.api.unitIdShort;
  const VARIABLES = SOURCES_CONFIG.api.variables;

  if (!silent) liveDataUI.showLoading();

  if (useCache) {
    const cached = getFreshLiveCache();
    if (cached) {
      liveDataUI.showSuccess('✓ Załadowano dane BDL z cache (odświeżane raz dziennie).');
      liveDataUI.clearContainer();
      if (cached.unitData) liveDataUI.renderUnitInfo(cached.unitData);
      cached.variables.forEach((item, index) => {
        liveDataUI.renderVariableValue(item.variable, item.value, item.year, index);
      });
      liveDataUI.updateStatus(`✓ Cache BDL — ${new Date(cached.savedAt).toLocaleString('pl-PL')}`);
      return;
    }
  }

  try {
    const unitData = await apiService.getUnitInfo(UNIT_ID_SHORT);
    liveDataUI.showSuccess('✓ Połączono z BDL GUS API! Pobieranie wskaźników...');
    liveDataUI.clearContainer();
    liveDataUI.renderUnitInfo(unitData);

    const resolved = [];
    for (const [index, variable] of VARIABLES.entries()) {
      const row = await fetchVariableWithYearFallback(variable, UNIT_ID, [2025, 2024]);
      if (!row) {
        console.warn(`Brak danych 2025/2024 dla: ${variable.name}`);
        continue;
      }
      resolved.push({ variable, value: row.value, year: row.year });
      liveDataUI.renderVariableValue(variable, row.value, row.year, index);
    }
    saveLiveCache({ unitData, variables: resolved });

    liveDataUI.updateStatus(`✓ Pobrano dane live z BDL GUS — ${new Date().toLocaleTimeString('pl-PL')}`);

  } catch (err) {
    console.error("Błąd podczas pobierania danych z BDL:", err);
    liveDataUI.showError(err.message);
  }
}

function clearLiveResults() {
  liveDataUI.reset();
}

function addLastUpdateLabels() {
  const updatedAt = '2026-02-17';
  const defaultSource = 'GUS/BDL 2024 + szacunki 2025';
  const sourceMap = {
    'BDL GUS 2021': 'Glowny Urzad Statystyczny (GUS) - Bank Danych Lokalnych (BDL), 2021',
    'BDL GUS 2024': 'Glowny Urzad Statystyczny (GUS) - Bank Danych Lokalnych (BDL), 2024',
    'bdl.stat.gov.pl': 'Glowny Urzad Statystyczny (GUS) - Bank Danych Lokalnych API (bdl.stat.gov.pl)',
    'BIP / Uchwała Budżetowa': 'Biuletyn Informacji Publicznej Urzedu Miejskiego w Lomzy - Uchwala Budzetowa',
    'BIP 2025': 'Biuletyn Informacji Publicznej Urzedu Miejskiego w Lomzy, 2025',
    'BIP UM Łomża 2024': 'Biuletyn Informacji Publicznej Urzedu Miejskiego w Lomzy, 2024',
    'Dane szacunkowe': 'Dane szacunkowe (opracowanie wlasne na bazie GUS/BDL/BIP)',
    'gov.pl / ZUS 2024': 'Serwis Rzeczypospolitej Polskiej (gov.pl) oraz Zaklad Ubezpieczen Spolecznych (ZUS), 2024',
    'GUS': 'Glowny Urzad Statystyczny (GUS)',
    'GUS / RCiWN 2024': 'Glowny Urzad Statystyczny (GUS) oraz Rejestr Cen i Wartosci Nieruchomosci (RCiWN), 2024',
    'GUS 2024': 'Glowny Urzad Statystyczny (GUS), 2024',
    'GUS szacunek 2025': 'Glowny Urzad Statystyczny (GUS) - szacunek, 2025',
    'OKE Łomża 2023/2024': 'Okregowa Komisja Egzaminacyjna (OKE) w Lomzy, 2023/2024',
    'REGON 2024': 'Rejestr REGON (GUS), 2024',
    'REGON GUS 2024': 'Glowny Urzad Statystyczny (GUS) - Rejestr REGON, 2024',
    'TERYT: 2062011': 'Glowny Urzad Statystyczny (GUS) - Rejestr TERYT, jednostka 2062011',
    'WPF / Rb-Z 2025': 'Wieloletnia Prognoza Finansowa (WPF) oraz sprawozdanie Rb-Z, 2025',
    'WPF Łomża 2024': 'Wieloletnia Prognoza Finansowa Miasta Lomza, 2024'
  };
  document.querySelectorAll('.panel .src').forEach((srcEl) => {
    const base = (srcEl.textContent || '').trim() || defaultSource;
    const fullSource = sourceMap[base] || base;
    srcEl.textContent = `${fullSource} (zaktualizowano: ${updatedAt})`;
  });
}

/* -----------------------------------------------
   DYNAMIC UI ADJUSTMENTS
   ----------------------------------------------- */
function setProportionalCardHeights() {
  const incomeCard = document.querySelector('.vcard.pos');
  const expenseCard = document.querySelector('.vcard.neg');
  if (!incomeCard || !expenseCard) return;

  const incomeValue = CITY.budget.income;     // mln zł (2025)
  const expensesValue = CITY.budget.expenses; // mln zł (2025)

  const minValue = Math.min(incomeValue, expensesValue);
  const maxValue = Math.max(incomeValue, expensesValue);
  
  // To make the difference more visible, we'll set a base height for the smaller column
  // and calculate the taller one by amplifying the percentage difference.
  const baseHeight = window.innerWidth <= 780 ? 280 : 450;
  const amplificationFactor = 5; // Increase this to make the difference more dramatic.

  const percentageDifference = (maxValue - minValue) / minValue;
  const heightDifference = baseHeight * percentageDifference * amplificationFactor;

  const incomeHeight = incomeValue < expensesValue ? baseHeight : baseHeight + heightDifference;
  const expensesHeight = expensesValue < incomeValue ? baseHeight : baseHeight + heightDifference;

  // Apply heights consistently on desktop and mobile.
  incomeCard.style.height = `${incomeHeight}px`;
  expenseCard.style.height = `${expensesHeight}px`;
}

/* -----------------------------------------------
   BUSINESS CLIMATE VERDICT & COSTS
   ----------------------------------------------- */
function renderBusinessVerdict() {
    const panel = document.getElementById('business-climate-panel');
    if (!panel) return;

    const { unemployment, newFirms, deregFirms } = CITY.labor;
    const {
        waste_per_person_2023, waste_per_person_2024,
        electricity_kwh_2023, electricity_kwh_2024
    } = CITY.costs;
    const netBusinessGrowth = newFirms - deregFirms;
    const wasteIncrease = ((waste_per_person_2024 - waste_per_person_2023) / waste_per_person_2023) * 100;
    const energyIncrease = ((electricity_kwh_2024 - electricity_kwh_2023) / electricity_kwh_2023) * 100;

    let verdict = {};

    // Define thresholds
    const UNEMPLOYMENT_GOOD = 5.5, UNEMPLOYMENT_BAD = 7.0, UNEMPLOYMENT_VBAD = 8.5;
    const NET_GROWTH_GOOD = 150, NET_GROWTH_BAD = 20, NET_GROWTH_VBAD = -20;
    const COST_INCREASE_GOOD = 5, COST_INCREASE_BAD = 15;

    if (unemployment > UNEMPLOYMENT_VBAD || netBusinessGrowth < NET_GROWTH_VBAD) {
        verdict = {
            title: "Bardzo Zły",
            icon: "🔥",
            class: "verdict-vbad",
            explanation: "Warunki do prowadzenia biznesu są skrajnie niekorzystne. Wysokie bezrobocie, ujemny bilans nowo powstałych firm i drastyczne podwyżki opłat lokalnych tworzą środowisko wrogie przedsiębiorczości.",
        };
    } else if (unemployment > UNEMPLOYMENT_BAD || netBusinessGrowth < NET_GROWTH_BAD || wasteIncrease > COST_INCREASE_BAD) {
        verdict = {
            title: "Zły",
            icon: "📉",
            class: "verdict-bad",
            explanation: "Przedsiębiorcy napotykają na liczne trudności. Rosnące bezrobocie, niski przyrost nowych firm oraz gwałtownie rosnące koszty lokalne (np. wywóz śmieci) znacząco utrudniają prowadzenie biznesu.",
        };
    } else if (unemployment < UNEMPLOYMENT_GOOD && netBusinessGrowth > NET_GROWTH_GOOD && wasteIncrease < COST_INCREASE_GOOD) {
        verdict = {
            title: "Bardzo Dobry",
            icon: "🚀",
            class: "verdict-good",
            explanation: "Prowadzenie działalności w mieście jest bardzo korzystne. Niskie bezrobocie, dynamiczny przyrost nowych firm i stabilne koszty lokalne tworzą idealne warunki do rozwoju i inwestycji.",
        };
    } else { // Default to Average
        verdict = {
            title: "Średni",
            icon: "📈",
            class: "verdict-avg",
            explanation: "Warunki do prowadzenia biznesu są stabilne, ale bez wyraźnych zachęt. Poziom bezrobocia jest umiarkowany, a liczba nowych firm jest zrównoważona. Koszty lokalne rosną w przewidywalnym tempie, co pozwala na planowanie działalności.",
        };
    }

    // Populate the panel
    panel.className = `panel mb ${verdict.class}`;
    panel.innerHTML = `
        <div class="verdict-title">
            <span class="verdict-icon">${verdict.icon}</span>
            <h3>Klimat dla Biznesu: ${verdict.title}</h3>
        </div>
        <p class="verdict-explanation">${verdict.explanation}</p>
        <div class="alert-box amber" style="margin-top:.75rem">
            ⚡ Energia elektryczna: ${electricity_kwh_2023.toFixed(2).replace('.', ',')} zł/kWh (2023) → ${electricity_kwh_2024.toFixed(2).replace('.', ',')} zł/kWh (2024),
            zmiana: <strong>+${energyIncrease.toFixed(1).replace('.', ',')}%</strong>.
            Wzrost cen energii bezpośrednio podnosi koszty działalności (produkcja, usługi, handel), ogranicza marże i utrudnia planowanie inwestycji.
        </div>
    `;
}

function renderCostComparisons() {
    const {
        waste_per_person_2023, waste_per_person_2024,
        water_m3_2023, water_m3_2024,
        food_basket_2023, food_basket_2024,
        electricity_kwh_2023, electricity_kwh_2024
    } = CITY.costs;

    const createComparisonHTML = (val2023, val2024, unit) => {
        // Skala porównawcza ze wzmocnieniem różnicy:
        // 2023 jest bazą, 2024 zachowuje proporcję do 2023, ale odchylenie jest mnożone.
        const baseWidth = 46;
        const amplify = 2.4;
        const ratio = val2024 / Math.max(0.0001, val2023);
        const raw2023 = baseWidth;
        const raw2024 = baseWidth * (1 + (ratio - 1) * amplify);
        const pct2023 = Math.max(16, Math.min(95, raw2023));
        const pct2024 = Math.max(16, Math.min(95, raw2024));
        const change = ((val2024 - val2023) / val2023) * 100;
        const changeColor = change > 0 ? 'var(--red)' : 'var(--green)';
        const changePrefix = change > 0 ? '▲' : '▼';

        return `
            <div class="comp-bar-row"><div class="comp-yr">2023</div><div class="comp-track"><div class="comp-fill" style="--w:${pct2023}%;width:${pct2023}%;background:var(--text3)"></div></div><div class="comp-val">${val2023.toFixed(2).replace('.',',')} ${unit}</div></div>
            <div class="comp-bar-row"><div class="comp-yr">2024</div><div class="comp-track"><div class="comp-fill" style="--w:${pct2024}%;width:${pct2024}%;background:${changeColor}"></div></div><div class="comp-val">${val2024.toFixed(2).replace('.',',')} ${unit}</div></div>
            <div style="text-align: right; font-size: var(--fs-xs); color: ${changeColor}; margin-top: 0.25rem;">${changePrefix} ${change.toFixed(1).replace('.',',')}% (skala wzmocniona)</div>
        `;
    };

    document.getElementById('waste-cost-comparison').innerHTML = createComparisonHTML(waste_per_person_2023, waste_per_person_2024, 'zł');
    document.getElementById('water-cost-comparison').innerHTML = createComparisonHTML(water_m3_2023, water_m3_2024, 'zł');
    document.getElementById('food-cost-comparison').innerHTML = createComparisonHTML(food_basket_2023, food_basket_2024, 'zł');
    document.getElementById('electricity-cost-comparison').innerHTML = createComparisonHTML(electricity_kwh_2023, electricity_kwh_2024, 'zł/kWh');
}

/* -----------------------------------------------
   MANAGEMENT VERDICT
   ----------------------------------------------- */
function renderManagementVerdict() {
    const panel = document.getElementById('management-verdict-panel');
    if (!panel) return;

    const { income, expenses, deficit, debtRatio, invest } = CITY.budget;
    const investmentRatio = (invest / expenses) * 100;
    const deficitRatio = (deficit / income) * 100;

    let verdict = {};

    // Define thresholds
    const DEBT_AVG = 30, DEBT_BAD = 45, DEBT_VBAD = 55;
    const INVEST_GOOD = 15, INVEST_AVG = 8;
    const DEFICIT_AVG = -5, DEFICIT_BAD = -10;

    // Logic to determine verdict
    if (deficit > 0 && investmentRatio > INVEST_GOOD && debtRatio < DEBT_AVG) {
        verdict = {
            title: "Bardzo Dobre Zarządzanie",
            icon: "🏆",
            class: "verdict-good",
            explanation: "Miasto jest zarządzane wzorowo. Generuje nadwyżkę budżetową, realizuje liczne inwestycje poprawiające jakość życia, jednocześnie utrzymując bardzo niskie i bezpieczne zadłużenie. To model zrównoważonego rozwoju.",
            investments: ["Nowe parki i tereny rekreacyjne", "Modernizacja szkół i przedszkoli", "Rozbudowa infrastruktury drogowej"]
        };
    } else if (debtRatio > DEBT_VBAD || deficitRatio < DEFICIT_BAD) {
        verdict = {
            title: "Bardzo Złe Zarządzanie",
            icon: "🚨",
            class: "verdict-vbad",
            explanation: "Finanse miasta są w stanie kryzysowym. Głęboki deficyt jest finansowany długiem, który zbliża się do ustawowego limitu. Brak jest znaczących inwestycji, co grozi stagnacją i utratą płynności finansowej w przyszłości.",
            investments: ["Brak kluczowych inwestycji z powodu cięć budżetowych"]
        };
    } else if (debtRatio > DEBT_BAD || deficitRatio < DEFICIT_AVG || investmentRatio < INVEST_AVG) {
        verdict = {
            title: "Złe Zarządzanie",
            icon: "⚠️",
            class: "verdict-bad",
            explanation: "Zarządzanie miastem budzi poważne obawy. Rosnący deficyt i wysokie zadłużenie ograniczają możliwości inwestycyjne. Konieczne mogą być podwyżki podatków lub cięcia w usługach publicznych, aby ratować budżet.",
            investments: ["Ograniczone inwestycje, głównie utrzymaniowe"]
        };
    } else { // Default to Average
        verdict = {
            title: "Średnie Zarządzanie",
            icon: "📊",
            class: "verdict-avg",
            explanation: "Zarządzanie miastem jest na przeciętnym poziomie. Budżet jest z niewielkim deficytem, a kluczowe usługi są utrzymane. Realizowane są inwestycje, jednak rosnące zadłużenie i presja na wydatki wymagają ostrożności w kolejnych latach.",
            investments: ["Hala sportowa przy SP5", "Modernizacja ulic (np. Nowogrodzka)", "Inwestycje w tereny zielone"]
        };
    }

    // Populate the panel
    panel.className = `panel mb ${verdict.class}`;
    panel.innerHTML = `
        <div class="verdict-title">
            <span class="verdict-icon">${verdict.icon}</span>
            <h3>Werdykt: ${verdict.title}</h3>
        </div>
        <p class="verdict-explanation">${verdict.explanation}</p>
        <div class="alert-box blue" style="margin-bottom:1rem">
            Werdykt przygotowano na podstawie pogłębionej analizy danych budżetowych, demograficznych i gospodarczych, wspieranej narzędziami AI.
            To materiał informacyjny, nie rekomendacja polityczna.
        </div>
        <div class="alert-box amber" style="margin-bottom:1rem">
            Zalecenie obywatelskie: mieszkańcy powinni na bieżąco kontrolować działania władz miasta (BIP, sesje rady, wykonanie budżetu).
            Gdy sytuacja miasta wyraźnie się pogarsza, mieszkańcy mają prawo skorzystać z mechanizmów przewidzianych prawem, w tym referendum odwoławczego.
        </div>
        <div class="verdict-investments">
            <h4>Przykładowe inwestycje w toku:</h4>
            <ul>
                ${verdict.investments.map(item => `<li>${item}</li>`).join('')}
            </ul>
        </div>
    `;
}

/* -----------------------------------------------
   INTERSECTION OBSERVER — animate on scroll
   ----------------------------------------------- */
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.style.animationPlayState = 'running';
      io.unobserve(e.target);
    }
  });
}, { threshold: 0.05 });

document.querySelectorAll('.bar-fill, .comp-fill, .chart-bar-fill').forEach(el => {
  el.style.animationPlayState = 'paused';
  io.observe(el);
});

/* -----------------------------------------------
   LIVE POPULATION COUNTER
   Łomża traci ~212 mieszkańców rocznie (GUS trend 2017-2024).
   Symulujemy ubytek w czasie rzeczywistym od 1 stycznia 2025.
   ----------------------------------------------- */
function initLivePopulation() {
  const el = document.getElementById('live-pop-val');
  if (!el) return;

  // Punkt startowy: 59 476 (GUS 2024), ubytek ~212/rok
  const BASE_POP     = 59476;
  const LOSS_PER_YEAR = 213;        // os./rok (trend 2017–2024)
  const START_DATE   = new Date('2025-01-01T00:00:00');
  const MS_PER_YEAR  = 365.25 * 24 * 3600 * 1000;
  const MS_PER_PERSON = MS_PER_YEAR / LOSS_PER_YEAR;  // ~co ile ms ginie 1 os.

  function formatPop(n) {
    // Formatowanie z twardą spacją jako separatorem tysięcy
    return Math.round(n).toLocaleString('pl-PL').replace(/\u00a0/g, '\u00a0');
  }

  function update() {
    const elapsed = Date.now() - START_DATE.getTime();
    const lost    = elapsed / MS_PER_PERSON;
    const current = BASE_POP - lost;
    el.textContent = formatPop(current);
  }

  update();
  // Odświeżaj co 1s — przy 213 osobach / rok zmiana następuje co ~40 minut,
  // ale animacja musi "zmierzać" do kolejnej wartości płynnie
  // Robimy gęstsze odświeżanie żeby counter wyglądał żywo
  setInterval(update, 1000);
}

/* -----------------------------------------------
   SCROLL TO TOP
   ----------------------------------------------- */
function initScrollTop() {
  const btn = document.getElementById('scroll-top-btn');
  if (!btn) return;

  // Pokaż/ukryj po przewinięciu > 320px
  const onScroll = () => {
    btn.classList.toggle('visible', window.scrollY > 320);
  };
  window.addEventListener('scroll', onScroll, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* -----------------------------------------------
   COUNTER ANIMATION — niezawodna wersja
   Animuje liczniki w aktywnej zakładce od razu,
   a w pozostałych zakładkach przy ich otwarciu.
   ----------------------------------------------- */
function animateValue(el, start, end, duration, suffix = '', prefix = '') {
  const range = end - start;
  const startTime = performance.now();
  const decimals = (end.toString().split('.')[1] || '').length;

  const update = (now) => {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const currentValue = start + range * eased;

    let formattedValue;
    if (decimals > 0) {
      formattedValue = currentValue.toFixed(decimals).replace('.', ',');
    } else {
      formattedValue = Math.round(currentValue).toLocaleString('pl-PL');
    }

    el.textContent = prefix + formattedValue + suffix;
    if (progress < 1) requestAnimationFrame(update);
  };
  requestAnimationFrame(update);
}

function animateCountersInPanel(panel) {
  panel.querySelectorAll('.kpi-val[data-value], .vcard-val[data-value]').forEach(el => {
    if (el.dataset.animated) return;   // nie animuj drugi raz
    el.dataset.animated = '1';
    const end = parseFloat(el.dataset.value);
    if (isNaN(end)) return;
    animateValue(el, 0, end, 1400, el.dataset.suffix || '', el.dataset.prefix || '');
  });
}

/* -----------------------------------------------
   INIT
   ----------------------------------------------- */
window.addEventListener('DOMContentLoaded', async () => {
  await loadSourcesConfig();
  activateTabFromHash();
  liveDataUI.init();
  initLivePopulation();
  initScrollTop();
  renderHistoryChart();
  renderDebtChart();
  renderPopTrendChart();
  setProportionalCardHeights();
  renderManagementVerdict();
  renderBusinessVerdict();
  renderCostComparisons();
  addLastUpdateLabels();
  initCityCompare();
  initTaxCalc();
  initInvestments();
  window.addEventListener('resize', setProportionalCardHeights);
  fetchBDLData({ silent: true, useCache: true });

  // History chart controls
  const historyChartPanel = document.getElementById('history-chart-panel');
  if (historyChartPanel) {
    const btnAbsolute = historyChartPanel.querySelector('#chart-mode-absolute');
    const btnPerCapita = historyChartPanel.querySelector('#chart-mode-percapita');
    const btnTypeCombo = historyChartPanel.querySelector('#history-type-combo');
    const btnTypeLine = historyChartPanel.querySelector('#history-type-line');
    const btnTypeBar = historyChartPanel.querySelector('#history-type-bar');
    const yearFrom = historyChartPanel.querySelector('#history-year-from');
    const yearTo = historyChartPanel.querySelector('#history-year-to');
    const btnCsv = historyChartPanel.querySelector('#history-export-csv');
    const btnPdf = historyChartPanel.querySelector('#history-export-pdf');
    const btnPng = historyChartPanel.querySelector('#history-export-png');
    const btnSvg = historyChartPanel.querySelector('#history-export-svg');

    updateHistoryYearSelects();
    updateHistoryTitle();

    btnAbsolute.addEventListener('click', () => {
        if (historyChartMode === 'absolute') return;
        historyChartMode = 'absolute';
        btnAbsolute.classList.add('active');
        btnPerCapita.classList.remove('active');
        updateHistoryTitle();
        renderHistoryChart();
    });

    btnPerCapita.addEventListener('click', () => {
        if (historyChartMode === 'perCapita') return;
        historyChartMode = 'perCapita';
        btnPerCapita.classList.add('active');
        btnAbsolute.classList.remove('active');
        updateHistoryTitle();
        renderHistoryChart();
    });

    btnTypeCombo?.addEventListener('click', () => {
      historyChartType = 'combo';
      btnTypeCombo.classList.add('active');
      btnTypeLine.classList.remove('active');
      btnTypeBar.classList.remove('active');
      updateHistoryTitle();
      renderHistoryChart();
    });

    btnTypeLine?.addEventListener('click', () => {
      historyChartType = 'line';
      btnTypeLine.classList.add('active');
      btnTypeCombo.classList.remove('active');
      btnTypeBar.classList.remove('active');
      updateHistoryTitle();
      renderHistoryChart();
    });

    btnTypeBar?.addEventListener('click', () => {
      historyChartType = 'bar';
      btnTypeBar.classList.add('active');
      btnTypeCombo.classList.remove('active');
      btnTypeLine.classList.remove('active');
      updateHistoryTitle();
      renderHistoryChart();
    });

    yearFrom?.addEventListener('change', () => {
      historyRange.from = Number(yearFrom.value);
      if (historyRange.from > historyRange.to) {
        historyRange.to = historyRange.from;
        yearTo.value = String(historyRange.to);
      }
      renderHistoryChart();
    });

    yearTo?.addEventListener('change', () => {
      historyRange.to = Number(yearTo.value);
      if (historyRange.to < historyRange.from) {
        historyRange.from = historyRange.to;
        yearFrom.value = String(historyRange.from);
      }
      renderHistoryChart();
    });

    btnCsv?.addEventListener('click', exportHistoryCSV);
    btnPdf?.addEventListener('click', () => window.print());
    btnPng?.addEventListener('click', () => exportChartPNG('history-chart', 'historia-budzetu.png'));
    btnSvg?.addEventListener('click', () => exportChartSVG('history-chart', 'historia-budzetu.svg'));
  }

  document.getElementById('debt-export-png')?.addEventListener('click', () => {
    exportChartPNG('debt-forecast-chart', 'prognoza-zadluzenia.png');
  });
  document.getElementById('debt-export-svg')?.addEventListener('click', () => {
    exportChartSVG('debt-forecast-chart', 'prognoza-zadluzenia.svg');
  });

  // Theme Toggle
  const contrastToggle = document.getElementById('contrast-toggle');
  if (contrastToggle) {
      const storedTheme = localStorage.getItem('themeMode') || 'dark';
      document.body.classList.toggle('light-mode', storedTheme === 'light');
      contrastToggle.title = storedTheme === 'light' ? 'Przełącz na tryb ciemny' : 'Przełącz na tryb jasny';
      contrastToggle.textContent = storedTheme === 'light' ? '☀' : '◐';

      contrastToggle.addEventListener('click', () => {
          const isLight = document.body.classList.toggle('light-mode');
          localStorage.setItem('themeMode', isLight ? 'light' : 'dark');
          contrastToggle.title = isLight ? 'Przełącz na tryb ciemny' : 'Przełącz na tryb jasny';
          contrastToggle.textContent = isLight ? '☀' : '◐';
      });
  }

  // Share Button Logic (Web Share API)
  const shareBtn = document.getElementById('share-btn');
  if (shareBtn) {
    shareBtn.addEventListener('click', async () => {
      const shareData = {
        title: 'Łomża — Miasto jako Firma',
        text: 'Sprawdź dashboard finansowy miasta Łomża: budżet, dług, demografia i dane live!',
        url: window.location.href
      };
      try {
        if (navigator.share) {
          await navigator.share(shareData);
        } else {
          // Fallback dla urządzeń desktopowych bez obsługi Share API
          await navigator.clipboard.writeText(shareData.url);
          alert('Link do strony został skopiowany do schowka!');
        }
      } catch (err) {
        console.debug('Udostępnianie anulowane lub błąd:', err);
      }
    });
  }

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch((err) => {
      console.warn('Rejestracja service workera nie powiodła się:', err.message);
    });
  }

  // Animuj liczniki w pierwszej aktywnej zakładce
  const activePanel = document.querySelector('.tab-panel.active');
  if (activePanel) setTimeout(() => animateCountersInPanel(activePanel), 80);

  renderCitizenImpact();

  // Tooltip edge detection — tt-left/tt-right dla kart przy krawędzi ekranu
  function fixTooltipEdges() {
    document.querySelectorAll('[data-tooltip]').forEach(el => {
      el.classList.remove('tt-left', 'tt-right');
      const rect = el.getBoundingClientRect();
      const mid = rect.left + rect.width / 2;
      if (mid < 160) el.classList.add('tt-left');
      else if (mid > window.innerWidth - 160) el.classList.add('tt-right');
    });
  }
  fixTooltipEdges();
  window.addEventListener('resize', fixTooltipEdges);

  // Animate KPI values on first tab
  setTimeout(() => {
    // Re-observe after render
    document.querySelectorAll('.bar-fill, .comp-fill').forEach(el => {
      el.style.animationPlayState = 'running';
    });
  }, 100);
});

/* -----------------------------------------------
   TAX CALCULATOR
   ----------------------------------------------- */
(function () {
  function pln(v) {
    return v.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' zł';
  }

  function calcTax(revenue, costs, form, type, prefZUS) {
    // ZUS składki (2025 szacunek)
    const zusFullSocial   = 1600.32;  // bez chorobowego
    const zusPref         = 331.26;   // preferencyjny
    const zusChorobowe    = 105.21;

    const socialZUS  = prefZUS ? zusPref : zusFullSocial;
    const totalZUS   = socialZUS + zusChorobowe; // łącznie z chorobowym

    let pit = 0, cit = 0, healthContrib = 0, taxName = '';

    if (type === 'jdg') {
      const dochod = Math.max(0, revenue - costs - totalZUS);

      if (form === 'skala') {
        taxName = 'PIT skala (12%/32%)';
        // Kwota wolna ~3600 zł/rok → 300/mc
        const podstawa = Math.max(0, dochod - 300);
        if (podstawa <= 10000) {
          pit = podstawa * 0.12;
        } else {
          pit = 10000 * 0.12 + (podstawa - 10000) * 0.32;
        }
        // Składka zdrowotna: 9% dochodu (skala)
        healthContrib = dochod * 0.09;
      } else if (form === 'liniowy') {
        taxName = 'PIT liniowy (19%)';
        pit = Math.max(0, dochod) * 0.19;
        // Składka zdrowotna: 4.9% dochodu (liniowy)
        healthContrib = Math.max(381.81, dochod * 0.049);
      } else if (form === 'ryczalt9') {
        taxName = 'Ryczałt 9%';
        pit = revenue * 0.09;
        // Składka zdrowotna ryczałt: zależy od przychodu
        healthContrib = revenue <= 60000/12 ? 381.81 : revenue <= 300000/12 ? 635.35 : 1143.62;
      } else if (form === 'ryczalt12') {
        taxName = 'Ryczałt 12%';
        pit = revenue * 0.12;
        healthContrib = revenue <= 60000/12 ? 381.81 : revenue <= 300000/12 ? 635.35 : 1143.62;
      } else if (form === 'ryczalt15') {
        taxName = 'Ryczałt 15%';
        pit = revenue * 0.15;
        healthContrib = revenue <= 60000/12 ? 381.81 : revenue <= 300000/12 ? 635.35 : 1143.62;
      }

      const totalBurden = pit + healthContrib + totalZUS + costs;
      const takeHome    = revenue - totalBurden;
      const effRate     = revenue > 0 ? ((revenue - takeHome) / revenue * 100) : 0;

      return {
        type: 'JDG',
        taxName,
        rows: [
          { label: 'Przychód miesięczny',           val: pln(revenue),       cls: '' },
          { label: '– Koszty uzyskania',             val: '–' + pln(costs),   cls: 'neg' },
          { label: '– ZUS społeczne + chorobowe',    val: '–' + pln(totalZUS),cls: 'neg' },
          { label: `– ${taxName}`,                   val: '–' + pln(pit),     cls: 'neg' },
          { label: '– Składka zdrowotna (NFZ)',       val: '–' + pln(healthContrib), cls: 'neg' },
        ],
        takeHome: Math.max(0, takeHome),
        effRate
      };

    } else {
      // Spółka — CIT
      const citRate = type === 'sp_maly' ? 0.09 : 0.19;
      taxName = type === 'sp_maly' ? 'CIT 9% (mała spółka)' : 'CIT 19%';
      const dochod = Math.max(0, revenue - costs);
      cit = dochod * citRate;
      const zysk  = dochod - cit;
      // Dywidenda: 19% podatku od dywidendy
      const dywidendaTax = zysk * 0.19;
      const takeHome = zysk - dywidendaTax;
      const effRate  = revenue > 0 ? ((revenue - takeHome) / revenue * 100) : 0;

      return {
        type: 'Spółka',
        taxName,
        rows: [
          { label: 'Przychód miesięczny',      val: pln(revenue),         cls: '' },
          { label: '– Koszty uzyskania',        val: '–' + pln(costs),     cls: 'neg' },
          { label: `– ${taxName}`,              val: '–' + pln(cit),       cls: 'neg' },
          { label: 'Zysk netto spółki',         val: pln(zysk),            cls: 'amb' },
          { label: '– Podatek od dywidendy 19%',val: '–' + pln(dywidendaTax), cls: 'neg' },
        ],
        takeHome: Math.max(0, takeHome),
        effRate
      };
    }
  }

  function renderResults(result) {
    const el = document.getElementById('tax-results');
    if (!el) return;
    const rows = result.rows.map(r =>
      `<div class="tax-res-row">
        <span class="tax-res-label">${r.label}</span>
        <span class="tax-res-val ${r.cls}">${r.val}</span>
      </div>`
    ).join('');

    el.innerHTML = `
      <div class="tax-res-title">${result.type} — ${result.taxName}</div>
      ${rows}
      <div class="tax-res-divider"></div>
      <div class="tax-res-takehome">
        <span class="tax-res-takehome-label">Na rękę miesięcznie</span>
        <span class="tax-res-takehome-val">${result.takeHome.toLocaleString('pl-PL', {maximumFractionDigits: 0})} zł</span>
      </div>
      <div class="tax-res-eff">Efektywne obciążenie: ${result.effRate.toFixed(1).replace('.', ',')}% przychodu</div>
    `;
  }

  function doCalc() {
    const revenue  = parseFloat(document.getElementById('tc-revenue')?.value) || 0;
    const costs    = parseFloat(document.getElementById('tc-costs')?.value) || 0;
    const form     = document.getElementById('tc-form')?.value || 'skala';
    const type     = document.getElementById('tc-type')?.value || 'jdg';
    const prefZUS  = document.getElementById('tc-zus-preferencyjny')?.checked || false;

    const result = calcTax(revenue, costs, form, type, prefZUS);
    renderResults(result);
  }

  // Hide costs field for ryczałt (doesn't affect tax base)
  function toggleCostsVisibility() {
    const form      = document.getElementById('tc-form')?.value || '';
    const costsField = document.getElementById('tc-costs')?.closest('.tax-field');
    const type = document.getElementById('tc-type')?.value || 'jdg';
    if (costsField) {
      const isRyczalt = form.startsWith('ryczalt') && type === 'jdg';
      costsField.style.opacity = isRyczalt ? '.45' : '1';
      const info = costsField.querySelector('.ryczalt-note');
      if (isRyczalt && !info) {
        const note = document.createElement('span');
        note.className = 'ryczalt-note';
        note.style.cssText = 'font-size:.68rem;color:var(--text3);font-family:JetBrains Mono,monospace;';
        note.textContent = '(przy ryczałcie koszty nie zmniejszają podstawy)';
        costsField.appendChild(note);
      } else if (!isRyczalt && info) {
        info.remove();
      }
    }
  }

  window.addEventListener('DOMContentLoaded', () => {
    const btn    = document.getElementById('tc-calculate');
    const inputs = document.querySelectorAll('#tax-calculator-panel input, #tax-calculator-panel select');

    btn?.addEventListener('click', doCalc);

    // Real-time: recalc when user changes any field (after first manual calc)
    let hasCalculated = false;
    btn?.addEventListener('click', () => { hasCalculated = true; });
    inputs.forEach(inp => {
      inp.addEventListener('input', () => { if (hasCalculated) doCalc(); toggleCostsVisibility(); });
      inp.addEventListener('change', () => { if (hasCalculated) doCalc(); toggleCostsVisibility(); });
    });

    // Allow Enter key to trigger calc
    inputs.forEach(inp => {
      inp.addEventListener('keydown', e => { if (e.key === 'Enter') { doCalc(); hasCalculated = true; } });
    });
  });
})();

/* -----------------------------------------------
   INVESTMENTS DATA & RENDER
   ----------------------------------------------- */
const INVESTMENTS = [
  // Drogi
  { id:1,  cat:'drogi',          icon:'🛣️',  name:'Przebudowa ul. Nowogrodzkiej',           desc:'Kompleksowa modernizacja nawierzchni, chodników i oświetlenia na odcinku 1,2 km. Poprawa bezpieczeństwa pieszych.', value:'4,8 mln zł', year:'2025',    status:'realizacja', funding:'Środki własne + RFRD' },
  { id:2,  cat:'drogi',          icon:'🛣️',  name:'Remont ul. Poligonowej i Kaziańskiej',   desc:'Wymiana nawierzchni asfaltowej i przebudowa skrzyżowań, budowa chodnika jednostronnego.', value:'2,1 mln zł', year:'2025',    status:'realizacja', funding:'Środki własne' },
  { id:3,  cat:'drogi',          icon:'🛣️',  name:'Droga ekspresowa S61 — obwodnica',       desc:'Realizacja odcinka obwodnicy w ramach drogi Via Baltica. Inwestycja rządowa kluczowa dla Łomży.', value:'~180 mln zł', year:'2024',   status:'ukonczone', funding:'GDDKiA / KFD' },
  { id:4,  cat:'drogi',          icon:'🛣️',  name:'Ścieżki rowerowe — etap III',            desc:'Budowa 3,4 km nowych ścieżek rowerowych łączących osiedla z centrum. Część systemu Łomżyńskiego VeloŁomża.', value:'1,9 mln zł', year:'2025',   status:'planowane', funding:'UE — RPOWP' },
  // Sport & Rekreacja
  { id:5,  cat:'sport',          icon:'⚽',  name:'Hala sportowa przy SP nr 5',              desc:'Budowa pełnowymiarowej hali sportowej z trybunami na 200 miejsc. Zaplecze szatniowe i siłownia.', value:'12,4 mln zł', year:'2025-26', status:'realizacja', funding:'Środki własne + MEiS' },
  { id:6,  cat:'sport',          icon:'🏊',  name:'Modernizacja basenu miejskiego',           desc:'Remont infrastruktury basenu krytego: wymiana instalacji, odnowienie niecek, nowe zaplecze.', value:'3,2 mln zł', year:'2024',    status:'ukonczone', funding:'Środki własne' },
  { id:7,  cat:'sport',          icon:'🌳',  name:'Park linearny nad Łomżyczką',             desc:'Rewitalizacja terenów zielonych wzdłuż rzeki Łomżyczki. Siłownia plenerowa, alejki, oświetlenie LED.', value:'2,6 mln zł', year:'2025',    status:'realizacja', funding:'UE — POIiŚ' },
  { id:8,  cat:'sport',          icon:'⛹️', name:'Boiska wielofunkcyjne — 4 lokalizacje',   desc:'Budowa 4 boisk wielofunkcyjnych (piłka nożna, koszykówka, siatkówka) na osiedlach miejskich.', value:'1,4 mln zł', year:'2025',    status:'planowane', funding:'Fundusz Sportowy' },
  // Edukacja
  { id:9,  cat:'edukacja',       icon:'🏫',  name:'Termomodernizacja SP nr 2 i SP nr 9',     desc:'Kompleksowe ocieplenie budynków, wymiana okien i drzwi, modernizacja systemu grzewczego.', value:'5,7 mln zł', year:'2025',    status:'realizacja', funding:'UE — RPOWP + środki własne' },
  { id:10, cat:'edukacja',       icon:'💻',  name:'Pracownie cyfrowe w 6 szkołach',          desc:'Wyposażenie pracowni komputerowych w nowy sprzęt, tablice interaktywne i serwery. Program KPO.', value:'1,8 mln zł', year:'2024',    status:'ukonczone', funding:'KPO' },
  { id:11, cat:'edukacja',       icon:'🏫',  name:'Rozbudowa Przedszkola nr 12',             desc:'Dobudowa skrzydła zwiększającego pojemność o 75 miejsc. Nowy plac zabaw i sala gimnastyczna.', value:'4,1 mln zł', year:'2026',    status:'planowane', funding:'Środki własne + MEiN' },
  // Środowisko
  { id:12, cat:'srodowisko',     icon:'♻️',  name:'PSZOK — Punkt Selektywnej Zbiórki',      desc:'Modernizacja i rozbudowa punktu selektywnej zbiórki odpadów komunalnych. Nowe kontenery i system wagowy.', value:'1,2 mln zł', year:'2024',   status:'ukonczone', funding:'WFOŚiGW' },
  { id:13, cat:'srodowisko',     icon:'💧',  name:'Modernizacja sieci wodociągowej — etap V',desc:'Wymiana 4,5 km przestarzałych rur azbestowo-cementowych. Redukcja strat wody w sieci.', value:'3,4 mln zł', year:'2025',    status:'realizacja', funding:'Środki własne MPWiK' },
  { id:14, cat:'srodowisko',     icon:'🌿',  name:'Nowe nasadzenia i tereny zielone',        desc:'Posadzenie 800 drzew i 2 400 krzewów w pasach drogowych i parkach. Budżet obywatelski.', value:'0,6 mln zł', year:'2025',    status:'planowane', funding:'Środki własne' },
  { id:15, cat:'srodowisko',     icon:'☀️',  name:'Fotowoltaika na obiektach gminnych',      desc:'Instalacja paneli PV na 8 budynkach użyteczności publicznej (szkoły, UM). Łączna moc 380 kWp.', value:'2,9 mln zł', year:'2025-26', status:'realizacja', funding:'UE — RPOWP' },
  // Kultura
  { id:16, cat:'kultura',        icon:'🎭',  name:'Remont Teatru Lalki i Aktora',            desc:'Modernizacja widowni, sceny i zaplecza technicznego. Poprawa warunków akustycznych i dostępności.', value:'6,2 mln zł', year:'2025-26', status:'planowane', funding:'MKiDN + środki własne' },
  { id:17, cat:'kultura',        icon:'📚',  name:'Nowa filia MBP na Śródmieściu',           desc:'Budowa nowoczesnej filii biblioteki z coworkingiem, salą warsztatową i strefą dla dzieci.', value:'3,8 mln zł', year:'2026',    status:'planowane', funding:'Środki własne + Program Biblioteki Narodowej' },
  { id:18, cat:'kultura',        icon:'🏛️',  name:'Rewitalizacja Starego Rynku',             desc:'Odbudowa historycznego bruku, nowe oświetlenie dekoracyjne, fontanna multimedialna, mała architektura.', value:'5,1 mln zł', year:'2024',   status:'ukonczone', funding:'UE — RPOWP' },
  // Infrastruktura
  { id:19, cat:'infrastruktura', icon:'💡',  name:'Modernizacja oświetlenia — LED',          desc:'Wymiana 1 850 opraw na energooszczędne LED w całym mieście. Oszczędność ok. 42% energii.', value:'3,1 mln zł', year:'2024',    status:'ukonczone', funding:'Środki własne + EOG' },
  { id:20, cat:'infrastruktura', icon:'🔧',  name:'Cyfryzacja zarządzania ruchem',           desc:'System inteligentnego sterowania sygnalizacją świetlną. Adaptacyjne cykle, priorytety dla transportu publicznego.', value:'2,3 mln zł', year:'2025',   status:'realizacja', funding:'UE — CEF' },
  { id:21, cat:'infrastruktura', icon:'🏗️',  name:'Budowa parkingu wielopoziomowego P+R',   desc:'Parking Park & Ride przy dworcu PKS — 280 miejsc + 40 dla rowerów. Ładowarki EV.', value:'8,7 mln zł', year:'2025-26', status:'planowane', funding:'Środki własne + KFD' },
  { id:22, cat:'infrastruktura', icon:'📡',  name:'Rozbudowa sieci monitoringu CCTV',        desc:'Dodatkowe 64 kamery w centrum i osiedlach. Integracja z Centrum Zarządzania Kryzysowego.', value:'0,8 mln zł', year:'2025',    status:'realizacja', funding:'Środki własne' },
  { id:23, cat:'infrastruktura', icon:'🚌',  name:'Nowe autobusy elektryczne MZK',           desc:'Zakup 6 elektrycznych autobusów niskopodłogowych. Wymiana najstarszego taboru MZK Łomża.', value:'7,2 mln zł', year:'2025',    status:'planowane', funding:'NFOŚiGW — Zielony Transport' },
  { id:24, cat:'edukacja',       icon:'🏫',  name:'Adaptacja pomieszczeń dla uczniów ze SPE',desc:'Dostosowanie 12 szkół do potrzeb uczniów ze specjalnymi potrzebami edukacyjnymi. Windy, podjazdy, toalety.', value:'1,5 mln zł', year:'2025',   status:'realizacja', funding:'UE — RPOWP' },
];

function statusClass(s) {
  if (s === 'realizacja') return 'realizacja';
  if (s === 'ukonczone')  return 'ukonczone';
  return 'planowane';
}
function statusLabel(s) {
  if (s === 'realizacja') return '⚙ W realizacji';
  if (s === 'ukonczone')  return '✓ Ukończone';
  return '📋 Planowane';
}

function renderInvestGrid(filter) {
  const grid = document.getElementById('invest-grid');
  if (!grid) return;
  const items = filter === 'all' ? INVESTMENTS : INVESTMENTS.filter(i => i.cat === filter);
  grid.innerHTML = items.map(inv => `
    <div class="invest-card status-${inv.status}" data-cat="${inv.cat}">
      <div class="invest-card-top">
        <span class="invest-cat">${inv.icon}</span>
        <span class="invest-status ${statusClass(inv.status)}">${statusLabel(inv.status)}</span>
      </div>
      <div class="invest-name">${inv.name}</div>
      <div class="invest-desc">${inv.desc}</div>
      <div class="invest-footer">
        <span class="invest-value">${inv.value}</span>
        <span class="invest-year">${inv.year}</span>
      </div>
      <div class="invest-funding">${inv.funding}</div>
    </div>
  `).join('');

  // Animate new cards
  grid.querySelectorAll('.invest-card').forEach((el, i) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(8px)';
    setTimeout(() => {
      el.style.transition = 'opacity .25s ease, transform .25s ease';
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    }, i * 35);
  });
}

function renderInvestTimeline() {
  const el = document.getElementById('invest-timeline');
  if (!el) return;

  const byYear = {};
  INVESTMENTS.forEach(inv => {
    const y = inv.year.split('-')[0];
    if (!byYear[y]) byYear[y] = [];
    byYear[y].push(inv);
  });

  const totals = { '2024': '18,3 mln zł', '2025': '50,9 mln zł', '2026': '~24 mln zł (plan)' };

  el.innerHTML = Object.keys(byYear).sort().map(yr => {
    const chips = byYear[yr].map(inv => {
      const cls = inv.status === 'ukonczone' ? 'done' : inv.funding.includes('UE') ? 'ue' : '';
      return `<span class="invest-tl-chip ${cls}" title="${inv.value} — ${inv.funding}">${inv.icon} ${inv.name}</span>`;
    }).join('');
    return `
      <div class="invest-tl-year">
        <div class="invest-tl-label">${yr}</div>
        <div class="invest-tl-items">${chips}</div>
        <div class="invest-tl-total">${totals[yr] || ''}</div>
      </div>`;
  }).join('');
}

window.addEventListener('DOMContentLoaded', () => {
  renderInvestGrid('all');
  renderInvestTimeline();

  document.querySelectorAll('.invest-filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.invest-filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderInvestGrid(btn.dataset.filter);
    });
  });
});

/* -----------------------------------------------
   POPULATION TREND CHART
   Dane historyczne GUS 2002–2024 + prognoza 2025–2050
   ----------------------------------------------- */
(function () {

  // Dane historyczne: rok → liczba mieszkańców (GUS, BDL)
  const HIST = [
    [2002, 63890], [2003, 63500], [2004, 63200], [2005, 63050],
    [2006, 62900], [2007, 62700], [2008, 62450], [2009, 62200],
    [2010, 62050], [2011, 61950], [2012, 62000], [2013, 62100],
    [2014, 62050], [2015, 61800], [2016, 61400], [2017, 63800],
    [2018, 63300], [2019, 62800], [2020, 62200], [2021, 61500],
    [2022, 60800], [2023, 60100], [2024, 59476],
  ];

  // Prognoza GUS (trend liniowy ~−213/rok od 2025, spowolnienie do 2050)
  const PROJ = [];
  const projStart = 59263;
  const projYears = [2025,2026,2027,2028,2029,2030,2031,2032,2033,2034,
                     2035,2036,2037,2038,2039,2040,2041,2042,2043,2044,
                     2045,2046,2047,2048,2049,2050];
  const projVals  = [59263,59000,58740,58480,58180,57850,57500,57100,56700,56250,
                     55780,55300,54800,54270,53720,53150,52560,51950,51320,50680,
                     50020,49350,48670,47980,47280,46082];
  projYears.forEach((yr, i) => PROJ.push([yr, projVals[i]]));

  // Punkt graniczny — gdzie historia przechodzi w prognozę
  const BOUNDARY_YEAR = 2025;

  // Kluczowe adnotacje
  const ANNOTATIONS = [
    { year: 2002, val: 63890, label: 'Szczyt populacji',     color: 'var(--green)' },
    { year: 2017, val: 63800, label: 'Korekta spisu GUS',    color: 'var(--blue)' },
    { year: 2025, val: 59263, label: 'Dziś (szac.)',         color: 'var(--amber)' },
    { year: 2030, val: 57850, label: 'Prognoza 2030',        color: 'var(--text3)' },
    { year: 2050, val: 46082, label: 'Prognoza 2050',        color: 'var(--red)' },
  ];

  let currentView = 'all'; // 'all' | 'hist' | 'proj'

  function getViewData() {
    if (currentView === 'hist') return { points: HIST, showBoundary: false };
    if (currentView === 'proj') return { points: PROJ, showBoundary: false };
    return { points: [...HIST, ...PROJ.slice(1)], showBoundary: true };
  }

  function renderPopChart() {
    const el = document.getElementById('pop-trend-chart');
    if (!el) return;
    el.innerHTML = '';

    const { points, showBoundary } = getViewData();
    const years  = points.map(p => p[0]);
    const values = points.map(p => p[1]);

    const W   = Math.max(680, years.length * 22);
    const H   = 200;
    const pad = { top: 18, right: 20, bottom: 28, left: 46 };

    const minV = Math.min(...values) * 0.97;
    const maxV = Math.max(...values) * 1.005;

    const xScale = (i) => pad.left + (i / (points.length - 1)) * (W - pad.left - pad.right);
    const yScale = (v) => pad.top + ((maxV - v) / (maxV - minV)) * (H - pad.top - pad.bottom);

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    svg.style.cssText = 'width:100%;height:100%;display:block;overflow:visible;';

    // ── Grid lines ──────────────────────────────────────────────────
    const gridVals = [46000, 50000, 54000, 58000, 62000];
    gridVals.forEach(gv => {
      if (gv < minV || gv > maxV) return;
      const gy = yScale(gv);
      const gl = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      gl.setAttribute('x1', pad.left); gl.setAttribute('y1', gy);
      gl.setAttribute('x2', W - pad.right); gl.setAttribute('y2', gy);
      gl.setAttribute('stroke', 'var(--border)'); gl.setAttribute('stroke-dasharray', '2 3');
      gl.setAttribute('stroke-width', '1');
      svg.appendChild(gl);

      const lbl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      lbl.setAttribute('x', pad.left - 4); lbl.setAttribute('y', gy + 3.5);
      lbl.setAttribute('text-anchor', 'end'); lbl.setAttribute('fill', 'var(--text3)');
      lbl.setAttribute('font-size', '7.5'); lbl.setAttribute('font-family', 'JetBrains Mono,monospace');
      lbl.textContent = (gv / 1000).toFixed(0) + 'k';
      svg.appendChild(lbl);
    });

    // ── Vertical boundary line (historia / prognoza) ─────────────
    if (showBoundary) {
      const bIdx = points.findIndex(p => p[0] >= BOUNDARY_YEAR);
      if (bIdx >= 0) {
        const bx = xScale(bIdx);
        const vl = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        vl.setAttribute('x1', bx); vl.setAttribute('y1', pad.top);
        vl.setAttribute('x2', bx); vl.setAttribute('y2', H - pad.bottom);
        vl.setAttribute('stroke', 'var(--border2)'); vl.setAttribute('stroke-dasharray', '4 3');
        vl.setAttribute('stroke-width', '1.2');
        svg.appendChild(vl);

        // Label "PROGNOZA →"
        const tl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        tl.setAttribute('x', bx + 5); tl.setAttribute('y', pad.top + 10);
        tl.setAttribute('fill', 'var(--amber)'); tl.setAttribute('font-size', '7');
        tl.setAttribute('font-family', 'JetBrains Mono,monospace');
        tl.setAttribute('letter-spacing', '.08em');
        tl.textContent = 'PROGNOZA →';
        svg.appendChild(tl);
      }
    }

    // ── Area fill ────────────────────────────────────────────────
    // Historical area (blue)
    const histPoints = currentView === 'proj' ? [] :
      HIST.filter(p => p[0] >= years[0] && p[0] <= years[years.length - 1]);

    if (histPoints.length > 1) {
      const hi = histPoints.map((p, i) => {
        const idx = points.findIndex(pt => pt[0] === p[0]);
        return `${xScale(idx)},${yScale(p[1])}`;
      });
      const hx0 = xScale(points.findIndex(pt => pt[0] === histPoints[0][0]));
      const hxN = xScale(points.findIndex(pt => pt[0] === histPoints[histPoints.length - 1][0]));
      const areaH = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
      areaH.setAttribute('points',
        `${hx0},${H - pad.bottom} ${hi.join(' ')} ${hxN},${H - pad.bottom}`);
      areaH.setAttribute('fill', 'rgba(121,183,255,.10)');
      svg.appendChild(areaH);
    }

    // Projection area (amber)
    const projPoints = currentView === 'hist' ? [] :
      PROJ.filter(p => p[0] >= years[0] && p[0] <= years[years.length - 1]);

    if (projPoints.length > 1) {
      const pi = projPoints.map(p => {
        const idx = points.findIndex(pt => pt[0] === p[0]);
        return `${xScale(idx)},${yScale(p[1])}`;
      });
      const px0 = xScale(points.findIndex(pt => pt[0] === projPoints[0][0]));
      const pxN = xScale(points.findIndex(pt => pt[0] === projPoints[projPoints.length - 1][0]));
      const areaP = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
      areaP.setAttribute('points',
        `${px0},${H - pad.bottom} ${pi.join(' ')} ${pxN},${H - pad.bottom}`);
      areaP.setAttribute('fill', 'rgba(240,190,99,.08)');
      svg.appendChild(areaP);
    }

    // ── Lines ────────────────────────────────────────────────────
    function drawSegment(segPoints, color, dash) {
      if (segPoints.length < 2) return;
      const coords = segPoints.map((p, i) => {
        const fullIdx = points.findIndex(pt => pt[0] === p[0]);
        return `${xScale(fullIdx)},${yScale(p[1])}`;
      }).join(' ');
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
      line.setAttribute('points', coords);
      line.setAttribute('fill', 'none');
      line.setAttribute('stroke', color);
      line.setAttribute('stroke-width', '2');
      if (dash) line.setAttribute('stroke-dasharray', dash);
      line.style.animation = 'grow 1.4s ease-out both';
      svg.appendChild(line);
    }

    if (currentView === 'all') {
      drawSegment(HIST, 'var(--blue)', null);
      drawSegment(PROJ, 'var(--amber)', '5 3');
    } else if (currentView === 'hist') {
      drawSegment(HIST.filter(p => p[0] >= years[0]), 'var(--blue)', null);
    } else {
      drawSegment(PROJ, 'var(--amber)', '5 3');
    }

    // ── Dots for notable years ──────────────────────────────────
    const notableYears = new Set([2002, 2010, 2017, 2024, 2025, 2030, 2040, 2050]);
    points.forEach((p, i) => {
      if (!notableYears.has(p[0])) return;
      const isProj = p[0] > 2024;
      const cx = xScale(i);
      const cy = yScale(p[1]);
      const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      dot.setAttribute('cx', cx); dot.setAttribute('cy', cy);
      dot.setAttribute('r', p[0] === 2025 ? '4' : '3');
      dot.setAttribute('fill', isProj ? 'var(--amber)' : 'var(--blue)');
      dot.setAttribute('stroke', 'var(--bg)'); dot.setAttribute('stroke-width', '1.5');
      const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
      title.textContent = `${p[0]}: ${p[1].toLocaleString('pl-PL')} mieszkańców`;
      dot.appendChild(title);
      svg.appendChild(dot);

      // Year label on X axis
      const showLbl = [2002, 2010, 2017, 2024, 2025, 2030, 2040, 2050].includes(p[0]);
      if (showLbl) {
        const lbl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        lbl.setAttribute('x', cx); lbl.setAttribute('y', H - 6);
        lbl.setAttribute('text-anchor', 'middle'); lbl.setAttribute('fill', 'var(--text3)');
        lbl.setAttribute('font-size', '7.5'); lbl.setAttribute('font-family', 'JetBrains Mono,monospace');
        lbl.textContent = String(p[0]);
        svg.appendChild(lbl);
      }
    });

    // ── "Dziś" callout ──────────────────────────────────────────
    const todayIdx = points.findIndex(p => p[0] === 2025);
    if (todayIdx >= 0) {
      const tx = xScale(todayIdx);
      const ty = yScale(points[todayIdx][1]);
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('x', tx - 22); rect.setAttribute('y', ty - 22);
      rect.setAttribute('width', 44); rect.setAttribute('height', 14);
      rect.setAttribute('rx', '2'); rect.setAttribute('fill', 'var(--surf3)');
      rect.setAttribute('stroke', 'var(--amber)'); rect.setAttribute('stroke-width', '.8');
      svg.appendChild(rect);
      const t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      t.setAttribute('x', tx); t.setAttribute('y', ty - 12);
      t.setAttribute('text-anchor', 'middle'); t.setAttribute('fill', 'var(--amber)');
      t.setAttribute('font-size', '7'); t.setAttribute('font-family', 'JetBrains Mono,monospace');
      t.setAttribute('font-weight', '700');
      t.textContent = 'DZIŚ';
      svg.appendChild(t);
    }

    el.appendChild(svg);

    // ── Annotation chips below chart ────────────────────────────
    const annEl = document.getElementById('pop-annotations');
    if (annEl) {
      const visible = ANNOTATIONS.filter(a => years.includes(a.year));
      annEl.innerHTML = visible.map(a => {
        const base = a.year === 2024 ? HIST.find(p => p[0] === 2024)?.[1] :
                     a.year === 2002 ? 63890 : null;
        const delta = base && a.year !== 2002
          ? ` (${((a.val - 63890) / 63890 * 100).toFixed(1).replace('.', ',')}% vs 2002)` : '';
        return `<div class="pop-annotation">
          <span class="pop-annotation-year">${a.year}</span>
          <span class="pop-annotation-val" style="color:${a.color}">${a.val.toLocaleString('pl-PL')}</span>
          <span class="pop-annotation-delta" style="color:${a.color}">${a.label}${delta}</span>
        </div>`;
      }).join('');
    }
  }

  // Controls
  window.addEventListener('DOMContentLoaded', () => {
    renderPopChart();

    const btnAll  = document.getElementById('pop-view-all');
    const btnHist = document.getElementById('pop-view-hist');
    const btnProj = document.getElementById('pop-view-proj');

    function setView(view, activeBtn) {
      currentView = view;
      [btnAll, btnHist, btnProj].forEach(b => b?.classList.remove('active'));
      activeBtn?.classList.add('active');
      const titles = {
        all:  'Liczba mieszkańców — historia i prognoza GUS (2002–2050)',
        hist: 'Dane historyczne GUS (2002–2025)',
        proj: 'Prognoza GUS (2025–2050)',
      };
      const h3 = document.querySelector('#pop-trend-panel h3');
      if (h3) h3.textContent = titles[view];
      renderPopChart();
    }

    btnAll?.addEventListener('click',  () => setView('all',  btnAll));
    btnHist?.addEventListener('click', () => setView('hist', btnHist));
    btnProj?.addEventListener('click', () => setView('proj', btnProj));
  });
})();
