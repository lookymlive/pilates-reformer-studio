import { addDays, format, getDay, isBefore, startOfWeek } from "date-fns";
import { es } from "date-fns/locale";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  Calendar as CalendarIcon,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  User,
  Users,
} from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { mockStudio } from "../../data/mockData";
import {
  bookingService,
  classService,
  classTypeService,
  equipmentService,
  userService,
} from "../../services/dataService";
import { Class, ClassType, Equipment, Instructor } from "../../types";
import { Alert, AlertDescription } from "../ui/alert";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Calendar } from "../ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";

interface ClassCalendarProps {
  onBookingCreated?: () => void;
}

export const ClassCalendar: React.FC<ClassCalendarProps> = ({
  onBookingCreated,
}) => {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [availableClasses, setAvailableClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(false);
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [error, setError] = useState("");
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");

  // Estados para datos relacionados
  const [classTypes, setClassTypes] = useState<ClassType[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);

  useEffect(() => {
    // Cargar datos relacionados
    setClassTypes(classTypeService.getAll());
    setEquipment(equipmentService.getAll());
    setInstructors(userService.getByRole("instructor") as Instructor[]);

    const handleDataUpdate = () => {
      setClassTypes(classTypeService.getAll());
      setEquipment(equipmentService.getAll());
      setInstructors(userService.getByRole("instructor") as Instructor[]);
    };
    window.addEventListener("dataUpdate", handleDataUpdate);
    return () => {
      window.removeEventListener("dataUpdate", handleDataUpdate);
    };
  }, []);

  // Declarar la función antes del useEffect y usarla correctamente
  const loadAvailableClasses = useCallback(() => {
    setLoading(true);
    try {
      const dateString = selectedDate.toISOString().split("T")[0];
      const classes = classService.getByDate(dateString);
      const available = classes.filter((cls) => {
        if (
          Array.isArray(cls.currentParticipants) &&
          typeof cls.maxParticipants === "number"
        ) {
          return (
            cls.status === "programada" &&
            cls.currentParticipants.length < cls.maxParticipants
          );
        }
        return false;
      });
      setAvailableClasses(available);
    } catch (err) {
      setError("Error al cargar las clases disponibles");
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    loadAvailableClasses();
  }, [selectedDate, loadAvailableClasses]);

  const getClassType = (classTypeId: string): ClassType | undefined => {
    return classTypes.find((ct) => ct.id === classTypeId);
  };

  const getEquipment = (equipmentId: string): Equipment | undefined => {
    return equipment.find((eq) => eq.id === equipmentId);
  };

  const getInstructor = (instructorId: string): Instructor | undefined => {
    return instructors.find((inst) => inst.id === instructorId);
  };

  const isDateAvailable = (date: Date): boolean => {
    // No permitir fechas pasadas
    if (isBefore(date, new Date())) return false;

    const dayOfWeek = getDay(date);
    const dayNames = ["lunes", "martes", "miercoles", "jueves", "viernes"];
    const currentDay = dayNames[dayOfWeek - 1]; // Adjust index for Monday being 0 after removal of Sunday

    // Check if the studio is open on this day
    // Using type assertion to tell TypeScript that currentDay will be a key of openingHours
    const hoursForDay =
      mockStudio.openingHours[
        currentDay as keyof typeof mockStudio.openingHours
      ];

    return hoursForDay !== null && hoursForDay !== undefined;
  };

  const hasClassesOnDate = (date: Date): boolean => {
    const dateString = date.toISOString().split("T")[0];
    const classes = classService.getByDate(dateString);
    return classes.some(
      (cls) =>
        cls.status === "programada" &&
        cls.currentParticipants.length < cls.maxParticipants
    );
  };

  const handleClassSelect = (classData: Class) => {
    setSelectedClass(classData);
    setShowBookingDialog(true);
    setError("");
  };

  const handleBookClass = async () => {
    if (!selectedClass || !user) return;

    setLoading(true);
    setError("");

    try {
      // Verificar si el usuario ya tiene una reserva para esta clase
      const existingBookings = bookingService.getByClient(user.id);
      const alreadyBooked = existingBookings.some(
        (booking) =>
          booking.classId === selectedClass.id && booking.status !== "cancelada"
      );

      if (alreadyBooked) {
        setError("Ya tienes una reserva para esta clase");
        return;
      }

      // Crear la reserva
      const newBooking = bookingService.create({
        classId: selectedClass.id,
        clientId: user.id,
        status: "confirmada",
        paymentStatus: "pendiente",
      });

      if (newBooking) {
        setBookingSuccess(true);
        setShowBookingDialog(false);
        loadAvailableClasses(); // Recargar clases disponibles
        onBookingCreated?.();

        // Limpiar mensaje de éxito después de 3 segundos
        setTimeout(() => setBookingSuccess(false), 3000);
      }
    } catch (err) {
      setError("Error al realizar la reserva. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  const getWeekDates = () => {
    const start = startOfWeek(selectedDate, { weekStartsOn: 1 }); // Lunes
    const dates = [];
    for (let i = 0; i < 7; i++) {
      dates.push(addDays(start, i));
    }
    return dates;
  };

  const navigateWeek = (direction: "prev" | "next") => {
    const newDate = addDays(selectedDate, direction === "next" ? 7 : -7);
    setSelectedDate(newDate);
  };

  return (
    <div className="space-y-6">
      {/* Header con controles */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Reservar Clases</h2>
          <p className="text-gray-600">
            Selecciona una fecha y hora para tu próxima clase
          </p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant={viewMode === "calendar" ? "default" : "outline"}
            onClick={() => setViewMode("calendar")}
            size="sm"
          >
            <CalendarIcon className="w-4 h-4 mr-1" />
            Calendario
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            onClick={() => setViewMode("list")}
            size="sm"
          >
            Lista
          </Button>
        </div>
      </div>

      {/* Mensaje de éxito */}
      <AnimatePresence>
        {bookingSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                ¡Reserva realizada exitosamente! Recibirás una confirmación por
                email.
              </AlertDescription>
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

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Calendario */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Seleccionar Fecha</CardTitle>
              <CardDescription>
                Elige el día para tu clase de Pilates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                disabled={(date) => !isDateAvailable(date)}
                locale={es}
                className="rounded-md border"
                modifiers={{
                  hasClasses: (date) => hasClassesOnDate(date),
                }}
                modifiersStyles={{
                  hasClasses: {
                    backgroundColor: "#dcfce7",
                    color: "#16a34a",
                    fontWeight: "bold",
                  },
                }}
              />
              <div className="mt-4 space-y-2 text-xs">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-100 border border-green-300 rounded"></div>
                  <span>Días con clases disponibles</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-gray-100 border border-gray-300 rounded"></div>
                  <span>Días no disponibles</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Clases disponibles */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>
                    Clases del{" "}
                    {format(selectedDate, "EEEE, d MMMM yyyy", { locale: es })}
                  </CardTitle>
                  <CardDescription>
                    {availableClasses.length} clase
                    {availableClasses.length !== 1 ? "s" : ""} disponible
                    {availableClasses.length !== 1 ? "s" : ""}
                  </CardDescription>
                </div>
                {viewMode === "calendar" && (
                  <div className="flex space-x-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigateWeek("prev")}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigateWeek("next")}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
                  <p className="text-gray-600 mt-2">Cargando clases...</p>
                </div>
              ) : availableClasses.length === 0 ? (
                <div className="text-center py-8">
                  <CalendarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">
                    No hay clases disponibles para este día
                  </p>
                  <p className="text-sm text-gray-500">
                    Selecciona otra fecha o contacta al estudio
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {availableClasses.map((classData) => {
                    const classType = getClassType(classData.classTypeId);
                    const equipmentData = getEquipment(classData.equipmentId);
                    const instructor = getInstructor(classData.instructorId);
                    const spotsLeft =
                      classData.maxParticipants -
                      classData.currentParticipants.length;

                    return (
                      <motion.div
                        key={classData.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => handleClassSelect(classData)}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h3 className="font-semibold text-lg text-gray-900">
                                {classType?.name}
                              </h3>
                              <Badge
                                variant="outline"
                                className={
                                  classType?.level === "Principiante"
                                    ? "border-green-200 text-green-800"
                                    : classType?.level === "Intermedio"
                                    ? "border-blue-200 text-blue-800"
                                    : "border-purple-200 text-purple-800"
                                }
                              >
                                {classType?.level}
                              </Badge>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-gray-600">
                              <div className="flex items-center">
                                <Clock className="w-4 h-4 mr-1" />
                                <span>{classData.time}</span>
                              </div>
                              <div className="flex items-center">
                                <User className="w-4 h-4 mr-1" />
                                <span>{instructor?.name}</span>
                              </div>
                              <div className="flex items-center">
                                <MapPin className="w-4 h-4 mr-1" />
                                <span>{equipmentData?.name}</span>
                              </div>
                              <div className="flex items-center">
                                <Users className="w-4 h-4 mr-1" />
                                <span>
                                  {spotsLeft} lugar{spotsLeft !== 1 ? "es" : ""}
                                </span>
                              </div>
                            </div>

                            {classType?.description && (
                              <p className="text-sm text-gray-500 mt-2">
                                {classType.description}
                              </p>
                            )}
                          </div>

                          <div className="text-right ml-4">
                            <div className="text-xl font-bold text-emerald-600 mb-2">
                              ${classData.price.toLocaleString()}
                            </div>
                            <Button
                              size="sm"
                              className="bg-emerald-600 hover:bg-emerald-700"
                              disabled={spotsLeft === 0}
                            >
                              {spotsLeft === 0 ? "Completo" : "Reservar"}
                            </Button>
                          </div>
                        </div>

                        {/* Lista de espera si está lleno */}
                        {spotsLeft === 0 &&
                          classData.waitingList.length > 0 && (
                            <div className="mt-3 p-2 bg-yellow-50 rounded border border-yellow-200">
                              <p className="text-xs text-yellow-800">
                                {classData.waitingList.length} persona
                                {classData.waitingList.length !== 1
                                  ? "s"
                                  : ""}{" "}
                                en lista de espera
                              </p>
                            </div>
                          )}
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialog de confirmación de reserva */}
      <Dialog open={showBookingDialog} onOpenChange={setShowBookingDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar Reserva</DialogTitle>
            <DialogDescription>
              Revisa los detalles de tu clase antes de confirmar
            </DialogDescription>
          </DialogHeader>

          {selectedClass && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-2">
                  {getClassType(selectedClass.classTypeId)?.name}
                </h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Fecha:</span>
                    <span>
                      {format(
                        new Date(selectedClass.date),
                        "EEEE, d MMMM yyyy",
                        { locale: es }
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Hora:</span>
                    <span>{selectedClass.time}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Duración:</span>
                    <span>{selectedClass.duration} minutos</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Instructora:</span>
                    <span>
                      {getInstructor(selectedClass.instructorId)?.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Equipo:</span>
                    <span>{getEquipment(selectedClass.equipmentId)?.name}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-gray-900 border-t pt-2">
                    <span>Precio:</span>
                    <span>${selectedClass.price.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    {error}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          <DialogFooter className="space-x-2">
            <Button
              variant="outline"
              onClick={() => setShowBookingDialog(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleBookClass}
              disabled={loading}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Procesando...
                </>
              ) : (
                "Confirmar Reserva"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
