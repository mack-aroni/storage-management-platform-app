import React from "react";
import Image from "next/image";
import { cn, getFileIcon } from "@/lib/utils";

interface Props {
  type: string;
  extension: string;
  url?: string;
  imageClassName?: string;
  className?: string;
}

export const Thumbnail = ({ type, extension, url="", imageClassName, className }: Props) => {
  const isImage = type === "image" && extension !== "svg";

  return (
    <figure className={cn("flex-center size-[50px] min-w-[50px] overflow-hidden rounded-full bg-brand/10", className)}>
      <Image src={isImage ? url : getFileIcon(extension, type)}
        alt="thumbnail"
        width={100}
        height={100}
        className={cn("size-8 object-contain", imageClassName, isImage && "size-full object-cover object-center")}/>
    </figure>
  );
};

export default Thumbnail;