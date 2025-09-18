"use client"

import React, {useCallback, useState} from "react";
import {useDropzone} from "react-dropzone";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Button } from "./ui/button";
import { toast } from "sonner";
import Thumbnail from "./Thumbnail";
import { MAX_FILE_SIZE } from "@/constants";
// import { uploadFile } from "@/lib/actions/file.actions";
import { ID, Client, Storage} from "node-appwrite";
import { saveFileMetadata } from "@/lib/actions/file.actions";
import { cn, constructFileUrl, convertFileToUrl, getFileType } from "@/lib/utils";
import { appwriteConfig } from "@/lib/appwrite/config";
import { createBrowserClient } from "@/lib/appwrite/browser";

interface Props {
  ownerID: string;
  accountID: string;
  className?: string;
}

const FileUploader = ({ ownerID, accountID, className }: Props) => {
  const path = usePathname();
  const [files, setFiles] = useState<File[]>([]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setFiles(acceptedFiles);

    const uploadPromises = acceptedFiles.map(async (file) => {
      try {
        const { storage } = createBrowserClient();

        // upload directly to Appwrite storage
        const bucketFile = await storage.createFile({
          bucketId: appwriteConfig.bucketId,
          fileId: ID.unique(),
          file: file,
        });

        // extract metadata and save via server action
        const { type, extension } = getFileType(bucketFile.name);
        const fileUrl = constructFileUrl(bucketFile.$id);

        await saveFileMetadata({
          bucketFileID: bucketFile.$id,
          name: bucketFile.name,
          size: bucketFile.sizeOriginal,
          type,
          extension,
          url: fileUrl,
          ownerID,
          accountID,
          path,
        });

        // remove from upload list
        setFiles((prev) => prev.filter((f) => f.name !== file.name));
      } catch (err) {
        toast.error(`Failed to upload ${file.name}`);
      }
    });

    await Promise.all(uploadPromises);
  }, [ownerID, accountID, path]);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    maxSize: MAX_FILE_SIZE,
    onDropRejected: (rejectedFiles) => {
      rejectedFiles.forEach(({ file }) => {
        console.log("triggered");
        toast.error(
          <p className="body-2 text-error">
            <span className="font-semibold">{file.name}</span> is too large.
            Max file size is 50MB.
          </p>
        );
      });
    },
  });

  // Cancel File Upload Handler
  const handleRemoveFile = (e: React.MouseEvent<HTMLImageElement, MouseEvent>, fileName: string) => {
    e.stopPropagation();

    setFiles((prevFiles) => 
      prevFiles.filter((file) => file.name !== fileName)
    );
  };
  
  return (
    <div {...getRootProps()} className="cursor-pointer">
      <input {...getInputProps()} />

      <Button type="button"
        className={cn("button primary-btn h-[52px] gap-2 px-10 shadow-drop-1", className)}>
        <Image src="/assets/icons/upload.svg"
          alt="upload"
          width={24}
          height={24}/>

        <p className="text-white">Upload</p>
      </Button>

      {files.length > 0 && (
        <ul className="fixed bottom-10 right-10 z-50 flex h-fit w-full max-w-[480px] flex-col gap-3 rounded-[20px] bg-white p-7 shadow-drop-3">
          <h4 className="h4 text-light-100">
            Uploading
          </h4>

          {files.map((file, index) => {
            const {type, extension} = getFileType(file.name);

            return (
              <li key={`${file.name}-${index}`}
                className="flex items-center justify-between gap-3 rounded-xl p-3 shadow-drop-3">
                <div className="flex items-center gap-3">
                  <Thumbnail 
                    type={type}
                    extension={extension}
                    url={convertFileToUrl(file)}/>

                  <div className="mb-2 line-clamp-1 max-w-[300px]">
                    {file.name}

                    <video
                      src="/assets/videos/file-loader.webm"
                      autoPlay
                      loop
                      muted
                      playsInline
                      width={80}
                      height={26}/>
                  </div>
                </div>

                <Image src="/assets/icons/remove.svg"
                  alt="remove"
                  width={24}
                  height={24}
                  onClick={(e) => handleRemoveFile(e, file.name)}/>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  );
};

export default FileUploader;