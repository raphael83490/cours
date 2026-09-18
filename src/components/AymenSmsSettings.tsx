import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Smartphone, 
  Send, 
  Save, 
  RefreshCw,
  MessageSquare,
  Server,
  ExternalLink,
  Wifi,
  Video,
  Copy,
  Check
} from 'lucide-react';

export const AymenSmsSettings: React.FC = () => {
  const { 
    smsConfig, 
    updateSmsConfig, 
    sendRealSms, 
    backendUrl,
    updateBackendUrl,
    serverStatus,
    checkServerHealth,
    teacher,
    showToast 
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'sync' | 'templates' | 'sms'>('sync');
  const [urlInput, setUrlInput] = useState(backendUrl);
  const [isChecking, setIsChecking] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // SMS Configuration State
  const [provider, setProvider] = useState<'native' | 'twilio' | 'brevo'>(smsConfig.provider || 'native');
  const [twilioAccountSid, setTwilioAccountSid] = useState(smsConfig.twilioAccountSid || '');
  const [twilioAuthToken, setTwilioAuthToken] = useState(smsConfig.twilioAuthToken || '');
  const [twilioFromNumber, setTwilioFromNumber] = useState(smsConfig.twilioFromNumber || '');
  const [brevoApiKey, setBrevoApiKey] = useState(smsConfig.brevoApiKey || '');
  const [brevoSender, setBrevoSender] = useState(smsConfig.brevoSender || 'AymenCours');

  // SMS Testing State
  const [testPhone, setTestPhone] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; nativeSmsUrl?: string } | null>(null);

  const handleSaveBackendUrl = (e: React.FormEvent) => {
    e.preventDefault();
    updateBackendUrl(urlInput);
  };

  const handleTestConnection = async () => {
    setIsChecking(true);
    await checkServerHealth();
    setIsChecking(false);
  };

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

  const handleTestSms = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testPhone.trim()) return;

    setIsTesting(true);
    setTestResult(null);

    const testMessage = `COURS AYMEN : Ceci est un test de message depuis votre plateforme Cours Aymen.`;

    try {
      const res = await sendRealSms(testPhone.trim(), testMessage);
      setIsTesting(false);
      setTestResult({
        success: true,
        message: `Lien SMS préparé pour le ${testPhone}.`,
        nativeSmsUrl: res.nativeSmsUrl
      });
      showToast('Test SMS préparé', `Le SMS a été préparé pour le ${testPhone}.`, 'success');
    } catch (err) {
      setIsTesting(false);
      setTestResult({
        success: false,
        message: 'Erreur : ' + String(err)
      });
    }
  };

  const handleCopyZoom = () => {
    navigator.clipboard.writeText(teacher.zoomLink || 'https://us05web.zoom.us/j/9133195007?pwd=k9qcjEJ7F6KnQQKhQ15wWwhsznak5f.1');
    setCopiedLink(true);
    showToast('Lien copié', 'Le lien Zoom permanent a été copié dans le presse-papier.', 'success');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Subtabs Switcher */}
      <div style={{
        display: 'flex',
        gap: '8px',
        background: '#E2E8F0',
        padding: '5px',
        borderRadius: '14px',
        maxWidth: '650px'
      }}>
        <button
          type="button"
          onClick={() => setActiveSubTab('sync')}
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
            background: activeSubTab === 'sync' ? '#047857' : 'transparent',
            color: activeSubTab === 'sync' ? 'white' : '#475569',
            boxShadow: activeSubTab === 'sync' ? '0 4px 12px rgba(4, 120, 87, 0.3)' : 'none',
            transition: 'all 0.2s'
          }}
        >
          <Server size={18} />
          <span>Synchronisation & Serveur</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('templates')}
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
            background: activeSubTab === 'templates' ? '#25D366' : 'transparent',
            color: activeSubTab === 'templates' ? '#064E3B' : '#475569',
            boxShadow: activeSubTab === 'templates' ? '0 4px 12px rgba(37, 211, 102, 0.3)' : 'none',
            transition: 'all 0.2s'
          }}
        >
          <MessageSquare size={18} />
          <span>WhatsApp Direct</span>
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
      {/* 🚀 TAB 1: SYNCHRONISATION EN DIRECT & SERVEUR */}
      {/* ========================================== */}
      {activeSubTab === 'sync' && (
        <div className="animate-slide-up" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div className="card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  background: serverStatus === 'connected' ? '#ECFDF5' : '#FEF2F2',
                  color: serverStatus === 'connected' ? '#047857' : '#EF4444',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Wifi size={24} />
                </div>
                <div>
                  <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#064E3B' }}>
                    Réception des Réservations en Temps Réel
                  </h2>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                    Dès qu'un élève réserve sur le site, la réservation apparaît immédiatement sur votre tableau de bord.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{
                  background: serverStatus === 'connected' ? '#D1FAE5' : '#FEE2E2',
                  color: serverStatus === 'connected' ? '#065F46' : '#991B1B',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  padding: '6px 14px',
                  borderRadius: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <span style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: serverStatus === 'connected' ? '#10B981' : '#EF4444',
                    display: 'inline-block'
                  }}></span>
                  {serverStatus === 'connected' ? 'Connecté & Prêt' : 'En attente de connexion'}
                </span>

                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={isChecking}
                  className="btn btn-secondary btn-sm"
                >
                  <RefreshCw size={14} className={isChecking ? 'animate-spin' : ''} />
                  {isChecking ? 'Test en cours...' : 'Tester la connexion'}
                </button>
              </div>
            </div>

            {/* How it works info card */}
            <div style={{
              background: '#F0FDF4',
              border: '1.5px solid #86EFAC',
              borderRadius: '14px',
              padding: '16px 20px',
              marginBottom: '24px'
            }}>
              <div style={{ fontWeight: 800, color: '#166534', fontSize: '0.98rem', marginBottom: '6px' }}>
                ⚡ Fonctionnement automatique 24h/24 :
              </div>
              <ul style={{ margin: 0, paddingLeft: '20px', color: '#15803D', fontSize: '0.88rem', lineHeight: 1.6 }}>
                <li>L'élève choisit son créneau sur le planning 14 jours et valide sa demande.</li>
                <li>Votre espace enseignant reçoit la réservation instantanément avec <strong>sonnerie</strong> et <strong>notification</strong>.</li>
                <li>Vous pouvez accepter, refuser ou proposer un autre horaire en 1 clic.</li>
                <li>L'élève peut aussi vous envoyer la confirmation directement sur votre WhatsApp au <strong>06 13 92 09 87</strong>.</li>
              </ul>
            </div>

            {/* Backend URL form */}
            <form onSubmit={handleSaveBackendUrl} style={{ background: '#F8FAFC', padding: '20px', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
              <label style={{ display: 'block', fontWeight: 800, color: '#1E293B', marginBottom: '6px', fontSize: '0.95rem' }}>
                Adresse du Serveur Railway (URL de production) :
              </label>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                Si vous avez déployé le backend sur Railway, collez ici son URL (ex: <code>https://mon-projet.up.railway.app</code>). En local, le serveur utilise automatiquement <code>http://localhost:3001</code>.
              </p>

              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <input
                  type="url"
                  placeholder="https://xxx.up.railway.app"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  style={{
                    flex: 1,
                    minWidth: '260px',
                    padding: '12px 14px',
                    borderRadius: '8px',
                    border: '1.5px solid #CBD5E1',
                    fontSize: '0.95rem'
                  }}
                />
                <button type="submit" className="btn btn-primary">
                  <Save size={16} /> Enregistrer l'adresse
                </button>
              </div>
            </form>

          </div>

        </div>
      )}

      {/* ========================================== */}
      {/* 🟢 TAB 2: WHATSAPP DIRECT (100% FIABLE) */}
      {/* ========================================== */}
      {activeSubTab === 'templates' && (
        <div className="animate-slide-up" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div className="card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                background: '#25D366',
                color: '#064E3B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <MessageSquare size={24} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#064E3B' }}>
                  WhatsApp Direct (06 13 92 09 87)
                </h2>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                  Connexion directe instantanée sur iPhone, Android et WhatsApp Web sans aucun robot ni risque de déconnexion.
                </p>
              </div>
            </div>

            {/* Permanent Zoom Box */}
            <div style={{
              background: '#EFF6FF',
              border: '1.5px solid #93C5FD',
              borderRadius: '14px',
              padding: '18px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, color: '#1E40AF', fontSize: '1rem' }}>
                  <Video size={18} color="#2563EB" />
                  Votre Salle Zoom Permanente :
                </div>
                <div style={{ fontSize: '0.85rem', color: '#3B82F6', wordBreak: 'break-all', marginTop: '4px' }}>
                  {teacher.zoomLink}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={handleCopyZoom}
                  className="btn btn-sm"
                  style={{ background: '#2563EB', color: 'white' }}
                >
                  {copiedLink ? <Check size={14} /> : <Copy size={14} />}
                  {copiedLink ? 'Copié !' : 'Copier le lien'}
                </button>
                <a
                  href={teacher.zoomLink}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-outline btn-sm"
                  style={{ borderColor: '#2563EB', color: '#2563EB' }}
                >
                  <ExternalLink size={14} /> Tester Zoom
                </a>
              </div>
            </div>

            {/* Test WhatsApp Link Button */}
            <div style={{ background: '#F8FAFC', padding: '18px', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontWeight: 800, color: '#064E3B', fontSize: '0.98rem', marginBottom: '8px' }}>
                Tester le lien direct WhatsApp :
              </div>
              <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
                Cliquez ci-dessous pour tester l'ouverture automatique de WhatsApp avec votre numéro configuré :
              </p>

              <a
                href={`https://wa.me/33613920987?text=${encodeURIComponent('Test de message direct vers Aymen (06 13 92 09 87) pour les cours de Coran.')}`}
                target="_blank"
                rel="noreferrer"
                className="btn"
                style={{
                  background: '#25D366',
                  color: '#064E3B',
                  fontWeight: 800,
                  fontSize: '0.92rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <MessageSquare size={18} />
                Ouvrir mon WhatsApp (06 13 92 09 87)
              </a>
            </div>

          </div>

        </div>
      )}

      {/* ========================================== */}
      {/* 📱 TAB 3: SMS CLASSIQUE */}
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
              Par défaut, les liens SMS ouvrent directement l'application Messages de votre smartphone. Vous pouvez aussi relier une API Twilio ou Brevo.
            </p>

            <form onSubmit={handleSaveSmsConfig} style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 700, color: '#1E293B', marginBottom: '6px' }}>
                  Mode d'envoi :
                </label>
                <select
                  value={provider}
                  onChange={(e) => setProvider(e.target.value as any)}
                  style={{ width: '100%', maxWidth: '400px', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #CBD5E1' }}
                >
                  <option value="native">Lien direct smartphone (100% gratuit via votre forfait)</option>
                  <option value="twilio">Passerelle Twilio (API)</option>
                  <option value="brevo">Passerelle Brevo / Sendinblue (API)</option>
                </select>
              </div>

              {provider === 'twilio' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: '#F8FAFC', padding: '16px', borderRadius: '12px' }}>
                  <input
                    type="text"
                    placeholder="Twilio Account SID"
                    value={twilioAccountSid}
                    onChange={(e) => setTwilioAccountSid(e.target.value)}
                    style={{ padding: '10px 12px', borderRadius: '6px', border: '1px solid #CBD5E1' }}
                  />
                  <input
                    type="password"
                    placeholder="Twilio Auth Token"
                    value={twilioAuthToken}
                    onChange={(e) => setTwilioAuthToken(e.target.value)}
                    style={{ padding: '10px 12px', borderRadius: '6px', border: '1px solid #CBD5E1' }}
                  />
                  <input
                    type="text"
                    placeholder="Numéro expéditeur Twilio (+33...)"
                    value={twilioFromNumber}
                    onChange={(e) => setTwilioFromNumber(e.target.value)}
                    style={{ padding: '10px 12px', borderRadius: '6px', border: '1px solid #CBD5E1' }}
                  />
                </div>
              )}

              {provider === 'brevo' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: '#F8FAFC', padding: '16px', borderRadius: '12px' }}>
                  <input
                    type="password"
                    placeholder="Clé API Brevo (xkeysib-...)"
                    value={brevoApiKey}
                    onChange={(e) => setBrevoApiKey(e.target.value)}
                    style={{ padding: '10px 12px', borderRadius: '6px', border: '1px solid #CBD5E1' }}
                  />
                  <input
                    type="text"
                    placeholder="Nom expéditeur (ex: AymenCours)"
                    value={brevoSender}
                    onChange={(e) => setBrevoSender(e.target.value)}
                    style={{ padding: '10px 12px', borderRadius: '6px', border: '1px solid #CBD5E1' }}
                  />
                </div>
              )}

              <div>
                <button type="submit" className="btn btn-primary">
                  <Save size={16} /> Enregistrer la configuration SMS
                </button>
              </div>
            </form>
          </div>

          {/* Test SMS Box */}
          <div className="card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#064E3B', marginBottom: '8px' }}>
              Tester la préparation d'un SMS
            </h3>
            <form onSubmit={handleTestSms} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <input
                type="tel"
                placeholder="Ex: 06 12 34 56 78"
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
                style={{ flex: 1, minWidth: '220px', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #CBD5E1' }}
              />
              <button type="submit" disabled={isTesting} className="btn btn-primary">
                <Send size={16} /> {isTesting ? 'Préparation...' : 'Tester le SMS'}
              </button>
            </form>

            {testResult && (
              <div style={{
                marginTop: '14px',
                padding: '12px 16px',
                borderRadius: '8px',
                background: testResult.success ? '#ECFDF5' : '#FEF2F2',
                color: testResult.success ? '#065F46' : '#991B1B',
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '8px'
              }}>
                <span>{testResult.message}</span>
                {testResult.nativeSmsUrl && (
                  <a
                    href={testResult.nativeSmsUrl}
                    className="btn btn-sm"
                    style={{ background: '#047857', color: 'white' }}
                  >
                    Ouvrir dans Messages
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
