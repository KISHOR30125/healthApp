/**
 * ==============================================================================
 * AegisPulse | Next-Gen AI Health & Vital Monitoring OS
 * Complete Core Engine: Telemetry Simulation, Canvases, Charts, AI Copilot, State
 * ==============================================================================
 */

// --- 1. DEFAULT APPLICATION STATE & LOCALSTORAGE PERSISTENCE ---
const DEFAULT_STATE = {
  theme: 'dark',
  simulationActive: true,
  userProfile: {
    name: 'Dr. Elena Vance',
    age: 32,
    gender: 'Female',
    height: 172, // cm
    weight: 63.5, // kg
    bloodType: 'O+',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
    allergies: 'Penicillin, Peanuts (Severe)',
    conditions: 'Mild Exercise-induced Bronchospasm',
    medications: 'Albuterol inhaler (PRN), Daily Multivitamin',
    organDonor: true,
    mrn: '#AEG-8942-019X'
  },
  vitals: {
    heartRate: 72,
    restingHeartRate: 61,
    peakHeartRate: 124,
    bpSys: 118,
    bpDia: 76,
    spo2: 98.6,
    tempF: 98.6,
    tempUnit: 'F', // 'F' or 'C'
    healthScore: 89,
    hrvMs: 64
  },
  trackers: {
    waterCurrent: 2100, // ml
    waterGoal: 3000,
    stepsCurrent: 8420,
    stepsGoal: 10000,
    caloriesCurrent: 520,
    caloriesGoal: 650,
    standHoursCurrent: 10,
    standHoursGoal: 12,
    sleepHours: 7.8, // 7h 50m
    sleepGoal: 8.0
  },
  notifications: [
    {
      id: 'n1',
      type: 'info',
      icon: 'fa-droplet',
      text: 'Hydration reminder: 900ml remaining to hit your daily cellular target.',
      time: '12 min ago',
      unread: true
    },
    {
      id: 'n2',
      type: 'success',
      icon: 'fa-bed',
      text: 'Sleep efficiency reached 88% last night with 1h 45m deep sleep.',
      time: '2 hours ago',
      unread: true
    },
    {
      id: 'n3',
      type: 'warning',
      icon: 'fa-heart-pulse',
      text: 'Mild heart rate elevation (118 BPM) observed during afternoon stairs.',
      time: '4 hours ago',
      unread: true
    }
  ],
  timeline: [
    { id: 't1', title: 'Morning Brisk Walk (3.4 km)', time: '07:15 AM', type: 'workout', completed: true },
    { id: 't2', title: 'Omega-3 + Vitamin D3 Supplement', time: '08:30 AM', type: 'medication', completed: true },
    { id: 't3', title: 'Electrolyte Hydration Intake (500ml)', time: '11:45 AM', type: 'nutrition', completed: true },
    { id: 't4', title: 'Vitals & BP Midday Calibration', time: '02:00 PM', type: 'checkup', completed: false },
    { id: 't5', title: 'Evening Interval Training (HIIT)', time: '06:00 PM', type: 'workout', completed: false }
  ],
  iceContacts: [
    { name: 'Marcus Vance', role: 'Spouse (Primary ICE)', phone: '+1 (555) 234-8901' },
    { name: 'Dr. Sarah Lin', role: 'Primary Cardiologist', phone: '+1 (555) 876-4321' }
  ],
  chatHistory: [
    {
      sender: 'ai',
      text: 'Greetings Dr. Vance. I am your Aegis Biometric Copilot. All 4 telemetry streams are synchronized. How can I assist with your physiological markers or recovery goals today?'
    }
  ]
};

// Application State Instance
let state = { ...DEFAULT_STATE };

// Load persistent state from localStorage
function loadSavedState() {
  try {
    const saved = localStorage.getItem('aegis_health_state');
    if (saved) {
      const parsed = JSON.parse(saved);
      state = { ...DEFAULT_STATE, ...parsed };
    }
  } catch (err) {
    console.warn('Could not load saved state from localStorage:', err);
  }
}

// Save persistent state
function persistState() {
  try {
    localStorage.setItem('aegis_health_state', JSON.stringify(state));
  } catch (err) {
    console.error('Failed to save state:', err);
  }
}

// --- 2. AUDIO FEEDBACK HELPER (WEB AUDIO API) ---
let audioCtx = null;
function playTone(freq, type = 'sine', duration = 0.15) {
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch (e) {
    // Audio context may be restricted before user gesture
  }
}

// --- 3. TOAST NOTIFICATION UTILITY ---
function showToast(message, type = 'info', duration = 3500) {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;

  let icon = 'fa-circle-info';
  if (type === 'success') icon = 'fa-circle-check';
  if (type === 'warning') icon = 'fa-triangle-exclamation';
  if (type === 'danger') icon = 'fa-circle-exclamation';

  toast.innerHTML = `
    <i class="fa-solid ${icon}"></i>
    <span>${message}</span>
  `;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(40px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// --- 4. THEME CONTROLLER ---
function initTheme() {
  const root = document.documentElement;
  const savedTheme = localStorage.getItem('aegis_theme') || state.theme || 'dark';
  state.theme = savedTheme;
  root.setAttribute('data-theme', savedTheme);

  const themeToggleBtn = document.getElementById('themeToggleBtn');
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const current = root.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      state.theme = next;
      localStorage.setItem('aegis_theme', next);
      persistState();
      playTone(next === 'dark' ? 380 : 540);
      rebuildTelemetryChart();
    });
  }
}

// --- 5. NAVIGATION & TAB SWITCHING ---
function initNavigation() {
  const navButtons = document.querySelectorAll('.sidebar-nav .nav-item, .mobile-bottom-nav .mobile-nav-item');
  const tabPanes = document.querySelectorAll('.tab-pane');
  const headline = document.getElementById('pageHeadline');

  const titles = {
    'dashboard': 'Vitals Telemetry',
    'analytics': 'Biometric Analytics & Trends',
    'goals': 'Personalized Wellness Goals',
    'ai-assistant': 'AI Health Copilot',
    'medical-id': 'Universal Medical ID & SOS'
  };

  navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');
      if (!targetTab) return;

      // Update active nav buttons
      navButtons.forEach(b => {
        if (b.getAttribute('data-tab') === targetTab) {
          b.classList.add('active');
        } else {
          b.classList.remove('active');
        }
      });

      // Switch tab panes
      tabPanes.forEach(pane => {
        if (pane.id === `tab-${targetTab}`) {
          pane.classList.add('active');
        } else {
          pane.classList.remove('active');
        }
      });

      // Update page headline
      if (headline && titles[targetTab]) {
        headline.textContent = titles[targetTab];
      }

      playTone(480, 'sine', 0.08);

      // Trigger chart resize if navigating to analytics or dashboard
      if (targetTab === 'analytics') {
        initAnalyticsCharts();
      } else if (targetTab === 'dashboard') {
        if (telemetryChartInstance) telemetryChartInstance.resize();
      }

      // Close mobile sidebar if open
      closeMobileSidebar();
    });
  });

  // Mobile sidebar drawer
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const sidebar = document.getElementById('sidebar');
  const sidebarBackdrop = document.getElementById('sidebarBackdrop');
  const sidebarCloseBtn = document.getElementById('sidebarCloseBtn');

  function openMobileSidebar() {
    sidebar.classList.add('mobile-open');
    sidebarBackdrop.classList.add('active');
  }
  function closeMobileSidebar() {
    sidebar.classList.remove('mobile-open');
    sidebarBackdrop.classList.remove('active');
  }

  if (mobileMenuBtn) mobileMenuBtn.addEventListener('click', openMobileSidebar);
  if (sidebarCloseBtn) sidebarCloseBtn.addEventListener('click', closeMobileSidebar);
  if (sidebarBackdrop) sidebarBackdrop.addEventListener('click', closeMobileSidebar);

  // Manual device sync button
  const manualSyncBtn = document.getElementById('manualSyncBtn');
  if (manualSyncBtn) {
    manualSyncBtn.addEventListener('click', () => {
      manualSyncBtn.style.animation = 'spin 0.6s linear';
      setTimeout(() => {
        manualSyncBtn.style.animation = '';
        triggerBiometricFluctuation();
        showToast('PulseBand Pro X telemetry synchronised (Latency: 14ms)', 'success');
        playTone(660);
      }, 600);
    });
  }

  // Dismiss disclaimer banner
  const dismissDisclaimerBtn = document.getElementById('dismissDisclaimerBtn');
  const disclaimerBanner = document.getElementById('disclaimerBanner');
  if (dismissDisclaimerBtn && disclaimerBanner) {
    dismissDisclaimerBtn.addEventListener('click', () => {
      disclaimerBanner.style.opacity = '0';
      setTimeout(() => disclaimerBanner.style.display = 'none', 300);
    });
  }
}

