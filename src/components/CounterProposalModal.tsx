import React, { useState, useMemo } from 'react';
import { useApp, formatDisplayDate, formatToLocalISO, getFourteenDaysList } from '../context/AppContext';
import type { Appointment } from '../types';
import { 
  X, 
  Calendar, 
  Clock, 
  MessageSquare, 
  Send, 
  AlertTriangle 
} from 'lucide-react';

interface CounterProposalModalProps {
  appointment: Appointment;
  onClose: () => void;
  onSuccess: () => void;
}

export const CounterProposalModal: React.FC<CounterProposalModalProps> = ({
  appointment,
  onClose,
  onSuccess
}) => {
  const { counterProposeAppointment } = useApp();

  const todayISO = useMemo(() => formatToLocalISO(new Date()), []);
  const maxBookingDateISO = useMemo(() => {
    const list = getFourteenDaysList();
    return list[list.length - 1]?.iso || formatToLocalISO(new Date());
  }, []);

  const getNextAvailableDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return formatToLocalISO(d);
  };

  const [newDate, setNewDate] = useState<string>(appointment.date || getNextAvailableDate());
  const [newTime, setNewTime] = useState<string>('11:00');
  const [customMessage, setCustomMessage] = useState<string>(
    `Salam alaykoum ${appointment.patientName}, j'ai un empêchement sur l'horaire initialement demandé. Je vous propose plutôt ce créneau pour prendre le temps nécessaire ensemble.`
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const QUICK_TIMES = ['09:30', '11:00', '14:30', '16:00', '17:30', '19:00'];

  const QUICK_TEMPLATES = [
    {
      label: 'Indisponibilité standard',
      text: `Salam alaykoum ${appointment.patientName}, je ne suis pas disponible sur ce créneau. Je vous propose ce nouvel horaire pour votre cours.`
    },
    {
      label: 'Créneau plus calme',
      text: `Salam alaykoum ${appointment.patientName}, ce créneau sera plus calme et nous permettra de bien avancer dans la récitation.`
    }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDate || !newTime) return;

    setIsSubmitting(true);
    setTimeout(() => {
      counterProposeAppointment(appointment.id, newDate, newTime, customMessage);
      setIsSubmitting(false);
      onSuccess();
    }, 300);
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(6, 78, 59, 0.7)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div 
        className="card animate-slide-up"
        style={{
          width: '100%',
          maxWidth: '560px',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: 0,
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-xl)',
          background: 'white'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '18px 24px',
          background: 'linear-gradient(135deg, #064E3B 0%, #047857 100%)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTopLeftRadius: 'var(--radius-lg)',
          borderTopRightRadius: 'var(--radius-lg)'
        }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Proposer un autre horaire de cours</h3>
            <p style={{ fontSize: '0.82rem', opacity: 0.9 }}>
              Élève : {appointment.patientName} ({appointment.motif})
            </p>
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

        {/* Initial Request Recap */}
        <div style={{
          padding: '12px 24px',
          background: '#FEF3C7',
          borderBottom: '1px solid #FDE68A',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <AlertTriangle size={18} color="#D97706" style={{ flexShrink: 0 }} />
          <div style={{ fontSize: '0.86rem', color: '#92400E' }}>
            Horaire demandé par l'élève : <strong>{formatDisplayDate(appointment.date)} à {appointment.time}</strong>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
          {/* Step 1: Select new date */}
          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>
              <Calendar size={16} color="#047857" />
              1. Nouvelle date proposée :
            </label>
            <input
              type="date"
              required
              min={todayISO}
              max={maxBookingDateISO}
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                border: '1.5px solid var(--border-subtle)',
                fontSize: '1rem',
                outline: 'none'
              }}
            />
          </div>

          {/* Step 2: Select new time */}
          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>
              <Clock size={16} color="#047857" />
              <span>2. Nouvel horaire proposé :</span>
              <span style={{ fontSize: '0.76rem', color: '#047857', background: '#DCFCE7', padding: '2px 8px', borderRadius: '6px', border: '1px solid #86EFAC' }}>
                Heure de Paris
              </span>
            </label>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
              {QUICK_TIMES.map((time) => (
                <button
                  type="button"
                  key={time}
                  onClick={() => setNewTime(time)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    background: newTime === time ? '#047857' : '#F1F5F9',
                    color: newTime === time ? 'white' : '#334155',
                    border: '1px solid ' + (newTime === time ? '#047857' : '#E2E8F0')
                  }}
                >
                  {time}
                </button>
              ))}
            </div>

            <input
              type="time"
              required
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                border: '1.5px solid var(--border-subtle)',
                fontSize: '1rem',
                outline: 'none'
              }}
            />
          </div>

          {/* Step 3: Message */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>
              <MessageSquare size={16} color="#047857" />
              3. Message explicatif pour l'élève :
            </label>

            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
              {QUICK_TEMPLATES.map((tmpl, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => setCustomMessage(tmpl.text)}
                  style={{
                    fontSize: '0.78rem',
                    padding: '4px 10px',
                    borderRadius: '12px',
                    background: '#F0FDF4',
                    color: '#065F46',
                    border: '1px solid #BBF7D0'
                  }}
                >
                  {tmpl.label}
                </button>
              ))}
            </div>

            <textarea
              rows={3}
              required
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                border: '1.5px solid var(--border-subtle)',
                fontSize: '0.92rem',
                outline: 'none',
                resize: 'vertical'
              }}
            />
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-outline"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary"
              style={{ minWidth: '180px' }}
            >
              <Send size={16} />
              {isSubmitting ? 'Envoi...' : 'Transmettre à l\'élève'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
