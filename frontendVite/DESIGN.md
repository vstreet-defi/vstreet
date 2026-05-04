# 🎨 dApp Design System

## Visión General

El dApp de **vStreet** implementa un sistema de diseño moderno con:
- **Arquitectura**: Atomic Design (Atoms → Molecules → Organisms → Templates)
- **Tema**: Dark mode con acentos neon (Cyan + Lime)
- **Estilo Visual**: Glassmorphism + Gradients + Neon Glow
- **Animaciones**: Framer-motion para transiciones fluidas
- **Layout**: Grid responsivo con breakpoints adaptables

---

## 📊 Paleta de Colores

### CSS Variables (fuente única de verdad)
Definidas en `src/App.scss`:
```scss
--font-display: 'Space Grotesk', sans-serif;
--font-body: 'Space Grotesk', sans-serif;
--font-mono: 'JetBrains Mono', monospace;

--color-primary: #00ffc4;
--color-secondary: #4fff4b;
--color-accent: #ffb800;
--color-bg-main: #0d0d14;
--color-bg-footer: #08080c;
--color-bg-header: #1b1b1f;
--color-text-primary: rgba(255, 255, 255, 0.95);
--color-text-secondary: rgba(200, 210, 230, 0.7);
--color-text-tertiary: rgba(200, 210, 230, 0.45);
--gradient-primary: linear-gradient(135deg, #00ffc4 0%, #4fff4b 100%);
--gradient-hero: linear-gradient(135deg, #00ffc4 0%, #4fff4b 100%);
--gradient-section: linear-gradient(90deg, #00ffc4 0%, #4fff4b 100%);
--gradient-card: linear-gradient(180deg, #00ffc4 0%, #4fff4b 100%);
--shadow-glow: 0 0 8px currentColor;
--container-max: 1200px;
--transition-default: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
```

### Primarios
- **Cyan**: `#00ffc4` (principal, glow de 6px)
- **Lime**: `#4fff4b` (secundario, accents)
- **Accent**: `#ffb800` (naranja dorado, para highlights y CTAs)
- **Blanco**: `#ffffff` (texto principal)

### Fondos
- **Main Background**: `#0d0d14` (canvas oscuro unificado)
- **Footer Background**: `#08080c` (más profundo)
- **Header Background**: `#1b1b1f` (para elementos elevados)
- **Oscuro Base**: `rgba(18, 18, 21, 0.7)`
- **Oscuro Claro**: `rgba(27, 27, 31, 0.9)`
- **Transparente**: Para glassmorphism

### Estados
- **Hover**: `rgba(0, 255, 196, 0.05)` de fondo
- **Activo**: `#00ffc4` con border y glow
- **Deshabilitado**: `rgba(255, 255, 255, 0.35)`

---

## 🏗️ Estructura de Componentes

### Jerarquía Atomic Design

```
ATOMS (Elementos base)
├── CornerAccent          # Acentos angulares con glow
├── Button-Gradient-*     # Botones con gradients
├── Loader               # Spinner animado
├── CollateralAndBorrow  # Banner de información
├── ComingSoon           # Placeholder neon
├── SecuredByVara        # Badge de seguridad
└── Background           # Fondos decorativos

MOLECULES (Componentes simples)
├── alert-modal          # Modal de alertas
├── Borrow-Card         # Card de préstamo
├── cards               # Cards generales
├── Faucet-Card         # Faucet/Airdrop
├── StatCard            # Tarjeta de estadísticas
├── Loan-Info-Card      # Información de préstamo
├── VaultCard           # Card de bóveda
└── Percentage-Selector # Selector de porcentaje

ORGANISMS (Componentes complejos)
├── FundsManager        # Supply (Deposit/Withdraw)
├── FundsManagerBorrow  # Borrow logic
├── StatsPanel         # Panel lateral de stats
├── StakingInfo        # Info de staking
├── LoanInfo           # Info de préstamos
├── VaultsManager      # Gestor de bóvedas
├── ForgeManager       # Forge/VST system
└── Header             # Navegación principal

TEMPLATES (Layouts)
└── DappTemplate       # Layout grid principal
    ├── Banner
    ├── Sidebar Left
    ├── Main Content
    └── Sidebar Right
```

---

## 🎯 Layouts & Responsiveness

### DappTemplate - Grid System

**Layout Desktop** (1600px max-width)
```
┌─────────────────────────────────────┐
│          BANNER (full width)        │
├──────────────┬─────────────┬────────┤
│  Sidebar L   │   Main      │Sidebar │
│   (280px)    │  (1fr)      │ (280px)│
└──────────────┴─────────────┴────────┘
```

