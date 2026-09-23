import { Playfair_Display, Poppins, Caveat } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-poppins",
  display: "swap",
});

const caveat = Caveat({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-caveat",
  display: "swap",
});

export const metadata = {
  title: "Web Latihan Nulis — Tulis • Pikir • Tumbuh",
  description:
    "Jurnal dan latihan menulis harian digital dengan prompt terpilih, timer terarah, dan pencatatan riwayat terpadu.",
  icons: {
    icon: "/icon.png",
    shortcut: "/favicon.ico",
    apple: "/icon.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="id"
      className={`${playfair.variable} ${poppins.variable} ${caveat.variable}`}
    >
      <body className="font-sans antialiased min-h-screen text-palette-deep bg-[#F7FAF9] selection:bg-palette-sky/40 selection:text-palette-deep">
        {children}
      </body>
    </html>
  );
}
