# Sistema de Diseño — Clínica (microservicios + app cliente)

Documento de referencia para el diseño de la aplicación **Sistema Clinicas** y su contrato
con los microservicios. Deriva del código real de `clinica-microservices` y del cliente
`FrontEndd-app-INGWEB`.

- **Dominio:** gestión de usuarios y citas médicas en una clínica.
- **Roles de usuario:** `ADMIN`, `MEDICO`, `PACIENTE`.
- **Estados de cita:** `SCHEDULED`, `CANCELLED`, `COMPLETED`.
- **Base de estilos:** CSS puro con tokens (variables CSS + CSS Modules). Sin librerías UI.

---

## 1. Arquitectura del sistema

```
┌─────────────────────┐        ┌───────────────────────────────────────┐
│  FrontEndd-app      │  HTTP  │  api-gateway  (Express + proxy)       │
│  React 19 + Vite    ├───────►│  :3000  /api/users  /api/appointments  │
└─────────────────────┘        └───────┬───────────────────────┬────────┘
   VITE_API_URL=http://localhost:3000/api       │                       │
                                    ┌───────────▼─────────┐   ┌─────────▼─────────┐
                                    │  user-service :3001 │   │ appointment-svc   │
                                    │  TS + Prisma        │   │ :8000 TS + Prisma │
                                    │  bcrypt / jwt / zod │   │  zod               │
                                    └───────────┬─────────┘   └─────────┬─────────┘
                                                │                       │
                                    ┌───────────▼───────────────────────▼─────────┐
                                    │  postgres:15 · clinica_db                    │
                                    │  schema public (users) / schema appointments  │
                                    └──────────────────────────────────────────────┘
```

Contrato de despliegue (`docker-compose.yml`):

| Servicio              | Puerto host | Health check        | Variables                                  |
| --------------------- | ----------- | ------------------- | ------------------------------------------ |
| `postgres`            | 5432        | —                   | `POSTGRES_USER/PASSWORD/DB`                |
| `api-gateway`         | 3000        | `GET /health`       | `PORT`, `USER_SERVICE_URL`, `APPOINTMENT_SERVICE_URL` |
| `user-service`        | 3001        | `GET /health`       | `PORT`, `DATABASE_URL`, `JWT_SECRET`       |
| `appointment-service` | 8000        | `GET /health`       | `PORT`, `DATABASE_URL`                     |

---

## 2. Modelo de dominio

### 2.1 Usuario (`user-service`)

```prisma
enum Role { ADMIN, MEDICO, PACIENTE }

model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  password  String              // hash bcrypt (10 rounds)
  role      Role     @default(PACIENTE)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

Reglas:

- El `password` nunca viaja al cliente; el servicio lo omite en la respuesta de registro.
- `role` es opcional en el registro y por defecto es `PACIENTE`.
- La UI no debe permitir elegir `ADMIN` en el registro público (ver §6.2).

### 2.2 Cita (`appointment-service`)

```prisma
enum AppointmentStatus { SCHEDULED, CANCELLED, COMPLETED }

model Appointment {
  id         Int               @id @default(autoincrement())
  patientId  Int
  doctorId   Int
  date       DateTime
  status     AppointmentStatus @default(SCHEDULED)
  notes      String?
  createdAt  DateTime          @default(now())
  updatedAt  DateTime          @updatedAt
}
```

- `patientId` y `doctorId` son `Int` sin relación FK: la UI los trata como IDs opacos y
  resuelve el nombre para mostrar mediante datos de usuario cacheados.
- `notes` es texto libre opcional (diagnóstico, motivo de consulta).

### 2.3 Máquina de estados de la cita

```
        ┌──────────────┐   cancelar    ┌─────────────┐
   ───► │  SCHEDULED   │ ────────────► │  CANCELLED  │
        └──────┬───────┘               └─────────────┘
               │ completar
               ▼
        ┌─────────────┐
        │  COMPLETED  │   (terminal)
        └─────────────┘
