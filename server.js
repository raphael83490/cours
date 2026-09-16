import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;
import qrcodeTerminal from 'qrcode-terminal';
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

app.use(cors());
app.use(express.json());

// Log file for outbound SMS and WhatsApp history
const SMS_LOG_PATH = path.resolve(process.cwd(), 'outbound_sms.log');
const WA_LOG_PATH = path.resolve(process.cwd(), 'outbound_whatsapp.log');

// ==========================================
// 🟢 WHATSAPP CLIENT CONFIGURATION (100% GRATUIT)
// ==========================================
let qrCodeDataUrl = null;
let qrCodeRaw = null;
let isWhatsAppReady = false;
let isInitializing = false;
let whatsappUser = null;
let lastError = null;

const whatsappClient = new Client({
  authStrategy: new LocalAuth({
    dataPath: path.resolve(process.cwd(), '.wwebjs_auth')
  }),
  puppeteer: {
    headless: true,
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

// Event: QR Code generated (requires user scanning with phone)
whatsappClient.on('qr', async (qr) => {
  qrCodeRaw = qr;
  isWhatsAppReady = false;
  lastError = null;

  console.log('\n╔══════════════════════════════════════════════════════════╗');
  console.log('║ 📱 SCANNEZ CE QR CODE AVEC VOTRE APPLICATION WHATSAPP   ║');
  console.log('║ 1. Ouvrez WhatsApp sur votre téléphone                  ║');
  console.log('║ 2. Allez dans Réglages > Appareils connectés             ║');
  console.log('║ 3. Appuyez sur "Connecter un appareil" et scannez ceci   ║');
  console.log('╚══════════════════════════════════════════════════════════╝\n');
  
  qrcodeTerminal.generate(qr, { small: true });

  try {
    qrCodeDataUrl = await QRCode.toDataURL(qr, {
      width: 320,
      margin: 2,
      color: {
        dark: '#064E3B',
        light: '#FFFFFF'
      }
    });
  } catch (err) {
    console.error('Erreur génération QR Code DataURL:', err);
  }
});

// Event: WhatsApp is authenticated
whatsappClient.on('authenticated', () => {
  console.log('🔐 Session WhatsApp authentifiée avec succès !');
  lastError = null;
});

// Event: WhatsApp client is ready to send messages
whatsappClient.on('ready', () => {
  isWhatsAppReady = true;
  qrCodeDataUrl = null;
  qrCodeRaw = null;
  lastError = null;

  try {
    whatsappUser = whatsappClient.info ? (whatsappClient.info.pushname || whatsappClient.info.wid?.user) : 'Connecté';
  } catch {
    whatsappUser = 'Connecté';
  }

  console.log('✅ WHATSAPP WEB CLIENT EST PRÊT ! Les messages automatiques peuvent être envoyés.');
});

// Event: Auth failure
whatsappClient.on('auth_failure', (msg) => {
  console.error('❌ Échec d\'authentification WhatsApp:', msg);
  isWhatsAppReady = false;
  lastError = 'Échec d\'authentification: ' + msg;
});

// Event: Disconnected
whatsappClient.on('disconnected', (reason) => {
  console.log('⚠️ WhatsApp Client déconnecté:', reason);
  isWhatsAppReady = false;
  whatsappUser = null;
  lastError = 'Déconnecté: ' + reason;
});

// Initialize client asynchronously
async function startWhatsApp() {
  if (isInitializing) return;
  isInitializing = true;
  try {
    console.log('⏳ Initialisation du client WhatsApp Web...');
    await whatsappClient.initialize();
  } catch (err) {
    console.error('❌ Erreur lors du lancement de WhatsApp Client:', err);
    lastError = String(err);
  } finally {
    isInitializing = false;
  }
}

startWhatsApp();

// ==========================================
// 📡 WHATSAPP API ENDPOINTS
// ==========================================

// 1. Get WhatsApp connection status and current QR code
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

// 2. Restart / Reconnect WhatsApp client
app.post('/api/whatsapp/restart', async (req, res) => {
  try {
    isWhatsAppReady = false;
    qrCodeDataUrl = null;
    try {
      await whatsappClient.destroy();
    } catch {}
    startWhatsApp();
    return res.json({ success: true, message: 'Redémarrage du client WhatsApp en cours...' });
  } catch (err) {
    return res.status(500).json({ success: false, error: String(err) });
  }
});

// 3. Send WhatsApp message automatically
app.post('/api/send-whatsapp', async (req, res) => {
  try {
    const { to, message } = req.body;

    if (!to || !message) {
      return res.status(400).json({ success: false, error: 'Numéro de téléphone et message requis' });
    }

    // Clean phone number (e.g. 06 12 34 56 78 -> 33612345678)
    let cleaned = to.replace(/[\s.-]/g, '');
    if (cleaned.startsWith('0') && cleaned.length === 10) {
      cleaned = '33' + cleaned.substring(1);
    } else if (cleaned.startsWith('+')) {
      cleaned = cleaned.substring(1);
    }

    const chatId = `${cleaned}@c.us`;
    const timestamp = new Date().toISOString();
    const encodedBody = encodeURIComponent(message);
    const nativeWhatsAppUrl = `https://wa.me/${cleaned}?text=${encodedBody}`;

    let dispatchStatus = 'dispatched';
    let errorDetail = null;

    if (isWhatsAppReady) {
      try {
        await whatsappClient.sendMessage(chatId, message);
        dispatchStatus = 'sent_via_whatsapp_web';
        console.log(`✅ Message WhatsApp envoyé avec succès au ${cleaned} : "${message.substring(0, 50)}..."`);
      } catch (err) {
        console.error('Erreur envoi WhatsApp via client:', err);
        dispatchStatus = 'error_client_send';
        errorDetail = String(err);
      }
    } else {
      dispatchStatus = 'client_not_connected_fallback_link';
    }

    // Append to log file
    const logEntry = `[${timestamp}] TO: ${cleaned} | STATUS: ${dispatchStatus} | MSG: ${message}\n`;
    fs.appendFileSync(WA_LOG_PATH, logEntry, 'utf8');

    return res.json({
      success: true,
      formattedPhone: cleaned,
      status: dispatchStatus,
      isAutoSent: dispatchStatus === 'sent_via_whatsapp_web',
      nativeWhatsAppUrl,
      errorDetail,
      timestamp
    });
  } catch (error) {
    console.error('Error in /api/send-whatsapp:', error);
    return res.status(500).json({ success: false, error: String(error) });
  }
});

// 4. WhatsApp logs endpoint
app.get('/api/whatsapp/logs', (req, res) => {
  try {
    if (fs.existsSync(WA_LOG_PATH)) {
      const logs = fs.readFileSync(WA_LOG_PATH, 'utf8');
      return res.send(logs);
    }
    return res.send('Aucun message WhatsApp envoyé pour le moment.');
  } catch {
    return res.status(500).send('Erreur lecture logs WhatsApp.');
  }
});

// ==========================================
// 📱 SMS API ENDPOINTS (Existant conservé)
// ==========================================

app.post('/api/send-sms', async (req, res) => {
  try {
    const { to, message, smsConfig } = req.body;

    if (!to || !message) {
      return res.status(400).json({ success: false, error: 'Numéro de téléphone et message requis' });
    }

    let formattedPhone = to.replace(/[\s.-]/g, '');
    if (formattedPhone.startsWith('0') && formattedPhone.length === 10) {
      formattedPhone = '+33' + formattedPhone.substring(1);
    }

    const timestamp = new Date().toISOString();
    let dispatchStatus = 'dispatched';
    let providerUsed = smsConfig?.provider || 'native';
    let providerResponse = null;

    if (smsConfig?.provider === 'twilio' && smsConfig.twilioAccountSid && smsConfig.twilioAuthToken && smsConfig.twilioFromNumber) {
      try {
        const auth = Buffer.from(`${smsConfig.twilioAccountSid}:${smsConfig.twilioAuthToken}`).toString('base64');
        const params = new URLSearchParams();
        params.append('To', formattedPhone);
        params.append('From', smsConfig.twilioFromNumber);
        params.append('Body', message);

        const twilioRes = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${smsConfig.twilioAccountSid}/Messages.json`, {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: params
        });

        const twilioData = await twilioRes.json();
        if (twilioRes.ok) {
          dispatchStatus = 'sent_via_twilio';
          providerResponse = { sid: twilioData.sid, status: twilioData.status };
        } else {
          dispatchStatus = 'twilio_error: ' + (twilioData.message || 'Error');
        }
      } catch (err) {
        dispatchStatus = 'twilio_exception: ' + String(err);
      }
    } else if (smsConfig?.provider === 'brevo' && smsConfig.brevoApiKey) {
      try {
        const brevoRes = await fetch('https://api.brevo.com/v3/transactionalSMS/sms', {
          method: 'POST',
          headers: {
            'api-key': smsConfig.brevoApiKey,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            sender: smsConfig.brevoSender || 'AymenCours',
            recipient: formattedPhone,
            content: message,
            type: 'transactional'
          })
        });

        const brevoData = await brevoRes.json();
        if (brevoRes.ok) {
          dispatchStatus = 'sent_via_brevo';
          providerResponse = brevoData;
        } else {
          dispatchStatus = 'brevo_error: ' + (brevoData.message || 'Error');
        }
      } catch (err) {
        dispatchStatus = 'brevo_exception: ' + String(err);
      }
    }

    const encodedBody = encodeURIComponent(message);
    const nativeSmsUrl = `sms:${formattedPhone}?&body=${encodedBody}`;

    const logEntry = `[${timestamp}] TO: ${formattedPhone} | STATUS: ${dispatchStatus} | PROVIDER: ${providerUsed} | MSG: ${message}\n`;
    fs.appendFileSync(SMS_LOG_PATH, logEntry, 'utf8');

    return res.json({
      success: true,
      formattedPhone,
      status: dispatchStatus,
      provider: providerUsed,
      providerResponse,
      nativeSmsUrl,
      timestamp
    });
  } catch (error) {
    console.error('Error in /api/send-sms:', error);
    return res.status(500).json({ success: false, error: String(error) });
  }
});

app.get('/api/sms-logs', (req, res) => {
  try {
    if (fs.existsSync(SMS_LOG_PATH)) {
      const logs = fs.readFileSync(SMS_LOG_PATH, 'utf8');
      return res.send(logs);
    }
    return res.send('Aucun SMS envoyé pour le moment.');
  } catch {
    return res.status(500).send('Erreur lecture logs.');
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Serveur Backend SMS & WhatsApp démarré sur le port ${PORT}`);
});
