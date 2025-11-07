# Vektor.Pro Design System

## Core Principles

This design system is inspired by Apple's design philosophy under Jony Ive: **pure minimalism, monochrome palette, and information clarity**.

---

## Color Palette (Monochrome Only)

### Primary Colors
```css
--white: #ffffff       /* Backgrounds, light text */
--black: #000000       /* Primary actions, dark text */
```

### Gray Scale
```css
--gray-50: #fafafa     /* Subtle backgrounds */
--gray-100: #f5f5f5    /* Section backgrounds */
--gray-200: #e5e5e5    /* Borders, dividers */
--gray-300: #d4d4d4    /* Hover borders */
--gray-400: #a3a3a3    /* Disabled states */
--gray-500: #737373    /* Secondary text */
--gray-600: #525252    /* Body text, subdued */
--gray-700: #404040    /* Navigation text */
--gray-800: #262626    /* Unused */
--gray-900: #171717    /* Primary text, headings */
```

### Usage Rules
- **NO colors** outside this palette
- **NO emojis** in UI
- **NO icons** - use text only
- **NO gradients** except for special cases (must be grayscale)

---

## Typography

### Font Family
```css
font-family: -apple-system, BlinkMacSystemFont, 
             'SF Pro Display', 'SF Pro Text', 
             'Helvetica Neue', sans-serif;
```

### Font Sizes
```
h1: clamp(32px, 5vw, 56px)  - Page titles
h2: clamp(28px, 4vw, 44px)  - Section headings
h3: clamp(24px, 3vw, 36px)  - Subsections
body: 16px                   - Base text
small: 14px                  - Labels, captions
```

### Font Weights
- **400**: Body text
- **500**: Headings, buttons
- **600**: Strong emphasis

### Letter Spacing
- Large text (>40px): `-0.03em`
- Medium text (24-40px): `-0.02em`
- Small text (<24px): `-0.01em` or default

### Line Height
- Headings: `1.1`
- Body: `1.5`
- Captions: `1.6`

---

## Spacing Scale

### Base Units
```css
--space-1: 4px
--space-2: 8px
--space-3: 12px
--space-4: 16px
--space-5: 20px
--space-6: 24px
--space-8: 32px
--space-10: 40px
--space-12: 48px
--space-16: 64px
--space-20: 80px
--space-24: 96px
```

### Usage
- Use multiples of 4px for consistency
- Generous whitespace is encouraged
- Section padding: `var(--space-20)` on desktop
- Card padding: `var(--space-8)`
- Button padding: `var(--space-3) var(--space-6)`

---

## Border Radius

```css
--radius-sm: 4px      /* Small UI elements */
--radius-md: 8px      /* Inputs */
--radius-lg: 12px     /* Inputs, small cards */
--radius-xl: 16px     /* Buttons */
--radius-2xl: 24px    /* Large cards */
```

### Usage Rules
- Buttons: `--radius-xl` (16px)
- Cards: `--radius-2xl` (24px)
- Inputs: `--radius-lg` (12px)
- Never use `border-radius: 50%` except for spinners

---

## Transitions

```css
--transition-fast: 0.15s cubic-bezier(0.4, 0, 0.2, 1)
--transition-base: 0.2s cubic-bezier(0.4, 0, 0.2, 1)
--transition-slow: 0.3s cubic-bezier(0.4, 0, 0.2, 1)
```

### Usage
- Color/border changes: `fast`
- Hover effects: `base`
- Enter/exit animations: `slow`

---

## Components

### Navigation
```
Background: rgba(255, 255, 255, 0.8)
Backdrop filter: saturate(180%) blur(20px)
Position: sticky, top: 0
Border bottom: 1px solid var(--gray-200)
```

**Anatomy:**
- Brand: 20px, weight 600
- Links: 15px, weight 400, gray-700
- Auth button: Primary button, small

### Buttons

#### Primary
```
Background: var(--gray-900)
Color: var(--white)
Padding: var(--space-3) var(--space-6)
Border radius: var(--radius-xl)
Font weight: 500
Hover: Background to gray-700, translateY(-1px)
```

#### Secondary
```
Background: transparent
Color: var(--gray-900)
Border: 1px solid var(--gray-300)
Padding: var(--space-3) var(--space-6)
Border radius: var(--radius-xl)
Font weight: 500
Hover: Background to gray-50, border to gray-400
```