```

Transiciones permitidas por la API (única transición hoy: `PATCH /:id/status`):

| Desde        | Hacia         | Permitido |
| ------------ | ------------- | --------- |
| `SCHEDULED`  | `CANCELLED`  | Sí        |
| `SCHEDULED`  | `COMPLETED`   | Sí        |
| `CANCELLED`  | `COMPLETED`   | Sí        |
| `COMPLETED`  | cualquiera    | No        |

---

## 3. Contrato de API

Prefijo del gateway: `VITE_API_URL` = `http://localhost:3000/api`.

| Método | Ruta                        | Servicio | Body / Query                                          | Respuesta |
| ------ | --------------------------- | -------- | ----------------------------------------------------- | --------- |
| POST   | `/users/register`           | user     | `{ email, password, role? }`                          | `201 { message, user }` |
| POST   | `/users/login`              | user     | `{ email, password }`                                 | `200 { message, token, role }` |
| GET    | `/health`                   | gateway  | —                                                     | `200 { status }` |
| POST   | `/appointments`             | appt     | `{ patientId, doctorId, date, notes? }`               | `201 Appointment` |
| GET    | `/appointments`             | appt     | `?patientId=&doctorId=`                               | `200 Appointment[]` |
| PATCH  | `/appointments/:id/status`  | appt     | `{ status }`                                          | `200 Appointment` |

El gateway solo hace proxy: reenvía `req.url` sin transformar el path, por eso los servicios
montan sus routers en `/`.

### 3.1 Formato de error (normalizado)

`error.middleware.ts` produce:

```json
{ "message": "Cita no encontrada", "stack": "…" }
```

`validate.middleware.ts` produce:

```json
{ "message": "Error de validación", "errors": [{ "path": ["body","email"], "message": "Debe ser un email válido" }] }
```

Contrato que la UI debe asumir:

```ts
type ApiError = {
  message: string;          // siempre presente, en español
  errors?: ZodIssue[];      // presente en 400 de validación
  stack?: string;           // solo fuera de producción: nunca renderizar
};
```

Reglas de manejo en el cliente:

1. `400` + `errors` → error de formulario, mapear por `path` a cada campo.
2. `400` sin `errors` → regla de negocio (ej. `El usuario ya existe`) → banner de formulario.
3. `401` → `Credenciales inválidas` → reintentar login; si hay sesión activa, cerrar sesión.
4. `404` → entidad no encontrada → estado vacío con acción de retorno.
5. `5xx` / red caída → banner global con acción **Reintentar**.
6. Nunca mostrar `stack`. Nuncaassume que `message` está en inglés.

### 3.2 Autenticación

`user-service` firma JWT (`jsonwebtoken`, `expiresIn: '24h'`) con payload:

```json
{ "userId": 1, "email": "medico@clinica.com", "role": "MEDICO" }
```

- El cliente guarda `token` + `role` + `email`.
- El token se envía como `Authorization: Bearer <token>`.
- **Pendiente del backend:** los servicios aún no validan el JWT ni aplican autorización por
  rol. El cliente debe filtrar la navegación por rol (§6.2) asumiendo que el gateway
  evolucionará a propagar y verificar el token.

---

## 4. Sistema de diseño

### 4.1 Principios

1. **Claridad clínica:** la información crítica (fecha, médico, estado) domina; decoración es
   mínima.
2. **Color con significado:** el color nunca es el único indicador de estado; siempre se
   acompaña de texto (`SCHEDULED` → "Agendada").
3. **Un solo acento:** el azul de marca se reserva para acción primaria y enlaces.
4. **Densidad media:** tablas con filas de 48–56 px; padding consistente de 16/24 px.
5. **Accesible por defecto:** contraste AA, foco visible, navegación por teclado,
   `aria-*` en estados y modales.

### 4.2 Tokens

Tokens en `:root` (archivo `src/styles/tokens.css`), Replaceando el set actual de Vite.
No se usan valores crudos en componentes: siempre `var(--…)`.

#### Color

