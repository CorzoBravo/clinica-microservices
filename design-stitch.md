# Stitch Design Style — Sistema Clinicas

Traducción del sistema de diseño de [`design.md`](./design.md) a **prompts listos para pegar en
Google Stitch** (stitch.withgoogle.com). Objetivo: que las pantallas generadas por Stitch salgan
visualmente coherentes entre sí y con los tokens CSS definidos en `design.md` §4.2.

**Idioma de los prompts:** inglés (Stitch responde mejor), con **etiquetas de UI en español**
(«Iniciar sesión», «Nueva cita», «Citas agendadas») porque la app es completamente en español.

---

## 0. Workflow recomendado

1. Copiar el **Theme block** (§2) en el campo de tema de Stitch una vez por proyecto.
2. Pegar el **Design language prompt** (§1) al inicio de *cada* prompt de pantalla.
3. Generar primero el **layout base** (§5.1), luego reutilizarlo como referencia visual
   ("match the style of my previous screens") en el resto.
4. Para pantallas con datos, pedir siempre el **estado por defecto + vacío + error**, no solo
   el estado poblado.
5. Tras cada generación, corregir tokens en `tokens.css` del repo (§10) antes de codificar:
   Stitch devuelve hex aproximados, los tokens del repo son la fuente de verdad.

---

## 1. Design language prompt (bloque maestro)

Pegar antes de cada prompt de pantalla.

```
Design language for a medical clinic management web app called "Sistema Clinicas".
Professional healthcare SaaS UI. Calm, precise, high legibility, low decoration.

AESTHETIC
Minimal enterprise healthcare dashboard. Clean white surfaces on a very light gray
page background. Medium information density. Generous but not wasteful spacing.
Borders are thin and light; shadows are almost invisible except on floating layers.
No gradients, no glassmorphism, no neon, no illustrations, no 3D, no playful shapes.

COLOR
One single accent: a confident medical blue #2563EB for primary actions, active nav
items and links. Neutrals do all the structural work.
Text #1F2430, secondary text #667085, borders #E3E6EA, page background #F7F8FA,
card surface #FFFFFF.
Semantic colors are muted and used only as small status accents:
success #0F9D58 (completed), warning #B54708 (scheduled / pending),
danger #D92D20 (cancelled / errors), info #0E7490.
Status colors appear only inside small badges, never as large filled blocks.

TYPOGRAPHY
System sans-serif stack (system-ui, Segoe UI, Roboto). Tight, confident headings at
weight 600 with slight negative letter-spacing, max 22px for page titles — never giant
hero headings. Body 14-16px. Small uppercase tracked labels for badges and table headers.
Numbers and IDs may use a monospace font.

SHAPE AND SPACING
4px spacing base, 8-12px radii, fully rounded pill badges, 8px button radius,
12px card and modal radius. Buttons are 40px tall, inputs 40px tall, table rows 52px.
Left navigation rail 256px wide with a 64px top bar.

COMPONENTS
Solid primary button with white label, outlined secondary button, ghost tertiary button,
danger button in soft red. Inputs always show a visible label above the field, optional
helper text below, and error state in red with a small icon plus an inline message.
Cards with 24px internal padding. Data tables with a light header row, subtle row
separators, zebra striping, and status badges on the right column.

LAYOUT
Persistent left sidebar navigation with icon + label items, active item highlighted with
a light blue background and a blue left accent border. Page header with title on the left
and a primary action button on the right. Content in a single 12-column max-1280px
container. Below 768px the sidebar collapses to a bottom tab bar or drawer and tables
become stacked cards.

STATE COVERAGE
Every screen must be designed in four states: default/loading skeleton, empty state with
icon and a call to action, error banner with a Retry action, and populated content.

DENSITY AND TONE
Copy is in Spanish, short and clinical: "Iniciar sesión", "Citas agendadas",
"Nueva cita", "Cancelada", "Sin citas registradas", "Reintentar".
```

---

## 2. Theme block

Adaptar al esquema de tema que Stitch tenga disponible en el momento; los **hex son la fuente de
verdad** y coinciden con `design.md` §4.2.

