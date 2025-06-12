-- Create a public.profiles table (if it doesn't exist or needs modification)
-- This table will store user profiles, including their role (student, teacher, admin)
CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
    first_name text,
    last_name text,
    role text CHECK (
        role IN ('student', 'teacher', 'admin')
    ) DEFAULT 'student' NOT NULL,
    avatar_url text,
    phone_number text,
    created_at timestamp
    with
        time zone DEFAULT now()
);

-- Secure the profiles table with RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read their own profile
CREATE POLICY "Allow authenticated users to read their own profile" ON public.profiles FOR
SELECT USING (auth.uid () = id);

-- Allow authenticated users to update their own profile
CREATE POLICY "Allow authenticated users to update their own profile" ON public.profiles FOR
UPDATE USING (auth.uid () = id);

-- Allow admins to manage all profiles (if needed for admin panel)
-- Note: This policy assumes there's a mechanism to identify admins (e.g., via a custom claim or directly from the 'role' column)
-- For simplicity, let's assume 'admin' role has full access
CREATE POLICY "Allow admins full access to profiles" ON public.profiles FOR ALL USING (
    auth.uid () IN (
        SELECT id
        FROM public.profiles
        WHERE
            role = 'admin'
    )
)
WITH
    CHECK (
        auth.uid () IN (
            SELECT id
            FROM public.profiles
            WHERE
                role = 'admin'
        )
    );

-- Create the public.classes table to define different types of classes
CREATE TABLE IF NOT EXISTS public.classes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
    name text NOT NULL,
    description text,
    duration_minutes integer NOT NULL,
    price numeric(10, 2) NOT NULL,
    max_students integer, -- NULL for private classes
    created_at timestamp
    with
        time zone DEFAULT now()
);

-- Secure the classes table with RLS (read-only for all, or specific roles)
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all authenticated users to read classes" ON public.classes FOR
SELECT USING (true);
-- Add policies for insert/update/delete based on roles if needed (e.g., only admins)

-- Create the public.schedules table for calendar events
CREATE TABLE IF NOT EXISTS public.schedules (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
    class_id uuid REFERENCES public.classes (id) ON DELETE CASCADE NOT NULL,
    teacher_id uuid REFERENCES public.profiles (id) ON DELETE CASCADE NOT NULL, -- Assuming teacher is a profile
    start_time timestamp
    with
        time zone NOT NULL,
        end_time timestamp
    with
        time zone NOT NULL,
        location text NOT NULL,
        is_group_class boolean DEFAULT false NOT NULL,
        created_at timestamp
    with
        time zone DEFAULT now()
);

-- Secure the schedules table with RLS
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;

-- Allow students to read schedules where they are assigned or if it's a public group class
CREATE POLICY "Allow students to read their assigned schedules or public group classes" ON public.schedules FOR
SELECT USING (
        is_group_class = true
        OR -- Allow reading all group classes
        EXISTS (
            SELECT 1
            FROM public.student_classes sc
            WHERE
                sc.schedule_id = schedules.id
                AND sc.student_id = auth.uid ()
        )
    );

-- Allow teachers to read their own schedules
CREATE POLICY "Allow teachers to read their own schedules" ON public.schedules FOR
SELECT USING (teacher_id = auth.uid ());

-- Allow admins full access to schedules
CREATE POLICY "Allow admins full access to schedules" ON public.schedules FOR ALL USING (
    auth.uid () IN (
        SELECT id
        FROM public.profiles
        WHERE
            role = 'admin'
    )
)
WITH
    CHECK (
        auth.uid () IN (
            SELECT id
            FROM public.profiles
            WHERE
                role = 'admin'
        )
    );

-- Create the public.student_classes table for student-schedule assignments
CREATE TABLE IF NOT EXISTS public.student_classes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
    schedule_id uuid REFERENCES public.schedules (id) ON DELETE CASCADE NOT NULL,
    student_id uuid REFERENCES public.profiles (id) ON DELETE CASCADE NOT NULL, -- Assuming student is a profile
    status text CHECK (
        status IN (
            'booked',
            'attended',
            'cancelled'
        )
    ) DEFAULT 'booked' NOT NULL,
    created_at timestamp
    with
        time zone DEFAULT now(),
        UNIQUE (schedule_id, student_id) -- Ensure a student can only be assigned once per schedule
);

-- Secure the student_classes table with RLS
ALTER TABLE public.student_classes ENABLE ROW LEVEL SECURITY;

-- Allow students to read their own assigned classes
CREATE POLICY "Allow students to read their own assigned classes" ON public.student_classes FOR
SELECT USING (student_id = auth.uid ());

-- Allow teachers to read student_classes for their schedules
CREATE POLICY "Allow teachers to read student_classes for their schedules" ON public.student_classes FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM public.schedules s
            WHERE
                s.id = student_classes.schedule_id
                AND s.teacher_id = auth.uid ()
        )
    );

-- Allow admins full access to student_classes
CREATE POLICY "Allow admins full access to student_classes" ON public.student_classes FOR ALL USING (
    auth.uid () IN (
        SELECT id
        FROM public.profiles
        WHERE
            role = 'admin'
    )
)
WITH
    CHECK (
        auth.uid () IN (
            SELECT id
            FROM public.profiles
            WHERE
                role = 'admin'
        )
    );

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_schedules_start_time ON public.schedules (start_time);

CREATE INDEX IF NOT EXISTS idx_schedules_teacher_id ON public.schedules (teacher_id);

CREATE INDEX IF NOT EXISTS idx_student_classes_student_id ON public.student_classes (student_id);

CREATE INDEX IF NOT EXISTS idx_student_classes_schedule_id ON public.student_classes (schedule_id);

-- Enable Realtime for the tables you want to listen to (optional, but recommended for live updates)
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.schedules;
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.student_classes;
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;