```css
:root {
  /* Marca y superficies */
  --color-brand-50:  #eef4ff;
  --color-brand-100: #dbe6ff;
  --color-brand-500: #2563eb;   /* acción primaria */
  --color-brand-600: #1d4ed8;
  --color-brand-700: #1e40af;

  /* Neutros */
  --color-bg:          #ffffff;
  --color-bg-subtle:   #f7f8fa;   /* fondo de página, zebra de tabla */
  --color-surface:     #ffffff;   /* tarjetas, modales */
  --color-border:      #e3e6ea;
  --color-border-strong:#c9ced6;
  --color-text:        #1f2430;   /* texto principal */
  --color-text-muted:  #667085;   /* texto secundario, metadatos */
  --color-text-inverse:#ffffff;

  /* Semánticos */
  --color-success:     #0f9d58;   /* COMPLETED */
  --color-warning:     #b54708;   /* SCHEDULED (pendiente de acción) */
  --color-danger:      #d92d20;   /* CANCELLED, errores */
  --color-info:        #0e7490;   /* mensajes neutros */

  /* Superficies semánticas (fondo de badge) */
  --color-success-bg: #e7f6ee;
  --color-warning-bg: #fdf3e7;
  --color-danger-bg:  #fdeceb;
  --color-info-bg:    #e6f4f7;
  --color-focus-ring: #2563eb;
}
```

Modo oscuro (`.theme-dark`, activado por `data-theme="dark"` y
`prefers-color-scheme`):

```css
[data-theme="dark"] {
  --color-bg:           #101318;
  --color-bg-subtle:    #161a21;
  --color-surface:      #1a1f27;
  --color-border:       #2a313c;
  --color-border-strong:#3d4552;
  --color-text:         #e7eaf0;
  --color-text-muted:   #9aa4b2;
  --color-brand-500:    #4d84f5;
  --color-brand-600:    #6b9bff;
  --color-success:      #34c98a;
  --color-warning:      #e2a04a;
  --color-danger:       #f26d63;
  --color-success-bg:   #10281f;
  --color-warning-bg:   #2a2013;
  --color-danger-bg:    #2b1615;
}
```

Contraste: `--color-text` sobre `--color-bg` ≥ 7:1; `--color-text-muted` ≥ 4.5:1;
texto blanco sobre `--color-brand-500` ≥ 4.5:1.

#### Tipografía

Familia: `system-ui, 'Segoe UI', Roboto, sans-serif` (se mantiene la del scaffold;
monoespaciada solo para IDs/horas técnicas).

```css
--font-sans: system-ui, 'Segoe UI', Roboto, sans-serif;
--font-mono: ui-monospace, Consolas, monospace;

--text-xs:   0.75rem;  /* 12px · metadatos, badges */
--text-sm:   0.875rem; /* 14px · tablas,.labels secundarios */
--text-base: 1rem;     /* 16px · cuerpo, inputs */
--text-lg:   1.125rem; /* 18px · subtítulos de tarjeta */
--text-xl:   1.375rem; /* 22px · títulos de página */
--text-2xl:  1.75rem;  /* 28px · números de dashboard */

--leading-tight:  1.25;
--leading-normal: 1.5;

--weight-regular: 400;
--weight-medium:  500;
--weight-semibold:600;

--tracking-tight: -0.01em; /* títulos */
--tracking-wide:   0.04em; /* badges, labels en mayúscula */
```

Escala de títulos: `h1` = `--text-xl` (no 56 px como el scaffold), peso 600,
`--color-text`, letter-spacing `--tracking-tight`.

#### Espaciado y forma

Escala base de 4 px:

```css
--space-1: 0.25rem;  --space-2: 0.5rem;   --space-3: 0.75rem;
--space-4: 1rem;     --space-5: 1.25rem;  --space-6: 1.5rem;
--space-8: 2rem;     --space-10: 2.5rem;  --space-12: 3rem;

--radius-sm: 4px;    /* badges, inputs */
--radius-md: 8px;    /* botones, tarjetas */
--radius-lg: 12px;   /* modales, paneles */
--radius-full: 999px;/* píldoras, avatares */
```

#### Elevación y movimiento

