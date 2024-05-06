// "use client";

// import { useSession, signOut } from "next-auth/react";
// import Link from "next/link";
// import { User } from "next-auth";
// import { Button } from "./ui/button";
// import { redirect } from "next/navigation";
// import { Skeleton } from "./ui/skeleton";
// import { Suspense } from "react";

// const Navbar = () => {
//   const { data: session } = useSession();
//   const user: User = session?.user as User;

//   return (
//     <nav className="bg-gray-800 text-white py-4 px-6">
//       <div className="flex items-center justify-between">
//           <a href="/" className="text-xl font-bold">Welcome to Undefined.to</a>
//         {session ? (
//           <div className="flex items-center space-x-4">
//             <span className="hidden sm:inline-block">
//               Welcome {user.username || user.email}
//             </span>
//             <Button onClick={() => signOut()}>Logout</Button>
//           </div>
//         ) : (
//           <Link href="/sign-in">
//             <Button className="w-full md:w-auto bg-slate-100 text-black" variant={'outline'}>Login</Button>
//           </Link>
//         )}
//       </div>
//     </nav>
//   );
// };

// export default Navbar;

"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { User } from "next-auth";
import { Button } from "./ui/button";
import { redirect, useRouter } from "next/navigation";
import { Skeleton } from "./ui/skeleton";
import { Suspense, useEffect, useState } from "react";
import Searchbar from "./Searchbar";

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Cross, Menu, X } from "lucide-react";
import axios, { AxiosError } from "axios";
import { ApiResponse } from "@/types/ApiResponse";
import { useToast } from "./ui/use-toast";
import { cn } from "@/lib/utils";

const Navbar = () => {
  const { data: session, status } = useSession();
  const user: User = session?.user as User;
  const router = useRouter();
  //console.log(user)
  // Skeleton for loading state
  const { toast } = useToast();
  const [followedUser, setFollowedUser] = useState([]);
  useEffect(() => {
    if (session) {
      const fetchFollowing = async () => {
        try {
          const response = await axios.get("/api/get-following");
          //console.log("followedUser response",response.data)
          setFollowedUser(response.data.followedUser);
        } catch (error) {
          const axiosError = error as AxiosError<ApiResponse>;
          toast({
            title: "Failed",
            description: axiosError.message || "Failed to fetch following list",
            variant: "destructive",
          });
        }
      };
      fetchFollowing();
    }
  }, [session]);
  const handleFollowList = (value: string) => {
    router.replace(`/u/${value}`);
  };
  const skeletonContent = <Skeleton className="h-10 w-[70px] opacity-50" />;
  return (
    <nav className="bg-gray-800 text-white py-4 px-6">
      <div className="flex items-center justify-between flex-wrap">
        <Sheet key="left">
          <SheetTrigger asChild>
            <Menu className="cursor-pointer" />
          </SheetTrigger>
          <SheetContent
            side="left"
            className="bg-white border border-gray-300 rounded-md shadow-lg p-4"
          >
            <SheetHeader className="mb-4">
              <SheetTitle className="text-lg font-bold">Following</SheetTitle>
            </SheetHeader>
            {followedUser && followedUser.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {followedUser.map((value, idx) => (
                  <li
                    onMouseDown={() => handleFollowList(value)}
                    key={idx}
                    className="py-2 cursor-pointer"
                  >
                    <span className="text-gray-700">{value}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-gray-500">Your following list is empty</div>
            )}
          </SheetContent>
        </Sheet>

        <a href="/" className="text-xl font-bold mr-4">
          Welcome to Undefined.to
        </a>

        <Searchbar />

        <div className="flex items-center space-x-4">
          {status === "loading" ? (
            skeletonContent
          ) : session ? (
            <span className="hidden sm:inline-block">
              Welcome {user.username || user.email}
            </span>
          ) : (
            <Link href="/sign-in">
              <Button
                className="w-full md:w-auto bg-slate-100 text-black"
                variant={"outline"}
              >
                Login
              </Button>
            </Link>
          )}
          {session && <Button onClick={() => signOut()}>Logout</Button>}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
