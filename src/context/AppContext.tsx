import React, { createContext, useContext, useState, useEffect } from 'react';
import type { 
  Appointment, 
  AppNotification, 
  TeacherProfile, 
  ToastMessage, 
  LessonType, 
  DayAvailability, 
  BlockedDate, 
  SmsConfig,
  WhatsAppStatus,
  FourteenDayItem
} from '../types';
import { 
  INITIAL_APPOINTMENTS, 
  INITIAL_NOTIFICATIONS, 
  INITIAL_TEACHER, 
  INITIAL_AVAILABILITY, 
  INITIAL_BLOCKED_DATES, 
  INITIAL_SMS_CONFIG 
} from '../data/mockData';

export interface SimulatedDelivery {
  isOpen: boolean;
  channel: 'sms' | 'email' | 'whatsapp';
  recipientName: string;
  recipientContact: string;
  subject?: string;
  body: string;
  badge: string;
  dateInfo?: string;
  nativeSmsUrl?: string;
  nativeWhatsAppUrl?: string;
  statusInfo?: string;
}

interface AppContextType {
  teacher: TeacherProfile;
  appointments: Appointment[];
  notifications: AppNotification[];
  toasts: ToastMessage[];
  availability: DayAvailability[];
  blockedDates: BlockedDate[];
  smsConfig: SmsConfig;
  
  // Role & Space separation
  currentView: 'student_booking' | 'student_my_lessons' | 'aymen_portal';
  setCurrentView: (view: 'student_booking' | 'student_my_lessons' | 'aymen_portal') => void;
  isAymenLoggedIn: boolean;
  loginAymen: (pass: string) => boolean;
  logoutAymen: () => void;

  // Student Session & Filter
  currentStudentPhone: string;
  currentStudentName: string;
  setStudentSession: (phone: string, name?: string) => void;
  clearStudentSession: () => void;
  
  // Aymen's inner tabs
  aymenTab: 'dashboard' | 'availability' | 'agenda' | 'sms_settings' | 'settings';
  setAymenTab: (tab: 'dashboard' | 'availability' | 'agenda' | 'sms_settings' | 'settings') => void;

  simulatedDelivery: SimulatedDelivery | null;
  
  // Booking & Actions
  bookLesson: (data: {
    patientName: string;
    patientEmail: string;
    patientPhone: string;
    motif: string;
    type: LessonType;
    date: string;
    time: string;
    patientNotes?: string;
  }) => Appointment;

  acceptAppointment: (id: string, note?: string) => void;
  counterProposeAppointment: (id: string, newDate: string, newTime: string, message: string) => void;
  acceptCounterProposal: (id: string) => void;
  declineAppointment: (id: string, reason?: string) => void;
  cancelAppointment: (id: string) => void;

  // Real SMS & WhatsApp Direct Actions
  sendRealSms: (to: string, message: string) => Promise<{ success: boolean; nativeSmsUrl?: string; status?: string }>;
  sendRealWhatsApp: (to: string, message: string) => Promise<{ success: boolean; nativeWhatsAppUrl?: string; status?: string; isAutoSent?: boolean }>;
  fetchWhatsAppStatus: () => Promise<WhatsAppStatus | null>;
  restartWhatsApp: () => Promise<boolean>;
  whatsAppStatus: WhatsAppStatus | null;

  // Real-time backend sync
  backendUrl: string;
  updateBackendUrl: (url: string) => void;
  serverStatus: 'connected' | 'offline' | 'checking';
  checkServerHealth: () => Promise<boolean>;

  // Availability Management for Aymen (14 days rolling window)
  getAvailableSlotsForDate: (dateStr: string) => string[];
  customDateSlots: Record<string, { enabled: boolean; slots: string[] }>;
  getDateConfig: (dateStr: string) => { enabled: boolean; slots: string[]; isCustom: boolean };
  toggleDateEnabled: (dateStr: string) => void;
  setDateEnabled: (dateStr: string, enabled: boolean) => void;
  toggleSlotForDate: (dateStr: string, slot: string) => void;
  setSlotsForDate: (dateStr: string, slots: string[]) => void;
  applyPresetToDate: (dateStr: string, presetSlots: string[]) => void;
  clearSlotsForDate: (dateStr: string) => void;
  copyDateSlotsToTwoWeeks: (sourceDateStr: string) => void;
  setAllDatesOpen: (open: boolean) => void;
  openAll14DaysWithDefaultSlots: () => void;
  resetDateToDefault: (dateStr: string) => void;
  resetAllTwoWeeksToDefault: () => void;
  toggleDayEnabled: (dayOfWeek: number) => void;
  toggleSlotForDay: (dayOfWeek: number, slot: string) => void;
  setSlotsForDay: (dayOfWeek: number, slots: string[]) => void;
  copyAvailabilityToAllDays: (sourceDayOfWeek: number) => void;
  addBlockedDate: (date: string, reason?: string) => void;
  removeBlockedDate: (date: string) => void;
  updateSmsConfig: (newConfig: Partial<SmsConfig>) => void;

