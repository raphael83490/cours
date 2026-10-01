import React, { useState, useMemo, useRef } from 'react';
import { useApp, formatDisplayDate, formatToLocalISO, getSevenDaysList } from '../context/AppContext';
import type { LessonType, Appointment } from '../types';
import confetti from 'canvas-confetti';
import { 
  MessageSquare, 
  Video, 
  Clock, 
  User, 
  AlertCircle,
  Lock,
  Check,
  CheckCircle2,
  Send
} from 'lucide-react';

export const SimpleBookingView: React.FC = () => {
  const { bookLesson, setCurrentView, getAvailableSlotsForDate, getDateConfig, appointments } = useApp();

  const [selectedType, setSelectedType] = useState<LessonType>('whatsapp');
  const [confirmedAppointment, setConfirmedAppointment] = useState<Appointment | null>(null);
  
  const sevenDays = useMemo(() => getSevenDaysList(0), []);

  // Default to today or first active day with slots
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const list = getSevenDaysList(0);
    const todayISO = formatToLocalISO(new Date());
    const firstActive = list.find(d => d.iso >= todayISO && getAvailableSlotsForDate(d.iso).length > 0);
    return firstActive?.iso || todayISO;
  });

  const availableSlots = useMemo(() => {
    return getAvailableSlotsForDate(selectedDate);
  }, [selectedDate, getAvailableSlotsForDate]);

  const dayConfig = useMemo(() => {
    return getDateConfig(selectedDate);
  }, [selectedDate, getDateConfig]);

  const allDaySlots = useMemo(() => {
    return dayConfig.enabled ? [...dayConfig.slots] : [];
  }, [dayConfig]);

  const bookedSlots = useMemo(() => {
    return appointments
      .filter(a => a.date === selectedDate && (a.status === 'accepted' || a.status === 'pending'))
      .map(a => a.time.trim());
  }, [appointments, selectedDate]);

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

  const displayedDays = useMemo(() => {
    return sevenDays.map((d) => {
      const slots = getAvailableSlotsForDate(d.iso);
      return {
        ...d,
        hasSlots: slots.length > 0,
        slotCount: slots.length
      };
    });
  }, [sevenDays, getAvailableSlotsForDate]);

  const slotsRef = useRef<HTMLDivElement>(null);

  const handleSelectDate = (iso: string) => {
    setSelectedDate(iso);
    setTimeout(() => {
      if (slotsRef.current) {
        slotsRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 30);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim() || !studentPhone.trim() || availableSlots.length === 0 || !availableSlots.includes(selectedTime)) {
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      try {
        const apt = bookLesson({
          patientName: studentName.trim(),
          patientEmail: studentName.toLowerCase().replace(/\s+/g, '.') + '@eleve.fr',
          patientPhone: studentPhone.trim(),
          motif: 'Cours de 30 min',
          type: selectedType,
          date: selectedDate,
          time: selectedTime,
          patientNotes: studentNotes.trim() || undefined
        });

        if (apt) {
          try {
            confetti({
              particleCount: 70,
              spread: 60,
              origin: { y: 0.6 }
            });
          } catch {
            // fallback
          }
          setConfirmedAppointment(apt);
        }
      } catch (err) {
        console.error('Erreur réservation:', err);
      } finally {
        setIsSubmitting(false);
      }
    }, 350);
  };

  if (confirmedAppointment) {
    const directWaUrl = `https://wa.me/33613920987?text=${encodeURIComponent(
      `Salam aleykoum Aymen, réservation cours : ${formatDisplayDate(confirmedAppointment.date)} à ${confirmedAppointment.time} (Paris). ${confirmedAppointment.patientName} (${confirmedAppointment.patientPhone}).`
    )}`;

    return (
      <div className="card animate-slide-up" style={{ padding: '36px 24px', maxWidth: '640px', margin: '0 auto', textAlign: 'center', border: '2.5px solid #059669', background: '#FFFFFF' }}>
        <div style={{
          width: '68px',
          height: '68px',
          borderRadius: '50%',
          background: '#DCFCE7',
          color: '#059669',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px',
          boxShadow: '0 6px 18px rgba(5, 150, 105, 0.25)'
        }}>
          <CheckCircle2 size={38} />
        </div>

        <div style={{
          display: 'inline-block',
          background: '#ECFDF5',
          border: '1.5px solid #A7F3D0',
          borderRadius: '20px',
          padding: '4px 14px',
          fontSize: '0.85rem',
          fontWeight: 800,
          color: '#047857',
          marginBottom: '10px'
        }}>
          ✅ Réservation enregistrée
        </div>

        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#064E3B', marginBottom: '8px' }}>
          Demande bien prise en compte !
        </h2>

        <p style={{ fontSize: '1.05rem', color: '#334155', maxWidth: '520px', margin: '0 auto 24px', lineHeight: 1.5 }}>
          Salam aleykoum <strong>{confirmedAppointment.patientName}</strong>, votre demande de cours a été transmise directement à Aymen.
        </p>

        {/* Détails du cours */}
        <div style={{
          background: '#F8FAFC',
          border: '1.5px solid #E2E8F0',
          borderRadius: '16px',
          padding: '20px 24px',
          textAlign: 'left',
          marginBottom: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E2E8F0', paddingBottom: '10px' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Date & Horaire :</span>
            <strong style={{ fontSize: '1.05rem', color: '#064E3B' }}>
              {formatDisplayDate(confirmedAppointment.date)} à {confirmedAppointment.time} (Heure de Paris)
            </strong>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E2E8F0', paddingBottom: '10px' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Format du cours :</span>
            <span style={{ fontWeight: 700, color: '#1E293B', display: 'flex', alignItems: 'center', gap: '6px' }}>
              {confirmedAppointment.type === 'zoom' ? '🎥 Zoom (Visioconférence)' : '💬 WhatsApp (Appel / Vidéo)'} (30 min)
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E2E8F0', paddingBottom: '10px' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Élève inscrit :</span>
            <strong style={{ color: '#1E293B' }}>{confirmedAppointment.patientName} ({confirmedAppointment.patientPhone})</strong>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Statut actuel :</span>
            <span style={{
              background: '#FEF3C7',
              color: '#92400E',
              border: '1px solid #FDE68A',
              padding: '3px 10px',
              borderRadius: '12px',
              fontSize: '0.85rem',
              fontWeight: 800
            }}>
              🟡 En attente de validation par Aymen
            </span>
          </div>
        </div>

        {/* Action WhatsApp direct + Espace cours */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '440px', margin: '0 auto' }}>
          <a
            href={directWaUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn"
            style={{
              background: '#25D366',
              color: '#064E3B',
              fontWeight: 800,
              fontSize: '1rem',
              padding: '14px 20px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              boxShadow: '0 4px 14px rgba(37, 211, 102, 0.3)'
            }}
          >
            <MessageSquare size={20} />
            Écrire à Aymen sur WhatsApp
          </a>

          <button
            type="button"
            onClick={() => setCurrentView('student_my_lessons')}
            className="btn btn-outline"
            style={{
              fontWeight: 800,
              fontSize: '0.95rem',
              padding: '12px 18px',
              borderRadius: '12px'
            }}
          >
            Consulter mes inscriptions
          </button>

          <button
            type="button"
            onClick={() => {
              setConfirmedAppointment(null);
              setStudentNotes('');
            }}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#047857',
              fontSize: '0.9rem',
              fontWeight: 700,
              textDecoration: 'underline',
              cursor: 'pointer',
              marginTop: '6px'
            }}
          >
            Réserver un autre créneau
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card" style={{ padding: '32px 24px', border: '2px solid var(--border-subtle)' }}>
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#064E3B', marginBottom: '10px' }}>
          Réserver un cours avec Aymen
        </h2>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 16px',
          borderRadius: '20px',
          background: '#DCFCE7',
          border: '1.5px solid #86EFAC',
          color: '#166534',
          fontWeight: 800,
          fontSize: '0.95rem',
          marginBottom: '12px'
        }}>
          <Clock size={18} color="#166534" />
          <span>Tous les rendez-vous sont des créneaux individuels de 30 minutes</span>
        </div>
        <p style={{ fontSize: '1.02rem', color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto' }}>
          Choisissez votre mode de cours et votre créneau horaire sur les 7 prochains jours.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Étape 1 : Mode de cours */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <span style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: '#047857',
              color: 'white',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.9rem'
            }}>1</span>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#064E3B', margin: 0 }}>
              Comment souhaitez-vous faire le cours ?
            </h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
            {/* Option 1 : WhatsApp */}
            <div
              onClick={() => setSelectedType('whatsapp')}
              style={{
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                border: `2px solid ${selectedType === 'whatsapp' ? '#25D366' : '#E2E8F0'}`,
                background: selectedType === 'whatsapp' ? '#F0FDF4' : 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                transition: 'all 0.15s ease',
                boxShadow: selectedType === 'whatsapp' ? '0 3px 10px rgba(37, 211, 102, 0.18)' : 'none'
              }}
            >
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: selectedType === 'whatsapp' ? '#25D366' : '#F1F5F9',
                color: selectedType === 'whatsapp' ? '#064E3B' : 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <MessageSquare size={20} />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '1.02rem', color: selectedType === 'whatsapp' ? '#064E3B' : 'var(--text-main)' }}>
                  💬 WhatsApp (Appel / Vidéo)
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Direct sur votre téléphone ou PC
                </div>
              </div>
            </div>

            {/* Option 2 : Zoom */}
            <div
              onClick={() => setSelectedType('zoom')}
              style={{
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                border: `2px solid ${selectedType === 'zoom' ? '#2563EB' : '#E2E8F0'}`,
                background: selectedType === 'zoom' ? '#EFF6FF' : 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                transition: 'all 0.15s ease',
                boxShadow: selectedType === 'zoom' ? '0 3px 10px rgba(37, 99, 235, 0.18)' : 'none'
              }}
            >
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: selectedType === 'zoom' ? '#2563EB' : '#F1F5F9',
                color: selectedType === 'zoom' ? 'white' : 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Video size={20} />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '1.02rem', color: selectedType === 'zoom' ? '#1E40AF' : 'var(--text-main)' }}>
                  🎥 Zoom (Visioconférence)
                </div>
                <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                  Lien envoyé automatiquement
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Étape 2 : Jour et heure connectés en direct aux disponibilités d'Aymen */}
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
              }}>2</span>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#064E3B', margin: 0 }}>
                    Choisissez le jour et l'heure :
                  </h3>
                  <span style={{
                    padding: '3px 10px',
                    borderRadius: '12px',
                    background: '#DCFCE7',
                    border: '1.5px solid #86EFAC',
                    color: '#166534',
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    ⏱️ Créneaux de 30 min
                  </span>
                  <span style={{
                    padding: '3px 10px',
                    borderRadius: '12px',
                    background: '#FEF3C7',
                    border: '1.5px solid #FDE68A',
                    color: '#92400E',
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    ⏰ Heure de Paris (France)
                  </span>
                </div>
                <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Planning de la semaine actuelle du Dimanche au Dimanche (du <strong>{sevenDays[0]?.formattedShort}</strong> au <strong>{sevenDays[sevenDays.length - 1]?.formattedShort}</strong>) — créneaux de <strong>30 minutes</strong> en Heure de Paris.
                </div>
              </div>
            </div>
          </div>

          {/* Sunday to Sunday Bar Indicator */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
            marginBottom: '10px',
            flexWrap: 'wrap'
          }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 12px',
              borderRadius: '8px',
              fontSize: '0.82rem',
              fontWeight: 800,
              background: '#ECFDF5',
              color: '#065F46',
              border: '1.5px solid #A7F3D0'
            }}>
              📅 Semaine actuelle du Dimanche au Dimanche ({sevenDays[0]?.formattedShort} au {sevenDays[sevenDays.length - 1]?.formattedShort}) :
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Mise à jour chaque dimanche pour la semaine
            </div>
          </div>

          {/* Grid of days (with 0-slot days in clear RED) */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(105px, 1fr))',
            gap: '8px',
            marginBottom: '10px'
          }}>
            {displayedDays.map((d) => {
              const isSelected = selectedDate === d.iso;
              const hasSlots = d.hasSlots;

              return (
                <button
                  type="button"
                  key={d.iso}
                  onClick={() => handleSelectDate(d.iso)}
                  style={{
                    padding: '10px 6px',
                    borderRadius: 'var(--radius-md)',
                    border: `2px solid ${
                      isSelected ? '#047857' : hasSlots ? '#86EFAC' : '#FCA5A5'
                    }`,
                    background: isSelected 
                      ? '#047857' 
                      : hasSlots 
                        ? 'white' 
                        : '#FEF2F2',
                    color: isSelected 
                      ? 'white' 
                      : hasSlots 
                        ? '#1E293B' 
                        : '#991B1B',
                    textAlign: 'center',
                    fontWeight: 700,
                    opacity: 1,
                    cursor: 'pointer',
                    transition: 'all 0.12s ease',
                    boxShadow: isSelected ? '0 4px 12px rgba(4, 120, 87, 0.28)' : 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '2px'
                  }}
                >
                  <div style={{ fontSize: '0.92rem', fontWeight: 800 }}>
                    {d.dayName}
                  </div>
                  <div style={{ fontSize: '0.78rem', opacity: isSelected ? 0.95 : 0.85 }}>
                    {d.formattedShort}
                  </div>
                  <div style={{
                    fontSize: '0.7rem',
                    marginTop: '3px',
                    padding: '2px 6px',
                    borderRadius: '8px',
                    background: isSelected 
                      ? 'rgba(255,255,255,0.22)' 
                      : hasSlots 
                        ? '#DCFCE7' 
                        : '#FEE2E2',
                    color: isSelected 
                      ? 'white' 
                      : hasSlots 
                        ? '#166534' 
                        : '#DC2626',
                    fontWeight: 800
                  }}>
                    {hasSlots ? `${d.slotCount} libre${d.slotCount > 1 ? 's' : ''}` : '0 créneau'}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Section affichant DIRECTEMENT les horaires du jour sélectionné sans scroll */}
          <div
            ref={slotsRef}
            style={{
              background: '#F8FAFC',
              border: '2px solid #E2E8F0',
              borderRadius: 'var(--radius-md)',
              padding: '16px 18px',
              marginTop: '4px',
              marginBottom: '20px'
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '8px',
              marginBottom: '12px',
              paddingBottom: '10px',
              borderBottom: '1.5px solid #E2E8F0'
            }}>
              <div>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Horaires pour le : </span>
                <strong style={{ fontSize: '1.02rem', color: '#064E3B', textTransform: 'capitalize' }}>
                  {formatDisplayDate(selectedDate)}
                </strong>
                <span style={{ marginLeft: '8px', fontSize: '0.76rem', color: '#047857', background: '#DCFCE7', padding: '2px 8px', borderRadius: '6px', fontWeight: 800, border: '1px solid #86EFAC' }}>
                  ⏱️ 30 min • Heure de Paris
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {availableSlots.length > 0 ? (
                  <span style={{ color: '#047857', fontWeight: 800, fontSize: '0.85rem' }}>
                    ✅ {availableSlots.length} créneau{availableSlots.length > 1 ? 's' : ''} disponible{availableSlots.length > 1 ? 's' : ''}
                  </span>
                ) : (
                  <span style={{ color: '#DC2626', fontWeight: 800, fontSize: '0.85rem' }}>
                    Aucun créneau libre
                  </span>
                )}
                {bookedSlots.length > 0 && (
                  <span style={{ fontSize: '0.74rem', color: '#64748B', background: 'white', padding: '2px 8px', borderRadius: '4px', border: '1px solid #CBD5E1' }}>
                    🔒 {bookedSlots.length} pris
                  </span>
                )}
              </div>
            </div>

            {!dayConfig.enabled || allDaySlots.length === 0 ? (
              <div style={{
                padding: '12px 14px',
                background: '#FEF3C7',
                borderRadius: '8px',
                border: '1.5px solid #FDE68A',
                color: '#92400E',
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <AlertCircle size={18} />
                <span>Aymen n'a pas de créneau ouvert sur ce jour. Veuillez choisir un autre jour ci-dessus.</span>
              </div>
            ) : (
              <>
                {availableSlots.length === 0 && (
                  <div style={{
                    padding: '12px 14px',
                    background: '#FEF2F2',
                    borderRadius: '8px',
                    border: '1.5px solid #FECACA',
                    color: '#991B1B',
                    fontSize: '0.9rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '10px'
                  }}>
                    <AlertCircle size={18} color="#DC2626" />
                    <span>Tous les créneaux de cette date sont déjà pris (cours 100% individuels). Cliquez sur un autre jour ci-dessus.</span>
                  </div>
                )}

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {allDaySlots.map((time) => {
                    const isBooked = bookedSlots.includes(time.trim()) || !availableSlots.includes(time);
                    const isSelected = selectedTime === time && !isBooked;

                    if (isBooked) {
                      return (
                        <div
                          key={time}
                          style={{
                            padding: '9px 13px',
                            borderRadius: '8px',
                            fontSize: '0.9rem',
                            fontWeight: 700,
                            border: '1.5px dashed #CBD5E1',
                            background: '#F1F5F9',
                            color: '#94A3B8',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            cursor: 'not-allowed',
                            userSelect: 'none'
                          }}
                          title="Ce créneau est déjà pris par un autre élève"
                        >
                          <Lock size={13} color="#94A3B8" />
                          <span style={{ textDecoration: 'line-through' }}>{time}</span>
                          <span style={{ fontSize: '0.7rem', background: '#E2E8F0', color: '#64748B', padding: '1px 5px', borderRadius: '4px' }}>
                            Pris
                          </span>
                        </div>
                      );
                    }

                    return (
                      <button
                        type="button"
                        key={time}
                        onClick={() => setSelectedTime(time)}
                        style={{
                          padding: '10px 18px',
                          borderRadius: '8px',
                          fontSize: '1rem',
                          fontWeight: 800,
                          border: `2px solid ${isSelected ? '#047857' : '#86EFAC'}`,
                          background: isSelected ? '#047857' : 'white',
                          color: isSelected ? 'white' : '#065F46',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          boxShadow: isSelected ? '0 4px 10px rgba(4, 120, 87, 0.25)' : 'none',
                          transition: 'all 0.12s ease'
                        }}
                      >
                        <span>{time}</span>
                        {isSelected ? (
                          <Check size={15} />
                        ) : (
                          <span style={{ fontSize: '0.68rem', background: '#DCFCE7', color: '#166534', padding: '2px 5px', borderRadius: '4px' }}>
                            Dispo
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Étape 3 : Coordonnées */}
        <div style={{
          background: '#F8FAFC',
          padding: '24px',
          borderRadius: 'var(--radius-lg)',
          border: '2px solid #E2E8F0',
          marginBottom: '28px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
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
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#064E3B', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <User size={20} color="#047857" /> Vos coordonnées (très simple) :
            </h3>
          </div>

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
                Votre Numéro de Téléphone (WhatsApp) <span style={{ color: '#DC2626' }}>*</span>
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
              Précision sur votre niveau ou sourates à réviser (Facultatif) :
            </label>
            <textarea
              rows={2}
              placeholder="Ex: Niveau débutant en lecture, révision sourate Al-Mulk... (les horaires sont fixes)"
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
            {isSubmitting ? 'Envoi en cours...' : 'Envoyer ma demande de cours à Aymen'}
          </button>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '10px' }}>
            Aymen recevra votre demande immédiatement et vous confirmera par WhatsApp (horaires en Heure de Paris).
          </div>
        </div>
      </form>
    </div>
  );
};
