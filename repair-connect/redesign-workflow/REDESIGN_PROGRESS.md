# Repair Connect — Redesign Progress Tracker

**Last Updated:** 2025-10-06
**Timeline:** 3-Day Sprint
**Design System:** Twitter Theme (tweakcn)
**Approach:** In-place refactor with agent validation

---

## 🎯 Phase Overview

### Phase 1: Foundation (Day 1)
**Goal:** Establish design system and refactor layout shell

### Phase 2: Core Components (Day 2)
**Goal:** Refactor UI components and dashboard pages

### Phase 3: Testing & Polish (Day 3)
**Goal:** Agent validation, Playwright tests, and final polish

---

## 🎨 Design System: Twitter Theme (tweakcn)

The Twitter theme has been successfully installed and provides:

### ✅ Design Tokens Applied

**Colors (OKLCH):**
```css
/* Light Mode */
--primary: oklch(0.6723 0.1606 244.9955)        /* Twitter Blue */
--secondary: oklch(0.1884 0.0128 248.5103)      /* Dark Navy */
--accent: oklch(0.9392 0.0166 250.8453)         /* Light Blue */
--destructive: oklch(0.6188 0.2376 25.7658)     /* Red */
--muted: oklch(0.9222 0.0013 286.3737)          /* Light Gray */
--border: oklch(0.9317 0.0118 231.6594)         /* Border Gray */

/* Dark Mode */
--background: oklch(0 0 0)                      /* Pure Black */
--card: oklch(0.2097 0.0080 274.5332)          /* Dark Gray Card */
--primary: oklch(0.6692 0.1607 245.0110)        /* Brighter Blue */
--muted: oklch(0.2090 0 0)                      /* Dark Muted */
```

**Border Radius:**
```css
--radius: 1.3rem (20.8px)                       /* Twitter's rounded style */
--radius-sm: calc(var(--radius) - 4px)          /* 16.8px */
--radius-md: calc(var(--radius) - 2px)          /* 18.8px */
--radius-lg: var(--radius)                      /* 20.8px */
--radius-xl: calc(var(--radius) + 4px)          /* 24.8px */
```

**Typography:**
```css
--font-sans: Open Sans, sans-serif
--font-serif: Georgia, serif
--font-mono: Menlo, monospace
--tracking-normal: 0em
```

**Shadows (Flat Twitter Style):**
```css
--shadow-2xs to --shadow-2xl: Minimal shadows with 0 opacity
--shadow-color: rgba(29,161,242,0.15) (light) / rgba(29,161,242,0.25) (dark)
```

**Spacing:**
```css
--spacing: 0.25rem (4px base unit)
```

---

## 📊 UI Audit Findings

### Current State Analysis

#### ✅ **Strengths**
- ✅ Modern tech stack (Next.js 15, React 19, TailwindCSS 4)
- ✅ shadcn/ui components integrated
- ✅ OKLCH color space for perceptual uniformity
- ✅ Dark mode infrastructure in place
- ✅ Twitter theme tokens now applied
- ✅ Responsive header with mobile menu

#### ⚠️ **Issues Identified & Actions Needed**

**Design Token Integration:**
- ⚠️ Need to remove hardcoded colors from `tailwind.config.js`
- ⚠️ Button component still uses `text-white` instead of `text-primary-foreground`
- ⚠️ Header uses hardcoded `text-gray-700` instead of semantic tokens
- ✅ globals.css now has complete Twitter theme tokens

**Typography Updates:**
- ⚠️ Need to switch from Inter/Poppins to Open Sans (Twitter theme default)
- ⚠️ Add letter-spacing via `--tracking-normal`
- ⚠️ CardTitle should use consistent size scale

**Spacing & Layout:**
- ⚠️ Update components to use 4px spacing unit (--spacing)
- ⚠️ Card padding needs to follow Twitter's generous spacing
- ⚠️ Header height should use token-based sizing

**Border Radius:**
- ✅ Twitter theme uses 1.3rem (20.8px) - more rounded than before
- ⚠️ Need to update Badge from `rounded-full` to `rounded-lg`
- ⚠️ Buttons should respect new radius tokens

**Shadows:**
- ✅ Twitter theme uses flat, minimal shadows
- ⚠️ Card component should use subtle elevation
- ⚠️ Remove heavy box-shadows from custom styles

---

## 📋 Component Inventory

