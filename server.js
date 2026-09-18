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
const DEFAULT_APPOINTMENTS = [
  {
    id: 'apt-1',
    patientName: 'Sofiane B.',
    patientEmail: 'sofiane@exemple.fr',
    patientPhone: '06 12 34 56 78',
    motif: 'Lecture & Récitation (Tajwid)',
    type: 'zoom',
    zoomLink: 'https://us05web.zoom.us/j/9133195007?pwd=k9qcjEJ7F6KnQQKhQ15wWwhsznak5f.1',
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    time: '18:00',
    status: 'pending',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    patientNotes: 'Débutant en récitation, souhaite revoir les règles d\'assimilation.'
  }
];

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

    const newApt = {
      id: data.id || 'apt-' + Date.now(),
      patientName: data.patientName.trim(),
      patientEmail: data.patientEmail || '',
      patientPhone: data.patientPhone.trim(),
      motif: data.motif || 'Cours particulier',
      type: data.type || 'zoom',
      zoomLink: data.zoomLink || 'https://us05web.zoom.us/j/9133195007?pwd=k9qcjEJ7F6KnQQKhQ15wWwhsznak5f.1',
      date: data.date,
      time: data.time,
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
    const aymenAlertMsg = `📢 NOUVELLE DEMANDE DE COURS (COURS AYMEN)

Salam Aleykoum Aymen, un élève vient de demander un créneau :
👤 Élève : ${newApt.patientName}
📞 Téléphone : ${newApt.patientPhone}
📖 Cours : ${newApt.motif}
📅 Date : ${newApt.date} à ${newApt.time} (Heure de Paris)
💻 Type : ${newApt.type === 'zoom' ? 'Zoom (Visioconférence)' : 'WhatsApp (Appel/Vidéo)'}${newApt.patientNotes ? `\n📝 Note élève : "${newApt.patientNotes}"` : ''}

👉 Connectez-vous à votre espace enseignant pour confirmer le créneau ou proposer un autre horaire.`;

    sendWhatsAppDirect(AYMEN_PHONE, aymenAlertMsg).catch(err => {
      console.error('Erreur alerte WhatsApp envoyée à Aymen:', err);
    });

    // 2. Notification WhatsApp automatique envoyée à l'élève
    const confirmMsg = `COURS AYMEN : Salam Aleykoum ${newApt.patientName}, votre demande de cours (${newApt.motif}) pour le ${newApt.date} à ${newApt.time} (Heure de Paris) a bien été reçue par Aymen. Vous recevrez la confirmation et la salle Zoom dès validation.`;
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
      const msg = `COURS AYMEN : ✅ Salam Aleykoum ${updated.patientName}, Aymen a confirmé votre cours du ${updated.date} à ${updated.time} (Heure de Paris). 🎥 Lien pour rejoindre la salle Zoom : ${zoomUrl}`;
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
