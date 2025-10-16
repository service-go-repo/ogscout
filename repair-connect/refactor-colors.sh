#!/bin/bash

# UI/UX Refactoring Script - Repair Connect
# Automates color token migration for remaining files

echo "🎨 Starting UI/UX Refactoring..."
echo "================================"

# Define files to process
FILES=(
  "components/appointments/appointment-settings.tsx"
  "src/app/(customer)/workshops/[id]/page.tsx"
  "src/app/(customer)/quotations/page.tsx"
  "components/auth/LoginForm.tsx"
  "components/appointments/appointment-detail.tsx"
  "components/appointments/appointment-list.tsx"
  "components/appointments/pending-appointments.tsx"
  "components/appointments/customer-appointments.tsx"
  "components/appointments/appointment-dashboard.tsx"
  "components/appointments/appointment-review.tsx"
  "components/completed-jobs/customer-completed-jobs.tsx"
  "components/completed-jobs/workshop-completed-jobs.tsx"
  "components/workshop/active-jobs.tsx"
  "components/workshop/customer-management.tsx"
  "components/workshops/workshop-profile.tsx"
  "src/app/(workshop)/profile/page.tsx"
  "src/app/(workshop)/quotes/page.tsx"
  "src/app/(workshop)/quotes/[id]/page.tsx"
)

# Backup function
backup_file() {
  local file=$1
  cp "$file" "$file.backup-$(date +%Y%m%d-%H%M%S)"
}

# Process each file
for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "Processing: $file"

    # Backup
    backup_file "$file"

    # Grayscale colors
    sed -i 's/text-gray-900\b/text-foreground/g' "$file"
    sed -i 's/text-gray-800\b/text-foreground/g' "$file"
    sed -i 's/text-gray-700\b/text-foreground/g' "$file"
    sed -i 's/text-gray-600\b/text-muted-foreground/g' "$file"
    sed -i 's/text-gray-500\b/text-muted-foreground\/80/g' "$file"
    sed -i 's/text-gray-400\b/text-muted-foreground/g' "$file"
    sed -i 's/text-gray-300\b/text-muted-foreground\/30/g' "$file"

    sed -i 's/bg-gray-100\b/bg-muted/g' "$file"
    sed -i 's/bg-gray-200\b/bg-muted/g' "$file"
    sed -i 's/bg-gray-50\b/bg-muted\/50/g' "$file"

    sed -i 's/border-gray-200\b/border-border/g' "$file"
    sed -i 's/border-gray-300\b/border-border/g' "$file"

    # Blue colors (primary)
    sed -i 's/text-blue-600\b/text-primary/g' "$file"
    sed -i 's/bg-blue-600\b/bg-primary/g' "$file"
    sed -i 's/border-blue-500\b/border-primary/g' "$file"
    sed -i 's/ring-blue-500\b/ring-primary/g' "$file"

    # Green colors (success) - need manual dark mode check
    sed -i 's/text-green-600\b/text-emerald-600 dark:text-emerald-400/g' "$file"
    sed -i 's/bg-green-100\b/bg-emerald-100 dark:bg-emerald-950\/20/g' "$file"
    sed -i 's/text-green-800\b/text-emerald-800 dark:text-emerald-200/g' "$file"
    sed -i 's/border-green-200\b/border-emerald-200 dark:border-emerald-800/g' "$file"
    sed -i 's/bg-green-50\b/bg-emerald-50 dark:bg-emerald-950\/20/g' "$file"

    # Red colors (destructive)
    sed -i 's/text-red-600\b/text-destructive/g' "$file"
    sed -i 's/bg-red-100\b/bg-destructive\/10/g' "$file"
    sed -i 's/text-red-800\b/text-destructive/g' "$file"
    sed -i 's/border-red-200\b/border-destructive\/20/g' "$file"
    sed -i 's/bg-red-50\b/bg-destructive\/10/g' "$file"

    # Yellow colors (warning)
    sed -i 's/text-yellow-600\b/text-amber-600 dark:text-amber-400/g' "$file"
    sed -i 's/bg-yellow-100\b/bg-amber-100 dark:bg-amber-950\/20/g' "$file"
    sed -i 's/text-yellow-800\b/text-amber-800 dark:text-amber-200/g' "$file"

    # Orange colors
    sed -i 's/text-orange-600\b/text-amber-600 dark:text-amber-400/g' "$file"

    # Purple colors
    sed -i 's/text-purple-600\b/text-violet-600 dark:text-violet-400/g' "$file"

    echo "✅ Completed: $file"
  else
    echo "⚠️  Not found: $file"
  fi
done

echo ""
echo "================================"
echo "🎉 Refactoring complete!"
echo "Run: npx prettier --write \"**/*.tsx\" to format files"
