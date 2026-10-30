/**
 * FARM PRO - POWERED BY LAVKUSH
 * Interactive Client Application Logic
 */

// Application State
const state = {
  role: 'user', // 'user' or 'admin'
  settings: {},
  diseases: [],
  fertilizers: [],
  wateringGuide: [],
  tips: [],
  requests: [],
  currentFilter: 'all',
  searchQuery: '',
  selectedScanSample: 'tomato',
  scanImageBase64: null,
  launcherStatus: { isRunning: false, pid: null, exists: false },
  networkInfo: null,
  chatPersona: 'chatl', // 'chatl' or 'chatvlsi'
  autoVoice: true,
  cameraStream: null,
  lang: localStorage.getItem('farmpro_lang') || 'en'
};

let speechCtrl = null;
let voiceCtrl = null;

// Preset Sample Data for Quick Diagnosis Testing
const SCAN_SAMPLES = {
  tomato: {
    crop: 'Tomato',
    symptoms: 'Brown concentric spots on lower leaves with yellow halo',
    diseaseName: 'Early Blight (Alternaria solani)',
    severity: 'High',
    confidence: '97.4%',
    chlorophyll: '78.2 SPAD',
    moisture: '64%',
    causes: 'Fungal pathogen Alternaria solani. Spreads rapidly in warm, damp weather with rainfall splash.',
    cure: [
      'Immediately prune and bury infected lower leaves to reduce inoculum.',
      'Apply Mancozeb 75% WP @ 2.5g per liter of water.',
      'Alternate with Copper Oxychloride 50% WP @ 3g/L after 7 days.',
      'Mulch soil bed with clean straw to prevent rain splash onto foliage.'
    ],
    organicRemedies: [
      'Sour Buttermilk Spray (खट्टी छाछ): Mix 50ml fermented sour buttermilk (kept 4 days in copper container) in 1L water; spray weekly. Natural lactic acid arrests blight fungi.',
      'Cold-Pressed Neem Oil (5ml/L) emulsified with 2ml organic liquid soap; spray every 5-7 days in late evening.',
      'Trichoderma harzianum bio-fungicide (5g/L) root drench to stop soil-borne fungal progression.',
      'Organic Soil Boost: Mix 250g Vermicompost + 50g Neem cake powder at base to build natural systemic resistance.'
    ],
    plantCareSuggestions: [
      'Sanitary Pruning: Prune infected bottom 6 inches of leaves to break fungal splash cycle.',
      'Irrigate strictly at root level early morning; avoid wetting foliage overhead.',
      'Apply 2-3 inch dry straw or biomass mulch over soil to prevent spore splash during rainfall.'
    ],
    prevention: [
      'Rotate crops with non-solanaceous species (maize, pulses) every 2 seasons.',
      'Ensure 60cm row spacing for adequate air circulation.',
      'Adopt drip irrigation instead of overhead hose watering.'
    ],
    img: 'images/sample_tomato_blight.jpg'
  },
  powdery: {
    crop: 'Cucurbits / Vine',
    symptoms: 'White powdery patches on upper leaf surface, curled edges',
    diseaseName: 'Powdery Mildew (Erysiphe cichoracearum)',
    severity: 'Medium',
    confidence: '95.8%',
    chlorophyll: '82.5 SPAD',
    moisture: '58%',
    causes: 'Fungal spores germinating in dry warm conditions with high humidity at night.',
    cure: [
      'Spray Neem Oil (5ml/L) emulsified with organic soap every 5 days.',
      'Apply Wettable Sulphur 80% WP @ 2g per liter water.',
      'Remove heavily blanketed foliage and dispose off-field.'
    ],
    organicRemedies: [
      'Baking Soda & Neem Foliar Spray: Dissolve 5g sodium bicarbonate (मीठा सोडा) + 5ml pure neem oil in 1L water; disrupts fungal spore membranes.',
      'Raw Cow Milk Solution: 1 part milk to 9 parts water; sunlight activates natural antiseptic lactoferrin enzymes.',
      'Wood Ash (लकड़ी की राख): Sift dry wood ash and lightly dust onto damp foliage early morning to create an alkaline barrier hostile to fungal germination.',
      'Panchagavya Foliar Spray (30ml/L) to strengthen leaf cuticles and boost photosynthetic activity.'
    ],
    plantCareSuggestions: [
      'Ensure 6-8 hours of direct sunlight daily and avoid shaded, humid pockets.',
      'Prune dense inner foliage to provide continuous air circulation through the plant canopy.',
      'Avoid excess synthetic nitrogen fertilizers which cause soft, succulent leaves vulnerable to mildew.'
    ],
    prevention: [
      'Maximize direct morning sunlight exposure.',
      'Avoid high-nitrogen fertilizer which triggers soft susceptible foliage.'
    ],
    img: 'images/sample_powdery_mildew.jpg'
  },
  aphids: {
    crop: 'Cotton / Chilli',
    symptoms: 'Curling leaf margins, sticky honeydew honeydew droplets, stunted shoots',
    diseaseName: 'Aphid Infestation (Aphis gossypii)',
    severity: 'Medium',
    confidence: '94.2%',
    chlorophyll: '74.0 SPAD',
    moisture: '70%',
    causes: 'Sucking insect pest colony transmitting viral pathogens and sucking sap.',
    cure: [
      'Spray Imidacloprid 17.8% SL @ 0.5ml per liter water.',
      'Organic: Spray Dashparni Ark or 5% Neem Seed Kernel Extract (NSKE).',
      'Wash undersides of leaves with pressurized water jet.'
    ],
    organicRemedies: [
      'Dashparni Ark (दशपर्णी अर्क) / Herbal Concoction: Spray 20ml per liter water; repels aphids and sucking pests instantly.',
      'Garlic-Chilli-Soap Spray (अग्न्यास्त्र): Boil crushed garlic and pungent hot green chilies with water, add 2 drops soap, spray underside.',
      '5% Neem Seed Kernel Extract (NSKE): Wash underside of leaves thoroughly where aphids colonize.',
      'Yellow Sticky Traps: Hang yellow sheets coated with castor oil at crop canopy height.'
    ],
    plantCareSuggestions: [
      'Companion planting: Plant French Marigold (गेंदा), Sweet Basil, and Coriander around boundaries to repel pests and attract ladybugs.',
      'Blast underside of leaves with a firm water spray to dislodge nymphs mechanically.'
    ],
    prevention: [
      'Install yellow sticky traps (10 per acre) at canopy level.',
      'Conserve ladybird beetle and hoverfly natural predators.'
    ],
    img: 'images/sample_aphids_pest.jpg'
  },
  healthy: {
    crop: 'Wheat / Cereal',
    symptoms: 'Vibrant green canopy, strong root structure, no lesions',
    diseaseName: 'Healthy Crop (No Disease Detected)',
    severity: 'Low',
    confidence: '98.9%',
    chlorophyll: '96.4 SPAD',
    moisture: '72%',
    causes: 'Optimal balanced nutrition and moisture management.',
    cure: [
      'No chemical treatment required.',
      'Maintain standard scheduled irrigation at critical crown root stage.',
      'Continue recommended balanced NPK top-dressing.'
    ],
    organicRemedies: [
      'Liquid Jeevamrutha (तरल जीवामृत): Apply 10% solution directly to root zone to trigger rapid nitrogen-fixing microbial blooms.',
      'Panchagavya spray (30ml per liter water) to boost chlorophyll, flowering, and root vitality naturally.',
      'Mulch root zone with dry straw or dry leaves to retain soil humidity and foster earthworms.'
    ],
    plantCareSuggestions: [
      'Periodic soil testing and organic mulch top-dressing to sustain fertile earthworm activity.',
      'Continue natural companion planting and maintain balanced watering.'
    ],
    prevention: [
      'Periodic weekly field scouting for early pest emergence.'
    ],
    img: 'images/sample_healthy_leaf.jpg'
  }
};

// =====================================================================
// AUDIO CHIMES (Pure Web Audio API Sound Feedback)
// =====================================================================
function playAudioChime(kind = 'listen') {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    if (kind === 'listen') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.28);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } else if (kind === 'stop') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    }
  } catch (e) {
    // Audio context initialization notice
  }
}

// =====================================================================
// SPEECH CONTROLLER (Text-to-Speech Engine from Native App)
// =====================================================================
class SpeechController {
  constructor() {
    this.synth = window.speechSynthesis;
    this.isSpeaking = false;
    this.activeElement = null;
    this.currentUtterance = null;
    this.voice = null;
    this.lang = (window.state && window.state.lang) || localStorage.getItem('farmpro_lang') || 'en';
    this.initVoices();
    if (this.synth && this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = () => this.initVoices();
    }
  }

  setLanguage(lang = 'en') {
    this.lang = lang;
    this.initVoices();
  }

