import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;
import QRCode from 'qrcode';

dotenv.config();

process.on('uncaughtException', (err) => {
  console.error('⚠️ Uncaught Exception:', err.message || err);
});

process.on('unhandledRejection', (reason) => {
  console.error('⚠️ Unhandled Rejection:', reason);
});

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS for Netlify and all origins
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Persistent Data Directory
const DATA_DIR = path.resolve(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const APPOINTMENTS_FILE = path.join(DATA_DIR, 'appointments.json');
const AVAILABILITY_FILE = path.join(DATA_DIR, 'availability.json');
const LOGS_FILE = path.join(DATA_DIR, 'activity.log');

// Log file for outbound activity
function logActivity(message) {
  const timestamp = new Date().toISOString();
  const line = `[${timestamp}] ${message}\n`;
  try {
    fs.appendFileSync(LOGS_FILE, line, 'utf8');
  } catch {}
  console.log(line.trim());
}

// Initial Appointments Seed
const DEFAULT_APPOINTMENTS = [];

function loadAppointments() {
  try {
    if (fs.existsSync(APPOINTMENTS_FILE)) {
      return JSON.parse(fs.readFileSync(APPOINTMENTS_FILE, 'utf8'));
    }
  } catch (err) {
    console.error('Erreur lecture appointments.json:', err);
  }
  return DEFAULT_APPOINTMENTS;
}

function saveAppointments(data) {
  try {
    fs.writeFileSync(APPOINTMENTS_FILE, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Erreur écriture appointments.json:', err);
    return false;
  }
}

function loadAvailability() {
  try {
    if (fs.existsSync(AVAILABILITY_FILE)) {
      return JSON.parse(fs.readFileSync(AVAILABILITY_FILE, 'utf8'));
    }
  } catch (err) {
    console.error('Erreur lecture availability.json:', err);
  }
  return { customDateSlots: {}, blockedDates: [] };
}

function saveAvailability(data) {
  try {
    fs.writeFileSync(AVAILABILITY_FILE, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Erreur écriture availability.json:', err);
    return false;
  }
}

let appointments = loadAppointments();
let availability = loadAvailability();

// ==========================================
// 🟢 WHATSAPP CLIENT CONFIGURATION
// ==========================================
let qrCodeDataUrl = null;
let isWhatsAppReady = false;
let isInitializing = false;
let whatsappUser = null;
let lastError = null;

let whatsappClient = null;

function initWhatsAppClient() {
  isInitializing = true;
  isWhatsAppReady = false;
  qrCodeDataUrl = null;
  lastError = null;

  try {
    whatsappClient = new Client({
      authStrategy: new LocalAuth({
        dataPath: path.resolve(process.cwd(), '.wwebjs_auth')
      }),
      puppeteer: {
        headless: true,
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu'
        ]
      }
    });

    whatsappClient.on('qr', async (qr) => {
      isWhatsAppReady = false;
      lastError = null;
      console.log('\n[WhatsApp] 📱 Nouveau QR Code généré');

      try {
        qrCodeDataUrl = await QRCode.toDataURL(qr, {
          width: 320,
          margin: 2,
          color: { dark: '#064E3B', light: '#FFFFFF' }
        });
      } catch (err) {
        console.error('Erreur génération QR Code DataURL:', err);
      }
    });

    whatsappClient.on('authenticated', () => {
      console.log('🔐 [WhatsApp] Session authentifiée avec succès !');
      lastError = null;
    });

    whatsappClient.on('ready', () => {
      isWhatsAppReady = true;
      qrCodeDataUrl = null;
      lastError = null;
      try {
        whatsappUser = whatsappClient.info ? (whatsappClient.info.pushname || whatsappClient.info.wid?.user) : '06 13 92 09 87';
      } catch {
        whatsappUser = '06 13 92 09 87';
      }
      console.log(`✅ [WhatsApp] Prêt et connecté sous l'utilisateur : ${whatsappUser}`);
    });

    whatsappClient.on('auth_failure', (msg) => {
      console.error('❌ [WhatsApp] Échec d\'authentification:', msg);
      lastError = 'Échec de l\'authentification WhatsApp. Veuillez réinitialiser.';
      isWhatsAppReady = false;
      qrCodeDataUrl = null;
    });

    whatsappClient.on('disconnected', (reason) => {
      console.warn('⚠️ [WhatsApp] Déconnecté:', reason);
      isWhatsAppReady = false;
      qrCodeDataUrl = null;
      whatsappUser = null;
    });

    whatsappClient.initialize().catch((err) => {
      console.error('Erreur initialisation WhatsApp:', err);
      lastError = String(err);
    }).finally(() => {
      isInitializing = false;
    });

  } catch (err) {
    console.error('Erreur création client WhatsApp:', err);
    lastError = String(err);
    isInitializing = false;
  }
}

// Start WhatsApp on launch
initWhatsAppClient();

// Helper to send a real WhatsApp message
async function sendWhatsAppDirect(to, message) {
  let cleaned = to.replace(/[\s.-]/g, '');
  if (cleaned.startsWith('0') && cleaned.length === 10) {
    cleaned = '33' + cleaned.substring(1);
  } else if (cleaned.startsWith('+')) {
    cleaned = cleaned.substring(1);
  }

  const nativeWhatsAppUrl = `https://wa.me/${cleaned}?text=${encodeURIComponent(message)}`;

  if (isWhatsAppReady && whatsappClient) {
    try {
      // Determine correct chatId (support sending to self if Aymen is the logged in client)
      let chatId = `${cleaned}@c.us`;
      if (whatsappClient.info && whatsappClient.info.wid) {
        const clientUser = whatsappClient.info.wid.user;
        if (clientUser && (cleaned === clientUser || cleaned.endsWith(clientUser) || clientUser.endsWith(cleaned))) {
          chatId = whatsappClient.info.wid._serialized;
        }
      }

      await whatsappClient.sendMessage(chatId, message);
      logActivity(`Message WhatsApp automatique ENVOYÉ au ${cleaned} : "${message.substring(0, 45)}..."`);
      return { success: true, isAutoSent: true, nativeWhatsAppUrl, status: 'sent_automatically' };
    } catch (err) {
      console.error('Erreur envoi WhatsApp automatique:', err);
      logActivity(`Erreur envoi WhatsApp à ${cleaned} : ${err.message}`);
      return { success: true, isAutoSent: false, nativeWhatsAppUrl, status: 'fallback_native_link', error: String(err) };
    }
  }

  return { success: true, isAutoSent: false, nativeWhatsAppUrl, status: 'client_not_connected' };
}

// ==========================================
// 📡 API ENDPOINTS
// ==========================================

// 1. Health check & status
app.get('/api/health', (req, res) => {
  return res.json({
    status: 'ok',
    uptime: process.uptime(),
    isWhatsAppReady,
    whatsappUser,
    totalAppointments: appointments.length,
    pendingAppointments: appointments.filter(a => a.status === 'pending').length,
    timestamp: new Date().toISOString()
  });
});

// 2. WhatsApp Status & QR Code
app.get('/api/whatsapp/status', (req, res) => {
  let statusText = 'En attente de connexion';
  if (isWhatsAppReady) {
    statusText = 'Connecté et Prêt';
  } else if (qrCodeDataUrl) {
    statusText = 'En attente du scan du QR Code';
  } else if (isInitializing) {
    statusText = 'Initialisation en cours...';
  }

  return res.json({
    isReady: isWhatsAppReady,
    isInitializing,
    qrCodeDataUrl,
    whatsappUser,
    statusText,
    lastError,
    lastUpdated: new Date().toISOString()
  });
});

// 3. Restart WhatsApp Client
app.post('/api/whatsapp/restart', async (req, res) => {
  try {
    if (whatsappClient) {
      try {
        await whatsappClient.destroy();
      } catch {}
    }
    initWhatsAppClient();
    return res.json({ success: true, message: 'Client WhatsApp redémarré.' });
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
});

// 4. Send WhatsApp directly via API
app.post('/api/send-whatsapp', async (req, res) => {
  const { to, message } = req.body;
  if (!to || !message) {
    return res.status(400).json({ error: 'Numéro et message requis' });
  }
  const result = await sendWhatsAppDirect(to, message);
  return res.json(result);
});

// 5. Get all appointments (for real-time dashboard)
app.get('/api/appointments', (req, res) => {
  return res.json(appointments);
});

// 6. Create a new appointment
app.post('/api/appointments', async (req, res) => {
  try {
    const data = req.body;
    if (!data.patientName || !data.patientPhone || !data.date || !data.time) {
      return res.status(400).json({ error: 'Champs obligatoires manquants.' });
    }

    const reqDate = String(data.date).trim();
    const reqTime = String(data.time).trim();

    // Vérification stricte : fenêtre des 7 prochains jours uniquement
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const [y, m, d] = reqDate.split('-').map(Number);
    const targetDate = new Date(y, m - 1, d);
    targetDate.setHours(0, 0, 0, 0);
    const diffDays = Math.round((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0 || diffDays > 14) {
      return res.status(400).json({ error: 'Les réservations sont autorisées pour la période du dimanche au dimanche.' });
    }

    // Vérification si la date est bloquée par Aymen
    if (availability && Array.isArray(availability.blockedDates) && availability.blockedDates.some(b => b.date === reqDate)) {
      return res.status(400).json({ error: 'Aymen n\'est pas disponible à cette date.' });
    }

    // Vérification que le créneau est bien configuré et ouvert par Aymen
    if (availability && availability.customDateSlots && availability.customDateSlots[reqDate] !== undefined) {
      const dayCfg = availability.customDateSlots[reqDate];
      if (!dayCfg.enabled || !Array.isArray(dayCfg.slots) || !dayCfg.slots.includes(reqTime)) {
        return res.status(400).json({ error: 'Ce créneau n\'est pas proposé par Aymen.' });
      }
    }

    // Règle stricte : Cours 100% individuels, aucun doublon possible
    const isConflict = appointments.some(
      a => a.date === reqDate && a.time === reqTime && (a.status === 'accepted' || a.status === 'pending') && a.id !== data.id
    );

    if (isConflict) {
      logActivity(`Refus réservation : créneau déjà réservé en individuel (${reqDate} à ${reqTime}) par ${data.patientName}`);
      return res.status(409).json({
        error: `Ce créneau (${reqDate} à ${reqTime}) est déjà réservé par un autre élève. Les cours sont strictement individuels.`
      });
    }

    const newApt = {
      id: data.id || 'apt-' + Date.now(),
      patientName: data.patientName.trim(),
      patientEmail: data.patientEmail || '',
      patientPhone: data.patientPhone.trim(),
      motif: data.motif || 'Cours particulier',
      type: data.type || 'zoom',
      zoomLink: data.zoomLink || 'https://us05web.zoom.us/j/9133195007?pwd=k9qcjEJ7F6KnQQKhQ15wWwhsznak5f.1',
      date: reqDate,
      time: reqTime,
      status: data.status || 'pending',
      patientNotes: data.patientNotes || '',
      createdAt: data.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    appointments = [newApt, ...appointments.filter(a => a.id !== newApt.id)];
    saveAppointments(appointments);

    logActivity(`Nouvelle réservation reçue : ${newApt.patientName} (${newApt.date} à ${newApt.time})`);

    // 1. Notification WhatsApp automatique envoyée directement à Aymen
    const AYMEN_PHONE = process.env.AYMEN_PHONE || '06 13 92 09 87';
    const aymenAlertMsg = `Salam aleykoum Aymen, nouveau cours réservé :
- Élève : ${newApt.patientName} (${newApt.patientPhone})
- Horaire : ${newApt.date} à ${newApt.time} (Paris)
- Format : ${newApt.type === 'zoom' ? 'Zoom' : 'WhatsApp'}${newApt.patientNotes ? `\n- Note : ${newApt.patientNotes}` : ''}`;

    sendWhatsAppDirect(AYMEN_PHONE, aymenAlertMsg).catch(err => {
      console.error('Erreur alerte WhatsApp envoyée à Aymen:', err);
    });

    // 2. Notification WhatsApp automatique envoyée à l'élève
    const confirmMsg = `Salam aleykoum ${newApt.patientName}, demande reçue : cours le ${newApt.date} à ${newApt.time} (Paris). En attente de validation par Aymen.`;
    sendWhatsAppDirect(newApt.patientPhone, confirmMsg).catch(() => {});

    return res.status(201).json({
      success: true,
      appointment: newApt
    });
  } catch (err) {
    return res.status(500).json({ error: 'Erreur création cours.' });
  }
});

// 7. Update an appointment (Accept, Counter-proposal, Decline)
app.put('/api/appointments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const index = appointments.findIndex(a => a.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Réservation non trouvée.' });
    }

    const previousStatus = appointments[index].status;
    appointments[index] = {
      ...appointments[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    saveAppointments(appointments);
    const updated = appointments[index];

    logActivity(`Réservation ${id} mise à jour : statut = ${updated.status}`);

    // If Aymen just accepted the appointment: send WhatsApp automatically with Zoom link!
    if (previousStatus !== 'accepted' && updated.status === 'accepted') {
      const zoomUrl = updated.zoomLink || 'https://us05web.zoom.us/j/9133195007?pwd=k9qcjEJ7F6KnQQKhQ15wWwhsznak5f.1';
      const isZoom = updated.type === 'zoom';
      const zoomText = isZoom ? ` Lien Zoom : ${zoomUrl}` : ' sur WhatsApp.';
      const msg = `Salam aleykoum ${updated.patientName}, cours validé pour le ${updated.date} à ${updated.time} (Paris).${zoomText}`;
      sendWhatsAppDirect(updated.patientPhone, msg).catch(() => {});
    }

    return res.json({ success: true, appointment: updated });
  } catch (err) {
    return res.status(500).json({ error: 'Erreur mise à jour.' });
  }
});

// 8. Delete an appointment
app.delete('/api/appointments/:id', (req, res) => {
  try {
    const { id } = req.params;
    appointments = appointments.filter(a => a.id !== id);
    saveAppointments(appointments);
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: 'Erreur suppression.' });
  }
});

// 9. Availability endpoints
app.get('/api/availability', (req, res) => {
  return res.json(availability);
});

app.post('/api/availability', (req, res) => {
  try {
    availability = { ...availability, ...req.body, updatedAt: new Date().toISOString() };
    saveAvailability(availability);
    const slotsCount = availability.customDateSlots ? Object.keys(availability.customDateSlots).length : 0;
    logActivity(`Mise à jour des disponibilités d'Aymen enregistrée (${slotsCount} dates configurées)`);
    return res.json({ success: true, availability });
  } catch (err) {
    return res.status(500).json({ error: 'Erreur disponibilités.' });
  }
});

// Fallback route
app.get('/', (req, res) => {
  res.send('API Backend Cours Aymen - Synchronisation & WhatsApp Robot Opérationnel 🚀');
});

// Start listening
app.listen(PORT, () => {
  console.log(`\n🚀 Serveur Express démarré sur le port ${PORT}`);
  console.log(`📡 Synchronisation des réservations et client WhatsApp actifs.`);
});
