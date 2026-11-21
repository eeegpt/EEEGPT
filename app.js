/* =========================================================
   EEEGPT MAIN APPLICATION LOGIC (app.js - Part 1/2)
========================================================= */

const $ = id => document.getElementById(id);

const standardMethods = [
  ['conduitConcealed', 'PVC Conduit — Concealed in Wall/Ceiling'],
  ['conduitSurface', 'Surface Conduit / GI Pipe'],
  ['trunking', 'Cable Trunking / Channel'],
  ['tray', 'Cable Tray / Ladder Rack'],
  ['clipped', 'Direct on Wall / Clipped'],
  ['trench', 'Underground Trench / Duct']
];

function populateInstall() {
  const job = $('job') ? $('job').value : 'machine';
  const isHeavyLT = ['transformer', 'generator'].includes(job);
  let list;

  if (isHeavyLT) {
    list = [
      ['trench', 'Underground Trench / Duct (LT Feeder)'],
      ['tray', 'Cable Tray / Heavy Ladder Rack']
    ];
  } else if (job === 'final') {
    list = [
      ['conduitConcealed', 'PVC Conduit — Concealed in Wall/Ceiling'],
      ['conduitSurface', 'Surface Conduit / GI Pipe'],
      ['trunking', 'Cable Trunking / Channel']
    ];
  } else {
    list = standardMethods;
  }

  $('install').innerHTML = list
    .map(item => `<option value="${item[0]}">${item[1]}</option>`)
    .join('');
}

function phaseChange(shouldCalculate = true) {
  const phaseVal = $('phase').value;

 if (phaseVal === '1') {
    $('voltage').value = 230;
    $('cablePf').value = 0.85;
  } else if (phaseVal === '3') {
    $('voltage').value = 400;
    $('cablePf').value = 0.85;
  } else {
    $('cablePf').value = 1;
  }

  if (shouldCalculate) {
    calculateCable();
  }
}

function jobChange() {
  const job = $('job').value;

  if (job === 'transformer') {
    $('unit').value = 'kva';
    $('load').value = 500;
    $('equipment').value = 'Transformer';
    $('phase').value = '3';
    $('equipmentWrap').classList.add('hidden');
  } else if (job === 'generator') {
    $('unit').value = 'kva';
    $('load').value = 200;
    $('equipment').value = 'Generator';
    $('phase').value = '3';
    $('equipmentWrap').classList.add('hidden');
  } else if (job === 'final') {
    $('unit').value = 'w';
    $('load').value = 20;
    $('equipment').value = 'Light / Fan';
    $('phase').value = '1';
    $('equipmentWrap').classList.remove('hidden');
  } else {
    $('unit').value = 'kw';
    $('load').value = 15;
    $('equipment').value = 'Production Machine';
    $('phase').value = '3';
    $('equipmentWrap').classList.remove('hidden');
  }

  phaseChange(false);

  if (job === 'transformer' || job === 'generator') {
    $('cablePf').value = 0.8;
  } else if (job === 'final') {
    $('cablePf').value = 1;
  } else {
    $('cablePf').value = 0.85;
  }

  populateInstall();
  calculateCable();
}

/* =========================================================
   POWER CONVERTER
========================================================= */

const C = [
  {
    id: 'kwamp',
    label: 'kW → Amp',
    unit: 'A',
    formula: () => P === 3
      ? 'I = P × 1000 / (√3 × V × PF × η)'
      : 'I = P × 1000 / (V × PF × η)',
    calculate: x => {
      const factor = P === 3 ? Math.sqrt(3) : 1;
      return (x * 1000) / (factor * V * PF * EFF);
    }
  },
  {
    id: 'kww',
    label: 'kW → Watt',
    unit: 'W',
    formula: () => 'W = kW × 1000',
    calculate: x => x * 1000
  },
  {
    id: 'kwh',
    label: 'kW → HP',
    unit: 'HP',
    formula: () => 'HP = kW × 1000 / 745.7',
    calculate: x => (x * 1000) / 745.7
  },
  {
    id: 'aw',
    label: 'Amp → Watt',
    unit: 'W',
    formula: () => P === 3
      ? 'P = √3 × V × I × PF × η'
      : 'P = V × I × PF × η',
    calculate: x => {
      const factor = P === 3 ? Math.sqrt(3) : 1;
      return factor * V * x * PF * EFF;
    }
  },
  {
    id: 'ah',
    label: 'Amp → HP',
    unit: 'HP',
    formula: () => P === 3
      ? 'HP = √3 × V × I × PF × η / 745.7'
      : 'HP = V × I × PF × η / 745.7',
    calculate: x => {
      const factor = P === 3 ? Math.sqrt(3) : 1;
      return (factor * V * x * PF * EFF) / 745.7;
    }
  },
  {
    id: 'ak',
    label: 'Amp → kW',
    unit: 'kW',
    formula: () => P === 3
      ? 'kW = √3 × V × I × PF × η / 1000'
      : 'kW = V × I × PF × η / 1000',
    calculate: x => {
      const factor = P === 3 ? Math.sqrt(3) : 1;
      return (factor * V * x * PF * EFF) / 1000;
    }
  },
  {
    id: 'wk',
    label: 'Watt → kW',
    unit: 'kW',
    formula: () => 'kW = W / 1000',
    calculate: x => x / 1000
  },
  {
    id: 'wa',
    label: 'Watt → Amp',
    unit: 'A',
    formula: () => P === 3
      ? 'I = P / (√3 × V × PF × η)'
      : 'I = P / (V × PF × η)',
    calculate: x => {
      const factor = P === 3 ? Math.sqrt(3) : 1;
      return x / (factor * V * PF * EFF);
    }
  },
  {
    id: 'wh',
    label: 'Watt → HP',
    unit: 'HP',
    formula: () => 'HP = W / 745.7',
    calculate: x => x / 745.7
  },
  {
    id: 'hk',
    label: 'HP → kW',
    unit: 'kW',
    formula: () => 'kW = HP × 0.7457',
    calculate: x => x * 0.7457
  },
  {
    id: 'hw',
    label: 'HP → Watt',
    unit: 'W',
    formula: () => 'W = HP × 745.7',
    calculate: x => x * 745.7
  },
  {
    id: 'ha',
    label: 'HP → Amp',
    unit: 'A',
    formula: () => P === 3
      ? 'I = HP × 745.7 / (√3 × V × PF × η)'
      : 'I = HP × 745.7 / (V × PF × η)',
    calculate: x => {
      const factor = P === 3 ? Math.sqrt(3) : 1;
      return (x * 745.7) / (factor * V * PF * EFF);
    }
  }
];

let P = 1;
let V = 230;
let PF = 0.85;
let EFF = 0.90;

function customEFF() {
  const input = document.getElementById('eff');
  const value = Number(input.value);

  if (input.value.trim() === '' || !Number.isFinite(value) || value <= 0 || value > 1) {
    document.getElementById('res').textContent = 'η must be > 0 and ≤ 1';
    return;
  }

  EFF = value;
  calc();
}

const s = document.getElementById('conv');
if (s) {
  C.forEach(c => {
    const option = document.createElement('option');
    option.value = c.id;
    option.textContent = c.label;
    s.appendChild(option);
  });
}

function phase(n) {
  P = n;
  V = n === 3 ? 415 : 230;
  PF = 0.85;

  document.getElementById('three').classList.toggle('active', n === 3);
  document.getElementById('one').classList.toggle('active', n === 1);
  document.getElementById('volt').value = V;
  document.getElementById('pf').value = PF;

  calc();
}

function customVoltage() {
  const value = Number(document.getElementById('volt').value);
  if (!Number.isFinite(value) || value <= 0) {
    document.getElementById('res').textContent = 'Enter valid voltage';
    return;
  }
  V = value;
  calc();
}

function customPF() {
  const input = document.getElementById('pf');
  const value = Number(input.value);
  if (input.value.trim() === '' || !Number.isFinite(value) || value <= 0 || value > 1) {
    document.getElementById('res').textContent = 'PF must be > 0 and ≤ 1';
    return;
  }
  PF = value;
  calc();
}

function formatNumber(n) {
  if (!Number.isFinite(n)) return '—';
  if (n === 0) return '0';
  return n.toLocaleString('en-US', {
    maximumFractionDigits: 4,
    useGrouping: false
  });
}

function calc() {
  const c = C.find(item => item.id === s.value) || C[0];
  const input = document.getElementById('val');
  const x = Number(input.value);

  if (input.value.trim() === '' || !Number.isFinite(x)) {
    document.getElementById('res').textContent = '—';
    document.getElementById('form').textContent = c.formula();
    return;
  }

  const result = c.calculate(x);
  document.getElementById('res').textContent = `${formatNumber(result)} ${c.unit}`;
  document.getElementById('form').textContent = c.formula();
}

function showConverter() {
  hideAllPages();
  document.getElementById('converterPage').classList.add('on');

  P = 1;
  V = 230;
  PF = 0.85;
  EFF = 0.90;

  document.getElementById('volt').value = V;
  document.getElementById('pf').value = PF;
  document.getElementById('eff').value = EFF;
  document.getElementById('one').classList.add('active');
  document.getElementById('three').classList.remove('active');

  calc();
  history.pushState({ page: 'converter' }, '', '#converter');
}

/* =========================================================
   CABLE CALCULATOR: NAVIGATION, DATABASE & LOGIC
========================================================= */

function showCableCalculator() {
  hideAllPages();
  document.getElementById('cablePage').classList.add('on');
  calculateCable();
  history.pushState({ page: 'cable' }, '', '#cable');
}

function backFromCable() {
  hideAllPages();
  document.getElementById('electricalPage').classList.add('on');
  history.pushState({ page: 'electrical' }, '', '#electrical');
}

function setCableMode(mode) {
  const isSize = mode === 'size';
  const sizeDiv = document.getElementById('cableSizeMode');
  const breakerDiv = document.getElementById('cableBreakerMode');
  const sizeTab = document.getElementById('cableModeSize');
  const breakerTab = document.getElementById('cableModeBreaker');

  if (sizeDiv) sizeDiv.classList.toggle('hidden', !isSize);
  if (breakerDiv) breakerDiv.classList.toggle('hidden', isSize);
  if (sizeTab) sizeTab.classList.toggle('active', isSize);
  if (breakerTab) breakerTab.classList.toggle('active', !isSize);

  if (isSize) {
    calculateCable();
  } else {
    populateExInstall();
    calculateExistingCable();
  }
}

function populateExInstall() {
  const el = $('exInstall');
  if (!el || el.children.length > 0) return;
  el.innerHTML = standardMethods
    .map(item => `<option value="${item[0]}">${item[1]}</option>`)
    .join('');
  el.value = 'conduitConcealed';
}

function cableNumber(id) {
  const element = document.getElementById(id);
  if (!element || element.value.trim() === '') return NaN;
  return Number(element.value);
}

function cableFormat(value, digits = 2) {
  if (!Number.isFinite(value)) return '—';
  return value.toLocaleString('en-US', {
    maximumFractionDigits: digits,
    useGrouping: false
  });
}

function cableSet(id, value) {
  document.getElementById(id).textContent = value;
}

const CABLE_AMPACITY_DB = [
  // ---------- COPPER BYA: SINGLE CORE ----------
  {type:'BYA', material:'cu', cores:1, size:1, ampacity:16, derated:11, ecc:3.243},
  {type:'BYA', material:'cu', cores:1, size:1.5, ampacity:20, derated:14, ecc:3.243},
  {type:'BYA', material:'cu', cores:1, size:2.5, ampacity:28, derated:20, ecc:3.243},
  {type:'BYA', material:'cu', cores:1, size:4, ampacity:37, derated:26, ecc:4},
  {type:'BYA', material:'cu', cores:1, size:6, ampacity:47, derated:33, ecc:6},
  {type:'BYA', material:'cu', cores:1, size:10, ampacity:63, derated:44, ecc:10},
  {type:'BYA', material:'cu', cores:1, size:16, ampacity:85, derated:60, ecc:16},
  {type:'BYA', material:'cu', cores:1, size:25, ampacity:110, derated:77, ecc:16},
  {type:'BYA', material:'cu', cores:1, size:35, ampacity:136, derated:95, ecc:16},
  {type:'BYA', material:'cu', cores:1, size:50, ampacity:164, derated:130, ecc:25},
  {type:'BYA', material:'cu', cores:1, size:70, ampacity:207, derated:166, ecc:35},
  {type:'BYA', material:'cu', cores:1, size:95, ampacity:253, derated:202, ecc:50},
  {type:'BYA', material:'cu', cores:1, size:120, ampacity:291, derated:232, ecc:70},
  {type:'BYA', material:'cu', cores:1, size:150, ampacity:333, derated:266, ecc:95},
  {type:'BYA', material:'cu', cores:1, size:185, ampacity:381, derated:305, ecc:95},
  {type:'BYA', material:'cu', cores:1, size:240, ampacity:452, derated:360, ecc:120},
  {type:'BYA', material:'cu', cores:1, size:300, ampacity:526, derated:420, ecc:150},
  {type:'BYA', material:'cu', cores:1, size:400, ampacity:639, derated:511, ecc:240},
  {type:'BYA', material:'cu', cores:1, size:500, ampacity:752, derated:600, ecc:null},
  {type:'BYA', material:'cu', cores:1, size:630, ampacity:855, derated:684, ecc:null},

  // ---------- COPPER NYY: SINGLE CORE ----------
  {type:'NYY', material:'cu', cores:1, size:1.5, ampacity:22, derated:16, ecc:3.243},
  {type:'NYY', material:'cu', cores:1, size:2.5, ampacity:30, derated:21, ecc:3.243},
  {type:'NYY', material:'cu', cores:1, size:4, ampacity:39, derated:27, ecc:4},
  {type:'NYY', material:'cu', cores:1, size:6, ampacity:50, derated:35, ecc:6},
  {type:'NYY', material:'cu', cores:1, size:10, ampacity:69, derated:48, ecc:10},
  {type:'NYY', material:'cu', cores:1, size:16, ampacity:94, derated:66, ecc:16},
  {type:'NYY', material:'cu', cores:1, size:25, ampacity:125, derated:88, ecc:16},
  {type:'NYY', material:'cu', cores:1, size:35, ampacity:160, derated:112, ecc:16},
  {type:'NYY', material:'cu', cores:1, size:50, ampacity:195, derated:156, ecc:25},
  {type:'NYY', material:'cu', cores:1, size:70, ampacity:245, derated:196, ecc:35},
  {type:'NYY', material:'cu', cores:1, size:95, ampacity:300, derated:240, ecc:50},
  {type:'NYY', material:'cu', cores:1, size:120, ampacity:350, derated:280, ecc:70},
  {type:'NYY', material:'cu', cores:1, size:150, ampacity:405, derated:324, ecc:95},
  {type:'NYY', material:'cu', cores:1, size:185, ampacity:460, derated:368, ecc:95},
  {type:'NYY', material:'cu', cores:1, size:240, ampacity:555, derated:444, ecc:120},
  {type:'NYY', material:'cu', cores:1, size:300, ampacity:640, derated:512, ecc:150},
  {type:'NYY', material:'cu', cores:1, size:400, ampacity:770, derated:616, ecc:240},
  {type:'NYY', material:'cu', cores:1, size:500, ampacity:900, derated:720, ecc:null},
  {type:'NYY', material:'cu', cores:1, size:630, ampacity:1030, derated:824, ecc:null},

  // ---------- COPPER NYY: THREE CORE ----------
  {type:'NYY', material:'cu', cores:3, size:1.5, ampacity:16, derated:16, ecc:3.243},
  {type:'NYY', material:'cu', cores:3, size:2.5, ampacity:23, derated:23, ecc:3.243},
  {type:'NYY', material:'cu', cores:3, size:4, ampacity:32, derated:32, ecc:4},
  {type:'NYY', material:'cu', cores:3, size:6, ampacity:41, derated:41, ecc:6},
  {type:'NYY', material:'cu', cores:3, size:10, ampacity:56, derated:56, ecc:10},
  {type:'NYY', material:'cu', cores:3, size:16, ampacity:75, derated:75, ecc:16},
  {type:'NYY', material:'cu', cores:3, size:25, ampacity:98, derated:98, ecc:16},
  {type:'NYY', material:'cu', cores:3, size:35, ampacity:120, derated:120, ecc:16},
  {type:'NYY', material:'cu', cores:3, size:50, ampacity:150, derated:150, ecc:25},
  {type:'NYY', material:'cu', cores:3, size:70, ampacity:190, derated:190, ecc:35},
  {type:'NYY', material:'cu', cores:3, size:95, ampacity:230, derated:230, ecc:50},
  {type:'NYY', material:'cu', cores:3, size:120, ampacity:270, derated:270, ecc:70},
  {type:'NYY', material:'cu', cores:3, size:150, ampacity:305, derated:305, ecc:95},
  {type:'NYY', material:'cu', cores:3, size:185, ampacity:350, derated:350, ecc:95},
  {type:'NYY', material:'cu', cores:3, size:240, ampacity:410, derated:410, ecc:120},
  {type:'NYY', material:'cu', cores:3, size:300, ampacity:470, derated:470, ecc:150},
  {type:'NYY', material:'cu', cores:3, size:400, ampacity:530, derated:530, ecc:240},
  {type:'NYY', material:'cu', cores:3, size:500, ampacity:600, derated:600, ecc:null},
  {type:'NYY', material:'cu', cores:3, size:630, ampacity:690, derated:690, ecc:null},

  // ---------- COPPER NYY: FOUR CORE ----------
  {type:'NYY', material:'cu', cores:4, size:1.5, ampacity:16, derated:16, ecc:3.243},
  {type:'NYY', material:'cu', cores:4, size:2.5, ampacity:23, derated:23, ecc:3.243},
  {type:'NYY', material:'cu', cores:4, size:4, ampacity:32, derated:32, ecc:4},
  {type:'NYY', material:'cu', cores:4, size:6, ampacity:41, derated:41, ecc:6},
  {type:'NYY', material:'cu', cores:4, size:10, ampacity:56, derated:56, ecc:10},
  {type:'NYY', material:'cu', cores:4, size:16, ampacity:75, derated:75, ecc:16},
  {type:'NYY', material:'cu', cores:4, size:25, ampacity:98, derated:98, ecc:16},
  {type:'NYY', material:'cu', cores:4, size:35, ampacity:120, derated:120, ecc:16},
  {type:'NYY', material:'cu', cores:4, size:50, ampacity:150, derated:150, ecc:25},
  {type:'NYY', material:'cu', cores:4, size:70, ampacity:190, derated:190, ecc:35},
  {type:'NYY', material:'cu', cores:4, size:95, ampacity:230, derated:230, ecc:50},
  {type:'NYY', material:'cu', cores:4, size:120, ampacity:270, derated:270, ecc:70},
  {type:'NYY', material:'cu', cores:4, size:150, ampacity:305, derated:305, ecc:95},
  {type:'NYY', material:'cu', cores:4, size:185, ampacity:350, derated:350, ecc:95},
  {type:'NYY', material:'cu', cores:4, size:240, ampacity:410, derated:410, ecc:120},
  {type:'NYY', material:'cu', cores:4, size:300, ampacity:470, derated:470, ecc:150},

  // ---------- COPPER XLPE (2XY): SINGLE CORE ----------
  {type:'NYY', material:'cu', cores:1, insulation:'xlpe', size:1.5, ampacity:26, derated:19, ecc:1.5},
  {type:'NYY', material:'cu', cores:1, insulation:'xlpe', size:2.5, ampacity:36, derated:26, ecc:2.5},
  {type:'NYY', material:'cu', cores:1, insulation:'xlpe', size:4, ampacity:49, derated:35, ecc:4},
  {type:'NYY', material:'cu', cores:1, insulation:'xlpe', size:6, ampacity:63, derated:45, ecc:6},
  {type:'NYY', material:'cu', cores:1, insulation:'xlpe', size:10, ampacity:86, derated:62, ecc:10},
  {type:'NYY', material:'cu', cores:1, insulation:'xlpe', size:16, ampacity:115, derated:84, ecc:16},
  {type:'NYY', material:'cu', cores:1, insulation:'xlpe', size:25, ampacity:149, derated:111, ecc:16},
  {type:'NYY', material:'cu', cores:1, insulation:'xlpe', size:35, ampacity:185, derated:138, ecc:16},
  {type:'NYY', material:'cu', cores:1, insulation:'xlpe', size:50, ampacity:225, derated:168, ecc:25},
  {type:'NYY', material:'cu', cores:1, insulation:'xlpe', size:70, ampacity:289, derated:215, ecc:35},
  {type:'NYY', material:'cu', cores:1, insulation:'xlpe', size:95, ampacity:352, derated:260, ecc:50},
  {type:'NYY', material:'cu', cores:1, insulation:'xlpe', size:120, ampacity:410, derated:300, ecc:70},
  {type:'NYY', material:'cu', cores:1, insulation:'xlpe', size:150, ampacity:473, derated:344, ecc:95},
  {type:'NYY', material:'cu', cores:1, insulation:'xlpe', size:185, ampacity:542, derated:392, ecc:95},
  {type:'NYY', material:'cu', cores:1, insulation:'xlpe', size:240, ampacity:641, derated:461, ecc:120},
  {type:'NYY', material:'cu', cores:1, insulation:'xlpe', size:300, ampacity:741, derated:528, ecc:150},
  {type:'NYY', material:'cu', cores:1, insulation:'xlpe', size:400, ampacity:865, derated:607, ecc:240},

  // ---------- COPPER XLPE (2XFY): THREE CORE ----------
  {type:'NYY', material:'cu', cores:3, insulation:'xlpe', size:1.5, ampacity:21, derated:18, ecc:1.5},
  {type:'NYY', material:'cu', cores:3, insulation:'xlpe', size:2.5, ampacity:28, derated:24, ecc:2.5},
  {type:'NYY', material:'cu', cores:3, insulation:'xlpe', size:4, ampacity:38, derated:32, ecc:4},
  {type:'NYY', material:'cu', cores:3, insulation:'xlpe', size:6, ampacity:49, derated:42, ecc:6},
  {type:'NYY', material:'cu', cores:3, insulation:'xlpe', size:10, ampacity:68, derated:58, ecc:10},
  {type:'NYY', material:'cu', cores:3, insulation:'xlpe', size:16, ampacity:91, derated:77, ecc:16},
  {type:'NYY', material:'cu', cores:3, insulation:'xlpe', size:25, ampacity:120, derated:100, ecc:16},
  {type:'NYY', material:'cu', cores:3, insulation:'xlpe', size:35, ampacity:148, derated:123, ecc:16},
  {type:'NYY', material:'cu', cores:3, insulation:'xlpe', size:50, ampacity:180, derated:148, ecc:25},
  {type:'NYY', material:'cu', cores:3, insulation:'xlpe', size:70, ampacity:227, derated:186, ecc:35},
  {type:'NYY', material:'cu', cores:3, insulation:'xlpe', size:95, ampacity:278, derated:227, ecc:50},
  {type:'NYY', material:'cu', cores:3, insulation:'xlpe', size:120, ampacity:324, derated:264, ecc:70},
  {type:'NYY', material:'cu', cores:3, insulation:'xlpe', size:150, ampacity:371, derated:302, ecc:95},
  {type:'NYY', material:'cu', cores:3, insulation:'xlpe', size:185, ampacity:424, derated:345, ecc:95},
  {type:'NYY', material:'cu', cores:3, insulation:'xlpe', size:240, ampacity:500, derated:405, ecc:120},
  {type:'NYY', material:'cu', cores:3, insulation:'xlpe', size:300, ampacity:570, derated:460, ecc:150},
  {type:'NYY', material:'cu', cores:3, insulation:'xlpe', size:400, ampacity:650, derated:520, ecc:240},

  // ---------- COPPER XLPE (2XFY): FOUR CORE ----------
  {type:'NYY', material:'cu', cores:4, insulation:'xlpe', size:1.5, ampacity:21, derated:18, ecc:1.5},
  {type:'NYY', material:'cu', cores:4, insulation:'xlpe', size:2.5, ampacity:28, derated:24, ecc:2.5},
  {type:'NYY', material:'cu', cores:4, insulation:'xlpe', size:4, ampacity:38, derated:32, ecc:4},
  {type:'NYY', material:'cu', cores:4, insulation:'xlpe', size:6, ampacity:49, derated:42, ecc:6},
  {type:'NYY', material:'cu', cores:4, insulation:'xlpe', size:10, ampacity:68, derated:58, ecc:10},
  {type:'NYY', material:'cu', cores:4, insulation:'xlpe', size:16, ampacity:91, derated:77, ecc:16},
  {type:'NYY', material:'cu', cores:4, insulation:'xlpe', size:25, ampacity:120, derated:100, ecc:16},
  {type:'NYY', material:'cu', cores:4, insulation:'xlpe', size:35, ampacity:148, derated:123, ecc:16},
  {type:'NYY', material:'cu', cores:4, insulation:'xlpe', size:50, ampacity:180, derated:148, ecc:25},
  {type:'NYY', material:'cu', cores:4, insulation:'xlpe', size:70, ampacity:227, derated:186, ecc:35},
  {type:'NYY', material:'cu', cores:4, insulation:'xlpe', size:95, ampacity:278, derated:227, ecc:50},
  {type:'NYY', material:'cu', cores:4, insulation:'xlpe', size:120, ampacity:324, derated:264, ecc:70},
  {type:'NYY', material:'cu', cores:4, insulation:'xlpe', size:150, ampacity:371, derated:302, ecc:95},
  {type:'NYY', material:'cu', cores:4, insulation:'xlpe', size:185, ampacity:424, derated:345, ecc:95},
  {type:'NYY', material:'cu', cores:4, insulation:'xlpe', size:240, ampacity:500, derated:405, ecc:120},
  {type:'NYY', material:'cu', cores:4, insulation:'xlpe', size:300, ampacity:570, derated:460, ecc:150},

  // ---------- ALUMINIUM PVC (AYY/AYWY): SINGLE CORE ----------
  {type:'NYY', material:'al', cores:1, insulation:'pvc', size:16, ampacity:73, derated:51, ecc:16},
  {type:'NYY', material:'al', cores:1, insulation:'pvc', size:25, ampacity:96, derated:68, ecc:16},
  {type:'NYY', material:'al', cores:1, insulation:'pvc', size:35, ampacity:123, derated:87, ecc:16},
  {type:'NYY', material:'al', cores:1, insulation:'pvc', size:50, ampacity:150, derated:120, ecc:25},
  {type:'NYY', material:'al', cores:1, insulation:'pvc', size:70, ampacity:188, derated:150, ecc:35},
  {type:'NYY', material:'al', cores:1, insulation:'pvc', size:95, ampacity:230, derated:184, ecc:50},
  {type:'NYY', material:'al', cores:1, insulation:'pvc', size:120, ampacity:269, derated:215, ecc:70},
  {type:'NYY', material:'al', cores:1, insulation:'pvc', size:150, ampacity:311, derated:249, ecc:95},
  {type:'NYY', material:'al', cores:1, insulation:'pvc', size:185, ampacity:354, derated:283, ecc:95},
  {type:'NYY', material:'al', cores:1, insulation:'pvc', size:240, ampacity:427, derated:341, ecc:120},
  {type:'NYY', material:'al', cores:1, insulation:'pvc', size:300, ampacity:492, derated:393, ecc:150},
  {type:'NYY', material:'al', cores:1, insulation:'pvc', size:400, ampacity:592, derated:473, ecc:240},

  // ---------- ALUMINIUM PVC (AYFY): 3-CORE & 4-CORE ----------
  {type:'NYY', material:'al', cores:3, insulation:'pvc', size:16, ampacity:58, derated:58, ecc:16},
  {type:'NYY', material:'al', cores:3, insulation:'pvc', size:25, ampacity:75, derated:75, ecc:16},
  {type:'NYY', material:'al', cores:3, insulation:'pvc', size:35, ampacity:92, derated:92, ecc:16},
  {type:'NYY', material:'al', cores:3, insulation:'pvc', size:50, ampacity:115, derated:115, ecc:25},
  {type:'NYY', material:'al', cores:3, insulation:'pvc', size:70, ampacity:146, derated:146, ecc:35},
  {type:'NYY', material:'al', cores:3, insulation:'pvc', size:95, ampacity:177, derated:177, ecc:50},
  {type:'NYY', material:'al', cores:3, insulation:'pvc', size:120, ampacity:207, derated:207, ecc:70},
  {type:'NYY', material:'al', cores:3, insulation:'pvc', size:150, ampacity:234, derated:234, ecc:95},
  {type:'NYY', material:'al', cores:3, insulation:'pvc', size:185, ampacity:269, derated:269, ecc:95},
  {type:'NYY', material:'al', cores:3, insulation:'pvc', size:240, ampacity:315, derated:315, ecc:120},
  {type:'NYY', material:'al', cores:3, insulation:'pvc', size:300, ampacity:361, derated:361, ecc:150},
  {type:'NYY', material:'al', cores:3, insulation:'pvc', size:400, ampacity:407, derated:407, ecc:240},

  {type:'NYY', material:'al', cores:4, insulation:'pvc', size:16, ampacity:58, derated:58, ecc:16},
  {type:'NYY', material:'al', cores:4, insulation:'pvc', size:25, ampacity:75, derated:75, ecc:16},
  {type:'NYY', material:'al', cores:4, insulation:'pvc', size:35, ampacity:92, derated:92, ecc:16},
  {type:'NYY', material:'al', cores:4, insulation:'pvc', size:50, ampacity:115, derated:115, ecc:25},
  {type:'NYY', material:'al', cores:4, insulation:'pvc', size:70, ampacity:146, derated:146, ecc:35},
  {type:'NYY', material:'al', cores:4, insulation:'pvc', size:95, ampacity:177, derated:177, ecc:50},
  {type:'NYY', material:'al', cores:4, insulation:'pvc', size:120, ampacity:207, derated:207, ecc:70},
  {type:'NYY', material:'al', cores:4, insulation:'pvc', size:150, ampacity:234, derated:234, ecc:95},
  {type:'NYY', material:'al', cores:4, insulation:'pvc', size:185, ampacity:269, derated:269, ecc:95},
  {type:'NYY', material:'al', cores:4, insulation:'pvc', size:240, ampacity:315, derated:315, ecc:120},
  {type:'NYY', material:'al', cores:4, insulation:'pvc', size:300, ampacity:361, derated:361, ecc:150},
  {type:'NYY', material:'al', cores:4, insulation:'pvc', size:400, ampacity:407, derated:407, ecc:240},

  // ---------- ALUMINIUM XLPE (A2XY/A2XFY): SINGLE & MULTI-CORE ----------
  {type:'NYY', material:'al', cores:1, insulation:'xlpe', size:16, ampacity:89, derated:65, ecc:16},
  {type:'NYY', material:'al', cores:1, insulation:'xlpe', size:25, ampacity:115, derated:86, ecc:16},
  {type:'NYY', material:'al', cores:1, insulation:'xlpe', size:35, ampacity:143, derated:107, ecc:16},
  {type:'NYY', material:'al', cores:1, insulation:'xlpe', size:50, ampacity:174, derated:130, ecc:25},
  {type:'NYY', material:'al', cores:1, insulation:'xlpe', size:70, ampacity:224, derated:167, ecc:35},
  {type:'NYY', material:'al', cores:1, insulation:'xlpe', size:95, ampacity:273, derated:202, ecc:50},
  {type:'NYY', material:'al', cores:1, insulation:'xlpe', size:120, ampacity:318, derated:233, ecc:70},
  {type:'NYY', material:'al', cores:1, insulation:'xlpe', size:150, ampacity:367, derated:267, ecc:95},
  {type:'NYY', material:'al', cores:1, insulation:'xlpe', size:185, ampacity:420, derated:304, ecc:95},
  {type:'NYY', material:'al', cores:1, insulation:'xlpe', size:240, ampacity:497, derated:357, ecc:120},
  {type:'NYY', material:'al', cores:1, insulation:'xlpe', size:300, ampacity:574, derated:409, ecc:150},
  {type:'NYY', material:'al', cores:1, insulation:'xlpe', size:400, ampacity:670, derated:470, ecc:240},

  {type:'NYY', material:'al', cores:3, insulation:'xlpe', size:16, ampacity:70, derated:60, ecc:16},
  {type:'NYY', material:'al', cores:3, insulation:'xlpe', size:25, ampacity:93, derated:78, ecc:16},
  {type:'NYY', material:'al', cores:3, insulation:'xlpe', size:35, ampacity:115, derated:95, ecc:16},
  {type:'NYY', material:'al', cores:3, insulation:'xlpe', size:50, ampacity:140, derated:115, ecc:25},
  {type:'NYY', material:'al', cores:3, insulation:'xlpe', size:70, ampacity:176, derated:144, ecc:35},
  {type:'NYY', material:'al', cores:3, insulation:'xlpe', size:95, ampacity:215, derated:176, ecc:50},
  {type:'NYY', material:'al', cores:3, insulation:'xlpe', size:120, ampacity:251, derated:205, ecc:70},
  {type:'NYY', material:'al', cores:3, insulation:'xlpe', size:150, ampacity:288, derated:234, ecc:95},
  {type:'NYY', material:'al', cores:3, insulation:'xlpe', size:185, ampacity:329, derated:267, ecc:95},
  {type:'NYY', material:'al', cores:3, insulation:'xlpe', size:240, ampacity:388, derated:314, ecc:120},
  {type:'NYY', material:'al', cores:3, insulation:'xlpe', size:300, ampacity:442, derated:357, ecc:150},
  {type:'NYY', material:'al', cores:3, insulation:'xlpe', size:400, ampacity:504, derated:403, ecc:240},

  {type:'NYY', material:'al', cores:4, insulation:'xlpe', size:16, ampacity:70, derated:60, ecc:16},
  {type:'NYY', material:'al', cores:4, insulation:'xlpe', size:25, ampacity:93, derated:78, ecc:16},
  {type:'NYY', material:'al', cores:4, insulation:'xlpe', size:35, ampacity:115, derated:95, ecc:16},
  {type:'NYY', material:'al', cores:4, insulation:'xlpe', size:50, ampacity:140, derated:115, ecc:25},
  {type:'NYY', material:'al', cores:4, insulation:'xlpe', size:70, ampacity:176, derated:144, ecc:35},
  {type:'NYY', material:'al', cores:4, insulation:'xlpe', size:95, ampacity:215, derated:176, ecc:50},
  {type:'NYY', material:'al', cores:4, insulation:'xlpe', size:120, ampacity:251, derated:205, ecc:70},
  {type:'NYY', material:'al', cores:4, insulation:'xlpe', size:150, ampacity:288, derated:234, ecc:95},
  {type:'NYY', material:'al', cores:4, insulation:'xlpe', size:185, ampacity:329, derated:267, ecc:95},
  {type:'NYY', material:'al', cores:4, insulation:'xlpe', size:240, ampacity:388, derated:314, ecc:120},
  {type:'NYY', material:'al', cores:4, insulation:'xlpe', size:300, ampacity:442, derated:357, ecc:150},
  {type:'NYY', material:'al', cores:4, insulation:'xlpe', size:400, ampacity:504, derated:403, ecc:240}
];

