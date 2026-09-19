import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AymenLoginModal } from './AymenLoginModal';
import { 
  BookOpen, 
  Calendar, 
  Lock, 
  LogOut, 
  Clock, 
  PhoneCall,
  UserCheck,
  Zap
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    currentView,
    setCurrentView,
    isAymenLoggedIn,
    logoutAymen,
    aymenTab,
    setAymenTab,
    appointments,
    teacher
  } = useApp();

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const pendingCount = appointments.filter(a => a.status === 'pending').length;

  return (
    <>
      <header style={{
        background: 'white',
        borderBottom: '2px solid var(--border-subtle)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)'
      }}>
        {/* Top Assistance Bar */}
        <div style={{
          background: currentView === 'aymen_portal' ? '#064E3B' : '#047857',
          color: 'white',
          padding: '8px 20px',
          fontSize: '0.92rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontWeight: 600 }}>
              {currentView === 'aymen_portal' 
                ? '🔒 Espace Privé Enseignant (Aymen)' 
                : '✨ Cours Particuliers du Saint Coran avec Aymen'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {currentView !== 'aymen_portal' && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.88rem' }}>
                <PhoneCall size={15} /> Besoin d'aide pour réserver ? <strong>{teacher.phone}</strong>
              </span>
            )}
          </div>
        </div>

        {/* Main Navigation Bar */}
        <div style={{
          maxWidth: '1100px',
          margin: '0 auto',
          padding: '14px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          {/* Logo & Title */}
          <div 
            onClick={() => {
              if (currentView === 'aymen_portal') setAymenTab('dashboard');
              else setCurrentView('student_booking');
            }}
            style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', userSelect: 'none' }}
          >
            <div style={{
              width: '44px',
              height: '44px',
              background: 'linear-gradient(135deg, #047857 0%, #065F46 100%)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              boxShadow: '0 4px 10px rgba(4, 120, 87, 0.3)'
            }}>
              <BookOpen size={24} />
            </div>
            <div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#064E3B', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                Cours Aymen
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Apprentissage & Récitation du Saint Coran
              </div>
            </div>
          </div>

          {/* Nav buttons */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {currentView !== 'aymen_portal' ? (
              <>
                <button
                  onClick={() => setCurrentView('student_booking')}
                  className="btn"
                  style={{
                    background: currentView === 'student_booking' ? 'var(--primary-light)' : 'transparent',
                    color: currentView === 'student_booking' ? 'var(--primary)' : 'var(--text-main)',
                    border: currentView === 'student_booking' ? '2px solid var(--primary)' : '2px solid transparent',
                    fontSize: '1rem',
                    padding: '10px 18px'
                  }}
                >
                  <BookOpen size={18} />
                  Réserver un cours
                </button>

                <button
                  onClick={() => setCurrentView('student_my_lessons')}
                  className="btn"
                  style={{
                    background: currentView === 'student_my_lessons' ? 'var(--primary-light)' : 'transparent',
                    color: currentView === 'student_my_lessons' ? 'var(--primary)' : 'var(--text-main)',
                    border: currentView === 'student_my_lessons' ? '2px solid var(--primary)' : '2px solid transparent',
                    fontSize: '1rem',
                    padding: '10px 18px',
                    position: 'relative'
                  }}
                >
                  <Clock size={18} />
                  Mes Inscriptions
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setAymenTab('dashboard')}
                  className="btn btn-sm"
                  style={{
                    background: aymenTab === 'dashboard' ? '#047857' : '#F1F5F9',
                    color: aymenTab === 'dashboard' ? 'white' : 'var(--text-main)',
                    fontWeight: 700
                  }}
                >
                  Demandes reçues {pendingCount > 0 && `(${pendingCount})`}
                </button>

                <button
                  onClick={() => setAymenTab('availability')}
                  className="btn btn-sm"
                  style={{
                    background: aymenTab === 'availability' ? '#047857' : '#F1F5F9',
                    color: aymenTab === 'availability' ? 'white' : 'var(--text-main)',
                    fontWeight: 700
                  }}
                >
                  <Zap size={15} /> Disponibilités
                </button>

                <button
                  onClick={() => setAymenTab('agenda')}
                  className="btn btn-sm"
                  style={{
                    background: aymenTab === 'agenda' ? '#047857' : '#F1F5F9',
                    color: aymenTab === 'agenda' ? 'white' : 'var(--text-main)',
                    fontWeight: 700
                  }}
                >
                  <Calendar size={15} /> Planning
                </button>

                <button
                  onClick={() => setAymenTab('settings')}
                  className="btn btn-sm"
                  style={{
                    background: aymenTab === 'settings' ? '#047857' : '#F1F5F9',
                    color: aymenTab === 'settings' ? 'white' : 'var(--text-main)',
                    fontWeight: 700
                  }}
                >
                  Profil & Paramètres
                </button>
              </>
            )}
          </nav>

          {/* Right Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Aymen Protected Access Gate */}
            {!isAymenLoggedIn ? (
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="btn btn-outline btn-sm"
                style={{
                  fontSize: '0.88rem',
                  borderColor: '#CBD5E1',
                  color: '#475569',
                  background: '#F8FAFC'
                }}
              >
                <Lock size={15} />
                Espace Aymen
              </button>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  onClick={() => setCurrentView('aymen_portal')}
                  className="btn btn-sm"
                  style={{
                    background: currentView === 'aymen_portal' ? '#064E3B' : '#047857',
                    color: 'white'
                  }}
                >
                  <UserCheck size={16} /> Espace Enseignant
                </button>
                <button
                  onClick={logoutAymen}
                  className="btn btn-sm btn-outline"
                  title="Quitter l'espace Aymen"
                  style={{ padding: '6px 10px', color: '#DC2626' }}
                >
                  <LogOut size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <AymenLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </>
  );
};
