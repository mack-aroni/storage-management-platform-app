"use server"

import { InputFile } from "node-appwrite/file";
import { createAdminClient, createSessionClient } from "../appwrite"
import { appwriteConfig } from "../appwrite/config";
import { ID, Query } from "node-appwrite";
import { constructFileUrl, getFileType, parseStringify } from "../utils";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "./user.actions";

// Helper to handle errors
const handleError = (error: unknown, message: string) => {
  console.log(error, message);
  throw error;
};

// Save Metadata Action
export const saveFileMetadata = async ({ bucketFileID, name, size, type, extension, url, ownerID, accountID, path }: SaveMetadataProps) => {
  const { tablesDB } = await createAdminClient();

  try {
    const newFile = await tablesDB.createRow({
      databaseId: appwriteConfig.databaseId,
      tableId: appwriteConfig.filesCollectionId,
      rowId: ID.unique(),
      data: {
        name,
        url,
        type,
        bucketFileID,
        accountID,
        owner: ownerID,
        extension,
        size,
        users: [],
      },
    });

    revalidatePath(String(path));

    return parseStringify(newFile);
  } catch (error) {
    handleError(error, "Failed to save metadata");
  };
};

// Helper to formulate DB queries
const createQueries = (currentUser: any, types: string[], searchText: string, sort: string, limit?: number) => {
  const queries = [
    Query.or([
      Query.equal("owner",[currentUser.$id]),
      Query.contains("users",[currentUser.email]),
      
    ]),
    // expand owner relation
    Query.select(["*","owner.*"]),
  ];

  // filtering + sorting
  if (types.length > 0) queries.push(Query.equal("type", types));
  if (searchText) queries.push(Query.contains("name", searchText));
  if (limit) queries.push(Query.limit(limit));

  {if (sort) {
    const [sortBy, orderBy] = sort.split('-');
    queries.push(orderBy === 'asc' ? Query.orderAsc(sortBy) : Query.orderDesc(sortBy))}
  }

  return queries;
};

// Retrieve Files Action
export const getFiles = async ({ types=[], searchText='', sort='$createdAt-desc', limit }: GetFilesProps) => {
  const {tablesDB} = await createAdminClient();
  
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) throw new Error("User not found");

    const queries = createQueries(currentUser, types, searchText, sort, limit);
    
    const files = await tablesDB.listRows({
      databaseId: appwriteConfig.databaseId,
      tableId: appwriteConfig.filesCollectionId,
      queries: queries,
    });

    return parseStringify(files);
  } catch(error) {
    handleError(error, "Failed to get files");
  };
};

// Update File Name Action
export const renameFile = async ({ fileID, name, extension, path }: RenameFileProps) => {
  const {tablesDB} = await createAdminClient();

  try {
    const newName = `${name}.${extension}`;
    
    const updatedFile = await tablesDB.updateRow({
      databaseId: appwriteConfig.databaseId,
      tableId: appwriteConfig.filesCollectionId,
      rowId: fileID,
      data: {name: newName},
    });

    revalidatePath(path);
    return parseStringify(updatedFile);
  } catch(error) {
    handleError(error, "Failed to rename file");
  };
};

// Share File Action
export const updateFileUsers = async ({ fileID, emails, path }: UpdateFileUsersProps) => {
  const {tablesDB} = await createAdminClient();

  try {
    const updatedFile = await tablesDB.updateRow({
      databaseId: appwriteConfig.databaseId,
      tableId: appwriteConfig.filesCollectionId,
      rowId: fileID,
      data: {users: emails},
    });

    revalidatePath(path);
    return parseStringify(updatedFile);
  } catch(error) {
    handleError(error, "Failed to update file users");
  };
};

// Delete File Action
export const deleteFile = async ({ fileID, bucketFileID, path }: DeleteFileProps) => {
  const { tablesDB, storage } = await createAdminClient();

  try {
    const deletedFile = await tablesDB.deleteRow({
      databaseId: appwriteConfig.databaseId,
      tableId: appwriteConfig.filesCollectionId,
      rowId: fileID,
    });

    if (deletedFile) {
      await storage.deleteFile({
        bucketId: appwriteConfig.bucketId,
        fileId: bucketFileID,
      });
    };

    revalidatePath(path);
    return parseStringify({ status: "success" });
  } catch(error) {
    handleError(error, "Failed to delete file");
  };
};

// Calculate Total Space Used
export async function getTotalSpaceUsed(fileTypes?: FileType[]) {
  try {
    const { tablesDB } = await createSessionClient();

    const currentUser = await getCurrentUser();
    if (!currentUser) throw new Error("User is not authenticated.");

    const queries = [Query.equal("owner", [currentUser.$id])];

    const files = await tablesDB.listRows({
      databaseId: appwriteConfig.databaseId,
      tableId: appwriteConfig.filesCollectionId,
      queries,
    });

    const totalSpace = {
      image: { size: 0, latestDate: "" },
      document: { size: 0, latestDate: "" },
      video: { size: 0, latestDate: "" },
      audio: { size: 0, latestDate: "" },
      other: { size: 0, latestDate: "" },
      used: 0,
      all: 2 * 1024 * 1024 * 1024, // 2GB
    };

    const fileTypeFilter: FileType[] = fileTypes ?? ["document", "image", "video", "audio", "other"];

    // aggregate filtered types
    files.rows.forEach((file) => {
      const fileType = file.type as FileType;
      if (fileTypeFilter.includes(fileType)) {
        totalSpace[fileType].size += file.size;

        if (
          !totalSpace[fileType].latestDate ||
          new Date(file.$updatedAt) > new Date(totalSpace[fileType].latestDate))
        {
          totalSpace[fileType].latestDate = file.$updatedAt;
        };
      };
    });

    // calculate total filtered types
    totalSpace.used = fileTypeFilter.reduce((sum, type) => sum + totalSpace[type].size, 0);

    const filteredResult = fileTypeFilter.reduce(
      (acc, type) => ({ ...acc, [type]: totalSpace[type] }),
      {} as Record<FileType, { size: number; latestDate: string }>
    );

    return parseStringify({ ...filteredResult, used: totalSpace.used, all: totalSpace.all });
  } catch (error) {
    handleError(error, "Error calculating total space used:, ");
  }
}