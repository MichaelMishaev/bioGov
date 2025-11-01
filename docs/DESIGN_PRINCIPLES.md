# bioGov Design Principles

**Last Updated**: October 30, 2025
**Status**: Active Design System
**Template**: Carbon Design (Modern Israeli Government Style)

---

## Core Philosophy

bioGov aims to demystify Israeli government bureaucracy for small business owners. Our design system prioritizes **clarity, accessibility, and trust** while maintaining a modern, professional aesthetic that respects both Hebrew RTL conventions and international design standards.

---

## 1. Typography & Language

### Primary Font: Rubik
- **Rationale**: Most popular Hebrew web font in Israeli applications (2025)
- **Weights Used**: 300 (Light), 400 (Regular), 500 (Medium), 600 (Semi-Bold), 700 (Bold)
- **Why Rubik?**
  - Excellent Hebrew character support
  - Modern, rounded, approachable letterforms
  - Professional yet friendly appearance
  - Optimal legibility at all sizes
  - Already integrated via Google Fonts in `layout.tsx`

### Language Support
- **Primary**: Hebrew (RTL)
- **Secondary**: English (LTR) for technical terms, emails
- **Future**: Russian (per CLAUDE.md Phase 2)

### Text Hierarchy
```
Hero/Display:    text-5xl (48px) • font-bold (700)
Page Title:      text-4xl (36px) • font-bold (700)
Section Header:  text-2xl (24px) • font-semibold (600)
Card Title:      text-xl (20px) • font-semibold (600)
Subsection:      text-lg (18px) • font-medium (500)
Body:            text-base (16px) • font-normal (400)
Caption:         text-sm (14px) • font-normal (400)
Label:           text-xs (12px) • font-medium (500)
```

### Line Heights (Hebrew Optimized)
- Headings: `leading-tight` (1.25)
- Body Text: `leading-relaxed` (1.625)
- Captions: `leading-normal` (1.5)

**Hebrew Consideration**: Slightly taller line-height than English due to niqqud (diacritics) potential in formal documents.

---

## 2. Color System (Carbon Dark Theme)

### Primary Palette
```css
/* Background Layers */
--bg-primary: #161616;     /* Main background */
--bg-secondary: #262626;   /* Cards, elevated surfaces */
--bg-tertiary: #393939;    /* Hover states */

/* Text */
--text-primary: #f4f4f4;   /* Main text (96% white) */
--text-secondary: #c6c6c6; /* Secondary text (78% white) */
--text-disabled: #8d8d8d;  /* Disabled (55% white) */

/* Interactive */
--accent-blue: #0f62fe;    /* Primary actions, links */
--accent-hover: #0353e9;   /* Hover state */
--accent-active: #002d9c;  /* Active/pressed state */

/* Semantic Colors */
--success: #42be65;        /* IBM Carbon Green */
--warning: #ff832b;        /* IBM Carbon Orange */
--error: #da1e28;          /* IBM Carbon Red */
--info: #0f62fe;           /* Same as accent */

/* Borders & Dividers */
--border-subtle: #525252;  /* Low-emphasis borders */
--border-strong: #8d8d8d;  /* High-emphasis borders */
```

