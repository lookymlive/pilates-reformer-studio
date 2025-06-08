import React, { useEffect, useState } from "react";
import { adminConfig, mockClassTypes } from "../../data/mockData";
import {
  getStudioSettings,
  updateStudioSettings,
} from "../../services/settingsService";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import {
  Toast,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "../ui/toast";
import AdminTurnos from "./AdminTurnos";

const weekDays = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
];

const ConfigManagement: React.FC = () => {
  // Estados locales para edición y carga
  const [openDays, setOpenDays] = useState<string[]>([]);
  const [slots, setSlots] = useState<{ start: string; end: string }[]>([]);
  const [beds, setBeds] = useState<number>(6);
  const [holidays, setHolidays] = useState<string>("");
  const [settingsId, setSettingsId] = useState<string>("");
  const [editing, setEditing] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [loading, setLoading] = useState(true);

  // Cargar settings reales desde Supabase
  useEffect(() => {
    getStudioSettings()
      .then((data) => {
        setOpenDays(data.open_days || []);
        setSlots(data.slots || []);
        setBeds(data.beds || 6);
        setHolidays((data.holidays || []).join(", "));
        setSettingsId(data.id);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Handlers para edición
  const handleSlotChange = (
    idx: number,
    field: "start" | "end",
    value: string
  ) => {
    setSlots(
      slots.map((slot, i) => (i === idx ? { ...slot, [field]: value } : slot))
    );
    setEditing(true);
  };
  const handleBedsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBeds(Number(e.target.value));
    setEditing(true);
  };
  const handleHolidaysChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHolidays(e.target.value);
    setEditing(true);
  };
  const handleOpenDaysChange = (day: string) => {
    setOpenDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
    setEditing(true);
  };
  const handleAddSlot = () => {
    setSlots([...slots, { start: "08:00", end: "09:00" }]);
    setEditing(true);
  };
  const handleRemoveSlot = (idx: number) => {
    setSlots(slots.filter((_, i) => i !== idx));
    setEditing(true);
  };
  const handleSave = async () => {
    setEditing(false);
    setShowToast(true);
    try {
      await updateStudioSettings({
        id: settingsId,
        open_days: openDays,
        slots,
        beds,
        holidays: holidays
          .split(",")
          .map((h) => h.trim())
          .filter(Boolean),
      });
    } catch (e) {
      // Aquí podrías mostrar un toast de error
    }
    setTimeout(() => setShowToast(false), 3000);
  };

  if (loading) return <div className="p-6">Cargando configuración...</div>;

  return (
    <ToastProvider>
      <div className="space-y-6 p-4">
        <h1 className="text-2xl font-bold mb-2">Configuración del Estudio</h1>
        {/* Menú de secciones */}
        <div className="flex flex-wrap gap-2">
          {adminConfig.sections.map((section) => (
            <Button
              key={section.name}
              variant="outline"
              className="mb-2"
              disabled={!section.enabled}
            >
              {section.name}
            </Button>
          ))}
        </div>

        {/* Horarios y Disponibilidad */}
        <Card>
          <CardHeader>
            <CardTitle>Horarios y Disponibilidad</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-2">
              <strong>Días de apertura:</strong>
              <div className="flex gap-2 mt-1 flex-wrap">
                {weekDays.map((day) => (
                  <Button
                    key={day}
                    variant={openDays.includes(day) ? "default" : "outline"}
                    onClick={() => handleOpenDaysChange(day)}
                    className={
                      openDays.includes(day) ? "bg-blue-600 text-white" : ""
                    }
                  >
                    {day}
                  </Button>
                ))}
              </div>
            </div>
            <div className="mb-2">
              <strong>Turnos:</strong>
              <ul className="list-disc ml-6">
                {slots.map((slot, idx) => (
                  <li key={idx} className="flex items-center gap-2 mb-1">
                    <Input
                      type="time"
                      value={slot.start}
                      onChange={(e) =>
                        handleSlotChange(idx, "start", e.target.value)
                      }
                      className="w-24"
                    />
                    a
                    <Input
                      type="time"
                      value={slot.end}
                      onChange={(e) =>
                        handleSlotChange(idx, "end", e.target.value)
                      }
                      className="w-24"
                    />
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleRemoveSlot(idx)}
                    >
                      -
                    </Button>
                  </li>
                ))}
              </ul>
              <Button size="sm" onClick={handleAddSlot} className="mt-2">
                + Agregar turno
              </Button>
            </div>
            <div className="mb-2 flex items-center gap-2">
              <strong>Camas disponibles:</strong>
              <Input
                type="number"
                min={1}
                max={20}
                value={beds}
                onChange={handleBedsChange}
                className="w-20"
              />
            </div>
            <div className="mb-2 flex items-center gap-2">
              <strong>Feriados:</strong>
              <Input
                type="text"
                value={holidays}
                onChange={handleHolidaysChange}
                className="w-96"
              />
              <span className="text-xs text-gray-500">Separar por coma</span>
            </div>
            <Button onClick={handleSave} disabled={!editing} className="mt-2">
              Guardar cambios
            </Button>
          </CardContent>
        </Card>

        {/* Tipos de Clase */}
        <Card>
          <CardHeader>
            <CardTitle>Tipos de Clase</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc ml-6">
              {mockClassTypes.map((type) => (
                <li key={type.id}>
                  <strong>{type.name}</strong> - {type.description} (Máx:{" "}
                  {type.maxParticipants} personas)
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Gestión de Turnos de Pilates */}
        <Card>
          <CardHeader>
            <CardTitle>Gestión de Turnos de Pilates</CardTitle>
          </CardHeader>
          <CardContent>
            <AdminTurnos />
          </CardContent>
        </Card>

        {/* Toast de guardado */}
        {showToast && (
          <Toast>
            <ToastTitle>Configuración guardada</ToastTitle>
            <ToastDescription>
              Los cambios se han guardado correctamente.
            </ToastDescription>
          </Toast>
        )}
        <ToastViewport />
      </div>
    </ToastProvider>
  );
};

export default ConfigManagement;
