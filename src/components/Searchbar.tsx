"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { useDebounceValue, useDebounceCallback } from "usehooks-ts";
import axios, { AxiosError } from "axios";
import { ApiResponse } from "@/types/ApiResponse";
import { useToast } from "./ui/use-toast";
import { Input } from "./ui/input";
import { useOnClickOutside } from "@/hooks/use-on-click-outside";
import { useRouter } from "next/navigation";

interface User {
  username: string;
}

const Searchbar = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [startsWith, setStartsWith] = useState("");
  const router = useRouter();
  const [name, setName] = useState("");
  const { toast } = useToast();
  const debounced = useDebounceCallback(setStartsWith, 300);
  const commandRef = useRef<HTMLDivElement>(null);
  useOnClickOutside(commandRef, () => {
    setName("");
    setUsers([]);
  });

  useEffect(() => {
    if ((startsWith?.length ?? 0) > 0) {
      try {
        //console.log("hello1")
        const findAllUsers = async () => {
          const response = await axios.get(
            `/api/search-users?startsWith=${startsWith}`
          );
          console.log("this is response of allUsers",response.data.allUser)
          setUsers(response.data.allUser);
          //console.log("users",users)
        };

        findAllUsers();
        //console.log("hello2")
      } catch (error) {
        const axiosError = error as AxiosError<ApiResponse>;
        //console.log("error searching users...",error)
        toast({
          title: "Failed",
          description:
            axiosError.response?.data.message ?? "Something went wrong",
        });
      }
    }
  }, [startsWith]);
  return (
    <Command
      className="relative rounded-lg w-[200px] md:max-w-lg z-50 overflow-visible md:mb-0"
      ref={commandRef}
    >
      <Input
        className="outline-none border-none focus:border-none focus:outline-none ring-0 "
        value={name}
        onChange={(e) => {
          setName(e.target.value);
          debounced(e.target.value);
        }}
        placeholder="search users..."
      />
      {(users.length ?? 0) > 0 ? (
        <CommandList className="absolute bg-white top-full inset-x-0 rounded-b-md shadow border border-gray-200">
          {users.length === 0 && <CommandEmpty>No results found.</CommandEmpty>}
          <CommandGroup heading="users">
            {users.map((user, idx) => (
              <CommandItem key={idx} className="cursor-pointer">
                <a href={`/u/${user.username}`}>{user.username}</a>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      ) : null}
    </Command>
  );
};

export default Searchbar;
