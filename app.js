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
    $('voltage').value = 220;
    $('cablePf').value = 0.85;
  } else if (phaseVal === '3') {
    $('voltage').value = 415;
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
let V = 220;
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
  V = n === 3 ? 415 : 220;
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
  V = 220;
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
      alRuleReason = 'BNBC 2020 (Part 8, Sec 2.7.1.1) অনুযায়ী অভ্যন্তরীণ ফাইনাল ব্রাঞ্চ সার্কিটে (Light/Fan) অ্যালুমিনিয়াম তার সম্পূর্ণ নিষিদ্ধ। কপার নির্বাচন করুন।';
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
    cableDatabaseStatus = 'BNBC 2020 (Sec 2.7.1.1) & RSC 10.3 Note: Bi-Metallic Lugs mandatory when terminating Aluminium to Copper busbar.';
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

  if (databaseCompatible && ambientResult.supported && Number.isFinite(current) && current > 0) {
    selectedBreakerIn = STANDARD_BREAKERS.find(r => r >= current) || Math.ceil(current);

    for (let r = 1; r <= 10; r++) {
      const currentPerRun = current / r;
      const designPerRun = designCurrent / r;
      const breakerPerRun = selectedBreakerIn / r;

      const candidate = matchingCables
        .filter(c => {
          const adjustedAmp = c.derated * ambientResult.factor;
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
      ? `FLC: ${cableFormat(current)} A | Sizing (125%): <strong>${cableFormat(designCurrent)} A</strong><br><span style="font-size:9.5px; color:#4fd18b">Ref: BNBC Sec 2.7.4.3 & NEC 430.22</span>`
      : 'Based on entered load';
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
        const autoAdjustedAmpacity = selectedCableSize.derated * ambientResult.factor;
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
        if (S <= 16) eccSize = S;
        else if (S <= 35) eccSize = 16;
        else {
          const half = S / 2;
          const standardSizes = [25, 35, 50, 70, 95, 120, 150, 185, 240, 300, 400];
          eccSize = standardSizes.find(sz => sz >= half) || Math.ceil(half);
        }

        eccElement.textContent = selectedRuns > 1 ? `${selectedRuns} × ${eccSize} mm²` : `${eccSize} mm²`;
        eccNoteElement.textContent = selectedRuns > 1
          ? `1 × ${eccSize} mm² per run | BNBC Table 8.1.26`
          : `Copper ECC | BNBC Table 8.1.26 (Phase ${S} mm²)`;
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
          <span style="font-size:10px; color:#6b827d">Ref: BNBC 2020 Sec 2.7.4 & IEC 60364-4-43</span>
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
            ? `Per run: ${suitableConduit.metric} ${pipeType} (${totalWiresPerRun} cables, ${fillPercent}% fill ≤ ${maxFillPercent}%)<br><span style="font-size:10px; color:#6b827d">Ref: BNBC 2020 Sec 2.7.3 & NEC Ch. 9</span>`
            : `${pipeType} | ${totalWiresPerRun} cables | Fill: ${fillPercent}% (Max ${maxFillPercent}%)<br><span style="font-size:10px; color:#6b827d">Ref: BNBC 2020 Sec 2.7.3 & NEC Ch. 9</span>`;
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
    messages.push('BNBC Part 8, Sec 2.7.1.1: Aluminium is prohibited in internal branch wiring. Bi-metallic lugs and catalog verification required.');
  }

  const amb = getAmbientCorrection(ambient, insulation);
  const ambFactor = amb.supported ? amb.factor : 1.0;
  if ($('exAmbientCorrection')) {
    $('exAmbientCorrection').textContent = amb.supported
      ? `Factor: ${cableFormat(ambFactor, 2)} (${amb.message})`
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
    dropNoteEl.textContent = vd.percent <= 3.0
      ? `✓ Voltage drop is safe (≤ 3.0% at ${length} ${distanceUnit})`
      : `⚠️ High drop (${cableFormat(vd.percent)}% > 3.0%). Derate load or reduce length.`;
  }

  let eccSize = size <= 16 ? size : (size <= 35 ? 16 : (size / 2));
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

  [
    'electricalPage',
    'auditPage',
    'auditReminderPage',
    'standardViewPage',
    'loadPage',
    'converterPage',
    'cablePage',
    'breakerPage'
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

function brkTypeChange() {
  const type = document.getElementById('brkLoadType').value;

  if (type.startsWith('motor_')) {
    document.getElementById('brkLoadUnit').value = 'kw';
    document.getElementById('brkPhase').value = '3';
    document.getElementById('brkVoltage').value = '415';
    document.getElementById('brkPf').value = '0.85';
    document.getElementById('brkEff').value = '0.90';
  } else if (type === 'transformer') {
    document.getElementById('brkLoadUnit').value = 'kva';
    document.getElementById('brkLoadVal').value = '250';
    document.getElementById('brkPhase').value = '3';
    document.getElementById('brkVoltage').value = '415';
    document.getElementById('brkPf').value = '0.80';
    document.getElementById('brkEff').value = '1.0';
    document.getElementById('brkFaultLocation').value = 'main_lt';
  } else if (type === 'capacitor') {
    document.getElementById('brkLoadUnit').value = 'kva';
    document.getElementById('brkLoadVal').value = '50';
    document.getElementById('brkPhase').value = '3';
    document.getElementById('brkVoltage').value = '415';
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
    document.getElementById('brkVoltage').value = '220';
    document.getElementById('brkPf').value = '0.90';
    document.getElementById('brkEff').value = '1.0';
  }

  calculateBreaker();
}

function brkPhaseChange() {
  const phaseVal = document.getElementById('brkPhase').value;
  if (phaseVal === '1') document.getElementById('brkVoltage').value = '220';
  else if (phaseVal === '3') document.getElementById('brkVoltage').value = '415';
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
      • <strong>RSC (Sec 10 & 11) & BNBC 2020 (Sec 2.7.4):</strong> Golden Rule <em>Ib (${ib.toFixed(1)} A) ≤ In (${In} A) ≤ Iz</em> strictly satisfied. Selected cable ensures the breaker trips before the cable overheats.<br>
      • <strong>NFPA 70 (NEC) Art. 210.20 & 430.22:</strong> 125% continuous sizing factor applied.<br>
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
  const DIVERSITY_FACTOR = 0.75;
  const maxDemandKW = totalKW * DIVERSITY_FACTOR;

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
        <strong>1. Connected Load vs Maximum Demand (BNBC 2020 Sec 2.6.2)</strong><br>
        Total Connected Load = <strong>${totalKW.toFixed(3)} kW (${Math.round(totalWatt)} W)</strong><br>
        Maximum Demand = Connected Load × 0.75 Diversity Factor = <strong>${maxDemandKW.toFixed(3)} kW</strong>
      </div>
      <div class="formula-line">
        <strong>2. Meter & Service Sizing (BPDB / DESCO / DPDC / BREB Rules)</strong><br>
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

  if (browseWrap) browseWrap.style.display = 'block';
  if (listEl) listEl.innerHTML = '';

  const stds = ['BNBC', 'RSC', 'NFPA', 'IEC'];
  const counts = { BNBC: 0, RSC: 0, NFPA: 0, IEC: 0 };

  ACTIVE_STANDARDS_DB.forEach(r => {
    if (counts[r.standard] !== undefined && (!query || matchStandardRule(r, query))) {
      counts[r.standard]++;
    }
  });

  const totalMatches = counts.BNBC + counts.RSC + counts.NFPA + counts.IEC;

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
    return;
  }

  if (clearBtn) clearBtn.style.display = 'flex';
  if (resultsWrap) resultsWrap.style.display = 'block';
  if (countEl) {
    countEl.innerHTML = `<strong>${totalMatches}</strong> match${totalMatches === 1 ? '' : 'es'} found — নিচের যেকোনো বক্সে ট্যাপ করে কোড দেখুন`;
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
   COMING SOON SECTIONS
========================================================= */
function showElectronics() {
  alert('Electronics section is coming soon.');
}

function showAutomation() {
  alert('Automation section is coming soon.');
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
        <button class="tool" onclick="closeHomeModal(); showAuditReminder();">
          <span class="tool-icon">📅</span><span><b>Audit Report Reminder</b><small>Expiry &amp; Red Alert Tracker</small></span>
        </button>
      </div>
    `;
  } else if (type === 'favorites') {
    title.textContent = 'Quick Favorites';
    body.innerHTML = `
      <p style="margin:0 0 10px;">Most used compliance &amp; sizing tools:</p>
      <div style="display:grid; gap:8px;">
        <button class="tool" onclick="closeHomeModal(); showCableCalculator();">
          <span class="tool-icon">📐</span><span><b>Cable Sizing &amp; Audit</b><small>BNBC 2020 • RSC</small></span>
        </button>
        <button class="tool" onclick="closeHomeModal(); showAuditReminder();">
          <span class="tool-icon">📅</span><span><b>Audit Report Submission Reminder</b><small>RSC • BNBC Tracker</small></span>
        </button>
      </div>
    `;
  } else if (type === 'about') {
    title.textContent = 'About EEEGPT';
    body.innerHTML = `
      <p style="margin:0 0 8px;"><strong>EEEGPT</strong> — Your Smart Electrical Assistant built for Bangladesh &amp; International engineering standards (<strong>BNBC 2020, RSC, IEC, NFPA 70</strong>).</p>
      <p style="margin:0;"><strong>Engineer:</strong> Hrridoy Hassen Inno<br>
      <strong>Qualification:</strong> BSc in Electrical and Electronic Engineering<br>
      <strong>Contact:</strong> inno.eee@hotmail.com</p>
    `;
  } else if (type === 'settings') {
    title.textContent = 'App Settings';
    body.innerHTML = `
      <div style="display:grid; gap:10px;">
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
  } else if (action.includes('showAudit')) {
    gtag('event', 'open_audit_section', { section: 'Audit & Standardization' });
  } else if (action.includes('showElectronics')) {
    gtag('event', 'click_coming_soon', { section: 'Electronics' });
  } else if (action.includes('showAutomation')) {
    gtag('event', 'click_coming_soon', { section: 'Automation' });
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