import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ESG Controversy Signal Map | Real Rails Intelligence",
  description: "Production-grade governance and trust intelligence system tracking corporate ESG controversy signals globally.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full bg-background antialiased dark">
      <body className="min-h-full bg-background text-foreground font-sans">
        {children}
      </body>
    </html>
  );
}