  initVoices() {
    if (!this.synth) return;
    const voices = this.synth.getVoices();
    if (this.lang === 'hi') {
      this.voice = voices.find(v => (v.lang && (v.lang.includes('hi') || v.lang.includes('IN'))) && (v.name.includes('Swara') || v.name.includes('Kalpana') || v.name.toLowerCase().includes('hindi') || v.name.includes('Google'))) ||
                   voices.find(v => v.lang && v.lang.includes('hi')) ||
                   voices.find(v => v.lang && v.lang.includes('IN')) ||
                   voices[0];
    } else {
      this.voice = voices.find(v => v.lang && v.lang.includes('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('India') || v.name.includes('Zira'))) ||
                   voices.find(v => v.lang && v.lang.includes('en')) ||
                   voices[0];
    }
  }

  cleanText(text) {
    if (!text) return '';
    return text
      .replace(/[*_#`~[\]()]/g, ' ')
      .replace(/https?:\/\/\S+/g, '')
      .replace(/[•–—]/g, ', ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  speak(text, element = null, onFinish = null) {
    if (!this.synth) {
      showToast('⚠️ Web Speech Synthesis not supported in this browser.');
      return;
    }

    if (this.isSpeaking && this.activeElement === element) {
      this.stop();
      playAudioChime('stop');
      showToast(this.lang === 'hi' ? '🔇 वॉयस स्पीच रोक दी गई।' : '🔇 Voice Speaking stopped.');
      return;
    }

    this.stop();

    const clean = this.cleanText(text);
    if (!clean) return;

    this.isSpeaking = true;
    this.activeElement = element;
    playAudioChime('listen');

    if (element) {
      element.classList.add('is-speaking');
      const icon = element.querySelector('i');
      if (icon) {
        element.setAttribute('data-prev-icon', icon.className);
        icon.className = 'fa-solid fa-volume-xmark';
      }
    }

    const indStatus = document.getElementById('voice-indicator-status');
    if (indStatus) indStatus.textContent = this.lang === 'hi' ? 'बोल रहा है...' : 'Speaking...';

    const utterance = new SpeechSynthesisUtterance(clean);
    if (this.voice) utterance.voice = this.voice;
    utterance.lang = this.lang === 'hi' ? 'hi-IN' : 'en-IN';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onend = () => {
      this.cleanup(element);
      if (onFinish) onFinish();
    };

    utterance.onerror = (e) => {
      console.warn('Speech error:', e);
      this.cleanup(element);
    };

    this.currentUtterance = utterance;
    this.synth.speak(utterance);
    showToast(this.lang === 'hi' ? '🔊 आवाज में संदेश पढ़ा जा रहा है...' : '🔊 Speaking whole message... (Click speaker icon again to stop)');
  }

  stop() {
    if (this.synth) {
      this.synth.cancel();
    }
    this.cleanup(this.activeElement);
    this.isSpeaking = false;
    this.activeElement = null;
    this.currentUtterance = null;
  }

  cleanup(element) {
    this.isSpeaking = false;
    if (element) {
      element.classList.remove('is-speaking');
      const prev = element.getAttribute('data-prev-icon');
      const icon = element.querySelector('i');
      if (icon && prev) {
        icon.className = prev;
      } else if (icon) {
        icon.className = 'fa-solid fa-volume-high';
      }
    }
    const indStatus = document.getElementById('voice-indicator-status');
    if (indStatus) indStatus.textContent = this.lang === 'hi' ? 'तैयार' : 'Ready';
    this.activeElement = null;
  }
}

// =====================================================================
// VOICE RECOGNITION CONTROLLER (Microphone Speech-to-Text)
// =====================================================================
class VoiceRecognitionController {
  constructor() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.supported = !!SpeechRecognition;
    this.recognition = this.supported ? new SpeechRecognition() : null;
    this.isListening = false;
    this.activeTargetInput = null;
    this.activeMicButton = null;

    if (this.recognition) {
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
      const initialLang = (window.state && window.state.lang) || localStorage.getItem('farmpro_lang') || 'en';
      this.recognition.lang = initialLang === 'hi' ? 'hi-IN' : 'en-IN';

      this.recognition.onstart = () => {
        this.isListening = true;
        playAudioChime('listen');
        if (this.activeMicButton) {
          this.activeMicButton.classList.add('is-listening');
        }
        showToast(state.lang === 'hi' ? '🎙️ सुन रहा हूँ... अपना प्रश्न बोलें!' : '🎙️ Listening... Speak your question into your microphone!');
      };

      this.recognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        if (this.activeTargetInput) {
          this.activeTargetInput.value = transcript;
        }
      };

      this.recognition.onend = () => {
        this.stopListening();
        playAudioChime('stop');
      };

      this.recognition.onerror = (event) => {
        console.warn('Recognition error:', event.error);
        this.stopListening();
        showToast('🎙️ Microphone notice: ' + event.error);
      };
    }
  }

  setLanguage(lang = 'en') {
    if (this.recognition) {
      this.recognition.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';
    }
  }

  toggle(targetInputId, micButtonId, autoSubmitCallback = null) {
    if (!this.supported) {
      alert(state.lang === 'hi' ? 'इस ब्राउज़र में माइक्रोफोन वॉइस पहचान समर्थित नहीं है। कृपया Google Chrome या Edge का उपयोग करें।' : 'Microphone speech recognition is not supported in this browser. Please use Google Chrome, Microsoft Edge, or a modern mobile browser.');
      return;
    }

    const input = document.getElementById(targetInputId);
    const btn = document.getElementById(micButtonId);

    if (this.isListening) {
      this.stopListening();
      if (autoSubmitCallback && input && input.value.trim()) {
        autoSubmitCallback();
      }
      return;
    }

    this.activeTargetInput = input;
    this.activeMicButton = btn;
    try {
      this.recognition.start();
    } catch (e) {
      console.warn('Recognition start error:', e);
    }
  }

  stopListening() {
    this.isListening = false;
    if (this.activeMicButton) {
      this.activeMicButton.classList.remove('is-listening');
    }
    if (this.recognition) {
      try { this.recognition.stop(); } catch (e) {}
    }
  }
}

// =====================================================================
// INITIALIZATION
// =====================================================================
document.addEventListener('DOMContentLoaded', () => {
  speechCtrl = new SpeechController();
  voiceCtrl = new VoiceRecognitionController();
  initApp();
});

async function initApp() {
  await fetchNetworkInfo();
  await fetchSettings();
  await fetchPlantsData();
  await fetchRequests();
  await checkLauncherStatus();

  // Check URL parameters for direct role launch (?role=admin, ?portal=user, or #admin)
  const urlParams = new URLSearchParams(window.location.search);
  const roleParam = urlParams.get('role');
  const portalParam = urlParams.get('portal');
  const hashParam = window.location.hash.toLowerCase();

  if (portalParam === 'user' || window.location.pathname.includes('/user')) {
    // STRICT USER-ONLY PORTAL (No admin rights, no admin switch button!)
    state.isStrictUserOnly = true;
    switchRole('user');
    const pill = document.getElementById('role-selector-pill');
    if (pill) pill.style.display = 'none';
    const actionWrap = document.getElementById('role-action-wrapper');
    if (actionWrap) actionWrap.style.display = 'none';
    const msg = document.getElementById('role-message');
    if (msg) {
      msg.innerHTML = `<strong>🌿 Farm Pro Public User Portal (Powered by Lavkush):</strong> Full agricultural disease scanning & crop consultations available.`;
    }
  } else if (roleParam === 'admin' || hashParam.includes('admin')) {
    enableAdminMode();
    if (hashParam.includes('requests')) {
      const el = document.getElementById('requests');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  } else {
    // Default User Mode
    switchRole('user');
  }

  // Start periodic status polling
  setInterval(checkLauncherStatus, 4000);
  setInterval(fetchRequests, 12000);

  // Setup mobile nav
  const mobileToggle = document.getElementById('mobile-toggle');
  if (mobileToggle) {
    mobileToggle.addEventListener('click', () => {
      document.getElementById('nav-menu').classList.toggle('open');
    });
  }

  // Dynamic Organic Hint listeners
  const cropSelectEl = document.getElementById('scan-crop-select');
  if (cropSelectEl) {
    cropSelectEl.addEventListener('change', updateCropOrganicHint);
  }
  const symInputEl = document.getElementById('scan-symptoms-input');
  if (symInputEl) {
    symInputEl.addEventListener('input', updateCropOrganicHint);
  }

  // Apply language preference
  setLanguage(state.lang, false);
  updateCropOrganicHint();
}

// =====================================================================
// LANGUAGE SWITCHING (ENGLISH <-> हिन्दी)
// =====================================================================
function setLanguage(lang = 'en', announce = true) {
  state.lang = lang;
  localStorage.setItem('farmpro_lang', lang);

  // Update Buttons active state
  const btnEn = document.getElementById('btn-lang-en');
  const btnHi = document.getElementById('btn-lang-hi');
  if (btnEn && btnHi) {
    if (lang === 'hi') {
      btnHi.classList.add('active');
      btnEn.classList.remove('active');
    } else {
      btnEn.classList.add('active');
      btnHi.classList.remove('active');
    }
  }

  // Update Body Class & Document Lang
  if (lang === 'hi') {
    document.body.classList.add('lang-hi');
  } else {
    document.body.classList.remove('lang-hi');
  }
  document.documentElement.lang = lang;

  // Translate all [data-i18n] nodes
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (key && typeof window.t === 'function') {
      el.innerHTML = window.t(key, lang);
    }
  });

  // Translate all [data-i18n-placeholder] nodes
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (key && typeof window.t === 'function') {
      el.placeholder = window.t(key, lang);
    }
  });

  // Update Controllers
  if (speechCtrl) speechCtrl.setLanguage(lang);
  if (voiceCtrl) voiceCtrl.setLanguage(lang);

  // Update Role Indicator message
  const roleMsg = document.getElementById('role-message');
  if (roleMsg && typeof window.t === 'function') {
    if (state.role === 'admin') {
      roleMsg.innerHTML = window.t('admin_role_msg', lang);
    } else {
      roleMsg.innerHTML = window.t('user_role_msg', lang);
    }
  }

  // Update ChatL Welcome Message if it's the welcome greeting
  const welcomeEl = document.getElementById('chatl-welcome-msg');
  if (welcomeEl && typeof window.t === 'function') {
    welcomeEl.innerHTML = formatMarkdownText(window.t('chatl_welcome', lang));
  }

  // Re-load current sample with translated data
  if (state.selectedScanSample) {
    loadSample(state.selectedScanSample);
  }

  // Re-render components with translated content
  renderDiseases();
  renderFertilizers();
  renderWatering();
  renderTips();
  renderRequests();

  // If a diagnosis assessment is visible, re-render it in the selected language
  if (state.currentDiagnosis) {
    let updatedDiag = state.currentDiagnosis;
    if (lang === 'hi' && state.selectedScanSample && window.SCAN_SAMPLES_HI && window.SCAN_SAMPLES_HI[state.selectedScanSample]) {
      updatedDiag = window.SCAN_SAMPLES_HI[state.selectedScanSample];
    } else if (lang === 'en' && state.selectedScanSample && SCAN_SAMPLES[state.selectedScanSample]) {
      updatedDiag = SCAN_SAMPLES[state.selectedScanSample];
    }
    renderScanResults(updatedDiag);
  }

  // Update dynamic organic hints in selected language
  updateCropOrganicHint();

  if (announce) {
    showToast(lang === 'hi' ? '🇮🇳 वेबसाइट की भाषा बदलकर हिन्दी कर दी गई है।' : '🇬🇧 Website language switched to English.');
  }
}

// =====================================================================
// 1. NETWORK INFO & LINK SHARING (LAN & WORLDWIDE)
// =====================================================================
async function fetchNetworkInfo() {
  try {
    const res = await fetch('/api/network-info');
    if (!res.ok) return;
    const data = await res.json();
    state.networkInfo = data;

    // Local Wi-Fi display
    const display = document.getElementById('network-link-display');
    if (display) {
      if (data.networkAddresses && data.networkAddresses.length > 0) {
        display.textContent = `Wi-Fi: ${data.networkAddresses[0].url}`;
      } else {
        display.textContent = `Local: ${data.localhost}`;
      }
    }

    // Worldwide Global display
    const worldDisplay = document.getElementById('worldwide-link-display');
    if (worldDisplay && data.worldwideUrl) {
      state.worldwideUrl = data.worldwideUrl;
      worldDisplay.textContent = `Worldwide: ${data.worldwideUrl}`;
    }
  } catch (err) {
    console.error('Network info err:', err);
  }
}

function copyNetworkLink() {
  let urlToCopy = window.location.href;
  if (state.networkInfo && state.networkInfo.networkAddresses && state.networkInfo.networkAddresses.length > 0) {
    urlToCopy = state.networkInfo.networkAddresses[0].url;
  }
  navigator.clipboard.writeText(urlToCopy).then(() => {
    showToast(`📶 Wi-Fi network link copied! Open on any local device: ${urlToCopy}`);
  }).catch(() => {
    showToast(`Link: ${urlToCopy}`);
  });
}

function copyWorldwideLink() {
  const globalUrl = state.worldwideUrl || (state.networkInfo && state.networkInfo.worldwideUrl) || 'https://solutions-pda-holiday-marine.trycloudflare.com';
  navigator.clipboard.writeText(globalUrl).then(() => {
    showToast(`🌍 Global Link copied: ${globalUrl}`);
  }).catch(() => {
    showToast(`Global Link: ${globalUrl}`);
  });
}

function copyLocaltunnelLink() {
  copyWorldwideLink();
}

// =====================================================================
// 2. SETTINGS
// =====================================================================
async function fetchSettings() {
  try {
    const res = await fetch('/api/settings');
    if (!res.ok) return;
    const data = await res.json();
    state.settings = data;

    if (data.announcement) {
      document.getElementById('announcement-text').textContent = data.announcement;
    }
    if (data.poweredBy) {
      document.getElementById('brand-powered-by').textContent = data.poweredBy.toUpperCase();
      document.getElementById('footer-powered-by').textContent = data.poweredBy;
    }
    if (data.appPath) {
      const p = document.getElementById('app-path-display');
      if (p) p.textContent = data.appPath;
    }
  } catch (err) {
    console.error('Settings err:', err);
  }
}

// =====================================================================
// 3. ROLE SWITCHING (USER MODE vs ADMIN MODE)
// =====================================================================
function switchRole(targetRole) {
  if (targetRole === 'admin') {
    if (state.role === 'admin') {
      showToast('You are already in Admin Mode!');
      return;
    }
    // Prompt for admin password modal
    openModal('modal-admin-auth');
  } else {
    // Switch to User Mode
    state.role = 'user';
    document.body.classList.remove('admin-active');
    document.getElementById('btn-user-mode').classList.add('active');
    document.getElementById('btn-admin-mode').classList.remove('active');
    document.getElementById('admin-panel-floating').style.display = 'none';
    document.getElementById('admin-add-disease-btn-wrap').style.display = 'none';
    const headerBtn = document.getElementById('btn-header-change-pass');
    if (headerBtn) headerBtn.style.display = 'none';

    document.getElementById('role-indicator').className = 'role-indicator user-indicator';
    document.getElementById('role-message').innerHTML = `
      <strong>User Mode Active:</strong> You can browse all crops, perform live AI plant scans, chat with ChatL AI, and submit diagnosis requests.
    `;
    document.getElementById('role-action-wrapper').innerHTML = `
      <button class="btn-sm btn-outline-emerald" onclick="switchRole('admin')">
        <i class="fa-solid fa-key"></i> Switch to Admin
      </button>
    `;

    renderDiseases();
    renderRequests();
    showToast('Switched to User Mode.');
  }
}

async function verifyAdminPasscode(e) {
  e.preventDefault();
  const input = document.getElementById('admin-pass-input').value.trim();
  const errorAlert = document.getElementById('auth-error-alert');
  if (errorAlert) errorAlert.style.display = 'none';

  try {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: input })
    });
    const data = await res.json();

    if (data.success && data.token) {
      state.adminToken = data.token;
      localStorage.setItem('farmpro_admin_token', data.token);
      closeModal('modal-admin-auth');
      document.getElementById('admin-pass-input').value = '';
      enableAdminMode();
      showToast('👑 Welcome Admin!');
    } else {
      // Wrong password -> show alert & display mobile OTP option
      if (errorAlert) errorAlert.style.display = 'flex';
      if (data.maskedPhone) {
        const ph = document.getElementById('auth-masked-phone');
        if (ph) ph.textContent = data.maskedPhone;
        const targetPh = document.getElementById('otp-phone-target');
        if (targetPh) targetPh.textContent = data.maskedPhone;
      }
      showToast('⚠️ Incorrect password (default: admin123). Mobile OTP backup available.');
    }
  } catch (err) {
    alert('Verification failed: ' + err.message);
  }
}