```yaml
# Sistema Clinicas — Stitch theme
name: Sistema Clinicas
description: Clinical SaaS, calm blue accent, dense data views, light + dark

primaryColor: "#2563EB"      # --color-brand-500
primaryHover: "#1D4ED8"      # --color-brand-600
primarySubtle: "#EEF4FF"     # --color-brand-50

secondaryColor: "#0E7490"    # --color-info
successColor: "#0F9D58"      # --color-success
warningColor: "#B54708"      # --color-warning
errorColor: "#D92D20"        # --color-danger

backgroundColor: "#F7F8FA"   # --color-bg-subtle
surfaceColor: "#FFFFFF"      # --color-surface
borderColor: "#E3E6EA"       # --color-border
textColor: "#1F2430"         # --color-text
textMutedColor: "#667085"    # --color-text-muted

cornerRadius: 8              # --radius-md (badges use full, cards 12)
roundness: 2                 # low / soft, never pill-shaped buttons
borderWeight: 1
shadowStyle: none            # only modals and dropdowns cast a soft shadow

fontFamily: "system-ui, 'Segoe UI', Roboto, sans-serif"
fontWeights: [400, 500, 600]
baseFontSize: 16
lineHeight: 1.5

# Dark theme
dark:
  backgroundColor: "#101318"
  surfaceColor: "#1A1F27"
  borderColor: "#2A313C"
  textColor: "#E7EAF0"
  textMutedColor: "#9AA4B2"
  primaryColor: "#4D84F5"
  successColor: "#34C98A"
  warningColor: "#E2A04A"
  errorColor: "#F26D63"
```

---

## 3. Inventario visual de referencia (para_description en Stitch)

| Elemento                  | Especificación exacta                                              |
| ------------------------- | ------------------------------------------------------------------ |
| Sidebar                   | 256 px, fondo `--color-surface`, borde derecho `--color-border`; item activo: bg `--color-brand-50`, texto `--color-brand-700`, borde izquierdo 3 px `--color-brand-500`; item inactivo: `--color-text-muted`; altura de item 44 px, radio 8 px, margen 12 px |
| Topbar                    | 64 px, borde inferior 1 px `--color-border`, título de página 20 px/600 a la izquierda, avatar 32 px y nombre a la derecha |
| Page header               | Título 22 px/600 + subtítulo 14 px `--color-text-muted`; botón primario a la derecha |
| Botón primario            | bg `--color-brand-500`, texto blanco, 40 px alto, padding 0 16 px, radio 8 px, peso 500 |
| Botón secundario          | borde 1 px `--color-border-strong`, fondo blanco, texto `--color-text` |
| Botón ghost               | sin fondo, texto `--color-brand-500`                                 |
| Input                     | 40 px alto, radio 8 px, borde `--color-border`, foco = borde `--color-brand-500` + anillo 3 px `--brand-500/15%`, placeholder `--color-text-muted` |
| Input error               | borde `--color-danger`, mensaje 13 px `--color-danger` con ícono de alerta |
| Tarjeta                   | fondo blanco, borde 1 px `--color-border`, radio 12 px, padding 24 px, sombra mínima |
| Tabla                     | encabezado fondo `--color-bg-subtle`, texto 12 px mayúscula `--color-text-muted`; filas 52 px con separador 1 px `--color-border`; zebra en `--color-bg-subtle` |
| Badge de estado           | pill, 24 px alto, 12 px, mayúscula, tracking 0.04 em; `Agendada` ámbar, `Completada` verde, `Cancelada` rojo, cada uno con su ícono |
| Stat tile (dashboard)     | tarjeta con etiqueta 13 px `--color-text-muted`, número 28 px/600, delta con flecha verde/roja |
| Modal                     | overlay negro 40 %, diálogo 480 px, radio 12 px, título 18 px/600, botones a la derecha |
| Skeleton                  | bloques gris claro `--color-bg-subtle` con shimmer muy sutil, respetando la forma real del contenido |
| Empty state               | ícono 48 px `--color-text-muted`, título 16 px/600, descripción 14 px `--color-text-muted`, botón secundario |

---

## 4. Prompts reutilizables

### 4.1 Prefijo de layout (app shell)

```
A full app shell for a clinic management app: fixed 256px left sidebar with icon +
label navigation (Resumen, Citas, Usuarios, Perfil) and a 64px top bar with the page
title on the left and a user avatar + name on the right. White sidebar and top bar,
1px light gray borders, light gray page background, 1280px max-width content area,
24px gutters. Follow the design language above exactly.
```

