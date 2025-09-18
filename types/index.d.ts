declare type FileType = "document" | "image" | "video" | "audio" | "other";

declare interface ActionType {
  label: string;
  icon: string;
  value: string;
};

declare interface SaveMetadataProps {
  bucketFileID: string;
  name: string;
  size: number;
  type: string;
  extension: string;
  url: string;
  ownerID: string;
  accountID: string;
  path: string;
};

declare interface UploadFileProps {
  file: File;
  ownerID: string;
  accountID: string;
  path: string;
};

declare interface RenameFileProps {
  fileID: string;
  name: string;
  extension: string;
  path: string;
};

declare interface UpdateFileUsersProps {
  fileID: string;
  emails: string[];
  path: string;
};

declare interface DeleteFileProps {
  fileID: string;
  bucketFileID: string;
  path: string;
};

declare interface GetFilesProps {
  types: FileType[];
  searchText?: string;
  sort?: string;
  limit?: number;
};