import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { AuthWrapperClient } from "@/components/auth/AuthWrapperClient";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { APP_NAME, APP_DESCRIPTION } from "@/lib/constants";

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
        className="font-sans antialiased bg-background text-foreground"
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
