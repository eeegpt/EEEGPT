/* =========================================================
   EEEGPT SIMULATION LAB (115-COMPONENT SIMURELAY CAD EDITION)
========================================================= */

const SIM_GRID = 20;
const SIM_SAVE_KEY = 'eeegpt_sim_lab_saved_v3';

const simState = {
  mode: 'edit', // 'edit' | 'run'
  theme: 'dark',
  libraryOpen: true,
  libCategory: 'ALL',
  libSearch: '',
  vbW: 760,
  vbH: 560,
  cam: { x: 0, y: 0, zoom: 1 },
  isPanning: false,
  panStart: null,
  components: [],
  wires: [],
  selectedCompId: null,
  selectedWireId: null,
  pendingPin: null,
 shortCircuit: false,
  trippedBreakerTags: [],
  nodePhases: new Map(),
  timerHandle: null,
  dragCompId: null,
  dragMoved: false,
  dragOffset: { x: 0, y: 0 },
  activeMomentaryId: null,
  history: [],
  historyIdx: -1
};

const SIM_CATALOG = [
  // 1. POWER & SUPPLY (8)
  { type: 'L1', cat: 'power', defTag: 'L1', title: 'L1 Phase' },
  { type: 'L2', cat: 'power', defTag: 'L2', title: 'L2 Phase' },
  { type: 'L3', cat: 'power', defTag: 'L3', title: 'L3 Phase' },
  { type: 'N', cat: 'power', defTag: 'N', title: 'Neutral N' },
  { type: 'PE', cat: 'power', defTag: 'PE', title: 'Earth PE' },
  { type: 'DC_POS', cat: 'power', defTag: '+24V', title: '+24V DC' },
  { type: 'DC_NEG', cat: 'power', defTag: '0V', title: '0V DC' },
  { type: 'PSU_24V', cat: 'power', defTag: '-G1', title: '24V PSU' },

  // 2. BREAKERS, FUSES & PROTECTION (18)
  { type: 'FUSE_1P', cat: 'breaker', defTag: '-F1', title: '1P Fuse' },
  { type: 'FUSE_3P', cat: 'breaker', defTag: '-F1', title: '3P Fuse' },
  { type: 'MCB_1P', cat: 'breaker', defTag: '-F1', title: '1P MCB' },
  { type: 'MCB_2P', cat: 'breaker', defTag: '-F1', title: '2P MCB' },
  { type: 'MCB_3P', cat: 'breaker', defTag: '-F1', title: '3P MCB' },
  { type: 'MCB_4P', cat: 'breaker', defTag: '-F1', title: '4P MCB' },
  { type: 'MCCB_3P', cat: 'breaker', defTag: '-Q1', title: '3P MCCB' },
  { type: 'MPCB_3P', cat: 'breaker', defTag: '-Q1', title: '3P MPCB' },
  { type: 'RCCB_2P', cat: 'breaker', defTag: '-F2', title: '2P RCCB' },
  { type: 'RCCB_4P', cat: 'breaker', defTag: '-F2', title: '4P RCCB' },
  { type: 'ISO_1P', cat: 'breaker', defTag: '-QS1', title: '1P Isolator' },
  { type: 'ISO_3P', cat: 'breaker', defTag: '-QS1', title: '3P Isolator' },
  { type: 'ISO_4P', cat: 'breaker', defTag: '-QS1', title: '4P Isolator' },
  { type: 'OLR_3P', cat: 'breaker', defTag: '-FR1', title: '3P OLR Power' },
  { type: 'OLR_NC', cat: 'breaker', defTag: '-FR1', title: 'OLR 95-96 NC' },
  { type: 'OLR_NO', cat: 'breaker', defTag: '-FR1', title: 'OLR 97-98 NO' },
  { type: 'OLR_CO', cat: 'breaker', defTag: '-FR1', title: 'OLR CO 95-96-98' },
  { type: 'PHASE_FAIL', cat: 'breaker', defTag: '-PF1', title: 'Phase Guard NC' },

  // 3. PUSHBUTTONS & MANUAL SWITCHES (20)
  { type: 'NO_PB', cat: 'switch', defTag: '-S1', title: 'Start PB (NO)' },
  { type: 'NC_PB', cat: 'switch', defTag: '-S0', title: 'Stop PB (NC)' },
  { type: 'PB_CO', cat: 'switch', defTag: '-S1', title: 'PB Changeover' },
  { type: 'PB_DUAL', cat: 'switch', defTag: '-S1', title: 'Dual Start/Stop' },
  { type: 'ESTOP_NC', cat: 'switch', defTag: '-ES', title: 'E-Stop (NC)' },
  { type: 'ESTOP_NO', cat: 'switch', defTag: '-ES', title: 'E-Stop (NO)' },
  { type: 'ESTOP_CO', cat: 'switch', defTag: '-ES', title: 'E-Stop (CO)' },
  { type: 'PB_LOCK', cat: 'switch', defTag: '-S2', title: 'Latching PB' },
  { type: 'SWITCH', cat: 'switch', defTag: '-S', title: 'SPST NO Switch' },
  { type: 'SW_NC', cat: 'switch', defTag: '-S', title: 'SPST NC Switch' },
  { type: 'SW_SPDT', cat: 'switch', defTag: '-S', title: 'SPDT 2-Way' },
  { type: 'SW_DPST', cat: 'switch', defTag: '-S', title: 'DPST 2P Switch' },
  { type: 'SW_DPDT', cat: 'switch', defTag: '-S', title: 'DPDT Switch' },
  { type: 'SW_3P', cat: 'switch', defTag: '-S', title: '3P Cam Switch' },
  { type: 'SEL_2POS', cat: 'switch', defTag: '-SA1', title: 'Selector 0-1' },
  { type: 'SEL_HOA', cat: 'switch', defTag: '-HOA', title: 'Man-0-Auto' },
  { type: 'KEY_SW_NO', cat: 'switch', defTag: '-SK1', title: 'Key Switch NO' },
  { type: 'KEY_SW_NC', cat: 'switch', defTag: '-SK1', title: 'Key Switch NC' },
  { type: 'FOOT_PB_NO', cat: 'switch', defTag: '-SF1', title: 'Foot Pedal NO' },
  { type: 'FOOT_PB_NC', cat: 'switch', defTag: '-SF1', title: 'Foot Pedal NC' },

  // 4. SENSORS & LIMIT SWITCHES (18)
  { type: 'LIM_NO', cat: 'sensor', defTag: '-SQ1', title: 'Limit NO' },
  { type: 'LIM_NC', cat: 'sensor', defTag: '-SQ1', title: 'Limit NC' },
  { type: 'LIM_CO', cat: 'sensor', defTag: '-SQ1', title: 'Limit CO' },
  { type: 'PROX_NO', cat: 'sensor', defTag: '-B1', title: 'Inductive NO' },
  { type: 'PROX_NC', cat: 'sensor', defTag: '-B1', title: 'Inductive NC' },
  { type: 'PHOTO_NO', cat: 'sensor', defTag: '-B2', title: 'Photo Sensor NO' },
  { type: 'PHOTO_NC', cat: 'sensor', defTag: '-B2', title: 'Photo Sensor NC' },
  { type: 'CAP_NO', cat: 'sensor', defTag: '-B3', title: 'Capacitive NO' },
  { type: 'FLOAT_NO', cat: 'sensor', defTag: '-SL1', title: 'Float NO' },
  { type: 'FLOAT_NC', cat: 'sensor', defTag: '-SL1', title: 'Float NC' },
  { type: 'FLOAT_CO', cat: 'sensor', defTag: '-SL1', title: 'Float CO' },
  { type: 'PRESS_NO', cat: 'sensor', defTag: '-SP1', title: 'Pressure NO' },
  { type: 'PRESS_NC', cat: 'sensor', defTag: '-SP1', title: 'Pressure NC' },
  { type: 'TEMP_NO', cat: 'sensor', defTag: '-ST1', title: 'Thermostat NO' },
  { type: 'TEMP_NC', cat: 'sensor', defTag: '-ST1', title: 'Thermostat NC' },
  { type: 'FLOW_NO', cat: 'sensor', defTag: '-SF1', title: 'Flow NO' },
  { type: 'FLOW_NC', cat: 'sensor', defTag: '-SF1', title: 'Flow NC' },
  { type: 'REED_NO', cat: 'sensor', defTag: '-SR1', title: 'Reed Switch NO' },

  // 5. AUXILIARY, POWER & TIMER CONTACTS (21)
  { type: 'NO_CONT', cat: 'contact', defTag: '-KM1', title: 'NO Aux 13-14' },
  { type: 'NC_CONT', cat: 'contact', defTag: '-KM1', title: 'NC Aux 21-22' },
  { type: 'CO_CONT', cat: 'contact', defTag: '-K1', title: 'Relay CO' },
  { type: 'NO_CONT_2P', cat: 'contact', defTag: '-K1', title: '2P NO Contact' },
  { type: 'NC_CONT_2P', cat: 'contact', defTag: '-K1', title: '2P NC Contact' },
  { type: 'CONT_3P', cat: 'contact', defTag: '-KM1', title: '3P Contactor' },
  { type: 'CONT_4P', cat: 'contact', defTag: '-KM1', title: '4P Contactor' },
  { type: 'CONT_3P_AUX', cat: 'contact', defTag: '-KM1', title: '3P+1NO Contact' },
  { type: 'T_NO_CONT', cat: 'contact', defTag: '-KT1', title: 'TON NO 67-68' },
  { type: 'T_NC_CONT', cat: 'contact', defTag: '-KT1', title: 'TON NC 55-56' },
  { type: 'T_CO_CONT', cat: 'contact', defTag: '-KT1', title: 'TON CO' },
  { type: 'TOF_NO_CONT', cat: 'contact', defTag: '-KT2', title: 'TOF NO' },
  { type: 'TOF_NC_CONT', cat: 'contact', defTag: '-KT2', title: 'TOF NC' },
  { type: 'TOF_CO_CONT', cat: 'contact', defTag: '-KT2', title: 'TOF CO' },
  { type: 'TB_NO_CONT', cat: 'contact', defTag: '-KB1', title: 'Pulse NO' },
  { type: 'TB_NC_CONT', cat: 'contact', defTag: '-KB1', title: 'Pulse NC' },
  { type: 'SD_STAR_NO', cat: 'contact', defTag: '-KSD', title: 'SD Star Contact' },
  { type: 'SD_DELTA_NO', cat: 'contact', defTag: '-KSD', title: 'SD Delta Contact' },
  { type: 'CNT_NO_CONT', cat: 'contact', defTag: '-KC1', title: 'Counter NO' },
  { type: 'CNT_NC_CONT', cat: 'contact', defTag: '-KC1', title: 'Counter NC' },
  { type: 'EARLY_NO', cat: 'contact', defTag: '-KM1', title: 'Early-Make NO' },

  // 6. COILS, TIMERS & COUNTERS (10)
  { type: 'COIL', cat: 'coil', defTag: '-KM1', title: 'Contactor Coil' },
  { type: 'RELAY_COIL', cat: 'coil', defTag: '-K1', title: 'Relay Coil' },
  { type: 'TIMER_COIL', cat: 'coil', defTag: '-KT1', title: 'On-Delay TON' },
  { type: 'TOF_COIL', cat: 'coil', defTag: '-KT2', title: 'Off-Delay TOF' },
  { type: 'BLINK_COIL', cat: 'coil', defTag: '-KB1', title: 'Flasher Timer' },
  { type: 'SD_TIMER', cat: 'coil', defTag: '-KSD', title: 'Star-Delta Timer' },
  { type: 'LATCH_COIL', cat: 'coil', defTag: '-KL1', title: 'Impulse Relay' },
  { type: 'COUNTER_COIL', cat: 'coil', defTag: '-KC1', title: 'Up Counter' },
  { type: 'SOLENOID', cat: 'coil', defTag: '-Y1', title: 'Solenoid Valve' },
  { type: 'BRAKE_COIL', cat: 'coil', defTag: '-YB1', title: 'EM Brake Coil' },

  // 7. MOTORS, LAMPS, METERS & LOADS (20)
  { type: 'MOTOR_1P', cat: 'load', defTag: '-M1', title: '1-Ph Motor' },
  { type: 'MOTOR_3P', cat: 'load', defTag: '-M1', title: '3-Ph Motor' },
  { type: 'MOTOR_6T', cat: 'load', defTag: '-M1', title: '6-Pin Y/Δ Motor' },
  { type: 'MOTOR_2SPD', cat: 'load', defTag: '-M1', title: '2-Speed Motor' },
  { type: 'MOTOR_DC', cat: 'load', defTag: '-M1', title: 'DC Motor' },
  { type: 'LAMP', cat: 'load', defTag: '-H1', title: 'Green Lamp' },
  { type: 'LAMP_RED', cat: 'load', defTag: '-H2', title: 'Red Lamp' },
  { type: 'LAMP_AMB', cat: 'load', defTag: '-H3', title: 'Amber Lamp' },
  { type: 'LAMP_BLU', cat: 'load', defTag: '-H4', title: 'Blue Lamp' },
  { type: 'LAMP_FLASH', cat: 'load', defTag: '-H5', title: 'Strobe Lamp' },
  { type: 'BUZZER', cat: 'load', defTag: '-P1', title: 'Buzzer' },
  { type: 'HORN', cat: 'load', defTag: '-P2', title: 'Siren / Horn' },
  { type: 'HEATER_1P', cat: 'load', defTag: '-E1', title: '1P Heater' },
  { type: 'HEATER_3P', cat: 'load', defTag: '-E2', title: '3P Heater' },
  { type: 'XFMR_1P', cat: 'load', defTag: '-T1', title: '1P Transformer' },
  { type: 'CAP_3P', cat: 'load', defTag: '-C1', title: '3P Capacitor' },
  { type: 'VOLTMETER', cat: 'load', defTag: '-PV1', title: 'Voltmeter' },
  { type: 'AMMETER', cat: 'load', defTag: '-PA1', title: 'Ammeter' },
  { type: 'HOURMETER', cat: 'load', defTag: '-PH1', title: 'Hour Meter' },
  { type: 'JUNCTION', cat: 'load', defTag: '-X1', title: 'Terminal Block' }
];

