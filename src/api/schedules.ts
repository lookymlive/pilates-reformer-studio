import { supabase } from "../lib/supabase";

export type Schedule = {
  id: string;
  class_id: string;
  teacher_id: string;
  start_time: string;
  end_time: string;
  location: string;
  is_group_class: boolean;
  created_at: string;
};

export type ClassType = {
  id: string;
  name: string;
  description?: string;
  duration_minutes: number;
  price: number;
  max_students?: number;
  created_at: string;
};

export type Profile = {
  id: string;
  first_name?: string;
  last_name?: string;
  role: "student" | "teacher" | "admin";
  avatar_url?: string;
  phone_number?: string;
  created_at: string;
};

export type StudentClass = {
  id: string;
  schedule_id: string;
  student_id: string;
  status: "booked" | "attended" | "cancelled";
  created_at: string;
};

export async function getSchedules() {
  const { data: user, error: userError } = await supabase.auth.getUser();
  if (userError || !user?.user) {
    console.warn(
      "No authenticated user found. Fetching schedules without user context."
    );
    // Or throw an error if schedules should only be fetched by authenticated users
    // return null;
  }

  let query = supabase.from("schedules").select(`
    id,
    start_time,
    end_time,
    location,
    is_group_class,
    classes ( id, name, duration_minutes, price, max_students ),
    teacher:profiles ( id, first_name, last_name, role ),
    student_classes ( student:profiles ( id, first_name, last_name, role ) )
  `);

  // RLS will automatically filter based on the authenticated user's policies.
  // No explicit filtering is needed here for RLS to work, but we ensure the select statement
  // is correct and the user is authenticated.

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching schedules:", error.message);
    return null;
  }

  return data;
}

export async function getTeachers() {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, first_name, last_name")
    .eq("role", "teacher");

  if (error) {
    console.error("Error fetching teachers:", error.message);
    return null;
  }
  return data;
}

export async function getStudents() {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, first_name, last_name")
    .eq("role", "student");

  if (error) {
    console.error("Error fetching students:", error.message);
    return null;
  }
  return data;
}

export async function getClassesTypes() {
  const { data, error } = await supabase
    .from("classes")
    .select("id, name, duration_minutes");

  if (error) {
    console.error("Error fetching class types:", error.message);
    return null;
  }
  return data;
}

interface CreateScheduleData {
  class_id: string;
  teacher_id: string;
  start_time: string;
  end_time: string;
  location: string;
  is_group_class: boolean;
  student_ids?: string[]; // Only if it's a group class or multiple students
  student_id?: string; // For private classes
}

export async function createSchedule(scheduleData: CreateScheduleData) {
  const {
    class_id,
    teacher_id,
    start_time,
    end_time,
    location,
    is_group_class,
    student_ids,
    student_id,
  } = scheduleData;

  const { data: newSchedule, error: scheduleError } = await supabase
    .from("schedules")
    .insert([
      {
        class_id,
        teacher_id,
        start_time,
        end_time,
        location,
        is_group_class,
      },
    ])
    .select()
    .single();

  if (scheduleError) {
    console.error("Error creating schedule:", scheduleError.message);
    return null;
  }

  if (newSchedule && !is_group_class && student_id) {
    const { error: studentClassError } = await supabase
      .from("student_classes")
      .insert([
        {
          schedule_id: newSchedule.id,
          student_id,
        },
      ]);
    if (studentClassError) {
      console.error(
        "Error assigning student to class:",
        studentClassError.message
      );
      // Consider rolling back the schedule creation if this fails
      return null;
    }
  } else if (
    newSchedule &&
    is_group_class &&
    student_ids &&
    student_ids.length > 0
  ) {
    const studentClassEntries = student_ids.map((sId) => ({
      schedule_id: newSchedule.id,
      student_id: sId,
    }));
    const { error: studentClassError } = await supabase
      .from("student_classes")
      .insert(studentClassEntries);

    if (studentClassError) {
      console.error(
        "Error assigning students to group class:",
        studentClassError.message
      );
      return null;
    }
  }

  return newSchedule;
}
