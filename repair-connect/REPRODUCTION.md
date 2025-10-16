# Theme Colors Bug - Reproduction & Verification

## Quick Reproduction

### Before Fix (reproduce bug):
```bash
git stash  # temporarily remove fix
npm install
npm run dev
```
Navigate to http://localhost:3000 — observe NO theme colors (everything black/white/transparent)

### After Fix (verify solution):
```bash
git stash pop  # reapply fix
npm run dev
```
Navigate to http://localhost:3000 — observe theme colors working (purple/blue brand color visible)

---

## Exact Commands

### Package Manager
Detected: **npm** (package-lock.json present)

### Dev Server
```bash
npm run dev
```
Server starts at: http://localhost:3000

### Build (for production verification)
```bash
npm run build
npm start
```

### Run Tests
```bash
npm run test:e2e -- e2e/theme-colors.spec.ts
```

---

## Visual Verification Checklist

After applying fix, visit http://localhost:3000 and verify:

- [ ] Header logo badge shows **blue background** (`rgb(70, 58, 203)`)
- [ ] "Request Quote" button (top right) is **blue with white text**
- [ ] Hero heading "Trusted Professionals" text is **blue**
- [ ] Notification badge shows **red background with white count (3)**
- [ ] Footer links have **hover states** (not just black)
- [ ] All buttons and interactive elements show **brand colors**

---

## Files Changed

### Core Fix (2 files):
1. **tailwind.config.js** - Remove `--color-` prefix from CSS variable references
2. **src/app/globals.css** - Add missing CSS variables (`--success`, `--warning`, `--info`, radius variants)

### Tests Added (1 file + snapshots):
3. **e2e/theme-colors.spec.ts** - Automated theme color verification (30 tests across 5 browsers)
4. **e2e/theme-colors.spec.ts-snapshots/** - Visual regression baselines

### Documentation (2 files):
5. **THEME_COLOR_FIX.md** - Complete root cause analysis and fix explanation
6. **REPRODUCTION.md** - This file

---

## One-Command Verification

```bash
npm install && npm run dev && npm run test:e2e -- e2e/theme-colors.spec.ts
```

**Expected outcome**:
- Dev server starts successfully
- All 30 Playwright tests pass
- Page at localhost:3000 shows correct theme colors
