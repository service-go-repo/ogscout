# Twitter Theme Design Tokens Reference

**Theme Source:** [tweakcn Twitter Theme](https://tweakcn.com/r/themes/twitter.json)
**Color Space:** OKLCH (Perceptually uniform)
**Last Updated:** 2025-10-06

---

## 🎨 Color Tokens

### Light Mode Colors

```css
/* Primary (Twitter Blue) */
--primary: oklch(0.6723 0.1606 244.9955)           /* #1D9BF0 */
--primary-foreground: oklch(1.0000 0 0)            /* #FFFFFF */

/* Backgrounds */
--background: oklch(1.0000 0 0)                    /* Pure White */
--foreground: oklch(0.1884 0.0128 248.5103)        /* Near Black */
--card: oklch(0.9784 0.0011 197.1387)             /* Off White */
--card-foreground: oklch(0.1884 0.0128 248.5103)   /* Near Black */
--popover: oklch(1.0000 0 0)                       /* White */
--popover-foreground: oklch(0.1884 0.0128 248.5103) /* Near Black */

/* Secondary & Muted */
--secondary: oklch(0.1884 0.0128 248.5103)         /* Dark Navy */
--secondary-foreground: oklch(1.0000 0 0)          /* White */
--muted: oklch(0.9222 0.0013 286.3737)            /* Light Gray */
--muted-foreground: oklch(0.1884 0.0128 248.5103)  /* Near Black */
--accent: oklch(0.9392 0.0166 250.8453)           /* Light Blue */
--accent-foreground: oklch(0.6723 0.1606 244.9955) /* Twitter Blue */

/* States */
--destructive: oklch(0.6188 0.2376 25.7658)        /* Red */
--destructive-foreground: oklch(1.0000 0 0)        /* White */

/* Borders & Inputs */
--border: oklch(0.9317 0.0118 231.6594)           /* Border Gray */
--input: oklch(0.9809 0.0025 228.7836)            /* Input Gray */
--ring: oklch(0.6818 0.1584 243.3540)             /* Focus Ring Blue */
```

### Dark Mode Colors

```css
/* Primary (Brighter Blue) */
--primary: oklch(0.6692 0.1607 245.0110)           /* Brighter #1D9BF0 */
--primary-foreground: oklch(1.0000 0 0)            /* White */

/* Backgrounds */
--background: oklch(0 0 0)                         /* Pure Black */
--foreground: oklch(0.9328 0.0025 228.7857)        /* Off White */
--card: oklch(0.2097 0.0080 274.5332)             /* Dark Gray Card */
--card-foreground: oklch(0.8853 0 0)              /* Light Gray */
--popover: oklch(0 0 0)                            /* Black */
--popover-foreground: oklch(0.9328 0.0025 228.7857) /* Off White */

/* Secondary & Muted */
--secondary: oklch(0.9622 0.0035 219.5331)         /* Very Light */
--secondary-foreground: oklch(0.1884 0.0128 248.5103) /* Dark */
--muted: oklch(0.2090 0 0)                         /* Dark Gray */
--muted-foreground: oklch(0.5637 0.0078 247.9662)  /* Mid Gray */
--accent: oklch(0.1928 0.0331 242.5459)           /* Dark Blue */
--accent-foreground: oklch(0.6692 0.1607 245.0110) /* Bright Blue */

/* States */
--destructive: oklch(0.6188 0.2376 25.7658)        /* Red */
--destructive-foreground: oklch(1.0000 0 0)        /* White */

/* Borders & Inputs */
--border: oklch(0.2674 0.0047 248.0045)           /* Dark Border */
--input: oklch(0.3020 0.0288 244.8244)            /* Dark Input */
--ring: oklch(0.6818 0.1584 243.3540)             /* Focus Ring Blue */
```

---

## 📐 Spacing Scale

Twitter theme uses a **4px base unit** (`--spacing: 0.25rem`).

```css
/* Tailwind Scale (4px/8px grid) */
0.5  = 2px   (0.125rem)
1    = 4px   (0.25rem)   /* Base unit */
2    = 8px   (0.5rem)
3    = 12px  (0.75rem)
4    = 16px  (1rem)
6    = 24px  (1.5rem)
8    = 32px  (2rem)
12   = 48px  (3rem)
16   = 64px  (4rem)
```

**Usage Guidelines:**
- Use multiples of 4px for consistency
- Prefer 8px (2) for small gaps
- Use 16px (4) for component padding
- Use 24px (6) for section spacing
- Use 32px+ (8+) for page-level spacing

---

## 🔘 Border Radius

Twitter theme uses **generous, rounded corners** (1.3rem = 20.8px).

```css
--radius: 1.3rem                              /* 20.8px - Default */
--radius-sm: calc(var(--radius) - 4px)       /* 16.8px */
--radius-md: calc(var(--radius) - 2px)       /* 18.8px */
--radius-lg: var(--radius)                    /* 20.8px */
--radius-xl: calc(var(--radius) + 4px)       /* 24.8px */
```

**Tailwind Classes:**
```tsx
rounded-sm  → 16.8px (small buttons, badges)
rounded-md  → 18.8px (inputs)
rounded-lg  → 20.8px (cards, main buttons) ✅ Most common
rounded-xl  → 24.8px (large cards, modals)
```

**Guidelines:**
- Use `rounded-lg` (20.8px) for most components
- Avoid `rounded-full` except for avatars/icons
- Buttons, cards, badges all use `rounded-lg`

---

## 🖋️ Typography

### Font Families

```css
--font-sans: Open Sans, sans-serif      /* Body & UI */
--font-serif: Georgia, serif            /* Quotes, emphasis */
--font-mono: Menlo, monospace          /* Code */
```

**Next.js Font Import:**
```tsx
import { Open_Sans } from "next/font/google";

const openSans = Open_Sans({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});
```

### Font Weights

```css
font-normal    → 400 (Body text)
font-semibold  → 600 (UI elements, buttons, badges)
font-bold      → 700 (Headings, emphasis)
```

### Letter Spacing

```css
--tracking-normal: 0em              /* Default - no extra spacing */
--tracking-tight: -0.025em          /* Tight (large headings) */
--tracking-wide: 0.025em            /* Wide (labels, uppercase) */
```

**Usage:**
```tsx
<h1 className="tracking-tight">Large Heading</h1>
<button className="tracking-normal">Click Me</button>
<label className="uppercase tracking-wide">Form Label</label>
```

### Type Scale

```css
text-xs    → 0.75rem (12px)  /* Small labels, captions */
text-sm    → 0.875rem (14px) /* Body small, secondary text */
text-base  → 1rem (16px)     /* Body text ✅ Default */
text-lg    → 1.25rem (20px)  /* Large body, card titles */
text-xl    → 1.5rem (24px)   /* Subheadings */
text-2xl   → 2rem (32px)     /* Page titles */
text-3xl   → 2.5rem (40px)   /* Hero headings */
```

---

## 🌑 Shadows (Flat Design)

Twitter theme uses **minimal, flat shadows** with **0% opacity** by default.

```css
--shadow-color: rgba(29,161,242,0.15)  /* Light mode */
--shadow-color: rgba(29,161,242,0.25)  /* Dark mode */

--shadow-2xs: 0px 2px 0px 0px hsl(202.8169 89.1213% 53.1373% / 0.00)
--shadow-xs:  0px 2px 0px 0px hsl(202.8169 89.1213% 53.1373% / 0.00)
--shadow-sm:  0px 2px 0px 0px ... 0px 1px 2px -1px ... / 0.00
--shadow:     0px 2px 0px 0px ... 0px 1px 2px -1px ... / 0.00
--shadow-md:  0px 2px 0px 0px ... 0px 2px 4px -1px ... / 0.00
--shadow-lg:  0px 2px 0px 0px ... 0px 4px 6px -1px ... / 0.00
--shadow-xl:  0px 2px 0px 0px ... 0px 8px 10px -1px ... / 0.00
--shadow-2xl: 0px 2px 0px 0px hsl(202.8169 89.1213% 53.1373% / 0.00)
```

**Key Insight:** Shadows are **effectively invisible** (0% opacity). Twitter's design philosophy emphasizes **flat, clean interfaces** with **borders instead of elevation**.

**Usage Guidelines:**
- Use `border` instead of `shadow` for separation
- Use `shadow-sm` only for subtle hover effects
- Reserve `shadow-lg` for modals/popovers that need depth
- Don't rely on shadows for visual hierarchy

```tsx
// ❌ Avoid - Shadows are invisible
<Card className="shadow-lg">...</Card>

// ✅ Prefer - Borders for separation
<Card className="border border-border">...</Card>

// ✅ OK - Subtle hover feedback
<Card className="border border-border hover:shadow-sm">...</Card>
```

---

## 🎭 Chart Colors

For data visualizations:

```css
--chart-1: oklch(0.6723 0.1606 244.9955)  /* Twitter Blue */
--chart-2: oklch(0.6907 0.1554 160.3454)  /* Green */
--chart-3: oklch(0.8214 0.1600 82.5337)   /* Yellow */
--chart-4: oklch(0.7064 0.1822 151.7125)  /* Teal */
--chart-5: oklch(0.5919 0.2186 10.5826)   /* Orange/Red */
```

---

## 🧭 Usage Examples

### Button

```tsx
// Primary action
<Button className="bg-primary text-primary-foreground hover:bg-primary/90">
  Submit
</Button>

// Destructive action
<Button className="bg-destructive text-destructive-foreground">
  Delete
</Button>

// Ghost button
<Button className="hover:bg-accent hover:text-accent-foreground">
  Cancel
</Button>
```

### Card

```tsx
<Card className="rounded-lg border border-border bg-card">
  <CardHeader className="p-6">
    <CardTitle className="text-lg font-bold">
      Card Title
    </CardTitle>
  </CardHeader>
  <CardContent className="p-6 pt-0">
    <p className="text-muted-foreground">Content here</p>
  </CardContent>
</Card>
```

### Badge

```tsx
<Badge className="rounded-lg bg-primary text-primary-foreground">
  New
</Badge>

<Badge className="rounded-lg border border-border text-foreground">
  Outline
</Badge>
```

### Input

```tsx
<Input
  className="rounded-lg border border-input bg-background
             focus-visible:ring-2 focus-visible:ring-ring"
/>
```

---

## ✅ Token Usage Checklist

When creating new components, ensure:

- [ ] All colors use semantic tokens (no `#hex` or `rgb()`)
- [ ] Border radius uses `rounded-lg` (1.3rem)
- [ ] Font family is `font-sans` (Open Sans)
- [ ] Font weights: 400 (normal), 600 (semibold), 700 (bold)
- [ ] Letter spacing is `tracking-normal` (0em)
- [ ] Spacing uses 4px/8px grid (multiples of 0.25rem)
- [ ] Borders used instead of shadows for separation
- [ ] Dark mode variants work correctly
- [ ] Focus states use `ring-ring` with proper contrast
- [ ] Hover states use semantic colors

---

## 🚫 Anti-Patterns (Avoid)

```tsx
// ❌ Hardcoded colors
className="bg-blue-500 text-white"

// ✅ Use tokens
className="bg-primary text-primary-foreground"

// ❌ Non-token radius
className="rounded-full"  // Unless avatar/icon

// ✅ Twitter theme radius
className="rounded-lg"

// ❌ Custom shadows
className="shadow-[0_4px_12px_rgba(0,0,0,0.15)]"

// ✅ Use borders
className="border border-border"

// ❌ Hardcoded spacing
className="p-[23px]"

// ✅ Use scale
className="p-6"  // 24px = 6 * 4px

// ❌ Wrong font
className="font-inter"

// ✅ Twitter theme font
className="font-sans"
```

---

## 📚 Additional Resources

- [Twitter Theme Demo](https://tweakcn.com/r/themes/twitter.json)
- [OKLCH Color Space Explainer](https://oklch.com)
- [Tailwind CSS v4 Documentation](https://tailwindcss.com/docs)
- [Open Sans Font](https://fonts.google.com/specimen/Open+Sans)

---

**Last Updated:** 2025-10-06
**Maintained By:** Repair Connect Design Team
