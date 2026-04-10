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

### Primarios
- **Cyan**: `#00ffc4` (principal, glow de 6px)
- **Lime**: `#4fff4b` (secundario, accents)
- **Blanco**: `#ffffff` (texto principal)

### Fondos
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
- **Headings**: Montserrat (Sans-serif)
  - Weight: 700 (regular), 900 (énfasis)
- **Body**: Inter (Sans-serif)
  - Weight: 400 (regular), 600 (destacado)

### Escala de Tamaños
| Nivel | Tamaño | Weight | Uso |
|-------|--------|--------|-----|
| H1 | 48px | 900 | Títulos principales |
| H2 | 22px | 700 | Títulos de sección |
| H3 | 18px | 700 | Subtítulos |
| Body | 14px | 400 | Texto regular |
| Small | 12px | 400 | Texto secundario |
| Tiny | 11px | 700 | Labels |

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
- Fondo principal: #0f0f12
- Fondo secundario: rgba(18, 18, 21, 0.7)
- Texto primario: #ffffff
- Texto secundario: rgba(255, 255, 255, 0.5)
- Acentos: #00ffc4 (cyan), #4fff4b (lime)

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
$white: #ffffff;

// Backgrounds
$bg-dark: rgba(18, 18, 21, 0.7);
$bg-dark-light: rgba(27, 27, 31, 0.9);

// Glassmorphism
@mixin glassmorphism {
  background: linear-gradient(135deg, $bg-dark-light, $bg-dark);
  backdrop-filter: blur(16px) saturate(180%);
  -webkit-backdrop-filter: blur(16px) saturate(180%);
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

- [ ] **Color**: Usa cyan (#00ffc4) para primario, lime (#4fff4b) para secundario
- [ ] **Glassmorphism**: Cards/containers con backdrop-filter blur(16px)
- [ ] **Gradient Border**: Border-image con gradients de neon
- [ ] **Responsiveness**: Breakpoints en 1440px, 1024px, 822px, 768px
- [ ] **Tipografía**: Montserrat para headings, Inter para body
- [ ] **Animaciones**: Transiciones smooth (0.3s, ease-in-out)
- [ ] **Glow Effects**: box-shadow o text-shadow para acentos
- [ ] **Corner Accents**: Usa componente CornerAccent en containers principales
- [ ] **Padding**: 24px-32px desktop, 16px-20px mobile
- [ ] **Z-index**: Modals 1000+, overlays 100+, content 1+

---

## 🎯 Próximos Pasos (Recomendaciones)

1. **Crear `preview.html`**: Catálogo visual de componentes (light theme)
2. **Crear `preview-dark.html`**: Catálogo visual de componentes (dark theme)
3. **Documentar variables SCSS**: Crear archivo `_variables.scss` centralizado
4. **Sistema de tokens**: Implementar design tokens (spacing, colors, breakpoints)
5. **Documentar animaciones**: Crear página interactiva de transiciones
6. **Accesibilidad**: Agregar contrast checker y ARIA labels
7. **Performance**: Optimizar gradients y blur effects en mobile

---

## 📞 Contacto & Soporte

Para preguntas sobre el diseño del dApp, consulta:
- **Componentes**: `/src/vstreet/components/`
- **Estilos globales**: `/src/vstreet/assets/styles/`
- **Atoms base**: `/src/vstreet/components/atoms/`
- **Configuración**: Vite + SCSS modules

---

*Última actualización: 2026-04-06*
