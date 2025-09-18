"use client";

import { Client, Storage, Account } from "node-appwrite";
import { appwriteConfig } from "./config";

// Browser Session Creation
export const createBrowserClient = () => {
  const client = new Client()
    .setEndpoint(appwriteConfig.endpointUrl)
    .setProject(appwriteConfig.projectId);

  return {
    account: new Account(client),
    storage: new Storage(client),
  };
};