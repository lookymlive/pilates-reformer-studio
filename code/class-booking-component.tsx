// =============================================================================
// COMPONENTE DE EJEMPLO: RESERVA DE CLASES
// Implementación completa siguiendo las mejores prácticas de la guía
// =============================================================================

// packages/ui/src/components/ClassBooking/ClassBookingCard.tsx
import {
  CalendarIcon,
  CheckIcon,
  ClockIcon,
  MapPinIcon,
  UserIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { cloudinaryPresets } from "@pilates/shared/lib/cloudinary";
import type {
  BookingStatus,
  ScheduledClassWithDetails,
} from "@pilates/shared/types";
import { cn } from "@pilates/shared/utils/cn";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import React, { useState } from "react";

interface ClassBookingCardProps {
  scheduledClass: ScheduledClassWithDetails;
  userBooking?: {
    id: string;
    status: BookingStatus;
  } | null;
  onBook: (classId: string) => Promise<void>;
  onCancel: (bookingId: string) => Promise<void>;
  isLoading?: boolean;
  className?: string;
}

export function ClassBookingCard({
  scheduledClass,
  userBooking,
  onBook,
  onCancel,
  isLoading = false,
  className,
}: ClassBookingCardProps) {
  const [localLoading, setLocalLoading] = useState(false);

  const {
    id,
    start_time,
    end_time,
    current_participants,
    max_participants,
    price,
    class_type,
    instructor,
    equipment,
    status,
  } = scheduledClass;

  const isFullyBooked = current_participants >= max_participants;
  const hasUserBooking = !!userBooking;
  const canBook = !hasUserBooking && !isFullyBooked && status === "programada";
  const canCancel = hasUserBooking && userBooking.status === "confirmada";

  const handleBooking = async () => {
    if (isLoading || localLoading) return;

    setLocalLoading(true);
    try {
      if (canCancel && userBooking) {
        await onCancel(userBooking.id);
      } else if (canBook) {
        await onBook(id);
      }
    } catch (error) {
      console.error("Error en reserva:", error);
    } finally {
      setLocalLoading(false);
    }
  };

  const getStatusColor = () => {
    if (hasUserBooking) {
      switch (userBooking.status) {
        case "confirmada":
          return "bg-green-100 text-green-800 border-green-200";
        case "en_espera":
          return "bg-yellow-100 text-yellow-800 border-yellow-200";
        case "cancelada":
          return "bg-red-100 text-red-800 border-red-200";
        default:
          return "bg-gray-100 text-gray-800 border-gray-200";
      }
    }

    if (isFullyBooked) {
      return "bg-red-100 text-red-800 border-red-200";
    }

    return "bg-green-100 text-green-800 border-green-200";
  };

  const getStatusText = () => {
    if (hasUserBooking) {
      switch (userBooking.status) {
        case "confirmada":
          return "Reservado";
        case "en_espera":
          return "En lista de espera";
        case "cancelada":
          return "Cancelado";
        default:
          return "Estado desconocido";
      }
    }

    if (isFullyBooked) {
      return "Completo";
    }

    return "Disponible";
  };

  const getButtonText = () => {
    if (localLoading || isLoading) return "Procesando...";
    if (canCancel) return "Cancelar Reserva";
    if (canBook) return "Reservar";
    if (isFullyBooked) return "Lista de Espera";
    return "No disponible";
  };

  const getButtonIcon = () => {
    if (localLoading || isLoading) {
      return (
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
      );
    }
    if (canCancel) return <XMarkIcon className="h-4 w-4" />;
    return <CheckIcon className="h-4 w-4" />;
  };

  return (
    <div
      className={cn(
        "bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-200",
        className
      )}
    >
      {/* Header con tipo de clase y estado */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {class_type.name}
          </h3>
          <p className="text-sm text-gray-600 line-clamp-2">
            {class_type.description}
          </p>
        </div>
        <span
          className={cn(
            "px-3 py-1 rounded-full text-xs font-medium border",
            getStatusColor()
          )}
        >
          {getStatusText()}
        </span>
      </div>

      {/* Información de fecha y hora */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center text-sm text-gray-600">
          <CalendarIcon className="h-4 w-4 mr-2 text-gray-400" />
          {format(new Date(start_time), "EEEE dd/MM", { locale: es })}
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <ClockIcon className="h-4 w-4 mr-2 text-gray-400" />
          {format(new Date(start_time), "HH:mm")} -{" "}
          {format(new Date(end_time), "HH:mm")}
        </div>
      </div>

      {/* Información del instructor */}
      <div className="flex items-center mb-4">
        {instructor.profile.avatar_url ? (
          <img
            src={cloudinaryPresets.avatar(instructor.profile.avatar_url)}
            alt={`${instructor.profile.first_name} ${instructor.profile.last_name}`}
            className="h-8 w-8 rounded-full object-cover mr-3"
          />
        ) : (
          <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center mr-3">
            <UserIcon className="h-4 w-4 text-gray-600" />
          </div>
        )}
        <div>
          <p className="text-sm font-medium text-gray-900">
            {instructor.profile.first_name} {instructor.profile.last_name}
          </p>
          <p className="text-xs text-gray-500">Instructor</p>
        </div>
      </div>

      {/* Información del equipo */}
      {equipment && (
        <div className="flex items-center mb-4">
          <MapPinIcon className="h-4 w-4 mr-2 text-gray-400" />
          <span className="text-sm text-gray-600">
            {equipment.name} - {equipment.location}
          </span>
        </div>
      )}

      {/* Footer con capacidad, precio y botón */}
      <div className="flex justify-between items-center pt-4 border-t border-gray-100">
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-600">
            <span className="font-medium">{current_participants}</span>
            <span className="text-gray-400">/{max_participants}</span>
            <span className="ml-1">participantes</span>
          </div>
          <div className="text-lg font-bold text-green-600">
            ${price.toLocaleString("es-AR")}
          </div>
        </div>

        <button
          onClick={handleBooking}
          disabled={isLoading || localLoading || (!canBook && !canCancel)}
          className={cn(
            "flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200",
            {
              // Botón para reservar
              "bg-blue-600 hover:bg-blue-700 text-white": canBook,
              // Botón para cancelar
              "bg-red-600 hover:bg-red-700 text-white": canCancel,
              // Botón deshabilitado
              "bg-gray-300 text-gray-500 cursor-not-allowed":
                (!canBook && !canCancel) || isLoading || localLoading,
              // Estado de carga
              "opacity-50 cursor-not-allowed": isLoading || localLoading,
            }
          )}
        >
          {getButtonIcon()}
          <span>{getButtonText()}</span>
        </button>
      </div>
    </div>
  );
}

// =============================================================================
// HOOK PERSONALIZADO PARA GESTIÓN DE RESERVAS
// =============================================================================

// packages/shared/src/hooks/useClassBooking.ts
import { useAuth } from "@pilates/shared/hooks/useAuth";
import { BookingService } from "@pilates/shared/services/booking-service";
import type { CreateBookingInput } from "@pilates/shared/types";
import { toast } from "react-hot-toast";
import { useMutation, useQueryClient } from "react-query";

interface UseClassBookingOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function useClassBooking(options: UseClassBookingOptions = {}) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isBooking, setIsBooking] = useState(false);

  const bookClassMutation = useMutation({
    mutationFn: async (classId: string) => {
      if (!user) throw new Error("Usuario no autenticado");

      const bookingData: CreateBookingInput = {
        scheduled_class_id: classId,
        user_id: user.id,
        amount_paid: 0, // Se calculará en el backend
        payment_method: "efectivo", // Default, se puede cambiar después
      };

      return BookingService.createBooking(bookingData);
    },
    onSuccess: (data) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries(["scheduled-classes"]);
      queryClient.invalidateQueries(["user-bookings"]);

      toast.success("¡Clase reservada exitosamente!");
      options.onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al reservar la clase");
      options.onError?.(error);
    },
  });

  const cancelBookingMutation = useMutation({
    mutationFn: async (bookingId: string) => {
      return BookingService.cancelBooking(
        bookingId,
        "Cancelado por el usuario"
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["scheduled-classes"]);
      queryClient.invalidateQueries(["user-bookings"]);

      toast.success("Reserva cancelada exitosamente");
      options.onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Error al cancelar la reserva");
      options.onError?.(error);
    },
  });

  const bookClass = async (classId: string) => {
    setIsBooking(true);
    try {
      await bookClassMutation.mutateAsync(classId);
    } finally {
      setIsBooking(false);
    }
  };

  const cancelBooking = async (bookingId: string) => {
    setIsBooking(true);
    try {
      await cancelBookingMutation.mutateAsync(bookingId);
    } finally {
      setIsBooking(false);
    }
  };

  return {
    bookClass,
    cancelBooking,
    isBooking:
      isBooking ||
      bookClassMutation.isLoading ||
      cancelBookingMutation.isLoading,
    isError: bookClassMutation.isError || cancelBookingMutation.isError,
    error: bookClassMutation.error || cancelBookingMutation.error,
  };
}

