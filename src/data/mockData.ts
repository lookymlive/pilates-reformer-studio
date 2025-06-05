import { User, Admin, Instructor, Cliente, Equipment, ClassType, Class, Booking, Studio, DashboardStats } from '../types';

// Usuarios Mock Data
export const mockUsers: User[] = [
  // Admin
  {
    id: '1',
    email: 'silvia@pilatesreformer.com',
    name: 'Silvia Fernandez',
    role: 'admin',
    avatar: '/images/silvia-avatar.jpg',
    phone: '+54 11 4567-8901',
    joinDate: '2020-01-15',
    isActive: true,
  } as Admin,
  
  // Instructores
  {
    id: '2',
    email: 'maria@pilatesreformer.com',
    name: 'María González',
    role: 'instructor',
    avatar: '/images/maria-avatar.jpg',
    phone: '+54 11 4567-8902',
    joinDate: '2021-03-10',
    isActive: true,
    specialties: ['Reformer Básico', 'Rehabilitación'],
    experience: '5 años',
    rating: 4.8,
    totalClasses: 1250,
    bio: 'Especialista en Pilates terapéutico con enfoque en rehabilitación postural.',
    certifications: ['PMA Certified', 'Stott Pilates Level 3']
  } as Instructor,
  
  {
    id: '3',
    email: 'ana@pilatesreformer.com',
    name: 'Ana López',
    role: 'instructor',
    avatar: '/images/ana-avatar.jpg',
    phone: '+54 11 4567-8903',
    joinDate: '2020-08-20',
    isActive: true,
    specialties: ['Reformer Avanzado', 'Embarazadas'],
    experience: '8 años',
    rating: 4.9,
    totalClasses: 1800,
    bio: 'Instructora senior especializada en Pilates para embarazadas y postparto.',
    certifications: ['PMA Certified', 'Prenatal Pilates Specialist']
  } as Instructor,

  // Clientes
  {
    id: '4',
    email: 'carmen@gmail.com',
    name: 'Carmen Rodriguez',
    role: 'cliente',
    avatar: '/images/carmen-avatar.jpg',
    phone: '+54 11 4567-8904',
    joinDate: '2024-01-15',
    isActive: true,
    membership: 'Mensual',
    level: 'Principiante',
    medicalNotes: 'Dolor lumbar crónico, evitar flexión excesiva',
    emergencyContact: {
      name: 'Roberto Rodriguez',
      phone: '+54 11 4567-8905',
      relationship: 'Esposo'
    }
  } as Cliente,
  
  {
    id: '5',
    email: 'laura@gmail.com',
    name: 'Laura Martínez',
    role: 'cliente',
    avatar: '/images/laura-avatar.jpg',
    phone: '+54 11 4567-8906',
    joinDate: '2023-11-20',
    isActive: true,
    membership: 'Trimestral',
    level: 'Intermedio',
    emergencyContact: {
      name: 'Pedro Martínez',
      phone: '+54 11 4567-8907',
      relationship: 'Hermano'
    }
  } as Cliente,

  {
    id: '6',
    email: 'sofia@gmail.com',
    name: 'Sofía Vargas',
    role: 'cliente',
    avatar: '/images/sofia-avatar.jpg',
    phone: '+54 11 4567-8908',
    joinDate: '2024-03-05',
    isActive: true,
    membership: 'Por clase',
    level: 'Avanzado',
  } as Cliente,
];

// Equipos Mock Data
export const mockEquipment: Equipment[] = [
  {
    id: 'reformer-1',
    name: 'Reformer #1',
    type: 'reformer',
    status: 'disponible',
    lastMaintenance: '2024-05-15',
    notes: 'Excelente estado'
  },
  {
    id: 'reformer-2',
    name: 'Reformer #2',
    type: 'reformer',
    status: 'disponible',
    lastMaintenance: '2024-05-20',
    notes: 'Resortes nuevos instalados'
  },
  {
    id: 'reformer-3',
    name: 'Reformer #3',
    type: 'reformer',
    status: 'mantenimiento',
    lastMaintenance: '2024-05-01',
    notes: 'Requiere ajuste de poleas'
  },
  {
    id: 'cadillac-1',
    name: 'Cadillac #1',
    type: 'cadillac',
    status: 'disponible',
    lastMaintenance: '2024-04-10',
  },
];

// Tipos de Clases Mock Data
export const mockClassTypes: ClassType[] = [
  {
    id: 'reformer-basico',
    name: 'Reformer Básico',
    description: 'Introducción al Pilates en Reformer para principiantes',
    duration: 55,
    maxParticipants: 1,
    price: 4500,
    level: 'Principiante',
    equipmentRequired: ['reformer']
  },
  {
    id: 'reformer-intermedio',
    name: 'Reformer Intermedio',
    description: 'Clase de nivel intermedio con ejercicios más desafiantes',
    duration: 55,
    maxParticipants: 1,
    price: 5000,
    level: 'Intermedio',
    equipmentRequired: ['reformer']
  },
  {
    id: 'reformer-avanzado',
    name: 'Reformer Avanzado',
    description: 'Clase avanzada para estudiantes experimentados',
    duration: 55,
    maxParticipants: 1,
    price: 5500,
    level: 'Avanzado',
    equipmentRequired: ['reformer']
  },
  {
    id: 'embarazadas',
    name: 'Pilates Embarazadas',
    description: 'Clase especializada para mujeres embarazadas',
    duration: 45,
    maxParticipants: 1,
    price: 5200,
    level: 'Todos',
    equipmentRequired: ['reformer']
  },
];

