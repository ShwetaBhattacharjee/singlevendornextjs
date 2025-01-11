"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";

type CategoryItem = {
  name: string;
  image: string;
  href: string;
};

type CategoriesCardProps = {
  categories: CategoryItem[];
};

export default function CategoriesCard({ categories }: CategoriesCardProps) {
  if (categories.length === 0) {
    return <p className="text-body-bold">No categories found</p>;
  }

  return (
    <div className="md:p-10 p-5">
      {/* Grid layout for 3 items per row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 m-10">
        {categories.map((category) => (
          <div
            key={category.name}
            className="group border border-gray-300 rounded-lg shadow-md p-4 h-full"
          >
            <div className="flex gap-6 h-full">
              {/* Left Side: Image */}
              <div className="flex-shrink-0 w-1/3 p-2 flex justify-center items-center border border-gray-300 rounded-lg overflow-hidden h-full">
                <img
                  src={category.image} // Using the image field directly
                  alt={`Image of ${category.name}`}
                  className="object-cover w-full h-full transition-transform duration-300 ease-in-out group-hover:scale-110"
                />
              </div>

              {/* Right Side: Title and Arrow */}
              <div className="flex flex-col justify-between w-2/3 h-full">
                {/* Category Name */}
                <h2 className="text-xl font-semibold text-[#05568C] mb-2">
                  {category.name}
                </h2>

                {/* Link to Category */}
                <div className="flex items-center gap-1 text-sm font-medium text-[#05568C]">
                  <Link href={category.href}>
                    <p className="flex items-center cursor-pointer">
                      Explore {category.name} <ArrowRight size={18} />
                    </p>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