**Breakpoints**
- **Desktop**: 1600px → 3 columnas (280px | 1fr | 280px)
- **Laptop**: 1440px → 3 columnas (240px | 1fr | 240px)
- **Tablet**: 1024px → 2 columnas (1fr | 260px) - Oculta sidebar left
- **Mobile**: 822px → 1 columna (1fr) - Solo main content

### Especificaciones
- **Max-width**: 1600px
- **Padding**: 40px (desktop) → 16px (mobile)
- **Gap**: 16px (desktop) → 20px (mobile)
- **Min-height**: calc(100vh - 80px)

---

## 🎨 Elementos Visuales

### 1. Glassmorphism
**Aplicado en**: Cards, containers principales
```scss
background: linear-gradient(135deg, rgba(27, 27, 31, 0.9), rgba(18, 18, 21, 0.7));
backdrop-filter: blur(16px) saturate(180%);
-webkit-backdrop-filter: blur(16px) saturate(180%);
```

### 2. Gradient Borders
**Aplica en**: Cards, containers
```scss
border: 1.5px solid;
border-image: linear-gradient(135deg, rgba(0, 255, 196, 0.3), rgba(79, 255, 75, 0.2)) 1;
```

### 3. Neon Glow Effects
**Aplica en**: Text activo, borders
```scss
box-shadow: 0 0 8px var(--accent-color, #00ffc4);
text-shadow: 0 0 30px rgba(0, 255, 196, 0.4);
filter: drop-shadow(0 0 15px rgba(0, 255, 196, 0.6));
```

