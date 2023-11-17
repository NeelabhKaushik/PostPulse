"use client";

import { useOnClickOutside } from "@/hooks/use-on-click-outside";
import { Prisma, Subgroup, User } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import debounce from "lodash.debounce";
import { Users } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./ui/command";

const SearchBar = () => {
  const router = useRouter();
  const [input, setInput] = useState<string>("");

  const { data: queryResults, refetch, isFetched } = useQuery({
    queryFn: async () => {
      if (!input) return [];
      const { data } = await axios.get(`/api/search?q=${input}`);
      return data as (Subgroup & {
        _count: Prisma.SubgroupCountOutputType;
      })[];
    },
    queryKey: ["search-query"],
    enabled: false,
  });

  const {
    data: userResults = [], // Set a default value to handle initial undefined state
    refetch: refetched,
    isFetched: userIsFetched,
  } = useQuery({
    queryFn: async () => {
      if (!input) return [];
      const { data } = await axios.get(`/api/search/users?q=${input}`);
      return data;
    },
    queryKey: ["search-user"],
    enabled: false,
  });

  const requestUser = debounce(async () => {
    refetched();
  }, 300);
  const debounceUserRequest = useCallback(() => {
    requestUser();
  }, []);

  const request = debounce(async () => {
    refetch();
  }, 300);
  const debounceRequest = useCallback(() => {
    request();
  }, []);

  const commandRef = useRef<HTMLDivElement>(null);

  const pathname = usePathname();
  useEffect(() => {
    setInput("");
  }, [pathname]);

  useOnClickOutside(commandRef, () => {
    setInput("");
  });

  return (
    <Command
      ref={commandRef}
      className="relative rounded-large max-w-lg z-50 overflow-visible"
    >
      <CommandInput
        value={input}
        onValueChange={(text) => {
          setInput(text);
          debounceRequest();
          debounceUserRequest();
        }}
        className="outline-none border-none focus:border-none focus:outline-none ring-0"
        placeholder="Search Users or Groups..."
      />
      {input.length > 0 && (
        <CommandList className="absolute bg-white top-full inset-x-0 shadow rounded-b-md">
          {userIsFetched && userResults.length === 0 && (
            <CommandEmpty>No Users found.</CommandEmpty>
          )}
          {isFetched && queryResults?.length === 0 && (
            <CommandEmpty>No Groups found.</CommandEmpty>
          )}

          {userResults.length > 0 ? (
            <CommandGroup heading="Users">
              {userResults.map((user: User) => (
                <CommandItem
                  onSelect={(e) => {
                    router.push(`/u/${e}`);
                    router.refresh();
                  }}
                  key={user.id}
                  value={user.username!}
                >
                  <Users className="mr-2 h-4 w-4" />
                  <a href={`/u/${user.username}`}>u/{user.username}</a>
                </CommandItem>
              ))}
            </CommandGroup>
          ) : null}

          {(queryResults?.length ?? 0) > 0 ? (
            <CommandGroup heading="Groups">
              {queryResults?.map((subgroup) => (
                <CommandItem
                  onSelect={(e) => {
                    router.push(`/g/${e}`);
                    router.refresh();
                  }}
                  key={subgroup.id}
                  value={subgroup.name}
                >
                  <Users className="mr-2 h-4 w-4" />
                  <a href={`/g/${subgroup.name}`}>g/{subgroup.name}</a>
                </CommandItem>
              ))}
            </CommandGroup>
          ) : null}
        </CommandList>
      )}
    </Command>
  );
};

export default SearchBar;
