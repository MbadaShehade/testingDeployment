import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "next-themes";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "HiveGuard - Protect Your Hive With IOT",
  description: "HiveGuard offers an innovative IoT-based monitoring system that prevents mold growth in beehives.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        {/* Add a style to hide content until theme is applied */}
        <style dangerouslySetInnerHTML={{ __html: `
          .theme-loading {
            visibility: hidden;
          }
          html {
            scroll-behavior: smooth;
            scroll-padding-top: 70px;
          }
          body {
            scroll-behavior: smooth;
          }
        `}} />
        {/* Script to prevent flash of unstyled content and handle page refresh */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  // Add theme-loading class to body instead of html
                  document.body.classList.add('theme-loading');
                  
                  // Remove theme-loading class after a short delay
                  setTimeout(function() {
                    document.body.classList.remove('theme-loading');
                  }, 50);

                  // Handle page refresh - always scroll to top
                  if (window.performance && window.performance.navigation.type === window.performance.navigation.TYPE_RELOAD) {
                    window.scrollTo(0, 0);
                  }
                } catch (e) {
                  console.error('Error in theme script:', e);
                }
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}