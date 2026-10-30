const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawn, exec, execSync } = require('child_process');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, 'data', 'db.json');
const UPLOADS_DIR = path.join(__dirname, 'uploads');

// Ensure directories exist
if (!fs.existsSync(path.join(__dirname, 'data'))) {
  fs.mkdirSync(path.join(__dirname, 'data'), { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Multer storage for user request uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOADS_DIR);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, 'scan_' + Date.now() + '_' + Math.round(Math.random() * 1e5) + ext);
  }
});
const upload = multer({ storage: storage, limits: { fileSize: 10 * 1024 * 1024 } });

// Middleware
app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: 'Invalid JSON payload' });
  }
  next(err);
});
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(UPLOADS_DIR));

// Database helpers
function readDB() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error('Error reading db.json:', err);
  }
  return {
    settings: {
      appName: 'Farm Pro',
      tagline: 'Smart Farming & Plant Health Assistant',
      poweredBy: 'Lavkush',
      announcement: '🌾 Welcome to Farm Pro Web Portal! AI Plant Scanner and Live Consultation now online.',
      contactPhone: '+91 6267477597',
      contactEmail: 'lavkush.farmpro@agritech.in',
      appPath: 'G:\\app_developer_sonu\\farming_app power by lavkush'
    },
    diseases: [],
    fertilizers: [],
    wateringGuide: [],
    tips: [],
    requests: []
  };
}

function writeDB(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error writing db.json:', err);
    return false;
  }
}

// Global App Launcher State
let runningAppProcess = null;
let appLogs = [
  `[${new Date().toLocaleTimeString()}] Farm Pro Web Server initialized. Ready to connect to desktop app.`
];

function addLog(msg) {
  const line = `[${new Date().toLocaleTimeString()}] ${msg}`;
  appLogs.push(line);
  if (appLogs.length > 200) appLogs.shift();
  console.log(line);
}

// Worldwide Public Link Manager
const ACTIVE_LINK_FILE = path.join(__dirname, 'active_cloudflare_link.txt');
let worldwideUrl = 'https://solutions-pda-holiday-marine.trycloudflare.com';
if (fs.existsSync(ACTIVE_LINK_FILE)) {
  try {
    const saved = fs.readFileSync(ACTIVE_LINK_FILE, 'utf-8').trim();
    if (saved.startsWith('https://')) worldwideUrl = saved;
  } catch (e) { }
}
let tunnelProcess = null;

function updateWorldwideLinks(newUrl) {
  worldwideUrl = newUrl;
  try {
    const svPath = path.join(__dirname, 'install_app.sv');
    if (fs.existsSync(svPath)) {
      let content = fs.readFileSync(svPath, 'utf-8');
      content = content.replace(/• Worldwide Public Link:.*?https:\/\/[^\r\n]+/g, `• Worldwide Public Link:👉  ${newUrl}`);
      content = content.replace(/• Permanent Worldwide:.*?https:\/\/[^\r\n]+/g, `• Worldwide Public Link:👉  ${newUrl}`);
      content = content.replace(/• Worldwide User Portal:.*?https:\/\/[^\r\n]+/g, `• Worldwide User Portal:👉 ${newUrl}/?portal=user`);
      content = content.replace(/• Worldwide Admin Link:.*?https:\/\/[^\r\n]+/g, `• Worldwide Admin Link:👉  ${newUrl}/?role=admin`);
      content = content.replace(/• Permanent Admin Link:.*?https:\/\/[^\r\n]+/g, `• Worldwide Admin Link:👉  ${newUrl}/?role=admin`);
      content = content.replace(/(WORLDWIDE LIVE LINK[\s\S]*?👉\s+)https:\/\/[^\r\n]+/g, `$1${newUrl}/?portal=user`);
      content = content.replace(/(WORLDWIDE ADMIN LINK[\s\S]*?👉\s+)https:\/\/[^\r\n]+/g, `$1${newUrl}/?role=admin`);
      fs.writeFileSync(svPath, content, 'utf-8');
    }
    const htmlPath = path.join(__dirname, 'public', 'index.html');
    if (fs.existsSync(htmlPath)) {
      let htmlContent = fs.readFileSync(htmlPath, 'utf-8');
      htmlContent = htmlContent.replace(/Worldwide:\s+https:\/\/[^\s<"']+/g, `Worldwide: ${newUrl}`);
      fs.writeFileSync(htmlPath, htmlContent, 'utf-8');
    }
    fs.writeFileSync(ACTIVE_LINK_FILE, newUrl, 'utf-8');
    console.log(`[OK] Updated install_app.sv, public/index.html & active_cloudflare_link.txt with: ${newUrl}`);
  } catch (err) {
    console.error('Error updating links:', err.message);
  }
}

// Admin Security & Tokens
const activeAdminTokens = new Set(['ADMIN_DEV_INITIAL_KEY']);
let pendingOtp = { code: null, phone: null, expiresAt: 0 };

function requireAdminAuth(req, res, next) {
  const token = req.headers['x-admin-token'] || req.query.adminToken || (req.body && req.body.adminToken);
  if (token && activeAdminTokens.has(token)) {
    return next();
  }
  return res.status(403).json({
    error: 'Access Denied: Admin authorization required. Public users do not have rights to modify website data.'
  });
}

// ---------------------------------------------------------------------
// RELIABLE WORLDWIDE TUNNEL (Cloudflare - Works on ALL Phones/PCs Worldwide)
// ---------------------------------------------------------------------
function initCloudflareTunnel() {
  const cloudflaredExe = path.join(__dirname, 'cloudflared.exe');
  if (!fs.existsSync(cloudflaredExe) || tunnelProcess) return;

  // Check if cloudflared is already actively running
  try {
    const running = execSync('tasklist /FI "IMAGENAME eq cloudflared.exe"', { encoding: 'utf-8' });
    if (running && running.toLowerCase().includes('cloudflared.exe')) {
      console.log(`[INFO] Active cloudflared tunnel detected. Serving URL: ${worldwideUrl}`);
      updateWorldwideLinks(worldwideUrl);
      return;
    }
  } catch (e) {}

  try {
    tunnelProcess = spawn(cloudflaredExe, ['tunnel', '--url', `http://localhost:${PORT}`], {
      stdio: ['ignore', 'pipe', 'pipe']
    });

    const handleTunnelOutput = (data) => {
      const text = data.toString();
      const match = text.match(/https:\/\/[a-zA-Z0-9-]+\.trycloudflare\.com/);
      if (match) {
        worldwideUrl = match[0];
        console.log(`=======================================================`);
        console.log(`🌍 LIVE WORLDWIDE PUBLIC LINK (LOGIN WORKS ON ANY DEVICE):`);
        console.log(`🌍 Main Site:    ${worldwideUrl}`);
        console.log(`👤 User Portal:  ${worldwideUrl}/?portal=user`);
        console.log(`👑 Admin Portal: ${worldwideUrl}/?role=admin`);
        console.log(`=======================================================`);
        addLog(`Worldwide Public Link Active: ${worldwideUrl}`);
        updateWorldwideLinks(worldwideUrl);
      }
    };

    tunnelProcess.stdout.on('data', handleTunnelOutput);
    tunnelProcess.stderr.on('data', handleTunnelOutput);

    tunnelProcess.on('exit', (code) => {
      console.log(`Cloudflare tunnel process exited (code: ${code}). Reconnecting in 5s...`);
      tunnelProcess = null;
      setTimeout(() => {
        if (!tunnelProcess) initCloudflareTunnel();
      }, 5000);
    });
  } catch (e) {
    console.log('Tunnel init notice:', e.message);
  }
}

process.on('uncaughtException', (err) => {
  console.error('[Process UncaughtException]', err.message);
});
process.on('unhandledRejection', (reason) => {
  console.error('[Process UnhandledRejection]', reason);
});

// ---------------------------------------------------------------------
// 1. NETWORK INFO API (Localhost, User Link, Wi-Fi LAN & Worldwide URLs)
// ---------------------------------------------------------------------
app.get('/api/network-info', (req, res) => {
  const db = readDB();
  const phone = db.settings.adminMobile || '+91 98765 43210';
  const masked = phone.replace(/^(\+?\d{2})\d{5}(\d{3})$/, '$1*****$2');

  const interfaces = os.networkInterfaces();
  const addresses = [];

  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        addresses.push({
          interface: name,
          ip: iface.address,
          url: `http://${iface.address}:${PORT}`
        });
      }
    }
  }

  res.json({
    port: PORT,
    localhost: `http://localhost:${PORT}`,
    userUrl: `http://localhost:${PORT}/?portal=user`,
    adminUrl: `http://localhost:${PORT}/?role=admin`,
    userWorldwideUrl: `${worldwideUrl}/?portal=user`,
    adminWorldwideUrl: `${worldwideUrl}/?role=admin`,
    worldwideUrl: worldwideUrl,
    officialUrl: worldwideUrl,
    cloudflaredActiveUrl: worldwideUrl,
    networkAddresses: addresses,
    maskedPhone: masked,
    hostname: os.hostname(),
    platform: os.platform()
  });
});

function maskPhone(phone) {
  if (!phone) return '+91 89*****823';
  const clean = phone.replace(/\s+/g, '');
  if (clean.length > 7) {
    const prefix = clean.substring(0, clean.length - 7);
    const suffix = clean.substring(clean.length - 3);
    return `${prefix}****${suffix}`;
  }
  return phone;
}

// ---------------------------------------------------------------------
// 2. ADMIN AUTHENTICATION, PASSWORD CHANGE & MOBILE OTP BACKUP
// ---------------------------------------------------------------------
app.post('/api/admin/login', (req, res) => {
  const db = readDB();
  const inputPass = (req.body.password || '').trim();
  const currentPass = db.settings.adminPassword || 'admin123';
  const phone = db.settings.adminMobile || '+91 8989588823';
  const masked = maskPhone(phone);

  if (inputPass === currentPass) {
    const token = 'ADMIN_' + Date.now() + '_' + Math.random().toString(36).substring(2);
    activeAdminTokens.add(token);
    addLog(`Admin authenticated successfully with password.`);
    return res.json({
      success: true,
      token: token,
      message: 'Admin access granted.',
      adminMobile: phone
    });
  }

  // Wrong password
  addLog(`Admin login attempt failed: Incorrect password.`);
  return res.status(401).json({
    success: false,
    error: 'Incorrect Password!',
    canRecoverOtp: true,
    maskedPhone: masked,
    message: 'Incorrect password. You can authenticate via OTP sent to registered mobile.'
  });
});

// Send OTP to registered Admin mobile
app.post('/api/admin/send-otp', (req, res) => {
  const db = readDB();
  const phone = db.settings.adminMobile || '+91 8989588823';
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  pendingOtp = {
    code: otp,
    phone: phone,
    expiresAt: Date.now() + 5 * 60 * 1000 // 5 minutes
  };

  const masked = maskPhone(phone);
  const logMsg = `[MOBILE OTP AUTHENTICATION] 6-Digit OTP: [${otp}] sent to registered mobile: ${phone}`;
  addLog(logMsg);
  console.log(`\n=======================================================\n🔐 ${logMsg}\n=======================================================\n`);

  res.json({
    success: true,
    message: `6-Digit OTP dispatched to registered mobile (${masked}).`,
    maskedPhone: masked,
    demoOtp: otp
  });
});

// Verify OTP
app.post('/api/admin/verify-otp', (req, res) => {
  const inputOtp = (req.body.otp || '').trim();
  if (!pendingOtp.code || Date.now() > pendingOtp.expiresAt) {
    return res.status(400).json({ success: false, error: 'OTP expired or not requested. Please request a new OTP.' });
  }

  if (inputOtp === pendingOtp.code) {
    pendingOtp = { code: null, phone: null, expiresAt: 0 };
    const token = 'ADMIN_OTP_' + Date.now() + '_' + Math.random().toString(36).substring(2);
    activeAdminTokens.add(token);
    addLog(`Admin authenticated successfully via Mobile OTP backup.`);
    return res.json({
      success: true,
      token: token,
      message: 'Mobile OTP verified! Admin unlocked. You can now reset your password.',
      promptPasswordReset: true
    });
  }

  return res.status(400).json({ success: false, error: 'Incorrect OTP. Please check the SMS and re-enter.' });
});

