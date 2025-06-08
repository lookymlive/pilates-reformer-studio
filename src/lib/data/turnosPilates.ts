// lib/data/turnosPilates.ts

export type CamaTurno = {
  alumno?: string; // nombre o ID
  asistencia: boolean;
};

export type TurnoPilates = {
  dia: "Lunes" | "Martes" | "Miércoles" | "Jueves" | "Viernes";
  horaInicio: string; // "08:00"
  horaFin: string; // "09:00"
  camas: CamaTurno[]; // longitud 6
};

export const turnosPilates: TurnoPilates[] = [
  // Lunes
  {
    dia: "Lunes",
    horaInicio: "08:00",
    horaFin: "09:00",
    camas: [
      { alumno: "Florencia P", asistencia: false },
      { alumno: "Claudia", asistencia: false },
      { asistencia: false },
      { asistencia: false },
      { asistencia: false },
      { asistencia: false },
    ],
  },
  {
    dia: "Lunes",
    horaInicio: "09:00",
    horaFin: "10:00",
    camas: [
      { alumno: "Adelina", asistencia: false },
      { alumno: "Noelia", asistencia: false },
      { alumno: "Andrea", asistencia: false },
      { alumno: "Bianca", asistencia: false },
      { asistencia: false },
      { asistencia: false },
    ],
  },
  {
    dia: "Lunes",
    horaInicio: "10:00",
    horaFin: "11:00",
    camas: [
      { alumno: "Blanca", asistencia: false },
      { alumno: "Marta Lorena", asistencia: false },
      { alumno: "Daniel", asistencia: false },
      { alumno: "Juan Carlos", asistencia: false },
      { alumno: "Silvia Amador", asistencia: false },
      { alumno: "Romina V", asistencia: false },
    ],
  },
  {
    dia: "Lunes",
    horaInicio: "11:00",
    horaFin: "12:00",
    camas: [
      { alumno: "Silvia Jesús", asistencia: false },
      { alumno: "Jesica", asistencia: false },
      { alumno: "Florencia", asistencia: false },
      { alumno: "Marina Rivas", asistencia: false },
      { alumno: "Veronica", asistencia: false },
      { alumno: "Lucía", asistencia: false },
    ],
  },

  // Martes
  {
    dia: "Martes",
    horaInicio: "08:00",
    horaFin: "09:00",
    camas: [
      { alumno: "María H", asistencia: false },
      { alumno: "Alicia Rocha", asistencia: false },
      { alumno: "Paula", asistencia: false },
      { alumno: "María", asistencia: false },
      { alumno: "Eumelia", asistencia: false },
      { alumno: "Nicolás", asistencia: false },
    ],
  },
  {
    dia: "Martes",
    horaInicio: "09:00",
    horaFin: "10:00",
    camas: [
      { alumno: "Marina Ochoa", asistencia: false },
      { alumno: "Patricia V", asistencia: false },
      { alumno: "Daniela", asistencia: false },
      { alumno: "Pamela", asistencia: false },
      { alumno: "María", asistencia: false },
      { alumno: "Amalia O", asistencia: false },
    ],
  },
  {
    dia: "Martes",
    horaInicio: "10:00",
    horaFin: "11:00",
    camas: [
      { alumno: "Nilda Elena", asistencia: false },
      { alumno: "Judith", asistencia: false },
      { alumno: "Karla", asistencia: false },
      { alumno: "Amo", asistencia: false },
      { alumno: "Andrea", asistencia: false },
      { alumno: "Romina", asistencia: false },
    ],
  },
  {
    dia: "Martes",
    horaInicio: "11:00",
    horaFin: "12:00",
    camas: [
      { alumno: "Argelina", asistencia: false },
      { alumno: "Silvana", asistencia: false },
      { alumno: "Marina", asistencia: false },
      { alumno: "Argelina", asistencia: false },
      { asistencia: false },
      { asistencia: false },
    ],
  },

  // Miércoles
  {
    dia: "Miércoles",
    horaInicio: "08:00",
    horaFin: "09:00",
    camas: [
      { alumno: "Florencia", asistencia: false },
      { alumno: "Noelia", asistencia: false },
      { alumno: "Andrea", asistencia: false },
      { alumno: "Argentino", asistencia: false },
      { asistencia: false },
      { asistencia: false },
    ],
  },
  {
    dia: "Miércoles",
    horaInicio: "09:00",
    horaFin: "10:00",
    camas: [
      { alumno: "Roxana S", asistencia: false },
      { alumno: "Patricia P", asistencia: false },
      { alumno: "Nora", asistencia: false },
      { alumno: "Carina F", asistencia: false },
      { alumno: "Pamela", asistencia: false },
      { alumno: "Graciela C", asistencia: false },
    ],
  },
  {
    dia: "Miércoles",
    horaInicio: "10:00",
    horaFin: "11:00",
    camas: [
      { alumno: "Gabriela", asistencia: false },
      { alumno: "Mónica Robledo", asistencia: false },
      { alumno: "Claudia", asistencia: false },
      { alumno: "Yanina", asistencia: false },
      { alumno: "Silvina Amador", asistencia: false },
      { alumno: "Verónica", asistencia: false },
    ],
  },
  {
    dia: "Miércoles",
    horaInicio: "11:00",
    horaFin: "12:00",
    camas: [
      { alumno: "Silvia Jerez", asistencia: false },
      { alumno: "Sonia", asistencia: false },
      { alumno: "Mirta", asistencia: false },
      { alumno: "Blanca", asistencia: false },
      { alumno: "Fanny", asistencia: false },
      { asistencia: false },
    ],
  },

  // Jueves
  {
    dia: "Jueves",
    horaInicio: "08:00",
    horaFin: "09:00",
    camas: [
      { alumno: "Marina", asistencia: false },
      { alumno: "Alicia", asistencia: false },
      { alumno: "Florencia", asistencia: false },
      { alumno: "Viviana", asistencia: false },
      { alumno: "Bianca", asistencia: false },
      { asistencia: false },
    ],
  },
  {
    dia: "Jueves",
    horaInicio: "09:00",
    horaFin: "10:00",
    camas: [
      { alumno: "Marina Ochoa", asistencia: false },
      { alumno: "Patricia V", asistencia: false },
      { alumno: "Daniela", asistencia: false },
      { alumno: "Pamela", asistencia: false },
      { alumno: "Amalia O", asistencia: false },
      { alumno: "Silvia Haidar", asistencia: false },
    ],
  },
  {
    dia: "Jueves",
    horaInicio: "10:00",
    horaFin: "11:00",
    camas: [
      { alumno: "Daniel", asistencia: false },
      { alumno: "Juan Carlos", asistencia: false },
      { alumno: "Kristina", asistencia: false },
      { alumno: "Amo", asistencia: false },
      { alumno: "Edith", asistencia: false },
      { alumno: "Florencia", asistencia: false },
    ],
  },
  {
    dia: "Jueves",
    horaInicio: "11:00",
    horaFin: "12:00",
    camas: [
      { alumno: "Fanny", asistencia: false },
      { alumno: "Begoña", asistencia: false },
      { asistencia: false },
      { asistencia: false },
      { asistencia: false },
      { asistencia: false },
    ],
  },

  // Viernes
  {
    dia: "Viernes",
    horaInicio: "08:00",
    horaFin: "09:00",
    camas: [
      { alumno: "Florencia", asistencia: false },
      { alumno: "Gabriela", asistencia: false },
      { alumno: "Claudia", asistencia: false },
      { alumno: "Noelia", asistencia: false },
      { alumno: "Analía P", asistencia: false },
      { alumno: "Silvia F", asistencia: false },
    ],
  },
  {
    dia: "Viernes",
    horaInicio: "09:00",
    horaFin: "10:00",
    camas: [
      { alumno: "Roxana S", asistencia: false },
      { alumno: "Claudia P", asistencia: false },
      { alumno: "Nora", asistencia: false },
      { alumno: "Carina F", asistencia: false },
      { alumno: "María", asistencia: false },
      { asistencia: false },
    ],
  },
  {
    dia: "Viernes",
    horaInicio: "10:00",
    horaFin: "11:00",
    camas: [
      { alumno: "Graciela C", asistencia: false },
      { alumno: "Nilda I", asistencia: false },
      { alumno: "Mónica Robledo", asistencia: false },
      { alumno: "Karla", asistencia: false },
      { alumno: "Estela Z", asistencia: false },
      { alumno: "Romina", asistencia: false },
    ],
  },
  {
    dia: "Viernes",
    horaInicio: "11:00",
    horaFin: "12:00",
    camas: [
      { alumno: "Adriana", asistencia: false },
      { alumno: "Inobel", asistencia: false },
      { alumno: "Edith", asistencia: false },
      { alumno: "Mirta", asistencia: false },
      { alumno: "Begoña", asistencia: false },
      { asistencia: false },
    ],
  },
];