const PVC_AMBIENT_FACTORS = [
  { temp: 30, factor: 1.00 },
  { temp: 35, factor: 0.94 },
  { temp: 40, factor: 0.87 },
  { temp: 45, factor: 0.79 },
  { temp: 50, factor: 0.71 },
  { temp: 55, factor: 0.61 },
  { temp: 60, factor: 0.50 }
];

const XLPE_AMBIENT_FACTORS = [
  { temp: 30, factor: 1.00 },
  { temp: 35, factor: 1.00 },
  { temp: 40, factor: 0.95 },
  { temp: 45, factor: 0.90 },
  { temp: 50, factor: 0.85 },
  { temp: 55, factor: 0.80 },
  { temp: 60, factor: 0.74 }
];

function getAmbientCorrection(temp, insulation) {
  if (!['pvc', 'xlpe'].includes(insulation)) {
    return { supported: false, factor: null, message: 'Unsupported insulation type.' };
  }
  if (!Number.isFinite(temp) || temp < -10 || temp > 60) {
    return { supported: false, factor: null, message: 'Temperature outside supported range (-10°C to 60°C).' };
  }
  if (temp <= 35) {
    return { supported: true, factor: 1.00, message: 'No derating applied (35°C base standard).' };
  }
  if (insulation === 'xlpe') {
    const row = XLPE_AMBIENT_FACTORS.find(item => item.temp >= temp);
    return row
      ? { supported: true, factor: row.factor, message: `Applied IEC 60364-5-52 (${row.temp}°C XLPE 90°C Table B.52.15)` }
      : { supported: false, factor: null, message: 'Temperature derating unavailable.' };
  } else {
    const row = PVC_AMBIENT_FACTORS.find(item => item.temp >= temp);
    if (!row) return { supported: false, factor: null, message: 'Correction factor unavailable.' };
    return {
      supported: true,
      factor: row.factor / 0.94,
      message: `Applied IEC 60364-5-52 (${row.temp}°C PVC 70°C Table B.52.14)`
    };
  }
}

function calculateCable() {
  if ($('install') && $('install').children.length === 0) {
    populateInstall();
  }

  const phaseType = document.getElementById('phase').value;
  const loadType = document.getElementById('unit').value;
  const load = cableNumber('load');
  const voltage = cableNumber('voltage');
  const pf = cableNumber('cablePf');
  const length = cableNumber('length');
  const ambient = cableNumber('ambient');
  const maxDrop = cableNumber('drop');
  const material = document.getElementById('conductor').value;
  const insulation = document.getElementById('insulation').value;
  const cableType = document.getElementById('cableType').value;
  const installation = document.getElementById('install').value;
  const distanceUnit = document.getElementById('distanceUnit').value;
  const job = document.getElementById('job').value;

  const ambientResult = getAmbientCorrection(ambient, insulation);
  const ambientOutput = document.getElementById('ambientCorrection');
  if (ambientOutput) {
    ambientOutput.textContent = ambientResult.supported
      ? `Ambient correction factor: ${cableFormat(ambientResult.factor, 3)} — ${ambientResult.message}`
      : `Verification Required — ${ambientResult.message}`;
  }

  const cableConfig = {
    BYA_SINGLE: { type: 'BYA', cores: 1 },
    NYY_SINGLE: { type: 'NYY', cores: 1 },
    NYY_3_CORE: { type: 'NYY', cores: 3 },
    NYY_4_CORE: { type: 'NYY', cores: 4 }
  };
  const selectedCable = cableConfig[cableType];

  const matchingCables = CABLE_AMPACITY_DB.filter(c =>
    c.type === selectedCable.type &&
    c.cores === selectedCable.cores &&
    c.material === material &&
    (c.insulation || 'pvc') === insulation
  );

  let jobCompatible = true;
  let jobMismatchReason = '';
  const isHeavyJob = ['transformer', 'generator'].includes(job);

  if (isHeavyJob) {
    if (cableType === 'BYA_SINGLE') {
      jobCompatible = false;
      jobMismatchReason = 'BNBC 2020 (Part 8, Sec 2.5 & 2.7) এবং RSC (Sec 10.3) অনুযায়ী: ট্রান্সফরমার বা জেনারেটরের মেইন ফিডারে নন-শেথেড BYA তার সম্পূর্ণ নিষিদ্ধ। ডাবল ইনসুলেটেড NYY বা XLPE শেথেড কেবল ব্যবহার আবশ্যক।';
    } else if (!['trench', 'tray'].includes(installation)) {
      jobCompatible = false;
      jobMismatchReason = 'BNBC 2020 (Part 8, Sec 2.5.4) এবং RSC (Sec 10.3/10.4) অনুযায়ী: সাবস্টেশন ও জেনারেটরের মেইন ফিডার লাইনে মেকানিক্যাল প্রটেকশন ও সেফটির জন্য ক্যাবল ট্রেঞ্চ (Trench) বা হেভি ল্যাডার মেথড ব্যবহার আবশ্যক।';
    }
  } else if (job === 'final' && installation === 'trench') {
    jobCompatible = false;
    jobMismatchReason = 'ফাইনাল ব্রাঞ্চ সার্কিটের (Light/Fan) জন্য আন্ডারগ্রাউন্ড ট্রেঞ্চ স্ট্যান্ডার্ড নয়; সারফেস/কনসিল্ড কনডুইট বা চ্যানেল নির্বাচন করুন।';
  }

  const byaInstallationAllowed = ['conduitConcealed', 'conduitSurface', 'trunking'].includes(installation);
  const nyyInstallationAllowed = ['tray', 'clipped', 'conduitConcealed', 'conduitSurface', 'trunking', 'trench'].includes(installation);
  const installationCompatible = cableType === 'BYA_SINGLE' ? byaInstallationAllowed : nyyInstallationAllowed;

 let alRuleCompatible = true;
  let alRuleReason = '';
  if (material === 'al') {
    if (job === 'final') {
      alRuleCompatible = false;
      alRuleReason = 'BNBC 2020 (Part VIII, Ch. 1, Gazette p.4568) অনুযায়ী অভ্যন্তরীণ ফাইনাল ব্রাঞ্চ সার্কিটে (Light/Fan) অ্যালুমিনিয়াম তার সম্পূর্ণ নিষিদ্ধ। কপার নির্বাচন করুন।';
    } else if (cableType === 'BYA_SINGLE') {
      alRuleCompatible = false;
      alRuleReason = 'অ্যালুমিনিয়ামে সাধারণ নন-শেথেড BYA তার স্ট্যান্ডার্ড নয়। NYY বা XLPE শেথেড কেবল ব্যবহার করুন।';
    }
  }

  const databaseCompatible =
    ['cu', 'al'].includes(material) &&
    ['pvc', 'xlpe'].includes(insulation) &&
    matchingCables.length > 0 &&
    installationCompatible &&
    jobCompatible &&
    alRuleCompatible;

  let cableDatabaseStatus = 'Preliminary database match available';
  if (!alRuleCompatible) {
    cableDatabaseStatus = alRuleReason;
  } else if (!jobCompatible) {
    cableDatabaseStatus = jobMismatchReason;
  } else if (!installationCompatible) {
    cableDatabaseStatus = cableType === 'BYA_SINGLE'
      ? 'BNBC (Part 8, Sec 2.7) ও RSC (Sec 10.3/10.4) অনুযায়ী নন-শেথেড BYA তার ওপেন ক্যাবল ট্রে বা সরাসরি ক্লিপ করে টানা নিষিদ্ধ। আবদ্ধ কনডুইট বা চ্যানেল/ট্রাংকিং ব্যবহার করতে হবে।'
      : 'Verification Required: Selected installation method is not approved for this cable.';
  } else if (matchingCables.length === 0) {
    cableDatabaseStatus = 'Verification Required: No matching cable size found in database (e.g. BYA is PVC only).';
  } else if (material === 'al') {
    cableDatabaseStatus = 'BNBC 2020 (Part VIII, Ch. 1, p.4568): Aluminium allowed ONLY for thick feeders > 35 mm²; Bi-Metallic Lugs mandatory at Copper busbars.';
  }

  const validLoad = Number.isFinite(load) && load > 0;
  const validVoltage = Number.isFinite(voltage) && voltage > 0;
  const validPF = Number.isFinite(pf) && pf > 0 && pf <= 1;
  const validLength = Number.isFinite(length) && length > 0;
  const validAmbient = Number.isFinite(ambient);
  const validDrop = Number.isFinite(maxDrop) && maxDrop > 0 && maxDrop <= 100;

  let current = NaN;
  if (validLoad && validVoltage) {
    const phaseFactor = phaseType === '3' ? Math.sqrt(3) : 1;
    if (loadType === 'amp') {
      current = load;
    } else if (phaseType === 'dc') {
      if (loadType === 'kw') current = load * 1000 / voltage;
      else if (loadType === 'w') current = load / voltage;
    } else if (loadType === 'kva') {
      current = load * 1000 / (phaseFactor * voltage);
    } else if ((loadType === 'kw' || loadType === 'w') && validPF) {
      const loadInWatt = loadType === 'kw' ? load * 1000 : load;
      current = loadInWatt / (phaseFactor * voltage * pf);
    }
  }

  let selectedCableSize = null;
  let selectedRuns = 1;
  let selectedBreakerIn = null;
  const isMotorMachine = job === 'machine';
  const safetyFactor = isMotorMachine ? 1.25 : 1.0;
  const designCurrent = Number.isFinite(current) ? (current * safetyFactor) : NaN;

  const STANDARD_BREAKERS = [
    6, 10, 16, 20, 25, 32, 40, 50, 63, 80, 100,
    125, 160, 200, 250, 315, 350, 400, 500, 630, 800,
    1000, 1250, 1600, 2000, 2500, 3200, 4000
  ];

 const groupFactor = $('cableGrouping') ? (Number($('cableGrouping').value) || 1.0) : 1.0;
  const totalDerating = ambientResult.supported ? (ambientResult.factor * groupFactor) : NaN;

  if (databaseCompatible && ambientResult.supported && Number.isFinite(current) && current > 0) {
    selectedBreakerIn = STANDARD_BREAKERS.find(r => r >= designCurrent) || Math.ceil(designCurrent);

    for (let r = 1; r <= 10; r++) {
      const currentPerRun = current / r;
      const designPerRun = designCurrent / r;
      const breakerPerRun = selectedBreakerIn / r;

      const candidate = matchingCables
        .filter(c => {
          if (material === 'al' && c.size <= 35) return false; // BNBC 2020 p.4568: Al > 35 mm² only
          const adjustedAmp = c.derated * totalDerating;
          if (adjustedAmp < designPerRun) return false;
          if (adjustedAmp < breakerPerRun) return false;

          if (validVoltage && validLength && validDrop) {
            const drop = calculateVoltageDrop(currentPerRun, voltage, length, c.size, phaseType, material, pf);
            if (!drop || drop.percent > maxDrop) return false;
          }
          return true;
        })
        .sort((a, b) => a.size - b.size)[0] || null;

      if (candidate) {
        selectedCableSize = candidate;
        selectedRuns = r;
        break;
      }
    }
  }

  const currentElement = document.getElementById('rCurrent');
  const currentNoteElement = document.querySelector('#resultPanel .metric:nth-child(1) .s');

  if (currentElement) {
    currentElement.textContent = Number.isFinite(current) && current > 0 ? cableFormat(current) + ' A' : '— A';
  }
 if (currentNoteElement && Number.isFinite(current) && current > 0) {
    currentNoteElement.innerHTML = isMotorMachine
      ? `FLC: ${cableFormat(current)} A | Sizing (125%): <strong>${cableFormat(designCurrent)} A</strong><br><span style="font-size:9.5px; color:#4fd18b">Ref: NFPA 70 Art. 430.22 &amp; BNBC 2020 Sec 1.3.30</span>`
      : 'Full Load Current (Ib) per BNBC 2020 Sec 1.3.2';
  }

  const runsElement = document.getElementById('rRuns');
  const runsNoteElement = document.getElementById('rRunsNote');
  if (runsElement) {
    runsElement.textContent = selectedCableSize
      ? (selectedRuns > 1 ? `${selectedRuns} Runs (Parallel)` : '1 Run (Single)')
      : '—';
  }
  if (runsNoteElement) {
    runsNoteElement.textContent = selectedCableSize
      ? (selectedRuns > 1 ? `${cableFormat(current / selectedRuns)} A per run | Equal length required` : 'Single cable run')
      : 'Minimum feasible runs, up to 10';
  }

  const lengthElement = document.getElementById('rLength');
  const lengthNoteElement = document.getElementById('rLengthNote');
  if (lengthElement) {
    if (validLength) {
      const unitLabel = distanceUnit === 'ft' ? 'ft' : 'm';
      lengthElement.textContent = cableFormat(length * selectedRuns) + ' ' + unitLabel;
    } else {
      lengthElement.textContent = '—';
    }
  }
  if (lengthNoteElement) {
    const unitLabel = distanceUnit === 'ft' ? 'ft' : 'm';
    lengthNoteElement.textContent = selectedRuns > 1
      ? `${selectedRuns} runs × ${cableFormat(length)} ${unitLabel} route length`
      : 'Single cable route length';
  }

  const sizeElement = document.getElementById('manualCableSize');
  const dropResult = document.getElementById('rVoltageDrop');
  const dropStatus = document.getElementById('rVoltageDropStatus');
  const resultDrop = document.getElementById('rResultVoltageDrop');
  const resultDropStatus = document.getElementById('rResultVoltageDropStatus');
  const cableSize = sizeElement && sizeElement.value !== '' ? Number(sizeElement.value) : NaN;

  const cableRecord = selectedCable
    ? CABLE_AMPACITY_DB.find(item =>
        item.type === selectedCable.type &&
        item.material === material &&
        item.cores === selectedCable.cores &&
        (item.insulation || 'pvc') === insulation &&
        item.size === cableSize
      )
    : null;

  const ambientBox = $('ampacityAmbientCorrection');
  const ampacityBox = $('adjustedAmpacity');
  const ampacityStatus = $('ampacityStatus');

  if (ambientBox) {
    ambientBox.textContent = ambientResult.supported
      ? `Ambient correction factor: ${cableFormat(ambientResult.factor, 3)}`
      : `Verification Required — ${ambientResult.message}`;
  }

  if (cableRecord && ambientResult.supported && Number.isFinite(current) && current > 0) {
    const adjustedAmpacity = cableRecord.derated * ambientResult.factor;
    if (ampacityBox) ampacityBox.textContent = `Temperature-adjusted ampacity: ${cableFormat(adjustedAmpacity)} A`;
    if (ampacityStatus) {
      ampacityStatus.textContent = current <= adjustedAmpacity
        ? `Preliminary: Load ${cableFormat(current)} A is within database capacity.`
        : `Warning: Load ${cableFormat(current)} A exceeds database capacity.`;
    }
  } else {
    if (ampacityBox) ampacityBox.textContent = 'Temperature-adjusted ampacity: Verification Required';
    if (ampacityStatus) ampacityStatus.textContent = 'Matching cable data or supported correction factor unavailable.';
  }

  const vd = sizeElement && sizeElement.value !== ''
    ? calculateVoltageDrop(current, voltage, length, cableSize, phaseType, material, pf)
    : null;

  if (dropResult) dropResult.textContent = vd ? `${cableFormat(vd.volts)} V (${cableFormat(vd.percent)}%)` : '—';
  if (dropStatus) {
    if (!vd) dropStatus.textContent = 'Select a cable size and enter valid inputs.';
    else if (vd.percent <= maxDrop) dropStatus.textContent = 'Preliminary estimate within limit; verify using applicable cable data.';
    else dropStatus.textContent = 'Preliminary estimate exceeds the entered limit.';
  }

  const recVd = selectedCableSize
    ? calculateVoltageDrop(current / selectedRuns, voltage, length, selectedCableSize.size, phaseType, material, pf)
    : null;

  const displayDrop = recVd || vd;
  if (resultDrop) resultDrop.textContent = displayDrop ? `${cableFormat(displayDrop.volts)} V` : '— V';
  if (resultDropStatus) {
    if (!displayDrop) {
      resultDropStatus.textContent = 'Awaiting cable calculation';
    } else if (recVd) {
      const sizeText = selectedRuns > 1 ? `${selectedRuns} × ${selectedCableSize.size} mm²` : `${selectedCableSize.size} mm²`;
      resultDropStatus.textContent = `Preliminary: ${cableFormat(displayDrop.percent)}% — Within limit (for ${sizeText})`;
    } else {
      resultDropStatus.textContent = displayDrop.percent <= maxDrop
        ? `Preliminary: ${cableFormat(displayDrop.percent)}% — Within limit (for test ${cableSize} mm²)`
        : `Preliminary: ${cableFormat(displayDrop.percent)}% — Exceeds limit (for test ${cableSize} mm²)`;
    }
  }

  const resultPanel = document.getElementById('resultPanel');
  if (resultPanel) {
    const cableSizeResult = document.getElementById('rCableSize');
    const cableNoteResult = document.getElementById('rCableNote');

    if (cableSizeResult && cableNoteResult) {
      if (!databaseCompatible) {
        cableSizeResult.textContent = 'Verification Required';
        cableNoteResult.textContent = cableDatabaseStatus;
      } else if (selectedCableSize) {
        const autoAdjustedAmpacity = selectedCableSize.derated * totalDerating;
        const matLabel = material === 'al' ? 'Aluminium' : 'Copper';
        const insLabel = insulation.toUpperCase();

        cableSizeResult.textContent = selectedRuns > 1
          ? `${selectedRuns} × (${selectedCableSize.size} mm²)`
          : `${selectedCableSize.size} mm²`;

        cableNoteResult.textContent = selectedRuns > 1
          ? `${selectedRuns} Runs | ${cableType} | ${matLabel} | ${insLabel} | Total Cap: ${cableFormat(autoAdjustedAmpacity * selectedRuns)} A (${cableFormat(autoAdjustedAmpacity)} A/run)`
          : `${cableType} | ${matLabel} | ${insLabel} | Adjusted: ${cableFormat(autoAdjustedAmpacity)} A (Base: ${selectedCableSize.derated} A)`;
      } else {
        cableSizeResult.textContent = 'No Suitable Size';
        cableNoteResult.textContent = 'No database cable size meets the calculated current';
      }
    }

    const eccElement = document.getElementById('rEcc');
    const eccNoteElement = document.getElementById('rEccNote');
    if (eccElement && eccNoteElement) {
      if (!databaseCompatible || !selectedCableSize) {
        eccElement.textContent = 'Verification Required';
        eccNoteElement.textContent = 'BNBC Table 8.1.26 / Applicable protection rules';
      } else {
      const S = selectedCableSize.size;
        let eccSize;
        if (S < 16) eccSize = S;
        else if (S < 35) eccSize = 16;
        else {
          const half = S / 2;
          const standardSizes = [25, 35, 50, 70, 95, 120, 150, 185, 240, 300, 400];
          eccSize = standardSizes.find(sz => sz >= half) || Math.ceil(half);
        }

        const eccExtraNote = S === 35 ? ' (IEC 60364-5-54 allows 16 mm²)' : '';
        eccElement.textContent = selectedRuns > 1 ? `${selectedRuns} × ${eccSize} mm²` : `${eccSize} mm²`;
        eccNoteElement.textContent = selectedRuns > 1
          ? `1 × ${eccSize} mm² per run | BNBC 2020 Table 8.1.26${eccExtraNote}`
          : `Copper ECC | BNBC 2020 Table 8.1.26 (Phase ${S} mm²)${eccExtraNote}`;
      }
    }

    const breakerElement = document.getElementById('rBreaker');
    const breakerNoteElement = document.getElementById('rBreakerNote');
    if (breakerElement && breakerNoteElement) {
      if (!databaseCompatible || !selectedCableSize || !Number.isFinite(current) || current <= 0) {
        breakerElement.textContent = 'Verification Required';
        breakerNoteElement.textContent = 'Protection checks & fault level verification required';
      } else {
        const totalIz = (selectedCableSize.derated * ambientResult.factor) * selectedRuns;
        const In = selectedBreakerIn || (STANDARD_BREAKERS.find(r => r >= current) || Math.ceil(current));

        let breakerType = 'MCB';
        if (phaseType === 'dc') breakerType = In <= 63 ? 'DC-MCB' : 'DC-MCCB';
        else if (In > 630) breakerType = 'ACB';
        else if (In > 63) breakerType = 'MCCB';

        let curveType = 'Type C';
        let inrushNote = 'Type C curve withstands 5–10×In motor inrush';
        if (job === 'final') {
          curveType = 'Type B/C';
          inrushNote = 'Type B/C curve for resistive/lighting circuits';
        } else if (['transformer', 'generator'].includes(job) || In > 63) {
          curveType = 'Adjustable Trip';
          inrushNote = 'Adjustable magnetic trip (8–12×In) for transformer inrush';
        }

        let minBreakingCapacity = '10 kA';
        if (['transformer', 'generator'].includes(job) || In > 630) minBreakingCapacity = '36 kA / 50 kA';
        else if (job === 'final') minBreakingCapacity = '6 kA / 10 kA';

        const kFactor = material === 'al'
          ? (insulation === 'xlpe' ? 94 : 76)
          : (insulation === 'xlpe' ? 143 : 115);

        const totalArea = selectedCableSize.size * selectedRuns;
        const Isc1s = (kFactor * totalArea) / 1000;
        const Isc01s = (kFactor * totalArea) / (Math.sqrt(0.1) * 1000);
        const pole = phaseType === '3' ? '3P/4P' : (phaseType === '1' ? '1P/2P' : '2P DC');

        breakerElement.textContent = breakerType === 'MCB'
          ? `${In} A ${breakerType} (${curveType}, min ${minBreakingCapacity})`
          : `${In} A ${breakerType} (min ${minBreakingCapacity})`;

        breakerNoteElement.innerHTML = `
          <span style="color:#4fd18b; font-weight:700">✓ Fully Coordinated:</span> ${pole} | Ib (${cableFormat(current)} A) ≤ In (${In} A) ≤ Iz (${cableFormat(totalIz)} A)<br>
          ⚡ ${inrushNote}<br>
          🛡️ Short-Circuit Withstand: ${cableFormat(Isc1s, 2)} kA (1s) / ${cableFormat(Isc01s, 2)} kA (0.1s)<br>
          <span style="font-size:10px; color:#6b827d">Ref: BNBC 2020 Cl. 1.3.30(c),(d) &amp; IEC 60364-4-43</span>
        `;
      }
    }

    const conduitElement = document.getElementById('rConduit');
    const conduitNoteElement = document.getElementById('rConduitNote');
    if (conduitElement && conduitNoteElement) {
      const isConduitMethod = ['conduitConcealed', 'conduitSurface'].includes(installation);

      if (!isConduitMethod) {
        conduitElement.textContent = 'Not Applicable';
        conduitNoteElement.textContent = 'Open Tray / Trench / Direct wiring';
      } else if (!databaseCompatible || !selectedCableSize) {
        conduitElement.textContent = 'Verification Required';
        conduitNoteElement.textContent = 'Awaiting verified cable sizing';
      } else {
        const CONDUIT_SIZES = [
          { metric: '20 mm', imperial: '¾"', intArea: 206 },
          { metric: '25 mm', imperial: '1"', intArea: 346 },
          { metric: '32 mm', imperial: '1¼"', intArea: 594 },
          { metric: '38 mm', imperial: '1½"', intArea: 907 },
          { metric: '50 mm', imperial: '2"', intArea: 1555 },
          { metric: '63 mm', imperial: '2½"', intArea: 2507 }
        ];

        const CABLE_OVERALL_AREAS = {
          1: 6.2, 1.5: 7.1, 2.5: 10.2, 4: 13.9, 6: 18.1,
          10: 29.2, 16: 40.7, 25: 62.2, 35: 81.7, 50: 115.0,
          70: 153.9, 95: 206.1, 120: 254.5, 150: 314.0,
          185: 380.0, 240: 490.0, 300: 590.0, 400: 755.0
        };

        const phaseArea = CABLE_OVERALL_AREAS[selectedCableSize.size] || (Math.PI * Math.pow(Math.sqrt(selectedCableSize.size) * 1.5 + 1.2, 2) / 4);
        const S = selectedCableSize.size;
        const eccS = S <= 16 ? S : (S <= 35 ? 16 : (S / 2));
        const eccArea = CABLE_OVERALL_AREAS[eccS] || phaseArea * 0.6;

        const isMultiCore = ['NYY_3_CORE', 'NYY_4_CORE'].includes(cableType);
        let totalWiresPerRun = 0;
        let totalCableAreaPerRun = 0;

        if (isMultiCore) {
          totalWiresPerRun = 1;
          totalCableAreaPerRun = (phaseArea * (selectedCable.cores === 4 ? 4.2 : 3.3)) + eccArea;
        } else {
          const activeCores = phaseType === '3' ? 4 : 2;
          totalWiresPerRun = activeCores + 1;
          totalCableAreaPerRun = (activeCores * phaseArea) + eccArea;
        }

        const maxFillPercent = totalWiresPerRun === 1 ? 53 : (totalWiresPerRun === 2 ? 31 : 40);
        const suitableConduit = CONDUIT_SIZES.find(c => (c.intArea * (maxFillPercent / 100)) >= totalCableAreaPerRun);

        if (suitableConduit) {
          const fillPercent = ((totalCableAreaPerRun / suitableConduit.intArea) * 100).toFixed(1);
          const pipeType = installation === 'conduitSurface' ? 'Surface Conduit / GI' : 'PVC Conduit';

          conduitElement.textContent = selectedRuns > 1
            ? `${selectedRuns} × ${suitableConduit.metric} (${suitableConduit.imperial})`
            : `${suitableConduit.metric} (${suitableConduit.imperial})`;

          conduitNoteElement.innerHTML = selectedRuns > 1
            ? `Per run: ${suitableConduit.metric} ${pipeType} (${totalWiresPerRun} cables, ${fillPercent}% fill ≤ ${maxFillPercent}%)<br><span style="font-size:10px; color:#6b827d">Ref: BNBC 2020 Sec 1.3.14 &amp; NEC Ch. 9 Table 1</span>`
            : `${pipeType} | ${totalWiresPerRun} cables | Fill: ${fillPercent}% (Max ${maxFillPercent}%)<br><span style="font-size:10px; color:#6b827d">Ref: BNBC 2020 Sec 1.3.14 &amp; NEC Ch. 9 Table 1</span>`;
        } else {
          conduitElement.textContent = 'Trunking / Tray Required';
          conduitNoteElement.textContent = 'Total cable volume exceeds standard 63 mm (2½") conduit capacity. Use Cable Trunking.';
        }
      }
    }
  }

  const messages = [];
  if (!validLoad) messages.push('Enter a load greater than zero.');
  if (!validVoltage) messages.push('Enter a valid supply voltage.');
  if ((loadType === 'kw' || loadType === 'w') && phaseType !== 'dc' && !validPF) {
    messages.push('Power factor must be greater than 0 and at most 1.');
  }
  if (loadType === 'kva' && phaseType === 'dc') messages.push('DC with kVA input is not supported.');
  if (!validLength) messages.push('Enter cable length greater than zero.');
  if (!validAmbient) messages.push('Enter a valid ambient temperature.');
  if (!validDrop) messages.push('Enter a valid maximum voltage-drop percentage.');
  if (!databaseCompatible && cableDatabaseStatus) messages.push(cableDatabaseStatus);

  const statusElement = document.querySelector('#resultPanel .status');
  if (statusElement) {
    if (messages.length > 0) {
      statusElement.style.display = 'block';
      statusElement.innerHTML = '⚠️ <strong>BNBC / RSC Compliance Notice:</strong><br>' + messages.join('<br>');
      statusElement.style.borderColor = '#f59e0b';
      statusElement.style.color = '#92400e';
      statusElement.style.background = '#fffbeb';
    } else {
      statusElement.style.display = 'none';
      statusElement.innerHTML = '';
    }
  }
  const proofEl = document.getElementById('rCodeProof');
  if (proofEl) {
    if (databaseCompatible && selectedCableSize && Number.isFinite(current) && current > 0) {
      const totalIz = (selectedCableSize.derated * totalDerating) * selectedRuns;
      const vdPct = recVd ? cableFormat(recVd.percent) : '—';
      proofEl.innerHTML = `
        <strong>1. Thermal &amp; Derating Check (IEC 60364-5-52):</strong> Base ${selectedCableSize.derated} A × Ambient (${cableFormat(ambientResult.factor, 3)}) × Grouping (${cableFormat(groupFactor, 2)}) × ${selectedRuns} run(s) = <strong>${cableFormat(totalIz)} A (Iz)</strong>.<br>
        <strong>2. Breaker-Cable Coordination (BNBC 2020 Cl. 1.3.30(c),(d) &amp; IEC 60364-4-43):</strong> Load Ib (${cableFormat(current)} A) ≤ Design (${cableFormat(designCurrent)} A) ≤ Breaker In (${selectedBreakerIn} A) ≤ Cable Iz (${cableFormat(totalIz)} A). Breaker trips before cable overheats.<br>
        <strong>3. Voltage Drop (BNBC 2020 Sec 1.3.7):</strong> Calculated drop is <strong>${vdPct}%</strong> ≤ Permitted <strong>${maxDrop}%</strong> (BNBC max 2.5% from distribution point).<br>
        <strong>4. Earth Continuity Conductor (BNBC 2020 Table 8.1.26):</strong> For ${selectedCableSize.size} mm² phase, Cu ECC sized per rule (&lt;16 → same; 16–&lt;35 → 16 mm²; ≥35 → ≥ S/2).<br>
        <strong>5. Short-Circuit Withstand (IEC 60364-4-43):</strong> Adiabatic Isc = (k × S) / √t verified for ${material.toUpperCase()} / ${insulation.toUpperCase()}.
      `;
    } else {
      proofEl.textContent = 'Enter valid inputs & compliant installation method to generate code justification.';
    }
  }
}

