import React, { useState } from 'react';
import { useApp, formatDisplayDate } from '../context/AppContext';
import { 
  Copy, 
  Check, 
  AlertTriangle, 
  Trash2, 
  Plus, 
  Sun, 
  Sunset, 
  Moon,
  Zap
} from 'lucide-react';

export const AymenAvailability: React.FC = () => {
  const { 
    availability, 
    toggleDayEnabled, 
    toggleSlotForDay, 
    setSlotsForDay,
    copyAvailabilityToAllDays,
    blockedDates,
    addBlockedDate,
    removeBlockedDate
  } = useApp();

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

  const handleApplyPreset = (dayOfWeek: number, presetSlots: string[]) => {
    const day = availability.find(d => d.dayOfWeek === dayOfWeek);
    if (!day) return;
    
    const merged = Array.from(new Set([...day.slots, ...presetSlots])).sort();
    setSlotsForDay(dayOfWeek, merged);
  };

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
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: '#047857',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Zap size={22} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#064E3B' }}>
              Gestion Rapide de vos Disponibilités
            </h2>
            <p style={{ fontSize: '0.92rem', color: 'var(--text-muted)' }}>
              Activez ou désactivez vos jours et créneaux en 1 clic. Les changements sont <strong>instantanés</strong> sur la page de réservation des élèves.
            </p>
          </div>
        </div>
      </div>

      {/* Week Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
        {availability.map((day) => (
          <div
            key={day.dayOfWeek}
            className="card"
            style={{
              padding: '20px 24px',
              border: `2px solid ${day.enabled ? '#86EFAC' : '#E2E8F0'}`,
              background: day.enabled ? 'white' : '#F8FAFC',
              transition: 'all 0.2s ease'
            }}
          >
            {/* Top row: Day Name, Toggle, and Copy action */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
              marginBottom: day.enabled ? '16px' : '0'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <button
                  onClick={() => toggleDayEnabled(day.dayOfWeek)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '24px',
                    fontWeight: 800,
                    fontSize: '0.95rem',
                    background: day.enabled ? '#047857' : '#E2E8F0',
                    color: day.enabled ? 'white' : '#64748B',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <span style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    background: day.enabled ? '#4ADE80' : '#94A3B8'
                  }} />
                  {day.dayName} : {day.enabled ? 'Ouvert' : 'Fermé (Repos)'}
                </button>

                {day.enabled && (
                  <span style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                    <strong>{day.slots.length}</strong> créneau{day.slots.length > 1 ? 'x' : ''} actif{day.slots.length > 1 ? 's' : ''}
                  </span>
                )}
              </div>

              {day.enabled && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  {/* Presets */}
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-subtle)', fontWeight: 700 }}>Ajout rapide :</span>
                  <button
                    onClick={() => handleApplyPreset(day.dayOfWeek, PRESETS.morning)}
                    className="btn btn-outline btn-sm"
                    style={{ padding: '4px 8px', fontSize: '0.8rem' }}
                    title="Ajouter 09:30 et 11:00"
                  >
                    <Sun size={13} color="#D97706" /> Matin
                  </button>
                  <button
                    onClick={() => handleApplyPreset(day.dayOfWeek, PRESETS.afternoon)}
                    className="btn btn-outline btn-sm"
                    style={{ padding: '4px 8px', fontSize: '0.8rem' }}
                    title="Ajouter 14:30, 16:00, 17:30"
                  >
                    <Sunset size={13} color="#047857" /> Après-midi
                  </button>
                  <button
                    onClick={() => handleApplyPreset(day.dayOfWeek, PRESETS.evening)}
                    className="btn btn-outline btn-sm"
                    style={{ padding: '4px 8px', fontSize: '0.8rem' }}
                    title="Ajouter 19:00, 20:30"
                  >
                    <Moon size={13} color="#0284C7" /> Soirée
                  </button>
                  <button
                    onClick={() => copyAvailabilityToAllDays(day.dayOfWeek)}
                    className="btn btn-outline btn-sm"
                    style={{ padding: '4px 10px', fontSize: '0.8rem', color: '#047857', borderColor: '#86EFAC' }}
                    title="Appliquer ces créneaux du Lundi au Samedi"
                  >
                    <Copy size={13} /> Dupliquer sur la semaine
                  </button>
                </div>
              )}
            </div>

            {/* Slots Selection Buttons */}
            {day.enabled && (
              <div style={{
                background: '#F0FDF4',
                padding: '14px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid #BBF7D0'
              }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#166534', marginBottom: '8px' }}>
                  Cliquez sur un horaire pour l'activer (vert) ou le désactiver :
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {ALL_POSSIBLE_SLOTS.map((slot) => {
                    const isSelected = day.slots.includes(slot);
                    return (
                      <button
                        type="button"
                        key={slot}
                        onClick={() => toggleSlotForDay(day.dayOfWeek, slot)}
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
                          gap: '4px'
                        }}
                      >
                        {isSelected && <Check size={14} />}
                        {slot}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Blocked Dates */}
      <div className="card" style={{ padding: '24px', border: '2px solid #FEF3C7', background: '#FFFBEB' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#92400E', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertTriangle size={20} color="#D97706" />
          Bloquer une date d'absence exceptionnelle (Congé, Imprévu)
        </h3>
        <p style={{ fontSize: '0.88rem', color: '#B45309', marginBottom: '16px' }}>
          Si vous ne pouvez pas donner de cours un jour précis, bloquez-le ici. Aucun élève ne pourra réserver cette date.
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
