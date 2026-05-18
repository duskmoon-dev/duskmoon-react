import type { Metadata } from "next";
import { ThemeProvider } from "@duskmoon-dev/components/theme";

export const metadata: Metadata = {
  title: "Next.js 15 Smoke Test",
  description: "Testing duskmoon-react in RSC environment",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
