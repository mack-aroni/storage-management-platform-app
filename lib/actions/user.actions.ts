"use server"

import { createAdminClient, createSessionClient } from "../appwrite";
import { appwriteConfig } from "../appwrite/config";
import { Query, ID } from "node-appwrite";
import { parseStringify } from "../utils";
import { cookies } from "next/headers";

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

// Verify OTP Secret
export const verifySecret = async ({accountID, password}: {accountID: string, password: string}) => {
  try {
    const {account} = await createAdminClient();
    
    const session = await account.createSession({
      userId: accountID, 
      secret: password
    });

    (await cookies()).set("appwrite-session", session.secret, {
      path: "/",
      httpOnly: true,
      sameSite: "strict",
      secure: true
    });

    return parseStringify({ sessionID: session.$id });
  } catch (error) {
    handleError(error, "Failed to verify OTP");
  };
};

// Retrieve Current User
export const getCurrentUser = async () => {
  try {
    const {tablesDB, account} = await createSessionClient();
    
    const result = await account.get();

    const user = await tablesDB.listRows({
      databaseId: appwriteConfig.databaseId,
      tableId: appwriteConfig.usersCollectionId,
      queries: [Query.equal("accountID", result.$id)],
    });

  return user.total <= 0 ? null : parseStringify(user.rows[0]);
  } catch(error) {
    console.log(error);
  }
};
