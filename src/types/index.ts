export type LessonType = 'whatsapp' | 'zoom' | 'telephone' | 'en_ligne' | 'presentiel';

export type AppointmentStatus = 
  | 'pending' 
  | 'accepted' 
  | 'counter_proposed' 
  | 'declined' 
  | 'completed';

export interface Appointment {
  id: string;
  patientName: string; // Student name
  patientEmail: string;
  patientPhone: string;
  motif: string; // Subject of the lesson
  type: LessonType;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  status: AppointmentStatus;
  patientNotes?: string;
  practitionerNotes?: string; // Aymen's note
  zoomLink?: string;
  proposedDate?: string;
  proposedTime?: string;
  counterProposalMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export type NotificationType = 
  | 'booking_received' 
  | 'accepted' 
  | 'counter_proposed' 
  | 'counter_accepted' 
  | 'declined' 
  | 'reminder';

export interface WhatsAppStatus {
  isReady: boolean;
  qrCodeDataUrl?: string | null;
  whatsappUser?: string | null;
  statusText: string;
  lastUpdated?: string;
}

export interface AppNotification {
  id: string;
  targetRole: 'patient' | 'aymen' | 'all';
  title: string;
  message: string;
  type: NotificationType;
  appointmentId?: string;
  appointmentData?: Partial<Appointment>;
  read: boolean;
  createdAt: string;
  deliveredVia?: ('app' | 'sms' | 'email' | 'whatsapp')[];
}

export interface DayAvailability {
  dayOfWeek: number; // 0 = Dimanche, 1 = Lundi, 2 = Mardi, etc.
  dayName: string;
  enabled: boolean;
  slots: string[];
}

export interface BlockedDate {
  date: string; // YYYY-MM-DD
  reason?: string;
}

export interface SmsConfig {
  provider: 'native' | 'twilio' | 'brevo';
  twilioAccountSid?: string;
  twilioAuthToken?: string;
  twilioFromNumber?: string;
  brevoApiKey?: string;
  brevoSender?: string;
}

export interface TeacherProfile {
  id: string;
  name: string;
  title: string;
  disciplines: string[];
  rating: number;
  reviewCount: number;
  location: string;
  phone: string;
  email: string;
  bio: string;
  languages: string[];
  avatarUrl: string;
  zoomLink?: string;
  lessons: {
    title: string;
    description: string;
    durationMinutes: number;
    tarification: string;
  }[];
}

export interface ToastMessage {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
  timestamp: number;
}