// --- 6. REAL-TIME CANVASES: ECG & SPO2 WAVEFORM ENGINES ---
let ecgCanvas, ecgCtx;
let spo2Canvas, spo2Ctx;
let ecgX = 0;
let ecgPrevY = 24;
let spo2X = 0;
let spo2PrevY = 24;
let ecgPhase = 0;
let animFrameId = null;

function initWaveformCanvases() {
  ecgCanvas = document.getElementById('ecgCanvas');
  spo2Canvas = document.getElementById('spo2Canvas');

  if (ecgCanvas) {
    ecgCtx = ecgCanvas.getContext('2d');
    ecgCtx.lineWidth = 2;
    ecgCtx.strokeStyle = '#f43f5e';
    ecgCtx.shadowColor = '#f43f5e';
    ecgCtx.shadowBlur = 6;
    clearCanvas(ecgCanvas, ecgCtx);
  }

  if (spo2Canvas) {
    spo2Ctx = spo2Canvas.getContext('2d');
    spo2Ctx.lineWidth = 2;
    spo2Ctx.strokeStyle = '#10b981';
    spo2Ctx.shadowColor = '#10b981';
    spo2Ctx.shadowBlur = 6;
    clearCanvas(spo2Canvas, spo2Ctx);
  }

  startWaveformAnimation();
}

function clearCanvas(cvs, ctx) {
  ctx.fillStyle = 'rgba(10, 14, 23, 0.9)';
  ctx.fillRect(0, 0, cvs.width, cvs.height);
}

// Calculate realistic ECG P-Q-R-S-T wave point
function getEcgY(phase, h) {
  const mid = h / 2;
  const p = phase % 100;

  if (p > 10 && p < 18) {
    // P wave (atrial depolarization)
    return mid - Math.sin((p - 10) / 8 * Math.PI) * 5;
  } else if (p >= 20 && p < 22) {
    // Q dip
    return mid + 4;
  } else if (p >= 22 && p < 28) {
    // R spike (ventricular depolarization)
    return mid - 20;
  } else if (p >= 28 && p < 32) {
    // S dip
    return mid + 7;
  } else if (p > 42 && p < 58) {
    // T wave (ventricular repolarization)
    return mid - Math.sin((p - 42) / 16 * Math.PI) * 8;
  }
  // Baseline slight noise
  return mid + (Math.random() * 1.5 - 0.75);
}

// Calculate realistic arterial photoplethysmogram (PPG) wave point
function getSpo2Y(phase, h) {
  const mid = h / 2;
  const p = (phase * 0.8) % 100;
  if (p < 30) {
    // Systolic upstroke
    return mid - Math.sin((p / 30) * Math.PI * 0.5) * 16;
  } else if (p >= 30 && p < 45) {
    // Dicrotic notch descent
    return (mid - 16) + ((p - 30) / 15) * 9;
  } else if (p >= 45 && p < 55) {
    // Dicrotic peak
    return (mid - 7) - Math.sin(((p - 45) / 10) * Math.PI) * 4;
  } else {
    // Diastolic runoff
    return (mid - 7) + ((p - 55) / 45) * 7;
  }
}

function startWaveformAnimation() {
  function render() {
    if (state.simulationActive && ecgCanvas && ecgCtx) {
      // Step ECG
      const speed = (state.vitals.heartRate / 72) * 2.2;
      ecgPhase += speed;

      const nextEcgY = getEcgY(ecgPhase, ecgCanvas.height);
      const nextEcgX = ecgX + 2;

      // Erase trailing head scan bar
      ecgCtx.fillStyle = 'rgba(10, 14, 23, 0.2)';
      ecgCtx.fillRect(nextEcgX, 0, 16, ecgCanvas.height);

      ecgCtx.beginPath();
      ecgCtx.moveTo(ecgX, ecgPrevY);
      ecgCtx.lineTo(nextEcgX, nextEcgY);
      ecgCtx.stroke();

      ecgX = nextEcgX;
      ecgPrevY = nextEcgY;

      if (ecgX >= ecgCanvas.width) {
        ecgX = 0;
        ecgPrevY = ecgCanvas.height / 2;
      }
    }

    if (state.simulationActive && spo2Canvas && spo2Ctx) {
      const nextSpo2Y = getSpo2Y(ecgPhase, spo2Canvas.height);
      const nextSpo2X = spo2X + 2;

      spo2Ctx.fillStyle = 'rgba(10, 14, 23, 0.2)';
      spo2Ctx.fillRect(nextSpo2X, 0, 16, spo2Canvas.height);

      spo2Ctx.beginPath();
      spo2Ctx.moveTo(spo2X, spo2PrevY);
      spo2Ctx.lineTo(nextSpo2X, nextSpo2Y);
      spo2Ctx.stroke();

      spo2X = nextSpo2X;
      spo2PrevY = nextSpo2Y;

      if (spo2X >= spo2Canvas.width) {
        spo2X = 0;
        spo2PrevY = spo2Canvas.height / 2;
      }
    }

    animFrameId = requestAnimationFrame(render);
  }
  render();
}

// --- 7. BIOMETRIC TELEMETRY SIMULATION LOOP ---
let simulationInterval = null;

function initSimulationController() {
  const toggle = document.getElementById('liveSimulationToggle');
  if (toggle) {
    toggle.checked = state.simulationActive;
    toggle.addEventListener('change', (e) => {
      state.simulationActive = e.target.checked;
      showToast(
        state.simulationActive ? 'Live bio-sensor telemetry stream resumed.' : 'Live sensor streaming paused.',
        state.simulationActive ? 'info' : 'warning'
      );
    });
  }

  // Periodic physiological micro-fluctuations (every 3.5 seconds)
  simulationInterval = setInterval(() => {
    if (!state.simulationActive) return;
    triggerBiometricFluctuation();
  }, 3500);
}

function triggerBiometricFluctuation() {
  // Realistic normal sinus rhythm fluctuation (e.g. 68-76 BPM)
  const hrDelta = Math.floor(Math.random() * 5) - 2;
  let newHR = state.vitals.heartRate + hrDelta;
  if (newHR < 64) newHR = 65;
  if (newHR > 84) newHR = 83;
  state.vitals.heartRate = newHR;

  // SpO2 subtle natural variation
  const spo2Variance = (Math.random() * 0.4 - 0.2);
  let newSpo2 = +(state.vitals.spo2 + spo2Variance).toFixed(1);
  if (newSpo2 > 99.8) newSpo2 = 99.8;
  if (newSpo2 < 97.4) newSpo2 = 97.4;
  state.vitals.spo2 = newSpo2;

  // Temperature subtle variation
  const tempVariance = (Math.random() * 0.1 - 0.05);
  state.vitals.tempF = +(state.vitals.tempF + tempVariance).toFixed(1);

  // Steps random increment during live day simulation
  if (Math.random() > 0.4) {
    state.trackers.stepsCurrent += Math.floor(Math.random() * 12) + 2;
  }

  updateDashboardUI();
}

