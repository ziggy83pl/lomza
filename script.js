/* -----------------------------------------------
   STATIC DATA — Łomża (GUS / BIP / 4lomza.pl)
   ----------------------------------------------- */
const CITY = {
  name: "Łomża",
  teryt: "2062011",
  year: 2024,
  population: 59476,
  budget: {
    income:    542.3,   // mln zł
    expenses:  567.5,
    deficit:   -25.2,
    invest:    50.9,
    debt:      201,     // ~mln zł (przekroczył 200M po kredycie 28.9M)
    debtRatio: 40.8     // % dochodów
  },
  demo: {
    births:       394,
    deaths:       498,
    naturalGrowth:-104,
    migBalance:   -268,
    avgAge:       43.1
  },
  labor: {
    unemployment: 6.7,
    avgSalary:    7890,
    employed:     16300,
    regon:        6853,
    newFirms:     438,
    deregFirms:   343
  },
  housing: {
    newFlats:     510,
    medianPrice:  7560,
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
    years:  [2022, 2023, 2024, 2025],
    values: [155,  172,  201,  213.6]
  }
};

/* -----------------------------------------------
   TABS
   ----------------------------------------------- */
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
  });
});

let historyChartMode = 'absolute'; // 'absolute' or 'perCapita'

/* -----------------------------------------------
   BUDGET HISTORY CHART
   ----------------------------------------------- */
function renderHistoryChart() {
  const el = document.getElementById('history-chart');
  if (!el) return;
  el.innerHTML = ''; // Clear previous chart

  const { years, income, expenses, result, population } = CITY.history;
  
  let displayIncome, displayExpenses, displayResult, unit, valueFormatter;

  if (historyChartMode === 'perCapita') {
    displayIncome = income.map((val, i) => (val * 1000000) / population[i]);
    displayExpenses = expenses.map((val, i) => (val * 1000000) / population[i]);
    displayResult = result.map((val, i) => (val * 1000000) / population[i]);
    unit = 'zł/os.';
    valueFormatter = (val) => `${Math.round(val).toLocaleString('pl-PL')} ${unit}`;
  } else { // absolute
    displayIncome = income;
    displayExpenses = expenses;
    displayResult = result;
    unit = 'mln zł';
    valueFormatter = (val) => `${val.toLocaleString('pl-PL', {minimumFractionDigits: 1, maximumFractionDigits: 1})} ${unit}`;
  }

  const max = Math.max(...displayIncome, ...displayExpenses);
  const h = 160; // Chart area height

  years.forEach((yr, i) => {
    const wrap = document.createElement('div');
    wrap.style.cssText = 'flex:1;display:flex;flex-direction:column;align-items:center;gap:2px;justify-content:flex-end;height:'+h+'px;';

    const pctI = displayIncome[i] / max;
    const pctE = displayExpenses[i] / max;
    const barH = (h - 22);

    // Two side-by-side bars
    const barsDiv = document.createElement('div');
    barsDiv.style.cssText = 'display:flex;gap:2px;align-items:flex-end;height:'+(barH)+'px;width:100%;justify-content:center;';

    const bI = document.createElement('div');
    bI.className = 'chart-bar-fill income';
    bI.style.cssText = `width:45%;height:${pctI*barH}px;transform-origin:bottom;animation-delay:${i*0.08}s;`;
    bI.title = `Dochody ${yr}: ${valueFormatter(displayIncome[i])}`;

    const bE = document.createElement('div');
    bE.className = 'chart-bar-fill expense';
    bE.style.cssText = `width:45%;height:${pctE*barH}px;transform-origin:bottom;animation-delay:${i*0.08+0.04}s;`;
    bE.title = `Wydatki ${yr}: ${valueFormatter(displayExpenses[i])}`;

    barsDiv.appendChild(bI);
    barsDiv.appendChild(bE);

    const lbl = document.createElement('div');
    lbl.className = 'chart-year';
    lbl.textContent = yr;
    lbl.style.cssText = 'position:absolute;bottom:0;'; // font-size is now controlled by CSS

    const outer = document.createElement('div');
    outer.style.cssText = 'flex:1;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;position:relative;height:'+h+'px;';
    outer.appendChild(barsDiv);
    outer.appendChild(lbl);
    el.appendChild(outer);
  });

  // --- Draw result line chart overlay ---
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  // Use a timeout to ensure clientWidth is calculated after render
  setTimeout(() => {
    if (el.clientWidth === 0) return; // Don't draw if chart is not visible
    svg.setAttribute('viewBox', `0 0 ${el.clientWidth} ${h}`);
  }, 0);
  svg.setAttribute('preserveAspectRatio', 'none');
  svg.style.cssText = `position:absolute; top:0; left:0; width:100%; height:${h}px; overflow:visible; pointer-events:none;`;

  const barH = h - 22;
  const points = years.map((_yr, i) => {
    const barWidth = el.clientWidth / years.length;
    const x = (i * barWidth) + (barWidth / 2);
    // Y-axis for result is inverted and mapped to the bar height scale
    // 0 on the result axis is at y = barH
    const y = barH - (displayResult[i] / max) * barH;
    return `${x},${y}`;
  }).join(' ');

  // Zero line for the result
  const zeroLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  const yZero = barH - (0 / max) * barH;
  zeroLine.setAttribute('x1', 0);
  zeroLine.setAttribute('y1', yZero);
  zeroLine.setAttribute('x2', '100%');
  zeroLine.setAttribute('y2', yZero);
  zeroLine.style.cssText = 'stroke:var(--border2); stroke-width:1; stroke-dasharray: 2, 3;';
  svg.appendChild(zeroLine);

  // Polyline for the result
  const polyline = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
  polyline.setAttribute('points', points);
  polyline.style.cssText = 'fill:none; stroke:var(--amber); stroke-width:1.5; animation: grow 1.5s ease-out both;';
  svg.appendChild(polyline);

  el.appendChild(svg);
}