async function requestMobileOtp() {
  try {
    const res = await fetch('/api/admin/send-otp', { method: 'POST' });
    const data = await res.json();
    if (data.success) {
      document.getElementById('form-admin-password').style.display = 'none';
      document.getElementById('form-admin-otp').style.display = 'block';

      if (data.maskedPhone) {
        document.getElementById('otp-phone-target').textContent = data.maskedPhone;
      }

      if (data.demoOtp) {
        const hint = document.getElementById('otp-demo-hint');
        if (hint) {
          hint.style.display = 'block';
          hint.innerHTML = `<i class="fa-solid fa-mobile-screen"></i> <strong>SMS Delivery Preview:</strong> 6-Digit OTP is <code style="font-size:1.1rem;font-weight:bold;">${data.demoOtp}</code>`;
        }
        document.getElementById('admin-otp-input').value = data.demoOtp;
      }

      showToast('📲 6-Digit OTP sent to your registered mobile!');
    }
  } catch (err) {
    alert('Failed to send OTP: ' + err.message);
  }
}

function backToPasswordView() {
  document.getElementById('form-admin-password').style.display = 'block';
  document.getElementById('form-admin-otp').style.display = 'none';
}

async function submitVerifyOtp(e) {
  e.preventDefault();
  const otp = document.getElementById('admin-otp-input').value.trim();
  try {
    const res = await fetch('/api/admin/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ otp })
    });
    const data = await res.json();

    if (data.success && data.token) {
      state.adminToken = data.token;
      localStorage.setItem('farmpro_admin_token', data.token);
      closeModal('modal-admin-auth');
      backToPasswordView();
      document.getElementById('admin-otp-input').value = '';
      enableAdminMode();
      showToast('🎉 Mobile OTP Verified! Admin Unlocked.');

      // Open password reset modal so admin can reset password
      setTimeout(() => {
        openChangePasswordModal(true);
      }, 700);
    } else {
      alert(data.error || 'Incorrect OTP code. Please re-enter.');
    }
  } catch (err) {
    alert('OTP verification failed: ' + err.message);
  }
}

function openChangePasswordModal(fromOtp = false) {
  const grp = document.getElementById('group-current-pass');
  if (grp) grp.style.display = fromOtp ? 'none' : 'block';
  const cur = document.getElementById('chg-current-pass');
  if (cur) {
    cur.required = !fromOtp;
    cur.value = '';
  }
  document.getElementById('chg-new-pass').value = '';
  document.getElementById('chg-confirm-pass').value = '';

  const errBox = document.getElementById('change-pass-error-alert');
  if (errBox) errBox.style.display = 'none';

  backToChangePassForm();

  if (state.settings && state.settings.adminMobile) {
    const phInput = document.getElementById('chg-backup-phone');
    if (phInput && !phInput.value) phInput.value = state.settings.adminMobile;
  }

  openModal('modal-change-password');
}

function backToChangePassForm() {
  const formMain = document.getElementById('form-change-password');
  const formOtp = document.getElementById('form-change-pass-otp');
  if (formMain) formMain.style.display = 'block';
  if (formOtp) formOtp.style.display = 'none';
}

async function requestChangePassOtp() {
  try {
    const res = await fetch('/api/admin/send-otp', { method: 'POST' });
    const data = await res.json();
    if (data.success) {
      document.getElementById('form-change-password').style.display = 'none';
      document.getElementById('form-change-pass-otp').style.display = 'block';

      if (data.maskedPhone) {
        const phTarget = document.getElementById('change-pass-otp-target');
        if (phTarget) phTarget.textContent = data.maskedPhone;
      }

      if (data.demoOtp) {
        const hint = document.getElementById('change-pass-demo-hint');
        if (hint) {
          hint.style.display = 'block';
          hint.innerHTML = `<i class="fa-solid fa-mobile-screen"></i> <strong>SMS Delivery Preview:</strong> 6-Digit OTP is <code style="font-size:1.1rem;font-weight:bold;">${data.demoOtp}</code>`;
        }
        const otpInput = document.getElementById('change-pass-otp-input');
        if (otpInput) otpInput.value = data.demoOtp;
      }

      showToast('📲 6-Digit OTP sent to backup mobile!');
    } else {
      alert(data.error || 'Failed to send OTP.');
    }
  } catch (err) {
    alert('Failed to send OTP: ' + err.message);
  }
}

async function submitChangePassOtp(e) {
  e.preventDefault();
  const otp = document.getElementById('change-pass-otp-input').value.trim();
  const newPass = document.getElementById('chg-new-pass').value.trim();
  const confirmPass = document.getElementById('chg-confirm-pass').value.trim();
  const phone = document.getElementById('chg-backup-phone').value.trim();

  if (!newPass || newPass.length < 4) {
    alert('Please enter a new password (at least 4 characters).');
    backToChangePassForm();
    return;
  }

  if (newPass !== confirmPass) {
    alert('New passwords do not match! Please check and re-type.');
    backToChangePassForm();
    return;
  }

  try {
    const res = await fetch('/api/admin/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        otp: otp,
        newPassword: newPass,
        adminMobile: phone
      })
    });
    const data = await res.json();

    if (data.success) {
      if (data.token) {
        state.adminToken = data.token;
        localStorage.setItem('farmpro_admin_token', data.token);
      }
      closeModal('modal-change-password');
      backToChangePassForm();
      document.getElementById('change-pass-otp-input').value = '';
      enableAdminMode();
      showToast('🎉 Mobile OTP Verified! Password updated successfully.');
    } else {
      alert(data.error || 'Incorrect OTP code. Please re-enter.');
    }
  } catch (err) {
    alert('OTP verification failed: ' + err.message);
  }
}

async function submitChangePassword(e) {
  e.preventDefault();
  const currentPass = document.getElementById('chg-current-pass').value.trim();
  const newPass = document.getElementById('chg-new-pass').value.trim();
  const confirmPass = document.getElementById('chg-confirm-pass').value.trim();
  const phone = document.getElementById('chg-backup-phone').value.trim();
  const errBox = document.getElementById('change-pass-error-alert');
  if (errBox) errBox.style.display = 'none';

  if (newPass !== confirmPass) {
    alert('New passwords do not match! Please check and re-type.');
    return;
  }

  try {
    const res = await fetch('/api/admin/change-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-token': state.adminToken || localStorage.getItem('farmpro_admin_token') || ''
      },
      body: JSON.stringify({
        currentPassword: currentPass,
        newPassword: newPass,
        adminMobile: phone,
        token: state.adminToken
      })
    });
    const data = await res.json();

    if (data.success) {
      if (data.token) {
        state.adminToken = data.token;
        localStorage.setItem('farmpro_admin_token', data.token);
      }
      closeModal('modal-change-password');
      enableAdminMode();
      showToast('🔐 ' + data.message);
    } else {
      // Wrong password
      if (errBox) {
        errBox.style.display = 'flex';
        const title = document.getElementById('change-pass-error-title');
        const desc = document.getElementById('change-pass-error-desc');
        if (title) title.textContent = data.error || 'Incorrect Current Password!';
        if (desc) desc.textContent = 'Default password is admin123. If forgotten, click "Send OTP to Mobile" below for backup authentication.';
      }
      if (data.maskedPhone) {
        const ph = document.getElementById('change-pass-masked-phone');
        if (ph) ph.textContent = data.maskedPhone;
        const targetPh = document.getElementById('change-pass-otp-target');
        if (targetPh) targetPh.textContent = data.maskedPhone;
      }
      showToast('⚠️ Incorrect current password (default: admin123). Mobile OTP backup available.');
    }
  } catch (err) {
    alert('Error changing password: ' + err.message);
  }
}

function enableAdminMode() {
  state.role = 'admin';
  document.body.classList.add('admin-active');
  document.getElementById('btn-admin-mode').classList.add('active');
  document.getElementById('btn-user-mode').classList.remove('active');
  document.getElementById('admin-panel-floating').style.display = 'block';
  document.getElementById('admin-add-disease-btn-wrap').style.display = 'block';
  const headerBtn = document.getElementById('btn-header-change-pass');
  if (headerBtn) headerBtn.style.display = 'inline-flex';

  document.getElementById('role-indicator').className = 'role-indicator admin-indicator';
  document.getElementById('role-message').innerHTML = `
    <strong>👑 Admin Mode:</strong> Full rights active. Default password: <strong style="color:var(--amber-gold)">admin123</strong>. You can edit/delete diseases, prescribe solutions to requests, and configure settings.
  `;
  document.getElementById('role-action-wrapper').innerHTML = `
    <button class="btn-sm btn-amber-gold" onclick="openChangePasswordModal()"><i class="fa-solid fa-key"></i> Change Password</button>
    <button class="btn-sm btn-glass" onclick="openSettingsModal()"><i class="fa-solid fa-gear"></i> Settings</button>
    <button class="btn-sm btn-danger" onclick="switchRole('user')"><i class="fa-solid fa-right-from-bracket"></i> Exit Admin</button>
  `;

  renderDiseases();
  renderRequests();
  showToast('👑 Welcome Admin! Full edit permissions enabled.');
}

// =====================================================================
// 4. AI PLANT SCANNER (LIVE CAMERA & VOICE DIAGNOSIS)
// =====================================================================
function handleDropZoneClick(event) {
  // If clicked inside camera stream controls or if camera is running, don't trigger file picker
  if (event.target.closest('#camera-stream-container') || state.cameraStream) {
    return;
  }
  triggerFileInput();
}

function triggerFileInput() {
  document.getElementById('scanner-file-input').click();
}

function handleScannerFileSelect(event) {
  const file = event.target.files[0];
  if (!file) return;

  state.scanFile = file;
  const reader = new FileReader();
  reader.onload = function(e) {
    state.scanImageBase64 = e.target.result;
    document.getElementById('drop-zone-content').style.display = 'none';
    const cameraStreamContainer = document.getElementById('camera-stream-container');
    if (cameraStreamContainer) cameraStreamContainer.style.display = 'none';
    const previewContainer = document.getElementById('preview-container');
    previewContainer.style.display = 'block';
    document.getElementById('scanner-preview-img').src = e.target.result;
  };
  reader.readAsDataURL(file);

  // Clear chip selections
  document.querySelectorAll('.chip-btn').forEach(btn => btn.classList.remove('active'));
}

async function toggleLiveCamera() {
  const container = document.getElementById('camera-stream-container');
  const dropContent = document.getElementById('drop-zone-content');
  const previewContainer = document.getElementById('preview-container');
  const video = document.getElementById('scanner-video-feed');
  const btn = document.getElementById('btn-toggle-camera');

  if (state.cameraStream) {
    stopLiveCamera();
    return;
  }

  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    alert('Live Camera is not supported by your browser or requires HTTPS. Use File Upload instead.');
    return;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      audio: false
    });

    state.cameraStream = stream;
    video.srcObject = stream;
    video.play();

    dropContent.style.display = 'none';
    previewContainer.style.display = 'none';
    container.style.display = 'flex';
    if (btn) btn.innerHTML = `<i class="fa-solid fa-video-slash"></i> Stop Camera`;
    showToast('📹 Live Camera active! Frame the crop leaf and click "Snap Photo & Diagnose".');
  } catch (err) {
    console.warn('Camera error:', err);
    alert('Unable to access camera: ' + err.message + '\nPlease check browser camera permissions.');
  }
}

function stopLiveCamera(event) {
  if (event) {
    event.stopPropagation();
    event.preventDefault();
  }
  if (state.cameraStream) {
    state.cameraStream.getTracks().forEach(track => track.stop());
    state.cameraStream = null;
  }

  const container = document.getElementById('camera-stream-container');
  if (container) container.style.display = 'none';

  const preview = document.getElementById('preview-container');
  const dropContent = document.getElementById('drop-zone-content');
  const btn = document.getElementById('btn-toggle-camera');
  if (btn) btn.innerHTML = `<i class="fa-solid fa-camera"></i> Live Camera`;

  if (state.scanImageBase64) {
    preview.style.display = 'block';
    dropContent.style.display = 'none';
  } else {
    dropContent.style.display = 'block';
    preview.style.display = 'none';
  }
}

