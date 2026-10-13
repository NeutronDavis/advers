import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "Advers | Full-Service Brand Visibility & Marketing Partner",
  description:
    "Advers builds your brand identity, launches high-speed custom websites, and puts your business on prime digital LED billboards across Nigeria.",
  icons: {
    icon: [
      { url: "/icon.png", type: "image/png" },
      { url: "/logo.png", type: "image/png" },
    ],
    shortcut: "/icon.png",
    apple: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="light" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <Script
          id="advers-theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('advers-theme') || 'light';
                  document.documentElement.setAttribute('data-theme', saved);
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body
        suppressHydrationWarning
        className="antialiased min-h-screen flex flex-col bg-base-100 text-base-content selection:bg-primary/20 selection:text-primary transition-colors duration-300"
      >
        {children}
      </body>
    </html>
  );
}
