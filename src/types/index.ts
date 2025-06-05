// Types para la aplicación Pilates Reformer Studio

export type UserRole = 'admin' | 'instructor' | 'cliente';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  joinDate: string;
  isActive: boolean;
}

export interface Admin extends User {
  role: 'admin';
  permissions: string[];
}

export interface Instructor extends User {
  role: 'instructor';
  specialties: string[];
  experience: string;
  rating: number;
  totalClasses: number;
  bio?: string;
  certifications: string[];
}

export interface Cliente extends User {
  role: 'cliente';
  membership: 'Mensual' | 'Trimestral' | 'Anual' | 'Por clase';
  level: 'Principiante' | 'Intermedio' | 'Avanzado';
  medicalNotes?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
}

export interface Equipment {
  id: string;
  name: string;
  type: 'reformer' | 'cadillac' | 'chair' | 'barrel';
  status: 'disponible' | 'mantenimiento' | 'ocupado';
  lastMaintenance: string;
  notes?: string;
}

export interface ClassType {
  id: string;
  name: string;
  description: string;
  duration: number; // en minutos
  maxParticipants: number;
  price: number;
  level: 'Principiante' | 'Intermedio' | 'Avanzado' | 'Todos';
  equipmentRequired: string[];
}

export interface Class {
  id: string;
  classTypeId: string;
  instructorId: string;
  date: string;
  time: string;
  duration: number;
  equipmentId: string;
  maxParticipants: number;
  currentParticipants: string[]; // array of client IDs
  waitingList: string[]; // array of client IDs
  status: 'programada' | 'en_progreso' | 'completada' | 'cancelada';
  notes?: string;
  price: number;
}

export interface Booking {
  id: string;
  classId: string;
  clientId: string;
  bookingDate: string;
  status: 'confirmada' | 'en_espera' | 'cancelada' | 'completada';
  paymentStatus: 'pendiente' | 'pagado' | 'reembolsado';
  notes?: string;
  cancellationReason?: string;
}

export interface Studio {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  openingHours: {
    [key: string]: { open: string; close: string } | null;
  };
  equipment: Equipment[];
  policies: {
    cancellationPolicy: string;
    latePolicy: string;
    makeupPolicy: string;
  };
}

export interface DashboardStats {
  totalClients: number;
  totalInstructors: number;
  totalClasses: number;
  monthlyRevenue: number;
  classesThisWeek: number;
  cancellationRate: number;
  occupancyRate: number;
  newClientsThisMonth: number;
}

export interface AuthUser {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (userData: Omit<User, 'id' | 'joinDate' | 'isActive'>) => Promise<boolean>;
}
