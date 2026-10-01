import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Lock, X, KeyRound, Eye, EyeOff } from 'lucide-react';

interface AymenLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AymenLoginModal: React.FC<AymenLoginModalProps> = ({ isOpen, onClose }) => {
  const { loginAymen } = useApp();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(true);
  const [error, setError] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = loginAymen(password);
    if (success) {
      setPassword('');
      setError(false);
      onClose();
    } else {
      setError(true);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(6, 78, 59, 0.7)',
      backdropFilter: 'blur(5px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1200,
      padding: '20px'
    }}>
      <div 
        className="card animate-slide-up"
        style={{
          maxWidth: '460px',
          width: '100%',
          padding: 0,
          borderRadius: 'var(--radius-xl)',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-xl)',
          background: 'white'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          background: 'linear-gradient(135deg, #064E3B 0%, #047857 100%)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Lock size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Espace Réservé à Aymen</h3>
              <p style={{ fontSize: '0.78rem', opacity: 0.85 }}>Accès sécurisé pour l'enseignant</p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              color: 'white',
              background: 'rgba(255,255,255,0.2)',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
          <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', marginBottom: '18px', lineHeight: 1.5 }}>
            Cet espace permet à <strong>Aymen</strong> de gérer les demandes de cours et de valider les réservations selon les horaires fixes.
          </p>

          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                Code d'accès Enseignant :
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.82rem',
                  color: '#047857',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                <span>{showPassword ? 'Masquer' : 'Afficher'}</span>
              </button>
            </div>
            <div style={{ position: 'relative' }}>
              <KeyRound size={18} color="var(--primary)" style={{ position: 'absolute', left: '12px', top: '14px' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoFocus
                placeholder="Entrez votre mot de passe"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(false);
                }}
                style={{
                  width: '100%',
                  padding: '12px 42px 12px 40px',
                  borderRadius: 'var(--radius-md)',
                  border: `2px solid ${error ? '#EF4444' : '#10B981'}`,
                  background: '#F0FDF4',
                  fontSize: '1.05rem',
                  fontWeight: 600,
                  letterSpacing: '0.04em',
                  outline: 'none'
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '12px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#047857',
                  padding: '2px'
                }}
                title={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <div style={{ fontSize: '0.78rem', color: '#047857', marginTop: '6px', fontWeight: 600 }}>
              👁️ Les lettres sont visibles pour vous aider à taper sans erreur.
            </div>
            {error && (
              <p style={{ color: '#EF4444', fontSize: '0.82rem', marginTop: '6px', fontWeight: 600 }}>
                Mot de passe incorrect. Veuillez réessayer.
              </p>
            )}
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose} className="btn btn-outline">
              Annuler
            </button>
            <button type="submit" className="btn btn-primary" style={{ minWidth: '140px' }}>
              Se connecter
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