// --- 8. UI UPDATERS (GAUGES, LABELS, METRICS) ---
function updateDashboardUI() {
  // 1. Heart Rate
  const hrElem = document.getElementById('heartRateVal');
  if (hrElem) hrElem.textContent = state.vitals.heartRate;

  // 2. Blood Pressure
  const bpSysElem = document.getElementById('bpSysVal');
  const bpDiaElem = document.getElementById('bpDiaVal');
  const bpPulseElem = document.getElementById('bpPulsePressure');
  const bpMapElem = document.getElementById('bpMAP');
  const bpMarker = document.getElementById('bpMarker');

  if (bpSysElem) bpSysElem.textContent = state.vitals.bpSys;
  if (bpDiaElem) bpDiaElem.textContent = state.vitals.bpDia;
  if (bpPulseElem) bpPulseElem.textContent = state.vitals.bpSys - state.vitals.bpDia;
  if (bpMapElem) bpMapElem.textContent = Math.round(state.vitals.bpDia + ((state.vitals.bpSys - state.vitals.bpDia) / 3));

  // Position needle on BP gauge bar
  if (bpMarker) {
    const pct = Math.min(Math.max(((state.vitals.bpSys - 90) / 70) * 100, 5), 95);
    bpMarker.style.left = `${pct}%`;
  }

  // 3. SpO2
  const spo2Elem = document.getElementById('spo2Val');
  if (spo2Elem) spo2Elem.textContent = state.vitals.spo2.toFixed(1);

  // 4. Body Temperature
  const tempElem = document.getElementById('tempVal');
  const tempUnitDisplay = document.getElementById('tempUnitDisplay');
  const tempFillBar = document.getElementById('tempFillBar');

  if (tempElem && tempUnitDisplay) {
    if (state.vitals.tempUnit === 'C') {
      const cVal = ((state.vitals.tempF - 32) * 5 / 9).toFixed(1);
      tempElem.textContent = cVal;
      tempUnitDisplay.textContent = '°C';
    } else {
      tempElem.textContent = state.vitals.tempF.toFixed(1);
      tempUnitDisplay.textContent = '°F';
    }
  }
  if (tempFillBar) {
    // 97°F to 101°F mapped to 0-100%
    const pct = Math.min(Math.max(((state.vitals.tempF - 97) / 4) * 100, 10), 100);
    tempFillBar.style.width = `${pct}%`;
  }

  // 5. Overall Health Score Radial Gauge
  const scoreVal = document.getElementById('healthScoreVal');
  const scoreGauge = document.getElementById('scoreGaugeProgress');
  if (scoreVal) scoreVal.textContent = state.vitals.healthScore;
  if (scoreGauge) {
    const circumference = 2 * Math.PI * 68; // ~427.25
    const offset = circumference - (state.vitals.healthScore / 100) * circumference;
    scoreGauge.style.strokeDashoffset = offset;
  }

  // 6. Hydration
  const waterCurrentElem = document.getElementById('waterCurrentVal');
  const waterRemainingElem = document.getElementById('hydrationRemaining');
  const waterWave = document.getElementById('waterWaveLevel');
  const waterPercentBadge = document.getElementById('waterPercentBadge');

  const waterPct = Math.min(Math.round((state.trackers.waterCurrent / state.trackers.waterGoal) * 100), 100);
  if (waterCurrentElem) waterCurrentElem.textContent = state.trackers.waterCurrent.toLocaleString();
  if (waterPercentBadge) waterPercentBadge.textContent = `${waterPct}%`;
  if (waterWave) waterWave.style.height = `${Math.max(waterPct, 12)}%`;
  if (waterRemainingElem) {
    const rem = Math.max(state.trackers.waterGoal - state.trackers.waterCurrent, 0);
    waterRemainingElem.textContent = rem > 0 ? `${rem.toLocaleString()} ml remaining to goal` : 'Goal Accomplished! Fully Hydrated';
  }

  // 7. Kinematics & Steps
  const stepsCount = document.getElementById('stepsCount');
  const stepsBar = document.getElementById('stepsBar');
  const stepsGoalText = document.getElementById('stepsGoalText');
  if (stepsCount) stepsCount.textContent = state.trackers.stepsCurrent.toLocaleString();
  if (stepsGoalText) stepsGoalText.textContent = `/ ${state.trackers.stepsGoal.toLocaleString()} steps`;
  if (stepsBar) {
    const stepsPct = Math.min((state.trackers.stepsCurrent / state.trackers.stepsGoal) * 100, 100);
    stepsBar.style.width = `${stepsPct}%`;
  }

  const caloriesCount = document.getElementById('caloriesCount');
  const caloriesBar = document.getElementById('caloriesBar');
  const caloriesGoalText = document.getElementById('caloriesGoalText');
  if (caloriesCount) caloriesCount.textContent = state.trackers.caloriesCurrent;
  if (caloriesGoalText) caloriesGoalText.textContent = `/ ${state.trackers.caloriesGoal} kcal`;
  if (caloriesBar) {
    const calPct = Math.min((state.trackers.caloriesCurrent / state.trackers.caloriesGoal) * 100, 100);
    caloriesBar.style.width = `${calPct}%`;
  }

  // 8. User Profile Info
  renderProfileData();
  renderTimelineEvents();
  renderNotifications();
}

function renderProfileData() {
  const p = state.userProfile;
  // Topbar and sidebar
  const sidebarAvatar = document.getElementById('sidebarAvatar');
  const topbarAvatar = document.getElementById('topbarAvatar');
  const sidebarUserName = document.getElementById('sidebarUserName');
  const medPhoto = document.getElementById('medPhoto');
  const medFullName = document.getElementById('medFullName');
  const medBloodType = document.getElementById('medBloodType');
  const medAllergies = document.getElementById('medAllergies');
  const medConditions = document.getElementById('medConditions');
  const medMedications = document.getElementById('medMedications');
  const medHeightWeight = document.getElementById('medHeightWeight');

  if (sidebarAvatar && p.avatar) sidebarAvatar.src = p.avatar;
  if (topbarAvatar && p.avatar) topbarAvatar.src = p.avatar;
  if (medPhoto && p.avatar) medPhoto.src = p.avatar;
  if (sidebarUserName) sidebarUserName.textContent = p.name;
  if (medFullName) medFullName.textContent = p.name;
  if (medBloodType) medBloodType.textContent = `${p.bloodType} (${p.bloodType.includes('+') ? 'POSITIVE' : 'NEGATIVE'})`;
  if (medAllergies) medAllergies.textContent = p.allergies;
  if (medConditions) medConditions.textContent = p.conditions;
  if (medMedications) medMedications.textContent = p.medications;
  if (medHeightWeight) {
    const lbs = Math.round(p.weight * 2.20462);
    const feet = Math.floor(p.height / 30.48);
    const inches = Math.round((p.height % 30.48) / 2.54);
    medHeightWeight.textContent = `${p.height} cm (${feet}'${inches}") • ${p.weight} kg (${lbs} lbs)`;
  }
}

// --- 9. HYDRATION TRACKER CONTROLS & CONFETTI ---
function initHydrationControls() {
  const waterButtons = document.querySelectorAll('.add-water-btn');
  const resetBtn = document.getElementById('resetWaterBtn');
  const chipHydrate = document.getElementById('chipHydrate');

  waterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const amount = parseInt(btn.getAttribute('data-amount'), 10) || 250;
      addWater(amount);
    });
  });

  if (chipHydrate) {
    chipHydrate.addEventListener('click', () => {
      addWater(250);
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      state.trackers.waterCurrent = 0;
      updateDashboardUI();
      persistState();
      showToast('Hydration tracker reset for the current session.', 'info');
      playTone(320);
    });
  }
}

function addWater(amount) {
  const prev = state.trackers.waterCurrent;
  state.trackers.waterCurrent += amount;
  playTone(520, 'triangle', 0.12);

  // Check goal achievement
  if (prev < state.trackers.waterGoal && state.trackers.waterCurrent >= state.trackers.waterGoal) {
    triggerGoalCelebration('Daily Hydration Target Achieved!');
  }

  showToast(`Logged +${amount} ml water. Keep up the cellular hydration!`, 'info');
  updateDashboardUI();
  persistState();
}

function triggerGoalCelebration(title) {
  showToast(title, 'success', 5000);
  playTone(880, 'sine', 0.25);

  if (typeof confetti === 'function') {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#00f2fe', '#4facfe', '#10b981', '#ffffff']
    });
  }
}

// Temperature Unit Toggle
function initTempUnitToggle() {
  const btn = document.getElementById('tempUnitToggleBtn');
  if (btn) {
    btn.addEventListener('click', () => {
      state.vitals.tempUnit = state.vitals.tempUnit === 'F' ? 'C' : 'F';
      btn.textContent = `°${state.vitals.tempUnit}`;
      updateDashboardUI();
      playTone(440);
    });
  }
}

