"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3 mx-auto", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-between pt-1 items-center",
        caption_label: "text-tagline-1 font-medium flex-1 text-center text-secondary dark:text-accent",
        nav: "flex items-center gap-1",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-60 hover:opacity-100 transition-opacity"
        ),
        nav_button_previous: "",
        nav_button_next: "",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell:
          "text-secondary/60 dark:text-accent/60 rounded-md w-9 flex-shrink-0 font-normal text-tagline-3 text-center",
        row: "flex w-full mt-2",
        cell: "h-9 w-9 flex-shrink-0 text-center text-tagline-2 p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-primary-100 dark:[&:has([aria-selected].day-outside)]:bg-primary-500/20 [&:has([aria-selected])]:bg-primary-100 dark:[&:has([aria-selected])]:bg-primary-500/20 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-background-3 dark:hover:bg-background-7 hover:text-secondary dark:hover:text-accent rounded-md transition-colors",
        day_range_end: "day-range-end",
        day_selected:
          "bg-primary-500 text-white hover:bg-primary-600 hover:text-white focus:bg-primary-500 focus:text-white",
        day_today: "bg-background-3 dark:bg-background-7 text-secondary dark:text-accent font-medium",
        day_outside:
          "day-outside text-secondary/40 dark:text-accent/40 opacity-50 aria-selected:bg-primary-100 dark:aria-selected:bg-primary-500/20 aria-selected:text-secondary/60 dark:aria-selected:text-accent/60 aria-selected:opacity-30",
        day_disabled: "text-secondary/40 dark:text-accent/40 opacity-50",
        day_range_middle:
          "aria-selected:bg-primary-100 dark:aria-selected:bg-primary-500/20 aria-selected:text-secondary dark:aria-selected:text-accent",
        day_hidden: "invisible",
        ...classNames,
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }