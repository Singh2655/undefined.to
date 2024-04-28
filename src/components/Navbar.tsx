"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { User } from "next-auth";
import { Button } from "./ui/button";
import { redirect } from "next/navigation";

const Navbar = () => {
  const { data: session } = useSession();
  const user: User = session?.user as User;

  return (
    <nav className="bg-gray-800 text-white py-4 px-6">
      <div className="flex items-center justify-between">
          <a href="/" className="text-xl font-bold">Welcome to Undefined.to</a>
        {session ? (
          <div className="flex items-center space-x-4">
            <span className="hidden sm:inline-block">
              Welcome {user.username || user.email}
            </span>
            <Button onClick={() => signOut()}>Logout</Button>
          </div>
        ) : (
          <Link href="/sign-in">
            <Button className="w-full md:w-auto bg-slate-100 text-black" variant={'outline'}>Login</Button>
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
