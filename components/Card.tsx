import React from "react";
import Link from "next/link";
import { Models } from "node-appwrite";
import Thumbnail from "./Thumbnail";
import DateTime from "./DateTime";
import { convertFileSize } from "@/lib/utils";
import Image from "next/image";

const Card = ({ file }: { file: Models.DefaultRow }) => {
  return (
    <Link href={file.url}
      target="_blank"
      className="flex cursor-pointer flex-col gap-6 rounded-[18px] bg-white p-5 shadow-sm transition-all hover:shadow-drop-3">
        
      <div className="flex justify-between">
        <Thumbnail type={file.type}
          extension={file.extension}
          url={file.url}
          className="!size-20"
          imageClassName="!size-11"/>

        <div className="flex flex-col items-end justify-between">
          <Image src="assets/icons/dots.svg"
            alt="dots"
            width={34}
            height={34}/>

          <p className="body-1">
            {convertFileSize(file.size)}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-2 text-light-100">
        <p className="subtitle-2 line-clamp-1">
          {file.name}
        </p>

        <DateTime date={file.$createdAt}
          className="body-2 text-light-100" />
          
        <p className="caption line-clamp-1 text-light-200">
          By: {file.owner.fullName}
        </p>
      </div>
    </Link>
  );
};

export default Card;