function simEsc(str) {
  return String(str || '').replace(/[&<>"']/g, m => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[m]));
}

function snap20(v) {
  return Math.round(v / SIM_GRID) * SIM_GRID;
}
function pushSimHistory() {
  const snap = JSON.stringify({
    components: simState.components.map(c => ({
      id: c.id, type: c.type, x: c.x, y: c.y, rot: c.rot || 0,
      tag: c.tag, closed: c.closed, delay: c.delay, preset: c.preset, color: c.color
    })),
    wires: simState.wires.map(w => ({ ...w }))
  });
  if (simState.historyIdx >= 0 && simState.history[simState.historyIdx] === snap) return;
  simState.history = simState.history.slice(0, simState.historyIdx + 1);
  simState.history.push(snap);
  if (simState.history.length > 40) simState.history.shift();
  simState.historyIdx = simState.history.length - 1;
}

function undoSim() {
  if (simState.mode !== 'edit' || simState.historyIdx <= 0) return;
  simState.historyIdx--;
  const data = JSON.parse(simState.history[simState.historyIdx]);
  simState.components = data.components;
  simState.wires = data.wires;
  simState.selectedCompId = null;
  simState.selectedWireId = null;
  simState.pendingPin = null;
  renderSimCanvas();
}

function redoSim() {
  if (simState.mode !== 'edit' || simState.historyIdx >= simState.history.length - 1) return;
  simState.historyIdx++;
  const data = JSON.parse(simState.history[simState.historyIdx]);
  simState.components = data.components;
  simState.wires = data.wires;
  simState.selectedCompId = null;
  simState.selectedWireId = null;
  simState.pendingPin = null;
  renderSimCanvas();
}

function duplicateSelectedSimComp() {
  if (simState.mode !== 'edit') {
    alert('Switch to Edit mode (Stop) to copy a component.');
    return;
  }
  const src = simState.components.find(c => c.id === simState.selectedCompId);
  if (!src) {
    alert('Select a component first to copy.');
    return;
  }
  const id = 'c_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
  const copy = {
    ...src,
    id,
    x: snap20(src.x + 40),
    y: snap20(src.y + 40)
  };
  simState.components.push(copy);
  simState.selectedCompId = id;
  simState.selectedWireId = null;
  pushSimHistory();
  renderSimCanvas();
}

function exportSimPNG() {
  toggleSimMenu(true);
  const svg = document.getElementById('simCanvasSvg');
  if (!svg) return;

  const clone = svg.cloneNode(true);
  const vw = simState.vbW / simState.cam.zoom;
  const vh = simState.vbH / simState.cam.zoom;
  clone.setAttribute('width', 1520);
  clone.setAttribute('height', Math.round(1520 * (vh / vw)));

  const xml = new XMLSerializer().serializeToString(clone);
  const svgBlob = new Blob([xml], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);
  const img = new Image();

  img.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1520;
    canvas.height = Math.round(1520 * (vh / vw));
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    URL.revokeObjectURL(url);

    const a = document.createElement('a');
    a.download = `EEEGPT_Circuit_${Date.now()}.png`;
   a.href = canvas.toDataURL('image/png');
    a.click();
  };
  img.src = url;
}

function printSimPDF() {
  toggleSimMenu(true);
  if (simState.components.length === 0) {
    alert('Canvas is empty! Draw a circuit first.');
    return;
  }

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  simState.components.forEach(c => {
    if (c.x < minX) minX = c.x;
    if (c.y < minY) minY = c.y;
    if (c.x > maxX) maxX = c.x;
    if (c.y > maxY) maxY = c.y;
  });

  // Labels & multi-pole component margins
  minX -= 95; maxX += 65; minY -= 45; maxY += 45;
  const drawW = Math.max(180, maxX - minX);
  const drawH = Math.max(180, maxY - minY);
  const isLandscape = drawW >= drawH;
  const orientation = isLandscape ? 'landscape' : 'portrait';

  // Backup current camera, theme & selection
  const prevTheme = simState.theme;
  const prevCam = { ...simState.cam };
  const prevVb = { w: simState.vbW, h: simState.vbH };
  const prevSelComp = simState.selectedCompId;
  const prevSelWire = simState.selectedWireId;
  const prevPending = simState.pendingPin;

  simState._isPrinting = true;
  simState.theme = 'light';
  simState.selectedCompId = null;
  simState.selectedWireId = null;
  simState.pendingPin = null;

  // Match A4 aspect ratio & auto-fit entire drawing
  simState.vbW = isLandscape ? 1120 : 794;
  simState.vbH = isLandscape ? 794 : 1120;
  const zoom = Math.min(simState.vbW / drawW, simState.vbH / drawH) * 0.94;
  const vw = simState.vbW / zoom;
  const vh = simState.vbH / zoom;
  simState.cam = {
    zoom,
    x: (minX + maxX) / 2 - vw / 2,
    y: (minY + maxY) / 2 - vh / 2
  };

  // Dynamic @page rule for Auto Portrait / Landscape
  let styleEl = document.getElementById('simDynamicPrintPage');
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = 'simDynamicPrintPage';
    document.head.appendChild(styleEl);
  }
  styleEl.textContent = `@media print { @page { size: A4 ${orientation}; margin: 8mm; } }`;

  // Create/Update Engineering Title Block for Print
  const pageEl = document.getElementById('simulationLabPage');
  let tb = document.getElementById('simPrintTitleBlock');
  if (!tb && pageEl) {
    tb = document.createElement('div');
    tb.id = 'simPrintTitleBlock';
    tb.className = 'sim-print-titleblock';
    pageEl.appendChild(tb);
  }
  if (tb) {
    const projTitle = (document.getElementById('simProjectTitle')?.textContent || 'Control Schematic').trim();
    const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    tb.innerHTML = `
      <div>
        <strong>EEEGPT • Electrical Simulation Schematic</strong>
        <span>Project: ${simEsc(projTitle)}</span>
      </div>
      <div style="text-align:right;">
        <strong>Auto Layout: A4 ${orientation.toUpperCase()}</strong>
        <span>${simState.components.length} Components • ${simState.wires.length} Wires • ${today}</span>
      </div>
    `;
  }

  renderSimCanvas();

  let restored = false;
  const restoreView = () => {
    if (restored) return;
    restored = true;
    simState._isPrinting = false;
    simState.theme = prevTheme;
    simState.vbW = prevVb.w;
    simState.vbH = prevVb.h;
    simState.cam = prevCam;
    simState.selectedCompId = prevSelComp;
    simState.selectedWireId = prevSelWire;
    simState.pendingPin = prevPending;
    const dyn = document.getElementById('simDynamicPrintPage');
    if (dyn) dyn.remove();
    syncSimViewBox();
    renderSimCanvas();
  };

  window.addEventListener('afterprint', restoreView, { once: true });

  setTimeout(() => {
    window.print();
    // Fallback for browsers where afterprint doesn't fire reliably
    setTimeout(restoreView, 2500);
  }, 150);
}

const PIN_3P_TYPES = ['FUSE_3P', 'MCB_3P', 'MCCB_3P', 'MPCB_3P', 'ISO_3P', 'OLR_3P', 'CONT_3P', 'SW_3P'];
const PIN_4P_TYPES = ['MCB_4P', 'RCCB_4P', 'ISO_4P', 'CONT_4P'];
const PIN_2P_TYPES = ['MCB_2P', 'RCCB_2P', 'SW_DPST', 'NO_CONT_2P', 'NC_CONT_2P'];
const PIN_CO_TYPES = ['OLR_CO', 'PB_CO', 'ESTOP_CO', 'SW_SPDT', 'SEL_HOA', 'LIM_CO', 'FLOAT_CO', 'CO_CONT', 'T_CO_CONT', 'TOF_CO_CONT'];
const PIN_3T_LOADS = ['MOTOR_3P', 'MOTOR_2SPD', 'HEATER_3P', 'CAP_3P'];

function getCompLocalPins(type) {
  if (['L1', 'L2', 'L3', 'N', 'PE', 'DC_POS', 'DC_NEG'].includes(type)) {
    return [{ x: 20, y: 0, label: '' }];
  }
  if (type === 'JUNCTION') {
    return [{ x: -20, y: 0, label: '' }, { x: 20, y: 0, label: '' }];
  }
  if (PIN_2P_TYPES.includes(type) || type === 'PSU_24V' || type === 'XFMR_1P') {
    const lbls = type === 'PSU_24V' ? ['L', '+24', 'N', '0V'] : ['1', '2', '3', '4'];
    return [
      { x: -20, y: -20, label: lbls[0] }, { x: -20, y: 20, label: lbls[1] },
      { x: 20, y: -20, label: lbls[2] },  { x: 20, y: 20, label: lbls[3] }
    ];
  }
  if (PIN_3P_TYPES.includes(type)) {
    return [
      { x: -40, y: -20, label: '1' }, { x: -40, y: 20, label: '2' },
      { x: 0, y: -20, label: '3' },   { x: 0, y: 20, label: '4' },
      { x: 40, y: -20, label: '5' },  { x: 40, y: 20, label: '6' }
    ];
  }
  if (PIN_4P_TYPES.includes(type) || type === 'CONT_3P_AUX') {
    const lbls = type === 'CONT_3P_AUX' ? ['1','2','3','4','5','6','13','14'] : ['1','2','3','4','5','6','7','8'];
    return [
      { x: -40, y: -20, label: lbls[0] }, { x: -40, y: 20, label: lbls[1] },
      { x: -20, y: -20, label: lbls[2] }, { x: -20, y: 20, label: lbls[3] },
      { x: 20, y: -20, label: lbls[4] },  { x: 20, y: 20, label: lbls[5] },
      { x: 40, y: -20, label: lbls[6] },  { x: 40, y: 20, label: lbls[7] }
    ];
  }
  if (type === 'PB_DUAL') {
    return [
      { x: -20, y: -20, label: '3' }, { x: -20, y: 20, label: '4' },
      { x: 20, y: -20, label: '1' },  { x: 20, y: 20, label: '2' }
    ];
  }
  if (type === 'SW_DPDT') {
    return [
      { x: -40, y: -20, label: '11' }, { x: -60, y: 20, label: '12' }, { x: -20, y: 20, label: '14' },
      { x: 40, y: -20, label: '21' },  { x: 20, y: 20, label: '22' },  { x: 60, y: 20, label: '24' }
    ];
  }
  if (PIN_CO_TYPES.includes(type)) {
    const lbls = type.startsWith('OLR') ? ['95', '96', '98'] : ['11', '12', '14'];
    return [
      { x: 0, y: -20, label: lbls[0] },
      { x: -20, y: 20, label: lbls[1] },
      { x: 20, y: 20, label: lbls[2] }
    ];
  }
  if (PIN_3T_LOADS.includes(type)) {
    return [
      { x: -20, y: -20, label: 'U' },
      { x: 0, y: -20, label: 'V' },
      { x: 20, y: -20, label: 'W' }
    ];
  }
  if (type === 'MOTOR_6T') {
    return [
      { x: -20, y: -20, label: 'U1' }, { x: 0, y: -20, label: 'V1' }, { x: 20, y: -20, label: 'W1' },
      { x: -20, y: 20, label: 'W2' },  { x: 0, y: 20, label: 'U2' },  { x: 20, y: 20, label: 'V2' }
    ];
  }
  if (['COIL', 'RELAY_COIL', 'TIMER_COIL', 'TOF_COIL', 'BLINK_COIL', 'SD_TIMER', 'LATCH_COIL', 'COUNTER_COIL', 'SOLENOID', 'BRAKE_COIL'].includes(type)) {
    return [{ x: 0, y: -20, label: 'A1' }, { x: 0, y: 20, label: 'A2' }];
  }
  if (['NO_CONT', 'EARLY_NO'].includes(type)) return [{ x: 0, y: -20, label: '13' }, { x: 0, y: 20, label: '14' }];
  if (type === 'NC_CONT') return [{ x: 0, y: -20, label: '21' }, { x: 0, y: 20, label: '22' }];
  if (type === 'OLR_NC') return [{ x: 0, y: -20, label: '95' }, { x: 0, y: 20, label: '96' }];
  if (type === 'OLR_NO') return [{ x: 0, y: -20, label: '97' }, { x: 0, y: 20, label: '98' }];
  return [{ x: 0, y: -20, label: '1' }, { x: 0, y: 20, label: '2' }];
}

function getCompPins(comp) {
  const localPins = getCompLocalPins(comp.type);
  const rad = ((comp.rot || 0) * Math.PI) / 180;
  const cos = Math.round(Math.cos(rad));
  const sin = Math.round(Math.sin(rad));

  return localPins.map(p => ({
    x: comp.x + (p.x * cos - p.y * sin),
    y: comp.y + (p.x * sin + p.y * cos),
    label: p.label
  }));
}

function getPinCoords(compId, pinIdx) {
  const c = simState.components.find(item => item.id === compId);
  if (!c) return null;
  return getCompPins(c)[pinIdx] || null;
}

function getCoilByTag(tag) {
  return simState.components.find(c =>
    ['COIL', 'RELAY_COIL', 'LATCH_COIL'].includes(c.type) && c.tag === tag
  );
}

function getTimerByTag(tag, typeList) {
  return simState.components.find(c => typeList.includes(c.type) && c.tag === tag);
}