```css
--shadow-xs: 0 1px 2px rgba(16, 24, 40, 0.06);
--shadow-sm: 0 1px 3px rgba(16, 24, 40, 0.10), 0 1px 2px rgba(16, 24, 40, 0.06);
--shadow-md: 0 4px 8px -2px rgba(16, 24, 40, 0.10), 0 2px 4px -2px rgba(16, 24, 40, 0.06);
--shadow-lg: 0 12px 16px -4px rgba(16, 24, 40, 0.08), 0 4px 6px -2px rgba(16, 24, 40, 0.03);

--duration-fast: 120ms;  /* hover, foco */
--duration-base: 200ms;  /* modales, paneles */
--easing-standard: cubic-bezier(0.2, 0, 0, 1);
```

Regla: solo transicionar `opacity`, `transform`, `background-color`, `border-color`,
`box-shadow`. Respetar `prefers-reduced-motion: reduce` desactivando animaciones no
esenciales.

### 4.3 Layout

```css
--layout-max-width: 1280px;   /* contenedor de contenido */
--layout-sidebar-w:  256px;
--layout-topbar-h:   64px;
--layout-row-h:      52px;   /* fila de tabla / item de lista */
```

- Contenedor: `max-width` + `padding-inline: var(--space-6)`.
- Grid responsive, sin librerías:
  - `≥1200px` → sidebar fijo 256 px + contenido en 12 columnas.
  - `768–1199px` → sidebar colapsable a íconos (72 px).
  - `<768px` → sidebar como drawer, tablas → tarjetas apiladas.
- Contenedor raíz: sin `width: 1126px` fijo ni `border-inline` (del scaffold); usar
  `min-height: 100dvh` y `display: grid`.

### 4.4 Inventario de componentes

| Componente          | Variantes / estados                                                          | Notas de implementación |
| ------------------- | ---------------------------------------------------------------------------- | ----------------------- |
| `Button`            | `primary`, `secondary`, `ghost`, `danger`; `sm`, `md`; estados `hover/active/focus/disabled/loading` | `--space-3` horizontal, `--radius-md`, spinner en `loading`, `disabled` real (`aria-disabled`) |
| `Input`             | `default`, `error`, `disabled`, `readonly`                                   | Label siempre visible, `hint` bajo el campo, `error` con texto + ícono, `aria-invalid`, `aria-describedby` |
| `Select`            | igual que `Input`                                                             | Opciones de rol y estado de cita desde los enums del backend |
| `Textarea`          | igual que `Input`                                                             | para `notes`, `min-height` 96 px, contador de caracteres opcional |
| `DateTimePicker`    | `default`, `error`, `min-date`                                                | valor en ISO 8601 UTC (`.datetime()` que exige Zod), se muestra en locale `es-ES` |
| `Card`              | `default`, `interactive`                                                      | `--space-6` interno, `--radius-lg`, `--shadow-sm` |
| `Badge`             | `scheduled`, `completed`, `cancelled`, `role-admin`, `role-medico`, `role-paciente` | ver §4.5, ícono + texto (nunca solo color) |
| `Table`             | estados `loading` (skeleton), `empty`, `error`, `populated`                   | encabezado con `scope="col"`, zebra con `--color-bg-subtle` |
| `Modal`             | `sm`, `md`, `lg`; overlay, foco atrapado, `Esc` cierra                         | `role="dialog"`, `aria-modal="true"`, botón de cierre con `aria-label` |
| `Alert` / `Banner`  | `info`, `success`, `warning`, `error`                                          | above the fold en formularios, icono + mensaje, botón de acción opcional |
| `EmptyState`        | con ícono, título, descripción, acción                                        | para “Sin citas”, “Sin resultados” |
| `Skeleton`          | `text`, `circle`, `block`                                                     | shimmer con `--duration-base`, respetando reduced-motion |
| `Tabs`              | `Agenda`, `Historial`                                                          | `role="tablist"`, navegación con flechas |
| `Toast`             | `success`, `error`, `info`                                                     | región `aria-live="polite"`, auto-dismiss 4 s, accion “Deshacer” opcional |
| `Sidebar` / `Topbar`| `expanded`, `collapsed`; item `active`, con badge de conteo                     | `aria-current="page"` en el activo |
| `Avatar`            | `sm`, `md`, `lg`                                                               | iniciales; color derivado de un hash del email, determinista |
| `Pagination`        | —                                                                              | tamaños 10/25/50, deshabilitado en single-page |

