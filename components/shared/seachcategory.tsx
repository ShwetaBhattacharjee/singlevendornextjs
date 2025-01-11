"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Head from "next/head";

export default function SearchBoxCategory() {
  const router = useRouter();

  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [carNo, setCarNo] = useState("");

  const products = [
    { brand: "Power StopR", model: "Evolution Drilled and Slotted" },
    { brand: "R1 Concepts®", model: "eLINE Series Plain Brake Rotors" },
    { brand: "Right Stuff®", model: "Drilled and Slotted Brake Rotor" },
    { brand: "Technaxx", model: "Car Alarm with Charging Function" },
    { brand: "Thinkware", model: "F770 Dash Cam Dual Channel Wifi" },
  ];

  const uniqueBrands = Array.from(
    new Set(products.map((product) => product.brand))
  );

  const handleSearch = () => {
    let searchParams = `/search`;

    if (brand) searchParams += `/${encodeURIComponent(brand)}`;
    if (model) searchParams += `/${encodeURIComponent(model)}`;
    if (carNo) searchParams += `/${encodeURIComponent(carNo)}`;

    router.push(searchParams);
  };

  return (
    <>
      <Head>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div
        className="relative flex flex-col items-center justify-center text-white p-6 sm:p-8 rounded-md shadow-lg mb-4 animate__animated animate__fadeIn lg:max-w-[40%]"
        style={{
          backgroundImage: "url('/searchcategory.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          width: "90%",
          margin: "20px auto",
          height: "auto",
          minHeight: "200px",
        }}
      >
        <div
          className="absolute inset-0 bg-black opacity-10 rounded-md"
          style={{ zIndex: 1 }}
        ></div>

        <div className="relative z-10 w-full text-center">
          <h2 className="text-white text-sm sm:text-base font-bold mb-2">
            Find the Right Parts Faster
          </h2>
          <p className="text-white text-xs sm:text-sm mb-3">
            Having the right automotive parts and car accessories will help you
            boost your travel comfort and go on the long-distance journey
            comfortably that you have been planning.
          </p>

          <div className="grid grid-cols-3 gap-2 w-auto mx-auto mb-4">
            {/* Brand Dropdown */}
            <select
              className="px-3 py-2 border border-white bg-transparent text-white rounded-md focus:outline-none focus:ring-2 focus:ring-white text-xs sm:text-sm"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
            >
              <option value="" className="text-white">
                Select Brand
              </option>
              {uniqueBrands.map((brandOption, index) => (
                <option key={index} value={brandOption} className="text-black">
                  {brandOption}
                </option>
              ))}
            </select>

            {/* Model Dropdown */}
            <select
              className="px-3 py-2 border border-white bg-transparent text-white rounded-md focus:outline-none focus:ring-2 focus:ring-white text-xs sm:text-sm"
              value={model}
              onChange={(e) => setModel(e.target.value)}
            >
              <option value="" className="text-white">
                Select Model
              </option>
              {products
                .filter((product) => product.brand === brand)
                .map((product, index) => (
                  <option
                    key={index}
                    value={product.model}
                    className="text-black"
                  >
                    {product.model}
                  </option>
                ))}
            </select>

            {/* Car Number Input */}
            <input
              type="text"
              placeholder="Enter Parts Number"
              value={carNo}
              onChange={(e) => setCarNo(e.target.value)}
              className="px-3 py-2 border border-white bg-transparent text-white rounded-md focus:outline-none focus:ring-2 focus:ring-white text-xs sm:text-sm"
            />
          </div>

          {/* Button Row */}
          <div className="flex justify-center sm:w-half lg:w-full">
            <button
              onClick={handleSearch}
              className="px-6 py-3 border border-white text-white rounded-md bg-transparent hover:bg-white hover:text-[#05568C] transition text-xs sm:text-sm"
            >
              Find Auto Parts
            </button>
          </div>

          <p className="text-white text-xs sm:text-sm mt-2 text-center">
            Please fill in the criteria you are looking for
          </p>
        </div>
      </div>
    </>
  );
}
