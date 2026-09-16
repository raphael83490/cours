import React, { useState, useMemo } from 'react';
import { useApp, formatShortDate, formatDisplayDate } from '../context/AppContext';
import type { LessonType } from '../types';
import confetti from 'canvas-confetti';
import { 
  MessageSquare, 
  Video, 
  Clock, 
  Send, 
  User, 
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Calendar
} from 'lucide-react';

const DURATION_OPTIONS = [
  { id: '20mn', label: '20 min', title: 'Cours de 20 min' },
  { id: '30mn', label: '30 min', title: 'Cours de 30 min' }
];

const formatToLocalISO = (d: Date): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const SimpleBookingView: React.FC = () => {
  const { bookLesson, setCurrentView, getAvailableSlotsForDate } = useApp();

  const [selectedDurationIndex, setSelectedDurationIndex] = useState<number>(1); // Default to 30min
  const [selectedType, setSelectedType] = useState<LessonType>('whatsapp');
  
  const todayISO = useMemo(() => formatToLocalISO(new Date()), []);
  const [dateOffset, setDateOffset] = useState<number>(0);
  const DAYS_PER_VIEW = 5;

  // Calculate next available date
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return formatToLocalISO(d);
  });

  const availableSlots = useMemo(() => {
    return getAvailableSlotsForDate(selectedDate);
  }, [selectedDate, getAvailableSlotsForDate]);

  const [selectedTime, setSelectedTime] = useState<string>('14:30');

  // When availableSlots change, adjust selectedTime if needed
  React.useEffect(() => {
    if (availableSlots.length > 0 && !availableSlots.includes(selectedTime)) {
      setSelectedTime(availableSlots[0]);
    }
  }, [availableSlots, selectedTime]);

  const [studentName, setStudentName] = useState('');
  const [studentPhone, setStudentPhone] = useState('');
  const [studentNotes, setStudentNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentDuration = DURATION_OPTIONS[selectedDurationIndex] || DURATION_OPTIONS[1];

  const upcomingDays = useMemo(() => {
    const days = [];
    const baseToday = new Date();
    baseToday.setHours(0, 0, 0, 0);

    for (let i = 0; i < DAYS_PER_VIEW; i++) {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() + dateOffset + i);
      const iso = formatToLocalISO(d);

      const diffFromToday = Math.round((d.getTime() - baseToday.getTime()) / (1000 * 60 * 60 * 24));
      const isToday = diffFromToday === 0;
      const isTomorrow = diffFromToday === 1;

      // Check if day has open slots
      const slots = getAvailableSlotsForDate(iso);

      days.push({
        iso,
        label: isToday ? "Aujourd'hui" : isTomorrow ? 'Demain' : formatShortDate(iso),
        formatted: d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
        fullFormatted: d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }),
        hasSlots: slots.length > 0,
        slotCount: slots.length
      });
    }
    return days;
  }, [dateOffset, getAvailableSlotsForDate]);

  const handleNextDays = () => {
    const newOffset = dateOffset + DAYS_PER_VIEW;
    setDateOffset(newOffset);
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + newOffset);
    setSelectedDate(formatToLocalISO(nextDate));
  };

  const handlePrevDays = () => {
    const newOffset = Math.max(0, dateOffset - DAYS_PER_VIEW);
    setDateOffset(newOffset);
    const prevDate = new Date();
    prevDate.setDate(prevDate.getDate() + newOffset);
    setSelectedDate(formatToLocalISO(prevDate));
  };

  const handleResetToday = () => {
    setDateOffset(0);
    const d = new Date();
    d.setDate(d.getDate() + 1);
    setSelectedDate(formatToLocalISO(d));
  };

  const handleDirectDatePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (!val) return;
    setSelectedDate(val);

    const [y, m, d] = val.split('-').map(Number);
    const target = new Date(y, m - 1, d);
    target.setHours(0, 0, 0, 0);

    const baseToday = new Date();
    baseToday.setHours(0, 0, 0, 0);

    const diffDays = Math.max(0, Math.floor((target.getTime() - baseToday.getTime()) / (1000 * 60 * 60 * 24)));
    setDateOffset(diffDays);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim() || !studentPhone.trim() || availableSlots.length === 0) {
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      bookLesson({
        patientName: studentName.trim(),
        patientEmail: studentName.toLowerCase().replace(/\s+/g, '.') + '@eleve.fr',
        patientPhone: studentPhone.trim(),
        motif: currentDuration.title,
        type: selectedType,
        date: selectedDate,
        time: selectedTime,
        patientNotes: studentNotes.trim() || undefined
      });

      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 }
        });
      } catch {
        // fallback
      }

      setIsSubmitting(false);
      setCurrentView('student_my_lessons');
    }, 400);
  };

  return (
    <div className="card" style={{ padding: '32px 24px', border: '2px solid var(--border-subtle)' }}>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h2 style={{ fontSize: '1.7rem', fontWeight: 800, color: '#064E3B', marginBottom: '8px' }}>
          Réserver un cours avec Aymen
        </h2>
        <p style={{ fontSize: '1.05rem', color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto' }}>
          Suivez les 3 étapes simples ci-dessous. Aymen recevra votre demande et vous confirmera le créneau.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Étape 1 : Choisir la durée */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <span style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: '#047857',
              color: 'white',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1rem'
            }}>1</span>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#064E3B' }}>
              Choisissez la durée :
            </h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px' }}>
            {DURATION_OPTIONS.map((opt, idx) => {
              const isSelected = selectedDurationIndex === idx;
              return (
                <div
                  key={opt.id}
                  onClick={() => setSelectedDurationIndex(idx)}
                  style={{
                    padding: '18px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: `2.5px solid ${isSelected ? '#047857' : '#E2E8F0'}`,
                    background: isSelected ? '#047857' : 'white',
                    color: isSelected ? 'white' : '#064E3B',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    textAlign: 'center',
                    transition: 'all 0.2s ease',
                    boxShadow: isSelected ? '0 4px 14px rgba(4, 120, 87, 0.25)' : 'none'
                  }}
                >
                  <Clock size={22} color={isSelected ? 'white' : '#047857'} />
                  <span style={{ fontWeight: 800, fontSize: '1.25rem' }}>
                    {opt.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Étape 2 : Mode de cours */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <span style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: '#047857',
              color: 'white',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1rem'
            }}>2</span>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#064E3B' }}>
              Comment souhaitez-vous faire le cours ?
            </h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
            {/* Option 1 : WhatsApp */}
            <div
              onClick={() => setSelectedType('whatsapp')}
              style={{
                padding: '18px 20px',
                borderRadius: 'var(--radius-md)',
                border: `2.5px solid ${selectedType === 'whatsapp' ? '#25D366' : '#E2E8F0'}`,
                background: selectedType === 'whatsapp' ? '#F0FDF4' : 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                transition: 'all 0.2s ease',
                boxShadow: selectedType === 'whatsapp' ? '0 4px 14px rgba(37, 211, 102, 0.2)' : 'none'
              }}
            >
              <div style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                background: selectedType === 'whatsapp' ? '#25D366' : '#F1F5F9',
                color: selectedType === 'whatsapp' ? '#064E3B' : 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <MessageSquare size={24} />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '1.1rem', color: selectedType === 'whatsapp' ? '#064E3B' : 'var(--text-main)' }}>
                  💬 WhatsApp (Appel / Vidéo)
                </div>
                <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                  Simple, direct sur votre téléphone ou PC
                </div>
              </div>
            </div>

            {/* Option 2 : Zoom */}
            <div
              onClick={() => setSelectedType('zoom')}
              style={{
                padding: '18px 20px',
                borderRadius: 'var(--radius-md)',
                border: `2.5px solid ${selectedType === 'zoom' ? '#2563EB' : '#E2E8F0'}`,
                background: selectedType === 'zoom' ? '#EFF6FF' : 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                transition: 'all 0.2s ease',
                boxShadow: selectedType === 'zoom' ? '0 4px 14px rgba(37, 99, 235, 0.18)' : 'none'
              }}
            >
              <div style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                background: selectedType === 'zoom' ? '#2563EB' : '#F1F5F9',
                color: selectedType === 'zoom' ? 'white' : 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Video size={24} />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '1.1rem', color: selectedType === 'zoom' ? '#1E40AF' : 'var(--text-main)' }}>
                  🎥 Zoom (Visioconférence)
                </div>
                <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                  Lien de visio envoyé automatiquement
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Étape 3 : Jour et heure connectés en direct aux disponibilités d'Aymen */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            marginBottom: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: '#047857',
                color: 'white',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1rem',
                flexShrink: 0
              }}>3</span>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#064E3B', margin: 0 }}>
                  Choisissez le jour et l'heure :
                </h3>
                <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {upcomingDays[0] && upcomingDays[upcomingDays.length - 1] ? (
                    <span>Période affichée : du <strong>{upcomingDays[0].formatted}</strong> au <strong>{upcomingDays[upcomingDays.length - 1].formatted}</strong></span>
                  ) : (
                    "Disponibilités d'Aymen en temps réel"
                  )}
                </div>
              </div>
            </div>

            {/* Navigation buttons: Précédent, Aujourd'hui, Dates plus lointaines, et calendrier */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              {/* Previous button */}
              <button
                type="button"
                onClick={handlePrevDays}
                disabled={dateOffset === 0}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '8px 12px',
                  borderRadius: '10px',
                  border: '1.5px solid #CBD5E1',
                  background: dateOffset === 0 ? '#F1F5F9' : 'white',
                  color: dateOffset === 0 ? '#94A3B8' : '#1E293B',
                  cursor: dateOffset === 0 ? 'not-allowed' : 'pointer',
                  fontWeight: 700,
                  fontSize: '0.85rem'
                }}
                title="Voir les jours précédents"
              >
                <ChevronLeft size={16} />
                <span>Précédent</span>
              </button>

              {/* Reset to Today button if navigated away */}
              {dateOffset > 0 && (
                <button
                  type="button"
                  onClick={handleResetToday}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '10px',
                    border: '1.5px solid #047857',
                    background: '#F0FDF4',
                    color: '#047857',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer'
                  }}
                  title="Revenir aux dates actuelles"
                >
                  Aujourd'hui
                </button>
              )}

              {/* Next arrow: Dates plus lointaines */}
              <button
                type="button"
                onClick={handleNextDays}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 14px',
                  borderRadius: '10px',
                  border: '1.5px solid #047857',
                  background: '#047857',
                  color: 'white',
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  boxShadow: '0 2px 8px rgba(4, 120, 87, 0.25)',
                  transition: 'all 0.15s ease'
                }}
                title="Avancer vers des dates plus lointaines"
              >
                <span>Dates plus lointaines</span>
                <ChevronRight size={18} />
              </button>

              {/* Direct date picker */}
              <label
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: '10px',
                  border: '1.5px solid #CBD5E1',
                  background: 'white',
                  cursor: 'pointer',
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  color: '#334155'
                }}
                title="Sélectionner directement une date précise dans le calendrier"
              >
                <Calendar size={15} color="#047857" />
                <span>Autre date :</span>
                <input
                  type="date"
                  min={todayISO}
                  value={selectedDate}
                  onChange={handleDirectDatePick}
                  style={{
                    border: 'none',
                    outline: 'none',
                    background: 'transparent',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    color: '#064E3B',
                    fontWeight: 700
                  }}
                />
              </label>
            </div>
          </div>

          {/* Grid of days + "Plus loin" button card */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
            gap: '10px',
            marginBottom: '16px'
          }}>
            {upcomingDays.map((d, idx) => {
              const isSelected = selectedDate === d.iso;
              return (
                <button
                  type="button"
                  key={idx}
                  onClick={() => setSelectedDate(d.iso)}
                  style={{
                    padding: '14px 10px',
                    borderRadius: 'var(--radius-md)',
                    border: `2.5px solid ${isSelected ? '#047857' : '#CBD5E1'}`,
                    background: isSelected ? '#047857' : 'white',
                    color: isSelected ? 'white' : '#1E293B',
                    textAlign: 'center',
                    fontWeight: 700,
                    opacity: d.hasSlots ? 1 : 0.6,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    boxShadow: isSelected ? '0 4px 12px rgba(4, 120, 87, 0.25)' : 'none'
                  }}
                >
                  <div style={{ fontSize: '1.05rem' }}>{d.label}</div>
                  <div style={{ fontSize: '0.82rem', opacity: isSelected ? 0.92 : 0.75 }}>
                    {d.formatted}
                  </div>
                  <div style={{
                    fontSize: '0.75rem',
                    marginTop: '4px',
                    color: isSelected ? '#A7F3D0' : d.hasSlots ? '#047857' : '#94A3B8'
                  }}>
                    {d.hasSlots ? `${d.slotCount} créneau${d.slotCount > 1 ? 's' : ''}` : 'Complet / Fermé'}
                  </div>
                </button>
              );
            })}

            {/* Quick Next Button card directly inside the grid */}
            <button
              type="button"
              onClick={handleNextDays}
              style={{
                padding: '14px 10px',
                borderRadius: 'var(--radius-md)',
                border: '2px dashed #047857',
                background: '#F0FDF4',
                color: '#047857',
                textAlign: 'center',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                transition: 'all 0.15s ease'
              }}
              title="Voir les dates suivantes (+5 jours)"
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.95rem', fontWeight: 800 }}>
                <span>Plus loin</span>
                <ChevronRight size={18} />
              </div>
              <div style={{ fontSize: '0.78rem', color: '#065F46', opacity: 0.85 }}>
                +5 jours ➔
              </div>
            </button>
          </div>

          {/* Selected Date Summary Banner */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '8px',
            padding: '10px 16px',
            background: '#F8FAFC',
            borderRadius: '8px',
            border: '1px solid #E2E8F0',
            marginBottom: '14px',
            fontSize: '0.92rem'
          }}>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Date sélectionnée : </span>
              <strong style={{ color: '#064E3B', textTransform: 'capitalize' }}>
                {formatDisplayDate(selectedDate)}
              </strong>
            </div>
            {availableSlots.length > 0 && (
              <span style={{ color: '#047857', fontWeight: 600, fontSize: '0.85rem' }}>
                {availableSlots.length} créneau{availableSlots.length > 1 ? 's' : ''} disponible{availableSlots.length > 1 ? 's' : ''}
              </span>
            )}
          </div>

          {availableSlots.length === 0 ? (
            <div style={{
              padding: '16px',
              background: '#FEF3C7',
              borderRadius: '8px',
              border: '1.5px solid #FDE68A',
              color: '#92400E',
              fontSize: '0.95rem',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <AlertCircle size={20} />
              <span>Aymen n'a plus de créneau ouvert sur cette journée. Veuillez choisir un autre jour ci-dessus.</span>
            </div>
          ) : (
            <>
              <label style={{ display: 'block', fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px' }}>
                Créneaux disponibles pour ce jour :
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {availableSlots.map((time) => {
                  const isSelected = selectedTime === time;
                  return (
                    <button
                      type="button"
                      key={time}
                      onClick={() => setSelectedTime(time)}
                      style={{
                        padding: '12px 20px',
                        borderRadius: '10px',
                        fontSize: '1.1rem',
                        fontWeight: 800,
                        border: `2px solid ${isSelected ? '#047857' : '#E2E8F0'}`,
                        background: isSelected ? '#047857' : '#F8FAFC',
                        color: isSelected ? 'white' : '#1E293B'
                      }}
                    >
                      {time}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Coordonnées */}
        <div style={{
          background: '#F8FAFC',
          padding: '24px',
          borderRadius: 'var(--radius-lg)',
          border: '2px solid #E2E8F0',
          marginBottom: '28px'
        }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#064E3B', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <User size={20} color="#047857" /> Vos coordonnées (très simple) :
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>
                Votre Nom et Prénom <span style={{ color: '#DC2626' }}>*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Khadija Benali"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  borderRadius: 'var(--radius-md)',
                  border: '2px solid #CBD5E1',
                  fontSize: '1.05rem',
                  outline: 'none',
                  background: 'white'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>
                Votre Numéro de Téléphone (pour le SMS) <span style={{ color: '#DC2626' }}>*</span>
              </label>
              <input
                type="tel"
                required
                placeholder="Ex: 06 12 34 56 78"
                value={studentPhone}
                onChange={(e) => setStudentPhone(e.target.value)}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  borderRadius: 'var(--radius-md)',
                  border: '2px solid #CBD5E1',
                  fontSize: '1.05rem',
                  outline: 'none',
                  background: 'white'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>
              Un mot ou une précision pour Aymen (Facultatif) :
            </label>
            <textarea
              rows={2}
              placeholder="Ex: Niveau débutant, je souhaite réviser telle sourate..."
              value={studentNotes}
              onChange={(e) => setStudentNotes(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                border: '2px solid #CBD5E1',
                fontSize: '1rem',
                outline: 'none',
                background: 'white',
                resize: 'vertical'
              }}
            />
          </div>
        </div>

        {/* Submit */}
        <div style={{ textAlign: 'center' }}>
          <button
            type="submit"
            disabled={isSubmitting || availableSlots.length === 0}
            className="btn btn-primary btn-lg"
            style={{ width: '100%', maxWidth: '480px', margin: '0 auto' }}
          >
            <Send size={20} />
            {isSubmitting ? 'Envoi du SMS...' : 'Envoyer ma demande de cours à Aymen'}
          </button>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '10px' }}>
            Aymen recevra votre demande immédiatement et vous confirmera par SMS.
          </div>
        </div>
      </form>
    </div>
  );
};