// --- 10. NOTIFICATION SYSTEM ---
function initNotificationSystem() {
  const trigger = document.getElementById('notificationTrigger');
  const dropdown = document.getElementById('notificationDropdown');
  const markAllBtn = document.getElementById('markAllReadBtn');
  const clearBtn = document.getElementById('clearNotifsBtn');

  if (trigger && dropdown) {
    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdown.classList.toggle('active');
      playTone(400);
    });

    document.addEventListener('click', (e) => {
      if (!dropdown.contains(e.target) && !trigger.contains(e.target)) {
        dropdown.classList.remove('active');
      }
    });
  }

  if (markAllBtn) {
    markAllBtn.addEventListener('click', () => {
      state.notifications.forEach(n => n.unread = false);
      renderNotifications();
      persistState();
      playTone(520);
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      state.notifications = [];
      renderNotifications();
      persistState();
      playTone(320);
    });
  }
}

function renderNotifications() {
  const list = document.getElementById('notifListContainer');
  const badge = document.getElementById('notifBadge');
  const unreadCountElem = document.getElementById('unreadNotifCount');
  if (!list) return;

  const unreadCount = state.notifications.filter(n => n.unread).length;
  if (badge) {
    badge.textContent = unreadCount;
    badge.style.display = unreadCount > 0 ? 'flex' : 'none';
  }
  if (unreadCountElem) {
    unreadCountElem.textContent = `${unreadCount} unread notification${unreadCount === 1 ? '' : 's'}`;
  }

  if (state.notifications.length === 0) {
    list.innerHTML = `
      <div style="padding: 28px; text-align: center; color: var(--text-muted); font-size: 13px;">
        <i class="fa-regular fa-bell-slash" style="font-size: 24px; margin-bottom: 8px; display: block;"></i>
        No active health alerts or notifications.
      </div>
    `;
    return;
  }

  list.innerHTML = state.notifications.map(n => `
    <div class="notif-item ${n.unread ? 'unread' : ''}" data-id="${n.id}">
      <div class="notif-icon-box ${n.type}">
        <i class="fa-solid ${n.icon}"></i>
      </div>
      <div class="notif-body">
        <p class="notif-text">${n.text}</p>
        <span class="notif-time">${n.time}</span>
      </div>
    </div>
  `).join('');
}

// --- 11. TIMELINE & MEDICATION LOGGING ---
function initTimelineSystem() {
  const addBtn = document.getElementById('addTimelineItemBtn');
  const modal = document.getElementById('timelineModal');
  const closeBtn = document.getElementById('timelineModalClose');
  const cancelBtn = document.getElementById('cancelTimelineBtn');
  const form = document.getElementById('timelineForm');

  if (addBtn && modal) {
    addBtn.addEventListener('click', () => {
      modal.classList.add('active');
      playTone(460);
    });
  }

  function closeModal() {
    if (modal) modal.classList.remove('active');
  }

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = document.getElementById('eventTitleInput').value.trim();
      const timeRaw = document.getElementById('eventTimeInput').value;
      const type = document.getElementById('eventTypeInput').value;

      if (!title || !timeRaw) return;

      // Format time from 24h to 12h AM/PM
      const [h, m] = timeRaw.split(':');
      const hour = parseInt(h, 10);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const formattedHour = hour % 12 || 12;
      const timeStr = `${String(formattedHour).padStart(2, '0')}:${m} ${ampm}`;

      const newEvent = {
        id: 't_' + Date.now(),
        title,
        time: timeStr,
        type,
        completed: false
      };

      state.timeline.push(newEvent);
      renderTimelineEvents();
      persistState();
      closeModal();
      form.reset();
      showToast('Event added to your chronological schedule.', 'success');
      playTone(600);
    });
  }
}

