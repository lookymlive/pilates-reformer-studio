import { CamaTurno, turnosPilates } from "../lib/data/turnosPilates";
import { supabase } from "../lib/supabaseClient";

export async function seedTurnosIfNeeded() {
  // Verifica si ya hay turnos en la base
  const { data, error } = await supabase.from("turnos").select("id");
  if (!error && data && data.length > 0) return; // Ya existen turnos

  // Si no existen, los sube
  for (const turno of turnosPilates) {
    await supabase.from("turnos").insert({
      dia: turno.dia,
      hora_inicio: turno.horaInicio,
      hora_fin: turno.horaFin,
      camas: turno.camas,
    });
  }
}

export async function getTurnos() {
  const { data, error } = await supabase.from("turnos").select("*");
  if (error) throw error;
  return data;
}

export async function updateTurno(id: number, camas: CamaTurno[]) {
  const { error } = await supabase
    .from("turnos")
    .update({ camas })
    .eq("id", id);
  if (error) throw error;
}
