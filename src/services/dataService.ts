import { 
  User, 
  Class, 
  Booking, 
  Equipment, 
  ClassType, 
  Cliente, 
  Instructor,
  Admin 
} from '../types';
import { 
  mockUsers, 
  mockClasses, 
  mockBookings, 
  mockEquipment, 
  mockClassTypes 
} from '../data/mockData';

// Keys para localStorage
const STORAGE_KEYS = {
  USERS: 'pilates_users',
  CLASSES: 'pilates_classes',
  BOOKINGS: 'pilates_bookings',
  EQUIPMENT: 'pilates_equipment',
  CLASS_TYPES: 'pilates_class_types',
  INITIALIZED: 'pilates_data_initialized'
};

// Inicializar datos si no existen
const initializeData = () => {
  if (!localStorage.getItem(STORAGE_KEYS.INITIALIZED)) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(mockUsers));
    localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(mockClasses));
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(mockBookings));
    localStorage.setItem(STORAGE_KEYS.EQUIPMENT, JSON.stringify(mockEquipment));
    localStorage.setItem(STORAGE_KEYS.CLASS_TYPES, JSON.stringify(mockClassTypes));
    localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
  }
};

// Utility para generar IDs únicos
const generateId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9);

// Helper para obtener datos del localStorage
const getData = <T>(key: string): T[] => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error(`Error getting data for key ${key}:`, error);
    return [];
  }
};

// Helper para guardar datos en localStorage
const saveData = <T>(key: string, data: T[]) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    // Dispatch event para notificar cambios
    window.dispatchEvent(new CustomEvent('dataUpdate', { detail: { key, data } }));
  } catch (error) {
    console.error(`Error saving data for key ${key}:`, error);
  }
};

// =============================================================================
// USERS SERVICE
// =============================================================================

export const userService = {
  getAll: (): User[] => {
    initializeData();
    return getData<User>(STORAGE_KEYS.USERS);
  },

  getById: (id: string): User | undefined => {
    const users = userService.getAll();
    return users.find(user => user.id === id);
  },

  getByRole: (role: string): User[] => {
    const users = userService.getAll();
    return users.filter(user => user.role === role);
  },

  create: (userData: Omit<User, 'id' | 'joinDate' | 'isActive'>): User => {
    const users = userService.getAll();
    const newUser: User = {
      ...userData,
      id: generateId(),
      joinDate: new Date().toISOString().split('T')[0],
      isActive: true,
    };
    
    users.push(newUser);
    saveData(STORAGE_KEYS.USERS, users);
    return newUser;
  },

  update: (id: string, userData: Partial<User>): User | null => {
    const users = userService.getAll();
    const index = users.findIndex(user => user.id === id);
    
    if (index === -1) return null;
    
    users[index] = { ...users[index], ...userData };
    saveData(STORAGE_KEYS.USERS, users);
    return users[index];
  },

  delete: (id: string): boolean => {
    const users = userService.getAll();
    const filteredUsers = users.filter(user => user.id !== id);
    
    if (filteredUsers.length === users.length) return false;
    
    saveData(STORAGE_KEYS.USERS, filteredUsers);
    return true;
  },

  toggleActive: (id: string): boolean => {
    const users = userService.getAll();
    const user = users.find(u => u.id === id);
    
    if (!user) return false;
    
    user.isActive = !user.isActive;
    saveData(STORAGE_KEYS.USERS, users);
    return true;
  }
};

// =============================================================================
// CLASSES SERVICE
// =============================================================================

