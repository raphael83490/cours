import React from 'react';
import { useApp, formatDisplayDate } from '../context/AppContext';
import type { Appointment } from '../types';
import { 
  CheckCircle2, 
  Clock, 
  Calendar, 
  XCircle, 
  Phone, 
  MessageSquare,
  Video,
  Zap,
  Sparkles
} from 'lucide-react';

export const AymenDashboard: React.FC = () => {
  const { 
    appointments, 
    acceptAppointment, 
    declineAppointment, 
    setAymenTab 
  } = useApp();

  // Helper to check if an appointment is upcoming
  const isUpcoming = (apt: Appointment): boolean => {
    if (!apt.date) return true;
    const todayStr = new Date().toISOString().split('T')[0];
    if (apt.date < todayStr) return false;
    if (apt.date > todayStr) return true;
    if (!apt.time) return true;
    const now = new Date();
    const [h, m] = apt.time.split(':').map(Number);
    const aptTime = new Date();
    aptTime.setHours(h || 0, (m || 0) + 30, 0, 0);
    return aptTime.getTime() >= now.getTime();
  };

  const pendingAppointments = appointments.filter(a => a.status === 'pending' && isUpcoming(a));
  const acceptedAppointments = appointments
    .filter(a => a.status === 'accepted' && isUpcoming(a))
    .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));

  const formatPhoneForWhatsApp = (raw: string) => {
    let p = raw.replace(/[\s.-]/g, '');
    if (p.startsWith('0')) {
      p = '33' + p.substring(1);
    }
    return p;
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header simplifié */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        padding: '20px 24px',
        background: 'linear-gradient(135deg, #064E3B 0%, #047857 100%)',
        borderRadius: 'var(--radius-lg)',
        color: 'white',
        boxShadow: '0 4px 16px rgba(4, 120, 87, 0.2)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.4rem' }}>👋</span>
            <h1 style={{ fontSize: '1.45rem', fontWeight: 800, margin: 0 }}>
              Bonjour Aymen
            </h1>
          </div>
          <p style={{ margin: '4px 0 0', fontSize: '0.92rem', opacity: 0.9 }}>
            Confirmez simplement les demandes de cours de vos élèves en un clic.
          </p>
        </div>

        <button
          onClick={() => setAymenTab('availability')}
          className="btn"
          style={{
            background: 'rgba(255, 255, 255, 0.2)',
            color: 'white',
            border: '1.5px solid rgba(255, 255, 255, 0.4)',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Zap size={18} />
          Mes disponibilités (Dim-Dim)
        </button>
      </div>

      {/* SECTION 1 : DEMANDES EN ATTENTE (Priorité absolue) */}
      <div className="card" style={{ padding: '24px', border: pendingAppointments.length > 0 ? '2.5px solid #F59E0B' : '2px solid var(--border-subtle)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: pendingAppointments.length > 0 ? '#FEF3C7' : '#DCFCE7',
              color: pendingAppointments.length > 0 ? '#D97706' : '#166534',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800
            }}>
              {pendingAppointments.length > 0 ? <Clock size={20} /> : <CheckCircle2 size={20} />}
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#064E3B', margin: 0 }}>
                Demandes de cours à confirmer
              </h2>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {pendingAppointments.length === 0 
                  ? 'Aucune nouvelle demande en attente' 
                  : `${pendingAppointments.length} élève${pendingAppointments.length > 1 ? 's' : ''} attend${pendingAppointments.length > 1 ? 'ent' : ''} votre confirmation`}
              </div>
            </div>
          </div>

          {pendingAppointments.length > 0 && (
            <span style={{
              padding: '6px 14px',
              borderRadius: '20px',
              background: '#FEF3C7',
              border: '1.5px solid #FDE68A',
              color: '#92400E',
              fontWeight: 800,
              fontSize: '0.85rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <Sparkles size={16} /> {pendingAppointments.length} à traiter
            </span>
          )}
        </div>

        {pendingAppointments.length === 0 ? (
          <div style={{
            padding: '32px 20px',
            textAlign: 'center',
            background: '#F0FDF4',
            borderRadius: 'var(--radius-md)',
            border: '1.5px dashed #86EFAC'
          }}>
            <CheckCircle2 size={36} color="#059669" style={{ margin: '0 auto 10px' }} />
            <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#064E3B' }}>
              Tout est à jour !
            </div>
            <div style={{ fontSize: '0.88rem', color: '#047857', marginTop: '4px' }}>
              Dès qu'un élève sélectionne un créneau, sa demande apparaîtra directement ici pour confirmation.
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {pendingAppointments.map((apt) => (
              <div
                key={apt.id}
                style={{
                  padding: '20px',
                  borderRadius: 'var(--radius-md)',
                  border: '2px solid #FCD34D',
                  background: '#FFFBEB',
                  boxShadow: '0 4px 14px rgba(245, 158, 11, 0.12)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px'
                }}
              >
                {/* Élève & Coordonnées */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#064E3B' }}>
                      {apt.patientName}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px', fontSize: '0.92rem', color: '#475569' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 600 }}>
                        <Phone size={14} color="#047857" /> {apt.patientPhone}
                      </span>
                      <span>•</span>
                      <span style={{ fontWeight: 700, color: '#047857' }}>
                        Cours individuel de 30 min
                      </span>
                    </div>
                  </div>

                  {/* Mode de cours */}
                  <span style={{
                    padding: '4px 10px',
                    borderRadius: '8px',
                    fontSize: '0.84rem',
                    fontWeight: 700,
                    background: apt.type === 'zoom' ? '#EFF6FF' : '#DCFCE7',
                    color: apt.type === 'zoom' ? '#1D4ED8' : '#166534',
                    border: `1px solid ${apt.type === 'zoom' ? '#BFDBFE' : '#86EFAC'}`,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}>
                    {apt.type === 'zoom' ? <Video size={14} /> : <MessageSquare size={14} />}
                    {apt.type === 'zoom' ? '🎥 Zoom' : '💬 WhatsApp'}
                  </span>
                </div>

                {/* Date et Heure demandée */}
                <div style={{
                  background: 'white',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: '1.5px solid #FDE68A',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontWeight: 800,
                  fontSize: '1.05rem',
                  color: '#92400E'
                }}>
                  <Calendar size={20} color="#D97706" />
                  <span style={{ textTransform: 'capitalize' }}>
                    {formatDisplayDate(apt.date)} à {apt.time}
                  </span>
                  <span style={{ fontSize: '0.8rem', background: '#FEF3C7', padding: '2px 8px', borderRadius: '4px', border: '1px solid #FCD34D' }}>
                    Heure de Paris
                  </span>
                </div>

                {/* Message facultatif de l'élève */}
                {apt.patientNotes && (
                  <div style={{ fontSize: '0.9rem', color: '#475569', background: 'white', padding: '10px 14px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                    <strong>Note de l'élève :</strong> "{apt.patientNotes}"
                  </div>
                )}

                {/* ACTION DIRECTE DE CONFIRMATION */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', paddingTop: '8px', borderTop: '1px solid #FDE68A' }}>
                  <button
                    type="button"
                    onClick={() => acceptAppointment(apt.id)}
                    className="btn btn-primary"
                    style={{
                      background: '#047857',
                      color: 'white',
                      fontWeight: 800,
                      fontSize: '1.05rem',
                      padding: '12px 24px',
                      borderRadius: '10px',
                      boxShadow: '0 4px 14px rgba(4, 120, 87, 0.3)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <CheckCircle2 size={20} />
                    Confirmer le RDV
                  </button>

                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <a
                      href={`https://wa.me/${formatPhoneForWhatsApp(apt.patientPhone)}?text=${encodeURIComponent(`Salam aleykoum ${apt.patientName}, j'ai bien reçu votre demande pour le ${formatDisplayDate(apt.date)} à ${apt.time} (Paris).`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-sm btn-outline"
                      style={{ fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    >
                      <MessageSquare size={15} color="#25D366" />
                      Écrire sur WhatsApp
                    </a>

                    <button
                      type="button"
                      onClick={() => declineAppointment(apt.id, 'Indisponible')}
                      className="btn btn-sm btn-outline"
                      style={{ color: '#DC2626', borderColor: '#FECACA', background: 'white', fontSize: '0.85rem' }}
                    >
                      <XCircle size={15} />
                      Refuser
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 2 : COURS CONFIRMÉS À VENIR */}
      <div className="card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: '#DCFCE7',
              color: '#047857',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800
            }}>
              <CheckCircle2 size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#064E3B', margin: 0 }}>
                Rendez-vous confirmés ({acceptedAppointments.length})
              </h2>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Vos prochains cours individuels programmés
              </div>
            </div>
          </div>
        </div>

        {acceptedAppointments.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.92rem' }}>
            Aucun cours confirmé pour le moment.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {acceptedAppointments.map((apt) => (
              <div
                key={apt.id}
                style={{
                  padding: '16px 20px',
                  borderRadius: 'var(--radius-md)',
                  border: '1.5px solid #86EFAC',
                  background: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#064E3B' }}>
                      {apt.patientName}
                    </span>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: '6px',
                      background: '#DCFCE7',
                      color: '#166534',
                      fontSize: '0.74rem',
                      fontWeight: 800,
                      border: '1px solid #86EFAC'
                    }}>
                      ✅ Confirmé
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px', fontSize: '0.88rem', color: '#475569' }}>
                    <span style={{ fontWeight: 700, color: '#065F46' }}>
                      📅 {formatDisplayDate(apt.date)} à {apt.time} (30 min)
                    </span>
                    <span>•</span>
                    <span>📞 {apt.patientPhone}</span>
                    <span>•</span>
                    <span>{apt.type === 'zoom' ? '🎥 Zoom' : '💬 WhatsApp'}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <a
                    href={`https://wa.me/${formatPhoneForWhatsApp(apt.patientPhone)}?text=${encodeURIComponent(`Salam aleykoum ${apt.patientName}, cours de Coran prévu le ${formatDisplayDate(apt.date)} à ${apt.time} (Paris).`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-sm"
                    style={{
                      background: '#25D366',
                      color: 'white',
                      fontWeight: 700,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <MessageSquare size={15} />
                    WhatsApp
                  </a>

                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm(`Annuler le cours avec ${apt.patientName} ?`)) {
                        declineAppointment(apt.id, 'Annulé par Aymen');
                      }
                    }}
                    className="btn btn-sm btn-outline"
                    style={{ color: '#94A3B8', borderColor: '#E2E8F0', fontSize: '0.8rem' }}
                    title="Annuler ce cours"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
