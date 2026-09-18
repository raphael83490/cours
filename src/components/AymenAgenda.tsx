import React, { useState, useMemo } from 'react';
import { useApp, formatDisplayDate, formatShortDate } from '../context/AppContext';
import type { Appointment } from '../types';
import { CounterProposalModal } from './CounterProposalModal';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  CheckCircle2, 
  RefreshCw,
  XCircle,
  MessageSquare,
  Phone
} from 'lucide-react';

export const AymenAgenda: React.FC = () => {
  const { appointments, acceptAppointment, declineAppointment } = useApp();

  const [weekOffset, setWeekOffset] = useState<number>(0);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [selectedForCounter, setSelectedForCounter] = useState<Appointment | null>(null);

  const weekDays = useMemo(() => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const offset = weekOffset * 7 + i;
      const d = new Date();
      d.setDate(d.getDate() + offset);
      const dateISO = d.toISOString().split('T')[0];
      days.push({
        dateISO,
        dayName: formatShortDate(dateISO),
        dateFormatted: d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
      });
    }
    return days;
  }, [weekOffset]);

  const TIME_SLOTS = [
    '09:30', '11:00', '14:30', '16:00', '17:30', '19:00'
  ];

  return (
    <div className="card" style={{ padding: '24px' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '20px',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: '#047857',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <CalendarIcon size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#064E3B', margin: 0 }}>
                Planning des cours d'Aymen
              </h2>
              <span style={{
                padding: '2px 8px',
                borderRadius: '8px',
                background: '#FEF3C7',
                border: '1px solid #FDE68A',
                color: '#92400E',
                fontSize: '0.75rem',
                fontWeight: 800
              }}>
                ⏰ Heure de Paris
              </span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
              Semaine du {weekDays[0].dateFormatted} au {weekDays[6].dateFormatted} (horaires en Heure de Paris)
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => setWeekOffset(prev => prev - 1)}
            className="btn btn-outline btn-sm"
          >
            <ChevronLeft size={16} /> Semaine préc.
          </button>
          <button
            onClick={() => setWeekOffset(0)}
            className="btn btn-outline btn-sm"
            style={{ fontWeight: 700 }}
          >
            Aujourd'hui
          </button>
          <button
            onClick={() => setWeekOffset(prev => prev + 1)}
            className="btn btn-outline btn-sm"
          >
            Semaine suiv. <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Grid */}
      <div style={{ overflowX: 'auto' }}>
        <div style={{
          minWidth: '750px',
          display: 'grid',
          gridTemplateColumns: '70px repeat(7, 1fr)',
          border: '2px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden',
          background: 'white'
        }}>
          <div style={{
            background: '#F8FAFC',
            borderBottom: '1px solid var(--border-subtle)',
            borderRight: '1px solid var(--border-subtle)',
            padding: '10px 6px',
            textAlign: 'center',
            fontSize: '0.8rem',
            fontWeight: 700,
            color: 'var(--text-muted)'
          }}>
            Heure
          </div>

          {weekDays.map((day, idx) => (
            <div
              key={idx}
              style={{
                background: day.dateISO === new Date().toISOString().split('T')[0] ? 'var(--primary-light)' : '#F8FAFC',
                borderBottom: '1px solid var(--border-subtle)',
                borderRight: idx < 6 ? '1px solid var(--border-subtle)' : 'none',
                padding: '10px 6px',
                textAlign: 'center'
              }}
            >
              <div style={{
                fontSize: '0.9rem',
                fontWeight: 800,
                color: day.dateISO === new Date().toISOString().split('T')[0] ? '#047857' : 'var(--text-main)'
              }}>
                {day.dayName}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                {day.dateFormatted}
              </div>
            </div>
          ))}

          {TIME_SLOTS.map((time, tIdx) => (
            <React.Fragment key={tIdx}>
              <div style={{
                padding: '12px 4px',
                borderBottom: '1px solid #F1F5F9',
                borderRight: '1px solid var(--border-subtle)',
                textAlign: 'center',
                fontSize: '0.82rem',
                fontWeight: 700,
                color: 'var(--text-muted)',
                background: '#FAFAFA'
              }}>
                {time}
              </div>

              {weekDays.map((day, dIdx) => {
                const aptsInSlot = appointments.filter(
                  a => a.date === day.dateISO && a.time === time
                );

                return (
                  <div
                    key={dIdx}
                    style={{
                      minHeight: '60px',
                      padding: '4px',
                      borderBottom: '1px solid #F1F5F9',
                      borderRight: dIdx < 6 ? '1px solid #F1F5F9' : 'none',
                      background: 'white'
                    }}
                  >
                    {aptsInSlot.map(apt => (
                      <div
                        key={apt.id}
                        onClick={() => setSelectedAppointment(apt)}
                        style={{
                          background: apt.status === 'accepted' 
                            ? '#ECFDF5' 
                            : apt.status === 'pending' 
                            ? '#FEF3C7' 
                            : '#F0F9FF',
                          borderLeft: `3px solid ${
                            apt.status === 'accepted' 
                              ? '#047857' 
                              : apt.status === 'pending' 
                              ? '#D97706' 
                              : '#0284C7'
                          }`,
                          borderRadius: '4px',
                          padding: '6px 8px',
                          fontSize: '0.78rem',
                          cursor: 'pointer',
                          marginBottom: '2px'
                        }}
                      >
                        <div style={{ fontWeight: 800, color: '#064E3B' }}>{apt.patientName}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{apt.motif}</div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Detail Dialog */}
      {selectedAppointment && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div className="card animate-slide-up" style={{ maxWidth: '440px', width: '100%', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#064E3B' }}>Détail du cours</h3>
              <button onClick={() => setSelectedAppointment(null)} className="btn btn-outline btn-sm">Fermer</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.95rem' }}>
              <div><strong>Élève : </strong> {selectedAppointment.patientName} ({selectedAppointment.patientPhone})</div>
              <div><strong>Cours : </strong> {selectedAppointment.motif}</div>
              <div><strong>Date : </strong> {formatDisplayDate(selectedAppointment.date)} à {selectedAppointment.time}</div>
              <div><strong>Mode : </strong> {selectedAppointment.type === 'zoom' || selectedAppointment.type === 'en_ligne' ? '🎥 Zoom (Visioconférence)' : '💬 WhatsApp (Appel / Vidéo)'}</div>
              {selectedAppointment.patientNotes && (
                <div style={{ background: '#F8FAFC', padding: '10px', borderRadius: '6px' }}>
                  <strong>Note élève : </strong> "{selectedAppointment.patientNotes}"
                </div>
              )}

              <div style={{ display: 'flex', gap: '8px', marginTop: '14px', flexWrap: 'wrap' }}>
                {selectedAppointment.status === 'pending' && (
                  <button
                    onClick={() => {
                      acceptAppointment(selectedAppointment.id);
                      setSelectedAppointment(null);
                    }}
                    className="btn btn-primary btn-sm"
                  >
                    <CheckCircle2 size={16} /> Accepter
                  </button>
                )}

                <button
                  onClick={() => {
                    setSelectedForCounter(selectedAppointment);
                    setSelectedAppointment(null);
                  }}
                  className="btn btn-outline btn-sm"
                >
                  <RefreshCw size={15} /> Proposer un autre horaire
                </button>

                <button
                  onClick={() => {
                    const reason = window.prompt("Motif de l'annulation (facultatif) :", "Empêchement exceptionnel");
                    if (reason !== null) {
                      declineAppointment(selectedAppointment.id, reason);
                      setSelectedAppointment(null);
                    }
                  }}
                  className="btn btn-danger-outline btn-sm"
                  style={{ borderColor: '#EF4444', color: '#EF4444' }}
                >
                  <XCircle size={15} /> Annuler le cours
                </button>
              </div>

              {/* Direct contact buttons */}
              <div style={{ display: 'flex', gap: '8px', marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #F1F5F9' }}>
                <a
                  href={`https://wa.me/${(() => {
                    let p = selectedAppointment.patientPhone.replace(/[\s.-]/g, '');
                    return p.startsWith('0') ? '33' + p.substring(1) : p;
                  })()}?text=${encodeURIComponent(
                    selectedAppointment.status === 'accepted'
                      ? `Salam Aleykoum ${selectedAppointment.patientName}, Aymen pour votre cours de ${selectedAppointment.motif} du ${formatDisplayDate(selectedAppointment.date)} à ${selectedAppointment.time} (Heure de Paris). Salle Zoom : ${selectedAppointment.zoomLink || 'https://us05web.zoom.us/j/9133195007?pwd=k9qcjEJ7F6KnQQKhQ15wWwhsznak5f.1'}`
                      : `Salam Aleykoum ${selectedAppointment.patientName}, suite à votre réservation (${selectedAppointment.motif}) pour le ${formatDisplayDate(selectedAppointment.date)} à ${selectedAppointment.time}.`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-sm"
                  style={{ background: '#25D366', color: '#064E3B', fontWeight: 800, fontSize: '0.82rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <MessageSquare size={14} /> WhatsApp
                </a>

                <a
                  href={`tel:${selectedAppointment.patientPhone.replace(/[\s.-]/g, '')}`}
                  className="btn btn-outline btn-sm"
                  style={{ fontSize: '0.82rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <Phone size={14} /> Appeler
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedForCounter && (
        <CounterProposalModal
          appointment={selectedForCounter}
          onClose={() => setSelectedForCounter(null)}
          onSuccess={() => setSelectedForCounter(null)}
        />
      )}
    </div>
  );
};
