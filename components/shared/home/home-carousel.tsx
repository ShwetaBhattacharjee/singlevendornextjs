"use client";

import * as React from "react";
import Image from "next/image";
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { ICarousel } from "@/types";

export function HomeCarousel({ items }: { items: ICarousel[] }) {
  const plugin = React.useRef(
    Autoplay({ delay: 3000, stopOnInteraction: true })
  );

  const t = useTranslations("Home");

  return (
    <Carousel
      dir="ltr"
      plugins={[plugin.current]}
      className="w-full mx-auto"
      onMouseEnter={plugin.current.stop}
      onMouseLeave={plugin.current.reset}
    >
      <CarouselContent>
        {items.map((item) => (
          <CarouselItem key={item.title}>
            <Link href={item.url}>
              <div className="flex aspect-[16/5] items-center justify-center relative">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover"
                  priority
                />
                {/* Centered Content */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center text-center z-10 px-4">
                  {/* Unleash Button */}
                  <Button className="bg-[#05568C] text-white px-6 rounded-full text-sm mb-4 hover:bg-[#04466D] transition">
                    {t("Unleash the Power of Your Ride")}
                  </Button>
                  <h2
                    className={cn(
                      "text-white text-lg sm:text-4xl font-bold mb-3 max-w-3xl"
                    )}
                  >
                    {t(`${item.title}`)}
                  </h2>
                  {/* Static Description */}
                  <p className="text-white text-sm sm:text-lg leading-tight mb-3">
                    {t(
                      "Explore a vast selection of high-quality car parts, accessories, and upgrades for every make and model"
                    )}
                  </p>

                  {/* Shop Now Button */}
                  <Button className="mt-10 bg-[#05568C] text-white px-6 rounded-full text-sm hover:bg-[#04466D] transition">
                    {t(`${item.buttonCaption}`)}
                  </Button>
                </div>
              </div>
            </Link>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="left-0 md:left-12" />
      <CarouselNext className="right-0 md:right-12" />
    </Carousel>
  );
}
