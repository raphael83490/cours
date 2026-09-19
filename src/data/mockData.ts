import type { TeacherProfile, Appointment, AppNotification, DayAvailability, BlockedDate, SmsConfig } from '../types';

export const INITIAL_AVAILABILITY: DayAvailability[] = [
  {
    dayOfWeek: 1,
    dayName: 'Lundi',
    enabled: true,
    slots: ['09:30', '11:00', '14:30', '16:00', '17:30', '19:00']
  },
  {
    dayOfWeek: 2,
    dayName: 'Mardi',
    enabled: true,
    slots: ['09:30', '11:00', '14:30', '16:00', '17:30', '19:00']
  },
  {
    dayOfWeek: 3,
    dayName: 'Mercredi',
    enabled: true,
    slots: ['09:30', '11:00', '14:30', '16:00', '17:30', '19:00']
  },
  {
    dayOfWeek: 4,
    dayName: 'Jeudi',
    enabled: true,
    slots: ['09:30', '11:00', '14:30', '16:00', '17:30', '19:00']
  },
  {
    dayOfWeek: 5,
    dayName: 'Vendredi',
    enabled: true,
    slots: ['09:30', '11:00', '16:00', '17:30', '19:00'] // Break for Jumuaa
  },
  {
    dayOfWeek: 6,
    dayName: 'Samedi',
    enabled: true,
    slots: ['10:00', '11:30', '14:30', '16:00', '17:30']
  },
  {
    dayOfWeek: 0,
    dayName: 'Dimanche',
    enabled: false,
    slots: ['10:00', '11:30', '14:30', '16:00']
  }
];

export const INITIAL_BLOCKED_DATES: BlockedDate[] = [];

export const INITIAL_SMS_CONFIG: SmsConfig = {
  provider: 'native',
  brevoSender: 'AymenCours'
};

export const INITIAL_TEACHER: TeacherProfile = {
  id: 'aymen-1',
  name: 'Aymen',
  title: 'Enseignant du Saint Coran & Récitation',
  disciplines: [
    'Apprentissage de la lecture du Saint Coran',
    'Règles de Récitation & Prononciation (Tajwid)',
    'Mémorisation progressive (Hifdh)',
    'Cours adaptés pour tous niveaux (débutants, adultes, enfants, seniors)'
  ],
  rating: 4.98,
  reviewCount: 142,
  location: 'En Ligne (Visio / Téléphone)',
  phone: '06 13 92 09 87',
  email: 'contact@cours-aymen.fr',
  bio: 'Bienvenue ! Je donne des cours particuliers de Coran dans la bienveillance, la patience et le respect du rythme de chacun. Apprentissage de la lecture pas à pas, perfectionnement de la récitation (Tajwid) et mémorisation. Les cours se font en ligne (très simple sur smartphone ou ordinateur).',
  languages: ['Français', 'Arabe'],
  avatarUrl: '',
  zoomLink: 'https://us05web.zoom.us/j/9133195007?pwd=k9qcjEJ7F6KnQQKhQ15wWwhsznak5f.1',
  lessons: [
    {
      title: 'Lecture & Récitation du Coran (Tajwid pas à pas)',
      description: 'Apprentissage de la lecture du Saint Coran, perfectionnement de la prononciation et règles de Tajwid. Adapté aux débutants et seniors.',
      durationMinutes: 30,
      tarification: 'Gratuit / Don libre'
    },
    {
      title: 'Mémorisation du Coran (Hifdh)',
      description: 'Accompagnement individuel et méthode douce pour mémoriser de nouvelles sourates et consolider ses acquis.',
      durationMinutes: 30,
      tarification: 'Gratuit / Don libre'
    },
    {
      title: 'Initiation au Coran pour Enfants',
      description: 'Pédagogie bienveillante et ludique pour apprendre à lire les premières lettres et petites sourates du Coran.',
      durationMinutes: 20,
      tarification: 'Gratuit / Don libre'
    }
  ]
};

const getRelativeDateString = (offsetDays: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
};

export const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: 'apt-1',
    patientName: 'Mme Khadija Benali (72 ans)',
    patientEmail: 'khadija.benali@email.fr',
    patientPhone: '06 12 34 56 78',
    motif: 'Lecture & Récitation du Coran (Tajwid pas à pas)',
    type: 'whatsapp',
    date: getRelativeDateString(1),
    time: '14:30',
    status: 'pending',
    patientNotes: 'Je souhaite réviser la sourate Al-Mulk par WhatsApp vidéo si possible. Merci Aymen.',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    id: 'apt-2',
    patientName: 'Mohamed Driss',
    patientEmail: 'mohamed.driss@gmail.com',
    patientPhone: '06 98 76 54 32',
    motif: 'Récitation du Coran & Tajwid',
    type: 'zoom',
    date: getRelativeDateString(2),
    time: '11:00',
    status: 'accepted',
    patientNotes: 'Perfectionnement de la récitation et prononciation des lettres.',
    createdAt: new Date(Date.now() - 3600000 * 20).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 18).toISOString()
  },
  {
    id: 'apt-3',
    patientName: 'Samira Belkacem',
    patientEmail: 'samira.b@outlook.fr',
    patientPhone: '07 11 22 33 44',
    motif: 'Mémorisation du Coran (Hifdh)',
    type: 'whatsapp',
    date: getRelativeDateString(3),
    time: '11:00',
    status: 'accepted',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 4).toISOString()
  }
];

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    targetRole: 'aymen',
    title: '📖 Nouvelle demande de cours',
    message: 'Mme Khadija Benali a demandé un cours de Coran pour le ' + getRelativeDateString(1) + ' à 14:30.',
    type: 'booking_received',
    appointmentId: 'apt-1',
    read: false,
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    deliveredVia: ['app', 'whatsapp']
  },
  {
    id: 'notif-2',
    targetRole: 'patient',
    title: '✅ Cours confirmé par Aymen',
    message: 'Votre cours de Coran est validé pour le ' + getRelativeDateString(2) + ' à 11:00.',
    type: 'accepted',
    appointmentId: 'apt-2',
    read: false,
    createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
    deliveredVia: ['app', 'whatsapp']
  },
  {
    id: 'notif-3',
    targetRole: 'patient',
    title: '✅ Cours confirmé par Aymen',
    message: 'Votre cours de Coran est validé pour le ' + getRelativeDateString(3) + ' à 11:00.',
    type: 'accepted',
    appointmentId: 'apt-3',
    read: false,
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    deliveredVia: ['app', 'whatsapp']
  }
];
