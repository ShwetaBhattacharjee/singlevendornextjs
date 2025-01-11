import React from "react";

const SuperDiscount = () => {
  return (
    <div className="flex justify-center items-center py-4">
      <div
        className="border-2 border-red-500 bg-red-100 text-red-600 p-4 rounded-lg text-center w-full"
        style={{ maxWidth: "80%" }} 
      >
        <span className="font-semibold">
          Super Discount on your first purchase
        </span>
        , use code:{" "}
        <button className="bg-red-500 text-white px-4 py-1 rounded-lg ml-2">
          WELCOME20
        </button>
        .
        <span className="text-sm ml-2">Use the discount code at checkout.</span>
      </div>
    </div>
  );
};

export default SuperDiscount;