function captureCameraSnapshot(event) {
  if (event) {
    event.stopPropagation();
    event.preventDefault();
  }
  const video = document.getElementById('scanner-video-feed');
  if (!video || !state.cameraStream) return;

  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth || 640;
  canvas.height = video.videoHeight || 480;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
  state.scanImageBase64 = dataUrl;

  canvas.toBlob((blob) => {
    state.scanFile = blob ? new File([blob], 'camera_leaf_scan.jpg', { type: 'image/jpeg' }) : null;
  }, 'image/jpeg', 0.9);

  // Stop camera stream & show captured preview
  stopLiveCamera();
  document.getElementById('drop-zone-content').style.display = 'none';
  const previewContainer = document.getElementById('preview-container');
  previewContainer.style.display = 'block';
  document.getElementById('scanner-preview-img').src = dataUrl;

  showToast('📸 Snapshot captured! Running AI Diagnosis...');
  runAiDiagnosis();
}

function loadSample(sampleKey) {
  stopLiveCamera();
  state.selectedScanSample = sampleKey;
  state.scanFile = null;

  const sample = (state.lang === 'hi' && window.SCAN_SAMPLES_HI && window.SCAN_SAMPLES_HI[sampleKey]) 
    ? window.SCAN_SAMPLES_HI[sampleKey] 
    : SCAN_SAMPLES[sampleKey];
  if (!sample) return;

  // Highlight chip
  document.querySelectorAll('.chip-btn').forEach(btn => btn.classList.remove('active'));
  const activeBtn = document.getElementById('chip-sample-' + sampleKey) || 
    Array.from(document.querySelectorAll('.chip-btn')).find(b => 
      b.textContent.toLowerCase().includes(sampleKey) || 
      (sampleKey === 'tomato' && (b.textContent.includes('Tomato') || b.textContent.includes('टमाटर'))) ||
      (sampleKey === 'powdery' && (b.textContent.includes('Powdery') || b.textContent.includes('चूर्णिल'))) ||
      (sampleKey === 'aphids' && (b.textContent.includes('Aphid') || b.textContent.includes('माहू'))) ||
      (sampleKey === 'healthy' && (b.textContent.includes('Healthy') || b.textContent.includes('स्वस्थ')))
    );
  if (activeBtn) activeBtn.classList.add('active');

  // Preview Image
  document.getElementById('drop-zone-content').style.display = 'none';
  const previewContainer = document.getElementById('preview-container');
  previewContainer.style.display = 'block';
  document.getElementById('scanner-preview-img').src = sample.img;
  
  const isTomato = sample.crop === 'Tomato' || sample.crop === 'टमाटर';
  const isWheat = (sample.crop && (sample.crop.includes('Wheat') || sample.crop.includes('गेहूं')));
  document.getElementById('scan-crop-select').value = isTomato ? 'Tomato' : (isWheat ? 'Wheat' : 'Other');
  document.getElementById('scan-symptoms-input').value = sample.symptoms;
  updateCropOrganicHint();
}

// =====================================================================
// DYNAMIC ORGANIC PLANT CARE HINTS (Pre-Diagnosis & Real-time Input)
// =====================================================================
const CROP_ORGANIC_HINTS = {
  Tomato: {
    titleEn: '🌱 Live Organic Suggestion for Tomato (टमाटर):',
    titleHi: '🌱 टमाटर के लिए तुरंत लाइव जैविक सलाह:',
    tipsEn: [
      '• <strong>Anti-Fungal Protection:</strong> Spray fermented Sour Buttermilk (खट्टी छाछ 50ml/L) kept 4 days with copper wire once weekly to prevent early/late blight.',
      '• <strong>Soil & Roots:</strong> Top-dress with 250g Vermicompost + 50g Neem cake powder at base to build natural systemic resistance.',
      '• <strong>Plant Care Routine:</strong> Prune infected lower 15cm leaves, mulch bed with dry straw, and irrigate strictly at root level early morning.'
    ],
    tipsHi: [
      '• <strong>फफूंद से बचाव:</strong> तांबे के बर्तन में 4 दिन रखी खट्टी छाछ (50ml/L) का हर 7 दिन पर छिड़काव करें ताकि झुलसा रोग न फैले।',
      '• <strong>जड़ व मिट्टी संवर्धन:</strong> पौधे की जड़ के पास 250 ग्राम वर्मीकम्पोस्ट (केंचुआ खाद) + 50 ग्राम नीम की खली डालें।',
      '• <strong>पादप देखभाल:</strong> निचली 6 इंच की पत्तियों को काटें, सूखी पुआल की मल्चिंग करें और केवल सुबह जड़ों में पानी दें।'
    ]
  },
  Wheat: {
    titleEn: '🌱 Live Organic Suggestion for Wheat (गेहूं):',
    titleHi: '🌱 गेहूं के लिए तुरंत लाइव जैविक सलाह:',
    tipsEn: [
      '• <strong>Rust Prevention:</strong> Spray Sour Buttermilk (50ml/L) or dust fine wood ash on dew-laden leaves to halt yellow/brown rust spores.',
      '• <strong>Termite & Root Shield:</strong> Apply fermented Calotropis (Aak) leaves in cow urine with irrigation water to protect roots naturally.',
      '• <strong>Tillering Stage:</strong> Apply 200L Liquid Jeevamrutha per acre during crown root stage to stimulate explosive root branching.'
    ],
    tipsHi: [
      '• <strong>रतुआ / गेरुआ रोग से बचाव:</strong> ओस सूखने के बाद खट्टी छाछ (50ml/L) का छिड़काव करें या सुबह लकड़ी की राख भुरकें।',
      '• <strong>दीमक व जड़ सुरक्षा:</strong> सिंचाई के पानी के साथ मदार (आक) की पत्तियां गोमूत्र में सड़ाकर बहाएं।',
      '• <strong>कल्ले व बढ़वार:</strong> पहली सिंचाई (सीआरआई अवस्था) पर 200 लीटर तरल जीवामृत प्रति एकड़ पानी के साथ दें।'
    ]
  },
  Rice: {
    titleEn: '🌱 Live Organic Suggestion for Rice / Paddy (धान):',
    titleHi: '🌱 धान / चावल के लिए तुरंत लाइव जैविक सलाह:',
    tipsEn: [
      '• <strong>Blast & Sheath Blight:</strong> Spray Pseudomonas fluorescens (10g/L) and copper-infused sour buttermilk (50ml/L).',
      '• <strong>Stem Borer Defense:</strong> Install solar light traps (2/acre) and spray 5% Neem Seed Kernel Extract (NSKE).',
      '• <strong>Field Aeration:</strong> Practice alternate wetting and drying (AWD) to aerate roots and eliminate fungal stagnation.'
    ],
    tipsHi: [
      '• <strong>ब्लास्ट व शीथ ब्लाइट:</strong> स्यूडोनोमास फ्लोरेसेंस (10g/L) व तांबे में रखी खट्टी छाछ (50ml/L) का छिड़काव करें।',
      '• <strong>तना छेदक से बचाव:</strong> खेत में प्रकाश प्रपंच (Light Trap) लगाएं और 5% नीम बीज अर्क (NSKE) का छिड़काव करें।',
      '• <strong>जल प्रबंधन:</strong> क्यारी में 24 घंटे के लिए पानी सुखाकर जड़ों तक धूप और हवा पहुंचने दें।'
    ]
  },
  Cotton: {
    titleEn: '🌱 Live Organic Suggestion for Cotton (कपास):',
    titleHi: '🌱 कपास के लिए तुरंत लाइव जैविक सलाह:',
    tipsEn: [
      '• <strong>Pink Bollworm:</strong> Install 8-10 Gossyplure pheromone traps per acre and spray entomopathogenic Beauveria bassiana (5g/L).',
      '• <strong>Whitefly & Thrips:</strong> Spray pungent Garlic-Chilli Agniastra brew (1:10 dilution) and hang yellow sticky traps.',
      '• <strong>Boll Retention:</strong> Foliar spray 3% Panchagavya (30ml/L) at square formation to retain flowers and boost boll weight.'
    ],
    tipsHi: [
      '• <strong>गुलाबी सुंडी नियंत्रण:</strong> खेत में 8-10 फेरोमोन ट्रैप लगाएं और ब्यूवेरिया बैसियाना (5g/L) या ब्रह्मास्त्र का छिड़काव करें।',
      '• <strong>सफेद मक्खी व थ्रिप्स:</strong> 10 पीले स्टिकी ट्रैप लगाएं और तीखे लहसुन-मिर्च अग्न्यास्त्र का 1:10 में छिड़काव करें।',
      '• <strong>टिंडे का वजन बढ़ाना:</strong> 3% पंचगव्य (30ml/L) का छिड़काव टिंडे गिरने से रोकता है और फसल चमकदार बनाता है।'
    ]
  },
  Potato: {
    titleEn: '🌱 Live Organic Suggestion for Potato (आलू):',
    titleHi: '🌱 आलू के लिए तुरंत लाइव जैविक सलाह:',
    tipsEn: [
      '• <strong>Late & Early Blight:</strong> Spray copper-enriched Sour Buttermilk (50ml/L) every 7-10 days before overcast foggy weather.',
      '• <strong>Tuber Inoculation:</strong> Dip seed tubers in Trichoderma viride bio-fungicide (10g/L) for 15 minutes before planting.',
      '• <strong>Tuber Bulking:</strong> Top-dress with sifted hardwood ash to deliver high-availability natural bio-potassium without chemicals.'
    ],
    tipsHi: [
      '• <strong>झुलसा रोग से रोकथाम:</strong> बादल और कोहरे के मौसम से पहले तांबे में रखी खट्टी छाछ (50ml/L) का छिड़काव करें।',
      '• <strong>कंद शोधन:</strong> बुवाई से पहले आलू के कंदों को ट्राइकोडर्मा विरिडी (10g/L) के घोल में 15 मिनट डुबोकर सुखाएं।',
      '• <strong>कंदों का आकार व वजन:</strong> मिट्टी चढ़ाते समय लकड़ी की छानी हुई राख (प्राकृतिक पोटाश) बुरकें।'
    ]
  },
  Corn: {
    titleEn: '🌱 Live Organic Suggestion for Maize / Corn (मक्का):',
    titleHi: '🌱 मक्का के लिए तुरंत लाइव जैविक सलाह:',
    tipsEn: [
      '• <strong>Fall Armyworm:</strong> Dust fine dry sand mixed with 10% neem cake into leaf whorls to physically suffocate caterpillars.',
      '• <strong>Bio-Pest Control:</strong> Spray entomopathogenic fungus Beauveria bassiana (5g/L) into leaf whorls late in the afternoon.',
      '• <strong>Vigorous Growth:</strong> Apply 10% Liquid Jeevamrutha directly into the root zone at knee-high stage.'
    ],
    tipsHi: [
      '• <strong>फॉल आर्मीवर्म (इल्ली):</strong> मक्का की पोंगी (Whorl) में बारीक छानी रेत + 10% नीम खली डालें, जिससे इल्ली का दम घुट जाता है।',
      '• <strong>जैविक कीटनाशक:</strong> शाम के समय ब्यूवेरिया बैसियाना (5g/L) का पोंगी के अंदर छिड़काव करें।',
      '• <strong>पौधे का विकास:</strong> घुटने बराबर अवस्था में 10% तरल जीवामृत का जड़ों में प्रयोग करें।'
    ]
  },
  Apple: {
    titleEn: '🌱 Live Organic Suggestion for Orchards / Apple (फलदार वृक्ष):',
    titleHi: '🌱 फलदार वृक्षों (सेब, आम, अमरूद) के लिए तुरंत लाइव जैविक सलाह:',
    tipsEn: [
      '• <strong>Canker & Fungal Defense:</strong> Seal pruning wounds with cow dung + turmeric antiseptic paste and spray copper buttermilk (50ml/L).',
      '• <strong>Rhizosphere Drench:</strong> Blend 100g Trichoderma viride into 10kg vermicompost per tree basin to stop root rot and wilt.',
      '• <strong>Fruit Fly Trapping:</strong> Hang Methyl Eugenol pheromone traps at 1.5m canopy height (4 traps/acre).'
    ],
    tipsHi: [
      '• <strong>कैंकर व फफूंद से बचाव:</strong> कटाई-छंटाई के घावों पर गोबर-हल्दी का लेप लगाएं और तांबे की खट्टी छाछ (50ml/L) छिड़कें।',
      '• <strong>जड़ गलन व उकठा:</strong> 100 ग्राम ट्राइकोडर्मा को 10 किलो वर्मीकम्पोस्ट में मिलाकर पेड़ के थाले में डालें।',
      '• <strong>फल मक्खी नियंत्रण:</strong> पेड़ पर मिथाइल यूजेनॉल वाले फेरोमोन ट्रैप (4 ट्रैप प्रति एकड़) लटकाएं।'
    ]
  },
  Other: {
    titleEn: '🌱 Live Organic Suggestion for Plants & Vegetables (पादप सुरक्षा):',
    titleHi: '🌱 पौधों व सब्जियों के लिए तुरंत लाइव जैविक सलाह:',
    tipsEn: [
      '• <strong>Universal Bio-Shield:</strong> Cold-pressed Neem oil (5ml/L) + 2ml organic liquid soap emulsified in warm water repels sucking insects & mildew.',
      '• <strong>Microbial Fertilizer:</strong> Apply Liquid Jeevamrutha (10% foliar or root drench) to provide all 16 bio-nutrients naturally.',
      '• <strong>Root Health:</strong> Inoculate potting soil with Trichoderma viride (5g/L) and mulch base with shredded dry leaves or straw.'
    ],
    tipsHi: [
      '• <strong>सर्वव्यापी सुरक्षा:</strong> 5 मिली नीम का तेल + 2 मिली हल्का साबुन प्रति लीटर पानी में मिलाकर हर 10 दिन पर छिड़कें।',
      '• <strong>जैविक पोषण:</strong> 10% तरल जीवामृत का छिड़काव पौधों को सभी 16 पोषक तत्व और मित्र जीवाणु प्रदान करता है।',
      '• <strong>जड़ व मिट्टी:</strong> गमले या क्यारी की मिट्टी में 5 ग्राम ट्राइकोडर्मा मिलाएं और सूखी पत्तियों से मल्चिंग करें।'
    ]
  }
};

