# Pilates Reformer Studio - Guía de Inicio y Conexión con Supabase

## 1. Instalación de dependencias

Asegúrate de tener Node.js instalado. Luego, instala pnpm si no lo tienes:

```sh
npm install -g pnpm
```

Instala las dependencias del proyecto:

```sh
pnpm install
```

## 2. Configuración de Supabase


Ya tienes un proyecto Supabase creado y configurado. Las variables de entorno necesarias deben estar en el archivo `.env` (no subir nunca este archivo ni las keys a GitHub):

```
VITE_SUPABASE_URL=TU_URL_SUPABASE
VITE_SUPABASE_ANON_KEY=TU_ANON_KEY
```

**Importante:** Nunca subas las claves ni el archivo `.env` al repositorio. Mantén las keys solo en tu entorno local y compártelas de forma segura con el equipo.

## 3. Cliente Supabase


El cliente está inicializado en `src/lib/supabaseClient.ts` y utiliza las variables de entorno del archivo `.env`.

## 4. Ejecutar la app

Para iniciar la app en modo desarrollo:

```sh
pnpm run dev
```

## 5. Siguientes pasos

- Crea las tablas y autenticación en el panel de Supabase: https://buiaflbednwgbptxzrki.supabase.co
- Usa el cliente Supabase para consultas y autenticación en tu código.
- Continúa desarrollando las páginas y componentes según la estructura del proyecto.

---

¿Listo para continuar? Si necesitas ejemplos de uso de Supabase en React, ¡avísame!

---

**Nota para IA DEV, UX/UI y Product Manager:**
- Nunca incluir claves privadas ni el archivo `.env` en el repositorio.
- Documentar siempre el uso de variables de entorno y cómo compartirlas de forma segura.
- Mantener la seguridad y buenas prácticas en la gestión de credenciales.
