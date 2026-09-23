# PMIX Design System

## Swiss Design Standard 2026

Design system yang mengadopsi prinsip **Swiss Design (International Typographic Style)**:
- **Clarity over Clutter** - Setiap elemen harus memiliki tujuan
- **Grid-based Precision** - Semua elemen selaras dengan grid 8px
- **Typography as Design** - Tipografi adalah hierarki visual
- **Objectivity over Decoration** - Konten adalah pesan
- **Functional Aesthetics** - Kecantikan muncul dari fungsi

---

## 📁 Struktur

```
src/styles/
├── tokens.css          # Design tokens (warna, spacing, typography)
├── typography.css      # Sistem tipografi
├── grid.css           # Grid system & utilities
└── README.md

src/components/ui/
├── button.tsx         # Button component
├── card.tsx           # Card component
├── input.tsx          # Input dengan label & error handling
├── label.tsx          # Label component
├── badge/             # Badge component
├── alert/             # Alert component
├── skeleton/          # Skeleton loader
└── index.ts           # Component exports

src/components/
├── theme-provider.tsx # Dark mode support
└── dashboard/
    └── sidebar.tsx    # Sidebar navigation
```

---

## 🎨 Design Tokens

### Colors
- **Primary**: Swiss Blue `#3B82F6`
- **Neutral**: Warm grayscale `#FAFAFA` - `#171717`
- **Semantic**: Success (green), Warning (orange), Error (red), Info (blue)

### Typography
- **Font**: Inter (Swiss-inspired sans-serif)
- **Scale**: Modular scale 1.25 (12px → 72px)
- **Line Height**: Aligned to 8px grid

### Spacing
- **Base Unit**: 8px
- **Scale**: 4px, 8px, 16px, 24px, 32px, 48px, 64px

### Border Radius
- **Swiss Standard**: 6px (subtle rounding)

### Transitions
- **Duration**: 150-300ms
- **Easing**: ease-out

---

## 🧩 Components

### Button
```tsx
<Button variant="default">Primary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
```

### Card
```tsx
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>Content</CardContent>
</Card>
```

### Input
```tsx
<Input label="Email" error={error} />
```

### Badge
```tsx
<Badge variant="success">Active</Badge>
<Badge variant="error">Inactive</Badge>
```

### Alert
```tsx
<Alert variant="info" title="Info">
  Message here
</Alert>
```

---

## ✅ Principles

1. **Grid**: 8px baseline grid
2. **Typography**: Inter font, clear hierarchy
3. **Colors**: Limited palette, semantic usage
4. **Spacing**: Generous white space
5. **Motion**: Fast (150ms), subtle, purposeful
6. **Accessibility**: WCAG 2.1 AA compliant

---

## 📱 Breakpoints

- **Mobile**: < 768px
- **Tablet**: 768px - 1199px
- **Desktop**: ≥ 1200px

---

## 🌙 Dark Mode

Theme support dengan CSS variables:
- Light mode: Default
- Dark mode: Warm grays (`#0A0A0A` - `#FAFAFA`)

---

**Version**: 1.0  
**Standard**: Swiss Design 2026  
**Reference**: `.docs/ui-ux/swiss-design-standard.md`