function isSwitchActive(comp) {
  const t = comp.type;
  if (['FUSE_1P', 'FUSE_3P', 'MCB_1P', 'MCB_2P', 'MCB_3P', 'MCB_4P', 'MCCB_3P', 'MPCB_3P', 'RCCB_2P', 'RCCB_4P', 'ISO_1P', 'ISO_3P', 'ISO_4P', 'OLR_3P'].includes(t)) {
    return comp.closed !== false;
  }
  if (['NO_PB', 'PB_CO', 'FOOT_PB_NO'].includes(t)) return Boolean(comp.pressed);
  if (['NC_PB', 'FOOT_PB_NC'].includes(t)) return !comp.pressed;
  if (['ESTOP_NC', 'OLR_NC', 'PHASE_FAIL', 'SW_NC', 'KEY_SW_NC', 'LIM_NC', 'PROX_NC', 'PHOTO_NC', 'FLOAT_NC', 'PRESS_NC', 'TEMP_NC', 'FLOW_NC'].includes(t)) {
    return !comp.tripped;
  }
  if (['ESTOP_NO', 'ESTOP_CO', 'PB_LOCK', 'SWITCH', 'SW_SPDT', 'SW_DPST', 'SW_DPDT', 'SW_3P', 'SEL_2POS', 'KEY_SW_NO', 'LIM_NO', 'LIM_CO', 'PROX_NO', 'PHOTO_NO', 'CAP_NO', 'FLOAT_NO', 'FLOAT_CO', 'PRESS_NO', 'TEMP_NO', 'FLOW_NO', 'REED_NO', 'OLR_NO', 'OLR_CO'].includes(t)) {
    return Boolean(comp.state);
  }
  if (t === 'SEL_HOA') return comp.hoaState || 0; // 0=Off, 1=Hand(Left), 2=Auto(Right)

  // Linked Contacts
  if (['NO_CONT', 'EARLY_NO', 'NO_CONT_2P', 'CONT_3P', 'CONT_4P', 'CONT_3P_AUX', 'CO_CONT'].includes(t)) {
    const coil = getCoilByTag(comp.tag);
    if (!coil) return false;
    return coil.type === 'LATCH_COIL' ? Boolean(coil.latched) : Boolean(coil.energized);
  }
  if (['NC_CONT', 'NC_CONT_2P'].includes(t)) {
    const coil = getCoilByTag(comp.tag);
    if (!coil) return true;
    return coil.type === 'LATCH_COIL' ? !coil.latched : !coil.energized;
  }
  if (['T_NO_CONT', 'T_CO_CONT'].includes(t)) {
    const tm = getTimerByTag(comp.tag, ['TIMER_COIL']);
    return tm ? Boolean(tm.done) : false;
  }
  if (t === 'T_NC_CONT') {
    const tm = getTimerByTag(comp.tag, ['TIMER_COIL']);
    return tm ? !tm.done : true;
  }
  if (['TOF_NO_CONT', 'TOF_CO_CONT'].includes(t)) {
    const tm = getTimerByTag(comp.tag, ['TOF_COIL']);
    return tm ? Boolean(tm.tofActive) : false;
  }
  if (t === 'TOF_NC_CONT') {
    const tm = getTimerByTag(comp.tag, ['TOF_COIL']);
    return tm ? !tm.tofActive : true;
  }
  if (t === 'TB_NO_CONT') {
    const tm = getTimerByTag(comp.tag, ['BLINK_COIL']);
    return tm ? Boolean(tm.blinkOn) : false;
  }
  if (t === 'TB_NC_CONT') {
    const tm = getTimerByTag(comp.tag, ['BLINK_COIL']);
    return tm ? !tm.blinkOn : true;
  }
  if (t === 'SD_STAR_NO') {
    const tm = getTimerByTag(comp.tag, ['SD_TIMER']);
    return tm ? Boolean(tm.energized && !tm.done) : false;
  }
  if (t === 'SD_DELTA_NO') {
    const tm = getTimerByTag(comp.tag, ['SD_TIMER']);
    return tm ? Boolean(tm.energized && tm.done) : false;
  }
  if (t === 'CNT_NO_CONT') {
    const cn = getTimerByTag(comp.tag, ['COUNTER_COIL']);
    return cn ? (Number(cn.countVal || 0) >= Number(cn.preset || 3)) : false;
  }
  if (t === 'CNT_NC_CONT') {
    const cn = getTimerByTag(comp.tag, ['COUNTER_COIL']);
    return cn ? (Number(cn.countVal || 0) < Number(cn.preset || 3)) : true;
  }
  return false;
}

function getCompBridges(comp) {
  const t = comp.type;
  if (t === 'JUNCTION' || t === 'AMMETER') return [[0, 1]];
  if (t === 'PB_DUAL') {
    const res = [];
    if (comp.pressedStart) res.push([0, 1]);
    if (!comp.pressedStop) res.push([2, 3]);
    return res;
  }
  if (t === 'SEL_HOA') {
    const st = comp.hoaState || 0;
    if (st === 1) return [[0, 1]];
    if (st === 2) return [[0, 2]];
    return [];
  }
  if (PIN_CO_TYPES.includes(t)) {
    return isSwitchActive(comp) ? [[0, 2]] : [[0, 1]];
  }
  if (t === 'SW_DPDT') {
    return isSwitchActive(comp) ? [[0, 2], [3, 5]] : [[0, 1], [3, 4]];
  }
  if (PIN_2P_TYPES.includes(t)) {
    return isSwitchActive(comp) ? [[0, 1], [2, 3]] : [];
  }
  if (PIN_3P_TYPES.includes(t)) {
    return isSwitchActive(comp) ? [[0, 1], [2, 3], [4, 5]] : [];
  }
  if (PIN_4P_TYPES.includes(t) || t === 'CONT_3P_AUX') {
    return isSwitchActive(comp) ? [[0, 1], [2, 3], [4, 5], [6, 7]] : [];
  }

  // Single pole standard switches & contacts
  const nonSwitch = ['L1','L2','L3','N','PE','DC_POS','DC_NEG','PSU_24V','COIL','RELAY_COIL','TIMER_COIL','TOF_COIL','BLINK_COIL','SD_TIMER','LATCH_COIL','COUNTER_COIL','SOLENOID','BRAKE_COIL','MOTOR_1P','MOTOR_3P','MOTOR_6T','MOTOR_2SPD','MOTOR_DC','LAMP','LAMP_RED','LAMP_AMB','LAMP_BLU','LAMP_FLASH','BUZZER','HORN','HEATER_1P','HEATER_3P','XFMR_1P','CAP_3P','VOLTMETER','HOURMETER'];
  if (!nonSwitch.includes(t)) {
    return isSwitchActive(comp) ? [[0, 1]] : [];
  }
  return [];
}

function hasVoltageDiff(setA, setB) {
  if (!setA || !setB || setA.size === 0 || setB.size === 0) return false;
  for (const a of setA) {
    for (const b of setB) {
      if (a !== b) return true;
    }
  }
  return false;
}

function solveSimCircuit() {
  simState.nodePhases = new Map();
  if (simState.mode !== 'run') {
    simState.shortCircuit = false;
    simState.components.forEach(c => {
      c.energized = false;
      c.dir = null;
      c.modeLabel = '';
      c.reading = '0 V';
    });
    return;
  }

  let nodePhases = new Map();
  let lastAdj = new Map();
  const addPhase = (nodeKey, ph) => {
    if (!nodePhases.has(nodeKey)) nodePhases.set(nodeKey, new Set());
    nodePhases.get(nodeKey).add(ph);
  };

  for (let pass = 0; pass < 16; pass++) {
    nodePhases = new Map();
    const adj = new Map();
    const addEdge = (a, b) => {
      if (!adj.has(a)) adj.set(a, []);
      if (!adj.has(b)) adj.set(b, []);
      adj.get(a).push(b);
      adj.get(b).push(a);
    };

    simState.wires.forEach(w => addEdge(`${w.fromComp}:${w.fromPin}`, `${w.toComp}:${w.toPin}`));
    simState.components.forEach(c => {
      getCompBridges(c).forEach(([pA, pB]) => addEdge(`${c.id}:${pA}`, `${c.id}:${pB}`));
    });
    lastAdj = adj;

    const sources = [
      ['L1', 'L1'], ['L2', 'L2'], ['L3', 'L3'],
      ['N', 'N'], ['PE', 'PE'], ['DC_POS', 'DC+'], ['DC_NEG', 'DC-']
    ];

    sources.forEach(([compType, phName]) => {
      const visited = new Set();
      const q = [];
      simState.components.forEach(c => {
        if (c.type === compType) {
          const k = `${c.id}:0`;
          visited.add(k);
          q.push(k);
          addPhase(k, phName);
        }
      });
      while (q.length > 0) {
        const cur = q.shift();
        for (const nxt of (adj.get(cur) || [])) {
          if (!visited.has(nxt)) {
            visited.add(nxt);
            q.push(nxt);
            addPhase(nxt, phName);
          }
        }
      }
    });

    // PSU_24V & XFMR_1P output generation if primary (0,2) energized
    simState.components.forEach(c => {
      if (c.type === 'PSU_24V' || c.type === 'XFMR_1P') {
        const priOk = hasVoltageDiff(nodePhases.get(`${c.id}:0`), nodePhases.get(`${c.id}:2`));
        c.energized = priOk;
        if (priOk) {
          const outPairs = c.type === 'PSU_24V' ? [[1, 'DC+'], [3, 'DC-']] : [[1, 'L1_SEC'], [3, 'N_SEC']];
          outPairs.forEach(([pinIdx, phName]) => {
            const start = `${c.id}:${pinIdx}`;
            const vis = new Set([start]);
            const q = [start];
            addPhase(start, phName);
            while (q.length > 0) {
              const cur = q.shift();
              for (const nxt of (adj.get(cur) || [])) {
                if (!vis.has(nxt)) {
                  vis.add(nxt);
                  q.push(nxt);
                  addPhase(nxt, phName);
                }
              }
            }
          });
        }
      }
    });

    let changed = false;
    simState.components.forEach(c => {
      if (['COIL', 'RELAY_COIL', 'TIMER_COIL', 'TOF_COIL', 'BLINK_COIL', 'SD_TIMER', 'LATCH_COIL', 'COUNTER_COIL', 'SOLENOID', 'BRAKE_COIL'].includes(c.type)) {
        const nextEn = hasVoltageDiff(nodePhases.get(`${c.id}:0`), nodePhases.get(`${c.id}:1`));
        if (Boolean(c.energized) !== nextEn) {
          c.energized = nextEn;
          changed = true;
        }
        if (c.type === 'LATCH_COIL' && nextEn && !c.prevEn) {
          c.latched = !c.latched;
          changed = true;
        }
        if (c.type === 'COUNTER_COIL' && nextEn && !c.prevEn) {
          c.countVal = (c.countVal || 0) + 1;
          changed = true;
        }
        c.prevEn = nextEn;
      }
    });

    if (!changed) break;
  }

 let hasShort = false;
  for (const [, phSet] of nodePhases.entries()) {
    if (phSet.size >= 2) {
      hasShort = true;
      break;
    }
  }

  if (hasShort && !simState._tripPass) {
    let trippedAny = false;
    simState.components.forEach(c => {
      if (['MCB_1P','MCB_2P','MCB_3P','MCB_4P','MCCB_3P','MPCB_3P','RCCB_2P','RCCB_4P','FUSE_1P','FUSE_3P'].includes(c.type) && c.closed !== false) {
        const pins = getCompPins(c);
        const hasPower = pins.some((_, idx) => {
          const s = nodePhases.get(`${c.id}:${idx}`);
          return s && s.size > 0;
        });
        if (hasPower) {
          c.closed = false;
          c.autoTripped = true;
          trippedAny = true;
          if (!simState.trippedBreakerTags.includes(c.tag)) {
            simState.trippedBreakerTags.push(c.tag);
          }
        }
      }
    });
    if (trippedAny) {
      simState._tripPass = true;
      solveSimCircuit();
      simState._tripPass = false;
      return;
    }
  }

  simState.shortCircuit = hasShort;
  simState.nodePhases = nodePhases;

  // Helper to check if nodes are connected together in lastAdj
  const areConnected = (nodeA, nodeB) => {
    const vis = new Set([nodeA]);
    const q = [nodeA];
    while (q.length > 0) {
      const cur = q.shift();
      if (cur === nodeB) return true;
      for (const nxt of (lastAdj.get(cur) || [])) {
        if (!vis.has(nxt)) {
          vis.add(nxt);
          q.push(nxt);
        }
      }
    }
    return false;
  };

  simState.components.forEach(c => {
    if (['LAMP', 'LAMP_RED', 'LAMP_AMB', 'LAMP_BLU', 'LAMP_FLASH', 'BUZZER', 'HORN', 'HEATER_1P', 'MOTOR_1P', 'MOTOR_DC', 'HOURMETER'].includes(c.type)) {
      c.energized = !hasShort && hasVoltageDiff(nodePhases.get(`${c.id}:0`), nodePhases.get(`${c.id}:1`));
    } else if (c.type === 'VOLTMETER') {
      const s0 = nodePhases.get(`${c.id}:0`);
      const s1 = nodePhases.get(`${c.id}:1`);
      if (!hasShort && hasVoltageDiff(s0, s1)) {
        const a = [...s0][0];
        const b = [...s1][0];
        if ((a.startsWith('L') && b.startsWith('L'))) c.reading = '415 V';
        else if (a.startsWith('DC') || b.startsWith('DC')) c.reading = '24 V';
        else c.reading = '230 V';
        c.energized = true;
      } else {
        c.reading = '0 V';
        c.energized = false;
      }
    } else if (c.type === 'AMMETER') {
      const s0 = nodePhases.get(`${c.id}:0`);
      c.energized = !hasShort && Boolean(s0 && s0.size > 0);
    } else if (PIN_3T_LOADS.includes(c.type)) {
      const s0 = nodePhases.get(`${c.id}:0`);
      const s1 = nodePhases.get(`${c.id}:1`);
      const s2 = nodePhases.get(`${c.id}:2`);
      const p0 = s0 && s0.size === 1 ? [...s0][0] : null;
      const p1 = s1 && s1.size === 1 ? [...s1][0] : null;
      const p2 = s2 && s2.size === 1 ? [...s2][0] : null;
      const valid3 = !hasShort && new Set([p0, p1, p2].filter(x => x === 'L1' || x === 'L2' || x === 'L3')).size === 3;
      c.energized = valid3;
     if (valid3 && (c.type === 'MOTOR_3P' || c.type === 'MOTOR_2SPD')) {
        const seq = `${p0}-${p1}-${p2}`;
        c.dir = (seq === 'L1-L2-L3' || seq === 'L2-L3-L1' || seq === 'L3-L1-L2') ? 'fwd' : 'rev';
      } else {
        c.dir = null;
      }
    } else if (c.type === 'MOTOR_6T') {
      const p0 = nodePhases.get(`${c.id}:0`) ? [...nodePhases.get(`${c.id}:0`)][0] : null;
      const p1 = nodePhases.get(`${c.id}:1`) ? [...nodePhases.get(`${c.id}:1`)][0] : null;
      const p2 = nodePhases.get(`${c.id}:2`) ? [...nodePhases.get(`${c.id}:2`)][0] : null;
      const p3 = nodePhases.get(`${c.id}:3`) ? [...nodePhases.get(`${c.id}:3`)][0] : null;
      const p4 = nodePhases.get(`${c.id}:4`) ? [...nodePhases.get(`${c.id}:4`)][0] : null;
      const p5 = nodePhases.get(`${c.id}:5`) ? [...nodePhases.get(`${c.id}:5`)][0] : null;
      const top3 = new Set([p0, p1, p2].filter(x => x === 'L1' || x === 'L2' || x === 'L3')).size === 3;
      const isStar = top3 && areConnected(`${c.id}:3`, `${c.id}:4`) && areConnected(`${c.id}:4`, `${c.id}:5`);
      const isDelta = top3 && p3 && p4 && p5 && p0 !== p4 && p1 !== p5 && p2 !== p3;
      c.energized = !hasShort && (isStar || isDelta);
      c.modeLabel = isDelta ? 'Δ' : (isStar ? 'Y' : '');
      c.dir = c.energized ? 'fwd' : null;
    } else if (hasShort && ['COIL', 'RELAY_COIL', 'TIMER_COIL', 'TOF_COIL', 'BLINK_COIL', 'SD_TIMER'].includes(c.type)) {
      c.energized = false;
    }
  });
}