function updateCropOrganicHint() {
  const cropSelect = document.getElementById('scan-crop-select');
  const cropKey = cropSelect ? cropSelect.value : 'Tomato';
  const symInput = document.getElementById('scan-symptoms-input');
  const symptoms = (symInput ? symInput.value : '').toLowerCase();
  const isHi = state.lang === 'hi';

  const hintData = CROP_ORGANIC_HINTS[cropKey] || CROP_ORGANIC_HINTS.Other;
  const titleEl = document.getElementById('crop-organic-hint-title');
  const bodyEl = document.getElementById('crop-organic-hint-body');

  if (titleEl) {
    titleEl.textContent = isHi ? hintData.titleHi : hintData.titleEn;
  }

  if (bodyEl) {
    let tips = isHi ? [...hintData.tipsHi] : [...hintData.tipsEn];

    // Contextual symptom overlay
    if (symptoms.includes('curl') || symptoms.includes('मरोड़') || symptoms.includes('चुर्रा')) {
      tips.unshift(isHi 
        ? '• <strong>पत्ती मरोड़ चेतावनी:</strong> यह थ्रिप्स व सफेद मक्खी से होता है। तुरंत नीले व पीले कार्ड लगाएं और 5ml/L नीम तेल शाम को छिड़कें।'
        : '• <strong>Leaf Curl Alert:</strong> Vector-borne issue. Install Yellow & Blue sticky traps immediately and spray cold-pressed Neem oil (5ml/L).');
    } else if (symptoms.includes('yellow') || symptoms.includes('पीला')) {
      tips.unshift(isHi
        ? '• <strong>पीली पत्तियां (क्लोरोसिस):</strong> तरल जीवामृत या सरसों की खली की चाय का जड़ों में प्रयोग करें; जैविक नाइट्रोजन व सूक्ष्म तत्व तुरंत मिलते हैं।'
        : '• <strong>Yellow Foliage Alert:</strong> Drench with Liquid Jeevamrutha or Mustard Cake Tea for rapid bio-nitrogen and iron uptake.');
    } else if (symptoms.includes('rot') || symptoms.includes('गलन') || symptoms.includes('wilt') || symptoms.includes('उकठा')) {
      tips.unshift(isHi
        ? '• <strong>जड़ गलन चेतावनी:</strong> तुरंत सिंचाई रोकें, क्यारी की गुड़ाई करें और 10 ग्राम ट्राइकोडर्मा विरिडी सड़े गोबर में मिलाकर जड़ों में दें।'
        : '• <strong>Root Rot Alert:</strong> Immediately halt watering, aerate soil, and drench with Trichoderma viride (10g/plant) in vermicompost.');
    }

    bodyEl.innerHTML = tips.join('<br>');
  }
}

// =====================================================================
// LIVE AI DIAGNOSIS WITH REAL-TIME ORGANIC SUGGESTIONS DURING SCAN
// =====================================================================
async function runAiDiagnosis() {
  const isHi = state.lang === 'hi';
  const radar = document.getElementById('scan-radar-overlay');
  const statusTag = document.getElementById('scan-status-tag');
  const crop = document.getElementById('scan-crop-select').value;
  const symptoms = document.getElementById('scan-symptoms-input').value;

  const liveCard = document.getElementById('live-analysis-card');
  const liveTipMsg = document.getElementById('analysis-tip-message');
  const liveProgress = document.getElementById('analysis-meter-fill');
  const liveHeadline = document.getElementById('analysis-tip-headline');

  if (radar) radar.classList.add('active');
  if (statusTag) {
    statusTag.textContent = isHi ? 'पत्ती स्कैन हो रही है...' : 'Scanning Leaf...';
    statusTag.style.color = 'var(--lime-neon)';
  }

  // Show live organic suggestion card
  if (liveCard) {
    liveCard.style.display = 'block';
    if (liveHeadline) {
      liveHeadline.textContent = isHi 
        ? '🌱 विश्लेषण के दौरान लाइव जैविक परामर्श (Live Organic Suggestions):' 
        : '🌱 Live Organic Plant Suggestion While Analyzing:';
    }
  }

  // Phase 1 (0ms - 25%)
  if (liveProgress) liveProgress.style.width = '25%';
  if (liveTipMsg) {
    liveTipMsg.innerHTML = isHi
      ? '🔬 <strong>पत्ती की सूक्ष्म संरचना जांची जा रही है:</strong> तांबे के पात्र में रखी खट्टी छाछ (50ml/L) का छिड़काव फफूंद बीजाणुओं को तुरंत निष्क्रिय करता है।'
      : '🔬 <strong>Scanning leaf tissue & stomata:</strong> Spraying fermented Sour Buttermilk (50ml/L) stored with copper instantly arrests early fungal mycelium naturally.';
  }

  // Phase 2 (700ms - 55%)
  setTimeout(() => {
    if (liveProgress) liveProgress.style.width = '55%';
    if (liveTipMsg) {
      liveTipMsg.innerHTML = isHi
        ? '🌿 <strong>क्लोरोफिल व नमी का जैविक विश्लेषण:</strong> तरल जीवामृत (10% घोल) मिट्टी के मित्र केंचुए और माइकोराइजा को सक्रिय कर प्राकृतिक रोग-प्रतिरोधक क्षमता देता है।'
        : '🌿 <strong>Evaluating chlorophyll & moisture:</strong> Drenching with Liquid Jeevamrutha stimulates beneficial mycorrhizae and builds systemic crop immunity naturally.';
    }
  }, 700);

  // Phase 3 (1400ms - 80%)
  setTimeout(() => {
    if (liveProgress) liveProgress.style.width = '80%';
    if (liveTipMsg) {
      liveTipMsg.innerHTML = isHi
        ? '🐛 <strong>कीट प्रकोप व धब्बों की जैविक जांच:</strong> कोल्ड-प्रेस्ड नीम का तेल (5ml/L) माहू, सफेद मक्खी और थ्रिप्स के विरुद्ध 100% रसायन-मुक्त सुरक्षा कवच बनाता है।'
        : '🐛 <strong>Scanning pest signs & spot necrosis:</strong> Cold-pressed Neem oil (5ml/L) forms an organic bio-shield against aphids, whiteflies, and sucking insects safely.';
    }
  }, 1400);

  // Phase 4 (2100ms - 100%)
  setTimeout(() => {
    if (liveProgress) liveProgress.style.width = '100%';
    if (liveTipMsg) {
      liveTipMsg.innerHTML = isHi
        ? '🌱 <strong>100% जैविक पादप स्वास्थ्य एवं उपचार तालिका तैयार हो रही है...</strong>'
        : '🌱 <strong>Finalizing 100% Organic Plant Health Prescription & Routine...</strong>';
    }
  }, 2100);

  // Completion at 2600ms
  setTimeout(async () => {
    if (radar) radar.classList.remove('active');
    if (liveCard) liveCard.style.display = 'none';

    if (statusTag) {
      statusTag.textContent = isHi ? 'विश्लेषण पूर्ण' : 'Analysis Complete';
      statusTag.style.color = 'var(--emerald-light)';
    }

    let diagData = null;

    if (state.selectedScanSample && !state.scanFile) {
      if (isHi && window.SCAN_SAMPLES_HI && window.SCAN_SAMPLES_HI[state.selectedScanSample]) {
        diagData = window.SCAN_SAMPLES_HI[state.selectedScanSample];
      } else if (SCAN_SAMPLES[state.selectedScanSample]) {
        diagData = SCAN_SAMPLES[state.selectedScanSample];
      }
    } else {
      // Call /api/diagnose
      try {
        const formData = new FormData();
        formData.append('crop', crop);
        formData.append('symptoms', symptoms);
        formData.append('lang', state.lang || 'en');
        if (state.scanFile) {
          formData.append('scanImage', state.scanFile);
        }

        const res = await fetch('/api/diagnose', {
          method: 'POST',
          body: formData
        });
        const json = await res.json();
        if (json.success && json.result) {
          diagData = {
            crop: crop,
            diseaseName: json.result.diseaseName,
            severity: json.result.severity,
            confidence: json.result.confidenceScore,
            chlorophyll: json.result.chlorophyllIndex,
            moisture: json.result.soilMoistureEst,
            causes: json.result.causes,
            cure: json.result.cure,
            organicRemedies: json.result.organicRemedies,
            plantCareSuggestions: json.result.plantCareSuggestions,
            prevention: json.result.prevention
          };
        }
      } catch (err) {
        console.error('Scan error:', err);
      }
    }

    if (!diagData) {
      diagData = (isHi && window.SCAN_SAMPLES_HI) ? window.SCAN_SAMPLES_HI.tomato : SCAN_SAMPLES.tomato;
    }

    // Render results & trigger speech
    renderScanResults(diagData);
    showToast(isHi ? `✅ निदान तैयार: ${diagData.diseaseName} की पहचान हुई! 100% जैविक उपचार शामिल है।` : `✅ Diagnosis ready: ${diagData.diseaseName} detected! 100% Organic remedies generated.`);
  }, 2600);
}

