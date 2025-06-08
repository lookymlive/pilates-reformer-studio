// Configuración general para panel administrativo
export const adminConfig = {
  enabled: true,
  message:
    "Funcionalidad en desarrollo... Aquí podrás controlar toda la configuración del estudio como administrador.",
  sections: [
    {
      name: "Horarios y Disponibilidad",
      enabled: true,
    },
    {
      name: "Instructores",
      enabled: true,
    },
    {
      name: "Reservas y Políticas",
      enabled: true,
    },
    {
      name: "Perfiles y Roles",
      enabled: true,
    },
    {
      name: "Notificaciones",
      enabled: true,
    },
    {
      name: "Personalización del Estudio",
      enabled: true,
    },
  ],
};
// Resumen semanal solo de lunes a viernes
export const weeklySummary = [
  { day: "Lunes", bookings: 18, attendance: 16 },
  { day: "Martes", bookings: 20, attendance: 19 },
  { day: "Miércoles", bookings: 17, attendance: 15 },
  { day: "Jueves", bookings: 22, attendance: 21 },
  { day: "Viernes", bookings: 19, attendance: 18 },
];
import {
  Admin,
  Booking,
  Class,
  ClassType,
  Cliente,
  DashboardStats,
  Equipment,
  Instructor,
  Studio,
  User,
} from "../types";

// Usuarios Mock Data
export const mockUsers: User[] = [
  // Admin
  {
    id: "1",
    email: "silviafpilates@gmail.com",
    name: "Silvia Fernandez",
    role: "admin",
    avatar: "/images/silvia-avatar.jpg",
    phone: "+54 341 2737 492",
    joinDate: "2025-05-05",
    isActive: true,
  } as Admin,

  // Instructores
  {
    id: "2",
    email: "maria@pilatesreformer.com",
    name: "María González",
    role: "instructor",
    avatar: "/images/maria-avatar.jpg",
    phone: "+54 11 4567-8902",
    joinDate: "2021-03-10",
    isActive: true,
    specialties: ["Reformer Básico", "Rehabilitación"],
    experience: "5 años",
    rating: 4.8,
    totalClasses: 1250,
    bio: "Especialista en Pilates terapéutico con enfoque en rehabilitación postural.",
    certifications: ["PMA Certified", "Stott Pilates Level 3"],
  } as Instructor,

  {
    id: "3",
    email: "ana@pilatesreformer.com",
    name: "Ana López",
    role: "instructor",
    avatar: "/images/ana-avatar.jpg",
    phone: "+54 11 4567-8903",
    joinDate: "2020-08-20",
    isActive: true,
    specialties: ["Reformer Avanzado"],
    experience: "8 años",
    rating: 4.9,
    totalClasses: 1800,
    bio: "Instructora senior especializada en Pilates terapéutico y postparto.",
    certifications: ["PMA Certified", "Stott Pilates Level 3"],
  } as Instructor,

  // Clientes
  {
    id: "4",
    email: "carmen@gmail.com",
    name: "Carmen Rodriguez",
    role: "cliente",
    avatar: "/images/carmen-avatar.jpg",
    phone: "+54 11 4567-8904",
    joinDate: "2024-01-15",
    isActive: true,
    membership: "Mensual",
    level: "Principiante",
    medicalNotes: "Dolor lumbar crónico, evitar flexión excesiva",
    emergencyContact: {
      name: "Roberto Rodriguez",
      phone: "+54 11 4567-8905",
      relationship: "Esposo",
    },
  } as Cliente,

  {
    id: "5",
    email: "laura@gmail.com",
    name: "Laura Martínez",
    role: "cliente",
    avatar: "/images/laura-avatar.jpg",
    phone: "+54 11 4567-8906",
    joinDate: "2023-11-20",
    isActive: true,
    membership: "Trimestral",
    level: "Intermedio",
    emergencyContact: {
      name: "Pedro Martínez",
      phone: "+54 11 4567-8907",
      relationship: "Hermano",
    },
  } as Cliente,

  {
    id: "6",
    email: "sofia@gmail.com",
    name: "Sofía Vargas",
    role: "cliente",
    avatar: "/images/sofia-avatar.jpg",
    phone: "+54 11 4567-8908",
    joinDate: "2024-03-05",
    isActive: true,
    membership: "Por clase",
    level: "Avanzado",
  } as Cliente,
];