// Change Admin Password (via current password or OTP backup)
app.post('/api/admin/change-password', (req, res) => {
  const token = req.headers['x-admin-token'] || req.body.token;
  const { currentPassword, newPassword, adminMobile, otp } = req.body;
  const db = readDB();
  const currentPass = db.settings.adminPassword || 'admin123';
  const phone = db.settings.adminMobile || '+91 8989588823';
  const masked = maskPhone(phone);

  const isTokenValid = Boolean(token && activeAdminTokens.has(token));
  const isPassValid = Boolean(currentPassword && currentPassword.trim() === currentPass.trim());
  const isOtpValid = Boolean(otp && pendingOtp.code && otp.trim() === pendingOtp.code && Date.now() <= pendingOtp.expiresAt);

  if (!isTokenValid && !isPassValid && !isOtpValid) {
    addLog(`Admin change password failed: Incorrect current password.`);
    return res.status(401).json({
      success: false,
      error: 'Incorrect current password! Default password is admin123.',
      canRecoverOtp: true,
      maskedPhone: masked,
      message: 'Current password was incorrect. You can authenticate and set your new password via Mobile OTP backup.'
    });
  }

  if (!newPassword || newPassword.trim().length < 4) {
    return res.status(400).json({ error: 'New password must be at least 4 characters.' });
  }

  if (isOtpValid) {
    pendingOtp = { code: null, phone: null, expiresAt: 0 };
  }

  db.settings.adminPassword = newPassword.trim();
  if (adminMobile && adminMobile.trim()) {
    db.settings.adminMobile = adminMobile.trim();
  }
  writeDB(db);

  const newToken = 'ADMIN_' + Date.now() + '_' + Math.random().toString(36).substring(2);
  activeAdminTokens.add(newToken);

  addLog(`Admin password updated successfully to new password.`);
  res.json({
    success: true,
    token: newToken,
    message: 'Admin password changed successfully! Remember your new password.'
  });
});

// ---------------------------------------------------------------------
// 3. SETTINGS API
// ---------------------------------------------------------------------
app.get('/api/settings', (req, res) => {
  const db = readDB();
  // Don't leak plain password in public settings
  const safeSettings = { ...db.settings };
  delete safeSettings.adminPassword;
  res.json(safeSettings || {});
});

// Admin updates settings (Admin rights)
app.put('/api/settings', requireAdminAuth, (req, res) => {
  const db = readDB();
  db.settings = { ...db.settings, ...req.body };
  writeDB(db);
  addLog(`Admin updated system settings: ${JSON.stringify(req.body)}`);
  res.json({ success: true, settings: db.settings });
});

// ---------------------------------------------------------------------
// 3. PLANT DISEASES & CURES API (Admin has full CRUD, User reads)
// ---------------------------------------------------------------------
app.get('/api/plants', (req, res) => {
  const db = readDB();
  res.json({
    diseases: db.diseases || [],
    fertilizers: db.fertilizers || [],
    wateringGuide: db.wateringGuide || [],
    tips: db.tips || []
  });
});

// Admin Add Disease
app.post('/api/plants/diseases', requireAdminAuth, (req, res) => {
  const db = readDB();
  const newDisease = {
    id: req.body.id || 'disease_' + Date.now(),
    name: req.body.name || 'Unnamed Disease',
    severity: req.body.severity || 'Medium',
    symptoms: Array.isArray(req.body.symptoms) ? req.body.symptoms : (req.body.symptoms || '').split('\n').filter(Boolean),
    causes: req.body.causes || 'Unknown cause',
    cure: Array.isArray(req.body.cure) ? req.body.cure : (req.body.cure || '').split('\n').filter(Boolean),
    prevention: Array.isArray(req.body.prevention) ? req.body.prevention : (req.body.prevention || '').split('\n').filter(Boolean),
    icon: req.body.icon || 'leaf',
    color: req.body.color || '#10b981'
  };

  db.diseases.unshift(newDisease);
  writeDB(db);
  addLog(`Admin added new disease: ${newDisease.name}`);
  res.json({ success: true, disease: newDisease });
});

// Admin Edit Disease
app.put('/api/plants/diseases/:id', requireAdminAuth, (req, res) => {
  const db = readDB();
  const id = req.params.id;
  const index = db.diseases.findIndex(d => d.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Disease not found' });
  }

  const updated = {
    ...db.diseases[index],
    ...req.body,
    symptoms: Array.isArray(req.body.symptoms) ? req.body.symptoms : (req.body.symptoms || '').split('\n').filter(Boolean),
    cure: Array.isArray(req.body.cure) ? req.body.cure : (req.body.cure || '').split('\n').filter(Boolean),
    prevention: Array.isArray(req.body.prevention) ? req.body.prevention : (req.body.prevention || '').split('\n').filter(Boolean)
  };

  db.diseases[index] = updated;
  writeDB(db);
  addLog(`Admin updated disease: ${updated.name}`);
  res.json({ success: true, disease: updated });
});

// Admin Delete Disease
app.delete('/api/plants/diseases/:id', requireAdminAuth, (req, res) => {
  const db = readDB();
  const id = req.params.id;
  const index = db.diseases.findIndex(d => d.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Disease not found' });
  }

  const removed = db.diseases.splice(index, 1)[0];
  writeDB(db);
  addLog(`Admin deleted disease: ${removed.name}`);
  res.json({ success: true, removed });
});

// ---------------------------------------------------------------------
// 4. USER REQUESTS & ADMIN TRIAGE
// ---------------------------------------------------------------------
app.get('/api/requests', (req, res) => {
  const db = readDB();
  res.json(db.requests || []);
});

// User Submits Request
app.post('/api/requests', upload.single('photo'), (req, res) => {
  const db = readDB();
  let imagePath = '';

  if (req.file) {
    imagePath = '/uploads/' + req.file.filename;
  } else if (req.body.imageUrl) {
    imagePath = req.body.imageUrl;
  }

  const reqId = 'REQ-' + new Date().getFullYear() + '-' + Math.floor(100 + Math.random() * 900);
  const now = new Date();
  const formattedDate = now.toLocaleDateString() + ' ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Auto AI Triage
  let aiTriageNote = '';
  const symptomsText = (req.body.symptoms || '').toLowerCase();
  let matchedDisease = db.diseases.find(d =>
    d.name.toLowerCase().includes(symptomsText) ||
    (d.symptoms && d.symptoms.some(s => symptomsText.includes(s.toLowerCase().slice(0, 10))))
  );

  if (matchedDisease) {
    aiTriageNote = `AI Auto-Screening: Potential match with ${matchedDisease.name}. Recommended preliminary check.`;
  }

  const newRequest = {
    id: reqId,
    farmerName: req.body.farmerName || 'Anonymous Farmer',
    phone: req.body.phone || 'Not provided',
    crop: req.body.crop || 'General Crop',
    variety: req.body.variety || 'Standard',
    urgency: req.body.urgency || 'Medium',
    symptoms: req.body.symptoms || '',
    status: 'Pending',
    submittedAt: formattedDate,
    image: imagePath,
    adminDiagnosis: '',
    adminRemedy: matchedDisease ? `Preliminary: ${matchedDisease.cure[0] || 'Awaiting Specialist Review'}` : '',
    assignedBy: '',
    aiTriageNote: aiTriageNote
  };

  db.requests.unshift(newRequest);
  writeDB(db);
  addLog(`New User Request submitted: [${reqId}] from ${newRequest.farmerName} (${newRequest.crop})`);
  res.status(201).json({ success: true, request: newRequest });
});

// Admin Updates Request (Admin writes diagnosis, changes status, adds remedies)
app.put('/api/requests/:id', requireAdminAuth, (req, res) => {
  const db = readDB();
  const id = req.params.id;
  const index = db.requests.findIndex(r => r.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Request not found' });
  }

  const updated = {
    ...db.requests[index],
    status: req.body.status || db.requests[index].status,
    adminDiagnosis: req.body.adminDiagnosis !== undefined ? req.body.adminDiagnosis : db.requests[index].adminDiagnosis,
    adminRemedy: req.body.adminRemedy !== undefined ? req.body.adminRemedy : db.requests[index].adminRemedy,
    assignedBy: req.body.assignedBy || 'Chief Agri Specialist',
    updatedAt: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };

  db.requests[index] = updated;
  writeDB(db);
  addLog(`Admin updated Request [${id}] - Status: ${updated.status}`);
  res.json({ success: true, request: updated });
});

// Admin Deletes Request
app.delete('/api/requests/:id', requireAdminAuth, (req, res) => {
  const db = readDB();
  const id = req.params.id;
  const index = db.requests.findIndex(r => r.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Request not found' });
  }

  const removed = db.requests.splice(index, 1)[0];
  writeDB(db);
  addLog(`Admin deleted Request [${id}]`);
  res.json({ success: true, removed });
});

// ---------------------------------------------------------------------
// 5. INSTANT AI PLANT SCANNER DIAGNOSTIC API
// ---------------------------------------------------------------------
// 5. INSTANT AI PLANT SCANNER DIAGNOSTIC API
// ---------------------------------------------------------------------
app.post('/api/diagnose', upload.single('scanImage'), (req, res) => {
  const db = readDB();
  const cropType = req.body.crop || 'Plant';
  const customSymptoms = (req.body.symptoms || '').toLowerCase();

  // Pick or calculate diagnosis
  let candidates = db.diseases;
  let selected = candidates[0];

  if (customSymptoms) {
    const match = candidates.find(c =>
      c.name.toLowerCase().includes(customSymptoms) ||
      c.symptoms.some(s => s.toLowerCase().includes(customSymptoms))
    );
    if (match) selected = match;
  } else {
    // Select based on crop or random candidate
    const seed = Math.floor(Math.random() * candidates.length);
    selected = candidates[seed] || candidates[0];
  }

  const confidence = (89 + Math.random() * 9.8).toFixed(1);
  const chlorophyllIndex = (72 + Math.random() * 24).toFixed(1);
  const moistureLevel = (60 + Math.random() * 25).toFixed(0);

  let imagePath = '/images/sample_tomato_blight.jpg';
  if (req.file) {
    imagePath = '/uploads/' + req.file.filename;
  } else if (req.body.imageUrl) {
    imagePath = req.body.imageUrl;
  }

  const defaultOrganic = [
    "Sour Buttermilk Spray (खट्टी छाछ): Mix 50ml fermented sour buttermilk (kept 4 days in copper vessel) in 1L water; spray weekly. Natural lactic acid arrests fungal mycelium.",
    "Cold-Pressed Neem Oil (5ml/L) emulsified with 2ml organic liquid soap; spray every 5-7 days in late evening.",
    "Root zone drench with Trichoderma harzianum bio-fungicide (5g/L) to prevent soil-borne spore progression.",
    "Organic Soil Booster: Mix 250g Vermicompost + 50g Neem cake powder at base to build natural systemic resistance."
  ];

  const defaultPlantCare = [
    "Sanitary Pruning: Prune infected bottom 6 inches of leaves to break fungal splash cycle.",
    "Irrigate strictly at root level early morning; avoid wetting foliage overhead.",
    "Apply 2-3 inch dry straw or biomass mulch over soil to prevent spore splash during rainfall."
  ];

  const result = {
    scanId: 'SCAN-' + Date.now().toString().slice(-6),
    crop: cropType,
    diseaseName: selected ? selected.name : 'Early Blight',
    severity: selected ? selected.severity : 'High',
    confidenceScore: confidence + '%',
    chlorophyllIndex: chlorophyllIndex + ' SPAD',
    soilMoistureEst: moistureLevel + '%',
    causes: selected ? selected.causes : 'Pathogenic fungal spore development',
    symptoms: selected ? selected.symptoms : ['Leaf spots', 'Yellow halos'],
    cure: selected ? selected.cure : ['Apply copper fungicide 2g/L'],
    organicRemedies: (selected && selected.organicRemedies && selected.organicRemedies.length > 0) ? selected.organicRemedies : defaultOrganic,
    plantCareSuggestions: (selected && selected.plantCareSuggestions && selected.plantCareSuggestions.length > 0) ? selected.plantCareSuggestions : defaultPlantCare,
    prevention: selected ? selected.prevention : ['Crop rotation'],
    image: imagePath,
    timestamp: new Date().toLocaleString()
  };

  addLog(`AI Scanner analyzed ${cropType}: Detected ${result.diseaseName} (${result.confidenceScore} confidence) - Organic remedies attached.`);
  res.json({ success: true, result });
});