function calculateVoltageDrop(current, voltage, length, size, phaseType, material, pf) {
  if (
    !Number.isFinite(current) || current <= 0 ||
    !Number.isFinite(voltage) || voltage <= 0 ||
    !Number.isFinite(length) || length <= 0 ||
    !Number.isFinite(size) || size <= 0
  ) {
    return null;
  }

  if (phaseType !== 'dc' && (!Number.isFinite(pf) || pf <= 0 || pf > 1)) {
    return null;
  }

  const rho70 = material === 'al' ? 0.0339 : 0.0210;
  const breakerModeEl = document.getElementById('cableBreakerMode');
  const isMode2 = breakerModeEl && !breakerModeEl.classList.contains('hidden');
  const unitEl = isMode2
    ? (document.getElementById('exDistanceUnit') || document.getElementById('distanceUnit'))
    : (document.getElementById('distanceUnit') || document.getElementById('exDistanceUnit'));

  const distanceUnit = unitEl ? unitEl.value : 'm';
  const lengthM = distanceUnit === 'ft' ? length * 0.3048 : length;
  const R = (rho70 * lengthM) / size;

  let dropV = 0;
  if (phaseType === 'dc') {
    dropV = 2 * current * R;
  } else {
    const X = 0.00008 * lengthM;
    const cosPhi = pf;
    const sinPhi = Math.sqrt(Math.max(0, 1 - Math.pow(cosPhi, 2)));
    const impedanceDrop = (R * cosPhi) + (X * sinPhi);
    dropV = phaseType === '3' ? Math.sqrt(3) * current * impedanceDrop : 2 * current * impedanceDrop;
  }

  return { volts: dropV, percent: (dropV / voltage) * 100 };
}

function calculateExistingCable() {
  populateExInstall();

  const material = $('exConductor') ? $('exConductor').value : 'cu';
  const insulation = $('exInsulation') ? $('exInsulation').value : 'pvc';
  const cableType = $('exCableType') ? $('exCableType').value : 'BYA_SINGLE';
  const size = cableNumber('exCableSize');
  const runs = cableNumber('exRuns') || 1;
  const installation = $('exInstall') ? $('exInstall').value : 'conduitConcealed';
  const phaseVal = $('exPhase') ? $('exPhase').value : '3';
  const voltage = cableNumber('exVoltage');
  const pf = cableNumber('exPf') || 0.85;
  const length = cableNumber('exLength') || 30;
  const distanceUnit = $('exDistanceUnit') ? $('exDistanceUnit').value : 'm';
 const ambient = cableNumber('exAmbient');
  const groupFactor = $('exGrouping') ? (Number($('exGrouping').value) || 1.0) : 1.0;

  const ampacityEl = $('rExAmpacity');
  const ampacityNoteEl = $('rExAmpacityNote');
  const breakerEl = $('rExBreaker');
  const breakerNoteEl = $('rExBreakerNote');
  const safeLoadEl = $('rExSafeLoad');
  const safeLoadNoteEl = $('rExSafeLoadNote');
  const dropEl = $('rExDrop');
  const dropNoteEl = $('rExDropNote');
  const eccEl = $('rExEcc');
  const eccNoteEl = $('rExEccNote');
  const conduitEl = $('rExConduit');
  const conduitNoteEl = $('rExConduitNote');
  const statusEl = $('exStatus');

  const messages = [];
  const byaAllowed = ['conduitConcealed', 'conduitSurface', 'trunking'].includes(installation);
  if (cableType === 'BYA_SINGLE' && !byaAllowed) {
    messages.push('BNBC/RSC Violation: BYA cable is prohibited in open tray, ladder, or direct clipped wiring. Conduit/Trunking required.');
  }
 if (material === 'al') {
    if (size <= 35) {
      messages.push('⚠️ BNBC 2020 Violation (Part VIII, Ch. 1, p.4568): Aluminium conductor ≤ 35 mm² is prohibited inside buildings (permitted only for thick cables > 35 mm²).');
    } else {
      messages.push('BNBC 2020 (p.4568) & RSC Sec 10.3: Aluminium > 35 mm² permitted for feeders; Bi-metallic lugs mandatory at Copper busbars.');
    }
  }

  const amb = getAmbientCorrection(ambient, insulation);
 const ambFactor = amb.supported ? amb.factor : 1.0;
  const combinedFactor = ambFactor * groupFactor;
  if ($('exAmbientCorrection')) {
    $('exAmbientCorrection').textContent = amb.supported
      ? `Factor: ${cableFormat(combinedFactor, 2)} (Temp ${cableFormat(ambFactor, 2)} × Group ${cableFormat(groupFactor, 2)})`
      : 'Verification Required';
  }

  const cableConfig = {
    BYA_SINGLE: { type: 'BYA', cores: 1 },
    NYY_SINGLE: { type: 'NYY', cores: 1 },
    NYY_3_CORE: { type: 'NYY', cores: 3 },
    NYY_4_CORE: { type: 'NYY', cores: 4 }
  };
  const cfg = cableConfig[cableType];
  const record = CABLE_AMPACITY_DB.find(c =>
    c.type === cfg.type &&
    c.cores === cfg.cores &&
    c.material === material &&
    (c.insulation || 'pvc') === insulation &&
    c.size === size
  );

  if (!record) {
    messages.push(`No database ampacity found for ${material === 'al' ? 'Aluminium' : 'Copper'} ${insulation.toUpperCase()} ${cableType.replace(/_/g, ' ')} (${size} mm²).`);
  }

  const isMatSupported = ['cu', 'al'].includes(material);
  const isInsSupported = ['pvc', 'xlpe'].includes(insulation);

  if (!record || !amb.supported || !isMatSupported || !isInsSupported || (cableType === 'BYA_SINGLE' && !byaAllowed)) {
    if (ampacityEl) ampacityEl.textContent = 'Verification Required';
    if (breakerEl) breakerEl.textContent = 'Verification Required';
    if (safeLoadEl) safeLoadEl.textContent = '—';
    if (dropEl) dropEl.textContent = '—';
    if (eccEl) eccEl.textContent = '—';
    if (conduitEl) conduitEl.textContent = '—';
    if (statusEl) {
      statusEl.style.display = messages.length > 0 ? 'block' : 'none';
      statusEl.innerHTML = messages.join('<br>');
    }
    return;
  }

  const basePerRun = record.derated;
  const singleIz = basePerRun * ambFactor;
  const totalIz = singleIz * runs;

  if (ampacityEl) ampacityEl.textContent = `${cableFormat(totalIz)} A`;
  if (ampacityNoteEl) {
    ampacityNoteEl.textContent = runs > 1
      ? `${runs} Runs × ${cableFormat(singleIz)} A (Base: ${basePerRun} A @ 35°C, Temp Factor: ${cableFormat(ambFactor, 2)})`
      : `Single Run | Base: ${basePerRun} A @ 35°C | Temp Factor: ${cableFormat(ambFactor, 2)}`;
  }

  const standardBreakers = [
    6, 10, 16, 20, 25, 32, 40, 50, 63, 80, 100, 125, 160, 200, 250, 315, 350, 400, 500, 630, 800,
    1000, 1250, 1600, 2000, 2500, 3200, 4000
  ];
  const In = [...standardBreakers].reverse().find(r => r <= totalIz) || 6;

  let breakerType = 'MCB';
  if (phaseVal === 'dc') breakerType = In <= 63 ? 'DC-MCB' : 'DC-MCCB';
  else if (In > 630) breakerType = 'ACB';
  else if (In > 63) breakerType = 'MCCB';

  if (breakerEl) breakerEl.textContent = `${In} A ${breakerType}`;
  if (breakerNoteEl) {
    breakerNoteEl.innerHTML = `Safe rule In (${In} A) ≤ Iz (${cableFormat(totalIz)} A) | ${phaseVal === '3' ? '3P/4P' : (phaseVal === '1' ? '1P/2P' : '2P DC')}`;
  }

  let maxKW = 0;
  let maxKVA = 0;
  if (phaseVal === '3') {
    maxKW = (Math.sqrt(3) * voltage * In * pf) / 1000;
    maxKVA = (Math.sqrt(3) * voltage * In) / 1000;
  } else if (phaseVal === '1') {
    maxKW = (voltage * In * pf) / 1000;
    maxKVA = (voltage * In) / 1000;
  } else {
    maxKW = (voltage * In) / 1000;
    maxKVA = maxKW;
  }

  if (safeLoadEl) safeLoadEl.textContent = `${cableFormat(maxKW)} kW`;
  if (safeLoadNoteEl) {
    safeLoadNoteEl.textContent = phaseVal === 'dc'
      ? `DC Load Capacity @ ${voltage} V`
      : `Apparent: ${cableFormat(maxKVA)} kVA @ PF ${pf}, ${voltage} V`;
  }

  const currentPerRun = In / runs;
  const vd = calculateVoltageDrop(currentPerRun, voltage, length, size, phaseVal, material, pf);
  if (dropEl && vd) dropEl.textContent = `${cableFormat(vd.volts)} V (${cableFormat(vd.percent)}%)`;
  if (dropNoteEl && vd) {
    dropNoteEl.textContent = vd.percent <= 2.5
      ? `✓ Compliant: ≤ 2.5% BNBC 2020 Sec 1.3.7 limit (at ${length} ${distanceUnit})`
      : `⚠️ Exceeds 2.5% BNBC 2020 Sec 1.3.7 limit (${cableFormat(vd.percent)}%). Reduce load/length.`;
  }

  let eccSize = size < 16 ? size : (size < 35 ? 16 : (size / 2));
  const standardECC = [1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240];
  eccSize = standardECC.find(sz => sz >= eccSize) || Math.ceil(eccSize);

  const k = material === 'al'
    ? (insulation === 'xlpe' ? 94 : 76)
    : (insulation === 'xlpe' ? 143 : 115);
  const Isc1s = (k * size * runs) / 1000;
  const Isc01s = (k * size * runs) / (Math.sqrt(0.1) * 1000);

  if (eccEl) eccEl.textContent = runs > 1 ? `${runs} × ${eccSize} mm²` : `${eccSize} mm²`;
  if (eccNoteEl) {
    eccNoteEl.innerHTML = `Copper ECC (BNBC Table 8.1.26)<br>Fault withstand: ${cableFormat(Isc1s, 2)} kA (1s) / ${cableFormat(Isc01s, 2)} kA (0.1s)`;
  }

  const isConduit = ['conduitConcealed', 'conduitSurface'].includes(installation);
  if (conduitEl && conduitNoteEl) {
    if (!isConduit) {
      conduitEl.textContent = 'Not Applicable';
      conduitNoteEl.textContent = 'Open Tray / Trench / Direct wiring';
    } else {
      const CONDUIT_SIZES = [
        { metric: '20 mm', imperial: '¾"', intArea: 206 },
        { metric: '25 mm', imperial: '1"', intArea: 346 },
        { metric: '32 mm', imperial: '1¼"', intArea: 594 },
        { metric: '38 mm', imperial: '1½"', intArea: 907 },
        { metric: '50 mm', imperial: '2"', intArea: 1555 },
        { metric: '63 mm', imperial: '2½"', intArea: 2507 }
      ];

      const CABLE_OVERALL_AREAS = {
        1: 6.2, 1.5: 7.1, 2.5: 10.2, 4: 13.9, 6: 18.1,
        10: 29.2, 16: 40.7, 25: 62.2, 35: 81.7, 50: 115.0,
        70: 153.9, 95: 206.1, 120: 254.5, 150: 314.0,
        185: 380.0, 240: 490.0, 300: 590.0, 400: 755.0
      };

      const phaseArea = CABLE_OVERALL_AREAS[size] || 60;
      const eccArea = CABLE_OVERALL_AREAS[eccSize] || 40;
      const isMultiCore = ['NYY_3_CORE', 'NYY_4_CORE'].includes(cableType);
      let totalWires = 0;
      let totalArea = 0;

      if (isMultiCore) {
        totalWires = 1;
        totalArea = (phaseArea * (cableType === 'NYY_4_CORE' ? 4.2 : 3.3)) + eccArea;
      } else {
        const activeCores = phaseVal === '3' ? 4 : 2;
        totalWires = activeCores + 1;
        totalArea = (activeCores * phaseArea) + eccArea;
      }

      const maxFill = totalWires === 1 ? 53 : (totalWires === 2 ? 31 : 40);
      const pipe = CONDUIT_SIZES.find(c => (c.intArea * (maxFill / 100)) >= totalArea);

      if (pipe) {
        const fill = ((totalArea / pipe.intArea) * 100).toFixed(1);
        conduitEl.textContent = runs > 1 ? `${runs} × ${pipe.metric} (${pipe.imperial})` : `${pipe.metric} (${pipe.imperial})`;
        conduitNoteEl.innerHTML = `Fill: ${fill}% (Max ${maxFill}%) | ${totalWires} cables<br><span style="font-size:10px; color:#6b827d">BNBC 2020 Sec 2.7.3 & NEC Ch. 9 Rule</span>`;
      } else {
        conduitEl.textContent = 'Trunking Required';
        conduitNoteEl.textContent = 'Total volume exceeds 63 mm pipe. Use Cable Trunking.';
      }
    }
  }

  if (statusEl) {
    statusEl.style.display = messages.length > 0 ? 'block' : 'none';
    statusEl.innerHTML = messages.join('<br>');
  }
  const exProofEl = document.getElementById('rExCodeProof');
  if (exProofEl) {
    exProofEl.innerHTML = `
      <strong>1. Safe Ampacity (IEC 60364-5-52):</strong> ${runs} × ${basePerRun} A × Combined Factor (${cableFormat(combinedFactor, 2)}) = <strong>${cableFormat(totalIz)} A (Iz)</strong>.<br>
      <strong>2. Protection Rule (BNBC 2020 Cl. 1.3.30(c),(d) &amp; IEC 60364-4-43):</strong> Max Breaker In (${In} A) ≤ Cable Iz (${cableFormat(totalIz)} A) ensures cable insulation never overheats.<br>
      <strong>3. Voltage Drop (BNBC 2020 Sec 1.3.7):</strong> Checked against strict 2.5% BNBC building distribution limit.<br>
      <strong>4. ECC &amp; Conduit:</strong> Cu ECC sized per <strong>BNBC 2020 Table 8.1.26</strong>; Conduit fill checked per <strong>BNBC Sec 1.3.14 &amp; NEC Ch. 9 (40% Rule)</strong>.
    `;
  }
}