// Equipos Mock Data
export const mockEquipment: Equipment[] = [
  {
    id: "reformer-1",
    name: "Reformer #1",
    type: "reformer",
    status: "disponible",
    lastMaintenance: "2024-05-15",
    notes: "Excelente estado",
  },
  {
    id: "reformer-2",
    name: "Reformer #2",
    type: "reformer",
    status: "disponible",
    lastMaintenance: "2024-05-20",
    notes: "Resortes nuevos instalados",
  },
  {
    id: "reformer-3",
    name: "Reformer #3",
    type: "reformer",
    status: "mantenimiento",
    lastMaintenance: "2024-05-01",
    notes: "Requiere ajuste de poleas",
  },
  {
    id: "reformer-4",
    name: "Reformer #4",
    type: "reformer",
    status: "disponible",
    lastMaintenance: "2024-05-25",
    notes: "Nuevo equipo",
  },
  {
    id: "reformer-5",
    name: "Reformer #5",
    type: "reformer",
    status: "disponible",
    lastMaintenance: "2024-05-25",
    notes: "Nuevo equipo",
  },
  {
    id: "reformer-6",
    name: "Reformer #6",
    type: "reformer",
    status: "disponible",
    lastMaintenance: "2025-04-24",
    notes: "Nuevo Amarillo resorte Amariillo cambiado Nuevo ",
  },
];
export const adminSettings = {
  studioInfo: {
    name: "Pilates Reformer Studio",
    logoUrl: "/assets/logo.png",
    welcomeMessage: "¡Bienvenido a tu espacio de bienestar!",
  },
  schedule: {
    openDays: ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"],
    slots: [
      { start: "08:00", end: "12:00" },
      { start: "14:00", end: "15:00" },
      { start: "16:00", end: "21:00" },
    ],
    beds: 6,
    holidays: ["2025-06-15", "2025-12-25"],
  },
  instructors: [
    {
      id: 1,
      name: "Ana López",
      specialties: ["Reformer"],
      availableDays: ["Monday", "Wednesday", "Friday"],
      notes: "Especialista en clases para principiantes.",
    },
  ],
  bookingPolicy: {
    maxBookingsPerUser: 5,
    minCancelTimeHours: 2,
    refundPolicy: "Reembolso completo si se cancela con 24h de antelación.",
  },
  roles: [
    { name: "admin", permissions: ["all"] },
    { name: "instructor", permissions: ["view_schedule", "manage_classes"] },
    { name: "client", permissions: ["book_class", "cancel_booking"] },
  ],
  notifications: {
    admin: true,
    instructor: true,
    client: false,
  },
};

// Tipos de Clases Mock Data
export const mockClassTypes: ClassType[] = [
  {
    id: "reformer-basico",
    name: "Reformer Básico",
    description: "Introducción al Pilates en Reformer para principiantes",
    duration: 55,
    maxParticipants: 6,
    price: 4500,
    level: "Principiante",
    equipmentRequired: ["reformer"],
  },
  {
    id: "reformer-intermedio",
    name: "Reformer Intermedio",
    description: "Clase de nivel intermedio con ejercicios más desafiantes",
    duration: 55,
    maxParticipants: 6,
    price: 5000,
    level: "Intermedio",
    equipmentRequired: ["reformer"],
  },
  {
    id: "reformer-avanzado",
    name: "Reformer Avanzado",
    description: "Clase avanzada para estudiantes experimentados",
    duration: 55,
    maxParticipants: 6,
    price: 5500,
    level: "Avanzado",
    equipmentRequired: ["reformer"],
  },
];

