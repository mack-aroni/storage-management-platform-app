"use client"

import React, { useEffect, useRef, useState } from "react";
import { useDebounce } from "use-debounce";
import Image from "next/image";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Models } from "node-appwrite";
import { Input } from "./ui/input";
import Thumbnail from "./Thumbnail";
import DateTime from "./DateTime";
import { getFiles } from "@/lib/actions/file.actions";


const Search = () => {
  const [ query, setQuery ] = useState("");
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("query") || "";

  const [ results, setResults ] = useState<Models.DefaultRow[]>([]);
  const [ open, setOpen ] = useState(false);

  const router = useRouter();
  const path = usePathname();
  const [debouncedQuery] = useDebounce(query, 300); // 300ms debounce
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Outside Click Handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const queryParam = searchParams.toString();
  // Update Search List Handler
  useEffect(() => {
    const fetchFiles = async() => {
      if (debouncedQuery.length === 0) {
        setResults([]);
        setOpen(false);
        return router.push(path.replace(queryParam.toString(), ""));
      }
      const files = await getFiles({ types: [], searchText: debouncedQuery });
      setResults(files.rows);
      setOpen(true);
    }

    fetchFiles();
  }, [debouncedQuery, path, router, queryParam]);

  // Empty Handler
  useEffect(() => {
    if (!searchQuery) {
      setQuery("");
    }
  }, [searchQuery]);

  // Search Item Click Handler
  const handleClickItem = (file: Models.DefaultRow) => {
    setOpen(false);
    setResults([]);

    router.push(
      `/${file.type === "video" || file.type === "audio" ? "media" : file.type + "s"}?query=${query}`,
    );
  }

  return (
    <div ref={wrapperRef}
      className="relative w-full md:max-w-[480px]">
      <div className="flex h-[52px] flex-1 items-center gap-3 rounded-full px-4 shadow-drop-3">
        <Image src="/assets/icons/search.svg"
          alt="search"
          width={24}
          height={24}/>

        <Input value={query} 
          placeholder="Search ..."
          className="body-2 shad-no-focus w-full border-none p-0 shadow-none placeholder:text-light-200 placeholder:text-[16px] leading-[24px] font-normal"
          onChange={(e) => setQuery(e.target.value)}/>

        {open && (
          <ul className="absolute left-0 top-16 z-50 flex w-full flex-col gap-3 rounded-[20px] bg-white p-4">
            {results.length > 0 ? (results.map((file) => 
              <li key={file.$id}
                className="flex items-center justify-between"
                onClick={() => handleClickItem(file)}>
                <div className="flex cursor-pointer items-center gap-4">
                  <Thumbnail type={file.type}
                    extension={file.extension}
                    url={file.url}
                    className="size-9 min-w-9" />
                  <p className="subtitle-2 line-clamp-1 text-light-100">
                    {file.name}
                  </p>
                </div>

                <DateTime date={file.$createdAt} 
                  className="caption line-clamp-1 text-light-200"/>
              </li>)
              ) : (
                <p className="body-2 text-center text-light-100">
                  No files found
                </p>
              )
            }
          </ul>
        )}
      </div>
    </div>
  );
};

export default Search;