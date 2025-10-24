import React from "react";
import Image from "next/image";

const BrandHeader = () => {
  return (
    <div className={`mx-auto flex flex-row mt-2`}>
      <Image
        width={500}
        height={500}
        className="w-8"
        src="/assets/images/logo-only.svg"
        alt="Logo"
      />
      <span className="pl-2 whitespace-nowrap font-bold text-foreground">
        Beetamin
      </span>
    </div>
  );
};

export default BrandHeader;