/* -----------------------------------------------
   DEBT FORECAST CHART
   ----------------------------------------------- */
function renderDebtChart() {
  const el = document.getElementById('debt-forecast-chart');
  if (!el) return;
  const { years, values } = CITY.debtHistory;
  const max = Math.max(...values) * 1.1;
  const h = 120;

  years.forEach((yr, i) => {
    const pct = values[i] / max;
    const barH = h - 22;

    const outer = document.createElement('div');
    outer.style.cssText = 'flex:1;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;position:relative;height:'+h+'px;';

    const bar = document.createElement('div');
    bar.className = 'chart-bar-fill';
    bar.style.cssText = `width:70%;height:${pct*barH}px;transform-origin:bottom;animation-delay:${i*0.15}s;background:linear-gradient(180deg,#ff4060,rgba(255,64,96,.2))`;
    bar.title = `Dług ${yr}: ${values[i]} mln zł`;

    const valLbl = document.createElement('div');
    valLbl.style.cssText = 'font-family:JetBrains Mono,monospace;font-size:.48rem;color:var(--red);margin-bottom:2px;';
    valLbl.textContent = values[i]+'M';

    const lbl = document.createElement('div');
    lbl.className = 'chart-year';
    lbl.textContent = yr === 2025 ? '2025 (prog.)' : yr;
    lbl.style.cssText = 'position:absolute;bottom:0;font-size:.45rem;';

    outer.appendChild(valLbl);
    outer.appendChild(bar);
    outer.appendChild(lbl);
    el.appendChild(outer);
  });
}

/* -----------------------------------------------
   API & UI LOGIC
   ----------------------------------------------- */

