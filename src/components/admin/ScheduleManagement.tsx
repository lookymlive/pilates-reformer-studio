import { addDays, format, startOfWeek } from "date-fns";
import { es } from "date-fns/locale";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  CalendarPlus,
  CheckCircle,
  Clock,
  Copy,
  Edit,
  MapPin,
  MoreHorizontal,
  Trash2,
  User,
  Users,
} from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import {
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

export const ScheduleManagement: React.FC = () => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [classTypes, setClassTypes] = useState<ClassType[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [filteredClasses, setFilteredClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");

  // Form states
  const [formData, setFormData] = useState({
    classTypeId: "",
    instructorId: "",
    date: "",
    time: "",
    duration: 55,
    equipmentId: "",
    maxParticipants: 1,
    price: 0,
    notes: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const filterClassesByDate = useCallback(() => {
    const dateString = selectedDate.toISOString().split("T")[0];
    const dayClasses = classes.filter((cls) => cls.date === dateString);
    // Ordenar por hora
    dayClasses.sort((a, b) => a.time.localeCompare(b.time));
    setFilteredClasses(dayClasses);
  }, [classes, selectedDate]);

  useEffect(() => {
    filterClassesByDate();
  }, [classes, selectedDate, filterClassesByDate]);

  const loadData = () => {
    setLoading(true);
    try {
      setClasses(classService.getAll());
      setClassTypes(classTypeService.getAll());
      setEquipment(equipmentService.getAll());
      setInstructors(userService.getByRole("instructor") as Instructor[]);
    } catch (err) {
      setError("Error al cargar los datos");
    } finally {
      setLoading(false);
    }
  };

  // ...existing code...

  const resetForm = () => {
    setFormData({
      classTypeId: "",
      instructorId: "",
      date: selectedDate.toISOString().split("T")[0],
      time: "",
      duration: 55,
      equipmentId: "",
      maxParticipants: 1,
      price: 0,
      notes: "",
    });
  };

  const handleCreateClass = () => {
    setSelectedClass(null);
    resetForm();
    setShowCreateDialog(true);
    setError("");
  };

  const handleEditClass = (classData: Class) => {
    setSelectedClass(classData);
    setFormData({
      classTypeId: classData.classTypeId,
      instructorId: classData.instructorId,
      date: classData.date,
      time: classData.time,
      duration: classData.duration,
      equipmentId: classData.equipmentId,
      maxParticipants: classData.maxParticipants,
      price: classData.price,
      notes: classData.notes || "",
    });
    setShowEditDialog(true);
    setError("");
  };

  const handleDeleteClass = (classData: Class) => {
    setSelectedClass(classData);
    setShowDeleteDialog(true);
  };

  const handleDuplicateClass = (classData: Class) => {
    setSelectedClass(null);
    setFormData({
      classTypeId: classData.classTypeId,
      instructorId: classData.instructorId,
      date: selectedDate.toISOString().split("T")[0],
      time: classData.time,
      duration: classData.duration,
      equipmentId: classData.equipmentId,
      maxParticipants: classData.maxParticipants,
      price: classData.price,
      notes: classData.notes || "",
    });
    setShowCreateDialog(true);
    setError("");
  };

  const validateForm = (): boolean => {
    if (!formData.classTypeId) {
      setError("Selecciona un tipo de clase");
      return false;
    }
    if (!formData.instructorId) {
      setError("Selecciona una instructora");
      return false;
    }
    if (!formData.date) {
      setError("Selecciona una fecha");
      return false;
    }
    if (!formData.time) {
      setError("Ingresa la hora");
      return false;
    }
    if (!formData.equipmentId) {
      setError("Selecciona un equipo");
      return false;
    }
    if (formData.price <= 0) {
      setError("El precio debe ser mayor a 0");
      return false;
    }

    // Validar conflictos de horario
    const classDateTime = new Date(`${formData.date}T${formData.time}`);
    const endTime = new Date(
      classDateTime.getTime() + formData.duration * 60000
    );

    const conflicts = classes.filter((cls) => {
      if (selectedClass && cls.id === selectedClass.id) return false; // Ignore self when editing
      if (cls.date !== formData.date) return false;
      if (
        cls.equipmentId !== formData.equipmentId &&
        cls.instructorId !== formData.instructorId
      )
        return false;

      const existingStart = new Date(`${cls.date}T${cls.time}`);
      const existingEnd = new Date(
        existingStart.getTime() + cls.duration * 60000
      );

      // Check for time overlap
      return classDateTime < existingEnd && endTime > existingStart;
    });

    if (conflicts.length > 0) {
      const conflictType =
        conflicts[0].equipmentId === formData.equipmentId
          ? "equipo"
          : "instructora";
      setError(
        `Conflicto de horario: el ${conflictType} ya está ocupado en ese horario`
      );
      return false;
    }

    return true;
  };

  const saveClass = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setError("");

    try {
      const classData = {
        ...formData,
        currentParticipants: selectedClass?.currentParticipants || [],
        waitingList: selectedClass?.waitingList || [],
        status: selectedClass?.status || ("programada" as const),
      };

      if (selectedClass) {
        // Update existing class
        const updated = classService.update(selectedClass.id, classData);
        if (updated) {
          setSuccessMessage("Clase actualizada correctamente");
          setShowEditDialog(false);
        } else {
          setError("Error al actualizar la clase");
        }
      } else {
        // Create new class
        const created = classService.create(classData);
        if (created) {
          setSuccessMessage("Clase creada correctamente");
          setShowCreateDialog(false);
        } else {
          setError("Error al crear la clase");
        }
      }

      loadData();
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setError("Error al guardar la clase");
    } finally {
      setLoading(false);
    }
  };

  const confirmDeleteClass = async () => {
    if (!selectedClass) return;

    setLoading(true);
    try {
      const deleted = classService.delete(selectedClass.id);
      if (deleted) {
        setSuccessMessage("Clase eliminada correctamente");
        setShowDeleteDialog(false);
        loadData();
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        setError("Error al eliminar la clase");
      }
    } catch (err) {
      setError("Error al eliminar la clase");
    } finally {
      setLoading(false);
    }
  };

  const getClassType = useCallback(
    (id: string) => classTypes.find((ct) => ct.id === id),
    [classTypes]
  );
  const getEquipment = (id: string) => equipment.find((eq) => eq.id === id);
  const getInstructor = (id: string) =>
    instructors.find((inst) => inst.id === id);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "programada":
        return <Badge className="bg-blue-100 text-blue-800">Programada</Badge>;
      case "en_progreso":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">En Progreso</Badge>
        );
      case "completada":
        return (
          <Badge className="bg-green-100 text-green-800">Completada</Badge>
        );
      case "cancelada":
        return <Badge className="bg-red-100 text-red-800">Cancelada</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getWeekDates = () => {
    const start = startOfWeek(selectedDate, { weekStartsOn: 1 });
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  };

  const getClassesForDate = (date: Date) => {
    const dateString = date.toISOString().split("T")[0];
    return classes.filter((cls) => cls.date === dateString);
  };

  // Update price when class type changes
  useEffect(() => {
    if (formData.classTypeId) {
      const classType = getClassType(formData.classTypeId);
      if (classType && formData.price === 0) {
        setFormData((prev) => ({ ...prev, price: classType.price }));
      }
    }
  }, [formData.classTypeId, getClassType, formData.price]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Gestión de Horarios
          </h1>
          <p className="text-gray-600">
            Administra las clases y horarios del estudio
          </p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant={viewMode === "calendar" ? "default" : "outline"}
            onClick={() => setViewMode("calendar")}
            size="sm"
          >
            Vista Calendario
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            onClick={() => setViewMode("list")}
            size="sm"
          >
            Vista Lista
          </Button>
          <Button
            onClick={handleCreateClass}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            <CalendarPlus className="mr-2 h-4 w-4" />
            Nueva Clase
          </Button>
        </div>
      </div>

      {/* Mensaje de éxito/error */}
      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                {successMessage}
              </AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Calendar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Seleccionar Fecha</CardTitle>
              <CardDescription>
                Elige el día para ver o programar clases
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                locale={es}
                className="rounded-md border"
                modifiers={{
                  hasClasses: (date) => getClassesForDate(date).length > 0,
                }}
                modifiersStyles={{
                  hasClasses: {
                    backgroundColor: "#dcfce7",
                    color: "#16a34a",
                    fontWeight: "bold",
                  },
                }}
              />
            </CardContent>
          </Card>
        </div>

        {/* Classes for selected date */}
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
                    {filteredClasses.length} clase
                    {filteredClasses.length !== 1 ? "s" : ""} programada
                    {filteredClasses.length !== 1 ? "s" : ""}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
                  <p className="text-gray-600 mt-2">Cargando clases...</p>
                </div>
              ) : filteredClasses.length === 0 ? (
                <div className="text-center py-8">
                  <CalendarPlus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">
                    No hay clases programadas para este día
                  </p>
                  <Button
                    onClick={handleCreateClass}
                    className="mt-4 bg-emerald-600 hover:bg-emerald-700"
                  >
                    <CalendarPlus className="mr-2 h-4 w-4" />
                    Programar Primera Clase
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredClasses.map((classData) => {
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
                        className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h3 className="font-semibold text-lg text-gray-900">
                                {classType?.name}
                              </h3>
                              {getStatusBadge(classData.status)}
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

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-gray-600 mb-2">
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
                                  {classData.currentParticipants.length}/
                                  {classData.maxParticipants}
                                </span>
                              </div>
                            </div>

                            <div className="text-lg font-bold text-emerald-600">
                              ${classData.price.toLocaleString()}
                            </div>

                            {classData.notes && (
                              <p className="text-sm text-gray-500 mt-2">
                                {classData.notes}
                              </p>
                            )}
                          </div>

                          <div className="ml-4">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                <DropdownMenuItem
                                  onClick={() => handleEditClass(classData)}
                                >
                                  <Edit className="mr-2 h-4 w-4" />
                                  Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleDuplicateClass(classData)
                                  }
                                >
                                  <Copy className="mr-2 h-4 w-4" />
                                  Duplicar
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => handleDeleteClass(classData)}
                                  className="text-red-600"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Eliminar
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>

                        {/* Participants and waiting list */}
                        {(classData.currentParticipants.length > 0 ||
                          classData.waitingList.length > 0) && (
                          <div className="mt-3 pt-3 border-t">
                            {classData.currentParticipants.length > 0 && (
                              <div className="text-xs text-gray-600">
                                <strong>Participantes:</strong>{" "}
                                {classData.currentParticipants.length}
                              </div>
                            )}
                            {classData.waitingList.length > 0 && (
                              <div className="text-xs text-yellow-600">
                                <strong>Lista de espera:</strong>{" "}
                                {classData.waitingList.length}
                              </div>
                            )}
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

      {/* Dialog para crear/editar clase */}
      <Dialog
        open={showCreateDialog || showEditDialog}
        onOpenChange={(open) => {
          if (!open) {
            setShowCreateDialog(false);
            setShowEditDialog(false);
            setError("");
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedClass ? "Editar Clase" : "Crear Nueva Clase"}
            </DialogTitle>
            <DialogDescription>
              {selectedClass
                ? "Modifica los detalles de la clase"
                : "Completa la información para programar una nueva clase"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="classType">Tipo de Clase *</Label>
              <Select
                value={formData.classTypeId}
                onValueChange={(value) =>
                  setFormData({ ...formData, classTypeId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un tipo de clase" />
                </SelectTrigger>
                <SelectContent>
                  {classTypes.map((classType) => (
                    <SelectItem key={classType.id} value={classType.id}>
                      {classType.name} - ${classType.price.toLocaleString()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="instructor">Instructora *</Label>
              <Select
                value={formData.instructorId}
                onValueChange={(value) =>
                  setFormData({ ...formData, instructorId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una instructora" />
                </SelectTrigger>
                <SelectContent>
                  {instructors.map((instructor) => (
                    <SelectItem key={instructor.id} value={instructor.id}>
                      {instructor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date">Fecha *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="time">Hora *</Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) =>
                    setFormData({ ...formData, time: e.target.value })
                  }
                />
              </div>
            </div>

            <div>
              <Label htmlFor="equipment">Equipo *</Label>
              <Select
                value={formData.equipmentId}
                onValueChange={(value) =>
                  setFormData({ ...formData, equipmentId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un equipo" />
                </SelectTrigger>
                <SelectContent>
                  {equipment
                    .filter((eq) => eq.status === "disponible")
                    .map((eq) => (
                      <SelectItem key={eq.id} value={eq.id}>
                        {eq.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="duration">Duración (min)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={formData.duration}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      duration: parseInt(e.target.value) || 55,
                    })
                  }
                  min="15"
                  max="120"
                />
              </div>
              <div>
                <Label htmlFor="maxParticipants">Cupos</Label>
                <Input
                  id="maxParticipants"
                  type="number"
                  value={formData.maxParticipants}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      maxParticipants: parseInt(e.target.value) || 1,
                    })
                  }
                  min="1"
                  max="6"
                />
              </div>
              <div>
                <Label htmlFor="price">Precio</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      price: parseInt(e.target.value) || 0,
                    })
                  }
                  min="0"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Notas (opcional)</Label>
              <Input
                id="notes"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                placeholder="Notas adicionales sobre la clase..."
              />
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

          <DialogFooter className="space-x-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateDialog(false);
                setShowEditDialog(false);
                setError("");
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={saveClass}
              disabled={loading}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {loading
                ? "Guardando..."
                : selectedClass
                ? "Actualizar"
                : "Crear Clase"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmación de eliminación */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar Eliminación</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que quieres eliminar esta clase? Esta acción no
              se puede deshacer.
            </DialogDescription>
          </DialogHeader>

          {selectedClass && (
            <div className="bg-gray-50 p-3 rounded">
              <div className="space-y-1">
                <p className="font-medium">
                  {getClassType(selectedClass.classTypeId)?.name}
                </p>
                <p className="text-sm text-gray-600">
                  {format(new Date(selectedClass.date), "EEEE, d MMMM yyyy", {
                    locale: es,
                  })}{" "}
                  a las {selectedClass.time}
                </p>
                <p className="text-sm text-gray-600">
                  Instructora: {getInstructor(selectedClass.instructorId)?.name}
                </p>
                {selectedClass.currentParticipants.length > 0 && (
                  <p className="text-sm text-red-600">
                    ⚠️ Esta clase tiene{" "}
                    {selectedClass.currentParticipants.length} participante
                    {selectedClass.currentParticipants.length !== 1 ? "s" : ""}{" "}
                    inscrito
                    {selectedClass.currentParticipants.length !== 1 ? "s" : ""}
                  </p>
                )}
              </div>
            </div>
          )}

          <DialogFooter className="space-x-2">
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDeleteClass}
              disabled={loading}
            >
              {loading ? "Eliminando..." : "Eliminar Clase"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