### 4.2 Sufijo de estados

```
Also generate three sibling states of this screen:
1) loading — content-area skeletons in the same shapes, no full-screen spinner;
2) empty — centered empty state with icon, Spanish title, Spanish description, action button;
3) error — red inline alert banner at the top of the content area with a "Reintentar" button,
   the rest of the screen intact.
```

---

## 5. Prompts por pantalla

### 5.1 App shell (generar primero)

```
Design the application shell for "Sistema Clinicas", a medical clinic management web app.
[PASTE HERE: Design language prompt — §1]
[PASTE HERE: Theme block — §2]

Layout: fixed 256px left sidebar, 64px top bar, 1280px max-width content area.

Sidebar, top to bottom:
- Brand block: a small 32px blue rounded square with a white medical cross glyph, then
  "Sistema Clinicas" at 15px weight 600.
- Nav group label "PRINCIPAL" (12px uppercase, muted), items: Resumen (grid icon),
  Citas (calendar icon), Usuarios (users icon).
- Nav group label "GESTIÓN", items: Usuarios, Configuración.
- Bottom of sidebar: a compact card with role badge "ADMIN" and user email, above a
  "Cerrar sesión" ghost item with a logout icon.
- Active item "Resumen": light blue background, blue text, 3px blue left accent bar.

Top bar: page title left, and on the right a search field (280px, placeholder "Buscar
paciente o médico"), a notification bell icon button with a small blue dot, and an avatar
with initials "LV" that opens a dropdown.

Content area is empty (this is the shell). Canvas 1440x900.
```

### 5.2 Login

```
Design the login screen for "Sistema Clinicas", a clinic management web app.
[Design language prompt]

Two-column centered layout on a #F7F8FA background, 980px total width.
Left column (40%): brand block with the blue cross mark and "Sistema Clinicas", a
headline "Gestión de citas médicas" (28px, weight 600), and a short muted paragraph
"Agenda, gestiona y da seguimiento a las consultas de tu clínica." Below it, three small
feature rows with line icons: "Agenda y cancela citas", "Historial de consultas",
"Roles y permisos".
Right column (60%): a white card, 440px wide, radius 12px, 1px border, 32px padding, with:
- Title "Iniciar sesión" 20px weight 600
- Field "Correo electrónico" with placeholder "medico@clinica.com"
- Field "Contraseña" with a show/hide eye icon at the right
- A row with a "Recordarme" checkbox and a "Olvidé mi contraseña" link in blue
- Full-width primary button "Iniciar sesión", 40px tall
- Divider with the text "o"
- Outlined full-width button "Crear cuenta" with a user-plus icon
- Footer note in 13px muted text: "Acceso exclusivo para personal autorizado."
Do not include social login buttons, captcha, or a terms checkbox.
[Suffix de estados: error de validación en ambos campos con mensajes en español
"Debe ser un email válido" / "La contraseña debe tener al menos 6 caracteres",
y banner de error "Credenciales inválidas" arriba del formulario]
Canvas 1440x900.
```

### 5.3 Registro

```
Design the patient registration screen for "Sistema Clinicas".
[Design language prompt]

Same centered two-column shell as the login screen, but the card on the right is 480px
with title "Crear cuenta de paciente" and a muted subtitle "Registro para nuevos pacientes".
Form fields stacked with 16px gaps:
- "Nombre completo" with a user icon
- "Correo electrónico"
- "Contraseña" with eye toggle and a helper text below in muted 13px:
  "Mínimo 6 caracteres"
- "Confirmar contraseña" with eye toggle
- A single select "Tipo de usuario" fixed to "Paciente" and visually disabled, with a
  helper text: "Tu cuenta se creará con permisos de paciente. Un administrador podrá
  cambiarlos más adelante."
- Primary full-width button "Crear cuenta"
- Footer link centered: "¿Ya tienes cuenta? Iniciar sesión"
[Add error state: red border + inline messages on the password fields when they don't match,
and a top banner "El usuario ya existe"]
Canvas 1440x900.
```

### 5.4 Dashboard / Resumen

