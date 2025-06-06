-- =============================================================================
-- CONFIGURACIÓN INICIAL DE SUPABASE PARA PILATES STUDIO
-- =============================================================================

-- Ejecutar en orden después de crear el proyecto Supabase

-- =============================================================================
-- 1. EXTENSIONES Y CONFIGURACIÓN INICIAL
-- =============================================================================

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- =============================================================================
-- 2. TIPOS ENUMERADOS
-- =============================================================================

CREATE TYPE user_role AS ENUM ('admin', 'instructor', 'cliente');
CREATE TYPE clase_estado AS ENUM ('programada', 'en_progreso', 'completada', 'cancelada');
CREATE TYPE reserva_estado AS ENUM ('confirmada', 'en_espera', 'cancelada');
CREATE TYPE membership_tipo AS ENUM ('mensual', 'trimestral', 'anual', 'paquete_clases');
CREATE TYPE payment_method AS ENUM ('efectivo', 'tarjeta', 'transferencia', 'credito_membresia');

-- =============================================================================
-- 3. FUNCIÓN PARA MANEJAR USUARIOS NUEVOS
-- =============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'cliente')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para crear perfil automáticamente
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================================================
-- 4. FUNCIÓN AUTH HOOK PARA CUSTOM CLAIMS
-- =============================================================================

CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event jsonb)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
    claims jsonb;
    user_role text;
    user_name text;
BEGIN
    -- Extraer claims existentes
    claims := event->'claims';
    
    -- Obtener información del usuario
    SELECT 
        role,
        first_name || ' ' || last_name
    INTO user_role, user_name
    FROM public.profiles 
    WHERE id = (event->'user_id')::uuid;
    
    -- Agregar custom claims
    claims := jsonb_set(claims, '{user_role}', to_jsonb(user_role));
    claims := jsonb_set(claims, '{user_name}', to_jsonb(user_name));
    claims := jsonb_set(claims, '{app}', '"pilates_studio"');
    
    -- Retornar el evento modificado
    return jsonb_set(event, '{claims}', claims);
END;
$$;

-- Configurar permisos para el Auth Hook
GRANT USAGE ON SCHEMA public TO supabase_auth_admin;
GRANT EXECUTE ON FUNCTION public.custom_access_token_hook TO supabase_auth_admin;
REVOKE EXECUTE ON FUNCTION public.custom_access_token_hook FROM authenticated, anon, public;
GRANT ALL ON TABLE public.profiles TO supabase_auth_admin;
REVOKE ALL ON TABLE public.profiles FROM authenticated, anon, public;

-- Crear política para que supabase_auth_admin pueda leer profiles
CREATE POLICY "Allow auth admin to read user profiles" ON public.profiles
AS PERMISSIVE FOR SELECT TO supabase_auth_admin
USING (true);

-- =============================================================================
-- 5. FUNCIONES AUXILIARES PARA RLS
-- =============================================================================

CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    user_role text;
BEGIN
    SELECT role INTO user_role 
    FROM public.profiles 
    WHERE id = auth.uid();
    
    RETURN user_role;
END;
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
BEGIN
    RETURN (SELECT get_user_role() = 'admin');
END;
$$;

CREATE OR REPLACE FUNCTION public.is_instructor()
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
BEGIN
    RETURN (SELECT get_user_role() IN ('admin', 'instructor'));
END;
$$;

-- =============================================================================
-- 6. DATOS INICIALES
-- =============================================================================

-- Insertar admin inicial (ajustar email y datos)
INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    role
) VALUES (
    uuid_generate_v4(),
    '00000000-0000-0000-0000-000000000000',
    'silvia@pilatesstudio.com',
    crypt('admin123!', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"first_name":"Silvia","last_name":"Fernandez","role":"admin"}',
    false,
    'authenticated'
);

-- Tipos de clases iniciales
INSERT INTO public.class_types (name, description, duration_minutes, max_participants, price, difficulty_level) VALUES
('Pilates Principiante', 'Clase individual de Pilates para principiantes en Reformer', 60, 1, 8000.00, 'principiante'),
('Pilates Intermedio', 'Clase individual de Pilates nivel intermedio en Reformer', 60, 1, 9000.00, 'intermedio'),
('Pilates Avanzado', 'Clase individual de Pilates nivel avanzado en Reformer', 60, 1, 10000.00, 'avanzado'),
('Pilates Dúo', 'Clase de Pilates para 2 personas en Reformer', 60, 2, 6000.00, 'intermedio'),
('Evaluación Inicial', 'Primera sesión de evaluación y diagnóstico', 90, 1, 7000.00, 'principiante');

-- Equipos iniciales
INSERT INTO public.equipment (name, type, location, is_available) VALUES
('Reformer 1', 'reformer', 'Sala Principal - Posición 1', true),
('Reformer 2', 'reformer', 'Sala Principal - Posición 2', true),
('Reformer 3', 'reformer', 'Sala Principal - Posición 3', true);

-- =============================================================================
-- 7. CONFIGURACIÓN FINAL
-- =============================================================================

-- Habilitar realtime para las tablas que lo necesiten
ALTER PUBLICATION supabase_realtime ADD TABLE public.scheduled_classes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;

-- Configurar el Auth Hook (ejecutar después de deploy)
-- SELECT auth.set_custom_access_token_hook('public.custom_access_token_hook');

COMMIT;
