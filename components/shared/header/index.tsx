// components/Header.js
import Image from "next/image";
import Link from "next/link";
import { getAllCategories } from "@/lib/actions/product.actions";
import Menu from "./menu";
import Search from "./search";
import data from "@/lib/data";
import Sidebar from "./sidebar";
import { getSetting } from "@/lib/actions/setting.actions";
import { getTranslations } from "next-intl/server";
import CountdownTimer from "./CountdownTimer"; // Import the CountdownTimer component

export default async function Header() {
  const categories = await getAllCategories();
  const { site } = await getSetting();
  const t = await getTranslations();
  return (
    <header className="bg-white text-black">
      {/* Countdown timer section */}
      <div className="bg-gradient-to-r from-red-600 via-red-400 to-orange-400 text-white py-2">
        <div className="container mx-auto text-center">
          <p className="mb-0 mt-0">
            May Edition Black Friday! <strong>35% Off Spare Parts</strong> |
            Free carbon neutral shipping on orders AED 400+ | End of Time:{" "}
            <CountdownTimer /> {/* Add the CountdownTimer component */}
          </p>
        </div>
      </div>
      <div className="px-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link
              href="/"
              className="flex items-center header-button font-extrabold text-2xl m-1 "
            >
              <Image
                src={site.logo}
                width={100}
                height={100}
                alt={`${site.name} logo`}
              />
            </Link>
          </div>

          <div className="hidden md:block flex-1 max-w-xl">
            <Search />
          </div>
          <Menu />
        </div>
        <div className="md:hidden block py-2">
          <Search />
        </div>
      </div>

      <div className="flex items-center px-3 mb-[1px] bg-gray-200">
        <Sidebar categories={categories} />
        <div className="flex items-center flex-wrap gap-3 overflow-hidden max-h-[42px]">
          {/* Menu links rendered first */}
          {data.headerMenus.map((menu) => (
            <Link
              href={menu.href}
              key={menu.href}
              className="header-button !p-2"
            >
              {t("Header." + menu.name)}
            </Link>
          ))}

          {/* Dynamically generated category links with the search format */}
          {categories.map((category) => (
            <Link
              href={`/search?category=${encodeURIComponent(category)}`} // Encode category for special characters
              key={category}
              className="header-button !p-2"
            >
              {t("Header." + category)}
              {/* This displays the category name */}
            </Link>
          ))}
        </div>

        {/* Contact information on the right side */}
        <div className="flex items-center gap-4 ml-auto">
          <span className="hidden md:block">
            Need help? Call us:{" "}
            <a
              href="tel:+971502487319"
              className="text-blue-600 hover:underline"
            >
              +971 502 487 319
            </a>{" "}
          </span>
        </div>
      </div>
    </header>
  );
}
