import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  X, 
  CheckCheck, 
  ShieldCheck, 
  Sparkles,
  Smartphone
} from 'lucide-react';

export const SmsEmailModal: React.FC = () => {
  const { simulatedDelivery, closeSimulatedDelivery } = useApp();

  if (!simulatedDelivery || !simulatedDelivery.isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(6, 78, 59, 0.75)',
      backdropFilter: 'blur(5px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1300,
      padding: '20px'
    }}>
      <div 
        className="card animate-slide-up"
        style={{
          width: '100%',
          maxWidth: '520px',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: 0,
          borderRadius: '24px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)',
          background: '#0F172A',
          color: 'white',
          border: '1px solid rgba(255,255,255,0.1)'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          background: 'rgba(255,255,255,0.03)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '30px',
              height: '30px',
              borderRadius: '8px',
              background: '#047857',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Sparkles size={16} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>Notification SMS Réelle</div>
              <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                {simulatedDelivery.statusInfo ? `Statut : ${simulatedDelivery.statusInfo}` : 'Aperçu sur smartphone'}
              </div>
            </div>
          </div>

          <button
            onClick={closeSimulatedDelivery}
            style={{
              color: '#94A3B8',
              background: 'rgba(255,255,255,0.08)',
              borderRadius: '50%',
              width: '30px',
              height: '30px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '20px', background: '#1E293B' }}>
          <div style={{
            background: '#0F172A',
            borderRadius: '18px',
            padding: '16px',
            border: '1px solid rgba(255,255,255,0.08)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingBottom: '10px',
              borderBottom: '1px solid rgba(255,255,255,0.05)',
              fontSize: '0.78rem',
              color: '#94A3B8'
            }}>
              <span>De : <strong>COURS AYMEN</strong></span>
              <span>Pour : <strong>{simulatedDelivery.recipientContact}</strong></span>
            </div>

            <div style={{ padding: '16px 0 8px' }}>
              <div style={{
                background: 'linear-gradient(135deg, #047857 0%, #065F46 100%)',
                color: 'white',
                borderRadius: '16px 16px 16px 2px',
                padding: '14px 18px',
                fontSize: '0.95rem',
                lineHeight: 1.5,
                boxShadow: '0 4px 14px rgba(4, 120, 87, 0.4)'
              }}>
                <div style={{ fontWeight: 800, fontSize: '0.8rem', color: '#A7F3D0', marginBottom: '4px' }}>
                  {simulatedDelivery.badge || 'COURS AYMEN'}
                </div>
                <div>{simulatedDelivery.body}</div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '4px',
                  fontSize: '0.72rem',
                  color: '#D1FAE5',
                  marginTop: '12px'
                }}>
                  <span>Transmission serveur instantanée</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span>Délivré</span>
                    <CheckCheck size={15} color="#6EE7B7" />
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons (WhatsApp & SMS) */}
            <div style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {simulatedDelivery.nativeWhatsAppUrl && (
                <a
                  href={simulatedDelivery.nativeWhatsAppUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn"
                  style={{
                    width: '100%',
                    justifyContent: 'center',
                    background: '#25D366',
                    color: '#064E3B',
                    fontWeight: 800,
                    fontSize: '0.95rem',
                    padding: '10px 14px',
                    borderRadius: '12px',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <span>💬 Ouvrir dans WhatsApp</span>
                </a>
              )}

              {simulatedDelivery.nativeSmsUrl && (
                <a
                  href={simulatedDelivery.nativeSmsUrl}
                  className="btn btn-secondary"
                  style={{
                    width: '100%',
                    justifyContent: 'center',
                    background: 'rgba(255,255,255,0.08)',
                    borderColor: 'rgba(255,255,255,0.15)',
                    color: 'white',
                    fontSize: '0.9rem',
                    padding: '8px 12px',
                    borderRadius: '12px'
                  }}
                >
                  <Smartphone size={16} />
                  📲 Ouvrir dans Messages (SMS Direct)
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '14px 20px',
          background: 'rgba(255,255,255,0.03)',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ fontSize: '0.8rem', color: '#6EE7B7', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldCheck size={16} /> Notification SMS envoyée
          </div>
          <button
            onClick={closeSimulatedDelivery}
            className="btn btn-primary btn-sm"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