```
Design the "Resumen" dashboard for "Sistema Clinicas", a clinic management web app.
[Design language prompt]
[App shell prompt — §4.1]

Content area, 12-column grid with 24px gaps:

Row 1 — four stat tiles, each a white card with radius 12px, 1px border, 24px padding:
- "Citas hoy" value "24" with a green "+12% vs. semana pasada" and a blue calendar icon
  in a light blue square.
- "Pendientes" value "9" with an amber "+3 hoy" and an amber clock icon.
- "Completadas" value "132" with a green "+8% este mes" and a green check icon.
- "Pacientes activos" value "1.204" with a muted "+24 este mes" and a users icon.
Numbers 28px weight 600, labels 13px muted uppercase tracking.

Row 2 — two cards, 8 columns each:
Left card "Citas de hoy" with a header row (title + text button "Ver todas" in blue) and a
list of 5 appointments. Each row: a 40px circular avatar with initials in a muted blue
square, patient name 14px weight 500, below it the doctor's name and specialty in 13px
muted, on the right the time "09:00" 14px weight 500 and a pill badge
("Agendada" amber / "Completada" green / "Cancelada" red).

Right card "Estado de citas" — a small horizontal stacked bar chart with three segments
(green completed, amber scheduled, red cancelled) using muted tones, a legend below with
the three labels and counts, and a caption "Últimos 30 días".

Row 3 — "Agenda de la semana" card, full width: a 7-column mini calendar strip
(lun–dom) with the active day highlighted in blue, and below it a horizontal timeline
09:00–14:00 with four appointment blocks placed on it, each a light blue rounded rect with
the patient name inside.

Include the loading, empty and error states from the suffix.
Canvas 1440x1100.
```

### 5.5 Lista de citas

```
Design the "Citas" list screen for "Sistema Clinicas".
[Design language prompt]
[App shell prompt — §4.1]

Page header: title "Citas" (22px, weight 600) with subtitle "Gestiona y da seguimiento a
las consultas" (14px muted), and a primary button "Nueva cita" with a plus icon.

Filter bar: a white card with 24px padding and 12px gaps containing:
- Select "Estado" (Todas / Agendadas / Completadas / Canceladas)
- Date range inputs "Desde" and "Hasta"
- Select "Médico" and select "Paciente" with a search icon
- Search field "Buscar por paciente" (240px)
- Ghost text button "Limpiar filtros" in blue

Results header row: "24 citas" in 14px muted on the left, and on the right a view toggle
(three icon buttons: list active, grid, calendar) plus a "Filas: 25" select.

Data table, white card, radius 12px:
- Header row on light gray background, 12px uppercase muted labels:
  Paciente | Médico | Fecha y hora | Tipo | Estado | Acciones
- Rows 52px tall: patient cell has a 32px avatar with initials + name (500) and below it
  the patient ID in monospace 12px muted; doctor cell shows the name and specialty in
  13px muted; date cell "12 mar 2026" over "09:00" in 13px muted; type is a subtle gray
  pill ("Consulta general", "Control", "Vacunación"); status is a pill badge; actions are
  three ghost icon buttons (edit pencil, check, x) with tooltips "Editar", "Marcar
  completada", "Cancelar".
- Right-align the status and actions columns.

Below the table: pagination — "Mostrando 1–25 de 24", page buttons with 1 active in blue,
previous/next chevrons, and a "25 por página" select.
[Add the loading, empty and error states from the suffix; for the empty state use
"No hay citas para estos filtros" with a "Limpiar filtros" action]
Canvas 1440x1200.
```

### 5.6 Nueva cita (formulario)