// --- API Service Module ---
const apiService = {
  BDL_BASE: 'https://bdl.stat.gov.pl/api/v1',

  async getUnitInfo(unitId) {
    const response = await fetch(
      `${this.BDL_BASE}/units/${unitId}?lang=pl&format=json`,
      { headers: { 'Accept': 'application/json' } }
    );
    if (!response.ok) throw new Error(`Błąd pobierania informacji o jednostce: HTTP ${response.status}`);
    return response.json();
  },

  async getVariableData(variableId, unitId) {
    const response = await fetch(
      `${this.BDL_BASE}/data/by-variable/${variableId}?unit-id=${unitId}&format=json&page-size=1`,
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
    if (!this.container) return;
    const results = data.results?.[0]?.values;
    if (results?.length) {
      const last = results[results.length - 1];
      this.container.innerHTML += `<div class="live-item" style="animation-delay:${index * 0.1}s">
        <span class="li-name">${variable.name}</span>
        <span style="display:flex;align-items:center;gap:.5rem">
          <span class="li-val">${last.val?.toLocaleString('pl-PL') ?? '—'} ${variable.unit}</span>
          <span class="li-yr">(${last.year})</span>
        </span>
      </div>`;
    }
  },

  renderStaticFallback() {
    if (!this.container) return;
    this.container.innerHTML = `
      <div class="live-item"><span class="li-name">Ludność ogółem</span><span class="li-val" style="color:var(--amber)">59 476 os. (2024) — GUS offline</span></div>
      <div class="live-item"><span class="li-name">Urodzenia żywe</span><span class="li-val" style="color:var(--amber)">394 os. (2024)</span></div>
      <div class="live-item"><span class="li-name">Zgony ogółem</span><span class="li-val" style="color:var(--amber)">498 os. (2024)</span></div>
      <div class="live-item"><span class="li-name">Stopa bezrobocia</span><span class="li-val" style="color:var(--amber)">6,7% (2024)</span></div>
      <div class="live-item"><span class="li-name">Wynagrodzenie brutto</span><span class="li-val" style="color:var(--amber)">7 890 PLN (2024)</span></div>
    `;
  },

  updateStatus(message) {
    if (this.statusMsg) this.statusMsg.textContent = message;
  }
};

// --- Main Functions ---
async function fetchBDLData() {
  const UNIT_ID = '206201100000';
  const UNIT_ID_SHORT = '2062011';
  const VARIABLES = [
    { id: 72305, name: 'Ludność ogółem',             unit: 'os.' },
    { id: 74,    name: 'Urodzenia żywe',              unit: 'os.' },
    { id: 75,    name: 'Zgony ogółem',                unit: 'os.' },
    { id: 451,   name: 'Stopa bezrobocia rej.',       unit: '%'   },
    { id: 60323, name: 'Dzieci w wych. przedszk.',    unit: 'os.' },
    { id: 64619, name: 'Uczniowie szk. podst.',       unit: 'os.' },
  ];

  liveDataUI.showLoading();

  try {
    const unitData = await apiService.getUnitInfo(UNIT_ID_SHORT);
    liveDataUI.showSuccess('✓ Połączono z BDL GUS API! Pobieranie wskaźników...');
    liveDataUI.clearContainer();
    liveDataUI.renderUnitInfo(unitData);

    for (const [index, variable] of VARIABLES.entries()) {
      try {
        const data = await apiService.getVariableData(variable.id, UNIT_ID);
        liveDataUI.renderVariable(variable, data, index);
      } catch (e) {
        console.warn(`Nie udało się pobrać danych dla zmiennej ${variable.name}:`, e.message);
      }
    }

    liveDataUI.updateStatus(`✓ Pobrano dane live z BDL GUS — ${new Date().toLocaleTimeString('pl-PL')}`);

  } catch (err) {
    console.error("Błąd podczas pobierania danych z BDL:", err);
    liveDataUI.showError(err.message);
  }
}

function clearLiveResults() {
  liveDataUI.reset();
}

/* -----------------------------------------------
   DYNAMIC UI ADJUSTMENTS
   ----------------------------------------------- */
function setProportionalCardHeights() {
  const incomeCard = document.querySelector('.vcard.pos');
  const debtCard = document.querySelector('.vcard.neg');
  if (!incomeCard || !debtCard) return;

  // On mobile, we use a different layout, so we reset the height to auto
  if (window.innerWidth <= 780) {
    incomeCard.style.height = 'auto';
    debtCard.style.height = 'auto';
    return;
  }

  const incomeValue = CITY.budget.income;     // 542.3 mln zł
  const expensesValue = CITY.budget.expenses; // 567.5 mln zł

  const minValue = Math.min(incomeValue, expensesValue);
  const maxValue = Math.max(incomeValue, expensesValue);
  
  // To make the difference more visible, we'll set a base height for the smaller column
  // and calculate the taller one by amplifying the percentage difference.
  const baseHeight = 450; // Base height for the shorter column in pixels.
  const amplificationFactor = 5; // Increase this to make the difference more dramatic.

  const percentageDifference = (maxValue - minValue) / minValue;
  const heightDifference = baseHeight * percentageDifference * amplificationFactor;

  const incomeHeight = incomeValue < expensesValue ? baseHeight : baseHeight + heightDifference;
  const expensesHeight = expensesValue < incomeValue ? baseHeight : baseHeight + heightDifference;

  // Apply heights: income to pos card, expenses to neg card (to reflect deficit visually)
  incomeCard.style.height = `${incomeHeight}px`;
  debtCard.style.height = `${expensesHeight}px`;
}

/* -----------------------------------------------
   BUSINESS CLIMATE VERDICT & COSTS
   ----------------------------------------------- */
function renderBusinessVerdict() {
    const panel = document.getElementById('business-climate-panel');
    if (!panel) return;

    const { unemployment, newFirms, deregFirms } = CITY.labor;
    const { waste_per_person_2023, waste_per_person_2024 } = CITY.costs;
    const netBusinessGrowth = newFirms - deregFirms;
    const wasteIncrease = ((waste_per_person_2024 - waste_per_person_2023) / waste_per_person_2023) * 100;

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
    `;
}

function renderCostComparisons() {
    const { waste_per_person_2023, waste_per_person_2024, water_m3_2023, water_m3_2024, food_basket_2023, food_basket_2024 } = CITY.costs;

    const createComparisonHTML = (val2023, val2024, unit) => {
        const maxVal = Math.max(val2023, val2024) * 1.05; // Add 5% padding
        const pct2023 = (val2023 / maxVal) * 100;
        const pct2024 = (val2024 / maxVal) * 100;
        const change = ((val2024 - val2023) / val2023) * 100;
        const changeColor = change > 0 ? 'var(--red)' : 'var(--green)';
        const changePrefix = change > 0 ? '▲' : '▼';

        return `
            <div class="comp-bar-row"><div class="comp-yr">2023</div><div class="comp-track"><div class="comp-fill" style="width:${pct2023}%;background:var(--text3)"></div></div><div class="comp-val">${val2023.toFixed(2).replace('.',',')} ${unit}</div></div>
            <div class="comp-bar-row"><div class="comp-yr">2024</div><div class="comp-track"><div class="comp-fill" style="width:${pct2024}%;background:${changeColor}"></div></div><div class="comp-val">${val2024.toFixed(2).replace('.',',')} ${unit}</div></div>
            <div style="text-align: right; font-size: var(--fs-xs); color: ${changeColor}; margin-top: 0.25rem;">${changePrefix} ${change.toFixed(1).replace('.',',')}%</div>
        `;
    };

    document.getElementById('waste-cost-comparison').innerHTML = createComparisonHTML(waste_per_person_2023, waste_per_person_2024, 'zł');
    document.getElementById('water-cost-comparison').innerHTML = createComparisonHTML(water_m3_2023, water_m3_2024, 'zł');
    document.getElementById('food-cost-comparison').innerHTML = createComparisonHTML(food_basket_2023, food_basket_2024, 'zł');
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
   COUNTER ANIMATION on load
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

const counterObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      const end = parseFloat(el.dataset.value);
      const suffix = el.dataset.suffix || '';
      const prefix = el.dataset.prefix || '';
      
      animateValue(el, 0, end, 1500, suffix, prefix);
      observer.unobserve(el);
    }
  });
}, { threshold: 0.5 });

/* -----------------------------------------------
   INIT
   ----------------------------------------------- */
window.addEventListener('DOMContentLoaded', () => {
  liveDataUI.init();
  renderHistoryChart(); // Initial render
  renderDebtChart();
  setProportionalCardHeights();
  renderManagementVerdict();
  renderBusinessVerdict();
  renderCostComparisons();
  window.addEventListener('resize', setProportionalCardHeights);

  // Chart mode toggle logic
  const historyChartPanel = document.getElementById('history-chart-panel');
  if (historyChartPanel) {
    const btnAbsolute = historyChartPanel.querySelector('#chart-mode-absolute');
    const btnPerCapita = historyChartPanel.querySelector('#chart-mode-percapita');
    const chartTitle = historyChartPanel.querySelector('h3');

    btnAbsolute.addEventListener('click', () => {
        if (historyChartMode === 'absolute') return;
        historyChartMode = 'absolute';
        btnAbsolute.classList.add('active');
        btnPerCapita.classList.remove('active');
        chartTitle.textContent = 'Dochody vs Wydatki (mln zł)';
        renderHistoryChart();
    });

    btnPerCapita.addEventListener('click', () => {
        if (historyChartMode === 'perCapita') return;
        historyChartMode = 'perCapita';
        btnPerCapita.classList.add('active');
        btnAbsolute.classList.remove('active');
        chartTitle.textContent = 'Dochody vs Wydatki (na mieszkańca)';
        renderHistoryChart();
    });
  }

  // Accessibility Toggle
  const contrastToggle = document.getElementById('contrast-toggle');
  if (contrastToggle) {
      // Check for saved preference in localStorage
      if (localStorage.getItem('highContrast') === 'true') {
          document.body.classList.add('high-contrast');
      }

      contrastToggle.addEventListener('click', () => {
          document.body.classList.toggle('high-contrast');
          localStorage.setItem('highContrast', document.body.classList.contains('high-contrast'));
      });
  }

  // Animate KPI values with counters
  document.querySelectorAll('.kpi-val[data-value], .vcard-val[data-value]').forEach(el => {
    counterObserver.observe(el);
  });

  // Animate KPI values on first tab
  setTimeout(() => {
    // Re-observe after render
    document.querySelectorAll('.bar-fill, .comp-fill').forEach(el => {
      el.style.animationPlayState = 'running';
    });
  }, 100);
});