function startSimTimerLoop() {
  stopSimTimerLoop();
  simState.timerHandle = setInterval(() => {
    if (simState.mode !== 'run') return;
    let needsRender = false;
    let needsSolve = false;

    simState.components.forEach(c => {
      if (c.type === 'TIMER_COIL' || c.type === 'SD_TIMER') {
        const targetMs = (Number(c.delay) || 5) * 1000;
        if (c.energized) {
          if (!c.done) {
            c.elapsedMs = (c.elapsedMs || 0) + 100;
            needsRender = true;
            if (c.elapsedMs >= targetMs) {
              c.done = true;
              needsSolve = true;
            }
          }
        } else if ((c.elapsedMs || 0) > 0 || c.done) {
          c.elapsedMs = 0;
          c.done = false;
          needsRender = true;
          needsSolve = true;
        }
      } else if (c.type === 'TOF_COIL') {
        const targetMs = (Number(c.delay) || 5) * 1000;
        if (c.energized) {
          if (!c.tofActive || (c.elapsedMs || 0) > 0) {
            c.tofActive = true;
            c.elapsedMs = 0;
            needsSolve = true;
            needsRender = true;
          }
        } else if (c.tofActive) {
          c.elapsedMs = (c.elapsedMs || 0) + 100;
          needsRender = true;
          if (c.elapsedMs >= targetMs) {
            c.tofActive = false;
            c.elapsedMs = 0;
            needsSolve = true;
          }
        }
      } else if (c.type === 'BLINK_COIL') {
        const halfMs = ((Number(c.delay) || 1) * 1000) / 2;
        if (c.energized) {
          c.elapsedMs = (c.elapsedMs || 0) + 100;
          if (c.elapsedMs >= halfMs) {
            c.elapsedMs = 0;
            c.blinkOn = !c.blinkOn;
            needsSolve = true;
            needsRender = true;
          }
        } else if (c.blinkOn || (c.elapsedMs || 0) > 0) {
          c.blinkOn = false;
          c.elapsedMs = 0;
          needsSolve = true;
          needsRender = true;
        }
      } else if (c.type === 'HOURMETER' && c.energized) {
        c.elapsedMs = (c.elapsedMs || 0) + 100;
        if (c.elapsedMs % 1000 === 0) needsRender = true;
      }
    });

    if (needsSolve) solveSimCircuit();
    if (needsRender || needsSolve) renderSimCanvas();
  }, 100);
}

function stopSimTimerLoop() {
  if (simState.timerHandle) {
    clearInterval(simState.timerHandle);
    simState.timerHandle = null;
  }
}

function toggleSimPlay() {
  setSimMode(simState.mode === 'run' ? 'edit' : 'run');
}

function setSimMode(mode) {
  simState.mode = mode;
  simState.pendingPin = null;
  simState.selectedCompId = null;
  simState.selectedWireId = null;

  simState.components.forEach(c => {
    c.pressed = false;
    c.pressedStart = false;
    c.pressedStop = false;
    c.energized = false;
    c.prevEn = false;
    c.elapsedMs = 0;
    c.done = false;
    c.tofActive = false;
    c.blinkOn = false;
    c.latched = false;
    c.countVal = 0;
    c.dir = null;
    c.autoTripped = false;
    c.modeLabel = '';
  });
  simState.trippedBreakerTags = [];

  const playBtn = document.getElementById('simPlayBtn');
  if (playBtn) {
    playBtn.classList.toggle('playing', mode === 'run');
    playBtn.innerHTML = mode === 'run'
      ? '<span class="sim-tb-ico">⏹️</span><span>Stop</span>'
      : '<span class="sim-tb-ico">▶️</span><span>Play</span>';
  }

  if (mode === 'run') {
    solveSimCircuit();
    startSimTimerLoop();
  } else {
    stopSimTimerLoop();
    solveSimCircuit();
  }

  updateSimStatus();
  renderSimCanvas();
}

function toggleSimLibrary() {
  simState.libraryOpen = !simState.libraryOpen;
  const sidebar = document.getElementById('simLibraryPanel');
  const btn = document.getElementById('simLibBtn');
  if (sidebar) sidebar.classList.toggle('collapsed', !simState.libraryOpen);
  if (btn) btn.classList.toggle('active', simState.libraryOpen);
}

function toggleSimCanvasTheme() {
  simState.theme = simState.theme === 'dark' ? 'light' : 'dark';
  const btn = document.getElementById('simThemeBtn');
  const wrap = document.getElementById('simWorkspace');
  if (wrap) wrap.classList.toggle('light-canvas', simState.theme === 'light');
  if (btn) {
    btn.innerHTML = simState.theme === 'dark'
      ? '<span class="sim-tb-ico">☀️</span><span>Light</span>'
      : '<span class="sim-tb-ico">🌙</span><span>Dark</span>';
  }
  renderSimCanvas();
}

function toggleSimMenu(forceClose) {
  const menu = document.getElementById('simOverflowMenu');
  if (!menu) return;
  if (forceClose === true) menu.classList.add('hidden');
  else menu.classList.toggle('hidden');
}

function updateSimStatus() {
  const el = document.getElementById('simStatusBar');
  if (!el) return;

 if (simState.mode === 'run') {
    if (simState.shortCircuit) {
      el.className = 'sim-cad-status danger';
      el.textContent = '⚠️ SHORT CIRCUIT! Two different phases or L–N bridged directly!';
    } else if (simState.trippedBreakerTags.length > 0) {
      el.className = 'sim-cad-status danger';
      el.textContent = `⚡ SHORT-CIRCUIT TRIP! ${simState.trippedBreakerTags.join(', ')} tripped open. Fix fault & tap breaker to reset.`;
    } else {
      el.className = 'sim-cad-status run';
      el.textContent = '⚡ LIVE: Hold pushbuttons or tap MCB / Switches / Sensors / OLR to toggle.';
    }
    return;
  }

  if (simState.pendingPin) {
    el.className = 'sim-cad-status wire';
    el.textContent = '〰️ Tap destination pin to complete wire (or tap empty space to cancel).';
    return;
  }

  const selComp = simState.components.find(c => c.id === simState.selectedCompId);
  if (selComp) {
    el.className = 'sim-cad-status';
    el.textContent = `Selected: ${selComp.tag} (${selComp.type}) — Drag to move, or use Values / Rotate / Remove.`;
    return;
  }

  if (simState.selectedWireId) {
    el.className = 'sim-cad-status';
    el.textContent = 'Selected: Wire — Tap Remove in top bar to delete.';
    return;
  }

  el.className = 'sim-cad-status';
  el.textContent = `Library (${SIM_CATALOG.length} items) • Drag on grid • Tap pin→pin to wire • Press Play.`;
}

function getStrokePalette() {
  return simState.theme === 'dark'
    ? { base: '#e2e8f0', muted: '#94a3b8', bg: '#1e1f22', grid: '#2b2d31', tag: '#34d399', pinText: '#34d399', fill: '#26282c' }
    : { base: '#1e293b', muted: '#64748b', bg: '#ffffff', grid: '#e2e8f0', tag: '#0284c7', pinText: '#059669', fill: '#ffffff' };
}

function drawSwitchBlade(x, closed, s, isNC, marker) {
  let blade = '';
  if (isNC) {
    blade = closed
      ? `<polyline points="${x - 5},-8 ${x},-8 ${x},8" fill="none" stroke="${s}" stroke-width="2.1"/>`
      : `<line x1="${x - 10}" y1="-6" x2="${x}" y2="8" stroke="#ef4444" stroke-width="2.2"/>`;
  } else {
    blade = closed
      ? `<line x1="${x}" y1="-8" x2="${x}" y2="8" stroke="#22c55e" stroke-width="2.4"/>`
      : `<line x1="${x - 10}" y1="-7" x2="${x}" y2="8" stroke="${s}" stroke-width="2.1"/>`;
  }
  return `
    <line x1="${x}" y1="-20" x2="${x}" y2="-8" stroke="${s}" stroke-width="2"/>
    <line x1="${x}" y1="8" x2="${x}" y2="20" stroke="${s}" stroke-width="2"/>
    ${blade}
    ${marker || ''}
  `;
}