```
Design the "Nueva cita" screen for "Sistema Clinicas".
[Design language prompt]
[App shell prompt — §4.1]

Two-column layout inside the content area: the form on the left at 8 columns, a summary
card on the right at 4 columns.

Left — white card, radius 12px, 24px padding, title "Datos de la cita" 18px weight 600:
- Row of two fields: select "Médico" (searchable, placeholder "Selecciona un médico") and
  select "Paciente" (searchable, placeholder "Busca por nombre o ID").
- Full-width field "Fecha" (date) and "Hora" (time) side by side.
- Select "Tipo de consulta" (Consulta general / Control / Vacunación / Procedimiento).
- Full-width textarea "Motivo de la consulta" with placeholder "Describe brevemente el
  motivo…" and a character counter "0 / 500" in muted 12px at the bottom right.
- Footer row inside the card, right aligned: ghost button "Cancelar" and primary button
  "Agendar cita" with a calendar-check icon, plus a muted hint below the buttons:
  "Recibirás una confirmación en el correo del paciente."

Right — a sticky summary card titled "Resumen" with a light blue background
(#EEF4FF) and no border: rows for Médico, Paciente, Fecha y hora, Tipo and Estado, each
label 12px uppercase muted above its value 14px weight 500; the Estado value is an amber
"Agendada" pill. Bottom row separated by a thin line with the note "Podrás cambiar el
estado en cualquier momento desde la lista de citas."
[Add error state: inline red messages such as "Cita no encontrada" in a banner and
required-field errors under each field]
Canvas 1440x1000.
```

### 5.7 Detalle de cita + cambio de estado (modal)

```
Design the appointment detail view with a status-change confirmation modal, for
"Sistema Clinicas".
[Design language prompt]
[App shell prompt — §4.1]

Base screen: a white card titled "Cita #1042" with the status badge "Agendada" in the
top-right corner, then a two-column definition list — Paciente (avatar + name + ID),
Médico (avatar + name + specialty "Cardiología"), Fecha y hora ("12 mar 2026 · 09:00"),
Tipo de consulta, Motivo (multiline text) — and a footer with buttons
"Editar cita" (outlined) and "Cancelar cita" (danger, red outline).

Overlay the screen with a centered confirmation modal, 440px wide, white, radius 12px,
soft shadow, on a 40% black backdrop:
- Small amber circular icon with a warning glyph
- Title "¿Cancelar esta cita?" 18px weight 600
- Body 14px muted: "Se notificará al paciente. Esta acción no se puede deshacer."
- A compact summary row of the appointment: patient name and "12 mar · 09:00"
- Footer buttons right aligned: secondary "Volver" and danger solid "Sí, cancelar cita"
Show also a second sibling modal variant where the icon is green and the title is
"Marcar cita como completada", with a danger-to-success color swap.
Canvas 1440x900.
```

### 5.8 Usuarios (solo ADMIN)

```
Design the "Usuarios" administration screen for "Sistema Clinicas".
[Design language prompt]
[App shell prompt — §4.1]

Header: title "Usuarios" with subtitle "Administra los accesos a la plataforma" and a
primary button "Invitar usuario" with a user-plus icon.

A single white card containing a table:
- header: Usuario | Rol | Estado | Último acceso | Acciones
- row cell: 32px avatar with initials + name 14px weight 500, below it the email 13px muted
- role rendered as a pill: "Administrador" (blue outline), "Médico" (teal outline),
  "Paciente" (gray outline)
- status as a green "Activo" or a red "Inactivo" dot + label
- last access as relative time "hace 2 h" in 13px muted
- actions: three ghost icon buttons (edit, role switch, disable) with tooltips

Top of the card, above the table, a compact filter row: search field "Buscar por nombre o
correo" and selects "Rol" and "Estado".
[Add the loading, empty and error states from the suffix]
Canvas 1440x900.
```

### 5.9 Perfil / sesión (dropdown y avatar)

```
Design two small overlays for "Sistema Clinicas".
[Design language prompt]

1) User dropdown, 260px wide, white, radius 12px, soft shadow, anchored under the top
bar avatar: header block with a 40px avatar, the name 14px weight 500, the email 13px
muted, and a role pill ("ADMIN" blue) below; a thin divider; then items with line icons:
"Mi perfil", "Cambiar contraseña", "Preferencias", a divider, and a red-tinted
"Cerrar sesión".
2) A 320px "Cambiar contraseña" modal: title, three fields ("Contraseña actual",
"Nueva contraseña", "Confirmar nueva contraseña") each with an eye toggle, helper text
"Mínimo 6 caracteres", and a footer with "Cancelar" and a primary "Guardar cambios".
Canvas 800x700.
```

---

## 6. Prompts por componente (biblioteca)

Generar en isolation para tener pieces reusables, con el estilo de §1.