function renderTimelineEvents() {
  const container = document.getElementById('timelineEventsContainer');
  if (!container) return;

  const iconMap = {
    workout: 'fa-person-running',
    medication: 'fa-pills',
    nutrition: 'fa-apple-whole',
    checkup: 'fa-stethoscope'
  };

  container.innerHTML = state.timeline.map(item => `
    <div class="timeline-item" data-id="${item.id}">
      <div class="timeline-marker ${item.type}">
        <i class="fa-solid ${iconMap[item.type] || 'fa-circle-dot'}"></i>
      </div>
      <div class="timeline-content-box">
        <div>
          <h5 class="timeline-main-title" style="${item.completed ? 'text-decoration: line-through; opacity: 0.6;' : ''}">
            ${item.title}
          </h5>
          <span class="timeline-time">${item.time}</span>
        </div>
        <div class="timeline-actions">
          <button class="btn-check-timeline ${item.completed ? 'completed' : ''}" onclick="toggleTimelineItem('${item.id}')">
            <i class="fa-solid ${item.completed ? 'fa-check-double' : 'fa-check'}"></i>
            ${item.completed ? 'Completed' : 'Mark Done'}
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

window.toggleTimelineItem = function(id) {
  const item = state.timeline.find(t => t.id === id);
  if (item) {
    item.completed = !item.completed;
    renderTimelineEvents();
    persistState();
    playTone(item.completed ? 640 : 420);
    if (item.completed) {
      showToast(`Milestone completed: ${item.title}`, 'success');
    }
  }
};

// --- 12. DYNAMIC ADVISORY FEED RENDERER ---
function renderAdvisoryFeed() {
  const feed = document.getElementById('advisoryFeedList');
  if (!feed) return;

  const advisories = [
    {
      icon: 'fa-heart-circle-check',
      color: 'emerald',
      title: 'Optimal Vagal Tone & Cardio Recovery',
      desc: 'Resting pulse recovery rate measured at 24 BPM within 60s of exertion. Cardiovascular endurance index remains in the 90th percentile.'
    },
    {
      icon: 'fa-droplet',
      color: 'cyan',
      title: 'Electrolyte Micro-Deficit Warning',
      desc: 'Based on high ambient humidity and active step rate, consider supplementing 300mg magnesium and electrolytes with afternoon water.'
    },
    {
      icon: 'fa-bed',
      color: 'amber',
      title: 'Circadian Light Alignment',
      desc: 'Reduce blue wavelength exposure starting at 09:30 PM to accelerate natural melatonin onset and preserve stage 3 slow-wave sleep.'
    }
  ];

  feed.innerHTML = advisories.map(adv => `
    <div class="advisory-item">
      <div class="advisory-item-icon ${adv.color}">
        <i class="fa-solid ${adv.icon}"></i>
      </div>
      <div class="advisory-body">
        <h5 class="advisory-title">${adv.title}</h5>
        <p class="advisory-desc">${adv.desc}</p>
      </div>
    </div>
  `).join('');
}

// --- 13. INTERACTIVE CHART.JS INTEGRATION ---
let telemetryChartInstance = null;
let currentChartMetric = 'hr';
let currentChartTimeframe = '24h';

// Mock high-resolution time series datasets
const TIME_SERIES_DATA = {
  hr: {
    '24h': {
      labels: ['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00'],
      values: [58, 56, 62, 85, 74, 98, 88, 72],
      unit: 'BPM',
      color: '#f43f5e',
      min: 56, avg: 74.3, max: 98, hrv: 68
    },
    '7d': {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      values: [68, 71, 65, 72, 70, 75, 69],
      unit: 'BPM',
      color: '#f43f5e',
      min: 65, avg: 70.0, max: 75, hrv: 64
    },
    '30d': {
      labels: ['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4'],
      values: [71, 69, 68, 70],
      unit: 'BPM',
      color: '#f43f5e',
      min: 68, avg: 69.5, max: 71, hrv: 66
    }
  },
  bp: {
    '24h': {
      labels: ['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00'],
      valuesSys: [112, 108, 115, 122, 118, 124, 120, 118],
      valuesDia: [72, 70, 74, 80, 76, 81, 78, 76],
      unit: 'mmHg',
      color: '#00f2fe',
      min: '108/70', avg: '117/75', max: '124/81', hrv: 62
    },
    '7d': {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      valuesSys: [116, 118, 115, 120, 118, 117, 118],
      valuesDia: [74, 76, 75, 78, 76, 75, 76],
      unit: 'mmHg',
      color: '#00f2fe',
      min: '115/74', avg: '117/75', max: '120/78', hrv: 65
    },
    '30d': {
      labels: ['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4'],
      valuesSys: [118, 117, 116, 118],
      valuesDia: [76, 75, 74, 76],
      unit: 'mmHg',
      color: '#00f2fe',
      min: '116/74', avg: '117/75', max: '118/76', hrv: 64
    }
  },
  spo2: {
    '24h': {
      labels: ['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00'],
      values: [98.8, 98.4, 98.6, 99.0, 98.6, 98.2, 98.9, 98.6],
      unit: '%',
      color: '#10b981',
      min: '98.2%', avg: '98.6%', max: '99.0%', hrv: 70
    },
    '7d': {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      values: [98.4, 98.6, 98.7, 98.5, 98.8, 98.6, 98.9],
      unit: '%',
      color: '#10b981',
      min: '98.4%', avg: '98.6%', max: '98.9%', hrv: 69
    },
    '30d': {
      labels: ['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4'],
      values: [98.5, 98.6, 98.7, 98.8],
      unit: '%',
      color: '#10b981',
      min: '98.5%', avg: '98.6%', max: '98.8%', hrv: 71
    }
  },
  activity: {
    '24h': {
      labels: ['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00'],
      values: [0, 0, 420, 2800, 4100, 6200, 7800, 8420],
      unit: 'steps',
      color: '#00f2fe',
      min: 0, avg: 3717, max: 8420, hrv: 60
    },
    '7d': {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      values: [9850, 10240, 8910, 11400, 8420, 12800, 7600],
      unit: 'steps',
      color: '#00f2fe',
      min: 7600, avg: 9888, max: 12800, hrv: 66
    },
    '30d': {
      labels: ['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4'],
      values: [68400, 71200, 69800, 72500],
      unit: 'steps',
      color: '#00f2fe',
      min: 68400, avg: 70475, max: 72500, hrv: 65
    }
  },
  sleep: {
    '24h': {
      labels: ['23:00', '01:00', '03:00', '05:00', '07:00'],
      values: [0.8, 2.1, 4.3, 6.2, 7.8],
      unit: 'hours',
      color: '#a855f7',
      min: 'Deep 1.8h', avg: '7.8h Total', max: '88% Eff', hrv: 74
    },
    '7d': {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      values: [7.2, 6.8, 7.5, 8.1, 7.8, 8.4, 7.9],
      unit: 'hours',
      color: '#a855f7',
      min: '6.8h', avg: '7.6h', max: '8.4h', hrv: 72
    },
    '30d': {
      labels: ['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4'],
      values: [7.4, 7.5, 7.6, 7.8],
      unit: 'hours',
      color: '#a855f7',
      min: '7.4h', avg: '7.6h', max: '7.8h', hrv: 73
    }
  }
};

function initTelemetryChart() {
  const ctx = document.getElementById('telemetryChart');
  if (!ctx) return;

  const metricButtons = document.querySelectorAll('#chartMetricSelector .pill-btn');
  const timeframeButtons = document.querySelectorAll('#chartTimeframeSelector .pill-btn');

  metricButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      metricButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentChartMetric = btn.getAttribute('data-metric');
      playTone(460);
      rebuildTelemetryChart();
    });
  });

  timeframeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      timeframeButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentChartTimeframe = btn.getAttribute('data-timeframe');
      playTone(500);
      rebuildTelemetryChart();
    });
  });

  rebuildTelemetryChart();
}

function rebuildTelemetryChart() {
  const canvas = document.getElementById('telemetryChart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  if (telemetryChartInstance) {
    telemetryChartInstance.destroy();
  }

  const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)';
  const textColor = isDark ? '#94a3b8' : '#64748b';

  const datasetConfig = TIME_SERIES_DATA[currentChartMetric][currentChartTimeframe];

  // Update statistical footer pills
  document.getElementById('statMinVal').textContent = datasetConfig.min;
  document.getElementById('statAvgVal').textContent = datasetConfig.avg;
  document.getElementById('statMaxVal').textContent = datasetConfig.max;
  document.getElementById('statHrvVal').textContent = `${datasetConfig.hrv} ms`;

  // Create gradient
  const gradient = ctx.createLinearGradient(0, 0, 0, 300);
  gradient.addColorStop(0, hexToRgba(datasetConfig.color, 0.35));
  gradient.addColorStop(1, hexToRgba(datasetConfig.color, 0.0));

  let datasets = [];

  if (currentChartMetric === 'bp') {
    // Dual systolic / diastolic lines
    const gradDia = ctx.createLinearGradient(0, 0, 0, 300);
    gradDia.addColorStop(0, 'rgba(59, 130, 246, 0.35)');
    gradDia.addColorStop(1, 'rgba(59, 130, 246, 0.0)');

    datasets = [
      {
        label: 'Systolic (mmHg)',
        data: datasetConfig.valuesSys,
        borderColor: '#00f2fe',
        backgroundColor: gradient,
        borderWidth: 2.5,
        fill: true,
        tension: 0.35,
        pointBackgroundColor: '#00f2fe',
        pointRadius: 4,
        pointHoverRadius: 6
      },
      {
        label: 'Diastolic (mmHg)',
        data: datasetConfig.valuesDia,
        borderColor: '#3b82f6',
        backgroundColor: gradDia,
        borderWidth: 2.5,
        fill: true,
        tension: 0.35,
        pointBackgroundColor: '#3b82f6',
        pointRadius: 4,
        pointHoverRadius: 6
      }
    ];
  } else {
    datasets = [
      {
        label: `${currentChartMetric.toUpperCase()} (${datasetConfig.unit})`,
        data: datasetConfig.values,
        borderColor: datasetConfig.color,
        backgroundColor: gradient,
        borderWidth: 2.5,
        fill: true,
        tension: 0.35,
        pointBackgroundColor: datasetConfig.color,
        pointRadius: 4,
        pointHoverRadius: 6
      }
    ];
  }

  telemetryChartInstance = new Chart(ctx, {
    type: currentChartMetric === 'activity' ? 'bar' : 'line',
    data: {
      labels: datasetConfig.labels,
      datasets: datasets
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: currentChartMetric === 'bp',
          labels: { color: textColor, font: { family: 'Plus Jakarta Sans', size: 12 } }
        },
        tooltip: {
          backgroundColor: isDark ? 'rgba(17, 24, 39, 0.95)' : 'rgba(255, 255, 255, 0.95)',
          titleColor: isDark ? '#fff' : '#0f172a',
          bodyColor: isDark ? '#94a3b8' : '#334155',
          borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
          borderWidth: 1,
          padding: 12,
          boxPadding: 6,
          usePointStyle: true,
          titleFont: { family: 'Plus Jakarta Sans', weight: 'bold' },
          bodyFont: { family: 'JetBrains Mono' }
        }
      },
      scales: {
        x: {
          grid: { color: gridColor },
          ticks: { color: textColor, font: { family: 'Plus Jakarta Sans', size: 11 } }
        },
        y: {
          grid: { color: gridColor },
          ticks: { color: textColor, font: { family: 'JetBrains Mono', size: 11 } }
        }
      }
    }
  });
}

function hexToRgba(hex, alpha) {
  let c;
  if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
    c = hex.substring(1).split('');
    if (c.length === 3) {
      c = [c[0], c[0], c[1], c[1], c[2], c[2]];
    }
    c = '0x' + c.join('');
    return `rgba(${[(c >> 16) & 255, (c >> 8) & 255, c & 255].join(',')},${alpha})`;
  }
  return `rgba(0, 242, 254, ${alpha})`;
}

// --- 14. TAB 2: ANALYTICS CHARTS (CORRELATION, HRV STRESS, SLEEP RADAR) ---
let weeklyCorrelationInstance = null;
let hrvStressInstance = null;
let sleepRadarInstance = null;

function initAnalyticsCharts() {
  const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)';
  const textColor = isDark ? '#94a3b8' : '#64748b';

  // 1. Weekly Correlation
  const c1 = document.getElementById('weeklyCorrelationChart');
  if (c1) {
    if (weeklyCorrelationInstance) weeklyCorrelationInstance.destroy();
    weeklyCorrelationInstance = new Chart(c1.getContext('2d'), {
      type: 'line',
      data: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [
          {
            label: 'Resting Heart Rate (BPM)',
            data: [62, 60, 61, 59, 63, 61, 60],
            borderColor: '#f43f5e',
            backgroundColor: 'transparent',
            tension: 0.3,
            borderWidth: 2.5
          },
          {
            label: 'Average SpO2 (%)',
            data: [98.5, 98.7, 98.4, 98.9, 98.2, 98.8, 98.6],
            borderColor: '#10b981',
            backgroundColor: 'transparent',
            tension: 0.3,
            borderWidth: 2.5,
            yAxisID: 'y1'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { labels: { color: textColor, font: { size: 11 } } } },
        scales: {
          x: { grid: { color: gridColor }, ticks: { color: textColor } },
          y: { grid: { color: gridColor }, ticks: { color: textColor } },
          y1: { position: 'right', grid: { drawOnChartArea: false }, ticks: { color: textColor } }
        }
      }
    });
  }

  // 2. Autonomic Stress & HRV
  const c2 = document.getElementById('hrvStressChart');
  if (c2) {
    if (hrvStressInstance) hrvStressInstance.destroy();
    const ctx2 = c2.getContext('2d');
    const grad = ctx2.createLinearGradient(0, 0, 0, 240);
    grad.addColorStop(0, 'rgba(16, 185, 129, 0.35)');
    grad.addColorStop(1, 'rgba(16, 185, 129, 0.0)');

    hrvStressInstance = new Chart(ctx2, {
      type: 'line',
      data: {
        labels: ['02:00', '06:00', '10:00', '14:00', '18:00', '22:00'],
        datasets: [
          {
            label: 'HRV rMSSD (ms)',
            data: [78, 82, 61, 54, 66, 75],
            borderColor: '#10b981',
            backgroundColor: grad,
            fill: true,
            tension: 0.4,
            borderWidth: 2.5
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { color: gridColor }, ticks: { color: textColor } },
          y: { grid: { color: gridColor }, ticks: { color: textColor } }
        }
      }
    });
  }

  // 3. Sleep Stage Radar
  const c3 = document.getElementById('sleepRadarChart');
  if (c3) {
    if (sleepRadarInstance) sleepRadarInstance.destroy();
    sleepRadarInstance = new Chart(c3.getContext('2d'), {
      type: 'radar',
      data: {
        labels: ['Deep Sleep', 'REM State', 'Light Stage', 'Awake Int.', 'Latency', 'Consistency'],
        datasets: [
          {
            label: 'Actual (Last Night)',
            data: [88, 92, 85, 95, 80, 90],
            borderColor: '#a855f7',
            backgroundColor: 'rgba(168, 85, 247, 0.25)',
            borderWidth: 2
          },
          {
            label: 'AHA Target Benchmark',
            data: [85, 85, 85, 90, 85, 85],
            borderColor: '#38bdf8',
            backgroundColor: 'rgba(56, 189, 248, 0.1)',
            borderWidth: 1.5,
            borderDash: [4, 4]
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { labels: { color: textColor, font: { size: 11 } } } },
        scales: {
          r: {
            angleLines: { color: gridColor },
            grid: { color: gridColor },
            pointLabels: { color: textColor, font: { size: 10 } },
            ticks: { display: false }
          }
        }
      }
    });
  }

  // Deep Scan simulation button
  const runScanBtn = document.getElementById('runAnalyticsSimBtn');
  if (runScanBtn) {
    runScanBtn.addEventListener('click', () => {
      runScanBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Analyzing...';
      playTone(550);
      setTimeout(() => {
        runScanBtn.innerHTML = '<i class="fa-solid fa-microchip"></i> Run Deep Scan';
        showToast('Deep algorithmic scan completed. Autonomic recovery index +4.2%.', 'success');
        playTone(720);
      }, 1200);
    });
  }

  // Export report simulation button
  const exportBtn = document.getElementById('exportReportBtn');
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      exportBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Generating...';
      setTimeout(() => {
        exportBtn.innerHTML = '<i class="fa-solid fa-file-arrow-down"></i> Export Clinical Summary';
        showToast('Clinical summary PDF generated and ready for print review.', 'info');
        window.print();
      }, 900);
    });
  }
}

// --- 15. TAB 3: WELLNESS GOALS & CALIBRATOR ---
function initGoalsSystem() {
  renderGoalsGrid();

  const openBtn = document.getElementById('openGoalCustomizerBtn');
  const editGoalsBtn = document.getElementById('editGoalsBtn');
  const modal = document.getElementById('goalModal');
  const closeBtn = document.getElementById('goalModalClose');
  const cancelBtn = document.getElementById('cancelGoalBtn');
  const form = document.getElementById('goalForm');

  function openGoalModal() {
    if (!modal) return;
    document.getElementById('goalStepsInput').value = state.trackers.stepsGoal;
    document.getElementById('goalWaterInput').value = state.trackers.waterGoal;
    document.getElementById('goalSleepInput').value = state.trackers.sleepGoal;
    document.getElementById('goalCaloriesInput').value = state.trackers.caloriesGoal;
    modal.classList.add('active');
    playTone(450);
  }

  function closeGoalModal() {
    if (modal) modal.classList.remove('active');
  }

  if (openBtn) openBtn.addEventListener('click', openGoalModal);
  if (editGoalsBtn) editGoalsBtn.addEventListener('click', openGoalModal);
  if (closeBtn) closeBtn.addEventListener('click', closeGoalModal);
  if (cancelBtn) cancelBtn.addEventListener('click', closeGoalModal);

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      state.trackers.stepsGoal = parseInt(document.getElementById('goalStepsInput').value, 10);
      state.trackers.waterGoal = parseInt(document.getElementById('goalWaterInput').value, 10);
      state.trackers.sleepGoal = parseFloat(document.getElementById('goalSleepInput').value);
      state.trackers.caloriesGoal = parseInt(document.getElementById('goalCaloriesInput').value, 10);

      closeGoalModal();
      renderGoalsGrid();
      updateDashboardUI();
      persistState();
      showToast('Daily wellness targets successfully calibrated.', 'success');
      playTone(660);
    });
  }
}

function renderGoalsGrid() {
  const grid = document.getElementById('goalsCardsGrid');
  if (!grid) return;

  const t = state.trackers;
  const stepPct = Math.min(Math.round((t.stepsCurrent / t.stepsGoal) * 100), 100);
  const waterPct = Math.min(Math.round((t.waterCurrent / t.waterGoal) * 100), 100);
  const sleepPct = Math.min(Math.round((t.sleepHours / t.sleepGoal) * 100), 100);
  const calPct = Math.min(Math.round((t.caloriesCurrent / t.caloriesGoal) * 100), 100);

  grid.innerHTML = `
    <!-- Goal 1: Steps -->
    <div class="glass-card goal-card">
      <div class="goal-header">
        <div class="goal-icon" style="background: rgba(0, 242, 254, 0.15); color: var(--cyan-400);">
          <i class="fa-solid fa-shoe-prints"></i>
        </div>
        <span class="badge ${stepPct >= 100 ? 'badge-success' : 'badge-cyan'}">${stepPct}%</span>
      </div>
      <div>
        <h4 class="goal-title">Daily Movement Target</h4>
        <div class="goal-progress-num text-cyan font-mono">${t.stepsCurrent.toLocaleString()}</div>
        <span class="goal-target-sub">Target: ${t.stepsGoal.toLocaleString()} steps</span>
        <div class="progress-bar-track">
          <div class="progress-fill fill-cyan" style="width: ${stepPct}%"></div>
        </div>
      </div>
    </div>

    <!-- Goal 2: Hydration -->
    <div class="glass-card goal-card">
      <div class="goal-header">
        <div class="goal-icon" style="background: rgba(14, 165, 233, 0.15); color: var(--blue-500);">
          <i class="fa-solid fa-droplet"></i>
        </div>
        <span class="badge ${waterPct >= 100 ? 'badge-success' : 'badge-cyan'}">${waterPct}%</span>
      </div>
      <div>
        <h4 class="goal-title">Hydration Replenishment</h4>
        <div class="goal-progress-num text-cyan font-mono">${t.waterCurrent.toLocaleString()} <span style="font-size:14px;">ml</span></div>
        <span class="goal-target-sub">Target: ${t.waterGoal.toLocaleString()} ml</span>
        <div class="progress-bar-track">
          <div class="progress-fill fill-blue" style="width: ${waterPct}%"></div>
        </div>
      </div>
    </div>

    <!-- Goal 3: Sleep -->
    <div class="glass-card goal-card">
      <div class="goal-header">
        <div class="goal-icon" style="background: rgba(168, 85, 247, 0.15); color: var(--purple-400);">
          <i class="fa-solid fa-bed"></i>
        </div>
        <span class="badge ${sleepPct >= 100 ? 'badge-success' : 'badge-purple'}">${sleepPct}%</span>
      </div>
      <div>
        <h4 class="goal-title">Restorative Sleep</h4>
        <div class="goal-progress-num text-purple font-mono">${t.sleepHours} <span style="font-size:14px;">hrs</span></div>
        <span class="goal-target-sub">Target: ${t.sleepGoal} hours</span>
        <div class="progress-bar-track">
          <div class="progress-fill fill-purple" style="width: ${sleepPct}%"></div>
        </div>
      </div>
    </div>

    <!-- Goal 4: Active Caloric Burn -->
    <div class="glass-card goal-card">
      <div class="goal-header">
        <div class="goal-icon" style="background: rgba(245, 158, 11, 0.15); color: var(--amber-400);">
          <i class="fa-solid fa-fire"></i>
        </div>
        <span class="badge ${calPct >= 100 ? 'badge-success' : 'badge-amber'}">${calPct}%</span>
      </div>
      <div>
        <h4 class="goal-title">Metabolic Burn</h4>
        <div class="goal-progress-num text-amber font-mono">${t.caloriesCurrent} <span style="font-size:14px;">kcal</span></div>
        <span class="goal-target-sub">Target: ${t.caloriesGoal} kcal</span>
        <div class="progress-bar-track">
          <div class="progress-fill fill-amber" style="width: ${calPct}%"></div>
        </div>
      </div>
    </div>
  `;
}

// --- 16. TAB 4: AI HEALTH COPILOT CONVERSATIONAL ENGINE ---
function initAiCopilot() {
  const form = document.getElementById('copilotChatForm');
  const input = document.getElementById('copilotInput');
  const stream = document.getElementById('chatMessagesStream');
  const clearBtn = document.getElementById('clearChatBtn');
  const promptChips = document.querySelectorAll('.copilot-prompt-chip');
  const askAiChip = document.getElementById('chipAskAI');

  renderChatStream();

  if (askAiChip) {
    askAiChip.addEventListener('click', () => {
      // Switch to AI Copilot tab
      const aiNavBtn = document.querySelector('[data-tab="ai-assistant"]');
      if (aiNavBtn) aiNavBtn.click();
      setTimeout(() => {
        if (input) input.focus();
      }, 300);
    });
  }

  promptChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const prompt = chip.getAttribute('data-prompt');
      if (prompt) {
        handleUserMessage(prompt);
      }
    });
  });

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const text = input.value.trim();
      if (!text) return;
      input.value = '';
      handleUserMessage(text);
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      state.chatHistory = [
        {
          sender: 'ai',
          text: 'Chat history cleared. I am ready with fresh telemetry context. What would you like to inquire about?'
        }
      ];
      renderChatStream();
      persistState();
      playTone(360);
    });
  }
}

function handleUserMessage(userText) {
  // Add user message to history
  state.chatHistory.push({ sender: 'user', text: userText });
  renderChatStream();
  persistState();
  playTone(500, 'sine', 0.1);

  // Render typing indicator
  const stream = document.getElementById('chatMessagesStream');
  const typingRow = document.createElement('div');
  typingRow.className = 'message-row ai';
  typingRow.id = 'typingIndicatorRow';
  typingRow.innerHTML = `
    <div class="msg-avatar ai"><i class="fa-solid fa-brain"></i></div>
    <div class="msg-bubble">
      <div class="typing-dots"><span></span><span></span><span></span></div>
    </div>
  `;
  stream.appendChild(typingRow);
  stream.scrollTop = stream.scrollHeight;

  // Generate intelligent response after simulated cognitive delay
  setTimeout(() => {
    typingRow.remove();
    const responseText = generateCopilotResponse(userText);
    state.chatHistory.push({ sender: 'ai', text: responseText });
    renderChatStream();
    persistState();
    playTone(620, 'sine', 0.12);
  }, 900);
}

function generateCopilotResponse(query) {
  const q = query.toLowerCase();
  const v = state.vitals;
  const p = state.userProfile;

  if (q.includes('heart') || q.includes('bpm') || q.includes('pulse')) {
    return `Based on your live telemetry (${v.heartRate} BPM, resting baseline of ${v.restingHeartRate} BPM), your cardiovascular parameters indicate healthy autonomic balance. Your Heart Rate Variability (HRV) is measured at ${v.hrvMs} ms, reflecting optimal parasympathetic recovery. Keep your moderate cardio zone between 110-135 BPM for optimal aerobic endurance without cardiac fatigue.`;
  } else if (q.includes('sleep') || q.includes('rem') || q.includes('rest')) {
    return `Reviewing last night's polysomnography simulation: You achieved 7h 50m total sleep with 1h 45m (22%) in Slow-Wave Deep Sleep and 2h 10m (28%) in REM state. This surpasses the 20% clinical benchmark for cognitive consolidation. To maintain this architecture tonight, avoid eating within 2 hours of bedtime and maintain room temperature between 65-68°F (18-20°C).`;
  } else if (q.includes('water') || q.includes('hydration') || q.includes('drink')) {
    return `Your hydration tracker logs ${state.trackers.waterCurrent} ml against a personalized target of ${state.trackers.waterGoal} ml (${Math.round((state.trackers.waterCurrent / state.trackers.waterGoal) * 100)}% complete). Given your height (${p.height} cm) and active caloric output (${state.trackers.caloriesCurrent} kcal), maintaining an hourly intake of ~250 ml will stabilize hemodynamic blood viscosity and oxygen transport.`;
  } else if (q.includes('blood pressure') || q.includes('bp') || q.includes('hypertension')) {
    return `Your latest hemodynamics show **${v.bpSys}/${v.bpDia} mmHg**, which falls strictly within the American Heart Association (AHA) 'Normal' classification (< 120/80 mmHg). Your Mean Arterial Pressure (MAP) is ${Math.round(v.bpDia + ((v.bpSys - v.bpDia) / 3))} mmHg and pulse pressure is ${v.bpSys - v.bpDia} mmHg, suggesting supple arterial compliance and low vascular resistance.`;
  } else if (q.includes('oxygen') || q.includes('spo2') || q.includes('breathing')) {
    return `Your arterial blood oxygen saturation is currently **${v.spo2}%**, verified by stable photoplethysmogram wave morphology. Readings above 95% at room air are indicative of uncompromised alveolar gas exchange and normal hemoglobin binding capacity.`;
  } else {
    return `I have evaluated your query against your real-time physiological snapshot: Heart Rate ${v.heartRate} BPM, Blood Pressure ${v.bpSys}/${v.bpDia} mmHg, SpO2 ${v.spo2}%, and overall Health Index ${v.healthScore}/100. Your current telemetry demonstrates high autonomic resilience. Remember to pace your physical exertion, reach your hydration milestone, and protect sleep consistency tonight.`;
  }
}