function renderSymbolGeometry(c, pal, forIcon = false) {
  const t = c.type;
  const en = !forIcon && Boolean(c.energized);
  const s = en ? '#22c55e' : pal.base;
  const active = forIcon ? false : isSwitchActive(c);

  // 1. Sources
  if (['L1', 'L2', 'L3', 'N', 'PE', 'DC_POS', 'DC_NEG'].includes(t)) {
    const cols = { L1: '#ef4444', L2: '#eab308', L3: '#38bdf8', N: '#60a5fa', PE: '#22c55e', DC_POS: '#f97316', DC_NEG: '#94a3b8' };
    const col = cols[t] || '#e2e8f0';
    const lbl = t === 'DC_POS' ? '+24' : (t === 'DC_NEG' ? '0V' : t);
    return `
      <circle cx="-6" cy="0" r="11" fill="none" stroke="${col}" stroke-width="1.8"/>
      <text x="-6" y="3.5" text-anchor="middle" font-size="8.5" font-weight="800" fill="${pal.base}">${simEsc(lbl)}</text>
      <line x1="5" y1="0" x2="20" y2="0" stroke="${col}" stroke-width="2"/>
    `;
  }
  if (t === 'JUNCTION') {
    return `<line x1="-20" y1="0" x2="20" y2="0" stroke="${s}" stroke-width="2"/><circle cx="0" cy="0" r="4" fill="${s}"/>`;
  }

  // 2. PSU / Transformer (4-pin box)
  if (t === 'PSU_24V' || t === 'XFMR_1P') {
    const lbl = t === 'PSU_24V' ? '24VDC' : 'XFMR';
    return `
      <line x1="-20" y1="-20" x2="-20" y2="-10" stroke="${s}" stroke-width="1.8"/>
      <line x1="20" y1="-20" x2="20" y2="-10" stroke="${s}" stroke-width="1.8"/>
      <line x1="-20" y1="10" x2="-20" y2="20" stroke="${s}" stroke-width="1.8"/>
      <line x1="20" y1="10" x2="20" y2="20" stroke="${s}" stroke-width="1.8"/>
      <rect x="-28" y="-10" width="56" height="20" rx="3" fill="${en ? '#166534' : pal.fill}" stroke="${s}" stroke-width="1.8"/>
      <text x="0" y="3.5" text-anchor="middle" font-size="8.5" font-weight="800" fill="${pal.base}">${lbl}</text>
    `;
  }

  // 3. Fuses
  if (t === 'FUSE_1P') {
    const cl = forIcon ? true : active;
    return `<line x1="0" y1="-20" x2="0" y2="20" stroke="${cl ? s : '#ef4444'}" stroke-width="2"/>
      <rect x="-5" y="-10" width="10" height="20" fill="${pal.fill}" stroke="${cl ? s : '#ef4444'}" stroke-width="1.8"/>
      <line x1="0" y1="-10" x2="0" y2="10" stroke="${cl ? s : '#ef4444'}" stroke-width="1.5"/>`;
  }
  if (t === 'FUSE_3P') {
    const cl = forIcon ? true : active;
    return [-40, 0, 40].map(px => `
      <line x1="${px}" y1="-20" x2="${px}" y2="20" stroke="${cl ? s : '#ef4444'}" stroke-width="1.8"/>
      <rect x="${px - 5}" y="-10" width="10" height="20" fill="${pal.fill}" stroke="${cl ? s : '#ef4444'}" stroke-width="1.6"/>
    `).join('') + `<line x1="-40" y1="0" x2="40" y2="0" stroke="${pal.muted}" stroke-width="1.2" stroke-dasharray="3,2"/>`;
  }

  // 4. Multi-pole Breakers / Switches / Power Contacts
  if (PIN_2P_TYPES.includes(t)) {
    const cl = forIcon ? (t.startsWith('MCB') || t.startsWith('RCCB')) : active;
    const isNC = t === 'NC_CONT_2P';
    return drawSwitchBlade(-20, cl, s, isNC) + drawSwitchBlade(20, cl, s, isNC) +
      `<line x1="-24" y1="0" x2="20" y2="0" stroke="${pal.muted}" stroke-width="1.2" stroke-dasharray="3,2"/>`;
  }
  if (PIN_3P_TYPES.includes(t)) {
    const cl = forIcon ? (t.startsWith('MCB') || t.startsWith('MCCB') || t.startsWith('MPCB') || t.startsWith('ISO') || t === 'OLR_3P') : active;
    const extra = t === 'OLR_3P' ? [-40, 0, 40].map(px => `<polyline points="${px - 5},-4 ${px + 5},-4 ${px + 5},4 ${px - 5},4" fill="none" stroke="#f59e0b" stroke-width="1.4"/>`).join('') : '';
    return [-40, 0, 40].map(px => drawSwitchBlade(px, cl, s, false)).join('') +
      `<line x1="-44" y1="0" x2="40" y2="0" stroke="${pal.muted}" stroke-width="1.2" stroke-dasharray="3,2"/>${extra}`;
  }
  if (PIN_4P_TYPES.includes(t) || t === 'CONT_3P_AUX') {
    const cl = forIcon ? t !== 'CONT_4P' && t !== 'CONT_3P_AUX' : active;
    return [-40, -20, 20, 40].map(px => drawSwitchBlade(px, cl, s, false)).join('') +
      `<line x1="-44" y1="0" x2="40" y2="0" stroke="${pal.muted}" stroke-width="1.2" stroke-dasharray="3,2"/>`;
  }
  if (t === 'PB_DUAL') {
    return drawSwitchBlade(-20, forIcon ? false : Boolean(c.pressedStart), s, false) +
      drawSwitchBlade(20, forIcon ? true : !c.pressedStop, s, true) +
      `<line x1="-24" y1="0" x2="16" y2="0" stroke="${pal.muted}" stroke-width="1.2" stroke-dasharray="2,2"/>`;
  }

  // 5. Changeover (SPDT / CO)
  if (PIN_CO_TYPES.includes(t) || t === 'SEL_HOA') {
    const st = t === 'SEL_HOA' ? (c.hoaState || 0) : (active ? 2 : 1);
    const destX = st === 1 ? -20 : (st === 2 ? 20 : 0);
    return `
      <line x1="0" y1="-20" x2="0" y2="-8" stroke="${s}" stroke-width="2"/>
      <line x1="-20" y1="10" x2="-20" y2="20" stroke="${s}" stroke-width="2"/>
      <line x1="20" y1="10" x2="20" y2="20" stroke="${s}" stroke-width="2"/>
      <circle cx="-20" cy="10" r="2.2" fill="${s}"/><circle cx="20" cy="10" r="2.2" fill="${s}"/>
      <line x1="0" y1="-8" x2="${destX}" y2="${st === 0 ? 4 : 10}" stroke="${st === 2 ? '#22c55e' : s}" stroke-width="2.2"/>
    `;
  }
  if (t === 'SW_DPDT') {
    const destOff = active ? 20 : -20;
    return [-40, 40].map(cx => `
      <line x1="${cx}" y1="-20" x2="${cx}" y2="-8" stroke="${s}" stroke-width="1.8"/>
      <line x1="${cx - 20}" y1="10" x2="${cx - 20}" y2="20" stroke="${s}" stroke-width="1.8"/>
      <line x1="${cx + 20}" y1="10" x2="${cx + 20}" y2="20" stroke="${s}" stroke-width="1.8"/>
      <line x1="${cx}" y1="-8" x2="${cx + destOff}" y2="10" stroke="${s}" stroke-width="2"/>
    `).join('') + `<line x1="-40" y1="0" x2="40" y2="0" stroke="${pal.muted}" stroke-width="1.1" stroke-dasharray="2,2"/>`;
  }

  // 6. Coils, Timers, Counters, Solenoids
  if (['COIL', 'RELAY_COIL', 'TIMER_COIL', 'TOF_COIL', 'BLINK_COIL', 'SD_TIMER', 'LATCH_COIL', 'COUNTER_COIL', 'SOLENOID', 'BRAKE_COIL'].includes(t)) {
    let badge = '';
    if (t === 'TIMER_COIL' || t === 'TOF_COIL' || t === 'BLINK_COIL' || t === 'SD_TIMER') {
      const rem = (!forIcon && (c.energized || c.tofActive))
        ? `${Math.max(0, ((Number(c.delay) || 5) - (c.elapsedMs || 0) / 1000)).toFixed(1)}s`
        : `${c.delay || 5}s`;
      const sym = t === 'TOF_COIL' ? 'TOF' : (t === 'BLINK_COIL' ? 'PLS' : (t === 'SD_TIMER' ? 'Y/Δ' : 'TON'));
      badge = `<line x1="-7" y1="-9" x2="-7" y2="9" stroke="${pal.muted}" stroke-width="1.4"/>
        <text x="5" y="0" text-anchor="middle" font-size="6.8" font-weight="800" fill="${pal.muted}">${sym}</text>
        <text x="5" y="7" text-anchor="middle" font-size="7.5" font-weight="800" fill="${pal.base}">${rem}</text>`;
    } else if (t === 'COUNTER_COIL') {
      badge = `<text x="0" y="3" text-anchor="middle" font-size="8.5" font-weight="800" fill="${pal.base}">${c.countVal || 0}/${c.preset || 3}</text>`;
    } else if (t === 'LATCH_COIL') {
      badge = `<path d="M-8,4 L-2,4 L-2,-4 L8,-4" fill="none" stroke="${pal.base}" stroke-width="1.5"/>`;
    } else if (t === 'SOLENOID') {
      badge = `<line x1="-14" y1="9" x2="14" y2="-9" stroke="${pal.muted}" stroke-width="1.5"/>`;
    } else if (t === 'BRAKE_COIL') {
      badge = `<text x="0" y="3.5" text-anchor="middle" font-size="8.5" font-weight="800" fill="${pal.base}">BRK</text>`;
    }
    const bgCol = en || c.tofActive || c.latched ? '#16a34a' : pal.fill;
    return `
      <line x1="0" y1="-20" x2="0" y2="-9" stroke="${s}" stroke-width="2"/>
      <line x1="0" y1="9" x2="0" y2="20" stroke="${s}" stroke-width="2"/>
      <rect x="-16" y="-9" width="32" height="18" fill="${bgCol}" stroke="${en ? '#22c55e' : pal.base}" stroke-width="2"/>
      ${badge}
    `;
  }

  // 7. Loads: Lamps, Buzzers, Heaters, Meters, Motors
  if (t.startsWith('LAMP')) {
    const colMap = { LAMP: '#22c55e', LAMP_RED: '#ef4444', LAMP_AMB: '#f59e0b', LAMP_BLU: '#38bdf8', LAMP_FLASH: '#facc15' };
    const fillCol = en ? (colMap[c.color ? ('LAMP_' + c.color.toUpperCase()) : t] || colMap[t] || '#22c55e') : pal.fill;
    return `
      <line x1="0" y1="-20" x2="0" y2="-11" stroke="${s}" stroke-width="2"/>
      <line x1="0" y1="11" x2="0" y2="20" stroke="${s}" stroke-width="2"/>
      <circle cx="0" cy="0" r="11" fill="${fillCol}" stroke="${en ? fillCol : pal.base}" stroke-width="2"/>
      <line x1="-7" y1="-7" x2="7" y2="7" stroke="${en ? '#ffffff' : pal.muted}" stroke-width="1.6"/>
      <line x1="7" y1="-7" x2="-7" y2="7" stroke="${en ? '#ffffff' : pal.muted}" stroke-width="1.6"/>
    `;
  }
  if (t === 'BUZZER' || t === 'HORN') {
    return `
      <line x1="0" y1="-20" x2="0" y2="-10" stroke="${s}" stroke-width="2"/>
      <line x1="0" y1="10" x2="0" y2="20" stroke="${s}" stroke-width="2"/>
      <polygon points="-12,-10 12,-10 6,10 -6,10" fill="${en ? '#f59e0b' : pal.fill}" stroke="${en ? '#fbbf24' : pal.base}" stroke-width="1.8"/>
      <text x="0" y="3" text-anchor="middle" font-size="8" font-weight="800" fill="${pal.base}">${t === 'HORN' ? 'H' : 'BZ'}</text>
    `;
  }
  if (t === 'HEATER_1P') {
    return `
      <line x1="0" y1="-20" x2="0" y2="-10" stroke="${s}" stroke-width="2"/>
      <line x1="0" y1="10" x2="0" y2="20" stroke="${s}" stroke-width="2"/>
      <rect x="-10" y="-10" width="20" height="20" fill="${en ? '#dc2626' : pal.fill}" stroke="${en ? '#f87171' : pal.base}" stroke-width="1.8"/>
      <line x1="-10" y1="0" x2="10" y2="0" stroke="${pal.muted}" stroke-width="1.4"/>
    `;
  }
  if (t === 'HEATER_3P' || t === 'CAP_3P') {
    const sym = t === 'CAP_3P' ? 'C3' : 'E3';
    return `
      <line x1="-20" y1="-20" x2="-10" y2="-10" stroke="${s}" stroke-width="1.8"/>
      <line x1="0" y1="-20" x2="0" y2="-10" stroke="${s}" stroke-width="1.8"/>
      <line x1="20" y1="-20" x2="10" y2="-10" stroke="${s}" stroke-width="1.8"/>
      <rect x="-15" y="-10" width="30" height="20" rx="3" fill="${en ? '#b91c1c' : pal.fill}" stroke="${s}" stroke-width="1.8"/>
      <text x="0" y="4" text-anchor="middle" font-size="9" font-weight="800" fill="${pal.base}">${sym}</text>
    `;
  }
  if (t === 'VOLTMETER' || t === 'AMMETER' || t === 'HOURMETER') {
    const ch = t === 'VOLTMETER' ? (forIcon ? 'V' : (c.reading || '0 V')) : (t === 'AMMETER' ? 'A' : (forIcon ? 'h' : `${Math.floor((c.elapsedMs || 0) / 1000)}s`));
    return `
      <line x1="0" y1="-20" x2="0" y2="-12" stroke="${s}" stroke-width="2"/>
      <line x1="0" y1="12" x2="0" y2="20" stroke="${s}" stroke-width="2"/>
      <circle cx="0" cy="0" r="12" fill="${en ? '#1e3a8a' : pal.fill}" stroke="${s}" stroke-width="1.8"/>
      <text x="0" y="3.5" text-anchor="middle" font-size="${ch.length > 2 ? 7 : 10}" font-weight="800" fill="${pal.base}">${ch}</text>
    `;
  }
  if (t === 'MOTOR_1P' || t === 'MOTOR_DC') {
    const lbl = t === 'MOTOR_DC' ? 'M=' : 'M1~';
    return `
      <line x1="0" y1="-20" x2="0" y2="-13" stroke="${s}" stroke-width="2"/>
      <line x1="0" y1="13" x2="0" y2="20" stroke="${s}" stroke-width="2"/>
      <circle cx="0" cy="0" r="13" fill="${en ? '#15803d' : pal.fill}" stroke="${en ? '#22c55e' : pal.base}" stroke-width="2"/>
      <g class="${en ? 'sim-motor-spin' : ''}">
        <line x1="-9" y1="0" x2="9" y2="0" stroke="${en ? '#86efac' : pal.muted}" stroke-width="1.5"/>
        <line x1="0" y1="-9" x2="0" y2="9" stroke="${en ? '#86efac' : pal.muted}" stroke-width="1.5"/>
      </g>
      <text x="0" y="3.5" text-anchor="middle" font-size="8" font-weight="900" fill="${en ? '#ffffff' : pal.base}">${lbl}</text>
    `;
  }
  if (t === 'MOTOR_3P' || t === 'MOTOR_2SPD') {
    const spinCls = en ? (c.dir === 'rev' ? 'sim-motor-spin-rev' : 'sim-motor-spin') : '';
    const lbl = t === 'MOTOR_2SPD' ? '2SP' : 'M3~';
    return `
      <line x1="-20" y1="-20" x2="-10" y2="-11" stroke="${s}" stroke-width="1.8"/>
      <line x1="0" y1="-20" x2="0" y2="-14" stroke="${s}" stroke-width="1.8"/>
      <line x1="20" y1="-20" x2="10" y2="-11" stroke="${s}" stroke-width="1.8"/>
      <circle cx="0" cy="2" r="15" fill="${en ? '#15803d' : pal.fill}" stroke="${en ? '#22c55e' : pal.base}" stroke-width="2"/>
      <g class="${spinCls}">
        <line x1="-10" y1="2" x2="10" y2="2" stroke="${en ? '#86efac' : pal.muted}" stroke-width="1.5"/>
        <line x1="0" y1="-8" x2="0" y2="12" stroke="${en ? '#86efac' : pal.muted}" stroke-width="1.5"/>
      </g>
      <text x="0" y="5.5" text-anchor="middle" font-size="8" font-weight="900" fill="${en ? '#ffffff' : pal.base}">${lbl}</text>
    `;
  }
  if (t === 'MOTOR_6T') {
    return `
      <line x1="-20" y1="-20" x2="-10" y2="-11" stroke="${s}" stroke-width="1.8"/>
      <line x1="0" y1="-20" x2="0" y2="-14" stroke="${s}" stroke-width="1.8"/>
      <line x1="20" y1="-20" x2="10" y2="-11" stroke="${s}" stroke-width="1.8"/>
      <line x1="-20" y1="20" x2="-10" y2="11" stroke="${s}" stroke-width="1.8"/>
      <line x1="0" y1="20" x2="0" y2="14" stroke="${s}" stroke-width="1.8"/>
      <line x1="20" y1="20" x2="10" y2="11" stroke="${s}" stroke-width="1.8"/>
      <circle cx="0" cy="0" r="14" fill="${en ? '#15803d' : pal.fill}" stroke="${en ? '#22c55e' : pal.base}" stroke-width="2"/>
      <g class="${en ? 'sim-motor-spin' : ''}">
        <line x1="-9" y1="0" x2="9" y2="0" stroke="${en ? '#86efac' : pal.muted}" stroke-width="1.5"/>
        <line x1="0" y1="-9" x2="0" y2="9" stroke="${en ? '#86efac' : pal.muted}" stroke-width="1.5"/>
      </g>
      <text x="0" y="3.5" text-anchor="middle" font-size="7.5" font-weight="900" fill="${en ? '#ffffff' : pal.base}">${c.modeLabel ? c.modeLabel : 'Y/Δ'}</text>
    `;
  }

  // 8. All remaining single-pole Switches, Pushbuttons, Sensors & Aux Contacts
  const isNC = ['NC_PB','FOOT_PB_NC','ESTOP_NC','OLR_NC','PHASE_FAIL','SW_NC','KEY_SW_NC','LIM_NC','PROX_NC','PHOTO_NC','FLOAT_NC','PRESS_NC','TEMP_NC','FLOW_NC','NC_CONT','T_NC_CONT','TOF_NC_CONT','TB_NC_CONT','CNT_NC_CONT'].includes(t);
  let marker = '';
  if (t.includes('PB') || t.startsWith('ESTOP')) {
    const mCol = isNC || t.startsWith('ESTOP') ? '#ef4444' : '#22c55e';
    marker = `<line x1="-15" y1="0" x2="-6" y2="0" stroke="${mCol}" stroke-width="1.6" stroke-dasharray="2,2"/>
      <line x1="-16" y1="-5" x2="-16" y2="5" stroke="${mCol}" stroke-width="${t.startsWith('ESTOP') ? 4 : 2.6}"/>`;
  } else if (t.startsWith('T_') || t.startsWith('TOF_') || t.startsWith('TB_') || t.startsWith('SD_')) {
    marker = `<path d="M-12,-2 A5,5 0 0,1 -5,-2" fill="none" stroke="#f59e0b" stroke-width="1.8"/>`;
  } else if (t.startsWith('PROX') || t.startsWith('PHOTO') || t.startsWith('CAP')) {
    marker = `<polygon points="-17,-4 -11,0 -17,4" fill="#38bdf8"/>`;
  } else if (t.startsWith('FLOAT') || t.startsWith('PRESS') || t.startsWith('TEMP') || t.startsWith('FLOW') || t.startsWith('LIM')) {
    marker = `<rect x="-17" y="-4" width="6" height="8" fill="none" stroke="#f59e0b" stroke-width="1.4"/>`;
  } else if (t.startsWith('MCB') || t.startsWith('ISO')) {
    marker = `<line x1="-3" y1="-10" x2="3" y2="-6" stroke="${s}" stroke-width="1.5"/><line x1="-3" y1="-6" x2="3" y2="-10" stroke="${s}" stroke-width="1.5"/>`;
  } else if (t.startsWith('OLR')) {
    marker = `<rect x="-17" y="-4" width="6" height="8" fill="none" stroke="#f59e0b" stroke-width="1.5"/>`;
  }

  return drawSwitchBlade(0, forIcon ? isNC : active, s, isNC, marker);
}

