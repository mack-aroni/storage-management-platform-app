declare type FileType = "document" | "image" | "video" | "audio" | "other";

declare type CategorySpace = {
  size: number;
  latestDate: string;
};

declare type TotalSpace = {
  image: CategorySpace;
  document: CategorySpace;
  video: CategorySpace;
  audio: CategorySpace;
  other: CategorySpace;
  used: number;
  all: number;
};

declare interface ActionType {
  label: string;
  icon: string;
  value: string;
}

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
}

declare interface UpdateFileUsersProps {
  fileID: string;
  emails: string[];
  path: string;
}

declare interface DeleteFileProps {
  fileID: string;
  bucketFileID: string;
  path: string;
}

declare interface GetFilesProps {
  types: FileType[];
  searchText?: string;
  sort?: string;
  limit?: number;
}