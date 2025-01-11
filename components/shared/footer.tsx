"use client";
import { ChevronUp } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import useSettingStore from "@/hooks/use-setting-store";
import { Select, SelectContent, SelectItem, SelectTrigger } from "../ui/select";

import { SelectValue } from "@radix-ui/react-select";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing";
import { i18n } from "@/i18n-config";

export default function Footer() {
  const router = useRouter();
  const pathname = usePathname();
  const {
    setting: { site, availableCurrencies, currency },
    setCurrency,
  } = useSettingStore();
  const { locales } = i18n;

  const locale = useLocale();
  const t = useTranslations();
  return (
    <footer className="bg-[#05568C] text-white underline-link">
      <div className="w-full">
        <Button
          variant="ghost"
          className="bg-gray-800 w-full rounded-none"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          <ChevronUp className="mr-2 h-4 w-4" />
          {t("Footer.Back to top")}
        </Button>

        {/* Middle Row (Modified as per your design) */}
        <div className="container mx-auto px-6 grid grid-cols-1 mt-6 md:grid-cols-4 gap-8 border-b border-[#05568C] pb-10">
          {/* 1st Column */}
          <div>
            <Image
              src="/icons/logofooter.png"
              alt="HD PARTZ Logo - Premium Car Parts and Accessories"
              width={150}
              height={50}
              loading="lazy"
            />
            <h2 className="text-lg font-bold mt-4">WORLD OF AUTOMOTIVE</h2>
            <p className="text-sm mt-2">
              Your Trusted Car Parts Partner <br />
              Driven by passion for excellence, HD PARTZ provides premium car
              parts, accessories, and essentials to keep your vehicle running at
              its best. Quality you can trust, service you can rely on.
            </p>
          </div>

          {/* 2nd Column */}
          <div>
            <h2 className="text-lg font-bold">Need Help?</h2>
            <p className="text-sm mt-4">+971 502 487 319 </p>
            <p className="text-sm mt-2">
              Monday - Friday: 9:00-20:00 <br />
              Saturday: 11:00-15:00
            </p>
          </div>

          {/* 3rd Column */}
          <div>
            <h2 className="text-lg font-bold">Customer Service</h2>
            <ul className="text-sm mt-4 space-y-2">
              <li>
                <Link
                  href="/account"
                  className="hover:underline"
                  aria-label="Go to My Account"
                  rel="nofollow"
                >
                  My Account
                </Link>
              </li>
              <li>
                <Link
                  href="/track-products"
                  className="hover:underline"
                  aria-label="Track Your Products"
                  rel="nofollow"
                >
                  Track Products
                </Link>
              </li>
              <li>
                <Link
                  href="/orders"
                  className="hover:underline"
                  aria-label="View My Orders"
                  rel="nofollow"
                >
                  My Orders
                </Link>
              </li>
              <li>
                <Link
                  href="/wishlist"
                  className="hover:underline"
                  aria-label="View Your Wishlist"
                  rel="nofollow"
                >
                  Your Wishlist
                </Link>
              </li>
              <li>
                <Link
                  href="/return-policy"
                  className="hover:underline"
                  aria-label="Return Policy"
                  rel="nofollow"
                >
                  Return Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* 4th Column */}
          <div>
            <h2 className="text-lg font-bold"> Information</h2>
            <ul className="text-sm mt-4 space-y-2">
              <li>
                <Link
                  href="/AboutUs"
                  className="hover:underline"
                  aria-label="Learn About HD PARTZ"
                  rel="nofollow"
                >
                  About HD PARTZ
                </Link>
              </li>
              <li>
                <Link
                  href="/bestsellers"
                  className="hover:underline"
                  aria-label="Browse Bestsellers"
                  rel="nofollow"
                >
                  Bestsellers
                </Link>
              </li>
              <li>
                <Link
                  href="/latest-products"
                  className="hover:underline"
                  aria-label="Shop Latest Products"
                  rel="nofollow"
                >
                  Latest Products
                </Link>
              </li>
              <li>
                <Link
                  href="/discounts"
                  className="hover:underline"
                  aria-label="Check New Discounts"
                  rel="nofollow"
                >
                  New Discounts
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Additional Section (Select Language and Currency) */}
        <div className="border-t border-[#05568C]">
          <div className="max-w-7xl mx-auto py-8 px-4 flex flex-col items-center space-y-4">
            <div className="flex items-center space-x-4 flex-wrap md:flex-nowrap">
              <Image
                src="/icons/logofooter.png"
                alt={`${site.name} logo`}
                width={100}
                height={100}
                className="w-18"
                style={{
                  maxWidth: "100%",
                  height: "auto",
                }}
              />{" "}
              <Select
                value={locale}
                onValueChange={(value) => {
                  router.push(pathname, { locale: value });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("Footer.Select a language")} />
                </SelectTrigger>
                <SelectContent>
                  {locales.map((lang, index) => (
                    <SelectItem key={index} value={lang.code}>
                      <Link
                        className="w-full flex items-center gap-1"
                        href={pathname}
                        locale={lang.code}
                      >
                        <span className="text-lg">{lang.icon}</span> {lang.name}
                      </Link>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={currency}
                onValueChange={(value) => {
                  setCurrency(value);
                  window.scrollTo(0, 0);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("Footer.Select a currency")} />
                </SelectTrigger>
                <SelectContent>
                  {availableCurrencies
                    .filter((x) => x.code)
                    .map((currency, index) => (
                      <SelectItem key={index} value={currency.code}>
                        {currency.name} ({currency.code})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Last Row (Unchanged) */}
      <div className="p-4">
        <div className="flex justify-center gap-3 text-sm">
          <Link href="/page/conditions-of-use">
            {t("Footer.Conditions of Use")}
          </Link>
          <Link href="/page/privacy-policy">{t("Footer.Privacy Notice")}</Link>
          <Link href="/page/help">{t("Footer.Help")}</Link>
        </div>
        <div className="flex justify-center text-sm">
          <p> © {site.copyright}</p>
        </div>
        <div className="mt-8 flex justify-center text-sm text-gray-400">
          {site.address} | {site.phone}
        </div>
      </div>
    </footer>
  );
}
