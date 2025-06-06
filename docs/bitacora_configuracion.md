# Bitácora de Configuración - Pilates Reformer Studio

**Fecha de corte:** 5 de junio de 2025

---

## 1. Instalación y preparación del entorno

- Instalación de dependencias con `pnpm install`.
- Instalación de `@supabase/supabase-js` para conexión con Supabase.
- Creación del archivo `.env` con las claves de Supabase (no subir nunca a git).

## 2. Configuración y limpieza del proyecto

- Se creó `.gitignore` para excluir archivos sensibles y de build.
- Se eliminaron archivos y scripts de ejemplo/monorepo no necesarios.
- Se organizó la documentación en la carpeta `docs/` y se actualizó el `README.md` para Product Manager, IA DEV y UI/UX.

## 3. Configuración de Supabase

- Se creó el proyecto en Supabase y se obtuvieron las claves.
- Se crearon los tipos ENUM necesarios (`user_role`, `clase_estado`, etc).
- Se crearon todas las tablas principales: `profiles`, `class_types`, `equipment`, `scheduled_classes`, `bookings`, `memberships`, `payments`.
- Se crearon funciones y triggers para manejo de usuarios y claims personalizados.
- Se insertaron datos iniciales de clases y equipos.
- Se habilitó realtime en las tablas necesarias.

## 4. Prueba de la app

- Se ejecutó `pnpm run dev` y la app funciona correctamente en `http://localhost:5173/`.
- La conexión con Supabase es exitosa y la estructura de datos está lista para desarrollo.

## 5. Siguientes pasos recomendados

- Configurar el Auth Hook en Supabase con:

  ```sql
  SELECT auth.set_custom_access_token_hook('public.custom_access_token_hook');
  ```

- Continuar el desarrollo de features y UI según la guía técnica en `docs/`.
- Mantener esta bitácora y actualizarla ante cualquier cambio relevante.

---

**Esta guía sirve como referencia para Product Manager, IA DEV y UI/UX en caso de restaurar, migrar o continuar el desarrollo.**