#### Sizes
- Small: `padding: var(--space-2) var(--space-4); font-size: 14px`
- Regular: `padding: var(--space-3) var(--space-6); font-size: 15px`
- Large: `padding: var(--space-4) var(--space-8); font-size: 17px`

### Cards
```
Background: var(--white)
Border: 1px solid var(--gray-200)
Border radius: var(--radius-2xl)
Padding: var(--space-8)
Transition: all var(--transition-base)
Hover: 
  - border-color: var(--gray-300)
  - transform: translateY(-2px)
```

### Forms

#### Input
```
Width: 100%
Padding: var(--space-4)
Font size: 16px
Border: 1px solid var(--gray-300)
Border radius: var(--radius-lg)
Background: var(--white)
Focus: border-color: var(--gray-900)
```

#### Label
```
Font size: 14px
Font weight: 500
Color: var(--gray-700)
Margin bottom: var(--space-2)
```

### Loading Spinner
```html
<div style={{
  width: '48px',
  height: '48px',
  border: '3px solid var(--gray-200)',
  borderTop: '3px solid var(--gray-900)',
  borderRadius: '50%',
  animation: 'spin 1s linear infinite'
}} />
```

---

## Layout Patterns

### Hero Section
```
Text align: center
Padding: var(--space-24) 0 var(--space-20) 0
Title: 72px (desktop), 40px (mobile)
Subtitle: 24px (desktop), 18px (mobile)
Max width: 700px for subtitle
```

### Section
```
Padding: var(--space-20) 0
Section title: Center aligned
Max width: 1200px (container)
```

### Grid
```
Display: grid
Gap: var(--space-6)
Columns: repeat(auto-fit, minmax(280px, 1fr))
```

---

## Responsive Breakpoints

```css
Mobile: max-width: 640px
Tablet: max-width: 768px
Desktop: 1200px max container
```

### Mobile Adjustments
- Hide nav links, show only brand + auth
- Stack hero actions vertically
- Reduce section padding to `var(--space-12)`
- Card padding to `var(--space-6)`
- Single column grids

---

## Animation Guidelines

### Hover States
- Buttons: `translateY(-1px)` + subtle shadow
- Cards: `translateY(-2px)` + border color change
- Links: Color change only

### Loading States
- Spinner with smooth rotation
- Skeleton screens (optional, grayscale)
- Never use pulsing or flashing

### Page Transitions
- Keep fast and subtle
- Avoid dramatic entrances
- Client-side navigation should feel instant

---

## Accessibility

### Contrast Ratios
- Primary text (gray-900) on white: 15.3:1 ✓
- Secondary text (gray-600) on white: 5.7:1 ✓
- Gray-500 on white: 4.6:1 ✓

### Focus States
- All interactive elements have visible focus
- Focus: `border-color: var(--gray-900)`

### Semantic HTML
- Use proper heading hierarchy
- Use `<nav>`, `<section>`, `<article>`
- Buttons for actions, links for navigation

---

## Don'ts

❌ NO bright colors (red, blue, green, etc.)  
❌ NO emojis anywhere in UI  
❌ NO icons (no SVGs, no icon fonts)  
❌ NO box-shadow unless subtle (cards only)  
❌ NO animations longer than 0.3s  
❌ NO rounded buttons (`border-radius: 50%`)  
❌ NO gradients (except grayscale, sparingly)  
❌ NO multiple font families  
❌ NO font sizes not in the scale  

---

## Do's

✓ Use generous whitespace  
✓ Keep typography hierarchy clear  
✓ Align to 4px grid  
✓ Use semantic HTML  
✓ Test on multiple screen sizes  
✓ Keep animations subtle  
✓ Let content breathe  
✓ Trust the system font  

---

## Code Examples

### Using the System

```tsx
// Good: Using design system
<button className="btn btn-primary btn-large">
  Sign In
</button>

// Bad: Custom styles
<button style={{ 
  background: 'blue',
  padding: '10px 15px',
  borderRadius: '8px'
}}>
  Sign In
</button>
```

### Spacing

```tsx
// Good: Using spacing scale
<div className="mb-6">Content</div>
<div style={{ marginBottom: 'var(--space-6)' }}>Content</div>

// Bad: Random values
<div style={{ marginBottom: '25px' }}>Content</div>
```

### Colors

```tsx
// Good: Using color variables
<p className="text-gray-600">Subtitle</p>
<p style={{ color: 'var(--gray-600)' }}>Subtitle</p>

// Bad: Hardcoded colors
<p style={{ color: '#666' }}>Subtitle</p>
```

---

Built with discipline and respect for minimalism.






































