// Clases Mock Data
export const mockClasses: Class[] = [
  {
    id: 'class-1',
    classTypeId: 'reformer-basico',
    instructorId: '2',
    date: '2025-06-09',
    time: '09:00',
    duration: 55,
    equipmentId: 'reformer-1',
    maxParticipants: 1,
    currentParticipants: ['4'],
    waitingList: [],
    status: 'programada',
    price: 4500,
  },
  {
    id: 'class-2',
    classTypeId: 'reformer-avanzado',
    instructorId: '3',
    date: '2025-06-09',
    time: '10:30',
    duration: 55,
    equipmentId: 'reformer-2',
    maxParticipants: 1,
    currentParticipants: [],
    waitingList: [],
    status: 'programada',
    price: 5500,
  },
  {
    id: 'class-3',
    classTypeId: 'reformer-intermedio',
    instructorId: '2',
    date: '2025-06-09',
    time: '14:00',
    duration: 55,
    equipmentId: 'reformer-1',
    maxParticipants: 1,
    currentParticipants: ['5'],
    waitingList: [],
    status: 'programada',
    price: 5000,
  },
  {
    id: 'class-4',
    classTypeId: 'embarazadas',
    instructorId: '3',
    date: '2025-06-10',
    time: '11:00',
    duration: 45,
    equipmentId: 'reformer-2',
    maxParticipants: 1,
    currentParticipants: [],
    waitingList: [],
    status: 'programada',
    price: 5200,
  },
  {
    id: 'class-5',
    classTypeId: 'reformer-basico',
    instructorId: '2',
    date: '2025-06-10',
    time: '16:00',
    duration: 55,
    equipmentId: 'reformer-1',
    maxParticipants: 1,
    currentParticipants: [],
    waitingList: [],
    status: 'programada',
    price: 4500,
  },
];

// Reservas Mock Data
export const mockBookings: Booking[] = [
  {
    id: 'booking-1',
    classId: 'class-1',
    clientId: '4',
    bookingDate: '2025-06-06',
    status: 'confirmada',
    paymentStatus: 'pagado',
    notes: 'Primera clase, revisar historial médico'
  },
  {
    id: 'booking-2',
    classId: 'class-3',
    clientId: '5',
    bookingDate: '2025-06-05',
    status: 'confirmada',
    paymentStatus: 'pagado',
  },
];

// Estudio Mock Data
export const mockStudio: Studio = {
  id: 'studio-1',
  name: 'Silvia Fernandez Pilates Reformer',
  address: 'Av. Santa Fe 3421, Palermo, Buenos Aires',
  phone: '+54 11 4567-8900',
  email: 'info@pilatesreformer.com',
  openingHours: {
    lunes: { open: '07:00', close: '20:00' },
    martes: { open: '07:00', close: '20:00' },
    miercoles: { open: '07:00', close: '20:00' },
    jueves: { open: '07:00', close: '20:00' },
    viernes: { open: '07:00', close: '18:00' },
    sabado: { open: '08:00', close: '14:00' },
    domingo: null,
  },
  equipment: mockEquipment,
  policies: {
    cancellationPolicy: 'Cancelaciones hasta 24 horas antes sin cargo',
    latePolicy: 'Tolerancia de 10 minutos, luego se considera ausente',
    makeupPolicy: 'Una clase de recuperación por mes incluida'
  }
};

// Estadísticas del Dashboard
export const mockDashboardStats: DashboardStats = {
  totalClients: 45,
  totalInstructors: 2,
  totalClasses: 120,
  monthlyRevenue: 225000,
  classesThisWeek: 28,
  cancellationRate: 8.5,
  occupancyRate: 92.3,
  newClientsThisMonth: 7,
};

// Helper functions para obtener datos relacionados
export const getUserById = (id: string): User | undefined => {
  return mockUsers.find(user => user.id === id);
};

export const getInstructorById = (id: string): Instructor | undefined => {
  return mockUsers.find(user => user.id === id && user.role === 'instructor') as Instructor;
};

export const getClientById = (id: string): Cliente | undefined => {
  return mockUsers.find(user => user.id === id && user.role === 'cliente') as Cliente;
};

export const getClassTypeById = (id: string): ClassType | undefined => {
  return mockClassTypes.find(classType => classType.id === id);
};

export const getEquipmentById = (id: string): Equipment | undefined => {
  return mockEquipment.find(equipment => equipment.id === id);
};

export const getClassesByInstructor = (instructorId: string): Class[] => {
  return mockClasses.filter(cls => cls.instructorId === instructorId);
};

export const getClassesByClient = (clientId: string): Class[] => {
  return mockClasses.filter(cls => 
    cls.currentParticipants.includes(clientId) || cls.waitingList.includes(clientId)
  );
};

export const getBookingsByClient = (clientId: string): Booking[] => {
  return mockBookings.filter(booking => booking.clientId === clientId);
};