### 4.5 Badges de estado (mapeo directo a la API)

| Valor API      | Etiqueta ES | Fondo            | Texto          | Ícono        |
| -------------- | ----------- | ---------------- | -------------- | ------------ |
| `SCHEDULED`    | Agendada    | `--color-warning-bg` | `--color-warning` | calendar  |
| `COMPLETED`    | Completada  | `--color-success-bg` | `--color-success` | check     |
| `CANCELLED`    | Cancelada   | `--color-danger-bg`  | `--color-danger`  | x-circle |

| Valor API | Etiqueta | Color      |
| --------- | -------- | ---------- |
| `ADMIN`    | Administrador | `--color-brand-700` |
| `MEDICO`   | Médico        | `--color-info`      |
| `PACIENTE`  | Paciente      | `--color-text-muted` |

`border-radius: var(--radius-full)`, `padding: var(--space-1) var(--space-3)`,
`font-size: var(--text-xs)`, `text-transform: uppercase`,
`letter-spacing: var(--tracking-wide)`, `font-weight: var(--weight-semibold)`.

### 4.6 Formularios

- Layout: una columna, labels arriba, `gap: var(--space-4)`.
- Validación: en `blur` para campos de texto, en `change` para selects/fechas; nunca
  deshabilitar el submit como validación (usar submit deshabilitado solo mientras hay
  `loading`).
- Errores: `Alert` arriba del formulario + mensaje en el campo; ambos en español.
- Login → `/users/login`; Registro → `/users/register` (sin selector de rol: se fija `PACIENTE`).
- Alta de cita → `POST /appointments`: paciente, médico, fecha/hora, notas.
- Cambio de estado → `PATCH /appointments/:id/status` con confirmación (`Modal`) cuando la
  transición sea `CANCELLED` o `COMPLETED`.

### 4.7 Estados de página (todas las vistas)

1. **Loading** → `Skeleton` con la forma del contenido real (nunca spinner a pantalla completa
   en tablas).
2. **Vacío** → `EmptyState`: “Sin citas registradas” / “No hay resultados para estos filtros”.
3. **Error** → `Alert error` con mensaje del backend (`message`) y botón Reintentar.
4. **Éxito** → `Toast success` + actualización optimista solo para cambios de estado.

### 4.8 Accesibilidad

- Foco visible: `outline: 2px solid var(--color-focus-ring); outline-offset: 2px` en todos los
  interactivos.
- Orden de tabulación lógico; modales con foco atrapado y retorno al elemento disparador.
- `aria-live="polite"` para toasts y cambios de estado de carga; `assertive` solo para errores
  de formulario.
- Navegación completa por teclado en `Sidebar`, `Tabs`, `Table` y `Modal`.
- Iconos decorativos con `aria-hidden="true"`; botones solo-ícono requieren `aria-label`.
- No depender solo del color (§4.1.2).

### 4.9 Formato de fechas y números

```js
new Intl.DateTimeFormat('es-ES', { dateStyle: 'medium', timeStyle: 'short' })
new Intl.NumberFormat('es-ES')
```

Todo intercambio con la API en ISO 8601 UTC; conversión solo en la capa de presentación.

---

## 5. Estructura de la app cliente

```
FrontEndd-app-INGWEB/src/
├── api/
│   ├── axios.js            # instancia base, VITE_API_URL, timeout 15000
│   ├── users.api.js        # register / login
│   └── appointments.api.js # create / list / updateStatus
├── auth/
│   ├── AuthContext.jsx     # { token, user, role }, login, logout
│   └── ProtectedRoute.jsx  # guarda por sesión + rol
├── components/
│   ├── ui/                 # Button, Input, Card, Badge, Table, Modal…
│   └── layout/             # Sidebar, Topbar, PageContainer
├── pages/
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── Dashboard.jsx
│   └── appointments/       # List.jsx, Create.jsx
├── hooks/                  # useAuth, useAppointments, useDebounce
├── styles/
│   ├── tokens.css          # §4.2
│   ├── base.css            # reset + tipografía + elementos
│   └── *.module.css        # CSS Modules por componente
└── utils/
    ├── dates.js            # Intl formatting
    └── status.js           # estado → { label, color, icon }
```

