"use client"

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { sortTypes } from "@/constants";

const Sort = () => {
  const path = usePathname();
  const router = useRouter();

  const handleSort = (value: string) => {
    router.push(`${path}?sort=${value}`);
  };

  return (
    <Select onValueChange={handleSort} defaultValue={sortTypes[0].value}>
      <SelectTrigger className="h-11 w-full rounded-[8px] border-transparent bg-white shadow-sm sm:w-[210px]">
        <SelectValue placeholder={sortTypes[0].label}/>
      </SelectTrigger>

      <SelectContent className="shad-no-focus shadow-drop-3">
        {sortTypes.map((sort) => (
          <SelectItem key={sort.label}
            className="cursor-pointer"
            value={sort.value}>
            {sort.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default Sort;