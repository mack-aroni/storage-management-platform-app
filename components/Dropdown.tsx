"use client"

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Models } from "node-appwrite";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { FileDetails, ShareInput } from "./DropdownModalContent";
import { dropdownItems } from "@/constants";
import { constructDownloadUrl } from "@/lib/utils";
import { deleteFile, renameFile, updateFileUsers } from "@/lib/actions/file.actions";

const Dropdown = ({ file }: { file: Models.DefaultRow }) => {
  const [ isModalOpen, setIsModalOpen ] = useState(false);
  const [ isDropdownOpen, setIsDropdownOpen ] = useState(false);
  const [ action, setAction ] = useState<ActionType | null>(null);
  const [ name, setName ] = useState(file.name);
  const [ isLoading, setIsLoading ] = useState(false);
  const [ emails,  setEmails] = useState<string[]>([]);

  const path = usePathname();

  const closeAllModals = () => {
    setIsModalOpen(false);
    setIsDropdownOpen(false);
    setAction(null);
    setName(file.name);
  };

  // Dropdown Action Handler
  const handleAction = async () => {
    if (!action) return;
    setIsLoading(true);

    let success = false;
    const actions = {
      rename: () => renameFile({fileID: file.$id, name, extension: file.extension, path}),
      share: () => updateFileUsers({fileID: file.$id, emails, path}),
      delete: () => deleteFile({fileID: file.$id, bucketFileID: file.bucketFileID, path}),
    };

    success = await actions[action.value as keyof typeof actions]();

    if (success) closeAllModals();
    setIsLoading(false);
  };

  // Remove User Handler
  const handleRemoveUser = async(email: string) => {
    const updatedEmails = emails.filter((e) => e !== email);

    const success = await updateFileUsers({
      fileID: file.$id,
      emails: updatedEmails,
      path
    });

    if (success) setEmails(updatedEmails);
    closeAllModals();
  };

  // Dialog Content Handler
  const renderDialogContent = () => {
    if (!action) return null;

    const { value, label } = action;
    return (
      <DialogContent className="w-[90%] max-w-[400px] rounded-[26px] px-6 py-8 button">
        <DialogHeader className="flex flex-col gap-3">
          <DialogTitle className="text-center text-light-100">
            {label}
          </DialogTitle>

          {value === "rename" && (
            <Input type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}/>
          )}
            
          {value === "details" && <FileDetails file={file}/>}

          {value === "share" && (
            <ShareInput file={file} onInputChange={setEmails} onRemove={handleRemoveUser}/>
          )}

          {value === "delete" && (
            <p className="text-center text-light-100">
              Are you sure you want to delete{` `}
              <span className="font-medium text-brand-100">
                {file.name}
              </span>
              ?
            </p>
          )}
        </DialogHeader>

      {["rename", "delete", "share"].includes(value) && (
        <DialogFooter className="flex flex-col gap-3 md:flex-row">
          <Button onClick={closeAllModals}
            className="h-[52px] flex-1 rounded-full bg-light-300 text-light-100 hover:bg-transparent">
            Cancel
          </Button>

          <Button onClick={handleAction}
            className="button primary-btn mx-0 h-[52px] w-full flex-1">
            <p className="capitalize">
              {value}
            </p>

            {isLoading && (
              <Image src="/assets/icons/loader.svg"
                alt="loader"
                width={24}
                height={24}
                className="animate-spin"/>
            )}
          </Button>
        </DialogFooter>
      )}
    </DialogContent>
    );
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
        <DropdownMenuTrigger className="shad-no-focus">
          <Image src="assets/icons/dots.svg"
            alt="dots"
            width={34}
            height={34}/>
        </DropdownMenuTrigger>

        <DropdownMenuContent>
          <DropdownMenuLabel className="max-w-[200px] truncate">
            {file.name}
          </DropdownMenuLabel>
          <DropdownMenuSeparator/>

          {dropdownItems.map((actionItem) => (
            <DropdownMenuItem key={actionItem.value}
              className="cursor-pointer"
              onClick={() => {
                setAction(actionItem);
                if (["rename", "share", "delete", "details"].includes(actionItem.value)) setIsModalOpen(true);
            }}>

            {actionItem.value === "download" ? (
              <Link href={constructDownloadUrl(file.bucketFileID)}
                download={file.name}
                className="flex items-center gap-2">
                <Image src={actionItem.icon}
                  alt={actionItem.label}
                  width={30}
                  height={30}/>

                  {actionItem.label}
              </ Link>)
            : (
              <div className="flex items-center gap-2">
                <Image src={actionItem.icon}
                  alt={actionItem.label}
                  width={30}
                  height={30}/>

                  {actionItem.label}
              </div>
            )}
          </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {renderDialogContent()}
    </Dialog>
  );
};

export default Dropdown;