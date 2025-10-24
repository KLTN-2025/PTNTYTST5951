import Image from "next/image";
import React from "react";
import UserMenu from "./user-menu";

const AppHeader = () => {
  return (
    <div className="w-full flex flex-row justify-between items-center p-3 h-18">
      <Image
        width={500}
        height={130}
        className="h-full w-auto"
        src="/assests/images/logo-text-light.svg"
        alt="Logo"
      />
      <UserMenu />
    </div>
  );
};

export default AppHeader;
