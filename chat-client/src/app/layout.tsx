import "@/styles/globals.css";
import "@/styles/fonts.css";
import { Providers } from "./providers";
import { Toaster } from "@/components/ui/toaster";
import Script from "next/script";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <Script
          src="/assets/lang-config.js"
          strategy="beforeInteractive"
        ></Script>
        <Script
          src="/assets/translation.js"
          strategy="beforeInteractive"
        ></Script>
        <Script
          src="//translate.google.com/translate_a/element.js?cb=TranslateInit"
          strategy="afterInteractive"
        ></Script>
      </head>
      <body>
        <div id="google_translate_element" style={{ display: "none" }}></div>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
