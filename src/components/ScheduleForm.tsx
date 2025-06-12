import clsx from "clsx"; // Import clsx if not already imported
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Calendar } from "./ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { toast } from "./ui/sonner"; // Assuming you have toast for notifications
import { Textarea } from "./ui/textarea";

import {
  ClassType,
  createSchedule,
  getClassesTypes,
  getStudents,
  getTeachers,
  Profile,
} from "../api/schedules"; // Import the API functions and types

interface ScheduleFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void; // Callback to re-fetch schedules in parent
  // initialData?: any; // For editing existing schedules
}

const ScheduleForm: React.FC<ScheduleFormProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [classTypeId, setClassTypeId] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [studentId, setStudentId] = useState("");
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [startTime, setStartTime] = useState("");
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());
  const [endTime, setEndTime] = useState("");
  const [location, setLocation] = useState("");
  const [isGroupClass, setIsGroupClass] = useState(false);
  const [description, setDescription] = useState("");

  const [teachers, setTeachers] = useState<Profile[]>([]);
  const [students, setStudents] = useState<Profile[]>([]);
  const [classTypes, setClassTypes] = useState<ClassType[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoadingData(true);
      const [teachersData, studentsData, classesData] = await Promise.all([
        getTeachers(),
        getStudents(),
        getClassesTypes(),
      ]);
      if (teachersData) setTeachers(teachersData);
      if (studentsData) setStudents(studentsData);
      if (classesData) setClassTypes(classesData);
      setLoadingData(false);
    };

    if (isOpen) {
      fetchData();
      // Reset form on open
      setClassTypeId("");
      setTeacherId("");
      setStudentId("");
      setStartDate(new Date());
      setStartTime("");
      setEndDate(new Date());
      setEndTime("");
      setLocation("");
      setIsGroupClass(false);
      setDescription("");
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !classTypeId ||
      !teacherId ||
      !startDate ||
      !startTime ||
      !endDate ||
      !endTime ||
      !location
    ) {
      toast.error("Por favor, rellena todos los campos obligatorios.");
      return;
    }

    if (!isGroupClass && !studentId) {
      toast.error("Para clases privadas, selecciona un alumno.");
      return;
    }

    // Combine date and time
    const startDateTime = new Date(startDate);
    const [startHour, startMinute] = startTime.split(":").map(Number);
    startDateTime.setHours(startHour, startMinute);

    const endDateTime = new Date(endDate);
    const [endHour, endMinute] = endTime.split(":").map(Number);
    endDateTime.setHours(endHour, endMinute);

    if (startDateTime >= endDateTime) {
      toast.error("La hora de fin debe ser posterior a la hora de inicio.");
      return;
    }

    try {
      const newSchedule = await createSchedule({
        class_id: classTypeId,
        teacher_id: teacherId,
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
        location,
        is_group_class: isGroupClass,
        student_id: isGroupClass ? undefined : studentId,
        // For group classes, if we implement multi-select students, student_ids would go here
      });

      if (newSchedule) {
        toast.success("Clase guardada exitosamente!");
        onSave(); // Notify parent to re-fetch schedules
        onClose();
      } else {
        toast.error("Error al guardar la clase. Inténtalo de nuevo.");
      }
    } catch (err) {
      console.error("Error saving schedule:", err);
      toast.error("Ocurrió un error inesperado al guardar la clase.");
    }
  };

  if (loadingData) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Cargando datos...</DialogTitle>
          </DialogHeader>
          <div className="py-4 text-center">
            Cargando tipos de clase, profesores y alumnos...
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Añadir/Editar Clase</DialogTitle>
          <DialogDescription>
            Define los detalles de la clase o evento en el calendario.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="classType" className="text-right">
              Tipo de Clase
            </Label>
            <Select onValueChange={setClassTypeId} value={classTypeId}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Selecciona tipo de clase" />
              </SelectTrigger>
              <SelectContent>
                {classTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="teacher" className="text-right">
              Profesor
            </Label>
            <Select onValueChange={setTeacherId} value={teacherId}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Selecciona profesor" />
              </SelectTrigger>
              <SelectContent>
                {teachers.map((teacher) => (
                  <SelectItem key={teacher.id} value={teacher.id}>
                    {teacher.first_name} {teacher.last_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="isGroupClass" className="text-right">
              Clase Grupal?
            </Label>
            <input
              id="isGroupClass"
              type="checkbox"
              checked={isGroupClass}
              onChange={(e) => setIsGroupClass(e.target.checked)}
              className="col-span-3 w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
          </div>

          {!isGroupClass && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="student" className="text-right">
                Alumno
              </Label>
              <Select onValueChange={setStudentId} value={studentId}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecciona alumno" />
                </SelectTrigger>
                <SelectContent>
                  {students.map((student) => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.first_name} {student.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="startDate" className="text-right">
              Fecha Inicio
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={clsx(
                    "col-span-3 justify-start text-left font-normal",
                    !startDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? (
                    format(startDate, "PPP")
                  ) : (
                    <span>Selecciona fecha</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="startTime" className="text-right">
              Hora Inicio
            </Label>
            <Input
              id="startTime"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="endDate" className="text-right">
              Fecha Fin
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={clsx(
                    "col-span-3 justify-start text-left font-normal",
                    !endDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? (
                    format(endDate, "PPP")
                  ) : (
                    <span>Selecciona fecha</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="endTime" className="text-right">
              Hora Fin
            </Label>
            <Input
              id="endTime"
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="location" className="text-right">
              Ubicación
            </Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Descripción
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="col-span-3"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">Guardar Clase</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ScheduleForm;
