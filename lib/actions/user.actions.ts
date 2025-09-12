"use server"

import { createAdminClient, createSessionClient } from "../appwrite";
import { appwriteConfig } from "../appwrite/config";
import { Query, ID } from "node-appwrite";
import { parseStringify } from "../utils";

// Helper to handle errors
const handleError = ( error: unknown, message: string ) => {
  console.log(error, message);
  throw error;
};

// Helper to retrieve user by email
const getUserByEmail = async ( email: string ) => {
  const { tablesDB } = await createAdminClient();

  const result = await tablesDB.listRows( {
    databaseId: appwriteConfig.databaseId,
    tableId: appwriteConfig.usersCollectionId,
    queries: [Query.equal("email", email)],
  });

  return result.total > 0 ? result.rows[0] : null;
};

// Helper to send email OTP
export const sendEmailOTP = async ({ email }: { email: string }) => {
  const { account } = await createAdminClient();

  try {
    const session = await account.createEmailToken({
      userId: ID.unique(),
      email: email,
    });

    return session.userId;
  } catch(error) {
    handleError(error, "Failed to send email OTP");
  };
};

// Create New User Account Action
export const createAccount = async({ fullName, email }: { fullName: string; email: string }) => {
  const existingUser = await getUserByEmail(email);

  const accountID = await sendEmailOTP({ email });
  if (!accountID) throw new Error("Failed to send an OTP");

  if (!existingUser) {
    const { tablesDB } = await createAdminClient();

    const [fname, lname] = fullName.trim().split(" ", 2);
    const safeLastName = lname ?? "";
    const avatarUrl = "https://avatar.iran.liara.run/username?username="+fname+"+"+safeLastName;
    console.log(avatarUrl);

    await tablesDB.createRow({
      databaseId: appwriteConfig.databaseId,
      tableId: appwriteConfig.usersCollectionId,
      rowId: ID.unique(),
      data: {
        fullName,
        email,
        avatar: avatarUrl,
        accountID,
      },
      });
  };

  return parseStringify({ accountID });
};