function renderChatStream() {
  const stream = document.getElementById('chatMessagesStream');
  if (!stream) return;

  stream.innerHTML = state.chatHistory.map(msg => `
    <div class="message-row ${msg.sender}">
      <div class="msg-avatar ${msg.sender}">
        ${msg.sender === 'ai' 
          ? '<i class="fa-solid fa-brain"></i>' 
          : `<img src="${state.userProfile.avatar}" alt="User">`
        }
      </div>
      <div class="msg-bubble">${msg.text}</div>
    </div>
  `).join('');

  stream.scrollTop = stream.scrollHeight;
}

// --- 17. TAB 5: MEDICAL ID, PROFILE EDITOR & SOS EMERGENCY SYSTEM ---
let sosTimer = null;
let sosCount = 5;

function initEmergencySystem() {
  renderIceContacts();

  const globalSosBtn = document.getElementById('globalSosBtn');
  const triggerSosModalBtn = document.getElementById('triggerSosModalBtn');
  const modal = document.getElementById('sosModal');
  const cancelBtn = document.getElementById('sosCancelBtn');
  const countdownNumber = document.getElementById('sosCountdownNumber');

  function startSosSequence() {
    sosCount = 5;
    if (countdownNumber) countdownNumber.textContent = sosCount;
    document.getElementById('sosHeartVal').textContent = `${state.vitals.heartRate} BPM`;
    document.getElementById('sosOxygenVal').textContent = `${state.vitals.spo2}%`;
    modal.classList.add('active');
    playTone(700, 'square', 0.2);

    if (sosTimer) clearInterval(sosTimer);
    sosTimer = setInterval(() => {
      sosCount--;
      if (countdownNumber) countdownNumber.textContent = sosCount;
      playTone(600 + (5 - sosCount) * 80, 'square', 0.2);

      if (sosCount <= 0) {
        clearInterval(sosTimer);
        sosTimer = null;
        modal.classList.remove('active');
        showToast('EMERGENCY SOS BROADCAST SENT to ICE Contacts & Dispatch.', 'danger', 6000);
        playTone(950, 'sawtooth', 0.5);
      }
    }, 1000);
  }

  function abortSos() {
    if (sosTimer) {
      clearInterval(sosTimer);
      sosTimer = null;
    }
    modal.classList.remove('active');
    showToast('Emergency SOS sequence aborted. Telemetry normalized.', 'info');
    playTone(350);
  }

  if (globalSosBtn) globalSosBtn.addEventListener('click', startSosSequence);
  if (triggerSosModalBtn) triggerSosModalBtn.addEventListener('click', startSosSequence);
  if (cancelBtn) cancelBtn.addEventListener('click', abortSos);

  // Edit Medical ID trigger
  const editMedBtn = document.getElementById('editMedicalIdBtn');
  if (editMedBtn) {
    editMedBtn.addEventListener('click', openProfileModal);
  }

  // Print wallet card
  const printMedBtn = document.getElementById('printMedicalCardBtn');
  if (printMedBtn) {
    printMedBtn.addEventListener('click', () => {
      showToast('Opening print dialog for Medical ID Wallet Card...', 'info');
      window.print();
    });
  }
}