### Layout Components
| Component | Location | Status | Priority | Notes |
|-----------|----------|--------|----------|-------|
| Header | `components/layout/header.tsx` | ⚠️ Needs refactor | High | Update colors to tokens |
| Footer | `components/layout/footer.tsx` | ⏳ Not reviewed | Medium | - |
| Page Container | N/A - needs creation | ⏳ Pending | High | Consistent padding/width |

### UI Components (shadcn/ui)
| Component | Location | Status | Issues | Action |
|-----------|----------|--------|--------|--------|
| Button | `components/ui/button.tsx` | ⚠️ Needs tokens | Hardcoded `text-white` | Use `text-primary-foreground` |
| Card | `components/ui/card.tsx` | ⚠️ Update radius | Default shadow | Use Twitter flat style |
| Badge | `components/ui/badge.tsx` | ⚠️ Update radius | `rounded-full` | Use `rounded-lg` |
| Input | `components/ui/input.tsx` | ✅ Good baseline | Minor tweaks | Update radius |
| Dialog | `components/ui/dialog.tsx` | ⏳ Not reviewed | - | Check backdrop |
| Select | `components/ui/select.tsx` | ⏳ Not reviewed | - | - |
| Checkbox | `components/ui/checkbox.tsx` | ⏳ Not reviewed | - | - |
| Switch | `components/ui/switch.tsx` | ⏳ Not reviewed | - | - |
| Tabs | `components/ui/tabs.tsx` | ⏳ Not reviewed | - | - |
| Calendar | `components/ui/calendar.tsx` | ⏳ Not reviewed | - | - |

### Page Components
| Page | Location | Status | Priority | Action |
|------|----------|--------|----------|--------|
| Dashboard (Customer) | `src/app/dashboard/page.tsx` | ⚠️ Needs refactor | High | Remove gradient cards |
| Dashboard (Workshop) | `src/app/dashboard/page.tsx` | ⚠️ Needs refactor | High | Flatten design |
| Quotations Request | `src/app/(customer)/quotations/request/page.tsx` | ⏳ Pending | Medium | - |
| Quotations List | `src/app/(customer)/quotations/page.tsx` | ⏳ Pending | Medium | - |
| Workshop Profile | `src/app/(workshop)/profile/page.tsx` | ⏳ Pending | Medium | - |
| Appointments | `src/app/appointments/page.tsx` | ⏳ Pending | Medium | - |

---

## ✅ Task Completion Tracking

### Day 1: Foundation

#### Design Tokens ✅ Twitter Theme Installed
- [x] Install Twitter theme from tweakcn
- [ ] Remove hardcoded colors from `tailwind.config.js`
- [ ] Update font imports (Open Sans, Georgia, Menlo)
- [ ] Document Twitter theme token usage
- [ ] Create design system quick reference guide

#### Layout Shell
- [ ] Create PageContainer wrapper component
- [ ] Refactor Header with Twitter theme tokens
- [ ] Update navigation to flat, minimal style
- [ ] Simplify mobile menu animations
- [ ] Refactor Footer (if needed)

### Day 2: Core Components

#### UI Components (Twitter Theme Compliance)
- [ ] Button: Use `text-primary-foreground`, update radius
- [ ] Card: Flat shadow, Twitter-style padding
- [ ] Badge: Change to `rounded-lg`, semantic colors
- [ ] Input: Update radius, focus states
- [ ] Select: Review and update
- [ ] Dialog: Update backdrop and radius

#### Dashboard
- [ ] Remove gradient backgrounds from cards
- [ ] Flatten stat card design (Twitter style)
- [ ] Update spacing to 4px grid
- [ ] Add Twitter-style dividers
- [ ] Improve information density
- [ ] Add loading skeletons
- [ ] Add empty states

### Day 3: Testing & Polish

#### Agent Validation
- [ ] Run UI Reviewer on all refactored components
- [ ] Run Responsiveness Tester (375px, 768px, 1024px, 1440px)
- [ ] Run Accessibility Auditor (WCAG 2.1 AA)
- [ ] Run Edge Case Validator (empty/loading/error states)
- [ ] Address all critical and high-priority findings

#### Playwright Tests
- [ ] Install Playwright and @axe-core/playwright
- [ ] Configure playwright.config.ts
- [ ] Create test utilities and fixtures
- [ ] Add visual regression tests for components
- [ ] Add functional tests for key flows
- [ ] Add accessibility tests

