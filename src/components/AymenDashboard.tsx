import React, { useState } from 'react';
import { useApp, formatDisplayDate } from '../context/AppContext';
import type { Appointment } from '../types';
import { CounterProposalModal } from './CounterProposalModal';
import { 
  CheckCircle2, 
  Clock, 
  Calendar, 
  RefreshCw, 
  XCircle, 
  Search, 
  Video, 
  Phone, 
  Check,
  MessageSquare,
  Trash2
} from 'lucide-react';

export const AymenDashboard: React.FC = () => {
  const { 
    appointments, 
    acceptAppointment, 
    declineAppointment, 
    deleteAppointment,
    clearDeclinedAppointments,
    setAymenTab
  } = useApp();

  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'accepted' | 'counter_proposed'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [showPastAppointments, setShowPastAppointments] = useState(false);
  const [selectedForCounter, setSelectedForCounter] = useState<Appointment | null>(null);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [practitionerNote, setPractitionerNote] = useState('');

  // Helper to check if an appointment is upcoming (à venir)
  const isUpcomingAppointment = (apt: Appointment): boolean => {
    if (!apt.date) return true;
    const todayStr = new Date().toISOString().split('T')[0];
    if (apt.date < todayStr) return false;
    if (apt.date > todayStr) return true;
    if (!apt.time) return true;
    const now = new Date();
    const [h, m] = apt.time.split(':').map(Number);
    const aptDateTime = new Date();
    aptDateTime.setHours(h || 0, (m || 0) + 30, 0, 0); // Visible jusqu'à 30 min après le début
    return aptDateTime.getTime() >= now.getTime();
  };

  const upcomingAppointments = appointments.filter(isUpcomingAppointment);
  const pastAppointments = appointments.filter(a => !isUpcomingAppointment(a));

  const pendingCount = upcomingAppointments.filter(a => a.status === 'pending').length;
  const acceptedCount = upcomingAppointments.filter(a => a.status === 'accepted').length;
  const counterCount = upcomingAppointments.filter(a => a.status === 'counter_proposed').length;
  const declinedCount = appointments.filter(a => a.status === 'declined').length;

  const baseList = showPastAppointments ? appointments : upcomingAppointments;

  const filteredAppointments = baseList.filter(apt => {
    if (activeFilter !== 'all' && apt.status !== activeFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        apt.patientName.toLowerCase().includes(q) ||
        apt.motif.toLowerCase().includes(q) ||
        apt.patientPhone.includes(q)
      );
    }
    return true;
  });

  const handleConfirmAccept = (id: string) => {
    acceptAppointment(id, practitionerNote.trim() || undefined);
    setAcceptingId(null);
    setPractitionerNote('');
  };

  return (
    <div>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#064E3B' }}>
            Espace Enseignant — Aymen
          </h1>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>
            Validez les demandes de cours, proposez d'autres créneaux et consultez votre planning
          </p>
        </div>

        <button
          onClick={() => setAymenTab('agenda')}
          className="btn btn-outline"
        >
          <Calendar size={18} />
          Voir mon planning
        </button>
      </div>

      {/* Metric Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px',
        marginBottom: '28px'
      }}>
        <div 
          className="card"
          onClick={() => setActiveFilter('pending')}
          style={{
            padding: '20px',
            cursor: 'pointer',
            borderTop: '4px solid #D97706',
            background: activeFilter === 'pending' ? '#FEF3C7' : 'white'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#92400E' }}>DEMANDES À VALIDER</span>
            <Clock size={20} color="#D97706" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#92400E', margin: '4px 0' }}>
            {pendingCount}
          </div>
          <div style={{ fontSize: '0.82rem', color: '#B45309' }}>En attente de votre réponse</div>
        </div>

        <div 
          className="card"
          onClick={() => setActiveFilter('accepted')}
          style={{
            padding: '20px',
            cursor: 'pointer',
            borderTop: '4px solid #047857',
            background: activeFilter === 'accepted' ? '#ECFDF5' : 'white'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#065F46' }}>COURS CONFIRMÉS</span>
            <CheckCircle2 size={20} color="#047857" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#065F46', margin: '4px 0' }}>
            {acceptedCount}
          </div>
          <div style={{ fontSize: '0.82rem', color: '#047857' }}>Séances planifiées</div>
        </div>

        <div 
          className="card"
          onClick={() => setActiveFilter('counter_proposed')}
          style={{
            padding: '20px',
            cursor: 'pointer',
            borderTop: '4px solid #0284C7',
            background: activeFilter === 'counter_proposed' ? '#F0F9FF' : 'white'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#075985' }}>NOUVEAUX HORAIRES PROPOSÉS</span>
            <RefreshCw size={20} color="#0284C7" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#075985', margin: '4px 0' }}>
            {counterCount}
          </div>
          <div style={{ fontSize: '0.82rem', color: '#0284C7' }}>En attente de l'accord de l'élève</div>
        </div>
      </div>

      {/* Main Inbox */}
      <div className="card" style={{ padding: '24px' }}>
        {/* Filter buttons */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '20px',
          paddingBottom: '16px',
          borderBottom: '1px solid var(--border-subtle)'
        }}>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setActiveFilter('pending')}
              className={`btn btn-sm ${activeFilter === 'pending' ? 'btn-primary' : 'btn-outline'}`}
              style={{
                background: activeFilter === 'pending' ? '#D97706' : 'white',
                borderColor: activeFilter === 'pending' ? '#D97706' : 'var(--border-subtle)',
                color: activeFilter === 'pending' ? 'white' : 'var(--text-main)'
              }}
            >
              En attente ({pendingCount})
            </button>

            <button
              onClick={() => setActiveFilter('accepted')}
              className={`btn btn-sm ${activeFilter === 'accepted' ? 'btn-primary' : 'btn-outline'}`}
              style={{
                background: activeFilter === 'accepted' ? '#047857' : 'white',
                borderColor: activeFilter === 'accepted' ? '#047857' : 'var(--border-subtle)',
                color: activeFilter === 'accepted' ? 'white' : 'var(--text-main)'
              }}
            >
              Confirmés ({acceptedCount})
            </button>

            <button
              onClick={() => setActiveFilter('counter_proposed')}
              className={`btn btn-sm ${activeFilter === 'counter_proposed' ? 'btn-primary' : 'btn-outline'}`}
              style={{
                background: activeFilter === 'counter_proposed' ? '#0284C7' : 'white',
                borderColor: activeFilter === 'counter_proposed' ? '#0284C7' : 'var(--border-subtle)',
                color: activeFilter === 'counter_proposed' ? 'white' : 'var(--text-main)'
              }}
            >
              Propositions ({counterCount})
            </button>

            <button
              onClick={() => setActiveFilter('all')}
              className={`btn btn-sm ${activeFilter === 'all' ? 'btn-primary' : 'btn-outline'}`}
            >
              Toutes {showPastAppointments ? `(${appointments.length})` : `(${upcomingAppointments.length})`}
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {pastAppointments.length > 0 && (
              <button
                onClick={() => setShowPastAppointments(!showPastAppointments)}
                className="btn btn-sm btn-outline"
                style={{
                  fontSize: '0.82rem',
                  padding: '6px 12px',
                  background: showPastAppointments ? '#FEF3C7' : '#F8FAFC',
                  borderColor: showPastAppointments ? '#D97706' : '#E2E8F0',
                  color: showPastAppointments ? '#92400E' : '#475569',
                  fontWeight: 600
                }}
                title="Basculer entre uniquement les cours à venir ou inclure les cours passés"
              >
                {showPastAppointments ? '👁️ Masquer passés' : `📂 Afficher passés (${pastAppointments.length})`}
              </button>
            )}

            {activeFilter === 'all' && declinedCount > 0 && (
              <button
                onClick={() => {
                  if (window.confirm(`Voulez-vous supprimer et nettoyer définitivement les ${declinedCount} cours annulés de la page ?`)) {
                    clearDeclinedAppointments();
                  }
                }}
                className="btn btn-sm btn-outline"
                style={{
                  fontSize: '0.82rem',
                  padding: '6px 12px',
                  background: '#FEF2F2',
                  borderColor: '#FECACA',
                  color: '#DC2626',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
                title="Supprimer tous les rendez-vous annulés pour faire place nette"
              >
                <Trash2 size={14} /> Nettoyer les annulés ({declinedCount})
              </button>
            )}

            <div style={{ position: 'relative', width: '220px' }}>
              <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '12px' }} />
              <input
                type="text"
                placeholder="Rechercher élève..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px 8px 34px',
                  borderRadius: '8px',
                  border: '1.5px solid var(--border-subtle)',
                  fontSize: '0.9rem',
                  outline: 'none'
                }}
              />
            </div>
          </div>
        </div>

        {/* List */}
        {filteredAppointments.length === 0 ? (
          <div style={{ padding: '48px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Calendar size={40} style={{ opacity: 0.35, margin: '0 auto 12px' }} />
            <p style={{ fontWeight: 800, fontSize: '1.05rem', color: '#064E3B', marginBottom: '4px' }}>
              {activeFilter === 'pending' ? 'Aucune demande à venir en attente' : 'Aucun cours à afficher'}
            </p>
            <p style={{ fontSize: '0.9rem', maxWidth: '420px', margin: '0 auto' }}>
              {activeFilter === 'pending'
                ? 'Toutes vos demandes de cours à venir ont été traitées.'
                : 'Seuls les cours à venir sont affichés pour garder votre espace clair.'}
            </p>
            {!showPastAppointments && pastAppointments.length > 0 && (
              <button
                onClick={() => setShowPastAppointments(true)}
                className="btn btn-sm btn-outline"
                style={{ marginTop: '14px', fontSize: '0.85rem' }}
              >
                Afficher l'historique des {pastAppointments.length} cours passés
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {filteredAppointments.map((apt) => {
              const isPending = apt.status === 'pending';
              const isAccepted = apt.status === 'accepted';
              const isCounter = apt.status === 'counter_proposed';
              const isDeclined = apt.status === 'declined';

              return (
                <div
                  key={apt.id}
                  style={{
                    padding: '20px',
                    borderRadius: 'var(--radius-md)',
                    border: '2px solid var(--border-subtle)',
                    background: isPending ? '#FFFBEB' : isDeclined ? '#F9FAFB' : 'white',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '14px',
                    opacity: isDeclined ? 0.85 : 1
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                    <div>
                      <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#064E3B' }}>
                        {apt.patientName}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '2px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Phone size={14} color="#047857" /> {apt.patientPhone}
                        </span>
                        <span>•</span>
                        <span style={{ fontWeight: 600 }}>{apt.motif}</span>
                      </div>
                    </div>

                    <div>
                      {isPending && <span className="badge badge-pending">En attente de validation</span>}
                      {isAccepted && <span className="badge badge-accepted">Confirmé par vous</span>}
                      {isCounter && <span className="badge badge-counter">Proposition envoyée</span>}
                      {isDeclined && <span className="badge" style={{ background: '#FEE2E2', color: '#DC2626', border: '1px solid #FECACA', fontWeight: 700 }}>Annulé / Refusé</span>}
                    </div>
                  </div>

                  {/* Slot requested */}
                  <div style={{
                    background: 'white',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: '1px solid #E2E8F0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '10px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: '#064E3B' }}>
                      <Calendar size={18} color="#047857" />
                      <span>{formatDisplayDate(apt.date)} à {apt.time}</span>
                    </div>

                    <div style={{ fontSize: '0.88rem', color: '#475569', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {(apt.type === 'whatsapp' || apt.type === 'telephone') && <><MessageSquare size={14} color="#25D366" /> 💬 WhatsApp</>}
                      {(apt.type === 'zoom' || apt.type === 'en_ligne') && <><Video size={14} color="#2563EB" /> 🎥 Zoom</>}
                      {apt.type === 'presentiel' && <><MessageSquare size={14} color="#25D366" /> 💬 WhatsApp</>}
                    </div>
                  </div>

                  {/* Notes from student */}
                  {apt.patientNotes && (
                    <div style={{ fontSize: '0.9rem', color: '#475569', background: '#F8FAFC', padding: '10px 14px', borderRadius: '6px' }}>
                      <strong>Mot de l'élève : </strong> "{apt.patientNotes}"
                    </div>
                  )}

                  {/* Inline Accept input */}
                  {acceptingId === apt.id && (
                    <div className="animate-slide-up" style={{ padding: '12px', background: '#F0FDF4', borderRadius: '8px', border: '1.5px solid #86EFAC' }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#166534', marginBottom: '6px' }}>
                        Message ou consigne pour l'élève (ex: "Je vous appellerai sur WhatsApp") :
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: C'est noté, préparez votre Coran page..."
                        value={practitionerNote}
                        onChange={(e) => setPractitionerNote(e.target.value)}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #86EFAC', fontSize: '0.95rem', marginBottom: '8px' }}
                      />
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button onClick={() => setAcceptingId(null)} className="btn btn-outline btn-sm">Annuler</button>
                        <button onClick={() => handleConfirmAccept(apt.id)} className="btn btn-primary btn-sm">
                          <Check size={16} /> Confirmer l'acceptation
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Action buttons */}
                  {acceptingId !== apt.id && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', paddingTop: '8px', borderTop: '1px solid #F1F5F9' }}>
                      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        {isPending && (
                          <>
                            <button
                              onClick={() => setAcceptingId(apt.id)}
                              className="btn btn-primary btn-sm"
                            >
                              <CheckCircle2 size={16} /> Accepter le cours
                            </button>

                            <button
                              onClick={() => setSelectedForCounter(apt)}
                              className="btn btn-outline btn-sm"
                              style={{ borderColor: '#0284C7', color: '#0284C7' }}
                            >
                              <RefreshCw size={16} /> Proposer un autre horaire
                            </button>

                            <button
                              onClick={() => {
                                const reason = window.prompt('Motif (facultatif) :', 'Indisponible');
                                if (reason !== null) declineAppointment(apt.id, reason);
                              }}
                              className="btn btn-danger-outline btn-sm"
                            >
                              <XCircle size={16} /> Refuser
                            </button>
                          </>
                        )}

                        {isAccepted && (
                          <>
                            <button
                              onClick={() => setSelectedForCounter(apt)}
                              className="btn btn-outline btn-sm"
                            >
                              <RefreshCw size={15} /> Proposer de décaler
                            </button>

                            <button
                              onClick={() => {
                                const reason = window.prompt("Motif de l'annulation (facultatif) :", "Empêchement exceptionnel");
                                if (reason !== null) {
                                  declineAppointment(apt.id, reason);
                                }
                              }}
                              className="btn btn-danger-outline btn-sm"
                              style={{ borderColor: '#EF4444', color: '#EF4444' }}
                            >
                              <XCircle size={15} /> Annuler le cours
                            </button>
                          </>
                        )}

                        {(activeFilter === 'all' || isDeclined) && (
                          <button
                            onClick={() => {
                              if (window.confirm(`Voulez-vous retirer définitivement la réservation de ${apt.patientName} de la page pour nettoyer ?`)) {
                                deleteAppointment(apt.id);
                              }
                            }}
                            className="btn btn-sm btn-outline"
                            style={{
                              borderColor: '#FECACA',
                              color: '#DC2626',
                              background: '#FFF5F5',
                              fontSize: '0.82rem',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              fontWeight: 600
                            }}
                            title="Retirer et nettoyer ce rendez-vous de la page"
                          >
                            <Trash2 size={14} /> Supprimer / Nettoyer
                          </button>
                        )}
                      </div>

                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <a
                          href={`https://wa.me/${(() => {
                            let p = apt.patientPhone.replace(/[\s.-]/g, '');
                            return p.startsWith('0') ? '33' + p.substring(1) : p;
                          })()}?text=${encodeURIComponent(
                            isAccepted
                              ? `Salam Aleykoum ${apt.patientName}, Aymen a confirmé votre cours de ${apt.motif} le ${formatDisplayDate(apt.date)} à ${apt.time} (Heure de Paris). Lien Zoom : ${apt.zoomLink || 'https://us05web.zoom.us/j/9133195007?pwd=k9qcjEJ7F6KnQQKhQ15wWwhsznak5f.1'}`
                              : `Salam Aleykoum ${apt.patientName}, suite à votre demande de cours (${apt.motif}) pour le ${formatDisplayDate(apt.date)} à ${apt.time}.`
                          )}`}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-sm"
                          style={{
                            background: '#25D366',
                            color: '#064E3B',
                            fontWeight: 800,
                            fontSize: '0.8rem',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}
                        >
                          <MessageSquare size={14} /> WhatsApp
                        </a>

                        <a
                          href={`tel:${apt.patientPhone.replace(/[\s.-]/g, '')}`}
                          className="btn btn-outline btn-sm"
                          style={{ fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                        >
                          <Phone size={14} /> Appeler
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Counter Proposal Dialog */}
      {selectedForCounter && (
        <CounterProposalModal
          appointment={selectedForCounter}
          onClose={() => setSelectedForCounter(null)}
          onSuccess={() => {
            setSelectedForCounter(null);
            setActiveFilter('counter_proposed');
          }}
        />
      )}
    </div>
  );
};