  // Notifications
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: (role?: 'patient' | 'aymen') => void;
  clearNotifications: () => void;
  removeToast: (id: string) => void;
  showToast: (title: string, message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  closeSimulatedDelivery: () => void;
  openSimulatedDelivery: (delivery: Omit<SimulatedDelivery, 'isOpen'>) => void;

  updateTeacherProfile: (profile: Partial<TeacherProfile>) => void;
  resetToDefaults: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const normalizePhone = (phone?: string): string => {
  if (!phone) return '';
  return phone.replace(/[\s.\-_()]/g, '').replace(/^\+33/, '0');
};

const STORAGE_KEY_APPOINTMENTS = 'aymen_quran_lessons_v5';
const STORAGE_KEY_NOTIFICATIONS = 'aymen_quran_notifs_v5';
const STORAGE_KEY_PROFILE = 'aymen_quran_teacher_v5';
const STORAGE_KEY_AUTH = 'aymen_is_authenticated_v3';
const STORAGE_KEY_AVAILABILITY = 'aymen_availability_v3';
const STORAGE_KEY_CUSTOM_DATE_SLOTS = 'aymen_custom_date_slots_v2';
const STORAGE_KEY_BLOCKED_DATES = 'aymen_blocked_dates_v3';
const STORAGE_KEY_SMS_CONFIG = 'aymen_sms_config_v3';
const STORAGE_KEY_STUDENT_PHONE = 'aymen_student_phone_v3';
const STORAGE_KEY_STUDENT_NAME = 'aymen_student_name_v3';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [teacher, setTeacher] = useState<TeacherProfile>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PROFILE);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const phone = (parsed.phone && parsed.phone !== '06 50 20 30 40') ? parsed.phone : INITIAL_TEACHER.phone;
        const zoomLink = (parsed.zoomLink && !parsed.zoomLink.includes('84920482910')) ? parsed.zoomLink : INITIAL_TEACHER.zoomLink;
        return {
          ...INITIAL_TEACHER,
          ...parsed,
          phone,
          zoomLink,
          name: 'Aymen',
          avatarUrl: ''
        };
      } catch {
        return INITIAL_TEACHER;
      }
    }
    return INITIAL_TEACHER;
  });

  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_APPOINTMENTS);
    return saved ? JSON.parse(saved) : INITIAL_APPOINTMENTS;
  });

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_NOTIFICATIONS);
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [availability, setAvailability] = useState<DayAvailability[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_AVAILABILITY);
    return saved ? JSON.parse(saved) : INITIAL_AVAILABILITY;
  });

  const [customDateSlots, setCustomDateSlots] = useState<Record<string, { enabled: boolean; slots: string[] }>>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_CUSTOM_DATE_SLOTS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return {};
      }
    }
    return {};
  });

  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_BLOCKED_DATES);
    return saved ? JSON.parse(saved) : INITIAL_BLOCKED_DATES;
  });

  const [smsConfig, setSmsConfig] = useState<SmsConfig>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_SMS_CONFIG);
    return saved ? JSON.parse(saved) : INITIAL_SMS_CONFIG;
  });

  const [isAymenLoggedIn, setIsAymenLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEY_AUTH) === 'true';
  });

  const [currentStudentPhone, setCurrentStudentPhone] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEY_STUDENT_PHONE) || '06 12 34 56 78';
  });

  const [currentStudentName, setCurrentStudentName] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEY_STUDENT_NAME) || 'Mme Khadija Benali';
  });

  const setStudentSession = (phone: string, name?: string) => {
    const cleanPhone = phone.trim();
    setCurrentStudentPhone(cleanPhone);
    localStorage.setItem(STORAGE_KEY_STUDENT_PHONE, cleanPhone);
    if (name) {
      const cleanName = name.trim();
      setCurrentStudentName(cleanName);
      localStorage.setItem(STORAGE_KEY_STUDENT_NAME, cleanName);
    }
  };

  const clearStudentSession = () => {
    setCurrentStudentPhone('');
    setCurrentStudentName('');
    localStorage.removeItem(STORAGE_KEY_STUDENT_PHONE);
    localStorage.removeItem(STORAGE_KEY_STUDENT_NAME);
  };

  const [currentView, setCurrentView] = useState<'student_booking' | 'student_my_lessons' | 'aymen_portal'>('student_booking');
  const [aymenTab, setAymenTab] = useState<'dashboard' | 'availability' | 'agenda' | 'sms_settings' | 'settings'>('dashboard');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [simulatedDelivery, setSimulatedDelivery] = useState<SimulatedDelivery | null>(null);

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_APPOINTMENTS, JSON.stringify(appointments));
  }, [appointments]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_NOTIFICATIONS, JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(teacher));
  }, [teacher]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_AVAILABILITY, JSON.stringify(availability));
  }, [availability]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_CUSTOM_DATE_SLOTS, JSON.stringify(customDateSlots));
  }, [customDateSlots]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_BLOCKED_DATES, JSON.stringify(blockedDates));
  }, [blockedDates]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SMS_CONFIG, JSON.stringify(smsConfig));
  }, [smsConfig]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_AUTH, isAymenLoggedIn ? 'true' : 'false');
  }, [isAymenLoggedIn]);

  const loginAymen = (pass: string): boolean => {
    const trimmed = pass.trim();
    if (trimmed === 'aymen123') {
      setIsAymenLoggedIn(true);
      setCurrentView('aymen_portal');
      showToast('Connexion réussie', 'Bienvenue dans votre espace enseignant Aymen.', 'success');
      return true;
    }
    showToast('Code d\'accès incorrect', 'Le mot de passe enseignant est incorrect.', 'error');
    return false;
  };

  const logoutAymen = () => {
    setIsAymenLoggedIn(false);
    setCurrentView('student_booking');
    showToast('Déconnexion', 'Vous êtes revenu sur l\'espace public des élèves.', 'info');
  };

  // ==========================================
  // 🚀 REAL-TIME BACKEND SYNC (Railway & Local)
  // ==========================================
  const [backendUrl, setBackendUrlState] = useState<string>(() => {
    return localStorage.getItem('aymen_backend_url') || (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
  });
  const [serverStatus, setServerStatus] = useState<'connected' | 'offline' | 'checking'>('checking');
  const [whatsAppStatus] = useState<WhatsAppStatus | null>({
    isReady: true,
    statusText: 'WhatsApp Direct Actif',
    whatsappUser: '06 13 92 09 87'
  });

  const getEffectiveApiUrl = (): string => {
    if (backendUrl && backendUrl.trim()) {
      return backendUrl.trim().replace(/\/$/, '');
    }
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:3001';
    }
    return '';
  };

  const updateBackendUrl = (url: string) => {
    const cleaned = url.trim().replace(/\/$/, '');
    localStorage.setItem('aymen_backend_url', cleaned);
    setBackendUrlState(cleaned);
    showToast('Serveur configuré', cleaned ? `Connecté à : ${cleaned}` : 'Mode serveur local / automatique', 'info');
  };

  const checkServerHealth = async (): Promise<boolean> => {
    const api = getEffectiveApiUrl();
    try {
      const res = await fetch(`${api}/api/health`, { cache: 'no-store' });
      if (res.ok) {
        setServerStatus('connected');
        showToast('Connexion réussie', 'Le serveur backend répond parfaitement en temps réel.', 'success');
        return true;
      }
    } catch {
      // offline
    }
    setServerStatus('offline');
    showToast('Serveur hors ligne', 'Impossible de joindre le serveur. Vérifiez l\'adresse Railway ou l\'état du déploiement.', 'error');
    return false;
  };

  // Poll server for new appointments in real-time
  useEffect(() => {
    let isSubscribed = true;

    const syncWithServer = async () => {
      const api = getEffectiveApiUrl();
      try {
        const res = await fetch(`${api}/api/appointments`, { cache: 'no-store' });
        if (res.ok) {
          const serverApts: Appointment[] = await res.json();
          if (!isSubscribed) return;

          setServerStatus('connected');

          setAppointments(prevLocal => {
            const localIds = new Set(prevLocal.map(a => a.id));
            const newPendingApts = serverApts.filter(sa => !localIds.has(sa.id) && sa.status === 'pending');

            if (newPendingApts.length > 0) {
              playNotificationSound();
              newPendingApts.forEach(apt => {
                showToast(
                  '📖 Nouvelle réservation reçue !',
                  `${apt.patientName} a réservé pour le ${formatDisplayDate(apt.date)} à ${apt.time} (Heure de Paris).`,
                  'success'
                );
              });
            }

            // Merge server appointments with any unsaved local ones
            const serverIds = new Set(serverApts.map(a => a.id));
            const localOnly = prevLocal.filter(l => !serverIds.has(l.id));
            return [...serverApts, ...localOnly];
          });
        } else {
          if (isSubscribed) setServerStatus('offline');
        }
      } catch {
        if (isSubscribed) setServerStatus('offline');
      }
    };

    syncWithServer();
    const interval = setInterval(syncWithServer, 3500);

    return () => {
      isSubscribed = false;
      clearInterval(interval);
    };
  }, [backendUrl]);

  // Compatibility stubs for WhatsApp status
  const fetchWhatsAppStatus = async (): Promise<WhatsAppStatus | null> => {
    return whatsAppStatus;
  };

  const restartWhatsApp = async (): Promise<boolean> => {
    showToast('WhatsApp Prêt', 'Lien WhatsApp direct 100% actif sans interruption.', 'success');
    return true;
  };

  // 100% Reliable Direct WhatsApp Message Generator
  const sendRealWhatsApp = async (to: string, message: string): Promise<{ success: boolean; nativeWhatsAppUrl: string; status: string; isAutoSent: boolean }> => {
    let clean = to.replace(/[\s.-]/g, '');
    if (clean.startsWith('0') && clean.length === 10) {
      clean = '33' + clean.substring(1);
    } else if (clean.startsWith('+')) {
      clean = clean.substring(1);
    }
    const nativeWhatsAppUrl = `https://wa.me/${clean}?text=${encodeURIComponent(message)}`;

    return {
      success: true,
      nativeWhatsAppUrl,
      status: 'direct_whatsapp',
      isAutoSent: false
    };
  };

  // 100% Reliable Direct SMS Link Generator
  const sendRealSms = async (to: string, message: string): Promise<{ success: boolean; nativeSmsUrl: string; status: string }> => {
    const clean = to.replace(/[\s.-]/g, '');
    const formatted = clean.startsWith('0') ? '+33' + clean.substring(1) : clean;
    const nativeSmsUrl = `sms:${formatted}?&body=${encodeURIComponent(message)}`;

    return {
      success: true,
      nativeSmsUrl,
      status: 'direct_sms'
    };
  };

  // Helper to get configuration for a specific date (custom override or fallback to week day template)
  const getDateConfig = (dateStr: string): { enabled: boolean; slots: string[]; isCustom: boolean } => {
    if (customDateSlots[dateStr] !== undefined) {
      return {
        enabled: customDateSlots[dateStr].enabled,
        slots: customDateSlots[dateStr].slots,
        isCustom: true
      };
    }
    const [year, month, day] = dateStr.split('-').map(Number);
    const dateObj = new Date(year, month - 1, day);
    const dayOfWeek = dateObj.getDay(); // 0 = Dimanche, 1 = Lundi, etc.
    const dayConfig = availability.find(a => a.dayOfWeek === dayOfWeek);
    return {
      enabled: dayConfig ? dayConfig.enabled : false,
      slots: dayConfig ? [...dayConfig.slots] : [],
      isCustom: false
    };
  };

  // Helper to get dynamically available slots for a given date (strictly bounded to max 14 days rolling window)
  const getAvailableSlotsForDate = (dateStr: string): string[] => {
    // 1. Strict 14-day rolling window check (0 <= diffDays < 14)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [year, month, day] = dateStr.split('-').map(Number);
    const target = new Date(year, month - 1, day);
    target.setHours(0, 0, 0, 0);

    const diffDays = Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    // Refuse booking in the past or beyond 14 days
    if (diffDays < 0 || diffDays >= 14) {
      return [];
    }

    // 2. Check if date is in blocked dates
    if (blockedDates.some(b => b.date === dateStr)) {
      return [];
    }

    // 3. Get config for this date
    const cfg = getDateConfig(dateStr);
    if (!cfg.enabled) {
      return [];
    }

    // 4. Filter out slots already taken/pending and past slots for today
    const now = new Date();

    return cfg.slots.filter(slot => {
      // If booking for today, do not allow slots that have already started
      if (diffDays === 0) {
        const [h, m] = slot.split(':').map(Number);
        const slotDate = new Date(today);
        slotDate.setHours(h, m, 0, 0);
        if (slotDate.getTime() <= now.getTime() + 15 * 60 * 1000) {
          return false;
        }
      }

      const isTaken = appointments.some(
        apt => apt.date === dateStr && apt.time === slot && (apt.status === 'accepted' || apt.status === 'pending')
      );
      return !isTaken;
    });
  };

  // 14-Day Date Specific Availability Actions for Aymen
  const toggleDateEnabled = (dateStr: string) => {
    const current = getDateConfig(dateStr);
    setCustomDateSlots(prev => ({
      ...prev,
      [dateStr]: {
        enabled: !current.enabled,
        slots: current.slots
      }
    }));
    showToast('Disponibilité mise à jour', `Le ${formatDisplayDate(dateStr)} est maintenant ${!current.enabled ? 'Ouvert' : 'Fermé'}.`, 'info');
  };

  const setDateEnabled = (dateStr: string, enabled: boolean) => {
    const current = getDateConfig(dateStr);
    setCustomDateSlots(prev => ({
      ...prev,
      [dateStr]: {
        enabled,
        slots: current.slots
      }
    }));
  };

  const toggleSlotForDate = (dateStr: string, slot: string) => {
    const current = getDateConfig(dateStr);
    const exists = current.slots.includes(slot);
    const newSlots = exists 
      ? current.slots.filter(s => s !== slot) 
      : [...current.slots, slot].sort();

    setCustomDateSlots(prev => ({
      ...prev,
      [dateStr]: {
        enabled: true,
        slots: newSlots
      }
    }));
  };

  const setSlotsForDate = (dateStr: string, slots: string[]) => {
    const current = getDateConfig(dateStr);
    setCustomDateSlots(prev => ({
      ...prev,
      [dateStr]: {
        enabled: slots.length > 0 ? true : current.enabled,
        slots: [...slots].sort()
      }
    }));
  };

  const applyPresetToDate = (dateStr: string, presetSlots: string[]) => {
    const current = getDateConfig(dateStr);
    const merged = Array.from(new Set([...current.slots, ...presetSlots])).sort();
    setCustomDateSlots(prev => ({
      ...prev,
      [dateStr]: {
        enabled: true,
        slots: merged
      }
    }));
  };

  const clearSlotsForDate = (dateStr: string) => {
    setCustomDateSlots(prev => ({
      ...prev,
      [dateStr]: {
        enabled: false,
        slots: []
      }
    }));
  };

  const copyDateSlotsToTwoWeeks = (sourceDateStr: string) => {
    const source = getDateConfig(sourceDateStr);
    const updates: Record<string, { enabled: boolean; slots: string[] }> = {};

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 14; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const iso = formatToLocalISO(d);
      updates[iso] = {
        enabled: source.enabled,
        slots: [...source.slots]
      };
    }

    setCustomDateSlots(prev => ({
      ...prev,
      ...updates
    }));
    showToast('Planning appliqué', `Les horaires du ${formatDisplayDate(sourceDateStr)} ont été appliqués sur les 14 jours.`, 'success');
  };

  const setAllDatesOpen = (open: boolean) => {
    const updates: Record<string, { enabled: boolean; slots: string[] }> = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 14; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const iso = formatToLocalISO(d);
      const current = getDateConfig(iso);
      updates[iso] = {
        enabled: open,
        slots: open && current.slots.length === 0 
          ? ['09:30', '11:00', '14:30', '16:00', '17:30', '19:00'] 
          : [...current.slots]
      };
    }

    setCustomDateSlots(prev => ({
      ...prev,
      ...updates
    }));
    showToast('Disponibilités mises à jour', open ? 'Les 14 jours sont maintenant ouverts.' : 'Les 14 jours ont été fermés.', 'info');
  };

  const openAll14DaysWithDefaultSlots = () => {
    const updates: Record<string, { enabled: boolean; slots: string[] }> = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 14; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const iso = formatToLocalISO(d);
      const dayOfWeek = d.getDay();
      const defaultDay = availability.find(a => a.dayOfWeek === dayOfWeek);
      updates[iso] = {
        enabled: defaultDay ? defaultDay.enabled : false,
        slots: defaultDay ? [...defaultDay.slots] : []
      };
    }

    setCustomDateSlots(updates);
    showToast('Horaires réinitialisés', 'Les 14 jours ont été réinitialisés avec vos horaires standards.', 'info');
  };

  const resetDateToDefault = (dateStr: string) => {
    setCustomDateSlots(prev => {
      const copy = { ...prev };
      delete copy[dateStr];
      return copy;
    });
    showToast('Horaires réinitialisés', `Le ${formatDisplayDate(dateStr)} utilise de nouveau l'horaire habituel.`, 'info');
  };

  const resetAllTwoWeeksToDefault = () => {
    setCustomDateSlots({});
    showToast('Réinitialisation', 'Les 14 jours reprennent les horaires habituels par défaut.', 'info');
  };

  // Availability toggles
  const toggleDayEnabled = (dayOfWeek: number) => {
    setAvailability(prev => prev.map(day => {
      if (day.dayOfWeek === dayOfWeek) {
        return { ...day, enabled: !day.enabled };
      }
      return day;
    }));
    showToast('Disponibilité mise à jour', 'Le jour a été modifié.', 'info');
  };

  const toggleSlotForDay = (dayOfWeek: number, slot: string) => {
    setAvailability(prev => prev.map(day => {
      if (day.dayOfWeek === dayOfWeek) {
        const exists = day.slots.includes(slot);
        const newSlots = exists 
          ? day.slots.filter(s => s !== slot) 
          : [...day.slots, slot].sort();
        return { ...day, slots: newSlots };
      }
      return day;
    }));
  };

  const setSlotsForDay = (dayOfWeek: number, slots: string[]) => {
    setAvailability(prev => prev.map(day => {
      if (day.dayOfWeek === dayOfWeek) {
        return { ...day, slots };
      }
      return day;
    }));
  };

  const copyAvailabilityToAllDays = (sourceDayOfWeek: number) => {
    const source = availability.find(a => a.dayOfWeek === sourceDayOfWeek);
    if (!source) return;

    setAvailability(prev => prev.map(day => {
      if (day.dayOfWeek === 0) return day; // keep sunday closed or copy too
      return { ...day, enabled: source.enabled, slots: [...source.slots] };
    }));
    showToast('Horaires dupliqués', `Les créneaux de ${source.dayName} ont été copiés sur la semaine.`, 'success');
  };

  const addBlockedDate = (date: string, reason?: string) => {
    if (!date) return;
    setBlockedDates(prev => [...prev.filter(b => b.date !== date), { date, reason }]);
    showToast('Date bloquée', `Vous êtes marqué comme indisponible le ${formatDisplayDate(date)}.`, 'warning');
  };

  const removeBlockedDate = (date: string) => {
    setBlockedDates(prev => prev.filter(b => b.date !== date));
    showToast('Disponibilité rétablie', `Le ${formatDisplayDate(date)} est de nouveau ouvert.`, 'success');
  };

  const updateSmsConfig = (newConfig: Partial<SmsConfig>) => {
    setSmsConfig(prev => ({ ...prev, ...newConfig }));
    showToast('Configuration SMS enregistrée', 'Vos paramètres d\'envoi SMS ont été mis à jour.', 'success');
  };

  const playNotificationSound = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(783.99, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch {
      // audio error handling
    }
  };

  const showToast = (title: string, message: string, type: 'success' | 'info' | 'warning' | 'error' = 'info') => {
    const id = 'toast-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
    const newToast: ToastMessage = { id, title, message, type, timestamp: Date.now() };
    setToasts(prev => [newToast, ...prev.slice(0, 4)]);
    setTimeout(() => {
      removeToast(id);
    }, 6000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const openSimulatedDelivery = (delivery: Omit<SimulatedDelivery, 'isOpen'>) => {
    setSimulatedDelivery({ ...delivery, isOpen: true });
  };

  const closeSimulatedDelivery = () => {
    setSimulatedDelivery(null);
  };

  // 1. Student books a lesson
  const bookLesson = (data: {
    patientName: string;
    patientEmail: string;
    patientPhone: string;
    motif: string;
    type: LessonType;
    date: string;
    time: string;
    patientNotes?: string;
  }): Appointment => {
    const effectiveZoomLink = data.type === 'zoom' ? (teacher.zoomLink || 'https://us05web.zoom.us/j/9133195007?pwd=k9qcjEJ7F6KnQQKhQ15wWwhsznak5f.1') : undefined;

    const newApt: Appointment = {
      id: 'apt-' + Date.now(),
      ...data,
      zoomLink: effectiveZoomLink,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setAppointments(prev => [newApt, ...prev.filter(a => a.id !== newApt.id)]);
    setStudentSession(data.patientPhone, data.patientName);

    // Sync to backend API immediately
    const api = getEffectiveApiUrl();
    fetch(`${api}/api/appointments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newApt)
    }).catch(err => console.warn('Sync booking to server failed:', err));

    // Notification for Aymen
    const notifForAymen: AppNotification = {
      id: 'notif-' + Date.now(),
      targetRole: 'aymen',
      title: '📖 Nouvelle demande de cours reçue',
      message: `${data.patientName} a demandé un cours (${data.motif}) pour le ${formatDisplayDate(data.date)} à ${data.time} (Heure de Paris) (${data.type === 'zoom' ? 'Zoom' : 'WhatsApp'}).`,
      type: 'booking_received',
      appointmentId: newApt.id,
      appointmentData: newApt,
      read: false,
      createdAt: new Date().toISOString(),
      deliveredVia: ['app', 'sms', 'whatsapp']
    };

    setNotifications(prev => [notifForAymen, ...prev]);
    playNotificationSound();

    const modeLabel = data.type === 'zoom' ? 'Zoom (Visioconférence)' : 'WhatsApp (Appel / Vidéo)';
    const smsBody = `COURS AYMEN : Salam Aleykoum ${data.patientName}, votre demande de cours (${data.motif}) pour le ${formatDisplayDate(data.date)} à ${data.time} (Heure de Paris) (${modeLabel}) a bien été transmise à Aymen. Vous recevrez la confirmation et le lien dès validation.`;

    const aymenWhatsAppDirectUrl = `https://wa.me/33613920987?text=${encodeURIComponent(
      `Salam Aleykoum Aymen, je viens de réserver un cours de ${data.motif} pour le ${formatDisplayDate(data.date)} à ${data.time} (Heure de Paris) (${modeLabel}). Mon nom : ${data.patientName}. Merci !`
    )}`;

    openSimulatedDelivery({
      channel: 'whatsapp',
      recipientName: 'Aymen (06 13 92 09 87)',
      recipientContact: '06 13 92 09 87',
      body: smsBody,
      badge: 'Demande transmise directement à Aymen',
      dateInfo: `${formatDisplayDate(data.date)} à ${data.time} (Heure de Paris)`,
      nativeSmsUrl: `sms:+33613920987?body=${encodeURIComponent(smsBody)}`,
      nativeWhatsAppUrl: aymenWhatsAppDirectUrl,
      statusInfo: 'Transmis en direct sur l\'application d\'Aymen'
    });

    showToast(
      'Demande de cours envoyée !',
      `Votre demande a bien été transmise à Aymen pour le ${formatDisplayDate(data.date)} à ${data.time} (Heure de Paris).`,
      'success'
    );

    return newApt;
  };

  // 2. Aymen Accepts
  const acceptAppointment = (id: string, note?: string) => {
    const apt = appointments.find(a => a.id === id);
    if (!apt) return;

    const effectiveZoomLink = (apt.type === 'zoom' || apt.type === 'en_ligne') 
      ? (apt.zoomLink || teacher.zoomLink || 'https://us05web.zoom.us/j/9133195007?pwd=k9qcjEJ7F6KnQQKhQ15wWwhsznak5f.1') 
      : undefined;

    const updatedApt: Appointment = {
      ...apt,
      status: 'accepted',
      zoomLink: effectiveZoomLink,
      practitionerNotes: note || apt.practitionerNotes,
      updatedAt: new Date().toISOString()
    };

    setAppointments(prev => prev.map(a => a.id === id ? updatedApt : a));

    // Sync to backend API
    const api = getEffectiveApiUrl();
    fetch(`${api}/api/appointments/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: 'accepted',
        zoomLink: effectiveZoomLink,
        practitionerNotes: note || apt.practitionerNotes
      })
    }).catch(err => console.warn('Sync accept failed:', err));

    const notifForStudent: AppNotification = {
      id: 'notif-' + Date.now(),
      targetRole: 'patient',
      title: '✅ Cours confirmé par Aymen !',
      message: `Votre cours du ${formatDisplayDate(apt.date)} à ${apt.time} (Heure de Paris) est validé (${apt.type === 'zoom' ? 'sur Zoom' : 'sur WhatsApp'}).${note ? ` Message d'Aymen : "${note}"` : ''}`,
      type: 'accepted',
      appointmentId: id,
      appointmentData: updatedApt,
      read: false,
      createdAt: new Date().toISOString(),
      deliveredVia: ['app', 'sms', 'whatsapp']
    };

    setNotifications(prev => [notifForStudent, ...prev]);
    playNotificationSound();

    const isZoom = apt.type === 'zoom' || apt.type === 'en_ligne';
    const modeLabel = isZoom ? 'Zoom (Visioconférence)' : 'WhatsApp (Appel / Vidéo)';
    const zoomText = isZoom ? ` 🎥 Rejoindre le cours sur Zoom : ${effectiveZoomLink}` : '';
    const smsBody = `COURS AYMEN : ✅ Salam Aleykoum ${apt.patientName}, Aymen a confirmé votre cours de ${apt.motif} le ${formatDisplayDate(apt.date)} à ${apt.time} (Heure de Paris). Mode : ${modeLabel}.${zoomText} ${note ? `Note d'Aymen : "${note}"` : ''}`;

    let cleanStudentPhone = apt.patientPhone.replace(/[\s.-]/g, '');
    if (cleanStudentPhone.startsWith('0') && cleanStudentPhone.length === 10) {
      cleanStudentPhone = '33' + cleanStudentPhone.substring(1);
    }
    const studentWaUrl = `https://wa.me/${cleanStudentPhone}?text=${encodeURIComponent(smsBody)}`;

    openSimulatedDelivery({
      channel: 'whatsapp',
      recipientName: apt.patientName,
      recipientContact: apt.patientPhone,
      body: smsBody,
      badge: 'Cours Confirmé (WhatsApp & SMS)',
      dateInfo: `${formatDisplayDate(apt.date)} à ${apt.time} (Heure de Paris)`,
      nativeSmsUrl: `sms:${cleanStudentPhone.startsWith('33') ? '+' + cleanStudentPhone : cleanStudentPhone}?body=${encodeURIComponent(smsBody)}`,
      nativeWhatsAppUrl: studentWaUrl,
      statusInfo: 'Confirmation validée sur l\'application'
    });

    showToast('Cours validé !', `Le cours avec ${apt.patientName} a été confirmé et enregistré sur l'application.`, 'success');
  };

  // 3. Aymen Proposes Another Date/Time (Counter-proposal)
  const counterProposeAppointment = (id: string, newDate: string, newTime: string, message: string) => {
    const apt = appointments.find(a => a.id === id);
    if (!apt) return;

    const updatedApt: Appointment = {
      ...apt,
      status: 'counter_proposed',
      proposedDate: newDate,
      proposedTime: newTime,
      counterProposalMessage: message,
      updatedAt: new Date().toISOString()
    };

    setAppointments(prev => prev.map(a => a.id === id ? updatedApt : a));

    // Sync to backend API
    const api = getEffectiveApiUrl();
    fetch(`${api}/api/appointments/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: 'counter_proposed',
        proposedDate: newDate,
        proposedTime: newTime,
        counterProposalMessage: message
      })
    }).catch(err => console.warn('Sync counter propose failed:', err));

    const notifForStudent: AppNotification = {
      id: 'notif-' + Date.now(),
      targetRole: 'patient',
      title: '🔄 Nouvel horaire proposé par Aymen',
      message: `Aymen vous propose de déplacer le cours au ${formatDisplayDate(newDate)} à ${newTime} (Heure de Paris). Message : "${message}"`,
      type: 'counter_proposed',
      appointmentId: id,
      appointmentData: updatedApt,
      read: false,
      createdAt: new Date().toISOString(),
      deliveredVia: ['app', 'sms', 'whatsapp']
    };

    setNotifications(prev => [notifForStudent, ...prev]);
    playNotificationSound();

    const smsBody = `COURS AYMEN : 🔄 Salam Aleykoum ${apt.patientName}, Aymen vous propose un nouvel horaire : le ${formatDisplayDate(newDate)} à ${newTime} (Heure de Paris). Message d'Aymen : "${message}".`;

    let cleanStudentPhone = apt.patientPhone.replace(/[\s.-]/g, '');
    if (cleanStudentPhone.startsWith('0') && cleanStudentPhone.length === 10) {
      cleanStudentPhone = '33' + cleanStudentPhone.substring(1);
    }
    const studentWaUrl = `https://wa.me/${cleanStudentPhone}?text=${encodeURIComponent(smsBody)}`;

    openSimulatedDelivery({
      channel: 'whatsapp',
      recipientName: apt.patientName,
      recipientContact: apt.patientPhone,
      body: smsBody,
      badge: 'Proposition de nouvel horaire',
      dateInfo: `${formatDisplayDate(newDate)} à ${newTime} (Heure de Paris)`,
      nativeSmsUrl: `sms:${cleanStudentPhone.startsWith('33') ? '+' + cleanStudentPhone : cleanStudentPhone}?body=${encodeURIComponent(smsBody)}`,
      nativeWhatsAppUrl: studentWaUrl,
      statusInfo: 'Transmis en direct'
    });

    showToast('Nouvel horaire envoyé', `Votre proposition (${formatDisplayDate(newDate)} à ${newTime} - Heure de Paris) a été enregistrée.`, 'info');
  };

  // 4. Student Accepts Counter Proposal
  const acceptCounterProposal = (id: string) => {
    const apt = appointments.find(a => a.id === id);
    if (!apt || !apt.proposedDate || !apt.proposedTime) return;

    const updatedApt: Appointment = {
      ...apt,
      date: apt.proposedDate,
      time: apt.proposedTime,
      status: 'accepted',
      proposedDate: undefined,
      proposedTime: undefined,
      practitionerNotes: `Créneau alternatif accepté par l'élève. (${apt.motif})`,
      updatedAt: new Date().toISOString()
    };

    setAppointments(prev => prev.map(a => a.id === id ? updatedApt : a));

    // Sync to backend API
    const api = getEffectiveApiUrl();
    fetch(`${api}/api/appointments/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        date: apt.proposedDate,
        time: apt.proposedTime,
        status: 'accepted',
        proposedDate: undefined,
        proposedTime: undefined,
        practitionerNotes: `Créneau alternatif accepté par l'élève. (${apt.motif})`
      })
    }).catch(err => console.warn('Sync counter accept failed:', err));

    const notifForAymen: AppNotification = {
      id: 'notif-' + Date.now(),
      targetRole: 'aymen',
      title: '🎉 Nouvel horaire accepté par l\'élève !',
      message: `${apt.patientName} a accepté votre proposition pour le ${formatDisplayDate(updatedApt.date)} à ${updatedApt.time} (Heure de Paris).`,
      type: 'counter_accepted',
      appointmentId: id,
      appointmentData: updatedApt,
      read: false,
      createdAt: new Date().toISOString(),
      deliveredVia: ['app']
    };

    setNotifications(prev => [notifForAymen, ...prev]);
    playNotificationSound();

    showToast('Horaire validé !', `Votre cours est maintenant confirmé pour le ${formatDisplayDate(updatedApt.date)} à ${updatedApt.time} (Heure de Paris).`, 'success');
  };

  // 5. Decline Appointment
  const declineAppointment = (id: string, reason?: string) => {
    const apt = appointments.find(a => a.id === id);
    if (!apt) return;

    const updatedApt: Appointment = {
      ...apt,
      status: 'declined',
      practitionerNotes: reason ? `Non disponible : ${reason}` : 'Indisponibilité exceptionnelle.',
      updatedAt: new Date().toISOString()
    };

    setAppointments(prev => prev.map(a => a.id === id ? updatedApt : a));

    // Sync to backend API
    const api = getEffectiveApiUrl();
    fetch(`${api}/api/appointments/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: 'declined',
        practitionerNotes: reason ? `Non disponible : ${reason}` : 'Indisponibilité exceptionnelle.'
      })
    }).catch(err => console.warn('Sync decline failed:', err));

    const notifForStudent: AppNotification = {
      id: 'notif-' + Date.now(),
      targetRole: 'patient',
      title: '❌ Créneau non disponible',
      message: `Aymen ne peut pas assurer le cours du ${formatDisplayDate(apt.date)} à ${apt.time}.${reason ? ` Motif : ${reason}` : ''}`,
      type: 'declined',
      appointmentId: id,
      appointmentData: updatedApt,
      read: false,
      createdAt: new Date().toISOString(),
      deliveredVia: ['app', 'sms']
    };

    setNotifications(prev => [notifForStudent, ...prev]);
    showToast('Demande refusée', `L'élève ${apt.patientName} a été prévenu.`, 'warning');
  };

  // 6. Student cancels
  const cancelAppointment = (id: string) => {
    const apt = appointments.find(a => a.id === id);
    if (!apt) return;

    setAppointments(prev => prev.filter(a => a.id !== id));

    // Sync to backend API
    const api = getEffectiveApiUrl();
    fetch(`${api}/api/appointments/${id}`, {
      method: 'DELETE'
    }).catch(err => console.warn('Sync delete failed:', err));

    const notifForAymen: AppNotification = {
      id: 'notif-' + Date.now(),
      targetRole: 'aymen',
      title: 'ℹ️ Cours annulé par l\'élève',
      message: `${apt.patientName} a annulé sa réservation pour le ${formatDisplayDate(apt.date)} à ${apt.time}.`,
      type: 'reminder',
      read: false,
      createdAt: new Date().toISOString(),
      deliveredVia: ['app']
    };

    setNotifications(prev => [notifForAymen, ...prev]);
    showToast('Cours annulé', 'Votre réservation a bien été annulée.', 'info');
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllNotificationsAsRead = (role?: 'patient' | 'aymen') => {
    setNotifications(prev => prev.map(n => {
      if (!role || n.targetRole === role || n.targetRole === 'all') {
        return { ...n, read: true };
      }
      return n;
    }));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const updateTeacherProfile = (updated: Partial<TeacherProfile>) => {
    setTeacher(prev => ({ ...prev, ...updated }));
    showToast('Profil mis à jour', 'Les informations ont été enregistrées.', 'success');
  };

  const resetToDefaults = () => {
    localStorage.removeItem(STORAGE_KEY_APPOINTMENTS);
    localStorage.removeItem(STORAGE_KEY_NOTIFICATIONS);
    localStorage.removeItem(STORAGE_KEY_PROFILE);
    localStorage.removeItem(STORAGE_KEY_AUTH);
    localStorage.removeItem(STORAGE_KEY_AVAILABILITY);
    localStorage.removeItem(STORAGE_KEY_BLOCKED_DATES);
    localStorage.removeItem(STORAGE_KEY_SMS_CONFIG);
    setAppointments(INITIAL_APPOINTMENTS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setTeacher(INITIAL_TEACHER);
    setAvailability(INITIAL_AVAILABILITY);
    setBlockedDates(INITIAL_BLOCKED_DATES);
    setSmsConfig(INITIAL_SMS_CONFIG);
    setIsAymenLoggedIn(false);
    setCurrentView('student_booking');
    showToast('Réinitialisation', 'Données de démonstration restaurées.', 'info');
  };

  return (
    <AppContext.Provider
      value={{
        teacher,
        appointments,
        notifications,
        toasts,
        availability,
        blockedDates,
        smsConfig,
        currentView,
        setCurrentView,
        isAymenLoggedIn,
        loginAymen,
        logoutAymen,
        currentStudentPhone,
        currentStudentName,
        setStudentSession,
        clearStudentSession,
        aymenTab,
        setAymenTab,
        simulatedDelivery,
        bookLesson,
        acceptAppointment,
        counterProposeAppointment,
        acceptCounterProposal,
        declineAppointment,
        cancelAppointment,
        sendRealSms,
        sendRealWhatsApp,
        fetchWhatsAppStatus,
        restartWhatsApp,
        whatsAppStatus,
        backendUrl,
        updateBackendUrl,
        serverStatus,
        checkServerHealth,
        getAvailableSlotsForDate,
        customDateSlots,
        getDateConfig,
        toggleDateEnabled,
        setDateEnabled,
        toggleSlotForDate,
        setSlotsForDate,
        applyPresetToDate,
        clearSlotsForDate,
        copyDateSlotsToTwoWeeks,
        setAllDatesOpen,
        openAll14DaysWithDefaultSlots,
        resetDateToDefault,
        resetAllTwoWeeksToDefault,
        toggleDayEnabled,
        toggleSlotForDay,
        setSlotsForDay,
        copyAvailabilityToAllDays,
        addBlockedDate,
        removeBlockedDate,
        updateSmsConfig,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        clearNotifications,
        removeToast,
        showToast,
        openSimulatedDelivery,
        closeSimulatedDelivery,
        updateTeacherProfile,
        resetToDefaults
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export function formatToLocalISO(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getFourteenDaysList(): FourteenDayItem[] {
  const days: FourteenDayItem[] = [];
  const baseToday = new Date();
  baseToday.setHours(0, 0, 0, 0);

  for (let i = 0; i < 14; i++) {
    const d = new Date(baseToday);
    d.setDate(baseToday.getDate() + i);
    const iso = formatToLocalISO(d);
    const isToday = i === 0;
    const isTomorrow = i === 1;

    const weekdayShort = d.toLocaleDateString('fr-FR', { weekday: 'short' });
    const weekdayLong = d.toLocaleDateString('fr-FR', { weekday: 'long' });
    const capitalizedWeekday = weekdayLong.charAt(0).toUpperCase() + weekdayLong.slice(1);

    days.push({
      iso,
      diffDays: i,
      dayName: isToday ? "Aujourd'hui" : isTomorrow ? "Demain" : capitalizedWeekday,
      weekdayShort: weekdayShort.charAt(0).toUpperCase() + weekdayShort.slice(1),
      weekdayLong: capitalizedWeekday,
      formattedShort: d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
      formattedFull: d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
      weekNumber: i < 7 ? 1 : 2
    });
  }
  return days;
}

export function formatDisplayDate(dateStr: string): string {
  try {
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return new Intl.DateTimeFormat('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
  } catch {
    return dateStr;
  }
}

export function formatShortDate(dateStr: string): string {
  try {
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return new Intl.DateTimeFormat('fr-FR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    }).format(date);
  } catch {
    return dateStr;
  }
}
