import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Save, Server, RefreshCw, Wifi } from 'lucide-react';

export const AymenSettings: React.FC = () => {
  const { 
    teacher, 
    updateTeacherProfile,
    backendUrl,
    updateBackendUrl,
    serverStatus,
    checkServerHealth
  } = useApp();

  const [name, setName] = useState(teacher.name);
  const [title, setTitle] = useState(teacher.title);
  const [phone, setPhone] = useState(teacher.phone);
  const [location, setLocation] = useState(teacher.location);
  const [bio, setBio] = useState(teacher.bio);
  const [zoomLink, setZoomLink] = useState(teacher.zoomLink || 'https://us05web.zoom.us/j/9133195007?pwd=k9qcjEJ7F6KnQQKhQ15wWwhsznak5f.1');
  const [railwayUrl, setRailwayUrl] = useState(backendUrl);
  const [isChecking, setIsChecking] = useState(false);

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

  return (
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
              Numéro de Téléphone (affiché en haut de page pour les seniors)
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
            Ce lien est transmis automatiquement aux élèves par SMS / WhatsApp lorsqu'ils choisissent un cours par Zoom.
          </span>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, marginBottom: '6px' }}>
            Présentation & Message d'accueil bienveillant
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

      {/* Synchronisation en direct & Serveur Railway */}
      <div style={{ marginTop: '36px', paddingTop: '28px', borderTop: '2px solid var(--border-subtle)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '40px',
              height: '40px',
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
            En local le serveur utilise <code>http://localhost:3001</code>. En ligne, collez votre adresse Railway (ex: <code>https://mon-projet.up.railway.app</code>).
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
