# High Quality Swiss Design Standard 2026
## Mixer Platform - Design System & UI/UX Standards

**Project**: Mixer - Enterprise Marketing Automation Platform  
**Design Style**: Swiss Design (International Typographic Style)  
**Standard Version**: 1.0  
**Date**: 2026-09-07  
**Owner**: Head of Design  
**Reference**: Swiss Design Movement (1950s-Present)

### Frontend stylesheet setup

The frontend uses Mantine components. `apps/frontend/src/app/layout.tsx` imports
`@mantine/core/styles.css` and `@mantine/notifications/styles.css` before
`./globals.css`. These imports are required for component layout and appearance;
`MantineProvider` and the theme configuration alone do not load component CSS.
Global styles import the design tokens from `src/styles/tokens.css`, while
`src/theme/index.ts` configures Mantine. The PostCSS configuration has no custom
plugins and does not require Tailwind.

---

## 📋 TABLE OF CONTENTS

1. [Swiss Design Principles](#swiss-design-principles)
2. [Grid System](#grid-system)
3. [Typography](#typography)
4. [Color System](#color-system)
5. [Spacing & Layout](#spacing--layout)
6. [Component Standards](#component-standards)
7. [Accessibility](#accessibility)
8. [Responsive Design](#responsive-design)
9. [Visual Hierarchy](#visual-hierarchy)
10. [Motion & Animation](#motion--animation)
11. [Iconography](#iconography)
12. [Imagery](#imagery)
13. [Dark Mode](#dark-mode)
14. [Implementation](#implementation)
15. [Official References](#official-references)

---

## 🎯 SWISS DESIGN PHILOSOPHY

### **Core Principles**

```
1. CLARITY OVER CLUTTER
   "Every element must serve a purpose. Remove everything that doesn't 
   add value. White space is not empty space—it's breathing room that 
   helps users focus."

2. GRID-BASED PRECISION
   "Use mathematical grid systems to create harmony and consistency. 
   Every element aligns to a grid. No exceptions."

3. TYPOGRAPHY AS DESIGN
   "Typography is not just about readability—it's about hierarchy, 
   rhythm, and visual communication. Choose typefaces deliberately."

4. OBJECTIVITY OVER DECORATION
   "Content is the message. Design supports, never distracts. Avoid 
   unnecessary decoration, gradients, or effects."

5. ASYMMETRIC BALANCE
   "Balance through contrast, not symmetry. Use size, weight, and 
   color to create visual interest while maintaining order."

6. FUNCTIONAL AESTHETICS
   "Beauty emerges from function. If it's not usable, it's not good design. 
   Form follows function."
```

---

### **Swiss Design Characteristics**

| Characteristic | Application | Example |
|----------------|-------------|---------|
| **Minimalism** | Remove all unnecessary elements | Clean dashboard with only essential metrics |
| **Grid System** | 8px baseline grid for alignment | All cards align to grid, consistent spacing |
| **Sans-serif Typography** | Use Inter (modern Helvetica alternative) | Headlines: Inter Bold, Body: Inter Regular |
| **Objective Imagery** | Photography over illustration | Real product screenshots, not illustrations |
| **Asymmetric Layouts** | Balance through contrast | Large headline left, supporting text right |
| **Mathematical Precision** | Golden ratio, rule of thirds | Hero images follow 1:1.618 ratio |
| **Color Restraint** | Limited palette with purpose | 1 primary color, 1 accent, neutrals |
| **White Space** | Generous spacing between elements | 64px between sections, 24px between components |
| **Information Hierarchy** | Clear visual hierarchy | Size, weight, color guide attention |
| **International Style** | Universal, language-agnostic design | Icons + minimal text, clear visual cues |

---

## 📐 GRID SYSTEM

### **8-Point Grid System**

```
Base Unit: 8px

All spacing, sizing, and positioning must be multiples of 8:
- 4px (half unit) - Micro spacing
- 8px (1 unit) - Component internal spacing
- 16px (2 units) - Component spacing
- 24px (3 units) - Element spacing
- 32px (4 units) - Section spacing
- 48px (6 units) - Large section spacing
- 64px (8 units) - Page-level spacing
- 96px (12 units) - Hero sections
- 128px (16 units) - Major sections
```

**Implementation**:
```css
:root {
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 16px;
  --space-4: 24px;
  --space-5: 32px;
  --space-6: 48px;
  --space-7: 64px;
  --space-8: 96px;
  --space-9: 128px;
}

/* Usage */
.component {
  padding: var(--space-3);  /* 16px */
  margin-bottom: var(--space-5);  /* 32px */
}
```

---

### **Column Grid**

```
Desktop (1200px+):
  - Columns: 12
  - Gutter: 24px
  - Margin: 64px
  - Max Width: 1280px

Tablet (768px - 1199px):
  - Columns: 8
  - Gutter: 20px
  - Margin: 32px
  - Max Width: 1024px

Mobile (<768px):
  - Columns: 4
  - Gutter: 16px
  - Margin: 16px
  - Max Width: 100%
```

**Visual Representation**:
```
Desktop Grid (12 columns):
┌────────────────────────────────────────────────────────────┐
│  MARGIN  │  col  │  col  │  col  │  GUTTER  │  col  │  MARGIN │
│   64px   │       │       │       │   24px   │       │   64px  │
└────────────────────────────────────────────────────────────┘

Mobile Grid (4 columns):
┌────────────────────────┐
│  MARGIN  │  col  │  MARGIN │
│   16px   │       │   16px  │
└────────────────────────┘
```

---

### **Vertical Rhythm**

```
Baseline Grid: 8px

All text line heights align to 8px grid:
- 12px font → 16px line-height (1.333)
- 14px font → 20px line-height (1.429)
- 16px font → 24px line-height (1.5)
- 20px font → 28px line-height (1.4)
- 24px font → 32px line-height (1.333)
- 32px font → 40px line-height (1.25)
- 48px font → 56px line-height (1.167)
```

---

## 🔤 TYPOGRAPHY

### **Typeface Selection**

```css
/* Primary Typeface: Inter (Modern Swiss) */
/* Inter is a neo-grotesque sans-serif inspired by Helvetica */

Font Family:
  - Primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif
  - Mono: 'Fira Code', 'Monaco', monospace (for code snippets)
  
Font Weights:
  - Light: 300 (rarely used)
  - Regular: 400 (body text)
  - Medium: 500 (emphasis)
  - Semibold: 600 (subheadings)
  - Bold: 700 (headings)
  - ExtraBold: 800 (display text)

/* Alternative: Use Helvetica Neue for true Swiss authenticity */
/* Modern equivalent: Inter (free, open-source, excellent readability) */
```

---

### **Type Scale (Modular Scale)**

```
Base Size: 16px (1rem)
Scale Ratio: 1.25 (Major Third)

Font Size Scale:
  - xs: 12px (0.75rem) - Captions, labels
  - sm: 14px (0.875rem) - Secondary text
  - base: 16px (1rem) - Body text
  - lg: 18px (1.125rem) - Lead text
  - xl: 20px (1.25rem) - Small headings
  - 2xl: 24px (1.5rem) - H3 headings
  - 3xl: 30px (1.875rem) - H2 headings
  - 4xl: 36px (2.25rem) - H1 headings
  - 5xl: 48px (3rem) - Hero headings
  - 6xl: 60px (3.75rem) - Display text
  - 7xl: 72px (4.5rem) - Large display

Line Heights (aligned to 8px grid):
  - Tight: 1.25 (headings)
  - Normal: 1.5 (body text)
  - Relaxed: 1.625 (long-form content)
```

**Implementation**:
```css
:root {
  /* Font Sizes */
  --text-xs: 0.75rem;    /* 12px */
  --text-sm: 0.875rem;   /* 14px */
  --text-base: 1rem;     /* 16px */
  --text-lg: 1.125rem;   /* 18px */
  --text-xl: 1.25rem;    /* 20px */
  --text-2xl: 1.5rem;    /* 24px */
  --text-3xl: 1.875rem;  /* 30px */
  --text-4xl: 2.25rem;   /* 36px */
  --text-5xl: 3rem;      /* 48px */
  --text-6xl: 3.75rem;   /* 60px */
  
  /* Line Heights */
  --leading-tight: 1.25;
  --leading-normal: 1.5;
  --leading-relaxed: 1.625;
}

/* Usage */
h1 {
  font-size: var(--text-4xl);
  line-height: var(--leading-tight);
  font-weight: 700;
}

body {
  font-size: var(--text-base);
  line-height: var(--leading-normal);
  font-weight: 400;
}
```

---

### **Typography Hierarchy**

```
H1 - Page Title (36px, Bold, 40px line-height)
  Purpose: Main page heading, one per page
  Example: "Campaign Analytics"

H2 - Section Title (30px, Semibold, 36px line-height)
  Purpose: Major sections within a page
  Example: "Performance Overview"

H3 - Subsection Title (24px, Semibold, 32px line-height)
  Purpose: Subsections, card titles
  Example: "Email Open Rates"

H4 - Component Title (20px, Semibold, 28px line-height)
  Purpose: Component headings, modal titles
  Example: "Create Campaign"

H5 - Small Heading (18px, Medium, 24px line-height)
  Purpose: Card subtitles, list headers
  Example: "Last 30 days"

Body Large (18px, Regular, 28px line-height)
  Purpose: Lead paragraphs, important body text
  Example: "Your campaigns performed 25% better this month."

Body (16px, Regular, 24px line-height)
  Purpose: Default body text, descriptions
  Example: "This report shows campaign performance metrics."

Body Small (14px, Regular, 20px line-height)
  Purpose: Secondary text, captions, helper text
  Example: "Updated 2 hours ago"

Caption (12px, Regular, 16px line-height)
  Purpose: Labels, timestamps, metadata
  Example: "Created on Sep 7, 2026"
```

---

## 🎨 COLOR SYSTEM

### **Primary Palette**

```css
:root {
  /* Primary Brand Color (Swiss Blue) */
  --color-primary-50: #EFF6FF;
  --color-primary-100: #DBEAFE;
  --color-primary-200: #BFDBFE;
  --color-primary-300: #93C5FD;
  --color-primary-400: #60A5FA;
  --color-primary-500: #3B82F6;  /* Main brand color */
  --color-primary-600: #2563EB;
  --color-primary-700: #1D4ED8;
  --color-primary-800: #1E40AF;
  --color-primary-900: #1E3A8A;
}
```

---

### **Neutral Palette (Swiss Grayscale)**

```css
:root {
  /* Neutrals - Warm grays (Swiss style) */
  --color-gray-50: #FAFAFA;   /* Near white */
  --color-gray-100: #F5F5F5;  /* Light gray */
  --color-gray-200: #E5E5E5;  /* Border light */
  --color-gray-300: #D4D4D4;  /* Border */
  --color-gray-400: #A3A3A3;  /* Disabled text */
  --color-gray-500: #737373;  /* Secondary text */
  --color-gray-600: #525252;  /* Body text */
  --color-gray-700: #404040;  /* Headings */
  --color-gray-800: #262626;  /* Dark headings */
  --color-gray-900: #171717;  /* Near black */
  --color-gray-950: #0A0A0A;  /* Pure black (rarely used) */
}
```

---

### **Semantic Colors**

```css
:root {
  /* Success (Swiss Green) */
  --color-success-50: #F0FDF4;
  --color-success-500: #22C55E;
  --color-success-600: #16A34A;
  --color-success-700: #15803D;
  
  /* Warning (Swiss Yellow/Orange) */
  --color-warning-50: #FFFBEB;
  --color-warning-500: #F59E0B;
  --color-warning-600: #D97706;
  --color-warning-700: #B45309;
  
  /* Error (Swiss Red) */
  --color-error-50: #FEF2F2;
  --color-error-500: #EF4444;
  --color-error-600: #DC2626;
  --color-error-700: #B91C1C;
  
  /* Info (Swiss Blue) */
  --color-info-50: #EFF6FF;
  --color-info-500: #3B82F6;
  --color-info-600: #2563EB;
  --color-info-700: #1D4ED8;
}
```

---

### **Color Usage Rules**

```
PRIMARY COLOR (Swiss Blue #0066FF):
  ✅ Primary buttons
  ✅ Links
  ✅ Active states
  ✅ Brand elements
  ❌ Never use for backgrounds
  ❌ Never use for large areas

SUCCESS COLOR (Green #10B981):
  ✅ Success messages
  ✅ Positive indicators
  ✅ Completed states
  ❌ Never use for primary actions

WARNING COLOR (Orange #F59E0B):
  ✅ Warning messages
  ✅ Caution states
  ✅ Pending actions
  ❌ Never use for primary actions

ERROR COLOR (Red #EF4444):
  ✅ Error messages
  ✅ Destructive actions (with confirmation)
  ✅ Critical alerts
  ❌ Never use for primary actions

NEUTRAL COLORS (Gray scale):
  ✅ Text (hierarchy through contrast)
  ✅ Borders
  ✅ Backgrounds
  ✅ Disabled states
```

---

## 📏 SPACING & LAYOUT

### **Spacing Scale**

```
Base Unit: 8px

Component Spacing:
  - xs: 4px - Icon padding, tight spacing
  - sm: 8px - Button padding, icon gaps
  - md: 16px - Input padding, card padding
  - lg: 24px - Card spacing, section padding
  - xl: 32px - Component spacing
  - 2xl: 48px - Section spacing
  - 3xl: 64px - Page section spacing
  - 4xl: 96px - Hero section spacing
  - 5xl: 128px - Major page sections
```

---

### **Layout Patterns**

#### **Dashboard Layout**

```
┌─────────────────────────────────────────────────────────────┐
│  SIDEBAR (256px)  │  MAIN CONTENT                          │
│                   │                                         │
│  Logo             │  Top Navigation Bar (64px height)       │
│                   │  ┌─────────────────────────────────┐   │
│  Nav Item 1       │  │ Breadcrumb / Page Title          │   │
│  Nav Item 2       │  └─────────────────────────────────┘   │
│  Nav Item 3       │                                         │
│  Nav Item 4       │  Content Area (padding: 24px)          │
│                   │  ┌─────────────────────────────────┐   │
│  Divider          │  │                                 │   │
│                   │  │  Cards, Tables, Charts           │   │
│  User Profile     │  │                                 │   │
│                   │  │  Aligned to 8px grid            │   │
│                   │  │                                 │   │
│                   │  └─────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

**Specifications**:
- Sidebar: 256px width (collapsible to 64px)
- Top navigation: 64px height
- Content padding: 24px
- Card padding: 24px
- Card gap: 24px

---

#### **Card Layout**

```
Card Specifications:
  - Background: White (#FFFFFF)
  - Border: 1px solid #E5E5E5 (gray-200)
  - Border Radius: 8px (Swiss style: subtle rounding)
  - Padding: 24px
  - Shadow: None (flat design) OR subtle shadow on hover
  - Gap between cards: 24px

Card Structure:
┌────────────────────────────────────┐
│  Card Header (optional)            │
│  Title + Actions                   │
├────────────────────────────────────┤
│                                    │
│  Card Content                      │
│  (charts, tables, forms)           │
│                                    │
│  Aligned to 8px grid               │
│                                    │
└────────────────────────────────────┘

Hover State:
  - Border color: #3B82F6 (primary-500)
  - Shadow: 0 4px 12px rgba(0, 0, 0, 0.1)
  - Transition: 150ms ease-out
```

---

## 🧩 COMPONENT STANDARDS

### **Buttons**

```css
/* Primary Button (Swiss Style) */
.btn-primary {
  /* Layout */
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 12px 24px;  /* 3 units × 8px */
  gap: 8px;
  
  /* Typography */
  font-family: 'Inter', sans-serif;
  font-size: 16px;
  font-weight: 600;
  line-height: 1.5;
  text-decoration: none;
  
  /* Colors */
  background-color: #0066FF;
  color: #FFFFFF;
  border: none;
  border-radius: 6px;
  
  /* Interaction */
  cursor: pointer;
  transition: all 150ms ease-out;
}

.btn-primary:hover {
  background-color: #0052CC;
  transform: translateY(-1px);
}

.btn-primary:active {
  transform: translateY(0);
}

.btn-primary:disabled {
  background-color: #D4D4D4;
  cursor: not-allowed;
  transform: none;
}

/* Button Sizes */
.btn-sm {
  padding: 8px 16px;
  font-size: 14px;
}

.btn-lg {
  padding: 16px 32px;
  font-size: 18px;
}

/* Secondary Button */
.btn-secondary {
  background-color: transparent;
  color: #0066FF;
  border: 2px solid #0066FF;
}

.btn-secondary:hover {
  background-color: #EFF6FF;
}

/* Ghost Button */
.btn-ghost {
  background-color: transparent;
  color: #525252;
  border: none;
}

.btn-ghost:hover {
  background-color: #F5F5F5;
  color: #171717;
}
```

---

### **Form Inputs**

```css
/* Input Field (Swiss Minimal) */
.input {
  /* Layout */
  display: block;
  width: 100%;
  padding: 12px 16px;
  
  /* Typography */
  font-family: 'Inter', sans-serif;
  font-size: 16px;
  line-height: 1.5;
  color: #171717;
  
  /* Colors */
  background-color: #FFFFFF;
  border: 1px solid #D4D4D4;
  border-radius: 6px;
  
  /* Interaction */
  transition: border-color 150ms ease-out, box-shadow 150ms ease-out;
}

.input:focus {
  outline: none;
  border-color: #0066FF;
  box-shadow: 0 0 0 3px rgba(0, 102, 255, 0.1);
}

.input:disabled {
  background-color: #F5F5F5;
  color: #737373;
  cursor: not-allowed;
}

.input::placeholder {
  color: #A3A3A3;
}

/* Label */
.label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #404040;
  margin-bottom: 8px;
}

/* Error State */
.input-error {
  border-color: #EF4444;
}

.input-error:focus {
  border-color: #EF4444;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.error-message {
  display: block;
  margin-top: 8px;
  font-size: 14px;
  color: #EF4444;
}
```

---

### **Cards**

```css
/* Card Component */
.card {
  background-color: #FFFFFF;
  border: 1px solid #E5E5E5;
  border-radius: 8px;
  padding: 24px;
  transition: border-color 150ms ease-out, box-shadow 150ms ease-out;
}

.card:hover {
  border-color: #3B82F6;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

/* Card Header */
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #E5E5E5;
}

.card-title {
  font-size: 20px;
  font-weight: 600;
  color: #171717;
  margin: 0;
}

/* Card Body */
.card-body {
  /* Content area */
}

/* Card Footer */
.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #E5E5E5;
}
```

---

### **Tables**

```css
/* Table (Swiss Minimal) */
.table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.table thead {
  background-color: #FAFAFA;
  border-bottom: 2px solid #E5E5E5;
}

.table th {
  padding: 12px 16px;
  text-align: left;
  font-weight: 600;
  color: #525252;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.table td {
  padding: 16px;
  border-bottom: 1px solid #E5E5E5;
  color: #171717;
}

.table tbody tr {
  transition: background-color 150ms ease-out;
}

.table tbody tr:hover {
  background-color: #FAFAFA;
}

/* Table Actions */
.table-actions {
  display: flex;
  gap: 8px;
}
```

---

## ♿ ACCESSIBILITY

### **WCAG 2.1 AA Compliance**

```
Contrast Ratios:
  - Normal text (<18px): 4.5:1 minimum
  - Large text (≥18px): 3:1 minimum
  - UI components: 3:1 minimum

Swiss Color Contrast Check:
  ✅ #171717 on #FFFFFF = 16.1:1 (AAA)
  ✅ #525252 on #FFFFFF = 7:1 (AAA)
  ✅ #0066FF on #FFFFFF = 4.6:1 (AA)
  ✅ #FFFFFF on #0066FF = 4.6:1 (AA)
  ❌ #A3A3A3 on #FFFFFF = 2.7:1 (FAIL - don't use for text)
```

---

### **Keyboard Navigation**

```
Focus Indicators:
  - 2px solid outline
  - Color: #0066FF (primary)
  - Offset: 2px from element
  - Visible on all interactive elements

Keyboard Shortcuts:
  - Tab: Navigate forward
  - Shift + Tab: Navigate backward
  - Enter: Activate button/link
  - Space: Activate button/checkbox
  - Escape: Close modal/dropdown
  - Arrow keys: Navigate within components
```

---

### **Screen Reader Support**

```html
<!-- Semantic HTML -->
<button aria-label="Close modal">×</button>

<!-- ARIA Labels -->
<nav aria-label="Main navigation">
  <a href="/dashboard">Dashboard</a>
</nav>

<!-- ARIA Descriptions -->
<input 
  type="text" 
  aria-describedby="email-help"
  aria-required="true"
/>
<p id="email-help">Enter your work email address</p>

<!-- ARIA States -->
<button aria-pressed="false">Bold</button>
<button aria-expanded="false">Menu</button>
```

---

## 📱 RESPONSIVE DESIGN

### **Breakpoints**

```
Mobile: < 768px (max-width: 767px)
Tablet: 768px - 1199px (min-width: 768px, max-width: 1199px)
Desktop: ≥ 1200px (min-width: 1200px)

Swiss Design Note:
  - Maintain grid alignment across all breakpoints
  - Preserve typography hierarchy
  - Ensure readability on all screen sizes
```

---

### **Responsive Typography**

```css
/* Desktop */
h1 { font-size: 36px; }
h2 { font-size: 30px; }
body { font-size: 16px; }

/* Tablet */
@media (min-width: 768px) and (max-width: 1199px) {
  h1 { font-size: 32px; }
  h2 { font-size: 28px; }
  body { font-size: 16px; }
}

/* Mobile */
@media (max-width: 767px) {
  h1 { font-size: 28px; }
  h2 { font-size: 24px; }
  body { font-size: 16px; } /* Minimum 16px for readability */
}
```

---

### **Responsive Grid**

```
Desktop (≥1200px):
  - 12 columns
  - 24px gutter
  - 64px margin

Tablet (768px - 1199px):
  - 8 columns
  - 20px gutter
  - 32px margin

Mobile (<768px):
  - 4 columns
  - 16px gutter
  - 16px margin
```

---

## 🎭 VISUAL HIERARCHY

### **Hierarchy Principles**

```
1. SIZE LARGER = MORE IMPORTANT
   H1 (36px) > H2 (30px) > H3 (24px) > Body (16px)

2. WEIGHT BOLDER = MORE IMPORTANT
   Bold (700) > Semibold (600) > Medium (500) > Regular (400)

3. COLOR HIGHER CONTRAST = MORE IMPORTANT
   #171717 (near black) > #525252 (gray) > #A3A3A3 (light gray)

4. POSITION TOP = MORE IMPORTANT
   Content at top of page read first

5. WHITE SPACE MORE = MORE IMPORTANT
   Generous spacing around important elements
```

---

### **Visual Hierarchy Example**

```
HERO SECTION:
┌────────────────────────────────────────┐
│                                        │
│    Launch Campaigns                    │  ← H1 (48px, Bold) - PRIMARY
│    10x Faster                          │  ← H2 (30px, Semibold) - SECONDARY
│                                        │
│    Description text here that          │  ← Body Large (18px) - SUPPORTING
│    explains the value proposition.     │
│                                        │
│    [Primary CTA]  [Secondary CTA]      │  ← Buttons - ACTION
│                                        │
└────────────────────────────────────────┘

Priority: H1 → H2 → Body → Buttons → Supporting text
```

---

## 🎬 MOTION & ANIMATION

### **Animation Principles (Swiss Style)**

```
1. PURPOSE-DRIVEN
   Every animation must have a purpose: guide attention, show relationship, 
   or provide feedback. No decoration.

2. SUBTLE & FAST
   Duration: 150ms - 300ms (never longer than 500ms)
   Easing: ease-out (natural deceleration)

3. PERFORMANCE
   Use transform and opacity only (GPU-accelerated)
   Avoid animating width, height, margin, padding

4. REDUCED MOTION
   Respect user preference: prefers-reduced-motion
```

---

### **Animation Examples**

```css
/* Fade In (Entrance) */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fadeIn 200ms ease-out;
}

/* Slide In (Sidebar) */
@keyframes slideIn {
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(0);
  }
}

.animate-slide-in {
  animation: slideIn 250ms ease-out;
}

/* Scale (Modal) */
@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-scale-in {
  animation: scaleIn 150ms ease-out;
}

/* Reduced Motion */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 🔲 ICONOGRAPHY

### **Icon Style**

```
Style: Outline Icons (Swiss Minimal)
  - 24×24px canvas
  - 2px stroke weight
  - Rounded line caps and joins
  - Consistent visual weight
  - No gradients or shadows

Icon Library: Lucide React (or Heroicons)
  - Open source
  - Consistent style
  - Swiss-inspired design

Usage:
  - 24px: Default size (buttons, navigation)
  - 20px: Compact UI (tables, lists)
  - 16px: Inline with text
  - 32px: Empty states, illustrations
```

---

### **Icon Implementation**

```tsx
import { Mail, Send, Users, BarChart } from 'lucide-react';

// Usage
<Mail size={24} strokeWidth={2} />
<Send size={20} strokeWidth={2} />
<Users size={32} strokeWidth={2} />

// Icon Button
<button className="icon-button">
  <Mail size={20} />
  <span>Email</span>
</button>

// Icon with Text
<div className="flex items-center gap-2">
  <Users size={20} />
  <span>2,500 Contacts</span>
</div>
```

---

## 🖼️ IMAGERY

### **Photography Style (Objective)**

```
Swiss Design Photography Principles:
  1. CLEAR & SHARP
     - High resolution, crisp focus
     - No blur or artistic filters
     
  2. OBJECTIVE & REALISTIC
     - Real product screenshots
     - Authentic workplace photos
     - Avoid staged stock photos
     
  3. GEOMETRIC COMPOSITION
     - Follow grid system
     - Rule of thirds
     - Clean backgrounds
     
  4. LIMITED COLOR PALETTE
     - Muted tones
     - Consistent with brand colors
     - Avoid rainbow colors
```

---

### **Illustration Style (Minimal)**

```
When to Use Illustrations:
  - Empty states
  - Onboarding flows
  - Error pages
  - Complex concepts

Style Guidelines:
  - Line-based (not filled)
  - 2px stroke weight
  - Limited color (max 2 colors)
  - Geometric shapes
  - Consistent with icon style
```

---

## 🌙 DARK MODE

### **Dark Mode Colors (Swiss Style)**

```css
:root {
  /* Light Mode (default) */
  --bg-primary: #FFFFFF;
  --bg-secondary: #FAFAFA;
  --bg-tertiary: #F5F5F5;
  --text-primary: #171717;
  --text-secondary: #525252;
  --border-color: #E5E5E5;
}

[data-theme="dark"] {
  /* Dark Mode - Warm grays (not pure black) */
  --bg-primary: #0A0A0A;
  --bg-secondary: #171717;
  --bg-tertiary: #262626;
  --text-primary: #FAFAFA;
  --text-secondary: #A3A3A3;
  --border-color: #404040;
}

/* Swiss Dark Mode Principles:
   - Use warm grays, not pure black (#0A0A0A instead of #000000)
   - Reduce contrast for eye comfort
   - Maintain hierarchy through lightness, not darkness
   - Desaturate colors slightly
*/
```

---

## 💻 IMPLEMENTATION

### **Design System Components**

```tsx
// Design System Structure
src/
  styles/
    global.css                 # Global styles, reset
    variables.css              # Design tokens
    typography.css             # Type scale
    grid.css                   # Grid system
    
  components/
    ui/
      Button/
        Button.tsx
        Button.test.tsx
        Button.stories.tsx
        index.ts
      
      Input/
        Input.tsx
        Input.test.tsx
        Input.stories.tsx
        index.ts
      
      Card/
        Card.tsx
        Card.test.tsx
        Card.stories.tsx
        index.ts
      
      Table/
        Table.tsx
        Table.test.tsx
        Table.stories.tsx
        index.ts
```

---

### **Design Tokens**

```json
// tokens.json
{
  "colors": {
    "primary": {
      "50": "#EFF6FF",
      "500": "#3B82F6",
      "600": "#2563EB",
      "700": "#1D4ED8"
    },
    "neutral": {
      "50": "#FAFAFA",
      "100": "#F5F5F5",
      "200": "#E5E5E5",
      "700": "#404040",
      "900": "#171717"
    }
  },
  "spacing": {
    "1": "4px",
    "2": "8px",
    "3": "16px",
    "4": "24px",
    "5": "32px"
  },
  "typography": {
    "fontFamily": {
      "sans": ["Inter", "sans-serif"],
      "mono": ["Fira Code", "monospace"]
    },
    "fontSize": {
      "xs": "0.75rem",
      "sm": "0.875rem",
      "base": "1rem",
      "lg": "1.125rem",
      "xl": "1.25rem"
    },
    "fontWeight": {
      "regular": "400",
      "medium": "500",
      "semibold": "600",
      "bold": "700"
    }
  },
  "borderRadius": {
    "sm": "4px",
    "md": "6px",
    "lg": "8px"
  }
}
```

---

## ✅ SWISS DESIGN CHECKLIST

### **Design Review Checklist**

#### **Layout**
- [ ] All elements align to 8px grid
- [ ] Generous white space (no crowding)
- [ ] Consistent margins and padding
- [ ] Grid columns followed
- [ ] Asymmetric balance achieved

#### **Typography**
- [ ] Inter font family used
- [ ] Type scale followed (modular scale)
- [ ] Line heights align to 8px grid
- [ ] Clear visual hierarchy
- [ ] Contrast ratios meet WCAG AA

#### **Color**
- [ ] Limited color palette (1 primary, 1 accent)
- [ ] Semantic colors used correctly
- [ ] No gradients or decorative colors
- [ ] Contrast ratios verified

#### **Components**
- [ ] Consistent border radius (6-8px)
- [ ] Minimal shadows (flat design preferred)
- [ ] Buttons follow size specs
- [ ] Form inputs have clear focus states
- [ ] Tables are clean and readable

#### **Accessibility**
- [ ] WCAG 2.1 AA compliant
- [ ] Keyboard navigation works
- [ ] Screen reader tested
- [ ] Focus indicators visible
- [ ] Reduced motion respected

#### **Responsive**
- [ ] Works on mobile (<768px)
- [ ] Works on tablet (768-1199px)
- [ ] Works on desktop (≥1200px)
- [ ] Typography scales appropriately
- [ ] Grid adjusts per breakpoint

---

## 📚 OFFICIAL REFERENCES

### **Swiss Design History & Theory**

1. **Books**
   - *Swiss Style: Its Origins and Principles* - José-Maria Baselga
   - *Helvetica: Homage to a Typeface* - Lars Müller
   - *The Swiss Style: History and Influence* - Viction:ary
   - *Grid Systems in Graphic Design* - Josef Müller-Brockmann
   - *Thinking with Type: A Critical Guide* - Ellen Lupton

2. **Designers**
   - **Josef Müller-Brockmann**: Grid systems pioneer
   - **Armin Hofmann**: Swiss design educator
   - **Max Bill**: Typography and abstraction
   - **Emil Ruder**: Typography master
   - **Adrian Frutiger**: Typeface designer (Frutiger, Frutiger Next)

3. **Movements**
   - **International Typographic Style** (1950s)
   - **Swiss Style** (1950s-1970s)
   - **Neo-Grotesque** typography

---

### **Modern Swiss-Inspired Design**

| Resource | Type | URL |
|----------|------|-----|
| **Swiss Design Blog** | Blog | https://swissdesign.blog/ |
| **Typographica** | Typography | https://typographica.org/ |
| **Swiss Style Gallery** | Inspiration | https://swissstyle.in/ |
| **Müller-Brockmann** | Archive | https://www.muller-brockmann.ch/ |
| **Museum für Gestaltung** | Museum | https://www.museum-gestaltung.ch/ |

---

### **Design Systems & Standards**

1. **Design Systems**
   - [Material Design](https://m3.material.io/)
   - [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
   - [IBM Carbon Design System](https://carbondesignsystem.com/)
   - [Atlassian Design System](https://atlassian.design/)

2. **Typography**
   - [Inter Font](https://rsms.me/inter/) (Modern Swiss alternative to Helvetica)
   - [Helvetica Now](https://www.monotype.com/helvetica/)
   - [Google Fonts - Inter](https://fonts.google.com/specimen/Inter)
   - [Type Scale Calculator](https://typescale.com/)

3. **Color**
   - [Color Contrast Checker](https://webaim.org/resources/contrastchecker/)
   - [Coolors](https://coolors.co/) (Color palette generator)
   - [Swiss Color Palette](https://www.color-hex.com/color-palette/1016070)

4. **Grid Systems**
   - [8pt Grid System](https://spec.fm/specifics/8-pt-grid)
   - [Grid Garden](https://cssgridgarden.com/) (Learn CSS Grid)
   - [Bootstrap Grid](https://getbootstrap.com/docs/5.3/layout/grid/)

5. **Accessibility**
   - [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
   - [WebAIM](https://webaim.org/)
   - [A11Y Project](https://www.a11yproject.com/)
   - [Inclusive Components](https://inclusive-components.design/)

---

### **Inspiration & Examples**

| Platform | Swiss Design Elements | URL |
|----------|----------------------|-----|
| **Swiss Airlines** | Typography, minimalism | https://www.swiss.com |
| **Braun** | Product design, minimal | https://www.braun.com |
| **Migros** | Swiss design heritage | https://www.migros.ch |
| **Swiss Post** | Grid, typography | https://www.post.ch |
| **Nespresso** | Minimal luxury | https://www.nespresso.com |
| **Le Corbusier** | Architectural precision | https://www.fondationlecorbusier.fr |

---

### **Design Tools**

| Tool | Purpose | URL |
|------|---------|-----|
| **Figma** | UI Design | https://figma.com |
| **Framer** | Interactive prototypes | https://framer.com |
| **Storybook** | Component library | https://storybook.js.org |
| **Zeroheight** | Design system documentation | https://zeroheight.com |
| **Figma Tokens** | Design tokens | https://figma.com/community/plugin/843461159747178978 |

---

## 🎯 SWISS DESIGN SUMMARY

### **Golden Rules**

1. **GRID IS LAW**: Everything aligns to the 8px grid
2. **TYPOGRAPHY IS DESIGN**: Choose typefaces deliberately, hierarchy is key
3. **WHITE SPACE IS POWER**: Generous spacing creates clarity and focus
4. **LESS IS MORE**: Remove everything that doesn't serve a purpose
5. **FUNCTION BEFORE FORM**: Beauty emerges from usability
6. **CONTRAST CREATES HIERARCHY**: Use size, weight, color to guide attention
7. **CONSISTENCY IS TRUST**: Repeat patterns build familiarity
8. **OBJECTIVITY OVER EMOTION**: Let content speak, design supports
9. **MATHEMATICAL PRECISION**: Use ratios and systems, not guesswork
10. **ACCESSIBILITY IS NON-NEGOTIABLE**: Design for everyone

---

### **Swiss Design Mantra**

```
"Die Gestaltung ist eine Wissenschaft,
die sich mit der visuellen Kommunikation 
durch klare Formen und strukturen beschäftigt."

(Design is a science that deals with visual communication 
through clear forms and structures.)

— Josef Müller-Brockmann
```

---

**This Swiss Design Standard ensures Mixer platform embodies clarity, precision, and timeless aesthetics while maintaining exceptional usability for enterprise users.**

*Version: 1.0 | 2026-09-07 | Maintained by: Head of Design*  
*Next Review: 2027-03-07*
