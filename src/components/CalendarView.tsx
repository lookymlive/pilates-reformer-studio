import clsx from "clsx";
import format from "date-fns/format";
import getDay from "date-fns/getDay";
import es from "date-fns/locale/es";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import { PlusCircle } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { getSchedules } from "../api/schedules";
import { supabase } from "../lib/supabase";
import ScheduleForm from "./ScheduleForm";
import { Button } from "./ui/button";

const locales = {
  es: es,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

// Custom Event Component for React Big Calendar
const CustomEvent = ({ event }: { event: any }) => {
  const isGroupClass = event.resource.isGroupClass;
  const teacherName = event.resource.teacherName;
  const studentName = event.resource.studentName;
  const classType = event.resource.classType;

  return (
    <div className="text-xs md:text-sm font-semibold p-1 overflow-hidden">
      <div className="truncate">{classType}</div>
      {teacherName && (
        <div className="text-gray-700 truncate">Profesor: {teacherName}</div>
      )}
      {!isGroupClass && studentName && (
        <div className="text-gray-700 truncate">Alumno: {studentName}</div>
      )}
      {isGroupClass && (
        <div className="text-gray-700 truncate">Clase Grupal</div>
      )}
    </div>
  );
};

const CalendarView: React.FC = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState("week"); // Default view to week
  const [date, setDate] = useState(new Date()); // Current date for navigation
  const [isFormOpen, setIsFormOpen] = useState(false);

  const fetchSchedules = useCallback(async () => {
    setLoading(true);
    setError(null);
    const data = await getSchedules();
    if (data) {
      // Map Supabase data to react-big-calendar event format
      const mappedEvents = data.map((schedule: any) => ({
        title:
          `${schedule.classes.name} - ${schedule.teacher.first_name} ${schedule.teacher.last_name}` +
          (schedule.is_group_class
            ? ` (Grupo)`
            : schedule.student_classes.length > 0
            ? ` (${schedule.student_classes[0].student.first_name} ${schedule.student_classes[0].student.last_name})`
            : ""),
        start: new Date(schedule.start_time),
        end: new Date(schedule.end_time),
        allDay: false, // Assuming classes have specific times
        resource: {
          scheduleId: schedule.id,
          classType: schedule.classes.name,
          teacherName: `${schedule.teacher.first_name} ${schedule.teacher.last_name}`,
          studentName: schedule.is_group_class
            ? null
            : schedule.student_classes.length > 0
            ? `${schedule.student_classes[0].student.first_name} ${schedule.student_classes[0].student.last_name}`
            : null,
          location: schedule.location,
          isGroupClass: schedule.is_group_class,
        },
      }));
      setEvents(mappedEvents);
    } else {
      setError("No se pudieron cargar los horarios.");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchSchedules();

    // Setup Realtime subscription
    const schedulesChannel = supabase
      .channel("public:schedules")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "schedules" },
        (payload) => {
          console.log("Change received!", payload);
          fetchSchedules(); // Re-fetch schedules on any change
        }
      )
      .subscribe();

    const studentClassesChannel = supabase
      .channel("public:student_classes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "student_classes" },
        (payload) => {
          console.log("Change received on student_classes!", payload);
          fetchSchedules(); // Re-fetch schedules on any change to student assignments
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(schedulesChannel);
      supabase.removeChannel(studentClassesChannel);
    };
  }, [fetchSchedules]);

  // Function to determine event styling based on properties
  const eventPropGetter = (event: any) => {
    const isGroupClass = event.resource.isGroupClass;
    const teacherName = event.resource.teacherName;

    // Example: Different colors for group vs. private classes
    let backgroundColor = "bg-blue-500"; // Default for private
    if (isGroupClass) {
      backgroundColor = "bg-green-500"; // Green for group classes
    }

    // You could also add colors based on teacherName, classType, etc.

    return {
      className: clsx(
        "text-white rounded-md opacity-90 hover:opacity-100",
        backgroundColor
        // Add more Tailwind classes for padding, margin if needed
      ),
      style: {},
    };
  };

  const handleViewChange = (newView: any) => {
    setView(newView);
  };

  const handleNavigate = (newDate: Date) => {
    setDate(newDate);
  };

  const handleOpenForm = () => {
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    // fetchSchedules() is called by Realtime, so no need to call here directly
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
        <p className="ml-4">Cargando calendario...</p>
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-500 p-8">Error: {error}</div>;
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Calendario de Clases y Horarios</h1>
        <Button onClick={handleOpenForm} disabled={loading}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Añadir Clase
        </Button>
      </div>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 700 }}
        messages={{
          next: "Siguiente",
          previous: "Anterior",
          today: "Hoy",
          month: "Mes",
          week: "Semana",
          day: "Día",
          agenda: "Agenda",
          date: "Fecha",
          time: "Hora",
          event: "Evento",
          noEventsInRange: "No hay eventos en este rango.",
        }}
        eventPropGetter={eventPropGetter}
        components={{
          event: CustomEvent,
        }}
        view={view}
        onView={handleViewChange}
        date={date}
        onNavigate={handleNavigate}
      />
      <ScheduleForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSave={fetchSchedules}
      />
    </div>
  );
};

export default CalendarView;
