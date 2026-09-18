import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Save, 
  Server, 
  RefreshCw, 
  Wifi, 
  MessageSquare, 
  QrCode, 
  CheckCircle2 
} from 'lucide-react';

export const AymenSettings: React.FC = () => {
  const { 
    teacher, 
    updateTeacherProfile,
    backendUrl,
    updateBackendUrl,
    serverStatus,
    checkServerHealth,
    whatsAppStatus,
    restartWhatsApp
  } = useApp();

  const [name, setName] = useState(teacher.name);
  const [title, setTitle] = useState(teacher.title);
  const [phone, setPhone] = useState(teacher.phone);
  const [location, setLocation] = useState(teacher.location);
  const [bio, setBio] = useState(teacher.bio);
  const [zoomLink, setZoomLink] = useState(teacher.zoomLink || 'https://us05web.zoom.us/j/9133195007?pwd=k9qcjEJ7F6KnQQKhQ15wWwhsznak5f.1');
  const [railwayUrl, setRailwayUrl] = useState(backendUrl || 'https://cours-production-bad7.up.railway.app');
  const [isChecking, setIsChecking] = useState(false);
  const [isRestartingWa, setIsRestartingWa] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateTeacherProfile({
      name,
      title,
      phone,
      location,
      bio,
      zoomLink
    });
  };

  const handleRestartWa = async () => {
    setIsRestartingWa(true);
    await restartWhatsApp();
    setIsRestartingWa(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      {/* Profil Form */}
      <div className="card" style={{ padding: '28px' }}>
        <div style={{ marginBottom: '24px', paddingBottom: '14px', borderBottom: '1px solid var(--border-subtle)' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#064E3B' }}>
            Paramètres du Profil Enseignant — Aymen
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Configurez votre numéro de téléphone et votre présentation affichée aux élèves
          </p>
        </div>

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, marginBottom: '6px' }}>
              Nom complet / Titre d'enseignant
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: '1.5px solid var(--border-subtle)', fontSize: '1rem' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, marginBottom: '6px' }}>
              Spécialités affichées
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: '1.5px solid var(--border-subtle)', fontSize: '1rem' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, marginBottom: '6px' }}>
                Numéro de Téléphone (affiché aux élèves)
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: '1.5px solid var(--border-subtle)', fontSize: '1rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, marginBottom: '6px' }}>
                Lieu / Zone d'enseignement
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: '1.5px solid var(--border-subtle)', fontSize: '1rem' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, marginBottom: '6px' }}>
              🎥 Votre Lien Zoom Permanent (Envoyé automatiquement aux élèves)
            </label>
            <input
              type="url"
              placeholder="https://us05web.zoom.us/j/..."
              value={zoomLink}
              onChange={(e) => setZoomLink(e.target.value)}
              style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: '1.5px solid #38BDF8', background: '#F0F9FF', fontSize: '1rem' }}
            />
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
              Ce lien est transmis automatiquement aux élèves dès validation de leur cours par Zoom.
            </span>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, marginBottom: '6px' }}>
              Présentation & Message d'accueil
            </label>
            <textarea
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: '1.5px solid var(--border-subtle)', fontSize: '1rem' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '14px', borderTop: '1px solid var(--border-subtle)' }}>
            <button type="submit" className="btn btn-primary btn-lg">
              <Save size={18} /> Enregistrer mon profil
            </button>
          </div>
        </form>
      </div>

      {/* 🟢 WhatsApp QR Code Connection Card */}
      <div className="card" style={{ padding: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#064E3B', margin: 0 }}>
                Connexion WhatsApp Automatique (Scan QR Code)
              </h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                Connectez votre WhatsApp pour que les confirmations et liens Zoom soient envoyés directement aux élèves.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleRestartWa}
            disabled={isRestartingWa}
            className="btn btn-secondary btn-sm"
          >
            <RefreshCw size={14} className={isRestartingWa ? 'animate-spin' : ''} />
            {isRestartingWa ? 'Génération...' : 'Nouveau QR Code'}
          </button>
        </div>

        {/* Dynamic Status / QR Code view */}
        {whatsAppStatus?.isReady ? (
          <div style={{
            background: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)',
            border: '2px solid #34D399',
            borderRadius: '16px',
            padding: '22px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: '#10B981',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <CheckCircle2 size={28} />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '1.15rem', color: '#065F46' }}>
                  🟢 Session WhatsApp Active & Connectée
                </div>
                <div style={{ fontSize: '0.9rem', color: '#047857', marginTop: '2px' }}>
                  Numéro connecté : <strong>{whatsAppStatus.whatsappUser || 'Votre compte WhatsApp'}</strong>
                </div>
                <div style={{ fontSize: '0.82rem', color: '#059669', marginTop: '4px' }}>
                  ⚡ Vos élèves reçoivent leurs messages WhatsApp instantanément et automatiquement dès qu'un cours est réservé ou validé.
                </div>
              </div>
            </div>

            <span style={{
              background: '#047857',
              color: 'white',
              fontSize: '0.82rem',
              fontWeight: 700,
              padding: '6px 14px',
              borderRadius: '20px'
            }}>
              Prêt pour les envois automatiques
            </span>
          </div>
        ) : whatsAppStatus?.qrCodeDataUrl ? (
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
                <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#064E3B', margin: 0 }}>
                  Scannez ce QR Code avec votre téléphone (1 seule fois)
                </h4>
              </div>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', margin: 0 }}>
                C'est exactement comme pour vous connecter à WhatsApp Web sur un ordinateur.
              </p>
            </div>

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
                style={{ width: '250px', height: '250px', display: 'block', borderRadius: '8px' }}
              />
            </div>

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
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Pointez l'appareil photo vers ce QR Code</div>
              </div>
            </div>
          </div>
        ) : (
          <div style={{
            background: '#F8FAFC',
            borderRadius: '16px',
            padding: '36px 20px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '14px'
          }}>
            <RefreshCw size={36} color="#047857" className="animate-spin" />
            <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#064E3B' }}>
              {whatsAppStatus?.statusText || 'Génération du QR Code WhatsApp en cours...'}
            </div>
            <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', maxWidth: '420px', margin: 0 }}>
              Le serveur Railway prépare la session WhatsApp. Le QR Code va apparaître ici automatiquement.
            </p>
          </div>
        )}
      </div>

      {/* 🚀 Server Sync & Railway Configuration */}
      <div className="card" style={{ padding: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: serverStatus === 'connected' ? '#ECFDF5' : '#FEF2F2',
              color: serverStatus === 'connected' ? '#047857' : '#EF4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Wifi size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#064E3B', margin: 0 }}>
                Synchronisation en direct (Temps Réel)
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                Les réservations des élèves arrivent instantanément sur votre tableau de bord.
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
              onClick={async () => {
                setIsChecking(true);
                await checkServerHealth();
                setIsChecking(false);
              }}
              disabled={isChecking}
              className="btn btn-secondary btn-sm"
            >
              <RefreshCw size={14} className={isChecking ? 'animate-spin' : ''} />
              {isChecking ? 'Test...' : 'Tester'}
            </button>
          </div>
        </div>

        <form onSubmit={(e) => {
          e.preventDefault();
          updateBackendUrl(railwayUrl);
        }} style={{ background: '#F8FAFC', padding: '18px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
          <label style={{ display: 'block', fontWeight: 800, color: '#1E293B', marginBottom: '4px', fontSize: '0.9rem' }}>
            Adresse du serveur backend Railway (URL de production) :
          </label>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
            Serveur connecté : <code>{railwayUrl}</code>
          </p>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <input
              type="url"
              placeholder="https://xxx.up.railway.app"
              value={railwayUrl}
              onChange={(e) => setRailwayUrl(e.target.value)}
              style={{
                flex: 1,
                minWidth: '240px',
                padding: '10px 12px',
                borderRadius: '6px',
                border: '1px solid #CBD5E1',
                fontSize: '0.9rem'
              }}
            />
            <button type="submit" className="btn btn-primary btn-sm">
              <Server size={14} /> Enregistrer l'adresse
            </button>
          </div>
        </form>
      </div>

    </div>
  );
};