// ---------------------------------------------------------------------
// 6. CHATL AI ASSISTANT API (Trained Organic Plant Doctor Powered by Lavkush)
// ---------------------------------------------------------------------
app.post('/api/chat', (req, res) => {
  const rawMsg = (req.body.message || '').trim();
  const message = rawMsg.toLowerCase();
  const persona = (req.body.persona || 'chatl').toLowerCase();
  const lang = (req.body.lang || 'en').toLowerCase();
  const isHindi = lang === 'hi' || /[\u0900-\u097F]/.test(rawMsg) ||
    message.includes('kare') || message.includes('kya') || message.includes('kese') ||
    message.includes('kaise') || message.includes('batao') || message.includes('chahiye');
  const db = readDB();

  let response = '';

  if (!message) {
    if (persona === 'chatvlsi') {
      return res.json({ reply: isHindi ? 'नमस्ते! मैं **चैटवीएलएसआई 1.2** हूँ, लवकुश द्वारा संचालित हार्डवेयर और वेरिलॉग आरटीएल कोपायलट। मैं आपकी क्या सहायता कर सकता हूँ?' : 'Hello! I am **ChatVLSI 1.2**, your semiconductor hardware and RTL synthesis assistant powered by Lavkush. What Verilog/ASIC design can I assist with?' });
    }
    return res.json({ reply: isHindi ? 'नमस्ते! 🌿 मैं **चैटएल एआई (ChatL)** हूँ, लवकुश द्वारा प्रशिक्षित 100% जैविक एवं प्राकृतिक पादप स्वास्थ्य विशेषज्ञ। आज आपकी फसल या पौधे की क्या सहायता कर सकता हूँ?' : 'Namaste! 🌿 I am **ChatL AI**, your specialized Organic Plant Health & Farming Doctor trained by Lavkush. How may I naturally care for your crops and plants today?' });
  }

  // Persona 1: ChatVLSI 1.2 (Hardware & RTL Verilog)
  if (persona === 'chatvlsi') {
    if (message.includes('hello') || message.includes('hi')) {
      response = `⚡ **ChatVLSI 1.2 - Pro Hardware & RTL Engine** (Powered by Lavkush):
I specialize in:
• **Verilog / SystemVerilog RTL**: FSM design, pipelined ALUs, counters, shift registers.
• **Static Timing Analysis (STA)**: Setup time ($T_{cq} + T_{comb} \\le T_{clk} - T_{setup}$), hold slack, clock skew, jitter.
• **Clock Domain Crossing (CDC)**: Dual-flop synchronizers, Gray code pointers, asynchronous FIFO.
• **FPGA & ASIC Synthesis**: Resource mapping, LUT reduction, timing closure.

What circuit architecture would you like to build or verify?`;
    } else if (message.includes('fifo') || message.includes('async')) {
      response = `⚙️ **Asynchronous FIFO Architecture (ChatVLSI 1.2)**:
• **Clock Domains**: Separate Write Clock (\`wr_clk\`) and Read Clock (\`rd_clk\`).
• **Pointer Synchronization**: Convert binary write/read pointers to Gray code before passing through 2-stage DFF synchronizers to eliminate metastability.
• **Full / Empty Detection**:
  - Empty: \`rd_ptr_gray == wr_ptr_gray_sync\`
  - Full: MSB inverted, second MSB inverted, remaining bits identical.`;
    } else if (message.includes('timing') || message.includes('setup') || message.includes('hold')) {
      response = `⏱️ **Static Timing Analysis (STA) Cheat Sheet**:
• **Setup Constraint**: $T_{clk} \\ge T_{cq} + T_{comb\\_max} + T_{setup} - T_{skew}$
• **Setup Slack**: $T_{required} - T_{arrival}$. If negative $\\rightarrow$ Setup violation! Fix by pipelining or logic restructuring.
• **Hold Constraint**: $T_{cq} + T_{comb\\_min} \\ge T_{hold} + T_{skew}$
• **Hold Slack**: $T_{arrival} - T_{required}$. Fix by inserting delay buffers on data path. (Clock frequency change does NOT fix hold violations!).`;
    } else if (message.includes('fsm') || message.includes('state machine')) {
      response = `📐 **Verilog FSM Best Practice (3-Always Block Architecture)**:
\`\`\`verilog
module fsm (input clk, rst_n, req, output reg ack);
  typedef enum logic [1:0] {IDLE, READ, DONE} state_t;
  state_t current_state, next_state;

  // 1. Sequential State Register
  always @(posedge clk or negedge rst_n)
    if (!rst_n) current_state <= IDLE;
    else current_state <= next_state;

  // 2. Combinational Next-State Logic
  always @(*) begin
    next_state = current_state;
    case (current_state)
      IDLE: if (req) next_state = READ;
      READ: next_state = DONE;
      DONE: next_state = IDLE;
    endcase
  end

  // 3. Registered Output Logic
  always @(posedge clk or negedge rst_n)
    if (!rst_n) ack <= 1'b0;
    else ack <= (next_state == DONE);
endmodule
\`\`\``;
    } else {
      response = `⚡ **ChatVLSI 1.2 Response**:
Regarding "${rawMsg.slice(0, 50)}":
• Designed for zero-defect synthesis and timing closure.
• Ensure proper reset polarity (\`rst_n\` active low) and avoid combinational feedback loops (unintentional latches).
• Would you like full synthesizable Verilog code or testbench simulation stimuli?`;
    }
    return res.json({ reply: response });
  }

  // Persona 2: ChatL 1.2 - TRAINED ORGANIC PLANT DOCTOR & NATURAL FARMING EXPERT
  if (isHindi) {
    if (message.includes('hello') || message.includes('hi') || message.includes('namaste') || message.includes('नमस्ते') || message.includes('प्रणाम')) {
      response = `नमस्ते! 🌿 मैं **चैटएल एआई (ChatL)** हूँ - लवकुश द्वारा विशेष रूप से प्रशिक्षित **100% जैविक एवं प्राकृतिक पादप स्वास्थ्य चिकित्सक (Organic Plant Doctor)**।

मैं आपकी फसलों, सब्जियों, फलों एवं बगीचे को बिना किसी रासायनिक जहर के, शुद्ध प्राकृतिक एवं जैविक पद्धतियों से स्वस्थ रखने में प्रशिक्षित हूँ:
• **🌱 100% जैविक काढ़े व घोल**: खट्टी छाछ + तांबा स्प्रे, शुद्ध नीम तेल, जीवामृत, पंचगव्य, बीजामृत, दशपर्णी अर्क, ट्राइकोडर्मा।
• **🐛 प्राकृतिक कीट नियंत्रण**: माहू, सफेद मक्खी, थ्रिप्स, मरोड़िया, इल्ली, तना छेदक के लिए नीमस्त्र, अग्न्यास्त्र, ब्रह्मास्त्र और पीले ट्रैप।
• **🍂 रोग निदान व घरेलू उपचार**: पत्ती झुलसा (Blight), पाउडरी मिल्ड्यू, जड़ गलन, उकठा (Wilt), रतुआ (Rust) के अचूक जैविक उपचार।
• **🧪 रासायनिक खाद (NPK/यूरिया) के जैविक विकल्प**: वर्मीकम्पोस्ट, सरसों खली की चाय, लकड़ी की राख (पोटाश), स्टीम्ड बोन मील।
• **🌾 सभी प्रमुख फसलों का जैविक प्रबंधन**: टमाटर, गेहूं, धान, कपास, मिर्च, आलू, प्याज, लहसुन, सरसों, मक्का, आम, नींबू आदि।

आज आपकी फसल, पौधे या रोग के संबंध में मैं क्या जैविक परामर्श दे सकता हूँ?`;

      // 1. Organic Scan Follow-up & Preparation Recipe
    } else if (message.includes('recipe') || message.includes('विधि') || message.includes('तैयार') || message.includes('बनाएं') || message.includes('organic recipe') || message.includes('जैविक उपचार विधि')) {
      if (message.includes('blight') || message.includes('झुलसा')) {
        response = `🌿 **पत्ती झुलसा (Leaf Blight) के लिए 100% जैविक काढ़ा बनाने की विधि**:
1. **तांबे व खट्टी छाछ का एंटी-फंगल स्प्रे**:
   • **सामग्री**: 5 लीटर पुरानी खट्टी छाछ (मट्ठा) + तांबे का टुकड़ा/तार + 100 लीटर पानी।
   • **विधि**: छाछ में 4-5 दिन तक तांबे का टुकड़ा डुबोकर छाया में रखें जब तक हल्का हरापन न आ जाए। तांबा और लैक्टिक एसिड मिलकर शक्तिशाली प्राकृतिक फफूंदनाशक बनाते हैं।
   • **छिड़काव**: 50 मिली छाछ प्रति 1 लीटर पानी में मिलाकर शाम के समय पत्तियों पर अच्छी तरह छिड़कें।
2. **नीम तेल सुरक्षा कवच**:
   • 5 मिली कोल्ड-प्रेस्ड नीम तेल + 2 मिली हर्बल तरल साबुन प्रति लीटर पानी में मिलाकर हर 7 दिन में छिड़कें।
3. **मिट्टी शोधन**: 5 ग्राम ट्राइकोडर्मा विरिडी प्रति लीटर पानी से जड़ों के पास मिट्टी को नम करें।
4. **पादप देखभाल**: निचली 6 इंच की रोगी पत्तियों को काटकर खेत से दूर नष्ट करें और केवल जड़ों में सुबह पानी दें।`;
      } else if (message.includes('powdery') || message.includes('mildew') || message.includes('पाउडरी') || message.includes('चूर्णिल')) {
        response = `🌿 **पाउडरी मिल्ड्यू (चूर्णिल आसिता) का 100% जैविक उपचार एवं विधि**:
1. **मीठा सोडा (बेकिंग सोडा) व नीम तेल घोल**:
   • **सामग्री**: 5 ग्राम बेकिंग सोडा (मीठा सोडा) + 5 मिली नीम का तेल + 1 लीटर ताजा पानी।
   • **विधि**: बेकिंग सोडा फफूंद की बाहरी परत को सुखा देता है और नीम का तेल नए बीजाणुओं को पनपने नहीं देता।
   • **छिड़काव**: सुबह के समय धूप निकलने से पहले पत्तियों की दोनों तरफ छिड़कें।
2. **कच्चे दूध का प्राकृतिक स्प्रे**:
   • 1 भाग कच्चा गाय का दूध + 9 भाग पानी। सूर्य की किरणों के संपर्क में आकर दूध का लैक्टोफेरिन प्रोटीन फफूंद को समाप्त करता है।
3. **लकड़ी की छानी हुई राख**:
   • सुबह ओस के समय पत्तियों पर हल्की लकड़ी की राख भुरकें।
4. **पादप देखभाल**: पौधे को 6 घंटे की सीधी धूप दिलाएं और बीच की घनी पत्तियों को छांटें।`;
      } else if (message.includes('aphid') || message.includes('माहू') || message.includes('चेपा') || message.includes('pest') || message.includes('कीट')) {
        response = `🐛 **माहू (Aphids) और रस चूसक कीटों के लिए जैविक नीमस्त्र व तीखा अर्क विधि**:
1. **नीमस्त्र (Neemastra) बनाने की विधि**:
   • **सामग्री**: 5 किलो नीम की पत्तियां/निबोली + 5 लीटर देसी गोमूत्र + 2 किलो ताजा गोबर + 100 लीटर पानी।
   • **तैयारी**: 48 घंटे छाया में रखें, दिन में दो बार डंडे से हिलाएं। छानकर बिना पानी मिलाए 1 एकड़ में छिड़कें।
2. **लहसुन-मिर्च तीखा अर्क (अग्न्यास्त्र)**:
   • 50 ग्राम तीखी हरी मिर्च + 50 ग्राम लहसुन पीसकर 1 लीटर पानी में 15 मिनट उबालें। 10 गुना पानी में मिलाकर पत्तियों की निचली सतह पर स्प्रे करें।
3. **पीले चिपचिपे कार्ड (Yellow Sticky Traps)**:
   • खेत में 10 ट्रैप प्रति एकड़ लगाएं; रस चूसक कीट स्वतः चिपककर समाप्त हो जाएंगे।`;
      } else if (message.includes('root rot') || message.includes('जड़') || message.includes('गलन')) {
        response = `🌱 **जड़ गलन (Root Rot) का जैविक उपचार एवं ट्राइकोडर्मा संवर्धन विधि**:
1. **ट्राइकोडर्मा संवर्धन विधि**:
   • 1 किलो ट्राइकोडर्मा विरिडी को 50 किलो नमीयुक्त गोबर की सड़ी खाद या वर्मीकम्पोस्ट में मिलाएं।
   • 7 दिन तक बोरी से ढककर छाया में रखें ताकि सफेद फफूंद (मित्र कवक) फैल जाए।
   • इस खाद को पौधों की जड़ों के पास 100-200 ग्राम प्रति पौधा मिट्टी में मिलाएं।
2. **गोमूत्र व हल्दी शोधन**:
   • 100 मिली देसी गोमूत्र + 10 ग्राम शुद्ध हल्दी 2 लीटर पानी में घोलकर प्रभावित पौधे की जड़ों में डालें।
3. **सिंचाई सावधानी**: तुरंत पानी देना बंद करें जब तक ऊपर की 2 इंच मिट्टी पूरी तरह सूख न जाए।`;
      } else {
        response = `🥣 **100% जैविक अमृत संजीवनी खाद व घोल बनाने की सामान्य विधि**:
1. **तरल जीवामृत**: 10 किलो गाय का गोबर + 10 लीटर गोमूत्र + 2 किलो गुड़ + 2 किलो बेसन + मुट्ठी भर उपजाऊ मिट्टी को 200 लीटर पानी में 5 दिन किण्वित करें।
2. **उपयोग**: 10% घोल बनाकर पौधों की पत्तियों पर छिड़कें या सिंचाई के साथ बहाएं।
3. **कीट-रोग रक्षक**: 5 मिली नीम तेल + खट्टी छाछ का नियमित स्प्रे करने से फसल 100% रसायन मुक्त और सुरक्षित रहती है!`;
      }

      // 1.5 Direct Disease, Crop & Organic Inquiries in Hindi
    } else if (message.includes('blight') || message.includes('झुलसा') || message.includes('धब्बे') || message.includes('धब्बा')) {
      response = `🌿 **पत्ती झुलसा रोग (Leaf Blight) - 100% जैविक उपचार**:
• **पहचान**: पत्तियों पर पीले छल्ले के साथ बादामी या काले गोल धब्बे, निचली पत्तियों का सूखना।
• **जैविक घोल 1**: 50 मिली खट्टी छाछ (तांबे के बर्तन में रखी हुई) प्रति 1 लीटर पानी में मिलाकर हर 5वें दिन पत्तियों पर छिड़कें।
• **जैविक घोल 2**: 5 मिली नीम का तेल + हल्का साबुन घोल प्रति लीटर पानी में मिलाकर छिड़कें।
• **जड़ उपचार**: 5 ग्राम ट्राइकोडर्मा हार्वियानम प्रति लीटर पानी की दर से जड़ों की मिट्टी में डालें।
• **पादप सलाह**: निचली ग्रसित पत्तियों को तुरंत काटकर खेत से बाहर जमीन में दबा दें।`;

    } else if (message.includes('powdery') || message.includes('पाउडरी') || message.includes('चूर्णिल')) {
      response = `🌿 **पाउडरी मिल्ड्यू (चूर्णिल फफूंद) - 100% जैविक उपचार**:
• **पहचान**: पत्तियों की ऊपरी सतह पर सफेद आटे जैसा चूर्ण जमना।
• **जैविक स्प्रे**: 5 ग्राम मीठा सोडा (Baking Soda) + 5 मिली नीम तेल प्रति लीटर पानी में घोलकर छिड़कें।
• **घरेलू दूध स्प्रे**: 100 मिली कच्चा दूध 900 मिली पानी में मिलाकर तेज धूप के समय छिड़कें।
• **राख का भुरकाव**: सुबह ओस में छानी हुई लकड़ी की राख पत्तियों पर छिड़कें।
• **सलाह**: पौधे को भरपूर धूप में रखें और हवा का आवागमन सुनिश्चित करें।`;

    } else if (message.includes('root rot') || message.includes('जड़') || message.includes('गलन') || message.includes('wilt') || message.includes('उकठा')) {
      response = `🌱 **जड़ गलन एवं उकठा रोग (Root Rot & Wilt) - 100% जैविक उपचार**:
• **कारण**: अत्यधिक जलभराव एवं मिट्टी-जनित हानिकारक फफूंद।
• **जैविक फफूंदनाशक**: ट्राइकोडर्मा विरिडी 10 ग्राम प्रति पौधा सड़ी गोबर खाद में मिलाकर जड़ों के पास डालें।
• **गोमूत्र व हल्दी**: 100 मिली गोमूत्र + 10 ग्राम हल्दी 2 लीटर पानी में घोलकर जड़ों में सींचें।
• **सलाह**: तुरंत सिंचाई बंद करें, मिट्टी की गुड़ाई करें ताकि जड़ों को ऑक्सीजन मिले।`;

    } else if (message.includes('aphid') || message.includes('माहू') || message.includes('चेपा') || message.includes('सफेद मक्खी') || message.includes('whitefly') || message.includes('thrips') || message.includes('थ्रिप्स')) {
      response = `🐛 **माहू, थ्रिप्स एवं सफेद मक्खी - 100% जैविक नियंत्रण**:
• **नीम का तेल**: 5 मिली प्रति लीटर पानी में मिलाकर पत्तियों के नीचे छिड़कें जहां कीट छिपे होते हैं।
• **तीखा काढ़ा (अग्न्यास्त्र)**: लहसुन और तीखी हरी मिर्च का काढ़ा 1:10 अनुपात में शाम को छिड़कें।
• **पीले व नीले चिपचिपे कार्ड**: 10 Yellow व 5 Blue Sticky Traps प्रति एकड़ लगाएं।
• **मित्र कीट**: लेडीबर्ड भृंग (Ladybird Beetle) को कभी न मारें, एक भृंग प्रतिदिन 50 माहू खा जाता है!`;

    } else if (message.includes('tomato') || message.includes('टमाटर')) {
      response = `🍅 **टमाटर की फसल का 100% जैविक प्रबंधन**:
• **झुलसा रोग से बचाव**: तांबे में रखी खट्टी छाछ (50ml/L) का हर 10 दिन में छिड़कें।
• **पत्ती मरोड़ (Leaf Curl)**: सफेद मक्खी को रोकने के लिए नीम तेल (5ml/L) और पीले कार्ड लगाएं।
• **फल छेदक सुंडी**: ब्रह्मास्त्र या 5% नीम बीज अर्क (NSKE) का छिड़काव करें।
• **टमाटर का फटना व काला पड़ना**: चूने का निथरा हुआ पानी (0.5%) या राख का पानी छिड़कें जो प्राकृतिक कैल्शियम प्रदान करता है।`;

    } else if (message.includes('fertilizer') || message.includes('खाद') || message.includes('npk') || message.includes('urea') || message.includes('dap')) {
      response = `🧪 **प्राकृतिक एवं जैविक पोषण (Natural NPK Alternatives)**:
• **नाइट्रोजन का जैविक विकल्प**: वर्मीकम्पोस्ट (केंचुआ खाद), जीवामृत और सरसों की खली की चाय।
• **फास्फोरस का जैविक विकल्प**: स्टीम्ड बोन मील, रॉक फास्फेट + पीएसबी (PSB) बैक्टीरिया कल्चर।
• **पोटाश का जैविक विकल्प**: लकड़ी की छानी हुई राख (5-7% पोटाश) और केले के छिलकों का किण्वित तरल अर्क।`;

    } else if (message.includes('organic') || message.includes('जैविक') || message.includes('प्राकृतिक') || message.includes('natural')) {
      response = `🌱 **100% जैविक खेती एवं पादप सुरक्षा मार्गदर्शिका (लवकुश द्वारा प्रमाणित)**:
1. **मिट्टी का जैविक पोषण**: हर मौसम में 2-3 टन वर्मीकम्पोस्ट (केंचुआ खाद) + 100 किग्रा नीम की खली प्रति एकड़ डालें।
2. **बीज शोधन**: बीजों को बीजामृत या ट्राइकोडर्मा (5 ग्राम/किग्रा बीज) से उपचारित करके ही बोएं।
3. **कीट-रोकथाम चक्र**: बुवाई के 15 दिन बाद नीम तेल (5ml/L), 30 दिन पर खट्टी छाछ और 45 दिन पर जीवामृत का चक्र बनाएं।
4. **सहफसली खेती**: खेत के चारों ओर गेंदा (Marigold) लगाएं जो कीटों और नेमाटोड को दूर रखता है।
5. **मल्चिंग (Mulching)**: सूखी पुआल से क्यारियों को ढकें, इससे नमी बनी रहती है और खरपतवार नहीं उगते।`;

      // 2. Crop-Specific Organic Management
    } else if (message.includes('chilli') || message.includes('mirch') || message.includes('मिर्च')) {
      response = `🌶️ **मिर्च की फसल का 100% जैविक प्रबंधन एवं रोग उपचार (चैटएल परामर्श)**:
• **पत्ती मरोड़ / चुर्रा-मुर्रा (Leaf Curl)**: यह रस चूसक थ्रिप्स व सफेद मक्खी द्वारा फैलता है। 
  - 5 मिली नीम तेल + 2 मिली हर्बल साबुन प्रति लीटर का नियमित छिड़काव करें।
  - खेत में नीले व पीले चिपचिपे कार्ड लगाएं।
• **फल सड़न व श्याम वर्ण (Anthracnose)**:
  - तांबे में रखी खट्टी छाछ (50ml/L) का हर 8-10 दिन में पत्तियों और फलों पर छिड़काव करें।
  - ट्राइकोडर्मा विरिडी (5g/L) का जड़ों में प्रयोग करें।
• **फूल व फल वृद्धि**: पंचगव्य 30ml/L का छिड़काव करने से मिर्च में बंपर फूल और फल आते हैं।`;

    } else if (message.includes('wheat') || message.includes('gehu') || message.includes('गेहूं')) {
      response = `🌾 **गेहूं की फसल का 100% प्राकृतिक व जैविक पोषण (चैटएल परामर्श)**:
• **पीला रतुआ / गेरुआ (Yellow Rust)**: 
  - 50 मिली खट्टी छाछ + 10 लीटर पानी में घोलकर सुबह ओस सूखने के बाद तुरंत छिड़कें।
  - छानी हुई लकड़ी की राख की हल्की भुरकाव करें।
• **दीमक (Termite) से बचाव**: 
  - बुवाई से पहले बीजामृत से बीज शोधन करें।
  - सिंचाई के पानी के साथ मदार (आक) और नीम की पत्तियों का गोमूत्र में सड़ा हुआ अर्क बहाएं।
• **कल्ले (Tillers) व बढ़वार**: पहली सिंचाई (सीआरआई अवस्था) पर 200 लीटर जीवामृत प्रति एकड़ पानी के साथ दें।`;

    } else if (message.includes('rice') || message.includes('paddy') || message.includes('धान') || message.includes('चावल')) {
      response = `🌾 **धान / चावल (Paddy) का 100% जैविक सुरक्षा चक्र**:
• **शीथ ब्लास्ट व झुलसा (Blast & Blight)**: 
  - स्यूडोनोमास फ्लोरेसेंस (Pseudomonas fluorescens) 10 ग्राम प्रति लीटर पानी का छिड़काव करें।
  - खट्टी छाछ (50ml/L) का छिड़काव फफूंद को तुरंत रोक देता है।
• **तना छेदक (Stem Borer) व गंधी बग**: 
  - खेत में प्रकाश प्रपंच (Light Trap) और फेरोमोन ट्रैप लगाएं।
  - 5% नीम बीज अर्क (NSKE) या ब्रह्मास्त्र का 3 लीटर प्रति 100 लीटर पानी में छिड़काव करें।
• **मिट्टी उर्वरता**: धान की रोपाई से पहले खेत में ढैंचा (Green Manure) की पलटाई करें।`;

    } else if (message.includes('cotton') || message.includes('kapas') || message.includes('कपास')) {
      response = `☁️ **कपास की फसल का 100% जैविक सुरक्षा कवच**:
• **गुलाबी सुंडी (Pink Bollworm)**:
  - 8-10 फेरोमोन ट्रैप प्रति एकड़ लगाएं ताकि नर पतंगे आकर्षित होकर नष्ट हो जाएं।
  - ब्रह्मास्त्र या ब्यूवेरिया बैसियाना (Beauveria bassiana 5g/L) का शाम को छिड़काव करें।
• **सफेद मक्खी व थ्रिप्स**:
  - 10 पीले व 5 नीले चिपचिपे ट्रैप प्रति एकड़ लगाएं।
  - दशपर्णी अर्क 20ml प्रति लीटर पानी में मिलाकर हर 10 दिन पर छिड़कें।
• **पादप शक्ति**: 3% पंचगव्य का छिड़काव टिंडे की संख्या और चमक बढ़ाता है।`;

    } else if (message.includes('potato') || message.includes('aalu') || message.includes('आलू')) {
      response = `🥔 **आलू की फसल का 100% जैविक रोग प्रबंधन**:
• **अगेती व पछेती झुलसा (Early & Late Blight)**:
  - 5 लीटर पुरानी खट्टी छाछ (तांबे के पात्र में 5 दिन रखी हुई) को 100 लीटर पानी में मिलाकर मौसम में नमी आते ही छिड़कें।
  - ट्राइकोडर्मा विरिडी (5 ग्राम/लीटर) से कंदों को उपचारित करके ही बोएं।
• **कंद गलन से बचाव**:
  - खेत में जलभराव न होने दें; मेड़ों पर सूखी पुआल की मल्चिंग करें।
• **कंद का आकार बढ़ाना**: लकड़ी की छानी हुई राख (पोटाश का जैविक स्रोत) मिट्टी चढ़ाते समय डालें।`;

    } else if (message.includes('onion') || message.includes('garlic') || message.includes('प्याज') || message.includes('लहसुन')) {
      response = `🧅 **प्याज एवं लहसुन का 100% जैविक उपचार**:
• **बैंगनी धब्बा रोग (Purple Blotch)**:
  - 5 ग्राम बेकिंग सोडा + 5 मिली नीम तेल प्रति लीटर पानी का छिड़काव करें।
  - छाछ व तांबे का काढ़ा 50ml/L पत्ती के धब्बों को तुरंत समाप्त करता है।
• **थ्रिप्स (Thrips - बारीक पीले कीड़े)**:
  - नीले स्टिकी कार्ड लगाएं।
  - अग्न्यास्त्र (तीखा लहसुन-मिर्च अर्क) का 1:10 अनुपात में पत्तियों के बीच में छिड़काव करें।
• **कंद की चमक व वजन**: जीवामृत का सिंचाई के साथ प्रयोग करें।`;

    } else if (message.includes('mustard') || message.includes('sarson') || message.includes('सरसों')) {
      response = `🌼 **सरसों की फसल का 100% जैविक प्रबंधन**:
• **माहू (Chepa / Aphid Infestation)**:
  - सरसों में माहू का प्रकोप होते ही 5 मिली नीम तेल + 2 मिली साबुन घोल प्रति लीटर पानी में मिलाकर शाम को छिड़कें।
  - खेत में 10 पीले चिपचिपे कार्ड प्रति एकड़ लगाएं।
• **सफेद रतुआ (White Rust)**:
  - खट्टी छाछ (50ml/L) का छिड़काव पत्तियों के नीचे की सफेद फफूंद को खत्म करता है।
• **दाने में तेल की मात्रा**: लकड़ी की राख और सल्फर युक्त कम्पोस्ट का प्रयोग करें।`;

    } else if (message.includes('maize') || message.includes('corn') || message.includes('मक्का')) {
      response = `🌽 **मक्का (Maize / Corn) का 100% जैविक स्वास्थ्य समाधान**:
• **फॉल आर्मीवर्म (Fall Armyworm - सुंडी)**:
  - मक्का की पोंगी (Whorl) में बारीक छानी हुई सूखी रेत या राख में 10% नीम की खली मिलाकर डालें; इल्ली का दम घुट जाता है।
  - जैविक कवक ब्यूवेरिया बैसियाना (5g/L) का पोंगी के अंदर छिड़काव करें।
• **तना छेदक**: फेरोमोन ट्रैप लगाएं और ट्राइकोग्रामा परजीवी ततैया के कार्ड लगाएं।
• **बढ़वार**: 10% जीवामृत का पोंगी अवस्था में मिट्टी में प्रयोग करें।`;

    } else if (message.includes('mango') || message.includes('amrud') || message.includes('guava') || message.includes('आम') || message.includes('अमरूद')) {
      response = `🥭 **फलदार वृक्षों (आम, अमरूद) का 100% जैविक प्रबंधन**:
• **आम का बौर झुलसा व पाउडरी मिल्ड्यू**:
  - बौर आने से पहले और मटर के दाने जितने फल बनने पर खट्टी छाछ (50ml/L) या बेकिंग सोडा (5g/L) + नीम तेल का छिड़काव करें।
• **अमरूद का उकठा (Wilt)**:
  - ट्राइकोडर्मा विरिडी 100 ग्राम प्रति पेड़ को सड़े गोबर में मिलाकर थाले में डालें और पानी की अधिकता से बचें।
• **फल मक्खी (Fruit Fly)**:
  - पेड़ों पर मिथाइल यूजेनॉल युक्त फेरोमोन ट्रैप (4 ट्रैप प्रति एकड़) लटकाएं।`;

    } else if (message.includes('citrus') || message.includes('lemon') || message.includes('नींबू')) {
      response = `🍋 **नींबू व सिट्रस फलों का 100% जैविक उपचार**:
• **सिट्रस कैंकर (Citrus Canker - भूरे उभरे धब्बे)**:
  - तांबे के पात्र में रखी खट्टी छाछ (50ml/L) का छिड़काव करें। ग्रसित टहनियों को काटकर नष्ट करें और कटान पर गाय का गोबर व हल्दी का लेप लगाएं।
• **पत्ती सुरंग कीट (Leaf Miner)**:
  - नई पत्तियों पर 5 मिली नीम तेल + साबुन घोल का हर 7 दिन पर छिड़काव करें।
• **डाईबैक (ऊपर से सूखना)**:
  - सूखी टहनी को 2 इंच हरे भाग तक छांटें और जड़ों में ट्राइकोडर्मा खाद डालें।`;

    } else if (message.includes('rose') || message.includes('flower') || message.includes('गुलाब') || message.includes('फूल')) {
      response = `🌹 **गुलाब एवं फूलों का 100% जैविक संवर्धन (चैटएल गाइड)**:
• **काले धब्बे (Black Spot) व पाउडरी मिल्ड्यू**:
  - 1 चम्मच बेकिंग सोडा + आधा चम्मच नीम तेल + 1 लीटर पानी का स्प्रे हर 7 दिन में करें।
  - पौधे को कम से कम 6 घंटे की धूप दिलाएं और पत्तियों पर पानी न गिराएं।
• **कलियों की संख्या दोगुनी करना**:
  - 2 मुट्ठी वर्मीकम्पोस्ट + केले के छिलके का पानी (पोटाश टॉनिक) हर 15 दिन में गमले में डालें।
• **माहू व कीड़े**: साबुन के हल्के पानी या नीम तेल से धोएं।`;

      // 3. Jeevamrutha, Ghanjeevamrutha & Panchagavya Formulations
    } else if (message.includes('jeevamrut') || message.includes('जीवामृत') || message.includes('घनजीवामृत')) {
      response = `🌾 **देसी गाय के जीवामृत (Jeevamrutha) बनाने की संपूर्ण विधि (सुभाष पालेकर प्राकृतिक पद्धति)**:
• **सामग्री (1 एकड़ के लिए)**:
  1. 10 किलोग्राम देसी गाय का ताजा गोबर
  2. 10 लीटर देसी गाय का गोमूत्र
  3. 2 किलोग्राम पुराना गुड़
  4. 2 किलोग्राम बेसन (चने या किसी दाल का आटा)
  5. एक मुट्ठी खेत की मेड़ या जंगल की सजीव मिट्टी
  6. 200 लीटर पानी
• **बनाने की विधि**:
  1. प्लास्टिक ड्रम में 200 लीटर पानी भरें और सभी सामग्री डालकर लकड़ी के डंडे से घड़ी की दिशा में (Clockwise) अच्छी तरह मिलाएं।
  2. ड्रम को छायादार स्थान पर जूट की बोरी से ढककर रखें।
  3. प्रतिदिन सुबह-शाम 2-2 मिनट डंडे से चलाएं। 5 से 7 दिनों में जीवामृत तैयार हो जाता है।
• **प्रयोग विधि**:
  • **सिंचाई के साथ**: 200 लीटर प्रति एकड़ पानी के साथ नाली में बहाएं।
  • **पर्णीय छिड़काव**: कपड़े से अच्छी तरह छानकर 10% से 20% घोल (100-200 मिली प्रति 1 लीटर पानी) बनाकर छिड़कें। यह पौधों को सभी आवश्यक 16 पोषक तत्व और मित्र जीवाणु प्रदान करता है।`;

    } else if (message.includes('panchagavya') || message.includes('पंचगव्य')) {
      response = `🥛 **पंचगव्य (Panchagavya) - प्राकृतिक पादप वृद्धि प्रवर्धक व रोग रोधक**:
• **सामग्री**: गाय का गोबर (5 किग्रा), गाय का घी (500 ग्राम), गोमूत्र (3 लीटर), गाय का दूध (2 लीटर), गाय का दही (2 लीटर), नारियल पानी (3 लीटर), गुड़ का रस (3 लीटर), 12 पके केले।
• **तैयारी**: गोबर और घी को 3 दिन मिलाकर रखें। चौथे दिन बाकी सामग्री मिलाएं। 21 दिनों तक प्रतिदिन सुबह-शाम हिलाएं।
• **छिड़काव खुराक**: 30 मिली पंचगव्य प्रति 1 लीटर पानी में मिलाकर हर 15 दिन में छिड़कें।
• **लाभ**: फूलों और फलों की संख्या दोगुनी करता है, पत्तियों में गहरा हरा रंग लाता है और रोगों से लड़ने की अद्भुत ताकत देता है।`;

    } else if (message.includes('beejamrut') || message.includes('बीजामृत') || message.includes('seed treatment')) {
      response = `🌰 **बीजामृत (Beejamrutha) - प्राकृतिक बीज शोधन विधि**:
• **सामग्री**: 5 किग्रा देसी गाय का गोबर + 5 लीटर गोमूत्र + 50 ग्राम खाने का चूना + मुट्ठी भर सजीव मिट्टी + 20 लीटर पानी।
• **विधि**: चूने को रात में पानी में घोलें, सुबह बाकी सामग्री मिलाकर हिलाएं।
• **उपयोग**: किसी भी बीज को बोने से पहले बीजामृत में 10 मिनट डुबोकर छाया में सुखाएं। यह बीज-जनित एवं मिट्टी-जनित सभी फफूंद रोगों से 100% सुरक्षा देता है।`;

    } else if (message.includes('neem') || message.includes('नीम') || message.includes('neemastra') || message.includes('नीमस्त्र')) {
      response = `🌿 **नीम आधारित जैविक कीटनाशक (Neemastra & Pure Neem Oil)**:
• **नीम का तेल (Neem Oil Spray)**: 5 मिली कोल्ड-प्रेस्ड नीम तेल (10,000 PPM) + 2 मिली जैविक लिक्विड सोप प्रति लीटर पानी में मिलाकर शाम के समय छिड़कें। यह पत्ती खाने वाले कीड़ों और फफूंद को रोकता है।
• **नीमस्त्र (Neemastra)**:
  - 5 किलो नीम की पत्तियां/निबोली + 5 लीटर गोमूत्र + 2 किलो गोबर को 100 लीटर पानी में 48 घंटे भिगोएं।
  - छानकर सीधे बिना पानी मिलाए 1 एकड़ में छिड़कें। यह माहू, सफेद मक्खी और छोटे कीटों को पूरी तरह नियंत्रित करता है।`;

    } else if (message.includes('buttermilk') || message.includes('curd') || message.includes('छाछ') || message.includes('मट्ठा')) {
      response = `🥛 **खट्टी छाछ एवं तांबे का चमत्कारिक फफूंदनाशक**:
• **विशेषता**: छाछ का लैक्टिक एसिड और तांबे के आयन मिलकर बाजार के महंगे रासायनिक फंगीसाइड से भी तेज काम करते हैं।
• **बनाने का तरीका**: 5 लीटर खट्टी मट्ठा/छाछ में तांबे का तार या लोटा डालकर 5 दिन तक छाया में रखें जब तक छाछ हरी न हो जाए।
• **मात्रा**: 50 मिली प्रति लीटर पानी (या 5 लीटर छाछ प्रति 100 लीटर पानी प्रति एकड़)।
• **किन रोगों में उपयोगी**: अगेती झुलसा (Early Blight), पछेती झुलसा (Late Blight), पाउडरी मिल्ड्यू और पत्ती के सभी प्रकार के काले/भूरे धब्बे।`;

    } else if (message.includes('dashparni') || message.includes('दशपर्णी') || message.includes('brahmastra') || message.includes('ब्रह्मास्त्र') || message.includes('agniastra') || message.includes('अग्न्यास्त्र')) {
      response = `🍃 **अग्न्यास्त्र, ब्रह्मास्त्र एवं दशपर्णी अर्क (कठिन कीटों का काल)**:
• **अग्न्यास्त्र (रस चूसक कीटों के लिए)**: 10 लीटर गोमूत्र में 500 ग्राम तीखी मिर्च + 500 ग्राम लहसुन + 500 ग्राम तंबाकू/नीम पत्ता कूटकर उबालें। 2 लीटर प्रति 100 लीटर पानी में छिड़कें।
• **ब्रह्मास्त्र (इल्ली व फल छेदक के लिए)**: 10 लीटर गोमूत्र में नीम, शरीफा, पपीता, अनार व अमरूद की पत्तियां (2-2 किलो) कूटकर धीमी आंच पर उबालें। 2-3 लीटर प्रति 100 लीटर पानी में मिलाकर छिड़कें।
• **दशपर्णी अर्क (दसों कीटों का नाश)**: 10 कड़वी/औषधीय पत्तियों को गोमूत्र में 30 दिन सड़ाकर बनाया जाता है। 200 मिली प्रति 15 लीटर पंप में डालकर छिड़कें।`;

    } else if (message.includes('trichoderma') || message.includes('ट्राइकोडर्मा') || message.includes('bio-fungicide')) {
      response = `🔬 **ट्राइकोडर्मा विरिडी / हार्वियानम (Trichoderma - मित्र कवक)**:
• **क्या है**: यह एक जैविक मित्र फफूंद है जो हानिकारक कवक (जैसे Pythium, Fusarium, Rhizoctonia) को खाकर समाप्त कर देती है।
• **संवर्धन विधि**: 1 किग्रा ट्राइकोडर्मा को 50 किग्रा नम वर्मीकम्पोस्ट में मिलाकर 7 दिन छाया में बोरी से ढककर रखें।
• **प्रयोग**: बुवाई के समय कतारों में डालें या 5 ग्राम प्रति लीटर पानी से पौधों की जड़ों में ड्रेंचिंग करें। जड़ गलन और उकठा रोग में रामबाण है।`;

    } else if (message.includes('blight') || message.includes('झुलसा') || message.includes('धब्बे') || message.includes('धब्बा')) {
      response = `🌿 **पत्ती झुलसा रोग (Leaf Blight) - 100% जैविक उपचार**:
• **पहचान**: पत्तियों पर पीले छल्ले के साथ बादामी या काले गोल धब्बे, निचली पत्तियों का सूखना।
• **जैविक घोल 1**: 50 मिली खट्टी छाछ (तांबे के बर्तन में रखी हुई) प्रति 1 लीटर पानी में मिलाकर हर 5वें दिन पत्तियों पर छिड़कें।
• **जैविक घोल 2**: 5 मिली नीम का तेल + हल्का साबुन घोल प्रति लीटर पानी में मिलाकर छिड़कें।
• **जड़ उपचार**: 5 ग्राम ट्राइकोडर्मा हार्वियानम प्रति लीटर पानी की दर से जड़ों की मिट्टी में डालें।
• **पादप सलाह**: निचली ग्रसित पत्तियों को तुरंत काटकर खेत से बाहर जमीन में दबा दें।`;

    } else if (message.includes('powdery') || message.includes('पाउडरी') || message.includes('चूर्णिल')) {
      response = `🌿 **पाउडरी मिल्ड्यू (चूर्णिल फफूंद) - 100% जैविक उपचार**:
• **पहचान**: पत्तियों की ऊपरी सतह पर सफेद आटे जैसा चूर्ण जमना।
• **जैविक स्प्रे**: 5 ग्राम मीठा सोडा (Baking Soda) + 5 मिली नीम तेल प्रति लीटर पानी में घोलकर छिड़कें।
• **घरेलू दूध स्प्रे**: 100 मिली कच्चा दूध 900 मिली पानी में मिलाकर तेज धूप के समय छिड़कें।
• **राख का भुरकाव**: सुबह ओस में छानी हुई लकड़ी की राख पत्तियों पर छिड़कें।
• **सलाह**: पौधे को भरपूर धूप में रखें और हवा का आवागमन सुनिश्चित करें।`;

    } else if (message.includes('root rot') || message.includes('जड़') || message.includes('गलन') || message.includes('wilt') || message.includes('उकठा')) {
      response = `🌱 **जड़ गलन एवं उकठा रोग (Root Rot & Wilt) - 100% जैविक उपचार**:
• **कारण**: अत्यधिक जलभराव एवं मिट्टी-जनित हानिकारक फफूंद।
• **जैविक फफूंदनाशक**: ट्राइकोडर्मा विरिडी 10 ग्राम प्रति पौधा सड़ी गोबर खाद में मिलाकर जड़ों के पास डालें।
• **गोमूत्र व हल्दी**: 100 मिली गोमूत्र + 10 ग्राम हल्दी 2 लीटर पानी में घोलकर जड़ों में सींचें।
• **सलाह**: तुरंत सिंचाई बंद करें, मिट्टी की गुड़ाई करें ताकि जड़ों को ऑक्सीजन मिले।`;

    } else if (message.includes('aphid') || message.includes('माहू') || message.includes('चेपा') || message.includes('सफेद मक्खी') || message.includes('whitefly') || message.includes('thrips') || message.includes('थ्रिप्स')) {
      response = `🐛 **माहू, थ्रिप्स एवं सफेद मक्खी - 100% जैविक नियंत्रण**:
• **नीम का तेल**: 5 मिली प्रति लीटर पानी में मिलाकर पत्तियों के नीचे छिड़कें जहां कीट छिपे होते हैं।
• **तीखा काढ़ा (अग्न्यास्त्र)**: लहसुन और तीखी हरी मिर्च का काढ़ा 1:10 अनुपात में शाम को छिड़कें।
• **पीले व नीले चिपचिपे कार्ड**: 10 Yellow व 5 Blue Sticky Traps प्रति एकड़ लगाएं।
• **मित्र कीट**: लेडीबर्ड भृंग (Ladybird Beetle) को कभी न मारें, एक भृंग प्रतिदिन 50 माहू खा जाता है!`;

    } else if (message.includes('tomato') || message.includes('टमाटर')) {
      response = `🍅 **टमाटर की फसल का 100% जैविक प्रबंधन**:
• **झुलसा रोग से बचाव**: तांबे में रखी खट्टी छाछ (50ml/L) का हर 10 दिन में छिड़काव करें।
• **पत्ती मरोड़ (Leaf Curl)**: सफेद मक्खी को रोकने के लिए नीम तेल (5ml/L) और पीले कार्ड लगाएं।
• **फल छेदक सुंडी**: ब्रह्मास्त्र या 5% नीम बीज अर्क (NSKE) का छिड़काव करें।
• **टमाटर का फटना व काला पड़ना**: चूने का निथरा हुआ पानी (0.5%) या राख का पानी छिड़कें जो प्राकृतिक कैल्शियम प्रदान करता है।`;

    } else if (message.includes('fertilizer') || message.includes('खाद') || message.includes('npk') || message.includes('urea') || message.includes('dap')) {
      response = `🧪 **प्राकृतिक एवं जैविक पोषण (Natural NPK Alternatives)**:
• **नाइट्रोजन का जैविक विकल्प**: वर्मीकम्पोस्ट (केंचुआ खाद), जीवामृत और सरसों की खली की चाय।
• **फास्फोरस का जैविक विकल्प**: स्टीम्ड बोन मील, रॉक फास्फेट + पीएसबी (PSB) बैक्टीरिया कल्चर।
• **पोटाश का जैविक विकल्प**: लकड़ी की छानी हुई राख (5-7% पोटाश) और केले के छिलकों का किण्वित तरल अर्क।
• **सूक्ष्म पोषक तत्व**: सड़े गोबर की खाद में मिलाया हुआ वेस्ट डीकंपोजर (WDC)।`;

    } else if (message.includes('launch') || message.includes('install') || message.includes('batch') || message.includes('run') || message.includes('चलाएं') || message.includes('ऐप')) {
      response = `🚀 **फार्म प्रो नेटिव डेस्कटॉप ऐप लॉन्चर**:
आप फार्म प्रो ऐप को निम्न माध्यमों से चला सकते हैं:
1. \`G:\\app_developer_sonu\\farming_app power by lavkush\` में **\`install_and_run.bat\`** पर डबल-क्लिक करें।
2. ऊपर "ऐप लॉन्चर" टैब में **"फार्म प्रो अभी चलाएं"** बटन दबाएं।
3. हमारा बैकग्राउंड इंजन पर्यावरण की जांच कर किवी (Kivy) ऐप को स्वचालित खोल देता है।`;

    } else if (message.includes('organic') || message.includes('जैविक') || message.includes('प्राकृतिक') || message.includes('natural')) {
      response = `🌱 **100% जैविक खेती एवं पादप सुरक्षा मार्गदर्शिका (लवकुश द्वारा प्रमाणित)**:
1. **मिट्टी का जैविक पोषण**: हर मौसम में 2-3 टन वर्मीकम्पोस्ट (केंचुआ खाद) + 100 किग्रा नीम की खली प्रति एकड़ डालें।
2. **बीज शोधन**: बीजों को बीजामृत या ट्राइकोडर्मा (5 ग्राम/किग्रा बीज) से उपचारित करके ही बोएं।
3. **कीट-रोकथाम चक्र**: बुवाई के 15 दिन बाद नीम तेल (5ml/L), 30 दिन पर खट्टी छाछ और 45 दिन पर जीवामृत का चक्र बनाएं।
4. **सहफसली खेती**: खेत के चारों ओर गेंदा (Marigold) लगाएं जो कीटों और नेमाटोड को दूर रखता है।
5. **मल्चिंग (Mulching)**: सूखी पुआल से क्यारियों को ढकें, इससे नमी बनी रहती है और खरपतवार नहीं उगते।`;

    } else if (message.includes('lavkush') || message.includes('लवकुश') || message.includes('creator')) {
      response = `👨‍🌾 **फार्म प्रो और लवकुश के बारे में**:
फार्म प्रो और चैटएल एआई को **लवकुश** द्वारा भारतीय किसानों एवं कृषि जगत को सशक्त बनाने के लिए विकसित किया गया है। यह एआई विज़न द्वारा पत्तियों के रोगों की पहचान, 100% जैविक उपचार और डेस्कटॉप/वेब ऐप्स का संपूर्ण पारिस्थितिकी तंत्र है।`;

    } else {
      response = `🌱 **चैटएल एआई - 100% जैविक पादप स्वास्थ्य परामर्श**:
आपके प्रश्न "${rawMsg.slice(0, 45)}" के संबंध में:
• रासायनिक कीटनाशकों के स्थान पर प्राकृतिक जैविक घोल (जैसे नीम का तेल 5ml/L, खट्टी छाछ, या जीवामृत) का उपयोग मिट्टी और पौधे दोनों के लिए सर्वोत्तम है।
• छिड़काव हमेशा शाम 4 बजे के बाद ही करें जब धूप मध्यम हो जाए।
• यदि पत्ती पर रोग का दाग है, तो ऊपर **एआई प्लांट स्कैनर** में फोटो अपलोड करें और तुरंत 100% जैविक सलाह पाएं!
• क्या आप किसी विशिष्ट जैविक घोल (जैसे जीवामृत, पंचगव्य, छाछ काढ़ा, अग्न्यास्त्र) को बनाने की विधि जानना चाहते हैं?`;
    }

  } else {
    // English responses - Trained Organic Doctor & Natural Care
    if (message.includes('hello') || message.includes('hi') || message.includes('namaste')) {
      response = `Namaste! 🌿 I am **ChatL AI**, your specialized **100% Organic Plant Doctor & Natural Farming Advisor**, trained by Lavkush for Farm Pro.

I am trained to care for all your crops, vegetables, fruits, and garden plants using zero toxic chemicals:
• **🌱 100% Organic Formulations & Recipes**: Sour Buttermilk + Copper foliar wash, Cold-pressed Neem oil, Trichoderma bio-fungicide, Panchagavya, Liquid Jeevamrutha, Beejamrutha, Dashparni Ark.
• **🐛 Botanical Bio-Pest Control**: Step-by-step recipes for Neemastra, Brahmastra, Garlic-Chilli Agniastra, and sticky traps for aphids, thrips, and borers.
• **🍂 Organic Disease Eradication**: Blight, Powdery Mildew, Downy Mildew, Root Rot, Damping-off, Rust, and Leaf Curl remedies.
• **🧪 Chemical NPK Alternatives**: Vermicompost, Mustard cake tea, Sifted wood ash (bio-potash), Steamed bone meal.
• **🌾 Crop-Specific Roadmaps**: Tailored organic care for Tomato, Wheat, Rice, Cotton, Chilli, Potato, Onion, Mango, Citrus, and Orchards.

What crop, plant, or disease would you like a 100% organic prescription for today?`;

      // 1. Organic Scan Follow-up & Preparation Recipe
    } else if (message.includes('recipe') || message.includes('how to prepare') || message.includes('make') || message.includes('organic recipe') || message.includes('preparation')) {
      if (message.includes('blight')) {
        response = `🌿 **100% Organic Leaf Blight Recipe & Plant Care Guide**:
1. **Sour Buttermilk & Copper Anti-Fungal Concoction**:
   • **Ingredients**: 500ml old sour buttermilk (stored 4-5 days in a copper pot/with copper wire) + 10L clean water.
   • **How it works**: Lactic acid bactericides combined with copper ions arrest Alternaria blight mycelium instantly.
   • **Application**: Spray thoroughly over upper and lower leaf surfaces every 5-7 days in the late afternoon.
2. **Cold-Pressed Pure Neem Oil Spray**:
   • Mix 5ml pure neem oil + 2ml organic liquid soap per 1 liter water. Creates an anti-spore bio-barrier.
3. **Rhizosphere Soil Drench**:
   • Inoculate root zone with Trichoderma harzianum (5g/L) to halt soil-borne pathogenic fungi.
4. **Plant Care Routine**:
   • Prune diseased lower leaves (bottom 15cm) and incinerate them; irrigate strictly at the root zone in early morning.`;
      } else if (message.includes('powdery') || message.includes('mildew')) {
        response = `🌿 **100% Organic Powdery Mildew Recipe & Preparation**:
1. **Baking Soda & Neem Bio-Fungicide**:
   • **Ingredients**: 5g Sodium Bicarbonate (baking soda) + 5ml Cold-pressed Neem oil + 1L water.
   • **Preparation**: Shake vigorously until emulsified; spray onto upper leaf surfaces in early morning. The alkaline pH ruptures fungal spore cell walls.
2. **Raw Cow Milk Antiseptic Wash**:
   • 1 part unboiled milk to 9 parts water. Sunlight activates natural lactoferrin proteins that sterilize fungal colonies.
3. **Dry Wood Ash Dusting**:
   • Sift fine hardwood ash and dust over dew-covered leaves early morning.
4. **Plant Care Routine**:
   • Maximize direct sunlight exposure (6+ hours) and thin inner branches for optimal cross-ventilation.`;
      } else if (message.includes('aphid') || message.includes('pest') || message.includes('insect')) {
        response = `🐛 **Organic Pest Repellent & Neemastra Recipe**:
1. **Homemade Neemastra Recipe**:
   • **Ingredients**: 500g crushed neem leaves + 500ml cow urine + 200g cow dung + 10L water.
   • **Fermentation**: Keep in shade for 48 hours, stir twice daily. Strain through cheesecloth and spray undiluted.
2. **Garlic-Chilli Hot Brew (Agniastra)**:
   • Boil 50g pungent crushed green chillies + 50g garlic cloves in 1L water for 20 minutes. Dilute 1:10 with water and spray underside of leaves where aphids shelter.
3. **Yellow Sticky Traps**:
   • Hang yellow sticky cards at canopy height to capture flying adult aphids and whiteflies naturally.`;
      } else if (message.includes('root rot') || message.includes('wilt')) {
        response = `🌱 **Organic Root Rot Cure & Trichoderma Treatment Recipe**:
1. **Trichoderma Soil Enrichment**:
   • Mix 100g Trichoderma viride bio-fungicide into 10kg moist vermicompost. Cover with damp jute sack for 7 days in shade to multiply fungal hyphae. Blend 2 handfuls around root zone.
2. **Turmeric & Cow Urine Root Drench**:
   • Dissolve 100ml fresh cow urine + 10g pure turmeric powder in 2L water. Drench soil around root perimeter to sanitize fungal pathogens naturally.
3. **Plant Care Routine**:
   • Halt all watering immediately until top 2-3 inches of soil dry completely. Improve bed drainage.`;
      } else {
        response = `🥣 **Universal Organic Plant Immunity Formulation (Liquid Jeevamrutha)**:
1. **Ingredients**: 1kg fresh cow dung, 1L cow urine, 200g jaggery, 200g chickpea flour (besan), handful virgin soil, 20L water.
2. **Fermentation**: Stir clockwise twice daily for 5-7 days under shade.
3. **Application**: Dilute 1:10 with water for foliar spray or drench soil to provide all 16 micro/macronutrients biologically!`;
      }

      // 2. Crop-Specific Roadmaps
    } else if (message.includes('chilli') || message.includes('pepper') || message.includes('mirch')) {
      response = `🌶️ **Chilli / Pepper Organic Health Guide (ChatL Advisory)**:
• **Leaf Curl Virus (Churra-Murra)**: Transmitted by thrips and whiteflies.
  - Spray cold-pressed Neem oil (5ml/L) + mild liquid soap every 5-7 days.
  - Install Blue sticky traps for thrips and Yellow traps for whiteflies.
• **Anthracnose & Fruit Rot**:
  - Spray fermented Sour Buttermilk with copper (50ml/L) at flowering and fruit set.
  - Apply Trichoderma viride (5g/L) around root perimeter.
• **Flower & Fruit Boost**: Spray Panchagavya (30ml/L) to prevent blossom drop and double pod size naturally.`;

    } else if (message.includes('wheat') || message.includes('gehu')) {
      response = `🌾 **Wheat Crop - 100% Organic Management**:
• **Yellow & Brown Rust**:
  - Spray fermented Sour Buttermilk (50ml/L water) early morning as soon as first orange/yellow pustules appear.
  - Dust fine sifted wood ash across dew-laden leaves.
• **Termite Attack**:
  - Drench irrigation water with Calotropis (Aak) leaves fermented in cow urine.
  - Treat seeds before sowing with Beejamrutha.
• **Crown Root Irrigation**: Inoculate field with 200L Jeevamrutha per acre during first irrigation.`;

    } else if (message.includes('rice') || message.includes('paddy')) {
      response = `🌾 **Paddy / Rice - 100% Organic Protection Protocol**:
• **Sheath Blight & Blast**:
  - Spray Pseudomonas fluorescens (10g/L) and fermented Sour Buttermilk (50ml/L).
  - Drain stagnant water from field for 24-48 hours to expose soil to sunlight.
• **Stem Borer & Leaf Folder**:
  - Install light traps and Trichogramma egg parasitoid cards.
  - Spray Brahmastra or 5% Neem Seed Kernel Extract (NSKE).
• **Bio-Fertility**: Inoculate soil with Azospirillum and PSB bio-fertilizers.`;

    } else if (message.includes('cotton') || message.includes('kapas')) {
      response = `☁️ **Cotton Crop - 100% Organic Pest & Disease Management**:
• **Pink Bollworm**:
  - Install 8-10 Gossyplure pheromone traps per acre to disrupt mating cycles.
  - Spray entomopathogenic fungus Beauveria bassiana (5g/L) or Brahmastra.
• **Whitefly & Sucking Pests**:
  - Hang yellow sticky traps at crop canopy.
  - Spray Dashparni Ark (20ml/L) every 10 days.
• **Foliar Tonic**: Apply 3% Panchagavya spray at square formation and boll bursting stages.`;

    } else if (message.includes('potato') || message.includes('aalu')) {
      response = `🥔 **Potato Crop - 100% Organic Blight & Tuber Protocol**:
• **Late & Early Blight**:
  - Spray Sour Buttermilk stored 5 days with copper wire (50ml/L) preventatively before rainy/foggy spells.
  - Dust dry wood ash on damp foliage to raise surface pH.
• **Seed Tuber Treatment**:
  - Soak seed tubers in Trichoderma viride solution (10g/L) for 15 minutes before planting.
• **Tuber Bulking**: Top-dress with sifted hardwood ash (rich in natural bio-potassium).`;

    } else if (message.includes('onion') || message.includes('garlic')) {
      response = `🧅 **Onion & Garlic - 100% Organic Care**:
• **Purple Blotch (Alternaria porri)**:
  - Spray Baking Soda (5g/L) + Neem oil (5ml/L) or copper-infused sour buttermilk.
• **Thrips**:
  - Spray pungent Garlic-Chilli Agniastra brew diluted 1:10 directly into leaf axils.
  - Hang blue sticky traps along field borders.
• **Bulb Growth**: Apply liquid Jeevamrutha during bulb expansion stage.`;

    } else if (message.includes('mustard')) {
      response = `🌼 **Mustard Crop - 100% Organic Management**:
• **Aphids (Lipaphis erysimi)**:
  - Spray cold-pressed Neem oil (5ml/L) with soap emulsifier late afternoon.
  - Install 10 Yellow sticky traps per acre.
• **White Rust**:
  - Spray Sour Buttermilk (50ml/L) on leaf undersides.
• **Seed Oil Content**: Enrich soil with composted cow manure and wood ash for natural sulphur and potassium.`;

    } else if (message.includes('maize') || message.includes('corn')) {
      response = `🌽 **Maize / Corn - 100% Organic Defense**:
• **Fall Armyworm**:
  - Apply a mixture of fine dry sand + 10% neem cake powder into leaf whorls (chokes caterpillars physically).
  - Spray entomopathogenic fungus Beauveria bassiana (5g/L) in late evening.
• **Plant Vigor**: Top-dress with vermicompost and liquid Jeevamrutha at knee-high stage.`;

    } else if (message.includes('mango') || message.includes('guava') || message.includes('orchard')) {
      response = `🥭 **Fruit Orchards (Mango, Guava) - 100% Organic Care**:
• **Powdery Mildew & Anthracnose**:
  - Spray copper sour buttermilk (50ml/L) or baking soda (5g/L) before flowering and at pea-sized fruit stage.
• **Fruit Fly**:
  - Hang Methyl Eugenol pheromone traps (4 per acre) 1.5m above ground.
• **Guava Wilt**:
  - Blend 100g Trichoderma viride into 10kg vermicompost per tree basin; avoid waterlogging.`;

    } else if (message.includes('citrus') || message.includes('lemon')) {
      response = `🍋 **Citrus & Lemon - 100% Organic Roadmap**:
• **Citrus Canker**:
  - Prune canker-affected twigs, seal with cow dung-turmeric paste, and spray copper-buttermilk wash (50ml/L).
• **Leaf Miner**:
  - Spray cold-pressed Neem oil (5ml/L) every 7 days on young tender flushes.
• **Dieback**:
  - Prune 2 inches into healthy wood and apply Trichoderma root drench.`;

    } else if (message.includes('rose') || message.includes('flower')) {
      response = `🌹 **Rose & Garden Plants - 100% Organic Care**:
• **Black Spot & Powdery Mildew**:
  - Spray 1 tsp baking soda + 1 tsp neem oil in 1L water weekly.
  - Keep foliage dry and expose to 6+ hours of morning sunshine.
• **Continuous Blooming**:
  - Feed 2 tablespoons vermicompost + fermented banana peel tea every 2 weeks.
• **Aphid Defense**: Wash off with a firm jet of water or neem oil spray.`;

      // 3. Jeevamrutha, Panchagavya, Formulations
    } else if (message.includes('jeevamrut') || message.includes('jeevamrutha')) {
      response = `🌾 **Subhash Palekar Natural Farming - Jeevamrutha Formulation**:
• **Ingredients (For 1 Acre)**:
  1. 10 kg fresh indigenous desi cow dung
  2. 10 liters desi cow urine
  3. 2 kg unrefined jaggery
  4. 2 kg pulse flour (gram flour / besan)
  5. Handful of uncontaminated virgin bund/forest soil
  6. 200 liters fresh water
• **Preparation**:
  1. Mix all ingredients in a 200L barrel with a wooden staff in clockwise direction.
  2. Cover with a damp gunny bag in shade for 5 to 7 days. Stir for 2 minutes morning and evening.
• **Application**:
  • Apply 200L per acre through drip/irrigation water once every 15-20 days.
  • Or filter through fine muslin cloth and spray as a 10% foliar tonic (100ml/L water) for explosive vegetative growth and disease resistance.`;

    } else if (message.includes('panchagavya')) {
      response = `🥛 **Panchagavya - Master Organic Bio-Stimulant & Tonic**:
• **Ingredients**: Fresh cow dung (5kg), pure cow ghee (500g), cow urine (3L), raw milk (2L), curd (2L), tender coconut water (3L), sugarcane jaggery juice (3L), 12 ripe bananas.
• **Fermentation**: 21 days with twice-daily stirring under shade.
• **Dosage**: 30ml per 1 liter water (3% concentration) as foliar spray every 15 days.
• **Benefits**: Doubles flowering density, boosts chlorophyll index, extends shelf-life of produce, and protects plants from environmental stress.`;

    } else if (message.includes('beejamrut') || message.includes('seed treatment')) {
      response = `🌰 **Beejamrutha - Natural Organic Seed Treatment**:
• **Ingredients**: 5kg fresh desi cow dung + 5L cow urine + 50g slaked lime (chuna) + handful virgin soil + 20L water.
• **Preparation**: Soak lime overnight, mix with other ingredients in morning.
• **Usage**: Coat seeds for 10-15 minutes, dry under shade before sowing. Shields seedlings 100% against seed-borne and soil-borne fungal pathogens.`;

    } else if (message.includes('neem') || message.includes('neem oil') || message.includes('neemastra')) {
      response = `🌿 **Neem Bio-Pesticide & Neemastra Guide**:
• **Cold-Pressed Neem Oil (10,000 PPM)**:
  - Mix 5ml pure neem oil with 2ml organic liquid soap per liter of lukewarm water.
  - Spray in late evening to protect beneficial bees. Controls leaf miners, aphids, whiteflies, and powdery mildew.
• **Neemastra (Sucking Pest Destroyer)**:
  - Ferment 5kg crushed neem leaves/seeds + 5L cow urine + 2kg cow dung in 100L water for 48 hours. Filter and spray directly per acre.`;

    } else if (message.includes('buttermilk') || message.includes('sour milk') || message.includes('curd')) {
      response = `🥛 **Sour Buttermilk Natural Anti-Fungal Remedy**:
• **Why it works**: Fermented sour buttermilk contains lactic acid bacteria that produce natural antifungal bacteriocins. When stored in copper vessels, copper ions enhance its fungal eradication potency.
• **Preparation**: Keep 5L churned buttermilk in a copper container (or with copper wires immersed) for 4-5 days until slightly greenish.
• **Dosage**: 50ml per 1 liter water (or 5L buttermilk per 100L water per acre).
• **Targets**: Early Blight, Late Blight, Powdery Mildew, Downy Mildew, Anthracnose, and Leaf Spots.`;

    } else if (message.includes('dashparni') || message.includes('brahmastra') || message.includes('agniastra')) {
      response = `🍃 **Agniastra, Brahmastra & Dashparni Ark (Organic Pest Killers)**:
• **Agniastra (For Sucking Pests)**: Boil 500g crushed garlic + 500g pungent chillies + 500g neem leaves in 10L cow urine. Dilute 2L in 100L water.
• **Brahmastra (For Caterpillars & Borers)**: Simmer leaves of neem, custard apple, papaya, pomegranate, and guava (2kg each) in 10L cow urine. Dilute 2-3L in 100L water.
• **Dashparni Ark**: 10 bitter medicinal herbs fermented in cow urine for 30 days. Broad-spectrum botanical pesticide.`;

    } else if (message.includes('trichoderma') || message.includes('bio-fungicide')) {
      response = `🔬 **Trichoderma viride & T. harzianum (Beneficial Bio-Fungicide)**:
• **Mechanism**: Antagonistic fungus that parasitizes and destroys pathogenic Pythium, Rhizoctonia, and Fusarium.
• **Multiplication**: Blend 1kg Trichoderma into 50kg moist vermicompost; incubate 7 days under damp jute bags.
• **Application**: Top-dress around plant roots or mix 5g/L water for rhizosphere soil drenching. Stops root rot and wilt naturally.`;

    } else if (message.includes('blight') || message.includes('brown spot')) {
      response = `🌿 **Leaf Blight Management - 100% Organic Treatment**:
• **Identification**: Concentric brown/tan target spots, yellow rings, dying lower leaf margins.
• **Organic Spray 1**: Sour Buttermilk foliar wash (50ml/L water) stored 4 days with copper plate. Spray every 5-7 days.
• **Organic Spray 2**: Cold-pressed Neem oil (5ml/L) + mild herbal soap emulsifier.
• **Root Treatment**: Trichoderma harzianum bio-fungicide drench (5g/L) around root zone.
• **Cultural Care**: Prune affected lower leaves (bottom 15cm); mulch base with clean straw; water only at root level early morning.`;

    } else if (message.includes('powdery')) {
      response = `🌿 **Powdery Mildew - 100% Organic Treatment**:
• **Identification**: White talcum-powder like dusting on upper leaf surfaces and curled stems.
• **Organic Spray**: 5g Baking Soda (Sodium Bicarbonate) + 5ml pure Neem oil per liter water.
• **Milk Wash**: 1 part cow milk to 9 parts water sprayed under full morning sunlight.
• **Wood Ash**: Dust fine wood ash early morning when leaves are moist with dew.
• **Plant Care**: Ensure 6+ hours of direct sunlight and thin out dense foliage to allow breeze circulation.`;

    } else if (message.includes('root rot') || message.includes('wilt')) {
      response = `🌱 **Root Rot & Wilt - 100% Organic Treatment**:
• **Cause**: Poor soil drainage and Pythium/Phytophthora fungal waterlogging.
• **Bio-Fungicide**: Drench with Trichoderma viride (10g per plant) mixed into moist vermicompost.
• **Natural Antiseptic**: 100ml fresh cow urine + 10g turmeric powder in 2L water drenched into rhizosphere.
• **Plant Care**: Stop watering immediately; aerate topsoil; drill additional container drainage holes.`;

    } else if (message.includes('aphid') || message.includes('whitefly') || message.includes('thrips')) {
      response = `🐛 **Aphids, Whiteflies & Thrips - 100% Organic Management**:
• **Bio-Spray**: 5ml cold-pressed Neem oil per liter water, focusing on undersides of leaves.
• **Herbal Concoction**: Boil 50g garlic + 50g hot chillies in 1L water; dilute 1:10 and spray in evening.
• **Physical Traps**: Place 10 Yellow Sticky Traps and 5 Blue Sticky Traps per acre.
• **Beneficial Insects**: Protect natural ladybugs and hoverflies which consume up to 50 aphids daily.`;

    } else if (message.includes('tomato')) {
      response = `🍅 **Tomato Crop Health - 100% Organic Roadmap**:
• **Early & Late Blight**: Alternate Sour Buttermilk spray (50ml/L) and Neem oil (5ml/L) every 7 days.
• **Leaf Curl Virus**: Suppress whitefly vectors with Neem oil and yellow sticky traps.
• **Fruit Borer**: Spray Brahmastra or 5% Neem Seed Kernel Extract (NSKE).
• **Blossom End Rot (Calcium deficiency)**: Dust powdered eggshells or spray 0.5% natural limestone solution around base.`;

    } else if (message.includes('fertilizer') || message.includes('npk') || message.includes('urea') || message.includes('dap')) {
      response = `🧪 **Organic Alternatives to Chemical NPK**:
• **Nitrogen (Replaces Urea)**: Liquid Jeevamrutha, Vermicompost, and fermented Mustard Cake Tea (सरसों खली).
• **Phosphorus (Replaces DAP/SSP)**: Steamed Bone Meal, Rock Phosphate inoculated with PSB bacteria.
• **Potassium (Replaces MOP/Potash)**: Sifted hardwood ash (rich in bio-potash) and fermented banana peel tea.
• **Micronutrients**: Waste Decomposer (WDC) enriched with compost and rock dust.`;

    } else if (message.includes('organic') || message.includes('natural')) {
      response = `🌱 **Complete Organic Plant Health Blueprint (Powered by Lavkush)**:
1. **Soil Micro-Biome**: Apply 2-3 tons of Vermicompost enriched with Trichoderma and PSB per acre.
2. **Prophylactic Sprays**: Maintain a bi-weekly spray rotation: Week 1 (Neem oil 5ml/L), Week 2 (Sour Buttermilk 50ml/L), Week 3 (Liquid Jeevamrutha 10%).
3. **Companion Planting**: Border plots with French Marigolds (nematicidal and pest trap) and Sweet Basil.
4. **Organic Mulching**: Keep 3-4 inches of dry straw or shredded leaves around root stems to retain soil humidity and foster earthworms.`;

    } else if (message.includes('launch') || message.includes('install') || message.includes('batch') || message.includes('run')) {
      response = `🚀 **Farm Pro Native App Launcher**:
You can launch the complete Farm Pro app directly using:
1. Double-clicking **\`install_and_run.bat\`** in \`G:\\app_developer_sonu\\farming_app power by lavkush\`
2. Clicking the **"Launch Farm Pro Now"** button in the Web Launcher tab above!
3. Our background manager executes the environment check, validates dependencies (Kivy, OpenCV, Matplotlib), and opens the UI.`;

    } else if (message.includes('lavkush') || message.includes('who made') || message.includes('creator')) {
      response = `👨‍🌾 **About Farm Pro & Lavkush**:
Farm Pro and ChatL AI were developed by **Lavkush** as an all-in-one Smart Farming ecosystem. It combines AI plant diagnostics, 100% organic remedies, precision agriculture schedules, and native desktop/mobile apps for empowering farmers.`;

    } else {
      response = `🌱 **ChatL AI - 100% Organic Plant Advisory**:
Regarding "${rawMsg.slice(0, 45)}":
• For natural plant health, avoid synthetic chemicals and adopt organic foliar sprays (such as pure Neem oil 5ml/L, fermented sour buttermilk, or Jeevamrutha).
• Always perform foliar sprays late in the afternoon or early morning to prevent leaf scorching.
• If you see affected foliage, scan the leaf in our **AI Plant Scanner** above for instant organic diagnosis!
• Would you like a step-by-step preparation recipe for any organic remedy (e.g. Jeevamrutha, Neemastra, or Sour Buttermilk spray)?`;
    }
  }

  res.json({ reply: response });
});

