import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { ThemeProvider } from "@/components/theme-provider";
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import "./globals.css";

// Swiss Design Standard - Inter Font Family
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

// Import theme from centralized configuration
import theme from "@/theme";

export const metadata: Metadata = {
  title: "PMIX - Marketing Automation Platform",
  description: "Enterprise marketing automation dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body
        style={{ minHeight: '100vh' }}
        // Browser extensions can inject attributes before React hydrates this element.
        suppressHydrationWarning
      >
        <ThemeProvider>
          <MantineProvider theme={theme} defaultColorScheme="light">
            {children}
            <Notifications position="bottom-right" />
          </MantineProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
