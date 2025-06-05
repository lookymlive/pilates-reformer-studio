import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import {
  Calendar,
  Clock,
  User,
  MapPin,
  DollarSign,
  CheckCircle,
  AlertCircle,
  XCircle,
  MoreHorizontal,
  Phone,
  Mail,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  bookingService, 
  classService, 
  classTypeService, 
  equipmentService, 
  userService 
} from '../../services/dataService';
import { Booking, Class, ClassType, Equipment, Instructor } from '../../types';
import { format, isPast, isToday, isTomorrow } from 'date-fns';
import { es } from 'date-fns/locale';

export const MyBookings: React.FC = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');

  // Estados para datos relacionados
  const [classes, setClasses] = useState<Class[]>([]);
  const [classTypes, setClassTypes] = useState<ClassType[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);

  useEffect(() => {
    if (user) {
      loadBookings();
      loadRelatedData();
    }
  }, [user]);

  const loadBookings = () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const userBookings = bookingService.getByClient(user.id);
      // Ordenar por fecha de clase (más recientes primero)
      userBookings.sort((a, b) => {
        const classA = classService.getById(a.classId);
        const classB = classService.getById(b.classId);
        if (!classA || !classB) return 0;
        return new Date(classB.date).getTime() - new Date(classA.date).getTime();
      });
      setBookings(userBookings);
    } catch (err) {
      setError('Error al cargar las reservas');
    } finally {
      setLoading(false);
    }
  };

  const loadRelatedData = () => {
    setClasses(classService.getAll());
    setClassTypes(classTypeService.getAll());
    setEquipment(equipmentService.getAll());
    setInstructors(userService.getByRole('instructor') as Instructor[]);
  };

  const getClassData = (classId: string) => {
    const classData = classes.find(c => c.id === classId);
    if (!classData) return null;

    const classType = classTypes.find(ct => ct.id === classData.classTypeId);
    const equipmentData = equipment.find(eq => eq.id === classData.equipmentId);
    const instructor = instructors.find(inst => inst.id === classData.instructorId);

    return { classData, classType, equipmentData, instructor };
  };

  const getBookingStatusBadge = (booking: Booking) => {
    const classData = classes.find(c => c.id === booking.classId);
    const isPastClass = classData ? isPast(new Date(classData.date + 'T' + classData.time)) : false;

    switch (booking.status) {
      case 'confirmada':
        if (isPastClass) {
          return <Badge className="bg-green-100 text-green-800">Completada</Badge>;
        }
        return <Badge className="bg-blue-100 text-blue-800">Confirmada</Badge>;
      case 'en_espera':
        return <Badge className="bg-yellow-100 text-yellow-800">Lista de Espera</Badge>;
      case 'cancelada':
        return <Badge className="bg-red-100 text-red-800">Cancelada</Badge>;
      case 'completada':
        return <Badge className="bg-green-100 text-green-800">Completada</Badge>;
      default:
        return <Badge variant="outline">{booking.status}</Badge>;
    }
  };

  const getPaymentStatusBadge = (paymentStatus: string) => {
    switch (paymentStatus) {
      case 'pagado':
        return <Badge className="bg-green-100 text-green-800">Pagado</Badge>;
      case 'pendiente':
        return <Badge className="bg-yellow-100 text-yellow-800">Pendiente</Badge>;
      case 'reembolsado':
        return <Badge className="bg-gray-100 text-gray-800">Reembolsado</Badge>;
      default:
        return <Badge variant="outline">{paymentStatus}</Badge>;
    }
  };

  const canCancelBooking = (booking: Booking): boolean => {
    if (booking.status === 'cancelada') return false;
    
    const classData = classes.find(c => c.id === booking.classId);
    if (!classData) return false;

    // No se puede cancelar si la clase ya pasó
    const classDateTime = new Date(classData.date + 'T' + classData.time);
    if (isPast(classDateTime)) return false;

    // Política: se puede cancelar hasta 24 horas antes
    const now = new Date();
    const hoursUntilClass = (classDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
    return hoursUntilClass >= 24;
  };

  const handleCancelBooking = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowCancelDialog(true);
    setCancelReason('');
    setError('');
  };

  const confirmCancelBooking = async () => {
    if (!selectedBooking) return;

    setLoading(true);
    setError('');

    try {
      const success = bookingService.cancel(selectedBooking.id, cancelReason || undefined);
      
      if (success) {
        setSuccessMessage('Reserva cancelada exitosamente');
        setShowCancelDialog(false);
        loadBookings(); // Recargar reservas
        
        // Limpiar mensaje después de 3 segundos
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setError('Error al cancelar la reserva');
      }
    } catch (err) {
      setError('Error al cancelar la reserva');
    } finally {
      setLoading(false);
    }
  };

  const getDateLabel = (dateString: string) => {
    const date = new Date(dateString);
    if (isToday(date)) return 'Hoy';
    if (isTomorrow(date)) return 'Mañana';
    return format(date, 'EEEE, d MMMM', { locale: es });
  };

  const filterBookings = (status: 'all' | 'upcoming' | 'completed' | 'cancelled') => {
    return bookings.filter(booking => {
      const classData = classes.find(c => c.id === booking.classId);
      const isPastClass = classData ? isPast(new Date(classData.date + 'T' + classData.time)) : false;

      switch (status) {
        case 'upcoming':
          return !isPastClass && booking.status !== 'cancelada';
        case 'completed':
          return isPastClass || booking.status === 'completada';
        case 'cancelled':
          return booking.status === 'cancelada';
        default:
          return true;
      }
    });
  };

  if (loading && bookings.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
        <p className="text-gray-600 mt-2">Cargando reservas...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Mis Reservas</h2>
        <p className="text-gray-600">Gestiona todas tus clases reservadas</p>
      </div>

      {/* Mensaje de éxito */}
      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">{successMessage}</AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error global */}
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      {/* Tabs para filtrar reservas */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">Todas ({bookings.length})</TabsTrigger>
          <TabsTrigger value="upcoming">
            Próximas ({filterBookings('upcoming').length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completadas ({filterBookings('completed').length})
          </TabsTrigger>
          <TabsTrigger value="cancelled">
            Canceladas ({filterBookings('cancelled').length})
          </TabsTrigger>
        </TabsList>

        {['all', 'upcoming', 'completed', 'cancelled'].map((tabValue) => (
          <TabsContent key={tabValue} value={tabValue} className="space-y-4">
            {filterBookings(tabValue as any).length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">
                    {tabValue === 'upcoming' && 'No tienes clases próximas'}
                    {tabValue === 'completed' && 'No tienes clases completadas'}
                    {tabValue === 'cancelled' && 'No tienes clases canceladas'}
                    {tabValue === 'all' && 'No tienes reservas'}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {tabValue === 'upcoming' && '¡Es hora de reservar tu próxima clase!'}
                    {tabValue === 'all' && '¡Reserva tu primera clase de Pilates!'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filterBookings(tabValue as any).map((booking) => {
                  const data = getClassData(booking.classId);
                  if (!data) return null;

                  const { classData, classType, equipmentData, instructor } = data;
                  const canCancel = canCancelBooking(booking);

                  return (
                    <motion.div
                      key={booking.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <Card className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-3">
                                <h3 className="font-semibold text-lg text-gray-900">
                                  {classType?.name}
                                </h3>
                                {getBookingStatusBadge(booking)}
                                {getPaymentStatusBadge(booking.paymentStatus)}
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-sm text-gray-600 mb-4">
                                <div className="flex items-center">
                                  <Calendar className="w-4 h-4 mr-2" />
                                  <span>{getDateLabel(classData.date)}</span>
                                </div>
                                <div className="flex items-center">
                                  <Clock className="w-4 h-4 mr-2" />
                                  <span>{classData.time} ({classData.duration} min)</span>
                                </div>
                                <div className="flex items-center">
                                  <User className="w-4 h-4 mr-2" />
                                  <span>{instructor?.name}</span>
                                </div>
                                <div className="flex items-center">
                                  <MapPin className="w-4 h-4 mr-2" />
                                  <span>{equipmentData?.name}</span>
                                </div>
                              </div>

                              <div className="flex items-center justify-between">
                                <div className="text-lg font-semibold text-emerald-600">
                                  ${classData.price.toLocaleString()}
                                </div>
                                <div className="text-xs text-gray-500">
                                  Reservado el {format(new Date(booking.bookingDate), 'd MMM yyyy', { locale: es })}
                                </div>
                              </div>

                              {booking.notes && (
                                <div className="mt-3 p-2 bg-gray-50 rounded text-sm">
                                  <strong>Notas:</strong> {booking.notes}
                                </div>
                              )}

                              {booking.cancellationReason && (
                                <div className="mt-3 p-2 bg-red-50 rounded text-sm text-red-800">
                                  <strong>Motivo de cancelación:</strong> {booking.cancellationReason}
                                </div>
                              )}
                            </div>

                            <div className="flex flex-col space-y-2 ml-4">
                              {canCancel && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleCancelBooking(booking)}
                                  className="text-red-600 hover:text-red-700 hover:border-red-300"
                                >
                                  <XCircle className="w-4 h-4 mr-1" />
                                  Cancelar
                                </Button>
                              )}
                              
                              {instructor && (
                                <Button variant="ghost" size="sm">
                                  <Phone className="w-4 h-4 mr-1" />
                                  Contactar
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Dialog de cancelación */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cancelar Reserva</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que quieres cancelar esta reserva?
            </DialogDescription>
          </DialogHeader>

          {selectedBooking && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-3 rounded">
                {(() => {
                  const data = getClassData(selectedBooking.classId);
                  if (!data) return null;
                  const { classData, classType } = data;
                  
                  return (
                    <div>
                      <p className="font-medium">{classType?.name}</p>
                      <p className="text-sm text-gray-600">
                        {getDateLabel(classData.date)} a las {classData.time}
                      </p>
                    </div>
                  );
                })()}
              </div>

              <div className="space-y-2">
                <Label htmlFor="cancel-reason">Motivo de cancelación (opcional)</Label>
                <Textarea
                  id="cancel-reason"
                  placeholder="Puedes agregar un motivo para la cancelación..."
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  rows={3}
                />
              </div>

              <Alert className="border-yellow-200 bg-yellow-50">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800">
                  Ten en cuenta las políticas de cancelación del estudio.
                </AlertDescription>
              </Alert>
            </div>
          )}

          <DialogFooter className="space-x-2">
            <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
              Mantener Reserva
            </Button>
            <Button 
              variant="destructive"
              onClick={confirmCancelBooking}
              disabled={loading}
            >
              {loading ? 'Cancelando...' : 'Cancelar Reserva'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