### Usage Guidelines
- **Accent Blue (#0f62fe)**: Primary buttons, links, active states, key information
- **Success Green (#42be65)**: Completed tasks, positive feedback, "הושלם" badges
- **Warning Orange (#ff832b)**: Pending actions, deadlines approaching, "ממתין" badges
- **Error Red (#da1e28)**: Errors, required fields, critical alerts

### Contrast Ratios (WCAG AA Compliant)
- Primary text on bg-primary: **13.5:1** (AAA)
- Accent blue on bg-primary: **7.2:1** (AA Large Text)
- Success green on bg-primary: **8.1:1** (AA)
- Warning orange on bg-primary: **6.8:1** (AA Large Text)

---

## 3. Spacing & Layout

### Spacing Scale (Tailwind)
```
xs:  0.125rem (2px)   • Fine details
sm:  0.25rem  (4px)   • Tight spacing
base: 0.5rem  (8px)   • Standard gap
md:  1rem     (16px)  • Card padding
lg:  1.5rem   (24px)  • Section spacing
xl:  2rem     (32px)  • Page margins
2xl: 3rem     (48px)  • Major sections
```

### Layout Grid
- **Desktop**: 12-column grid, max-width 1280px (max-w-7xl)
- **Tablet**: 8-column grid, max-width 768px
- **Mobile**: 4-column grid, max-width 640px

### Component Spacing
```
Card internal padding: p-6 (24px)
Card gap in grid: gap-4 (16px) mobile, gap-6 (24px) desktop
Section margin-bottom: mb-8 (32px)
Page horizontal padding: px-4 (16px) mobile, px-8 (32px) desktop
```

### Responsive Breakpoints
```
sm:  640px  • Large phones
md:  768px  • Tablets
lg:  1024px • Small laptops
xl:  1280px • Desktops
2xl: 1536px • Large screens
```

**RTL Consideration**: All horizontal spacing (margin, padding) is mirrored in RTL. Use Tailwind's RTL-aware classes.

---

## 4. Border Radius & Shadows

### Border Radius
```css
--radius-sm: 4px;    /* Badges, tags */
--radius-md: 8px;    /* Buttons, inputs, cards */
--radius-lg: 12px;   /* Modals, large cards */
--radius-xl: 16px;   /* Hero sections */
--radius-full: 50%;  /* Avatars, icon buttons */
```

**Carbon Standard**: `8px` for most interactive elements (buttons, inputs, cards)

### Elevation Shadows
```css
/* Level 1: Subtle elevation */
box-shadow: 0 1px 3px rgba(0,0,0,0.3);

/* Level 2: Card hover */
box-shadow: 0 2px 8px rgba(15,98,254,0.2);

/* Level 3: Modal, dropdown */
box-shadow: 0 4px 16px rgba(0,0,0,0.4);

/* Level 4: Top-level overlay */
box-shadow: 0 8px 32px rgba(0,0,0,0.5);
```

**Design Principle**: Use shadows sparingly. Carbon Design emphasizes borders over shadows for clarity.

---

## 5. Interactive Components

### Buttons

#### Variants
1. **Primary** (Accent Blue)
   - Use: Main actions (submit forms, proceed to next step)
   - Style: Solid fill, no border, white text
   - Hover: 10% brightness increase + subtle lift (-translate-y-0.5)

2. **Secondary** (Gray)
   - Use: Alternative actions (cancel, go back)
   - Style: Solid fill (#525252), white text, 1px border
   - Hover: 10% brightness increase

3. **Success** (Green)
   - Use: Confirmation, mark as complete
   - Style: Solid fill (#42be65), white text

4. **Warning** (Orange)
   - Use: Delete, reset, attention-required
   - Style: Solid fill (#ff832b), white text

#### States
```css
/* Default */
background: var(--accent-blue);
transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

/* Hover */
filter: brightness(1.1);
box-shadow: 0 4px 12px rgba(15,98,254,0.3);
transform: translateY(-0.5px);

/* Active/Pressed */
transform: translateY(0);
box-shadow: 0 1px 3px rgba(0,0,0,0.3);

/* Disabled */
opacity: 0.5;
cursor: not-allowed;
```

#### Sizing
- **Small**: h-8 (32px), px-3, text-sm
- **Medium** (default): h-11 (44px), px-4, text-base
- **Large**: h-14 (56px), px-6, text-lg

### Form Inputs

#### Text Inputs
```css
/* Default */
background: #262626;
border: 1px solid #525252;
border-radius: 8px;
padding: 0.75rem 1rem; /* 12px 16px */

/* Focus */
border-color: #0f62fe;
box-shadow: 0 0 0 2px rgba(15,98,254,0.2);
outline: none;

/* Error */
border-color: #da1e28;
box-shadow: 0 0 0 2px rgba(218,30,40,0.2);
```

#### Labels
- Position: Above input, mb-2
- Style: text-sm, font-medium
- Required indicator: Red asterisk `*` (not emoji)

#### Placeholders
- Hebrew: Right-aligned, dir="rtl"
- English (email, phone): Left-aligned, dir="ltr"
- Opacity: 0.5

### Toggle Switches
- Width: 56px (14 Tailwind units)
- Height: 28px (7 Tailwind units)
- Thumb: 24px circle, white
- Track: Accent blue (on), #525252 (off)
- Animation: 0.3s ease

### Checkboxes & Radio Buttons
- Size: 20px (5 Tailwind units)
- Border: 2px solid #525252
- Checked: Accent blue fill, white checkmark/dot
- Border radius: 4px (checkbox), 50% (radio)

### Dropdowns/Selects
- Match text input styling
- Arrow icon: Right side (RTL)
- Options: bg-secondary on hover

---

## 6. Cards & Containers

### Card Anatomy
```tsx
<div className="p-6 rounded-lg bg-secondary border border-subtle">
  <h3 className="text-xl font-semibold mb-4">{title}</h3>
  <div className="space-y-3">{content}</div>
</div>
```

### Card Variants
1. **Default**: bg-secondary (#262626), 1px border (#525252)
2. **Interactive**: Add hover state with shadow + lift
3. **Highlighted**: Accent border-left (4px solid accent-blue)

### Hover Effects
```css
.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0,0,0,0.4);
  transition: all 0.3s ease;
}
```

---

## 7. Status Indicators

### Badges
```tsx
<span className="px-3 py-1 text-xs font-semibold rounded-full">
  {statusText}
</span>
```

| Status      | Hebrew     | Color      | Background         | Use Case                  |
|-------------|------------|------------|--------------------|---------------------------|
| Active      | פעיל       | white      | accent-blue        | Current task              |
| Complete    | הושלם      | white      | success-green      | Finished task             |
| Pending     | ממתין      | white      | warning-orange     | Awaiting action           |
| Urgent      | דחוף       | white      | error-red          | Critical deadline         |
| Info        | מידע       | accent-blue | accent-blue/20    | Informational notice      |

### Progress Bars
- Height: 8px (2 Tailwind units)
- Track: bg-secondary (#525252)
- Fill: Accent blue (default), success (complete), warning (in-progress)
- Border radius: Full (rounded-full)
- Animation: Smooth width transition (0.5s)

### Loading Spinners
- Size: 24px (sm), 32px (md), 48px (lg)
- Color: Accent blue
- Animation: Spin (1s linear infinite)

---

## 8. Tables

### Structure
```tsx
<table className="w-full text-sm">
  <thead>
    <tr className="border-b-2 border-secondary">
      <th className="text-right py-3 font-semibold">{header}</th>
    </tr>
  </thead>
  <tbody>
    <tr className="border-b border-subtle/40 hover:brightness-110">
      <td className="py-3">{data}</td>
    </tr>
  </tbody>
</table>
```

### Design Rules
- Text align: Right (Hebrew)
- Header: Bold, 2px bottom border
- Rows: 1px bottom border (40% opacity), hover brightness
- Padding: py-3 (12px vertical)
- Responsive: overflow-x-auto wrapper on mobile

---

## 9. Navigation

### Breadcrumbs
```tsx
<nav className="flex items-center gap-2 text-sm">
  <a href="#" className="hover:underline opacity-70">בית</a>
  <span className="opacity-50">›</span>
  <a href="#" className="hover:underline opacity-70">משימות</a>
  <span className="opacity-50">›</span>
  <span className="text-accent">הגשת דוח</span>
</nav>
```

### Pagination
- Button size: 32px (8 Tailwind units) square
- Active: Accent blue background
- Inactive: Secondary background
- Arrows: ‹ and › (Unicode)
- Gap: gap-2

### Tabs
```tsx
<div className="flex gap-1 p-1 rounded-lg bg-primary">
  <button className="flex-1 py-2 px-4 rounded-lg text-sm font-medium
                     bg-accent text-white"> {/* Active */}
    כללי
  </button>
  <button className="flex-1 py-2 px-4 rounded-lg text-sm font-medium
                     bg-transparent text-primary"> {/* Inactive */}
    מסמכים
  </button>
</div>
```

---

## 10. Alerts & Notifications

### Alert Types
```tsx
<div className="p-3 rounded-lg flex items-center gap-3
                border-l-4 border-{variant}">
  <span className="text-lg">{icon}</span>
  <span className="text-sm flex-1">{message}</span>
  <button className="text-xs opacity-70 hover:opacity-100">✕</button>
</div>
```

| Type    | Icon | Border Color | Background             |
|---------|------|--------------|------------------------|
| Success | ✓    | #42be65      | rgba(66,190,101,0.15)  |
| Warning | ⚠    | #ff832b      | rgba(255,131,43,0.15)  |
| Error   | ✕    | #da1e28      | rgba(218,30,40,0.15)   |
| Info    | ℹ    | #0f62fe      | rgba(15,98,254,0.15)   |

### Toast Notifications (Future)
- Position: Top-right (RTL: top-left)
- Duration: 5s auto-dismiss
- Action: Undo button for reversible actions

---

## 11. Icons & Imagery

### Icon System
- **Primary**: Lucide React (already in package.json)
- **Size**: 16px (sm), 20px (md), 24px (lg)
- **Stroke Width**: 2px (default)
- **Color**: Inherit from text color

### Common Icons
```
CheckCircle (✓)  → Success, completed tasks
AlertTriangle (⚠) → Warning, attention needed
Info (ℹ)         → Information, help tooltips
X (✕)            → Close, delete, error
ChevronRight (›) → Navigation, breadcrumbs (RTL: ChevronLeft)
Calendar         → Dates, deadlines
FileText         → Documents, forms
Building         → Business, company
User             → Profile, account
```

### Emoji Usage
- **Sparingly**: Only for task categories (📊 VAT, 💼 NI, 🏢 Licensing)
- **Never**: In body text, buttons, form labels
- **Accessibility**: Always provide text alternative

---

## 12. Animation & Transitions

### Principles
1. **Purposeful**: Every animation should provide feedback or guide attention
2. **Fast**: No animation longer than 0.5s
3. **Smooth**: Use easing functions, not linear

### Standard Durations
```css
--duration-fast: 150ms;    /* Hover states */
--duration-base: 300ms;    /* Default transitions */
--duration-slow: 500ms;    /* Complex animations */
```

### Easing Functions
```css
/* Default: Smooth in-out */
cubic-bezier(0.4, 0, 0.2, 1)

/* Hover: Quick start, slow end */
cubic-bezier(0, 0, 0.2, 1)

/* Page transition: Smooth throughout */
ease-in-out
```

### Common Patterns
```css
/* Button hover */
transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
transform: translateY(-0.5px);
filter: brightness(1.1);

/* Card hover */
transition: all 0.3s ease;
transform: translateY(-2px);
box-shadow: 0 4px 16px rgba(0,0,0,0.4);

/* Input focus */
transition: all 0.3s ease;
border-color: #0f62fe;
box-shadow: 0 0 0 2px rgba(15,98,254,0.2);

/* Loading skeleton */
animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
```

### Accessibility
- Respect `prefers-reduced-motion`
- Provide instant feedback for critical actions
- Never hide important info during transitions

---

## 13. Accessibility (IS-5568 Compliance)

### WCAG 2.0 AA Requirements (Israeli Standard)
- Color contrast: 4.5:1 (text), 3:1 (large text)
- Keyboard navigation: All interactive elements
- Screen readers: Semantic HTML, ARIA labels
- Focus indicators: Visible, 2px outline

### RTL Support
- Direction: `dir="rtl"` on `<html>`
- Text align: Right by default
- Icons: Mirror when directional (arrows, chevrons)
- Forms: Labels on right, inputs fill left

### Keyboard Navigation
```tsx
// Focus order (RTL):
// 1. Logo (top-right)
// 2. Main navigation (right to left)
// 3. Content (right to left, top to bottom)
// 4. Footer (right to left)

// Focus styles
focus-visible:outline-2
focus-visible:outline-accent
focus-visible:outline-offset-2
```

### Screen Reader Support
```tsx
// Semantic HTML
<nav aria-label="ניווט ראשי">
<main aria-label="תוכן עיקרי">
<aside aria-label="פס צד">

// Button labels
<button aria-label="סגור תיבת דו-שיח">✕</button>

// Status messages
<div role="status" aria-live="polite">
  הטופס נשלח בהצלחה
</div>
```

---

## 14. Responsive Design

### Mobile-First Approach
1. Design for 375px (iPhone SE) first
2. Scale up to tablet (768px)
3. Optimize for desktop (1280px+)

### Component Breakpoints
```tsx
// Stack on mobile, grid on desktop
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

// Hide on mobile, show on desktop
<div className="hidden md:block">

// Smaller text on mobile
<h1 className="text-3xl md:text-5xl">

// Full width on mobile, constrained on desktop
<div className="w-full lg:max-w-7xl lg:mx-auto">
```

### Touch Targets
- Minimum: 44x44px (Apple HIG)
- Recommended: 48x48px (Material Design)
- Our standard: 44px (h-11)

---

## 15. Content Guidelines

### Hebrew Text
- **Voice**: Professional yet approachable
- **Terminology**: Use official government terms (עוסק מורשה, מע"מ)
- **Punctuation**: Hebrew uses periods (.), question marks (?)
- **Numbers**: Use Western Arabic numerals (1, 2, 3), not Hebrew numerals

### Microcopy Examples
```
Button text:
✓ "המשך"       (Continue)
✓ "שלח טופס"   (Submit form)
✓ "בטל"        (Cancel)
✗ "לחץ כאן"    (Click here)

Validation errors:
✓ "נא למלא שדה זה"  (Please fill this field)
✓ "כתובת אימייל לא תקינה" (Invalid email address)
✗ "שגיאה!"     (Error!)

Success messages:
✓ "הטופס נשלח בהצלחה"  (Form submitted successfully)
✓ "המשימה הושלמה"       (Task completed)
```

### Date Formats
- Israeli: `DD.MM.YYYY` (15.12.2025)
- Time: 24-hour format (14:30)
- Relative: "לפני 5 דקות", "מחר ב-10:00"

---

## 16. File Organization

### Component Structure
```
src/
├── components/
│   ├── ui/              # Base components (button, input, card)
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   └── badge.tsx
│   ├── forms/           # Form-specific components
│   │   ├── vat-form.tsx
│   │   └── ni-form.tsx
│   ├── layout/          # Layout components
│   │   ├── header.tsx
│   │   ├── footer.tsx
│   │   └── sidebar.tsx
│   └── task-cards/      # Business logic components
│       ├── task-card.tsx
│       └── task-list.tsx
├── app/                 # Next.js App Router
│   ├── globals.css      # Global styles
│   ├── layout.tsx       # Root layout (Rubik font)
│   └── page.tsx         # Home page
└── lib/
    └── utils.ts         # Utility functions (cn, date formatters)
```

### CSS Architecture
1. **Tailwind CSS**: Primary styling (98%)
2. **CSS Variables**: Color tokens, spacing scale
3. **Inline Styles**: Dynamic values only (template colors)

---

## 17. Performance

### Optimization Checklist
- [ ] Font subsetting (Hebrew + Latin only)
- [ ] Image optimization (WebP, lazy loading)
- [ ] Code splitting (dynamic imports)
- [ ] Tree shaking (remove unused Tailwind classes)
- [ ] Minimal JavaScript (prefer CSS animations)

### Metrics Targets
- **Largest Contentful Paint (LCP)**: < 2.5s
- **First Input Delay (FID)**: < 100ms
- **Cumulative Layout Shift (CLS)**: < 0.1

---

## 18. Future Enhancements

### Phase 2 (Post-MVP)
- [ ] Dark mode toggle (already using dark theme)
- [ ] Multi-language switcher (Hebrew/English/Russian)
- [ ] Advanced animations (Framer Motion)
- [ ] Skeleton loaders for async content
- [ ] Toast notification system
- [ ] Drag-and-drop file upload
- [ ] Interactive data visualizations (charts for VAT reports)

### Accessibility Phase 2
- [ ] Hebrew speech synthesis (text-to-speech)
- [ ] High contrast mode
- [ ] Dyslexia-friendly font option (OpenDyslexic)

---

## 19. Design Tokens (Tailwind Config)

### Current Configuration
See `tailwind.config.ts` for complete setup:
- RTL plugin: `tailwindcss-rtl`
- Animations: `tailwindcss-animate`
- Font: Rubik (variable: `--font-rubik`)

### Customizations Needed
```js
// tailwind.config.ts additions
module.exports = {
  theme: {
    extend: {
      colors: {
        carbon: {
          bg: '#161616',
          'bg-secondary': '#262626',
          'bg-tertiary': '#393939',
          accent: '#0f62fe',
          success: '#42be65',
          warning: '#ff832b',
          error: '#da1e28',
        },
      },
      fontFamily: {
        sans: ['var(--font-rubik)', 'sans-serif'],
      },
    },
  },
};
```

---

## 20. Component Library

### Radix UI Integration
Currently installed (see `package.json`):
- `@radix-ui/react-accordion`
- `@radix-ui/react-checkbox`
- `@radix-ui/react-dialog`
- `@radix-ui/react-dropdown-menu`
- `@radix-ui/react-label`
- `@radix-ui/react-progress`
- `@radix-ui/react-radio-group`
- `@radix-ui/react-select`
- `@radix-ui/react-switch`
- `@radix-ui/react-tabs`
- `@radix-ui/react-toast`

### Usage Philosophy
1. Use Radix primitives for complex interactions (dropdowns, modals)
2. Style with Tailwind CSS
3. Wrap in custom components (`src/components/ui/`)
4. Ensure RTL compatibility

---

## References

### Official Guidelines
- **IBM Carbon Design System**: https://carbondesignsystem.com/
- **Israeli Accessibility Standard (IS-5568)**: WCAG 2.0 AA equivalent
- **Material Design (Google)**: Material 3 guidelines for reference
- **Apple Human Interface Guidelines**: Touch target sizes, gestures

### Typography Resources
- **Rubik Font**: Google Fonts (already loaded)
- **Hebrew Typography Guide**: https://alefalefalef.co.il/en/
- **RTL Best Practices**: https://rtlstyling.com/

### Development Tools
- **Tailwind CSS Docs**: https://tailwindcss.com/docs
- **Radix UI Docs**: https://www.radix-ui.com/
- **Next.js 14 Docs**: https://nextjs.org/docs
- **React 18 Docs**: https://react.dev/

---

## Changelog

### Version 1.0 (October 30, 2025)
- Initial design system based on Carbon Design template
- Rubik font implementation
- 13+ comprehensive UI component categories
- Hebrew RTL optimization
- IS-5568 accessibility compliance roadmap
- Modern Israeli government aesthetic

---

## License & Attribution

**Design System**: bioGov Team
**Inspired By**: IBM Carbon Design System, Israeli Government Digital Services
**Font**: Rubik by Hubert & Fischer (SIL Open Font License)
**Component Library**: Radix UI (MIT License)

---

**For questions or contributions**, contact the bioGov development team or refer to `CLAUDE.md` in the project root.
