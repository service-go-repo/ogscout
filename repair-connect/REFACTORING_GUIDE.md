# 🎨 UI/UX Refactoring Guide - Repair Connect

## ✅ Completed Work (Phase 1 - Partial)

### Files Successfully Refactored:
1. ✅ **components/quotations/car-selection-modal.tsx** (28 changes)
   - Replaced custom spinner with `Loader2`
   - Migrated all hardcoded colors to design tokens
   - Added dark mode support

2. ✅ **components/quotations/quote-comparison.tsx** (33 changes)
   - Migrated all colors to semantic tokens
   - Added explicit dark mode variants
   - Fixed destructive action colors

3. ✅ **components/layout/header.tsx** (2 changes)
   - Fixed loading skeleton colors
   - Standardized muted backgrounds

4. ✅ **src/app/(customer)/quotations/request/page.tsx** (18 changes)
   - Replaced 2 custom spinners with `Loader2`
   - Migrated 16 hardcoded colors
   - Fixed progress indicator colors

5. ✅ **src/app/(customer)/quotations/[id]/page.tsx** (PARTIAL - 3 sections)
   - Fixed `getStatusColor` function
   - Fixed loading skeletons
   - Fixed "Not Found" message colors

---

## 📋 Remaining Work (Priority Order)

### 🔴 High Priority (Customer-Facing)

#### 1. Complete: `src/app/(customer)/quotations/[id]/page.tsx`
**Remaining Issues**:
```tsx
// Lines ~315-320: Header section
- text-gray-900 → text-foreground
- text-gray-600 → text-muted-foreground

// Lines ~345-357: Metadata section
- text-gray-600 → text-muted-foreground (4 instances)

// Lines ~382-390: Empty state
- text-gray-300 → text-muted-foreground/30
- text-gray-900 → text-foreground
- text-gray-600 → text-muted-foreground
- text-gray-500 → text-muted-foreground/80

// Lines ~402-457: Appointment card (green theme)
- border-green-200 → border-emerald-200 dark:border-emerald-800
- bg-green-50 → bg-emerald-50 dark:bg-emerald-950/20
- text-green-800 → text-emerald-800 dark:text-emerald-200
- All green-* colors → emerald-* with dark: variants

// Lines ~505-509: Message section
- text-gray-500 → text-muted-foreground
- text-gray-700 → text-foreground
```

#### 2. `components/workshops/quote-submission-form.tsx`
**Has**: Custom spinner + hardcoded colors
**Search for**:
- `animate-spin.*border-b-2.*border-white`
- `text-gray-*`, `bg-gray-*`
- `text-blue-*`, `bg-blue-*`
- `text-green-*`, `bg-green-*`

#### 3. `components/appointments/appointment-settings.tsx`
**Has**: Custom spinner
**Replace**: `<div className="animate-spin rounded-full ... border-b-2 border-white"></div>`
**With**: `<Loader2 className="h-* w-* animate-spin" />`
**Don't forget**: Add `import { Loader2 } from 'lucide-react'`

#### 4. `src/app/(customer)/workshops/[id]/page.tsx`
#### 5. `src/app/(customer)/quotations/page.tsx`
#### 6. `src/app/(customer)/quotations/workshops/page.tsx`

### 🟡 Medium Priority (Workshop-Facing)

#### 7. `src/app/(workshop)/profile/page.tsx`
#### 8. `src/app/(workshop)/quotes/page.tsx`
#### 9. `src/app/(workshop)/quotes/[id]/page.tsx`
#### 10. `components/workshops/workshop-profile.tsx`

### 🟢 Component Library

#### 11-16. Appointment Components (6 files)
- `components/appointments/appointment-detail.tsx`
- `components/appointments/appointment-list.tsx`
- `components/appointments/pending-appointments.tsx`
- `components/appointments/customer-appointments.tsx`
- `components/appointments/appointment-dashboard.tsx`
- `components/appointments/appointment-review.tsx`

