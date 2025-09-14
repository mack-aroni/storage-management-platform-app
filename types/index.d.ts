declare type FileType = "document" | "image" | "video" | "audio" | "other";

declare interface UploadFileProps {
  file: File;
  ownerID: string;
  accountID: string;
  path: string;
};