(function initCableCalculator() {
  const form = document.getElementById('cableForm');
  if (form) {
    form.addEventListener('input', function (event) {
      if (event.target.id === 'job') return;
      calculateCable();
    });
    form.addEventListener('change', function (event) {
      if (event.target.id === 'job') { jobChange(); return; }
      if (event.target.id === 'phase') { phaseChange(); return; }
      calculateCable();
    });
  }

  const exForm = document.getElementById('exCableForm');
  if (exForm) {
    exForm.addEventListener('input', calculateExistingCable);
    exForm.addEventListener('change', function (event) {
      if (event.target.id === 'exPhase') {
        const p = $('exPhase').value;
        if (p === '1') $('exVoltage').value = 220;
        else if (p === '3') $('exVoltage').value = 415;
      }
      calculateExistingCable();
    });
  }

 if (form) {
    form.addEventListener('reset', function () {
      setTimeout(() => {
        jobChange();
      }, 0);
    });
  }

  if (exForm) {
    exForm.addEventListener('reset', function () {
      setTimeout(() => {
        populateExInstall();
        calculateExistingCable();
      }, 0);
    });
  }

  populateInstall();
  calculateCable();
})();

/* =========================================================
   EEEGPT MAIN APPLICATION LOGIC (app.js - Part 2/2)
========================================================= */

/* =========================================================
   PAGE CONTROL & BREAKER SELECTION
========================================================= */

function hideAllPages() {
  const homeEl = document.getElementById('home');
  if (homeEl) homeEl.style.display = 'none';
  document.querySelectorAll('.page').forEach(el => el.classList.remove('on'));

  [
    'electricalPage',
    'auditPage',
    'auditReminderPage',
    'standardViewPage',
    'loadPage',
    'converterPage',
    'cablePage',
    'breakerPage',
   'pfiPage',
    'substationToolPage',
    'upsPage',
   'electronicsPage',
    'automationPage',
   'auditChecklistPage',
    'simulationLabPage',
    'automationToolsPage'
  ].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.remove('on');
  });
}

function showBreakerSelection() {
  hideAllPages();
  const page = document.getElementById('breakerPage');
  if (page) page.classList.add('on');
  calculateBreaker();
  history.pushState({ page: 'breaker' }, '', '#breaker');
}

function backFromBreaker() {
  hideAllPages();
  document.getElementById('electricalPage').classList.add('on');
  history.pushState({ page: 'electrical' }, '', '#electrical');
}

function showPfiCalculator() {
  hideAllPages();
  const page = document.getElementById('pfiPage');
  if (page) page.classList.add('on');
  calculatePfi();
  history.pushState({ page: 'pfi' }, '', '#pfi');
}

function backFromPfi() {
  hideAllPages();
  document.getElementById('electricalPage').classList.add('on');
  history.pushState({ page: 'electrical' }, '', '#electrical');
}

function pfiPhaseChange() {
  const ph = document.getElementById('pfiPhase').value;
  document.getElementById('pfiVoltage').value = ph === '3' ? '415' : '230';
  calculatePfi();
}

function generatePfiSteps(kvar) {
  const preset = {
    5: '1 × 5 kVAR (Fixed)',
    10: '5 + 5 kVAR (2 Steps)',
    15: '5 + 10 kVAR (2 Steps)',
    20: '5 + 5 + 10 kVAR (3 Steps)',
    25: '5 + 10 + 10 kVAR (3 Steps)',
    30: '5 + 10 + 15 kVAR (3 Steps)',
    40: '5 + 10 + 10 + 15 kVAR (4 Steps)',
    50: '5 + 10 + 10 + 25 kVAR (4 Steps)',
    60: '5 + 10 + 20 + 25 kVAR (4 Steps)',
    75: '5 + 10 + 10 + 25 + 25 kVAR (5 Steps)',
    100: '5 + 10 + 15 + 20 + 25 + 25 kVAR (6 Steps)',
    125: '5 + 10 + 10 + 25 + 25 + 50 kVAR (6 Steps)',
    150: '5 + 10 + 10 + 25 + 50 + 50 kVAR (6 Steps)',
    175: '5 + 10 + 10 + 25 + 25 + 50 + 50 kVAR (7 Steps)',
    200: '10 + 15 + 25 + 50 + 50 + 50 kVAR (6 Steps)',
    250: '10 + 15 + 25 + 50 + 50 + 50 + 50 kVAR (7 Steps)',
    300: '10 + 15 + 25 + 50×5 kVAR (8 Steps)'
  };
  if (preset[kvar]) return preset[kvar];
  const rem = kvar - 50;
  const fiftyCount = Math.floor(rem / 50);
  return `10 + 15 + 25 + ${fiftyCount}×50 kVAR (${fiftyCount + 3} Steps)`;
}

function calculatePfi() {
  const val = Number(document.getElementById('pfiLoadVal').value);
  const unit = document.getElementById('pfiLoadUnit').value;
  const ph = document.getElementById('pfiPhase').value;
  const volt = Number(document.getElementById('pfiVoltage').value);
  const pf1 = Number(document.getElementById('pfiCurrentPf').value);
  const pf2 = Number(document.getElementById('pfiTargetPf').value);

  const valid = Number.isFinite(val) && val > 0 &&
    Number.isFinite(volt) && volt > 0 &&
    Number.isFinite(pf1) && pf1 > 0 && pf1 < 1 &&
    Number.isFinite(pf2) && pf2 > 0 && pf2 <= 1;

  if (!valid) {
    document.getElementById('pfiMainResult').textContent = '—';
    document.getElementById('pfiPanelSub').textContent = 'Enter valid Load, Voltage, and PF (0.1–1.0)';
    return;
  }

  const phFactor = ph === '3' ? Math.sqrt(3) : 1;
  let kw = val;
  if (unit === 'kva') kw = val * pf1;
  else if (unit === 'amp') kw = (phFactor * volt * val * pf1) / 1000;

  const iBefore = (kw * 1000) / (phFactor * volt * pf1);
  const iAfter = (kw * 1000) / (phFactor * volt * pf2);
  const kvaBefore = kw / pf1;
  const kvaAfter = kw / pf2;

  if (pf1 >= pf2) {
    document.getElementById('pfiMainResult').textContent = '0 kVAR (Not Needed)';
    document.getElementById('pfiPanelSub').textContent = `Current PF (${pf1}) is already ≥ Target PF (${pf2})`;
    document.getElementById('pfiStepsResult').textContent = 'None';
    document.getElementById('pfiCurrentSave').textContent = `${iBefore.toFixed(1)} A (Unchanged)`;
    document.getElementById('pfiKvaFree').textContent = '0 kVA freed';
    document.getElementById('pfiBreaker').textContent = '—';
    document.getElementById('pfiCable').textContent = '—';
    return;
  }

  const phi1 = Math.acos(pf1);
  const phi2 = Math.acos(pf2);
  const tan1 = Math.tan(phi1);
  const tan2 = Math.tan(phi2);
  const exactKvar = kw * (tan1 - tan2);

  const STD_BANKS = [5, 10, 15, 20, 25, 30, 40, 50, 60, 75, 100, 125, 150, 175, 200, 250, 300, 350, 400, 450, 500, 600, 750, 1000];
  const stdKvar = STD_BANKS.find(k => k >= exactKvar) || Math.ceil(exactKvar / 50) * 50;

  const capCurrent = (stdKvar * 1000) / (phFactor * volt);
  const designCurrent = capCurrent * 1.35;

  const STD_BREAKERS = [6, 10, 16, 20, 25, 32, 40, 50, 63, 80, 100, 125, 160, 200, 250, 315, 400, 500, 630, 800, 1000, 1250, 1600, 2000];
  const In = STD_BREAKERS.find(r => r >= designCurrent) || Math.ceil(designCurrent);
  const brkType = In > 630 ? 'ACB' : (In > 63 ? 'MCCB' : 'MCB');

  const COPPER_CAPS = [
    { size: 1.5, cap: 14 }, { size: 2.5, cap: 20 }, { size: 4, cap: 26 },
    { size: 6, cap: 33 }, { size: 10, cap: 44 }, { size: 16, cap: 60 },
    { size: 25, cap: 77 }, { size: 35, cap: 95 }, { size: 50, cap: 130 },
    { size: 70, cap: 166 }, { size: 95, cap: 202 }, { size: 120, cap: 232 },
    { size: 150, cap: 266 }, { size: 185, cap: 305 }, { size: 240, cap: 360 },
    { size: 300, cap: 420 }, { size: 400, cap: 511 }
  ];

  let cableTxt = 'Verification Required';
  let cableNote = 'Verify busbar / parallel feeder';
  const singleCap = COPPER_CAPS.find(c => c.cap >= In);
  if (singleCap) {
    cableTxt = `${singleCap.size} mm² Cu`;
    cableNote = `Ampacity: ${singleCap.cap} A ≥ ${In} A Breaker`;
  } else {
    for (let r = 2; r <= 6; r++) {
      const match = COPPER_CAPS.find(c => c.cap >= (In / r));
      if (match) {
        cableTxt = `${r} × (${match.size} mm²) Cu`;
        cableNote = `${r} Parallel Runs | Total: ${match.cap * r} A ≥ ${In} A`;
        break;
      }
    }
  }

  const savedAmps = iBefore - iAfter;
  const savedPct = ((kvaBefore - kvaAfter) / kvaBefore) * 100;

  document.getElementById('pfiMainResult').textContent = `${exactKvar.toFixed(1)} kVAR → ${stdKvar} kVAR Panel`;
  document.getElementById('pfiPanelSub').textContent = `Active Load: ${kw.toFixed(1)} kW | Capacitor Rated Current: ${capCurrent.toFixed(1)} A @ ${volt} V`;
  document.getElementById('pfiStepsResult').textContent = generatePfiSteps(stdKvar);
  document.getElementById('pfiStepsNote').textContent = 'Detuned 7% Reactor recommended if VFD/Harmonics > 15%';
  document.getElementById('pfiCurrentSave').textContent = `${iBefore.toFixed(1)} A → ${iAfter.toFixed(1)} A (-${savedAmps.toFixed(1)} A)`;
  document.getElementById('pfiKvaFree').textContent = `${(kvaBefore - kvaAfter).toFixed(1)} kVA freed (${savedPct.toFixed(1)}% Transformer relief)`;
  document.getElementById('pfiBreaker').textContent = `${In} A ${brkType} (${ph === '3' ? '3P' : '2P'})`;
  document.getElementById('pfiBreakerNote').textContent = `135% Design Current = ${designCurrent.toFixed(1)} A (IEC 60831)`;
  document.getElementById('pfiCable').textContent = cableTxt;
  document.getElementById('pfiCableNote').textContent = cableNote;

  document.getElementById('pfiFormulaDetails').innerHTML = `
    <strong>1. Reactive Power Formula:</strong><br>
    Qc = P × (tan φ₁ − tan φ₂)<br>
    • cos φ₁ = ${pf1} → tan φ₁ = <strong>${tan1.toFixed(3)}</strong><br>
    • cos φ₂ = ${pf2} → tan φ₂ = <strong>${tan2.toFixed(3)}</strong><br>
    • Qc = ${kw.toFixed(1)} × (${tan1.toFixed(3)} − ${tan2.toFixed(3)}) = <strong>${exactKvar.toFixed(2)} kVAR</strong><br><br>
    <strong>2. Bangladesh Utility Standard (DESCO / DPDC / BPDB / BREB):</strong><br>
    • Minimum required Power Factor is <strong>0.95</strong> (below 0.95 triggers monthly PF Penalty surcharge).<br>
    • Recommended APFI relay target setting: <strong>0.97 – 0.98 Lag</strong> (avoids leading PF penalty at light load).<br>
    • Note: Use capacitor-duty contactors with damping resistors for each stage.
  `;
}

function brkTypeChange() {
  const type = document.getElementById('brkLoadType').value;

  if (type.startsWith('motor_')) {
    document.getElementById('brkLoadUnit').value = 'kw';
    document.getElementById('brkPhase').value = '3';
    document.getElementById('brkVoltage').value = '400';
    document.getElementById('brkPf').value = '0.85';
    document.getElementById('brkEff').value = '0.90';
  } else if (type === 'transformer') {
    document.getElementById('brkLoadUnit').value = 'kva';
    document.getElementById('brkLoadVal').value = '250';
    document.getElementById('brkPhase').value = '3';
    document.getElementById('brkVoltage').value = '400';
    document.getElementById('brkPf').value = '0.80';
    document.getElementById('brkEff').value = '1.0';
    document.getElementById('brkFaultLocation').value = 'main_lt';
  } else if (type === 'capacitor') {
    document.getElementById('brkLoadUnit').value = 'kva';
    document.getElementById('brkLoadVal').value = '50';
    document.getElementById('brkPhase').value = '3';
    document.getElementById('brkVoltage').value = '400';
    document.getElementById('brkPf').value = '1.0';
    document.getElementById('brkEff').value = '1.0';
  } else if (type === 'dc_load') {
    document.getElementById('brkLoadUnit').value = 'amp';
    document.getElementById('brkPhase').value = 'dc';
    document.getElementById('brkVoltage').value = '110';
    document.getElementById('brkPf').value = '1.0';
    document.getElementById('brkEff').value = '1.0';
  } else {
    document.getElementById('brkLoadUnit').value = 'kw';
    document.getElementById('brkPhase').value = '1';
    document.getElementById('brkVoltage').value = '230';
    document.getElementById('brkPf').value = '0.90';
    document.getElementById('brkEff').value = '1.0';
  }

  calculateBreaker();
}

function brkPhaseChange() {
  const phaseVal = document.getElementById('brkPhase').value;
  if (phaseVal === '1') document.getElementById('brkVoltage').value = '230';
  else if (phaseVal === '3') document.getElementById('brkVoltage').value = '400';
  else document.getElementById('brkVoltage').value = '110';
  calculateBreaker();
}

function calculateBreaker() {
  const loadType = document.getElementById('brkLoadType') ? document.getElementById('brkLoadType').value : 'motor_dol';
  const val = Number(document.getElementById('brkLoadVal').value);
  const unit = document.getElementById('brkLoadUnit').value;
  const phaseVal = document.getElementById('brkPhase').value;
  const voltage = Number(document.getElementById('brkVoltage').value);
  const pf = Number(document.getElementById('brkPf').value) || 0.85;
  const eff = Number(document.getElementById('brkEff').value) || 0.90;
  const location = document.getElementById('brkFaultLocation').value;

  if (!Number.isFinite(val) || val <= 0 || !Number.isFinite(voltage) || voltage <= 0) {
    document.getElementById('brkFinalResult').textContent = '—';
    return;
  }

  let ib = 0;
  const phaseFactor = phaseVal === '3' ? Math.sqrt(3) : 1;

  if (unit === 'amp') {
    ib = val;
  } else if (unit === 'kva') {
    ib = (val * 1000) / (phaseFactor * voltage);
  } else if (unit === 'hp') {
    ib = (val * 745.7) / (phaseFactor * voltage * pf * eff);
  } else {
    const watt = val * 1000;
    ib = phaseVal === 'dc' ? watt / voltage : watt / (phaseFactor * voltage * pf * eff);
  }

  let safetyMultiplier = 1.0;
  let sizingRuleNote = 'Standard 100% Load Current';

  if (loadType.startsWith('motor_')) {
    safetyMultiplier = 1.25;
    sizingRuleNote = '125% Motor Continuous Duty (BNBC 2.7.4.3 & NEC 430.22)';
  } else if (loadType === 'capacitor') {
    safetyMultiplier = 1.35;
    sizingRuleNote = '135% Capacitor Duty Factor (IEC 60831 & Harmonics)';
  } else if (loadType === 'general') {
    safetyMultiplier = 1.25;
    sizingRuleNote = '125% Continuous Duty Factor (NFPA 70 Art 210.20)';
  }

  const iDesign = ib * safetyMultiplier;

  const STANDARD_BREAKERS = [
    6, 10, 16, 20, 25, 32, 40, 50, 63, 80, 100,
    125, 160, 200, 250, 315, 350, 400, 500, 630, 800,
    1000, 1250, 1600, 2000, 2500, 3200, 4000, 5000, 6300
  ];
  const In = STANDARD_BREAKERS.find(r => r >= iDesign) || Math.ceil(iDesign);

  const COPPER_CABLE_CAPACITIES = [
    { size: 1.5, cap: 14 }, { size: 2.5, cap: 20 }, { size: 4, cap: 26 },
    { size: 6, cap: 33 }, { size: 10, cap: 44 }, { size: 16, cap: 60 },
    { size: 25, cap: 77 }, { size: 35, cap: 95 }, { size: 50, cap: 130 },
    { size: 70, cap: 166 }, { size: 95, cap: 202 }, { size: 120, cap: 232 },
    { size: 150, cap: 266 }, { size: 185, cap: 305 }, { size: 240, cap: 360 },
    { size: 300, cap: 420 }, { size: 400, cap: 511 }
  ];

  let recCableText = 'Verification Required';
  let recCableDetail = 'Satisfies RSC & BNBC Rule Ib ≤ In ≤ Iz';

  const matchedCable = COPPER_CABLE_CAPACITIES.find(c => c.cap >= In);
  if (matchedCable) {
    recCableText = `${matchedCable.size} mm² Cu`;
    recCableDetail = `Capacity: ${matchedCable.cap} A (Iz ≥ In ${In} A) | Copper/PVC`;
  } else {
    for (let r = 2; r <= 8; r++) {
      const perRunIn = In / r;
      const parallelMatch = COPPER_CABLE_CAPACITIES.find(c => c.cap >= perRunIn);
      if (parallelMatch) {
        recCableText = `${r} × (${parallelMatch.size} mm²) Cu`;
        recCableDetail = `${r} Runs in Parallel | Total Cap: ${parallelMatch.cap * r} A (Iz ≥ ${In} A)`;
        break;
      }
    }
  }

  let frameType = 'MCB';
  let frameDetail = 'Miniature Circuit Breaker (Standard Din-Rail Mounted)';

  if (phaseVal === 'dc') {
    frameType = In <= 63 ? 'DC-MCB' : 'DC-MCCB';
    frameDetail = 'Polarized DC Circuit Breaker (IEC 60947-2 Annex P)';
  } else if (In > 630 || (location === 'main_lt' && In >= 800)) {
    frameType = 'ACB';
    frameDetail = 'Air Circuit Breaker (Drawout / Fixed with Microprocessor Trip Unit)';
  } else if (In > 63 || location === 'main_lt' || location === 'sub_panel') {
    frameType = 'MCCB';
    frameDetail = 'Molded Case Circuit Breaker (Thermal-Magnetic / Electronic Trip)';
  } else {
    frameType = 'MCB';
    frameDetail = 'Miniature Circuit Breaker (IEC 60898-1 / Residential & Commercial)';
  }

  let curve = 'Type C';
  let curveNote = 'Trips at 5–10×In (Standard industrial inductive loads)';

  if (loadType === 'motor_dol') {
    curve = 'Type D / Motor Duty';
    curveNote = 'Trips at 10–20×In (Withstands 6–8×In DOL starting inrush without false tripping)';
  } else if (loadType === 'motor_sd') {
    curve = 'Type C';
    curveNote = 'Trips at 5–10×In (Handles 2.5–3×In Star-Delta transition inrush)';
  } else if (loadType === 'motor_vfd') {
    curve = 'Type C / Type B';
    curveNote = 'Trips at 3–5×In / 5–10×In (VFD eliminates heavy starting inrush)';
  } else if (loadType === 'transformer') {
    curve = 'Adjustable Electronic (LSI)';
    curveNote = 'Adjustable magnetic pickup (8–12×In) to withstand magnetizing inrush';
  } else if (loadType === 'capacitor') {
    curve = 'Type D / Capacitor Duty';
    curveNote = 'Withstands high-frequency capacitive switching transient peaks';
  } else if (phaseVal === 'dc') {
    curve = 'DC Curve C';
    curveNote = 'Trips at 7–10×In for DC inductive circuits';
  } else {
    curve = 'Type B / C';
    curveNote = 'Type B (3–5×In) for resistive, Type C (5–10×In) for sockets';
  }

  let icu = '10 kA';
  let icuDetail = 'Standard final branch breaking capacity';
  if (location === 'main_lt') {
    icu = In >= 1000 ? '65 kA / 85 kA' : '50 kA';
    icuDetail = 'Main Substation LT Panel (Close proximity to Transformer)';
  } else if (location === 'sub_panel') {
    icu = In > 250 ? '36 kA / 50 kA' : '25 kA / 36 kA';
    icuDetail = 'Floor Distribution Board / Heavy Factory Sub-Panel';
  } else {
    icu = frameType === 'MCCB' ? '16 kA / 25 kA' : (In <= 32 ? '6 kA / 10 kA' : '10 kA');
    icuDetail = 'Final Sub-DB / Commercial Building Branch';
  }

  let poles = '3-Pole (3P)';
  let poleDetail = '3-Phase unswitched neutral distribution';
  if (phaseVal === '1') {
    poles = In <= 63 ? '1P+N / 2P (DP)' : '2-Pole (2P)';
    poleDetail = 'Phase + Neutral Isolation';
  } else if (phaseVal === 'dc') {
    poles = voltage <= 220 ? '2-Pole DC (2P)' : '4-Pole DC (4P series)';
    poleDetail = 'Positive & Negative Pole Isolation';
  } else {
    poles = location === 'main_lt' ? '3P / 4P (TPN)' : '3-Pole (3P)';
    poleDetail = location === 'main_lt' ? '4-Pole recommended for Generator transfer' : '3-Phase Standard 3P';
  }

  document.getElementById('brkFinalResult').textContent = `${In} A ${frameType}`;
  document.getElementById('brkFrameType').textContent = `${frameDetail} • ${poles}`;
  document.getElementById('brkCurrents').textContent = `FLC: ${ib.toFixed(1)} A → Sizing: ${iDesign.toFixed(1)} A`;
  document.getElementById('brkSizingRule').textContent = sizingRuleNote;
  document.getElementById('brkCableSize').textContent = recCableText;
  document.getElementById('brkCableDetail').textContent = recCableDetail;
  document.getElementById('brkCurve').textContent = curve;
  document.getElementById('brkCurveDetail').textContent = curveNote;
  document.getElementById('brkBreakingCap').textContent = `${icu} (Icu)`;
  document.getElementById('brkBreakingDetail').textContent = icuDetail;
  document.getElementById('brkPoles').textContent = poles;
  document.getElementById('brkPoleDetail').textContent = poleDetail;

  const notesEl = document.getElementById('brkEngineeringNotes');
  if (notesEl) {
    notesEl.innerHTML = `
      <strong>1. Standards & Code References:</strong><br>
  • <strong>BNBC 2020 Cl. 1.3.30 (a)–(d) &amp; IEC 60364-4-43:</strong> Coordination rule <em>Ib (${ib.toFixed(1)} A) ≤ In (${In} A) ≤ Iz</em> satisfied—selected cable ampacity exceeds breaker rating so cable never burns before tripping.<br>
      • <strong>Device Standard (${frameType === 'MCB' ? 'IEC 60898-1' : 'IEC 60947-2'}):</strong> Frame &amp; ${icu} breaking capacity matched to installation fault zone.<br>
      • <strong>NFPA 70 (NEC) Art. 210.20 &amp; 430.22 / IEC 60831:</strong> Application duty multiplier (${(safetyMultiplier * 100).toFixed(0)}%) applied.<br>
      • <strong>Motor Overload Protection:</strong> Thermal Overload Relay (OLR) must be set to 100% of motor nameplate FLC (<strong>${ib.toFixed(1)} A</strong>), while this ${In} A breaker provides short-circuit/backup protection.<br><br>
      <strong>2. Device Specification:</strong><br>
      • <strong>Device Frame:</strong> ${frameType} (${frameDetail})<br>
      • <strong>Nominal Rating (In):</strong> ${In} A | <strong>Tripping Curve:</strong> ${curve}<br>
      • <strong>Rated Breaking Capacity (Icu):</strong> ${icu} (${icuDetail})<br>
      • <strong>Minimum Safe Cable Size:</strong> <strong>${recCableText}</strong> (${recCableDetail})
    `;
  }
}

function home() {
  hideAllPages();
  document.getElementById('home').style.display = 'block';
  history.pushState({ page: 'home' }, '', '#home');
}

function showElectrical() {
  hideAllPages();
  document.getElementById('electricalPage').classList.add('on');
  history.pushState({ page: 'electrical' }, '', '#electrical');
}

function showLoadCalculator() {
  hideAllPages();
  document.getElementById('loadPage').classList.add('on');
  history.pushState({ page: 'load' }, '', '#load');
}

function backFromLoad() {
  hideAllPages();
  document.getElementById('electricalPage').classList.add('on');
  history.pushState({ page: 'electrical' }, '', '#electrical');
}

function backFromConverter() {
  hideAllPages();
  document.getElementById('electricalPage').classList.add('on');
  history.pushState({ page: 'electrical' }, '', '#electrical');
}

/* =========================================================
   LOAD CALCULATOR
========================================================= */

function addLoadRow(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const row = document.createElement('div');
  row.className = 'load-row';
  row.innerHTML = `
    <input type="number" class="load-qty" min="0" placeholder="Qty">
    <input type="number" class="load-watt" min="0" step="any" placeholder="Watt" oninput="clearKW(this)">
    <input type="number" class="load-kw" min="0" step="any" placeholder="kW" oninput="clearWatt(this)">
    <input type="number" class="load-hours" min="0" step="0.1" placeholder="Hours">
    <button type="button" class="remove-load" onclick="removeLoadRow(this)">×</button>
  `;
  container.appendChild(row);
}

function clearKW(input) {
  const row = input.closest('.load-row');
  if (!row) return;
  if (input.value !== '') row.querySelector('.load-kw').value = '';
  calculateLoad(getActiveLoadType());
}

function clearWatt(input) {
  const row = input.closest('.load-row');
  if (!row) return;
  if (input.value !== '') row.querySelector('.load-watt').value = '';
  calculateLoad(getActiveLoadType());
}

function getActiveLoadType() {
  return 'residential';
}

function removeLoadRow(button) {
  const row = button.closest('.load-row');
  if (!row) return;

  const inputs = row.querySelectorAll('input');
  const hasValues = Array.from(inputs).some(input => input.value.trim() !== '');

  if (hasValues) {
    inputs.forEach(input => { input.value = ''; });
    calculateLoad('residential');
    return;
  }

  const container = row.parentElement;
  if (container.children.length > 1) row.remove();
  calculateLoad('residential');
}

