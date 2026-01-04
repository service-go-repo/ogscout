# NextSaaS Design System & Style Guide

**Version:** 2.0.0
**Framework:** Tailwind CSS v4
**Last Updated:** January 2026

This document provides a comprehensive reference for the NextSaaS Tailwind template design system. It is derived directly from the actual implementation and serves as the authoritative guide for designers and developers working with this template.

---

## Table of Contents

1. [Overview](#1-overview)
2. [Color Palette](#2-color-palette)
3. [Typography](#3-typography)
4. [Spacing System](#4-spacing-system)
5. [Component Styles](#5-component-styles)
6. [Animations & Transitions](#6-animations--transitions)
7. [Border Radius](#7-border-radius)
8. [Opacity & Transparency](#8-opacity--transparency)
9. [Common Tailwind CSS Usage](#9-common-tailwind-css-usage)
10. [Example Component Reference Design Code](#10-example-component-reference-design-code)
11. [Additional Observations](#11-additional-observations)

---

## 1. Overview

### Design Philosophy

The NextSaaS design system embodies a **modern SaaS/startup aesthetic** that balances professionalism with approachability. The visual language is clean, vibrant, and gradient-heavy, creating an engaging yet trustworthy interface suitable for B2B and B2C applications.

### Visual Direction

- **Clean and Minimal**: Generous whitespace, clear hierarchy, and uncluttered layouts
- **Vibrant Accents**: Bold use of gradients (purple, cyan, green, yellow) for visual interest
- **Smooth and Refined**: Rounded corners, subtle shadows, and smooth transitions throughout
- **Light and Dark**: Comprehensive dark mode support with carefully tuned color relationships

### Target Audience

This design system targets:
- **B2B SaaS** companies (automation, analytics, CRM)
- **Fintech** applications (banking, crypto, payments)
- **AI/Tech** startups (chatbots, AI agencies, tech platforms)
- **Enterprise software** with modern, user-friendly interfaces

### UI Personality

**Professional yet Friendly** • **Modern Minimal** • **Bold Accents** • **Tech-Forward**

The interface strikes a balance between corporate trustworthiness and startup energy. Typography is clean and readable, colors are vibrant but not overwhelming, and interactions are smooth and responsive.

### Consistency Approach

Consistency is maintained through:
- **Component-based architecture**: Reusable `.htm` components with Vite injection
- **Tailwind utility system**: Systematic use of utility classes with custom theme extensions
- **CSS custom utilities**: Predefined button, badge, and layout utilities via Tailwind v4's `@utility` directive
- **Design tokens**: Centralized CSS variables for colors, typography, spacing, and shadows
- **Responsive patterns**: Mobile-first approach with consistent breakpoint usage

---

## 2. Color Palette

### Primary Colors

The primary color is a vibrant purple (`#864ffe`) with a full scale from light to dark:

| Token | Hex Code | RGB | Usage |
|-------|----------|-----|-------|
| `primary-50` | `#f4f2fe` | rgb(244, 242, 254) | Light backgrounds, subtle tints |
| `primary-100` | `#ece8ff` | rgb(236, 232, 255) | Badge backgrounds |
| `primary-200` | `#dcd4ff` | rgb(220, 212, 255) | Hover states, light accents |
| `primary-300` | `#c3b1ff` | rgb(195, 177, 255) | Borders, decorative elements |
| `primary-400` | `#a585ff` | rgb(165, 133, 255) | Active states, gradients |
| `primary-500` | `#864ffe` | rgb(134, 79, 254) | **Main brand color**, primary buttons |
| `primary-600` | `#7c31f6` | rgb(124, 49, 246) | Button borders, hover darken |
| `primary-700` | `#6d1fe2` | rgb(109, 31, 226) | Pressed states |
| `primary-800` | `#5a19be` | rgb(90, 25, 190) | Deep accents |

**Usage:** Primary color is used for CTAs, links, active states, and brand emphasis throughout the interface.

### Semantic Colors

| Token | Hex Code | Usage |
|-------|----------|-------|
| `secondary` | `#1a1a1c` | Primary text color (light mode), dark backgrounds |
| `accent` | `#fcfcfc` | Primary text color (dark mode), light backgrounds |
| `split-text` | `#1a1a1c` / `#fcfcfc` | Context-aware text that adapts to theme |

### Background Colors

A comprehensive 12-level background system for layered UI construction:

#### Light Theme Backgrounds

| Token | Hex Code | Usage |
|-------|----------|-------|
| `background-1` | `#fcfcfd` | Lightest - card surfaces, form elements |
| `background-2` | `#f9fafb` | Page backgrounds, light sections |
| `background-3` | `#f4f5f8` | Elevated cards, feature sections |
| `background-4` | `#f0f2f6` | Buttons, higher elevation surfaces |
| `background-10` | `#ebebeb` | Neutral gray backgrounds |
| `background-11` | `#b5b5b9` | Dark gray, rarely used |
| `background-12` | `#eaeceb` | Ash gray, alternate cards |

#### Dark Theme Backgrounds

| Token | Hex Code | Usage |
|-------|----------|-------|
| `background-5` | `#13171e` | Primary dark body background |
| `background-6` | `#0f1217` | Dark cards, elevated surfaces |
| `background-7` | `#181d26` | Lighter dark cards |
| `background-8` | `#070b10` | Darkest - footers, deep backgrounds |
| `background-9` | `#1f252f` | Form elements, alternate surfaces |

### Stroke/Border Colors

Nine variations for borders, dividers, and outlines:

#### Light Theme Strokes

| Token | Hex Code | Usage |
|-------|----------|-------|
| `stroke-1` | `#dfe4eb` | Standard borders, dividers |
| `stroke-2` | `#e3e7ed` | Card borders |
| `stroke-3` | `#d7dde5` | Form element borders |
| `stroke-4` | `#eceff4` | Subtle borders |

#### Dark Theme Strokes

| Token | Hex Code | Usage |
|-------|----------|-------|
| `stroke-5` | `#1b232f` | Dark borders |
| `stroke-6` | `#202731` | Dark dividers |
| `stroke-7` | `#2a333e` | Form borders (dark) |
| `stroke-8` | `#303b49` | Elevated borders |
| `stroke-9` | `var(--color-background-8)` | Special case, darkest |

### Brand Accent Colors

Vibrant accent colors for badges, highlights, and visual interest:

| Token | Hex Code | RGB | Usage |
|-------|----------|-----|-------|
| `ns-yellow` | `#f9eb57` | rgb(249, 235, 87) | Warnings, highlights |
| `ns-green` | `#c6f56f` | rgb(198, 245, 111) | Success, positive states |
| `ns-red` | `#ffb9a2` | rgb(255, 185, 162) | Errors, negative states |
| `ns-cyan` | `#83e7ee` | rgb(131, 231, 238) | Info, cool accents |
| `ns-green-light` | `#e8fbc6` | rgb(232, 251, 198) | Badge backgrounds |
| `ns-cyan-light` | `#cdf5f8` | rgb(205, 245, 248) | Badge backgrounds |
| `ns-yellow-light` | `#fdf7bc` | rgb(253, 247, 188) | Badge backgrounds |

### Gradient System

Twelve predefined gradients for backgrounds, overlays, and decorative elements:

```css
/* Gradient 1: Purple to Pink */
--color-gradient-1: linear-gradient(135deg, #a585ff 0%, #ffc2ad 100%);

/* Gradient 2: Yellow to Coral */
--color-gradient-2: linear-gradient(135deg, #f9eb57 0%, #f99988 100%);

/* Gradient 3: Cyan to Yellow */
--color-gradient-3: linear-gradient(135deg, #83e7ee 0%, #f9eb57 100%);

/* Gradient 4: Purple to Cyan */
--color-gradient-4: linear-gradient(135deg, #864ffe 0%, #23eed6 100%);

/* Gradient 5: White Fade (Overlay) */
--color-gradient-5: linear-gradient(165deg, rgba(255,255,255,0.5) 0.51%, rgba(255,255,255,0) 64.43%);

/* Gradient 6: Cyan to Green (Vertical) */
--color-gradient-6: linear-gradient(#83e7ee 0%, #c6f56f 100%);

/* Gradient 7: White to Cyan (Vertical) */
--color-gradient-7: linear-gradient(#ffffff 0%, #83e7ee 100%);

/* Gradient 8: White to Purple */
--color-gradient-8: linear-gradient(156deg, #ffffff 32.92%, #a585ff 91%);

/* Gradient 9: Light Purple to Pink */
--color-gradient-9: linear-gradient(156deg, #dfb0ff 32.92%, #fdbedc 91%);

/* Gradient 10: Cyan to Green */
--color-gradient-10: linear-gradient(135deg, #83e7ee 0%, #c6f56f 100%);

/* Gradient 11: Vertical White Fade */
--color-gradient-11: linear-gradient(179deg, rgba(255,255,255,0) 0.68%, #fff 79.47%);

/* Gradient 12: Radial Cyan to Purple (Decorative) */
--color-gradient-12: radial-gradient(73.01% 80.77% at 19.23% 47.79%, #83e7ee 0%, rgba(134,79,254,0) 100%);
```

**Usage Contexts:**
- **Hero backgrounds**: Gradients 1, 3, 4
- **Avatar overlays**: Gradients 8, 9
- **Decorative backgrounds**: Gradients 6, 10, 12
- **Button backgrounds**: Gradient 1
- **Section overlays**: Gradients 5, 11

### Contrast & Accessibility

#### Text Contrast Strategy

- **Primary text**: `text-secondary dark:text-accent` (near-black on light, near-white on dark)
- **Secondary text**: 60% opacity for muted content (`text-secondary/60 dark:text-accent/60`)
- **Subtle text**: 40% opacity for very muted content
- **High contrast**: Pure black/white for critical elements

#### Opacity System for Hierarchy

| Opacity | Usage | Example |
|---------|-------|---------|
| `100%` | Primary content | Headings, labels, primary text |
| `80%` | Subtle emphasis | Subheadings, secondary labels |
| `60%` | Body text | Paragraphs, descriptions, captions |
| `40%` | Disabled/muted | Disabled text, placeholder text |
| `20%` | Backgrounds | Subtle overlays, ghost buttons |
| `10%` | Very subtle | Dividers, very light backgrounds |

#### Dark Mode Strategy

Dark mode is a **first-class citizen** in this design system:
- All components have explicit `dark:` variants
- Dark mode uses `--color-background-5` through `--color-background-9`
- Text automatically inverts: `dark:text-accent` applied systematically
- Borders use `dark:border-stroke-7` for appropriate contrast
- Shadows are reduced or removed in dark mode where appropriate

**Implementation:** Dark mode is triggered by adding the `.dark` class to any parent element (typically `<html>` or `<body>`).

---

## 3. Typography

### Font Family

**Primary Font:** Inter Tight (Google Fonts)
```css
--font-inter-tight: 'Inter Tight', sans-serif;
```

**Characteristics:**
- Modern, geometric sans-serif
- Excellent readability at all sizes
- Professional yet friendly appearance
- Strong number and symbol design
- Comprehensive weight range

### Font Weights Used

| Weight | Value | Usage |
|--------|-------|-------|
| Normal | `400` | Body text, paragraphs, descriptions |
| Medium | `500` | Headings, button text, section labels |
| Semibold | `600` | Emphasis, selected states (rarely used) |

**Note:** The design system primarily uses Normal (400) and Medium (500) weights, avoiding extreme weights for visual consistency.

### Font Pairing Strategy

While the system uses a single font family, different weights and sizes create clear hierarchy:

- **Headings** → Inter Tight Medium (500)
- **Body Text** → Inter Tight Normal (400)
- **UI Elements** → Inter Tight Normal (400) or Medium (500)
- **Buttons** → Inter Tight Medium (500)
- **Badges** → Inter Tight Normal (400)

### Type Scale

The type scale uses CSS custom properties with specific line-heights for each level:

#### Heading Sizes

| Level | Size | Pixels | Line Height | Usage |
|-------|------|--------|-------------|-------|
| H1 | `4.25rem` | 68px | 110% | Hero titles only |
| H2 | `3.25rem` | 52px | 120% | Major section headers |
| H3 | `2.5rem` | 40px | 120% | Section headers |
| H4 | `2rem` | 32px | 130% | Card titles, subsection headers |
| H5 | `1.5rem` | 24px | 140% | Component titles, small headers |
| H6 | `1.25rem` | 20px | 140% | Labels, emphasized text |

#### Body Text Sizes

| Name | Size | Pixels | Line Height | Usage |
|------|------|--------|-------------|-------|
| `tagline-1` | `1rem` | 16px | 150% | Primary body text, descriptions |
| `tagline-2` | `0.875rem` | 14px | 150% | Secondary text, captions, UI labels |
| `tagline-3` | `0.75rem` | 12px | 150% | Small text, timestamps, metadata |

### Responsive Typography

Typography scales responsively using Tailwind's responsive prefixes:

#### H1 (Hero Titles)
```html
<h1 class="text-heading-4 sm:text-heading-3 md:text-heading-2 xl:text-heading-1 font-medium">
```
- Mobile: 32px
- Small: 40px
- Medium: 52px
- Extra Large: 68px

#### H2 (Section Headers)
```html
<h2 class="text-heading-5 sm:text-heading-4 md:text-heading-3 xl:text-heading-2">
```
- Mobile: 24px
- Small: 32px
- Medium: 40px
- Extra Large: 52px

#### H3 (Subsections)
```html
<h3 class="text-heading-5 md:text-heading-4 xl:text-heading-3">
```
- Mobile: 24px
- Medium: 32px
- Extra Large: 40px

#### Body Text
```html
<p class="text-tagline-2 sm:text-tagline-1">
```
- Mobile: 14px
- Small: 16px

### Typography Hierarchy in Practice

#### Hero Titles
- Use `text-heading-1` or responsive variants
- Always pair with `font-medium`
- Center-aligned on hero sections
- May include inline `<span class="text-primary-500">` for emphasis

Example:
```html
<h1 class="mb-4 text-heading-4 sm:text-heading-3 md:text-heading-2 xl:text-heading-1 font-medium">
  Automate smarter. <br class="hidden md:block" />
  Grow faster.
</h1>
```

#### Section Headers
- Use `text-heading-2` or `text-heading-3`
- Often preceded by a badge
- 60% opacity subtitle below
- Centered or left-aligned depending on section

Example:
```html
<div class="text-center space-y-5 max-w-[750px] mx-auto">
  <span class="badge badge-green">Features</span>
  <h2 class="mb-3">Automation that fits your needs.</h2>
  <p class="text-secondary/60 dark:text-accent/60 max-w-[600px] mx-auto">
    Powerful tools to streamline operations and boost efficiency.
  </p>
</div>
```

#### Card Titles
- Use `text-heading-5` or `text-heading-6`
- Often responsive: `text-heading-6 sm:text-heading-5`
- Dark mode support: `text-secondary dark:text-accent`

#### Body Text
- Primary body: `text-tagline-1` (16px)
- Muted body: `text-secondary/60 dark:text-accent/60`
- Small text: `text-tagline-2` (14px)
- Captions: `text-tagline-3` (12px)

#### Link Styling
Links inherit parent styles and use color changes on hover:
```html
<a href="#" class="text-secondary dark:text-accent hover:text-primary-500">Link Text</a>
```

Footer links use an underline animation (see Animations section).

### CSS Base Styles

The base typography styles are applied globally via `base.css`:

```css
h1, h2, h3, h4, h5, h6 {
  @apply font-inter-tight text-secondary dark:text-accent;
}

h1 {
  @apply text-heading-4 sm:text-heading-3 md:text-heading-2 xl:text-heading-1 font-medium;
}

h2 {
  @apply text-heading-5 sm:text-heading-4 md:text-heading-3 xl:text-heading-2;
}

h3 {
  @apply text-heading-5 md:text-heading-4 xl:text-heading-3;
}

h4 {
  @apply text-heading-4;
}

h5 {
  @apply text-heading-5;
}

h6 {
  @apply text-heading-6;
}

p {
  @apply text-tagline-2 sm:text-tagline-1 text-secondary/60 dark:text-accent/60 font-normal;
}
```

---

## 4. Spacing System

### Base Scale

The design system uses **Tailwind's default spacing scale**, which is based on `0.25rem` (4px) increments:

| Token | Rem | Pixels | Usage |
|-------|-----|--------|-------|
| `0` | 0 | 0px | No spacing |
| `0.5` | 0.125rem | 2px | Hairline spacing |
| `1` | 0.25rem | 4px | Minimum spacing |
| `1.5` | 0.375rem | 6px | Small gaps |
| `2` | 0.5rem | 8px | **Base spacing unit** |
| `2.5` | 0.625rem | 10px | Button padding |
| `3` | 0.75rem | 12px | Standard gaps |
| `4` | 1rem | 16px | Common spacing |
| `5` | 1.25rem | 20px | Badge padding |
| `6` | 1.5rem | 24px | Card spacing |
| `8` | 2rem | 32px | **Card padding standard** |
| `10` | 2.5rem | 40px | Section spacing |
| `12` | 3rem | 48px | Large gaps |
| `14` | 3.5rem | 56px | Section spacing |
| `16` | 4rem | 64px | Section spacing |
| `20` | 5rem | 80px | Large section spacing |

### Section Spacing Patterns

#### Hero Sections
Hero sections use **very large** top padding to accommodate fixed headers and create dramatic entrance:

```html
<!-- AI Agency Hero -->
<section class="pt-[320px] md:pt-[200px] lg:pt-[200px] xl:pt-[260px]
                pb-16 md:pb-20 lg:pb-[120px] xl:pb-[150px]">

<!-- Crypto Marketing Hero -->
<section class="pt-[200px] 2xl:pt-[250px] pb-16 lg:pb-[100px]">
```

**Pattern:**
- Mobile: 200-320px top padding
- Desktop: 200-260px top padding
- Bottom: 64-150px bottom padding

#### Standard Sections
Most content sections use this responsive padding pattern:

```html
<section class="pt-16 md:pt-20 lg:pt-[90px] xl:pt-[100px]
                pb-16 md:pb-20 lg:pb-[90px] xl:pb-[100px]">
```

**Breakdown:**
- Mobile (`pt-16`): 64px
- Medium (`md:pt-20`): 80px
- Large (`lg:pt-[90px]`): 90px
- Extra Large (`xl:pt-[100px]`): 100px

#### CTA Sections
Call-to-action sections use moderate padding:

```html
<section class="py-[50px] md:py-20 lg:py-28">
```
- Mobile: 50px
- Medium: 80px
- Large: 112px

#### Footer Sections
```html
<footer class="pt-[90px] pb-12">
```
- Top: 90px
- Bottom: 48px

### Component Spacing

#### Cards
Standard card padding:
```html
<div class="p-8 rounded-[20px]">  <!-- 32px all sides -->
```

Compact cards:
```html
<div class="p-6 rounded-[20px]">  <!-- 24px all sides -->
```

#### Buttons

| Size | Padding | Height |
|------|---------|--------|
| `btn-sm` | `px-4 py-1` | Auto |
| `btn-base` | `px-[18px] py-2.5` | 43px |
| `btn-md` | `px-5 py-2.5` | Auto |
| `btn-lg` | `px-6 py-2.5` | Auto |
| `btn-xl` | `px-8 py-3.5` | 54px |

#### Form Elements
Standard input padding:
```html
<input class="px-[18px] py-3 h-[45px]">
```
- Horizontal: 18px
- Vertical: 12px
- Height: 45px (typical)

#### Badges
```html
<span class="badge px-5 py-1.5">  <!-- 20px horizontal, 6px vertical -->
```

### Vertical Rhythm

Vertical spacing within components uses the `space-y-*` utility:

| Class | Spacing | Usage |
|-------|---------|-------|
| `space-y-1` | 4px | Tight lists |
| `space-y-2` | 8px | List items, compact groups |
| `space-y-2.5` | 10px | Form fields |
| `space-y-4` | 16px | Form groups |
| `space-y-5` | 20px | Section headers |
| `space-y-6` | 24px | Card content |
| `space-y-8` | 32px | Major sections within cards |

Example:
```html
<div class="space-y-6">
  <div class="space-y-2">
    <h5>Card Title</h5>
    <p>Description text</p>
  </div>
  <figure>
    <img src="..." />
  </figure>
</div>
```

### Grid and Layout Spacing

#### Grid Gaps
```html
<!-- Standard grid -->
<div class="grid grid-cols-12 gap-8">  <!-- 32px gap -->

<!-- Compact grid -->
<div class="grid grid-cols-12 gap-4">  <!-- 16px gap -->

<!-- Responsive gaps -->
<div class="grid grid-cols-12 space-y-8 md:space-y-0 md:gap-8">
```

#### Horizontal Gaps
```html
<div class="flex gap-4">        <!-- 16px -->
<div class="flex gap-x-4">      <!-- 16px horizontal only -->
<div class="flex gap-y-16">     <!-- 64px vertical only -->
```

### Container & Layout Spacing

#### Main Container
The primary content container:
```html
<div class="main-container">
  <!-- max-w-[1290px] mx-auto lp:px-0 px-5 -->
</div>
```
- Max width: 1290px
- Horizontal padding: 0 on large screens (`lp` breakpoint), 20px on mobile
- Centered with `mx-auto`

#### Content Max-Widths
Text content is often constrained to narrower widths for readability:

| Max Width | Pixels | Usage |
|-----------|--------|-------|
| `max-w-[600px]` | 600px | Paragraphs |
| `max-w-[650px]` | 650px | Hero descriptions |
| `max-w-[750px]` | 750px | Section headers |
| `max-w-[872px]` | 872px | Long-form content |
| `max-w-[1010px]` | 1010px | Service cards |

### Spacing Philosophy

The spacing system follows these principles:

1. **8px Base Unit**: Most spacing is a multiple of 8px (2rem/8)
2. **Progressive Increase**: Spacing increases with viewport size
3. **Consistent Gaps**: Same gaps used throughout similar contexts
4. **Breathing Room**: Generous whitespace, especially on larger screens
5. **Optical Alignment**: Spacing adjusted for visual weight, not just mathematical precision

---

## 5. Component Styles

This section documents all major UI components with full code examples, variants, states, and styling patterns.

---

### 5.1 Buttons

Buttons are the primary interactive element in the design system, with two style systems: **Standard Buttons** and **V2 Buttons** (with animated icons).

#### Base Button Class

All buttons share a base `.btn` class with these characteristics:

```css
.btn {
  @apply relative overflow-hidden border rounded-full cursor-pointer
         inline-block text-center transition-all duration-500 ease-in-out
         font-normal text-nowrap hover:scale-102 lowercase;
}
```

**Key Features:**
- Fully rounded (`rounded-full`)
- Hover scale effect (`hover:scale-102` = 102%)
- Smooth 500ms transitions
- Lowercase text with capitalized first letter
- Hidden arrow icon that appears on hover

#### Button Size Variants

##### Small Button (`btn-sm`)
```html
<a href="#" class="btn btn-primary btn-sm">
  <span>Small</span>
</a>
```
- Padding: `px-4 py-1` (16px horizontal, 4px vertical)
- No arrow icon
- Compact for tight spaces

##### Base Button (`btn-base`)
```html
<a href="#" class="btn btn-primary btn-base">
  <span>Base Size</span>
</a>
```
- Padding: `px-[18px] py-2.5` (18px horizontal, 10px vertical)
- Text size: `text-tagline-1` (16px)
- Arrow icon: 8px on hover

##### Medium Button (`btn-md`)
```html
<a href="#" class="btn btn-primary btn-md">
  <span>Medium</span>
</a>
```
- Padding: `px-5 py-2.5` (20px horizontal, 10px vertical)
- Min width: `min-w-[90px]`
- Text size: `text-tagline-2` (14px)
- Arrow icon: 10px on hover

##### Large Button (`btn-lg`)
```html
<a href="#" class="btn btn-primary btn-lg">
  <span>Large Button</span>
</a>
```
- Padding: `px-6 py-2.5` (24px horizontal, 10px vertical)
- Text size: `text-tagline-1` (16px)
- Arrow icon: 12px on hover

##### Extra Large Button (`btn-xl`)
```html
<a href="#" class="btn btn-primary btn-xl">
  <span>Extra Large</span>
</a>
```
- Padding: `px-8 py-3.5` (32px horizontal, 14px vertical)
- Text size: `text-tagline-1` (16px)
- Arrow icon: 12px on hover
- Most commonly used for hero CTAs

#### Button Color Variants

##### Primary Button (`btn-primary`)
```html
<a href="#" class="btn btn-primary btn-xl">
  <span>Get started</span>
</a>
```
- Background: `bg-primary-500` (#864ffe)
- Border: `border-primary-600`
- Text: `text-white`
- Shadow: `shadow-1`
- **Usage:** Primary CTAs, main actions

##### Secondary Button (`btn-secondary`)
```html
<a href="#" class="btn btn-secondary btn-lg">
  <span>Learn more</span>
</a>
```
- Background: `bg-secondary` (#1a1a1c)
- Border: `border-black`
- Text: `text-white`
- Shadow: `shadow-1`
- **Usage:** Secondary actions, alternative CTAs

##### White Button (`btn-white`)
```html
<a href="#" class="btn btn-white btn-md">
  <span>Explore</span>
</a>
```
- Background: `bg-background-1` (#fcfcfd)
- Border: `border-stroke-3`
- Text: `text-secondary`
- Shadow: `shadow-1`
- **Usage:** Light backgrounds, secondary actions

##### White Button Dark Mode (`btn-white-dark`)
```html
<a href="#" class="btn btn-white-dark btn-lg dark:btn-white-dark">
  <span>Get started</span>
</a>
```
- Background: `bg-background-6`
- Border: `border-stroke-7`
- Text: `text-accent`
- **Usage:** Dark mode alternative to white button

##### Accent Button (`btn-accent`)
```html
<a href="#" class="btn btn-accent btn-md">
  <span>Discover</span>
</a>
```
- Background: `bg-accent`
- Border: `border-stroke-3`
- Text: `text-secondary`
- **Usage:** Dark backgrounds

##### Green Button (`btn-green`)
```html
<a href="#" class="btn btn-green btn-md">
  <span>Success</span>
</a>
```
- Background: `bg-ns-green` (#c6f56f)
- Border: `border-ns-green-light`
- Text: `text-secondary`
- **Usage:** Success states, positive actions

##### Gray Button (`btn-gray`)
```html
<a href="#" class="btn btn-gray btn-md">
  <span>View all</span>
</a>
```
- Background: `bg-background-4`
- No border
- Text: `text-secondary`
- Font weight: `font-medium`
- **Usage:** Neutral actions

##### Transparent Button (`btn-transparent`)
```html
<a href="#" class="btn btn-transparent btn-md">
  <span>Learn more</span>
</a>
```
- Background: `bg-transparent`
- Border: `border-stroke-7`
- Text: `text-accent`
- **Usage:** Dark backgrounds, ghost buttons

##### Ash Button (`btn-ash`)
```html
<a href="#" class="btn btn-ash btn-md">
  <span>Details</span>
</a>
```
- Background: `bg-background-12`
- Text: `text-secondary`

##### Dark Button (`btn-dark`)
```html
<a href="#" class="btn btn-dark btn-md">
  <span>Explore</span>
</a>
```
- Background: `bg-accent/10` (10% opacity)
- No border
- Text: `text-accent`
- Shadow: `shadow-1`

##### Black Button (`btn-black`)
```html
<a href="#" class="btn btn-black btn-md">
  <span>Get started</span>
</a>
```
- Background: `bg-black`
- No border
- Text: `text-accent`
- Shadow: `shadow-1`

##### Light Button (`btn-light`)
```html
<a href="#" class="btn btn-light btn-md">
  <span>Contact</span>
</a>
```
- Background: `bg-background-1`
- No border
- Text: `text-secondary`
- Shadow: `shadow-1`

#### Button State Combinations

##### Hover State Changes
Buttons can change color variants on hover:
```html
<a href="#" class="btn btn-primary hover:btn-white btn-xl">
  <span>Get started</span>
</a>

<a href="#" class="btn btn-secondary hover:btn-primary btn-lg">
  <span>Discover</span>
</a>

<a href="#" class="btn btn-white hover:btn-secondary dark:btn-accent btn-md">
  <span>Learn more</span>
</a>
```

##### Dark Mode Variants
```html
<a href="#" class="btn btn-primary dark:btn-accent btn-xl">
  <span>Get started</span>
</a>

<a href="#" class="btn btn-secondary dark:hover:btn-primary btn-lg">
  <span>Discover</span>
</a>
```

##### Full Width Mobile Buttons
```html
<a href="#" class="btn btn-primary btn-lg w-full md:w-auto">
  <span>Submit</span>
</a>
```

#### Button V2 (With Animated Icon)

Button V2 features a **pixelated arrow icon** that slides horizontally on hover, creating a modern, playful interaction.

##### V2 Size Variants

**Small V2** (`btn-sm-v2`):
```html
<div class="group/btn-v2 inline-block rounded-full duration-500 transition-transform">
  <a href="#" class="inline-flex items-center justify-center rounded-full cursor-pointer
                     gap-1.5 btn-primary-v2 btn-sm-v2 text-center transition-all duration-500
                     ease-in-out font-medium text-nowrap lowercase w-full">
    <span class="inline-block transition-transform duration-300 ease-in-out first-letter:uppercase">
      Small V2
    </span>
    <div class="relative overflow-hidden size-6">
      <span class="group-hover/btn-v2:translate-x-1 -translate-x-6 absolute inset-0
                   transition-all duration-300 ease-in-out size-6 btn-v2-icon">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <path d="M11 5H13V7H11V5Z" />
          <path d="M5 5H7V7H5V5Z" />
          <path d="M14 8H16V10H14V8Z" />
          <path d="M8 8H10V10H8V8Z" />
          <path d="M17 11H19V13H17V11Z" />
          <path d="M11 11H13V13H11V11Z" />
          <path d="M14 14H16V16H14V14Z" />
          <path d="M8 14H10V16H8V14Z" />
          <path d="M11 17H13V19H11V17Z" />
          <path d="M5 17H7V19H5V17Z" />
        </svg>
      </span>
      <span class="group-hover/btn-v2:translate-x-6 absolute -translate-x-2
                   transition-all duration-300 ease-in-out size-6 btn-v2-icon">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <path d="M11 5H13V7H11V5Z" />
          <path d="M5 5H7V7H5V5Z" />
          <path d="M14 8H16V10H14V8Z" />
          <path d="M8 8H10V10H8V8Z" />
          <path d="M17 11H19V13H17V11Z" />
          <path d="M11 11H13V13H11V11Z" />
          <path d="M14 14H16V16H14V14Z" />
          <path d="M8 14H10V16H8V14Z" />
          <path d="M11 17H13V19H11V17Z" />
          <path d="M5 17H7V19H5V17Z" />
        </svg>
      </span>
    </div>
  </a>
</div>
```
- Padding: `px-4 py-1`
- Text: `text-tagline-2` (14px)

**Base V2** (`btn-base-v2`):
- Padding: `px-[18px] py-2.5`
- Height: `h-[43px]`
- Text: `text-tagline-1` (16px)

**Medium V2** (`btn-md-v2`):
- Padding: `px-5 py-2.5`
- Min width: `min-w-[90px]`
- Text: `text-tagline-1`

**Large V2** (`btn-lg-v2`):
- Padding: `px-6 py-3`
- Hover scale: `hover:scale-102`
- Text: `text-tagline-1`

**Extra Large V2** (`btn-xl-v2`):
- Padding: `px-8 py-3.5`
- Height: `h-[54px]`
- Hover scale: `hover:scale-102`
- Text: `text-tagline-1`

##### V2 Color Variants

**Primary V2** (`btn-primary-v2`):
```html
<a href="#" class="... btn-primary-v2 btn-lg-v2 ...">
  <span>Get started</span>
  <!-- icon -->
</a>
```
- Background: `bg-primary-500`
- Text: `text-white`
- Icon fill: `fill-white`

**Secondary V2** (`btn-secondary-v2`):
- Background: `bg-secondary`
- Text: `text-white`
- Shadow: Custom shadow
- Icon fill: `fill-white`

**White V2** (`btn-v2-white`):
- Background: `bg-white`
- Border: `border border-stroke-3`
- Text: `text-secondary`
- Icon fill: `fill-secondary`

**Gray V2** (`btn-gray-v2`):
- Background: `bg-background-1`
- Text: `text-secondary`
- Shadow: `shadow-1`
- Icon fill: `fill-secondary`

**Green V2** (`btn-green-v2`):
- Background: `bg-ns-green`
- Text: `text-secondary`
- Shadow: `shadow-1`
- Icon fill: `fill-secondary`

**Ash V2** (`btn-ash-v2`):
- Background: `bg-background-4`
- Text: `text-secondary`
- Shadow: `shadow-1`
- Icon fill: `fill-secondary`

**Stone V2** (`btn-stone-v2`):
- Background: `bg-background-12`
- Text: `text-secondary`
- Icon fill: `fill-secondary`

---

### 5.2 Badges

Badges are small, pill-shaped labels used to highlight status, categories, or features.

#### Base Badge Class

```css
.badge {
  @apply inline-block text-nowrap text-tagline-2 font-normal text-secondary
         backdrop-blur-ns-badge-blur rounded-full px-5 py-1.5
         first-letter:uppercase lowercase;
}
```

**Key Features:**
- Rounded full pill shape
- Backdrop blur effect
- 14px text (tagline-2)
- Lowercase with capitalized first letter
- 20px horizontal padding, 6px vertical

#### Badge Color Variants

##### Green Badge (`badge-green`)
```html
<span class="badge badge-green">Features</span>
```
- Background: `bg-ns-green-light` (#e8fbc6)
- Text: `text-secondary`
- Dark mode: `dark:text-ns-yellow dark:bg-accent/10`
- **Usage:** Features, success, positive states

##### Green Badge V2 (`badge-green-v2`)
```html
<span class="badge badge-green-v2">Available</span>
```
- Background: `bg-ns-green-light`
- Dark mode: `dark:text-ns-green dark:bg-accent/10`

##### Yellow Badge (`badge-yellow`)
```html
<span class="badge badge-yellow">New</span>
```
- Background: `bg-ns-yellow-light` (#fdf7bc)
- Text: `text-secondary`
- Dark mode: `dark:text-ns-yellow dark:bg-accent/10`
- **Usage:** Warnings, highlights, "new" indicators

##### Yellow Badge V2 (`badge-yellow-v2`)
```html
<span class="badge badge-yellow-v2">Premium</span>
```
- Background: `bg-ns-yellow-light`
- Dark mode: `dark:text-ns-cyan dark:bg-accent/10`

##### Cyan Badge (`badge-cyan`)
```html
<span class="badge badge-cyan">Our vision</span>
```
- Background: `bg-ns-cyan-light` (#cdf5f8)
- Text: `text-secondary`
- Dark mode: `dark:text-ns-green dark:bg-accent/10`
- **Usage:** Info, highlights, special sections

##### Cyan Badge V2 (`badge-cyan-v2`)
```html
<span class="badge badge-cyan-v2">Learn</span>
```
- Background: `bg-ns-cyan-light`
- Dark mode: `dark:text-ns-cyan dark:bg-accent/10`

##### Gray Badge (`badge-gray`)
```html
<span class="badge badge-gray">Category</span>
```
- Background: `bg-accent/40`
- Text: `text-secondary`
- Dark mode: `dark:bg-secondary/40 dark:text-accent`
- **Usage:** Neutral categories, tags

##### Gray Light Badge (`badge-gray-light`)
```html
<span class="badge badge-gray-light">Draft</span>
```
- Background: `bg-background-3`
- Text: `text-secondary/60`
- Dark mode: `dark:bg-accent/10 dark:text-accent/60`
- **Usage:** Muted states, secondary info

##### Gray Light V2 Badge (`badge-gray-light-v2`)
```html
<span class="badge badge-gray-light-v2">Medium</span>
```
- Background: `bg-background-12`
- Text: `text-secondary`
- Font weight: `font-medium`

##### Gray Dark Badge (`badge-gray-dark`)
```html
<span class="badge badge-gray-dark">Tag</span>
```
- Background: `bg-background-3`
- Text: `text-secondary/60`
- **Usage:** Light mode only, muted

##### Metal Badge (`badge-metal`)
```html
<span class="badge badge-metal">Beta</span>
```
- Background: `bg-accent/10`
- Text: `text-accent/60`
- **Usage:** Dark backgrounds, subtle labels

##### White Badge (`badge-white`)
```html
<span class="badge badge-white">Popular</span>
```
- Background: `bg-white`
- Text: `text-secondary/60`
- Dark mode: `dark:text-accent/60 dark:bg-accent/10`
- **Usage:** Colored backgrounds

##### White V2 Badge (`badge-white-v2`)
```html
<span class="badge badge-white-v2">Trending</span>
```
- Background: `bg-white`
- Text: `text-secondary/60`
- Font weight: `font-semibold`

##### Primary Badge (`badge-primary`)
```html
<span class="badge badge-primary">New Feature</span>
```
- Background: `bg-background-4`
- Text: `text-primary-500`
- Dark mode: `dark:bg-accent/10 dark:text-ns-green`
- **Usage:** Brand-colored highlights

##### Primary Light Badge (`badge-primary-light`)
```html
<span class="badge badge-primary-light">Featured</span>
```
- Background: `bg-primary-100`
- Text: `text-secondary`
- Dark mode: `dark:bg-accent/10 dark:text-accent`

##### Blur Badge (`badge-blur`)
```html
<span class="badge badge-blur">Pro</span>
```
- Background: `bg-accent/10`
- Text: `text-primary-50`
- **Usage:** Dark backgrounds, overlays

##### Blur V2 Badge (`badge-blur-v2`)
```html
<span class="badge badge-blur-v2">Premium</span>
```
- Background: `bg-accent/20`
- Text: `text-primary-50`
- Dark mode: `dark:bg-secondary/20 dark:text-accent/60`

##### Secondary Badge (`badge-secondary`)
```html
<span class="badge badge-secondary">Exclusive</span>
```
- Background: `bg-secondary`
- Text: `text-white`
- Font weight: `font-medium`
- Dark mode: `dark:bg-accent dark:text-secondary`
- **Usage:** High-contrast labels

#### Badge Usage Patterns

**Section Headers:**
```html
<div class="text-center space-y-5">
  <span class="badge badge-cyan mb-5">Features</span>
  <h2>Automation that fits your needs.</h2>
</div>
```

**Blog Post Categories:**
```html
<div class="flex items-center gap-2">
  <span class="badge badge-green mr-1">Finance</span>
  <span class="text-tagline-3">Kristin Watson</span>
</div>
```

**Pricing Plans:**
```html
<div class="space-y-2">
  <span class="badge badge-primary">Most Popular</span>
  <h3>Professional Plan</h3>
</div>
```

---

### 5.3 Form Elements

#### Text Inputs

##### Standard Input
```html
<input
  type="text"
  class="w-full px-[18px] py-3 h-[45px] rounded-full
         border border-stroke-3 bg-background-1
         text-tagline-2 text-secondary
         placeholder:text-secondary/60 placeholder:font-normal
         focus:outline-none focus:border-secondary
         dark:bg-background-6 dark:border-stroke-7
         dark:text-accent dark:placeholder:text-accent/60
         dark:focus:border-primary-400"
  placeholder="Enter your name"
/>
```

**Key Properties:**
- Height: 45px
- Padding: 18px horizontal, 12px vertical
- Border: 1px solid stroke-3 (light) or stroke-7 (dark)
- Background: background-1 (light) or background-6 (dark)
- Rounded: Full pill shape
- Focus: Border changes to secondary color

##### Auth Form Input (Custom Class)
```html
<input
  type="email"
  class="auth-form-input"
  placeholder="Enter your email"
/>
```

Custom class defined as:
```css
.auth-form-input {
  @apply block h-[45px] py-3 px-[18px] rounded-full
         border border-stroke-3 bg-background-1
         placeholder:text-tagline-2 placeholder:font-normal
         placeholder:text-secondary/60 w-full
         focus:outline-none focus:ring-0 text-secondary
         font-normal text-tagline-1
         dark:bg-background-6 dark:border-stroke-7
         dark:placeholder:text-accent/60 dark:text-accent;
}
```

##### Email Input (CTA Forms)
```html
<input
  type="email"
  class="px-[18px] shadow-1 h-12 py-3
         placeholder:text-secondary/50 rounded-full
         border border-stroke-1 lg:max-w-[340px] md:w-[71%] w-full
         dark:border-stroke-7 dark:placeholder:text-accent/60
         focus:outline-none focus:border-primary-600
         dark:focus:border-primary-400
         placeholder:font-normal font-normal"
  placeholder="Enter your email"
/>
```

**Differences:**
- Height: 48px (taller)
- Shadow: shadow-1
- Max width: 340px on large screens
- Focus border: primary-600 instead of secondary

#### Textarea

```html
<textarea
  id="message"
  rows="7"
  class="w-full px-[18px] py-3 rounded-xl
         border border-stroke-3 bg-background-1
         text-tagline-2 text-secondary
         placeholder:text-secondary/60
         focus:outline-none focus:border-secondary
         dark:bg-background-6 dark:border-stroke-7
         dark:placeholder:text-accent/60 dark:text-accent
         dark:focus-visible:border-stroke-4/20
         placeholder:font-normal font-normal"
  placeholder="Enter your message"
></textarea>
```

**Key Differences from Inputs:**
- Rounded: `rounded-xl` (not full)
- Min rows: 7
- Same padding and styling as inputs

#### Checkbox (Custom Styled)

```html
<label class="flex items-center gap-x-3 cursor-pointer">
  <input id="terms" type="checkbox" class="sr-only peer" />
  <span class="size-4 rounded-full border border-stroke-3
               dark:border-stroke-7 relative
               after:absolute after:size-2.5 after:bg-primary-500
               after:rounded-full after:top-1/2 after:left-1/2
               after:-translate-x-1/2 after:-translate-y-1/2
               after:opacity-0 peer-checked:after:opacity-100
               peer-checked:border-primary-500 cursor-pointer">
  </span>
  <span class="text-tagline-1 text-secondary dark:text-accent select-none">
    I agree to the terms and conditions
  </span>
</label>
```

**How It Works:**
- Actual checkbox hidden with `sr-only`
- Custom visual checkbox created with `<span>`
- Checked state uses `peer-checked:` to show inner dot
- Inner dot: 10px purple circle
- Outer border changes to primary-500 when checked

##### Alternative Checkbox (Larger)
```html
<label class="flex items-start gap-2.5 cursor-pointer">
  <input type="checkbox" class="peer sr-only" />
  <span class="mt-1 size-5 shrink-0 rounded-full border
               border-stroke-3 dark:border-stroke-7 relative
               after:absolute after:size-3 after:bg-primary-500
               after:rounded-full after:top-1/2 after:left-1/2
               after:-translate-x-1/2 after:-translate-y-1/2
               after:opacity-0 peer-checked:after:opacity-100
               peer-checked:border-primary-500 cursor-pointer">
  </span>
  <div class="flex-1">
    <p class="text-tagline-1 text-secondary dark:text-accent">
      Label text
    </p>
  </div>
</label>
```

**Larger Variant:**
- Outer: 20px (size-5)
- Inner: 12px (size-3)
- Margin top: 4px to align with text

#### Toggle Switch (Pricing Toggle)

```html
<label class="relative inline-flex items-center cursor-pointer">
  <!-- Monthly label -->
  <span class="mr-2.5 text-base text-secondary dark:text-accent font-normal">
    Monthly
  </span>

  <!-- Toggle input -->
  <input type="checkbox" id="priceCheck" class="sr-only peer" />

  <!-- Toggle track -->
  <span class="relative w-13 h-[28px] bg-secondary dark:bg-accent rounded-[34px]
               peer-checked:after:translate-x-full
               after:content-[''] after:absolute after:top-1/2
               after:-translate-y-1/2 after:start-[2px]
               peer-checked:after:start-[2px]
               after:bg-accent dark:after:bg-secondary
               after:rounded-full after:h-6 after:w-6
               after:transition-all">
  </span>

  <!-- Yearly label -->
  <span class="ms-2.5 text-base text-secondary dark:text-accent font-normal">
    Yearly
  </span>
</label>
```

**Visual Breakdown:**
- Track: 52px wide × 28px tall
- Toggle circle: 24px diameter
- Circle position: 2px from edge
- Checked: Circle translates 100% right
- Track colors invert in dark mode

#### Social Login Buttons

```html
<button class="flex items-center justify-center gap-2 w-full
               border border-stroke-3 dark:border-stroke-7
               py-3 px-8 rounded-full cursor-pointer group
               transition-colors duration-500 ease-in-out
               hover:bg-primary-500">
  <span class="size-6 block">
    <img src="./images/icons/google.svg" alt="Google" />
  </span>
  <span class="text-tagline-2 font-medium text-secondary
               dark:text-accent group-hover:text-accent
               transition-colors duration-500 ease-in-out">
    Continue with Google
  </span>
</button>
```

**Features:**
- Icon: 24px × 24px
- Hover: Background becomes primary-500
- Text color changes to white on hover
- Smooth 500ms color transitions

---

### 5.4 Cards

#### Feature Cards

##### Large Feature Card
```html
<div class="col-span-12 md:col-span-6 lg:col-span-8
            p-8 rounded-[20px] bg-background-3 dark:bg-background-7
            space-y-6">
  <div class="space-y-2">
    <h5 class="max-sm:text-heading-6">
      Smart analytics with real-time insights.
    </h5>
    <p class="max-w-[450px]">
      Stay in the loop and make better choices with awesome,
      built-in analytics that give you real-time insights.
    </p>
  </div>
  <figure class="w-full">
    <img
      src="./images/ns-img-175.png"
      alt="Feature image"
      class="w-full object-cover rounded-2xl"
    />
  </figure>
</div>
```

**Structure:**
- Grid: 8 columns on large screens
- Padding: 32px all sides
- Border radius: 20px
- Background: background-3 (light) or background-7 (dark)
- Content spacing: 24px vertical (space-y-6)
- Image: Full width, rounded-2xl

##### Small Feature Card
```html
<div class="col-span-12 md:col-span-6 lg:col-span-4
            p-8 rounded-[20px] bg-background-3 dark:bg-background-7
            space-y-6">
  <div class="space-y-2">
    <h5 class="max-sm:text-heading-6">Seamless system integrations.</h5>
    <p class="max-w-[220px]">
      Connect with all your favorite tools effortlessly.
    </p>
  </div>
  <figure class="w-full">
    <img
      src="./images/ns-img-176.png"
      alt="Feature image"
      class="w-full object-cover rounded-2xl"
    />
  </figure>
</div>
```

**Structure:**
- Grid: 4 columns on large screens
- Same padding and styling as large cards
- Constrained paragraph width for narrower layout

##### Feature Card with Hover Effect
```html
<div class="bg-background-1 dark:bg-background-6 rounded-[20px]
            overflow-hidden scale-100 hover:scale-[102%]
            transition-transform duration-500">
  <!-- Card content -->
</div>
```

**Hover Effect:**
- Scale: 100% → 102%
- Duration: 500ms
- Smooth transform transition

#### Service Cards

```html
<div class="col-span-12 md:col-span-6 lg:col-span-7
            p-8 rounded-[20px] bg-white dark:bg-background-6
            space-y-6 sm:min-h-[288px]">
  <!-- Icon -->
  <div class="w-full">
    <span class="ns-shape-8 text-[52px] text-secondary dark:text-accent"></span>
  </div>

  <!-- Content -->
  <div class="space-y-2">
    <h5>Real-time data analytics</h5>
    <p class="max-w-[430px]">
      Track performance metrics and gain actionable insights
      with our comprehensive analytics dashboard.
    </p>
  </div>
</div>
```

**Features:**
- White background (not background-1)
- Custom icon font at 52px
- Min height: 288px on small+ screens
- Responsive grid columns

#### Blog Cards

```html
<article>
  <div class="bg-background-1 dark:bg-background-6 rounded-[20px]
              overflow-hidden md:min-h-[552px]
              scale-100 hover:scale-[102%]
              transition-transform duration-500">
    <!-- Featured image -->
    <figure class="max-w-full xl:max-w-[409px] overflow-hidden">
      <img
        src="./images/blog-thumb.png"
        loading="lazy"
        class="w-full h-full object-cover"
      />
    </figure>

    <!-- Content -->
    <div class="p-6 space-y-6">
      <!-- Meta -->
      <div class="flex items-center gap-2">
        <span class="badge badge-green mr-1">Finance</span>
        <span class="text-tagline-3 text-secondary dark:text-accent">
          Kristin Watson
        </span>
        <span class="w-[5px] h-[6px] bg-primary-100 dark:bg-stroke-7 rounded-full"></span>
        <time class="text-tagline-3 text-secondary dark:text-accent">
          May 20, 2025
        </time>
      </div>

      <!-- Title & Excerpt -->
      <div>
        <h3 class="font-normal sm:text-heading-5 text-heading-6 mb-2">
          <a href="./blog-details.html"
             class="text-secondary dark:text-accent hover:text-primary-500">
            10 Financial Tips for Growing Your Startup
          </a>
        </h3>
        <p class="text-tagline-1 line-clamp-2 text-secondary/60 dark:text-accent/60">
          Learn proven financial strategies to scale your business
          without burning through your capital.
        </p>
      </div>

      <!-- CTA -->
      <a href="./blog-details.html"
         class="btn btn-md btn-white hover:btn-secondary
                dark:btn-white-dark w-full sm:w-auto">
        <span>Read more</span>
      </a>
    </div>
  </div>
</article>
```

**Key Features:**
- Min height: 552px on medium+
- Hover scale: 102%
- Badge, author, date with bullet separators
- Title truncates with `line-clamp-2`
- Button full width on mobile

#### Pricing Cards

##### Standard Pricing Card
```html
<div class="bg-background-3 dark:bg-background-7 p-8 rounded-[20px]
            col-span-12 lg:col-span-4 max-w-[604px] w-full mx-auto">
  <!-- Header -->
  <h3 class="mb-2 font-normal text-heading-5">Simplified</h3>
  <p class="mb-6 max-w-[250px] text-secondary/60 dark:text-accent/60">
    For individuals and small teams looking to get started.
  </p>

  <!-- Price -->
  <div class="price-month mb-7">
    <h4 class="text-heading-4 font-normal text-secondary dark:text-accent">
      $<span class="price-value">1600.00</span>
    </h4>
    <p class="text-secondary dark:text-accent">Per Month</p>
  </div>

  <!-- CTA -->
  <a href="#"
     class="btn btn-md btn-white hover:btn-primary
            dark:btn-white-dark w-full block text-center mb-8
            before:content-none first-letter:uppercase">
    Get started
  </a>

  <!-- Features -->
  <ul class="relative list-none space-y-2.5">
    <li class="flex items-center shrink-0 gap-2.5">
      <svg width="20" height="20" class="shrink-0">
        <!-- Checkmark SVG -->
      </svg>
      <span class="text-secondary dark:text-accent font-normal text-tagline-1">
        Single Payment
      </span>
    </li>
    <li class="flex items-center shrink-0 gap-2.5">
      <svg width="20" height="20" class="shrink-0">
        <!-- Checkmark SVG -->
      </svg>
      <span class="text-secondary dark:text-accent font-normal text-tagline-1">
        Unlimited Projects
      </span>
    </li>
    <li class="flex items-center shrink-0 gap-2.5">
      <svg width="20" height="20" class="shrink-0">
        <!-- Checkmark SVG -->
      </svg>
      <span class="text-secondary dark:text-accent font-normal text-tagline-1">
        Priority Support
      </span>
    </li>
  </ul>
</div>
```

##### Featured Pricing Card
```html
<div class="p-2 rounded-[20px] bg-primary-100 dark:bg-background-9
            col-span-12 lg:col-span-4 max-w-[604px] w-full mx-auto">
  <div class="bg-primary-500 p-8 rounded-[12px]">
    <h3 class="mb-2.5 font-normal text-heading-5 text-white">Basic</h3>
    <p class="mb-6 max-w-[250px] text-white/80">
      Perfect for growing teams and businesses.
    </p>

    <!-- Price -->
    <div class="price-month mb-7">
      <h4 class="text-heading-4 font-normal text-white">
        $<span class="price-value">3200.00</span>
      </h4>
      <p class="text-white/90">Per Month</p>
    </div>

    <!-- CTA -->
    <a href="#"
       class="btn btn-md btn-white w-full block text-center mb-8
              before:content-none first-letter:uppercase">
      Get started
    </a>

    <!-- Features -->
    <ul class="relative list-none space-y-2.5">
      <li class="flex items-center shrink-0 gap-2.5">
        <svg width="20" height="20" class="shrink-0 fill-white">
          <!-- Checkmark -->
        </svg>
        <span class="text-white font-normal text-tagline-1">
          Everything in Simplified
        </span>
      </li>
      <!-- More features -->
    </ul>
  </div>
</div>
```

**Featured Card Structure:**
- Outer wrapper: 8px padding with colored background
- Inner card: Primary-500 background
- All text: White
- Border radius: 12px (inner), 20px (outer)

#### Testimonial Cards

```html
<div class="max-w-[740px] mx-auto px-4 sm:px-8 md:px-11
            py-6 sm:py-10 md:py-14 rounded-[20px]
            bg-white dark:bg-background-6">
  <!-- Quote -->
  <blockquote class="mb-8 sm:mb-12 md:mb-16 text-center">
    <h3 class="text-lg md:text-heading-5 text-secondary dark:text-accent">
      "NextSaaS transformed how we manage our workflows.
      The automation features saved us countless hours every week."
    </h3>
  </blockquote>

  <!-- Avatar Group -->
  <div class="flex items-center justify-center -space-x-2">
    <figure class="size-7 sm:size-8 md:size-9 overflow-hidden
                   rounded-full bg-white ring-2 ring-stroke-1
                   z-10 cursor-pointer">
      <img src="./images/avatar-1.png" class="size-full object-cover" />
    </figure>
    <figure class="size-9 sm:size-11 md:size-13 overflow-hidden
                   rounded-full bg-white ring-2 ring-stroke-1
                   z-20 cursor-pointer">
      <img src="./images/avatar-2.png" class="size-full object-cover" />
    </figure>
    <figure class="size-7 sm:size-8 md:size-9 overflow-hidden
                   rounded-full bg-white ring-2 ring-stroke-1
                   z-10 cursor-pointer">
      <img src="./images/avatar-3.png" class="size-full object-cover" />
    </figure>
  </div>

  <!-- Author Info -->
  <div class="text-center mt-4">
    <p class="text-tagline-1 font-medium text-secondary dark:text-accent">
      Sarah Johnson
    </p>
    <p class="text-tagline-2 text-secondary/60 dark:text-accent/60">
      CEO, TechStart Inc.
    </p>
  </div>
</div>
```

**Avatar Group:**
- Negative margin: `-space-x-2` for overlap
- Z-index layering: Center avatar has higher z-index
- Ring: 2px white ring around each
- Responsive sizes: 28px → 32px → 36px (outer avatars), 36px → 44px → 52px (center)

#### Contact Info Card

```html
<div class="bg-secondary dark:bg-background-6 rounded-[20px]
            p-11 space-y-6 w-full md:max-w-[371px] text-center
            relative overflow-hidden">
  <!-- Gradient overlay -->
  <figure class="absolute select-none pointer-events-none
                 size-[350px] overflow-hidden top-[-187px]
                 left-[174px] -rotate-[78deg] -z-1">
    <img src="./images/gradient-overlay.png" alt="" />
  </figure>

  <!-- Icon -->
  <figure class="size-10 overflow-hidden mx-auto relative z-10">
    <img src="./images/icons/home.svg" alt="Address"
         class="w-full h-full object-contain invert" />
  </figure>

  <!-- Content -->
  <div class="space-y-2.5 relative z-10">
    <p class="text-heading-6 text-accent font-normal">Our Address</p>
    <p class="text-tagline-1 text-accent/60">
      2464 Royal Ln. Mesa, New Jersey 45463
    </p>
  </div>
</div>
```

**Features:**
- Dark background (secondary or background-6)
- Gradient overlay positioned absolutely
- 44px padding
- Max width: 371px
- Light text (accent)

---

### 5.5 Navigation Components

#### Header (Navigation Bar)

The header is a fixed, centered navigation bar with rounded corners:

```html
<header>
  <div class="header-one opacity-0 rounded-full
              lp:!max-w-[1290px] xl:max-w-[1140px]
              lg:max-w-[960px] md:max-w-[720px]
              sm:max-w-[540px] mx-auto w-full
              fixed left-1/2 -translate-x-1/2 z-50
              flex items-center justify-between
              px-2.5 xl:py-0 py-2.5
              bg-background-1 dark:bg-background-6
              border border-stroke-2 dark:border-stroke-7">

    <!-- Logo -->
    <div class="lg:flex-1">
      <a href="./index.html">
        <figure class="lg:max-w-[198px] lg:block hidden">
          <img src="./images/shared/main-logo.svg"
               alt="NextSaaS"
               class="dark:invert" />
        </figure>
        <figure class="lg:hidden block size-12">
          <img src="./images/shared/logo-icon.svg"
               alt="NextSaaS"
               class="dark:invert" />
        </figure>
      </a>
    </div>

    <!-- Desktop Navigation -->
    <nav class="hidden xl:flex items-center lg:flex-1 justify-center">
      <ul class="flex items-center gap-1">
        <li class="relative nav-item cursor-pointer">
          <a href="#"
             class="nav-item-link flex items-center gap-1 px-4 py-2
                    border border-transparent rounded-full
                    text-tagline-1 font-normal
                    text-secondary/60 hover:text-secondary
                    dark:text-accent/60 dark:hover:text-accent
                    hover:border-stroke-2 dark:hover:border-stroke-7
                    transition-all duration-200">
            <span>Home</span>
            <span class="nav-arrow block origin-center
                         transition-all duration-300 translate-y-px">
              <!-- Dropdown arrow SVG -->
            </span>
          </a>
          <!-- Mega menu (if applicable) -->
        </li>
        <li class="relative nav-item cursor-pointer">
          <a href="./about.html" class="nav-item-link">
            <span>About</span>
          </a>
        </li>
        <li class="relative nav-item cursor-pointer">
          <a href="./pricing.html" class="nav-item-link">
            <span>Pricing</span>
          </a>
        </li>
      </ul>
    </nav>

    <!-- CTA Button -->
    <div class="hidden xl:flex items-center justify-end lg:flex-1 gap-3">
      <!-- Theme toggle -->
      <button class="theme-toggle size-12 rounded-full
                     bg-background-4 dark:bg-background-7
                     flex items-center justify-center">
        <!-- Sun/moon icon -->
      </button>

      <!-- CTA -->
      <a href="#" class="btn btn-primary btn-md">
        <span>Get started</span>
      </a>
    </div>

    <!-- Mobile Menu Hamburger -->
    <div class="xl:hidden flex items-center gap-3">
      <!-- Theme toggle -->
      <button class="theme-toggle size-12 rounded-full
                     bg-background-4 dark:bg-background-7
                     flex items-center justify-center">
        <!-- Icon -->
      </button>

      <!-- Hamburger -->
      <button class="nav-hamburger flex flex-col gap-[5px]
                     size-12 bg-background-4 dark:bg-background-6
                     rounded-full items-center justify-center
                     cursor-pointer">
        <span class="block w-6 h-0.5 bg-stroke-9 dark:bg-stroke-1
                     transition-all duration-300"></span>
        <span class="block w-6 h-0.5 bg-stroke-9 dark:bg-stroke-1
                     transition-all duration-300"></span>
        <span class="block w-6 h-0.5 bg-stroke-9 dark:bg-stroke-1
                     transition-all duration-300"></span>
      </button>
    </div>
  </div>
</header>
```

**Header Features:**
- Fixed position, centered horizontally
- Rounded full pill shape
- Responsive max-widths
- Z-index: 50
- Background: background-1 (light) or background-6 (dark)
- Border: stroke-2 (light) or stroke-7 (dark)
- Initial opacity: 0 (animated in via JS)

**Navigation Item States:**
- Default: 60% opacity
- Hover: 100% opacity, border appears
- Active: Full opacity, different styling (handled via JS)

#### Footer

```html
<footer class="bg-secondary dark:bg-background-8 relative overflow-hidden">
  <!-- Gradient background -->
  <figure class="absolute -z-10 size-[1635px] -top-[1320px]
                 left-1/2 -translate-x-1/2">
    <img src="./images/gradient-bg.png" alt="" />
  </figure>

  <div class="main-container px-5">
    <!-- Footer Grid -->
    <div class="grid grid-cols-12 xl:pt-[90px] gap-x-0
                gap-y-16 pt-16 pb-12 justify-between">

      <!-- Logo & Social -->
      <div class="col-span-12 xl:col-span-4">
        <div class="max-w-[306px]">
          <figure class="mb-4">
            <img src="./images/shared/dark-logo.svg"
                 alt="NextSaaS"
                 class="max-w-[198px]" />
          </figure>
          <p class="text-accent/60 font-normal text-tagline-1 mt-4 mb-7">
            NextSaaS helps businesses automate workflows and scale
            efficiently with AI-powered solutions.
          </p>

          <!-- Social Links -->
          <div class="flex items-center gap-3">
            <a href="#"
               class="footer-social-link duration-300
                      transition-transform hover:-translate-y-1">
              <img class="size-6" src="./images/icons/facebook.svg" alt="Facebook" />
            </a>
            <div class="h-6 w-px bg-stroke-1/20"></div>
            <a href="#" class="footer-social-link">
              <img class="size-6" src="./images/icons/twitter.svg" alt="Twitter" />
            </a>
            <div class="h-6 w-px bg-stroke-1/20"></div>
            <a href="#" class="footer-social-link">
              <img class="size-6" src="./images/icons/linkedin.svg" alt="LinkedIn" />
            </a>
            <div class="h-6 w-px bg-stroke-1/20"></div>
            <a href="#" class="footer-social-link">
              <img class="size-6" src="./images/icons/instagram.svg" alt="Instagram" />
            </a>
          </div>
        </div>
      </div>

      <!-- Footer Columns -->
      <div class="col-span-12 xl:col-span-8 grid grid-cols-12
                  gap-x-0 gap-y-8">
        <div class="col-span-12 md:col-span-4">
          <p class="sm:text-heading-6 text-tagline-1 font-normal
                    text-primary-50 mb-5">
            Company
          </p>
          <ul class="sm:space-y-5 space-y-3">
            <li>
              <a href="./about.html" class="footer-link">About Us</a>
            </li>
            <li>
              <a href="./careers.html" class="footer-link">Careers</a>
            </li>
            <li>
              <a href="./press.html" class="footer-link">Press</a>
            </li>
            <li>
              <a href="./contact.html" class="footer-link">Contact</a>
            </li>
          </ul>
        </div>

        <div class="col-span-12 md:col-span-4">
          <p class="sm:text-heading-6 text-tagline-1 font-normal
                    text-primary-50 mb-5">
            Product
          </p>
          <ul class="sm:space-y-5 space-y-3">
            <li>
              <a href="./features.html" class="footer-link">Features</a>
            </li>
            <li>
              <a href="./pricing.html" class="footer-link">Pricing</a>
            </li>
            <li>
              <a href="./integrations.html" class="footer-link">Integrations</a>
            </li>
            <li>
              <a href="./changelog.html" class="footer-link">Changelog</a>
            </li>
          </ul>
        </div>

        <div class="col-span-12 md:col-span-4">
          <p class="sm:text-heading-6 text-tagline-1 font-normal
                    text-primary-50 mb-5">
            Resources
          </p>
          <ul class="sm:space-y-5 space-y-3">
            <li>
              <a href="./blog.html" class="footer-link">Blog</a>
            </li>
            <li>
              <a href="./docs.html" class="footer-link">Documentation</a>
            </li>
            <li>
              <a href="./support.html" class="footer-link">Support</a>
            </li>
            <li>
              <a href="./community.html" class="footer-link">Community</a>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Copyright -->
    <div class="pt-[26px] pb-[100px] text-center relative">
      <div class="footer-divider absolute top-0 left-0 right-0
                  w-0 origin-center mx-auto h-px
                  bg-accent/10 dark:bg-stroke-4/10">
      </div>
      <p class="text-tagline-1 font-normal text-primary-50">
        Copyright © 2025 NextSaaS. All rights reserved.
      </p>
    </div>
  </div>
</footer>
```

**Footer Link Styling:**
```css
.footer-link {
  @apply text-tagline-1 text-primary-50 font-normal
         relative inline-block overflow-hidden
         before:absolute before:bottom-0 before:left-0
         before:h-px before:w-full before:origin-right
         before:scale-x-0 before:transition-transform
         before:duration-500 before:content-['']
         hover:before:origin-left hover:before:scale-x-100
         dark:before:bg-white before:bg-white;
}
```

**Underline Animation:**
- Hidden underline (scale-x-0)
- On hover: Underline slides in from left
- Duration: 500ms
- Origin changes from right to left on hover

**Social Link Hover:**
```css
.footer-social-link {
  @apply duration-300 transition-transform hover:-translate-y-1;
}
```
- Translates upward 4px on hover
- 300ms transition

---

### 5.6 Lists

#### Checkmark List Items

##### Standard Checkmark List
```html
<ul class="list-none space-y-2">
  <li class="flex items-center gap-3">
    <svg width="18" height="18" viewBox="0 0 18 18"
         fill="none" xmlns="http://www.w3.org/2000/svg"
         class="shrink-0">
      <rect width="18" height="18" rx="9"
            class="fill-secondary dark:fill-accent/20" />
      <path d="M8.31661 12.7561L13.7491 7.42144C14.0836 7.0959 14.0836 6.5697 13.7491 6.24416C13.4145 5.91861 12.8736 5.91861 12.539 6.24416L7.7116 10.9901L5.46096 8.78807C5.12636 8.46253 4.58554 8.46253 4.25095 8.78807C3.91635 9.11362 3.91635 9.63982 4.25095 9.96536L7.1066 12.7561C7.27347 12.9184 7.49253 13 7.7116 13C7.93067 13 8.14974 12.9184 8.31661 12.7561Z"
            fill="white" />
    </svg>
    <p class="text-secondary dark:text-accent">
      8 years in creative direction, design & code
    </p>
  </li>
  <li class="flex items-center gap-3">
    <svg width="18" height="18" class="shrink-0">
      <!-- Same SVG -->
    </svg>
    <p class="text-secondary dark:text-accent">
      Collaborated with over 50 brands in tech, fashion, and media
    </p>
  </li>
</ul>
```

**Features:**
- Icon size: 18px × 18px
- Icon background: secondary (light) or accent/20 (dark)
- Checkmark: White
- Spacing: 8px vertical between items
- Gap: 12px between icon and text

##### Hero Checkmark List (Larger)
```html
<ul class="list-none mb-14 flex flex-col md:flex-row md:items-center
            md:justify-center md:flex-wrap lg:flex-nowrap gap-4 md:gap-9
            w-fit md:mx-auto">
  <li class="flex items-center gap-2.5">
    <svg width="19" height="19" viewBox="0 0 19 19"
         fill="none" xmlns="http://www.w3.org/2000/svg"
         class="shrink-0">
      <rect x="0.664062" y="0.5" width="18" height="18" rx="9"
            class="fill-secondary dark:fill-accent/20" />
      <path d="M8.98067 13.2561L14.4131 7.92144C14.7477 7.5959 14.7477 7.0697 14.4131 6.74416C14.0785 6.41861 13.5377 6.41861 13.2031 6.74416L8.37567 11.4901L6.12502 9.28807C5.79043 8.96253 5.2496 8.96253 4.91501 9.28807C4.58041 9.61362 4.58041 10.1398 4.91501 10.4654L7.77066 13.2561C7.93753 13.4184 8.1566 13.5 8.37567 13.5C8.59473 13.5 8.8138 13.4184 8.98067 13.2561Z"
            class="fill-white" />
    </svg>
    <span class="text-tagline-2 dark:text-accent/60">
      Boost your business with AI.
    </span>
  </li>
  <li class="flex items-center gap-2.5">
    <svg width="19" height="19" class="shrink-0">
      <!-- Same SVG -->
    </svg>
    <span class="text-tagline-2 dark:text-accent/60">
      Trusted by leading industries worldwide.
    </span>
  </li>
</ul>
```

**Hero List Features:**
- Icon: 19px × 19px
- Text: tagline-2 (14px), 60% opacity in dark mode
- Responsive: Vertical on mobile, horizontal on desktop
- Gap: 16px (mobile), 36px (desktop)

#### Feature List with Disabled Items

```html
<ul class="relative list-none space-y-2.5">
  <!-- Enabled item -->
  <li class="flex items-center shrink-0 gap-2.5">
    <svg width="20" height="20" viewBox="0 0 20 20"
         fill="none" xmlns="http://www.w3.org/2000/svg"
         class="shrink-0">
      <rect width="20" height="20" rx="10"
            class="fill-secondary dark:fill-accent/20" />
      <path d="..." class="fill-white" />
    </svg>
    <span class="text-secondary dark:text-accent font-normal text-tagline-1">
      Single Payment
    </span>
  </li>

  <!-- Disabled item -->
  <li class="flex items-center shrink-0 gap-2.5">
    <svg width="20" height="20" class="shrink-0">
      <rect class="fill-white dark:fill-accent/10" />
      <path class="fill-secondary/60 dark:fill-accent/60" />
    </svg>
    <span class="text-secondary/60 dark:text-accent/60 font-normal text-tagline-1">
      Advanced Analytics
    </span>
  </li>
</ul>
```

**Disabled State:**
- Icon background: white (light) or accent/10 (dark)
- Icon checkmark: 60% opacity
- Text: 60% opacity

---

### 5.7 Modals/Dialogs

```html
<!-- Modal Overlay -->
<div class="fixed inset-0 bg-black/80 z-[999]
            modal-overlay modal-close hidden">

  <!-- Modal Content -->
  <div class="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
              sm:max-w-[470px] max-w-[350px] w-full
              bg-background-12 dark:bg-background-6
              p-2 rounded-2xl sm:space-y-6 space-y-3
              modal-content">

    <!-- Modal Header -->
    <div class="sm:p-10.5 p-4 text-center sm:space-y-5 space-y-2.5">
      <figure class="size-13 shrink-0 mx-auto">
        <img src="./images/shared/logo.svg" alt="NextSaaS" />
      </figure>
      <div class="sm:space-y-5 space-y-2.5 text-center">
        <h4 class="text-secondary dark:text-accent">
          Join the NextSaaS
        </h4>
        <p class="text-secondary/60 dark:text-accent/60">
          Your lifestyle is unique, and so are your needs.
          Start building your perfect workflow today.
        </p>
      </div>
    </div>

    <!-- Modal Form -->
    <form class="sm:p-6 p-5 bg-white dark:bg-background-7 rounded-xl">
      <div class="sm:space-y-4 space-y-2.5">
        <!-- Form Field -->
        <fieldset class="space-y-1.5">
          <label class="block text-tagline-1 font-medium
                        text-secondary dark:text-accent select-none">
            First name
          </label>
          <input
            type="text"
            class="auth-form-input sm:!h-13 !h-11 py-3.5 px-4"
            placeholder="Enter your name"
          />
        </fieldset>

        <fieldset class="space-y-1.5">
          <label class="block text-tagline-1 font-medium
                        text-secondary dark:text-accent select-none">
            Email
          </label>
          <input
            type="email"
            class="auth-form-input sm:!h-13 !h-11 py-3.5 px-4"
            placeholder="Enter your email"
          />
        </fieldset>
      </div>

      <!-- Submit Button -->
      <button type="submit"
              class="group list-none w-full block mt-6">
        <div class="flex items-center justify-center rounded-full
                    cursor-pointer gap-1.5 bg-primary-500
                    group-hover:scale-101 text-center transition-all
                    duration-500 ease-in-out font-medium text-nowrap
                    lowercase shadow-1 group-hover:bg-secondary
                    text-accent px-6 py-2.5 text-tagline-1
                    md:px-8 md:py-3.5 w-full">
          <span class="first-letter:uppercase">Discover</span>
          <!-- Animated icon -->
        </div>
      </button>
    </form>
  </div>

  <!-- Close Button -->
  <button class="absolute top-4 right-4 sm:size-6 size-5
                 cursor-pointer flex items-center justify-center
                 close-join-modal modal-close-btn
                 text-white hover:text-primary-300
                 transition-colors duration-300">
    <svg xmlns="http://www.w3.org/2000/svg"
         viewBox="0 0 24 24"
         fill="none"
         stroke="currentColor"
         stroke-width="2"
         stroke-linecap="round"
         stroke-linejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  </button>
</div>
```

**Modal Features:**
- Overlay: Black 80% opacity, full screen
- Z-index: 999
- Content: Fixed center, max-width 470px
- Background: background-12 (light) or background-6 (dark)
- Border radius: 16px (rounded-2xl)
- Close button: Top-right, white with hover color change
- Form inside: Nested rounded container (rounded-xl)
- Hidden by default: `.modal-close` class adds `display: none`

**Modal Control Classes:**
```css
.modal-open {
  @apply grid;  /* Shows modal */
}

.modal-close {
  @apply hidden;  /* Hides modal */
}
```

---

### 5.8 CTA Sections

```html
<section class="py-[50px] md:py-20 lg:py-28
                bg-background-2 dark:bg-background-5">
  <div class="main-container">
    <div class="flex items-center flex-col lg:flex-row justify-between
                gap-10 lg:gap-0">
      <!-- Heading Section -->
      <div class="xl:max-w-[650px] lg:max-w-[476px] w-full
                  space-y-5 text-center lg:text-left">
        <span class="badge badge-green">Get started</span>
        <h2 class="text-secondary dark:text-accent
                   text-heading-5 sm:text-heading-4 lg:text-heading-2">
          Build a complete website with
          <span class="text-primary-500">AI assistance</span>
        </h2>
        <p class="text-secondary/60 dark:text-accent/60">
          Experience the power of intelligent automation.
          Start your free trial today—no credit card required.
        </p>
      </div>

      <!-- Email Form Section -->
      <div class="lg:basis-[466px] space-y-6 w-full">
        <!-- Form -->
        <form class="flex items-center flex-col gap-5 sm:flex-row
                     justify-start lg:gap-3">
          <input
            type="email"
            class="px-[18px] shadow-1 h-12 py-3
                   placeholder:text-secondary/50 rounded-full
                   border border-stroke-1 lg:max-w-[340px]
                   md:w-[71%] w-full
                   dark:border-stroke-7 dark:placeholder:text-accent/60
                   focus:outline-none focus:border-primary-600
                   dark:focus:border-primary-400
                   placeholder:font-normal font-normal text-secondary
                   dark:text-accent dark:bg-background-6"
            placeholder="Enter your email"
          />
          <button
            type="submit"
            class="btn btn-md btn-primary h-12 w-full sm:w-[28%]
                   lg:w-auto shrink-0">
            <span>Get started</span>
          </button>
        </form>

        <!-- Feature Checkmarks -->
        <ul class="flex flex-col sm:flex-row items-start
                   sm:items-center gap-x-4 gap-y-2">
          <li class="flex items-center gap-2">
            <span class="size-[18px] bg-secondary dark:bg-accent
                         rounded-full flex items-center justify-center">
              <svg width="10" height="8" viewBox="0 0 10 8"
                   fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 1L3.5 6.5L1 4"
                      stroke="white" stroke-width="2"
                      stroke-linecap="round" stroke-linejoin="round"
                      class="stroke-accent dark:stroke-secondary"/>
              </svg>
            </span>
            <p class="text-tagline-3 sm:text-tagline-2
                      text-secondary dark:text-accent">
              No credit card required
            </p>
          </li>
          <li class="flex items-center gap-2">
            <span class="size-[18px] bg-secondary dark:bg-accent
                         rounded-full flex items-center justify-center">
              <svg width="10" height="8" viewBox="0 0 10 8">
                <path d="M9 1L3.5 6.5L1 4"
                      stroke="white" stroke-width="2"
                      stroke-linecap="round" stroke-linejoin="round"
                      class="stroke-accent dark:stroke-secondary"/>
              </svg>
            </span>
            <p class="text-tagline-3 sm:text-tagline-2
                      text-secondary dark:text-accent">
              Free 14-day trial
            </p>
          </li>
          <li class="flex items-center gap-2">
            <span class="size-[18px] bg-secondary dark:bg-accent
                         rounded-full flex items-center justify-center">
              <svg width="10" height="8" viewBox="0 0 10 8">
                <path d="M9 1L3.5 6.5L1 4"
                      stroke="white" stroke-width="2"
                      stroke-linecap="round" stroke-linejoin="round"
                      class="stroke-accent dark:stroke-secondary"/>
              </svg>
            </span>
            <p class="text-tagline-3 sm:text-tagline-2
                      text-secondary dark:text-accent">
              Cancel anytime
            </p>
          </li>
        </ul>
      </div>
    </div>
  </div>
</section>
```

**CTA Section Structure:**
- Two-column layout: Heading (left) + Form (right)
- Responsive: Stacks vertically on mobile
- Form: Email input + button (inline on desktop)
- Checkmarks: Small circular icons (18px)
- Feature bullets below form

---

## 6. Animations & Transitions

### Animation Types

#### Scroll-Triggered Animations

The design system uses a custom `data-ns-animate` attribute system for scroll-triggered reveals:

**Basic Fade In:**
```html
<div data-ns-animate data-delay="0.2" data-offset="100">
  Content fades in when scrolled into view
</div>
```

**Directional Slide Animations:**
```html
<!-- Slide from bottom -->
<div data-ns-animate data-direction="up" data-delay="0.3">
  Slides up from below
</div>

<!-- Slide from right -->
<div data-ns-animate data-direction="right" data-delay="0.4">
  Slides in from right
</div>

<!-- Slide from left -->
<div data-ns-animate data-direction="left" data-delay="0.5">
  Slides in from left
</div>

<!-- Slide from top -->
<div data-ns-animate data-direction="down" data-delay="0.6">
  Slides down from above
</div>
```

**Spring Animations:**
```html
<figure
  data-ns-animate
  data-spring
  data-delay="0.9"
  data-duration="1.9">
  Element animates with spring physics
</figure>
```

**Instant Animations (No Delay):**
```html
<div data-ns-animate data-instant="true">
  Animates immediately without delay
</div>
```

**Animation Data Attributes:**

| Attribute | Values | Purpose |
|-----------|--------|---------|
| `data-ns-animate` | (none) | Enables scroll animation |
| `data-delay` | `0.1` to `0.9` | Stagger delay in seconds |
| `data-duration` | `0.9` to `3.9` | Animation duration in seconds |
| `data-direction` | `up`, `down`, `left`, `right` | Slide direction |
| `data-offset` | `50`, `100`, `140` | Scroll offset trigger (px) |
| `data-spring` | (none) | Use spring physics |
| `data-instant` | `true` | Immediate animation |

**Staggered Animation Pattern (Hero Section):**
```html
<span data-ns-animate data-delay="0.05" class="badge">Badge</span>
<h1 data-ns-animate data-delay="0.1">Hero Title</h1>
<p data-ns-animate data-delay="0.2">Hero description</p>
<ul>
  <li data-ns-animate data-delay="0.3">Feature 1</li>
  <li data-ns-animate data-delay="0.4">Feature 2</li>
  <li data-ns-animate data-delay="0.5">Feature 3</li>
</ul>
<button data-ns-animate data-delay="0.6">CTA Button</button>
```

**Sequential reveals create a waterfall effect with 100ms increments.**

#### CSS Keyframe Animations

##### Hero Text Gradient Animation
```css
@keyframes textAnimate {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.hero-text-gradient {
  animation: textAnimate 5s linear infinite;
  background-size: 200%;
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
```

**Usage:**
```html
<h1 class="hero-text-gradient hero-text-color-1">
  Animated gradient text
</h1>
```

##### Top-to-Bottom Line Animation
```css
@keyframes top-to-bottom {
  0% { top: -30%; }
  50% { top: 50%; }
  100% { top: 100%; }
}

.gradient-line-1 {
  animation: top-to-bottom 6s 0s linear infinite;
}
.gradient-line-2 {
  animation: top-to-bottom 6s 900ms linear infinite;
}
.gradient-line-3 {
  animation: top-to-bottom 6s 1800ms linear infinite;
}
```

**Usage:** Decorative gradient lines that move vertically down the screen.

##### Swiper Slide Animations
```css
@keyframes slideUp {
  from { transform: translateY(15px); }
  to { transform: translateY(0); }
}

@keyframes fadeInUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

@keyframes gradientFadeIn {
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
}
```

##### Flip Card Animation
```css
.flipper {
  @apply relative w-full h-full
         [transform-style:preserve-3d]
         transition-transform duration-[900ms];
}

.group:hover .flipper {
  @apply rotate-y-180;
}
```

**Usage:**
```html
<div class="group cursor-pointer">
  <div class="flipper">
    <div class="flipper-front">Front content</div>
    <div class="flipper-back rotate-y-180">Back content</div>
  </div>
</div>
```

### Duration Patterns

| Class | Duration | Usage |
|-------|----------|-------|
| `duration-100` | 100ms | Instant feedback |
| `duration-200` | 200ms | Quick interactions |
| `duration-300` | 300ms | **Standard transitions** |
| `duration-500` | 500ms | **Button hovers**, smooth changes |
| `duration-[900ms]` | 900ms | Flip cards, complex animations |
| `animation: 5s` | 5000ms | Gradient text animation |
| `animation: 6s` | 6000ms | Decorative line animations |

**Most Common:**
- 300ms for quick UI feedback
- 500ms for button and card interactions

### Easing Functions

| Easing | Usage |
|--------|-------|
| `ease-in-out` | **Default** - smooth start and end |
| `linear` | Gradient animations, constant speed |
| `cubic-bezier(10.34, 10.56, 0.64, 40)` | Custom team ease (extreme spring) |

**Standard Transitions:**
```html
<div class="transition-all duration-500 ease-in-out">
```

### Hover Interactions

#### Button Hover
```html
<a class="btn btn-primary hover:scale-102 transition-all duration-500">
  <span>Button</span>
</a>
```
- Scale: 100% → 102%
- Arrow icon appears and slides right
- Text slides slightly left
- 500ms transition

#### Button Color Change on Hover
```html
<a class="btn btn-primary hover:btn-white dark:hover:btn-accent">
  <span>Button</span>
</a>
```
- Color classes swap on hover
- Smooth 500ms transition

#### Card Hover
```html
<div class="scale-100 hover:scale-[102%] transition-transform duration-500">
  Card content
</div>
```
- Scale: 100% → 102%
- 500ms transform transition
- Cursor changes to pointer (implied)

#### Link Underline Animation (Footer)
```html
<a href="#" class="footer-link">Link Text</a>
```

```css
.footer-link {
  @apply relative before:absolute before:bottom-0 before:left-0
         before:h-px before:w-full before:origin-right
         before:scale-x-0 before:transition-transform
         before:duration-500 before:content-['']
         hover:before:origin-left hover:before:scale-x-100
         before:bg-white;
}
```

**Animation:**
- Underline hidden (scale-x-0, origin-right)
- On hover: Slides in from left (origin-left, scale-x-100)
- 500ms transition

#### Social Icon Hover
```html
<a href="#" class="duration-300 transition-transform hover:-translate-y-1">
  <img src="icon.svg" />
</a>
```
- Translates up 4px
- 300ms transition

#### Navigation Item Hover
```html
<a class="text-secondary/60 hover:text-secondary
          border border-transparent hover:border-stroke-2
          transition-all duration-200">
```
- Opacity: 60% → 100%
- Border appears
- 200ms transition (fast for responsiveness)

### Counter Animations

Number counter animations use data attributes:

```html
<span
  data-counter
  data-number="45324"
  data-speed="2000"
  data-interval="200"
  data-rooms="5"
  data-height-space="2"
>45,324</span>
```

**Attributes:**
- `data-number`: Target number
- `data-speed`: Total animation duration (ms)
- `data-interval`: Update interval (ms)
- `data-rooms`: Number of digits
- `data-height-space`: Letter spacing

### Progress Bar Animations

```html
<div data-progress-item data-progress-value="48">
  <div class="w-[80%] h-2 bg-secondary dark:bg-accent rounded-full">
    <div class="w-0 h-full bg-ns-green" data-progress-bar></div>
    <p data-progress-text>48%</p>
  </div>
</div>
```

**Animation:** Bar animates from 0% width to 48% width.

### Parallax Effects

```html
<figure
  class="parallax-effect"
  data-parallax-value="0.8"
  data-parallax-y="0.8"
  data-parallax-x="0.8"
>
  <img src="floating-element.png" />
</figure>
```

**Effect:** Element moves relative to scroll position, creating depth.

### Motion Philosophy

The animation system follows these principles:

1. **Subtle and Professional**: Animations enhance, don't distract
2. **Functional, Not Decorative**: Most animations provide feedback or guide attention
3. **Staggered Reveals**: Sequential elements animate in order for natural reading flow
4. **Scroll-Triggered**: Major content animates on scroll to create engagement
5. **Smooth Transitions**: 300-500ms durations feel responsive yet smooth
6. **Scale Over Movement**: Prefer scale effects (hover:scale-102) over large translations
7. **Consistent Timing**: Reuse duration values for predictable feel

### Where Animations Are Avoided

- **Long-form content**: Blog posts, documentation pages
- **Data tables**: Focus on readability
- **Form validation**: Instant feedback without delay
- **Critical content**: Above-fold content that should be immediately visible

---

## 7. Border Radius

### Radius Scale

| Class | Value | Pixels | Usage |
|-------|-------|--------|-------|
| `rounded-none` | 0 | 0px | Sharp corners (rare) |
| `rounded` | 0.25rem | 4px | Small elements |
| `rounded-md` | 0.375rem | 6px | Small elements |
| `rounded-lg` | 0.5rem | 8px | Small cards |
| `rounded-xl` | 0.75rem | 12px | **Textareas, inner sections** |
| `rounded-2xl` | 1rem | 16px | **Images, inner cards, modals** |
| `rounded-[12px]` | 0.75rem | 12px | Inner card sections |
| `rounded-[20px]` | 1.25rem | 20px | **Primary card radius** |
| `rounded-[34px]` | 2.125rem | 34px | Toggle switches |
| `rounded-full` | 9999px | Full | **Buttons, badges, avatars** |

### Usage Patterns

#### Cards
Primary card radius is **20px**:
```html
<div class="bg-white dark:bg-background-6 p-8 rounded-[20px]">
```

Inner elements use smaller radius (16px or 12px):
```html
<div class="bg-background-3 p-6 rounded-xl">  <!-- 12px -->
  <img class="rounded-2xl" />  <!-- 16px -->
</div>
```

#### Buttons
Always use **full rounded**:
```html
<a class="btn btn-primary rounded-full">  <!-- Already in .btn base class -->
```

#### Badges
Always use **full rounded**:
```html
<span class="badge rounded-full">  <!-- Already in .badge base class -->
```

#### Form Inputs
Use **full rounded** for consistency with buttons:
```html
<input class="rounded-full border border-stroke-3">
```

#### Textareas
Use **xl radius** (12px) because full rounding looks odd on tall elements:
```html
<textarea class="rounded-xl border border-stroke-3"></textarea>
```

#### Images
Use **2xl radius** (16px) for softer corners:
```html
<img class="rounded-2xl" />
```

#### Checkboxes & Radio Buttons
Use **full rounded** for circular appearance:
```html
<span class="size-4 rounded-full border"></span>
```

#### Modals
Use **2xl radius** (16px):
```html
<div class="modal-content rounded-2xl"></div>
```

### Consistency Rules

1. **Outer containers**: 20px radius (`rounded-[20px]`)
2. **Inner containers**: 12px radius (`rounded-xl`)
3. **Interactive elements** (buttons, badges, inputs): Full rounded
4. **Images**: 16px radius (`rounded-2xl`)
5. **Pill-shaped elements**: Always full rounded
6. **Sharp corners**: Rarely used, only for specific design intent

### Responsive Radius

Border radius is **not responsive** in this design system—the same radius is used across all breakpoints for consistency.

---

## 8. Opacity & Transparency

### Opacity Values

#### Text Opacity
Text opacity creates visual hierarchy without changing colors:

| Opacity | Class Suffix | Usage |
|---------|--------------|-------|
| 100% | (none) | Primary headings, labels, high-emphasis text |
| 80% | `/80` | Subtle emphasis, secondary headings |
| 60% | `/60` | **Body text, descriptions, captions** |
| 40% | `/40` | Disabled text, very muted content |
| 20% | `/20` | Placeholder-like text (rare) |

**Examples:**
```html
<!-- Primary text -->
<h1 class="text-secondary dark:text-accent">
  Full opacity heading
</h1>

<!-- Body text (most common) -->
<p class="text-secondary/60 dark:text-accent/60">
  This is body text at 60% opacity
</p>

<!-- Disabled text -->
<span class="text-secondary/40 dark:text-accent/40">
  Disabled or very muted
</span>
```

#### Background Opacity
Background opacity creates layering and depth:

| Opacity | Class Suffix | Usage |
|---------|--------------|-------|
| 80% | `/80` | Modal overlays |
| 40% | `/40` | Subtle backgrounds |
| 20% | `/20` | Very subtle backgrounds, hover states |
| 10% | `/10` | **Badge backgrounds, ghost buttons** |

**Examples:**
```html
<!-- Modal backdrop -->
<div class="bg-black/80">

<!-- Badge background -->
<span class="bg-accent/10">

<!-- Hover state -->
<div class="hover:bg-primary-500/20">
```

#### Border Opacity

| Opacity | Class Suffix | Usage |
|---------|--------------|-------|
| 100% | (none) | Standard borders |
| 20% | `/20` | Very subtle dividers |
| 10% | `/10` | Extremely subtle lines |

**Examples:**
```html
<!-- Standard border -->
<div class="border border-stroke-3">

<!-- Subtle divider -->
<div class="border-t border-accent/10">

<!-- Footer divider -->
<div class="h-px bg-accent/10 dark:bg-stroke-4/10">
```

### Overlay Patterns

#### Modal Backdrop
```html
<div class="fixed inset-0 bg-black/80 z-[999]">
  <!-- Full-screen overlay at 80% opacity -->
</div>
```

#### Gradient Overlays (Positioned Absolutely)
Decorative gradient images positioned behind content:
```html
<div class="relative">
  <figure class="absolute -z-10 size-[1635px] -top-[1320px]
                 left-1/2 -translate-x-1/2">
    <img src="./images/gradient-bg.png" alt="" />
  </figure>
  <div class="relative z-10">
    Content here
  </div>
</div>
```

#### Card Hover Overlays
Some cards have overlays that fade in on hover:
```html
<div class="relative group">
  <figure class="gradient-overlay absolute inset-0
                 opacity-0 group-hover:opacity-100
                 transition-opacity duration-300 -z-1">
    <img src="./images/gradient.png" />
  </figure>
  <div class="relative z-10">
    Card content
  </div>
</div>
```

#### Blur Overlays (Backdrop Blur)
Badges use backdrop blur for glassmorphism effect:
```html
<span class="badge backdrop-blur-ns-badge-blur bg-accent/10">
  Badge with blur
</span>
```

**Blur value:** `--blur-ns-badge-blur: 17.228288650512695px`

### Disabled UI Treatment

#### Disabled Text
```html
<span class="text-secondary/60 dark:text-accent/60">
  Disabled or unavailable
</span>
```

#### Disabled Icons
```html
<svg class="fill-secondary/60 dark:fill-accent/60">
  <!-- Icon paths -->
</svg>
```

#### Disabled Backgrounds
```html
<div class="bg-white/40 dark:bg-secondary/40">
  Disabled container
</div>
```

#### Disabled Form Elements
```html
<input
  disabled
  class="bg-background-3 text-secondary/40 cursor-not-allowed"
/>
```

### Background Layering Strategy

#### Z-Index Scale

| Z-Index | Usage |
|---------|-------|
| `-z-10`, `-z-1` | Background decorative elements |
| `z-0` | Default layer |
| `z-10` | Elevated content |
| `z-20` | Dropdowns, tooltips |
| `z-50` | **Fixed header** |
| `z-[999]` | **Modals** |

**Layering Example:**
```html
<section class="relative">
  <!-- Background gradient (behind everything) -->
  <figure class="absolute -z-10 ...">
    <img src="gradient.png" />
  </figure>

  <!-- Main content (default layer) -->
  <div class="relative z-0">
    <h2>Section Title</h2>
    <p>Content here</p>
  </div>

  <!-- Elevated card (above content) -->
  <div class="relative z-10 bg-white shadow-2">
    Card content
  </div>
</section>
```

#### Decorative Background Pattern
Positioned decorative elements always use negative z-index:
```html
<div class="relative">
  <figure class="absolute -z-10 top-0 left-0 size-[500px] rotate-45
                 select-none pointer-events-none">
    <img src="decorative-shape.png" alt="" />
  </figure>
  <div>Content</div>
</div>
```

**Key classes:**
- `select-none` - Prevents text selection
- `pointer-events-none` - Allows clicking through
- `alt=""` - Decorative, not announced by screen readers

### Opacity Best Practices

1. **Text Hierarchy**: Use 100% for headings, 60% for body, 40% for disabled
2. **Background Subtlety**: Use 10-20% for subtle backgrounds
3. **Overlays**: Use 80% for modal backdrops
4. **Consistency**: Same opacity values across similar elements
5. **Dark Mode**: Same opacity values work in both modes (text automatically inverts)

---

## 9. Common Tailwind CSS Usage

### Frequently Used Utilities

#### Flexbox Patterns
```html
<!-- Center content horizontally and vertically -->
<div class="flex items-center justify-center">

<!-- Space between items -->
<div class="flex items-center justify-between">

<!-- Center items with gap -->
<div class="flex items-center gap-4">

<!-- Flex column with spacing -->
<div class="flex flex-col space-y-6">

<!-- Responsive flex direction -->
<div class="flex flex-col lg:flex-row">
```

#### Grid Patterns
```html
<!-- 12-column grid -->
<div class="grid grid-cols-12 gap-8">
  <div class="col-span-12 md:col-span-6 lg:col-span-4">...</div>
</div>

<!-- Responsive grid -->
<div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-7">

<!-- Grid with vertical spacing only on mobile -->
<div class="grid grid-cols-12 space-y-8 md:space-y-0 md:gap-8">
```

#### Spacing Utilities
```html
<!-- Vertical spacing between children -->
<div class="space-y-6">  <!-- 24px vertical gap -->
  <div>Item 1</div>
  <div>Item 2</div>
</div>

<!-- Horizontal spacing -->
<div class="space-x-4">  <!-- 16px horizontal gap -->

<!-- Flex gap (preferred for flex layouts) -->
<div class="flex gap-4">  <!-- 16px gap -->
<div class="flex gap-x-4 gap-y-8">  <!-- Different x/y gaps -->
```

#### Responsive Utilities
```html
<!-- Hide on mobile, show on large -->
<div class="hidden lg:block">

<!-- Show on mobile, hide on desktop -->
<div class="lg:hidden">

<!-- Responsive text alignment -->
<div class="text-center lg:text-left">

<!-- Responsive widths -->
<div class="w-full md:w-auto">
```

#### Text Utilities
```html
<!-- Typography -->
<h2 class="text-heading-5 sm:text-heading-4 lg:text-heading-2">

<!-- Text color with dark mode -->
<p class="text-secondary dark:text-accent">

<!-- Text opacity -->
<p class="text-secondary/60 dark:text-accent/60">

<!-- Text alignment -->
<div class="text-center">

<!-- Truncation -->
<p class="line-clamp-2">  <!-- Truncate after 2 lines -->
<p class="truncate">  <!-- Single line with ellipsis -->
```

#### Background Utilities
```html
<!-- Background colors -->
<div class="bg-background-1 dark:bg-background-6">

<!-- Background with opacity -->
<div class="bg-accent/10">

<!-- Gradient backgrounds (custom) -->
<div class="bg-gradient-1">  <!-- Uses CSS variable -->
```

### Custom Tailwind Config

This project uses **Tailwind CSS v4**, which has a fundamentally different configuration approach than v3. Instead of `tailwind.config.js`, configuration is done via CSS.

#### CSS Variables via `@theme`

All theme configuration is in `src/styles/variables.css`:

```css
@theme {
  /* Font families */
  --font-inter-tight: 'Inter Tight', sans-serif;

  /* Colors */
  --color-primary-500: #864ffe;
  --color-secondary: #1a1a1c;
  /* ... more colors */

  /* Typography */
  --text-heading-1: 4.25rem;
  --text-heading-1--line-height: 110%;
  /* ... more text sizes */

  /* Shadows */
  --shadow-1: 0px 1px 2px 0px rgba(16, 24, 40, 0.05);
  /* ... more shadows */

  /* Custom breakpoint */
  --breakpoint-lp: 1440px;
}
```

**Usage in HTML:**
```html
<div class="text-heading-1 text-primary-500 shadow-1">
```

#### Custom Utilities via `@utility`

Custom utilities are defined in CSS files and behave like Tailwind utilities:

**Main Container:**
```css
@utility main-container {
  @apply max-w-[1290px] mx-auto lp:px-0 px-5;
}
```

**Hero Background Overlays:**
```css
@utility hero-bg-overlay-light {
  @apply bg-linear-[180deg,rgba(255,255,255,0.8)_43.93%,#fff_100%];
}

@utility hero-bg-overlay-dark {
  @apply bg-linear-[180deg,rgba(7,11,16,0.9)_0%,#070B10_100%];
}
```

**Button Utilities** (see Button section for full definitions):
```css
@utility btn {
  @apply relative overflow-hidden border rounded-full ...;
}

@utility btn-primary {
  @apply bg-primary-500 shadow-1 border-primary-600 text-white;
}

@utility btn-md {
  @apply px-5 py-2.5 text-tagline-2 min-w-[90px];
}
```

**Badge Utilities** (see Badge section):
```css
@utility badge {
  @apply inline-block text-nowrap text-tagline-2 ...;
}

@utility badge-green {
  @apply bg-ns-green-light dark:text-ns-yellow dark:bg-accent/10;
}
```

### Reusable Class Combinations

#### Card Structure
```html
<div class="bg-white dark:bg-background-6 p-8 rounded-[20px] space-y-6">
```
- White background (light) or background-6 (dark)
- 32px padding
- 20px border radius
- 24px vertical spacing between children

#### Section Wrapper
```html
<section class="py-16 md:py-20 lg:pt-[90px] xl:pt-[100px] lg:pb-[90px] xl:pb-[100px]">
```
- Responsive vertical padding
- Increases with breakpoint

#### Centered Content
```html
<div class="flex flex-col items-center text-center max-w-[750px] mx-auto">
```
- Flex column
- Centered items
- Centered text
- Constrained width
- Centered container

#### Hover Transform
```html
<div class="hover:scale-[102%] transition-transform duration-500">
```
- Scale to 102% on hover
- 500ms transform transition

#### Responsive Image
```html
<img class="w-full h-full object-cover rounded-2xl" />
```
- Full width/height of container
- Cover fit (maintains aspect ratio, crops if needed)
- 16px border radius

### Component vs Utility Preference

| Element | Approach | Reason |
|---------|----------|--------|
| **Buttons** | Custom utility classes (`.btn-primary`) | Complex pseudo-element animations, many variants |
| **Badges** | Custom utility classes (`.badge-green`) | Many color variants, consistent styling |
| **Forms** | Mix of custom + utilities | Auth forms use custom class, others use utilities |
| **Layout** | Pure Tailwind utilities | Flexible, no need for abstraction |
| **Cards** | Pure Tailwind utilities | Vary widely, utilities provide flexibility |
| **Text** | Mostly utilities with custom heading classes | Responsive patterns benefit from utilities |
| **Spacing** | Pure Tailwind utilities | Standard spacing scale works well |

### Deviations from Tailwind Defaults

#### 1. Tailwind v4 CSS-Based Configuration
- **Traditional:** `tailwind.config.js` with JavaScript object
- **This Project:** `@theme` directive in CSS file
- **Impact:** Theme values defined in CSS, not JS

#### 2. Custom Color Palette
- **Tailwind Default:** Blue, gray, red, etc. with 50-900 scale
- **This Project:** Purple primary (`primary-500`), semantic colors (`secondary`, `accent`), custom backgrounds (`background-1` through `background-12`)
- **Impact:** All color utilities reference custom palette

#### 3. Custom Typography Scale
- **Tailwind Default:** `text-sm`, `text-base`, `text-lg`, `text-xl`, etc.
- **This Project:** `text-heading-1` through `text-heading-6`, `text-tagline-1/2/3`
- **Impact:** Semantic heading names instead of size-based names

#### 4. Custom Breakpoint
- **Tailwind Default:** `sm`, `md`, `lg`, `xl`, `2xl`
- **This Project:** Adds `lp` (Large Plus) at 1440px
- **Usage:** `lp:px-0`, `lp:max-w-[1290px]`

#### 5. Custom Utilities for Buttons/Badges
- **Tailwind Default:** Build with utility classes
- **This Project:** Abstracted into `btn-primary`, `badge-green`, etc.
- **Impact:** Cleaner HTML, easier maintenance

#### 6. Extended Shadow Scale
- **Tailwind Default:** `shadow-sm`, `shadow`, `shadow-md`, etc.
- **This Project:** `shadow-1` through `shadow-15` with custom values
- **Impact:** More shadow options, different naming

#### 7. Custom Animation Data Attributes
- **Tailwind Default:** Pure CSS classes
- **This Project:** `data-ns-animate`, `data-delay`, etc. for scroll animations
- **Impact:** JavaScript-driven animations with declarative HTML attributes

---

## 10. Example Component Reference Design Code

This section provides full, copy-paste ready code examples that demonstrate the design system in practice.

---

### Primary Button (All Variants)

#### Standard Primary Button
```html
<a href="#" class="btn btn-primary btn-xl">
  <span>Get started</span>
</a>
```

#### All Size Variants
```html
<!-- Small -->
<a href="#" class="btn btn-primary btn-sm">
  <span>Small</span>
</a>

<!-- Base -->
<a href="#" class="btn btn-primary btn-base">
  <span>Base</span>
</a>

<!-- Medium -->
<a href="#" class="btn btn-primary btn-md">
  <span>Medium</span>
</a>

<!-- Large -->
<a href="#" class="btn btn-primary btn-lg">
  <span>Large</span>
</a>

<!-- Extra Large -->
<a href="#" class="btn btn-primary btn-xl">
  <span>Extra Large</span>
</a>
```

#### All Color Variants
```html
<!-- Primary -->
<a href="#" class="btn btn-primary btn-md">
  <span>Primary</span>
</a>

<!-- Secondary -->
<a href="#" class="btn btn-secondary btn-md">
  <span>Secondary</span>
</a>

<!-- White -->
<a href="#" class="btn btn-white btn-md">
  <span>White</span>
</a>

<!-- Accent -->
<a href="#" class="btn btn-accent btn-md">
  <span>Accent</span>
</a>

<!-- Green -->
<a href="#" class="btn btn-green btn-md">
  <span>Success</span>
</a>

<!-- Gray -->
<a href="#" class="btn btn-gray btn-md">
  <span>Neutral</span>
</a>

<!-- Transparent -->
<a href="#" class="btn btn-transparent btn-md">
  <span>Ghost</span>
</a>

<!-- Dark -->
<a href="#" class="btn btn-dark btn-md">
  <span>Dark</span>
</a>

<!-- Black -->
<a href="#" class="btn btn-black btn-md">
  <span>Black</span>
</a>

<!-- Light -->
<a href="#" class="btn btn-light btn-md">
  <span>Light</span>
</a>
```

#### Hover State Changes
```html
<!-- Primary that becomes white on hover -->
<a href="#" class="btn btn-primary hover:btn-white btn-xl">
  <span>Get started</span>
</a>

<!-- Secondary that becomes primary on hover -->
<a href="#" class="btn btn-secondary hover:btn-primary btn-lg">
  <span>Discover</span>
</a>

<!-- White that becomes secondary on hover (with dark mode variant) -->
<a href="#" class="btn btn-white hover:btn-secondary dark:btn-accent btn-md">
  <span>Learn more</span>
</a>
```

#### Full Width Mobile Button
```html
<a href="#" class="btn btn-primary btn-lg w-full md:w-auto">
  <span>Submit</span>
</a>
```

#### Disabled State
```html
<button disabled class="btn btn-primary btn-md opacity-50 cursor-not-allowed">
  <span>Disabled</span>
</button>
```

---

### Button V2 (With Animated Icon)

#### Primary Button V2
```html
<div class="group/btn-v2 inline-block rounded-full duration-500 transition-transform ease-in-out">
  <a href="#" class="inline-flex items-center justify-center rounded-full cursor-pointer
                     gap-1.5 btn-primary-v2 btn-lg-v2 text-center transition-all duration-500
                     ease-in-out font-medium text-nowrap lowercase w-full">
    <span class="inline-block transition-transform duration-300 ease-in-out first-letter:uppercase">
      Get started
    </span>
    <div class="relative overflow-hidden size-6">
      <!-- First arrow (starts off-screen left) -->
      <span class="group-hover/btn-v2:translate-x-1 -translate-x-6 absolute inset-0
                   transition-all duration-300 ease-in-out size-6 btn-v2-icon">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <path d="M11 5H13V7H11V5Z" />
          <path d="M5 5H7V7H5V5Z" />
          <path d="M14 8H16V10H14V8Z" />
          <path d="M8 8H10V10H8V8Z" />
          <path d="M17 11H19V13H17V11Z" />
          <path d="M11 11H13V13H11V11Z" />
          <path d="M14 14H16V16H14V14Z" />
          <path d="M8 14H10V16H8V14Z" />
          <path d="M11 17H13V19H11V17Z" />
          <path d="M5 17H7V19H5V17Z" />
        </svg>
      </span>
      <!-- Second arrow (starts centered) -->
      <span class="group-hover/btn-v2:translate-x-6 absolute -translate-x-2
                   transition-all duration-300 ease-in-out size-6 btn-v2-icon">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <path d="M11 5H13V7H11V5Z" />
          <path d="M5 5H7V7H5V5Z" />
          <path d="M14 8H16V10H14V8Z" />
          <path d="M8 8H10V10H8V8Z" />
          <path d="M17 11H19V13H17V11Z" />
          <path d="M11 11H13V13H11V11Z" />
          <path d="M14 14H16V16H14V14Z" />
          <path d="M8 14H10V16H8V14Z" />
          <path d="M11 17H13V19H11V17Z" />
          <path d="M5 17H7V19H5V17Z" />
        </svg>
      </span>
    </div>
  </a>
</div>
```

#### All V2 Color Variants
```html
<!-- Primary V2 -->
<div class="group/btn-v2 inline-block rounded-full">
  <a href="#" class="... btn-primary-v2 btn-md-v2 ...">
    <span>Primary</span>
    <!-- icon -->
  </a>
</div>

<!-- Secondary V2 -->
<div class="group/btn-v2 inline-block rounded-full">
  <a href="#" class="... btn-secondary-v2 btn-md-v2 ...">
    <span>Secondary</span>
    <!-- icon -->
  </a>
</div>

<!-- White V2 -->
<div class="group/btn-v2 inline-block rounded-full">
  <a href="#" class="... btn-v2-white btn-md-v2 ...">
    <span>White</span>
    <!-- icon -->
  </a>
</div>

<!-- Gray V2 -->
<div class="group/btn-v2 inline-block rounded-full">
  <a href="#" class="... btn-gray-v2 btn-md-v2 ...">
    <span>Gray</span>
    <!-- icon -->
  </a>
</div>

<!-- Green V2 -->
<div class="group/btn-v2 inline-block rounded-full">
  <a href="#" class="... btn-green-v2 btn-md-v2 ...">
    <span>Success</span>
    <!-- icon -->
  </a>
</div>
```

---

### Feature Card Component

```html
<div class="grid grid-cols-12 space-y-8 md:space-y-0 md:gap-8">
  <!-- Large Feature Card (8 columns) -->
  <div class="col-span-12 md:col-span-6 lg:col-span-8
              p-8 rounded-[20px] bg-background-3 dark:bg-background-7
              space-y-6">
    <div class="space-y-2">
      <h5 class="max-sm:text-heading-6 text-secondary dark:text-accent">
        Smart analytics with real-time insights.
      </h5>
      <p class="max-w-[450px] text-secondary/60 dark:text-accent/60">
        Stay in the loop and make better choices with awesome,
        built-in analytics that give you real-time insights.
      </p>
    </div>
    <figure class="w-full">
      <img
        src="./images/feature-large.png"
        alt="Feature image"
        class="w-full object-cover rounded-2xl"
      />
    </figure>
  </div>

  <!-- Small Feature Card (4 columns) -->
  <div class="col-span-12 md:col-span-6 lg:col-span-4
              p-8 rounded-[20px] bg-background-3 dark:bg-background-7
              space-y-6">
    <div class="space-y-2">
      <h5 class="max-sm:text-heading-6 text-secondary dark:text-accent">
        Seamless system integrations.
      </h5>
      <p class="max-w-[220px] text-secondary/60 dark:text-accent/60">
        Connect with all your favorite tools effortlessly.
      </p>
    </div>
    <figure class="w-full">
      <img
        src="./images/feature-small.png"
        alt="Feature image"
        class="w-full object-cover rounded-2xl"
      />
    </figure>
  </div>
</div>
```

---

### Form Input with States

```html
<form class="space-y-4">
  <!-- Text Input -->
  <fieldset class="space-y-1.5">
    <label for="name" class="block text-tagline-1 font-medium
                             text-secondary dark:text-accent select-none">
      Full Name
    </label>
    <input
      type="text"
      id="name"
      class="w-full px-[18px] py-3 h-[45px] rounded-full
             border border-stroke-3 bg-background-1
             text-tagline-2 text-secondary
             placeholder:text-secondary/60 placeholder:font-normal
             focus:outline-none focus:border-secondary
             dark:bg-background-6 dark:border-stroke-7
             dark:text-accent dark:placeholder:text-accent/60
             dark:focus:border-primary-400
             transition-colors duration-200"
      placeholder="Enter your full name"
    />
  </fieldset>

  <!-- Email Input -->
  <fieldset class="space-y-1.5">
    <label for="email" class="block text-tagline-1 font-medium
                               text-secondary dark:text-accent select-none">
      Email Address
    </label>
    <input
      type="email"
      id="email"
      class="w-full px-[18px] py-3 h-[45px] rounded-full
             border border-stroke-3 bg-background-1
             text-tagline-2 text-secondary
             placeholder:text-secondary/60 placeholder:font-normal
             focus:outline-none focus:border-secondary
             dark:bg-background-6 dark:border-stroke-7
             dark:text-accent dark:placeholder:text-accent/60
             dark:focus:border-primary-400
             transition-colors duration-200"
      placeholder="your@email.com"
    />
  </fieldset>

  <!-- Textarea -->
  <fieldset class="space-y-1.5">
    <label for="message" class="block text-tagline-1 font-medium
                                 text-secondary dark:text-accent select-none">
      Message
    </label>
    <textarea
      id="message"
      rows="5"
      class="w-full px-[18px] py-3 rounded-xl
             border border-stroke-3 bg-background-1
             text-tagline-2 text-secondary
             placeholder:text-secondary/60
             focus:outline-none focus:border-secondary
             dark:bg-background-6 dark:border-stroke-7
             dark:text-accent dark:placeholder:text-accent/60
             dark:focus:border-primary-400
             placeholder:font-normal font-normal
             transition-colors duration-200"
      placeholder="Tell us about your project..."
    ></textarea>
  </fieldset>

  <!-- Checkbox -->
  <fieldset>
    <label class="flex items-center gap-x-3 cursor-pointer">
      <input type="checkbox" id="terms" class="sr-only peer" />
      <span class="size-4 rounded-full border border-stroke-3
                   dark:border-stroke-7 relative
                   after:absolute after:size-2.5 after:bg-primary-500
                   after:rounded-full after:top-1/2 after:left-1/2
                   after:-translate-x-1/2 after:-translate-y-1/2
                   after:opacity-0 peer-checked:after:opacity-100
                   peer-checked:border-primary-500 cursor-pointer
                   transition-all duration-200"></span>
      <span class="text-tagline-1 text-secondary dark:text-accent select-none">
        I agree to the <a href="#" class="text-primary-500 hover:underline">terms and conditions</a>
      </span>
    </label>
  </fieldset>

  <!-- Submit Button -->
  <button type="submit" class="btn btn-primary btn-lg w-full">
    <span>Submit Form</span>
  </button>
</form>
```

**Error State (add to input):**
```html
<input
  class="... border-red-500 focus:border-red-500 ..."
  aria-invalid="true"
/>
<p class="text-tagline-3 text-red-500 mt-1">This field is required</p>
```

**Success State (add to input):**
```html
<input
  class="... border-ns-green focus:border-ns-green ..."
/>
```

---

### Complete Section Layout (Hero)

```html
<section class="hero-section pt-[320px] md:pt-[200px] lg:pt-[200px] xl:pt-[260px]
                pb-16 md:pb-20 lg:pb-[120px] xl:pb-[150px]
                bg-[url('/images/hero-bg.png')] bg-no-repeat bg-top
                relative z-0">

  <!-- Main Container -->
  <div class="main-container flex flex-col items-center space-y-[124px]
              relative z-10 mb-[100px] lg:mb-[150px] xl:mb-[220px]">

    <!-- Hero Content -->
    <div class="text-left md:text-center max-md:pt-[150px] max-lg:pt-[200px]">
      <!-- Badge -->
      <span data-ns-animate data-delay="0.05" class="badge badge-cyan mb-5 inline-block">
        New Feature
      </span>

      <!-- Hero Title -->
      <h1 data-ns-animate data-delay="0.1" class="mb-4 hero-title">
        Automate smarter. <br class="hidden md:block" />
        Grow faster.
      </h1>

      <!-- Hero Description -->
      <p data-ns-animate data-delay="0.2" class="max-w-[650px] mx-auto mb-6">
        Save time and elevate your business with intelligent
        workflow automation from NextSaaS.
      </p>

      <!-- Feature Bullets -->
      <ul class="list-none mb-14 flex flex-col md:flex-row md:items-center
                 md:justify-center md:flex-wrap lg:flex-nowrap gap-4 md:gap-9
                 w-fit md:mx-auto">
        <li data-ns-animate data-delay="0.3" class="flex items-center gap-2.5">
          <svg width="19" height="19" viewBox="0 0 19 19"
               fill="none" xmlns="http://www.w3.org/2000/svg"
               class="shrink-0">
            <rect x="0.664062" y="0.5" width="18" height="18" rx="9"
                  class="fill-secondary dark:fill-accent/20" />
            <path d="M8.98067 13.2561L14.4131 7.92144C14.7477 7.5959 14.7477 7.0697 14.4131 6.74416C14.0785 6.41861 13.5377 6.41861 13.2031 6.74416L8.37567 11.4901L6.12502 9.28807C5.79043 8.96253 5.2496 8.96253 4.91501 9.28807C4.58041 9.61362 4.58041 10.1398 4.91501 10.4654L7.77066 13.2561C7.93753 13.4184 8.1566 13.5 8.37567 13.5C8.59473 13.5 8.8138 13.4184 8.98067 13.2561Z"
                  class="fill-white" />
          </svg>
          <span class="text-tagline-2 dark:text-accent/60">
            Boost your business with AI.
          </span>
        </li>
        <li data-ns-animate data-delay="0.4" class="flex items-center gap-2.5">
          <svg width="19" height="19" class="shrink-0">
            <!-- Same SVG as above -->
          </svg>
          <span class="text-tagline-2 dark:text-accent/60">
            Trusted by leading industries worldwide.
          </span>
        </li>
        <li data-ns-animate data-delay="0.5" class="flex items-center gap-2.5">
          <svg width="19" height="19" class="shrink-0">
            <!-- Same SVG as above -->
          </svg>
          <span class="text-tagline-2 dark:text-accent/60">
            Start your AI journey today.
          </span>
        </li>
      </ul>

      <!-- CTA Button -->
      <div data-ns-animate data-delay="0.6" class="block md:inline-block">
        <a href="./pricing.html"
           class="btn btn-primary hover:btn-white dark:btn-accent btn-xl
                  dark:hover:btn-primary w-[90%] md:w-auto mx-auto"
           aria-label="Get started">
          <span>Get started</span>
        </a>
      </div>

      <!-- Hero Image -->
      <figure data-ns-animate data-delay="0.7" data-instant
              class="max-w-[408px] mx-auto mt-20 md:mt-[124px]
                     rounded-[20px] flex justify-center items-center
                     overflow-hidden">
        <img src="./images/hero-image.png"
             alt="NextSaaS Dashboard"
             class="inline-block dark:hidden w-full h-full object-cover" />
        <img src="./images/hero-image-dark.png"
             alt="NextSaaS Dashboard"
             class="hidden dark:inline-block w-full h-full object-cover" />
      </figure>
    </div>
  </div>

  <!-- Hero Bottom Section -->
  <div class="main-container">
    <div class="relative z-0">
      <div class="w-full h-full bg-white dark:bg-background-8
                  absolute -z-10 overflow-hidden rounded-[20px]">
        <!-- Gradient overlay -->
        <div data-ns-animate data-delay="0.7" data-direction="right"
             class="-z-10 absolute lg:-top-[155%] md:-top-[65%] -top-[75%]
                    -right-[75%] lg:-right-[40%] md:-right-[70%]
                    md:rotate-[60deg] rotate-[10deg] size-[1060px]
                    select-none pointer-events-none">
          <img src="./images/gradient-overlay.png" alt="" />
        </div>
      </div>

      <div class="flex flex-col lg:flex-row">
        <!-- Left Column -->
        <div class="lg:flex-1/2 py-16 max-lg:px-5 lg:pl-14">
          <div class="mb-9">
            <h2 data-ns-animate data-delay="0.2" class="mb-3">
              Innovate for Impact.
            </h2>
            <p data-ns-animate data-delay="0.3" class="max-w-[530px]">
              At NextSaaS, we leverage AI and strategic insight to
              enhance business performance. Partner with us to unlock
              your potential.
            </p>
          </div>

          <ul class="list-none space-y-2 mb-14">
            <li data-ns-animate data-delay="0.4" class="flex items-center gap-3">
              <svg width="18" height="18" class="shrink-0">
                <rect width="18" height="18" rx="9"
                      class="fill-secondary dark:fill-accent/20" />
                <path d="M8.31661 12.7561L13.7491 7.42144C14.0836 7.0959 14.0836 6.5697 13.7491 6.24416C13.4145 5.91861 12.8736 5.91861 12.539 6.24416L7.7116 10.9901L5.46096 8.78807C5.12636 8.46253 4.58554 8.46253 4.25095 8.78807C3.91635 9.11362 3.91635 9.63982 4.25095 9.96536L7.1066 12.7561C7.27347 12.9184 7.49253 13 7.7116 13C7.93067 13 8.14974 12.9184 8.31661 12.7561Z"
                      fill="white" />
              </svg>
              <p class="text-secondary dark:text-accent">
                8 years in creative direction, design & code
              </p>
            </li>
            <li data-ns-animate data-delay="0.5" class="flex items-center gap-3">
              <svg width="18" height="18" class="shrink-0">
                <!-- Same SVG -->
              </svg>
              <p class="text-secondary dark:text-accent">
                Collaborated with over 50 brands in tech, fashion, and media
              </p>
            </li>
            <li data-ns-animate data-delay="0.6" class="flex items-center gap-3">
              <svg width="18" height="18" class="shrink-0">
                <!-- Same SVG -->
              </svg>
              <p class="text-secondary dark:text-accent">
                Enthusiastic about typography, interaction, and minimalism
              </p>
            </li>
          </ul>

          <div data-ns-animate data-delay="0.7" class="text-center sm:text-left">
            <a href="./about.html"
               class="btn btn-secondary btn-md hover:btn-primary
                      dark:btn-accent w-[85%] md:w-auto mx-auto">
              <span>Discover more about us</span>
            </a>
          </div>
        </div>

        <!-- Right Column (Image) -->
        <div class="lg:flex-1/2 lg:pe-[42px]">
          <div data-ns-animate data-delay="0.5" data-direction="right"
               class="relative h-full max-lg:max-w-[525px] max-lg:mx-auto">
            <figure class="lg:absolute lg:right-0 lg:bottom-0
                           max-w-[525px] max-lg:mx-auto">
              <img src="./images/about-image.png"
                   alt="About us"
                   class="w-full h-full" />
            </figure>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
```

---

### Pricing Card

```html
<div class="bg-background-3 dark:bg-background-7 p-8 rounded-[20px]
            col-span-12 lg:col-span-4 max-w-[604px] w-full mx-auto">
  <!-- Header -->
  <h3 class="mb-2 font-normal text-heading-5 text-secondary dark:text-accent">
    Professional
  </h3>
  <p class="mb-6 max-w-[250px] text-secondary/60 dark:text-accent/60">
    For teams that need advanced features and priority support.
  </p>

  <!-- Price -->
  <div class="price-month mb-7">
    <h4 class="text-heading-4 font-normal text-secondary dark:text-accent">
      $<span class="price-value">2400.00</span>
    </h4>
    <p class="text-secondary dark:text-accent">Per Month</p>
  </div>

  <!-- CTA Button -->
  <a href="#"
     class="btn btn-md btn-white hover:btn-primary dark:btn-white-dark
            w-full block text-center mb-8 before:content-none
            first-letter:uppercase">
    Get started
  </a>

  <!-- Features List -->
  <ul class="relative list-none space-y-2.5">
    <li class="flex items-center shrink-0 gap-2.5">
      <svg width="20" height="20" viewBox="0 0 20 20"
           fill="none" xmlns="http://www.w3.org/2000/svg"
           class="shrink-0">
        <rect width="20" height="20" rx="10"
              class="fill-secondary dark:fill-accent/20" />
        <path d="M8.91718 14.2568L15.5161 7.77049C15.9268 7.36656 15.9268 6.70411 15.5161 6.30018C15.1055 5.89625 14.4305 5.89625 14.0198 6.30018L8.21218 11.9876L5.98018 9.79207C5.56951 9.38814 4.89451 9.38814 4.48384 9.79207C4.07318 10.196 4.07318 10.8585 4.48384 11.2624L7.91717 14.2568C8.1225 14.4583 8.39184 14.5594 8.66117 14.5594C8.93051 14.5594 9.19984 14.4583 9.40517 14.2568Z"
              class="fill-white" />
      </svg>
      <span class="text-secondary dark:text-accent font-normal text-tagline-1">
        Everything in Basic
      </span>
    </li>
    <li class="flex items-center shrink-0 gap-2.5">
      <svg width="20" height="20" class="shrink-0">
        <!-- Same SVG -->
      </svg>
      <span class="text-secondary dark:text-accent font-normal text-tagline-1">
        Advanced Analytics Dashboard
      </span>
    </li>
    <li class="flex items-center shrink-0 gap-2.5">
      <svg width="20" height="20" class="shrink-0">
        <!-- Same SVG -->
      </svg>
      <span class="text-secondary dark:text-accent font-normal text-tagline-1">
        Priority Email & Chat Support
      </span>
    </li>
    <li class="flex items-center shrink-0 gap-2.5">
      <svg width="20" height="20" class="shrink-0">
        <!-- Same SVG -->
      </svg>
      <span class="text-secondary dark:text-accent font-normal text-tagline-1">
        Custom Integrations
      </span>
    </li>
    <li class="flex items-center shrink-0 gap-2.5">
      <svg width="20" height="20" class="shrink-0">
        <!-- Same SVG -->
      </svg>
      <span class="text-secondary dark:text-accent font-normal text-tagline-1">
        Team Collaboration Tools
      </span>
    </li>
  </ul>
</div>
```

---

## 11. Additional Observations

### Hidden Design Rules

#### 1. Opacity Creates Text Hierarchy
Rather than using different text colors, the system primarily uses **opacity modifiers** to create visual hierarchy:
- Headings: 100% opacity
- Body text: 60% opacity
- Disabled/muted text: 40% opacity

This creates consistency while automatically adapting to theme changes (light/dark mode).

#### 2. Gradient Overlays Add Depth Without Complexity
Large gradient images are positioned absolutely behind content using negative z-index. This creates visual interest and depth without cluttering the HTML or requiring complex CSS techniques.

Pattern:
```html
<section class="relative">
  <figure class="absolute -z-10 size-[1635px] -top-[1320px]">
    <img src="gradient.png" />
  </figure>
  <div class="relative z-10">Content</div>
</section>
```

#### 3. Consistent 8px Spacing Base
While Tailwind's default is 4px (0.25rem), most spacing in this system is multiples of **8px** (Tailwind's size-2):
- Card padding: 32px (8 × 4)
- Gaps: 16px (8 × 2), 24px (8 × 3), 32px (8 × 4)
- Section spacing: 64px, 80px, 96px, etc.

This creates a more generous, breathable design suitable for SaaS applications.

#### 4. Rounded Corners Soften Geometric Layouts
Every interactive element uses fully rounded corners (`rounded-full`), while cards use generous 20px radius. This creates a friendly, modern aesthetic that contrasts with the otherwise geometric grid layouts.

#### 5. Dark Mode is First-Class
Dark mode isn't an afterthought—every component has explicit `dark:` variants. The color system is designed from the ground up to work in both modes, with semantic color names (`secondary`, `accent`) that invert automatically.

### Repeated Visual Motifs

#### 1. Purple/Pink Gradient Accent
The primary brand color (#864ffe) is frequently paired with pink/coral tones in gradients:
- `gradient-1`: Purple to pink (#a585ff → #ffc2ad)
- `gradient-9`: Light purple to pink (#dfb0ff → #fdbedc)
- Button hover states often transition to/from primary purple

#### 2. Cyan/Green Accent Combinations
For success states and highlights, cyan and green are paired:
- Badge combinations: `badge-cyan`, `badge-green`
- Gradient combinations: `gradient-3` (cyan to yellow), `gradient-10` (cyan to green)
- Icons and status indicators use green (`ns-green`)

#### 3. Positioned Gradient Backgrounds for Depth
Almost every major section includes a large, absolutely-positioned gradient image behind the content. These are typically:
- 1000-1600px in size
- Positioned off-screen (negative top/left values)
- Rotated for dynamism
- Z-indexed behind content (`-z-10` or `-z-1`)

#### 4. Floating/Absolute Positioned Decorative Elements
Hero sections feature "floating" UI elements (data cards, charts, avatars) positioned absolutely with:
- Parallax effects (`data-parallax-x/y`)
- Scroll animations (`data-ns-animate`)
- Rotation transforms
- Spring physics (`data-spring`)

This creates a sense of depth and interactivity.

#### 5. Checkmark Lists for Feature Emphasis
Rather than plain bullet points, features are consistently shown with circular checkmark icons:
- Circle background (secondary or accent/20)
- White checkmark
- 18-19px diameter
- Consistent spacing (gap-2.5 or gap-3)

#### 6. Badge + Heading + Description Content Pattern
Section headers follow a strict pattern:
```
[Badge]
[Heading (often with inline color accent)]
[Description paragraph at 60% opacity]
```

This creates predictable visual rhythm across all pages.

### Design Strengths

#### 1. Highly Systematic and Consistent
- Standardized spacing scale
- Consistent component variants
- Predictable naming conventions
- Reusable utility classes
- Clear hierarchy patterns

#### 2. Comprehensive Dark Mode Support
- Every component has dark variants
- Carefully tuned contrast ratios
- Automatic inversion via semantic color names
- Consistent opacity strategy across themes

#### 3. Professional Color Palette
- Vibrant but not overwhelming
- Clear semantic meaning (primary, success, error)
- Sufficient contrast for accessibility
- Sophisticated gradient combinations

#### 4. Smooth Animations and Transitions
- Consistent timing (300ms, 500ms)
- Subtle hover effects that don't distract
- Scroll-triggered reveals add polish
- Staggered animations guide the eye

#### 5. Responsive-First Approach
- Mobile-first utility classes
- Systematic breakpoint usage
- Progressive enhancement with viewport size
- Touch-friendly interactive elements

#### 6. Extensive Component Variety
- Multiple button systems (standard + V2)
- Numerous badge variants
- Feature cards, pricing cards, blog cards
- Forms with custom-styled inputs
- Navigation with mega menus

#### 7. Scalable Architecture
- Component-based .htm files
- Centralized CSS variables
- Reusable utility classes
- Clear file organization

### Design Risks

#### 1. Very Large Codebase (400+ Pages)
- Maintenance complexity increases with scale
- Consistency harder to maintain across so many pages
- Updating global styles requires extensive testing
- Potential for drift over time

#### 2. Heavy Reliance on Absolute Positioning
- Decorative elements positioned absolutely
- Can break at unexpected viewport sizes
- Difficult to maintain across responsive breakpoints
- Requires precise positioning values

#### 3. Tailwind v4 Early Adoption
- Version 4 is newer with potential breaking changes
- Smaller community/plugin ecosystem than v3
- Migration challenges if reverting to v3
- Documentation still evolving

#### 4. Complex Animation System Requires JS Dependencies
- Custom scroll animation system
- Counter animations
- Progress bar animations
- Parallax effects
- All require JavaScript to function

#### 5. Many Color Variations Could Lead to Inconsistency
- 12 gradient variations
- 12 background colors
- 9 stroke colors
- Brand accent colors
- Without discipline, usage could become inconsistent

#### 6. Large CSS Variable Set to Maintain
- 100+ CSS variables defined
- Changes require updating multiple files
- Potential for naming conflicts
- Complex interdependencies

#### 7. Custom Utilities May Conflict with Tailwind Updates
- Custom `@utility` definitions
- Could conflict with future Tailwind additions
- Requires careful namespace management

---

## Conclusion

This design system represents a **mature, production-ready component library** optimized for modern SaaS applications. It balances systematic consistency with creative flair, providing designers and developers with:

- **Clear guidelines** for color, typography, spacing, and components
- **Flexible utilities** that adapt to various use cases
- **Dark mode** as a first-class feature
- **Smooth animations** that enhance without distracting
- **Comprehensive examples** ready to copy and customize

The system's strengths lie in its consistency, comprehensive dark mode support, and professional aesthetic. The primary risks relate to scale (400+ pages), early adoption of Tailwind v4, and the complexity of maintaining many color and animation variations.

For teams building **B2B SaaS, fintech, or AI/tech products**, this design system provides an excellent foundation that can be customized and extended while maintaining visual coherence.

---

**Document Version:** 1.0
**Based on:** NextSaaS v2.0.0
**Last Updated:** January 2026
**Tailwind Version:** 4.1.4
