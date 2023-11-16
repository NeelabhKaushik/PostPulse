"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./ui/command";
import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import { Prisma, Subgroup } from "@prisma/client";
import { usePathname, useRouter } from "next/navigation";
import debounce from "lodash.debounce";
import { Users } from "lucide-react";
import { useOnClickOutside } from "@/hooks/use-on-click-outside";

const SearchBar = () => {
  const router = useRouter();
  const [input, setInput] = useState<string>("");

  const {
    data: queryResults,
    refetch,
    isFetched,
    isFetching,
  } = useQuery({
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
  const request = debounce(async () => {
    refetch();
  }, 500);
  const debounceRequest = useCallback(() => {
    request();
  }, []);

  const commandRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname()
  useEffect(()=> {
    setInput("")
  }, [pathname])

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
        }}
        className="outline-none border-none focus:border-none focus:outline-none ring-0"
        placeholder="Search Groups..."
      />
      {input.length > 0 && (
        <CommandList className="absolute bg-white top-full inset-x-0 shadow rounded-b-md">
          {isFetched && <CommandEmpty>No results found.</CommandEmpty>}
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
