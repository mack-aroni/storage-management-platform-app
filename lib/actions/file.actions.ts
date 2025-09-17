"use server"

import { InputFile } from "node-appwrite/file";
import { createAdminClient } from "../appwrite"
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

// Upload New File Action
export const uploadFile = async ({ file, ownerID, accountID, path }: UploadFileProps) => {
  const { storage, tablesDB } = await createAdminClient();

  try {
    const inputFile = InputFile.fromBuffer(file, file.name);

    // actual file storage
    const bucketFile = await storage.createFile({
      bucketId: appwriteConfig.bucketId,
      fileId: ID.unique(),
      file: inputFile,
    });

    // metadata
    const fileMetaData = {
      name: bucketFile.name,
      url: constructFileUrl(bucketFile.$id),
      type: getFileType(bucketFile.name).type,
      bucketFileID: bucketFile.$id,
      accountID: accountID,
      owner: ownerID,
      extension: getFileType(bucketFile.name).extension,
      size: bucketFile.sizeOriginal,
      users: [],
    }

    // metadata storage
    const newFile = await tablesDB.createRow({
      databaseId: appwriteConfig.databaseId,
      tableId: appwriteConfig.filesCollectionId,
      rowId: ID.unique(),
      data: fileMetaData,
    }).catch(async (error: unknown) => {
      await storage.deleteFile({
        bucketId: appwriteConfig.bucketId,
        fileId: bucketFile.$id,
      });

      handleError(error, "Failed to create file document");
    });

    revalidatePath(path);

    return parseStringify(newFile);
  } catch(error) {
    handleError(error, "Failed to upload file");
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