function filterSimLibrary() {
  const sel = document.getElementById('simLibCatFilter');
  const inp = document.getElementById('simLibSearchInput');
  simState.libCategory = sel ? sel.value : 'ALL';
  simState.libSearch = inp ? inp.value.trim().toLowerCase() : '';
  buildLibrarySidebar();
}

function buildLibrarySidebar() {
  const container = document.getElementById('simLibraryGrid');
  if (!container) return;
  const darkPal = { base: '#f1f5f9', muted: '#94a3b8', fill: '#1e293b' };

  const items = SIM_CATALOG.filter(item => {
    if (simState.libCategory !== 'ALL' && item.cat !== simState.libCategory) return false;
    if (simState.libSearch && !item.title.toLowerCase().includes(simState.libSearch) && !item.type.toLowerCase().includes(simState.libSearch)) return false;
    return true;
  });

  container.innerHTML = items.map(item => {
    const is4P = PIN_4P_TYPES.includes(item.type) || item.type === 'CONT_3P_AUX' || item.type === 'SW_DPDT';
    const is3P = PIN_3P_TYPES.includes(item.type);
    const is2P = PIN_2P_TYPES.includes(item.type) || item.type === 'PSU_24V' || item.type === 'XFMR_1P' || item.type === 'PB_DUAL';
    const vb = is4P ? '-66 -26 132 52' : (is3P ? '-54 -26 108 52' : (is2P ? '-36 -26 72 52' : '-28 -26 56 52'));
    return `
      <button type="button" class="sim-lib-tile" title="${simEsc(item.title)}" onclick="addSimComponent('${item.type}')">
        <svg viewBox="${vb}">${renderSymbolGeometry({ type: item.type, tag: item.defTag, delay: 5 }, darkPal, true)}</svg>
        <span>${simEsc(item.title)}</span>
      </button>
    `;
  }).join('');
}

function buildOrthogonalPath(p1, p2) {
  if (Math.abs(p1.x - p2.x) < 2 || Math.abs(p1.y - p2.y) < 2) {
    return `M ${p1.x} ${p1.y} L ${p2.x} ${p2.y}`;
  }
  if (Math.abs(p2.y - p1.y) >= Math.abs(p2.x - p1.x)) {
    const midY = snap20((p1.y + p2.y) / 2);
    return `M ${p1.x} ${p1.y} L ${p1.x} ${midY} L ${p2.x} ${midY} L ${p2.x} ${p2.y}`;
  } else {
    const midX = snap20((p1.x + p2.x) / 2);
    return `M ${p1.x} ${p1.y} L ${midX} ${p1.y} L ${midX} ${p2.y} L ${p2.x} ${p2.y}`;
  }
}

function getWireColor(w) {
  if (simState.mode !== 'run') {
    return w.id === simState.selectedWireId ? '#f59e0b' : '#94a3b8';
  }
  const phSet = simState.nodePhases.get(`${w.fromComp}:${w.fromPin}`);
  if (!phSet || phSet.size === 0) return '#64748b';
  if (simState.shortCircuit || phSet.size >= 2) return '#ef4444';
  const ph = [...phSet][0];
  if (ph === 'L1' || ph === 'DC+') return '#ef4444';
  if (ph === 'L2') return '#eab308';
  if (ph === 'L3') return '#38bdf8';
  if (ph === 'PE') return '#22c55e';
  return '#60a5fa';
}

function renderSimCanvas() {
  const svg = document.getElementById('simCanvasSvg');
  if (!svg) return;

  const isEdit = simState.mode === 'edit';
  const pal = getStrokePalette();

 const vw = simState.vbW / simState.cam.zoom;
  const vh = simState.vbH / simState.cam.zoom;

  let crosshairMarkup = '';
  const selComp = isEdit ? simState.components.find(c => c.id === simState.selectedCompId) : null;
  if (selComp) {
    crosshairMarkup = `
      <line x1="${selComp.x}" y1="${simState.cam.y}" x2="${selComp.x}" y2="${simState.cam.y + vh}" stroke="#64748b" stroke-width="0.9" opacity="0.6" pointer-events="none"/>
      <line x1="${simState.cam.x}" y1="${selComp.y}" x2="${simState.cam.x + vw}" y2="${selComp.y}" stroke="#64748b" stroke-width="0.9" opacity="0.6" pointer-events="none"/>
    `;
  }

  const wireMarkup = simState.wires.map(w => {
    const p1 = getPinCoords(w.fromComp, w.fromPin);
    const p2 = getPinCoords(w.toComp, w.toPin);
    if (!p1 || !p2) return '';

    const d = buildOrthogonalPath(p1, p2);
    const color = getWireColor(w);
    const width = (simState.mode === 'run' && simState.nodePhases.has(`${w.fromComp}:${w.fromPin}`)) || w.id === simState.selectedWireId ? 2.8 : 2;

    return `
      <g>
        <path d="${d}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="${d}" fill="none" stroke="transparent" stroke-width="14" data-wire-id="${w.id}" style="cursor:pointer;"/>
      </g>
    `;
  }).join('');

  const compMarkup = simState.components.map(c => {
    const isSel = isEdit && c.id === simState.selectedCompId;
    const compPal = isSel ? { ...pal, base: '#3b82f6' } : pal;
    const pins = getCompPins(c);

   const pinMarkup = isEdit
      ? pins.map((pt, idx) => {
          const isPend = simState.pendingPin && simState.pendingPin.compId === c.id && simState.pendingPin.pinIdx === idx;
          return `
            ${simState._isPrinting ? '' : `<rect x="${pt.x - 4}" y="${pt.y - 4}" width="8" height="8" rx="1.5"
              fill="${isPend ? '#f59e0b' : '#38bdf8'}" stroke="${isPend ? '#fef08a' : '#0284c7'}" stroke-width="1.2"
              data-pin-comp="${c.id}" data-pin-idx="${idx}" style="cursor:crosshair;"/>`}
            ${pt.label ? `<text x="${pt.x + 6}" y="${pt.y + 3}" font-size="8" font-weight="700" fill="${pal.pinText}" pointer-events="none">${simEsc(pt.label)}</text>` : ''}
          `;
        }).join('')
      : '';

    const isSource = ['L1', 'L2', 'L3', 'N', 'PE', 'DC_POS', 'DC_NEG'].includes(c.type);
    const tagX = (PIN_3P_TYPES.includes(c.type) || PIN_4P_TYPES.includes(c.type) || c.type === 'CONT_3P_AUX') ? c.x - 48 : ((PIN_2P_TYPES.includes(c.type) || PIN_3T_LOADS.includes(c.type) || c.type === 'MOTOR_6T') ? c.x - 28 : c.x - 20);
   const dirTag = (c.type === 'MOTOR_3P' || c.type === 'MOTOR_2SPD') && c.dir
      ? ` (${c.dir === 'fwd' ? '↻' : '↺'})`
      : (c.modeLabel ? ` (${c.modeLabel})` : (c.autoTripped ? ' (TRIP!)' : ''));
    const tagFill = c.autoTripped ? '#ef4444' : (isSel ? '#3b82f6' : pal.tag);
    const sideLabel = !isSource
      ? `<text x="${tagX}" y="${c.y + 4}" text-anchor="end" font-size="11" font-weight="800" fill="${tagFill}" pointer-events="none">${simEsc(c.tag + dirTag)}</text>`
      : '';

    const hitW = (PIN_3P_TYPES.includes(c.type) || PIN_4P_TYPES.includes(c.type)) ? 96 : 44;
    return `
      <g>
        <g transform="translate(${c.x}, ${c.y}) rotate(${c.rot || 0})" data-comp-id="${c.id}" style="cursor:${isEdit ? 'grab' : 'pointer'};">
          <rect x="${-hitW / 2}" y="-22" width="${hitW}" height="44" fill="transparent"/>
          ${renderSymbolGeometry(c, compPal, false)}
        </g>
        ${sideLabel}
        ${pinMarkup}
      </g>
    `;
  }).join('');

 svg.setAttribute('viewBox', `${simState.cam.x} ${simState.cam.y} ${vw} ${vh}`);
  svg.innerHTML = `
    <defs>
      <pattern id="simGridPat" width="20" height="20" patternUnits="userSpaceOnUse">
        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="${pal.grid}" stroke-width="0.9"/>
      </pattern>
    </defs>
    <rect x="${simState.cam.x}" y="${simState.cam.y}" width="${vw}" height="${vh}" fill="${pal.bg}"/>
    <rect x="${simState.cam.x}" y="${simState.cam.y}" width="${vw}" height="${vh}" fill="url(#simGridPat)"/>
    ${crosshairMarkup}
    ${wireMarkup}
    ${compMarkup}
  `;

  const zBadge = document.getElementById('simZoomBadge');
  if (zBadge) zBadge.textContent = `${Math.round(simState.cam.zoom * 100)}%`;

  updateSimStatus();
}

function getSvgCoords(evt) {
  const svg = document.getElementById('simCanvasSvg');
  if (!svg) return { x: 0, y: 0 };
  const pt = svg.createSVGPoint();
  pt.x = evt.clientX;
  pt.y = evt.clientY;
  const ctm = svg.getScreenCTM();
  if (!ctm) return { x: 0, y: 0 };
  const transformed = pt.matrixTransform(ctm.inverse());
  return { x: transformed.x, y: transformed.y };
}

function addSimComponent(type) {
  if (simState.mode !== 'edit') setSimMode('edit');
  const meta = SIM_CATALOG.find(item => item.type === type) || { defTag: '-X1' };
  const id = 'c_' + Date.now() + '_' + Math.floor(Math.random() * 1000);

  const cnt = simState.components.filter(c => c.type === type).length + 1;
  let tag = meta.defTag;
  if (['COIL', 'RELAY_COIL', 'LATCH_COIL'].includes(type)) tag = meta.defTag.replace(/\d+$/, '') + cnt;
  else if (['TIMER_COIL', 'TOF_COIL', 'BLINK_COIL', 'SD_TIMER'].includes(type)) tag = meta.defTag.replace(/\d+$/, '') + cnt;
  else if (type.startsWith('LAMP')) tag = '-H' + cnt;
  else if (type.startsWith('MOTOR')) tag = '-M' + cnt;
  else if (type.startsWith('MCB') || type.startsWith('FUSE')) tag = '-F' + cnt;

  simState.components.push({
    id,
    type,
    x: snap20(simState.cam.x + (simState.vbW / simState.cam.zoom) / 2 + ((simState.components.length % 3) - 1) * 40),
    y: snap20(simState.cam.y + (simState.vbH / simState.cam.zoom) / 2 + ((simState.components.length % 3) - 1) * 40),
    rot: 0,
    tag,
    closed: true,
    delay: ['TIMER_COIL', 'TOF_COIL', 'SD_TIMER'].includes(type) ? 5 : (type === 'BLINK_COIL' ? 1 : undefined),
    preset: type === 'COUNTER_COIL' ? 3 : undefined,
    color: type === 'LAMP_RED' ? 'red' : (type === 'LAMP_AMB' ? 'amber' : (type === 'LAMP_BLU' ? 'blu' : 'green'))
  });

  simState.selectedCompId = id;
  simState.selectedWireId = null;
  simState.pendingPin = null;
  pushSimHistory();
  renderSimCanvas();
}

function openSimValuesModal() {
  if (simState.mode !== 'edit') {
    alert('Switch to Edit mode (Stop) to edit values.');
    return;
  }
  const comp = simState.components.find(c => c.id === simState.selectedCompId);
  if (!comp) {
    alert('Select a component first to edit its Tag / Delay / Preset.');
    return;
  }

  const nextTag = prompt('Component Tag (e.g. -KM1, -F1, -S1, -KT1):', comp.tag);
  if (nextTag !== null && nextTag.trim() !== '') {
    comp.tag = nextTag.trim().slice(0, 10);
  }

  if (['TIMER_COIL', 'TOF_COIL', 'BLINK_COIL', 'SD_TIMER'].includes(comp.type)) {
    const val = prompt('Timer Delay (seconds):', comp.delay || 5);
    const num = Number(val);
    if (Number.isFinite(num) && num >= 0.5 && num <= 120) comp.delay = num;
  } else if (comp.type === 'COUNTER_COIL') {
    const val = prompt('Counter Preset Target (e.g. 3):', comp.preset || 3);
  const num = parseInt(val, 10);
    if (Number.isFinite(num) && num >= 1 && num <= 999) comp.preset = num;
  }

  pushSimHistory();
  renderSimCanvas();
}

function rotateSelectedSimComp() {
  if (simState.mode !== 'edit') return;
  const comp = simState.components.find(c => c.id === simState.selectedCompId);
  if (!comp) return;
  comp.rot = ((comp.rot || 0) + 90) % 360;
  pushSimHistory();
  renderSimCanvas();
}

function deleteSelectedSimItem() {
  if (simState.mode !== 'edit') return;
  if (simState.selectedWireId) {
    simState.wires = simState.wires.filter(w => w.id !== simState.selectedWireId);
    simState.selectedWireId = null;
    pushSimHistory();
    renderSimCanvas();
    return;
  }
  if (simState.selectedCompId) {
    const id = simState.selectedCompId;
    simState.components = simState.components.filter(c => c.id !== id);
    simState.wires = simState.wires.filter(w => w.fromComp !== id && w.toComp !== id);
    simState.selectedCompId = null;
    pushSimHistory();
    renderSimCanvas();
  }
}