// ---------------------------------------------------------------------
// 7. FARM PRO DESKTOP APP LAUNCHER API (install_and_run.bat Integration)
// ---------------------------------------------------------------------
app.get('/api/launcher/status', (req, res) => {
  const db = readDB();
  const appPath = db.settings.appPath || 'G:\\app_developer_sonu\\farming_app power by lavkush';
  const batPath = path.join(appPath, 'install_and_run.bat');
  const mainPyPath = path.join(appPath, 'main.py');
  const allInOnePath = path.join(appPath, 'farmcare_all_in_one.py');

  const exists = fs.existsSync(appPath);
  const batExists = fs.existsSync(batPath);
  const mainPyExists = fs.existsSync(mainPyPath);
  const allInOneExists = fs.existsSync(allInOnePath);

  res.json({
    appPath,
    exists,
    batExists,
    mainPyExists,
    allInOneExists,
    isRunning: !!runningAppProcess,
    pid: runningAppProcess ? runningAppProcess.pid : null,
    logs: appLogs.slice(-25)
  });
});

// Trigger Launch
app.post('/api/launcher/launch', requireAdminAuth, (req, res) => {
  const db = readDB();
  const appPath = db.settings.appPath || 'G:\\app_developer_sonu\\farming_app power by lavkush';
  const batPath = path.join(appPath, 'install_and_run.bat');

  if (!fs.existsSync(appPath)) {
    return res.status(404).json({ error: `Path not found: ${appPath}` });
  }

  if (runningAppProcess) {
    return res.json({
      success: true,
      message: 'App is already running!',
      pid: runningAppProcess.pid
    });
  }

  addLog(`Launching Farm Pro from: ${appPath}...`);

  try {
    // We launch install_and_run.bat via cmd.exe in background
    if (fs.existsSync(batPath)) {
      runningAppProcess = spawn('cmd.exe', ['/c', 'install_and_run.bat'], {
        cwd: appPath,
        detached: true,
        stdio: ['ignore', 'pipe', 'pipe']
      });
    } else {
      runningAppProcess = spawn('python', ['main.py'], {
        cwd: appPath,
        detached: true,
        stdio: ['ignore', 'pipe', 'pipe']
      });
    }

    const pid = runningAppProcess.pid;
    addLog(`Farm Pro process started successfully (PID: ${pid})`);

    runningAppProcess.stdout.on('data', (data) => {
      const text = data.toString().trim();
      if (text) addLog(`[FarmPro stdout] ${text}`);
    });

    runningAppProcess.stderr.on('data', (data) => {
      const text = data.toString().trim();
      if (text) addLog(`[FarmPro stderr] ${text}`);
    });

    runningAppProcess.on('close', (code) => {
      addLog(`Farm Pro process (PID: ${pid}) exited with code ${code}`);
      runningAppProcess = null;
    });

    runningAppProcess.on('error', (err) => {
      addLog(`Farm Pro error: ${err.message}`);
      runningAppProcess = null;
    });

    res.json({
      success: true,
      message: 'Farm Pro desktop app launched successfully!',
      pid: pid
    });
  } catch (err) {
    addLog(`Failed to launch app: ${err.message}`);
    res.status(500).json({ error: err.message });
  }
});