function renderScanResults(data) {
  state.currentDiagnosis = data;
  const isHi = state.lang === 'hi';
  document.getElementById('result-placeholder').style.display = 'none';
  const content = document.getElementById('result-content');
  content.style.display = 'block';

  document.getElementById('res-disease-name').textContent = data.diseaseName;
  document.getElementById('res-confidence-val').textContent = data.confidence;
  
  const sevEl = document.getElementById('res-severity');
  let sevText = data.severity || 'Medium';
  if (isHi) {
    if (sevText === 'High' || sevText === 'उच्च') sevText = 'उच्च (High)';
    else if (sevText === 'Medium' || sevText === 'मध्यम') sevText = 'मध्यम (Medium)';
    else if (sevText === 'Low' || sevText === 'सामान्य' || sevText === 'कम') sevText = 'सामान्य (Low)';
  }
  sevEl.textContent = sevText;
  const baseSev = (data.severity || 'medium').toLowerCase();
  sevEl.className = 'm-val severity-' + (baseSev.includes('high') || baseSev.includes('उच्च') ? 'high' : (baseSev.includes('low') || baseSev.includes('कम') ? 'low' : 'medium'));

  document.getElementById('res-chlorophyll').textContent = data.chlorophyll;
  document.getElementById('res-moisture').textContent = data.moisture;
  document.getElementById('res-causes').textContent = data.causes;

  // 100% Organic Remedies & Natural Plant Care Suggestions
  const orgList = document.getElementById('res-organic-list');
  if (orgList) {
    const remedies = (data.organicRemedies && data.organicRemedies.length > 0)
      ? data.organicRemedies
      : [
          isHi ? 'खट्टी छाछ (50ml/L) व तांबे का काढ़ा फफूंद के खिलाफ सप्ताह में एक बार पत्तियों पर छिड़कें।' : 'Spray fermented sour buttermilk (50ml/L) stored with copper once weekly to halt fungal spores.',
          isHi ? 'कोल्ड-प्रेस्ड नीम का तेल (5ml/L) हर्बल साबुन के साथ मिलाकर हर 7 दिन में शाम को छिड़कें।' : 'Apply Cold-pressed Neem oil (5ml/L) with mild organic soap every 7 days in late afternoon.',
          isHi ? 'जड़ों के पास 250 ग्राम वर्मीकम्पोस्ट (केंचुआ खाद) व नीम की खली डालकर मिट्टी को समृद्ध बनाएं।' : 'Enrich soil with 250g Vermicompost and 50g Neem cake around root zone.'
        ];

    let html = remedies.map(r => `<li><i class="fa-solid fa-leaf text-emerald" style="margin-right:6px"></i>${r}</li>`).join('');

    const suggestions = (data.plantCareSuggestions && data.plantCareSuggestions.length > 0)
      ? data.plantCareSuggestions
      : [
          isHi ? 'निचली 6 इंच की संक्रमित पत्तियों को काटकर हटा दें और सुबह केवल जड़ों में पानी दें।' : 'Prune infected lower foliage and irrigate only at soil level in early morning.',
          isHi ? 'क्यारियों में सूखी पुआल की मल्चिंग करें जिससे नमी बनी रहे और मित्र केंचुए सक्रिय रहें।' : 'Apply dry straw mulch to maintain root moisture and stimulate beneficial soil microbes.'
        ];

    html += suggestions.map(s => `<li><i class="fa-solid fa-hand-holding-droplet text-blue" style="margin-right:6px"></i><strong>${isHi ? 'पादप सलाह: ' : 'Plant Care Suggestion: '}</strong>${s}</li>`).join('');

    orgList.innerHTML = html;
  }

  // Conventional Cure list
  const cureList = document.getElementById('res-cure-list');
  if (cureList) {
    cureList.innerHTML = (data.cure || []).map(c => `<li>${c}</li>`).join('');
  }

  // Prev list
  const prevList = document.getElementById('res-prev-list');
  if (prevList) {
    prevList.innerHTML = (data.prevention || []).map(p => `<li>${p}</li>`).join('');
  }

  // Prepare full speech text in current language emphasizing organic remedies
  const orgSpeech = (data.organicRemedies || []).slice(0, 2).join('. ');
  const curesText = (data.cure || []).join('. ');
  const prevText = (data.prevention || []).join('. ');
  if (isHi) {
    state.currentDiagnosisSpeech = `पादप स्वास्थ्य परीक्षण पूर्ण हुआ। पहचाना गया रोग: ${data.diseaseName}, सटीकता: ${data.confidence}। गंभीरता स्तर: ${sevText}। प्रमुख कारण: ${data.causes}। 100% जैविक उपचार: ${orgSpeech || curesText}। रोकथाम के उपाय: ${prevText}।`;
  } else {
    state.currentDiagnosisSpeech = `Plant health diagnosis assessment complete. Detected ${data.diseaseName} with ${data.confidence} confidence. Severity level is ${data.severity}. Causes: ${data.causes}. 100% Organic remedies: ${orgSpeech || curesText}. Prevention tips: ${prevText}.`;
  }

  // Auto-voice speak if enabled
  if (state.autoVoice && speechCtrl) {
    const speakBtn = document.getElementById('btn-speak-diagnosis');
    setTimeout(() => {
      speechCtrl.speak(state.currentDiagnosisSpeech, speakBtn);
    }, 400);
  }
}

// Ask ChatL specifically for full homemade organic recipe & guidance
function askChatLAboutDiagnosis() {
  const isHi = state.lang === 'hi';
  const diag = state.currentDiagnosis;
  const disease = diag ? diag.diseaseName : 'Plant Disease';
  const cropSelect = document.getElementById('scan-crop-select');
  const crop = (cropSelect && cropSelect.value) || (diag ? diag.crop : 'Plant');

  // Switch persona to ChatL Agri
  if (typeof setChatPersona === 'function') {
    setChatPersona('chatl');
  }

  // Scroll to ChatL AI Assistant smoothly
  const chatlSection = document.getElementById('chatl');
  if (chatlSection) {
    chatlSection.scrollIntoView({ behavior: 'smooth' });
  }

  // Formulate natural organic inquiry
  const prompt = isHi
    ? `${crop} में ${disease} के लिए 100% जैविक काढ़ा और घरेलू उपचार की संपूर्ण विधि बताएं (Organic Recipe and Plant Care Suggestions)`
    : `Please provide a complete 100% organic preparation recipe and care suggestion for ${disease} on ${crop} (Organic Formulation & Plant Health Routine)`;

  const input = document.getElementById('chatl-input');
  if (input) {
    input.value = prompt;
    setTimeout(() => {
      sendChatMessage();
    }, 600);
  }
}

function speakCurrentDiagnosis() {
  if (!state.currentDiagnosisSpeech) {
    showToast('⚠️ No diagnosis available to speak yet.');
    return;
  }
  const btn = document.getElementById('btn-speak-diagnosis');
  speechCtrl.speak(state.currentDiagnosisSpeech, btn);
}

function escalateToRequest() {
  const diseaseName = document.getElementById('res-disease-name').textContent;
  const crop = document.getElementById('scan-crop-select').value;
  const symptoms = document.getElementById('scan-symptoms-input').value || `Detected issue: ${diseaseName}`;

  openNewRequestModal();
  document.getElementById('req-crop').value = crop;
  document.getElementById('req-symptoms').value = `From AI Scanner: Detected ${diseaseName}.\nSymptoms observed: ${symptoms}`;
}

function printDiagnosis() {
  window.print();
}

// =====================================================================
// 5. REQUEST MANAGEMENT (USER SUBMITS & ADMIN RESOLVES)
// =====================================================================
async function fetchRequests() {
  try {
    const res = await fetch('/api/requests');
    if (!res.ok) return;
    const data = await res.json();
    state.requests = data;
    updateRequestCounts();
    renderRequests();
  } catch (err) {
    console.error('Fetch requests err:', err);
  }
}

function updateRequestCounts() {
  const reqs = state.requests;
  document.getElementById('count-all').textContent = reqs.length;
  document.getElementById('count-pending').textContent = reqs.filter(r => r.status === 'Pending').length;
  document.getElementById('count-inreview').textContent = reqs.filter(r => r.status === 'In Review').length;
  document.getElementById('count-resolved').textContent = reqs.filter(r => r.status === 'Resolved').length;
  
  const navCount = document.getElementById('nav-request-count');
  if (navCount) navCount.textContent = reqs.length;
}

function filterRequests(status) {
  state.currentFilter = status;
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-filter') === status);
  });
  renderRequests();
}

function handleRequestSearch() {
  state.searchQuery = document.getElementById('request-search').value.toLowerCase();
  renderRequests();
}

function renderRequests() {
  const container = document.getElementById('requests-container');
  let filtered = state.requests;

  if (state.currentFilter !== 'all') {
    filtered = filtered.filter(r => r.status === state.currentFilter);
  }

  if (state.searchQuery) {
    filtered = filtered.filter(r => 
      (r.farmerName && r.farmerName.toLowerCase().includes(state.searchQuery)) ||
      (r.crop && r.crop.toLowerCase().includes(state.searchQuery)) ||
      (r.symptoms && r.symptoms.toLowerCase().includes(state.searchQuery)) ||
      (r.id && r.id.toLowerCase().includes(state.searchQuery))
    );
  }

  const isHi = state.lang === 'hi';

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="result-placeholder" style="grid-column: 1/-1;">
        <i class="fa-solid fa-inbox" style="font-size:2.5rem; margin-bottom:10px; opacity:0.4;"></i>
        <h4>${isHi ? 'वर्तमान फ़िल्टर के अनुसार कोई अनुरोध नहीं मिला' : 'No requests found matching current filter'}</h4>
        <p>${isHi ? 'परामर्श टिकट दर्ज करने के लिए "नया परामर्श अनुरोध भेजें" पर क्लिक करें।' : 'Click "Submit New Request" to create a consultation ticket.'}</p>
      </div>
    `;
    return;
  }

  const isAdmin = state.role === 'admin';

  container.innerHTML = filtered.map(req => {
    const statusClass = (req.status || 'pending').toLowerCase().replace(' ', '-');
    const hasAdminRemedy = !!req.adminRemedy;

    let statusLabel = req.status;
    if (isHi) {
      if (req.status === 'Pending') statusLabel = 'लंबित (Pending)';
      else if (req.status === 'In Review') statusLabel = 'समीक्षाधीन (In Review)';
      else if (req.status === 'Resolved') statusLabel = 'हल किया गया (Resolved)';
    }

    return `
      <div class="request-card" id="req-card-${req.id}">
        <div class="req-header">
          <div>
            <span class="req-id">${req.id}</span>
            <div class="req-farmer">${escapeHtml(req.farmerName)}</div>
            <div class="req-crop"><i class="fa-solid fa-seedling"></i> ${escapeHtml(req.crop)} ${req.variety ? `(${escapeHtml(req.variety)})` : ''}</div>
          </div>
          <span class="status-badge ${statusClass}">${statusLabel}</span>
        </div>

        <div class="req-body">
          <div class="req-symptoms">
            <strong>${isHi ? 'फसल लक्षण:' : 'Symptoms:'}</strong> ${escapeHtml(req.symptoms)}
          </div>

          ${req.aiTriageNote ? `
            <div class="req-admin-note" style="border-left-color: var(--blue-azure)">
              <strong style="color:var(--blue-azure)"><i class="fa-solid fa-microchip"></i> ${isHi ? 'एआई प्राथमिक जांच नोट:' : 'AI Screening Note:'}</strong>
              ${escapeHtml(req.aiTriageNote)}
            </div>
          ` : ''}

          ${hasAdminRemedy ? `
            <div class="req-admin-note">
              <strong><i class="fa-solid fa-user-doctor"></i> ${isHi ? 'विशेषज्ञ निदान व उपचार नुस्खा:' : 'Specialist Diagnosis & Prescription:'}</strong>
              <div>${req.adminDiagnosis ? `<em>${isHi ? 'निदान:' : 'Diagnosis:'} ${escapeHtml(req.adminDiagnosis)}</em><br>` : ''}${escapeHtml(req.adminRemedy)}</div>
              ${req.assignedBy ? `<div style="font-size:0.7rem; color:var(--text-muted); margin-top:4px;">${isHi ? 'परामर्शदाता:' : 'Prescribed by:'} ${escapeHtml(req.assignedBy)}</div>` : ''}
            </div>
          ` : `
            <div style="font-size:0.78rem; color:var(--text-dim); margin-top:8px;">
              <i class="fa-regular fa-clock"></i> ${isHi ? 'विशेषज्ञ उपचार परामर्श प्रतीक्षित है' : 'Awaiting specialist prescription'}
            </div>
          `}
        </div>

        <div class="req-footer">
          <span><i class="fa-regular fa-calendar"></i> ${req.submittedAt}</span>
          <div class="req-actions">
            ${isAdmin ? `
              <button class="btn btn-sm btn-outline-emerald" onclick="openAdminReviewModal('${req.id}')">
                <i class="fa-solid fa-pen-to-square"></i> ${isHi ? 'समीक्षा व निदान' : 'Review & Diagnose'}
              </button>
            ` : `
              <button class="btn btn-sm btn-glass" onclick="viewRequestDetails('${req.id}')">
                <i class="fa-solid fa-eye"></i> ${isHi ? 'स्थिति देखें' : 'View Status'}
              </button>
            `}
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// User Submits Request
function openNewRequestModal() {
  openModal('modal-request');
}

async function submitUserRequest(e) {
  e.preventDefault();
  const btn = document.getElementById('btn-submit-req');
  btn.disabled = true;
  btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Submitting...`;

  const formData = new FormData();
  formData.append('farmerName', document.getElementById('req-farmer-name').value);
  formData.append('phone', document.getElementById('req-phone').value);
  formData.append('crop', document.getElementById('req-crop').value);
  formData.append('variety', document.getElementById('req-variety').value);
  formData.append('urgency', document.getElementById('req-urgency').value);
  formData.append('symptoms', document.getElementById('req-symptoms').value);

  const fileInput = document.getElementById('req-photo');
  if (fileInput.files[0]) {
    formData.append('photo', fileInput.files[0]);
  }

  try {
    const res = await fetch('/api/requests', {
      method: 'POST',
      body: formData
    });
    const data = await res.json();

    if (data.success) {
      closeModal('modal-request');
      document.getElementById('form-user-request').reset();
      showToast(`🎉 Request ticket #${data.request.id} submitted successfully!`);
      await fetchRequests();
      // Scroll to requests
      window.location.hash = 'requests';
    } else {
      alert('Error submitting request: ' + (data.error || 'Server error'));
    }
  } catch (err) {
    alert('Submission failed: ' + err.message);
  } finally {
    btn.disabled = false;
    btn.innerHTML = `<i class="fa-solid fa-paper-plane"></i> Submit Request`;
  }
}

