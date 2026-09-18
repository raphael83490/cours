import React, { useState, useMemo } from 'react';
import { useApp, formatDisplayDate, getFourteenDaysList } from '../context/AppContext';
import { 
  Copy, 
  Check, 
  AlertTriangle, 
  Trash2, 
  Plus, 
  Sun, 
  Sunset, 
  Moon, 
  Zap,
  Sparkles, 
  RefreshCw, 
  CheckCheck, 
  XCircle 
} from 'lucide-react';

export const AymenAvailability: React.FC = () => {
  const { 
    getDateConfig,
    toggleDateEnabled,
    toggleSlotForDate,
    applyPresetToDate,
    clearSlotsForDate,
    copyDateSlotsToTwoWeeks,
    setAllDatesOpen,
    openAll14DaysWithDefaultSlots,
    blockedDates,
    addBlockedDate,
    removeBlockedDate
  } = useApp();

  const [activeTab, setActiveTab] = useState<'all' | 'week1' | 'week2'>('all');
  const [newBlockedDate, setNewBlockedDate] = useState('');
  const [blockedReason, setBlockedReason] = useState('');

  const ALL_POSSIBLE_SLOTS = [
    '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
    '18:00', '18:30', '19:00', '19:30', '20:00', '20:30'
  ];

  const PRESETS = {
    morning: ['09:30', '11:00'],
    afternoon: ['14:30', '16:00', '17:30'],
    evening: ['19:00', '20:30'],
    fullDay: ['09:30', '11:00', '14:30', '16:00', '17:30', '19:00']
  };

  // Get the 14 calendar days starting from today
  const fourteenDays = useMemo(() => getFourteenDaysList(), []);

  // Filter days according to active tab
  const displayedDays = useMemo(() => {
    if (activeTab === 'week1') {
      return fourteenDays.filter(d => d.weekNumber === 1);
    }
    if (activeTab === 'week2') {
      return fourteenDays.filter(d => d.weekNumber === 2);
    }
    return fourteenDays;
  }, [fourteenDays, activeTab]);

  // Global statistics
  const stats = useMemo(() => {
    let openDays = 0;
    let totalSlots = 0;
    fourteenDays.forEach(d => {
      const cfg = getDateConfig(d.iso);
      if (cfg.enabled) {
        openDays++;
        totalSlots += cfg.slots.length;
      }
    });
    return { openDays, totalSlots };
  }, [fourteenDays, getDateConfig]);

  const handleAddBlocked = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBlockedDate) return;
    addBlockedDate(newBlockedDate, blockedReason.trim() || 'Indisponible');
    setNewBlockedDate('');
    setBlockedReason('');
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #064E3B 0%, #047857 100%)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(4, 120, 87, 0.25)'
            }}>
              <Zap size={24} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#064E3B', margin: 0 }}>
                  Planning des Disponibilités sur 14 Jours
                </h2>
                <span style={{
                  padding: '3px 10px',
                  borderRadius: '12px',
                  background: '#FEF3C7',
                  border: '1px solid #FDE68A',
                  color: '#92400E',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  ⏰ Heure de Paris
                </span>
              </div>
              <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                Gérez vos créneaux date par date sur les <strong>14 prochains jours glissants</strong> (horaires en <strong>Heure de Paris</strong>). Les modifications sont <strong>instantanées</strong> pour les élèves.
              </p>
            </div>
          </div>

          {/* Quick stats pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <div style={{
              padding: '8px 14px',
              borderRadius: '20px',
              background: '#F0FDF4',
              border: '1.5px solid #86EFAC',
              color: '#064E3B',
              fontSize: '0.86rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <CheckCheck size={16} color="#047857" />
              <span><strong>{stats.openDays} / 14</strong> jours ouverts</span>
            </div>

            <div style={{
              padding: '8px 14px',
              borderRadius: '20px',
              background: '#ECFDF5',
              border: '1.5px solid #A7F3D0',
              color: '#047857',
              fontSize: '0.86rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <Sparkles size={16} color="#059669" />
              <span><strong>{stats.totalSlots}</strong> créneaux proposés</span>
            </div>
          </div>
        </div>
      </div>

      {/* Control Bar: Week Tabs & Batch Actions */}
      <div className="card" style={{
        padding: '14px 18px',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        background: '#F8FAFC',
        border: '1.5px solid #E2E8F0'
      }}>
        {/* Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            style={{
              padding: '8px 16px',
              borderRadius: '10px',
              fontWeight: 800,
              fontSize: '0.88rem',
              cursor: 'pointer',
              border: 'none',
              background: activeTab === 'all' ? '#047857' : 'white',
              color: activeTab === 'all' ? 'white' : '#475569',
              boxShadow: activeTab === 'all' ? '0 2px 8px rgba(4, 120, 87, 0.25)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            Tous les 14 jours ({fourteenDays.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('week1')}
            style={{
              padding: '8px 16px',
              borderRadius: '10px',
              fontWeight: 800,
              fontSize: '0.88rem',
              cursor: 'pointer',
              border: 'none',
              background: activeTab === 'week1' ? '#047857' : 'white',
              color: activeTab === 'week1' ? 'white' : '#475569',
              boxShadow: activeTab === 'week1' ? '0 2px 8px rgba(4, 120, 87, 0.25)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            Semaine 1 (7 premiers jours)
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('week2')}
            style={{
              padding: '8px 16px',
              borderRadius: '10px',
              fontWeight: 800,
              fontSize: '0.88rem',
              cursor: 'pointer',
              border: 'none',
              background: activeTab === 'week2' ? '#047857' : 'white',
              color: activeTab === 'week2' ? 'white' : '#475569',
              boxShadow: activeTab === 'week2' ? '0 2px 8px rgba(4, 120, 87, 0.25)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            Semaine 2 (7 jours suivants)
          </button>
        </div>

        {/* Global actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setAllDatesOpen(true)}
            className="btn btn-outline btn-sm"
            style={{ fontSize: '0.82rem', padding: '6px 12px', color: '#047857', borderColor: '#86EFAC' }}
            title="Activer tous les 14 jours"
          >
            <Check size={14} /> Tout ouvrir
          </button>

          <button
            type="button"
            onClick={() => setAllDatesOpen(false)}
            className="btn btn-outline btn-sm"
            style={{ fontSize: '0.82rem', padding: '6px 12px', color: '#64748B', borderColor: '#CBD5E1' }}
            title="Désactiver tous les 14 jours"
          >
            <XCircle size={14} /> Tout fermer
          </button>

          <button
            type="button"
            onClick={openAll14DaysWithDefaultSlots}
            className="btn btn-outline btn-sm"
            style={{ fontSize: '0.82rem', padding: '6px 12px', color: '#0284C7', borderColor: '#BAE6FD' }}
            title="Rétablir les horaires standards sur les 14 jours"
          >
            <RefreshCw size={14} /> Réinitialiser
          </button>
        </div>
      </div>

      {/* 14 Days List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '36px' }}>
        {displayedDays.map((day) => {
          const config = getDateConfig(day.iso);
          const isToday = day.diffDays === 0;
          const isTomorrow = day.diffDays === 1;

          return (
            <div
              key={day.iso}
              className="card"
              style={{
                padding: '20px 24px',
                border: `2px solid ${isToday ? '#059669' : config.enabled ? '#86EFAC' : '#E2E8F0'}`,
                background: config.enabled ? 'white' : '#F8FAFC',
                transition: 'all 0.2s ease',
                boxShadow: isToday ? '0 4px 16px rgba(5, 150, 105, 0.12)' : 'none',
                position: 'relative'
              }}
            >
              {/* Day Header Row */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px',
                marginBottom: config.enabled ? '16px' : '0'
              }}>
                {/* Left: Day info & Toggle */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  {/* Status Toggle Button */}
                  <button
                    type="button"
                    onClick={() => toggleDateEnabled(day.iso)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '24px',
                      fontWeight: 800,
                      fontSize: '0.94rem',
                      background: config.enabled ? '#047857' : '#E2E8F0',
                      color: config.enabled ? 'white' : '#64748B',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      cursor: 'pointer',
                      border: 'none',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <span style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      background: config.enabled ? '#4ADE80' : '#94A3B8',
                      boxShadow: config.enabled ? '0 0 8px #4ADE80' : 'none'
                    }} />
                    {config.enabled ? 'Ouvert' : 'Fermé (Repos)'}
                  </button>

                  {/* Day Name and Date */}
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                    <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#064E3B' }}>
                      {day.dayName}
                    </span>
                    <span style={{ fontSize: '0.92rem', color: '#475569', fontWeight: 600 }}>
                      ({day.formattedShort})
                    </span>

                    {/* Today Badge */}
                    {isToday && (
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: '6px',
                        background: '#DCFCE7',
                        color: '#166534',
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        Aujourd'hui
                      </span>
                    )}

                    {/* Tomorrow Badge */}
                    {isTomorrow && (
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: '6px',
                        background: '#EFF6FF',
                        color: '#1D4ED8',
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        Demain
                      </span>
                    )}

                    {/* Week number badge */}
                    <span style={{
                      padding: '2px 6px',
                      borderRadius: '4px',
                      background: '#F1F5F9',
                      color: '#64748B',
                      fontSize: '0.7rem',
                      fontWeight: 700
                    }}>
                      S{day.weekNumber}
                    </span>
                  </div>

                  {/* Slot count info */}
                  {config.enabled && (
                    <span style={{ fontSize: '0.86rem', color: 'var(--text-muted)' }}>
                      • <strong>{config.slots.length}</strong> créneau{config.slots.length > 1 ? 'x' : ''} actif{config.slots.length > 1 ? 's' : ''}
                    </span>
                  )}
                </div>

                {/* Right: Presets & Actions (if open) */}
                {config.enabled && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-subtle)', fontWeight: 700 }}>Presets :</span>
                    
                    <button
                      type="button"
                      onClick={() => applyPresetToDate(day.iso, PRESETS.morning)}
                      className="btn btn-outline btn-sm"
                      style={{ padding: '4px 8px', fontSize: '0.78rem' }}
                      title="Ajouter créneaux du matin (09:30, 11:00)"
                    >
                      <Sun size={12} color="#D97706" /> Matin
                    </button>

                    <button
                      type="button"
                      onClick={() => applyPresetToDate(day.iso, PRESETS.afternoon)}
                      className="btn btn-outline btn-sm"
                      style={{ padding: '4px 8px', fontSize: '0.78rem' }}
                      title="Ajouter créneaux de l'après-midi (14:30, 16:00, 17:30)"
                    >
                      <Sunset size={12} color="#047857" /> Aprem
                    </button>

                    <button
                      type="button"
                      onClick={() => applyPresetToDate(day.iso, PRESETS.evening)}
                      className="btn btn-outline btn-sm"
                      style={{ padding: '4px 8px', fontSize: '0.78rem' }}
                      title="Ajouter créneaux du soir (19:00, 20:30)"
                    >
                      <Moon size={12} color="#0284C7" /> Soir
                    </button>

                    <button
                      type="button"
                      onClick={() => applyPresetToDate(day.iso, PRESETS.fullDay)}
                      className="btn btn-outline btn-sm"
                      style={{ padding: '4px 8px', fontSize: '0.78rem' }}
                      title="Ajouter toute la journée (matin, aprem, soir)"
                    >
                      <Zap size={12} color="#EAB308" /> Tout
                    </button>

                    <button
                      type="button"
                      onClick={() => copyDateSlotsToTwoWeeks(day.iso)}
                      className="btn btn-outline btn-sm"
                      style={{ padding: '4px 10px', fontSize: '0.78rem', color: '#047857', borderColor: '#86EFAC' }}
                      title="Appliquer ces mêmes créneaux aux 14 jours glissants"
                    >
                      <Copy size={12} /> Dupliquer sur les 14j
                    </button>

                    <button
                      type="button"
                      onClick={() => clearSlotsForDate(day.iso)}
                      className="btn btn-outline btn-sm"
                      style={{ padding: '4px 8px', fontSize: '0.78rem', color: '#DC2626', borderColor: '#FECACA' }}
                      title="Vider tous les créneaux pour cette date"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                )}
              </div>

              {/* Slots Selection Buttons (when open) */}
              {config.enabled ? (
                <div style={{
                  background: '#F0FDF4',
                  padding: '14px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid #BBF7D0'
                }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#166534', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>Cliquez sur un horaire pour l'activer (vert) ou le désactiver pour ce jour précis :</span>
                    <span style={{ fontSize: '0.74rem', color: '#047857', background: '#DCFCE7', padding: '2px 6px', borderRadius: '4px', border: '1px solid #86EFAC' }}>
                      ⏰ Heure de Paris
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {ALL_POSSIBLE_SLOTS.map((slot) => {
                      const isSelected = config.slots.includes(slot);
                      return (
                        <button
                          type="button"
                          key={slot}
                          onClick={() => toggleSlotForDate(day.iso, slot)}
                          style={{
                            padding: '6px 14px',
                            borderRadius: '8px',
                            fontSize: '0.92rem',
                            fontWeight: 800,
                            background: isSelected ? '#047857' : 'white',
                            color: isSelected ? 'white' : '#475569',
                            border: `1.5px solid ${isSelected ? '#047857' : '#CBD5E1'}`,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                            boxShadow: isSelected ? '0 2px 6px rgba(4, 120, 87, 0.25)' : 'none'
                          }}
                        >
                          {isSelected && <Check size={14} />}
                          {slot}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div style={{
                  padding: '12px 14px',
                  background: '#F1F5F9',
                  borderRadius: '8px',
                  color: '#64748B',
                  fontSize: '0.86rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span>😴 Ce jour est actuellement fermé. Les élèves ne peuvent réserver aucun créneau. Cliquez sur "Fermé (Repos)" pour ouvrir ce jour.</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Blocked Dates (Congés / Absences exceptionnelles) */}
      <div className="card" style={{ padding: '24px', border: '2px solid #FEF3C7', background: '#FFFBEB' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#92400E', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertTriangle size={20} color="#D97706" />
          Bloquer une date d'absence exceptionnelle (Congé, Imprévu)
        </h3>
        <p style={{ fontSize: '0.88rem', color: '#B45309', marginBottom: '16px' }}>
          Si vous ne pouvez pas donner de cours un jour précis, vous pouvez aussi le marquer comme bloqué avec un motif. Aucun élève ne pourra réserver cette date.
        </p>

        <form onSubmit={handleAddBlocked} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '16px' }}>
          <input
            type="date"
            required
            value={newBlockedDate}
            onChange={(e) => setNewBlockedDate(e.target.value)}
            style={{ padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #FDE68A', fontSize: '0.95rem', background: 'white' }}
          />

          <input
            type="text"
            placeholder="Motif (ex: Déplacement, Repos...)"
            value={blockedReason}
            onChange={(e) => setBlockedReason(e.target.value)}
            style={{ flex: 1, minWidth: '200px', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #FDE68A', fontSize: '0.95rem', background: 'white' }}
          />

          <button type="submit" className="btn btn-primary" style={{ background: '#D97706', borderColor: '#D97706' }}>
            <Plus size={16} /> Bloquer cette date
          </button>
        </form>

        {blockedDates.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#92400E' }}>Dates actuellement bloquées :</div>
            {blockedDates.map((b) => (
              <div
                key={b.date}
                style={{
                  background: 'white',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid #FDE68A',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <strong>{formatDisplayDate(b.date)}</strong>
                  {b.reason && <span style={{ color: '#64748B', marginLeft: '8px' }}>({b.reason})</span>}
                </div>
                <button
                  onClick={() => removeBlockedDate(b.date)}
                  className="btn btn-outline btn-sm"
                  style={{ color: '#DC2626', borderColor: '#FCA5A5', padding: '4px 8px' }}
                >
                  <Trash2 size={14} /> Débloquer
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