// Stop App
app.post('/api/launcher/stop', requireAdminAuth, (req, res) => {
  if (!runningAppProcess) {
    return res.json({ success: true, message: 'No app is currently running.' });
  }

  const pid = runningAppProcess.pid;
  addLog(`Stopping Farm Pro process (PID: ${pid})...`);

  try {
    exec(`taskkill /F /T /PID ${pid}`, (err, stdout, stderr) => {
      runningAppProcess = null;
      addLog(`Farm Pro stopped.`);
      res.json({ success: true, message: 'Farm Pro process terminated.' });
    });
  } catch (e) {
    try {
      runningAppProcess.kill();
    } catch (ignore) { }
    runningAppProcess = null;
    res.json({ success: true, message: 'Terminated.' });
  }
});

// Downloadable Batch Launcher File
app.get('/api/launcher/download-bat', (req, res) => {
  const db = readDB();
  const appPath = db.settings.appPath || 'G:\\app_developer_sonu\\farming_app power by lavkush';

  const batContent = `@echo off
REM ===============================================================
REM FarmCare Pro powered by Lavkush - Web Initiated Launcher
REM ===============================================================
title Farm Pro Launcher - Powered by Lavkush
color 0A

echo ==============================================================
echo             FarmCare Pro - Smart Farming Assistant
echo                     Powered by Lavkush
echo ==============================================================
echo.
echo Target Directory: "${appPath}"
echo.

if not exist "${appPath}" (
    echo [ERROR] Could not find folder: "${appPath}"
    pause
    exit /b 1
)

cd /d "${appPath}"
if exist install_and_run.bat (
    echo Launching install_and_run.bat...
    call install_and_run.bat
) else (
    echo Launching python main.py...
    python main.py
)
pause
`;

  res.setHeader('Content-disposition', 'attachment; filename=Launch_FarmPro_Lavkush.bat');
  res.setHeader('Content-type', 'application/x-bat');
  res.send(batContent);
});

// Global Express Error Handling Middleware (prevents body-parser and async crash)
app.use((err, req, res, next) => {
  if (err) {
    console.error('[HTTP Error Handled]', err.message);
    return res.status(err.status || 400).json({ error: err.message || 'Invalid Request' });
  }
  next();
});

// Fallback HTML SPA
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start Server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`=======================================================`);
  console.log(`🌾 Farm Pro Website - Powered by Lavkush`);
  console.log(`🌐 Server running at: http://localhost:${PORT}`);

  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        console.log(`📱 Mobile / Network Link: http://${iface.address}:${PORT}`);
      }
    }
  }
  console.log(`🌍 Worldwide Access Tunnel initializing...`);
  console.log(`=======================================================`);
  initCloudflareTunnel();
});
