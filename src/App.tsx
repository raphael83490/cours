import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { TeacherCard } from './components/TeacherCard';
import { SimpleBookingView } from './components/SimpleBookingView';
import { StudentMyLessons } from './components/StudentMyLessons';
import { AymenDashboard } from './components/AymenDashboard';
import { AymenAvailability } from './components/AymenAvailability';
import { AymenAgenda } from './components/AymenAgenda';
import { AymenSettings } from './components/AymenSettings';
import { SmsEmailModal } from './components/SmsEmailModal';
import { ToastContainer } from './components/ToastContainer';
import { 
  Phone, 
  Heart, 
  CheckCircle2, 
  ShieldCheck 
} from 'lucide-react';

const MainApp: React.FC = () => {
  const { currentView, aymenTab, teacher } = useApp();

  return (
    <div className="app-container">
      <Navbar />

      {/* Hero Welcome Banner (Visible for Students) */}
      {currentView === 'student_booking' && (
        <div style={{
          background: 'linear-gradient(135deg, #064E3B 0%, #047857 100%)',
          color: 'white',
          padding: '36px 20px 42px',
          textAlign: 'center',
          boxShadow: 'inset 0 -10px 20px rgba(0,0,0,0.06)'
        }}>
          <div style={{ maxWidth: '850px', margin: '0 auto' }}>
            <h1 style={{
              fontSize: '2.1rem',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              marginBottom: '10px'
            }}>
              Apprentissage du Saint Coran
            </h1>
            <p style={{ fontSize: '1.15rem', opacity: 0.92, maxWidth: '680px', margin: '0 auto 16px', lineHeight: 1.5 }}>
              Cours particuliers avec <strong>Aymen</strong> dans la bienveillance et la patience. Ouvert à tous (débutants, personnes âgées, adultes et enfants).
            </p>
            
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(255,255,255,0.15)',
              padding: '6px 16px',
              borderRadius: '20px',
              fontSize: '0.9rem'
            }}>
              <CheckCircle2 size={16} /> Réservation simple en 3 étapes sans inscription compliquée
            </div>
          </div>
        </div>
      )}

      {/* Main Content Body */}
      <main className="main-content">
        {/* Student: Booking View */}
        {currentView === 'student_booking' && (
          <div>
            <TeacherCard />
            <SimpleBookingView />

            {/* Reassurance points */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '16px',
              marginTop: '28px'
            }}>
              <div className="card" style={{ padding: '20px', display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                <Heart size={26} color="#047857" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <h4 style={{ fontWeight: 800, fontSize: '1.05rem', color: '#064E3B', marginBottom: '4px' }}>Patience & Bienveillance</h4>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    Chacun apprend à son propre rythme. Aucune pression, progression pas à pas.
                  </p>
                </div>
              </div>

              <div className="card" style={{ padding: '20px', display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                <Phone size={26} color="#047857" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <h4 style={{ fontWeight: 800, fontSize: '1.05rem', color: '#064E3B', marginBottom: '4px' }}>Facile par Téléphone</h4>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    Idéal pour les personnes âgées : un simple appel téléphonique suffit pour faire le cours.
                  </p>
                </div>
              </div>

              <div className="card" style={{ padding: '20px', display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                <ShieldCheck size={26} color="#047857" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <h4 style={{ fontWeight: 800, fontSize: '1.05rem', color: '#064E3B', marginBottom: '4px' }}>Notification & Confirmation</h4>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    Aymen valide immédiatement le cours ou vous propose un créneau adapté si indisponible.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Student: My Lessons Tracking */}
        {currentView === 'student_my_lessons' && (
          <StudentMyLessons />
        )}

        {/* Aymen Protected Teacher Space */}
        {currentView === 'aymen_portal' && (
          <div>
            {aymenTab === 'dashboard' && <AymenDashboard />}
            {aymenTab === 'availability' && <AymenAvailability />}
            {aymenTab === 'agenda' && <AymenAgenda />}
            {aymenTab === 'settings' && <AymenSettings />}
          </div>
        )}
      </main>

      {/* SMS Simulation Preview */}
      <SmsEmailModal />

      {/* Floating Alerts */}
      <ToastContainer />

      {/* Simple Footer */}
      <footer style={{
        background: '#064E3B',
        color: 'white',
        padding: '30px 20px',
        marginTop: 'auto',
        borderTop: '1px solid rgba(255,255,255,0.1)'
      }}>
        <div style={{
          maxWidth: '1100px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.2rem', color: 'white' }}>
              Cours de Coran — Aymen
            </div>
            <p style={{ fontSize: '0.88rem', color: '#A7F3D0', marginTop: '4px' }}>
              Enseignement bienveillant et cours particuliers adaptés à tous les âges.
            </p>
          </div>

          <div style={{ fontSize: '0.88rem', color: '#A7F3D0', textAlign: 'right' }}>
            <div>Téléphone : <strong>{teacher.phone}</strong></div>
            <div>{teacher.location}</div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AppProvider>
      <MainApp />
    </AppProvider>
  );
};

export default App;
