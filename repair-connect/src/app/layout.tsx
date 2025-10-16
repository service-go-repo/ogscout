import type { Metadata } from "next";
import { DM_Sans, Space_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { AuthWrapperClient } from "@/components/auth/AuthWrapperClient";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { APP_NAME, APP_DESCRIPTION } from "@/lib/constants";

// Neobrutalism theme fonts
const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-sans",
  display: "swap",
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: APP_NAME,
    template: `%s | ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  keywords: ["car repair", "auto repair", "mechanic", "quotes", "vehicle maintenance"],
  authors: [{ name: "Repair Connect Team" }],
  creator: "Repair Connect",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${dmSans.variable} ${spaceMono.variable} font-sans antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <div className="min-h-screen flex flex-col">
            <AuthProvider>
              <AuthWrapperClient>
                <Header />
                <main className="flex-1">{children}</main>
                <Footer />
                <Toaster />
              </AuthWrapperClient>
            </AuthProvider>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