#### Final Polish
- [ ] Review all animations (Twitter-style quick transitions)
- [ ] Test dark mode across all components
- [ ] Verify responsive behavior
- [ ] Verify contrast ratios
- [ ] Update documentation

---

## 🐛 Known Issues Log

### Critical
- None yet

### High Priority
- [ ] Hardcoded colors in `tailwind.config.js` conflict with Twitter theme
- [ ] Button component uses `text-white` instead of tokens
- [ ] Header uses hardcoded gray colors

### Medium Priority
- [ ] Badge uses `rounded-full` instead of Twitter radius
- [ ] Card shadows need to be flattened
- [ ] Typography needs font family update

### Low Priority
- [ ] Spacing could follow 4px grid more consistently
- [ ] Dashboard gradient cards should be flat

---

## 📝 Agent Reports

### UI Reviewer Reports
_Reports will be added as components are refactored_

### Responsiveness Reports
_Reports will be added after refactoring_

### Accessibility Reports
_Reports will be added after refactoring_

### Edge Case Reports
_Reports will be added after refactoring_

---

## 🎨 Twitter Theme Design Reference

### Core Principles (Twitter-Inspired)
1. **Flat Design:** Minimal shadows, crisp borders
2. **High Contrast:** Clear text on backgrounds
3. **Generous Spacing:** Breathing room between elements
4. **Rounded Corners:** 1.3rem default radius
5. **Bold CTAs:** Primary blue stands out
6. **Information Density:** Compact but readable

### Color Palette

**Primary Actions:**
- Primary: `oklch(0.6723 0.1606 244.9955)` - Twitter Blue
- Primary Foreground: `oklch(1.0000 0 0)` - White

**Backgrounds:**
- Light: `oklch(1.0000 0 0)` - Pure White
- Dark: `oklch(0 0 0)` - Pure Black
- Card (Light): `oklch(0.9784 0.0011 197.1387)` - Off White
- Card (Dark): `oklch(0.2097 0.0080 274.5332)` - Dark Gray

**Text:**
- Foreground (Light): `oklch(0.1884 0.0128 248.5103)` - Near Black
- Foreground (Dark): `oklch(0.9328 0.0025 228.7857)` - Off White
- Muted (Light): `oklch(0.9222 0.0013 286.3737)` - Light Gray
- Muted (Dark): `oklch(0.2090 0 0)` - Dark Gray

**Borders:**
- Light: `oklch(0.9317 0.0118 231.6594)` - Light Border
- Dark: `oklch(0.2674 0.0047 248.0045)` - Dark Border

### Typography Scale
```css
text-xs: 0.75rem (12px)
text-sm: 0.875rem (14px)
text-base: 1rem (16px)
text-lg: 1.25rem (20px)
text-xl: 1.5rem (24px)
text-2xl: 2rem (32px)
text-3xl: 2.5rem (40px)
```

### Spacing Scale (4px Grid)
```
0.5 = 2px
1 = 4px (--spacing base)
2 = 8px
3 = 12px
4 = 16px
6 = 24px
8 = 32px
12 = 48px
16 = 64px
```

### Border Radius
```css
rounded-sm: 16.8px
rounded-md: 18.8px
rounded-lg: 20.8px (default)
rounded-xl: 24.8px
```

### Shadows (Minimal/Flat)
```css
--shadow-sm: Almost imperceptible
--shadow: Subtle elevation
--shadow-md: Card separation
--shadow-lg: Modal/Popover
--shadow-xl: Drawer/Sheet
```

All shadows use `rgba(29,161,242,0.15)` in light mode and `rgba(29,161,242,0.25)` in dark mode with 0 opacity by default (flat design).

---

## 📚 Resources

- [INSTRUCTION_GLOBAL.md](./instructions/INSTRUCTION_GLOBAL.md)
- [INSTRUCTION_PIPELINE.md](./instructions/INSTRUCTION_PIPELINE.md)
- [Twitter Theme (tweakcn)](https://tweakcn.com/r/themes/twitter.json)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Tailwind CSS v4 Docs](https://tailwindcss.com)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

---

## 🚀 Next Steps

1. **Immediate:** Remove hardcoded colors from `tailwind.config.js`
2. **Next:** Refactor Button component with Twitter theme tokens
3. **Then:** Update Header with semantic color tokens
4. **After:** Begin dashboard redesign with flat Twitter aesthetic

---

**Status Legend:**
- ✅ Complete
- ⚠️ Needs attention
- ⏳ Pending review
- ❌ Blocked/Issues