// =============================================================================
// PÁGINA DE EJEMPLO USANDO EL COMPONENTE
// =============================================================================

import { useClassBooking } from "@pilates/shared/hooks/useClassBooking";
import { ClassService } from "@pilates/shared/services/class-service";
import { ClassBookingCard } from "@pilates/ui/components/ClassBooking/ClassBookingCard";
import { addDays, startOfDay } from "date-fns";
import { useQuery } from "react-query";

export default function ClassesPage() {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { bookClass, cancelBooking, isBooking } = useClassBooking();

  // Query para obtener clases del día seleccionado
  const { data: scheduledClasses, isLoading: isLoadingClasses } = useQuery({
    queryKey: ["scheduled-classes", selectedDate],
    queryFn: () =>
      ClassService.getScheduledClasses({
        startDate: startOfDay(selectedDate),
        endDate: startOfDay(addDays(selectedDate, 1)),
        status: "programada",
      }),
    enabled: !!user,
  });

  // Query para obtener reservas del usuario
  const { data: userBookings } = useQuery({
    queryKey: ["user-bookings", user?.id],
    queryFn: () => BookingService.getUserBookings(user!.id),
    enabled: !!user,
  });

  // Crear mapa de reservas por clase
  const bookingsByClass = React.useMemo(() => {
    if (!userBookings) return {};
    return userBookings.reduce((acc, booking) => {
      acc[booking.scheduled_class_id] = booking;
      return acc;
    }, {} as Record<string, any>);
  }, [userBookings]);

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
  };

  const generateDateOptions = () => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      dates.push(addDays(new Date(), i));
    }
    return dates;
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Inicia sesión para ver las clases disponibles
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Clases Disponibles
        </h1>

        {/* Selector de fecha */}
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {generateDateOptions().map((date) => (
            <button
              key={date.toISOString()}
              onClick={() => handleDateChange(date)}
              className={`flex-shrink-0 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                format(date, "yyyy-MM-dd") ===
                format(selectedDate, "yyyy-MM-dd")
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <div className="text-center">
                <div className="font-semibold">
                  {format(date, "EEE", { locale: es })}
                </div>
                <div className="text-xs">{format(date, "dd/MM")}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Lista de clases */}
      {isLoadingClasses ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="bg-gray-200 animate-pulse rounded-lg h-64"
            />
          ))}
        </div>
      ) : scheduledClasses && scheduledClasses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {scheduledClasses.map((scheduledClass) => (
            <ClassBookingCard
              key={scheduledClass.id}
              scheduledClass={scheduledClass}
              userBooking={bookingsByClass[scheduledClass.id]}
              onBook={bookClass}
              onCancel={cancelBooking}
              isLoading={isBooking}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No hay clases programadas para este día
          </h3>
          <p className="text-gray-600">
            Selecciona otra fecha o contacta al estudio para más información.
          </p>
        </div>
      )}
    </div>
  );
}
