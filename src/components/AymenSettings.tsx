import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Save } from 'lucide-react';

export const AymenSettings: React.FC = () => {
  const { teacher, updateTeacherProfile } = useApp();

  const [name, setName] = useState(teacher.name);
  const [title, setTitle] = useState(teacher.title);
  const [phone, setPhone] = useState(teacher.phone);
  const [location, setLocation] = useState(teacher.location);
  const [bio, setBio] = useState(teacher.bio);
  const [zoomLink, setZoomLink] = useState(teacher.zoomLink || 'https://us05web.zoom.us/j/9133195007?pwd=k9qcjEJ7F6KnQQKhQ15wWwhsznak5f.1');

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
    </div>
  );
};
