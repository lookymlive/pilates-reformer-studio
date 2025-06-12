import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import {
  getTurnos,
  seedTurnosIfNeeded,
  updateTurno,
} from "@/services/turnosService";
import { useEffect, useState } from "react";

const diasSemana = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];
const horasManana = ["08:00", "09:00", "10:00", "11:00"];
const horasTarde = [
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
  "20:00",
];
const MAX_CAMAS = 6;

export default function AdminTurnos() {
  const { user } = useAuth();
  const [turnos, setTurnos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<{ [id: number]: boolean }>({});

  useEffect(() => {
    if (!user || user.role !== "admin") return;
    seedTurnosIfNeeded().then(() => {
      getTurnos()
        .then(setTurnos)
        .finally(() => setLoading(false));
    });
  }, [user]);

  const handleCamasChange = async (id: number, camas: any[]) => {
    setSaving((prev) => ({ ...prev, [id]: true }));
    await updateTurno(id, camas);
    setTurnos((prev) => prev.map((t) => (t.id === id ? { ...t, camas } : t)));
    setSaving((prev) => ({ ...prev, [id]: false }));
  };

  const renderResumen = () => {
    const resumen = diasSemana.map((dia) => {
      const turnosDia = turnos.filter((t) => t.dia === dia);
      const totalCamas = turnosDia.length * MAX_CAMAS;
      const ocupadas = turnosDia.reduce(
        (acc, turno) => acc + turno.camas.filter((c: any) => c.alumno).length,
        0
      );
      const porcentaje =
        totalCamas > 0 ? ((ocupadas / totalCamas) * 100).toFixed(2) : "0.00";
      return { dia, porcentaje, ocupadas, totalCamas };
    });

    return (
      <div className="mb-4">
        <h2 className="text-lg font-bold">Resumen de Ocupación</h2>
        <ul className="list-disc ml-6">
          {resumen.map(({ dia, porcentaje, ocupadas, totalCamas }) => (
            <li key={dia}>
              <strong>{dia}:</strong> {ocupadas}/{totalCamas} camas ocupadas (
              {porcentaje}%)
            </li>
          ))}
        </ul>
      </div>
    );
  };

  const renderTabla = (horas: string[]) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Hora</TableHead>
          {diasSemana.map((dia) => (
            <TableHead key={dia}>{dia}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {horas.map((hora) => (
          <TableRow key={hora}>
            <TableCell>{hora}</TableCell>
            {diasSemana.map((dia) => {
              const turno = turnos.find(
                (t) => t.dia === dia && t.hora_inicio === hora
              );
              const camas =
                turno?.camas ||
                Array(MAX_CAMAS).fill({ alumno: "", asistencia: false });
              return (
                <TableCell key={dia + hora}>
                  <div className="space-y-1">
                    {camas.map((cama: any, idx: number) => (
                      <div key={idx} className="flex items-center gap-2 mb-1">
                        <input
                          type="text"
                          className="border rounded px-1 py-0.5 text-xs w-24"
                          placeholder={`Cama ${idx + 1}`}
                          value={cama.alumno || ""}
                          disabled={saving[turno?.id]}
                          onChange={(e) => {
                            const nuevasCamas = camas.map((c: any, i: number) =>
                              i === idx ? { ...c, alumno: e.target.value } : c
                            );
                            setTurnos((prev) =>
                              prev.map((t) =>
                                t.id === turno?.id
                                  ? { ...t, camas: nuevasCamas }
                                  : t
                              )
                            );
                          }}
                          onBlur={(e) => {
                            if (turno) handleCamasChange(turno.id, camas);
                          }}
                        />
                        <label className="flex items-center gap-1 text-xs">
                          <input
                            type="checkbox"
                            checked={!!cama.asistencia}
                            disabled={saving[turno?.id]}
                            onChange={(e) => {
                              const nuevasCamas = camas.map(
                                (c: any, i: number) =>
                                  i === idx
                                    ? { ...c, asistencia: e.target.checked }
                                    : c
                              );
                              setTurnos((prev) =>
                                prev.map((t) =>
                                  t.id === turno?.id
                                    ? { ...t, camas: nuevasCamas }
                                    : t
                                )
                              );
                              if (turno)
                                handleCamasChange(turno.id, nuevasCamas);
                            }}
                          />
                          Si
                        </label>
                      </div>
                    ))}
                    <div className="text-xs text-gray-500 mt-1">
                      {`
                        ${camas.filter((c: any) => c.alumno).length}
                      `}
                      /{MAX_CAMAS} ocupadas
                    </div>
                  </div>
                </TableCell>
              );
            })}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  if (!user || user.role !== "admin") {
    return <div className="p-6">No tienes permisos para ver esta página.</div>;
  }
  if (loading) {
    return <div className="p-6">Cargando turnos...</div>;
  }

  return (
    <Card className="p-4">
      <CardContent>
        {renderResumen()}
        <Tabs defaultValue="manana" className="w-full">
          <TabsList>
            <TabsTrigger value="manana">Turnos Mañana</TabsTrigger>
            <TabsTrigger value="tarde">Turnos Tarde</TabsTrigger>
          </TabsList>
          <TabsContent value="manana">{renderTabla(horasManana)}</TabsContent>
          <TabsContent value="tarde">{renderTabla(horasTarde)}</TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
