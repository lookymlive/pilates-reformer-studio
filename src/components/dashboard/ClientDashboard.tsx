import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Progress } from '../ui/progress';
import {
  Calendar,
  Clock,
  Heart,
  Star,
  TrendingUp,
  BookOpen,
  CreditCard,
  User,
  MapPin,
  CheckCircle,
  Plus,
  Activity,
  Target,
  Award,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  classService, 
  userService, 
  classTypeService, 
  equipmentService,
  bookingService
} from '../../services/dataService';

export const ClientDashboard: React.FC = () => {
  const { user } = useAuth();
  const [clientClasses, setClientClasses] = useState([]);
  const [clientBookings, setClientBookings] = useState([]);
  const [upcomingClasses, setUpcomingClasses] = useState([]);
  const [completedClassesCount, setCompletedClassesCount] = useState(0);
  const [thisMonthClasses, setThisMonthClasses] = useState(0);
  const [client, setClient] = useState(null);
  
  if (!user || user.role !== 'cliente') {
    return <div>No tienes permisos para ver esta página</div>;
  }

  useEffect(() => {
    const loadData = () => {
      // Get classes where user is participant
      const allClasses = classService.getAll();
      const userClasses = allClasses.filter(cls => 
        cls.currentParticipants.includes(user.id) || cls.waitingList.includes(user.id)
      );
      setClientClasses(userClasses);

      // Get user bookings
      const bookings = bookingService.getByClient(user.id);
      setClientBookings(bookings);

      // Calculate upcoming classes
      const today = new Date().toISOString().split('T')[0];
      const upcoming = userClasses.filter(cls => cls.date >= today).slice(0, 3);
      setUpcomingClasses(upcoming);

      // Calculate completed classes
      const completed = bookings.filter(booking => booking.status === 'completada').length;
      setCompletedClassesCount(completed);

      // Calculate this month classes
      const thisMonth = bookings.filter(booking => {
        const bookingMonth = new Date(booking.bookingDate).getMonth();
        const currentMonth = new Date().getMonth();
        return bookingMonth === currentMonth;
      }).length;
      setThisMonthClasses(thisMonth);

      // Get client info
      const clientInfo = userService.getById(user.id);
      setClient(clientInfo);
    };

    loadData();

    // Listen for data updates
    const handleDataUpdate = () => loadData();
    window.addEventListener('dataUpdate', handleDataUpdate);
    
    return () => {
      window.removeEventListener('dataUpdate', handleDataUpdate);
    };
  }, [user.id]);

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  // Datos para el progreso del cliente
  const progressData = {
    classesThisMonth: thisMonthClasses,
    classesGoal: 12,
    totalClasses: completedClassesCount,
    membershipProgress: 85,
    nextMilestone: 50,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">¡Hola, {user.name}!</h1>
          <p className="text-gray-600">Bienvenida a tu espacio personal de Pilates</p>
        </div>
        <div className="text-right">
          <Badge className="bg-emerald-100 text-emerald-800 mb-2">
            {client?.membership || 'Mensual'}
          </Badge>
          <p className="text-sm text-gray-600">Nivel: {client?.level || 'Principiante'}</p>
        </div>
      </div>

      {/* Stats Cards */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          visible: {
            transition: {
              staggerChildren: 0.1
            }
          }
        }}
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
      >
        <motion.div variants={cardVariants}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Próximas Clases</CardTitle>
              <Calendar className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{upcomingClasses.length}</div>
              <p className="text-xs text-muted-foreground">
                Reservas confirmadas
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={cardVariants}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Este Mes</CardTitle>
              <Activity className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{progressData.classesThisMonth}</div>
              <p className="text-xs text-muted-foreground">
                de {progressData.classesGoal} clases planificadas
              </p>
              <Progress 
                value={(progressData.classesThisMonth / progressData.classesGoal) * 100} 
                className="h-2 mt-2" 
              />
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={cardVariants}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Clases</CardTitle>
              <Award className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{progressData.totalClasses}</div>
              <p className="text-xs text-muted-foreground">
                Clases completadas
              </p>
              <div className="flex items-center mt-1">
                <Target className="h-3 w-3 text-orange-500 mr-1" />
                <span className="text-xs text-orange-600">Meta: {progressData.nextMilestone}</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={cardVariants}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Mi Progreso</CardTitle>
              <TrendingUp className="h-4 w-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{progressData.membershipProgress}%</div>
              <p className="text-xs text-muted-foreground">
                Progreso mensual
              </p>
              <Progress value={progressData.membershipProgress} className="h-2 mt-2" />
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Próximas Clases */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Mis Próximas Clases</CardTitle>
                <CardDescription>
                  Tus reservas confirmadas
                </CardDescription>
              </div>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Reservar Clase
              </Button>
            </CardHeader>
            <CardContent>
              {upcomingClasses.length > 0 ? (
                <div className="space-y-4">
                  {upcomingClasses.map((cls) => {
                    const classType = classTypeService.getById(cls.classTypeId);
                    const equipment = equipmentService.getById(cls.equipmentId);
                    const instructor = userService.getById(cls.instructorId);

                    return (
                      <div key={cls.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg border-l-4 border-emerald-500">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-semibold text-gray-900">{classType?.name}</h3>
                            <Badge variant="outline" className="text-xs">
                              {new Date(cls.date).toLocaleDateString('es-ES', { 
                                weekday: 'long', 
                                month: 'long', 
                                day: 'numeric' 
                              })}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
                            <div className="flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              <span>{cls.time} • {cls.duration} minutos</span>
                            </div>
                            <div className="flex items-center">
                              <User className="w-3 h-3 mr-1" />
                              <span>Instructora: {instructor?.name}</span>
                            </div>
                            <div className="flex items-center">
                              <MapPin className="w-3 h-3 mr-1" />
                              <span>{equipment?.name}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end space-y-2">
                          <div className="text-lg font-bold text-emerald-600">
                            ${cls.price.toLocaleString()}
                          </div>
                          <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No tienes clases reservadas</p>
                  <p className="text-sm text-gray-400 mb-4">¡Es hora de reservar tu próxima sesión!</p>
                  <Button className="bg-emerald-600 hover:bg-emerald-700">
                    <Plus className="mr-2 h-4 w-4" />
                    Reservar Ahora
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Mi Perfil */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Mi Perfil</CardTitle>
              <CardDescription>
                Información personal
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="bg-emerald-600 text-white text-xl">
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-lg">{user.name}</h3>
                  <p className="text-sm text-gray-600">Miembro desde {new Date(user.joinDate).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}</p>
                  <Badge className="bg-emerald-100 text-emerald-800 mt-1">
                    {client?.level || 'Principiante'}
                  </Badge>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <CreditCard className="w-4 h-4 text-blue-600 mr-2" />
                    <span className="text-sm font-medium">Membresía</span>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800">
                    {client?.membership || 'Mensual'}
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <Heart className="w-4 h-4 text-red-600 mr-2" />
                    <span className="text-sm font-medium">Estado</span>
                  </div>
                  <Badge className="bg-green-100 text-green-800">
                    Activo
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <Target className="w-4 h-4 text-purple-600 mr-2" />
                    <span className="text-sm font-medium">Nivel</span>
                  </div>
                  <Badge className="bg-purple-100 text-purple-800">
                    {client?.level || 'Principiante'}
                  </Badge>
                </div>
              </div>

              <div className="pt-4 border-t">
                <Button className="w-full" variant="outline">
                  <User className="mr-2 h-4 w-4" />
                  Editar Perfil
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Mis Logros */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Mis Logros</CardTitle>
              <CardDescription>
                Progreso y metas alcanzadas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                    <div>
                      <p className="text-sm font-medium text-green-800">Primera Clase</p>
                      <p className="text-xs text-green-600">Completada</p>
                    </div>
                  </div>
                  <Award className="w-6 h-6 text-green-600" />
                </div>

                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-blue-600 mr-2" />
                    <div>
                      <p className="text-sm font-medium text-blue-800">10 Clases</p>
                      <p className="text-xs text-blue-600">Completadas</p>
                    </div>
                  </div>
                  <Award className="w-6 h-6 text-blue-600" />
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg opacity-60">
                  <div className="flex items-center">
                    <div className="w-5 h-5 rounded-full border-2 border-gray-400 mr-2" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">25 Clases</p>
                      <p className="text-xs text-gray-500">En progreso (15/25)</p>
                    </div>
                  </div>
                  <Award className="w-6 h-6 text-gray-400" />
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg opacity-60">
                  <div className="flex items-center">
                    <div className="w-5 h-5 rounded-full border-2 border-gray-400 mr-2" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Mes Perfecto</p>
                      <p className="text-xs text-gray-500">12 clases en un mes</p>
                    </div>
                  </div>
                  <Award className="w-6 h-6 text-gray-400" />
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="text-center">
                  <p className="text-sm font-medium mb-2">Progreso hacia siguiente logro</p>
                  <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                    <span>25 Clases</span>
                    <span>15/25</span>
                  </div>
                  <Progress value={60} className="h-2" />
                  <p className="text-xs text-gray-500 mt-1">¡Solo faltan 10 clases más!</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Actividad Reciente */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader>
              <CardTitle>Actividad Reciente</CardTitle>
              <CardDescription>
                Tus últimas acciones en el estudio
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    date: 'Ayer',
                    action: 'Clase completada',
                    details: 'Reformer Básico con María González',
                    type: 'completed',
                    icon: CheckCircle,
                  },
                  {
                    date: 'Hace 3 días',
                    action: 'Nueva reserva',
                    details: 'Reformer Intermedio - 09 Jun, 14:00',
                    type: 'booking',
                    icon: Calendar,
                  },
                  {
                    date: 'Hace 1 semana',
                    action: 'Perfil actualizado',
                    details: 'Información de contacto modificada',
                    type: 'profile',
                    icon: User,
                  },
                  {
                    date: 'Hace 2 semanas',
                    action: 'Logro desbloqueado',
                    details: '10 clases completadas',
                    type: 'achievement',
                    icon: Award,
                  },
                ].map((activity, index) => {
                  const IconComponent = activity.icon;
                  return (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        activity.type === 'completed' ? 'bg-green-100' :
                        activity.type === 'booking' ? 'bg-blue-100' :
                        activity.type === 'profile' ? 'bg-purple-100' :
                        'bg-yellow-100'
                      }`}>
                        <IconComponent className={`w-4 h-4 ${
                          activity.type === 'completed' ? 'text-green-600' :
                          activity.type === 'booking' ? 'text-blue-600' :
                          activity.type === 'profile' ? 'text-purple-600' :
                          'text-yellow-600'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                        <p className="text-sm text-gray-600">{activity.details}</p>
                        <p className="text-xs text-gray-500 mt-1">{activity.date}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};