function calculateLoad(type) {
  const container = document.getElementById('residentialData');
  if (!container) return;

  let totalWatt = 0;
  let totalKWh = 0;
  const details = [];

  container.querySelectorAll('.load-row').forEach((row, index) => {
    const qtyInput = row.querySelector('.load-qty');
    const wattInput = row.querySelector('.load-watt');
    const kwInput = row.querySelector('.load-kw');
    const hoursInput = row.querySelector('.load-hours');

    if (!qtyInput || !wattInput || !kwInput || !hoursInput) return;

    const qtyText = qtyInput.value.trim();
    const wattText = wattInput.value.trim();
    const kwText = kwInput.value.trim();
    const hoursText = hoursInput.value.trim();

    if (qtyText === '') return;
    const qty = Number(qtyText);
    if (!Number.isFinite(qty) || qty <= 0) return;
    if (wattText !== '' && kwText !== '') return;

    let unitWatt;
    if (wattText !== '') unitWatt = Number(wattText);
    else if (kwText !== '') unitWatt = Number(kwText) * 1000;
    else return;

    if (!Number.isFinite(unitWatt) || unitWatt <= 0) return;

    const connectedWatt = qty * unitWatt;
    const connectedKW = connectedWatt / 1000;
    totalWatt += connectedWatt;

    let hours = 0;
    if (hoursText !== '') {
      hours = Number(hoursText);
      if (!Number.isFinite(hours) || hours < 0) hours = 0;
    }

    const energy = connectedKW * hours;
    totalKWh += energy;

    const parentGroup = row.closest('.load-group');
    const groupTitle = parentGroup ? (parentGroup.querySelector('.load-group-title')?.innerText || 'Load') : 'Load';

    details.push(`
      <div class="formula-line">
        <strong>${groupTitle} #${index + 1}</strong>: Qty ${qty} × ${unitWatt.toFixed(1)} W = <strong>${connectedWatt.toFixed(1)} W (${connectedKW.toFixed(3)} kW)</strong> | Usage: ${hours} h/day (${energy.toFixed(3)} kWh)
      </div>
    `);
  });

 const totalKW = totalWatt / 1000;
  const divEl = document.getElementById('loadDiversityFactor');
  const DIVERSITY_FACTOR = divEl ? (Number(divEl.value) || 0.75) : 0.75;
  const maxDemandKW = totalKW * DIVERSITY_FACTOR;
  const divLabel = document.getElementById('loadMaxDemandLabel');
  if (divLabel) divLabel.textContent = `MAX DEMAND (${Math.round(DIVERSITY_FACTOR * 100)}%)`;

  const PF_RES = 0.90;
  let meterType = 'Single Phase (1-Phase)';
  let meterRule = 'Sanction Load ≤ 7.5 kW Rule';
  let mainCurrent = 0;

  if (maxDemandKW <= 0) {
    meterType = 'Single Phase';
    meterRule = 'Enter load to determine';
    mainCurrent = 0;
  } else if (maxDemandKW <= 7.5) {
    mainCurrent = (maxDemandKW * 1000) / (230 * PF_RES);
    meterType = 'Single Phase (230 V)';
    meterRule = `Sanction Load ${maxDemandKW.toFixed(2)} kW ≤ 7.5 kW`;
  } else if (maxDemandKW <= 50) {
    mainCurrent = (maxDemandKW * 1000) / (Math.sqrt(3) * 400 * PF_RES);
    meterType = 'Three Phase (400 V)';
    meterRule = 'Sanction Load > 7.5 kW (3-Phase Mandatory)';
  } else {
    mainCurrent = (maxDemandKW * 1000) / (Math.sqrt(3) * 400 * PF_RES);
    meterType = 'Dedicated Substation';
    meterRule = 'Load > 50 kW: HT Consumer (11/0.415 kV)';
  }

  const monthlyKWh = totalKWh * 30;

  if (document.getElementById('loadTotalKW')) document.getElementById('loadTotalKW').textContent = `${totalKW.toFixed(3)} kW`;
  if (document.getElementById('loadTotalWatt')) document.getElementById('loadTotalWatt').textContent = `${Math.round(totalWatt)} W`;
  if (document.getElementById('loadMaxDemandKW')) document.getElementById('loadMaxDemandKW').textContent = `${maxDemandKW.toFixed(3)} kW`;
  if (document.getElementById('loadMeterType')) document.getElementById('loadMeterType').textContent = meterType;
  if (document.getElementById('loadMeterRule')) document.getElementById('loadMeterRule').textContent = meterRule;
  if (document.getElementById('loadMainCurrent')) document.getElementById('loadMainCurrent').textContent = `${mainCurrent.toFixed(1)} A`;
  if (document.getElementById('loadTotalKWH')) document.getElementById('loadTotalKWH').textContent = `Daily Energy: ${totalKWh.toFixed(2)} kWh/day`;
  if (document.getElementById('loadMonthlyKWH')) document.getElementById('loadMonthlyKWH').textContent = `Monthly Billing Energy: ~${Math.round(monthlyKWh)} Units (kWh)`;

  const formulaDetails = document.getElementById('loadFormulaDetails');
  if (formulaDetails) {
    formulaDetails.innerHTML = `
      <div class="formula-line">
 <strong>1. Connected Load vs Maximum Demand (BNBC 2020 Sec 1.3.2 &amp; Appendix A)</strong><br>
        Total Connected Load = <strong>${totalKW.toFixed(3)} kW (${Math.round(totalWatt)} W)</strong><br>
        Maximum Demand = Connected Load × ${DIVERSITY_FACTOR} Diversity = <strong>${maxDemandKW.toFixed(3)} kW</strong><br>
        <em>Why right:</em> BNBC Sec 1.3.2 requires practical diversity factor since all appliances rarely run simultaneously at 100%.
      </div>
      <div class="formula-line">
        <strong>2. Nominal Voltage &amp; Service Sizing (BNBC 2020 Sec 1.1.4 &amp; BPDB/DESCO/DPDC/BREB Rules)</strong><br>
        Nominal 230 V (1-Ph ≤ 7.5 kW) / 400 V (3-Ph &gt; 7.5 kW) | Dedicated HT Substation &gt; 50 kW.<br>
        Connection Type: <strong>${meterType}</strong> (${meterRule})<br>
        Service Current at 0.90 PF = <strong>${mainCurrent.toFixed(1)} A</strong>
      </div>
      <div class="formula-line">
        <strong>3. Energy Consumption Estimate</strong><br>
        Daily Energy = <strong>${totalKWh.toFixed(2)} kWh/day</strong><br>
        Monthly Energy (30 days) = <strong>~${Math.round(monthlyKWh)} Units (kWh/month)</strong>
      </div>
      <div class="formula-line">
        <strong>Item-wise Breakdown:</strong>
        ${details.length ? details.join('') : '<br>No active load rows.'}
      </div>
    `;
  }
}

document.getElementById('loadPage').addEventListener('input', function (event) {
  if (event.target.closest('.load-row')) calculateLoad('residential');
});

document.getElementById('loadPage').addEventListener('click', function (event) {
  if (event.target.closest('.add-load') || event.target.closest('.remove-load')) {
    calculateLoad('residential');
  }
});

calculateLoad('residential');

/* =========================================================
   AUDIT REPORT SUBMISSION REMINDER ENGINE
========================================================= */
const AUDIT_STORAGE_KEY = 'eeegpt_audit_reports_v1';

const AUDIT_FREQ_LABELS = {
  '1m': 'Monthly',
  '3m': 'Quarterly',
  '6m': 'Half-Yearly',
  '1y': 'Yearly',
  '2y': 'Every 2 Years',
  '3y': 'Every 3 Years',
  '4y': 'Every 4 Years',
  '5y': 'Every 5 Years',
  'custom': 'Custom'
};

function getAuditReports() {
  try {
    const raw = localStorage.getItem(AUDIT_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveAuditReportsToStorage(list) {
  localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(list));
}

function parseLocalDate(str) {
  if (!str) return null;
  const parts = str.split('-').map(Number);
  if (parts.length !== 3) return null;
  return new Date(parts[0], parts[1] - 1, parts[2]);
}

function toInputDateStr(dateObj) {
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, '0');
  const d = String(dateObj.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatShortDate(str) {
  const d = parseLocalDate(str);
  if (!d) return '—';
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${d.getDate()}-${months[d.getMonth()]}-${String(d.getFullYear()).slice(-2)}`;
}

function getDayLeft(expStr) {
  const exp = parseLocalDate(expStr);
  if (!exp) return null;
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((exp - today) / 86400000);
}

function getAlertThresholdDays(freq) {
  if (freq === '1m') return 7;
  if (freq === '3m') return 14;
  if (freq === '6m') return 21;
  return 30;
}

function evaluateReportStatus(report) {
  const dayLeft = getDayLeft(report.expDate);
  const threshold = getAlertThresholdDays(report.freq);

  if (dayLeft === null) return { dayLeft: '—', level: 'unknown', label: 'Invalid Date', isRed: false };
  if (dayLeft < 0) return { dayLeft, level: 'expired', label: 'Expired', isRed: true };
  if (dayLeft <= threshold) return { dayLeft, level: 'due', label: 'Due Soon', isRed: true };
  if (dayLeft <= threshold * 2) return { dayLeft, level: 'upcoming', label: 'Good', isRed: false };
  return { dayLeft, level: 'excellent', label: 'Excellent', isRed: false };
}

function autoCalculateExpireDate() {
  const subVal = document.getElementById('auditSubDate').value;
  const freq = document.getElementById('auditRetestFreq').value;
  const expInput = document.getElementById('auditExpDate');

  if (!subVal || freq === 'custom') return;
  const d = parseLocalDate(subVal);
  if (!d) return;

  if (freq === '1m') d.setMonth(d.getMonth() + 1);
  else if (freq === '3m') d.setMonth(d.getMonth() + 3);
  else if (freq === '6m') d.setMonth(d.getMonth() + 6);
  else if (freq === '1y') d.setFullYear(d.getFullYear() + 1);
  else if (freq === '2y') d.setFullYear(d.getFullYear() + 2);
  else if (freq === '3y') d.setFullYear(d.getFullYear() + 3);
  else if (freq === '4y') d.setFullYear(d.getFullYear() + 4);
  else if (freq === '5y') d.setFullYear(d.getFullYear() + 5);

  d.setDate(d.getDate() - 1);
  expInput.value = toInputDateStr(d);
}

function saveAuditReport() {
  const name = document.getElementById('auditReportName').value.trim();
  const rscId = document.getElementById('auditRscId').value.trim();
  const freq = document.getElementById('auditRetestFreq').value;
  const subDate = document.getElementById('auditSubDate').value;
  const expDate = document.getElementById('auditExpDate').value;
  const remarks = document.getElementById('auditRemarks').value.trim();
  const editId = document.getElementById('auditEditId').value;

  if (!name || !subDate || !expDate) {
    alert('Please enter Report Name, Submission Date, and Expire Date.');
    return;
  }

  const list = getAuditReports();
  if (editId) {
    const idx = list.findIndex(item => item.id === editId);
    if (idx !== -1) list[idx] = { ...list[idx], name, rscId, freq, subDate, expDate, remarks };
  } else {
    list.push({ id: 'rep_' + Date.now(), name, rscId, freq, subDate, expDate, remarks });
  }

  saveAuditReportsToStorage(list);
  syncAuditToFirebase();
  cancelAuditEdit();
  renderAuditReports();
  updateAuditBadges(false);
}

function editAuditReport(id) {
  const list = getAuditReports();
  const item = list.find(r => r.id === id);
  if (!item) return;

  document.getElementById('auditEditId').value = item.id;
  document.getElementById('auditReportName').value = item.name;
  document.getElementById('auditRscId').value = item.rscId || '';
  document.getElementById('auditRetestFreq').value = item.freq || '1y';
  document.getElementById('auditSubDate').value = item.subDate;
  document.getElementById('auditExpDate').value = item.expDate;
  document.getElementById('auditRemarks').value = item.remarks || '';

  document.getElementById('auditFormTitle').textContent = 'EDIT AUDIT REPORT';
  document.getElementById('auditSaveBtn').textContent = '✓ Update Report';
  document.getElementById('auditCancelBtn').style.display = 'inline-block';
  document.getElementById('auditFormCard').scrollIntoView({ behavior: 'smooth' });
}

function cancelAuditEdit() {
  document.getElementById('auditEditId').value = '';
  document.getElementById('auditReportName').value = '';
  document.getElementById('auditRscId').value = '';
  document.getElementById('auditRetestFreq').value = '1y';
  document.getElementById('auditSubDate').value = '';
  document.getElementById('auditExpDate').value = '';
  document.getElementById('auditRemarks').value = '';

  document.getElementById('auditFormTitle').textContent = 'ADD / UPDATE AUDIT REPORT';
  document.getElementById('auditSaveBtn').textContent = '＋ Save Report';
  document.getElementById('auditCancelBtn').style.display = 'none';
}

function deleteAuditReport(id) {
  if (!confirm('Are you sure you want to delete this report?')) return;
  const list = getAuditReports().filter(r => r.id !== id);
  saveAuditReportsToStorage(list);
  syncAuditToFirebase();
  renderAuditReports();
  updateAuditBadges(false);
}

function escapeHTML(str) {
  return String(str || '').replace(/[&<>"']/g, m => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[m]));
}

function renderAuditReports() {
  const list = getAuditReports();
  const filter = document.getElementById('auditFilterStatus') ? document.getElementById('auditFilterStatus').value : 'all';
  const tbody = document.getElementById('auditTableBody');
  if (!tbody) return;

  let validCount = 0;
  let dueCount = 0;
  let expiredCount = 0;
  const redAlerts = [];

  const enriched = list.map(r => {
    const st = evaluateReportStatus(r);
    if (st.level === 'expired') {
      expiredCount++;
      redAlerts.push(`${r.name} (Expired ${Math.abs(st.dayLeft)}d ago)`);
    } else if (st.level === 'due') {
      dueCount++;
      redAlerts.push(`${r.name} (${st.dayLeft} days left)`);
    } else {
      validCount++;
    }
    return { ...r, st };
  });

  enriched.sort((a, b) => (a.st.dayLeft ?? 99999) - (b.st.dayLeft ?? 99999));

  document.getElementById('kpiTotalReports').textContent = list.length;
  document.getElementById('kpiValidReports').textContent = validCount;
  document.getElementById('kpiDueReports').textContent = dueCount;
  document.getElementById('kpiExpiredReports').textContent = expiredCount;

  const banner = document.getElementById('auditAlertBanner');
  if (banner) {
    if (redAlerts.length > 0) {
      banner.style.display = 'block';
      banner.innerHTML = `<strong>🔔 Action Required (${redAlerts.length} Report${redAlerts.length > 1 ? 's' : ''}):</strong><br>` +
        redAlerts.map(msg => `• ${escapeHTML(msg)}`).join('<br>');
    } else {
      banner.style.display = 'none';
      banner.innerHTML = '';
    }
  }

  const filtered = enriched.filter(item => {
    if (filter === 'red') return item.st.isRed;
    if (filter === 'valid') return !item.st.isRed;
    return true;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="9" style="text-align:center; color:var(--m); padding:20px;">No matching audit reports found.</td></tr>';
    return;
  }

  tbody.innerHTML = filtered.map(r => {
    const st = r.st;
    const rowClass = st.isRed ? 'row-red' : '';
    let statusHtml = `<span class="audit-status-excellent">${st.label}</span>`;
    if (st.isRed) statusHtml = `<span class="audit-status-red">${st.label}</span>`;
    else if (st.level === 'upcoming') statusHtml = `<span class="audit-status-warning">${st.label}</span>`;

    const dayText = st.dayLeft < 0 ? `${st.dayLeft} (Overdue)` : st.dayLeft;

    return `
      <tr class="${rowClass}">
        <td>${escapeHTML(r.name)}</td>
        <td>${escapeHTML(r.rscId || '—')}</td>
        <td style="color:#059669; font-weight:700;">${formatShortDate(r.subDate)}</td>
        <td style="color:#1d4ed8; font-weight:700;">${formatShortDate(r.expDate)}</td>
        <td>${AUDIT_FREQ_LABELS[r.freq] || r.freq}</td>
        <td style="font-weight:800;">${dayText}</td>
        <td>${statusHtml}</td>
        <td>${escapeHTML(r.remarks || '')}</td>
        <td class="audit-row-act">
          <button type="button" onclick="editAuditReport('${r.id}')" title="Edit">✏️</button>
          <button type="button" class="del" onclick="deleteAuditReport('${r.id}')" title="Delete">🗑️</button>
        </td>
      </tr>
    `;
  }).join('');
}

const VAPID_PUBLIC_KEY = 'BPJ1PJUFFAYMWdcwWuXHDVP-yjag-Bhru2gW7VS46wCn8uOawg6zpNrloMs7MyoAZ_rZHiJIcG70h8RfYpcKKZ8';
const AUDIT_DEVICE_KEY = 'eeegpt_device_id';

function getAuditDeviceId() {
  let id = localStorage.getItem(AUDIT_DEVICE_KEY);
  if (!id) {
    id = 'dev_' + Date.now() + '_' + Math.random().toString(36).slice(2, 10);
    localStorage.setItem(AUDIT_DEVICE_KEY, id);
  }
  return id;
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

async function syncAuditToFirebase(customSub, throwOnError = false) {
  try {
    if (!window.firebaseDB || !window.firebaseSet || !window.firebaseRef) {
      throw new Error('Firebase এখনো লোড হয়নি।');
    }
    const deviceId = getAuditDeviceId();
    const reports = getAuditReports();

    let subData = customSub || null;
    if (!subData && 'serviceWorker' in navigator && 'PushManager' in window) {
      const reg = await navigator.serviceWorker.ready;
      const existingSub = await reg.pushManager.getSubscription();
      if (existingSub) subData = existingSub.toJSON();
    }

    await window.firebaseSet(
      window.firebaseRef(window.firebaseDB, 'audit_devices/' + deviceId + '/reports'),
      reports
    );
    if (subData) {
      await window.firebaseSet(
        window.firebaseRef(window.firebaseDB, 'audit_devices/' + deviceId + '/subscription'),
        subData
      );
    }
    await window.firebaseSet(
      window.firebaseRef(window.firebaseDB, 'audit_devices/' + deviceId + '/updatedAt'),
      Date.now()
    );
    return true;
  } catch (err) {
    console.warn('Firebase audit sync skipped:', err);
    if (throwOnError) throw err;
    return false;
  }
}

function updateAuditBadges(triggerOSNotify) {
  const list = getAuditReports();
  const redItems = list.filter(r => evaluateReportStatus(r).isRed);
  const count = redItems.length;

  ['homeAuditBadge', 'auditToolBadge'].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    if (count > 0) {
      el.style.display = 'inline-flex';
      el.textContent = count;
    } else {
      el.style.display = 'none';
    }
  });

  if (navigator.setAppBadge) {
    if (count > 0) navigator.setAppBadge(count).catch(() => {});
    else if (navigator.clearAppBadge) navigator.clearAppBadge().catch(() => {});
  }

  if (triggerOSNotify && count > 0 && 'Notification' in window && Notification.permission === 'granted') {
    const todayKey = 'eeegpt_last_notify_' + toInputDateStr(new Date());
    if (!sessionStorage.getItem(todayKey)) {
      sessionStorage.setItem(todayKey, '1');
      new Notification(`EEEGPT Audit Alert (${count} Report Due)`, {
        body: redItems.slice(0, 3).map(r => `${r.name} (${evaluateReportStatus(r).dayLeft}d left)`).join('\n'),
        icon: 'assets/icon.webp'
      });
    }
  }
}

async function requestAuditNotificationPermission() {
  if (!('Notification' in window)) {
    alert('This browser does not support notifications.');
    return;
  }
  if (!VAPID_PUBLIC_KEY || VAPID_PUBLIC_KEY === 'YOUR_VAPID_PUBLIC_KEY_HERE') {
    alert('VAPID Public Key বসানো হয়নি!');
    return;
  }

  const perm = await Notification.requestPermission();
  if (perm !== 'granted') {
    alert('Notification permission was not granted.');
    return;
  }

  try {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      alert('এই ব্রাউজারে Background Push সাপোর্ট নেই।');
      return;
    }

    const reg = await navigator.serviceWorker.ready;
    let sub = await reg.pushManager.getSubscription();
    if (!sub) {
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
      });
    }

    await syncAuditToFirebase(sub.toJSON(), true);
    updateAuditBadges(true);
    alert('Push Alerts enabled & saved to server!');
  } catch (err) {
    alert('Push বা Firebase এরর: ' + err.message);
  }
}

async function testAuditServerPush() {
  try {
    await syncAuditToFirebase();
    const deviceId = getAuditDeviceId();
    const res = await fetch('/api/cron-audit?deviceId=' + encodeURIComponent(deviceId));
    const data = await res.json();
    if (res.ok && data.notificationsSent > 0) {
      alert('Push notification sent! Check your notification bar / app icon.');
    } else if (res.ok) {
      alert('Checked successfully! No due reports found OR Enable Alert was not clicked first.');
    } else {
      alert('Server response: ' + (data.error || 'Error sending push'));
    }
  } catch (err) {
    alert('Test Push works after deploying to Vercel: ' + err.message);
  }
}

window.addEventListener('load', () => {
  setTimeout(() => syncAuditToFirebase(), 1500);
});

function exportAuditCSV() {
  const list = getAuditReports();
  if (list.length === 0) {
    alert('No reports to export.');
    return;
  }
  const headers = ['Name of Report', 'RSC ID', 'Submission Date', 'Expire Date', 'Re-Test', 'Day Left', 'Status', 'Remarks'];
  const rows = list.map(r => {
    const st = evaluateReportStatus(r);
    return [
      `"${(r.name || '').replace(/"/g, '""')}"`,
      `"${(r.rscId || '').replace(/"/g, '""')}"`,
      formatShortDate(r.subDate),
      formatShortDate(r.expDate),
      AUDIT_FREQ_LABELS[r.freq] || r.freq,
      st.dayLeft,
      st.label,
      `"${(r.remarks || '').replace(/"/g, '""')}"`
    ].join(',');
  });

  const csv = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `EEEGPT_Audit_Reports_${toInputDateStr(new Date())}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function showAuditReminder() {
  hideAllPages();
  document.getElementById('auditReminderPage').classList.add('on');
  renderAuditReports();
  updateAuditBadges(false);
  history.pushState({ page: 'auditReminder' }, '', '#audit-reminder');
}

function backFromAuditReminder() {
  hideAllPages();
  document.getElementById('auditPage').classList.add('on');
  history.pushState({ page: 'audit' }, '', '#audit');
}

updateAuditBadges(true);

function showAudit() {
  hideAllPages();
  document.getElementById('auditPage').classList.add('on');
  history.pushState({ page: 'audit' }, '', '#audit');
}

/* =========================================================
   STANDARD CODE SEARCH ENGINE (HYBRID OFFLINE + FIREBASE)
========================================================= */
const STD_CACHE_KEY = 'eeegpt_standards_cache_v1';
const STD_VERSION_KEY = 'eeegpt_standards_ver_v1';
const DEFAULT_STD_VERSION = 1;

let ACTIVE_STANDARDS_DB = [];
let currentStandardFilter = 'BNBC';
let currentTopicFilter = 'ALL';

function loadStandardsCache() {
  try {
    const cached = localStorage.getItem(STD_CACHE_KEY);
    const localVer = Number(localStorage.getItem(STD_VERSION_KEY) || 0);
    if (cached && localVer >= DEFAULT_STD_VERSION) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 0) {
        ACTIVE_STANDARDS_DB = parsed;
        return;
      }
    }
  } catch (e) {}
  ACTIVE_STANDARDS_DB = typeof DEFAULT_STANDARDS_DB !== 'undefined' ? DEFAULT_STANDARDS_DB.slice() : [];
}

function updateStandardBoxCounts() {
  const counts = { BNBC: 0, RSC: 0, NFPA: 0, IEC: 0 };
  ACTIVE_STANDARDS_DB.forEach(item => {
    if (counts[item.standard] !== undefined) counts[item.standard]++;
  });

  if (document.getElementById('countBNBC')) document.getElementById('countBNBC').textContent = `${counts.BNBC} Rules`;
  if (document.getElementById('countRSC'))  document.getElementById('countRSC').textContent  = `${counts.RSC} Rules`;
  if (document.getElementById('countNFPA')) document.getElementById('countNFPA').textContent = `${counts.NFPA} Rules`;
  if (document.getElementById('countIEC'))  document.getElementById('countIEC').textContent  = `${counts.IEC} Rules`;
}

async function syncStandardsFromFirebase(manual = false) {
  const badge = document.getElementById('stdHubSyncBadge');
  try {
    if (!window.firebaseDB || !window.firebaseGet || !window.firebaseRef) {
      if (manual) alert('Firebase এখনো সংযুক্ত হয়নি, অফলাইন ডেটাবেস চালু আছে।');
      return;
    }

    const verSnap = await window.firebaseGet(window.firebaseRef(window.firebaseDB, 'standards_meta/version'));
    const remoteVer = verSnap.exists() ? Number(verSnap.val()) : 0;
    const localVer = Number(localStorage.getItem(STD_VERSION_KEY) || DEFAULT_STD_VERSION);

    if (remoteVer > localVer) {
      const dataSnap = await window.firebaseGet(window.firebaseRef(window.firebaseDB, 'standards_data'));
      if (dataSnap.exists()) {
        const val = dataSnap.val();
        const arr = Array.isArray(val) ? val : Object.values(val || {});
        if (arr.length > 0) {
          ACTIVE_STANDARDS_DB = arr;
          localStorage.setItem(STD_CACHE_KEY, JSON.stringify(arr));
          localStorage.setItem(STD_VERSION_KEY, String(remoteVer));
          updateStandardBoxCounts();
          if (document.getElementById('standardViewPage').classList.contains('on')) {
            renderStandardView();
          }
          if (badge) badge.textContent = `● Synced (v${remoteVer})`;
          if (manual) alert(`নতুন আপডেট পাওয়া গেছে! ভার্সন v${remoteVer} (${arr.length}টি রুলস) সিঙ্ক হয়েছে।`);
          return;
        }
      }
    }

    if (badge) badge.textContent = `● Up-to-date (v${Math.max(localVer, DEFAULT_STD_VERSION)})`;
    if (manual) alert(`সব রুলস আপডেটেড আছে (v${Math.max(localVer, DEFAULT_STD_VERSION)})।`);
  } catch (err) {
    console.warn('Standards sync skipped (offline mode):', err);
    if (manual) alert('অফলাইন মোডে চলছে — লোকাল ভেরিফাইড ডেটাবেস সক্রিয় আছে।');
  }
}

function highlightMatch(text, query) {
  const safe = escapeHTML(text);
  if (!query) return safe;
  const words = query.trim().split(/\s+/).filter(w => w.length >= 2);
  if (words.length === 0) return safe;
  const pattern = words.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
  return safe.replace(new RegExp(`(${pattern})`, 'gi'), '<mark>$1</mark>');
}

function matchStandardRule(rule, query) {
  if (!query) return true;
  const hay = `${rule.standard} ${rule.topic} ${rule.title} ${rule.clause} ${rule.limits} ${rule.summary} ${rule.auditCheck} ${rule.keywords}`.toLowerCase();
  const terms = query.toLowerCase().trim().split(/\s+/);
  return terms.every(t => hay.includes(t));
}

function buildRuleCardHTML(rule, query) {
  const stdClass = rule.standard.toLowerCase();
  return `
    <div class="std-rule-card">
      <div class="std-card-top">
        <div class="std-badges">
          <span class="std-badge ${stdClass}">${escapeHTML(rule.standard)}</span>
          <span class="std-badge topic">${escapeHTML(rule.topic)}</span>
        </div>
        <button type="button" class="std-copy-btn" onclick="copyStandardRule('${rule.id}', this)">📋 Copy</button>
      </div>
      <h3 class="std-rule-title">${highlightMatch(rule.title, query)}</h3>
      <div class="std-clause">📖 Ref: ${highlightMatch(rule.clause, query)}</div>
      <div class="std-limits">⚡ Limit / Spec: ${highlightMatch(rule.limits, query)}</div>
      <div class="std-summary">${highlightMatch(rule.summary, query)}</div>
      <div class="std-audit-tip"><strong>🔎 Auditor Check:</strong> ${highlightMatch(rule.auditCheck, query)}</div>
    </div>
  `;
}

function copyStandardRule(id, btn) {
  const rule = ACTIVE_STANDARDS_DB.find(r => r.id === id);
  if (!rule) return;
  const text = `[${rule.standard}] ${rule.title}\nRef: ${rule.clause}\nLimit: ${rule.limits}\nRule: ${rule.summary}\nAudit Check: ${rule.auditCheck}`;
  navigator.clipboard.writeText(text).then(() => {
    const old = btn.textContent;
    btn.textContent = '✓ Copied';
    setTimeout(() => { btn.textContent = old; }, 1400);
  }).catch(() => alert(text));
}

function runGlobalStandardSearch() {
  const input = document.getElementById('auditGlobalSearchInput');
  const clearBtn = document.getElementById('auditGlobalClearBtn');
  const resultsWrap = document.getElementById('auditGlobalResultsWrap');
  const browseWrap = document.getElementById('auditBrowseSection');
  const listEl = document.getElementById('auditGlobalResultsList');
  const countEl = document.getElementById('auditGlobalResultsCount');

  const query = input ? input.value.trim() : '';

  const stds = ['BNBC', 'RSC', 'NFPA', 'IEC'];
  const counts = { BNBC: 0, RSC: 0, NFPA: 0, IEC: 0 };
  const matches = [];

  ACTIVE_STANDARDS_DB.forEach(r => {
    if (!query || matchStandardRule(r, query)) {
      if (counts[r.standard] !== undefined) counts[r.standard]++;
      if (query) matches.push(r);
    }
  });

  stds.forEach(std => {
    const countBadge = document.getElementById('count' + std);
    const boxBtn = countBadge ? countBadge.closest('.std-box') : null;
    const c = counts[std];
    if (countBadge) {
      countBadge.textContent = query ? `${c} Match${c === 1 ? '' : 'es'}` : `${c} Rules`;
    }
    if (boxBtn) {
      boxBtn.classList.toggle('has-match', Boolean(query && c > 0));
      boxBtn.classList.toggle('no-match', Boolean(query && c === 0));
    }
  });

  if (!query) {
    if (clearBtn) clearBtn.style.display = 'none';
    if (resultsWrap) resultsWrap.style.display = 'none';
    if (browseWrap) browseWrap.style.display = 'block';
    if (listEl) listEl.innerHTML = '';
    return;
  }

  if (clearBtn) clearBtn.style.display = 'flex';
  if (resultsWrap) resultsWrap.style.display = 'block';
  if (browseWrap) browseWrap.style.display = 'none';

  if (countEl) {
    countEl.innerHTML = `<strong>${matches.length}</strong> rule${matches.length === 1 ? '' : 's'} found`;
  }

  if (listEl) {
    listEl.innerHTML = matches.length > 0
      ? matches.map(r => buildRuleCardHTML(r, query)).join('')
      : `<div class="card" style="text-align:center; color:var(--m); padding:24px;">No matching rules found for "${escapeHTML(query)}".</div>`;
  }
}

function clearGlobalStandardSearch() {
  const input = document.getElementById('auditGlobalSearchInput');
  if (input) input.value = '';
  runGlobalStandardSearch();
}

function openStandardBox(stdName) {
  currentStandardFilter = stdName;
  currentTopicFilter = 'ALL';

  const meta = {
    BNBC: { title: 'BNBC 2020 Codes & Rules', sub: 'Bangladesh National Building Code (Part VIII)' },
    RSC:  { title: 'RSC Technical Guidelines', sub: 'RMG Sustainability Council Electrical Safety' },
    NFPA: { title: 'NFPA Electrical & Fire Codes', sub: 'NFPA 70 (NEC) • NFPA 70E • NFPA 780' },
    IEC:  { title: 'IEC International Standards', sub: 'IEC 60364 • IEC 62305 • IEC 61439' }
  }[stdName] || { title: stdName, sub: 'All Codes & Rules' };

  document.getElementById('stdViewTitle').textContent = meta.title;
  document.getElementById('stdViewSub').textContent = meta.sub;

  const globalInput = document.getElementById('auditGlobalSearchInput');
  const activeQuery = globalInput ? globalInput.value.trim() : '';

  const viewInput = document.getElementById('stdViewSearchInput');
  if (viewInput) viewInput.value = activeQuery;

  const viewClear = document.getElementById('stdViewClearBtn');
  if (viewClear) viewClear.style.display = activeQuery ? 'flex' : 'none';

  hideAllPages();
  document.getElementById('standardViewPage').classList.add('on');

  buildTopicChipsForStandard(stdName);
  renderStandardView();
  history.pushState({ page: 'standardView', std: stdName }, '', `#standard-${stdName.toLowerCase()}`);
}