function renderIceContacts() {
  const container = document.getElementById('iceContactsContainer');
  if (!container) return;

  container.innerHTML = state.iceContacts.map(c => `
    <div class="ice-contact-card">
      <div class="contact-meta">
        <h5 class="contact-name">${c.name}</h5>
        <span class="contact-role">${c.role}</span>
        <span class="contact-phone">${c.phone}</span>
      </div>
      <button class="contact-call-btn" onclick="simulateIceCall('${c.name}', '${c.phone}')">
        <i class="fa-solid fa-phone"></i> Call
      </button>
    </div>
  `).join('');
}

window.simulateIceCall = function(name, phone) {
  showToast(`Simulating instant cellular connection to ${name} (${phone})...`, 'success');
  playTone(550, 'sine', 0.3);
};

// --- 18. BIOMETRIC PROFILE & DYNAMIC BMI CALCULATOR ---
function initProfileModal() {
  const sidebarProfileTrigger = document.getElementById('sidebarProfileTrigger');
  const topbarProfileTrigger = document.getElementById('topbarProfileTrigger');
  const modal = document.getElementById('profileModal');
  const closeBtn = document.getElementById('profileModalClose');
  const cancelBtn = document.getElementById('cancelProfileBtn');
  const form = document.getElementById('profileForm');

  const nameInput = document.getElementById('profNameInput');
  const ageInput = document.getElementById('profAgeInput');
  const heightInput = document.getElementById('profHeightInput');
  const weightInput = document.getElementById('profWeightInput');
  const bloodTypeInput = document.getElementById('profBloodTypeInput');
  const avatarInput = document.getElementById('profAvatarInput');

  function openModal() {
    nameInput.value = state.userProfile.name;
    ageInput.value = state.userProfile.age;
    heightInput.value = state.userProfile.height;
    weightInput.value = state.userProfile.weight;
    bloodTypeInput.value = state.userProfile.bloodType;
    avatarInput.value = state.userProfile.avatar;
    recalculateBmi();
    modal.classList.add('active');
    playTone(440);
  }

  function closeModal() {
    modal.classList.remove('active');
  }

  if (sidebarProfileTrigger) sidebarProfileTrigger.addEventListener('click', openModal);
  if (topbarProfileTrigger) topbarProfileTrigger.addEventListener('click', openModal);
  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

  // Dynamic live BMI computation
  function recalculateBmi() {
    const h = parseFloat(heightInput.value) / 100; // in meters
    const w = parseFloat(weightInput.value);
    const bmiVal = document.getElementById('calculatedBmiVal');
    const badge = document.getElementById('bmiCategoryBadge');
    const needle = document.getElementById('bmiNeedle');

    if (h > 0 && w > 0) {
      const bmi = +(w / (h * h)).toFixed(1);
      if (bmiVal) bmiVal.textContent = bmi;

      let cat = 'NORMAL WEIGHT';
      let badgeClass = 'badge-success';
      let needlePct = 36;

      if (bmi < 18.5) {
        cat = 'UNDERWEIGHT';
        badgeClass = 'badge-cyan';
        needlePct = 12;
      } else if (bmi <= 24.9) {
        cat = 'NORMAL WEIGHT';
        badgeClass = 'badge-success';
        needlePct = 36;
      } else if (bmi <= 29.9) {
        cat = 'OVERWEIGHT';
        badgeClass = 'badge-amber';
        needlePct = 65;
      } else {
        cat = 'OBESE';
        badgeClass = 'badge-danger';
        needlePct = 88;
      }

      if (badge) {
        badge.textContent = cat;
        badge.className = `badge ${badgeClass}`;
      }
      if (needle) {
        needle.style.left = `${needlePct}%`;
      }
    }
  }

  if (heightInput) heightInput.addEventListener('input', recalculateBmi);
  if (weightInput) weightInput.addEventListener('input', recalculateBmi);

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      state.userProfile.name = nameInput.value.trim();
      state.userProfile.age = parseInt(ageInput.value, 10);
      state.userProfile.height = parseFloat(heightInput.value);
      state.userProfile.weight = parseFloat(weightInput.value);
      state.userProfile.bloodType = bloodTypeInput.value;
      if (avatarInput.value.trim()) {
        state.userProfile.avatar = avatarInput.value.trim();
      }

      closeModal();
      updateDashboardUI();
      persistState();
      showToast('Biometric profile & anthropometrics saved.', 'success');
      playTone(660);
    });
  }
}

function openProfileModal() {
  const trigger = document.getElementById('topbarProfileTrigger');
  if (trigger) trigger.click();
}

// Format Live Date Display in Topbar
function initLiveDateDisplay() {
  const elem = document.getElementById('liveDateDisplay');
  if (!elem) return;

  const now = new Date();
  const options = { weekday: 'long', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  elem.textContent = `${now.toLocaleDateString('en-US', options)} • Real-time telemetry feed`;
}

// --- 19. APP BOOTSTRAPPER ---
document.addEventListener('DOMContentLoaded', () => {
  loadSavedState();
  initTheme();
  initNavigation();
  initWaveformCanvases();
  initSimulationController();
  initHydrationControls();
  initTempUnitToggle();
  initNotificationSystem();
  initTimelineSystem();
  renderAdvisoryFeed();
  initTelemetryChart();
  initGoalsSystem();
  initAiCopilot();
  initEmergencySystem();
  initProfileModal();
  initLiveDateDisplay();
  updateDashboardUI();

  console.log('%c[AegisPulse OS] Biometric Telemetry Core v4.5 Loaded Successfully', 'color: #00f2fe; font-weight: bold;');
});