### 4. Corner Accents
**Componente**: `CornerAccent`
- Posiciones: top-left, top-right, bottom-left, bottom-right
- Colores: Cyan (#00ffc4) y Lime (#4fff4b)
- Dimensiones: length=40px, thickness=2px
- Efecto: Glow box-shadow

---

## ✍️ Tipografía

### Familias
- **Display & Body**: Space Grotesk (Sans-serif)
  - Weight: 400 (regular), 700 (énfasis)
  - Uso: Títulos, subtítulos, body text, botones, navegación
- **Mono**: JetBrains Mono (Monospace)
  - Weight: 400 (regular), 500 (destacado)
  - Uso: Labels técnicos, números, badges, código

### Escala de Tamaños
| Nivel | Tamaño | Weight | Uso |
|-------|--------|--------|-----|
| H1 | clamp(3rem, 8vw, 5rem) | 400 | Títulos principales (Hero) |
| H2 | clamp(1.8rem, 5vw, 3rem) | 400 | Títulos de sección |
| H3 | clamp(1rem, 3vw, 1.5rem) | 400 | Subtítulos |
| Body | 0.9rem | 400 | Texto regular |
| Small | 0.85rem | 400 | Texto secundario |
| Tiny | 0.7rem | 500 | Labels técnicos (mono) |

---

## 🎬 Animaciones & Transiciones

### Framer Motion
**Página transitions** (AnimatePresence)
```
Initial: opacity: 0, x: 20, blur: 10px
Animate: opacity: 1, x: 0, blur: 0px
Exit: opacity: 0, x: -20, blur: 10px
Duration: 0.4s, easing: easeInOut
```

### CSS Animations
**Neon Flickering** (ComingSoon)
```
keyframes: flickeringNeon (4s infinite)
- 0%, 18%, 22%, 25%, 53%, 57%, 100%: Full glow
- 20%, 24%, 55%: Sin shadow, opacity 0.3
```

### Transiciones Estándar
- **Color/Border**: 0.3s cubic-bezier(0.4, 0, 0.2, 1)
- **Opacity**: 0.2s ease-in-out
- **Scale**: 0.25s cubic-bezier(0.4, 0, 0.2, 1)

---

## 🔘 Componentes Base

### Botones
**Tipos**
- Gradient Fill: Fondo con gradient neon
- Gradient Border: Border animado
- Tabs: Clip-path angular, glow en activo

**Estados**
- Default: Fondo transparente, border subtle
- Hover: Fondo neon con opacidad baja
- Active: Border 2px neon, glow full
- Disabled: Opacity 0.5, cursor not-allowed

### Cards
**Base Properties**
- Border-radius: 12px
- Backdrop-filter: blur(16px) saturate(180%)
- Box-shadow: 0 12px 48px rgba(0, 0, 0, 0.4)
- Border: Gradient con acentos neon

### Modals
- AlertModal: Overlay oscuro, card centrada
- Animación: Fade + scale
- Z-index: 1000+

---

## 📱 Componentes Principales

### FundsManager (Supply Tab)
**Contenido**
- Header con título y descripción
- Tabs: Deposit / Withdraw
- FundsCard dentro
- Corner accents animados

**Estilos**
- Min-height: 480px
- Padding: 24px 32px (desktop)
- Gradient border con cyan y lime

### StatsPanel (Sidebar Left)
**Propósito**: Mostrar estadísticas de liquidez
- Responsive: Oculto en 1024px
- Ancho: 280px (desktop) / 240px (1440px)

### StakingInfo (Sidebar Right)
**Propósito**: Información de staking
- Responsive: Oculto en mobile
- Ancho: 280px

### Header
**Características**
- Navegación: Supply, Borrow, Vaults, VST
- Account button integrado
- Responsive burger menu en mobile
- Items: `DappTab.Supply`, `DappTab.Borrow`, etc.

---

## 🌓 Tema Oscuro (Predeterminado)

El sistema está diseñado para **dark mode**. No hay soporte explícito para light mode.

**Colores Tema Oscuro**
- Fondo principal (canvas): `#0d0d14`
- Fondo footer: `#08080c`
- Fondo header: `#1b1b1f`
- Fondo secundario: `rgba(18, 18, 21, 0.7)`
- Texto primario: `rgba(255, 255, 255, 0.95)`
- Texto secundario: `rgba(200, 210, 230, 0.7)` (tono frío)
- Texto terciario: `rgba(200, 210, 230, 0.45)`
- Acentos: `#00ffc4` (cyan), `#4fff4b` (lime), `#ffb800` (naranja)

---

## 🔧 Guía de Implementación

### Crear Nuevo Componente

#### 1. Atom Nuevo
```tsx
// ComponentName.tsx
import styles from "./ComponentName.module.scss";

interface Props {
  // Props
}

export const ComponentName: React.FC<Props> = ({ ...props }) => {
  return <div className={styles.container}>Content</div>;
};
```

```scss
// ComponentName.module.scss
.container {
  /* Base styles */
}
```

#### 2. Molecule Nueva
```tsx
// MoleculeName.tsx
import styles from "./MoleculeName.module.scss";
import { AtomComponent } from "../../atoms/...";

function MoleculeName() {
  return (
    <div className={styles.wrapper}>
      <AtomComponent />
    </div>
  );
}

export { MoleculeName };
```

#### 3. Organism Nuevo
```tsx
// OrganismName.tsx
import styles from "./OrganismName.module.scss";
import { MoleculeComponent } from "../../molecules/...";

function OrganismName() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Title</h2>
      </div>
      <MoleculeComponent />
    </div>
  );
}

export { OrganismName };
```

### Convenciones de Estilo

**Estructura SCSS**
```scss
.container {
  /* Propiedades visuales principales */
  display: grid;
  background: linear-gradient(...);
  border: 1.5px solid;
  
  /* Efectos */
  backdrop-filter: blur(16px);
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.4);
  
  /* Estados */
  &:hover {
    /* Cambios hover */
  }
  
  &.active {
    /* Estados activos */
  }
  
  /* Responsiveness */
  @media (max-width: 1024px) {
    /* Ajustes tablet */
  }
  
  @media (max-width: 768px) {
    /* Ajustes móvil */
  }
}
```

### Colores Reutilizables
```scss
// Primarios
$cyan: #00ffc4;
$lime: #4fff4b;
$accent: #ffb800;
$white: #ffffff;

// Backgrounds
$bg-main: #0d0d14;
$bg-footer: #08080c;
$bg-dark: rgba(18, 18, 21, 0.7);
$bg-dark-light: rgba(27, 27, 31, 0.9);

// Glassmorphism refinado
@mixin glassmorphism {
  background: linear-gradient(145deg, rgba(27, 27, 31, 0.85), rgba(18, 18, 21, 0.6));
  backdrop-filter: blur(12px) saturate(180%);
  -webkit-backdrop-filter: blur(12px) saturate(180%);
}

// Gradient border glow
@mixin gradient-border-glow {
  &::after {
    content: '';
    position: absolute;
    inset: -1px;
    border-radius: inherit;
    padding: 1px;
    background: linear-gradient(135deg, rgba(0, 255, 196, 0.15), transparent 50%, rgba(79, 255, 75, 0.1));
    -webkit-mask:
      linear-gradient(#fff 0 0) content-box,
      linear-gradient(#fff 0 0);
    mask:
      linear-gradient(#fff 0 0) content-box,
      linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.4s ease;
  }

  &:hover::after {
    opacity: 1;
  }
}

// Glow effects
@mixin glow($color) {
  box-shadow: 0 0 8px #{$color};
}

@mixin neon-text($color) {
  text-shadow: 0 0 30px rgba($color, 0.4);
  filter: drop-shadow(0 0 15px rgba($color, 0.6));
}
```

---

## 📋 Checklist de Diseño

Al crear componentes, verifica:

- [ ] **Color**: Usa cyan (#00ffc4) para primario, lime (#4fff4b) para secundario, naranja (#ffb800) para highlights
- [ ] **Canvas**: Background unificado `#0d0d14`; evitar cambios de fondo entre secciones
- [ ] **Glassmorphism**: Cards/containers con `backdrop-filter: blur(12px) saturate(180%)`
- [ ] **Gradient Borders**: Border degradado sutil (cyan → lime) en cards destacadas
- [ ] **Responsiveness**: Breakpoints en 900px, 768px, 600px, 480px
- [ ] **Tipografía**: Space Grotesk para todo el texto; JetBrains Mono para labels técnicos
- [ ] **Animaciones**: Transiciones con `cubic-bezier(0.4, 0, 0.2, 1)`, duración 0.3s-0.4s
- [ ] **Glow Effects**: `box-shadow` o `text-shadow` con `rgba(0, 255, 196, 0.x)` para acentos
- [ ] **Padding**: Secciones `5rem 2rem` desktop, `4rem 1.5rem` mobile
- [ ] **Container**: `max-width: 1200px`, centrado con `margin: 0 auto`
- [ ] **Z-index**: Modals 1000+, overlays 100+, content 1+
- [ ] **Tendencias**: Aplicar Tactile Brutalism (bordes 1px, sin shadows pesados) y Bento Grid donde aplique

---

## 🧩 Referencias de Componentes Externos

### Aceternity UI
**URL**: https://ui.aceternity.com

Librería open-source de componentes animados para React (copy-paste, sin dependencias npm).
Usada por Google, Microsoft, Cisco. Componentes recomendados para vStreet:

| Componente | Sección | Efecto |
|-----------|---------|--------|
| `SpotlightCard` | Features / VST | Spotlight que sigue al mouse dentro de la card |
| `BentoGrid` | Cualquier sección con cards | Grilla modular con animaciones staggered |
| `BackgroundBeams` | Hero | Rayos de luz verticales sutiles |
| `TextGenerateEffect` | Títulos de sección | Texto que aparece letra por letra |
| `3DCard` | Team / Features | Card con efecto 3D on hover |
| `InfiniteMovingCards` | Social / Testimonials | Carrusel infinito automático |

**Formato de integración**: Copiar código del componente desde la web de Aceternity y adaptar colores a la paleta vStreet.

---

## 🔮 Tendencias 2026 Aplicadas

### Tactile Brutalism
- Bordes finos de 1px como elemento estructural
- Sin drop shadows pesados; profundidad via bordes y superposición
- Esquinas: 0px (sharp) o 16px (pill), evitando 8px genérico

### Chromatic Extremes
- Canvas negro puro (`#0d0d14`) interrumpido por UN solo acento saturado (`#00ffc4`)
- Sin gradientes múltiples ni paletas complejas

### Bento Grid 2.0
- Layouts modulares asimétricos con jerarquía visual
- Cards de diferentes tamaños según importancia del contenido
- Micro-interacciones individuales por tile

### Frosted Touch (Glassmorphism Refinado)
- `backdrop-filter: blur()` con `saturate()` sutil
- Bordes translúcidos, no opacos
- Evitar blur excesivo que degrade performance

---

## 🎯 Próximos Pasos (Recomendaciones)

1. **Integrar Aceternity UI**: Probar `SpotlightCard` en Features, `BentoGrid` en VSTSection
2. **Crear `preview.html`**: Catálogo visual de componentes (dark theme only)
3. **Documentar variables SCSS**: Crear archivo `_variables.scss` centralizado
4. **Sistema de tokens**: Implementar design tokens (spacing, colors, breakpoints)
5. **Documentar animaciones**: Crear página interactiva de transiciones
6. **Accesibilidad**: Agregar contrast checker y ARIA labels
7. **Performance**: Optimizar gradients y blur effects en mobile
8. **Noise/Texture**: Evaluar si agregar textura sutil al canvas principal

---

## 📞 Contacto & Soporte

Para preguntas sobre el diseño del dApp, consulta:
- **Componentes**: `/src/vstreet/components/`
- **Estilos globales**: `/src/vstreet/assets/styles/`
- **Atoms base**: `/src/vstreet/components/atoms/`
- **Configuración**: Vite + SCSS modules

---

*Última actualización: 2026-05-01*