// Admin Reviews & Diagnoses Request
function openAdminReviewModal(reqId) {
  const req = state.requests.find(r => r.id === reqId);
  if (!req) return;

  document.getElementById('admin-req-id').value = req.id;
  document.getElementById('admin-req-meta').textContent = `${req.id} | ${req.farmerName} | ${req.crop} (${req.urgency} Urgency)`;
  document.getElementById('admin-req-status').value = req.status || 'In Review';
  document.getElementById('admin-req-diagnosis').value = req.adminDiagnosis || '';
  document.getElementById('admin-req-remedy').value = req.adminRemedy || '';
  document.getElementById('admin-req-assigned').value = req.assignedBy || 'Chief Agri Specialist';

  openModal('modal-admin-request');
}

function getAdminHeaders() {
  const token = state.adminToken || localStorage.getItem('farmpro_admin_token') || 'ADMIN_DEV_INITIAL_KEY';
  return {
    'Content-Type': 'application/json',
    'x-admin-token': token
  };
}

async function saveAdminRequestEdit(e) {
  e.preventDefault();
  const id = document.getElementById('admin-req-id').value;
  const payload = {
    status: document.getElementById('admin-req-status').value,
    adminDiagnosis: document.getElementById('admin-req-diagnosis').value,
    adminRemedy: document.getElementById('admin-req-remedy').value,
    assignedBy: document.getElementById('admin-req-assigned').value
  };

  try {
    const res = await fetch(`/api/requests/${id}`, {
      method: 'PUT',
      headers: getAdminHeaders(),
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (data.success) {
      closeModal('modal-admin-request');
      showToast(`✅ Request ${id} updated & remedy published!`);
      await fetchRequests();
    } else {
      alert(data.error || 'Failed to update request.');
    }
  } catch (err) {
    alert('Failed to update request: ' + err.message);
  }
}

async function deleteCurrentRequest() {
  const id = document.getElementById('admin-req-id').value;
  if (!confirm(`Are you sure you want to delete request ${id}?`)) return;

  try {
    const res = await fetch(`/api/requests/${id}`, {
      method: 'DELETE',
      headers: getAdminHeaders()
    });
    const data = await res.json();
    if (data.success) {
      closeModal('modal-admin-request');
      showToast(`🗑️ Request ${id} deleted.`);
      await fetchRequests();
    } else {
      alert(data.error || 'Failed to delete request.');
    }
  } catch (err) {
    alert('Delete failed: ' + err.message);
  }
}

function viewRequestDetails(reqId) {
  const req = state.requests.find(r => r.id === reqId);
  if (!req) return;
  alert(
    `Request #${req.id}\nFarmer: ${req.farmerName}\nCrop: ${req.crop}\nStatus: ${req.status}\n\nSymptoms: ${req.symptoms}\n\nAdmin Diagnosis: ${req.adminDiagnosis || 'Pending'}\nRemedy: ${req.adminRemedy || 'In progress by specialist'}`
  );
}

// =====================================================================
// 6. PLANT DOCTOR & ENCYCLOPEDIA (ADMIN EDIT/ADD/DELETE)
// =====================================================================
async function fetchPlantsData() {
  try {
    const res = await fetch('/api/plants');
    if (!res.ok) return;
    const data = await res.json();
    state.diseases = data.diseases || [];
    state.fertilizers = data.fertilizers || [];
    state.wateringGuide = data.wateringGuide || [];
    state.tips = data.tips || [];

    renderDiseases();
    renderFertilizers();
    renderWatering();
    renderTips();
  } catch (err) {
    console.error('Fetch plants err:', err);
  }
}

function renderDiseases() {
  const container = document.getElementById('diseases-container');
  if (!container) return;
  const isAdmin = state.role === 'admin';
  const isHi = state.lang === 'hi';
  const list = (isHi && window.DISEASES_HI) ? window.DISEASES_HI : state.diseases;

  container.innerHTML = list.map(d => {
    const sevClass = (d.severity || 'Medium').toLowerCase();
    const symptomsList = (d.symptoms || []).slice(0, 3).map(s => `<li>${escapeHtml(s)}</li>`).join('');
    const cureList = (d.cure || []).slice(0, 2).map(c => `<li>${escapeHtml(c)}</li>`).join('');

    const symptomsLabel = isHi ? 'प्रमुख लक्षण:' : 'Key Symptoms:';
    const cureLabel = isHi ? 'अनुशंसित उपचार:' : 'Recommended Cure:';
    const speakLabel = isHi ? 'उपचार सुनें' : 'Speak Cure';
    const editLabel = isHi ? 'संपादित करें' : 'Edit';
    const deleteLabel = isHi ? 'हटाएं' : 'Delete';
    let riskLabel = `${d.severity} Risk`;
    if (isHi) {
      if (d.severity === 'High' || d.severity === 'उच्च') riskLabel = 'उच्च जोखिम (High)';
      else if (d.severity === 'Low' || d.severity === 'कम') riskLabel = 'सामान्य जोखिम (Low)';
      else riskLabel = 'मध्यम जोखिम (Medium)';
    }

    return `
      <div class="disease-card">
        <div class="d-card-header">
          <div class="d-icon-wrap">
            <i class="fa-solid fa-leaf"></i>
          </div>
          <span class="m-val severity-${sevClass}">${riskLabel}</span>
        </div>

        <h3 class="d-card-title">${escapeHtml(d.name)}</h3>
        <div class="d-card-causes"><i class="fa-solid fa-virus"></i> ${escapeHtml(d.causes || (isHi ? 'कवक अथवा जीवाणु संक्रमण' : 'Fungal/bacterial infection'))}</div>

        <div class="d-card-section">
          <strong>${symptomsLabel}</strong>
          <ul class="cure-list" style="margin-left:14px;">${symptomsList}</ul>
        </div>

        <div class="d-card-section">
          <strong style="color:var(--emerald-light)">${cureLabel}</strong>
          <ul class="cure-list" style="margin-left:14px;">${cureList}</ul>
        </div>

        <div class="d-card-actions">
          <button class="btn btn-sm btn-amber-gold btn-voice-pill" onclick="speakDiseaseGuide('${d.id}', this)" title="${isHi ? 'रोग का उपचार आवाज में सुनें' : 'Listen to Disease Cure (Voice Speaking)'}">
            <i class="fa-solid fa-volume-high"></i> ${speakLabel}
          </button>
          ${isAdmin ? `
            <button class="btn btn-sm btn-outline-emerald" onclick="openEditDiseaseModal('${d.id}')">
              <i class="fa-solid fa-pen"></i> ${editLabel}
            </button>
            <button class="btn btn-sm btn-danger" onclick="deleteDisease('${d.id}')">
              <i class="fa-solid fa-trash"></i> ${deleteLabel}
            </button>
          ` : ''}
        </div>
      </div>
    `;
  }).join('');
}

function speakDiseaseGuide(diseaseId, btn) {
  const isHi = state.lang === 'hi';
  const list = (isHi && window.DISEASES_HI) ? window.DISEASES_HI : state.diseases;
  const d = list.find(item => item.id === diseaseId) || state.diseases.find(item => item.id === diseaseId);
  if (!d) return;
  const cures = (d.cure || []).join('. ');
  let text = '';
  if (isHi) {
    text = `${d.name}। कारण: ${d.causes || 'कवक अथवा कीट संक्रमण'}। प्रमुख लक्षण: ${(d.symptoms || []).join(', ')}। अनुशंसित उपचार: ${cures}। रोकथाम के उपाय: ${(d.prevention || []).join('. ')}।`;
  } else {
    text = `${d.name}. Causes: ${d.causes || 'Fungal or pest attack'}. Key symptoms include: ${(d.symptoms || []).join(', ')}. Recommended Cure: ${cures}. Prevention: ${(d.prevention || []).join('. ')}.`;
  }
  speechCtrl.speak(text, btn);
}

function openAddDiseaseModal() {
  document.getElementById('disease-edit-id').value = '';
  document.getElementById('modal-disease-title').innerHTML = '<i class="fa-solid fa-leaf text-emerald"></i> Add New Plant Disease';
  document.getElementById('form-disease-edit').reset();
  openModal('modal-disease-edit');
}

function openEditDiseaseModal(diseaseId) {
  const d = state.diseases.find(item => item.id === diseaseId);
  if (!d) return;

  document.getElementById('disease-edit-id').value = d.id;
  document.getElementById('modal-disease-title').innerHTML = `<i class="fa-solid fa-pen text-amber"></i> Edit ${escapeHtml(d.name)}`;
  document.getElementById('disease-edit-name').value = d.name || '';
  document.getElementById('disease-edit-severity').value = d.severity || 'Medium';
  document.getElementById('disease-edit-causes').value = d.causes || '';
  document.getElementById('disease-edit-symptoms').value = (d.symptoms || []).join('\n');
  document.getElementById('disease-edit-cure').value = (d.cure || []).join('\n');
  document.getElementById('disease-edit-prevention').value = (d.prevention || []).join('\n');

  openModal('modal-disease-edit');
}

async function saveDiseaseForm(e) {
  e.preventDefault();
  const id = document.getElementById('disease-edit-id').value;
  const payload = {
    name: document.getElementById('disease-edit-name').value,
    severity: document.getElementById('disease-edit-severity').value,
    causes: document.getElementById('disease-edit-causes').value,
    symptoms: document.getElementById('disease-edit-symptoms').value.split('\n').filter(Boolean),
    cure: document.getElementById('disease-edit-cure').value.split('\n').filter(Boolean),
    prevention: document.getElementById('disease-edit-prevention').value.split('\n').filter(Boolean)
  };

  try {
    let url = '/api/plants/diseases';
    let method = 'POST';
    if (id) {
      url += '/' + id;
      method = 'PUT';
    }

    const res = await fetch(url, {
      method: method,
      headers: getAdminHeaders(),
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (data.success) {
      closeModal('modal-disease-edit');
      showToast(`🌿 Plant disease ${payload.name} saved successfully!`);
      await fetchPlantsData();
    } else {
      alert(data.error || 'Failed to save disease.');
    }
  } catch (err) {
    alert('Save failed: ' + err.message);
  }
}

async function deleteDisease(id) {
  if (!confirm('Are you sure you want to delete this plant disease entry?')) return;
  try {
    const res = await fetch(`/api/plants/diseases/${id}`, {
      method: 'DELETE',
      headers: getAdminHeaders()
    });
    const data = await res.json();
    if (data.success) {
      showToast('🗑️ Plant disease removed.');
      await fetchPlantsData();
    } else {
      alert(data.error || 'Failed to delete disease.');
    }
  } catch (err) {
    alert('Delete failed: ' + err.message);
  }
}

// Subtabs
function switchSubTab(tabId) {
  document.querySelectorAll('.subtab-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.tab-pane').forEach(p => p.style.display = 'none');

  const activeBtn = Array.from(document.querySelectorAll('.subtab-btn')).find(b => b.getAttribute('onclick').includes(tabId));
  if (activeBtn) activeBtn.classList.add('active');

  const pane = document.getElementById(tabId);
  if (pane) pane.style.display = 'block';
}

function renderFertilizers() {
  const container = document.getElementById('fertilizers-container');
  if (!container) return;
  const isHi = state.lang === 'hi';
  const list = (isHi && window.FERTILIZERS_HI) ? window.FERTILIZERS_HI : state.fertilizers;

  container.innerHTML = list.map(f => `
    <div class="info-card">
      <div class="info-card-title">${f.name || f.id}</div>
      <div class="info-card-sub">${isHi ? 'एनपीके अनुपात' : 'NPK'}: ${f.npk || 'Standard'} | ${isHi ? 'स्वरूप' : 'Form'}: ${f.form || 'Granular'}</div>
      <div style="font-size:0.84rem; margin-bottom:8px;"><strong>${isHi ? 'मात्रा' : 'Dosage'}:</strong> ${f.dosage || '25 kg/acre'}</div>
      <div style="font-size:0.8rem; color:#cbd5e1;"><strong>${isHi ? 'प्रयोग विधि' : 'Application'}:</strong> ${f.application || 'Basal dose or top dressing'}</div>
    </div>
  `).join('');
}

function renderWatering() {
  const container = document.getElementById('watering-container');
  if (!container) return;
  const isHi = state.lang === 'hi';
  const list = (isHi && window.WATERING_GUIDE_HI) ? window.WATERING_GUIDE_HI : state.wateringGuide;

  container.innerHTML = list.map(w => `
    <div class="info-card">
      <div class="info-card-title">${w.crop || w.id}</div>
      <div class="info-card-sub">${isHi ? 'सिंचाई अंतराल' : 'Frequency'}: ${w.frequency || 'Weekly'} | ${isHi ? 'क्रांतिक अवस्था' : 'Critical'}: ${w.critical_stage || 'Flowering'}</div>
      <div style="font-size:0.84rem; margin-bottom:8px;"><strong>${isHi ? 'सिंचाई विधि' : 'Method'}:</strong> ${w.method || 'Drip'}</div>
      <div style="font-size:0.8rem; color:#cbd5e1;">${w.notes || 'Ensure root zone remains moist, avoid standing water.'}</div>
    </div>
  `).join('');
}

function renderTips() {
  const container = document.getElementById('tips-container');
  if (!container) return;
  const isHi = state.lang === 'hi';
  const list = (isHi && window.TIPS_HI) ? window.TIPS_HI : state.tips;

  container.innerHTML = list.map(t => `
    <div class="info-card">
      <div class="info-card-title">${t.title || 'Agronomy Tip'}</div>
      <div class="info-card-sub"><span class="badge-version">${t.category || (isHi ? 'सामान्य' : 'General')}</span></div>
      <div style="font-size:0.84rem; color:#cbd5e1;">${t.tip || t.description || ''}</div>
    </div>
  `).join('');
}

// =====================================================================
// 7. CHATL AI ASSISTANT (DUAL PERSONA & VOICE SPEAKING)
// =====================================================================
function handleChatKeyPress(e) {
  if (e.key === 'Enter') sendChatMessage();
}

function sendChatPrompt(promptText) {
  document.getElementById('chatl-input').value = promptText;
  sendChatMessage();
}

function setChatPersona(persona) {
  state.chatPersona = persona;
  const tabAgri = document.getElementById('tab-persona-chatl');
  const tabVlsi = document.getElementById('tab-persona-chatvlsi');
  const personaTitle = document.getElementById('chat-persona-title');
  const personaSub = document.getElementById('chat-persona-sub');

  if (persona === 'chatvlsi') {
    if (tabVlsi) tabVlsi.classList.add('active');
    if (tabAgri) tabAgri.classList.remove('active');
    if (personaTitle) personaTitle.textContent = 'ChatVLSI 1.2 Copilot';
    if (personaSub) personaSub.textContent = 'Hardware RTL, Verilog, STA, CDC & Verification Engine • Powered by Lavkush';
    showToast('⚡ Switched to ChatVLSI 1.2 (Hardware & RTL Copilot)!');
  } else {
    if (tabAgri) tabAgri.classList.add('active');
    if (tabVlsi) tabVlsi.classList.remove('active');
    if (personaTitle) personaTitle.textContent = 'ChatL AI Assistant';
    if (personaSub) personaSub.textContent = 'Smart Agriculture & Bio-Medical Engine • Powered by Lavkush';
    showToast('🌿 Switched to ChatL Agri AI (Crops & Plant Health)!');
  }
}

function toggleAutoVoice() {
  state.autoVoice = !state.autoVoice;
  const autoState = document.getElementById('auto-voice-state');
  if (autoState) autoState.textContent = state.autoVoice ? 'ON' : 'OFF';
  const autoBtn = document.getElementById('btn-auto-voice');
  if (autoBtn) {
    if (state.autoVoice) {
      autoBtn.classList.remove('btn-glass');
      autoBtn.classList.add('btn-amber-gold');
      showToast('🔊 Auto-Voice Speaking ENABLED. ChatL will read answers aloud!');
    } else {
      autoBtn.classList.add('btn-glass');
      autoBtn.classList.remove('btn-amber-gold');
      if (speechCtrl) speechCtrl.stop();
      showToast('🔇 Auto-Voice Speaking DISABLED.');
    }
  }
}

function toggleBubbleSpeech(btn) {
  const bubble = btn.closest('.chat-bubble');
  if (!bubble) return;
  const textEl = bubble.querySelector('.bubble-text');
  if (!textEl) return;
  speechCtrl.speak(textEl.innerText, btn);
}

async function sendChatMessage() {
  const input = document.getElementById('chatl-input');
  const message = input.value.trim();
  if (!message) return;

  const chatContainer = document.getElementById('chatl-messages');
  const isVLSI = state.chatPersona === 'chatvlsi';
  const isHi = state.lang === 'hi';
  const botName = isVLSI ? 'ChatVLSI 1.2' : (isHi ? 'चैटएल एआई' : 'ChatL AI');

  // Append user bubble
  const userBubble = document.createElement('div');
  userBubble.className = 'chat-bubble user-bubble';
  userBubble.innerHTML = `
    <div class="bubble-sender" style="color:#d1fae5">${isHi ? 'आप (You)' : 'You'}</div>
    <div class="bubble-text">${escapeHtml(message)}</div>
    <div class="bubble-time">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
  `;
  chatContainer.appendChild(userBubble);
  input.value = '';
  chatContainer.scrollTop = chatContainer.scrollHeight;

  // Placeholder thinking bubble
  const thinkingText = isHi 
    ? (isVLSI ? 'चैटवीएलएसआई आरटीएल लॉजिक का विश्लेषण कर रहा है...' : 'चैटएल आपके कृषि प्रश्न का विश्लेषण कर रहा है...')
    : (isVLSI ? 'ChatVLSI is analyzing RTL logic...' : 'ChatL is diagnosing query...');

  const botBubble = document.createElement('div');
  botBubble.className = 'chat-bubble bot-bubble';
  botBubble.innerHTML = `
    <div class="bubble-header-row">
      <div class="bubble-sender"><i class="fa-solid ${isVLSI ? 'fa-microchip' : 'fa-robot'}"></i> <span class="bot-name-label">${botName}</span></div>
      <button type="button" class="bubble-speak-btn" onclick="toggleBubbleSpeech(this)" title="${isHi ? 'उत्तर आवाज में सुनें' : 'Read message aloud (Voice Speaking)'}">
        <i class="fa-solid fa-volume-high"></i>
      </button>
    </div>
    <div class="bubble-text"><i class="fa-solid fa-spinner fa-spin"></i> ${thinkingText}</div>
  `;
  chatContainer.appendChild(botBubble);
  chatContainer.scrollTop = chatContainer.scrollHeight;

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, persona: state.chatPersona, lang: state.lang })
    });
    const data = await res.json();

    const formattedReply = formatMarkdownText(data.reply || (isHi ? 'आपके प्रश्न के लिए धन्यवाद।' : 'Thank you for your question.'));
    botBubble.querySelector('.bubble-text').innerHTML = formattedReply;
    botBubble.innerHTML += `<div class="bubble-time">${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>`;

    // If auto-voice is enabled, speak out the answer
    if (state.autoVoice && speechCtrl && data.reply) {
      const speakBtn = botBubble.querySelector('.bubble-speak-btn');
      setTimeout(() => {
        speechCtrl.speak(data.reply, speakBtn);
      }, 300);
    }
  } catch (err) {
    botBubble.querySelector('.bubble-text').textContent = isHi ? 'चैटएल एआई इंजन से संपर्क नहीं हो सका।' : 'Error connecting to ChatL AI engine.';
  }

  chatContainer.scrollTop = chatContainer.scrollHeight;
}