function loadSimPreset(name) {
  toggleSimMenu(true);
  setSimMode('edit');
  const titleEl = document.getElementById('simProjectTitle');

  if (name === 'dol') {
    if (titleEl) titleEl.textContent = '3-Phase DOL Starter';
    simState.components = [
      { id: 'l1', type: 'L1', x: 60, y: 60, rot: 0, tag: 'L1' },
      { id: 'l2', type: 'L2', x: 60, y: 100, rot: 0, tag: 'L2' },
      { id: 'l3', type: 'L3', x: 60, y: 140, rot: 0, tag: 'L3' },
      { id: 'n1', type: 'N', x: 60, y: 500, rot: 0, tag: 'N' },
      { id: 'f1', type: 'MCB_3P', x: 200, y: 220, rot: 0, tag: '-F1', closed: true },
      { id: 'km1p', type: 'CONT_3P', x: 200, y: 340, rot: 0, tag: '-KM1' },
      { id: 'm1', type: 'MOTOR_3P', x: 200, y: 460, rot: 0, tag: '-M1' },
      { id: 'f2', type: 'MCB_1P', x: 420, y: 160, rot: 0, tag: '-F2', closed: true },
      { id: 's0', type: 'NC_PB', x: 420, y: 240, rot: 0, tag: '-S0' },
      { id: 's1', type: 'NO_PB', x: 420, y: 320, rot: 0, tag: '-S1' },
      { id: 'km1h', type: 'NO_CONT', x: 520, y: 320, rot: 0, tag: '-KM1' },
      { id: 'km1', type: 'COIL', x: 420, y: 420, rot: 0, tag: '-KM1' },
      { id: 'h1', type: 'LAMP', x: 560, y: 420, rot: 0, tag: '-H1' },
      { id: 'km1nc', type: 'NC_CONT', x: 660, y: 320, rot: 0, tag: '-KM1' },
      { id: 'h2', type: 'LAMP_RED', x: 660, y: 420, rot: 0, tag: '-H2' }
    ];
    simState.wires = [
      { id: 'w1', fromComp: 'l1', fromPin: 0, toComp: 'f1', toPin: 0 },
      { id: 'w2', fromComp: 'l2', fromPin: 0, toComp: 'f1', toPin: 2 },
      { id: 'w3', fromComp: 'l3', fromPin: 0, toComp: 'f1', toPin: 4 },
      { id: 'w4', fromComp: 'f1', fromPin: 1, toComp: 'km1p', toPin: 0 },
      { id: 'w5', fromComp: 'f1', fromPin: 3, toComp: 'km1p', toPin: 2 },
      { id: 'w6', fromComp: 'f1', fromPin: 5, toComp: 'km1p', toPin: 4 },
      { id: 'w7', fromComp: 'km1p', fromPin: 1, toComp: 'm1', toPin: 0 },
      { id: 'w8', fromComp: 'km1p', fromPin: 3, toComp: 'm1', toPin: 1 },
      { id: 'w9', fromComp: 'km1p', fromPin: 5, toComp: 'm1', toPin: 2 },
      { id: 'w10', fromComp: 'l1', fromPin: 0, toComp: 'f2', toPin: 0 },
      { id: 'w11', fromComp: 'f2', fromPin: 1, toComp: 's0', toPin: 0 },
      { id: 'w12', fromComp: 'f2', fromPin: 1, toComp: 'km1nc', toPin: 0 },
      { id: 'w13', fromComp: 's0', fromPin: 1, toComp: 's1', toPin: 0 },
      { id: 'w14', fromComp: 's0', fromPin: 1, toComp: 'km1h', toPin: 0 },
      { id: 'w15', fromComp: 's1', fromPin: 1, toComp: 'km1', toPin: 0 },
      { id: 'w16', fromComp: 'km1h', fromPin: 1, toComp: 'km1', toPin: 0 },
      { id: 'w17', fromComp: 'km1', fromPin: 0, toComp: 'h1', toPin: 0 },
      { id: 'w18', fromComp: 'km1nc', fromPin: 1, toComp: 'h2', toPin: 0 },
      { id: 'w19', fromComp: 'km1', fromPin: 1, toComp: 'n1', toPin: 0 },
      { id: 'w20', fromComp: 'h1', fromPin: 1, toComp: 'n1', toPin: 0 },
      { id: 'w21', fromComp: 'h2', fromPin: 1, toComp: 'n1', toPin: 0 }
    ];
  } else if (name === 'rev') {
    if (titleEl) titleEl.textContent = 'Forward / Reverse 3-Ph';
    simState.components = [
      { id: 'l1', type: 'L1', x: 60, y: 60, rot: 0, tag: 'L1' },
      { id: 'l2', type: 'L2', x: 60, y: 100, rot: 0, tag: 'L2' },
      { id: 'l3', type: 'L3', x: 60, y: 140, rot: 0, tag: 'L3' },
      { id: 'n1', type: 'N', x: 60, y: 500, rot: 0, tag: 'N' },
      { id: 'f1', type: 'MCB_3P', x: 200, y: 200, rot: 0, tag: '-F1', closed: true },
      { id: 'km1p', type: 'CONT_3P', x: 140, y: 320, rot: 0, tag: '-KM1' },
      { id: 'km2p', type: 'CONT_3P', x: 280, y: 320, rot: 0, tag: '-KM2' },
      { id: 'm1', type: 'MOTOR_3P', x: 200, y: 460, rot: 0, tag: '-M1' },
      { id: 's0', type: 'NC_PB', x: 520, y: 120, rot: 0, tag: '-S0' },
      { id: 's1', type: 'NO_PB', x: 440, y: 220, rot: 0, tag: '-S1 (F)' },
      { id: 'km1h', type: 'NO_CONT', x: 520, y: 220, rot: 0, tag: '-KM1' },
      { id: 'km2l', type: 'NC_CONT', x: 440, y: 320, rot: 0, tag: '-KM2' },
      { id: 'km1', type: 'COIL', x: 440, y: 420, rot: 0, tag: '-KM1' },
      { id: 's2', type: 'NO_PB', x: 600, y: 220, rot: 0, tag: '-S2 (R)' },
      { id: 'km2h', type: 'NO_CONT', x: 680, y: 220, rot: 0, tag: '-KM2' },
      { id: 'km1l', type: 'NC_CONT', x: 600, y: 320, rot: 0, tag: '-KM1' },
      { id: 'km2', type: 'COIL', x: 600, y: 420, rot: 0, tag: '-KM2' }
    ];
    simState.wires = [
      { id: 'w1', fromComp: 'l1', fromPin: 0, toComp: 'f1', toPin: 0 },
      { id: 'w2', fromComp: 'l2', fromPin: 0, toComp: 'f1', toPin: 2 },
      { id: 'w3', fromComp: 'l3', fromPin: 0, toComp: 'f1', toPin: 4 },
      { id: 'w4', fromComp: 'f1', fromPin: 1, toComp: 'km1p', toPin: 0 },
      { id: 'w5', fromComp: 'f1', fromPin: 3, toComp: 'km1p', toPin: 2 },
      { id: 'w6', fromComp: 'f1', fromPin: 5, toComp: 'km1p', toPin: 4 },
      { id: 'w7', fromComp: 'f1', fromPin: 1, toComp: 'km2p', toPin: 0 },
      { id: 'w8', fromComp: 'f1', fromPin: 3, toComp: 'km2p', toPin: 2 },
      { id: 'w9', fromComp: 'f1', fromPin: 5, toComp: 'km2p', toPin: 4 },
      { id: 'w10', fromComp: 'km1p', fromPin: 1, toComp: 'm1', toPin: 0 },
      { id: 'w11', fromComp: 'km1p', fromPin: 3, toComp: 'm1', toPin: 1 },
      { id: 'w12', fromComp: 'km1p', fromPin: 5, toComp: 'm1', toPin: 2 },
      { id: 'w13', fromComp: 'km2p', fromPin: 1, toComp: 'm1', toPin: 1 },
      { id: 'w14', fromComp: 'km2p', fromPin: 3, toComp: 'm1', toPin: 0 },
      { id: 'w15', fromComp: 'km2p', fromPin: 5, toComp: 'm1', toPin: 2 },
      { id: 'w16', fromComp: 'l1', fromPin: 0, toComp: 's0', toPin: 0 },
      { id: 'w17', fromComp: 's0', fromPin: 1, toComp: 's1', toPin: 0 },
      { id: 'w18', fromComp: 's0', fromPin: 1, toComp: 'km1h', toPin: 0 },
      { id: 'w19', fromComp: 's1', fromPin: 1, toComp: 'km2l', toPin: 0 },
      { id: 'w20', fromComp: 'km1h', fromPin: 1, toComp: 'km2l', toPin: 0 },
      { id: 'w21', fromComp: 'km2l', fromPin: 1, toComp: 'km1', toPin: 0 },
      { id: 'w22', fromComp: 's0', fromPin: 1, toComp: 's2', toPin: 0 },
      { id: 'w23', fromComp: 's0', fromPin: 1, toComp: 'km2h', toPin: 0 },
      { id: 'w24', fromComp: 's2', fromPin: 1, toComp: 'km1l', toPin: 0 },
      { id: 'w25', fromComp: 'km2h', fromPin: 1, toComp: 'km1l', toPin: 0 },
      { id: 'w26', fromComp: 'km1l', fromPin: 1, toComp: 'km2', toPin: 0 },
      { id: 'w27', fromComp: 'km1', fromPin: 1, toComp: 'n1', toPin: 0 },
      { id: 'w28', fromComp: 'km2', fromPin: 1, toComp: 'n1', toPin: 0 }
    ];
  } else if (name === 'stardelta') {
    if (titleEl) titleEl.textContent = '3-Ph Star-Delta (Y/Δ 5s)';
    simState.components = [
      { id: 'l1', type: 'L1', x: 40, y: 60, rot: 0, tag: 'L1' },
      { id: 'l2', type: 'L2', x: 40, y: 100, rot: 0, tag: 'L2' },
      { id: 'l3', type: 'L3', x: 40, y: 140, rot: 0, tag: 'L3' },
      { id: 'n1', type: 'N', x: 40, y: 500, rot: 0, tag: 'N' },

      { id: 'f1', type: 'MCB_3P', x: 160, y: 180, rot: 0, tag: '-F1', closed: true },
      { id: 'km1p', type: 'CONT_3P', x: 160, y: 280, rot: 0, tag: '-KM1' },
      { id: 'm1', type: 'MOTOR_6T', x: 160, y: 380, rot: 0, tag: '-M1' },
      { id: 'km2p', type: 'CONT_3P', x: 300, y: 280, rot: 0, tag: '-KM2' },
      { id: 'km3p', type: 'CONT_3P', x: 300, y: 440, rot: 0, tag: '-KM3' },

      { id: 's0', type: 'NC_PB', x: 460, y: 140, rot: 0, tag: '-S0' },
      { id: 's1', type: 'NO_PB', x: 460, y: 220, rot: 0, tag: '-S1' },
      { id: 'km1h', type: 'NO_CONT', x: 540, y: 220, rot: 0, tag: '-KM1' },
      { id: 'km1', type: 'COIL', x: 460, y: 400, rot: 0, tag: '-KM1' },
      { id: 'kt1', type: 'SD_TIMER', x: 540, y: 400, rot: 0, tag: '-KSD', delay: 5 },

      { id: 'kt1s', type: 'SD_STAR_NO', x: 620, y: 220, rot: 0, tag: '-KSD' },
      { id: 'km3nc', type: 'NC_CONT', x: 620, y: 300, rot: 0, tag: '-KM3' },
      { id: 'km2', type: 'COIL', x: 620, y: 400, rot: 0, tag: '-KM2' },

      { id: 'kt1d', type: 'SD_DELTA_NO', x: 700, y: 220, rot: 0, tag: '-KSD' },
      { id: 'km2nc', type: 'NC_CONT', x: 700, y: 300, rot: 0, tag: '-KM2' },
      { id: 'km3', type: 'COIL', x: 700, y: 400, rot: 0, tag: '-KM3' }
    ];
    simState.wires = [
      // Main 3-phase feed
      { id: 'w1', fromComp: 'l1', fromPin: 0, toComp: 'f1', toPin: 0 },
      { id: 'w2', fromComp: 'l2', fromPin: 0, toComp: 'f1', toPin: 2 },
      { id: 'w3', fromComp: 'l3', fromPin: 0, toComp: 'f1', toPin: 4 },
      { id: 'w4', fromComp: 'f1', fromPin: 1, toComp: 'km1p', toPin: 0 },
      { id: 'w5', fromComp: 'f1', fromPin: 3, toComp: 'km1p', toPin: 2 },
      { id: 'w6', fromComp: 'f1', fromPin: 5, toComp: 'km1p', toPin: 4 },
      { id: 'w7', fromComp: 'km1p', fromPin: 1, toComp: 'm1', toPin: 0 },
      { id: 'w8', fromComp: 'km1p', fromPin: 3, toComp: 'm1', toPin: 1 },
      { id: 'w9', fromComp: 'km1p', fromPin: 5, toComp: 'm1', toPin: 2 },

      // Star Contactor (-KM2): Top pins shorted, bottom pins to W2, U2, V2
      { id: 'w10', fromComp: 'km2p', fromPin: 0, toComp: 'km2p', toPin: 2 },
      { id: 'w11', fromComp: 'km2p', fromPin: 2, toComp: 'km2p', toPin: 4 },
      { id: 'w12', fromComp: 'km2p', fromPin: 1, toComp: 'm1', toPin: 3 },
      { id: 'w13', fromComp: 'km2p', fromPin: 3, toComp: 'm1', toPin: 4 },
      { id: 'w14', fromComp: 'km2p', fromPin: 5, toComp: 'm1', toPin: 5 },

      // Delta Contactor (-KM3): L1->V2, L2->W2, L3->U2
      { id: 'w15', fromComp: 'f1', fromPin: 1, toComp: 'km3p', toPin: 0 },
      { id: 'w16', fromComp: 'f1', fromPin: 3, toComp: 'km3p', toPin: 2 },
      { id: 'w17', fromComp: 'f1', fromPin: 5, toComp: 'km3p', toPin: 4 },
      { id: 'w18', fromComp: 'km3p', fromPin: 1, toComp: 'm1', toPin: 5 },
      { id: 'w19', fromComp: 'km3p', fromPin: 3, toComp: 'm1', toPin: 3 },
      { id: 'w20', fromComp: 'km3p', fromPin: 5, toComp: 'm1', toPin: 4 },

      // Control circuit
      { id: 'w21', fromComp: 'f1', fromPin: 1, toComp: 's0', toPin: 0 },
      { id: 'w22', fromComp: 's0', fromPin: 1, toComp: 's1', toPin: 0 },
      { id: 'w23', fromComp: 's0', fromPin: 1, toComp: 'km1h', toPin: 0 },
      { id: 'w24', fromComp: 's1', fromPin: 1, toComp: 'km1', toPin: 0 },
      { id: 'w25', fromComp: 'km1h', fromPin: 1, toComp: 'km1', toPin: 0 },
      { id: 'w26', fromComp: 'km1', fromPin: 0, toComp: 'kt1', toPin: 0 },
      { id: 'w27', fromComp: 'km1', fromPin: 0, toComp: 'kt1s', toPin: 0 },
      { id: 'w28', fromComp: 'kt1s', fromPin: 1, toComp: 'km3nc', toPin: 0 },
      { id: 'w29', fromComp: 'km3nc', fromPin: 1, toComp: 'km2', toPin: 0 },
      { id: 'w30', fromComp: 'km1', fromPin: 0, toComp: 'kt1d', toPin: 0 },
      { id: 'w31', fromComp: 'kt1d', fromPin: 1, toComp: 'km2nc', toPin: 0 },
      { id: 'w32', fromComp: 'km2nc', fromPin: 1, toComp: 'km3', toPin: 0 },

      { id: 'w33', fromComp: 'km1', fromPin: 1, toComp: 'n1', toPin: 0 },
      { id: 'w34', fromComp: 'kt1', fromPin: 1, toComp: 'n1', toPin: 0 },
      { id: 'w35', fromComp: 'km2', fromPin: 1, toComp: 'n1', toPin: 0 },
      { id: 'w36', fromComp: 'km3', fromPin: 1, toComp: 'n1', toPin: 0 }
    ];
  }
  
  else {
    if (titleEl) titleEl.textContent = 'Untitled';
    simState.components = [
      { id: 'l1', type: 'L1', x: 80, y: 60, rot: 0, tag: 'L1' },
      { id: 'l2', type: 'L2', x: 80, y: 100, rot: 0, tag: 'L2' },
      { id: 'l3', type: 'L3', x: 80, y: 140, rot: 0, tag: 'L3' },
     { id: 'n1', type: 'N', x: 80, y: 480, rot: 0, tag: 'N' }
    ];
    simState.wires = [];
  }

  simState.history = [];
  simState.historyIdx = -1;
  pushSimHistory();
  renderSimCanvas();
}

