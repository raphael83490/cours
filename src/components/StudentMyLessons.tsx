import React, { useState } from 'react';
import { useApp, formatDisplayDate, normalizePhone } from '../context/AppContext';
import { 
  BookOpen, 
  Video, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Smartphone, 
  XCircle, 
  MessageSquare,
  Phone,
  User,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const StudentMyLessons: React.FC = () => {
  const { 
    appointments, 
    acceptCounterProposal, 
    cancelAppointment, 
    openSimulatedDelivery, 
    setCurrentView,
    currentStudentPhone,
    setStudentSession
  } = useApp();

  const [phoneInput, setPhoneInput] = useState('');
  const [isChangingPhone, setIsChangingPhone] = useState(!currentStudentPhone);

  const handleAcceptProposal = (id: string) => {
    acceptCounterProposal(id);
    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.5 }
      });
    } catch {
      // fallback
    }
  };

  const handleSearchPhone = (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneInput.trim()) {
      setStudentSession(phoneInput.trim());
      setIsChangingPhone(false);
    }
  };

  // Filter ONLY appointments belonging to the connected student's phone
  const myAppointments = appointments.filter(a => {
    if (!currentStudentPhone) return false;
    return normalizePhone(a.patientPhone) === normalizePhone(currentStudentPhone);
  });

  if (isChangingPhone || !currentStudentPhone) {
    return (
      <div className="card animate-slide-up" style={{ padding: '36px 24px', maxWidth: '520px', margin: '20px auto', textAlign: 'center', border: '2px solid #A7F3D0' }}>
        <div style={{
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          background: '#ECFDF5',
          color: '#047857',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px',
          boxShadow: '0 4px 12px rgba(4, 120, 87, 0.15)'
        }}>
          <Phone size={30} />
        </div>

        <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#064E3B', marginBottom: '8px' }}>
          Retrouver mes cours avec Aymen
        </h2>
        
        <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', marginBottom: '24px', lineHeight: 1.5 }}>
          Entrez votre numéro de téléphone pour afficher vos demandes de cours, vos confirmations et vos liens Zoom personnels.
        </p>

        <form onSubmit={handleSearchPhone} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <input
            type="tel"
            placeholder="Ex : 06 12 34 56 78"
            value={phoneInput}
            onChange={(e) => setPhoneInput(e.target.value)}
            style={{
              width: '100%',
              padding: '14px 16px',
              fontSize: '1.15rem',
              borderRadius: '8px',
              border: '2px solid #047857',
              textAlign: 'center',
              fontWeight: 700,
              color: '#064E3B',
              letterSpacing: '0.5px'
            }}
            autoFocus
          />

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ width: '100%', justifyContent: 'center', fontSize: '1.05rem', fontWeight: 800 }}
          >
            Afficher mon espace personnel <ArrowRight size={18} />
          </button>
        </form>

        <div style={{ marginTop: '24px', paddingTop: '18px', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'center' }}>
          <button
            onClick={() => setCurrentView('student_booking')}
            className="btn btn-outline btn-sm"
          >
            <BookOpen size={16} /> Vous n'avez pas encore réservé ? Prendre rendez-vous
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#064E3B' }}>
              Mes Inscriptions aux Cours
            </h2>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: '#F0FDF4',
              border: '1.5px solid #86EFAC',
              borderRadius: '20px',
              padding: '4px 12px',
              fontSize: '0.85rem',
              color: '#166534',
              fontWeight: 700
            }}>
              <User size={14} color="#047857" />
              <span>{currentStudentPhone}</span>
              <button
                onClick={() => {
                  setPhoneInput(currentStudentPhone);
                  setIsChangingPhone(true);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#047857',
                  textDecoration: 'underline',
                  cursor: 'pointer',
                  fontWeight: 800,
                  fontSize: '0.78rem',
                  marginLeft: '4px'
                }}
              >
                Changer
              </button>
            </div>
          </div>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            Vos demandes et cours particuliers réservés auprès d'Aymen
          </p>
        </div>

        <button
          onClick={() => setCurrentView('student_booking')}
          className="btn btn-primary"
        >
          <BookOpen size={18} />
          Demander un autre cours
        </button>
      </div>

      {myAppointments.length === 0 ? (
        <div className="card" style={{ padding: '60px 20px', textAlign: 'center' }}>
          <BookOpen size={48} color="#047857" style={{ opacity: 0.4, margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#064E3B' }}>
            Aucun cours trouvé pour le numéro {currentStudentPhone}
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: '440px', margin: '8px auto 24px' }}>
            Vous n'avez pas encore de cours enregistré avec ce numéro ou votre réservation a été faite sous un autre numéro.
          </p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => setCurrentView('student_booking')} className="btn btn-primary btn-lg">
              Réserver un créneau avec Aymen
            </button>
            <button
              onClick={() => {
                setPhoneInput(currentStudentPhone);
                setIsChangingPhone(true);
              }}
              className="btn btn-outline btn-lg"
            >
              Changer de numéro
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {myAppointments.map((apt) => {
            const isPending = apt.status === 'pending';
            const isAccepted = apt.status === 'accepted';
            const isCounter = apt.status === 'counter_proposed';
            const isDeclined = apt.status === 'declined';

            return (
              <div
                key={apt.id}
                className="card"
                style={{
                  padding: '24px',
                  border: `2.5px solid ${
                    isCounter 
                      ? '#0284C7' 
                      : isAccepted 
                      ? '#047857' 
                      : isPending 
                      ? '#D97706' 
                      : '#CBD5E1'
                  }`,
                  position: 'relative'
                }}
              >
                {/* Header info */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#064E3B', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <BookOpen size={20} color="#047857" /> {apt.motif}
                    </h3>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      Élève inscrit : <strong>{apt.patientName}</strong> • Tél : {apt.patientPhone}
                    </div>
                  </div>

                  {/* Status Pills */}
                  <div>
                    {isPending && (
                      <span className="badge badge-pending" style={{ fontSize: '0.9rem', padding: '6px 14px' }}>
                        <Clock size={15} /> En attente de la réponse d'Aymen
                      </span>
                    )}
                    {isAccepted && (
                      <span className="badge badge-accepted" style={{ fontSize: '0.9rem', padding: '6px 14px' }}>
                        <CheckCircle2 size={15} /> Confirmé par Aymen
                      </span>
                    )}
                    {isCounter && (
                      <span className="badge badge-counter" style={{ fontSize: '0.9rem', padding: '6px 14px' }}>
                        <Clock size={15} className="pulse-badge" /> Aymen vous propose un nouvel horaire
                      </span>
                    )}
                    {isDeclined && (
                      <span className="badge badge-declined" style={{ fontSize: '0.9rem', padding: '6px 14px' }}>
                        <XCircle size={15} /> Non disponible
                      </span>
                    )}
                  </div>
                </div>

                {/* Direct WhatsApp to Aymen card when pending */}
                {isPending && (
                  <div
                    className="animate-slide-up"
                    style={{
                      background: '#ECFDF5',
                      border: '1.5px solid #10B981',
                      borderRadius: '14px',
                      padding: '16px 20px',
                      marginBottom: '18px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '12px'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 800, color: '#065F46', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <CheckCircle2 size={18} color="#10B981" />
                        Demande envoyée directement à Aymen !
                      </div>
                      <p style={{ fontSize: '0.86rem', color: '#047857', margin: '4px 0 0 0' }}>
                        Aymen a reçu votre demande sur son application. Vous pouvez aussi lui écrire directement sur WhatsApp au <strong>06 13 92 09 87</strong>.
                      </p>
                    </div>

                    <a
                      href={`https://wa.me/33613920987?text=${encodeURIComponent(
                        `Salam Aleykoum Aymen, je viens de réserver un cours de ${apt.motif} pour le ${formatDisplayDate(apt.date)} à ${apt.time} (Heure de Paris). Mon nom : ${apt.patientName}. Merci !`
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="btn"
                      style={{
                        background: '#25D366',
                        color: '#064E3B',
                        fontWeight: 800,
                        fontSize: '0.88rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      <MessageSquare size={16} /> Écrire à Aymen sur WhatsApp
                    </a>
                  </div>
                )}

                {/* Counter Proposal Notification Card */}
                {isCounter && (
                  <div 
                    className="animate-slide-up"
                    style={{
                      background: '#F0F9FF',
                      border: '2px solid #38BDF8',
                      borderRadius: 'var(--radius-md)',
                      padding: '20px',
                      marginBottom: '20px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0369A1', marginBottom: '10px' }}>
                      <AlertCircle size={22} />
                      <strong style={{ fontSize: '1.1rem' }}>
                        Aymen ne peut pas à l'heure demandée et vous propose :
                      </strong>
                    </div>

                    <div style={{
                      background: 'white',
                      padding: '14px 18px',
                      borderRadius: '10px',
                      border: '1.5px solid #BAE6FD',
                      marginBottom: '14px'
                    }}>
                      <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#075985' }}>
                        {formatDisplayDate(apt.proposedDate || '')} à {apt.proposedTime}
                      </div>
                      <div style={{ fontSize: '0.85rem', color: '#64748B' }}>
                        (Horaire initialement demandé : {formatDisplayDate(apt.date)} à {apt.time})
                      </div>
                    </div>

                    {apt.counterProposalMessage && (
                      <div style={{
                        background: 'rgba(255,255,255,0.8)',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        fontSize: '0.92rem',
                        color: '#1E293B',
                        marginBottom: '16px',
                        display: 'flex',
                        gap: '8px'
                      }}>
                        <MessageSquare size={16} color="#0284C7" style={{ flexShrink: 0, marginTop: '3px' }} />
                        <div><strong>Message d'Aymen : </strong>"{apt.counterProposalMessage}"</div>
                      </div>
                    )}

                    {/* Action buttons */}
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                      <button
                        onClick={() => handleAcceptProposal(apt.id)}
                        className="btn btn-primary"
                        style={{ fontSize: '1.1rem', padding: '12px 24px' }}
                      >
                        <CheckCircle2 size={20} />
                        Oui, j'accepte ce nouvel horaire
                      </button>

                      <button
                        onClick={() => cancelAppointment(apt.id)}
                        className="btn btn-outline"
                      >
                        Refuser et annuler
                      </button>
                    </div>
                  </div>
                )}

                {/* Details Row */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '14px',
                  background: '#F8FAFC',
                  padding: '16px',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '14px'
                }}>
                  <div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Date & Heure :</div>
                    <strong style={{ fontSize: '1.05rem', color: '#064E3B' }}>
                      {formatDisplayDate(apt.date)} à {apt.time}
                    </strong>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Mode de cours :</div>
                    <strong style={{ fontSize: '1rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {(apt.type === 'whatsapp' || apt.type === 'telephone') && <><MessageSquare size={16} color="#25D366" /> 💬 WhatsApp (Appel / Vidéo)</>}
                      {(apt.type === 'zoom' || apt.type === 'en_ligne') && <><Video size={16} color="#2563EB" /> 🎥 Zoom (Visioconférence)</>}
                      {apt.type === 'presentiel' && <><MessageSquare size={16} color="#25D366" /> 💬 WhatsApp</>}
                    </strong>
                  </div>
                </div>

                {/* Zoom Meeting Link Box if Zoom mode and Accepted */}
                {(apt.type === 'zoom' || apt.type === 'en_ligne') && isAccepted && (
                  <div style={{
                    fontSize: '0.92rem',
                    background: '#EFF6FF',
                    border: '1.5px solid #93C5FD',
                    padding: '14px 18px',
                    borderRadius: '12px',
                    marginBottom: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '12px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '8px',
                        background: '#2563EB',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white'
                      }}>
                        <Video size={20} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 800, color: '#1E40AF' }}>Salle de cours Zoom :</div>
                        <div style={{ fontSize: '0.8rem', color: '#3B82F6', wordBreak: 'break-all' }}>
                          {apt.zoomLink || 'https://us05web.zoom.us/j/9133195007?pwd=k9qcjEJ7F6KnQQKhQ15wWwhsznak5f.1'}
                        </div>
                      </div>
                    </div>

                    <a
                      href={apt.zoomLink || 'https://us05web.zoom.us/j/9133195007?pwd=k9qcjEJ7F6KnQQKhQ15wWwhsznak5f.1'}
                      target="_blank"
                      rel="noreferrer"
                      className="btn"
                      style={{
                        background: '#2563EB',
                        color: 'white',
                        fontWeight: 800,
                        fontSize: '0.9rem',
                        padding: '8px 16px',
                        borderRadius: '8px',
                        border: 'none',
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <Video size={16} />
                      Rejoindre le Zoom
                    </a>
                  </div>
                )}

                {/* Info message if Zoom mode and still Pending */}
                {(apt.type === 'zoom' || apt.type === 'en_ligne') && !isAccepted && (
                  <div style={{
                    fontSize: '0.88rem',
                    background: '#F8FAFC',
                    border: '1px dashed #94A3B8',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    marginBottom: '14px',
                    color: '#475569',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <Video size={16} color="#2563EB" />
                    <span><strong>Mode Zoom : </strong> Le lien de connexion vous sera envoyé dès qu'Aymen aura validé votre créneau.</span>
                  </div>
                )}

                {/* Notes from Aymen if accepted */}
                {apt.practitionerNotes && (
                  <div style={{
                    fontSize: '0.92rem',
                    background: '#F0FDF4',
                    border: '1.5px solid #86EFAC',
                    color: '#166534',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    marginBottom: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <CheckCircle2 size={18} />
                    <span><strong>Consigne d'Aymen : </strong> {apt.practitionerNotes}</span>
                  </div>
                )}

                {/* Footer buttons */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: '12px',
                  borderTop: '1px solid var(--border-subtle)',
                  flexWrap: 'wrap',
                  gap: '10px'
                }}>
                  <button
                    onClick={() => {
                      openSimulatedDelivery({
                        channel: 'sms',
                        recipientName: apt.patientName,
                        recipientContact: apt.patientPhone,
                        body: isAccepted
                          ? `COURS AYMEN : ✅ Salam Aleykoum ${apt.patientName}, votre cours de ${apt.motif} est bien confirmé pour le ${formatDisplayDate(apt.date)} à ${apt.time}.`
                          : `COURS AYMEN : Salam Aleykoum ${apt.patientName}, votre demande de cours (${apt.motif}) pour le ${formatDisplayDate(apt.date)} à ${apt.time} est bien reçue.`,
                        badge: 'SMS Reçu sur mobile',
                        dateInfo: `${formatDisplayDate(apt.date)} à ${apt.time}`
                      });
                    }}
                    className="btn btn-outline btn-sm"
                  >
                    <Smartphone size={15} /> Voir la notification SMS
                  </button>

                  {!isCounter && (
                    <button
                      onClick={() => {
                        if (window.confirm('Voulez-vous vraiment annuler ce cours ?')) {
                          cancelAppointment(apt.id);
                        }
                      }}
                      className="btn btn-danger-outline btn-sm"
                    >
                      Annuler la réservation
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
