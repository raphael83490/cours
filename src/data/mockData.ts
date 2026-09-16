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
  title: 'Enseignant en Sciences Religieuses, Coran & Langue Arabe',
  disciplines: [
    'Apprentissage du Coran & Tajwid (Récitation)',
    'Langue Arabe (Lecture & Écriture)',
    'Sciences Islamiques & Règles de pratique',
    'Cours adaptés pour seniors, adultes et enfants',
    'Séance de questions / réponses et accompagnement'
  ],
  rating: 4.98,
  reviewCount: 142,
  location: 'En Ligne (Visio / Téléphone)',
  phone: '06 50 20 30 40',
  email: 'contact@cours-aymen.fr',
  bio: 'Bienvenue ! Je donne des cours particuliers de religion, de Coran et d\'Arabe dans la bienveillance, la patience et le respect du rythme de chacun. Les cours se font en ligne (facile sur smartphone/ordinateur ou appel simple).',
  languages: ['Français', 'Arabe'],
  avatarUrl: '',
  zoomLink: 'https://us05web.zoom.us/j/84920482910?pwd=aymencours',
  lessons: [
    {
      title: 'Apprentissage du Coran & Tajwid (Récitation pas à pas)',
      description: 'Lecture du Coran, mémorisation, correction des règles de prononciation. Adapté aux débutants et personnes âgées.',
      durationMinutes: 45,
      tarification: 'Gratuit / Don libre'
    },
    {
      title: 'Initiation ou Perfectionnement à la Langue Arabe',
      description: 'Apprendre à lire, écrire et comprendre les bases de la langue arabe.',
      durationMinutes: 45,
      tarification: 'Gratuit / Don libre'
    },
    {
      title: 'Questions Religieuses & Pratique au quotidien',
      description: 'Échange individuel pour poser vos questions, apprendre la prière, les ablutions ou clarifier des points religieux.',
      durationMinutes: 30,
      tarification: 'Gratuit'
    },
    {
      title: 'Cours pour Enfants / Petits-Enfants',
      description: 'Pédagogie douce et ludique pour initier les plus jeunes aux bonnes manières et aux petites sourates.',
      durationMinutes: 30,
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
    motif: 'Apprentissage du Coran & Tajwid (Récitation pas à pas)',
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
    motif: 'Questions Religieuses & Pratique au quotidien',
    type: 'zoom',
    date: getRelativeDateString(2),
    time: '11:00',
    status: 'accepted',
    patientNotes: 'Questions sur la prière et quelques règles quotidiennes.',
    createdAt: new Date(Date.now() - 3600000 * 20).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 18).toISOString()
  },
  {
    id: 'apt-3',
    patientName: 'Samira Belkacem',
    patientEmail: 'samira.b@outlook.fr',
    patientPhone: '07 11 22 33 44',
    motif: 'Initiation ou Perfectionnement à la Langue Arabe',
    type: 'whatsapp',
    date: getRelativeDateString(3),
    time: '11:00',
    status: 'counter_proposed',
    proposedDate: getRelativeDateString(3),
    proposedTime: '11:00',
    counterProposalMessage: 'Aymen vous propose le nouvel horaire : ' + getRelativeDateString(3) + ' à 11:00.',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 4).toISOString()
  }
];

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    targetRole: 'aymen',
    title: '📖 Nouvelle demande de cours',
    message: 'Mme Khadija Benali demande un cours de Coran pour demain à 14:30 (Par téléphone).',
    type: 'booking_received',
    appointmentId: 'apt-1',
    read: false,
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    deliveredVia: ['app', 'sms']
  },
  {
    id: 'notif-2',
    targetRole: 'patient',
    title: 'Proposition d\'un autre horaire par Aymen',
    message: 'Aymen vous propose le nouvel horaire : ' + getRelativeDateString(3) + ' à 11:00.',
    type: 'counter_proposed',
    appointmentId: 'apt-3',
    read: false,
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    deliveredVia: ['app', 'sms']
  },
  {
    id: 'notif-3',
    targetRole: 'patient',
    title: 'Cours confirmé par Aymen !',
    message: 'Votre cours de questions religieuses est validé pour le ' + getRelativeDateString(2) + ' à 11:00.',
    type: 'accepted',
    appointmentId: 'apt-2',
    read: true,
    createdAt: new Date(Date.now() - 3600000 * 20).toISOString(),
    deliveredVia: ['app', 'sms']
  }
];
