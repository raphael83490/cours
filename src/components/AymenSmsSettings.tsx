import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Smartphone, 
  Send, 
  Save, 
  CheckCircle2, 
  AlertCircle,
  RefreshCw,
  QrCode,
  MessageSquare
} from 'lucide-react';

export const AymenSmsSettings: React.FC = () => {
  const { 
    smsConfig, 
    updateSmsConfig, 
    sendRealSms, 
    fetchWhatsAppStatus, 
    restartWhatsApp, 
    whatsAppStatus, 
    showToast 
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'whatsapp' | 'sms'>('whatsapp');

  // SMS Configuration State
  const [provider, setProvider] = useState<'native' | 'twilio' | 'brevo'>(smsConfig.provider || 'native');
  const [twilioAccountSid, setTwilioAccountSid] = useState(smsConfig.twilioAccountSid || '');
  const [twilioAuthToken, setTwilioAuthToken] = useState(smsConfig.twilioAuthToken || '');
  const [twilioFromNumber, setTwilioFromNumber] = useState(smsConfig.twilioFromNumber || '');
  const [brevoApiKey, setBrevoApiKey] = useState(smsConfig.brevoApiKey || '');
  const [brevoSender, setBrevoSender] = useState(smsConfig.brevoSender || 'AymenCours');

  const [isRestartingWa, setIsRestartingWa] = useState(false);

  // SMS Testing State
  const [testPhone, setTestPhone] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; nativeSmsUrl?: string } | null>(null);

  // Auto-poll WhatsApp status when WhatsApp tab is active
  useEffect(() => {
    fetchWhatsAppStatus();
    const interval = setInterval(() => {
      fetchWhatsAppStatus();
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleSaveSmsConfig = (e: React.FormEvent) => {
    e.preventDefault();
    updateSmsConfig({
      provider,
      twilioAccountSid: twilioAccountSid.trim() || undefined,
      twilioAuthToken: twilioAuthToken.trim() || undefined,
      twilioFromNumber: twilioFromNumber.trim() || undefined,
      brevoApiKey: brevoApiKey.trim() || undefined,
      brevoSender: brevoSender.trim() || undefined
    });
  };


  const handleRestartWaClient = async () => {
    setIsRestartingWa(true);
    await restartWhatsApp();
    setIsRestartingWa(false);
  };

  const handleTestSms = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testPhone.trim()) return;

    setIsTesting(true);
    setTestResult(null);

    const testMessage = `COURS AYMEN : Ceci est un test d'envoi de SMS depuis votre plateforme Cours Aymen.`;

    try {
      const res = await sendRealSms(testPhone.trim(), testMessage);
      setIsTesting(false);
      setTestResult({
        success: true,
        message: `SMS généré et envoyé pour le ${testPhone} (Statut: ${res.status}).`,
        nativeSmsUrl: res.nativeSmsUrl
      });
      showToast('Test SMS envoyé', `Le SMS a été transmis pour le numéro ${testPhone}.`, 'success');
    } catch (err) {
      setIsTesting(false);
      setTestResult({
        success: false,
        message: 'Erreur lors de l\'envoi : ' + String(err)
      });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Subtabs Switcher */}
      <div style={{
        display: 'flex',
        background: '#E2E8F0',
        padding: '4px',
        borderRadius: '14px',
        gap: '6px',
        maxWidth: '480px'
      }}>
        <button
          type="button"
          onClick={() => setActiveSubTab('whatsapp')}
          style={{
            flex: 1,
            padding: '10px 16px',
            borderRadius: '10px',
            border: 'none',
            fontWeight: 800,
            fontSize: '0.92rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            background: activeSubTab === 'whatsapp' ? '#25D366' : 'transparent',
            color: activeSubTab === 'whatsapp' ? '#064E3B' : '#475569',
            boxShadow: activeSubTab === 'whatsapp' ? '0 4px 12px rgba(37, 211, 102, 0.3)' : 'none',
            transition: 'all 0.2s'
          }}
        >
          <MessageSquare size={18} />
          <span>WhatsApp (100% Gratuit)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('sms')}
          style={{
            flex: 1,
            padding: '10px 16px',
            borderRadius: '10px',
            border: 'none',
            fontWeight: 800,
            fontSize: '0.92rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            background: activeSubTab === 'sms' ? 'white' : 'transparent',
            color: activeSubTab === 'sms' ? '#064E3B' : '#475569',
            boxShadow: activeSubTab === 'sms' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
            transition: 'all 0.2s'
          }}
        >
          <Smartphone size={18} />
          <span>SMS Classique</span>
        </button>
      </div>

      {/* ========================================== */}
      {/* 🟢 TAB 1: WHATSAPP AUTOMATION BOT (100% GRATUIT) */}
      {/* ========================================== */}
      {activeSubTab === 'whatsapp' && (
        <div className="animate-slide-up" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Card: WhatsApp Status & QR Code */}
          <div className="card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  background: '#25D366',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#064E3B'
                }}>
                  <MessageSquare size={24} />
                </div>
                <div>
                  <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#064E3B' }}>
                    Connexion WhatsApp Automatique (100% Gratuit)
                  </h2>
                  <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)' }}>
                    Connectez votre propre WhatsApp pour envoyer les confirmations de cours automatiquement sans rien payer.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleRestartWaClient}
                disabled={isRestartingWa}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.82rem' }}
              >
                <RefreshCw size={14} className={isRestartingWa ? 'animate-spin' : ''} />
                {isRestartingWa ? 'Redémarrage...' : 'Réinitialiser WhatsApp'}
              </button>
            </div>

            {/* STATUS BANNER */}
            {whatsAppStatus?.isReady ? (
              <div style={{
                background: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)',
                border: '2px solid #34D399',
                borderRadius: '16px',
                padding: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '16px',
                boxShadow: '0 4px 16px rgba(52, 211, 153, 0.2)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: '#10B981',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white'
                  }}>
                    <CheckCircle2 size={28} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#065F46' }}>
                      🟢 Session WhatsApp Active & Connectée
                    </div>
                    <div style={{ fontSize: '0.88rem', color: '#047857', marginTop: '2px' }}>
                      Utilisateur connecté : <strong>{whatsAppStatus.whatsappUser || 'Votre Compte WhatsApp'}</strong>
                    </div>
                    <div style={{ fontSize: '0.82rem', color: '#059669', marginTop: '4px' }}>
                      ⚡ Vos élèves reçoivent leurs messages WhatsApp instantanément et automatiquement dès qu'un cours est réservé ou validé.
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    background: '#047857',
                    color: 'white',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    padding: '6px 12px',
                    borderRadius: '20px'
                  }}>
                    Prêt pour les envois
                  </span>
                </div>
              </div>
            ) : whatsAppStatus?.qrCodeDataUrl ? (
              /* QR CODE SCAN VIEW */
              <div style={{
                background: '#F8FAFC',
                border: '2px dashed #94A3B8',
                borderRadius: '18px',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '20px',
                textAlign: 'center'
              }}>
                <div style={{ maxWidth: '520px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
                    <QrCode size={24} color="#047857" />
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#064E3B' }}>
                      Scannez ce QR Code avec votre téléphone (1 seule fois)
                    </h3>
                  </div>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                    C'est exactement comme pour vous connecter à WhatsApp Web sur un ordinateur.
                  </p>
                </div>

                {/* QR Code Image */}
                <div style={{
                  background: 'white',
                  padding: '16px',
                  borderRadius: '16px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                  border: '1px solid #E2E8F0'
                }}>
                  <img 
                    src={whatsAppStatus.qrCodeDataUrl} 
                    alt="WhatsApp QR Code" 
                    style={{ width: '240px', height: '240px', display: 'block', borderRadius: '8px' }}
                  />
                </div>

                {/* Instructions steps */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '12px',
                  width: '100%',
                  maxWidth: '680px',
                  textAlign: 'left'
                }}>
                  <div style={{ background: 'white', padding: '12px 14px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#047857', marginBottom: '2px' }}>1. Ouvrez WhatsApp</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Sur votre iPhone ou Android</div>
                  </div>
                  <div style={{ background: 'white', padding: '12px 14px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#047857', marginBottom: '2px' }}>2. Appareils connectés</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Allez dans Réglages &gt; Appareils connectés</div>
                  </div>
                  <div style={{ background: 'white', padding: '12px 14px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#047857', marginBottom: '2px' }}>3. Scannez le QR Code</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Pointez l'appareil photo vers l'écran</div>
                  </div>
                </div>
              </div>
            ) : (
              /* WAITING / INITIALIZING */
              <div style={{
                background: '#F8FAFC',
                borderRadius: '16px',
                padding: '30px 20px',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px'
              }}>
                <RefreshCw size={32} color="#047857" className="animate-spin" />
                <div style={{ fontWeight: 800, fontSize: '1rem', color: '#064E3B' }}>
                  {whatsAppStatus?.statusText || 'Génération du QR Code de connexion WhatsApp...'}
                </div>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', maxWidth: '400px' }}>
                  Le serveur prépare la session WhatsApp. Le QR Code va s'afficher ici dans quelques instants.
                </p>
              </div>
            )}
          </div>

        </div>
      )}

      {/* ========================================== */}
      {/* 📱 TAB 2: SMS CONFIGURATION & TESTING */}
      {/* ========================================== */}
      {activeSubTab === 'sms' && (
        <div className="animate-slide-up" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div className="card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <Smartphone size={24} color="#047857" />
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#064E3B' }}>
                Configuration des SMS Classiques
              </h2>
            </div>
            <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)' }}>
              Choisissez comment vous souhaitez expédier les SMS à vos élèves (envoi direct depuis votre smartphone ou via API Twilio/Brevo).
            </p>

            {/* Provider Choice */}
            <form onSubmit={handleSaveSmsConfig} style={{ marginTop: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', marginBottom: '20px' }}>
                
                {/* Option 1 : Native Direct */}
                <div
                  onClick={() => setProvider('native')}
                  style={{
                    padding: '16px',
                    borderRadius: 'var(--radius-md)',
                    border: `2px solid ${provider === 'native' ? '#047857' : '#E2E8F0'}`,
                    background: provider === 'native' ? '#F0FDF4' : 'white',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ fontWeight: 800, fontSize: '1rem', color: '#064E3B', marginBottom: '4px' }}>
                    📲 Envoi Direct Mobile (Gratuit)
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    Ouvre l'application SMS de votre téléphone avec le message prêt.
                  </div>
                </div>

                {/* Option 2 : Twilio */}
                <div
                  onClick={() => setProvider('twilio')}
                  style={{
                    padding: '16px',
                    borderRadius: 'var(--radius-md)',
                    border: `2px solid ${provider === 'twilio' ? '#047857' : '#E2E8F0'}`,
                    background: provider === 'twilio' ? '#F0FDF4' : 'white',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ fontWeight: 800, fontSize: '1rem', color: '#064E3B', marginBottom: '4px' }}>
                    ⚡ API Twilio (Automatique)
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    Envoi 100% en tâche de fond avec votre compte Twilio.
                  </div>
                </div>

                {/* Option 3 : Brevo */}
                <div
                  onClick={() => setProvider('brevo')}
                  style={{
                    padding: '16px',
                    borderRadius: 'var(--radius-md)',
                    border: `2px solid ${provider === 'brevo' ? '#047857' : '#E2E8F0'}`,
                    background: provider === 'brevo' ? '#F0FDF4' : 'white',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ fontWeight: 800, fontSize: '1rem', color: '#064E3B', marginBottom: '4px' }}>
                    ⚡ API Brevo / Sendinblue
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    Envoi automatique de SMS transactionnels via votre clé Brevo.
                  </div>
                </div>
              </div>

              {/* Twilio fields */}
              {provider === 'twilio' && (
                <div className="animate-slide-up" style={{ background: '#F8FAFC', padding: '18px', borderRadius: '8px', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px' }}>Twilio Account SID</label>
                    <input
                      type="text"
                      placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                      value={twilioAccountSid}
                      onChange={(e) => setTwilioAccountSid(e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px' }}>Twilio Auth Token</label>
                    <input
                      type="password"
                      placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                      value={twilioAuthToken}
                      onChange={(e) => setTwilioAuthToken(e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px' }}>Numéro Twilio Expéditeur (From Number)</label>
                    <input
                      type="text"
                      placeholder="+1xxxxxxxxxx ou +33xxxxxxxx"
                      value={twilioFromNumber}
                      onChange={(e) => setTwilioFromNumber(e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1' }}
                    />
                  </div>
                </div>
              )}

              {/* Brevo fields */}
              {provider === 'brevo' && (
                <div className="animate-slide-up" style={{ background: '#F8FAFC', padding: '18px', borderRadius: '8px', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px' }}>Clé API Brevo (v3 API-key)</label>
                    <input
                      type="password"
                      placeholder="xkeysib-xxxxxxxxxxxxxxxxxxxxxxxx"
                      value={brevoApiKey}
                      onChange={(e) => setBrevoApiKey(e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, marginBottom: '4px' }}>Nom d'expéditeur (ex: AymenCours, max 11 caractères)</label>
                    <input
                      type="text"
                      placeholder="AymenCours"
                      value={brevoSender}
                      onChange={(e) => setBrevoSender(e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #CBD5E1' }}
                    />
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button type="submit" className="btn btn-primary">
                  <Save size={16} /> Enregistrer la configuration SMS
                </button>
              </div>
            </form>
          </div>

          {/* Test Live SMS Form */}
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#064E3B', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Send size={18} color="#047857" /> Tester l'envoi d'un SMS réel
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Saisissez votre numéro de portable pour vérifier la bonne réception du SMS.
            </p>

            <form onSubmit={handleTestSms} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '14px' }}>
              <input
                type="tel"
                required
                placeholder="Ex: 06 12 34 56 78"
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
                style={{ flex: 1, minWidth: '220px', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #CBD5E1', fontSize: '1rem' }}
              />

              <button type="submit" disabled={isTesting} className="btn btn-primary">
                <Send size={16} /> {isTesting ? 'Envoi...' : 'Envoyer le SMS de test'}
              </button>
            </form>

            {testResult && (
              <div style={{
                padding: '14px',
                borderRadius: '8px',
                background: testResult.success ? '#F0FDF4' : '#FEF2F2',
                border: `1.5px solid ${testResult.success ? '#86EFAC' : '#FCA5A5'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '10px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.92rem', color: testResult.success ? '#166534' : '#991B1B' }}>
                  {testResult.success ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                  <span>{testResult.message}</span>
                </div>

                {testResult.nativeSmsUrl && (
                  <a
                    href={testResult.nativeSmsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-primary btn-sm"
                    style={{ fontSize: '0.82rem' }}
                  >
                    📲 Ouvrir dans Messages (SMS Direct)
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