function saveSimToLocal() {
  toggleSimMenu(true);
  localStorage.setItem(SIM_SAVE_KEY, JSON.stringify({
    components: simState.components,
    wires: simState.wires
  }));
  alert('Project saved locally!');
}

function loadSimFromLocal() {
  toggleSimMenu(true);
  try {
    const raw = localStorage.getItem(SIM_SAVE_KEY);
    if (!raw) { alert('No saved project found.'); return; }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed.components) || !Array.isArray(parsed.wires)) return;
    setSimMode('edit');
    simState.components = parsed.components;
    simState.wires = parsed.wires;
    simState.history = [];
    simState.historyIdx = -1;
    pushSimHistory();
    renderSimCanvas();
  } catch (e) {
    alert('Error opening project: ' + e.message);
  }
}

function zoomSimAt(factor, clientX, clientY) {
  const svg = document.getElementById('simCanvasSvg');
  if (!svg) return;
  const oldZoom = simState.cam.zoom;
  const newZoom = Math.max(0.35, Math.min(3.5, oldZoom * factor));
  if (Math.abs(newZoom - oldZoom) < 0.001) return;

  const rect = svg.getBoundingClientRect();
  const relX = clientX !== undefined && rect.width ? (clientX - rect.left) / rect.width : 0.5;
  const relY = clientY !== undefined && rect.height ? (clientY - rect.top) / rect.height : 0.5;

  const oldVW = simState.vbW / oldZoom;
  const oldVH = simState.vbH / oldZoom;
  const newVW = simState.vbW / newZoom;
  const newVH = simState.vbH / newZoom;

  const worldX = simState.cam.x + relX * oldVW;
  const worldY = simState.cam.y + relY * oldVH;

  simState.cam.zoom = newZoom;
  simState.cam.x = worldX - relX * newVW;
  simState.cam.y = worldY - relY * newVH;
  renderSimCanvas();
}

function resetSimCamera() {
  if (simState.components.length === 0) {
    simState.cam = { x: 0, y: 0, zoom: 1 };
    renderSimCanvas();
    return;
  }
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  simState.components.forEach(c => {
    if (c.x < minX) minX = c.x;
    if (c.y < minY) minY = c.y;
    if (c.x > maxX) maxX = c.x;
    if (c.y > maxY) maxY = c.y;
  });
  const pad = 90;
  minX -= pad; minY -= pad; maxX += pad; maxY += pad;
  const spanW = Math.max(200, maxX - minX);
  const spanH = Math.max(200, maxY - minY);
  const zoom = Math.max(0.4, Math.min(1.25, Math.min(simState.vbW / spanW, simState.vbH / spanH)));
  const vw = simState.vbW / zoom;
  const vh = simState.vbH / zoom;
  simState.cam = {
    zoom,
    x: (minX + maxX) / 2 - vw / 2,
    y: (minY + maxY) / 2 - vh / 2
  };
  renderSimCanvas();
}

function initSimLabEvents() {
  buildLibrarySidebar();
  const svg = document.getElementById('simCanvasSvg');
  if (!svg || svg.dataset.bound === '1') return;
  svg.dataset.bound = '1';

  const activePointers = new Map();
  let pinchState = null;

  svg.addEventListener('wheel', (e) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.12 : 0.89;
    zoomSimAt(factor, e.clientX, e.clientY);
  }, { passive: false });

  svg.addEventListener('pointerdown', (e) => {
    toggleSimMenu(true);
    activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

    // Two-finger pinch-to-zoom start
    if (activePointers.size === 2) {
      simState.dragCompId = null;
      simState.isPanning = false;
      const pts = [...activePointers.values()];
      pinchState = {
        dist: Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y),
        mx: (pts[0].x + pts[1].x) / 2,
        my: (pts[0].y + pts[1].y) / 2
      };
      return;
    }

    const pinEl = e.target.closest('[data-pin-comp]');
    const compEl = e.target.closest('[data-comp-id]');
    const wireEl = e.target.closest('[data-wire-id]');

    if (simState.mode === 'run') {
      if (compEl) {
        const cid = compEl.getAttribute('data-comp-id');
        const comp = simState.components.find(c => c.id === cid);
        if (!comp) return;
        const t = comp.type;

        if (['NO_PB', 'NC_PB', 'PB_CO', 'FOOT_PB_NO', 'FOOT_PB_NC'].includes(t)) {
          comp.pressed = true;
          simState.activeMomentaryId = cid;
        } else if (t === 'PB_DUAL') {
          const pt = getSvgCoords(e);
          if (pt.x < comp.x) comp.pressedStart = true;
          else comp.pressedStop = true;
          simState.activeMomentaryId = cid;
        } else if (t === 'SEL_HOA') {
          comp.hoaState = ((comp.hoaState || 0) + 1) % 3;
        } else if (['ESTOP_NC', 'OLR_NC', 'PHASE_FAIL', 'SW_NC', 'KEY_SW_NC', 'LIM_NC', 'PROX_NC', 'PHOTO_NC', 'FLOAT_NC', 'PRESS_NC', 'TEMP_NC', 'FLOW_NC'].includes(t)) {
          comp.tripped = !comp.tripped;
        } else if (['FUSE_1P', 'FUSE_3P', 'MCB_1P', 'MCB_2P', 'MCB_3P', 'MCB_4P', 'MCCB_3P', 'MPCB_3P', 'RCCB_2P', 'RCCB_4P', 'ISO_1P', 'ISO_3P', 'ISO_4P', 'OLR_3P'].includes(t)) {
          comp.closed = comp.closed === false;
          comp.autoTripped = false;
        if (comp.closed) {
          simState.trippedBreakerTags = simState.trippedBreakerTags.filter(tg => tg !== comp.tag);
        }
        } else {
          comp.state = !comp.state;
        }
        solveSimCircuit();
        renderSimCanvas();
        return;
      }

      // Pan empty space in Run mode
      simState.isPanning = true;
      simState.panStart = { cx: e.clientX, cy: e.clientY, camX: simState.cam.x, camY: simState.cam.y, moved: false };
      return;
    }

    if (pinEl) {
      const compId = pinEl.getAttribute('data-pin-comp');
      const pinIdx = Number(pinEl.getAttribute('data-pin-idx'));
      if (!simState.pendingPin) {
        simState.pendingPin = { compId, pinIdx };
      } else {
        const a = simState.pendingPin;
        if (!(a.compId === compId && a.pinIdx === pinIdx)) {
          const exists = simState.wires.some(w =>
            (w.fromComp === a.compId && w.fromPin === a.pinIdx && w.toComp === compId && w.toPin === pinIdx) ||
            (w.fromComp === compId && w.fromPin === pinIdx && w.toComp === a.compId && w.toPin === a.pinIdx)
          );
        if (!exists) {
            simState.wires.push({
              id: 'w_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
              fromComp: a.compId,
              fromPin: a.pinIdx,
              toComp: compId,
              toPin: pinIdx
            });
            pushSimHistory();
          }
        }
        simState.pendingPin = null;
      }
      renderSimCanvas();
      return;
    }

    if (wireEl) {
      simState.selectedWireId = wireEl.getAttribute('data-wire-id');
      simState.selectedCompId = null;
      simState.pendingPin = null;
      renderSimCanvas();
      return;
    }

    if (compEl) {
      const cid = compEl.getAttribute('data-comp-id');
      const comp = simState.components.find(c => c.id === cid);
      if (!comp) return;
    simState.selectedCompId = cid;
      simState.selectedWireId = null;
      simState.pendingPin = null;
      simState.dragCompId = cid;
      simState.dragMoved = false;
      const pt = getSvgCoords(e);
      simState.dragOffset = { x: comp.x - pt.x, y: comp.y - pt.y };
      renderSimCanvas();
      return;
    }

    // Pan empty space in Edit mode
    simState.isPanning = true;
    simState.panStart = { cx: e.clientX, cy: e.clientY, camX: simState.cam.x, camY: simState.cam.y, moved: false };
  });

  window.addEventListener('pointermove', (e) => {
    if (activePointers.has(e.pointerId)) {
      activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    }

    // Pinch-zoom & 2-finger pan
    if (activePointers.size === 2 && pinchState) {
      const pts = [...activePointers.values()];
      const newDist = Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y);
      const newMx = (pts[0].x + pts[1].x) / 2;
      const newMy = (pts[0].y + pts[1].y) / 2;

      const rect = svg.getBoundingClientRect();
      if (rect.width && rect.height) {
        const vw = simState.vbW / simState.cam.zoom;
        const vh = simState.vbH / simState.cam.zoom;
        simState.cam.x -= ((newMx - pinchState.mx) / rect.width) * vw;
        simState.cam.y -= ((newMy - pinchState.my) / rect.height) * vh;
      }
      if (pinchState.dist > 10) {
        zoomSimAt(newDist / pinchState.dist, newMx, newMy);
      } else {
        renderSimCanvas();
      }
      pinchState = { dist: newDist, mx: newMx, my: newMy };
      return;
    }

    // 1-finger / mouse pan on empty canvas
    if (simState.isPanning && simState.panStart) {
      const dxPx = e.clientX - simState.panStart.cx;
      const dyPx = e.clientY - simState.panStart.cy;
      if (Math.hypot(dxPx, dyPx) > 4) simState.panStart.moved = true;
      const rect = svg.getBoundingClientRect();
      if (rect.width && rect.height) {
        const vw = simState.vbW / simState.cam.zoom;
        const vh = simState.vbH / simState.cam.zoom;
        simState.cam.x = simState.panStart.camX - (dxPx / rect.width) * vw;
        simState.cam.y = simState.panStart.camY - (dyPx / rect.height) * vh;
        renderSimCanvas();
      }
      return;
    }

  // Component drag
    if (!simState.dragCompId || simState.mode !== 'edit') return;
    const comp = simState.components.find(c => c.id === simState.dragCompId);
    if (!comp) return;
    const pt = getSvgCoords(e);
    const nx = Math.max(-1000, Math.min(2500, snap20(pt.x + simState.dragOffset.x)));
    const ny = Math.max(-1000, Math.min(2500, snap20(pt.y + simState.dragOffset.y)));
    if (nx !== comp.x || ny !== comp.y) {
      comp.x = nx;
      comp.y = ny;
      simState.dragMoved = true;
    }
    renderSimCanvas();
  });

  const releasePointer = (e) => {
    if (e && e.pointerId !== undefined) activePointers.delete(e.pointerId);
    if (activePointers.size < 2) pinchState = null;

    if (simState.isPanning) {
      const wasTap = simState.panStart && !simState.panStart.moved;
      simState.isPanning = false;
      simState.panStart = null;
      if (wasTap) {
        simState.selectedCompId = null;
        simState.selectedWireId = null;
        simState.pendingPin = null;
        renderSimCanvas();
      }
    }

    if (simState.dragCompId && simState.dragMoved) {
      pushSimHistory();
    }
    simState.dragMoved = false;
    simState.dragCompId = null;
    if (simState.activeMomentaryId) {
      const comp = simState.components.find(c => c.id === simState.activeMomentaryId);
      simState.activeMomentaryId = null;
      if (comp) {
        comp.pressed = false;
        comp.pressedStart = false;
        comp.pressedStop = false;
        solveSimCircuit();
        renderSimCanvas();
      }
    }
  };

  window.addEventListener('pointerup', releasePointer);
  window.addEventListener('pointercancel', releasePointer);
}

function syncSimViewBox() {
  if (simState._isPrinting) return;
  const wrap = document.querySelector('.sim-cad-canvas-wrap');
  if (!wrap) return;
  const cw = wrap.clientWidth;
  const ch = wrap.clientHeight;
  if (!cw || !ch) return;

  const aspect = cw / ch;
  const baseAspect = 760 / 560;
  let vbW = 760;
  let vbH = 560;

  if (aspect > baseAspect) vbW = Math.ceil(560 * aspect);
  else vbH = Math.ceil(760 / aspect);

  if (simState.vbW !== vbW || simState.vbH !== vbH) {
    simState.vbW = vbW;
    simState.vbH = vbH;
    renderSimCanvas();
  }
}

function bindSimResizeWatcher() {
  if (window._simResizeBound) return;
  window._simResizeBound = true;

  const wrap = document.querySelector('.sim-cad-canvas-wrap');
  if (wrap && typeof ResizeObserver !== 'undefined') {
    const ro = new ResizeObserver(() => {
      const page = document.getElementById('simulationLabPage');
      if (page && page.classList.contains('on')) syncSimViewBox();
    });
    ro.observe(wrap);
  }
  window.addEventListener('resize', () => {
    const page = document.getElementById('simulationLabPage');
    if (page && page.classList.contains('on')) syncSimViewBox();
  });
  window.addEventListener('orientationchange', () => setTimeout(syncSimViewBox, 120));
}

function showSimulationLab() {
  hideAllPages();
  document.getElementById('simulationLabPage').classList.add('on');
  initSimLabEvents();
  bindSimResizeWatcher();
  if (simState.components.length === 0) loadSimPreset('dol');
  requestAnimationFrame(() => {
    syncSimViewBox();
    renderSimCanvas();
  });
  history.pushState({ page: 'simulationLab' }, '', '#simulation-lab');
}

function backFromSimLab() {
  stopSimTimerLoop();
  setSimMode('edit');
  hideAllPages();
  document.getElementById('automationPage').classList.add('on');
  history.pushState({ page: 'automation' }, '', '#automation');
}