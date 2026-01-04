"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background-1 dark:group-[.toaster]:bg-background-6 group-[.toaster]:text-secondary dark:group-[.toaster]:text-accent group-[.toaster]:border-stroke-3 dark:group-[.toaster]:border-stroke-7 group-[.toaster]:shadow-lg group-[.toaster]:rounded-2xl",
          description: "group-[.toast]:text-secondary/60 dark:group-[.toast]:text-accent/60",
          actionButton:
            "group-[.toast]:bg-primary-500 group-[.toast]:text-white group-[.toast]:rounded-full group-[.toast]:px-4 group-[.toast]:hover:bg-primary-600",
          cancelButton:
            "group-[.toast]:bg-background-3 dark:group-[.toast]:bg-background-7 group-[.toast]:text-secondary dark:group-[.toast]:text-accent group-[.toast]:rounded-full group-[.toast]:px-4",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
