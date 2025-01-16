import { Roboto, Roboto_Mono } from "next/font/google";
import "../globals.css";
import ClientProviders from "@/components/shared/client-providers";
import { getDirection } from "@/i18n-config";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { notFound } from "next/navigation";
import { getSetting } from "@/lib/actions/setting.actions";
import { cookies } from "next/headers";

// Importing fonts
const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "700"],
});

const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["latin"],
  display: "swap",
});

export async function generateMetadata() {
  const {
    site: { slogan, name, description, url },
  } = await getSetting();

  // Ensure the image paths and metadata are correct for social media sharing
  return {
    title: {
      template: `%s | ${name}`,
      default: `${name}. ${slogan}`,
    },
    description: description,
    metadataBase: new URL(url),
    icons: {
      icon: "/icons/logo.jpg", // Path to the logo image in your public folder (favicon)
    },
    openGraph: {
      title: name,
      description: description,
      url: url,
      images: [
        {
          url: "/icons/logo.png", // Path to the logo image for OpenGraph
          width: 1200,
          height: 630,
          alt: `${name} logo`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: name,
      description: description,
      images: ["/icons/logo.png"], // Path to the logo image for Twitter card
    },
  };
}

export default async function AppLayout({
  params,
  children,
}: {
  params: { locale: string };
  children: React.ReactNode;
}) {
  const setting = await getSetting();
  const currencyCookie = (await cookies()).get("currency");
  const currency = currencyCookie ? currencyCookie.value : "USD";

  const { locale } = await params;

  if (!routing.locales.includes(locale as string)) {
    notFound();
  }
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      dir={getDirection(locale) === "rtl" ? "rtl" : "ltr"}
      suppressHydrationWarning
    >
      <body
        className={`min-h-screen ${roboto.variable} ${robotoMono.variable} antialiased`}
      >
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ClientProviders setting={{ ...setting, currency }}>
            {children}
          </ClientProviders>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