export const classService = {
  getAll: (): Class[] => {
    initializeData();
    return getData<Class>(STORAGE_KEYS.CLASSES);
  },

  getById: (id: string): Class | undefined => {
    const classes = classService.getAll();
    return classes.find(cls => cls.id === id);
  },

  getByInstructor: (instructorId: string): Class[] => {
    const classes = classService.getAll();
    return classes.filter(cls => cls.instructorId === instructorId);
  },

  getByDate: (date: string): Class[] => {
    const classes = classService.getAll();
    return classes.filter(cls => cls.date === date);
  },

  getAvailableClasses: (date?: string): Class[] => {
    const classes = classService.getAll();
    let filtered = classes.filter(cls => 
      cls.status === 'programada' && 
      cls.currentParticipants.length < cls.maxParticipants
    );
    
    if (date) {
      filtered = filtered.filter(cls => cls.date === date);
    }
    
    return filtered;
  },

  create: (classData: Omit<Class, 'id'>): Class => {
    const classes = classService.getAll();
    const newClass: Class = {
      ...classData,
      id: generateId(),
    };
    
    classes.push(newClass);
    saveData(STORAGE_KEYS.CLASSES, classes);
    return newClass;
  },

  update: (id: string, classData: Partial<Class>): Class | null => {
    const classes = classService.getAll();
    const index = classes.findIndex(cls => cls.id === id);
    
    if (index === -1) return null;
    
    classes[index] = { ...classes[index], ...classData };
    saveData(STORAGE_KEYS.CLASSES, classes);
    return classes[index];
  },

  delete: (id: string): boolean => {
    const classes = classService.getAll();
    const filteredClasses = classes.filter(cls => cls.id !== id);
    
    if (filteredClasses.length === classes.length) return false;
    
    saveData(STORAGE_KEYS.CLASSES, filteredClasses);
    return true;
  },

  addParticipant: (classId: string, clientId: string): boolean => {
    const classes = classService.getAll();
    const classToUpdate = classes.find(cls => cls.id === classId);
    
    if (!classToUpdate) return false;
    
    // Si hay espacio, agregar a participantes
    if (classToUpdate.currentParticipants.length < classToUpdate.maxParticipants) {
      if (!classToUpdate.currentParticipants.includes(clientId)) {
        classToUpdate.currentParticipants.push(clientId);
        saveData(STORAGE_KEYS.CLASSES, classes);
        return true;
      }
    } else {
      // Si no hay espacio, agregar a lista de espera
      if (!classToUpdate.waitingList.includes(clientId)) {
        classToUpdate.waitingList.push(clientId);
        saveData(STORAGE_KEYS.CLASSES, classes);
        return true;
      }
    }
    
    return false;
  },

  removeParticipant: (classId: string, clientId: string): boolean => {
    const classes = classService.getAll();
    const classToUpdate = classes.find(cls => cls.id === classId);
    
    if (!classToUpdate) return false;
    
    // Remover de participantes
    const participantIndex = classToUpdate.currentParticipants.indexOf(clientId);
    if (participantIndex > -1) {
      classToUpdate.currentParticipants.splice(participantIndex, 1);
      
      // Si hay alguien en lista de espera, moverlo a participantes
      if (classToUpdate.waitingList.length > 0) {
        const nextClient = classToUpdate.waitingList.shift();
        if (nextClient) {
          classToUpdate.currentParticipants.push(nextClient);
        }
      }
      
      saveData(STORAGE_KEYS.CLASSES, classes);
      return true;
    }
    
    // Remover de lista de espera
    const waitingIndex = classToUpdate.waitingList.indexOf(clientId);
    if (waitingIndex > -1) {
      classToUpdate.waitingList.splice(waitingIndex, 1);
      saveData(STORAGE_KEYS.CLASSES, classes);
      return true;
    }
    
    return false;
  }
};

// =============================================================================
// BOOKINGS SERVICE
// =============================================================================

