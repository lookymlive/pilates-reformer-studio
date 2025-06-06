
# Pilates Reformer Studio - Guía para Product Manager, IA DEV y UI/UX

## Estructura de carpetas y archivos útiles

- `src/` → Código fuente principal de la app (React + Vite + Supabase)
- `code/` → Ejemplos, configuraciones y scripts SQL útiles:
  - `class-booking-component.tsx`: Ejemplo de componente de reserva de clases
  - `environment-configs.ts`: Ejemplo de estructura de configuración
  - `supabase-setup.sql`: Script completo para crear la base de datos y roles en Supabase
  - `package-json-examples.json`: Ejemplo de configuración de monorepo (no usar si no se implementa monorepo)
- `docs/` → Documentación estratégica y técnica:
  - `guia_tecnica_pilates_app.md`: Guía técnica completa (referencia principal)
  - `research_plan_pilates_app.md`: Plan de investigación y decisiones técnicas
  - `resumen_ejecutivo.md`: Resumen ejecutivo para Product Manager
  - `source_tracking.md`: Fuentes y referencias técnicas
- `scripts/` → Automatización (solo si se requiere setup avanzado):
  - `setup-automation.sh`: Script de automatización para entornos monorepo (opcional)
- `sub_tasks/` → Resúmenes de tareas y entregables

## ¿Qué archivos mantener y cuáles eliminar?

**Mantener:**

- Todo el contenido de `src/` (código fuente real)
- `code/class-booking-component.tsx`, `code/environment-configs.ts`, `code/supabase-setup.sql` (referencia y ejemplos)
- Todo en `docs/` (documentación estratégica y técnica)
- `.env` (solo local, nunca subir)
- `.gitignore`, `package.json`, `README_SUPABASE.md`, `tailwind.config.js`, `tsconfig*.json`, `vite.config.ts`, etc.

**Eliminar o ignorar:**

- `code/package-json-examples.json` (solo útil si se implementa monorepo, si no, eliminar)
- `scripts/setup-automation.sh` (solo si se usará monorepo y automatización avanzada)
- Cualquier archivo duplicado, redundante o que no aporte valor directo al desarrollo actual

## Guía para Product Manager, IA DEV y UI/UX

1. **Product Manager:**
   - Refiérase a `docs/resumen_ejecutivo.md` y `docs/guia_tecnica_pilates_app.md` para visión general, entregables y arquitectura.
   - Use `docs/research_plan_pilates_app.md` para entender decisiones técnicas y roadmap.
   - Mantenga la documentación actualizada y clara para el equipo.

2. **IA DEV:**
   - Utilice los scripts y ejemplos de `code/` para implementar nuevas features.
   - Siga la estructura y buenas prácticas de `src/`.
   - Consulte la guía técnica y el script SQL para la integración con Supabase.

3. **UI/UX:**
   - Revise los componentes de ejemplo en `src/components/` y `code/class-booking-component.tsx`.
   - Siga las recomendaciones de UX en la guía técnica.
   - Proponga mejoras y documente flujos en `docs/`.

---

**Nota:**

- Mantener la seguridad: nunca subir `.env` ni claves a repositorios.
- Eliminar archivos de ejemplo o automatización si no se usan.
- Toda la documentación debe estar en `docs/` y ser clara para todos los roles.

```js
// eslint.config.js
import react from 'eslint-plugin-react'

export default tseslint.config({
  // Set the react version
  settings: { react: { version: '18.3' } },
  plugins: {
    // Add the react plugin
    react,
  },
  rules: {
    // other rules...
    // Enable its recommended rules
    ...react.configs.recommended.rules,
    ...react.configs['jsx-runtime'].rules,
  },
})
```