| Componente         | Prompt                                                                                                                             |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------- |
| `Button`           | A component sheet showing 4 button variants — primary blue, outlined secondary, ghost text, and red danger — in three sizes (small 32px, default 40px, large 48px), plus a loading state with a spinner and a disabled state at 40% opacity. Flat vector, light gray background, generous spacing, no shadows. |
| `Input`            | A form field component sheet: default, focused (blue border with soft ring), filled, error (red border, red 13px message with alert icon), disabled and read-only. One example with a helper text below. Include label above and a character counter variant for a textarea. |
| `Badge`            | A pill badge component sheet in two rows: status badges "Agendada" amber, "Completada" green, "Cancelada" red, each with a small leading line icon; role badges "ADMIN" blue, "MEDICO" teal, "PACIENTE" gray. 24px tall, uppercase, subtle tinted background, no border. |
| `Select`          | A dropdown select component sheet: closed state with placeholder text, open state with 5 options and one highlighted, a native-looking one with a search field, and a multi-select with removable chips. |
| `Card`             | A card component sheet: a plain card with title and body, a stat card with label, big number and a delta, an interactive card with hover lift, and an empty card. White, radius 12px, 1px light gray border, soft shadow. |
| `Table`            | A data table component sheet with four states: loading (gray skeleton rows), populated (5 rows with avatar, two-line name cell, badges, icon actions, zebra striping), empty (centered message inside the table body) and error (red banner row). |
| `Modal`            | A modal component sheet: confirmation modal (icon, title, body, two buttons), form modal (fields and full-width footer buttons), and a destructive confirmation. Show the backdrop and two sizes. |
| `EmptyState` / `ErrorState` | Two panels: an empty state with a large outlined icon, title, description and a secondary button; an error state with a red alert banner, an icon, a message and a "Reintentar" primary button. |
| `Skeleton`         | A loading skeleton sheet: text line placeholders of varying widths, a circle, an avatar circle, a card block, and full table rows. Very light gray blocks on white, subtle shimmer. |
| `DateTimePicker`   | A calendar popover component sheet: month header with arrows, a week grid with today outlined in blue and the selected day filled in blue, plus a separate time picker with hour/minute columns and a highlighted selection. |
| `Tabs`             | A tab bar component sheet with three tabs "Agenda", "Historial", "Todos", the first active with a blue underline, plus a segmented control variant. |
| `Toast`            | A toast component sheet: three stacked notifications anchored bottom-right — success green, error red, info teal — each with an icon, a message, a close button and a subtle shadow. |
| `Sidebar`          | A navigation sidebar component sheet in expanded and collapsed states, showing group labels, active item with the left accent bar, and a badge count on one item. |

---

## 7. Variantes y adaptations

### 7.1 Modo oscuro

```
Redesign this screen in dark mode for "Sistema Clinicas". Keep the exact same layout and
component geometry. Page background #101318, cards #1A1F27, 1px borders #2A313C,
primary text #E7EAF0, secondary text #9AA4B2. The primary accent becomes a lighter blue
#4D84F5. Status colors brighten to #34C98A green, #E2A04A amber, #F26D63 red, each on a
dark tinted badge background. Shadows become invisible; rely on borders for separation.
Do not add gradients or glow effects.
```

### 7.2 Responsive

```
Redesign this screen at 375px width (mobile) for "Sistema Clinicas". Keep the visual
identity and colors. The sidebar becomes a bottom tab bar with 4 icon + label items.
Page padding drops to 16px. Type scale reduces: page title 18px, body 14px.
Data tables become stacked cards: each appointment renders as a white card with the
patient name and status badge on the first row, then date, doctor and type as label/value
rows. Buttons go full width in forms. The stat tile grid becomes a 2-column grid.
Show the same screen at 768px with a collapsible sidebar as an intermediate step.
```

### 7.3 Estados de rol (mismo template, distinto contenido)

Pedir la misma pantalla tres veces cambiando solo la navegación y los permisos visibles:

| Variante      | Diferencias a pedir                                                                                                              |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| **PACIENTE**  | "Oculta el ítem Usuarios. En la lista de citas quita las columnas Médico y Tipo, y muestra solo las citas propias con un badge 'Mi cita'. En el formulario de nueva cita quita el selector de Médico y de Paciente (se autocompletan desde la sesión)." |
| **MEDICO**    | "Oculta el ítem Usuarios. En la lista de citas quita el selector de Paciente y prellena el filtro por el médico de la sesión. Muestra las notas de la cita como campo editable." |
| **ADMIN**     | "Muestra el ítem Usuarios con badge de conteo, agrega los filtros por rol y estado, y agrega las acciones masivas 'Marcar completada' y 'Exportar CSV'." |