#### 17-18. Completed Jobs Components
- `components/completed-jobs/customer-completed-jobs.tsx`
- `components/completed-jobs/workshop-completed-jobs.tsx`

#### 19-20. Workshop Components
- `components/workshop/active-jobs.tsx`
- `components/workshop/customer-management.tsx`

#### 21. `components/auth/LoginForm.tsx`

---

## 🎯 Refactoring Patterns

### Pattern 1: Custom Spinner Replacement
```tsx
// ❌ Before
<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
<div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>

// ✅ After
import { Loader2 } from 'lucide-react'
<Loader2 className="h-12 w-12 animate-spin text-primary" />
<Loader2 className="h-5 w-5 animate-spin mr-2" />
```

### Pattern 2: Grayscale Colors (Most Common)
```tsx
// ❌ Before
text-gray-900    // Headings
text-gray-600    // Body text
text-gray-500    // Secondary text
text-gray-400    // Icons
text-gray-300    // Disabled/empty state icons
bg-gray-100      // Backgrounds
bg-gray-200      // Loading skeletons
bg-gray-50       // Subtle backgrounds
border-gray-200  // Borders

// ✅ After
text-foreground               // Headings
text-muted-foreground         // Body text
text-muted-foreground/80      // Secondary text
text-muted-foreground         // Icons
text-muted-foreground/30      // Disabled/empty state icons
bg-muted                      // Backgrounds
bg-muted                      // Loading skeletons
bg-muted/50                   // Subtle backgrounds
border-border                 // Borders
```

### Pattern 3: Blue Colors (Primary Actions)
```tsx
// ❌ Before
text-blue-600
bg-blue-600
border-blue-500
ring-blue-500

// ✅ After
text-primary
bg-primary
border-primary
ring-primary
```

### Pattern 4: Green Colors (Success States)
```tsx
// ❌ Before
text-green-600
bg-green-100
text-green-800
border-green-200

// ✅ After (with dark mode)
text-emerald-600 dark:text-emerald-400
bg-emerald-100 dark:bg-emerald-950/20
text-emerald-800 dark:text-emerald-200
border-emerald-200 dark:border-emerald-800
```

### Pattern 5: Red Colors (Destructive/Error)
```tsx
// ❌ Before
text-red-600
bg-red-100
text-red-800
border-red-200

// ✅ After
text-destructive
bg-destructive/10
text-destructive
border-destructive/20
```

### Pattern 6: Yellow Colors (Warning/Pending)
```tsx
// ❌ Before
text-yellow-600
bg-yellow-100
text-yellow-800

// ✅ After (with dark mode)
text-amber-600 dark:text-amber-400
bg-amber-100 dark:bg-amber-950/20
text-amber-800 dark:text-amber-200
```

### Pattern 7: Orange/Purple (Accent Colors)
```tsx
// ❌ Before
text-orange-600
text-purple-600

// ✅ After
text-amber-600 dark:text-amber-400
text-violet-600 dark:text-violet-400
```

---

## 🛠️ Quick Search & Replace (VS Code)

### Step 1: Find Custom Spinners
**Search** (Regex enabled):
```
animate-spin rounded-full.*border-b-2 border-(white|blue|primary)
```

**Replace with**:
1. Add import: `import { Loader2 } from 'lucide-react'`
2. Replace div: `Loader2 className="h-* w-* animate-spin"`

### Step 2: Batch Replace Common Patterns

```typescript
// Find: text-gray-900\b
// Replace: text-foreground

// Find: text-gray-600\b
// Replace: text-muted-foreground

// Find: text-gray-500\b
// Replace: text-muted-foreground/80

// Find: bg-gray-100\b
// Replace: bg-muted

// Find: bg-gray-200\b
// Replace: bg-muted

// Find: border-gray-200\b
// Replace: border-border

// Find: text-blue-600\b
// Replace: text-primary

// Find: bg-blue-600\b
// Replace: bg-primary

// Find: text-green-600\b
// Replace: text-emerald-600 dark:text-emerald-400

// Find: bg-green-100\b
// Replace: bg-emerald-100 dark:bg-emerald-950/20
```

