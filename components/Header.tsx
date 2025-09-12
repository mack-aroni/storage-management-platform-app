import React from "react";
import { Button } from "./ui/button";
import Image from "next/image";
import FileUploader from "./FileUploader";
import Search from "./Search";

const Header = () => {
  return (
    <header className="header">
      <Search />

      <div className="flex-center header-wrapper">
        <FileUploader />

        <form>
          <Button type="submit"
            className="flex-center h-[52px] min-w-[54px] items-center rounded-full bg-brand/10 p-0 text-brand shadow-none transition-all hover:bg-brand/20">
            <Image src="/assets/icons/logout.svg"
              alt="logo"
              width={24}
              height={24}
              className="w-6"/>    
          </Button>
        </form>
      </div>
    </header>
  );
};

export default Header;