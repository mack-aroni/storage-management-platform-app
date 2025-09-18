import React from "react";
import { redirect } from "next/navigation";
import Header from "@/components/Header";
import MobileNav from "@/components/MobileNav";
import Sidebar from "@/components/Sidebar";
import { getCurrentUser } from "@/lib/actions/user.actions";

export const dynamic = "force-dynamic";

const Layout = async ({children}: {children: React.ReactNode}) => {
  const currentUser = await getCurrentUser();

  if (!currentUser) return redirect("/sign-in");

  return(
    <main className="flex h-screen">
      <Sidebar {...currentUser}/>

      <section className="flex h-full flex-1 flex-col">
        <MobileNav {...currentUser}/> 

        <Header userID={currentUser.$id} accountID={currentUser.accountID}/>

        <div className="remove-scrollbar h-full flex-1 overflow-auto bg-light-400 px-5 py-7 sm:mr-7 sm:rounded-[30px] md:mb-7 md:px-9 md:py-10;">
          {children}
        </div>
      </section>
    </main>
  );
};

export default Layout;