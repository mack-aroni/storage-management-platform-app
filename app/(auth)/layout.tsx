import React from "react";
import Image from "next/image";

const Layout = ({children}: {children: React.ReactNode}) => {
  return(
    <div className="flex min-h-screen">
      {/* Logo Container (hidden on mobile) */}
      <section className="bg-brand-100 p-10 w-1/2 items-center justify-center md:flex lg:flex xl:w-2/5 hidden">
        <div className="flex max-h-[800px] max-w-[430] flex-col justify-center space-y-12">
          <Image src="/assets/icons/logo-full.svg"
            alt="logo"
            width ={224}
            height= {82}
            className="h-auto"
          />

          <div className="space-y-5 text-white text-center">
            <h1 className="h1 flex flex-col items-center">
              <span>Storage</span>
              <span>Management</span>
              <span>Platform</span>
            </h1>
            <p className="body-1">
              Upload yout files and share with others.
            </p>
          </div>

          <Image src="/assets/images/files.gif"
            alt="files"
            width={300}
            height={300}
            className="transition-all hover:rotate-5 hover:scale-110"
            />
        </div>
      </section>

      {/* Auth Form Container */}
      <section className="flex flex-1 flex-col items-center bg-white p-4 py-10 lg:justify-center lg:p-10 lg:py-0">
        <div className="mb-16 md:hidden">
          <Image src="/assets/icons/logo-full-brand.svg"
            alt="logo"
            width={224}
            height={82}
            className="h-auto w-[200px] lg:w-[250px]"
          />
        </div>
        
        {children}
      </section>
    </div>
  )
}

export default Layout;