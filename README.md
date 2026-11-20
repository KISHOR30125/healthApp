# AegisPulse | Next-Generation Health & Vital Monitoring OS

A complete, modern, and visually stunning Bio-Telemetry & Health Monitoring Web Application built with HTML5, CSS3, Vanilla JavaScript, and Chart.js.

Designed with a futuristic glassmorphic aesthetic, dark/light theme switching, live simulated physiological waveforms (ECG and arterial SpO2 photoplethysmogram), interactive analytics, customizable wellness goals, an AI Health Assistant conversational copilot, and an Emergency SOS Medical ID system.

---

## 🌟 Key Features

### 1. Futuristic Glassmorphic Design & Telemetry UI
- **Futuristic Aesthetic**: Deep space dark mode (`#080b11`) with electric cyan (`#00f2fe`), bio-emerald (`#10b981`), cardio-rose (`#f43f5e`), and neural-purple (`#a855f7`) accents.
- **Light & Dark Mode**: Seamless high-contrast clinical light mode and dark mode with persistent user preference in `localStorage`.
- **Micro-Interactions & Audio Feedback**: Tactile audio tones via the Web Audio API synthesizer for button clicks, goal triumphs, and emergency countdowns.
- **Responsive Layout**: Designed for 4K/Desktop, Laptop, Tablet, and Mobile screens with a mobile navigation drawer and bottom app bar.

### 2. Live Bio-Telemetry & Dynamic Canvases
- **Real-Time Animated ECG Canvas**: High-fidelity continuous P-Q-R-S-T cardiac waveform rendering.
- **Real-Time SpO2 Plethysmograph Waveform**: Arterial pulsatile waveform with dicrotic notch rendering.
- **Live Simulation Toggle**: Smooth natural physiological variations (heart rate micro-adjustments, oxygen saturation oscillations, step counts).
- **Radial Health Score Ring**: Circular SVG gauge visualizing overall holistic health index (0–100) with category breakdowns for Cardio, Sleep, Metabolism, and Activity.

### 3. Vitals & Behavioral Trackers
- **Heart Rate**: Real-time BPM telemetry, min/max ranges, sinus rhythm status.
- **Blood Pressure**: Systolic/Diastolic readings, pulse pressure, mean arterial pressure (MAP), and AHA visual range needle.
- **Blood Oxygen (SpO2)**: Arterial oxygen saturation with status indicator.
- **Core Body Temperature**: Dual Fahrenheit / Celsius toggling with circadian status.
- **Interactive Hydration Logger**: Animated liquid wave glass display, `+250ml`, `+500ml`, `+750ml` quick-add buttons, reset control, and confetti celebration on target completion.
- **Sleep Architecture**: Stage breakdown for Deep Sleep, REM State, Light Sleep, and Awake intervals with sleep efficiency score.
- **Daily Kinematics**: Tri-metric tracking for daily steps, active caloric burn, and stand hours.

### 4. Comprehensive Interactive Charts (Chart.js)
- **Multi-Metric Telemetry Chart**: Switch between Heart Rate, Blood Pressure, SpO2, Activity, and Sleep with 24H, 7D, and 30D timeframes.
- **Deep Analytics View**:
  * Weekly Cardio-Respiratory Correlation (Dual-axis line/bar).
  * Autonomic Stress & Heart Rate Variability (HRV rMSSD in ms).
  * Sleep Stage Quality Radar Chart.
  * Behavioral Correlation Impact Matrix.

### 5. AI Health Copilot ("Aegis Intelligence")
- **Context-Aware Conversational Assistant**: Responds intelligently to questions regarding resting heart rate, deep sleep architecture, personalized hydration targets, and blood pressure analysis.
- **Simulated Typing Stream**: Realistic thinking/typing state with suggestions chips for quick inquiries.
- **Safety Disclaimers**: Clear indication of educational biometric simulation.

### 6. Universal Medical ID & Emergency SOS
- **Universal Medical ID (ICE)**: Documented blood type, severe allergies, pre-existing conditions, active medications, donor status, and MRN code.
- **Live BMI Calculator**: Dynamically computes BMI as height and weight change, showing the exact category needle (underweight, normal, overweight, obese).
- **Emergency SOS Dispatcher**: Simulated 5-second countdown with sound alarms, GPS coordinate broadcast, and one-click contact dialing.

---

## 🚀 How to Run Locally

No build tools, package managers, or API keys are required.

1. Open the project directory:
   ```
   health-monitor-app/
   ├── index.html
   ├── style.css
   ├── script.js
   └── README.md
   ```

2. Simply double-click `index.html` to open it directly in any modern web browser (Chrome, Edge, Firefox, Safari).

3. Alternatively, serve it via any local web server:
   ```powershell
   # Python 3
   python -m http.server 8080

   # Or with Node npx
   npx serve .
   ```
   Then open `http://localhost:8080` in your browser.

---

## 🛡️ Medical Disclaimer
All vitals, electrocardiograms, photoplethysmograms, and AI recommendations in this application are simulated demonstration readings intended solely for interface demonstration and software design purposes. They do not constitute actual medical measurements, clinical diagnoses, or health advice.