Variables de entorno (`.env`, ya presentes en `.env.example`):

```
VITE_APP_NAME=Sistema Clinicas
VITE_API_URL=http://localhost:3000/api
```

Añadir `VITE_API_TIMEOUT_MS` si el timeout deja de ser fijo.

---

## 6. Permisos por rol

### 6.1 Matriz de navegación

| Vista / acción             | ADMIN | MEDICO | PACIENTE |
| -------------------------- | :---: | :----: | :-------: |
| Dashboard                  |  ✔    |   ✔    |    ✔     |
| Ver todas las citas        |  ✔    |   ✔    |    ✘     |
| Ver citas propias          |  ✔    |   ✔    |    ✔     |
| Crear cita                 |  ✔    |   ✔    |    ✔     |
| Cancelar cita              |  ✔    |   ✔    |    propia |
| Marcar completada          |  ✔    |   ✔    |    ✘     |
| Notas de la cita           |  ✔    |   ✔    | lectura  |
| Gestión de usuarios        |  ✔    |   ✘    |    ✘     |

### 6.2 Filtrado en la UI

- El sidebar renderiza únicamente ítems permitidos por `role`.
- `role: 'PACIENTE'` → el `patientId` se toma del token (`userId`), nunca de un selector.
- `role: 'MEDICO'` → el `doctorId` se toma del token; la lista se filtra en cliente.
- El registro público siempre crea `PACIENTE`; la promoción de roles es responsabilidad de
  `ADMIN` (endpoint pendiente, ver §7).

---

## 7. Deuda técnica y trabajo pendiente

Detectado al revisar el código; afecta la consistencia del diseño:

**Backend**

1. No existe verificación de JWT ni middleware de autorización por rol; el cliente asume
   reglas que el servidor no fuerza.
2. Sin migraciones Prisma (`prisma/migrations/`) ni `prisma migrate deploy` en el arranque;
   las tablas `User` y `Appointment` se crean manualmente.
3. `validate.middleware.ts` valida pero descarta el resultado de `parseAsync`: los datos
   parseados no llegan al service, por eso los controllers usan `req.body` sin Tipar.
4. Inconsistencia de puertos: `user-service` en 3001 y `appointment-service` en 8000;
   unificar (p. ej. 3001 / 3002) y ajustar `APPOINTMENT_SERVICE_URL`.
5. Sin paginación, orden ni filtros por rango de fechas en `GET /appointments`.
6. `JWT_SECRET` con valor por defecto en `docker-compose.yml` y `fallback_secret` en el
   servicio: fallar al arrancar si no hay secret definido.
7. Falta un servicio de médicos/pacientes para resolver nombres por `doctorId` / `patientId`.

**Frontend**

8. `App.jsx` es el scaffold de Vite sin estilos propios; `index.css` / `App.css` tienen que
   reemplazarse por `tokens.css` + `base.css` + CSS Modules.
9. `axios` no tiene interceptores de token ni normalización de errores (§3.1).
10. Sin librería de rutas: falta React Router para login/registro/dashboard y las guardas de rol.
11. Sin estado global ni capa de caché de citas; definir `useAppointments` con revalidación
    tras mutaciones.
12. Sin librería de tests ni de componentes accesibles; recomendar Vitest + Testing Library
    y Playwright para los flujos de login y reserva de cita.

---

## 8. Checklist de contribución

- [ ] Ningún valor de color, espacio o tipografía hardcodeado: solo `var(--…)`.
- [ ] Componentes nuevos en `components/ui` con CSS Module propio.
- [ ] Estados de UI cubiertos: loading, vacío, error, éxito.
- [ ] Errores del backend mostrados en español usando `message`; `stack` nunca renderizado.
- [ ] Estados de cita renderizados siempre con el `Badge` de §4.5 (ícono + texto).
- [ ] Foco visible y navegación por teclado verificados.
- [ ] Vista y acciones filtradas por `role`.
- [ ] Responsive verificado en 375 px, 768 px y 1280 px.
- [ ] `npm run lint` sin errores antes de abrir PR.