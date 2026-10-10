import "./globals.css";
import { AuthProvider } from "../context/AuthContext";

export const metadata = {
  title: "Inkly — An Intimate Bilingual Writing Sanctuary",
  description:
    "Write freely, keep your thoughts close, and learn to express yourself gently in Indonesian and English every day with your mindful AI writing tutor.",
  icons: {
    icon: "/icon.png?v=2",
    shortcut: "/icon.png?v=2",
    apple: "/icon.png?v=2",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=La+Belle+Aurore&family=Sacramento&family=Nanum+Pen+Script&family=Newsreader:ital,opsz,wght@0,6..72,200..700;1,6..72,200..700&family=Plus+Jakarta+Sans:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col font-sans antialiased text-ink-deep bg-paper selection:bg-rose-soft selection:text-rose-deep">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