**⚠️ Important**: Always review changes after batch replacement to ensure context is preserved!

---

## ✅ Verification Checklist

After refactoring each file:

- [ ] All `text-gray-*` replaced with semantic tokens
- [ ] All `bg-gray-*` replaced with semantic tokens
- [ ] All `border-gray-*` replaced with `border-border` or `border-muted`
- [ ] All `text-blue-*` replaced with `text-primary` or explicit colors
- [ ] All `text-green-*` replaced with `text-emerald-*` + dark mode
- [ ] All `text-red-*` replaced with `text-destructive`
- [ ] Custom spinners replaced with `<Loader2 className="..." />`
- [ ] Loader2 imported from 'lucide-react'
- [ ] Dark mode variants added for all non-semantic accent colors
- [ ] File saved and formatted with Prettier
- [ ] Visual testing in both light and dark mode

---

## 📊 Progress Tracking

Total Files: 21
- ✅ Completed: 5
- 🟡 In Progress: 0
- ⏳ Remaining: 16

**Estimated Time Remaining**: ~4-5 hours

---

## 🎨 Design Token Reference

```css
/* Semantic Colors (Auto Dark Mode) */
--background: Pure white → Pure black
--foreground: Near black → Off white
--primary: Twitter blue → Lighter blue
--muted: Light gray → Dark gray
--muted-foreground: Gray text → Light gray text
--border: Border gray → Border dark gray
--destructive: Red → Red (same)
--accent: Light blue-gray → Dark blue-gray

/* Explicit Colors (Need dark: variants) */
emerald-600 → emerald-400 (dark mode)
amber-600 → amber-400 (dark mode)
violet-600 → violet-400 (dark mode)

emerald-100 → emerald-950/20 (dark mode)
amber-100 → amber-950/20 (dark mode)
```

---

## 🚀 Final Steps

1. **Complete all 16 remaining files** using patterns above
2. **Run Prettier** on all modified files:
   ```bash
   npx prettier --write "src/**/*.tsx" "components/**/*.tsx"
   ```

3. **Visual Testing**:
   - Test all pages in light mode
   - Test all pages in dark mode
   - Check mobile responsiveness
   - Verify all modals/dialogs work correctly
   - Test all interactive states (hover, focus, active)

4. **Accessibility Testing**:
   - Verify keyboard navigation
   - Check screen reader announcements
   - Ensure proper ARIA labels
   - Test focus management in modals

5. **Create Git Commit**:
   ```bash
   git add .
   git commit -m "refactor(ui): migrate to design tokens and standardize loading states

   - Replace all hardcoded colors with semantic design tokens
   - Replace custom spinners with Loader2 component
   - Add comprehensive dark mode support
   - Improve accessibility with ARIA labels

   Modified files: 21
   Total changes: ~200+ color migrations

   🤖 Generated with Claude Code

   Co-Authored-By: Claude <noreply@anthropic.com>"
   ```

---

## 💡 Tips

1. **Work file-by-file** - Don't batch too many at once
2. **Test frequently** - Check your changes in the browser often
3. **Use Find/Replace carefully** - Review each change
4. **Keep the pattern** - Be consistent with the established patterns
5. **Dark mode is critical** - Always add `dark:` variants for accent colors
6. **Preserve functionality** - Don't change logic, only visual styling

---

## 📞 Need Help?

If you encounter issues:
1. Check this guide's patterns
2. Review the completed files as examples
3. Refer to `globals.css` for available design tokens
4. Check `tailwind.config.js` for extended colors

---

**Last Updated**: 2025-10-07
**Status**: Phase 1 Partially Complete (5/21 files)
**Next Priority**: Complete `src/app/(customer)/quotations/[id]/page.tsx`