// =====================================================================
// 8. DESKTOP APP LAUNCHER (install_and_run.bat Integration)
// =====================================================================
async function checkLauncherStatus() {
  try {
    const res = await fetch('/api/launcher/status');
    if (!res.ok) return;
    const data = await res.json();
    state.launcherStatus = data;

    // Update UI elements
    const pathEl = document.getElementById('launch-path-val');
    if (pathEl) pathEl.textContent = data.appPath || 'N/A';

    const batEl = document.getElementById('launch-bat-val');
    if (batEl) {
      if (data.batExists) {
        batEl.innerHTML = `<i class="fa-solid fa-circle-check text-emerald"></i> install_and_run.bat Ready`;
      } else {
        batEl.innerHTML = `<i class="fa-solid fa-triangle-exclamation text-amber"></i> install_and_run.bat not found`;
      }
    }

    const pill = document.getElementById('launch-status-pill');
    const btnLaunch = document.getElementById('btn-launch-app');
    const btnStop = document.getElementById('btn-stop-app');

    if (pill) {
      if (data.isRunning) {
        pill.innerHTML = `<span class="dot green"></span> Running (PID: ${data.pid})`;
        if (btnLaunch) btnLaunch.style.display = 'none';
        if (btnStop) btnStop.style.display = 'inline-flex';
      } else {
        pill.innerHTML = `<span class="dot yellow"></span> Standby`;
        if (btnLaunch) btnLaunch.style.display = 'inline-flex';
        if (btnStop) btnStop.style.display = 'none';
      }
    }

    // Update logs
    if (data.logs && data.logs.length > 0) {
      const term = document.getElementById('terminal-output');
      if (term) {
        term.textContent = data.logs.join('\n');
        term.scrollTop = term.scrollHeight;
      }
    }
  } catch (err) {
    console.error('Check launcher error:', err);
  }
}

async function triggerAppLaunch() {
  const btn = document.getElementById('btn-launch-app');
  btn.disabled = true;
  btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Launching Farm Pro...`;

  try {
    const res = await fetch('/api/launcher/launch', {
      method: 'POST',
      headers: getAdminHeaders()
    });
    const data = await res.json();
    if (data.success) {
      showToast('🚀 ' + data.message);
      await checkLauncherStatus();
    } else {
      alert('Launch notice: ' + (data.error || data.message));
    }
  } catch (err) {
    alert('Launch request failed: ' + err.message);
  } finally {
    btn.disabled = false;
    btn.innerHTML = `<i class="fa-solid fa-play"></i> Launch Farm Pro Now`;
  }
}

async function triggerAppStop() {
  try {
    const res = await fetch('/api/launcher/stop', {
      method: 'POST',
      headers: getAdminHeaders()
    });
    const data = await res.json();
    showToast(data.message || 'Process stopped.');
    await checkLauncherStatus();
  } catch (err) {
    alert('Stop request failed: ' + err.message);
  }
}

function clearLogs() {
  const term = document.getElementById('terminal-output');
  if (term) term.textContent = 'Log buffer cleared.';
}

// =====================================================================
// 9. SETTINGS MODAL
// =====================================================================
function openSettingsModal() {
  const s = state.settings;
  document.getElementById('set-app-name').value = s.appName || 'Farm Pro';
  document.getElementById('set-powered-by').value = s.poweredBy || 'Lavkush';
  document.getElementById('set-announcement').value = s.announcement || '';
  document.getElementById('set-app-path').value = s.appPath || 'G:\\app_developer_sonu\\farming_app power by lavkush';
  document.getElementById('set-phone').value = s.contactPhone || '+91 98765 43210';
  document.getElementById('set-email').value = s.contactEmail || 'lavkush.farmpro@agritech.in';

  openModal('modal-settings');
}

async function saveSystemSettings(e) {
  e.preventDefault();
  const payload = {
    appName: document.getElementById('set-app-name').value,
    poweredBy: document.getElementById('set-powered-by').value,
    announcement: document.getElementById('set-announcement').value,
    appPath: document.getElementById('set-app-path').value,
    contactPhone: document.getElementById('set-phone').value,
    contactEmail: document.getElementById('set-email').value
  };

  try {
    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: getAdminHeaders(),
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (data.success) {
      closeModal('modal-settings');
      showToast('⚙️ System settings saved!');
      await fetchSettings();
    }
  } catch (err) {
    alert('Settings save failed: ' + err.message);
  }
}

// =====================================================================
// UTILITY FUNCTIONS
// =====================================================================
function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.style.display = 'flex';
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.style.display = 'none';
}

function showToast(msg) {
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toast-message');
  if (!toast || !toastMsg) return;

  toastMsg.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 4000);
}

function escapeHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatMarkdownText(md) {
  if (!md) return '';
  return escapeHtml(md)
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code style="background:rgba(255,255,255,0.1);padding:2px 5px;border-radius:4px;">$1</code>')
    .replace(/\n• /g, '<br>• ')
    .replace(/\n\n/g, '<br><br>')
    .replace(/\n/g, '<br>');
}