export const bookingService = {
  getAll: (): Booking[] => {
    initializeData();
    return getData<Booking>(STORAGE_KEYS.BOOKINGS);
  },

  getById: (id: string): Booking | undefined => {
    const bookings = bookingService.getAll();
    return bookings.find(booking => booking.id === id);
  },

  getByClient: (clientId: string): Booking[] => {
    const bookings = bookingService.getAll();
    return bookings.filter(booking => booking.clientId === clientId);
  },

  getByClass: (classId: string): Booking[] => {
    const bookings = bookingService.getAll();
    return bookings.filter(booking => booking.classId === classId);
  },

  create: (bookingData: Omit<Booking, 'id' | 'bookingDate'>): Booking => {
    const bookings = bookingService.getAll();
    const newBooking: Booking = {
      ...bookingData,
      id: generateId(),
      bookingDate: new Date().toISOString().split('T')[0],
    };
    
    // Agregar cliente a la clase
    classService.addParticipant(newBooking.classId, newBooking.clientId);
    
    bookings.push(newBooking);
    saveData(STORAGE_KEYS.BOOKINGS, bookings);
    return newBooking;
  },

  update: (id: string, bookingData: Partial<Booking>): Booking | null => {
    const bookings = bookingService.getAll();
    const index = bookings.findIndex(booking => booking.id === id);
    
    if (index === -1) return null;
    
    bookings[index] = { ...bookings[index], ...bookingData };
    saveData(STORAGE_KEYS.BOOKINGS, bookings);
    return bookings[index];
  },

  cancel: (id: string, reason?: string): boolean => {
    const booking = bookingService.getById(id);
    if (!booking) return false;
    
    // Actualizar estado de la reserva
    const updated = bookingService.update(id, {
      status: 'cancelada',
      cancellationReason: reason
    });
    
    if (updated) {
      // Remover cliente de la clase
      classService.removeParticipant(booking.classId, booking.clientId);
      return true;
    }
    
    return false;
  },

  delete: (id: string): boolean => {
    const bookings = bookingService.getAll();
    const booking = bookings.find(b => b.id === id);
    
    if (booking) {
      // Remover cliente de la clase
      classService.removeParticipant(booking.classId, booking.clientId);
    }
    
    const filteredBookings = bookings.filter(booking => booking.id !== id);
    
    if (filteredBookings.length === bookings.length) return false;
    
    saveData(STORAGE_KEYS.BOOKINGS, filteredBookings);
    return true;
  }
};

// =============================================================================
// EQUIPMENT SERVICE
// =============================================================================

export const equipmentService = {
  getAll: (): Equipment[] => {
    initializeData();
    return getData<Equipment>(STORAGE_KEYS.EQUIPMENT);
  },

  getById: (id: string): Equipment | undefined => {
    const equipment = equipmentService.getAll();
    return equipment.find(eq => eq.id === id);
  },

  getAvailable: (): Equipment[] => {
    const equipment = equipmentService.getAll();
    return equipment.filter(eq => eq.status === 'disponible');
  },

  create: (equipmentData: Omit<Equipment, 'id'>): Equipment => {
    const equipment = equipmentService.getAll();
    const newEquipment: Equipment = {
      ...equipmentData,
      id: generateId(),
    };
    
    equipment.push(newEquipment);
    saveData(STORAGE_KEYS.EQUIPMENT, equipment);
    return newEquipment;
  },

  update: (id: string, equipmentData: Partial<Equipment>): Equipment | null => {
    const equipment = equipmentService.getAll();
    const index = equipment.findIndex(eq => eq.id === id);
    
    if (index === -1) return null;
    
    equipment[index] = { ...equipment[index], ...equipmentData };
    saveData(STORAGE_KEYS.EQUIPMENT, equipment);
    return equipment[index];
  },

  delete: (id: string): boolean => {
    const equipment = equipmentService.getAll();
    const filteredEquipment = equipment.filter(eq => eq.id !== id);
    
    if (filteredEquipment.length === equipment.length) return false;
    
    saveData(STORAGE_KEYS.EQUIPMENT, filteredEquipment);
    return true;
  }
};

// =============================================================================
// CLASS TYPES SERVICE
// =============================================================================

export const classTypeService = {
  getAll: (): ClassType[] => {
    initializeData();
    return getData<ClassType>(STORAGE_KEYS.CLASS_TYPES);
  },

  getById: (id: string): ClassType | undefined => {
    const classTypes = classTypeService.getAll();
    return classTypes.find(ct => ct.id === id);
  },

  create: (classTypeData: Omit<ClassType, 'id'>): ClassType => {
    const classTypes = classTypeService.getAll();
    const newClassType: ClassType = {
      ...classTypeData,
      id: generateId(),
    };
    
    classTypes.push(newClassType);
    saveData(STORAGE_KEYS.CLASS_TYPES, classTypes);
    return newClassType;
  },

  update: (id: string, classTypeData: Partial<ClassType>): ClassType | null => {
    const classTypes = classTypeService.getAll();
    const index = classTypes.findIndex(ct => ct.id === id);
    
    if (index === -1) return null;
    
    classTypes[index] = { ...classTypes[index], ...classTypeData };
    saveData(STORAGE_KEYS.CLASS_TYPES, classTypes);
    return classTypes[index];
  },

  delete: (id: string): boolean => {
    const classTypes = classTypeService.getAll();
    const filteredClassTypes = classTypes.filter(ct => ct.id !== id);
    
    if (filteredClassTypes.length === classTypes.length) return false;
    
    saveData(STORAGE_KEYS.CLASS_TYPES, filteredClassTypes);
    return true;
  }
};