// Clases Mock Data
export const mockClasses: Class[] = [
  {
    id: "class-1",
    classTypeId: "reformer-basico",
    instructorId: "2",
    date: "2025-06-09",
    time: "09:00",
    duration: 55,
    equipmentId: "reformer-1",
    maxParticipants: 1,
    currentParticipants: ["4"],
    waitingList: [],
    status: "programada",
    price: 4500,
  },
  {
    id: "class-2",
    classTypeId: "reformer-avanzado",
    instructorId: "3",
    date: "2025-06-09",
    time: "10:30",
    duration: 55,
    equipmentId: "reformer-2",
    maxParticipants: 1,
    currentParticipants: [],
    waitingList: [],
    status: "programada",
    price: 5500,
  },
  {
    id: "class-3",
    classTypeId: "reformer-intermedio",
    instructorId: "2",
    date: "2025-06-09",
    time: "14:00",
    duration: 55,
    equipmentId: "reformer-1",
    maxParticipants: 1,
    currentParticipants: ["5"],
    waitingList: [],
    status: "programada",
    price: 5000,
  },
  {
    id: "class-5",
    classTypeId: "reformer-basico",
    instructorId: "2",
    date: "2025-06-11",
    time: "09:00",
    duration: 55,
    equipmentId: "reformer-3",
    maxParticipants: 1,
    currentParticipants: [],
    waitingList: [],
    status: "programada",
    price: 4500,
  },
  {
    id: "class-6",
    classTypeId: "reformer-intermedio",
    instructorId: "3",
    date: "2025-06-11",
    time: "10:30",
    duration: 55,
    equipmentId: "reformer-1",
    maxParticipants: 1,
    currentParticipants: [],
    waitingList: [],
    status: "programada",
    price: 5000,
  },
  {
    id: "class-7",
    classTypeId: "reformer-avanzado",
    instructorId: "2",
    date: "2025-06-12",
    time: "18:00",
    duration: 55,
    equipmentId: "reformer-2",
    maxParticipants: 1,
    currentParticipants: [],
    waitingList: [],
    status: "programada",
    price: 5500,
  },
  {
    id: "class-8",
    classTypeId: "reformer-basico",
    instructorId: "3",
    date: "2025-06-12",
    time: "19:00",
    duration: 55,
    equipmentId: "reformer-3",
    maxParticipants: 1,
    currentParticipants: ["6"],
    waitingList: [],
    status: "programada",
    price: 4500,
  },
  {
    id: "class-9",
    classTypeId: "reformer-intermedio",
    instructorId: "2",
    date: "2025-06-13",
    time: "20:00",
    duration: 55,
    equipmentId: "reformer-1",
    maxParticipants: 1,
    currentParticipants: [],
    waitingList: [],
    status: "programada",
    price: 5000,
  },
  {
    id: "class-10",
    classTypeId: "reformer-avanzado",
    instructorId: "3",
    date: "2025-06-13",
    time: "21:00",
    duration: 55,
    equipmentId: "reformer-2",
    maxParticipants: 1,
    currentParticipants: [],
    waitingList: [],
    status: "programada",
    price: 5500,
  },
];

// Reservas Mock Data
export const mockBookings: Booking[] = [
  {
    id: "booking-1",
    classId: "class-1",
    clientId: "4",
    bookingDate: "2025-06-06",
    status: "confirmada",
    paymentStatus: "pagado",
    notes: "Primera clase, revisar historial médico",
  },
  {
    id: "booking-2",
    classId: "class-3",
    clientId: "5",
    bookingDate: "2025-06-05",
    status: "confirmada",
    paymentStatus: "pagado",
  },
];

// Estudio Mock Data
export const mockStudio: Studio = {
  id: "studio-1",
  name: "Silvia Fernandez Pilates Reformer",
  address: "Pasaje Ramirez 6076, Rosario Sant Fe",
  phone: "+54 341 2737 492",
  email: "luisdtv@gmail.com",
  openingHours: {
    lunes: { open: "07:00", close: "20:00" },
    martes: { open: "07:00", close: "20:00" },
    miercoles: { open: "07:00", close: "20:00" },
    jueves: { open: "07:00", close: "20:00" },
    viernes: { open: "07:00", close: "18:00" },
  },
  equipment: mockEquipment,
  policies: {
    cancellationPolicy: "Cancelaciones hasta 24 horas antes sin cargo",
    latePolicy: "Tolerancia de 10 minutos, luego se considera ausente",
    makeupPolicy: "Una clase de recuperación por mes incluida",
  },
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
  return mockUsers.find((user) => user.id === id);
};

export const getInstructorById = (id: string): Instructor | undefined => {
  return mockUsers.find(
    (user) => user.id === id && user.role === "instructor"
  ) as Instructor;
};

export const getClientById = (id: string): Cliente | undefined => {
  return mockUsers.find(
    (user) => user.id === id && user.role === "cliente"
  ) as Cliente;
};

export const getClassTypeById = (id: string): ClassType | undefined => {
  return mockClassTypes.find((classType) => classType.id === id);
};

export const getEquipmentById = (id: string): Equipment | undefined => {
  return mockEquipment.find((equipment) => equipment.id === id);
};

export const getClassesByInstructor = (instructorId: string): Class[] => {
  return mockClasses.filter((cls) => cls.instructorId === instructorId);
};

export const getClassesByClient = (clientId: string): Class[] => {
  return mockClasses.filter(
    (cls) =>
      cls.currentParticipants.includes(clientId) ||
      cls.waitingList.includes(clientId)
  );
};

export const getBookingsByClient = (clientId: string): Booking[] => {
  return mockBookings.filter((booking) => booking.clientId === clientId);
};
