import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Parse JSON
export const parseStringify = (value: unknown) => {
  return JSON.parse(JSON.stringify(value));
}

// Convert File to usable URL
export const convertFileToUrl = (file: File) => URL.createObjectURL(file);

// Extract FileType + Extension From a File
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

// Given File Type + Extension Return A File Icon
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

// Format File Size
export const convertFileSize = (sizeInBytes: number, digits: number = 1) => {
  if (sizeInBytes === 0) return "0 Bytes";

  const units = ["Bytes", "KB", "MB", "GB", "TB"];
  let index = 0;
  let size = sizeInBytes;

  while (size >= 1024 && index < units.length - 1) {
    size /= 1024;
    index++;
  }

  return `${size.toFixed(digits)} ${units[index]}`;
};

// Format Date/Time
export const formatDateTime = (isoString: string | null | undefined): string => {
  if (!isoString) return "—";

  const date = new Date(isoString);

  const time = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);

  const dayMonth = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(date);

  return `${time}, ${dayMonth}`;
};

/* --- APPWRITE UTILS --- */
// Construct appwrite file URL - https://appwrite.io/docs/apis/rest#images
export const constructFileUrl = (bucketFileId: string) => {
  return `${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/${process.env.NEXT_PUBLIC_APPWRITE_BUCKET}/files/${bucketFileId}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT}`;
};

// Construct appwrite file download URL
export const constructDownloadUrl = (bucketFileId: string) => {
  return `${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/${process.env.NEXT_PUBLIC_APPWRITE_BUCKET}/files/${bucketFileId}/download?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT}`;
};