function backFromStandardView() {
  hideAllPages();
  document.getElementById('auditPage').classList.add('on');
  history.pushState({ page: 'audit' }, '', '#audit');
}

function buildTopicChipsForStandard(stdName) {
  const container = document.getElementById('stdTopicChips');
  if (!container) return;

  const stdRules = ACTIVE_STANDARDS_DB.filter(r => r.standard === stdName);
  const topics = ['ALL', ...new Set(stdRules.map(r => r.topic))];

  container.innerHTML = topics.map(tp => `
    <button type="button" class="std-chip ${tp === currentTopicFilter ? 'active' : ''}" onclick="setStandardTopic('${tp}')">
      ${tp === 'ALL' ? 'All Topics' : escapeHTML(tp)}
    </button>
  `).join('');
}

function setStandardTopic(tp) {
  currentTopicFilter = tp;
  buildTopicChipsForStandard(currentStandardFilter);
  renderStandardView();
}

function clearStandardViewSearch() {
  document.getElementById('stdViewSearchInput').value = '';
  renderStandardView();
}

function renderStandardView() {
  const input = document.getElementById('stdViewSearchInput');
  const clearBtn = document.getElementById('stdViewClearBtn');
  const listEl = document.getElementById('stdViewList');
  const countEl = document.getElementById('stdViewCount');

  const query = input ? input.value.trim() : '';
  if (clearBtn) clearBtn.style.display = query ? 'flex' : 'none';

  const matches = ACTIVE_STANDARDS_DB.filter(r => {
    if (r.standard !== currentStandardFilter) return false;
    if (currentTopicFilter !== 'ALL' && r.topic !== currentTopicFilter) return false;
    return matchStandardRule(r, query);
  });

  if (countEl) countEl.textContent = `${matches.length} rule${matches.length === 1 ? '' : 's'} shown`;

  if (matches.length === 0) {
    listEl.innerHTML = `<div class="card" style="text-align:center; color:var(--m); padding:24px;">No rules matched in ${escapeHTML(currentStandardFilter)}.</div>`;
    return;
  }

  listEl.innerHTML = matches.map(r => buildRuleCardHTML(r, query)).join('');
}

loadStandardsCache();
updateStandardBoxCounts();
window.addEventListener('load', () => {
  setTimeout(() => syncStandardsFromFirebase(false), 1800);
});

/* =========================================================
   ELECTRONICS & AUTOMATION NAVIGATION
========================================================= */
function showElectronics() {
  hideAllPages();
  document.getElementById('electronicsPage').classList.add('on');
  calculateColorCode();
  decodeSmdResistor();
  calculateDivider();
  calculateLedResistor();
  calculateRcFilter();
  calculate555();
  history.pushState({ page: 'electronics' }, '', '#electronics');
}

function showAutomation() {
  hideAllPages();
  document.getElementById('automationPage').classList.add('on');
  history.pushState({ page: 'automation' }, '', '#automation');
}

function showAutomationTools() {
  hideAllPages();
  document.getElementById('automationToolsPage').classList.add('on');
  calculateAnalogScaling();
  calculateVfdSpeed();
  calculateStarDelta();
  history.pushState({ page: 'automationTools' }, '', '#automation-tools');
}

function backFromAutomationTools() {
  hideAllPages();
  document.getElementById('automationPage').classList.add('on');
  history.pushState({ page: 'automation' }, '', '#automation');
}

/* =========================================================
   INITIALIZE CONVERTER & NAVIGATION HISTORY
========================================================= */
phase(1);

window.addEventListener('popstate', function () {
  const state = history.state;
  hideAllPages();

  if (state && state.page === 'cable') {
    document.getElementById('cablePage').classList.add('on');
    return;
  }
if (state && state.page === 'breaker') {
    document.getElementById('breakerPage').classList.add('on');
    return;
  }
  if (state && state.page === 'pfi') {
    document.getElementById('pfiPage').classList.add('on');
    return;
  }
  if (state && state.page === 'pfi') {
    document.getElementById('pfiPage').classList.add('on');
    calculatePFI();
    return;
  }
  if (state && state.page === 'substationTool') {
    document.getElementById('substationToolPage').classList.add('on');
    calculateSubstationTool();
    return;
  }
if (state && state.page === 'ups') {
    document.getElementById('upsPage').classList.add('on');
    calculateUps();
    return;
  }
  if (state && state.page === 'electronics') {
    document.getElementById('electronicsPage').classList.add('on');
    return;
  }
  if (state && state.page === 'automation') {
    document.getElementById('automationPage').classList.add('on');
    return;
  }
  if (state && state.page === 'automationTools') {
    document.getElementById('automationToolsPage').classList.add('on');
    return;
  }
  if (state && state.page === 'simulationLab') {
    document.getElementById('simulationLabPage').classList.add('on');
    initSimLabEvents();
    renderSimCanvas();
    return;
  }
  if (state && state.page === 'converter') {
    document.getElementById('converterPage').classList.add('on');
    return;
  }
  if (state && state.page === 'load') {
    document.getElementById('loadPage').classList.add('on');
    return;
  }
  if (state && state.page === 'standardView') {
    document.getElementById('standardViewPage').classList.add('on');
    renderStandardView();
    return;
  }
  if (state && state.page === 'auditReminder') {
    document.getElementById('auditReminderPage').classList.add('on');
    renderAuditReports();
    return;
  }
  if (state && state.page === 'auditChecklist') {
    document.getElementById('auditChecklistPage').classList.add('on');
    renderAuditChecklist();
    return;
  }
  if (state && state.page === 'audit') {
    document.getElementById('auditPage').classList.add('on');
    return;
  }
  if (state && state.page === 'electrical') {
    document.getElementById('electricalPage').classList.add('on');
    return;
  }

  document.getElementById('home').style.display = 'block';
});

if (window.location.hash === '#audit-reminder') {
  history.replaceState({ page: 'home' }, '', '#home');
  showAuditReminder();
} else {
  history.replaceState({ page: 'home' }, '', '#home');
}

/* =========================================================
   HOME BOTTOM NAV SHEET CONTROLS
========================================================= */
function openHomeModal(type) {
  const modal = document.getElementById('homeModal');
  const title = document.getElementById('homeModalTitle');
  const body = document.getElementById('homeModalBody');
  if (!modal || !title || !body) return;

  if (type === 'tools') {
    title.textContent = 'All Active Tools';
    body.innerHTML = `
      <div style="display:grid; gap:8px;">
        <button class="tool" onclick="closeHomeModal(); showConverter();">
          <span class="tool-icon">⚡</span><span><b>Power Converter</b><small>kW • Amp • Watt • HP</small></span>
        </button>
        <button class="tool" onclick="closeHomeModal(); showLoadCalculator();">
          <span class="tool-icon">🔌</span><span><b>Load Calculator</b><small>BNBC 2020 Demand &amp; Energy</small></span>
        </button>
        <button class="tool" onclick="closeHomeModal(); showCableCalculator();">
          <span class="tool-icon">📐</span><span><b>Cable Sizing &amp; Audit</b><small>BNBC 2020 • RSC Sizing &amp; Audit</small></span>
        </button>
       <button class="tool" onclick="closeHomeModal(); showBreakerSelection();">
          <span class="tool-icon">🛡️</span><span><b>MCB / MCCB / ACB Selection</b><small>IEC 60947-2 • IEC 60898</small></span>
        </button>
        <button class="tool" onclick="closeHomeModal(); showPfiCalculator();">
          <span class="tool-icon">🔋</span><span><b>PFI / Capacitor Bank Sizing</b><small>IEC 60831 • kVAR &amp; APFI Steps</small></span>
        </button>
        <button class="tool" onclick="closeHomeModal(); showPfiCalculator();">
          <span class="tool-icon">🔋</span><span><b>PFI / Capacitor Bank</b><small>kVAR &amp; Current Savings</small></span>
        </button>
        <button class="tool" onclick="closeHomeModal(); showSubstationTool();">
          <span class="tool-icon">🏭</span><span><b>Substation &amp; Fault (kA)</b><small>Transformer • Gen • Isc</small></span>
        </button>
        <button class="tool" onclick="closeHomeModal(); showUpsCalculator();">
          <span class="tool-icon">🔌</span><span><b>IPS / UPS Backup</b><small>Battery Time &amp; VA Sizing</small></span>
        </button>
      <button class="tool" onclick="closeHomeModal(); showAuditReminder();">
          <span class="tool-icon">📅</span><span><b>Audit Report Reminder</b><small>Expiry &amp; Red Alert Tracker</small></span>
        </button>
        <button class="tool" onclick="closeHomeModal(); showAuditChecklist();">
          <span class="tool-icon">✅</span><span><b>Safety Audit Checklist</b><small>Pass/Fail Score &amp; PDF Report</small></span>
        </button>
        <button class="tool" onclick="closeHomeModal(); showElectronics();">
          <span class="tool-icon">🎛️</span><span><b>Electronics Tools</b><small>Resistor • SMD • LED • RC &amp; 555</small></span>
        </button>
        <button class="tool" onclick="closeHomeModal(); showAutomation();">
          <span class="tool-icon">🤖</span><span><b>Automation Tools</b><small>PLC Scaling • VFD • Star-Delta</small></span>
        </button>
        <button class="tool" onclick="closeHomeModal(); showSimulationLab();">
          <span class="tool-icon">🎛️</span><span><b>Simulation Lab</b><small>Interactive Control Circuit Simulator</small></span>
        </button>
      </div>
    `;
  } else if (type === 'about') {
    title.textContent = 'About EEEGPT & Tool Guide';
    body.innerHTML = `
      <div class="about-profile-box">
        <strong>EEEGPT</strong> — Smart Electrical Engineering Assistant built on <strong>BNBC 2020, RSC, IEC &amp; NFPA 70</strong>.<br>
        <strong>Developer:</strong> Hrridoy Hassen Inno (BSc in EEE)<br>
        <strong>Email:</strong> inno.eee@hotmail.com
      </div>

      <div style="font-size:11.5px; color:#64748b; margin-bottom:6px;">
        যেকোনো টুলের ওপর ট্যাপ করে তার ব্যবহারের নিয়ম ও কোড রেফারেন্স দেখুন:
      </div>

      <!-- CATEGORY 1: ELECTRICAL -->
      <div class="about-cat-head">1. ⚡ Electrical Tools (7)</div>

      <details class="about-tool-item">
        <summary>1.1 Power Converter</summary>
        <div class="about-tool-body">
          <strong>কাজ:</strong> kW, Ampere, Watt ও HP-এর মধ্যে দ্রুত রূপান্তর।<br>
          <strong>ব্যবহার:</strong> উপরের ঘরে মান ও কনভার্শন (যেমন <em>kW → Amp</em>) সিলেক্ট করুন। এরপর Single Phase (230V) বা Three Phase (400V) বেছে নিন—প্রয়োজনে Voltage, Power Factor (PF) ও Efficiency (η) পরিবর্তন করতে পারবেন।<br>
          <strong>রেফারেন্স:</strong> BNBC 2020 Sec 1.1.4 (230V / 400V Nominal)।<br>
          <button type="button" class="about-tool-open" onclick="closeHomeModal(); showConverter();">Open Power Converter →</button>
        </div>
      </details>

      <details class="about-tool-item">
        <summary>1.2 Load Calculator</summary>
        <div class="about-tool-body">
          <strong>কাজ:</strong> বাসা, অফিস বা ফ্যাক্টরির মোট কানেক্টেড লোড, ম্যাক্সিমাম ডিমান্ড, মিটার সাইজ এবং দৈনিক/মাসিক বিদ্যুৎ বিল ইউনিট (kWh) নির্ণয়।<br>
          <strong>ব্যবহার:</strong> প্রথমে <em>Diversity Factor</em> (Residential 0.75, Commercial 0.85, RSC Factory 0.70) সিলেক্ট করুন। এরপর Light, Fan ও Other Load-এ সংখ্যা (Qty), Watt অথবা kW এবং দৈনিক ব্যবহারের ঘণ্টা (Hours) লিখুন।<br>
          <strong>রেফারেন্স:</strong> BNBC 2020 Sec 1.3.2 &amp; App. A, DESCO/DPDC/BPDB (≤7.5 kW 1-Phase, &gt;7.5 kW 3-Phase, &gt;50 kW Substation)।<br>
          <button type="button" class="about-tool-open" onclick="closeHomeModal(); showLoadCalculator();">Open Load Calculator →</button>
        </div>
      </details>

      <details class="about-tool-item">
        <summary>1.3 Cable Sizing &amp; Audit</summary>
        <div class="about-tool-body">
          <strong>কাজ:</strong> (১) <em>New Cable Sizing</em>: নতুন প্রজেক্টের জন্য সঠিক ক্যাবল, Parallel Runs, ECC, Conduit ও ব্রেকার বের করা। (২) <em>Existing Cable Audit</em>: পুরোনো ক্যাবলের নিরাপদ লোড, ভোল্টেজ ড্রপ ও ব্রেকার যাচাই।<br>
          <strong>ব্যবহার:</strong> Load, Phase, Route Length, Ambient Temp ও Grouping দিন; এরপর Conductor (Cu/Al), Insulation (PVC/XLPE), Cable Type (BYA/NYY) ও Installation Method সিলেক্ট করে <em>Calculate</em> চাপুন। চাইলে A4 PDF প্রিন্ট করতে পারবেন।<br>
          <strong>রেফারেন্স:</strong> BNBC 2020 Sec 1.3.7 (≤2.5% Drop), Table 8.1.26 (ECC), Cl. 1.3.30 (Ib ≤ In ≤ Iz), NEC 40% Conduit Rule, IEC 60364-5-52।<br>
          <button type="button" class="about-tool-open" onclick="closeHomeModal(); showCableCalculator();">Open Cable Sizing &amp; Audit →</button>
        </div>
      </details>

      <details class="about-tool-item">
        <summary>1.4 MCB / MCCB / ACB Selection</summary>
        <div class="about-tool-body">
          <strong>কাজ:</strong> মোটর (DOL, Star-Delta, VFD), ট্রান্সফরমার, ক্যাপাসিটর বা ডিসি সার্কিটের জন্য সঠিক ব্রেকার টাইপ, অ্যাম্পিয়ার (In), কার্ভ (B/C/D/LSI), ব্রেকিং ক্যাপাসিটি (kA) ও ন্যূনতম ক্যাবল সাইজ নির্ণয়।<br>
          <strong>ব্যবহার:</strong> Load Type, লোডের মান (kW/HP/A/kVA), Phase এবং প্যানেলের অবস্থান (Branch / Floor DB / Main LT) সিলেক্ট করুন।<br>
          <strong>রেফারেন্স:</strong> IEC 60898-1, IEC 60947-2, BNBC 2020 Cl. 1.3.30, NFPA 70 Art. 430.22।<br>
          <button type="button" class="about-tool-open" onclick="closeHomeModal(); showBreakerSelection();">Open Breaker Selection →</button>
        </div>
      </details>

      <details class="about-tool-item">
        <summary>1.5 PFI / Capacitor Bank Sizing</summary>
        <div class="about-tool-body">
          <strong>কাজ:</strong> লো-পাওয়ার ফ্যাক্টর জরিমানা এড়াতে বর্তমান PF থেকে টার্গেট PF-এ নিতে কত kVAR ক্যাপাসিটর ব্যাংক লাগবে ও কত % কারেন্ট সাশ্রয় হবে তা হিসাব।<br>
          <strong>ব্যবহার:</strong> লোড (kW/kVA/A), ভোল্টেজ, Current PF (যেমন 0.78) ও Target PF (যেমন 0.98) লিখলে অটোমেটিক APFI স্টেপ প্ল্যান ও ব্রেকার সাইজ দেখাবে।<br>
          <strong>রেফারেন্স:</strong> IEC 60831-1 (135% Harmonic Breaker Rule) ও Utility PF Tariff।<br>
          <button type="button" class="about-tool-open" onclick="closeHomeModal(); showPfiCalculator();">Open PFI Calculator →</button>
        </div>
      </details>

      <details class="about-tool-item">
        <summary>1.6 Substation, Generator &amp; Fault (kA)</summary>
        <div class="about-tool-body">
          <strong>কাজ:</strong> কানেক্টেড লোড থেকে ট্রান্সফরমার kVA, স্ট্যান্ডবাই জেনারেটর kVA/kW, ট্রান্সফরমার সেকেন্ডারি Short-Circuit Fault Level (Isc kA) ও ন্যূনতম রুম এরিয়া হিসাব।<br>
          <strong>ব্যবহার:</strong> Connected Load (kW), Diversity Factor (RSC 0.70 / BNBC 0.75), Future Margin (%) ও Transformer %Z দিন। এতে Main LT ইনকামার ব্রেকারের ন্যূনতম kA জানা যাবে।<br>
          <strong>রেফারেন্স:</strong> RSC Sec 10.5.1 &amp; 10.5.3, IEC 60909, BNBC 2020 Tables 8.1.23 &amp; 8.1.24।<br>
          <button type="button" class="about-tool-open" onclick="closeHomeModal(); showSubstationTool();">Open Substation Tool →</button>
        </div>
      </details>

      <details class="about-tool-item">
        <summary>1.7 IPS / UPS &amp; Battery Backup</summary>
        <div class="about-tool-body">
          <strong>কাজ:</strong> চলমান লোড ও ব্যাটারি ব্যাংক (V, Ah) অনুযায়ী ব্যাকআপ সময়, ন্যূনতম ইনভার্টার VA রেটিং, ডিসি কারেন্ট, ফিউজ ও চার্জিং সময় নির্ণয়।<br>
          <strong>ব্যবহার:</strong> Running Watt, System DC Voltage (12V–120V), Battery Ah, Parallel Strings ও Battery Type (Tubular/Lithium/Lead-Acid) নির্বাচন করুন।<br>
          <strong>রেফারেন্স:</strong> IEEE 485, IEC 62040-3।<br>
          <button type="button" class="about-tool-open" onclick="closeHomeModal(); showUpsCalculator();">Open IPS/UPS Calculator →</button>
        </div>
      </details>

      <!-- CATEGORY 2: AUDIT & STANDARDIZATION -->
      <div class="about-cat-head">2. 📋 Audit &amp; Standardization (2)</div>

      <details class="about-tool-item">
        <summary>2.1 Standard Code Engine (BNBC • RSC • NFPA • IEC)</summary>
        <div class="about-tool-body">
          <strong>কাজ:</strong> ফ্যাক্টরি ও বিল্ডিং ইলেকট্রিক্যাল সেফটি অডিটের প্রয়োজনীয় কোড, লিমিট ও অডিটর চেকপয়েন্ট অফলাইনে দ্রুত খুঁজে পাওয়া।<br>
          <strong>ব্যবহার:</strong> সার্চ বক্সে কীওয়ার্ড (যেমন <em>Substation, Earthing, Panel, LPS, 30mA</em>) লিখে সাথে সাথে রুলস দেখুন, অথবা যেকোনো স্ট্যান্ডার্ডের বক্সে ঢুকে টপিক ফিল্টার, কপি বা প্রিন্ট করুন।<br>
          <button type="button" class="about-tool-open" onclick="closeHomeModal(); showAudit();">Open Code Engine →</button>
        </div>
      </details>

      <details class="about-tool-item">
        <summary>2.2 Audit Report Submission Reminder</summary>
        <div class="about-tool-body">
          <strong>কাজ:</strong> বিভিন্ন টেস্ট রিপোর্টের (যেমন IR, Earth Resistance, Thermography, LPS) মেয়াদ ট্র্যাক রাখা এবং মেয়াদ শেষ হওয়ার ১ মাস আগেই রেড অ্যালার্ট ও Push Notification পাওয়া।<br>
          <strong>ব্যবহার:</strong> রিপোর্টের নাম, RSC ID, Submission Date ও Re-Test Frequency দিয়ে সেভ করুন। <strong>Enable Alert</strong> দিলে ব্যাকগ্রাউন্ড নোটিফিকেশন পাবেন এবং <strong>☁️ Sync</strong> দিয়ে অন্য ডিভাইস থেকেও ডাটা লোড/ব্যাকআপ করতে পারবেন।<br>
         <button type="button" class="about-tool-open" onclick="closeHomeModal(); showAuditReminder();">Open Audit Reminder →</button>
        </div>
      </details>

      <details class="about-tool-item">
        <summary>2.3 Factory Safety Audit Checklist</summary>
        <div class="about-tool-body">
          <strong>কাজ:</strong> BNBC, RSC, NFPA ও IEC রুলস অনুযায়ী ফ্যাক্টরি পরিদর্শনের সময় Pass / Fail / N/A টিক দিয়ে অটো Compliance Score (%) বের করা এবং CAP রিমার্কসসহ A4 PDF অডিট রিপোর্ট প্রিন্ট করা।<br>
          <button type="button" class="about-tool-open" onclick="closeHomeModal(); showAuditChecklist();">Open Audit Checklist →</button>
        </div>
      </details>

      <!-- CATEGORY 3: ELECTRONICS -->
      <div class="about-cat-head">3. 🎛️ Electronics Tools (3 Tabs)</div>
      <details class="about-tool-item">
        <summary>3.1 Resistor, SMD, Divider, LED, RC &amp; 555</summary>
        <div class="about-tool-body">
         <strong>কাজ:</strong> ৪-ব্যান্ড রেজিস্টর কালার কোড, SMD কোড ডিকোডার (<code>103</code>, <code>4R7</code>), ভোল্টেজ ডিভাইডার, LED সিরিজ রেজিস্টর, RC ফিল্টার ও 555 টাইমার ক্যালকুলেশন।<br>
          <button type="button" class="about-tool-open" onclick="closeHomeModal(); showElectronics();">Open Electronics →</button>
        </div>
      </details>

      <!-- CATEGORY 4: AUTOMATION -->
      <div class="about-cat-head">4. 🤖 Automation Tools (3 Tabs)</div>
      <details class="about-tool-item">
        <summary>4.1 PLC Analog Scaling, VFD RPM &amp; Star-Delta Starter</summary>
        <div class="about-tool-body">
          <strong>কাজ:</strong> ৪–২০ mA / ০–১০V এনালগ স্কেলিং (Siemens/Delta Raw Count), VFD ফ্রিকোয়েন্সি থেকে মোটর RPM/টর্ক এবং Star-Delta কন্টাক্টর ও OLR সাইজিং।<br>
          <button type="button" class="about-tool-open" onclick="closeHomeModal(); showAutomation();">Open Automation →</button>
        </div>
      </details>
      <details class="about-tool-item">
        <summary>4.2 Simulation Lab (Simurelay Style)</summary>
        <div class="about-tool-body">
          <strong>কাজ:</strong> L1/N, Pushbutton, Contactor Coil, Timer, Lamp ও Motor দিয়ে কন্ট্রোল সার্কিট আঁকা এবং লাইভ Run করে পরীক্ষা করা (DOL, Forward/Reverse ও Star-Delta প্রিসেটসহ)।<br>
          <button type="button" class="about-tool-open" onclick="closeHomeModal(); showSimulationLab();">Open Simulation Lab →</button>
        </div>
      </details>
    `;
  } else if (type === 'settings') {
    title.textContent = 'App Settings';
    const isDark = document.body.classList.contains('dark-mode');
    body.innerHTML = `
      <div style="display:grid; gap:10px;">
        <button type="button" class="audit-btn-sec" id="themeToggleBtn" onclick="toggleAppTheme()">
          ${isDark ? '☀️ Switch to Light Mode' : '🌙 Switch to Dark Mode'}
        </button>
        <button type="button" class="audit-btn-sec" onclick="closeHomeModal(); openAuditSyncModal();">
          ☁️ Audit Data Sync &amp; Backup
        </button>
        <button type="button" class="audit-btn-primary" onclick="requestAuditNotificationPermission()">
          🔔 Enable Audit Push Notifications
        </button>
        <button type="button" class="audit-btn-sec" onclick="location.reload()">
          🔄 Refresh App &amp; Sync Cache
        </button>
      </div>
    `;
  }

  modal.classList.add('open');
}

