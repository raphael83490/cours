import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS for Netlify, local dev, and all web clients
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

// Helper to log server activity
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
    date: new Date().toISOString().split('T')[0],
    time: '18:00',
    status: 'pending',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    patientNotes: 'Débutant en récitation, souhaite revoir les règles d\'assimilation.'
  }
];

// Load appointments
function loadAppointments() {
  try {
    if (fs.existsSync(APPOINTMENTS_FILE)) {
      const content = fs.readFileSync(APPOINTMENTS_FILE, 'utf8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error('Erreur lecture appointments.json:', err);
  }
  return DEFAULT_APPOINTMENTS;
}

// Save appointments
function saveAppointments(data) {
  try {
    fs.writeFileSync(APPOINTMENTS_FILE, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Erreur écriture appointments.json:', err);
    return false;
  }
}

// Load availability
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

// Save availability
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
// 📡 API ENDPOINTS
// ==========================================

// 1. Health check & status
app.get('/api/health', (req, res) => {
  return res.json({
    status: 'ok',
    uptime: process.uptime(),
    totalAppointments: appointments.length,
    pendingAppointments: appointments.filter(a => a.status === 'pending').length,
    timestamp: new Date().toISOString()
  });
});

// 2. Get all appointments (for Aymen's real-time dashboard)
app.get('/api/appointments', (req, res) => {
  return res.json(appointments);
});

// 3. Create a new appointment (when student books on the site)
app.post('/api/appointments', (req, res) => {
  try {
    const data = req.body;
    if (!data.patientName || !data.patientPhone || !data.date || !data.time) {
      return res.status(400).json({ error: 'Champs obligatoires manquants (nom, téléphone, date, créneau).' });
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

    // Prepend to list
    appointments = [newApt, ...appointments.filter(a => a.id !== newApt.id)];
    saveAppointments(appointments);

    logActivity(`Nouvelle réservation reçue : ${newApt.patientName} (${newApt.date} à ${newApt.time})`);

    return res.status(201).json({
      success: true,
      message: 'Réservation transmise à Aymen avec succès.',
      appointment: newApt
    });
  } catch (err) {
    console.error('Error creating appointment:', err);
    return res.status(500).json({ error: 'Erreur serveur lors de la création du cours.' });
  }
});

// 4. Update an appointment (Accept, Counter-proposal, Cancel, etc.)
app.put('/api/appointments/:id', (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const index = appointments.findIndex(a => a.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Réservation non trouvée.' });
    }

    appointments[index] = {
      ...appointments[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    saveAppointments(appointments);
    logActivity(`Réservation ${id} mise à jour : statut = ${appointments[index].status}`);

    return res.json({
      success: true,
      appointment: appointments[index]
    });
  } catch (err) {
    console.error('Error updating appointment:', err);
    return res.status(500).json({ error: 'Erreur serveur lors de la mise à jour.' });
  }
});

// 5. Delete an appointment
app.delete('/api/appointments/:id', (req, res) => {
  try {
    const { id } = req.params;
    appointments = appointments.filter(a => a.id !== id);
    saveAppointments(appointments);
    logActivity(`Réservation ${id} supprimée`);
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: 'Erreur suppression.' });
  }
});

// 6. Availability endpoints
app.get('/api/availability', (req, res) => {
  return res.json(availability);
});

app.post('/api/availability', (req, res) => {
  try {
    availability = {
      ...availability,
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    saveAvailability(availability);
    logActivity('Disponibilités mises à jour par Aymen');
    return res.json({ success: true, availability });
  } catch (err) {
    return res.status(500).json({ error: 'Erreur enregistrement disponibilités.' });
  }
});

// 7. Direct WhatsApp link helper endpoint
app.post('/api/whatsapp/direct-link', (req, res) => {
  const { to, message } = req.body;
  if (!to || !message) {
    return res.status(400).json({ error: 'Numéro et message requis' });
  }
  let clean = to.replace(/[\s.-]/g, '');
  if (clean.startsWith('0') && clean.length === 10) {
    clean = '33' + clean.substring(1);
  } else if (clean.startsWith('+')) {
    clean = clean.substring(1);
  }
  const url = `https://wa.me/${clean}?text=${encodeURIComponent(message)}`;
  return res.json({ success: true, url, formattedPhone: clean });
});

// Fallback route
app.get('/', (req, res) => {
  res.send('API Backend Cours Aymen - Opérationnel 🚀');
});

// Start listening
app.listen(PORT, () => {
  console.log(`\n🚀 Serveur Express démarré sur http://localhost:${PORT}`);
  console.log(`📡 Synchronisation des réservations et agenda active.`);
});