// =============================================================================
// ANALYTICS SERVICE
// =============================================================================

export const analyticsService = {
  getDashboardStats: () => {
    const users = userService.getAll();
    const classes = classService.getAll();
    const bookings = bookingService.getAll();
    
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const totalClients = users.filter(u => u.role === 'cliente' && u.isActive).length;
    const totalInstructors = users.filter(u => u.role === 'instructor' && u.isActive).length;
    const totalClasses = classes.length;
    
    const monthlyBookings = bookings.filter(b => {
      const bookingDate = new Date(b.bookingDate);
      return bookingDate.getMonth() === currentMonth && bookingDate.getFullYear() === currentYear;
    });
    
    const monthlyRevenue = monthlyBookings.reduce((total, booking) => {
      const cls = classService.getById(booking.classId);
      return total + (cls?.price || 0);
    }, 0);
    
    const thisWeek = new Date();
    const weekStart = new Date(thisWeek.setDate(thisWeek.getDate() - thisWeek.getDay()));
    const weekEnd = new Date(thisWeek.setDate(thisWeek.getDate() - thisWeek.getDay() + 6));
    
    const classesThisWeek = classes.filter(cls => {
      const classDate = new Date(cls.date);
      return classDate >= weekStart && classDate <= weekEnd;
    }).length;
    
    const cancelledBookings = bookings.filter(b => b.status === 'cancelada').length;
    const cancellationRate = bookings.length > 0 ? (cancelledBookings / bookings.length) * 100 : 0;
    
    const totalCapacity = classes.reduce((total, cls) => total + cls.maxParticipants, 0);
    const totalOccupied = classes.reduce((total, cls) => total + cls.currentParticipants.length, 0);
    const occupancyRate = totalCapacity > 0 ? (totalOccupied / totalCapacity) * 100 : 0;
    
    const newClientsThisMonth = users.filter(u => {
      if (u.role !== 'cliente') return false;
      const joinDate = new Date(u.joinDate);
      return joinDate.getMonth() === currentMonth && joinDate.getFullYear() === currentYear;
    }).length;
    
    return {
      totalClients,
      totalInstructors,
      totalClasses,
      monthlyRevenue,
      classesThisWeek,
      cancellationRate: Math.round(cancellationRate * 10) / 10,
      occupancyRate: Math.round(occupancyRate * 10) / 10,
      newClientsThisMonth,
    };
  },

  getRevenueData: (days: number = 7) => {
    const bookings = bookingService.getAll();
    const classes = classService.getAll();
    
    const data = [];
    const today = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      
      const dayBookings = bookings.filter(b => b.bookingDate === dateString && b.status !== 'cancelada');
      const dayRevenue = dayBookings.reduce((total, booking) => {
        const cls = classes.find(c => c.id === booking.classId);
        return total + (cls?.price || 0);
      }, 0);
      
      data.push({
        date: dateString,
        day: date.toLocaleDateString('es-ES', { weekday: 'short' }),
        revenue: dayRevenue,
      });
    }
    
    return data;
  },

  getClassTypeDistribution: () => {
    const classes = classService.getAll();
    const classTypes = classTypeService.getAll();
    
    const distribution = classTypes.map(type => {
      const count = classes.filter(cls => cls.classTypeId === type.id).length;
      const percentage = classes.length > 0 ? Math.round((count / classes.length) * 100) : 0;
      
      return {
        name: type.name,
        value: percentage,
        count,
        color: type.id === 'reformer-basico' ? '#10b981' :
               type.id === 'reformer-intermedio' ? '#3b82f6' :
               type.id === 'reformer-avanzado' ? '#8b5cf6' :
               '#f59e0b'
      };
    });
    
    return distribution;
  }
};