---

## 8. Guardarraíles (qué no pedirle a Stitch)

Evitar estos errores frecuentes; si aparecen, reformular el prompt:

- **No** pedir "gradientes", "glassmorphism", "neón", "3D", "ilustraciones", "emoji" — rompen el
  tono clínico de §1.
- **No** pedir "dashboard con gráficos 3D" ni "pie charts 3D"; usar solo barras horizontales y
  líneas simples con tonos apagados.
- **No** pedir "sidebar colapsable con hover expansion" — la versión colapsada es fija de 72 px.
- **No** pedir login con Google/Apple, MFA, captcha ni checkbox de términos: no existen en el
  alcance actual.
- **No** pedir vistas que el backend no soporta: no hay historial clínico, ni reportes, ni
  facturación, ni archivos/subidas, ni notificaciones push, ni paginación en la API (el listado
  devuelve todos los registros; la paginación es client-side).
- **No** pedir campos de perfil que no están en el modelo `User` (solo `email`, `role`); los
  nombres en pantalla son provisorios hasta que exista el servicio de médicos/pacientes.

---

## 9. Nomenclatura de pantallas (para mantener consistencia entre generaciones)

| # | Nombre Stitch         | Ruta SPA         | Rol                |
| - | --------------------- | ---------------- | ------------------ |
| 1 | `shell`               | —                | todos              |
| 2 | `login`               | `/login`         | público            |
| 3 | `registro`            | `/registro`      | público            |
| 4 | `dashboard`           | `/`              | todos              |
| 5 | `cistas-lista`        | `/citas`         | todos              |
| 6 | `cita-nueva`          | `/citas/nueva`   | ADMIN, MEDICO      |
| 7 | `cita-detalle`        | `/citas/:id`     | todos              |
| 8 | `usuarios`            | `/usuarios`      | ADMIN              |
| 9 | `perfil`              | `/perfil`        | todos              |

Al generar una pantalla nueva, incluir al final del prompt: *"Match the visual style, spacing
scale, badge styling and typography of my screens 1 to 8."*

---

## 10. Handoff: de la salida de Stitch al código

Stitch produce maquetas; el repo usa CSS puro con tokens (`design.md` §4.2). Procedimiento:

1. **Extraer tokens.** Comparar los hex de Stitch con `tokens.css`. Si difieren, **gana
   `design.md`** y se corrige el hex en la maqueta, no al revés.
2. **Rebuild con CSS Modules**, no con el CSS que emite Stitch:
   - `src/styles/tokens.css` ← solo variables (sin reglas).
   - `src/styles/base.css` ← reset, tipografía, elementos base.
   - `src/components/ui/<Componente>.jsx` + `<Componente>.module.css`, consumiendo
     `var(--…)` exclusivamente.
3. **Respetar los contratos de API** (`design.md` §3) en los estados: los textos de error
   provienen de `message` / `errors` del backend, en español.
4. **Separar estado vacío de estado de error** según §5 (sufijo de estados): nunca un único
   placeholder para los tres casos.
5. **Verificar responsive y dark mode** con las variantes de §7 antes de dar por cerrada una
   pantalla.
6. **Revisar contra el checklist** de `design.md` §8: foco visible, badges con ícono + texto,
   estados de carga/ vacío / error presentes, acciones filtradas por rol.

Referencias rápidas de implementación para conectar cada pantalla:

| Pantalla         | Llamadas API                                              |
| ---------------- | ---------------------------------------------------------- |
| `login`          | `POST /users/login` → guarda `token` + `role`              |
| `registro`       | `POST /users/register` (sin campo de rol)                  |
| `dashboard`      | `GET /appointments` + agregaciones en cliente               |
| `cistas-lista`   | `GET /appointments?patientId=&doctorId=` + filtro local    |
| `cita-nueva`     | `POST /appointments`                                       |
| `cita-detalle`   | `GET`/`PATCH /appointments/:id/status`                     |
| `usuarios`       | pendiente de endpoint (ver `design.md` §7)                |