function closeHomeModal() {
  const modal = document.getElementById('homeModal');
  if (modal) modal.classList.remove('open');
}

/* =========================================================
   HOME PAGE: BASIC COPY PROTECTION
========================================================= */
(function () {
  const homeEl = document.getElementById('home');
  if (!homeEl) return;

  function isHomeVisible() {
    return getComputedStyle(homeEl).display !== 'none';
  }

  document.addEventListener('contextmenu', function (event) {
    if (isHomeVisible() && event.target.closest('#home')) event.preventDefault();
  });
  document.addEventListener('copy', function (event) {
    if (isHomeVisible() && event.target.closest('#home')) event.preventDefault();
  });
  document.addEventListener('cut', function (event) {
    if (isHomeVisible() && event.target.closest('#home')) event.preventDefault();
  });
  document.addEventListener('dragstart', function (event) {
    if (isHomeVisible() && event.target.closest('#home')) event.preventDefault();
  });
})();

/* =========================================================
   SERVICE WORKER REGISTRATION
========================================================= */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('./service-worker.js', {
        updateViaCache: 'none'
      });
      registration.update();
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  });
}

/* =========================================================
   GA4 CUSTOM BUTTON & TOOL TRACKING
========================================================= */
document.addEventListener('click', function (e) {
  const btn = e.target.closest('button');
  if (!btn || typeof gtag !== 'function') return;

  const action = btn.getAttribute('onclick') || '';
  const label = btn.innerText.replace(/\s+/g, ' ').trim();

  if (action.includes('showConverter')) {
    gtag('event', 'open_power_converter', { tool_name: 'Power Converter' });
  } else if (action.includes('showLoadCalculator')) {
    gtag('event', 'open_load_calculator', { tool_name: 'Load Calculator' });
  } else if (action.includes('showCableCalculator')) {
    gtag('event', 'open_cable_calculator', { tool_name: 'Cable Sizing & Audit' });
  
} else if (action.includes('showBreakerSelection')) {
    gtag('event', 'open_breaker_selection', { tool_name: 'Breaker Selection' });
  } else if (action.includes('showPfiCalculator')) {
    gtag('event', 'open_pfi_calculator', { tool_name: 'PFI Capacitor Sizing' });
  } else if (action.includes('showPfiCalculator')) {
    gtag('event', 'open_pfi_calculator', { tool_name: 'PFI Calculator' });
  } else if (action.includes('showSubstationTool')) {
    gtag('event', 'open_substation_tool', { tool_name: 'Substation & Fault Sizing' });
  } else if (action.includes('showUpsCalculator')) {
    gtag('event', 'open_ups_calculator', { tool_name: 'IPS/UPS Backup' });
  } else if (action.includes('showAuditChecklist')) {
    gtag('event', 'open_audit_checklist', { tool_name: 'Safety Audit Checklist' });
  } else if (action.includes('showAuditReminder')) {
    gtag('event', 'open_audit_reminder', { tool_name: 'Audit Report Reminder' });
  } else if (action.includes('showAudit')) {
    gtag('event', 'open_audit_section', { section: 'Audit & Standardization' });
 } else if (action.includes('showElectronics')) {
    gtag('event', 'open_electronics_section', { section: 'Electronics' });
  } else if (action.includes('showAutomation')) {
    gtag('event', 'open_automation_section', { section: 'Automation' });
    } else if (action.includes('showSimulationLab')) {
    gtag('event', 'open_simulation_lab', { tool_name: 'Simulation Lab' });
  } else if (action.includes('calculateCable')) {
    gtag('event', 'calculate_new_cable', { button: label });
  } else if (action.includes('calculateExistingCable')) {
    gtag('event', 'evaluate_existing_cable', { button: label });
  } else if (action.includes('window.print')) {
    gtag('event', 'export_pdf_report', { button: 'Print / Save PDF' });
  } else if (action.includes('addLoadRow')) {
    gtag('event', 'add_load_row', { button: label });
  }
});

/* =========================================================
   PWA INSTALL BUTTON LOGIC
========================================================= */
let deferredInstallPrompt = null;

function isAppInstalled() {
  return window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: fullscreen)').matches ||
    window.navigator.standalone === true;
}

function updateInstallButtonUI() {
  const btn = document.getElementById('installAppBtn');
  const label = document.getElementById('installBtnLabel');
  const icon = document.getElementById('installBtnIcon');
  if (!btn || !label || !icon) return;

  btn.classList.remove('install-ready', 'installed');

  if (isAppInstalled()) {
    btn.classList.add('installed');
    label.textContent = 'Installed';
    icon.innerHTML = '<path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm-1.2 14.2L6.6 12l1.4-1.4 2.8 2.8 5.8-5.8L18 9l-7.2 7.2z"/>';
  } else {
    label.textContent = 'Install';
    icon.innerHTML = '<path d="M5 20h14v-2H5v2zM19 9h-4V3H9v6H5l7 7 7-7z"/>';
    if (deferredInstallPrompt) {
      btn.classList.add('install-ready');
    }
  }
}

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredInstallPrompt = e;
  updateInstallButtonUI();
});

window.addEventListener('appinstalled', () => {
  deferredInstallPrompt = null;
  updateInstallButtonUI();
  if (typeof gtag === 'function') {
    gtag('event', 'app_installed', { method: 'pwa_prompt' });
  }
});

async function handleInstallClick() {
  const modal = document.getElementById('homeModal');
  const title = document.getElementById('homeModalTitle');
  const body = document.getElementById('homeModalBody');

  if (isAppInstalled()) {
    if (modal && title && body) {
      title.textContent = 'EEEGPT Installed';
      body.innerHTML = `
        <p style="margin:0; color:#065f46; font-weight:600;">
          ✅ EEEGPT অ্যাপটি ইতিমধ্যেই আপনার ডিভাইসে ইনস্টল করা আছে।
        </p>
      `;
      modal.classList.add('open');
    }
    return;
  }

  if (deferredInstallPrompt) {
    deferredInstallPrompt.prompt();
    const choiceResult = await deferredInstallPrompt.userChoice;
    if (typeof gtag === 'function') {
      gtag('event', 'install_prompt_choice', { outcome: choiceResult.outcome });
    }
    if (choiceResult.outcome === 'accepted') {
      deferredInstallPrompt = null;
    }
    updateInstallButtonUI();
    return;
  }

  // Fallback guide for iOS Safari / In-app browsers / when prompt is not ready
  const ua = navigator.userAgent || '';
  const isIOS = /iPhone|iPad|iPod/i.test(ua);
  const isInApp = /FBAN|FBAV|Instagram|WhatsApp|Messenger/i.test(ua);

  if (modal && title && body) {
    title.textContent = 'Install EEEGPT App';
    if (isInApp) {
      body.innerHTML = `
        <p style="margin:0 0 8px;">আপনি ইন-অ্যাপ ব্রাউজার (যেমন Facebook/Messenger) থেকে দেখছেন। অ্যাপটি ইনস্টল করতে:</p>
        <ol style="margin:0; padding-left:18px;">
          <li>উপরের ডান কোণার <strong>⋮</strong> বা <strong>⋯</strong> মেনুতে ট্যাপ করুন।</li>
          <li><strong>Open in Chrome / Safari</strong> সিলেক্ট করুন।</li>
          <li>তারপর নিচের <strong>Install</strong> বাটনে চাপ দিন।</li>
        </ol>
      `;
    } else if (isIOS) {
      body.innerHTML = `
        <p style="margin:0 0 8px;">iPhone / iPad-এ EEEGPT ইনস্টল করতে নিচের ধাপগুলো অনুসরণ করুন:</p>
        <ol style="margin:0; padding-left:18px;">
          <li>Safari ব্রাউজারের নিচে <strong>Share (□↑)</strong> বাটনে ট্যাপ করুন।</li>
          <li>নিচে স্ক্রল করে <strong>Add to Home Screen</strong> সিলেক্ট করুন।</li>
          <li>উপরের ডানে <strong>Add</strong> চাপুন।</li>
        </ol>
      `;
    } else {
      body.innerHTML = `
        <p style="margin:0 0 8px;">আপনার ডিভাইসে EEEGPT অ্যাপ হিসেবে ইনস্টল করতে:</p>
        <ol style="margin:0; padding-left:18px;">
          <li>ব্রাউজারের উপরের ডান কোণায় <strong>⋮ (Menu)</strong> বাটনে ট্যাপ করুন।</li>
          <li><strong>Install app</strong> অথবা <strong>Add to Home screen</strong> অপশনে ক্লিক করুন।</li>
        </ol>
        <p style="margin:10px 0 0; font-size:12px; color:#64748b;">
          (নোট: অ্যাপ আগে থেকেই ইনস্টল করা থাকলে বা ব্রাউজার প্রম্পট আটকে রাখলে এখান থেকেই সরাসরি ইনস্টল করা যাবে।)
        </p>
      `;
    }
    modal.classList.add('open');
  }
}

updateInstallButtonUI();

/* =========================================================
   THEME TOGGLE (LIGHT / DARK)
========================================================= */
const THEME_STORAGE_KEY = 'eeegpt_theme';

function applySavedTheme() {
  const saved = localStorage.getItem(THEME_STORAGE_KEY);
  document.body.classList.toggle('dark-mode', saved === 'dark');
}

function toggleAppTheme() {
  const isDark = document.body.classList.toggle('dark-mode');
  localStorage.setItem(THEME_STORAGE_KEY, isDark ? 'dark' : 'light');
  const btn = document.getElementById('themeToggleBtn');
  if (btn) {
    btn.textContent = isDark ? '☀️ Switch to Light Mode' : '🌙 Switch to Dark Mode';
  }
}

applySavedTheme();

/* =========================================================
   AUDIT CROSS-DEVICE CLOUD SYNC & JSON BACKUP
========================================================= */
function openAuditSyncModal() {
  const modal = document.getElementById('homeModal');
  const title = document.getElementById('homeModalTitle');
  const body = document.getElementById('homeModalBody');
  if (!modal || !title || !body) return;

  const currentId = getAuditDeviceId();
  title.textContent = 'Audit Data Sync & Backup';
  body.innerHTML = `
    <div style="display:grid; gap:10px;">
      <div style="background:#f8fafc; border:1px solid #cbd5e1; border-radius:10px; padding:10px;">
        <div style="font-size:11px; color:#64748b; font-weight:700;">YOUR CURRENT SYNC ID</div>
        <div style="display:flex; gap:6px; align-items:center; margin-top:5px;">
          <input type="text" id="mySyncIdDisplay" value="${escapeHTML(currentId)}" readonly style="height:36px; font-size:12px;">
          <button type="button" class="audit-btn-sec" style="height:36px; white-space:nowrap;" onclick="copyAuditSyncId()">📋 Copy</button>
        </div>
        <div style="font-size:11px; color:#64748b; margin-top:5px;">এই ID অন্য ফোন/পিসিতে বসিয়ে একই রিপোর্টগুলো লোড করতে পারবেন।</div>
      </div>

      <div style="background:#f8fafc; border:1px solid #cbd5e1; border-radius:10px; padding:10px;">
        <div style="font-size:11px; color:#64748b; font-weight:700;">RESTORE FROM ANOTHER DEVICE ID</div>
        <div style="display:flex; gap:6px; align-items:center; margin-top:5px;">
          <input type="text" id="restoreSyncIdInput" placeholder="Paste Sync ID (e.g. dev_...)" style="height:36px; font-size:12px;">
          <button type="button" class="audit-btn-primary" style="height:36px; flex:0 0 auto; padding:0 12px;" onclick="restoreAuditFromCloud()">☁️ Load</button>
        </div>
      </div>

      <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
        <button type="button" class="audit-btn-sec" onclick="exportAuditJSON()">📤 Export JSON</button>
        <button type="button" class="audit-btn-sec" onclick="importAuditJSON()">📥 Import JSON</button>
      </div>
    </div>
  `;
  modal.classList.add('open');
}

function copyAuditSyncId() {
  const id = getAuditDeviceId();
  navigator.clipboard.writeText(id)
    .then(() => alert('Sync ID copied: ' + id))
    .catch(() => alert('Your Sync ID: ' + id));
}

async function restoreAuditFromCloud() {
  const input = document.getElementById('restoreSyncIdInput');
  const targetId = input ? input.value.trim() : '';
  if (!targetId) {
    alert('Please paste a valid Sync ID first.');
    return;
  }
  if (!window.firebaseDB || !window.firebaseGet || !window.firebaseRef) {
    alert('Firebase এখনো সংযুক্ত হয়নি। ইন্টারনেট চেক করুন।');
    return;
  }

  try {
    const snap = await window.firebaseGet(
      window.firebaseRef(window.firebaseDB, 'audit_devices/' + targetId + '/reports')
    );
    if (!snap.exists()) {
      alert('এই Sync ID-তে কোনো সেভ করা রিপোর্ট পাওয়া যায়নি।');
      return;
    }

    const val = snap.val();
    const list = Array.isArray(val) ? val : Object.values(val || {});
    localStorage.setItem(AUDIT_DEVICE_KEY, targetId);
    saveAuditReportsToStorage(list);
    renderAuditReports();
    updateAuditBadges(false);
    closeHomeModal();
    alert(`সফলভাবে ${list.length}টি অডিট রিপোর্ট লোড হয়েছে!`);
  } catch (err) {
    alert('Cloud load failed: ' + err.message);
  }
}

