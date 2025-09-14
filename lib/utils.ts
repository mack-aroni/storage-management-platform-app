import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const parseStringify = (value: unknown) => {
  return JSON.parse(JSON.stringify(value));
}

export const convertFileToUrl = (file: File) => URL.createObjectURL(file);

export const getFileType = (fileName: string) => {
  const extension = fileName.split(".").pop()?.toLowerCase();
  if (!extension) return { type: "other", extension: "" };

  // Map extension → type
  const extensionMap: Record<string, "document" | "image" | "video" | "audio"> = {
    // Documents
    pdf: "document",
    doc: "document",
    docx: "document",
    txt: "document",
    xls: "document",
    xlsx: "document",
    csv: "document",
    ppt: "document",
    pptx: "document",
    rtf: "document",

    // Images
    jpg: "image",
    jpeg: "image",
    png: "image",
    gif: "image",
    bmp: "image",
    svg: "image",
    webp: "image",

    // Videos
    mp4: "video",
    avi: "video",
    mov: "video",
    mkv: "video",
    webm: "video",

    // Audio
    mp3: "audio",
    wav: "audio",
    ogg: "audio",
    flac: "audio",
  };

  const type = extensionMap[extension] || "other";
  return { type, extension };
};

export const getFileIcon = (extension: string | undefined, type: FileType | string) => {
  const extensionMap: Record<string, string> = {
    // Documents
    pdf: "/assets/icons/file-pdf.svg",
    doc: "/assets/icons/file-doc.svg",
    docx: "/assets/icons/file-docx.svg",
    csv: "/assets/icons/file-csv.svg",
    txt: "/assets/icons/file-txt.svg",
    xls: "/assets/icons/file-document.svg",
    xlsx: "/assets/icons/file-document.svg",

    // Images
    svg: "/assets/icons/file-image.svg",

    // Videos
    mkv: "/assets/icons/file-video.svg",
    mov: "/assets/icons/file-video.svg",
    avi: "/assets/icons/file-video.svg",
    mp4: "/assets/icons/file-video.svg",
    webm: "/assets/icons/file-video.svg",

    // Audio
    mp3: "/assets/icons/file-audio.svg",
    wav: "/assets/icons/file-audio.svg",
    flac: "/assets/icons/file-audio.svg",
    ogg: "/assets/icons/file-audio.svg",
  };

  const typeMap: Record<string, string> = {
    image: "/assets/icons/file-image.svg",
    document: "/assets/icons/file-document.svg",
    video: "/assets/icons/file-video.svg",
    audio: "/assets/icons/file-audio.svg",
  };

  return extension && extensionMap[extension.toLowerCase()]
    ? extensionMap[extension.toLowerCase()]
    : typeMap[type] || "/assets/icons/file-other.svg";
};


/* --- APPWRITE UTILS --- */
// Construct appwrite file URL - https://appwrite.io/docs/apis/rest#images
export const constructFileUrl = (bucketFileId: string) => {
  return `${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/${process.env.NEXT_PUBLIC_APPWRITE_BUCKET}/files/${bucketFileId}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT}`;
};