import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  MapPin, 
  Phone, 
  CheckCircle2,
  BookOpen
} from 'lucide-react';

export const TeacherCard: React.FC = () => {
  const { teacher } = useApp();

  return (
    <div className="card" style={{ padding: '26px', marginBottom: '24px', border: '2px solid #E2E8F0' }}>
      <div style={{
        display: 'flex',
        flexDirection: 'row',
        gap: '20px',
        alignItems: 'center',
        flexWrap: 'wrap'
      }}>
        {/* Badge Icône (Sans photo personnelle) */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <div
            style={{
              width: '74px',
              height: '74px',
              borderRadius: '20px',
              background: 'linear-gradient(135deg, #064E3B 0%, #047857 100%)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 6px 16px rgba(4, 120, 87, 0.25)',
              border: '2px solid rgba(255,255,255,0.2)'
            }}
          >
            <BookOpen size={36} />
          </div>
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: '280px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#064E3B' }}>
              {teacher.name}
            </h1>
            <span className="badge badge-accepted" style={{ fontSize: '0.85rem' }}>
              <CheckCircle2 size={15} /> Enseignant Particulier
            </span>
          </div>

          <p style={{ fontSize: '1.1rem', fontWeight: 600, color: '#047857', marginTop: '2px' }}>
            {teacher.title}
          </p>

          <p style={{ fontSize: '0.98rem', color: 'var(--text-muted)', marginTop: '8px', lineHeight: 1.5 }}>
            {teacher.bio}
          </p>

          {/* Quick contact */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '16px',
            marginTop: '14px',
            paddingTop: '12px',
            borderTop: '1px solid var(--border-subtle)',
            fontSize: '0.92rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#064E3B' }}>
              <Phone size={16} color="#047857" />
              <span>Contact direct : <strong>{teacher.phone}</strong></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#064E3B' }}>
              <MapPin size={16} color="#047857" />
              <span>{teacher.location}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