function exportAuditJSON() {
  const list = getAuditReports();
  const payload = {
    app: 'EEEGPT',
    exportedAt: new Date().toISOString(),
    reports: list
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `EEEGPT_Audit_Backup_${toInputDateStr(new Date())}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function importAuditJSON() {
  const picker = document.createElement('input');
  picker.type = 'file';
  picker.accept = '.json,application/json';
  picker.onchange = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const list = Array.isArray(parsed) ? parsed : (Array.isArray(parsed.reports) ? parsed.reports : null);
      if (!list) {
        alert('Invalid backup JSON file.');
        return;
      }
      saveAuditReportsToStorage(list);
      syncAuditToFirebase();
      renderAuditReports();
      updateAuditBadges(false);
      closeHomeModal();
      alert(`সফলভাবে ${list.length}টি রিপোর্ট ইমপোর্ট হয়েছে!`);
    } catch (err) {
      alert('ফাইলটি পড়া যায়নি: ' + err.message);
    }
  };
  picker.click();
}
/* =========================================================
   STEP 2 TOOLS: PFI • SUBSTATION/FAULT • IPS/UPS
========================================================= */
function backFromElectricalTool() {
  hideAllPages();
  document.getElementById('electricalPage').classList.add('on');
  history.pushState({ page: 'electrical' }, '', '#electrical');
}

/* ---------- 1. PFI / CAPACITOR BANK CALCULATOR ---------- */
function showPfiCalculator() {
  hideAllPages();
  document.getElementById('pfiPage').classList.add('on');
  calculatePFI();
  history.pushState({ page: 'pfi' }, '', '#pfi');
}

function pfiPhaseChange() {
  const ph = document.getElementById('pfiPhase').value;
  document.getElementById('pfiVoltage').value = ph === '3' ? 400 : 230;
  calculatePFI();
}

function suggestPfiStages(kvar) {
  if (kvar <= 0) return 'No capacitor bank required';
  if (kvar <= 10) return `Suggested Unit: ${Math.ceil(kvar / 2.5) * 2.5} kVAR Fixed / 2-Step`;

  const rounded = Math.ceil(kvar / 5) * 5;
  let rem = rounded;
  const steps = [];
  [50, 25, 10, 5].forEach(sz => {
    const cnt = Math.floor(rem / sz);
    if (cnt > 0) {
      steps.push(`${cnt}×${sz}`);
      rem -= cnt * sz;
    }
  });
  return `Standard APFI Bank: ${rounded} kVAR (Steps: ${steps.join(' + ')} kVAR)`;
}

function calculatePFI() {
  const val = Number(document.getElementById('pfiLoadVal').value);
  const unit = document.getElementById('pfiLoadUnit').value;
  const ph = document.getElementById('pfiPhase').value;
  const V = Number(document.getElementById('pfiVoltage').value);
  const pf1 = Number(document.getElementById('pfiCurrentPf').value);
  const pf2 = Number(document.getElementById('pfiTargetPf').value);

  const kvarEl = document.getElementById('pfiKvarRes');
  const stageEl = document.getElementById('pfiStagePlan');
  const curEl = document.getElementById('pfiAfterCurrent');
  const savEl = document.getElementById('pfiSavingsPct');
  const brkEl = document.getElementById('pfiBreakerCable');
  const detEl = document.getElementById('pfiDetails');

  if (!Number.isFinite(val) || val <= 0 || !Number.isFinite(V) || V <= 0 ||
      !Number.isFinite(pf1) || pf1 <= 0 || pf1 > 1 ||
      !Number.isFinite(pf2) || pf2 <= 0 || pf2 > 1) {
    kvarEl.textContent = '— kVAR';
    stageEl.textContent = 'Enter valid inputs (0 < PF ≤ 1)';
    return;
  }

  const factor = ph === '3' ? Math.sqrt(3) : 1;
  let P = 0;
  let I1 = 0;

  if (unit === 'kw') {
    P = val;
    I1 = (P * 1000) / (factor * V * pf1);
  } else if (unit === 'kva') {
    P = val * pf1;
    I1 = (val * 1000) / (factor * V);
  } else {
    I1 = val;
    P = (factor * V * I1 * pf1) / 1000;
  }

  if (pf2 <= pf1) {
    kvarEl.textContent = '0 kVAR';
    stageEl.textContent = 'Target PF is already met or lower than Current PF.';
    curEl.textContent = `${I1.toFixed(1)} A`;
    savEl.textContent = '0% change';
    brkEl.textContent = '—';
    return;
  }

  const tan1 = Math.sqrt(Math.max(0, 1 - pf1 * pf1)) / pf1;
  const tan2 = Math.sqrt(Math.max(0, 1 - pf2 * pf2)) / pf2;
  const qc = P * (tan1 - tan2);
  const I2 = (P * 1000) / (factor * V * pf2);
  const savedA = I1 - I2;
  const savedPct = (savedA / I1) * 100;

  const capCurrent = (qc * 1000) / (factor * V);
  const stdBreakers = [6, 10, 16, 20, 25, 32, 40, 50, 63, 80, 100, 125, 160, 200, 250, 315, 400, 500, 630, 800, 1000];
  const pfiIn = stdBreakers.find(b => b >= capCurrent * 1.35) || Math.ceil(capCurrent * 1.35);

  kvarEl.textContent = `${qc.toFixed(2)} kVAR`;
  stageEl.textContent = suggestPfiStages(qc);
  curEl.textContent = `${I1.toFixed(1)} A → ${I2.toFixed(1)} A`;
  savEl.textContent = `Saves ${savedA.toFixed(1)} A (${savedPct.toFixed(1)}% reduction)`;
  brkEl.textContent = `${pfiIn} A ${pfiIn > 63 ? 'MCCB' : 'MCB'}`;

  detEl.innerHTML = `
    • <strong>Formula:</strong> Qc = P × (tan φ1 − tan φ2)<br>
    • <strong>Active Power (P):</strong> ${P.toFixed(2)} kW<br>
    • <strong>tan φ1 (PF ${pf1}):</strong> ${tan1.toFixed(3)} | <strong>tan φ2 (PF ${pf2}):</strong> ${tan2.toFixed(3)}<br>
    • <strong>Capacitor Rated Current:</strong> ${capCurrent.toFixed(1)} A (Breaker sized at 135% = ${(capCurrent * 1.35).toFixed(1)} A)<br>
    • <strong>Note:</strong> If facility has heavy VFD/rectifier loads, use 7% Detuned Reactor PFI Panel (440V/480V rated capacitors).
    • <strong>Code Justification (IEC 60831-1 &amp; BERC/Utility Tariff):</strong> 135% breaker margin handles capacitor switching harmonics &amp; +10% overvoltage; maintaining PF ≥ 0.95 avoids utility low-PF penalty.<br>
  `;
}

/* ---------- 2. SUBSTATION, GENERATOR & FAULT LEVEL ---------- */
function showSubstationTool() {
  hideAllPages();
  document.getElementById('substationToolPage').classList.add('on');
  calculateSubstationTool();
  history.pushState({ page: 'substationTool' }, '', '#substation-tool');
}

function calculateSubstationTool() {
  const connKW = Number(document.getElementById('subConnLoad').value);
  const div = Number(document.getElementById('subDivFactor').value) || 0.70;
  const expPct = Number(document.getElementById('subExpansion').value) || 0;
  const V = Number(document.getElementById('subVoltage').value) || 415;
  const zPct = Number(document.getElementById('subImpedance').value) || 4.5;
  const genTargetPct = Number(document.getElementById('subGenTargetLoad').value) || 80;

  if (!Number.isFinite(connKW) || connKW <= 0) {
    document.getElementById('subTxRating').textContent = '— kVA';
    return;
  }

  const designKW = connKW * div * (1 + expPct / 100);
  const designKVA = designKW / 0.80;

  const STD_TX = [50, 100, 160, 200, 250, 315, 400, 500, 630, 800, 1000, 1250, 1600, 2000, 2500, 3150];
  const txKva = STD_TX.find(s => s >= designKVA) || Math.ceil(designKVA);
  const txLoading = (designKVA / txKva) * 100;

  const txFlc = (txKva * 1000) / (Math.sqrt(3) * V);
  const iscKA = (txFlc / (zPct / 100)) / 1000;
  const STD_ICU = [16, 25, 36, 50, 65, 85, 100];
  const recIcu = STD_ICU.find(k => k >= iscKA) || Math.ceil(iscKA);

  const reqGenKva = designKVA / (genTargetPct / 100);
  const STD_GEN = [15, 20, 30, 45, 60, 80, 100, 125, 150, 200, 250, 300, 350, 400, 500, 625, 750, 1000, 1250, 1500, 2000];
  const genKva = STD_GEN.find(g => g >= reqGenKva) || Math.ceil(reqGenKva);
  const genKW = genKva * 0.80;

  let txRoomArea = '45 m²';
  if (txKva <= 150) txRoomArea = '45 m²';
  else if (txKva <= 400) txRoomArea = '48 m²';
  else if (txKva <= 800) txRoomArea = '100 m² (2×400 equiv.)';
  else txRoomArea = '135 m²+';

  let genRoomArea = '20 m²';
  if (genKW <= 25) genRoomArea = '20 m²';
  else if (genKW <= 48) genRoomArea = '24 m²';
  else if (genKW <= 100) genRoomArea = '30 m²';
  else if (genKW <= 150) genRoomArea = '36 m²';
  else if (genKW <= 300) genRoomArea = '48 m²';
  else if (genKW <= 500) genRoomArea = '56 m²';
  else genRoomArea = '65 m²+';

  document.getElementById('subTxRating').textContent = `${txKva} kVA`;
  document.getElementById('subTxLoading').textContent = `Design Demand: ${designKVA.toFixed(1)} kVA (${txLoading.toFixed(1)}% loaded)`;
  document.getElementById('subFaultLevel').textContent = `${iscKA.toFixed(2)} kA`;
  document.getElementById('subFaultBreaker').textContent = `Min LT Incomer Icu ≥ ${recIcu} kA (FLC: ${txFlc.toFixed(0)} A)`;
  document.getElementById('subGenRating').textContent = `${genKva} kVA (${genKW.toFixed(0)} kW)`;
  document.getElementById('subGenNote').textContent = `Sized for ${genTargetPct}% prime loading`;
  document.getElementById('subRoomArea').textContent = `Sub: ${txRoomArea} | Gen: ${genRoomArea}`;

 document.getElementById('subDetails').innerHTML = `
    • <strong>Demand Basis (RSC Sec 10.5.1 / BNBC Sec 1.3.2):</strong> ${connKW} kW × ${div} × (1 + ${expPct}%) = <strong>${designKW.toFixed(1)} kW</strong> (${designKVA.toFixed(1)} kVA @ 0.80 PF).<br>
    • <strong>Fault Level Basis (IEC 60909 / BNBC Cl. 1.3.30(a)):</strong> Secondary bolted Isc = I_FL / (%Z/100) = <strong>${iscKA.toFixed(2)} kA</strong> (conservative infinite-bus value; LT breaker Icu must be ≥ Isc).<br>
    • <strong>Room Area (BNBC 2020 Tables 8.1.23 &amp; 8.1.24):</strong> Substation ${txRoomArea}, Generator ${genRoomArea} (1×150:45m², 1×400:48m², 2×400:100m², 3×400:135m²).<br>
    • <strong>Clearance (RSC Sec 10.5.3):</strong> Minimum 1.07 m (3.5 ft) working clearance &amp; no storage inside substation.
  `;
}

/* ---------- 3. IPS / UPS & BATTERY BACKUP CALCULATOR ---------- */
function showUpsCalculator() {
  hideAllPages();
  document.getElementById('upsPage').classList.add('on');
  calculateUps();
  history.pushState({ page: 'ups' }, '', '#ups');
}

function calculateUps() {
  const loadW = Number(document.getElementById('upsLoadWatt').value);
  const dcV = Number(document.getElementById('upsDcVolt').value) || 12;
  const ah = Number(document.getElementById('upsBattAh').value);
  const strings = Math.max(1, Math.floor(Number(document.getElementById('upsStrings').value) || 1));
  const eff = Number(document.getElementById('upsEff').value) || 0.85;
  const dod = Number(document.getElementById('upsDod').value) || 0.80;

  if (!Number.isFinite(loadW) || loadW <= 0 || !Number.isFinite(ah) || ah <= 0) {
    document.getElementById('upsBackupTime').textContent = '—';
    return;
  }

  const totalBattUnits = (dcV / 12) * strings;
  const totalAh = ah * strings;
  const usableWh = dcV * totalAh * dod * eff;
  const hoursFloat = usableWh / loadW;

  const hrs = Math.floor(hoursFloat);
  const mins = Math.round((hoursFloat - hrs) * 60);
  const timeStr = hrs > 0 ? `${hrs} hr ${mins} min` : `${mins} min`;

  const reqVA = (loadW / 0.8) * 1.25;
  const STD_UPS = [600, 800, 1000, 1200, 1500, 2000, 3000, 5000, 7500, 10000, 15000, 20000, 30000];
  const recVA = STD_UPS.find(v => v >= reqVA) || Math.ceil(reqVA);

  const dcCurrent = loadW / (dcV * eff);
  const dcFuse = Math.ceil((dcCurrent * 1.25) / 10) * 10;
  const chargeCurrent = totalAh * 0.10;
  const rechargeHours = (totalAh * dod * 1.15) / chargeCurrent;

  document.getElementById('upsBackupTime').textContent = timeStr;
  document.getElementById('upsBattCount').textContent = `Total Batteries: ${totalBattUnits} × (12V ${ah}Ah) = ${dcV}V ${totalAh}Ah Bank`;
  document.getElementById('upsRatingVa').textContent = `${recVA} VA (${(recVA / 1000).toFixed(2)} kVA)`;
  document.getElementById('upsDcCurrent').textContent = `${dcCurrent.toFixed(1)} A (Fuse ~${dcFuse} A)`;
  document.getElementById('upsRechargeTime').textContent = `${chargeCurrent.toFixed(0)} A (~${rechargeHours.toFixed(1)} hrs)`;

 document.getElementById('upsDetails').innerHTML = `
    • <strong>IEEE 485 Sizing Formula:</strong> Hours = (DcV × Total Ah × DoD × η) / Load(W) = ${usableWh.toFixed(0)} Wh / ${loadW} W = <strong>${hoursFloat.toFixed(2)} hrs</strong>.<br>
    • <strong>IEC 62040-3 UPS Rating:</strong> Load(W) / 0.80 PF × 1.25 surge margin ensures safe starting of inductive loads.<br>
    • <strong>Peukert's Law Note:</strong> For Lead-Acid batteries discharging fast (&lt; 2 hrs), real backup may be 15–20% shorter than nominal Ah calculation.
  `;
}
/* =========================================================
   STEP 3: ELECTRONICS CALCULATORS
========================================================= */
function setElectronicsTab(tab) {
  const map = { res: 'elPanelRes', ohm: 'elPanelOhm', rc: 'elPanelRc' };
  const btnMap = { res: 'elTabRes', ohm: 'elTabOhm', rc: 'elTabRc' };
  Object.keys(map).forEach(k => {
    const p = document.getElementById(map[k]);
    const b = document.getElementById(btnMap[k]);
    if (p) p.classList.toggle('hidden', k !== tab);
    if (b) b.classList.toggle('active', k === tab);
  });
}

function formatOhms(ohms) {
  if (!Number.isFinite(ohms)) return '—';
  if (ohms >= 1e6) return (ohms / 1e6).toFixed(2).replace(/\.00$/, '') + ' MΩ';
  if (ohms >= 1e3) return (ohms / 1e3).toFixed(2).replace(/\.00$/, '') + ' kΩ';
  return ohms.toFixed(2).replace(/\.00$/, '') + ' Ω';
}

function calculateColorCode() {
  const b1 = Number(document.getElementById('elBand1').value);
  const b2 = Number(document.getElementById('elBand2').value);
  const mult = Number(document.getElementById('elBandMult').value);
  const tol = document.getElementById('elBandTol').value;

  const digitColors = {
    0: '#111827', 1: '#78350f', 2: '#dc2626', 3: '#f97316', 4: '#eab308',
    5: '#16a34a', 6: '#2563eb', 7: '#9333ea', 8: '#6b7280', 9: '#f8fafc'
  };
  const multColors = {
    '1': '#111827', '10': '#78350f', '100': '#dc2626', '1000': '#f97316',
    '10000': '#eab308', '100000': '#16a34a', '1000000': '#2563eb',
    '10000000': '#9333ea', '0.1': '#d97706', '0.01': '#94a3b8'
  };
  const tolColors = {
    '±5%': '#d97706', '±10%': '#94a3b8', '±1%': '#78350f', '±2%': '#dc2626',
    '±0.5%': '#16a34a', '±0.25%': '#2563eb', '±0.1%': '#9333ea'
  };

  const prev = document.getElementById('elResPreview');
  if (prev) {
    prev.innerHTML = `
      <div class="el-res-body">
        <span class="el-res-band" style="background:${digitColors[b1] || '#111'}"></span>
        <span class="el-res-band" style="background:${digitColors[b2] || '#111'}"></span>
        <span class="el-res-band" style="background:${multColors[String(mult)] || '#111'}"></span>
        <span class="el-res-band" style="background:${tolColors[tol] || '#d97706'}"></span>
      </div>
    `;
  }

  const val = ((b1 * 10) + b2) * mult;
  document.getElementById('elResVal').textContent = `${formatOhms(val)} ${tol}`;
}

function decodeSmdResistor() {
  const raw = (document.getElementById('elSmdInput').value || '').trim().toUpperCase();
  const out = document.getElementById('elSmdVal');
  if (!raw) { out.textContent = '—'; return; }

  if (/^0+$/.test(raw)) {
    out.textContent = '0 Ω (Jumper)';
    return;
  }
  if (raw.includes('R')) {
    const num = Number(raw.replace('R', '.'));
    out.textContent = Number.isFinite(num) ? formatOhms(num) : 'Invalid Code';
    return;
  }
  if (/^\d{3}$/.test(raw)) {
    const val = Number(raw.slice(0, 2)) * Math.pow(10, Number(raw[2]));
    out.textContent = formatOhms(val);
    return;
  }
  if (/^\d{4}$/.test(raw)) {
    const val = Number(raw.slice(0, 3)) * Math.pow(10, Number(raw[3]));
    out.textContent = formatOhms(val);
    return;
  }
  out.textContent = 'Enter 103 / 4701 / 4R7';
}

function calculateDivider() {
  const vin = Number(document.getElementById('elDivVin').value);
  const r1 = Number(document.getElementById('elDivR1').value);
  const r2 = Number(document.getElementById('elDivR2').value);
  const outEl = document.getElementById('elDivOut');
  const curEl = document.getElementById('elDivCurr');

  if (!Number.isFinite(vin) || !Number.isFinite(r1) || !Number.isFinite(r2) || r1 < 0 || r2 < 0 || (r1 + r2) <= 0) {
    outEl.textContent = '— V';
    curEl.textContent = 'Enter valid positive resistors';
    return;
  }

  const vout = vin * (r2 / (r1 + r2));
  const currentMa = (vin / (r1 + r2)) * 1000;
  outEl.textContent = `${vout.toFixed(2)} V`;
  curEl.textContent = `Divider Current: ${currentMa.toFixed(2)} mA | Formula: Vout = Vin × R2 / (R1 + R2)`;
}

function calculateLedResistor() {
  const vs = Number(document.getElementById('elLedVs').value);
  const vf = Number(document.getElementById('elLedVf').value);
  const ifMa = Number(document.getElementById('elLedIf').value);
  const resEl = document.getElementById('elLedRes');
  const wattEl = document.getElementById('elLedWatt');

  if (!Number.isFinite(vs) || !Number.isFinite(vf) || !Number.isFinite(ifMa) || ifMa <= 0 || vs <= vf) {
    resEl.textContent = '— Ω';
    wattEl.textContent = vs <= vf ? 'Supply voltage must exceed LED Vf' : 'Enter valid inputs';
    return;
  }

  const iAmp = ifMa / 1000;
  const rExact = (vs - vf) / iAmp;
  const pWatt = (vs - vf) * iAmp;
  const recWatt = pWatt <= 0.125 ? '0.25 W (¼ W)' : (pWatt <= 0.25 ? '0.5 W (½ W)' : `${(pWatt * 2).toFixed(2)} W+`);

  resEl.textContent = `${Math.ceil(rExact)} Ω`;
  wattEl.textContent = `Exact: ${rExact.toFixed(1)} Ω | Power: ${(pWatt * 1000).toFixed(0)} mW → Use ${recWatt} resistor`;
}

function calculateRcFilter() {
  const rK = Number(document.getElementById('elRcR').value);
  const cU = Number(document.getElementById('elRcC').value);
  const fEl = document.getElementById('elRcFreq');
  const tEl = document.getElementById('elRcTau');

  if (!Number.isFinite(rK) || rK <= 0 || !Number.isFinite(cU) || cU <= 0) {
    fEl.textContent = '— Hz';
    return;
  }

  const R = rK * 1000;
  const C = cU * 1e-6;
  const fc = 1 / (2 * Math.PI * R * C);
  const tauMs = R * C * 1000;

  fEl.textContent = fc >= 1000 ? `${(fc / 1000).toFixed(2)} kHz` : `${fc.toFixed(2)} Hz`;
  tEl.textContent = `Time Constant (τ = RC): ${tauMs.toFixed(2)} ms | fc = 1 / (2πRC)`;
}

function calculate555() {
  const r1K = Number(document.getElementById('el555R1').value);
  const r2K = Number(document.getElementById('el555R2').value);
  const cU = Number(document.getElementById('el555C').value);
  const fEl = document.getElementById('el555Freq');
  const dEl = document.getElementById('el555Duty');

  if (!Number.isFinite(r1K) || r1K <= 0 || !Number.isFinite(r2K) || r2K <= 0 || !Number.isFinite(cU) || cU <= 0) {
    fEl.textContent = '— Hz';
    return;
  }

  const r1 = r1K * 1000;
  const r2 = r2K * 1000;
  const c = cU * 1e-6;
  const freq = 1.44 / ((r1 + 2 * r2) * c);
  const duty = ((r1 + r2) / (r1 + 2 * r2)) * 100;
  const tHigh = 0.693 * (r1 + r2) * c * 1000;
  const tLow = 0.693 * r2 * c * 1000;

  fEl.textContent = freq >= 1000 ? `${(freq / 1000).toFixed(2)} kHz` : `${freq.toFixed(2)} Hz`;
  dEl.textContent = `Duty Cycle: ${duty.toFixed(1)}% | High: ${tHigh.toFixed(1)} ms | Low: ${tLow.toFixed(1)} ms`;
}

/* =========================================================
   STEP 3: AUTOMATION CALCULATORS (PLC • VFD • STARTER)
========================================================= */
function setAutomationTab(tab) {
  const map = { scale: 'auPanelScale', vfd: 'auPanelVfd', sd: 'auPanelSd' };
  const btnMap = { scale: 'auTabScale', vfd: 'auTabVfd', sd: 'auTabSd' };
  Object.keys(map).forEach(k => {
    const p = document.getElementById(map[k]);
    const b = document.getElementById(btnMap[k]);
    if (p) p.classList.toggle('hidden', k !== tab);
    if (b) b.classList.toggle('active', k === tab);
  });
}

function calculateAnalogScaling() {
  const sigType = document.getElementById('auSigType').value;
  const sigVal = Number(document.getElementById('auSigVal').value);
  const rawMax = Number(document.getElementById('auRawMax').value) || 27648;
  const engMin = Number(document.getElementById('auEngMin').value);
  const engMax = Number(document.getElementById('auEngMax').value);
  const unit = (document.getElementById('auEngUnit').value || '').trim();

  if (!Number.isFinite(sigVal) || !Number.isFinite(engMin) || !Number.isFinite(engMax)) {
    document.getElementById('auScaleEngOut').textContent = '—';
    return;
  }

  let sMin = 4, sMax = 20;
  if (sigType === '0_20') { sMin = 0; sMax = 20; }
  else if (sigType === '0_10') { sMin = 0; sMax = 10; }

  const ratio = (sigVal - sMin) / (sMax - sMin);
  const engOut = engMin + ratio * (engMax - engMin);
  const rawOut = Math.round(ratio * rawMax);
  const pctOut = ratio * 100;

  document.getElementById('auScaleEngOut').textContent = `${engOut.toFixed(2)} ${unit}`.trim();
  document.getElementById('auScaleRawOut').textContent = `${rawOut} / ${rawMax}`;
  document.getElementById('auScalePctOut').textContent = `${pctOut.toFixed(1)}%`;

  let statusMsg = '✓ Signal within normal linear range.';
  if (sigType === '4_20' && sigVal < 3.8) statusMsg = '⚠️ Loop Fault / Wire Break (< 3.8 mA live-zero threshold)!';
  else if (sigVal > sMax * 1.02) statusMsg = '⚠️ Over-Range Warning (Exceeds upper signal limit).';
  else if (sigVal < sMin) statusMsg = '⚠️ Under-Range Warning (Below lower signal limit).';

  document.getElementById('auScaleStatus').textContent = statusMsg;
}

function calculateVfdSpeed() {
  const kw = Number(document.getElementById('auVfdKw').value);
  const freq = Number(document.getElementById('auVfdFreq').value);
  const poles = Number(document.getElementById('auVfdPoles').value) || 4;
  const baseFreq = Number(document.getElementById('auVfdBaseFreq').value) || 50;
  const slip = Number(document.getElementById('auVfdSlip').value) || 0;

  if (!Number.isFinite(freq) || freq <= 0 || !Number.isFinite(kw) || kw <= 0) {
    document.getElementById('auVfdActRpm').textContent = '— RPM';
    return;
  }

  const syncRpm = (120 * freq) / poles;
  const actRpm = syncRpm * (1 - slip / 100);
  const torqueNm = actRpm > 0 ? (9550 * kw) / actRpm : 0;

  document.getElementById('auVfdActRpm').textContent = `${Math.round(actRpm)} RPM`;
  document.getElementById('auVfdSyncRpm').textContent = `Synchronous Speed (Ns): ${Math.round(syncRpm)} RPM (Ns = 120f / P)`;
  document.getElementById('auVfdTorque').textContent = `Rated Torque @ ${kw} kW: ${torqueNm.toFixed(1)} Nm`;
  document.getElementById('auVfdModeNote').textContent = freq > baseFreq
    ? `⚠️ Above Base Freq (${baseFreq} Hz): Field-Weakening Region — Available motor torque drops!`
    : `✓ Constant Torque Region (≤ ${baseFreq} Hz V/f ratio maintained).`;
}

function calculateStarDelta() {
  const val = Number(document.getElementById('auSdVal').value);
  const unit = document.getElementById('auSdUnit').value;
  const volt = Number(document.getElementById('auSdVolt').value) || 400;
  const pf = Number(document.getElementById('auSdPf').value) || 0.85;
  const eff = Number(document.getElementById('auSdEff').value) || 0.90;

  if (!Number.isFinite(val) || val <= 0) {
    document.getElementById('auSdLineAmp').textContent = '— A';
    return;
  }

  const watt = unit === 'hp' ? val * 745.7 : val * 1000;
  const lineAmp = watt / (Math.sqrt(3) * volt * pf * eff);
  const phaseAmp = lineAmp / Math.sqrt(3);
  const starAmp = lineAmp / 3;

  const STD_CONTACTORS = [9, 12, 18, 25, 32, 40, 50, 65, 80, 95, 115, 150, 185, 225, 265, 330, 400, 500, 630];
  const mainDeltaCont = STD_CONTACTORS.find(c => c >= phaseAmp) || Math.ceil(phaseAmp);
  const starCont = STD_CONTACTORS.find(c => c >= starAmp) || Math.ceil(starAmp);

  const STD_BREAKERS = [10, 16, 20, 25, 32, 40, 50, 63, 80, 100, 125, 160, 200, 250, 315, 400, 500, 630];
  const mccb = STD_BREAKERS.find(b => b >= lineAmp * 1.25) || Math.ceil(lineAmp * 1.25);

  document.getElementById('auSdLineAmp').textContent = `${lineAmp.toFixed(1)} A`;
  document.getElementById('auSdPhaseAmp').textContent = `${phaseAmp.toFixed(1)} A`;
  document.getElementById('auSdMainDelta').textContent = `${mainDeltaCont} A (AC-3)`;
  document.getElementById('auSdStar').textContent = `${starCont} A (AC-3)`;
  document.getElementById('auSdOlrPhase').innerHTML = `<strong>OLR Setting (Under Main Contactor):</strong> ${phaseAmp.toFixed(1)} A (If placed on Main Line: ${lineAmp.toFixed(1)} A)`;
  document.getElementById('auSdBreaker').textContent = `Main Backup Breaker (125%): ${mccb} A ${mccb > 63 ? 'MCCB' : 'MCB'} | Star-Delta Timer: 5–10 sec`;
}
/* =========================================================
   STEP 4: INTERACTIVE ELECTRICAL SAFETY AUDIT CHECKLIST
========================================================= */
const CHK_STORAGE_KEY = 'eeegpt_audit_checklist_v1';

function getChecklistState() {
  try {
    const raw = localStorage.getItem(CHK_STORAGE_KEY);
    return raw ? JSON.parse(raw) : { meta: {}, statuses: {}, remarks: {} };
  } catch (e) {
    return { meta: {}, statuses: {}, remarks: {} };
  }
}

function saveChecklistState(state) {
  localStorage.setItem(CHK_STORAGE_KEY, JSON.stringify(state));
}

function showAuditChecklist() {
  hideAllPages();
  document.getElementById('auditChecklistPage').classList.add('on');

  const state = getChecklistState();
  const m = state.meta || {};
  if (document.getElementById('chkFacility')) document.getElementById('chkFacility').value = m.facility || '';
  if (document.getElementById('chkRefId')) document.getElementById('chkRefId').value = m.refId || '';
  if (document.getElementById('chkAuditor') && m.auditor) document.getElementById('chkAuditor').value = m.auditor;
  if (document.getElementById('chkDate')) {
    document.getElementById('chkDate').value = m.date || toInputDateStr(new Date());
  }

  renderAuditChecklist();
  history.pushState({ page: 'auditChecklist' }, '', '#audit-checklist');
}

function backFromAuditChecklist() {
  hideAllPages();
  document.getElementById('auditPage').classList.add('on');
  history.pushState({ page: 'audit' }, '', '#audit');
}

function saveChecklistMeta() {
  const state = getChecklistState();
  state.meta = {
    facility: document.getElementById('chkFacility') ? document.getElementById('chkFacility').value : '',
    refId: document.getElementById('chkRefId') ? document.getElementById('chkRefId').value : '',
    auditor: document.getElementById('chkAuditor') ? document.getElementById('chkAuditor').value : '',
    date: document.getElementById('chkDate') ? document.getElementById('chkDate').value : ''
  };
  saveChecklistState(state);
}

function setChecklistStatus(ruleId, status) {
  const state = getChecklistState();
  if (!state.statuses) state.statuses = {};
  state.statuses[ruleId] = state.statuses[ruleId] === status ? '' : status;
  saveChecklistState(state);
  renderAuditChecklist();
}

function setChecklistRemark(ruleId, text) {
  const state = getChecklistState();
  if (!state.remarks) state.remarks = {};
  state.remarks[ruleId] = text;
  saveChecklistState(state);
}

function resetAuditChecklist() {
  if (!confirm('Clear all Pass/Fail marks & remarks for a new audit?')) return;
  localStorage.removeItem(CHK_STORAGE_KEY);
  showAuditChecklist();
}

function renderAuditChecklist() {
  const listEl = document.getElementById('chkItemsList');
  if (!listEl) return;

  const state = getChecklistState();
  const statuses = state.statuses || {};
  const remarks = state.remarks || {};
  const filter = document.getElementById('chkFilterStatus') ? document.getElementById('chkFilterStatus').value : 'all';

  let passCount = 0;
  let failCount = 0;
  let pendingOrNaCount = 0;

  ACTIVE_STANDARDS_DB.forEach(rule => {
    const st = statuses[rule.id] || '';
    if (st === 'pass') passCount++;
    else if (st === 'fail') failCount++;
    else pendingOrNaCount++;
  });

  const applicable = passCount + failCount;
  const scorePct = applicable > 0 ? Math.round((passCount / applicable) * 100) : 0;

  document.getElementById('chkScorePct').textContent = `${scorePct}%`;
  document.getElementById('chkPassCount').textContent = passCount;
  document.getElementById('chkFailCount').textContent = failCount;
  document.getElementById('chkPendingCount').textContent = pendingOrNaCount;

  const filtered = ACTIVE_STANDARDS_DB.filter(rule => {
    const st = statuses[rule.id] || '';
    if (filter === 'fail') return st === 'fail';
    if (filter === 'pass') return st === 'pass';
    if (filter === 'pending') return st === '';
    return true;
  });

  if (filtered.length === 0) {
    listEl.innerHTML = '<div class="card" style="text-align:center; color:var(--m); padding:20px;">No checklist items match this filter.</div>';
    return;
  }

  listEl.innerHTML = filtered.map((rule, idx) => {
    const st = statuses[rule.id] || '';
    const rem = remarks[rule.id] || '';
    const cardCls = st === 'fail' ? 'chk-card is-fail' : (st === 'pass' ? 'chk-card is-pass' : 'chk-card');
    const stdCls = rule.standard.toLowerCase();

    return `
      <div class="${cardCls}">
        <div class="std-badges" style="margin-bottom:6px;">
          <span class="std-badge ${stdCls}">${escapeHTML(rule.standard)}</span>
          <span class="std-badge topic">${escapeHTML(rule.topic)}</span>
        </div>
        <div style="font-size:13.5px; font-weight:800; margin-bottom:3px;">${idx + 1}. ${escapeHTML(rule.title)}</div>
        <div class="std-clause" style="margin-bottom:5px;">📖 ${escapeHTML(rule.clause)}</div>
        <div style="font-size:12px; color:var(--m); line-height:1.5;"><strong>Check:</strong> ${escapeHTML(rule.auditCheck)}</div>

        <div class="chk-btn-row chk-controls-hide">
          <button type="button" class="chk-btn ${st === 'pass' ? 'pass-on' : ''}" onclick="setChecklistStatus('${rule.id}', 'pass')">✅ Pass</button>
          <button type="button" class="chk-btn ${st === 'fail' ? 'fail-on' : ''}" onclick="setChecklistStatus('${rule.id}', 'fail')">❌ Fail</button>
          <button type="button" class="chk-btn ${st === 'na' ? 'na-on' : ''}" onclick="setChecklistStatus('${rule.id}', 'na')">➖ N/A</button>
        </div>

        <input
          type="text"
          class="chk-remark"
          value="${escapeHTML(rem)}"
          placeholder="Observation / Corrective Action (CAP)..."
          oninput="setChecklistRemark('${rule.id}', this.value)"
        >
      </div>
    `;
  }).join('');
}

function exportChecklistCSV() {
  const state = getChecklistState();
  const m = state.meta || {};
  const statuses = state.statuses || {};
  const remarks = state.remarks || {};

  const headers = ['Standard', 'Topic', 'Checklist Item', 'Clause', 'Status', 'Observation / CAP'];
  const rows = ACTIVE_STANDARDS_DB.map(rule => {
    const st = (statuses[rule.id] || 'PENDING').toUpperCase();
    const rem = remarks[rule.id] || '';
    return [
      `"${rule.standard}"`,
      `"${rule.topic}"`,
      `"${rule.title.replace(/"/g, '""')}"`,
      `"${rule.clause.replace(/"/g, '""')}"`,
      `"${st}"`,
      `"${rem.replace(/"/g, '""')}"`
    ].join(',');
  });

  const metaLine = `"Facility: ${(m.facility || '').replace(/"/g, '""')}","Ref: ${(m.refId || '').replace(/"/g, '""')}","Date: ${m.date || ''}"`;
  const csv = [metaLine, headers.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `EEEGPT_Safety_Audit_${toInputDateStr(new Date())}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}