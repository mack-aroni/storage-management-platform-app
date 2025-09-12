"use server"

import { Account, TablesDB, Client, Storage, Avatars } from "node-appwrite";
import { appwriteConfig } from "./config";
import {cookies} from "next/headers";

// User Session Creation
export const createSessionClient = async () => {
  const client = new Client()
  .setEndpoint(appwriteConfig.endpointUrl)
  .setProject(appwriteConfig.projectId);

  const session = (await cookies()).get("appwrite-session");
  
  if (!session || !session.value) throw new Error("No session");

  client.setSession(session.value);

  return {
    get account() {
      return new Account(client);
    },
    get tablesDB()  {
      return new TablesDB(client);
    },
  };
};

// Admin Session Creation
export const createAdminClient = async () => {
  const client = new Client()
  .setEndpoint(appwriteConfig.endpointUrl)
  .setProject(appwriteConfig.projectId)
  .setKey(appwriteConfig.secretKey);

  return {
    get account() {
      return new Account(client);
    },
    get tablesDB()  {
      return new TablesDB(client);
    },
    get storage() {
      return new Storage(client);
    },
    get avatars() {
      return new Avatars(client);
    },
  };
};